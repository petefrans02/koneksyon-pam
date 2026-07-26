-- Phase 4 : Ajouter le pays aux classes
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'HT';

CREATE INDEX IF NOT EXISTS idx_classes_country ON classes(country);

-- Mettre à jour les classes existantes
UPDATE classes SET country = 'HT' WHERE country IS NULL;
