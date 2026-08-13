create table if not exists tc_evenements (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references tc_signaux(id) on delete cascade,
  type text not null,
  prix numeric,
  note text,
  auteur text not null default 'systeme',
  cree_le timestamptz not null default now()
);

create index if not exists tc_evenements_signal_idx on tc_evenements(signal_id, cree_le);

alter table tc_evenements enable row level security;

create table if not exists tc_abonnements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free','premium')),
  debut timestamptz not null default now(),
  fin timestamptz,
  source text not null default 'manuel',
  reference text,
  maj_le timestamptz not null default now()
);

create index if not exists tc_abonnements_plan_idx on tc_abonnements(plan, fin);

alter table tc_abonnements enable row level security;
