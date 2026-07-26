import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { subsetForSeed, waveKeyOf, flattenForBroadcast, type SubRound } from "@/lib/champ-subset";
import { clockState } from "@/lib/champ-sync";

// POST { q_index, choice } — enregistre la réponse du joueur pour la question EN COURS (fenêtre de réponse).
// Valide côté serveur (bonne question au bon moment) → anti-triche + données pour statuts/répartition/MVP.
export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const body = await req.json().catch(() => ({})) as { q_index?: number; choice?: number };
  const qIndex = body.q_index, choice = body.choice;
  if (typeof qIndex !== "number" || typeof choice !== "number") return NextResponse.json({ error: "Paramètres" }, { status: 400 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: m } = await db.from("champ_matches").select("id, status, started_at, stage, round_number, team_a, team_b, season_id").eq("id", matchId).maybeSingle();
  if (!m) return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
  if (m.status !== "live") return NextResponse.json({ error: "Match non actif" }, { status: 409 });

  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  const { data: mem } = await db.from("champ_members").select("id").eq("season_id", m.season_id).eq("user_id", user.id).in("team_id", [m.team_a, m.team_b]).maybeSingle();
  if (!mem) return NextResponse.json({ error: "Pas dans ce match" }, { status: 403 });

  // Questions partagées de la journée + bonne réponse.
  const { data: season } = await db.from("champ_seasons").select("contest_id").eq("id", m.season_id).maybeSingle();
  const { data: rounds } = await db.from("contest_rounds").select("round_number, round_type, questions, time_limit_sec").eq("contest_id", season?.contest_id).order("round_number");
  // Graine = SAISON + JOURNÉE (identique pour toutes les équipes qui jouent
  // en même temps) — doit correspondre exactement à celle de /sync.
  const seed = `${m.season_id}:${waveKeyOf(m.stage as string, (m.round_number as number) ?? null)}`;
  const questions = flattenForBroadcast(subsetForSeed((rounds ?? []) as SubRound[], seed));

  // On n'accepte que la question EN COURS pendant sa fenêtre de réponse.
  const st = clockState(new Date(m.started_at as string).getTime(), Date.now(), questions.length);
  if (st.phase !== "answer" || st.index !== qIndex) return NextResponse.json({ error: "Hors fenêtre", currentIndex: st.index, phase: st.phase }, { status: 409 });
  const q = questions[qIndex];
  if (!q) return NextResponse.json({ error: "Question invalide" }, { status: 400 });

  const correct = choice === q.correct;
  // Première réponse verrouillée (ignoreDuplicates).
  await db.from("champ_answers").upsert(
    [{ match_id: matchId, member_id: mem.id, q_index: qIndex, choice, correct }],
    { onConflict: "match_id,member_id,q_index", ignoreDuplicates: true }
  );

  return NextResponse.json({ ok: true, correct, correctIndex: q.correct });
}
