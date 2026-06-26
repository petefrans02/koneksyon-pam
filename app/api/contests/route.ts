import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

async function getAuthUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET — list all contests
export async function GET() {
  const db = getDb();
  const { data: contests } = await db
    .from("contests")
    .select(`
      id, title, description, status, start_at, end_at, created_at, max_participants,
      contest_participants(count)
    `)
    .order("created_at", { ascending: false });

  return Response.json({ contests: contests || [] });
}

// POST — create a contest
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(user)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const body = await request.json();
  const { title, description, start_at, max_participants, church_id, questions } = body;

  if (!title) return Response.json({ error: "Missing title" }, { status: 400 });

  const db = getDb();

  const { data: contest, error } = await db
    .from("contests")
    .insert({
      title,
      description: description || "",
      start_at: start_at || null,
      max_participants: max_participants || 10,
      church_id: church_id || null,
      created_by: user.id,
      status: "upcoming",
      current_question: 0,
    })
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Insert questions
  if (questions && questions.length > 0) {
    const rows = questions.map((q: {
      question_fr: string; question_ht?: string; question_en?: string;
      options_fr: string[]; options_ht?: string[]; options_en?: string[];
      correct_answer: number; reference?: string; time_limit?: number;
    }, i: number) => ({
      contest_id: contest.id,
      question_fr: q.question_fr,
      question_ht: q.question_ht || q.question_fr,
      question_en: q.question_en || q.question_fr,
      options_fr: q.options_fr,
      options_ht: q.options_ht || q.options_fr,
      options_en: q.options_en || q.options_fr,
      correct_answer: q.correct_answer,
      reference: q.reference || "",
      time_limit: q.time_limit || 30,
      order_num: i,
    }));
    await db.from("contest_questions").insert(rows);
  }

  return Response.json({ contest_id: contest.id });
}
