import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PHASE_DURATIONS } from "@/lib/championship-rounds";

export function adminDb(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Launches a championship by transitioning its state to COUNTDOWN.
 * Can be called from the manual launch route or auto-launch in join-lobby.
 * Returns null on success, error string on failure.
 */
export async function launchChampionship(
  contestId: string,
  launchedBy: string,
  db?: SupabaseClient
): Promise<{ ok: boolean; ends_at?: string; error?: string }> {
  const client = db ?? adminDb();

  const { data: contest } = await client
    .from("contests")
    .select("id, status, title")
    .eq("id", contestId)
    .single();

  if (!contest) return { ok: false, error: "Contest not found" };
  if (contest.status === "active") return { ok: true }; // already launched, idempotent

  // Wipe stale data from any previous run so answers/scores start clean.
  // On REMET À ZÉRO le classement au lieu de le supprimer, pour conserver
  // l'affiliation d'équipe (team_id) des joueurs déjà inscrits à leur église/association.
  await Promise.allSettled([
    client.from("championship_answers").delete().eq("contest_id", contestId),
    client.from("championship_round_results").delete().eq("contest_id", contestId),
    client.from("championship_leaderboard")
      .update({ total_score: 0, total_correct: 0, current_rank: null })
      .eq("contest_id", contestId),
  ]);

  const { count: playerCount } = await client
    .from("contest_participants")
    .select("*", { count: "exact", head: true })
    .eq("contest_id", contestId);

  const now = new Date();
  const countdownEndsAt = new Date(now.getTime() + PHASE_DURATIONS.COUNTDOWN);

  const { error: stateErr } = await client.from("championship_state").upsert(
    {
      contest_id: contestId,
      phase: "COUNTDOWN",
      round_index: 0,
      question_index: 0,
      phase_started_at: now.toISOString(),
      phase_ends_at: countdownEndsAt.toISOString(),
      player_count: playerCount ?? 0,
      answer_count: 0,
      metadata: { contest_title: contest.title, player_count: playerCount ?? 0 },
      launched_by: launchedBy,
      launched_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    { onConflict: "contest_id" }
  );

  if (stateErr) return { ok: false, error: stateErr.message };

  await client.from("contests").update({ status: "active" }).eq("id", contestId);

  try {
    await client.from("championship_events").insert({
      contest_id: contestId,
      event_type: "auto_launch",
      actor_id: launchedBy,
      payload: { player_count: playerCount, auto: true },
    });
  } catch { /* non-critical */ }

  return { ok: true, ends_at: countdownEndsAt.toISOString() };
}
