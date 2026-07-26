import type { SupabaseClient } from "@supabase/supabase-js";
import { makeAIPlayer } from "@/lib/champ-data";

// Complète CHAQUE équipe jusqu'au nombre de joueurs demandé en ajoutant des IA.
// → Personne ne joue seul : une équipe humaine a toujours des coéquipiers IA.
export async function topUpTeamsWithAI(db: SupabaseClient, seasonId: string): Promise<number> {
  const { data: season } = await db.from("champ_seasons").select("players_per_team, ai_difficulty").eq("id", seasonId).maybeSingle();
  if (!season) return 0;
  const target = (season.players_per_team as number) || 10;
  const diff = ((season.ai_difficulty as string) || "mixed") as "easy" | "medium" | "hard" | "mixed";

  const { data: teams } = await db.from("champ_teams").select("id").eq("season_id", seasonId);
  const { data: members } = await db.from("champ_members").select("team_id").eq("season_id", seasonId);
  const cnt: Record<string, number> = {};
  for (const m of members ?? []) cnt[m.team_id as string] = (cnt[m.team_id as string] ?? 0) + 1;

  const toAdd: Record<string, unknown>[] = [];
  let ai = (members ?? []).length + 1;
  for (const t of teams ?? []) {
    let c = cnt[t.id as string] ?? 0;
    while (c < target) {
      const p = makeAIPlayer(ai++, diff);
      toAdd.push({ team_id: t.id, season_id: seasonId, user_id: null, is_ai: true, name: p.name, avatar: p.avatar, country: p.country, level: p.level, skill: p.skill, speed: p.speed });
      c++;
    }
  }
  for (let i = 0; i < toAdd.length; i += 500) await db.from("champ_members").insert(toAdd.slice(i, i + 500));
  return toAdd.length;
}
