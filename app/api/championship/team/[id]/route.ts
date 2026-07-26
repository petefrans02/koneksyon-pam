import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// GET — détail d'une équipe : infos + joueurs + matchs (avec adversaire et résultat).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: team } = await db.from("champ_teams").select("*").eq("id", id).maybeSingle();
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: members } = await db.from("champ_members")
    .select("id, name, avatar, country, level, is_ai, skill").eq("team_id", id);

  const { data: matches } = await db.from("champ_matches")
    .select("id, stage, group_label, round_number, team_a, team_b, score_a, score_b, winner, status")
    .eq("season_id", team.season_id)
    .or(`team_a.eq.${id},team_b.eq.${id}`)
    .order("stage");

  // Noms des adversaires
  const otherIds = new Set<string>();
  for (const m of matches ?? []) { otherIds.add(m.team_a as string); otherIds.add(m.team_b as string); }
  const { data: allTeams } = await db.from("champ_teams").select("id, name, color, logo_seed").eq("season_id", team.season_id);
  const tmap: Record<string, { name: string; color: string; logo_seed: string }> = {};
  for (const t of allTeams ?? []) tmap[t.id as string] = { name: t.name as string, color: t.color as string, logo_seed: t.logo_seed as string };

  const history = (matches ?? []).map((m) => {
    const isA = m.team_a === id;
    const oppId = isA ? m.team_b : m.team_a;
    const myScore = isA ? m.score_a : m.score_b;
    const oppScore = isA ? m.score_b : m.score_a;
    const result = m.status !== "done" ? "—" : m.winner === id ? "V" : m.winner === null ? "N" : "D";
    return { stage: m.stage, group_label: m.group_label, opponent: tmap[oppId as string] ?? null, my_score: myScore, opp_score: oppScore, result, status: m.status };
  });

  return NextResponse.json({ team, members: members ?? [], history });
}
