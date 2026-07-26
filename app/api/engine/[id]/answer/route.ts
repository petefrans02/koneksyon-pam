import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { checkAnswer, calculateScore } from "@/lib/championship-engine";
import { getRoundSpec } from "@/lib/championship-rounds";
import type { ChampionshipQuestion } from "@/lib/championship-types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({})) as { answer_index?: unknown; question_index?: unknown; round_index?: unknown };
  const answer_index = body.answer_index;
  const client_question_index = typeof body.question_index === "number" ? body.question_index : null;
  const client_round_index = typeof body.round_index === "number" ? body.round_index : null;

  if (answer_index === undefined || typeof answer_index !== "number") {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

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
  const serverNow = new Date();

  const { data: state } = await db
    .from("championship_state")
    .select("phase, round_index, question_index, phase_ends_at, player_count")
    .eq("contest_id", id)
    .single();

  if (!state) return NextResponse.json({ error: "Championship not found" }, { status: 404 });

  // Allow answers during any active round phase (not lobby/podium/closed/cancelled)
  const inactivePhases = ["LOBBY", "PODIUM", "CLOSED", "CANCELLED", "COUNTDOWN", "CHAMPIONSHIP_INTRO"];
  if (inactivePhases.includes(state.phase)) {
    return NextResponse.json({ ok: false, too_late: true });
  }

  // Use client-provided indices (graceful late submission); fallback to server state
  const round_index = client_round_index !== null ? client_round_index : state.round_index;
  const question_index = client_question_index !== null ? client_question_index : state.question_index;
  const spec = getRoundSpec(round_index);

  // Duplicate check
  const { data: existing } = await db
    .from("championship_answers")
    .select("id")
    .eq("contest_id", id)
    .eq("player_id", user.id)
    .eq("round_index", round_index)
    .eq("question_index", question_index)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: false, already_submitted: true });
  }

  // Fetch full question (with correct answer) server-side
  const { data: roundData } = await db
    .from("contest_rounds")
    .select("questions, time_limit_sec")
    .eq("contest_id", id)
    .eq("round_number", round_index + 1)
    .single();

  const questions: ChampionshipQuestion[] = Array.isArray(roundData?.questions)
    ? (roundData.questions as ChampionshipQuestion[])
    : [];
  const roundTimeSec = typeof (roundData as { time_limit_sec?: number } | null)?.time_limit_sec === "number" && (roundData as { time_limit_sec: number }).time_limit_sec > 0
    ? (roundData as { time_limit_sec: number }).time_limit_sec
    : spec.time_per_question;
  const question = questions[question_index] ?? null;

  const is_correct = question ? checkAnswer(question, answer_index) : false;

  // Speed bonus based on time remaining in the server-controlled phase window
  const phase_ends_at = state.phase_ends_at ? new Date(state.phase_ends_at) : null;
  const time_remaining_ms = phase_ends_at
    ? Math.max(0, phase_ends_at.getTime() - serverNow.getTime())
    : 0;

  // Get streak
  const { data: recentAnswers } = await db
    .from("championship_answers")
    .select("is_correct")
    .eq("contest_id", id)
    .eq("player_id", user.id)
    .order("round_index", { ascending: false })
    .order("question_index", { ascending: false })
    .limit(10);

  let streak = 0;
  for (const a of recentAnswers ?? []) {
    if (a.is_correct) streak++;
    else break;
  }

  const scoring = calculateScore({
    is_correct,
    base_points: spec.base_points,
    time_per_question: roundTimeSec,
    time_remaining_ms,
    current_streak: streak,
  });

  const { error: insertErr } = await db.from("championship_answers").insert({
    contest_id: id,
    player_id: user.id,
    round_index,
    question_index,
    answer_index,
    is_correct,
    base_points: scoring.base,
    speed_bonus: scoring.speed_bonus,
    streak_bonus: scoring.streak_bonus,
    total_points: scoring.total,
    server_received_at: serverNow.toISOString(),
    phase_ends_at: state.phase_ends_at,
    was_on_time: true,
  });

  if (insertErr) {
    if (insertErr.code === "23505") {
      return NextResponse.json({ ok: false, already_submitted: true });
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Increment answer_count (best-effort)
  const currentAnswerCount = (state as Record<string, unknown>).answer_count as number ?? 0;
  try {
    await db
      .from("championship_state")
      .update({ answer_count: currentAnswerCount + 1, updated_at: serverNow.toISOString() })
      .eq("contest_id", id);
  } catch { /* non-critical */ }

  // Upsert leaderboard (running total)
  const { data: currentLb } = await db
    .from("championship_leaderboard")
    .select("total_score, total_correct")
    .eq("contest_id", id)
    .eq("player_id", user.id)
    .maybeSingle();

  const newTotal = (currentLb?.total_score ?? 0) + scoring.total;
  const newCorrect = (currentLb?.total_correct ?? 0) + (is_correct ? 1 : 0);

  try {
    await db.from("championship_leaderboard").upsert({
      contest_id: id,
      player_id: user.id,
      player_name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Joueur",
      player_avatar: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      total_score: newTotal,
      total_correct: newCorrect,
      updated_at: serverNow.toISOString(),
    }, { onConflict: "contest_id,player_id" });
  } catch { /* non-critical */ }

  return NextResponse.json({
    ok: true,
    is_correct,
    points_earned: scoring.total,
    new_total: newTotal,
  });
}
