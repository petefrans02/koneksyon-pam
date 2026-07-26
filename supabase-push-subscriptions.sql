-- Web Push — abonnements des navigateurs/téléphones.
-- À exécuter dans l'éditeur SQL Supabase. Bloc 1 :

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now()
);

-- Bloc 2 :

create index if not exists push_subscriptions_user_id_idx on push_subscriptions(user_id);

-- Bloc 3 (les API utilisent la clé service_role, qui contourne RLS) :

alter table push_subscriptions enable row level security;
