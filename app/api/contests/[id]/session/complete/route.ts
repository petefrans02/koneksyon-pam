import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-auth";
import { verifySessionToken } from "@/lib/contest-session";
import { calcFinalBonuses, computeAccuracy } from "@/lib/contest-scoring";
import type { AnswerRecord } from "@/lib/contest-scoring";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { session_token } = await request.json();

  const session = verifySessionToken(session_token);
  if (!session || session.contestId !== id) {
    return NextResponse.json({ error: "Invalid session" }, { status: 403 });
  }

  const db = adminDb();

  const { data: userSession } = await db
    .from("contest_sessions")
    .select("answers, score, status, started_at")
    .eq("contest_id", id)
    .eq("user_id", session.userId)
    .single();

  if (!userSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (userSession.status === "completed") {
    return NextResponse.json({ ok: true, already_completed: true });
  }

  const { data: questions } = await db
    .from("contest_questions")
    .select("id")
    .eq("contest_id", id);

  const totalQuestions = questions?.length ?? 0;
  const answers: AnswerRecord[] = userSession.answers || [];
  const { perfectBonus } = calcFinalBonuses(answers, totalQuestions);
  const completedAt = new Date();
  const startedAt = userSession.started_at ? new Date(userSession.started_at) : completedAt;
  const completionTimeSec = Math.round((completedAt.getTime() - startedAt.getTime()) / 1000);
  const finalScore = (userSession.score || 0) + perfectBonus;
  const accuracy = computeAccuracy(answers);

  await db.from("contest_sessions")
    .update({
      status: "completed",
      completed_at: completedAt.toISOString(),
      score: finalScore,
      perfect_bonus: perfectBonus,
    })
    .eq("contest_id", id)
    .eq("user_id", session.userId);

  const { data: profile } = await db
    .from("profiles")
    .select("country")
    .eq("id", session.userId)
    .single();

  await db.from("contest_leaderboard").upsert({
    contest_id: id,
    user_id: session.userId,
    score: finalScore,
    completion_time_seconds: completionTimeSec,
    accuracy_pct: accuracy,
    country: profile?.country ?? null,
    computed_at: completedAt.toISOString(),
  }, { onConflict: "contest_id,user_id" });

  return NextResponse.json({
    ok: true,
    final_score: finalScore,
    perfect_bonus: perfectBonus,
    accuracy,
    completion_time_seconds: completionTimeSec,
  });
}
