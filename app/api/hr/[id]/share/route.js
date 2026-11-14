import crypto                from "crypto";
import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";
import { isHrActive }       from "@/lib/hrSubscription";
import { audit }            from "@/lib/hrStorage";

async function ownedJob(id, email) {
  const { data: job } = await supabaseAdmin
    .from("hr_jobs").select("id, user_email, status, share_token").eq("id", id).maybeSingle();
  if (!job) return { error: NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 }) };
  if (job.user_email !== email) return { error: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }) };
  return { job };
}

// ── POST /api/hr/[id]/share — create (or rotate) a read-only client report link ──
// body: { company?: string }  — the name shown on the report (e.g. the agency)
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (!(await isHrActive(session.user.email))) return NextResponse.json({ error: "HR_SUBSCRIPTION_REQUIRED" }, { status: 403 });

  const { id } = await params;
  const { job, error } = await ownedJob(id, session.user.email);
  if (error) return error;
  if (job.status !== "done") return NextResponse.json({ error: "NOT_DONE_YET" }, { status: 409 });

  const body = await request.json().catch(() => ({}));
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 80) || null : null;
  const token = crypto.randomBytes(24).toString("base64url"); // 192 bits, unguessable

  const { error: upErr } = await supabaseAdmin.from("hr_jobs")
    .update({ share_token: token, share_company: company, shared_at: new Date().toISOString() })
    .eq("id", id);
  if (upErr) {
    console.error("[hr/share]", upErr);
    return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  }

  await audit({ jobId: id, actor: session.user.email, action: job.share_token ? "share_rotated" : "share_created", detail: { company } });
  return NextResponse.json({ token, company });
}

// ── DELETE /api/hr/[id]/share — revoke the link ──
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { id } = await params;
  const { error } = await ownedJob(id, session.user.email);
  if (error) return error;

  await supabaseAdmin.from("hr_jobs").update({ share_token: null, shared_at: null }).eq("id", id);
  await audit({ jobId: id, actor: session.user.email, action: "share_revoked" });
  return NextResponse.json({ revoked: true });
}
