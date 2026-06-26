-- =============================================
-- KONEKSYON PAM — Migration Supabase complète
-- Collez tout ce fichier dans SQL Editor > Run
-- =============================================

-- 1. Table des concours
CREATE TABLE IF NOT EXISTS contests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'upcoming',
  current_question integer DEFAULT 0,
  max_participants integer DEFAULT 10,
  start_at timestamptz,
  church_id uuid REFERENCES churches(id) ON DELETE SET NULL,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- 2. Participants aux concours
CREATE TABLE IF NOT EXISTS contest_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id uuid REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL,
  user_name text DEFAULT 'Anonyme',
  user_avatar text DEFAULT '',
  score integer DEFAULT 0,
  votes_count integer DEFAULT 0,
  answers jsonb DEFAULT '[]',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

-- 3. Questions des concours
CREATE TABLE IF NOT EXISTS contest_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id uuid REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  question_fr text NOT NULL,
  question_ht text,
  question_en text,
  options_fr jsonb NOT NULL,
  options_ht jsonb,
  options_en jsonb,
  correct_answer integer NOT NULL,
  reference text DEFAULT '',
  time_limit integer DEFAULT 30,
  order_num integer DEFAULT 0
);

-- 4. Votes du public
CREATE TABLE IF NOT EXISTS contest_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id uuid REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  participant_id uuid REFERENCES contest_participants(id) ON DELETE CASCADE NOT NULL,
  voter_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, voter_id)
);

-- 5. Fonctions pour les votes
CREATE OR REPLACE FUNCTION increment_votes(participant_id uuid)
RETURNS void AS $$
  UPDATE contest_participants SET votes_count = votes_count + 1 WHERE id = participant_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION decrement_votes(participant_id uuid)
RETURNS void AS $$
  UPDATE contest_participants SET votes_count = GREATEST(votes_count - 1, 0) WHERE id = participant_id;
$$ LANGUAGE sql;

-- 6. Activer le temps réel
ALTER TABLE contest_participants REPLICA IDENTITY FULL;
ALTER TABLE contest_votes REPLICA IDENTITY FULL;
ALTER TABLE contests REPLICA IDENTITY FULL;

-- 7. Memberships église
CREATE TABLE IF NOT EXISTS church_memberships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id uuid REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL,
  department_id uuid,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(church_id, user_id)
);

-- 8. Corriger la contrainte FK département
ALTER TABLE church_memberships
  DROP CONSTRAINT IF EXISTS church_memberships_department_id_fkey;

-- 9. Colonnes auteur sur les posts
ALTER TABLE church_posts ADD COLUMN IF NOT EXISTS author_id text;
ALTER TABLE church_posts ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE church_posts ADD COLUMN IF NOT EXISTS author_avatar text;
