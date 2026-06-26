import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { question_index, answer_index, time_taken } = await request.json();

  const db = getDb();

  // Get contest and participant
  const [contestRes, participantRes, questionRes] = await Promise.all([
    db.from("contests").select("status, current_question").eq("id", id).single(),
    db.from("contest_participants").select("*").eq("contest_id", id).eq("user_id", user.id).single(),
    db.from("contest_questions").select("correct_answer, time_limit").eq("contest_id", id).eq("order_num", question_index).single(),
  ]);

  if (!contestRes.data || contestRes.data.status !== "active") {
    return Response.json({ error: "Contest not active" }, { status: 400 });
  }
  if (contestRes.data.current_question !== question_index) {
    return Response.json({ error: "Wrong question index" }, { status: 400 });
  }
  if (!participantRes.data) {
    return Response.json({ error: "Not a participant" }, { status: 403 });
  }
  if (!questionRes.data) {
    return Response.json({ error: "Question not found" }, { status: 404 });
  }

  const participant = participantRes.data;
  const question = questionRes.data;

  // Check if already answered this question
  const answers: { q: number; a: number; correct: boolean; time: number }[] = participant.answers || [];
  if (answers.find(a => a.q === question_index)) {
    return Response.json({ error: "Already answered" }, { status: 400 });
  }

  const isCorrect = answer_index === question.correct_answer;
  const timeFraction = Math.max(0, 1 - (time_taken / (question.time_limit * 1000)));
  const points = isCorrect ? Math.round(100 + timeFraction * 50) : 0;

  const newAnswers = [...answers, { q: question_index, a: answer_index, correct: isCorrect, time: time_taken }];
  const newScore = (participant.score || 0) + points;

  await db.from("contest_participants")
    .update({ answers: newAnswers, score: newScore })
    .eq("contest_id", id)
    .eq("user_id", user.id);

  return Response.json({ ok: true, correct: isCorrect, points, correct_answer: question.correct_answer });
}
