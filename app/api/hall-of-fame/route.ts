import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export const revalidate = 300;

export async function GET() {
  const db = getDb();

  // Get all completed contests with their top participant
  const { data: contests } = await db
    .from("contests")
    .select("id, title, created_at")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (!contests?.length) return Response.json({ champions: [] });

  const champions = [];

  for (const contest of contests) {
    // Get winner (highest score) and vote champion
    const { data: parts } = await db
      .from("contest_participants")
      .select("id, score, votes_count, answers, profiles(name, avatar_url)")
      .eq("contest_id", contest.id)
      .order("score", { ascending: false })
      .limit(1);

    if (parts?.[0]) {
      const p = parts[0];
      const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
      const answers = (p.answers || []) as { correct: boolean }[];
      champions.push({
        id: `${contest.id}-${p.id}`,
        contest_id: contest.id,
        contest_title: contest.title,
        user_name: profile?.name || "Champion",
        user_avatar: profile?.avatar_url || null,
        score: p.score,
        votes_count: p.votes_count || 0,
        correct_answers: answers.filter(a => a.correct).length,
        total_questions: answers.length,
        created_at: contest.created_at,
      });
    }
  }

  return Response.json({ champions });
}
