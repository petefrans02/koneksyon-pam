import type { SupabaseClient } from "@supabase/supabase-js";
import { autoResolveReady } from "@/lib/champ-resolve";
import { advanceKnockout } from "@/lib/champ-knockout";

// Structure de championnat par JOURNÉES (vagues) : à chaque journée, TOUTES les équipes
// concernées jouent EN MÊME TEMPS. Une équipe ne joue qu'un match par journée.
// Quand toute la journée est finie, la suivante démarre après ce délai.
// 45 s entre deux journées : il faut le temps d'annoncer les équipes éliminées
// à l'antenne avant que le match suivant ne démarre.
export const KICKOFF_DELAY_MS = 45_000;

interface SeqMatch { id: string; stage: string; round_number: number | null; status: string; started_at: string | null }

// Clé de la « vague » (journée) à laquelle appartient un match.
// Poules : une journée par round_number (partagée par toutes les poules).
// Éliminatoires : quarts / demis / (finale + petite finale ensemble).
export function waveKeyOf(m: { stage: string; round_number: number | null }): string {
  if (m.stage === "group") return `group-${m.round_number ?? 0}`;
  if (m.stage === "final" || m.stage === "third") return "finals";
  return m.stage; // quarter | semi
}
export function waveRank(key: string): number {
  if (key.startsWith("group-")) return Number(key.slice(6)) || 0;
  return key === "quarter" ? 1000 : key === "semi" ? 1001 : 1002; // finals
}

async function loadSeq(db: SupabaseClient, seasonId: string): Promise<SeqMatch[]> {
  const { data } = await db.from("champ_matches").select("id, stage, round_number, status, started_at").eq("season_id", seasonId);
  return (data ?? []) as SeqMatch[];
}

// Le prochain groupe de matchs (journée) à jouer, parmi les matchs « scheduled » sans horaire.
function nextPendingWave(matches: SeqMatch[]): SeqMatch[] {
  const pending = matches.filter((m) => m.status === "scheduled" && !m.started_at);
  if (pending.length === 0) return [];
  let bestKey: string | null = null, bestRank = Infinity;
  for (const m of pending) {
    const k = waveKeyOf(m), r = waveRank(k);
    if (r < bestRank) { bestRank = r; bestKey = k; }
  }
  return pending.filter((m) => waveKeyOf(m) === bestKey);
}

// Programme la PROCHAINE journée (tous ses matchs) pour un départ simultané dans 30 s.
// Appelée après la fin d'une journée et après la génération d'un tour éliminatoire.
export async function scheduleNextWave(db: SupabaseClient, seasonId: string): Promise<{ wave: string; count: number; kickoff_at: string } | null> {
  const all = await loadSeq(db, seasonId);
  if (all.some((m) => m.status === "live")) return null;                       // une journée est en cours
  if (all.some((m) => m.status === "scheduled" && m.started_at)) return null;  // une journée est déjà programmée
  const wave = nextPendingWave(all);
  if (wave.length === 0) return null;                                          // plus rien à jouer
  const kickoff = new Date(Date.now() + KICKOFF_DELAY_MS).toISOString();
  await db.from("champ_matches").update({ started_at: kickoff }).in("id", wave.map((m) => m.id));
  return { wave: waveKeyOf(wave[0]), count: wave.length, kickoff_at: kickoff };
}

export type AdvanceState =
  | { state: "live"; matchIds: string[] }
  | { state: "countdown"; wave: string; matchIds: string[]; startsInSec: number; kickoffAt: string }
  | { state: "paused" }
  | { state: "idle" };

// Fait avancer l'horloge du championnat. Idempotent : sûr à appeler depuis n'importe quel sondage.
// Quand l'heure de la journée programmée arrive, TOUS ses matchs passent en direct ensemble.
//
// L'admin ne lance QUE la première journée : ensuite tout s'enchaîne seul —
// journées de poules, génération des quarts/demies/finale, couronnement.
export async function advanceSeason(db: SupabaseClient, seasonId: string): Promise<AdvanceState> {
  const { data: season } = await db.from("champ_seasons").select("*").eq("id", seasonId).maybeSingle();

  // Pause admin : l'horloge se fige (aucune journée ne démarre, rien ne se résout).
  // Colonne optionnelle : tant que la migration n'est pas passée, `paused` vaut undefined.
  if (season && (season as Record<string, unknown>).paused === true) return { state: "paused" };

  // 0) Résout AUTOMATIQUEMENT les matchs dont tous les vrais joueurs ont fini (ou temps max dépassé).
  //    → on ne compte JAMAIS un match terminé tant que ses joueurs jouent encore.
  await autoResolveReady(db, seasonId);

  const all = await loadSeq(db, seasonId);
  const live = all.filter((m) => m.status === "live");
  if (live.length > 0) return { state: "live", matchIds: live.map((m) => m.id) };

  // Une journée vient de se finir → programme la suivante toute seule (mais pas la 1re : l'admin la lance).
  if (all.some((m) => m.status === "done")) await scheduleNextWave(db, seasonId);
  let fresh = await loadSeq(db, seasonId);
  if (fresh.some((m) => m.status === "live")) return { state: "live", matchIds: fresh.filter((m) => m.status === "live").map((m) => m.id) };

  // Plus rien à jouer mais la saison n'est pas finie → on génère le tour suivant
  // du tableau final (poules terminées → quarts → demies → finale → champion).
  const nothingLeft = !fresh.some((m) => m.status === "scheduled");
  const started = fresh.some((m) => m.status === "done");
  if (nothingLeft && started && season?.status !== "finished") {
    const r = await advanceKnockout(db, seasonId);
    if (r.ok && r.phase !== "finished") {
      await scheduleNextWave(db, seasonId); // le nouveau tour démarre 30 s plus tard
      fresh = await loadSeq(db, seasonId);
    }
  }

  const onDeck = fresh.filter((m) => m.status === "scheduled" && m.started_at);
  if (onDeck.length > 0) {
    const kickoffMs = Math.min(...onDeck.map((m) => new Date(m.started_at as string).getTime()));
    const now = Date.now();
    if (now >= kickoffMs) {
      await db.from("champ_matches").update({ status: "live" }).in("id", onDeck.map((m) => m.id));
      return { state: "live", matchIds: onDeck.map((m) => m.id) };
    }
    return { state: "countdown", wave: waveKeyOf(onDeck[0]), matchIds: onDeck.map((m) => m.id), startsInSec: Math.ceil((kickoffMs - now) / 1000), kickoffAt: new Date(kickoffMs).toISOString() };
  }
  return { state: "idle" };
}
