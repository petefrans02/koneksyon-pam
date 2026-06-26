import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export const revalidate = 60; // cache 60s

export async function GET() {
  const db = getDb();

  const [partsRes, questionsRes, votesRes] = await Promise.all([
    db.from("contest_participants").select("*", { count: "exact", head: true }),
    db.from("contest_questions").select("*", { count: "exact", head: true }),
    db.from("contest_votes").select("*", { count: "exact", head: true }),
  ]);

  return Response.json({
    participants: partsRes.count ?? 0,
    questions: questionsRes.count ?? 0,
    votes: votesRes.count ?? 0,
  });
}
