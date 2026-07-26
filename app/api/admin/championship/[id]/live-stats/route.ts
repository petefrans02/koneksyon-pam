import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { subsetForSeed, waveKeyOf, flattenForBroadcast, type SubRound } from "@/lib/champ-subset";
import { clockState, ANSWER_SEC } from "@/lib/champ-sync";
import { sharePointsPerQuestion } from "@/lib/champ-score";

// Générateur pseudo-aléatoire déterministe (stable entre les sondages) à partir d'une graine.
function rand(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

// GET ?match=&q= — stats EN DIRECT du match : scores qui montent (vrais joueurs + IA simulées en temps réel),
// répartition A/B/C/D, statuts des joueurs, MVP. C'est ce qui rend la diffusion vivante.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }
  await params;
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("match");
  if (!matchId) return NextResponse.json({ distribution: [], answered: 0, mvp: null });
  const db = adminDb();

  const { data: match } = await db.from("champ_matches").select("team_a, team_b, season_id, started_at, stage, round_number").eq("id", matchId).maybeSingle();
  if (!match) return NextResponse.json({ distribution: [], answered: 0, mvp: null });

  // Questions partagées de la journée (avec bonnes réponses).
  const { data: season } = await db.from("champ_seasons").select("contest_id").eq("id", match.season_id).maybeSingle();
  const { data: rounds } = await db.from("contest_rounds").select("round_number, round_type, questions, time_limit_sec").eq("contest_id", season?.contest_id).order("round_number");
  const seed = `${match.season_id}:${waveKeyOf(match.stage as string, (match.round_number as number) ?? null)}`;
  const questions = flattenForBroadcast(subsetForSeed((rounds ?? []) as SubRound[], seed));
  const count = questions.length;

  // Horloge : où en est-on ?
  const st = clockState(new Date(match.started_at as string).getTime(), Date.now(), count);
  const curIdx = Math.min(st.index, Math.max(0, count - 1));
  const inQElapsed = st.phase === "answer" ? (ANSWER_SEC - st.secLeft) : ANSWER_SEC;
  // Questions dont le résultat est acquis (fenêtre de réponse passée).
  const doneUpTo = st.over ? count : (st.index + (st.phase === "reveal" ? 1 : 0));

  const { data: members } = await db.from("champ_members").select("id, name, team_id, is_ai, skill, speed").in("team_id", [match.team_a, match.team_b]);
  const { data: realAns } = await db.from("champ_answers").select("member_id, q_index, choice, correct").eq("match_id", matchId);
  const realByMember: Record<string, Record<number, { choice: number; correct: boolean }>> = {};
  for (const a of realAns ?? []) (realByMember[a.member_id as string] ??= {})[a.q_index as number] = { choice: a.choice as number, correct: !!a.correct };

  // Choix d'une IA pour une question (déterministe) : bonne réponse selon son niveau, sinon un mauvais choix.
  const aiAnswer = (mid: string, qi: number, skill: number, optCount: number) => {
    const correct = rand(`${mid}:${qi}`) < Math.max(0.05, Math.min(0.55, skill || 0.2));
    const q = questions[qi];
    if (!q) return { choice: 0, correct: false };
    if (correct) return { choice: q.correct, correct: true };
    let wrong = Math.floor(rand(`${mid}:w:${qi}`) * optCount);
    if (wrong === q.correct) wrong = (wrong + 1) % optCount;
    return { choice: wrong, correct: false };
  };
  // Temps de réaction d'une IA (s) selon sa vitesse : plus rapide → répond plus tôt.
  const aiReact = (mid: string, speed: number) => 2 + (1 - Math.max(0.2, Math.min(0.95, speed || 0.6))) * (ANSWER_SEC - 4) + rand(`${mid}:r`) * 2;

  const distribution = [0, 0, 0, 0, 0, 0];
  let answered = 0;
  const scoreByTeam: Record<string, number> = { [match.team_a as string]: 0, [match.team_b as string]: 0 };
  const perMember: Record<string, { correct: number }> = {};
  const rosters: { a: { name: string; answered: boolean; correct: number }[]; b: { name: string; answered: boolean; correct: number }[] } = { a: [], b: [] };
  const curQ = questions[curIdx];
  const optCount = curQ ? Math.max(2, curQ.options.filter((o) => o && o.trim()).length) : 4;

  // BARÈME PARTAGÉ (identique au résultat final, cf. lib/champ-score.ts) :
  // 100 points par question répartis entre ceux qui ont trouvé, les humains
  // comptant double. On reconstitue d'abord qui a trouvé quoi.
  const winnersByQuestion: string[][] = [];
  const correctByMember: Record<string, number> = {};
  for (let qi = 0; qi < doneUpTo && qi < count; qi++) {
    const optN = Math.max(2, (questions[qi]?.options.filter((o) => o && o.trim()).length) || 4);
    const winners: string[] = [];
    for (const mem of members ?? []) {
      const mid = mem.id as string;
      const ok = mem.is_ai
        ? aiAnswer(mid, qi, mem.skill as number, optN).correct
        : !!realByMember[mid]?.[qi]?.correct;
      if (ok) { winners.push(mid); correctByMember[mid] = (correctByMember[mid] ?? 0) + 1; }
    }
    winnersByQuestion.push(winners);
  }
  const aiIds = new Set((members ?? []).filter((m) => m.is_ai).map((m) => m.id as string));
  const sharedPoints = sharePointsPerQuestion(winnersByQuestion, (id) => aiIds.has(id));

  for (const mem of members ?? []) {
    const mid = mem.id as string, isAi = !!mem.is_ai, skill = mem.skill as number, speed = mem.speed as number;
    const correctTotal = correctByMember[mid] ?? 0;
    scoreByTeam[mem.team_id as string] = (scoreByTeam[mem.team_id as string] ?? 0) + (sharedPoints[mid] ?? 0);
    perMember[mid] = { correct: correctTotal };

    // Statut + répartition pour la question EN COURS.
    let hasAnswered = false, curChoice = -1;
    if (isAi) {
      hasAnswered = st.phase === "reveal" || inQElapsed >= aiReact(mid, speed);
      if (hasAnswered) curChoice = aiAnswer(mid, curIdx, skill, optCount).choice;
    } else {
      const r = realByMember[mid]?.[curIdx];
      if (r) { hasAnswered = true; curChoice = r.choice; }
    }
    if (hasAnswered && curChoice >= 0 && curChoice < 6) { distribution[curChoice]++; answered++; }
    const entry = { name: (mem.name as string) || "Joueur", answered: hasAnswered, correct: correctTotal };
    if (mem.team_id === match.team_a) rosters.a.push(entry); else rosters.b.push(entry);
  }
  rosters.a.sort((x, y) => y.correct - x.correct || (x.answered === y.answered ? 0 : x.answered ? -1 : 1));
  rosters.b.sort((x, y) => y.correct - x.correct || (x.answered === y.answered ? 0 : x.answered ? -1 : 1));

  // MVP
  let mvp: { name: string; correct: number } | null = null;
  const top = Object.entries(perMember).sort((x, y) => y[1].correct - x[1].correct)[0];
  if (top && top[1].correct > 0) {
    const mm = (members ?? []).find((m) => m.id === top[0]);
    mvp = { name: (mm?.name as string) || "Joueur", correct: top[1].correct };
  }

  return NextResponse.json({
    match_id: matchId, // permet a la diffusion de verifier que les scores
                       // correspondent bien au match affiche (le match vedette tourne)
    distribution, answered, mvp, rosters,
    live_score_a: Math.round(scoreByTeam[match.team_a as string] ?? 0),
    live_score_b: Math.round(scoreByTeam[match.team_b as string] ?? 0),
    q_index: curIdx, count,
  });
}
