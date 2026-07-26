import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { teamName, teamColor, logoSeed, makeAIPlayer, GROUP_LABELS } from "@/lib/champ-data";
import { topUpTeamsWithAI } from "@/lib/champ-fill";

// Crée un championnat complet : saison → équipes/groupes → membres (réels + IA) → matchs de poule.
export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }

  const body = await req.json().catch(() => ({})) as {
    name?: string; contest_id?: string;
    num_groups?: number; teams_per_group?: number; players_per_team?: number;
    ai_fill?: boolean; ai_difficulty?: "easy" | "medium" | "hard" | "mixed";
  };

  const name = (body.name ?? "").trim() || "Championnat Biblique";
  const numGroups = Math.max(1, Math.min(16, body.num_groups ?? 4));
  const teamsPerGroup = Math.max(2, Math.min(8, body.teams_per_group ?? 4));
  const playersPerTeam = Math.max(2, Math.min(20, body.players_per_team ?? 10));
  const aiFill = body.ai_fill !== false;
  const aiDifficulty = body.ai_difficulty ?? "mixed";
  const contestId = body.contest_id || null;

  const db = adminDb();
  const totalTeams = numGroups * teamsPerGroup;

  // 1) Saison
  const { data: season, error: sErr } = await db.from("champ_seasons").insert({
    name, contest_id: contestId, status: "group_stage",
    players_per_team: playersPerTeam, num_groups: numGroups, teams_per_group: teamsPerGroup,
    qualifiers_per_group: teamsPerGroup >= 4 ? 2 : 1,
    ai_fill: aiFill, ai_difficulty: aiDifficulty,
  }).select("id").single();
  if (sErr || !season) return NextResponse.json({ error: sErr?.message ?? "season" }, { status: 500 });
  const seasonId = season.id;

  // 2) Équipes (réparties dans les groupes en serpentin)
  const teamRows = Array.from({ length: totalTeams }, (_, i) => ({
    season_id: seasonId,
    name: teamName(i),
    number: i + 1,
    color: teamColor(i),
    logo_seed: logoSeed(teamName(i)),
    group_label: GROUP_LABELS[i % numGroups],
  }));
  const { data: teams, error: tErr } = await db.from("champ_teams").insert(teamRows).select("id, group_label");
  if (tErr || !teams) return NextResponse.json({ error: tErr?.message ?? "teams" }, { status: 500 });

  // 3) Vrais joueurs inscrits au concours source (si fourni)
  let realPlayers: { user_id: string; name: string; avatar: string | null }[] = [];
  if (contestId) {
    const { data: parts } = await db.from("contest_participants")
      .select("user_id, user_name, user_avatar").eq("contest_id", contestId);
    realPlayers = (parts ?? []).map((p) => ({
      user_id: p.user_id as string,
      name: (p.user_name as string) || "Joueur",
      avatar: (p.user_avatar as string | null) ?? null,
    }));
  }

  // 4) Membres : d'abord les vrais joueurs (une équipe après l'autre), puis IA
  const members: Record<string, unknown>[] = [];
  let realIdx = 0;
  let aiCounter = 0;
  for (const team of teams) {
    for (let slot = 0; slot < playersPerTeam; slot++) {
      if (realIdx < realPlayers.length) {
        const rp = realPlayers[realIdx++];
        members.push({
          team_id: team.id, season_id: seasonId, user_id: rp.user_id, is_ai: false,
          name: rp.name, avatar: rp.avatar, country: null, level: null, skill: 0.65, speed: 0.65,
        });
      } else if (aiFill) {
        const ai = makeAIPlayer(aiCounter++, aiDifficulty);
        members.push({
          team_id: team.id, season_id: seasonId, user_id: null, is_ai: true,
          name: ai.name, avatar: ai.avatar, country: ai.country, level: ai.level, skill: ai.skill, speed: ai.speed,
        });
      }
    }
  }
  if (members.length) {
    // insertion par lots de 500
    for (let i = 0; i < members.length; i += 500) {
      await db.from("champ_members").insert(members.slice(i, i + 500));
    }
  }
  // Garantie : chaque équipe atteint le nombre demandé (complète avec des IA) → personne ne joue seul.
  await topUpTeamsWithAI(db, seasonId);

  // 5) Matchs de poule — vraies JOURNÉES (méthode du carrousel) : à chaque journée,
  //    chaque équipe joue 1 match, et toutes les poules jouent la même journée en parallèle.
  //    round_number = numéro de journée, partagé par toutes les poules.
  const roundRobin = (ids: string[]): [string, string][][] => {
    const arr: (string | null)[] = [...ids];
    if (arr.length % 2 === 1) arr.push(null); // équipe au repos si nombre impair
    const n = arr.length;
    const rounds: [string, string][][] = [];
    let rot = arr.slice(1);
    for (let r = 0; r < n - 1; r++) {
      const lineup = [arr[0], ...rot];
      const day: [string, string][] = [];
      for (let i = 0; i < n / 2; i++) {
        const t1 = lineup[i], t2 = lineup[n - 1 - i];
        if (t1 && t2) day.push([t1, t2]);
      }
      rounds.push(day);
      rot = [rot[rot.length - 1], ...rot.slice(0, rot.length - 1)];
    }
    return rounds;
  };
  const matches: Record<string, unknown>[] = [];
  for (const g of GROUP_LABELS.slice(0, numGroups)) {
    const gt = teams.filter((t) => t.group_label === g).map((t) => t.id as string);
    roundRobin(gt).forEach((day, r) => {
      for (const [a, b] of day) {
        matches.push({
          season_id: seasonId, stage: "group", group_label: g, round_number: r + 1,
          team_a: a, team_b: b, status: "scheduled",
        });
      }
    });
  }
  if (matches.length) {
    for (let i = 0; i < matches.length; i += 500) {
      await db.from("champ_matches").insert(matches.slice(i, i + 500));
    }
  }

  return NextResponse.json({
    ok: true, season_id: seasonId,
    teams: totalTeams, groups: numGroups, members: members.length, matches: matches.length,
    real_players: realPlayers.length, ai_players: aiCounter,
  });
}
