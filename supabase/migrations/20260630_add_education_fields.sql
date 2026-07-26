-- ─────────────────────────────────────────────────────────────
-- Migration : Champs éducatifs pour la table contests
-- Ajouter : subject, school_level, scope
-- ─────────────────────────────────────────────────────────────

-- 1. Domaine / matière scolaire
ALTER TABLE contests
  ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'bible'
    CHECK (subject IN ('bible','maths','sciences','histoire','langues','arts','tech','sante'));

-- 2. Niveau scolaire
ALTER TABLE contests
  ADD COLUMN IF NOT EXISTS school_level TEXT
    CHECK (school_level IS NULL OR school_level IN ('primaire-1','primaire-2','secondaire-1','secondaire-2'));

-- 3. Portée du concours
ALTER TABLE contests
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'national'
    CHECK (scope IN ('class','school','national','world'));

-- 4. Index pour filtrer par domaine rapidement
CREATE INDEX IF NOT EXISTS idx_contests_subject ON contests(subject);
CREATE INDEX IF NOT EXISTS idx_contests_scope   ON contests(scope);
CREATE INDEX IF NOT EXISTS idx_contests_level   ON contests(school_level);

-- 5. Mise à jour des concours existants (tout passer à 'bible' / 'national')
UPDATE contests SET subject = 'bible'    WHERE subject IS NULL;
UPDATE contests SET scope   = 'national' WHERE scope   IS NULL;
