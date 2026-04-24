import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";
import bcrypt               from "bcryptjs";

function isAdmin(email) {
  return process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/admin/users
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const today = new Date().toISOString().slice(0, 10);

  const [usersRes, subsRes, usageRes, allUsageRes] = await Promise.all([
    supabaseAdmin.from("users").select("id, email, name, provider, created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("subscriptions").select("*"),
    supabaseAdmin.from("usage_logs").select("identifier, count").eq("date", today),
    supabaseAdmin.from("usage_logs").select("identifier").neq("identifier", ""),
  ]);

  if (usersRes.error) console.error("[admin/users] Supabase error:", usersRes.error);

  const registeredUsers = usersRes.data ?? [];
  const subs            = subsRes.data   ?? [];
  const usageLogs       = usageRes.data  ?? [];

  const subsMap  = Object.fromEntries(subs.map(s => [s.user_email, s]));
  const usageMap = Object.fromEntries(usageLogs.map(u => [u.identifier, u.count]));

  // Collect all known emails (registered + subscriptions + usage_logs email identifiers)
  const knownEmails = new Set(registeredUsers.map(u => u.email));

  // Add emails from subscriptions not yet in users table
  for (const s of subs) {
    if (s.user_email && EMAIL_RE.test(s.user_email)) knownEmails.add(s.user_email);
  }

  // Add email identifiers from usage_logs (filter out IPs)
  for (const u of (allUsageRes.data ?? [])) {
    if (u.identifier && EMAIL_RE.test(u.identifier)) knownEmails.add(u.identifier);
  }

  // Build user map from registered users
  const userMap = Object.fromEntries(registeredUsers.map(u => [u.email, u]));

  // Merge all known emails into a unified list
  const users = Array.from(knownEmails).map(email => {
    const reg = userMap[email];
    const sub = subsMap[email];
    return {
      email,
      name:       reg?.name     ?? "",
      provider:   reg?.provider ?? "unknown",
      status:     sub?.status   ?? "free",
      periodEnd:  sub?.current_period_end    ?? null,
      giftedBy:   sub?.gifted_by             ?? null,
      stripeSubId: sub?.stripe_subscription_id ?? null,
      usageToday: usageMap[email] ?? 0,
      createdAt:  reg?.created_at ?? null,
    };
  }).sort((a, b) => {
    // Registered users first, then by createdAt desc
    if (a.createdAt && !b.createdAt) return -1;
    if (!a.createdAt && b.createdAt) return 1;
    if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const stats = {
    totalUsers:      users.length,
    proUsers:        users.filter(u => ["pro","business"].includes(u.status)).length,
    starterUsers:    users.filter(u => u.status === "starter").length,
    freeUsers:       users.filter(u => u.status === "free").length,
    totalUsageToday: Object.values(usageMap).reduce((a, b) => a + b, 0),
  };

  return NextResponse.json({ users, stats });
}

// PATCH /api/admin/users — change plan
export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, status } = await request.json();
  if (!email || !["free","starter","pro","business"].includes(status))
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await supabaseAdmin.from("subscriptions").upsert({
    user_email: email, status, updated_at: new Date().toISOString(),
  }, { onConflict: "user_email" });

  return NextResponse.json({ ok: true });
}

// POST /api/admin/users — create user manually
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, password, plan } = await request.json();
  if (!email?.includes("@")) return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error: "Mot de passe trop court" }, { status: 400 });

  // Check duplicate
  const { data: existing } = await supabaseAdmin.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
  if (existing) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });

  const password_hash = await bcrypt.hash(password, 12);
  await supabaseAdmin.from("users").insert({ name: name?.trim() ?? "", email: email.toLowerCase(), password_hash, provider: "credentials" });

  if (plan && plan !== "free") {
    await supabaseAdmin.from("subscriptions").upsert({
      user_email: email.toLowerCase(), status: plan,
      gifted_by: session.user.email, updated_at: new Date().toISOString(),
    }, { onConflict: "user_email" });
  }

  return NextResponse.json({ ok: true });
}
