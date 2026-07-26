-- Bouton Pause du Championnat Biblique.
-- À exécuter dans l'éditeur SQL Supabase (une seule ligne) :

alter table champ_seasons add column if not exists paused boolean default false;
