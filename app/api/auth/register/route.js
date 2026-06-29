import { NextResponse }      from "next/server";
import bcrypt               from "bcryptjs";
import { supabaseAdmin }    from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter: max 5 registrations per IP per hour
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

export async function POST(request) {
  try {
    const ip = (request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une heure." }, { status: 429 });
    }

    const { name, email, password } = await request.json();

    // ── Validation ───────────────────────────────────────────────────────
    if (!name?.trim())                     return NextResponse.json({ error: "Nom requis."              }, { status: 400 });
    if (!email?.trim() || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Email invalide."   }, { status: 400 });
    if (!password || password.length < 8)  return NextResponse.json({ error: "Mot de passe trop court (8 caractères min)." }, { status: 400 });

    // ── Check duplicate ───────────────────────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });

    // ── Hash password ─────────────────────────────────────────────────────
    const password_hash = await bcrypt.hash(password, 12);

    // ── Insert user ───────────────────────────────────────────────────────
    const { error: insertErr } = await supabaseAdmin
      .from("users")
      .insert({ name: name.trim(), email: email.toLowerCase(), password_hash, provider: "credentials" });

    if (insertErr) {
      console.error("Register insert error:", insertErr);
      return NextResponse.json({ error: "Erreur lors de la création du compte." }, { status: 500 });
    }

    // ── Welcome email (non-blocking) ──────────────────────────────────────
    sendWelcomeEmail({ email: email.toLowerCase(), name: name.trim() }).catch(() => {});

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
