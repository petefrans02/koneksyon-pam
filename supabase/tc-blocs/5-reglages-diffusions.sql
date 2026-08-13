create table if not exists tc_reglages (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marches text[] not null default array['XAUUSD'],
  canal_app boolean not null default true,
  canal_email boolean not null default true,
  canal_push boolean not null default true,
  canal_telegram boolean not null default false,
  telegram_chat_id text,
  canal_sms boolean not null default false,
  telephone text,
  risque_pct numeric not null default 1 check (risque_pct > 0 and risque_pct <= 10),
  capital numeric,
  langue text not null default 'fr',
  fuseau text not null default 'America/New_York',
  theme text not null default 'sombre',
  maj_le timestamptz not null default now()
);

alter table tc_reglages enable row level security;

create table if not exists tc_diffusions (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references tc_signaux(id) on delete cascade,
  canal text not null,
  cibles int not null default 0,
  envoyes int not null default 0,
  echecs int not null default 0,
  erreur text,
  ms int,
  cree_le timestamptz not null default now()
);

create index if not exists tc_diffusions_signal_idx on tc_diffusions(signal_id);

alter table tc_diffusions enable row level security;
