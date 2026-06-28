// Runs every minute — auto-starts and auto-closes contests based on schedule
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = adminDb();
  const now = new Date();
  const actions: string[] = [];

  // 1. Auto-start scheduled contests
  const { data: toStart } = await db
    .from("contests")
    .select("id, title, scheduled_start_at")
    .eq("status", "upcoming")
    .lte("scheduled_start_at", now.toISOString())
    .not("scheduled_start_at", "is", null);

  for (const contest of toStart ?? []) {
    await db.from("contests")
      .update({ status: "active", started_at: now.toISOString() })
      .eq("id", contest.id);
    actions.push(`Started: ${contest.title}`);
  }

  // 2. Auto-close expired contests
  const { data: active } = await db
    .from("contests")
    .select("id, title, started_at, duration_minutes")
    .eq("status", "active")
    .not("started_at", "is", null);

  for (const contest of active ?? []) {
    const startedAt = new Date(contest.started_at);
    const durationMs = (contest.duration_minutes ?? 45) * 60 * 1000;
    if (now.getTime() - startedAt.getTime() >= durationMs) {
      // Force-complete all playing sessions
      await db.from("contest_sessions")
        .update({ status: "completed", completed_at: now.toISOString() })
        .eq("contest_id", contest.id)
        .eq("status", "playing");

      // Load completed sessions ordered by score
      const { data: sessions } = await db
        .from("contest_sessions")
        .select("user_id, score, country")
        .eq("contest_id", contest.id)
        .eq("status", "completed")
        .order("score", { ascending: false });

      // Update rank_global on leaderboard
      for (let i = 0; i < (sessions ?? []).length; i++) {
        await db.from("contest_leaderboard")
          .update({ rank_global: i + 1 })
          .eq("contest_id", contest.id)
          .eq("user_id", sessions![i].user_id);
      }

      // Save champion
      if (sessions && sessions.length > 0) {
        const champion = sessions[0];
        const weekNum = Math.ceil(
          (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
          (7 * 24 * 3600 * 1000)
        );
        await db.from("contest_champions").upsert({
          contest_id: contest.id,
          user_id: champion.user_id,
          week_number: weekNum,
          year_number: now.getFullYear(),
          score: champion.score,
          rank_global: 1,
          country: champion.country ?? null,
        }, { onConflict: "contest_id" });
      }

      await db.from("contests")
        .update({ status: "completed", ended_at: now.toISOString() })
        .eq("id", contest.id);

      actions.push(`Closed: ${contest.title}`);
    }
  }

  // 3. Reminders (24h, 1h, 10min before)
  const windows = [
    { label: "24h", minutes: 24 * 60 },
    { label: "1h",  minutes: 60 },
    { label: "10m", minutes: 10 },
  ];

  for (const w of windows) {
    const targetTime = new Date(now.getTime() + w.minutes * 60 * 1000);
    const windowStart = new Date(targetTime.getTime() - 30 * 1000);
    const windowEnd   = new Date(targetTime.getTime() + 30 * 1000);

    const { data: upcoming } = await db
      .from("contests")
      .select("id, title")
      .eq("status", "upcoming")
      .gte("scheduled_start_at", windowStart.toISOString())
      .lte("scheduled_start_at", windowEnd.toISOString());

    for (const c of upcoming ?? []) {
      const { data: existing } = await db
        .from("contest_reminders")
        .select("id")
        .eq("contest_id", c.id)
        .eq("reminder_type", w.label)
        .single();

      if (!existing) {
        await db.from("contest_reminders").insert({
          contest_id: c.id,
          reminder_type: w.label,
          sent_at: now.toISOString(),
        });
        actions.push(`Reminder ${w.label}: ${c.title}`);
      }
    }
  }

  return NextResponse.json({ ok: true, actions, timestamp: now.toISOString() });
}
