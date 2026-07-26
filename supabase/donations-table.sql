-- Run this once in the Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → paste → Run

CREATE TABLE IF NOT EXISTS donations (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL    DEFAULT now(),
  paypal_order_id      TEXT        UNIQUE,
  paypal_capture_id    TEXT        UNIQUE,
  amount               NUMERIC(10,2) NOT NULL,
  currency             TEXT        NOT NULL    DEFAULT 'USD',
  status               TEXT        NOT NULL    DEFAULT 'pending'
                                   CHECK (status IN ('pending','completed','denied','refunded','webhook_confirmed')),
  donor_email          TEXT,
  donor_name           TEXT,
  webhook_confirmed_at TIMESTAMPTZ,
  raw_response         JSONB
);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_donations_status       ON donations (status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at   ON donations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_capture_id   ON donations (paypal_capture_id);

-- Enable Row Level Security — only service role can access (API routes bypass RLS)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- No policies needed: SUPABASE_SERVICE_ROLE_KEY bypasses RLS.
-- This ensures the table is NEVER readable by anonymous/authenticated client calls.
-- No anon or authenticated policy = effectively private.
