import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

function isAdmin(email) {
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail && email === adminEmail;
}

// GET /api/admin/ads — return current ad config
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ rewardedAdHtml: "", bannerAdHtml: "" });
  }

  const { data } = await supabaseAdmin
    .from("settings")
    .select("key, value")
    .in("key", ["rewarded_ad_html", "banner_ad_html"]);

  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return NextResponse.json({
    rewardedAdHtml: map["rewarded_ad_html"] ?? "",
    bannerAdHtml:   map["banner_ad_html"]   ?? "",
  });
}

// PUT /api/admin/ads — save ad config
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { rewardedAdHtml, bannerAdHtml } = await request.json();

  await supabaseAdmin.from("settings").upsert([
    { key: "rewarded_ad_html", value: rewardedAdHtml ?? "" },
    { key: "banner_ad_html",   value: bannerAdHtml   ?? "" },
  ], { onConflict: "key" });

  return NextResponse.json({ ok: true });
}
