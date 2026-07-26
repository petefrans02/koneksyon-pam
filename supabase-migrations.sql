-- Ajouter owner_user_id aux groupes (si pas encore fait)
ALTER TABLE churches ADD COLUMN IF NOT EXISTS owner_user_id text;

-- Table des demandes d'adhésion
CREATE TABLE IF NOT EXISTS church_join_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id uuid REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL,
  user_name text,
  user_email text,
  user_avatar text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(church_id, user_id)
);

-- Index pour les requêtes du propriétaire
CREATE INDEX IF NOT EXISTS idx_join_requests_church ON church_join_requests(church_id, status);

-- ============================================================
-- Championnat biblique v2 — Migration badges
-- Ajouter la colonne badges à contest_sessions
-- ============================================================
ALTER TABLE contest_sessions ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]';

-- Ajouter round_breakdown sur le leaderboard pour analyse par manche
ALTER TABLE contest_leaderboard ADD COLUMN IF NOT EXISTS round_breakdown jsonb;

-- Supprimer le système de votes (remplacé par scoring de performance)
DROP TABLE IF EXISTS contest_votes CASCADE;

-- Supprimer les fonctions de votes
DROP FUNCTION IF EXISTS increment_votes(uuid);
DROP FUNCTION IF EXISTS decrement_votes(uuid);
