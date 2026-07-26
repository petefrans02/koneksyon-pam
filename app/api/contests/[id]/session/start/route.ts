import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { adminDb } from "@/lib/admin-auth";
import { createSessionToken } from "@/lib/contest-session";

export async function POST(
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

  const { data: contest } = await db
    .from("contests")
    .select("status, started_at, duration_minutes, ended_at")
    .eq("id", id)
    .single();

  if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  if (contest.status !== "active") {
    return NextResponse.json({ error: "Contest is not live" }, { status: 400 });
  }

  if (contest.started_at) {
    const elapsed = (Date.now() - new Date(contest.started_at).getTime()) / 1000 / 60;
    if (elapsed >= (contest.duration_minutes ?? 45)) {
      return NextResponse.json({ error: "Contest time has expired" }, { status: 400 });
    }
  }

  const { data: existing } = await db
    .from("contest_sessions")
    .select("id, status")
    .eq("contest_id", id)
    .eq("user_id", user.id)
    .single();

  if (existing?.status === "completed") {
    return NextResponse.json({ error: "Already completed" }, { status: 400 });
  }
  if (existing?.status === "playing") {
    const token = createSessionToken(id, user.id);
    return NextResponse.json({ ok: true, session_token: token, resumed: true });
  }

  const { error } = await db.from("contest_sessions").upsert({
    contest_id: id,
    user_id: user.id,
    status: "playing",
    started_at: new Date().toISOString(),
    score: 0,
    current_question_index: 0,
    answers: [],
  }, { onConflict: "contest_id,user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const token = createSessionToken(id, user.id);
  return NextResponse.json({ ok: true, session_token: token, resumed: false });
}
