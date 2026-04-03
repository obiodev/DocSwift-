import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/ads — public endpoint, returns current ad HTML
export async function GET() {
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
