import type { ChampionshipQuestion } from "@/lib/championship-types";

// Sous-ensemble de manches partagé : toutes les équipes d'une MÊME journée (vague) reçoivent
// le MÊME jeu de questions, et la page de diffusion affiche exactement ces questions-là.
export interface SubRound { round_number: number; round_type: string; questions: ChampionshipQuestion[]; time_limit_sec?: number }

const ROUNDS_PER_MATCH = 3;

type L = { fr?: string; en?: string } | string | null | undefined;
const tx = (o: L): string => !o ? "" : typeof o === "string" ? o : (o.fr || o.en || (Object.values(o)[0] as string) || "");

function txReal(v: unknown): boolean {
  if (!v) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "object") return Object.values(v as Record<string, unknown>).some((s) => typeof s === "string" && s.trim().length > 0);
  return false;
}

export function goodQuestion(q: ChampionshipQuestion): boolean {
  const anyq = q as Record<string, unknown>;
  const type = (anyq.type as string) || "mcq";
  if (type === "tf") return txReal(anyq.statement);
  if (type === "fill") return txReal(anyq.verse);
  if (type === "character" || type === "location" || type === "book")
    return Array.isArray(anyq.clues) && (anyq.clues as unknown[]).some(txReal);
  if (type === "chrono" || type === "order_verse")
    return Array.isArray(anyq.items) && (anyq.items as unknown[]).length >= 2;
  return txReal(anyq.q) && Array.isArray(anyq.options) && (anyq.options as unknown[]).filter(txReal).length >= 2;
}

function cleanRound(r: SubRound): SubRound {
  return { ...r, questions: (r.questions ?? []).filter(goodQuestion) };
}

// Clé de la journée (vague) : poules par n° de journée, KO par phase. → questions identiques pour toute la vague.
export function waveKeyOf(stage: string, round_number: number | null): string {
  if (stage === "group") return `group-${round_number ?? 0}`;
  if (stage === "final" || stage === "third") return "finals";
  return stage; // quarter | semi
}

// Choisit un sous-ensemble déterministe de manches à partir d'une CLÉ (la même clé → le même jeu).
export function subsetForSeed(all: SubRound[], seed: string): SubRound[] {
  const good = all.map(cleanRound).filter((r) => r.questions.length > 0);
  if (good.length <= ROUNDS_PER_MATCH) return good;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const start = hash % good.length;
  const out: SubRound[] = [];
  for (let i = 0; i < ROUNDS_PER_MATCH; i++) out.push(good[(start + i) % good.length]);
  return out;
}

// Aplati les manches en questions affichables (avec bonne réponse) pour la page de diffusion.
export interface DisplayQuestion { prompt: string; options: string[]; correct: number; ref: string }
export function flattenForBroadcast(rounds: SubRound[]): DisplayQuestion[] {
  const items: DisplayQuestion[] = [];
  for (const r of rounds) {
    for (const q of r.questions) {
      const anyq = q as Record<string, unknown>;
      const type = (anyq.type as string) || r.round_type;
      let prompt = "", options: string[] = [], correct = 0;
      if (type === "tf") { prompt = tx(anyq.statement as L); options = ["Vrai", "Faux"]; correct = anyq.is_true ? 0 : 1; }
      else if (type === "fill") { prompt = tx(anyq.verse as L); options = (((anyq.fill_options as L[]) || (anyq.options as L[])) || []).map(tx); correct = typeof anyq.correct === "number" ? anyq.correct : 0; }
      else { prompt = tx(anyq.q as L); options = ((anyq.options as L[]) || []).map(tx); correct = typeof anyq.correct === "number" ? anyq.correct : 0; }
      const realOpts = options.filter((o) => o && o.trim().length > 0);
      if (prompt.trim() && realOpts.length >= 2 && correct < options.length) items.push({ prompt: prompt.trim(), options, correct, ref: tx(anyq.ref as L) });
    }
  }
  return items;
}
