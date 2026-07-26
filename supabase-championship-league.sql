-- ══════════════════════════════════════════════════════════════════════════
-- CHAMPIONNAT BIBLIQUE KONEKSYON PAM — moteur de compétition (type Coupe du Monde)
-- Schéma normalisé et évolutif. À exécuter une fois dans Supabase → SQL Editor.
-- Sélectionner TOUT le fichier puis Run.
-- ══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- SAISONS / CHAMPIONNATS
create table if not exists champ_seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contest_id uuid,
  status text not null default 'draft',             -- draft | group_stage | knockout | finished
  players_per_team int not null default 10,
  num_groups int not null default 4,
  teams_per_group int not null default 4,
  qualifiers_per_group int not null default 2,
  ai_fill boolean not null default true,
  ai_difficulty text not null default 'mixed',      -- easy | medium | hard | mixed
  scope text not null default 'global',             -- global | national | church (évolutif)
  created_at timestamptz not null default now(),
  created_by uuid
);

-- EQUIPES
create table if not exists champ_teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references champ_seasons(id) on delete cascade,
  name text not null,
  number int,
  color text,
  logo_seed text,
  group_label text,                                 -- 'A','B','C',...
  played int not null default 0,
  won int not null default 0,
  drawn int not null default 0,
  lost int not null default 0,
  points int not null default 0,
  correct_total int not null default 0,
  score_for numeric not null default 0,
  score_against numeric not null default 0,
  avg_time numeric not null default 0,
  eliminated boolean not null default false,
  final_rank int,
  created_at timestamptz not null default now()
);

-- MEMBRES (joueurs réels + joueurs IA)
create table if not exists champ_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references champ_teams(id) on delete cascade,
  season_id uuid not null references champ_seasons(id) on delete cascade,
  user_id uuid,                                     -- null si IA
  is_ai boolean not null default false,
  name text not null,
  avatar text,
  country text,
  level text,                                       -- debutant | moyen | fort | expert
  skill numeric not null default 0.6,              -- 0..1 : prob. de bonne réponse
  speed numeric not null default 0.6,              -- 0..1 : rapidité
  created_at timestamptz not null default now()
);

-- MATCHS
create table if not exists champ_matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references champ_seasons(id) on delete cascade,
  stage text not null,                              -- group | r16 | quarter | semi | final | third
  group_label text,
  round_number int,
  slot int,
  team_a uuid,
  team_b uuid,
  score_a numeric,
  score_b numeric,
  winner uuid,
  status text not null default 'scheduled',         -- scheduled | live | done
  played_at timestamptz,
  created_at timestamptz not null default now()
);

-- RESULTATS PAR JOUEUR (détail d'un match)
create table if not exists champ_player_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references champ_matches(id) on delete cascade,
  team_id uuid not null,
  member_id uuid not null,
  correct int not null default 0,
  total_q int not null default 0,
  avg_time numeric not null default 0,
  score numeric not null default 0,
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

-- INDEX
create index if not exists champ_teams_season_idx on champ_teams (season_id);
create index if not exists champ_teams_group_idx on champ_teams (season_id, group_label);
create index if not exists champ_members_team_idx on champ_members (team_id);
create index if not exists champ_members_user_idx on champ_members (season_id, user_id);
create index if not exists champ_matches_season_idx on champ_matches (season_id);
create index if not exists champ_matches_stage_idx on champ_matches (season_id, stage);
create index if not exists champ_pr_match_idx on champ_player_results (match_id);
