import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";
import { analyzeCV, extractPdfText } from "@/lib/gemini";
import { getHrQuotaStatus, incrementHrCvScreened } from "@/lib/hrSubscription";

const CONCURRENCY = 5; // max parallel Gemini calls (free tier: 15 RPM)

// ── Background batch processor ────────────────────────────────────────────
async function runBatch(jobId, jobTitle, jobDescription, userEmail) {
  // Fetch all pending CVs
  const { data: cvs } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id, filename, pdf_data")
    .eq("job_id", jobId)
    .eq("status", "pending");

  if (!cvs?.length) {
    await supabaseAdmin.from("hr_jobs").update({ status: "done" }).eq("id", jobId);
    return;
  }

  // Process in batches of CONCURRENCY
  for (let i = 0; i < cvs.length; i += CONCURRENCY) {
    const batch = cvs.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async (cv) => {
        let succeeded = false;
        try {
          // Extract text from base64 PDF
          const pdfBuffer = Buffer.from(cv.pdf_data, "base64");
          const cvText    = await extractPdfText(pdfBuffer);

          if (!cvText.trim()) {
            await supabaseAdmin.from("hr_cv_analyses").update({
              status: "error", error_msg: "Impossible d'extraire le texte du PDF.",
            }).eq("id", cv.id);
            return;
          }

          // Gemini analysis
          const result = await analyzeCV({ jobTitle, jobDescription, cvText });

          await supabaseAdmin.from("hr_cv_analyses").update({
            score:      result.score,
            status:     result.status,
            strengths:  result.strengths,
            weaknesses: result.weaknesses,
            summary:    result.summary,
            pdf_data:   null, // free up space once analyzed
          }).eq("id", cv.id);
          succeeded = true;

        } catch (err) {
          console.error(`CV analysis error [${cv.filename}]:`, err.message);
          await supabaseAdmin.from("hr_cv_analyses").update({
            status: "error", error_msg: err.message?.slice(0, 255) ?? "Erreur inconnue",
          }).eq("id", cv.id);
        }

        // Progress counter always moves; the paid quota is only charged on success
        await supabaseAdmin.rpc("hr_increment_analyzed", { p_job_id: jobId });
        if (succeeded) await incrementHrCvScreened(userEmail, 1);
      })
    );

    // Small pause between batches to respect Gemini rate limits
    if (i + CONCURRENCY < cvs.length) {
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  // Mark job as done
  await supabaseAdmin.from("hr_jobs").update({ status: "done" }).eq("id", jobId);
}

// ── POST /api/hr/[id]/analyze ─────────────────────────────────────────────
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  const { data: job, error: jobErr } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email, title, description, cv_count, status")
    .eq("id", id)
    .maybeSingle();

  if (jobErr || !job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (job.cv_count === 0) return NextResponse.json({ error: "NO_CVS" }, { status: 400 });

  if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "GEMINI_KEY_MISSING", message: "Clé API Gemini non configurée." }, { status: 503 });
  }

  // Quota check — count CVs about to be (re)processed against the monthly HR quota
  const { count: pendingCount } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id", { count: "exact", head: true })
    .eq("job_id", id)
    .in("status", ["pending", "error"]);

  const quota = await getHrQuotaStatus(session.user.email);
  if (!quota.active) {
    return NextResponse.json({ error: "HR_SUBSCRIPTION_REQUIRED", message: "DocSwift HR nécessite un abonnement actif." }, { status: 403 });
  }
  if (quota.remaining !== null && (pendingCount ?? 0) > quota.remaining) {
    return NextResponse.json({
      error:   "QUOTA_EXCEEDED",
      message: `Quota mensuel dépassé (${quota.used}/${quota.quota} CVs déjà screenés).`,
    }, { status: 403 });
  }

  // Atomically claim the job: only one request can flip it to "analyzing"
  // (a job stuck > 15 min, e.g. killed by a redeploy, can be re-claimed).
  const staleBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: claimed, error: claimErr } = await supabaseAdmin
    .from("hr_jobs")
    .update({ status: "analyzing", analyzed_count: 0, started_at: new Date().toISOString() })
    .eq("id", id)
    .or(`status.neq.analyzing,started_at.lt.${staleBefore},started_at.is.null`)
    .select("id");

  if (claimErr) {
    console.error("[hr/analyze] claim error:", claimErr);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
  if (!claimed?.length) return NextResponse.json({ error: "ALREADY_ANALYZING" }, { status: 409 });

  // Reset errored CVs so they can be retried
  await supabaseAdmin.from("hr_cv_analyses").update({ status: "pending" }).eq("job_id", id).in("status", ["error"]);

  // Fire-and-forget with error recovery
  runBatch(id, job.title, job.description, session.user.email).catch(async (err) => {
    console.error("runBatch fatal error:", err);
    await supabaseAdmin.from("hr_jobs").update({
      status: "error",
      error_msg: err.message?.slice(0, 255) ?? "Erreur inconnue",
    }).eq("id", id);
  });

  return NextResponse.json({ started: true });
}
