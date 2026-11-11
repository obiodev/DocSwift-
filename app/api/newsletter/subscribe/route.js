import { NextResponse } from "next/server";
import crypto           from "crypto";
import { supabaseAdmin, getUsageToday, incrementUsage } from "@/lib/supabase";
import { sendNewsletterConfirmEmail } from "@/lib/email";
import { getClientIp }  from "@/lib/clientIp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAILY_CAP_PER_IP = 5;
// Same answer whatever happens, so the form can't be used to probe the list
const OK = { ok: true, message: "Vérifiez votre boîte mail pour confirmer votre inscription." };

// ── POST /api/newsletter/subscribe — step 1 of double opt-in ─────────────────
export async function POST(request) {
  const body    = await request.json().catch(() => ({}));
  const email   = String(body.email ?? "").trim().toLowerCase();
  const source  = String(body.source ?? "site").slice(0, 40);

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "INVALID_EMAIL", message: "Adresse email invalide." }, { status: 400 });
  }
  // GDPR: consent must be an explicit, unticked-by-default action
  if (body.consent !== true) {
    return NextResponse.json({ error: "CONSENT_REQUIRED", message: "Merci de cocher la case de consentement." }, { status: 400 });
  }
  if (!supabaseAdmin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });

  const ipKey = `newsletter:${getClientIp(request)}`;
  if ((await getUsageToday(ipKey)) >= DAILY_CAP_PER_IP) {
    return NextResponse.json({ error: "RATE_LIMITED", message: "Trop de tentatives, réessayez demain." }, { status: 429 });
  }
  await incrementUsage(ipKey);

  const { data: existing } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("status")
    .eq("email", email)
    .maybeSingle();
  if (existing?.status === "confirmed") return NextResponse.json(OK);

  const token = crypto.randomBytes(32).toString("hex");
  const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert({
    email,
    status:        "pending",
    source,
    confirm_token: token,
    consent_text:  "J'accepte de recevoir la newsletter DocSwift (2 emails/mois max). Désinscription en un clic.",
    requested_at:  new Date().toISOString(),
  }, { onConflict: "email" });

  if (error) {
    console.error("[newsletter/subscribe]", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }

  await sendNewsletterConfirmEmail({ email, token });
  return NextResponse.json(OK);
}
