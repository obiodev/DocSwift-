-- ============================================================
-- DocSwift HR — Subscription migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
--
-- Isolation note: this table is intentionally separate from the
-- existing `subscriptions` table, which stays dedicated to the
-- Academic (B2C, pay-per-order) vertical. HR access must never be
-- derived from `subscriptions.status` after this migration lands.
--
-- No HrAccount entity exists in this codebase (auth is a single
-- shared `users` table across verticals) — so hr_subscriptions is
-- keyed by user_email, same convention as hr_jobs/usage_logs.
-- ============================================================

CREATE TABLE IF NOT EXISTS hr_subscriptions (
  id                      uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email              text        UNIQUE NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  stripe_customer_id      text,
  stripe_subscription_id  text        UNIQUE,
  plan                    text        NOT NULL CHECK (plan IN ('starter', 'pro', 'business')),
  status                  text        NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  current_period_end      timestamptz,
  cv_screened_this_month  integer     NOT NULL DEFAULT 0,
  cv_quota                integer     NOT NULL,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_subscriptions_user_email_idx      ON hr_subscriptions(user_email);
CREATE INDEX IF NOT EXISTS hr_subscriptions_stripe_sub_id_idx   ON hr_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS hr_subscriptions_status_idx          ON hr_subscriptions(status);

-- RPC: atomic increment of the monthly CV screening counter (avoids race conditions)
CREATE OR REPLACE FUNCTION hr_increment_cv_screened(p_user_email text, p_amount integer DEFAULT 1)
RETURNS integer LANGUAGE sql AS $$
  UPDATE hr_subscriptions
  SET cv_screened_this_month = cv_screened_this_month + p_amount,
      updated_at = now()
  WHERE user_email = p_user_email
  RETURNING cv_screened_this_month;
$$;

-- ============================================================
-- DONE — hr_subscriptions is ready. No existing tables are
-- modified; `subscriptions` (Academic) is untouched.
-- ============================================================
