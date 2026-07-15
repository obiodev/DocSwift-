/**
 * Single source of truth for DocSwift HR (B2B) subscription access.
 * Reads from `hr_subscriptions` — never from `subscriptions` (Academic).
 * Import from here — never query hr_subscriptions or check plan/status inline.
 */
import { supabaseAdmin } from "./supabase.js";

export const HR_PLANS = {
  STARTER:  "starter",
  PRO:      "pro",
  BUSINESS: "business",
};

export const HR_ACTIVE_STATUSES = new Set(["trialing", "active"]);

/**
 * Provisional pricing/quota grid — NOT confirmed for Stripe product creation.
 * Update once the exact monthly amounts are validated; used only as the
 * `cv_quota` default when provisioning a new hr_subscriptions row.
 */
export const HR_PLAN_QUOTAS = {
  [HR_PLANS.STARTER]:  50,
  [HR_PLANS.PRO]:      250,
  [HR_PLANS.BUSINESS]: 1000,
};

/**
 * Returns the user's hr_subscriptions row, or null if they've never subscribed to HR.
 */
export async function getHrSubscription(email) {
  if (!supabaseAdmin || !email) return null;
  const { data } = await supabaseAdmin
    .from("hr_subscriptions")
    .select("*")
    .eq("user_email", email)
    .maybeSingle();
  return data ?? null;
}

/**
 * Returns true if the user has a usable HR subscription (trialing or active).
 */
export async function isHrActive(email) {
  const sub = await getHrSubscription(email);
  return !!sub && HR_ACTIVE_STATUSES.has(sub.status);
}

/**
 * Returns { active, plan, quota, used, remaining } for dashboard/quota checks.
 * `remaining` is null when there is no active subscription.
 */
export async function getHrQuotaStatus(email) {
  const sub = await getHrSubscription(email);
  const active = !!sub && HR_ACTIVE_STATUSES.has(sub.status);
  if (!sub) {
    return { active: false, plan: null, quota: 0, used: 0, remaining: null };
  }
  return {
    active,
    plan:      sub.plan,
    quota:     sub.cv_quota,
    used:      sub.cv_screened_this_month,
    remaining: active ? Math.max(sub.cv_quota - sub.cv_screened_this_month, 0) : null,
  };
}

/**
 * Atomically increments the monthly CV-screened counter via the hr_increment_cv_screened RPC.
 * Returns the new count, or null if the RPC failed.
 */
export async function incrementHrCvScreened(email, amount = 1) {
  if (!supabaseAdmin || !email) return null;
  const { data, error } = await supabaseAdmin.rpc("hr_increment_cv_screened", {
    p_user_email: email,
    p_amount:     amount,
  });
  if (error) {
    console.error("hr_increment_cv_screened error:", error);
    return null;
  }
  return data ?? null;
}
