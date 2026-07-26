import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { autoPostContest } from "@/lib/social-post";

async function getAuthUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

// Lazy status transition — fires on first visit after scheduled time
async function autoTransitionContest(db: ReturnType<typeof getDb>, id: string) {
  const { data: c } = await db
    .from("contests")
    .select("status, scheduled_start_at, started_at, duration_minutes")
    .eq("id", id)
    .single();
  if (!c) return;
  const now = new Date();

  if (c.status === "upcoming" && c.scheduled_start_at && new Date(c.scheduled_start_at) <= now) {
    await db.from("contests").update({ status: "active", started_at: now.toISOString() }).eq("id", id);
  } else if (c.status === "active" && c.started_at) {
    const elapsed = (now.getTime() - new Date(c.started_at).getTime()) / 60000;
    if (elapsed >= (c.duration_minutes ?? 45)) {
      // Force-complete all playing sessions
      await db.from("contest_sessions")
        .update({ status: "completed", completed_at: now.toISOString() })
        .eq("contest_id", id).eq("status", "playing");
      await db.from("contests").update({ status: "completed", ended_at: now.toISOString() }).eq("id", id);
    }
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  // Auto-start or auto-close based on schedule (lazy evaluation)
  await autoTransitionContest(db, id);

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
    correct_answer: contest.status === "completed" || user?.id === contest.created_by || isAdmin(user)
      ? q.correct_answer
      : -1,
  }));

  return Response.json({
    contest,
    participants: participantsRes.data || [],
    questions,
    myVote,
    myParticipant,
    isOrganizer: user?.id === contest.created_by || isAdmin(user),
  });
}

// PATCH — update contest fields (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json();
  const allowed = ["enabled", "solo_enabled", "contest_type", "allow_rejoin", "title", "title_ht", "title_en", "title_es", "description", "description_ht", "description_en", "description_es", "status", "start_at", "max_participants"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  if (!Object.keys(updates).length) return Response.json({ error: "Nothing to update" }, { status: 400 });

  const db = adminDb();
  const { error } = await db.from("contests").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Si le concours vient d'être activé → poster sur Facebook automatiquement
  if (updates.enabled === true || updates.status === "active") {
    try {
      const { data: contest } = await db
        .from("contests")
        .select("id, title, enabled, status")
        .eq("id", id)
        .single();
      if (contest && contest.status !== "completed") {
        autoPostContest(contest.title, contest.id, "fr").catch(() => {});
      }
    } catch {}
  }

  return NextResponse.json({ ok: true });
}

// DELETE — admin only, removes contest + questions + participants + votes
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const db = adminDb();
  await db.from("contest_votes").delete().eq("contest_id", id);
  await db.from("contest_participants").delete().eq("contest_id", id);
  await db.from("contest_questions").delete().eq("contest_id", id);
  const { error } = await db.from("contests").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
