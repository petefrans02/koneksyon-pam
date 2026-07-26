-- ═══════════════════════════════════════════════════════════════════
-- KONEKSYON PAM — Championnat Privé
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- Add private championship fields to contests table
ALTER TABLE contests ADD COLUMN IF NOT EXISTS is_private    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS invite_code   TEXT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS organizer_id  UUID;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS difficulty    TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE contests ADD COLUMN IF NOT EXISTS target_language TEXT NOT NULL DEFAULT 'fr';
ALTER TABLE contests ADD COLUMN IF NOT EXISTS num_rounds    INT NOT NULL DEFAULT 5;

-- Unique invite code (only for private championships)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contests_invite_code
  ON contests(invite_code)
  WHERE invite_code IS NOT NULL;

-- Index for faster organizer lookups
CREATE INDEX IF NOT EXISTS idx_contests_organizer
  ON contests(organizer_id)
  WHERE organizer_id IS NOT NULL;

-- Index for private championship listing
CREATE INDEX IF NOT EXISTS idx_contests_is_private
  ON contests(is_private, status);

-- Session cloning support
ALTER TABLE contests ADD COLUMN IF NOT EXISTS parent_contest_id UUID;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS auto_launch_count  INT;
