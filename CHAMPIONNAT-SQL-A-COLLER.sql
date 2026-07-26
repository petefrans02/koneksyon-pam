-- ══════════════════════════════════════════════════════════════════════════
-- CHAMPIONNAT BIBLIQUE KONEKSYON PAM
-- Supabase → SQL Editor → coller TOUT ce fichier → Run
-- Version sûre : aucune clé étrangère, aucun index (rien qui puisse bloquer).
-- ══════════════════════════════════════════════════════════════════════════

create table if not exists champ_seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contest_id uuid,
  status text not null default 'draft',
  players_per_team int not null default 10,
  num_groups int not null default 4,
  teams_per_group int not null default 4,
  qualifiers_per_group int not null default 2,
  ai_fill boolean not null default true,
  ai_difficulty text not null default 'mixed',
  scope text not null default 'global',
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists champ_teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null,
  name text not null,
  number int,
  color text,
  logo_seed text,
  group_label text,
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

create table if not exists champ_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null,
  season_id uuid not null,
  user_id uuid,
  is_ai boolean not null default false,
  name text not null,
  avatar text,
  country text,
  level text,
  skill numeric not null default 0.6,
  speed numeric not null default 0.6,
  created_at timestamptz not null default now()
);

create table if not exists champ_matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null,
  stage text not null,
  group_label text,
  round_number int,
  slot int,
  team_a uuid,
  team_b uuid,
  score_a numeric,
  score_b numeric,
  winner uuid,
  status text not null default 'scheduled',
  played_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists champ_player_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  team_id uuid not null,
  member_id uuid not null,
  correct int not null default 0,
  total_q int not null default 0,
  avg_time numeric not null default 0,
  score numeric not null default 0,
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);
