import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const level   = searchParams.get("level");
  const limit   = Math.min(Number(searchParams.get("limit") ?? 10), 50);

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = db.from("kp_questions")
    .select("id, type, difficulty, question, option_a, option_b, option_c, option_d, correct_answer, subject, school_level")
    .eq("status", "published")
    .limit(limit);

  if (subject) query = query.eq("subject", subject);
  if (level)   query = query.eq("school_level", level);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Shuffle
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return NextResponse.json({ questions: shuffled });
}
