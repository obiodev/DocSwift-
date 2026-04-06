import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

function isAdmin(email) {
  return process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
}

const DEFAULTS = {
  promo_enabled: "true",
  promo_price:   "4.99",
  promo_months:  "3",
  normal_price:  "9.99",
  free_limit:    "5",
};

// GET /api/admin/settings
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!supabaseAdmin) return NextResponse.json(DEFAULTS);

  const { data } = await supabaseAdmin
    .from("settings")
    .select("key, value")
    .in("key", Object.keys(DEFAULTS));

  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return NextResponse.json({ ...DEFAULTS, ...map });
}

// PUT /api/admin/settings
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!supabaseAdmin) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const body = await request.json();
  const entries = Object.entries(body)
    .filter(([k]) => Object.keys(DEFAULTS).includes(k))
    .map(([k, v]) => ({ key: k, value: String(v) }));

  await supabaseAdmin.from("settings").upsert(entries, { onConflict: "key" });
  return NextResponse.json({ ok: true });
}
