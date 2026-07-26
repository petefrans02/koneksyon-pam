import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { adminDb } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = adminDb();

  const [sessionRes, leaderboardRes, totalRes, questionsRes] = await Promise.all([
    db.from("contest_sessions")
      .select("score, status, answers, completed_at, started_at, perfect_bonus")
      .eq("contest_id", id)
      .eq("user_id", user.id)
      .single(),
    db.from("contest_leaderboard")
      .select("rank_global, rank_country, score, accuracy_pct, completion_time_seconds")
      .eq("contest_id", id)
      .eq("user_id", user.id)
      .single(),
    db.from("contest_sessions")
      .select("*", { count: "exact", head: true })
      .eq("contest_id", id)
      .eq("status", "completed"),
    db.from("contest_questions")
      .select("id, question_fr, question_ht, question_en, correct_answer, reference, order_num")
      .eq("contest_id", id)
      .order("order_num"),
  ]);

  if (!sessionRes.data) {
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  return NextResponse.json({
    session: sessionRes.data,
    leaderboard: leaderboardRes.data,
    total_participants: totalRes.count ?? 0,
    questions: questionsRes.data ?? [],
  });
}
