import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

const MAX_CVS       = 100;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per CV

// ── POST /api/hr/[id]/upload-cvs ─────────────────────────────────────────
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  // Verify job ownership
  const { data: job, error: jobErr } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email, cv_count, status")
    .eq("id", id)
    .maybeSingle();

  if (jobErr || !job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (job.status === "analyzing") return NextResponse.json({ error: "ANALYSIS_IN_PROGRESS" }, { status: 409 });

  const formData = await request.formData();
  const files    = formData.getAll("files");

  if (!files.length) return NextResponse.json({ error: "NO_FILES" }, { status: 400 });
  if (files.length + job.cv_count > MAX_CVS) {
    return NextResponse.json({ error: "TOO_MANY_CVS", max: MAX_CVS }, { status: 400 });
  }

  // Insert one row per CV (pending, no text yet — text is extracted during analysis)
  const rows = [];
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) continue; // skip oversized
    rows.push({ job_id: id, filename: file.name, status: "pending" });
  }

  if (!rows.length) return NextResponse.json({ error: "ALL_FILES_TOO_LARGE" }, { status: 400 });

  // Store raw bytes in Supabase storage (bucket: hr-cvs/<jobId>/<filename>)
  // If you haven't set up storage, we store the base64 in a text column instead.
  // Here we store the bytes inline in a dedicated column `pdf_bytes` (bytea).
  // ⚠️  For production, use Supabase Storage. For MVP we embed the file data in memory
  //     during the same request cycle (upload → then analyze separately).
  //
  // Strategy: save PDF bytes to a temp Supabase Storage bucket or encode inline.
  // For now, we save file metadata + base64 content into hr_cv_analyses.pdf_data (text).
  const insertRows = [];
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) continue;
    const bytes  = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    insertRows.push({ job_id: id, filename: file.name, status: "pending", pdf_data: base64 });
  }

  const { error: insErr } = await supabaseAdmin
    .from("hr_cv_analyses")
    .insert(insertRows);

  if (insErr) {
    console.error("hr_cv_analyses insert error:", insErr);
    return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  }

  // Update cv_count on the job
  await supabaseAdmin
    .from("hr_jobs")
    .update({ cv_count: job.cv_count + insertRows.length })
    .eq("id", id);

  return NextResponse.json({ inserted: insertRows.length });
}
