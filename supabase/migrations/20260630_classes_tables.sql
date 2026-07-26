-- ─────────────────────────────────────────────────────────────────────────────
-- Migration : Tables pour le système de classes (Phase 2 - Académie)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Table des classes (créées par les enseignants)
CREATE TABLE IF NOT EXISTS classes (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  subject       TEXT        NOT NULL DEFAULT 'bible'
                              CHECK (subject IN ('bible','maths','sciences','histoire','langues','arts','tech','sante')),
  school_level  TEXT        CHECK (school_level IN ('primaire-1','primaire-2','secondaire-1','secondaire-2')),
  school_name   TEXT,
  description   TEXT,
  join_code     TEXT        UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des membres (élèves inscrits dans une classe)
CREATE TABLE IF NOT EXISTS class_members (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id      UUID        NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name  TEXT,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- 3. Index de performance
CREATE INDEX IF NOT EXISTS idx_classes_teacher     ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_join_code   ON classes(join_code);
CREATE INDEX IF NOT EXISTS idx_class_members_class ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_student ON class_members(student_id);

-- 4. Row Level Security
ALTER TABLE classes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;

-- Classes : l'enseignant gère ses propres classes
CREATE POLICY "teacher_manage_own_classes" ON classes
  FOR ALL USING (auth.uid() = teacher_id);

-- Classes : les membres peuvent lire leurs classes
CREATE POLICY "members_read_class" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_id = classes.id AND student_id = auth.uid()
    )
  );

-- Classes : lookup par code (pour rejoindre) — lecture publique du nom/sujet
CREATE POLICY "public_read_by_code" ON classes
  FOR SELECT USING (true);

-- Membres : l'enseignant lit les membres de ses classes
CREATE POLICY "teacher_read_members" ON class_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = class_members.class_id AND teacher_id = auth.uid()
    )
  );

-- Membres : un élève voit ses propres inscriptions
CREATE POLICY "student_read_own" ON class_members
  FOR SELECT USING (auth.uid() = student_id);

-- Membres : un élève peut rejoindre une classe (INSERT)
CREATE POLICY "student_join_class" ON class_members
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Membres : un élève peut quitter une classe (DELETE)
CREATE POLICY "student_leave_class" ON class_members
  FOR DELETE USING (auth.uid() = student_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Aussi exécuter si pas encore fait (champs éducatifs sur contests) :
-- ALTER TABLE contests ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'bible';
-- ALTER TABLE contests ADD COLUMN IF NOT EXISTS school_level TEXT;
-- ALTER TABLE contests ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'national';
-- ─────────────────────────────────────────────────────────────────────────────
