-- Discussions communautaires générées quotidiennement (amorce vivante jusqu'à l'arrivée de vrais membres).
-- À exécuter dans l'éditeur SQL de Supabase.

create table if not exists community_discussions (
  id           uuid primary key default gen_random_uuid(),
  topic        jsonb not null,          -- { fr, ht, en, es }
  category     jsonb not null,          -- { fr, ht, en, es }
  accent       text  not null default '#16a34a',
  icon         text  not null default 'message',
  messages     jsonb not null,          -- [{ author, color, flag, time, likes, replyTo?, text:{fr,ht,en,es} }]
  participants int   not null default 3,
  created_at   timestamptz not null default now()
);

create index if not exists idx_community_discussions_created on community_discussions (created_at desc);

-- Lecture publique (les discussions sont visibles par tous).
alter table community_discussions enable row level security;

drop policy if exists "public read discussions" on community_discussions;
create policy "public read discussions" on community_discussions
  for select using (true);

-- Les insertions se font côté serveur avec la service role key (le cron), qui contourne la RLS.
