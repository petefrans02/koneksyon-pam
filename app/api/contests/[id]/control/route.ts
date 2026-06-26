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

// POST — organizer control: advance question, change status
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { action } = await request.json();
  const db = getDb();

  // Check organizer
  const { data: contest } = await db
    .from("contests")
    .select("status, current_question, created_by")
    .eq("id", id)
    .single();

  if (!contest) return Response.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin(user) && contest.created_by !== user.id) return Response.json({ error: "Not organizer" }, { status: 403 });

  const statusFlow: Record<string, string> = {
    upcoming: "active",
    active: "voting",
    voting: "completed",
  };

  if (action === "next_status") {
    const next = statusFlow[contest.status];
    if (!next) return Response.json({ error: "Cannot advance status" }, { status: 400 });

    // When completing: add 25 bonus points per vote to each participant
    if (next === "completed") {
      const { data: parts } = await db
        .from("contest_participants")
        .select("id, score, votes_count")
        .eq("contest_id", id);

      for (const p of parts || []) {
        const bonus = (p.votes_count || 0) * 25;
        await db.from("contest_participants")
          .update({ score: (p.score || 0) + bonus })
          .eq("id", p.id);
      }
    }

    await db.from("contests").update({ status: next }).eq("id", id);
    return Response.json({ ok: true, status: next });
  }

  if (action === "advance_question") {
    if (contest.status !== "active") return Response.json({ error: "Not active" }, { status: 400 });

    // Get total question count
    const { count } = await db
      .from("contest_questions")
      .select("*", { count: "exact", head: true })
      .eq("contest_id", id);

    const nextQ = (contest.current_question || 0) + 1;

    if (count !== null && nextQ >= count) {
      // Last question done — auto-move to voting
      await db.from("contests").update({ status: "voting" }).eq("id", id);
      return Response.json({ ok: true, status: "voting" });
    }

    await db.from("contests").update({ current_question: nextQ }).eq("id", id);
    return Response.json({ ok: true, current_question: nextQ });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
