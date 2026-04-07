import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Cache public settings for 5 minutes — reduces DB calls on every page load
export const revalidate = 300;

const DEFAULTS = {
  promo_enabled: "true",
  promo_price:   "4.99",
  promo_months:  "3",
  normal_price:  "9.99",
  free_limit:    "5",
};

// GET /api/settings — public, used by landing page
export async function GET() {
  if (!supabaseAdmin) return NextResponse.json(DEFAULTS);

  const { data } = await supabaseAdmin
    .from("settings")
    .select("key, value")
    .in("key", Object.keys(DEFAULTS));

  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return NextResponse.json({ ...DEFAULTS, ...map });
}
