-- ============================================================
-- DocSwift — Users table (email/password credentials)
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         text        UNIQUE NOT NULL,
  password_hash text,                        -- NULL for Google OAuth users
  name          text,
  avatar_url    text,
  provider      text        DEFAULT 'credentials', -- 'credentials' | 'google'
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- ============================================================
-- DONE
-- ============================================================
