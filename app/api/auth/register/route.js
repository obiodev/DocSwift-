import { NextResponse } from "next/server";
import bcrypt           from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
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

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
