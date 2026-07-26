import type { SupabaseClient } from "@supabase/supabase-js";
import { GROUP_LABELS } from "@/lib/champ-data";

// Génère le TOUR SUIVANT du tableau final : poules terminées → quarts → demies →
// finale + petite finale → couronnement.
//
// Extrait de la route admin pour que le championnat puisse s'enchaîner TOUT SEUL
// (appelé par advanceSeason) autant que déclenché à la main par l'admin.
//
// Ne programme PAS la journée suivante : c'est à l'appelant de faire
// scheduleNextWave() ensuite. Cela évite un import circulaire avec champ-sequence.

export type KnockoutResult =
  | { ok: true; phase: "quarter" | "semi" | "final"; created: number }
  | { ok: true; phase: "finished"; champion: string; vice: string; third: string | null }
  | { ok: false; reason: "not_found" | "groups_pending" | "not_enough_teams" | "round_in_progress" };

export async function advanceKnockout(db: SupabaseClient, seasonId: string): Promise<KnockoutResult> {
  const { data: season } = await db.from("champ_seasons").select("*").eq("id", seasonId).maybeSingle();
  if (!season) return { ok: false, reason: "not_found" };

  const { data: groupMatches } = await db.from("champ_matches").select("status").eq("season_id", seasonId).eq("stage", "group");
  if ((groupMatches ?? []).length && (groupMatches ?? []).some((m) => m.status !== "done")) {
    return { ok: false, reason: "groups_pending" };
  }

  const { data: teams } = await db.from("champ_teams").select("*").eq("season_id", seasonId);
  const nameById: Record<string, string> = {};
  for (const t of teams ?? []) nameById[t.id as string] = t.name as string;

  const { data: ko } = await db.from("champ_matches")
    .select("id, stage, slot, team_a, team_b, winner, status")
    .eq("season_id", seasonId).neq("stage", "group").order("stage").order("slot");
  const byStage = (s: string) => (ko ?? []).filter((m) => m.stage === s);
  const allDone = (arr: { status: string }[]) => arr.length > 0 && arr.every((m) => m.status === "done");
  const mk = (rows: Record<string, unknown>[]) => db.from("champ_matches").insert(rows);
  const numGroups = season.num_groups as number;

  // ── 1) Pas encore de tableau → créer un VRAI bracket (puissance de 2, têtes de série) ──
  if ((ko ?? []).length === 0) {
    const cmp = (a: Record<string, number>, b: Record<string, number>) =>
      b.points - a.points || (b.score_for - b.score_against) - (a.score_for - a.score_against) || ((b.correct_total ?? 0) - (a.correct_total ?? 0));
    const winners: Record<string, unknown>[] = [], runners: Record<string, unknown>[] = [];
    for (const g of GROUP_LABELS.slice(0, numGroups)) {
      const gt = (teams ?? []).filter((t) => t.group_label === g).sort((a, b) => cmp(a as Record<string, number>, b as Record<string, number>));
      if (gt[0]) winners.push(gt[0]);
      if (gt[1]) runners.push(gt[1]);
    }
    winners.sort((a, b) => cmp(a as Record<string, number>, b as Record<string, number>));
    runners.sort((a, b) => cmp(a as Record<string, number>, b as Record<string, number>));
    const seeds = [...winners, ...runners].map((t) => (t as { id: string }).id);
    if (seeds.length < 2) return { ok: false, reason: "not_enough_teams" };

    let size = 2; while (size * 2 <= seeds.length) size *= 2;
    size = Math.min(size, 8);
    const bracket = seeds.slice(0, size);
    const bracketSet = new Set(bracket);
    for (const t of teams ?? []) if (!bracketSet.has(t.id as string)) await db.from("champ_teams").update({ eliminated: true }).eq("id", t.id);

    const firstStage = size >= 8 ? "quarter" : size >= 4 ? "semi" : "final";
    const rows = [];
    for (let i = 0; i < size / 2; i++) rows.push({ season_id: seasonId, stage: firstStage, slot: i, team_a: bracket[i], team_b: bracket[size - 1 - i], status: "scheduled" });
    await mk(rows);
    return { ok: true, phase: firstStage as "quarter" | "semi" | "final", created: rows.length };
  }

  // ── 2) Quarts finis → DEMIES ──
  const quarters = byStage("quarter");
  if (quarters.length > 0 && allDone(quarters) && byStage("semi").length === 0) {
    const w = quarters.sort((a, b) => (a.slot as number) - (b.slot as number)).map((m) => m.winner as string);
    const rows = [];
    for (let i = 0; i < w.length; i += 2) rows.push({ season_id: seasonId, stage: "semi", slot: i / 2, team_a: w[i], team_b: w[i + 1], status: "scheduled" });
    await mk(rows);
    return { ok: true, phase: "semi", created: rows.length };
  }

  // ── 3) Demies finies → FINALE + PETITE FINALE ──
  const semis = byStage("semi");
  if (semis.length > 0 && allDone(semis) && byStage("final").length === 0) {
    const s = semis.sort((a, b) => (a.slot as number) - (b.slot as number));
    const winnersKo = s.map((m) => m.winner as string);
    const losers = s.map((m) => (m.winner === m.team_a ? m.team_b : m.team_a) as string);
    const rows = [{ season_id: seasonId, stage: "final", slot: 0, team_a: winnersKo[0], team_b: winnersKo[1], status: "scheduled" }];
    if (losers.length === 2) rows.push({ season_id: seasonId, stage: "third", slot: 0, team_a: losers[0], team_b: losers[1], status: "scheduled" });
    await mk(rows);
    return { ok: true, phase: "final", created: rows.length };
  }

  // ── 4) Finale jouée → COURONNEMENT ──
  const final = byStage("final");
  const third = byStage("third");
  if (final.length > 0 && allDone(final)) {
    const f = final[0];
    const champion = f.winner as string;
    const vice = (f.winner === f.team_a ? f.team_b : f.team_a) as string;
    let t3: string | null = null, t4: string | null = null;
    if (third.length > 0 && third[0].status === "done") {
      t3 = third[0].winner as string;
      t4 = (third[0].winner === third[0].team_a ? third[0].team_b : third[0].team_a) as string;
    }
    for (const t of teams ?? []) {
      const tid = t.id as string;
      const rank = tid === champion ? 1 : tid === vice ? 2 : tid === t3 ? 3 : tid === t4 ? 4 : null;
      await db.from("champ_teams").update({ final_rank: rank, eliminated: tid !== champion }).eq("id", tid);
    }
    await db.from("champ_seasons").update({ status: "finished" }).eq("id", seasonId);
    return { ok: true, phase: "finished", champion: nameById[champion], vice: nameById[vice], third: t3 ? nameById[t3] : null };
  }

  return { ok: false, reason: "round_in_progress" };
}
