-- Réponses des membres aux débats/discussions de la communauté.
-- À exécuter dans Supabase → SQL Editor.

create table if not exists discussion_replies (
  id            uuid primary key default gen_random_uuid(),
  discussion_id text not null,        -- id du débat (uuid des discussions IA OU slug des débats d'amorce)
  author_name   text not null,
  author_id     uuid,                 -- auth.uid() de l'auteur (null si indéterminé)
  text          text not null check (char_length(text) between 1 and 2000),
  likes         int  not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists idx_discussion_replies_disc on discussion_replies (discussion_id, created_at);

alter table discussion_replies enable row level security;

-- Lecture publique.
drop policy if exists "public read replies" on discussion_replies;
create policy "public read replies" on discussion_replies
  for select using (true);

-- Insertion réservée aux utilisateurs connectés (leur propre message).
drop policy if exists "authenticated insert replies" on discussion_replies;
create policy "authenticated insert replies" on discussion_replies
  for insert to authenticated
  with check (auth.uid() = author_id);
