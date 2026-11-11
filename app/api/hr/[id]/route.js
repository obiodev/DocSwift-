import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

// ── DELETE /api/hr/[id] — erase a job and all its CV analyses (GDPR art. 17) ──
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  const { data: job } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email")
    .eq("id", id)
    .maybeSingle();

  if (!job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  // hr_cv_analyses rows go with ON DELETE CASCADE; delete explicitly in case the FK was created without it
  const { error: cvErr } = await supabaseAdmin.from("hr_cv_analyses").delete().eq("job_id", id);
  const { error: jobErr } = await supabaseAdmin.from("hr_jobs").delete().eq("id", id);

  if (cvErr || jobErr) {
    console.error("[hr/delete]", cvErr ?? jobErr);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ deleted: true });
}
