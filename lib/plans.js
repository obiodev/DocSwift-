/**
 * Single source of truth for plan names and their capabilities.
 * Import from here — never hardcode plan strings across the app.
 */

export const PLANS = {
  FREE:     "free",
  STARTER:  "starter",
  PRO:      "pro",
  BUSINESS: "business",
  PREMIUM:  "premium",
};

/** Plans with unlimited conversions */
export const PRO_PLANS    = new Set([PLANS.PRO, PLANS.PREMIUM, PLANS.BUSINESS]);

/** Plans with access to premium tools */
export const PREMIUM_PLANS = new Set([PLANS.PREMIUM, PLANS.BUSINESS]);

export function isPlanPro(plan)     { return PRO_PLANS.has(plan); }
export function isPlanPremium(plan) { return PREMIUM_PLANS.has(plan); }
