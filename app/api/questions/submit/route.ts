import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    subject, school_level, difficulty, type,
    question, option_a, option_b, option_c, option_d,
    correct_answer, explanation,
  } = body;

  if (!question?.fr?.trim()) return NextResponse.json({ error: "Question required" }, { status: 400 });
  if (!option_a?.fr?.trim() || !option_b?.fr?.trim()) return NextResponse.json({ error: "At least 2 options required" }, { status: 400 });

  const db = adminClient();
  const { error } = await db.from("kp_questions").insert({
    type: type || "mcq",
    difficulty: difficulty || "medium",
    status: "pending",
    subject: subject || "maths",
    school_level: school_level || null,
    question,
    option_a,
    option_b,
    option_c: option_c?.fr ? option_c : null,
    option_d: option_d?.fr ? option_d : null,
    correct_answer: correct_answer ?? 0,
    reference: explanation || null,
    submitted_by: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
