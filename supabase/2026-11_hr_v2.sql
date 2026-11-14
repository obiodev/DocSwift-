-- ============================================================
-- DocSwift HR v2 — criteria, human decisions, audit log, storage, client report
-- Idempotent.
-- ============================================================

-- Jobs: weighted criteria + shareable client report
ALTER TABLE hr_jobs ADD COLUMN IF NOT EXISTS criteria       jsonb       NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE hr_jobs ADD COLUMN IF NOT EXISTS heartbeat_at   timestamptz;
ALTER TABLE hr_jobs ADD COLUMN IF NOT EXISTS share_token    text;
ALTER TABLE hr_jobs ADD COLUMN IF NOT EXISTS share_company  text;
ALTER TABLE hr_jobs ADD COLUMN IF NOT EXISTS shared_at      timestamptz;
ALTER TABLE hr_jobs ADD COLUMN IF NOT EXISTS language       text        NOT NULL DEFAULT 'fr';
CREATE UNIQUE INDEX IF NOT EXISTS hr_jobs_share_token_idx ON hr_jobs(share_token) WHERE share_token IS NOT NULL;

-- Analyses: per-criterion verdicts, file in Storage, human decision
ALTER TABLE hr_cv_analyses ADD COLUMN IF NOT EXISTS criteria_results jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE hr_cv_analyses ADD COLUMN IF NOT EXISTS storage_path     text;
ALTER TABLE hr_cv_analyses ADD COLUMN IF NOT EXISTS mime_type        text;
ALTER TABLE hr_cv_analyses ADD COLUMN IF NOT EXISTS decision         text CHECK (decision IN ('shortlisted','rejected','to_review'));
ALTER TABLE hr_cv_analyses ADD COLUMN IF NOT EXISTS decision_note    text;
ALTER TABLE hr_cv_analyses ADD COLUMN IF NOT EXISTS decided_at       timestamptz;
ALTER TABLE hr_cv_analyses ADD COLUMN IF NOT EXISTS decided_by       text;
ALTER TABLE hr_cv_analyses ADD COLUMN IF NOT EXISTS read_mode        text; -- 'text' | 'docx' | 'vision'

-- Audit log (AI Act: logging of the human oversight; GDPR art. 22 evidence)
CREATE TABLE IF NOT EXISTS hr_audit_log (
  id         bigserial   PRIMARY KEY,
  job_id     uuid        REFERENCES hr_jobs(id) ON DELETE CASCADE,
  cv_id      uuid        REFERENCES hr_cv_analyses(id) ON DELETE CASCADE,
  actor      text        NOT NULL,
  action     text        NOT NULL,
  detail     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hr_audit_log_job_idx ON hr_audit_log(job_id, created_at DESC);
ALTER TABLE hr_audit_log ENABLE ROW LEVEL SECURITY;

-- Private bucket for uploaded CVs (deleted after analysis)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('hr-cvs', 'hr-cvs', false, 5242880)
ON CONFLICT (id) DO NOTHING;
