import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: state } = await db
    .from("championship_state")
    .select("*")
    .eq("contest_id", id)
    .single();

  if (!state) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: myScore } = await db
    .from("championship_leaderboard")
    .select("total_score, current_rank")
    .eq("contest_id", id)
    .eq("player_id", user.id)
    .maybeSingle();

  let already_answered = false;
  let my_answer_index: number | null = null;
  if (state.phase === "QUESTION_ACTIVE") {
    const { data: myAnswer } = await db
      .from("championship_answers")
      .select("id, answer_index")
      .eq("contest_id", id)
      .eq("player_id", user.id)
      .eq("round_index", state.round_index)
      .eq("question_index", state.question_index)
      .maybeSingle();
    already_answered = !!myAnswer;
    my_answer_index = myAnswer?.answer_index ?? null;
  }

  return NextResponse.json({
    state,
    your_score: myScore?.total_score ?? 0,
    your_rank: myScore?.current_rank ?? null,
    already_answered,
    my_answer_index,
  });
}
