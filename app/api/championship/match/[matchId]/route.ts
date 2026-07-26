import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { advanceSeason } from "@/lib/champ-sequence";

// GET — infos d'un match + si le joueur connecté y participe et a déjà joué.
export async function GET(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const first = await db.from("champ_matches").select("season_id").eq("id", matchId).maybeSingle();
  if (!first.data) return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
  // Fait avancer l'horloge du championnat (démarre le prochain match quand son heure arrive).
  const seq = await advanceSeason(db, first.data.season_id as string);

  const { data: match } = await db.from("champ_matches").select("*").eq("id", matchId).maybeSingle();
  if (!match) return NextResponse.json({ error: "Match introuvable" }, { status: 404 });

  const { data: teams } = await db.from("champ_teams").select("id, name, color, logo_seed, eliminated").in("id", [match.team_a, match.team_b]);
  const tmap: Record<string, { id: string; eliminated?: boolean }> = {};
  for (const t of teams ?? []) tmap[t.id as string] = t as { id: string; eliminated?: boolean };

  const { data: season } = await db.from("champ_seasons").select("contest_id, name").eq("id", match.season_id).maybeSingle();

  // Équipes qui jouent EN CE MOMENT dans le championnat (pour l'afficher pendant l'attente).
  const { data: liveM } = await db.from("champ_matches").select("team_a, team_b").eq("season_id", match.season_id).eq("status", "live");
  const liveIds = Array.from(new Set((liveM ?? []).flatMap((m) => [m.team_a as string, m.team_b as string])));
  const liveNames: Record<string, { name: string; color: string; logo_seed: string }> = {};
  if (liveIds.length) {
    const { data: lt } = await db.from("champ_teams").select("id, name, color, logo_seed").in("id", liveIds);
    for (const t of lt ?? []) liveNames[t.id as string] = { name: t.name as string, color: t.color as string, logo_seed: t.logo_seed as string };
  }
  const live_now = (liveM ?? []).map((m) => ({ a: liveNames[m.team_a as string] ?? null, b: liveNames[m.team_b as string] ?? null })).filter((x) => x.a && x.b);

  // Joueur connecté ?
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();

  let myMember: { id: string; team_id: string } | null = null;
  let alreadyPlayed = false;
  if (user) {
    const { data: mem } = await db.from("champ_members")
      .select("id, team_id").eq("season_id", match.season_id).eq("user_id", user.id)
      .in("team_id", [match.team_a, match.team_b]).maybeSingle();
    if (mem) {
      myMember = { id: mem.id as string, team_id: mem.team_id as string };
      const { data: pr } = await db.from("champ_player_results").select("id").eq("match_id", matchId).eq("member_id", mem.id).maybeSingle();
      alreadyPlayed = !!pr;
    }
  }

  return NextResponse.json({
    match: { id: match.id, stage: match.stage, status: match.status, team_a: match.team_a, team_b: match.team_b, score_a: match.score_a, score_b: match.score_b, winner: match.winner, round_number: match.round_number ?? null },
    teamA: tmap[match.team_a] ?? null, teamB: tmap[match.team_b] ?? null,
    contest_id: season?.contest_id ?? null, season_name: season?.name ?? null, season_id: match.season_id ?? null,
    my_member_id: myMember?.id ?? null, my_team_id: myMember?.team_id ?? null,
    already_played: alreadyPlayed,
    is_member: !!myMember,
    // Mon équipe est-elle éliminée du championnat ?
    my_team_eliminated: !!(myMember && tmap[myMember.team_id]?.eliminated),
    // On ne peut jouer QUE quand le match est en direct (status "live").
    can_play: !!myMember && !alreadyPlayed && match.status === "live",
    waiting: !!myMember && !alreadyPlayed && match.status === "scheduled",
    // Compte à rebours avant le départ automatique (si CE match fait partie de la prochaine journée).
    starts_in_sec: seq.state === "countdown" && seq.matchIds.includes(matchId) ? seq.startsInSec : null,
    // Équipes qui jouent en ce moment dans le championnat.
    live_now,
  });
}
