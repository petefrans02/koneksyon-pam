import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = adminDb();

  // Lazy auto-transition
  const { data: c } = await db.from("contests").select("status, scheduled_start_at, started_at, duration_minutes").eq("id", id).single();
  if (c) {
    const now = new Date();
    if (c.status === "upcoming" && c.scheduled_start_at && new Date(c.scheduled_start_at) <= now) {
      await db.from("contests").update({ status: "active", started_at: now.toISOString() }).eq("id", id);
    } else if (c.status === "active" && c.started_at) {
      const elapsed = (now.getTime() - new Date(c.started_at).getTime()) / 60000;
      if (elapsed >= (c.duration_minutes ?? 45)) {
        await db.from("contest_sessions").update({ status: "completed", completed_at: now.toISOString() }).eq("contest_id", id).eq("status", "playing");
        await db.from("contests").update({ status: "completed", ended_at: now.toISOString() }).eq("id", id);
      }
    }
  }

  const [registeredRes, playingRes, completedRes, contestRes] = await Promise.all([
    db.from("contest_sessions").select("*", { count: "exact", head: true }).eq("contest_id", id),
    db.from("contest_sessions").select("*", { count: "exact", head: true }).eq("contest_id", id).eq("status", "playing"),
    db.from("contest_sessions").select("*", { count: "exact", head: true }).eq("contest_id", id).eq("status", "completed"),
    db.from("contests").select("status, started_at, duration_minutes, scheduled_start_at").eq("id", id).single(),
  ]);

  const contest = contestRes.data;
  let secondsRemaining: number | null = null;
  if (contest?.started_at && contest?.status === "active") {
    const elapsed = (Date.now() - new Date(contest.started_at).getTime()) / 1000;
    const total = (contest.duration_minutes ?? 45) * 60;
    secondsRemaining = Math.max(0, Math.round(total - elapsed));
  }

  return NextResponse.json({
    registered: registeredRes.count ?? 0,
    playing: playingRes.count ?? 0,
    completed: completedRes.count ?? 0,
    contest_status: contest?.status ?? "unknown",
    seconds_remaining: secondsRemaining,
    scheduled_start_at: contest?.scheduled_start_at ?? null,
  });
}
