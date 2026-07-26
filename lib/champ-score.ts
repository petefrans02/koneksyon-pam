// Barème du Championnat Biblique — une seule source de vérité, utilisée à la
// fois par l'affichage EN DIRECT (live-stats) et par le résultat FINAL
// (resolveMatch). Les deux doivent donner le même chiffre, sinon le score
// « saute » à la fin du match.
//
// RÈGLE : chaque question distribue 100 points AU TOTAL, partagés entre tous
// les participants du match qui ont trouvé la bonne réponse.
//   • 1 seul joueur correct  → il marque 100
//   • 4 joueurs corrects     → 25 chacun
//   • personne               → 0 point distribué
// Un match de N questions vaut donc au maximum 100 × N, réparti entre les deux
// équipes. Aucun bonus de vitesse ni de série.

export const POINTS_PER_QUESTION = 100;

// LES HUMAINS SONT LA FORCE DU JEU : dans le partage, une bonne réponse
// humaine pèse deux fois plus qu'une bonne réponse d'IA. Le total par question
// reste exactement 100 — c'est la répartition qui penche vers les vrais joueurs.
// Ainsi une personne qui répond juste à tout fait gagner son équipe, même
// entourée d'IA.
export const HUMAN_WEIGHT = 2;
export const AI_WEIGHT = 1;

// `winnersByQuestion[qi]` = participants ayant répondu juste à la question qi.
// `isAi` indique lesquels sont des IA. Retourne les points de chacun.
export function sharePointsPerQuestion(
  winnersByQuestion: string[][],
  isAi: (id: string) => boolean = () => false,
): Record<string, number> {
  const points: Record<string, number> = {};
  for (const winners of winnersByQuestion) {
    if (winners.length === 0) continue;
    const totalWeight = winners.reduce((sum, id) => sum + (isAi(id) ? AI_WEIGHT : HUMAN_WEIGHT), 0);
    for (const id of winners) {
      const w = isAi(id) ? AI_WEIGHT : HUMAN_WEIGHT;
      points[id] = (points[id] ?? 0) + (POINTS_PER_QUESTION * w) / totalWeight;
    }
  }
  return points;
}
