import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// POST — enregistre le résultat du joueur pour ce match.
export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: match } = await db.from("champ_matches").select("id, season_id, team_a, team_b, status").eq("id", matchId).maybeSingle();
  if (!match) return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
  if (match.status === "done") return NextResponse.json({ error: "Ce match est déjà terminé." }, { status: 400 });

  const { data: mem } = await db.from("champ_members")
    .select("id, team_id").eq("season_id", match.season_id).eq("user_id", user.id)
    .in("team_id", [match.team_a, match.team_b]).maybeSingle();
  if (!mem) return NextResponse.json({ error: "Tu ne fais pas partie de ce match." }, { status: 403 });

  const { data: existing } = await db.from("champ_player_results").select("id").eq("match_id", matchId).eq("member_id", mem.id).maybeSingle();
  if (existing) return NextResponse.json({ error: "Tu as déjà joué ce match." }, { status: 400 });

  const body = await req.json().catch(() => ({})) as { correct?: number; total_q?: number; score?: number; avg_time?: number };
  await db.from("champ_player_results").insert({
    match_id: matchId, team_id: mem.team_id, member_id: mem.id,
    correct: Math.max(0, Math.round(body.correct ?? 0)),
    total_q: Math.max(0, Math.round(body.total_q ?? 0)),
    score: Math.max(0, Math.round(body.score ?? 0)),
    avg_time: body.avg_time ?? 0,
    is_ai: false,
  });

  return NextResponse.json({ ok: true });
}
