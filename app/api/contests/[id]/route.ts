import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const [contestRes, participantsRes, questionsRes] = await Promise.all([
    db.from("contests").select("*").eq("id", id).single(),
    db.from("contest_participants")
      .select("id, user_id, user_name, user_avatar, score, answers, votes_count, joined_at")
      .eq("contest_id", id)
      .order("score", { ascending: false }),
    db.from("contest_questions")
      .select("id, question_fr, question_ht, question_en, options_fr, options_ht, options_en, reference, time_limit, order_num, correct_answer")
      .eq("contest_id", id)
      .order("order_num"),
  ]);

  const contest = contestRes.data;
  if (!contest) return Response.json({ error: "Not found" }, { status: 404 });

  // Check if current user voted
  let myVote: string | null = null;
  let myParticipant = null;
  if (user) {
    const [voteRes, partRes] = await Promise.all([
      db.from("contest_votes").select("participant_id").eq("contest_id", id).eq("voter_id", user.id).single(),
      db.from("contest_participants").select("*").eq("contest_id", id).eq("user_id", user.id).single(),
    ]);
    myVote = voteRes.data?.participant_id || null;
    myParticipant = partRes.data || null;
  }

  // Hide correct_answer if contest is active (so spectators can't cheat)
  const questions = (questionsRes.data || []).map(q => ({
    ...q,
    correct_answer: contest.status === "completed" || user?.id === contest.created_by
      ? q.correct_answer
      : -1,
  }));

  return Response.json({
    contest,
    participants: participantsRes.data || [],
    questions,
    myVote,
    myParticipant,
    isOrganizer: user?.id === contest.created_by,
  });
}
