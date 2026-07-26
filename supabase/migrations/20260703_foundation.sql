-- ══════════════════════════════════════════════════════════════════
-- KONEKSYON PAM Foundation — Tables de la fondation
-- Migration : 2026-07-03
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Projets humanitaires ────────────────────────────────────────
-- Données réelles uniquement. Aucune donnée fictive.
create table if not exists public.foundation_projects (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  description       jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  status            text not null default 'planned'
                    check (status in ('planned','active','completed','paused')),
  category          text not null
                    check (category in ('bibles','education','food','health','missions','churches','evangelism','other')),
  country           text,                       -- ISO 3166-1 alpha-2
  region            text,
  goal_amount       numeric(12,2),
  raised_amount     numeric(12,2) not null default 0,
  currency          char(3) not null default 'USD',
  beneficiaries_goal    integer,
  beneficiaries_reached integer not null default 0,
  image_url         text,
  is_public         boolean not null default false, -- false = caché jusqu'au lancement
  start_date        date,
  end_date          date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── 2. Objectifs d'impact ──────────────────────────────────────────
-- Connectables aux vraies données via triggers ou cron
create table if not exists public.impact_goals (
  id              uuid primary key default gen_random_uuid(),
  key             text unique not null,    -- ex: 'bibles_distributed'
  label           jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  icon            text not null default '📊',
  color           text not null default '#d4a017',
  goal_value      integer not null,
  current_value   integer not null default 0,
  unit            text not null,           -- ex: 'bibles', 'enfants', 'ecoles'
  unit_label      jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Valeurs initiales — objectifs 2026 (données réelles = 0 sauf plateforme)
insert into public.impact_goals
  (key, label, icon, color, goal_value, current_value, unit, unit_label, display_order)
values
  ('bibles_distributed', '{"fr":"Bibles distribuées","ht":"Bib distribye","en":"Bibles distributed","es":"Biblias distribuidas"}',
   '📖', '#60a5fa', 500, 0, 'bibles', '{"fr":"Bibles","ht":"Bib","en":"Bibles","es":"Biblias"}', 1),

  ('children_supported', '{"fr":"Enfants soutenus","ht":"Timoun sipòte","en":"Children supported","es":"Niños apoyados"}',
   '👶', '#ec4899', 200, 0, 'children', '{"fr":"enfants","ht":"timoun","en":"children","es":"niños"}', 2),

  ('schools_partnered', '{"fr":"Écoles partenaires","ht":"Lekòl patnè","en":"Partner schools","es":"Escuelas asociadas"}',
   '🏫', '#22c55e', 10, 0, 'schools', '{"fr":"écoles","ht":"lekòl","en":"schools","es":"escuelas"}', 3),

  ('disciples_trained', '{"fr":"Disciples formés","ht":"Disip fòme","en":"Disciples trained","es":"Discípulos formados"}',
   '🎓', '#7c3aed', 1000, 0, 'disciples', '{"fr":"disciples","ht":"disip","en":"disciples","es":"discípulos"}', 4),

  ('countries_reached', '{"fr":"Pays touchés","ht":"Peyi touche","en":"Countries reached","es":"Países alcanzados"}',
   '🌍', '#d4a017', 15, 12, 'countries', '{"fr":"pays","ht":"peyi","en":"countries","es":"países"}', 5),

  ('championships_held', '{"fr":"Championnats organisés","ht":"Chanpyona òganize","en":"Championships held","es":"Campeonatos realizados"}',
   '🏆', '#f59e0b', 1000, 500, 'championships', '{"fr":"championnats","ht":"chanpyona","en":"championships","es":"campeonatos"}', 6)
on conflict (key) do nothing;

-- ── 3. Dons réels ──────────────────────────────────────────────────
-- Alimenté par les webhooks PayPal / Stripe. Jamais de données fictives.
create table if not exists public.donations (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid references public.foundation_projects(id) on delete set null,
  amount              numeric(10,2) not null check (amount > 0),
  currency            char(3) not null default 'USD',
  donor_name          text,                        -- NULL si anonyme
  donor_email         text,                        -- NULL si anonyme
  paypal_order_id     text unique,
  stripe_payment_id   text unique,
  status              text not null default 'pending'
                      check (status in ('pending','completed','refunded','failed')),
  is_anonymous        boolean not null default false,
  message             text,
  created_at          timestamptz not null default now()
);

-- ── 4. Rapports annuels ────────────────────────────────────────────
create table if not exists public.foundation_reports (
  id              uuid primary key default gen_random_uuid(),
  year            smallint not null unique,
  title           jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  summary         jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  pdf_url         text,                  -- Supabase Storage
  is_published    boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- ── 5. Membres du conseil d'administration ─────────────────────────
create table if not exists public.board_members (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  role            jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  bio             jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  avatar_url      text,
  country         text,
  is_active       boolean not null default true,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ── 6. Partenaires ─────────────────────────────────────────────────
create table if not exists public.partners (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  logo_url        text,
  website         text,
  description     jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  category        text,                  -- 'church', 'ngo', 'school', 'media', 'other'
  country         text,
  is_active       boolean not null default true,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ── 7. Documents officiels ─────────────────────────────────────────
create table if not exists public.foundation_documents (
  id              uuid primary key default gen_random_uuid(),
  title           jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  category        text not null          -- 'statuts', 'registre', 'tax', 'audit', 'rapport'
                  check (category in ('statuts','registre','tax','audit','rapport','autre')),
  file_url        text,                  -- Supabase Storage
  is_public       boolean not null default false,
  issued_date     date,
  created_at      timestamptz not null default now()
);

-- ── 8. Missions terrain ────────────────────────────────────────────
create table if not exists public.missions (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  description     jsonb not null default '{"fr":"","ht":"","en":"","es":""}',
  country         text not null,
  region          text,
  status          text not null default 'planned'
                  check (status in ('planned','active','completed')),
  team_size       integer,
  start_date      date,
  end_date        date,
  is_public       boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ── 9. Progression Académie ────────────────────────────────────────
create table if not exists public.academy_enrollments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  study_slug          text not null,
  completed_sections  jsonb not null default '[]',
  score               integer not null default 0,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  unique (user_id, study_slug)
);

-- ── 10. Certificats ───────────────────────────────────────────────
create table if not exists public.academy_certificates (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  study_slug        text not null,
  certificate_code  text unique not null,   -- code vérifiable publiquement
  issued_at         timestamptz not null default now(),
  unique (user_id, study_slug)
);

-- ── Triggers updated_at ───────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger foundation_projects_updated_at
  before update on public.foundation_projects
  for each row execute procedure public.set_updated_at();

create trigger impact_goals_updated_at
  before update on public.impact_goals
  for each row execute procedure public.set_updated_at();

-- ── RLS — sécurité ────────────────────────────────────────────────
alter table public.foundation_projects      enable row level security;
alter table public.impact_goals             enable row level security;
alter table public.donations                enable row level security;
alter table public.foundation_reports       enable row level security;
alter table public.board_members            enable row level security;
alter table public.partners                 enable row level security;
alter table public.foundation_documents     enable row level security;
alter table public.missions                 enable row level security;
alter table public.academy_enrollments      enable row level security;
alter table public.academy_certificates     enable row level security;

-- Lecture publique : projets/goals/rapports/membres/partenaires publiés
create policy "public_read_projects" on public.foundation_projects
  for select using (is_public = true);

create policy "public_read_goals" on public.impact_goals
  for select using (is_active = true);

create policy "public_read_reports" on public.foundation_reports
  for select using (is_published = true);

create policy "public_read_board" on public.board_members
  for select using (is_active = true);

create policy "public_read_partners" on public.partners
  for select using (is_active = true);

create policy "public_read_docs" on public.foundation_documents
  for select using (is_public = true);

create policy "public_read_missions" on public.missions
  for select using (is_public = true);

-- Académie : l'utilisateur lit/écrit ses propres données
create policy "user_own_enrollment" on public.academy_enrollments
  for all using (auth.uid() = user_id);

create policy "user_own_certificate" on public.academy_certificates
  for select using (auth.uid() = user_id);

-- Dons : l'utilisateur voit ses propres dons
create policy "user_own_donations" on public.donations
  for select using (auth.uid()::text = donor_email or is_anonymous = true);

-- Admins : accès complet via service role (géré côté serveur)

-- ── Newsletter subscribers ────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  first_name    text,
  last_name     text,
  lang          char(2) not null default 'fr',
  subscribed_at timestamptz not null default now(),
  is_active     boolean not null default true
);

alter table public.newsletter_subscribers enable row level security;

-- Seul le service role peut lire/écrire (admin uniquement)
-- Insertion publique via service role dans la route API
