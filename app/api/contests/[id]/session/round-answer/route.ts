import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-auth";
import { verifySessionToken } from "@/lib/contest-session";

type QRecord = Record<string, unknown>;

// ── Scoring helpers ────────────────────────────────────────────────────────────

function scoreMcq(questions: QRecord[], answers: number[]): { correct: number; total: number } {
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] !== undefined && answers[i] === questions[i].correct) correct++;
  }
  return { correct, total: questions.length };
}

function scoreTf(questions: QRecord[], answers: boolean[]): { correct: number; total: number } {
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] !== undefined && answers[i] === questions[i].is_true) correct++;
  }
  return { correct, total: questions.length };
}

function scoreFill(questions: QRecord[], answers: number[]): { correct: number; total: number } {
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] !== undefined && answers[i] === questions[i].correct) correct++;
  }
  return { correct, total: questions.length };
}

// match: answers = flat array where answers[i] = index of right item matched to left[i]
// correct match: answers[i] === i (identity pairing — left[0] matches right[0], etc.)
function scoreMatch(questions: QRecord[], answers: number[]): { correct: number; total: number } {
  let correct = 0;
  const q = questions[0];
  if (!q) return { correct: 0, total: 0 };
  const pairs = q.pairs as QRecord[];
  for (let i = 0; i < pairs.length; i++) {
    if (answers[i] !== undefined && Number(answers[i]) === i) correct++;
  }
  return { correct, total: pairs.length };
}

// order_verse / chrono: answers = array of ids in submitted order
function scoreOrder(questions: QRecord[], answers: string[][]): { correct: number; total: number } {
  let totalPoints = 0;
  let maxPoints = 0;
  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    const submitted = answers[qi] ?? [];
    let correctOrder: string[];
    if (q.correct_order) {
      correctOrder = q.correct_order as string[];
    } else if (Array.isArray(q.events)) {
      correctOrder = (q.events as QRecord[])
        .sort((a, b) => (a.correct_position as number) - (b.correct_position as number))
        .map(e => e.id as string);
    } else {
      continue;
    }
    maxPoints += correctOrder.length;
    for (let i = 0; i < correctOrder.length; i++) {
      if (submitted[i] === correctOrder[i]) totalPoints += 1;
      else if (submitted.includes(correctOrder[i]) && Math.abs(submitted.indexOf(correctOrder[i]) - i) === 1) {
        totalPoints += 0.5;
      }
    }
  }
  // Return as fraction of total positions correct
  return { correct: Math.round(totalPoints), total: maxPoints };
}

function computeRoundScore(
  roundType: string,
  questions: QRecord[],
  answers: unknown,
  pointsPerQ: number,
  timeTakenSec: number,
  timeLimitSec: number
): { score: number; correct: number; total: number } {
  let correct = 0;
  let total = 0;

  switch (roundType) {
    case "mcq":
    case "character":
    case "location":
    case "book":
    case "finale": {
      const r = scoreMcq(questions, answers as number[]);
      correct = r.correct; total = r.total;
      break;
    }
    case "tf": {
      const r = scoreTf(questions, answers as boolean[]);
      correct = r.correct; total = r.total;
      break;
    }
    case "fill": {
      const r = scoreFill(questions, answers as number[]);
      correct = r.correct; total = r.total;
      break;
    }
    case "match": {
      const r = scoreMatch(questions, answers as number[]);
      correct = r.correct; total = r.total;
      break;
    }
    case "order_verse":
    case "chrono": {
      const r = scoreOrder(questions, answers as string[][]);
      correct = r.correct; total = r.total;
      break;
    }
    default:
      total = questions.length;
  }

  let baseScore = correct * pointsPerQ;
  // Speed bonus: +20% if finished in under half the time limit
  if (timeTakenSec < timeLimitSec * 0.5) {
    baseScore = Math.round(baseScore * 1.2);
  }

  return { score: baseScore, correct, total };
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { session_token, round_number, answers, time_taken_sec } = body as {
    session_token: string;
    round_number: number;
    answers: unknown;
    time_taken_sec: number;
  };

  // Verify token
  const session = verifySessionToken(session_token);
  if (!session || session.contestId !== id) {
    return NextResponse.json({ error: "Invalid session token" }, { status: 403 });
  }

  const db = adminDb();

  // Check contest is active and within time
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
      return NextResponse.json({ error: "Contest time has expired" }, { status: 400 });
    }
  }

  // Get user session
  const { data: userSession } = await db
    .from("contest_sessions")
    .select("score, status, round_scores, current_round")
    .eq("contest_id", id)
    .eq("user_id", session.userId)
    .single();

  if (!userSession || userSession.status !== "playing") {
    return NextResponse.json({ error: "No active play session" }, { status: 403 });
  }

  const roundScores: QRecord[] = userSession.round_scores ?? [];
  if (roundScores.find(rs => rs.round_number === round_number)) {
    return NextResponse.json({ error: "Round already submitted" }, { status: 400 });
  }

  // Get the round
  const { data: round } = await db
    .from("contest_rounds")
    .select("round_type, questions, points_per_q, time_limit_sec")
    .eq("contest_id", id)
    .eq("round_number", round_number)
    .single();

  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const questions = (round.questions as QRecord[]) ?? [];
  const { score, correct, total } = computeRoundScore(
    round.round_type,
    questions,
    answers,
    round.points_per_q ?? 100,
    time_taken_sec ?? 0,
    round.time_limit_sec ?? 150
  );

  // Build correct answers + explanations for review
  const correctAnswers = questions.map(q => ({
    correct: q.correct,
    correct_order: q.correct_order,
    is_true: q.is_true,
    pairs: q.pairs,
    events: (q.events as QRecord[])?.map(e => ({ id: e.id, correct_position: e.correct_position })),
    explanation: q.explanation,
    ref: q.ref,
  }));

  // Persist
  const newRoundScore = {
    round_number,
    round_type: round.round_type,
    score,
    correct,
    total,
    time_taken_sec,
    submitted_at: new Date().toISOString(),
  };

  await db.from("contest_sessions")
    .update({
      round_scores: [...roundScores, newRoundScore],
      score: (userSession.score ?? 0) + score,
      current_round: round_number + 1,
    })
    .eq("contest_id", id)
    .eq("user_id", session.userId);

  return NextResponse.json({
    ok: true,
    round_number,
    score,
    correct,
    total,
    new_total_score: (userSession.score ?? 0) + score,
    correct_answers: correctAnswers,
  });
}
