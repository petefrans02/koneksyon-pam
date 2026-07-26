-- Game questions table: stores editable content for quiz & jeu sections
CREATE TABLE IF NOT EXISTS game_questions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  section     TEXT        NOT NULL,   -- 'quiz' | 'jeu'
  level_id    INT,                    -- quiz: 1-5, jeu: null
  q_index     INT         NOT NULL DEFAULT 0,
  type        TEXT        NOT NULL,   -- 'mcq' | 'fill' | 'tf' | 'verse' | 'speaker'
  data        JSONB       NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS game_questions_section_idx ON game_questions(section, level_id, q_index);
