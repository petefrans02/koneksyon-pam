create table if not exists tc_signaux (
  id uuid primary key default gen_random_uuid(),
  numero bigserial unique,
  marche text not null references tc_marches(code),
  sens text not null check (sens in ('BUY','SELL')),
  confiance int not null check (confiance between 0 and 100),
  prix_actuel numeric not null,
  zone_bas numeric not null,
  zone_haut numeric not null,
  entree numeric not null,
  stop numeric not null,
  tp1 numeric not null,
  tp2 numeric,
  tp3 numeric,
  rr numeric not null,
  duree_texte text,
  duree_minutes int,
  tendance text not null,
  session text not null,
  unite text not null,
  unites jsonb,
  indicateurs jsonb,
  raison text not null,
  explication_ia text,
  drapeaux_ia jsonb,
  capture_url text,
  statut text not null default 'actif' check (statut in ('actif','tp1','tp2','tp3','gagne','perdu','annule','expire')),
  resultat text check (resultat in ('gagne','perdu','neutre')),
  prix_sortie numeric,
  pips numeric,
  r_realise numeric,
  notes_suivi text,
  publie_le timestamptz not null default now(),
  cloture_le timestamptz
);

create index if not exists tc_signaux_publie_idx on tc_signaux(publie_le desc);
create index if not exists tc_signaux_marche_idx on tc_signaux(marche, publie_le desc);

alter table tc_signaux enable row level security;
