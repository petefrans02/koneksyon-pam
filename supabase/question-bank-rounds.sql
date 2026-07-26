-- ═══════════════════════════════════════════════════════════════════
-- KONEKSYON PAM — Structure 15 manches standard
-- Insérer après question-bank.sql
-- ═══════════════════════════════════════════════════════════════════

-- Définition des 15 manches pour chaque championnat
-- Appeler avec l'ID du championnat
-- Exemple : SELECT kp_init_championship_rounds('uuid-du-contest');

CREATE OR REPLACE FUNCTION kp_init_championship_rounds(p_contest_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO kp_championship_rounds
    (contest_id, round_number, round_type, title, instructions, color_theme, icon, time_limit_sec, points_per_q)
  VALUES
    (p_contest_id,  1, 'mcq',       '{"fr":"L''Éveil","ht":"L''Éveil","en":"L''Éveil"}',                             '{"fr":"Choisissez la bonne réponse.","ht":"Choisissez la bonne réponse.","en":"Choisissez la bonne réponse."}',   '#1d4ed8', '⚡',  15, 100),
    (p_contest_id,  2, 'tf',        '{"fr":"Le Témoignage","ht":"Le Témoignage","en":"Le Témoignage"}',               '{"fr":"Vrai ou Faux ?","ht":"Vrai ou Faux ?","en":"Vrai ou Faux ?"}',                                           '#7c3aed', '⚖️', 12, 100),
    (p_contest_id,  3, 'fill',      '{"fr":"La Parole","ht":"La Parole","en":"La Parole"}',                           '{"fr":"Complétez le verset biblique.","ht":"Complétez le verset biblique.","en":"Complétez le verset biblique."}','#0891b2', '📖', 15, 100),
    (p_contest_id,  4, 'character', '{"fr":"La Galerie","ht":"La Galerie","en":"La Galerie"}',                        '{"fr":"Qui suis-je ?","ht":"Qui suis-je ?","en":"Qui suis-je ?"}',                                               '#b45309', '🔍', 20, 100),
    (p_contest_id,  5, 'location',  '{"fr":"Les Terres Saintes","ht":"Les Terres Saintes","en":"Les Terres Saintes"}','{"fr":"Identifiez le lieu biblique.","ht":"Identifiez le lieu biblique.","en":"Identifiez le lieu biblique."}',  '#15803d', '📍', 20, 100),
    (p_contest_id,  6, 'book',      '{"fr":"Les Livres","ht":"Les Livres","en":"Les Livres"}',                        '{"fr":"Identifiez le livre biblique.","ht":"Identifiez le livre biblique.","en":"Identifiez le livre biblique."}',  '#4f46e5', '📚', 20, 120),
    (p_contest_id,  7, 'chrono',    '{"fr":"La Chronologie","ht":"La Chronologie","en":"La Chronologie"}',            '{"fr":"Remettez les événements dans l''ordre.","ht":"Remettez les événements dans l''ordre.","en":"Put events in order."}', '#0d9488', '🕐', 30, 150),
    (p_contest_id,  8, 'character', '{"fr":"Qui suis-je ?","ht":"Qui suis-je ?","en":"Who Am I?"}',                   '{"fr":"Identifiez le personnage.","ht":"Identifiez le personnage.","en":"Identify the character."}',                '#7c2d12', '👤', 25, 120),
    (p_contest_id,  9, 'mcq',       '{"fr":"Les Rois","ht":"Les Rois","en":"The Kings"}',                             '{"fr":"Questions sur les rois d''Israël.","ht":"Questions sur les rois d''Israël.","en":"Questions about kings of Israel."}', '#b45309', '👑', 15, 100),
    (p_contest_id, 10, 'mcq',       '{"fr":"Les Miracles","ht":"Les Miracles","en":"The Miracles"}',                  '{"fr":"Identifiez le miracle.","ht":"Identifiez le miracle.","en":"Identify the miracle."}',                        '#dc2626', '✨', 15, 120),
    (p_contest_id, 11, 'mcq',       '{"fr":"Les Prophéties","ht":"Les Prophéties","en":"The Prophecies"}',            '{"fr":"Questions sur les prophéties.","ht":"Questions sur les prophéties.","en":"Questions about prophecies."}',   '#6366f1', '🔮', 20, 120),
    (p_contest_id, 12, 'mcq',       '{"fr":"Les Défis","ht":"Les Défis","en":"The Challenges"}',                      '{"fr":"Questions difficiles.","ht":"Questions difficiles.","en":"Difficult questions."}',                           '#ef4444', '🔥', 20, 150),
    (p_contest_id, 13, 'character', '{"fr":"Les Citations","ht":"Les Citations","en":"The Quotes"}',                  '{"fr":"Qui a prononcé cette parole ?","ht":"Qui a prononcé cette parole ?","en":"Who said this?"}',                  '#0891b2', '💬', 20, 120),
    (p_contest_id, 14, 'mcq',       '{"fr":"Les Experts","ht":"Les Experts","en":"The Experts"}',                     '{"fr":"Questions avancées pour experts.","ht":"Questions avancées pour experts.","en":"Advanced questions."}',      '#7c3aed', '🎓', 25, 200),
    (p_contest_id, 15, 'finale',    '{"fr":"La Grande Finale","ht":"La Grande Finale","en":"The Grand Finale"}',      '{"fr":"La manche finale — les questions les plus difficiles !","ht":"La manche finale !","en":"The final round!"}', '#f59e0b', '🏆', 30, 300)
  ON CONFLICT (contest_id, round_number) DO UPDATE SET
    round_type     = EXCLUDED.round_type,
    title          = EXCLUDED.title,
    instructions   = EXCLUDED.instructions,
    color_theme    = EXCLUDED.color_theme,
    icon           = EXCLUDED.icon,
    time_limit_sec = EXCLUDED.time_limit_sec,
    points_per_q   = EXCLUDED.points_per_q;
END;
$$;

-- Initialiser toutes les 15 manches pour tous les championnats existants
SELECT kp_init_championship_rounds(id) FROM contests WHERE is_private = FALSE;
