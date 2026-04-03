import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

function isAdmin(email) {
  return process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
}

function generateCode(name) {
  const base  = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const rand  = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${base}${rand}`;
}

// GET /api/admin/affiliates — list all affiliates with stats
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!supabaseAdmin) return NextResponse.json({ affiliates: [] });

  const [{ data: affiliates }, { data: referrals }] = await Promise.all([
    supabaseAdmin.from("affiliates").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("referrals").select("affiliate_code, status, commission_cents"),
  ]);

  const statsMap = {};
  for (const r of referrals ?? []) {
    if (!statsMap[r.affiliate_code]) statsMap[r.affiliate_code] = { total: 0, converted: 0, earnings: 0 };
    statsMap[r.affiliate_code].total++;
    if (r.status === "converted" || r.status === "paid") {
      statsMap[r.affiliate_code].converted++;
      statsMap[r.affiliate_code].earnings += r.commission_cents ?? 0;
    }
  }

  const result = (affiliates ?? []).map(a => ({
    ...a,
    totalReferrals:    statsMap[a.code]?.total     ?? 0,
    convertedReferrals: statsMap[a.code]?.converted ?? 0,
    totalEarnings:     (statsMap[a.code]?.earnings ?? 0) / 100,
  }));

  return NextResponse.json({ affiliates: result });
}

// POST /api/admin/affiliates — create affiliate
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { name, email, commissionRate } = await request.json();
  if (!name || !email) return NextResponse.json({ error: "name and email required" }, { status: 400 });

  const code = generateCode(name);
  const { data, error } = await supabaseAdmin.from("affiliates").insert({
    name,
    email,
    code,
    commission_rate: parseInt(commissionRate) || 30,
    status:          "active",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ affiliate: data });
}

// PATCH /api/admin/affiliates — update status or commission
export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { code, status, commissionRate } = await request.json();
  const updates = {};
  if (status)         updates.status          = status;
  if (commissionRate) updates.commission_rate  = parseInt(commissionRate);

  await supabaseAdmin.from("affiliates").update(updates).eq("code", code);
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/affiliates — deactivate affiliate
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { code } = await request.json();
  await supabaseAdmin.from("affiliates").update({ status: "inactive" }).eq("code", code);
  return NextResponse.json({ ok: true });
}
