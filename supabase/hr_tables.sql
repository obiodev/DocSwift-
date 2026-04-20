-- ============================================================
-- DocSwift HR — Supabase migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. HR Jobs (one row per recruitment analysis session)
CREATE TABLE IF NOT EXISTS hr_jobs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email    text        NOT NULL,
  title         text        NOT NULL,
  description   text        NOT NULL,
  cv_count      integer     DEFAULT 0,
  analyzed_count integer    DEFAULT 0,
  status        text        DEFAULT 'pending',  -- pending | analyzing | done | error
  created_at    timestamptz DEFAULT now()
);

-- 2. HR CV Analyses (one row per CV per job)
CREATE TABLE IF NOT EXISTS hr_cv_analyses (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id      uuid        REFERENCES hr_jobs(id) ON DELETE CASCADE,
  filename    text        NOT NULL,
  pdf_data    text,       -- base64-encoded PDF (cleared after analysis to save space)
  score       integer,
  status      text        DEFAULT 'pending',  -- pending | recommended | consider | rejected | error
  strengths   text[]      DEFAULT '{}',
  weaknesses  text[]      DEFAULT '{}',
  summary     text,
  error_msg   text,
  created_at  timestamptz DEFAULT now()
);

-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS hr_jobs_user_email_idx       ON hr_jobs(user_email);
CREATE INDEX IF NOT EXISTS hr_cv_analyses_job_id_idx    ON hr_cv_analyses(job_id);
CREATE INDEX IF NOT EXISTS hr_cv_analyses_status_idx    ON hr_cv_analyses(status);

-- 4. RLS (Row Level Security) — optional if you use service role key server-side
-- The API uses supabaseAdmin (service role) which bypasses RLS.
-- Enable RLS only if you plan to use the anon key from the client.
-- ALTER TABLE hr_jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hr_cv_analyses ENABLE ROW LEVEL SECURITY;

-- 5. RPC to safely increment analyzed_count (avoids race conditions)
CREATE OR REPLACE FUNCTION hr_increment_analyzed(p_job_id uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE hr_jobs
  SET analyzed_count = analyzed_count + 1
  WHERE id = p_job_id;
$$;

-- ============================================================
-- DONE — tables and function are ready.
-- ============================================================
