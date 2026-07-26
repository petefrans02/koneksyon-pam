import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(req); } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({})) as {
    round_number?: number;
    question_index?: number;
    question_data?: Record<string, unknown>;
  };
  const { round_number, question_index, question_data } = body;

  if (round_number === undefined || question_index === undefined || !question_data) {
    return NextResponse.json({ error: "round_number, question_index, question_data requis" }, { status: 400 });
  }

  const db = adminDb();
  const { data: round } = await db
    .from("contest_rounds")
    .select("questions")
    .eq("contest_id", id)
    .eq("round_number", round_number)
    .single();

  if (!round) return NextResponse.json({ error: "Manche introuvable" }, { status: 404 });

  const questions: unknown[] = Array.isArray(round.questions) ? [...round.questions] : [];

  if (question_index === questions.length) {
    questions.push(question_data);
  } else if (question_index >= 0 && question_index < questions.length) {
    questions[question_index] = question_data;
  } else {
    return NextResponse.json({ error: "Index invalide" }, { status: 400 });
  }

  const { error } = await db
    .from("contest_rounds")
    .update({ questions })
    .eq("contest_id", id)
    .eq("round_number", round_number);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, questions });
}
