import { NextResponse }      from "next/server";
import { getServerSession }  from "next-auth";
import { authOptions }       from "@/lib/auth";
import { supabaseAdmin }     from "@/lib/supabase";
import { normalizeCriteria } from "@/lib/hrCriteria";
import { audit, removeCvs }  from "@/lib/hrStorage";

async function ownedJob(id, email) {
  const { data: job } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email, status")
    .eq("id", id)
    .maybeSingle();
  if (!job) return { error: NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 }) };
  if (job.user_email !== email) return { error: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }) };
  return { job };
}

// ── PATCH /api/hr/[id] — edit title, description or criteria ──────────────
// Takes effect for the CVs analysed next; finished results are not rescored.
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { id } = await params;
  const { job, error } = await ownedJob(id, session.user.email);
  if (error) return error;
  if (job.status === "analyzing") return NextResponse.json({ error: "ANALYSIS_IN_PROGRESS" }, { status: 409 });

  const body = await request.json().catch(() => ({}));
  const update = {};
  if (typeof body.title === "string" && body.title.trim())             update.title = body.title.trim().slice(0, 200);
  if (typeof body.description === "string" && body.description.trim()) update.description = body.description.trim().slice(0, 8000);
  if (Array.isArray(body.criteria))                                    update.criteria = normalizeCriteria(body.criteria);
  if (["fr", "en", "ar"].includes(body.language))                      update.language = body.language;
  if (!Object.keys(update).length) return NextResponse.json({ error: "NOTHING_TO_UPDATE" }, { status: 400 });

  const { data, error: upErr } = await supabaseAdmin
    .from("hr_jobs").update(update).eq("id", id)
    .select("id, title, description, criteria, language").single();
  if (upErr) {
    console.error("[hr/patch]", upErr);
    return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  }
  await audit({ jobId: id, actor: session.user.email, action: "job_updated", detail: update });
  return NextResponse.json(data);
}

// ── DELETE /api/hr/[id] — erase a job, its analyses and files (GDPR art. 17) ──
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { id } = await params;
  const { error } = await ownedJob(id, session.user.email);
  if (error) return error;

  const { data: files } = await supabaseAdmin
    .from("hr_cv_analyses").select("storage_path").eq("job_id", id).not("storage_path", "is", null);
  await removeCvs((files ?? []).map((f) => f.storage_path));

  // Explicit deletes in case an FK was created without ON DELETE CASCADE
  const { error: cvErr }  = await supabaseAdmin.from("hr_cv_analyses").delete().eq("job_id", id);
  const { error: jobErr } = await supabaseAdmin.from("hr_jobs").delete().eq("id", id);

  if (cvErr || jobErr) {
    console.error("[hr/delete]", cvErr ?? jobErr);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ deleted: true });
}
