create table if not exists tc_config (
  cle text primary key,
  valeur jsonb not null,
  maj_le timestamptz not null default now()
);

alter table tc_config enable row level security;

insert into tc_config (cle, valeur) values
  ('seuil_confiance','90'::jsonb),
  ('ia_active','true'::jsonb),
  ('ia_modele','"claude-sonnet-5"'::jsonb),
  ('delai_gratuit_min','60'::jsonb),
  ('historique_gratuit','5'::jsonb),
  ('max_signaux_jour','4'::jsonb),
  ('anti_doublon_min','90'::jsonb),
  ('rr_minimum','1.5'::jsonb),
  ('sessions_autorisees','["londres","new-york","chevauchement"]'::jsonb)
on conflict (cle) do nothing;

drop policy if exists "tc_abo_lecture_propre" on tc_abonnements;
create policy "tc_abo_lecture_propre" on tc_abonnements for select using (auth.uid() = user_id);

drop policy if exists "tc_reglages_propre" on tc_reglages;
create policy "tc_reglages_propre" on tc_reglages for all using (auth.uid() = user_id);
