-- ═══════════════════════════════════════════════════════════════════
-- KONEKSYON PAM — Banque Officielle de Questions Bibliques
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Banque centrale de questions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS kp_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type de question
  type          TEXT NOT NULL DEFAULT 'mcq'
                CHECK (type IN ('mcq','tf','fill','character','location','book','chrono','finale','match')),

  -- Contenu principal (selon le type)
  question      JSONB DEFAULT '{"fr":"","ht":"","en":""}',  -- mcq / finale / location / book
  statement     JSONB DEFAULT '{"fr":"","ht":"","en":""}',  -- tf
  verse         JSONB DEFAULT '{"fr":"","ht":"","en":""}',  -- fill
  clues         JSONB DEFAULT '[]',                          -- character / location / book [{fr,ht,en}]

  -- Options A / B / C / D
  option_a      JSONB DEFAULT '{"fr":"","ht":"","en":""}',
  option_b      JSONB DEFAULT '{"fr":"","ht":"","en":""}',
  option_c      JSONB DEFAULT '{"fr":"","ht":"","en":""}',
  option_d      JSONB DEFAULT '{"fr":"","ht":"","en":""}',

  -- Réponse correcte
  correct_answer SMALLINT CHECK (correct_answer BETWEEN 0 AND 3), -- 0=A 1=B 2=C 3=D
  is_true        BOOLEAN,                                          -- pour type tf

  -- Métadonnées
  reference      TEXT,
  difficulty     TEXT NOT NULL DEFAULT 'medium'
                 CHECK (difficulty IN ('easy','medium','hard','expert')),
  status         TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','validated','published')),

  -- Manche suggérée (1–15) pour auto-classement
  suggested_round SMALLINT CHECK (suggested_round BETWEEN 1 AND 15),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Tags / Thèmes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kp_tags (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name     TEXT NOT NULL UNIQUE,
  category TEXT, -- 'testament' | 'theme' | 'person' | 'book' | 'topic'
  color    TEXT DEFAULT '#6b7280'
);

-- Lien question ↔ tags (many-to-many)
CREATE TABLE IF NOT EXISTS kp_question_tags (
  question_id UUID NOT NULL REFERENCES kp_questions(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES kp_tags(id)      ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

-- ── 3. Structure des 15 manches par championnat ───────────────────────
CREATE TABLE IF NOT EXISTS kp_championship_rounds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id      UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  round_number    SMALLINT NOT NULL CHECK (round_number BETWEEN 1 AND 15),
  round_type      TEXT NOT NULL DEFAULT 'mcq',
  title           JSONB NOT NULL DEFAULT '{"fr":"","ht":"","en":""}',
  instructions    JSONB DEFAULT '{"fr":"","ht":"","en":""}',
  color_theme     TEXT DEFAULT '#1d4ed8',
  icon            TEXT DEFAULT '⚡',
  time_limit_sec  INT  DEFAULT 15,
  points_per_q    INT  DEFAULT 100,
  UNIQUE (contest_id, round_number)
);

-- ── 4. Assignation questions → manches de championnat ────────────────
CREATE TABLE IF NOT EXISTS kp_championship_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id    UUID NOT NULL REFERENCES kp_championship_rounds(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES kp_questions(id)           ON DELETE CASCADE,
  order_num   SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN  NOT NULL DEFAULT TRUE,
  UNIQUE (round_id, question_id)
);

-- ── Index ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_kp_questions_type       ON kp_questions(type);
CREATE INDEX IF NOT EXISTS idx_kp_questions_difficulty ON kp_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_kp_questions_status     ON kp_questions(status);
CREATE INDEX IF NOT EXISTS idx_kp_q_tags_question      ON kp_question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_kp_q_tags_tag           ON kp_question_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_kp_cr_contest           ON kp_championship_rounds(contest_id);
CREATE INDEX IF NOT EXISTS idx_kp_cq_round             ON kp_championship_questions(round_id);
CREATE INDEX IF NOT EXISTS idx_kp_cq_question          ON kp_championship_questions(question_id);

-- ── Trigger updated_at ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION kp_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS kp_questions_updated_at ON kp_questions;
CREATE TRIGGER kp_questions_updated_at
  BEFORE UPDATE ON kp_questions
  FOR EACH ROW EXECUTE FUNCTION kp_set_updated_at();

-- ── Tags officiels KONEKSYON PAM ──────────────────────────────────────
INSERT INTO kp_tags (name, category, color) VALUES
  -- Testament
  ('Ancien Testament',   'testament', '#92400e'),
  ('Nouveau Testament',  'testament', '#1e40af'),
  -- Thèmes principaux
  ('Création',           'theme',     '#15803d'),
  ('Prophètes',          'theme',     '#7c3aed'),
  ('Afrique',            'theme',     '#b45309'),
  ('Daniel',             'theme',     '#0891b2'),
  ('Jésus',              'theme',     '#dc2626'),
  ('Miracles',           'theme',     '#d97706'),
  ('Psaumes',            'theme',     '#0d9488'),
  ('Prière',             'theme',     '#6366f1'),
  ('Rois',               'theme',     '#7c2d12'),
  ('Apôtres',            'theme',     '#1d4ed8'),
  ('Paraboles',          'theme',     '#4f46e5'),
  ('Résurrection',       'theme',     '#be123c'),
  ('Alliance',           'theme',     '#166534'),
  -- Personnes
  ('Moïse',              'person',    '#92400e'),
  ('Abraham',            'person',    '#78350f'),
  ('David',              'person',    '#1e3a8a'),
  ('Marie',              'person',    '#9d174d'),
  ('Paul',               'person',    '#1e40af'),
  ('Pierre',             'person',    '#1d4ed8'),
  -- Topiques
  ('Femmes de la Bible', 'topic',     '#db2777'),
  ('Enfants de la Bible','topic',     '#16a34a'),
  ('Lieux bibliques',    'topic',     '#15803d'),
  ('Livres bibliques',   'topic',     '#7c3aed'),
  ('Généalogie',         'topic',     '#92400e'),
  ('Anges',              'topic',     '#fbbf24'),
  ('Baptême',            'topic',     '#0284c7'),
  ('Foi',                'topic',     '#7c3aed'),
  ('Salut',              'topic',     '#dc2626')
ON CONFLICT (name) DO NOTHING;

-- ── Structure 15 manches standard ────────────────────────────────────
-- (à insérer pour chaque championnat via script de migration)

COMMENT ON TABLE kp_questions             IS 'Banque centrale officielle KONEKSYON PAM — source unique de vérité';
COMMENT ON TABLE kp_tags                  IS 'Tags et thèmes pour classification des questions';
COMMENT ON TABLE kp_championship_rounds   IS 'Structure des 15 manches par championnat';
COMMENT ON TABLE kp_championship_questions IS 'Assignation des questions aux manches de championnat';
