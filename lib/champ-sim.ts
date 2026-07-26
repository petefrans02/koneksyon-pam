// Simulation IA DÉTERMINISTE et ÉQUITABLE, partagée par l'affichage en direct (live-stats) ET le
// résultat final (resolveMatch) → le score affiché en direct = le score final (pas de saut, pas de triche).
// IMPORTANT : le score = bonnes réponses × 100 pour TOUT LE MONDE (IA comme humains). Aucun bonus caché.

export function rand(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

// Plafond bas volontaire : meme une IA « expert » ne depasse pas ~55 % de
// reussite. Le defaut (skill absent ou 0) etait a 0.6 — une IA sans profil
// jouait donc mieux qu'un expert. Ramene a 0.2.
const clampSkill = (s: number) => Math.max(0.05, Math.min(0.55, s || 0.2));

// Une IA a-t-elle la bonne réponse à la question qi ? (déterministe)
export function aiIsCorrect(memberId: string, qi: number, skill: number): boolean {
  return rand(`${memberId}:${qi}`) < clampSkill(skill);
}

// Nombre total de bonnes réponses d'une IA sur `count` questions.
export function aiCorrectCount(memberId: string, skill: number, count: number): number {
  let c = 0;
  for (let qi = 0; qi < count; qi++) if (aiIsCorrect(memberId, qi, skill)) c++;
  return c;
}

// Le choix (index) d'une IA pour la question qi : la bonne réponse si correcte, sinon un mauvais choix.
export function aiChoice(memberId: string, qi: number, skill: number, correctIdx: number, optCount: number): number {
  if (aiIsCorrect(memberId, qi, skill)) return correctIdx;
  let w = Math.floor(rand(`${memberId}:w:${qi}`) * optCount);
  if (w === correctIdx) w = (w + 1) % optCount;
  return w;
}
