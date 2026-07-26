import type { SupabaseClient } from "@supabase/supabase-js";
import { subsetForSeed, waveKeyOf, flattenForBroadcast, type SubRound } from "@/lib/champ-subset";
import { aiCorrectCount } from "@/lib/champ-sim";
import { ANSWER_SEC, REVEAL_SEC } from "@/lib/champ-sync";

const Q_TOTAL = ANSWER_SEC + REVEAL_SEC;
interface Member { id: string; team_id: string; skill: number; speed: number; is_ai: boolean }
interface ChampMatch { id: string; season_id: string; stage: string; team_a: string; team_b: string; status: string; round_number: number | null }

async function seasonRounds(db: SupabaseClient, seasonId: string): Promise<SubRound[]> {
  const { data: season } = await db.from("champ_seasons").select("contest_id").eq("id", seasonId).maybeSingle();
  if (!season?.contest_id) return [];
  const { data: rounds } = await db.from("contest_rounds").select("round_number, round_type, questions, time_limit_sec").eq("contest_id", season.contest_id).order("round_number");
  return (rounds ?? []) as SubRound[];
}
function countFor(rounds: SubRound[], stage: string, round_number: number | null): number {
  return flattenForBroadcast(subsetForSeed(rounds, waveKeyOf(stage, round_number))).length || 15;
}

// Résout UN match. Score = bonnes réponses × 100 pour TOUT LE MONDE (aucun bonus).
// Un joueur RÉEL ne marque que ce qu'il a réellement répondu : s'il n'a pas joué,
// il marque 0. Seuls les membres IA sont simulés (sinon un absent gagnerait des
// points sans toucher à son écran).
export async function resolveMatch(db: SupabaseClient, match: ChampMatch, count?: number): Promise<{ score_a: number; score_b: number; winner: string | null }> {
  const a = match.team_a, b = match.team_b;
  if (count === undefined) { const r = await seasonRounds(db, match.season_id); count = countFor(r, match.stage, match.round_number); }
  const { data: members } = await db.from("champ_members").select("id, team_id, skill, speed, is_ai").in("team_id", [a, b]);
  const { data: prs } = await db.from("champ_player_results").select("member_id, score, correct").eq("match_id", match.id);
  const real: Record<string, { score: number; correct: number }> = {};
  for (const p of prs ?? []) real[p.member_id as string] = { score: Number(p.score ?? 0), correct: Number(p.correct ?? 0) };

  const teamTotals: Record<string, { score: number; correct: number }> = { [a]: { score: 0, correct: 0 }, [b]: { score: 0, correct: 0 } };
  for (const m of (members ?? []) as Member[]) {
    let r = real[m.id];
    if (!r) {
      // Membre IA → simulation. Joueur réel absent → 0, pas de points offerts.
      const c = m.is_ai ? aiCorrectCount(m.id, m.skill, count) : 0;
      r = { correct: c, score: c * 100 };
    }
    const tt = teamTotals[m.team_id]; if (!tt) continue;
    tt.score += r.score; tt.correct += r.correct;
  }
  const sa = teamTotals[a].score, sb = teamTotals[b].score;
  let winner: string | null = sa > sb ? a : sb > sa ? b : null;
  if (winner === null && match.stage !== "group") winner = teamTotals[a].correct >= teamTotals[b].correct ? a : b;

  await db.from("champ_matches").update({ score_a: sa, score_b: sb, winner, status: "done", played_at: new Date().toISOString() }).eq("id", match.id);

  if (match.stage !== "group" && winner) {
    await db.from("champ_teams").update({ eliminated: true }).eq("id", winner === a ? b : a);
  }

  if (match.stage === "group") {
    const { data: teamsRows } = await db.from("champ_teams").select("id, played, won, drawn, lost, points, correct_total, score_for, score_against").in("id", [a, b]);
    const TR: Record<string, Record<string, number>> = {};
    for (const t of teamsRows ?? []) TR[t.id as string] = { ...(t as Record<string, number>) };
    for (const [tid, self, opp, isWin] of [[a, teamTotals[a], teamTotals[b], winner === a], [b, teamTotals[b], teamTotals[a], winner === b]] as [string, { score: number; correct: number }, { score: number; correct: number }, boolean][]) {
      const t = TR[tid]; if (!t) continue;
      t.played += 1; t.correct_total += self.correct; t.score_for += self.score; t.score_against += opp.score;
      if (winner === null) { t.drawn += 1; t.points += 1; }
      else if (isWin) { t.won += 1; t.points += 3; }
      else { t.lost += 1; }
      await db.from("champ_teams").update({ played: t.played, won: t.won, drawn: t.drawn, lost: t.lost, points: t.points, correct_total: t.correct_total, score_for: t.score_for, score_against: t.score_against }).eq("id", tid);
    }
  }
  return { score_a: sa, score_b: sb, winner };
}

const MAX_MATCH_SEC = 360;

// Résout automatiquement : dès que TOUS les vrais joueurs ont fini OU dès que l'HORLOGE de la manche
// est terminée (plus aucune question à jouer) → on ne fait plus attendre pour rien.
export async function autoResolveReady(db: SupabaseClient, seasonId: string): Promise<number> {
  const { data: liveMatches } = await db.from("champ_matches").select("*").eq("season_id", seasonId).eq("status", "live");
  if (!liveMatches || liveMatches.length === 0) return 0;

  const rounds = await seasonRounds(db, seasonId);
  const teamIds = Array.from(new Set(liveMatches.flatMap((m) => [m.team_a as string, m.team_b as string])));
  const { data: reals } = await db.from("champ_members").select("id, team_id").in("team_id", teamIds).eq("is_ai", false);
  const realByTeam: Record<string, string[]> = {};
  for (const r of reals ?? []) (realByTeam[r.team_id as string] ??= []).push(r.id as string);

  const { data: subs } = await db.from("champ_player_results").select("match_id, member_id").in("match_id", liveMatches.map((m) => m.id));
  const subByMatch: Record<string, Set<string>> = {};
  for (const s of subs ?? []) (subByMatch[s.match_id as string] ??= new Set()).add(s.member_id as string);

  let resolved = 0;
  for (const m of liveMatches) {
    const count = countFor(rounds, m.stage as string, (m.round_number as number) ?? null);
    const syncDuration = count * Q_TOTAL; // durée exacte de la manche synchronisée
    const realIds = [...(realByTeam[m.team_a as string] ?? []), ...(realByTeam[m.team_b as string] ?? [])];
    const submitted = subByMatch[m.id as string] ?? new Set();
    const done = realIds.filter((id) => submitted.has(id)).length;
    const elapsed = m.started_at ? (Date.now() - new Date(m.started_at as string).getTime()) / 1000 : 0;
    // Tous ont fini, OU l'horloge des questions est terminée (+4 s pour les dernières réponses), OU sécurité.
    if (done >= realIds.length || elapsed > syncDuration + 4 || elapsed > MAX_MATCH_SEC) {
      await resolveMatch(db, m as Parameters<typeof resolveMatch>[1], count);
      resolved++;
    }
  }
  return resolved;
}
