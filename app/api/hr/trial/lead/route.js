import { NextResponse }  from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/hr/trial/lead — Capture the email gate before revealing full results ──
export async function POST(request) {
  const body  = await request.json().catch(() => ({}));
  const email = (body.email ?? "").toString().trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
  }

  if (supabaseAdmin) {
    await supabaseAdmin.from("hr_leads").insert({
      email,
      source:    "hr_trial",
      job_title: (body.jobTitle ?? "").toString().slice(0, 200) || null,
      cv_count:  Number.isFinite(body.cvCount) ? body.cvCount : null,
    });
  }

  return NextResponse.json({ ok: true });
}
