-- Cours d'anglais biblique : progression des apprenants.
-- À exécuter dans l'éditeur SQL Supabase, bloc par bloc.

create table if not exists english_progress (
  user_id uuid primary key,
  xp integer default 0,
  streak integer default 0,
  last_day date,
  done text[] default '{}',
  updated_at timestamptz default now()
);

alter table english_progress enable row level security;
