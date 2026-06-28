import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-auth";
import { verifySessionToken } from "@/lib/contest-session";
import { calculatePoints } from "@/lib/contest-scoring";
import type { AnswerRecord } from "@/lib/contest-scoring";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { session_token, question_index, answer_index, time_taken_ms } = body;

  const session = verifySessionToken(session_token);
  if (!session || session.contestId !== id) {
    return NextResponse.json({ error: "Invalid session" }, { status: 403 });
  }

  const db = adminDb();

  const { data: contest } = await db
    .from("contests")
    .select("status, started_at, duration_minutes")
    .eq("id", id)
    .single();

  if (!contest || contest.status !== "active") {
    return NextResponse.json({ error: "Contest not active" }, { status: 400 });
  }

  if (contest.started_at) {
    const elapsedMin = (Date.now() - new Date(contest.started_at).getTime()) / 60000;
    if (elapsedMin >= (contest.duration_minutes ?? 45)) {
      return NextResponse.json({ error: "Time expired" }, { status: 400 });
    }
  }

  const { data: userSession } = await db
    .from("contest_sessions")
    .select("answers, score, status, current_question_index")
    .eq("contest_id", id)
    .eq("user_id", session.userId)
    .single();

  if (!userSession || userSession.status !== "playing") {
    return NextResponse.json({ error: "No active session" }, { status: 403 });
  }

  const answers: AnswerRecord[] = userSession.answers || [];
  if (answers.find(a => a.question_index === question_index)) {
    return NextResponse.json({ error: "Already answered" }, { status: 400 });
  }

  const { data: question } = await db
    .from("contest_questions")
    .select("correct_answer, time_limit")
    .eq("contest_id", id)
    .eq("order_num", question_index)
    .single();

  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const isCorrect = answer_index === question.correct_answer;
  const currentStreak = (() => {
    let s = 0;
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].correct) s++; else break;
    }
    return s;
  })();

  const { total: points, speedBonus, streakBonus } = calculatePoints(
    isCorrect, time_taken_ms, question.time_limit || 30, currentStreak
  );

  const newAnswer: AnswerRecord = {
    question_index,
    answer_index,
    correct: isCorrect,
    time_taken_ms,
    points_earned: points,
  };

  const newAnswers = [...answers, newAnswer];
  const newScore = (userSession.score || 0) + points;

  await db.from("contest_sessions")
    .update({
      answers: newAnswers,
      score: newScore,
      current_question_index: question_index + 1,
    })
    .eq("contest_id", id)
    .eq("user_id", session.userId);

  return NextResponse.json({
    ok: true,
    correct: isCorrect,
    correct_answer: question.correct_answer,
    points,
    speed_bonus: speedBonus,
    streak_bonus: streakBonus,
    new_score: newScore,
  });
}
