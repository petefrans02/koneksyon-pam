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

// GET — list all contests (public: only enabled; admin: all)
export async function GET(request: NextRequest) {
  const db = getDb();

  // Check if caller is admin to show disabled contests
  let isAdminUser = false;
  try {
    const user = await getAuthUser(request);
    isAdminUser = !!(user && isAdmin(user));
  } catch {}

  const baseCols = `id, title, title_ht, title_en, title_es, description, description_ht, description_en, description_es, status, start_at, scheduled_start_at, duration_minutes, theme, week_number, season_number, created_at, max_participants, enabled, is_private, invite_code, allow_rejoin, contest_participants(count), contest_sessions(count)`;

  const runQuery = (cols: string) => {
    let q = db.from("contests").select(cols).order("scheduled_start_at", { ascending: false, nullsFirst: false });
    if (!isAdminUser) q = q.neq("enabled", false); // hide disabled contests from public
    return q;
  };

  // Inclut solo_enabled / contest_type si les colonnes existent ; repli progressif sinon.
  let { data: contests, error } = await runQuery(`${baseCols}, solo_enabled, contest_type`);
  if (error) ({ data: contests, error } = await runQuery(`${baseCols}, solo_enabled`));
  if (error) ({ data: contests } = await runQuery(baseCols));
  return Response.json({ contests: contests || [] });
}

// POST — create a contest
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(user)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const body = await request.json();
  const {
    title, title_ht, title_en, title_es,
    description, description_ht, description_en, description_es,
    start_at, scheduled_start_at, duration_minutes,
    max_participants, church_id, theme,
    week_number, season_number, questions,
  } = body;

  if (!title) return Response.json({ error: "Missing title" }, { status: 400 });

  const db = getDb();

  const { data: contest, error } = await db
    .from("contests")
    .insert({
      title,
      title_ht: title_ht || null,
      title_en: title_en || null,
      title_es: title_es || null,
      description: description || "",
      description_ht: description_ht || null,
      description_en: description_en || null,
      description_es: description_es || null,
      start_at: start_at || null,
      scheduled_start_at: scheduled_start_at || null,
      duration_minutes: duration_minutes || 45,
      theme: theme || null,
      week_number: week_number || null,
      season_number: season_number || 1,
      max_participants: max_participants || 1000,
      church_id: church_id || null,
      created_by: user.id,
      status: "upcoming",
      current_question: 0,
      enabled: true,
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
