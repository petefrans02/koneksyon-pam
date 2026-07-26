-- =====================================================================
-- KONEKSYON PAM — Phase 2 migrations
-- Run in Supabase Dashboard → SQL Editor
-- =====================================================================

-- 1. CONTESTS: add enabled flag + multilingual title/description
ALTER TABLE contests ADD COLUMN IF NOT EXISTS enabled boolean DEFAULT true;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS title_ht text;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS description_ht text;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS description_en text;

-- Fix the existing contest title
UPDATE contests SET
  title    = 'Les Prophètes Bibliques de l''Afrique',
  title_ht = 'Pwofèt Biblik Lafrik',
  title_en = 'Biblical Prophets of Africa'
WHERE title ILIKE '%Prophètes de l''Afrique Biblique%'
   OR title ILIKE '%Prophètes de l''Afrique%';

-- 2. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text        NOT NULL CHECK (type IN ('contest','prayer','testimony','study','announcement')),
  title_fr   text        NOT NULL,
  title_ht   text,
  title_en   text,
  body_fr    text,
  body_ht    text,
  body_en    text,
  link       text,
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read, created_at DESC);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "notif_select_own"  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "notif_update_own"  ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "notif_service_ins" ON notifications FOR INSERT WITH CHECK (true);

-- 3. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id             uuid    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_contests      boolean NOT NULL DEFAULT true,
  email_prayers       boolean NOT NULL DEFAULT false,
  email_studies       boolean NOT NULL DEFAULT false,
  email_announcements boolean NOT NULL DEFAULT true,
  email_news          boolean NOT NULL DEFAULT true,
  push_contests       boolean NOT NULL DEFAULT true,
  push_prayers        boolean NOT NULL DEFAULT true,
  push_studies        boolean NOT NULL DEFAULT true,
  push_announcements  boolean NOT NULL DEFAULT true,
  updated_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "prefs_all_own" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- 4. NOTIFICATION LOGS (campaign tracking + dedup)
CREATE TABLE IF NOT EXISTS notification_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id    uuid        REFERENCES contests(id) ON DELETE CASCADE,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  email         text        NOT NULL,
  type          text        NOT NULL DEFAULT 'email',
  status        text        NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed')),
  error_message text,
  sent_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contest_id, user_id)
);
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
-- Only service role can access logs
CREATE POLICY IF NOT EXISTS "logs_deny_anon" ON notification_logs FOR ALL USING (false);

-- 5. SOCIAL SETTINGS
CREATE TABLE IF NOT EXISTS social_settings (
  id                   int     PRIMARY KEY DEFAULT 1,
  facebook_enabled     boolean NOT NULL DEFAULT false,
  youtube_enabled      boolean NOT NULL DEFAULT false,
  auto_post_contests   boolean NOT NULL DEFAULT false,
  auto_post_prayers    boolean NOT NULL DEFAULT false,
  auto_post_testimonies boolean NOT NULL DEFAULT false,
  updated_at           timestamptz NOT NULL DEFAULT now()
);
INSERT INTO social_settings(id) VALUES(1) ON CONFLICT DO NOTHING;
ALTER TABLE social_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "social_deny_anon" ON social_settings FOR ALL USING (false);

-- =====================================================================
-- GRANT service role access for the tables that block anon access
-- (already granted by default in Supabase service role)
-- =====================================================================
