import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { advanceSeason } from "@/lib/champ-sequence";
import { subsetForSeed, waveKeyOf, flattenForBroadcast, type SubRound } from "@/lib/champ-subset";
import { ANSWER_SEC, REVEAL_SEC } from "@/lib/champ-sync";

// GET — données de jeu SYNCHRONISÉ : la liste de questions de la journée (partagée par toutes les équipes),
// l'heure de départ (ancrage de l'horloge) et l'heure serveur. Tout le monde voit la même question au même moment.
export async function GET(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: match } = await db.from("champ_matches").select("*").eq("id", matchId).maybeSingle();
  if (!match) return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
  await advanceSeason(db, match.season_id as string);
  const { data: fresh } = await db.from("champ_matches").select("status, started_at, stage, round_number, team_a, team_b, season_id").eq("id", matchId).maybeSingle();
  const m = fresh ?? match;

  const { data: season } = await db.from("champ_seasons").select("contest_id").eq("id", m.season_id).maybeSingle();

  // Joueur connecté
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  let myMember: { id: string; team_id: string } | null = null;
  if (user) {
    const { data: mem } = await db.from("champ_members").select("id, team_id").eq("season_id", m.season_id).eq("user_id", user.id).in("team_id", [m.team_a, m.team_b]).maybeSingle();
    if (mem) myMember = { id: mem.id as string, team_id: mem.team_id as string };
  }

  // Liste de questions PARTAGÉE de la journée (identique pour tout le monde)
  let questions: { prompt: string; options: string[]; correct: number; ref: string }[] = [];
  if (season?.contest_id) {
    const { data: rounds } = await db.from("contest_rounds").select("round_number, round_type, questions, time_limit_sec").eq("contest_id", season.contest_id).order("round_number");
    const seed = waveKeyOf(m.stage as string, (m.round_number as number) ?? null);
    questions = flattenForBroadcast(subsetForSeed((rounds ?? []) as SubRound[], seed));
  }

  // Réponses déjà envoyées par ce joueur (pour restaurer l'état).
  let myAnswers: Record<number, number> = {};
  if (myMember) {
    const { data: ans } = await db.from("champ_answers").select("q_index, choice").eq("match_id", matchId).eq("member_id", myMember.id);
    for (const a of ans ?? []) myAnswers[a.q_index as number] = a.choice as number;
  }

  return NextResponse.json({
    status: m.status,
    started_at: m.started_at,
    server_now: new Date().toISOString(),
    answer_sec: ANSWER_SEC, reveal_sec: REVEAL_SEC,
    count: questions.length,
    questions,
    is_member: !!myMember,
    my_member_id: myMember?.id ?? null,
    my_answers: myAnswers,
  });
}
