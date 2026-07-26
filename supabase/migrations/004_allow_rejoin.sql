-- Add allow_rejoin flag to contests.
-- When false: a player who quits mid-game is marked eliminated and cannot rejoin.
-- When true: the player can return to the championship from the lobby page.
ALTER TABLE contests ADD COLUMN IF NOT EXISTS allow_rejoin BOOLEAN NOT NULL DEFAULT TRUE;
