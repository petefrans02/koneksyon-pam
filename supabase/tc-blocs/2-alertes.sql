create table if not exists tc_alertes (
  id uuid primary key default gen_random_uuid(),
  recu_le timestamptz not null default now(),
  marche text,
  source text not null default 'tradingview',
  charge jsonb not null,
  statut text not null,
  raison text,
  score_brut int,
  score_ia int,
  signal_id uuid,
  ms int
);

create index if not exists tc_alertes_recu_idx on tc_alertes(recu_le desc);
create index if not exists tc_alertes_statut_idx on tc_alertes(statut, recu_le desc);

alter table tc_alertes enable row level security;
