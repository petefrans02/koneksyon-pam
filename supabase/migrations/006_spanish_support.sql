-- =====================================================================
-- Migration 006 — Spanish (es) language support
-- Run in Supabase Dashboard → SQL Editor
-- =====================================================================

-- 1. CONTESTS: add Spanish title + description
ALTER TABLE contests ADD COLUMN IF NOT EXISTS title_es text;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS description_es text;

-- 2. NOTIFICATIONS: add Spanish
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title_es text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body_es text;

-- 3. CHAMPIONSHIP REWARDS: add Spanish badge label
ALTER TABLE championship_rewards ADD COLUMN IF NOT EXISTS badge_label_es text;

-- 4. kp_championship_rounds: migrate title/instructions JSONB to include es key
--    (JSONB fields — es key will be populated by admin when editing)
--    No schema change needed; JSONB is schema-flexible.

-- 5. kp_questions: JSONB fields already flexible.
--    es key will be added by admin when editing questions.

-- Done.
