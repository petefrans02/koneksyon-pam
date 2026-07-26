-- ─────────────────────────────────────────────────────────────────────────
-- CONCOURS AVANCÉ PAR ÉQUIPES (églises / associations / cellules)
-- À exécuter une seule fois dans Supabase → SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Type de concours : 'simple' (existant) ou 'advanced' (par équipes)
alter table contests add column if not exists contest_type text not null default 'simple';

-- 2) Équipes (une par église/association, propre à chaque concours)
create table if not exists contest_teams (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references contests(id) on delete cascade,
  name text not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

-- Un même nom d'équipe ne peut exister qu'une fois par concours (insensible à la casse)
create unique index if not exists contest_teams_unique_name
  on contest_teams (contest_id, lower(name));

create index if not exists contest_teams_contest_idx on contest_teams (contest_id);

-- 3) L'équipe du joueur dans le classement (points additionnés par équipe)
alter table championship_leaderboard add column if not exists team_id uuid;
create index if not exists championship_leaderboard_team_idx on championship_leaderboard (team_id);
