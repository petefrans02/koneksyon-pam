import type { SupabaseClient } from "@supabase/supabase-js";
import { subsetForSeed, waveKeyOf, flattenForBroadcast, type SubRound } from "@/lib/champ-subset";
import { aiIsCorrect } from "@/lib/champ-sim";
import { sharePointsPerQuestion } from "@/lib/champ-score";
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
function countFor(rounds: SubRound[], matchId: string): number {
  return flattenForBroadcast(subsetForSeed(rounds, matchId)).length || 15;
}

// Résout UN match. BARÈME PARTAGÉ : chaque question distribue 100 points au
// total, répartis entre tous les participants du match qui ont trouvé (cf.
// lib/champ-score.ts). Un joueur RÉEL ne marque que ce qu'il a réellement
// répondu ; seules les IA sont simulées.
export async function resolveMatch(db: SupabaseClient, match: ChampMatch, count?: number): Promise<{ score_a: number; score_b: number; winner: string | null }> {
  const a = match.team_a, b = match.team_b;
  if (count === undefined) { const r = await seasonRounds(db, match.season_id); count = countFor(r, match.id); }
  const { data: members } = await db.from("champ_members").select("id, team_id, skill, speed, is_ai").in("team_id", [a, b]);
  const roster = (members ?? []) as Member[];

  // Réponses réelles, question par question.
  const { data: answers } = await db.from("champ_answers").select("member_id, q_index, correct").eq("match_id", match.id);
  const realCorrect: Record<string, Set<number>> = {};
  for (const r of answers ?? []) {
    if (r.correct) (realCorrect[r.member_id as string] ??= new Set()).add(r.q_index as number);
  }

  // Pour chaque question, qui a trouvé ? (humains d'après leurs réponses, IA simulées)
  const winnersByQuestion: string[][] = [];
  const correctCount: Record<string, number> = {};
  for (let qi = 0; qi < count; qi++) {
    const winners: string[] = [];
    for (const m of roster) {
      const ok = m.is_ai ? aiIsCorrect(m.id, qi, m.skill) : !!realCorrect[m.id]?.has(qi);
      if (ok) { winners.push(m.id); correctCount[m.id] = (correctCount[m.id] ?? 0) + 1; }
    }
    winnersByQuestion.push(winners);
  }
  const aiIds = new Set(roster.filter((m) => m.is_ai).map((m) => m.id));
  const points = sharePointsPerQuestion(winnersByQuestion, (id) => aiIds.has(id));

  const teamTotals: Record<string, { score: number; correct: number }> = { [a]: { score: 0, correct: 0 }, [b]: { score: 0, correct: 0 } };
  for (const m of roster) {
    const tt = teamTotals[m.team_id]; if (!tt) continue;
    tt.score += points[m.id] ?? 0;
    tt.correct += correctCount[m.id] ?? 0;
  }
  // Les scores individuels sont recalculés ici (le client ne decide pas du bareme).
  for (const m of roster) {
    if (m.is_ai) continue;
    await db.from("champ_player_results")
      .update({ score: Math.round(points[m.id] ?? 0), correct: correctCount[m.id] ?? 0 })
      .eq("match_id", match.id).eq("member_id", m.id);
  }

  const sa = Math.round(teamTotals[a].score), sb = Math.round(teamTotals[b].score);
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
    const count = countFor(rounds, m.id as string);
    const syncDuration = count * Q_TOTAL; // durée exacte de la manche synchronisée
    const realIds = [...(realByTeam[m.team_a as string] ?? []), ...(realByTeam[m.team_b as string] ?? [])];
    const submitted = subByMatch[m.id as string] ?? new Set();
    const done = realIds.filter((id) => submitted.has(id)).length;
    const elapsed = m.started_at ? (Date.now() - new Date(m.started_at as string).getTime()) / 1000 : 0;
    // Un match SANS aucun vrai joueur (IA contre IA) se résolvait instantanément
    // — `0 >= 0` était vrai — et le championnat sautait au vainqueur sans jamais
    // poser les questions. Il doit maintenant vivre sa durée normale, comme les
    // autres : les questions defilent a l'ecran de diffusion.
    const allHumansDone = realIds.length > 0 && done >= realIds.length;
    const clockOver = elapsed > syncDuration + 4;
    if (allHumansDone || clockOver || elapsed > MAX_MATCH_SEC) {
      await resolveMatch(db, m as Parameters<typeof resolveMatch>[1], count);
      resolved++;
    }
  }
  return resolved;
}
