import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;       // server only
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Server-side admin client (bypasses RLS)
export const supabaseAdmin = url && key
  ? createClient(url, key)
  : null;

// Public client (respects RLS)
export const supabase = url && anon
  ? createClient(url, anon)
  : null;

// ─── Usage helpers ─────────────────────────────────────────────────────────

const FREE_LIMIT = 5; // default fallback

/**
 * Returns the current free limit from the settings table (or default 5).
 * Cached in-process for 5 minutes to avoid a DB call on every request.
 */
let _limitCache = null;
let _limitCacheAt = 0;
export async function getFreeLimit() {
  const now = Date.now();
  if (_limitCache !== null && now - _limitCacheAt < 5 * 60 * 1000) {
    return _limitCache;
  }
  if (!supabaseAdmin) return FREE_LIMIT;
  try {
    const { data } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "free_limit")
      .maybeSingle();
    const val = data?.value ? parseInt(data.value, 10) : FREE_LIMIT;
    _limitCache   = isNaN(val) ? FREE_LIMIT : val;
    _limitCacheAt = now;
    return _limitCache;
  } catch {
    return FREE_LIMIT;
  }
}

/**
 * Returns how many uses the identifier has made today.
 * identifier = user email (auth) or IP (anon)
 */
export async function getUsageToday(identifier) {
  if (!supabaseAdmin) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabaseAdmin
    .from("usage_logs")
    .select("count")
    .eq("identifier", identifier)
    .eq("date", today)
    .maybeSingle();
  return data?.count ?? 0;
}

/**
 * Increments the usage counter for today. Returns the new count.
 */
export async function incrementUsage(identifier) {
  if (!supabaseAdmin) return 1;
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabaseAdmin.rpc("increment_usage", {
    p_identifier: identifier,
    p_date: today,
  });
  return data ?? 1;
}

/**
 * Returns true if the user has an active Pro subscription.
 */
export async function isPro(email) {
  if (!supabaseAdmin || !email) return false;
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("status")
    .eq("user_email", email)
    .maybeSingle();
  return data?.status === "pro";
}

export { FREE_LIMIT };
