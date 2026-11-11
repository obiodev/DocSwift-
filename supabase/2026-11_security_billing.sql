-- ============================================================
-- DocSwift — Security & billing fixes (Nov 2026)
-- Run in Supabase SQL Editor BEFORE deploying the matching code.
-- Idempotent: safe to run several times.
-- ============================================================

-- 1. Email verification for password accounts --------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_token   text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verify_expires timestamptz;
CREATE INDEX IF NOT EXISTS users_verify_token_idx ON users(verify_token) WHERE verify_token IS NOT NULL;

-- Existing accounts are grandfathered so nobody is locked out.
-- Google accounts are verified by Google.
UPDATE users SET email_verified = true WHERE email_verified = false AND verify_token IS NULL;

-- ⚠️ Review manually: password accounts created by someone else for YOUR admin
-- email would have been grandfathered above. Check that this row is yours:
--   SELECT email, provider, password_hash IS NOT NULL AS has_password, created_at
--   FROM users WHERE email = '<ADMIN_EMAIL>';
-- If you never set a password, run:
--   UPDATE users SET password_hash = NULL WHERE email = '<ADMIN_EMAIL>';

-- 2. HR job claim timestamp (used by /api/hr/[id]/analyze) -------------------
ALTER TABLE hr_jobs ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE hr_jobs ADD COLUMN IF NOT EXISTS error_msg  text;

-- 3. Row Level Security: deny-all for anon/authenticated ----------------------
-- The app only uses the service-role key server-side, which bypasses RLS.
-- With RLS on and no policy, the public anon key can read/write nothing.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','subscriptions','usage_logs','settings','affiliates','referrals',
    'hr_jobs','hr_cv_analyses','hr_subscriptions','hr_leads'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- 4. RPCs: callable only server-side ---------------------------------------
DO $$
DECLARE f text;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure::text
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('increment_usage','hr_increment_analyzed','hr_increment_cv_screened')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated, public', f);
  END LOOP;
END $$;

-- Then check Dashboard → Advisors → Security: no "RLS disabled" warnings left.
