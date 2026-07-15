-- ============================================================
-- DocSwift HR — Leads migration (essai gratuit / lead magnet)
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS hr_leads (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text        NOT NULL,
  source      text        NOT NULL DEFAULT 'hr_trial',
  job_title   text,
  cv_count    integer     DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hr_leads_email_idx ON hr_leads(email);

-- ============================================================
-- DONE — hr_leads is ready.
-- ============================================================
