import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

// ── GET /api/hr/[id]/results ──────────────────────────────────────────────
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const { data: job } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email, title, cv_count, analyzed_count, status")
    .eq("id", id)
    .maybeSingle();

  if (!job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  // Fetch all analyses (exclude raw pdf_data)
  const { data: analyses } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id, filename, score, status, strengths, weaknesses, summary, error_msg, created_at")
    .eq("job_id", id)
    .order("score", { ascending: false, nullsFirst: false });

  return NextResponse.json({
    job: {
      id:            job.id,
      title:         job.title,
      cv_count:      job.cv_count,
      analyzed_count: job.analyzed_count,
      status:        job.status,
    },
    analyses: analyses ?? [],
  });
}
