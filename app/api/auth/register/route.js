import { NextResponse }      from "next/server";
import crypto               from "crypto";
import bcrypt               from "bcryptjs";
import { supabaseAdmin }    from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/email";
import { getClientIp }      from "@/lib/clientIp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Best-effort in-memory rate limiter: max 5 registrations per IP per hour
const registerAttempts = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const entry = registerAttempts.get(ip) ?? { count: 0, reset: now + window };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + window; }
  entry.count++;
  registerAttempts.set(ip, entry);
  return entry.count > 5;
}

// Same response whether or not the email already exists (prevents account enumeration)
const GENERIC_OK = { success: true, verify: true };

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une heure." }, { status: 429 });
    }

    const { name, email: rawEmail, password } = await request.json();
    const email = String(rawEmail ?? "").toLowerCase().trim();

    // ── Validation ───────────────────────────────────────────────────────
    if (!name?.trim())                    return NextResponse.json({ error: "Nom requis."              }, { status: 400 });
    if (!email || !EMAIL_RE.test(email))  return NextResponse.json({ error: "Email invalide."          }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: "Mot de passe trop court (8 caractères min)." }, { status: 400 });

    // ── Check duplicate ───────────────────────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) return NextResponse.json(GENERIC_OK);

    // ── Hash password + verification token ────────────────────────────────
    const password_hash  = await bcrypt.hash(password, 12);
    const verify_token   = crypto.randomBytes(32).toString("hex");
    const verify_expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabaseAdmin
      .from("users")
      .insert({
        name: name.trim(),
        email,
        password_hash,
        provider: "credentials",
        email_verified: false,
        verify_token,
        verify_expires,
      });

    if (insertErr) {
      console.error("Register insert error:", insertErr);
      return NextResponse.json({ error: "Erreur lors de la création du compte." }, { status: 500 });
    }

    await sendVerificationEmail({ email, name: name.trim(), token: verify_token });

    return NextResponse.json(GENERIC_OK);

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
