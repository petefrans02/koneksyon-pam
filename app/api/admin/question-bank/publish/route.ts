/**
 * Publier les questions d'une manche vers contest_rounds (moteur live)
 * POST /api/admin/question-bank/publish
 * Body: { contest_id, round_number }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const { contest_id, round_number } = await req.json();
  if (!contest_id || !round_number) return NextResponse.json({ error: "contest_id + round_number requis" }, { status: 400 });

  const db = adminDb();

  // Récupérer la kp_championship_round
  const { data: kpRound } = await db.from("kp_championship_rounds")
    .select("id, round_type, title, instructions, color_theme, icon, time_limit_sec, points_per_q")
    .eq("contest_id", contest_id)
    .eq("round_number", round_number)
    .single();

  if (!kpRound) return NextResponse.json({ error: "Manche non trouvée" }, { status: 404 });

  // Récupérer les questions assignées triées par order_num
  const { data: assignments } = await db.from("kp_championship_questions")
    .select("order_num, kp_questions(*)")
    .eq("round_id", kpRound.id)
    .eq("is_active", true)
    .order("order_num");

  if (!assignments?.length) return NextResponse.json({ error: "Aucune question assignée à cette manche" }, { status: 400 });

  // Convertir en format contest_rounds.questions
  const questions = assignments.map(a => {
    const q = a.kp_questions as unknown as Record<string, unknown>;
    const ltext = (v: unknown) => v && typeof v === "object" ? v : { fr: "", ht: "", en: "" };

    const base = {
      type:      q.type,
      ref:       q.reference,
    };

    if (q.type === "tf") {
      return { ...base, statement: ltext(q.statement), is_true: q.is_true };
    }
    if (q.type === "fill") {
      return { ...base, verse: ltext(q.verse),
        fill_options: [q.option_a, q.option_b, q.option_c, q.option_d].map(ltext),
        correct: q.correct_answer };
    }
    if (q.type === "character" || q.type === "location" || q.type === "book") {
      return { ...base, clues: q.clues ?? [],
        options: [q.option_a, q.option_b, q.option_c, q.option_d].map(ltext),
        correct: q.correct_answer };
    }
    // mcq / finale / default
    return { ...base, q: ltext(q.question),
      options: [q.option_a, q.option_b, q.option_c, q.option_d].map(ltext),
      correct: q.correct_answer };
  });

  // Upsert dans contest_rounds
  const { error } = await db.from("contest_rounds").upsert({
    contest_id,
    round_number,
    round_type:     kpRound.round_type,
    title:          kpRound.title,
    instructions:   kpRound.instructions,
    color_theme:    kpRound.color_theme,
    icon:           kpRound.icon,
    time_limit_sec: kpRound.time_limit_sec,
    points_per_q:   kpRound.points_per_q,
    questions,
  }, { onConflict: "contest_id,round_number" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, published: questions.length });
}
