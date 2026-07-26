import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { launchChampionship } from "@/lib/championship-launch";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get contest info (auto_launch_count, organizer_id, allow_rejoin)
  const { data: contest } = await db
    .from("contests")
    .select("auto_launch_count, organizer_id, status, allow_rejoin")
    .eq("id", id)
    .single();

  const { data: existing } = await db
    .from("championship_state")
    .select("id, phase, player_count")
    .eq("contest_id", id)
    .maybeSingle();

  // If championship is active and rejoin is disabled, block returning players
  if (
    existing &&
    !["LOBBY", "CLOSED", "CANCELLED", "PODIUM"].includes(existing.phase) &&
    contest?.allow_rejoin === false
  ) {
    const { count } = await db
      .from("contest_participants")
      .select("*", { count: "exact", head: true })
      .eq("contest_id", id)
      .eq("user_id", user.id);
    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: "REJOIN_NOT_ALLOWED", phase: existing.phase }, { status: 403 });
    }
  }

  const STALE_PHASES = ["CLOSED", "CANCELLED", "PODIUM"];
  const contestIsUpcoming = contest?.status === "upcoming";

  // Register the player as a participant (idempotent — safe to call every poll)
  const userName = (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "Joueur";
  const userAvatar = (user.user_metadata?.avatar_url as string) ?? null;
  await db.from("contest_participants").upsert(
    { contest_id: id, user_id: user.id, user_name: userName, user_avatar: userAvatar },
    { onConflict: "contest_id,user_id", ignoreDuplicates: true }
  );

  if (!existing) {
    try {
      await db.from("championship_state").insert({
        contest_id: id,
        phase: "LOBBY",
        round_index: 0,
        question_index: 0,
        player_count: 1,
        answer_count: 0,
        metadata: {},
      });
    } catch { /* may already exist from concurrent request */ }
  } else if (contestIsUpcoming && STALE_PHASES.includes(existing.phase)) {
    // Contest was re-opened for a new session — reset stale state back to LOBBY
    await db.from("championship_state")
      .update({
        phase: "LOBBY",
        round_index: 0,
        question_index: 0,
        answer_count: 0,
        phase_ends_at: null,
        metadata: {},
        updated_at: new Date().toISOString(),
      })
      .eq("contest_id", id);
  } else if (existing.phase === "LOBBY") {
    const { count } = await db
      .from("contest_participants")
      .select("*", { count: "exact", head: true })
      .eq("contest_id", id);

    const newCount = count ?? existing.player_count;

    try {
      await db.from("championship_state")
        .update({ player_count: newCount, updated_at: new Date().toISOString() })
        .eq("contest_id", id);
    } catch { /* non-critical */ }

    // Auto-launch removed: organizer launches manually when ready
  }

  const { data: participants } = await db
    .from("contest_participants")
    .select("user_name, user_avatar")
    .eq("contest_id", id)
    .limit(50);

  const { data: state } = await db
    .from("championship_state")
    .select("phase, player_count")
    .eq("contest_id", id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    phase: state?.phase ?? "LOBBY",
    player_count: state?.player_count ?? 0,
    participants: participants ?? [],
  });
}
