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
  const { round_number, question_index } = await req.json().catch(() => ({})) as {
    round_number?: number;
    question_index?: number;
  };

  if (round_number === undefined || question_index === undefined) {
    return NextResponse.json({ error: "round_number et question_index requis" }, { status: 400 });
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
  if (question_index < 0 || question_index >= questions.length) {
    return NextResponse.json({ error: "Index invalide" }, { status: 400 });
  }

  questions.splice(question_index, 1);

  const { error } = await db
    .from("contest_rounds")
    .update({ questions })
    .eq("contest_id", id)
    .eq("round_number", round_number);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, questions });
}
