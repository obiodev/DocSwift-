-- ============================================================
-- DocSwift — Script d'initialisation complet
-- Colle ce fichier dans : Supabase → SQL Editor → Run
-- ============================================================

-- ── 1. Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         text        UNIQUE NOT NULL,
  password_hash text,
  name          text,
  avatar_url    text,
  provider      text        DEFAULT 'credentials',
  created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- ── 2. Subscriptions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email             text        UNIQUE NOT NULL,
  status                 text        DEFAULT 'free', -- free | pro | premium | business
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscriptions_email_idx ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_id_idx ON subscriptions(stripe_subscription_id);

-- ── 3. Usage logs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_logs (
  id         uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text  NOT NULL, -- email (logged in) or IP (anonymous)
  date       date  NOT NULL DEFAULT CURRENT_DATE,
  count      integer DEFAULT 0,
  UNIQUE(identifier, date)
);
CREATE INDEX IF NOT EXISTS usage_logs_identifier_date_idx ON usage_logs(identifier, date);

-- RPC : incrément atomique du quota (évite les race conditions)
CREATE OR REPLACE FUNCTION increment_usage(p_identifier text, p_date date)
RETURNS integer LANGUAGE sql AS $$
  INSERT INTO usage_logs (identifier, date, count)
  VALUES (p_identifier, p_date, 1)
  ON CONFLICT (identifier, date)
  DO UPDATE SET count = usage_logs.count + 1
  RETURNING count;
$$;

-- ── 4. Settings (config admin) ────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Valeurs par défaut
INSERT INTO settings (key, value) VALUES
  ('free_limit',    '5'),
  ('promo_enabled', 'true'),
  ('promo_price',   '4.99'),
  ('promo_months',  '3'),
  ('normal_price',  '9.99')
ON CONFLICT (key) DO NOTHING;

-- ── 5. Affiliates ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliates (
  id              uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  code            text  UNIQUE NOT NULL,
  email           text,
  commission_rate numeric DEFAULT 0.20, -- 20%
  status          text    DEFAULT 'active', -- active | inactive
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS affiliates_code_idx ON affiliates(code);

-- ── 6. Referrals ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id               uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_code   text  NOT NULL,
  referred_email   text  NOT NULL,
  commission_cents integer DEFAULT 0,
  paid             boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referrals_affiliate_code_idx ON referrals(affiliate_code);

-- ── 7. HR Jobs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hr_jobs (
  id             uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email     text    NOT NULL,
  title          text    NOT NULL,
  description    text    NOT NULL,
  cv_count       integer DEFAULT 0,
  analyzed_count integer DEFAULT 0,
  status         text    DEFAULT 'pending', -- pending | analyzing | done | error
  created_at     timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hr_jobs_user_email_idx ON hr_jobs(user_email);

-- ── 8. HR CV Analyses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hr_cv_analyses (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id     uuid REFERENCES hr_jobs(id) ON DELETE CASCADE,
  filename   text NOT NULL,
  pdf_data   text,
  score      integer,
  status     text    DEFAULT 'pending', -- pending | recommended | consider | rejected | error
  strengths  text[]  DEFAULT '{}',
  weaknesses text[]  DEFAULT '{}',
  summary    text,
  error_msg  text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hr_cv_analyses_job_id_idx ON hr_cv_analyses(job_id);
CREATE INDEX IF NOT EXISTS hr_cv_analyses_status_idx ON hr_cv_analyses(status);

-- RPC : incrément atomique HR
CREATE OR REPLACE FUNCTION hr_increment_analyzed(p_job_id uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE hr_jobs
  SET analyzed_count = analyzed_count + 1
  WHERE id = p_job_id;
$$;

-- ============================================================
-- DONE — toutes les tables et fonctions sont prêtes.
-- ============================================================
