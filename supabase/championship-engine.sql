-- Championship Engine v3 — Server-Driven State Machine
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════════════════
-- 1. CENTRAL CHAMPIONSHIP STATE (1 row per active contest)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS championship_state (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id       UUID UNIQUE NOT NULL,

  phase            TEXT NOT NULL DEFAULT 'LOBBY',
  -- LOBBY | COUNTDOWN | CHAMPIONSHIP_INTRO |
  -- ROUND_INTRO | QUESTION_ACTIVE | ANSWER_REVEAL |
  -- ROUND_RESULTS | BETWEEN_ROUNDS | PODIUM | CLOSED | CANCELLED

  round_index      INT NOT NULL DEFAULT 0,
  question_index   INT NOT NULL DEFAULT 0,

  phase_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  phase_ends_at    TIMESTAMPTZ,

  player_count     INT NOT NULL DEFAULT 0,
  answer_count     INT NOT NULL DEFAULT 0,

  metadata         JSONB NOT NULL DEFAULT '{}',

  launched_by      UUID,
  launched_at      TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- 2. PLAYER ANSWERS (anti-cheat, scoring)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS championship_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id      UUID NOT NULL,
  player_id       UUID NOT NULL,

  round_index     INT NOT NULL,
  question_index  INT NOT NULL,

  answer_index    INT,
  answer_data     JSONB,
  is_correct      BOOLEAN NOT NULL DEFAULT false,

  base_points     INT NOT NULL DEFAULT 0,
  speed_bonus     INT NOT NULL DEFAULT 0,
  streak_bonus    INT NOT NULL DEFAULT 0,
  total_points    INT NOT NULL DEFAULT 0,

  server_received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  phase_ends_at   TIMESTAMPTZ,
  was_on_time     BOOLEAN NOT NULL DEFAULT true,

  UNIQUE(contest_id, player_id, round_index, question_index)
);

-- ═══════════════════════════════════════════════════════
-- 3. ROUND RESULTS
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS championship_round_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id  UUID NOT NULL,
  player_id   UUID NOT NULL,

  round_index INT NOT NULL,
  score       INT NOT NULL DEFAULT 0,
  correct     INT NOT NULL DEFAULT 0,
  total       INT NOT NULL DEFAULT 0,
  rank_round  INT,

  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(contest_id, player_id, round_index)
);

-- ═══════════════════════════════════════════════════════
-- 4. LIVE LEADERBOARD CACHE
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS championship_leaderboard (
  contest_id    UUID NOT NULL,
  player_id     UUID NOT NULL,
  player_name   TEXT NOT NULL DEFAULT 'Joueur',
  player_avatar TEXT,

  total_score   INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  rounds_played INT NOT NULL DEFAULT 0,
  current_rank  INT,

  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY(contest_id, player_id)
);

-- ═══════════════════════════════════════════════════════
-- 5. EVENTS LOG
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS championship_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id  UUID NOT NULL,
  event_type  TEXT NOT NULL,
  actor_id    UUID,
  payload     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- 6. REWARDS & BADGES
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS championship_rewards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id  UUID NOT NULL,
  player_id   UUID NOT NULL,

  badge_type  TEXT NOT NULL,
  badge_label_fr TEXT NOT NULL,
  badge_label_ht TEXT NOT NULL,
  badge_label_en TEXT NOT NULL,
  badge_icon  TEXT NOT NULL DEFAULT '🏆',

  awarded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(contest_id, player_id, badge_type)
);

-- ═══════════════════════════════════════════════════════
-- 7. INDEXES
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_championship_state_contest ON championship_state(contest_id);
CREATE INDEX IF NOT EXISTS idx_championship_state_phase ON championship_state(phase);
CREATE INDEX IF NOT EXISTS idx_championship_answers_contest_round ON championship_answers(contest_id, round_index, question_index);
CREATE INDEX IF NOT EXISTS idx_championship_answers_player ON championship_answers(player_id, contest_id);
CREATE INDEX IF NOT EXISTS idx_championship_round_results ON championship_round_results(contest_id, round_index);
CREATE INDEX IF NOT EXISTS idx_championship_leaderboard ON championship_leaderboard(contest_id, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_championship_events_contest ON championship_events(contest_id, created_at DESC);

-- ═══════════════════════════════════════════════════════
-- 8. REALTIME
-- ═══════════════════════════════════════════════════════
ALTER TABLE championship_state REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE championship_state;
ALTER PUBLICATION supabase_realtime ADD TABLE championship_leaderboard;

-- ═══════════════════════════════════════════════════════
-- 9. RLS
-- ═══════════════════════════════════════════════════════
ALTER TABLE championship_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_round_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "championship_state_read" ON championship_state FOR SELECT USING (true);
CREATE POLICY "championship_answers_own" ON championship_answers FOR SELECT USING (player_id = auth.uid());
CREATE POLICY "round_results_read" ON championship_round_results FOR SELECT USING (true);
CREATE POLICY "leaderboard_read" ON championship_leaderboard FOR SELECT USING (true);
CREATE POLICY "events_read" ON championship_events FOR SELECT USING (true);
CREATE POLICY "rewards_read" ON championship_rewards FOR SELECT USING (true);
