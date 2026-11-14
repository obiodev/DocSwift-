import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";
import { getHrQuotaStatus } from "@/lib/hrSubscription";
import { normalizeCriteria } from "@/lib/hrCriteria";
import { audit }            from "@/lib/hrStorage";
import { startRun, isStale } from "@/lib/hrRun";

// ── POST /api/hr/[id]/analyze — start (or resume) the screening ──────────
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  const { data: job, error: jobErr } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email, title, description, criteria, language, cv_count, status, heartbeat_at")
    .eq("id", id)
    .maybeSingle();

  if (jobErr || !job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (job.cv_count === 0) return NextResponse.json({ error: "NO_CVS" }, { status: 400 });

  if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "GEMINI_KEY_MISSING", message: "Clé API IA non configurée." }, { status: 503 });
  }

  // Errored CVs are retried only if their file is still available
  const { data: retryable } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id, storage_path, pdf_data")
    .eq("job_id", id)
    .eq("status", "error");
  const retryIds = (retryable ?? []).filter((r) => r.storage_path || r.pdf_data).map((r) => r.id);

  const { count: pendingCount } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id", { count: "exact", head: true })
    .eq("job_id", id)
    .eq("status", "pending");
  const toProcess = (pendingCount ?? 0) + retryIds.length;
  if (!toProcess) return NextResponse.json({ error: "NOTHING_TO_ANALYZE" }, { status: 400 });

  const quota = await getHrQuotaStatus(session.user.email);
  if (!quota.active) {
    return NextResponse.json({ error: "HR_SUBSCRIPTION_REQUIRED", message: "DocSwift HR nécessite un abonnement actif." }, { status: 403 });
  }
  if (quota.remaining !== null && toProcess > quota.remaining) {
    return NextResponse.json({
      error:   "QUOTA_EXCEEDED",
      message: `Quota mensuel dépassé (${quota.used}/${quota.quota} CVs déjà screenés).`,
    }, { status: 403 });
  }

  // A live run owns the job: don't touch its rows
  if (job.status === "analyzing" && !isStale(job)) {
    return NextResponse.json({ error: "ALREADY_ANALYZING" }, { status: 409 });
  }

  // Prepare rows BEFORE the run starts (it reads "pending" CVs immediately)
  if (retryIds.length) {
    await supabaseAdmin.from("hr_cv_analyses").update({ status: "pending", error_msg: null }).in("id", retryIds);
  }
  const { count: finished } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id", { count: "exact", head: true })
    .eq("job_id", id)
    .neq("status", "pending");
  await supabaseAdmin.from("hr_jobs").update({ analyzed_count: finished ?? 0 }).eq("id", id);

  let started;
  try {
    started = await startRun(job, session.user.email);
  } catch (err) {
    console.error("[hr/analyze] claim error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
  if (!started) return NextResponse.json({ error: "ALREADY_ANALYZING" }, { status: 409 });

  await audit({ jobId: id, actor: session.user.email, action: "analysis_started", detail: { cvs: toProcess, criteria: normalizeCriteria(job.criteria).length } });
  return NextResponse.json({ started: true, toProcess });
}
