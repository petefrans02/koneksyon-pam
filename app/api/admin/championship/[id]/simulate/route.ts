import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

const Q_PER_MATCH = 15; // questions par match (simulation)

interface Member { id: string; team_id: string; skill: number; speed: number; is_ai: boolean; }
interface TeamStat { score: number; correct: number; time: number; count: number; }

// Simule un joueur : bonnes réponses (binomiale ~ skill) + score + temps.
function simMember(m: Member): { score: number; correct: number; time: number } {
  let correct = 0;
  for (let i = 0; i < Q_PER_MATCH; i++) if (Math.random() < m.skill) correct++;
  const speedBonus = Math.round(correct * m.speed * 40);
  const score = correct * 100 + speedBonus;
  const time = Number((2 + (1 - m.speed) * 12 + (Math.random() * 2 - 1)).toFixed(1)); // 2..14s
  return { score, correct, time };
}

interface RealRes { score: number; correct: number; time: number; }
// Résultat d'équipe : utilise le VRAI résultat du joueur s'il a joué, sinon simule (IA).
function teamResult(members: Member[], real: Record<string, RealRes>): TeamStat {
  const r = { score: 0, correct: 0, time: 0, count: members.length || 1 };
  for (const m of members) {
    const rr = real[m.id];
    const s = rr ?? simMember(m);
    r.score += s.score; r.correct += s.correct; r.time += s.time ?? 0;
  }
  return r;
}

// POST — simule les matchs programmés (phase de poules) + met à jour les classements.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }
  const { id } = await params;
  const body = await req.json().catch(() => ({})) as { stage?: string };
  const stage = body.stage ?? "group";

  const db = adminDb();

  const { data: matches } = await db.from("champ_matches")
    .select("id, team_a, team_b, stage, status")
    .eq("season_id", id).eq("stage", stage).eq("status", "scheduled");
  if (!matches || matches.length === 0) return NextResponse.json({ ok: true, played: 0, message: "Aucun match à jouer" });

  const { data: members } = await db.from("champ_members")
    .select("id, team_id, skill, speed, is_ai").eq("season_id", id);
  const byTeam: Record<string, Member[]> = {};
  for (const m of (members ?? []) as Member[]) { (byTeam[m.team_id] ??= []).push(m); }

  const { data: teams } = await db.from("champ_teams")
    .select("id, played, won, drawn, lost, points, correct_total, score_for, score_against, avg_time")
    .eq("season_id", id);
  const T: Record<string, Record<string, number>> = {};
  for (const t of teams ?? []) T[t.id as string] = { ...(t as Record<string, number>) };

  // Résultats réels par match (les vrais joueurs qui ont joué ce match précis).
  const matchIds = matches.map((m) => m.id as string);
  const realByMatch: Record<string, Record<string, RealRes>> = {};
  if (matchIds.length) {
    const { data: prs } = await db.from("champ_player_results").select("match_id, member_id, correct, score, avg_time").in("match_id", matchIds);
    for (const p of prs ?? []) {
      (realByMatch[p.match_id as string] ??= {})[p.member_id as string] = { score: Number(p.score ?? 0), correct: Number(p.correct ?? 0), time: Number(p.avg_time ?? 0) };
    }
  }

  let played = 0;
  for (const mt of matches) {
    const a = mt.team_a as string, b = mt.team_b as string;
    const real = realByMatch[mt.id as string] ?? {};
    const ra = teamResult(byTeam[a] ?? [], real);
    const rb = teamResult(byTeam[b] ?? [], real);
    const winner = ra.score > rb.score ? a : rb.score > ra.score ? b : null;

    // match
    await db.from("champ_matches").update({
      score_a: ra.score, score_b: rb.score, winner, status: "done", played_at: new Date().toISOString(),
    }).eq("id", mt.id);

    // stats équipe A
    const ta = T[a], tb = T[b];
    for (const [t, self, opp, isWin] of [[ta, ra, rb, winner === a], [tb, rb, ra, winner === b]] as [Record<string, number>, TeamStat, TeamStat, boolean][]) {
      t.played += 1;
      t.correct_total += self.correct;
      t.score_for += self.score;
      t.score_against += opp.score;
      const prevTimeTotal = t.avg_time * (t.played - 1);
      t.avg_time = Number(((prevTimeTotal + self.time / self.count) / t.played).toFixed(2));
      if (winner === null) { t.drawn += 1; t.points += 1; }
      else if (isWin) { t.won += 1; t.points += 3; }
      else { t.lost += 1; }
    }
    played++;
  }

  // Persiste les classements
  for (const [tid, s] of Object.entries(T)) {
    await db.from("champ_teams").update({
      played: s.played, won: s.won, drawn: s.drawn, lost: s.lost, points: s.points,
      correct_total: s.correct_total, score_for: s.score_for, score_against: s.score_against, avg_time: s.avg_time,
    }).eq("id", tid);
  }

  return NextResponse.json({ ok: true, played });
}
