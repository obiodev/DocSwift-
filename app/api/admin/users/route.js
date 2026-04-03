import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

function isAdmin(email) {
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail && email === adminEmail;
}

// GET /api/admin/users — list all users with subscription + today's usage
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: subs }, { data: usageLogs }] = await Promise.all([
    supabaseAdmin.from("subscriptions").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("usage_logs").select("identifier, count").eq("date", today),
  ]);

  // Merge subscription + usage data
  const usageMap = Object.fromEntries((usageLogs ?? []).map(u => [u.identifier, u.count]));

  const users = (subs ?? []).map(s => ({
    email:           s.user_email,
    status:          s.status,
    stripeCustomerId: s.stripe_customer_id,
    periodEnd:       s.current_period_end,
    usageToday:      usageMap[s.user_email] ?? 0,
    createdAt:       s.created_at,
  }));

  // Stats
  const stats = {
    totalUsers:     users.length,
    proUsers:       users.filter(u => u.status === "pro").length,
    freeUsers:      users.filter(u => u.status !== "pro").length,
    totalUsageToday: Object.values(usageMap).reduce((a, b) => a + b, 0),
  };

  return NextResponse.json({ users, stats });
}

// PATCH /api/admin/users — manually change a user's plan
export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, status } = await request.json();
  if (!email || !["free", "pro"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await supabaseAdmin.from("subscriptions").upsert({
    user_email:  email,
    status,
    updated_at:  new Date().toISOString(),
  }, { onConflict: "user_email" });

  return NextResponse.json({ ok: true });
}
