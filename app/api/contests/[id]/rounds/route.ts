import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-auth";

type QRecord = Record<string, unknown>;

function stripAnswers(questions: QRecord[], type: string): QRecord[] {
  return questions.map(q => {
    const stripped = { ...q };
    delete stripped.correct;
    delete stripped.correct_order;
    delete stripped.explanation;
    if (type === "tf") delete stripped.is_true;
    if (type === "chrono" && Array.isArray(q.events)) {
      stripped.events = (q.events as QRecord[]).map(e => {
        const ev = { ...e };
        delete ev.correct_position;
        return ev;
      });
    }
    return stripped;
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = adminDb();

  const { data: contest } = await db
    .from("contests")
    .select("status")
    .eq("id", id)
    .single();

  const isCompleted = contest?.status === "completed";

  const { data: rounds, error } = await db
    .from("contest_rounds")
    .select("id, round_number, round_type, title, instructions, color_theme, icon, time_limit_sec, points_per_q, questions")
    .eq("contest_id", id)
    .order("round_number");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rounds) return NextResponse.json({ rounds: [] });

  const safeRounds = rounds.map(r => ({
    ...r,
    questions: isCompleted
      ? r.questions
      : stripAnswers((r.questions as QRecord[]) ?? [], r.round_type),
  }));

  return NextResponse.json({ rounds: safeRounds, total: safeRounds.length });
}
