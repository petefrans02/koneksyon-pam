-- Certificats de participation — un par élève et par parcours terminé.
-- À exécuter dans l'éditeur SQL Supabase, bloc par bloc.

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null,
  holder_name text not null,
  program text not null,
  level text,
  lessons_done integer default 0,
  xp integer default 0,
  paid boolean default false,
  issued_at timestamptz default now()
);

create index if not exists certificates_user_idx on certificates(user_id);

alter table certificates enable row level security;
