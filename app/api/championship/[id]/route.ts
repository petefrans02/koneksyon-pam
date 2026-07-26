import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { advanceSeason } from "@/lib/champ-sequence";

// GET — détail d'un championnat : saison + équipes par groupe (classement) + matchs.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: season } = await db.from("champ_seasons").select("*").eq("id", id).maybeSingle();
  if (!season) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fait avancer l'horloge : démarre automatiquement le prochain match quand son heure arrive.
  const seq = await advanceSeason(db, id);

  const { data: teams } = await db.from("champ_teams").select("*").eq("season_id", id);
  const { data: matchesRaw } = await db.from("champ_matches").select("*").eq("season_id", id).order("stage").order("round_number");

  // Progression des joueurs pour les matchs EN COURS : combien de vrais joueurs ont fini (X/Y).
  const liveMatches = (matchesRaw ?? []).filter((m) => m.status === "live");
  const humanDone: Record<string, number> = {}, humanTotal: Record<string, number> = {};
  if (liveMatches.length) {
    const teamIds = Array.from(new Set(liveMatches.flatMap((m) => [m.team_a as string, m.team_b as string])));
    const { data: reals } = await db.from("champ_members").select("id, team_id").in("team_id", teamIds).eq("is_ai", false);
    const realByTeam: Record<string, string[]> = {};
    for (const r of reals ?? []) (realByTeam[r.team_id as string] ??= []).push(r.id as string);
    const { data: subs } = await db.from("champ_player_results").select("match_id, member_id").in("match_id", liveMatches.map((m) => m.id));
    const subByMatch: Record<string, Set<string>> = {};
    for (const s of subs ?? []) (subByMatch[s.match_id as string] ??= new Set()).add(s.member_id as string);
    for (const m of liveMatches) {
      const realIds = [...(realByTeam[m.team_a as string] ?? []), ...(realByTeam[m.team_b as string] ?? [])];
      humanTotal[m.id as string] = realIds.length;
      humanDone[m.id as string] = realIds.filter((idd) => (subByMatch[m.id as string] ?? new Set()).has(idd)).length;
    }
  }
  const matches = (matchesRaw ?? []).map((m) => ({ ...m, human_done: humanDone[m.id as string] ?? null, human_total: humanTotal[m.id as string] ?? null }));

  // Compte des membres par équipe (réels / IA)
  const { data: members } = await db.from("champ_members").select("team_id, is_ai").eq("season_id", id);
  const memberCount: Record<string, { real: number; ai: number }> = {};
  for (const m of members ?? []) {
    const tid = m.team_id as string;
    if (!memberCount[tid]) memberCount[tid] = { real: 0, ai: 0 };
    if (m.is_ai) memberCount[tid].ai++; else memberCount[tid].real++;
  }

  // Regroupe les équipes par groupe, triées par classement (points, diff, correct)
  const groups: Record<string, unknown[]> = {};
  for (const t of teams ?? []) {
    const g = (t.group_label as string) || "?";
    if (!groups[g]) groups[g] = [];
    groups[g].push({ ...t, members: memberCount[t.id as string] ?? { real: 0, ai: 0 } });
  }
  for (const g of Object.keys(groups)) {
    groups[g].sort((a, b) => {
      const A = a as Record<string, number>, B = b as Record<string, number>;
      return B.points - A.points
        || (B.score_for - B.score_against) - (A.score_for - A.score_against)
        || B.correct_total - A.correct_total
        || A.avg_time - B.avg_time;
    });
  }

  // `server_now` permet a la diffusion de se caler sur l'horloge du serveur,
  // exactement comme les joueurs : sans ca, un televiseur dont l'heure derive
  // de quelques secondes affiche une autre question que les joueurs.
  return NextResponse.json({ season, groups, matches: matches ?? [], server_now: new Date().toISOString() });
}
