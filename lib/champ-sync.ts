// Horloge synchronisée du championnat : tous les joueurs (et la page de diffusion) voient
// la MÊME question à la MÊME seconde, pilotée par l'heure de départ de la journée + l'heure serveur.
export const ANSWER_SEC = 15; // temps de réponse
export const REVEAL_SEC = 5;  // temps de révélation
export const Q_TOTAL = ANSWER_SEC + REVEAL_SEC;

export type SyncPhase = "answer" | "reveal" | "over" | "pre";

export interface SyncState { index: number; phase: SyncPhase; secLeft: number; over: boolean }

// startedAtMs : heure de départ de la journée. serverNowMs : heure serveur (corrigée du décalage client).
export function clockState(startedAtMs: number, serverNowMs: number, count: number): SyncState {
  if (!startedAtMs || count <= 0) return { index: 0, phase: "pre", secLeft: 0, over: false };
  const elapsed = (serverNowMs - startedAtMs) / 1000;
  if (elapsed < 0) return { index: 0, phase: "pre", secLeft: Math.ceil(-elapsed), over: false };
  const index = Math.floor(elapsed / Q_TOTAL);
  if (index >= count) return { index: count, phase: "over", secLeft: 0, over: true };
  const inQ = elapsed % Q_TOTAL;
  const phase: SyncPhase = inQ < ANSWER_SEC ? "answer" : "reveal";
  const secLeft = phase === "answer" ? Math.max(0, Math.ceil(ANSWER_SEC - inQ)) : Math.max(0, Math.ceil(Q_TOTAL - inQ));
  return { index, phase, secLeft, over: false };
}
