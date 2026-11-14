import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";
import { normalizeCriteria } from "@/lib/hrCriteria";
import { startRun, isStale } from "@/lib/hrRun";

// ── GET /api/hr/[id]/results ──────────────────────────────────────────────
// Polled by the dashboard. Also resumes a run that died (redeploy, crash).
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  const { data: job } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email, title, description, criteria, language, cv_count, analyzed_count, status, heartbeat_at, share_token, share_company, shared_at")
    .eq("id", id)
    .maybeSingle();

  if (!job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  let resumed = false;
  if (isStale(job)) {
    resumed = await startRun(job, session.user.email, { resume: true }).catch(() => false);
  }

  const { data: analyses } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id, filename, score, status, strengths, weaknesses, summary, error_msg, criteria_results, read_mode, decision, decision_note, decided_at, created_at")
    .eq("job_id", id)
    .order("score", { ascending: false, nullsFirst: false });

  return NextResponse.json({
    job: {
      id:             job.id,
      title:          job.title,
      description:    job.description,
      criteria:       normalizeCriteria(job.criteria),
      language:       job.language,
      cv_count:       job.cv_count,
      analyzed_count: job.analyzed_count,
      status:         job.status,
      resumed,
      share: job.share_token ? { token: job.share_token, company: job.share_company, shared_at: job.shared_at } : null,
    },
    analyses: analyses ?? [],
  });
}
