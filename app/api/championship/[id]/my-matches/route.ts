import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { advanceSeason } from "@/lib/champ-sequence";

// GET — les matchs de l'équipe du joueur connecté + s'il les a déjà joués.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ member: false });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  // Fait avancer l'horloge du championnat (démarrage auto du prochain match).
  const seq = await advanceSeason(db, id);
  const { data: mem } = await db.from("champ_members").select("id, team_id").eq("season_id", id).eq("user_id", user.id).maybeSingle();
  if (!mem) return NextResponse.json({ member: false });

  const teamId = mem.team_id as string;
  const { data: matches } = await db.from("champ_matches")
    .select("id, stage, group_label, team_a, team_b, status, started_at")
    .eq("season_id", id).or(`team_a.eq.${teamId},team_b.eq.${teamId}`).order("stage");

  const { data: teams } = await db.from("champ_teams").select("id, name, color, logo_seed, eliminated").eq("season_id", id);
  const tmap: Record<string, { name: string; color: string; logo_seed: string; eliminated?: boolean }> = {};
  for (const t of teams ?? []) tmap[t.id as string] = { name: t.name as string, color: t.color as string, logo_seed: t.logo_seed as string, eliminated: !!t.eliminated };

  const { data: prs } = await db.from("champ_player_results").select("match_id").eq("member_id", mem.id);
  const playedSet = new Set((prs ?? []).map((p) => p.match_id as string));

  const list = (matches ?? []).map((m) => {
    const oppId = m.team_a === teamId ? m.team_b : m.team_a;
    const startsIn = seq.state === "countdown" && seq.matchIds.includes(m.id as string) ? seq.startsInSec : null;
    return {
      match_id: m.id, stage: m.stage, group_label: m.group_label, status: m.status,
      opponent: tmap[oppId as string] ?? null,
      played: playedSet.has(m.id as string),
      playable: m.status !== "done" && !playedSet.has(m.id as string),
      starts_in_sec: startsIn,
    };
  });

  return NextResponse.json({ member: true, my_team: tmap[teamId] ?? null, my_team_eliminated: !!tmap[teamId]?.eliminated, matches: list });
}
