-- KONEKSYON PAM — Quiz du Jour (généré par IA chaque jour).
-- La page /quiz affiche le "Défi du Jour" : si une entrée du jour existe ici,
-- elle est utilisée ; sinon repli sur une sélection déterministe locale.

create table if not exists daily_quiz (
  id         uuid primary key default gen_random_uuid(),
  quiz_date  date not null unique,
  questions  jsonb not null,          -- QuizQuestion[] { question, options, correct, explanation, verse }
  created_at timestamptz default now()
);

alter table daily_quiz enable row level security;

drop policy if exists "daily_quiz public read" on daily_quiz;
create policy "daily_quiz public read" on daily_quiz for select using (true);
