import { NextResponse }  from "next/server";
import { supabaseAdmin, getUsageToday, incrementUsage } from "@/lib/supabase";
import { getClientIp }   from "@/lib/clientIp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAILY_LEAD_CAP = 10; // per IP — stops lead-list pollution

// ── POST /api/hr/trial/lead — Capture the email gate before revealing full results ──
export async function POST(request) {
  const body  = await request.json().catch(() => ({}));
  const email = (body.email ?? "").toString().trim().toLowerCase();

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
  }

  const identifier = `hr_lead:${getClientIp(request)}`;
  if ((await getUsageToday(identifier)) >= DAILY_LEAD_CAP) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }
  await incrementUsage(identifier);

  if (supabaseAdmin) {
    await supabaseAdmin.from("hr_leads").insert({
      email,
      source:    "hr_trial",
      job_title: (body.jobTitle ?? "").toString().slice(0, 200) || null,
      cv_count:  Number.isInteger(body.cvCount) && body.cvCount >= 0 && body.cvCount <= 5 ? body.cvCount : null,
    });
  }

  return NextResponse.json({ ok: true });
}
