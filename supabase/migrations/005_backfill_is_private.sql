-- Backfill is_private for contests created before the column existed.
-- Contests with an invite_code were private sessions; everything else is public.
UPDATE contests SET is_private = TRUE
  WHERE is_private IS NULL AND invite_code IS NOT NULL AND invite_code <> '';

UPDATE contests SET is_private = FALSE
  WHERE is_private IS NULL;

-- Enforce NOT NULL + default going forward
ALTER TABLE contests ALTER COLUMN is_private SET NOT NULL;
ALTER TABLE contests ALTER COLUMN is_private SET DEFAULT FALSE;
