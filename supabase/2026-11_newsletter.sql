-- ============================================================
-- DocSwift — Newsletter subscribers (double opt-in, proof of consent)
-- Idempotent. Run before deploying /api/newsletter/*.
-- ============================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email         text        PRIMARY KEY,
  status        text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','unsubscribed')),
  source        text,
  confirm_token text,
  consent_text  text,
  requested_at  timestamptz NOT NULL DEFAULT now(),
  confirmed_at  timestamptz,
  confirm_ip    text,
  synced_at     timestamptz
);

CREATE INDEX IF NOT EXISTS newsletter_confirm_token_idx
  ON newsletter_subscribers(confirm_token) WHERE confirm_token IS NOT NULL;

-- Server-side only (service role). No policy = anon/authenticated denied.
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
