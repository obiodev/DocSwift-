import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";
import { isHrActive }       from "@/lib/hrSubscription";
import { detectType, uploadCv, audit } from "@/lib/hrStorage";

const MAX_CVS       = 100;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per CV
const MAX_BODY      = MAX_CVS * MAX_FILE_SIZE;

// ── POST /api/hr/[id]/upload-cvs — PDF or DOCX, stored privately until analysed ──
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }
  if (!(await isHrActive(session.user.email))) {
    return NextResponse.json({ error: "HR_SUBSCRIPTION_REQUIRED" }, { status: 403 });
  }

  const { id } = await params;

  const { data: job, error: jobErr } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email, cv_count, status")
    .eq("id", id)
    .maybeSingle();

  if (jobErr || !job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (job.status === "analyzing") return NextResponse.json({ error: "ANALYSIS_IN_PROGRESS" }, { status: 409 });

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) {
    return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }

  const formData = await request.formData();
  const files    = formData.getAll("files");

  if (!files.length) return NextResponse.json({ error: "NO_FILES" }, { status: 400 });
  if (files.length + job.cv_count > MAX_CVS) {
    return NextResponse.json({ error: "TOO_MANY_CVS", max: MAX_CVS }, { status: 400 });
  }

  const rows = [];
  const skipped = [];
  for (const file of files) {
    const mime = detectType(file);
    if (!mime)                       { skipped.push({ name: file.name, reason: "TYPE" }); continue; }
    if (file.size > MAX_FILE_SIZE)   { skipped.push({ name: file.name, reason: "SIZE" }); continue; }
    try {
      const path = await uploadCv(id, Buffer.from(await file.arrayBuffer()), mime);
      rows.push({ job_id: id, filename: String(file.name).slice(0, 200), status: "pending", storage_path: path, mime_type: mime });
    } catch (err) {
      console.error("[upload-cvs]", err.message);
      skipped.push({ name: file.name, reason: "STORAGE" });
    }
  }

  if (!rows.length) return NextResponse.json({ error: "NO_VALID_FILES", skipped }, { status: 400 });

  const { error: insErr } = await supabaseAdmin.from("hr_cv_analyses").insert(rows);
  if (insErr) {
    console.error("hr_cv_analyses insert error:", insErr);
    return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  }

  await supabaseAdmin.from("hr_jobs").update({ cv_count: job.cv_count + rows.length }).eq("id", id);
  await audit({ jobId: id, actor: session.user.email, action: "cvs_uploaded", detail: { count: rows.length, skipped: skipped.length } });

  return NextResponse.json({ inserted: rows.length, skipped });
}
