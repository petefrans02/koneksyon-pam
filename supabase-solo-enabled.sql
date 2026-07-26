-- Active/désactive le mode solo par concours (bouton « Solo » à côté de « Actif » dans l'admin).
-- À exécuter une seule fois dans Supabase → SQL Editor.
alter table contests add column if not exists solo_enabled boolean not null default false;
