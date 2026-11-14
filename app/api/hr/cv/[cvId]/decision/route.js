import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";
import { audit }            from "@/lib/hrStorage";

const DECISIONS = ["shortlisted", "rejected", "to_review"];

// ── POST /api/hr/cv/[cvId]/decision — the recruiter's decision (human oversight) ──
// body: { decision: "shortlisted"|"rejected"|"to_review"|null, note?: string }
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { cvId } = await params;
  const body = await request.json().catch(() => ({}));
  const decision = body.decision === null ? null : DECISIONS.includes(body.decision) ? body.decision : undefined;
  if (decision === undefined) return NextResponse.json({ error: "INVALID_DECISION" }, { status: 400 });
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : null;

  const { data: cv } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id, job_id, score, status, decision")
    .eq("id", cvId)
    .maybeSingle();
  if (!cv) return NextResponse.json({ error: "CV_NOT_FOUND" }, { status: 404 });

  const { data: job } = await supabaseAdmin
    .from("hr_jobs").select("user_email").eq("id", cv.job_id).maybeSingle();
  if (job?.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("hr_cv_analyses").update({
    decision,
    decision_note: decision ? note : null,
    decided_at:    decision ? now : null,
    decided_by:    decision ? session.user.email : null,
  }).eq("id", cvId);

  if (error) {
    console.error("[hr/decision]", error);
    return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  }

  // Logged with the AI suggestion it confirms or overrides
  await audit({
    jobId: cv.job_id, cvId, actor: session.user.email, action: "decision",
    detail: { from: cv.decision, to: decision, ai_status: cv.status, ai_score: cv.score, note: note ? true : false },
  });

  return NextResponse.json({ id: cvId, decision, decision_note: decision ? note : null, decided_at: decision ? now : null });
}
