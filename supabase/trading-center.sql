-- =====================================================================
-- KONEKSYON PAM — TRADING CENTER
-- À exécuter une fois dans Supabase → SQL Editor.
--
-- Toutes les tables sont préfixées `tc_` : le schéma du Trading Center est
-- isolé du reste de la plateforme, on peut le lire, le sauvegarder ou le
-- supprimer sans jamais toucher aux concours, aux dons ou à l'académie.
--
-- RLS est activé partout SANS politique de lecture publique. Les API du site
-- passent par la clé service_role, qui contourne RLS — c'est la convention
-- déjà en place (voir supabase-push-subscriptions.sql). Conséquence voulue :
-- personne ne peut lire un signal en tapant directement l'API Supabase avec
-- la clé anon. Le délai du plan gratuit serait sinon contournable en une
-- requête, et l'offre Premium ne vaudrait plus rien.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. LES MARCHÉS
--
-- Le registre vit en base et non dans le code : ajouter le NASDAQ ou le
-- BTC/USD plus tard doit être une ligne SQL et un script Pine, pas un
-- déploiement. `actif` commande tout — un marché inactif est visible dans
-- l'admin, invisible pour les utilisateurs, et ses alertes sont refusées.
-- ---------------------------------------------------------------------
create table if not exists tc_marches (
  code        text        primary key,              -- 'XAUUSD' — ce que le webhook envoie
  paire       text        not null,                 -- 'XAU/USD' — ce qu'on affiche
  nom_fr      text        not null,
  nom_en      text        not null,
  categorie   text        not null,                 -- metal | indice | crypto | forex | action
  symbole_tv  text        not null,                 -- 'OANDA:XAUUSD' — pour le widget TradingView
  decimales   int         not null default 2,       -- précision d'affichage des prix
  pip         numeric     not null default 0.1,     -- valeur d'un pip, pour compter les gains
  actif       boolean     not null default false,
  ordre       int         not null default 100,
  cree_le     timestamptz not null default now()
);

-- Le premier marché, et le seul actif au lancement.
insert into tc_marches (code, paire, nom_fr, nom_en, categorie, symbole_tv, decimales, pip, actif, ordre)
values ('XAUUSD', 'XAU/USD', 'Or / Dollar américain', 'Gold / US Dollar', 'metal', 'OANDA:XAUUSD', 2, 0.1, true, 1)
on conflict (code) do nothing;

-- Les suivants sont déjà déclarés, mais éteints. Les allumer sera un
-- `update tc_marches set actif = true where code = '...'` dans l'admin.
insert into tc_marches (code, paire, nom_fr, nom_en, categorie, symbole_tv, decimales, pip, actif, ordre) values
  ('SPY',    'SPY',     'ETF S&P 500',        'S&P 500 ETF',        'action', 'AMEX:SPY',           2, 0.01,  false, 10),
  ('QQQ',    'QQQ',     'ETF Nasdaq 100',     'Nasdaq 100 ETF',     'action', 'NASDAQ:QQQ',         2, 0.01,  false, 11),
  ('NAS100', 'NAS100',  'Nasdaq 100',         'Nasdaq 100',         'indice', 'CAPITALCOM:US100',   1, 1,     false, 12),
  ('US30',   'US30',    'Dow Jones 30',       'Dow Jones 30',       'indice', 'CAPITALCOM:US30',    1, 1,     false, 13),
  ('BTCUSD', 'BTC/USD', 'Bitcoin / Dollar',   'Bitcoin / US Dollar','crypto', 'BITSTAMP:BTCUSD',    2, 1,     false, 20),
  ('ETHUSD', 'ETH/USD', 'Ethereum / Dollar',  'Ethereum / US Dollar','crypto','BITSTAMP:ETHUSD',    2, 0.1,   false, 21),
  ('EURUSD', 'EUR/USD', 'Euro / Dollar',      'Euro / US Dollar',   'forex',  'OANDA:EURUSD',       5, 0.0001,false, 30),
  ('GBPUSD', 'GBP/USD', 'Livre / Dollar',     'Pound / US Dollar',  'forex',  'OANDA:GBPUSD',       5, 0.0001,false, 31)
on conflict (code) do nothing;

alter table tc_marches enable row level security;


-- ---------------------------------------------------------------------
-- 2. LES ALERTES BRUTES
--
-- Tout ce qui frappe le webhook est écrit ici AVANT d'être jugé, y compris
-- ce qu'on refuse. C'est ce qui permet, un mois plus tard, de répondre à la
-- seule question qui compte quand un signal manque : « l'alerte est-elle
-- arrivée, et pourquoi a-t-elle été écartée ? »
--
-- Sans cette table, un rejet est indiscernable d'une panne de TradingView.
-- ---------------------------------------------------------------------
create table if not exists tc_alertes (
  id         uuid        primary key default gen_random_uuid(),
  recu_le    timestamptz not null default now(),
  marche     text,
  source     text        not null default 'tradingview',
  charge     jsonb       not null,                  -- la charge utile complète, telle que reçue
  statut     text        not null,                  -- voir StatutAlerte dans lib/trading-center/types.ts
  raison     text,                                  -- pourquoi elle a été écartée, en clair
  score_brut int,                                   -- score déterministe, avant IA
  score_ia   int,                                   -- score après arbitrage de l'IA
  signal_id  uuid,                                  -- rempli seulement si publiée
  ms         int                                    -- temps de traitement, pour surveiller la latence
);
create index if not exists tc_alertes_recu_idx   on tc_alertes(recu_le desc);
create index if not exists tc_alertes_statut_idx on tc_alertes(statut, recu_le desc);
alter table tc_alertes enable row level security;


-- ---------------------------------------------------------------------
-- 3. LES SIGNAUX
--
-- Un signal publié ne se modifie plus, sauf par son cycle de vie (TP touché,
-- SL touché, clôture). Les prix sont en `numeric` et jamais en `float` : sur
-- un stop à 2 043,17 la virgule flottante binaire perd le compte, et un
-- relevé de performance qui dérive d'un centime par ligne ne vaut rien.
-- ---------------------------------------------------------------------
create table if not exists tc_signaux (
  id             uuid        primary key default gen_random_uuid(),
  numero         bigserial   unique,                  -- « Signal #47 », lisible par un humain
  marche         text        not null references tc_marches(code),

  sens           text        not null check (sens in ('BUY','SELL')),
  confiance      int         not null check (confiance between 0 and 100),

  prix_actuel    numeric     not null,
  zone_bas       numeric     not null,                -- zone d'entrée : borne basse
  zone_haut      numeric     not null,                -- zone d'entrée : borne haute
  entree         numeric     not null,                -- entrée préférentielle
  stop           numeric     not null,
  tp1            numeric     not null,
  tp2            numeric,
  tp3            numeric,
  rr             numeric     not null,                -- risque/rendement calculé sur TP2, sinon TP1

  duree_texte    text,                                -- « 4 à 8 heures »
  duree_minutes  int,                                 -- pour l'expiration automatique
  tendance       text        not null,                -- haussiere | baissiere | range
  session        text        not null,                -- asie | londres | new-york | chevauchement | hors-session
  unite          text        not null,                -- unité d'entrée : '15M'

  unites         jsonb,                               -- lecture unité par unité (D, 4H, 1H, 30M, 15M, 5M, 1M)
  indicateurs    jsonb,                               -- instantané complet envoyé par TradingView
  raison         text        not null,                -- pourquoi on entre — critères, pas prose
  explication_ia text,                                -- l'explication rédigée par l'IA
  drapeaux_ia    jsonb,                               -- risques détectés et écartés
  capture_url    text,                                -- capture TradingView, si l'alerte en fournit une

  statut         text        not null default 'actif' -- actif | tp1 | tp2 | tp3 | gagne | perdu | annule | expire
                             check (statut in ('actif','tp1','tp2','tp3','gagne','perdu','annule','expire')),
  resultat       text        check (resultat in ('gagne','perdu','neutre')),
  prix_sortie    numeric,
  pips           numeric,                             -- gain/perte en pips
  r_realise      numeric,                             -- multiple de R réellement obtenu
  notes_suivi    text,

  publie_le      timestamptz not null default now(),
  cloture_le     timestamptz
);
create index if not exists tc_signaux_publie_idx  on tc_signaux(publie_le desc);
create index if not exists tc_signaux_marche_idx  on tc_signaux(marche, publie_le desc);
create index if not exists tc_signaux_actifs_idx  on tc_signaux(statut) where statut in ('actif','tp1','tp2');
alter table tc_signaux enable row level security;


-- ---------------------------------------------------------------------
-- 4. LE FIL DE VIE D'UN SIGNAL
--
-- Une ligne par événement : publication, TP1 touché, stop remonté à
-- l'équilibre, clôture. C'est ce fil qui rend le journal honnête — un signal
-- dont on ne garderait que le résultat final ne dirait pas s'il est passé à
-- deux doigts du stop avant de gagner.
-- ---------------------------------------------------------------------
create table if not exists tc_evenements (
  id        uuid        primary key default gen_random_uuid(),
  signal_id uuid        not null references tc_signaux(id) on delete cascade,
  type      text        not null,                    -- publie | tp1 | tp2 | tp3 | stop | equilibre | annule | expire | note
  prix      numeric,
  note      text,
  auteur    text        not null default 'systeme',  -- systeme | tradingview | admin
  cree_le   timestamptz not null default now()
);
create index if not exists tc_evenements_signal_idx on tc_evenements(signal_id, cree_le);
alter table tc_evenements enable row level security;


-- ---------------------------------------------------------------------
-- 5. LES ABONNEMENTS
--
-- Deux plans seulement. `fin` à NULL sur un premium = accès à vie (offert,
-- ou compte de test). Un premium expiré n'est pas supprimé : il redevient
-- gratuit et garde son historique, ce qui rend le retour en arrière possible.
-- ---------------------------------------------------------------------
create table if not exists tc_abonnements (
  user_id   uuid        primary key references auth.users(id) on delete cascade,
  email     text,                                     -- pour l'envoi d'emails sans jointure
  plan      text        not null default 'free' check (plan in ('free','premium')),
  debut     timestamptz not null default now(),
  fin       timestamptz,                              -- NULL = illimité
  source    text        not null default 'manuel',    -- paypal | manuel | offert
  reference text,                                     -- identifiant de la transaction PayPal
  maj_le    timestamptz not null default now()
);
create index if not exists tc_abonnements_plan_idx on tc_abonnements(plan, fin);
alter table tc_abonnements enable row level security;
create policy "tc_abo_lecture_propre" on tc_abonnements for select using (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 6. LES RÉGLAGES UTILISATEUR
-- ---------------------------------------------------------------------
create table if not exists tc_reglages (
  user_id          uuid        primary key references auth.users(id) on delete cascade,
  marches          text[]      not null default array['XAUUSD'],
  canal_app        boolean     not null default true,
  canal_email      boolean     not null default true,
  canal_push       boolean     not null default true,
  canal_telegram   boolean     not null default false,
  telegram_chat_id text,
  canal_sms        boolean     not null default false,
  telephone        text,
  risque_pct       numeric     not null default 1 check (risque_pct > 0 and risque_pct <= 10),
  capital          numeric,                            -- sert à calculer la taille de position
  langue           text        not null default 'fr',
  fuseau           text        not null default 'America/New_York',
  theme            text        not null default 'sombre',
  maj_le           timestamptz not null default now()
);
alter table tc_reglages enable row level security;
create policy "tc_reglages_propre" on tc_reglages for all using (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 7. LE JOURNAL DES DIFFUSIONS
--
-- Une ligne par canal et par signal. C'est la parade au piège déjà rencontré
-- sur les notifications de la plateforme : sans ce relevé, une configuration
-- SMTP absente produit un « envoyé » parfaitement rassurant alors que rien
-- n'est parti. Ici, `envoyes = 0` avec une `erreur` remplie se voit.
-- ---------------------------------------------------------------------
create table if not exists tc_diffusions (
  id        uuid        primary key default gen_random_uuid(),
  signal_id uuid        not null references tc_signaux(id) on delete cascade,
  canal     text        not null,                    -- app | email | push | telegram | sms
  cibles    int         not null default 0,
  envoyes   int         not null default 0,
  echecs    int         not null default 0,
  erreur    text,
  ms        int,
  cree_le   timestamptz not null default now()
);
create index if not exists tc_diffusions_signal_idx on tc_diffusions(signal_id);
alter table tc_diffusions enable row level security;


-- ---------------------------------------------------------------------
-- 8. LA CONFIGURATION
--
-- Un magasin clé/valeur plutôt que des colonnes : le seuil de confiance, le
-- modèle d'IA ou le délai du plan gratuit doivent pouvoir changer depuis
-- l'admin en production, sans migration ni déploiement.
-- ---------------------------------------------------------------------
create table if not exists tc_config (
  cle    text        primary key,
  valeur jsonb       not null,
  maj_le timestamptz not null default now()
);

insert into tc_config (cle, valeur) values
  ('seuil_confiance',      '90'::jsonb),           -- % minimum pour publier
  ('ia_active',            'true'::jsonb),         -- filtre IA activé
  ('ia_modele',            '"claude-sonnet-5"'::jsonb),
  ('delai_gratuit_min',    '60'::jsonb),           -- retard du plan gratuit, en minutes
  ('historique_gratuit',   '5'::jsonb),            -- nb de signaux passés visibles en gratuit
  ('max_signaux_jour',     '4'::jsonb),            -- garde-fou anti-spam, par marché
  ('anti_doublon_min',     '90'::jsonb),           -- délai minimal entre 2 signaux du même marché
  ('rr_minimum',           '1.5'::jsonb),          -- risque/rendement en dessous duquel on refuse
  ('sessions_autorisees',  '["londres","new-york","chevauchement"]'::jsonb)
on conflict (cle) do nothing;

alter table tc_config enable row level security;


-- ---------------------------------------------------------------------
-- 9. VUE DE PERFORMANCE
--
-- Le journal se calcule en TypeScript (lib/trading-center/journal.ts) pour
-- rester testable, mais cette vue donne le même chiffre en une requête —
-- utile pour vérifier à la main que le code ne raconte pas d'histoires.
-- ---------------------------------------------------------------------
create or replace view tc_performance as
select
  marche,
  count(*)                                                      as total,
  count(*) filter (where resultat = 'gagne')                    as gagnes,
  count(*) filter (where resultat = 'perdu')                    as perdus,
  round(100.0 * count(*) filter (where resultat = 'gagne')
        / nullif(count(*) filter (where resultat in ('gagne','perdu')), 0), 1) as taux_reussite,
  round(avg(confiance), 1)                                      as confiance_moyenne,
  round(sum(r_realise) filter (where r_realise is not null), 2)  as r_cumule,
  round(avg(rr), 2)                                             as rr_moyen
from tc_signaux
where statut not in ('annule')
group by marche;
