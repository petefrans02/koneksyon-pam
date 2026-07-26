-- KONEKSYON PAM — Leçons dynamiques (ajoutées « à chaud » pour garder les cours à jour).
-- Les cours de base sont des fichiers statiques (lib/courses/*). Cette table stocke
-- les NOUVELLES leçons générées périodiquement (par IA via le cron) et affichées
-- en plus des leçons statiques, dans un module « Mises à jour ».

create table if not exists course_lessons (
  id           uuid primary key default gen_random_uuid(),
  course_slug  text not null,               -- doit correspondre à un slug de lib/academy-data.ts
  module_title jsonb not null,              -- { fr, ht, en, es }
  title        jsonb not null,              -- { fr, ht, en, es }
  content      jsonb not null,              -- { fr, ht, en, es }  (paragraphes séparés par \n\n)
  key_points   jsonb,                       -- { fr: string[], ht: [], en: [], es: [] }
  exercise     jsonb,                       -- { fr, ht, en, es }
  verse        text,                        -- référence biblique (cours bibliques), optionnel
  video_id     text default '',
  published    boolean default true,
  created_at   timestamptz default now()
);

create index if not exists course_lessons_slug_idx on course_lessons (course_slug);

-- Lecture publique des leçons publiées (RLS).
alter table course_lessons enable row level security;

drop policy if exists "course_lessons public read" on course_lessons;
create policy "course_lessons public read"
  on course_lessons for select
  using (published = true);
