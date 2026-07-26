import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = adminDb();

  const { data: contest } = await db
    .from("contests")
    .select("status")
    .eq("id", id)
    .single();

  if (!contest || contest.status === "active") {
    return NextResponse.json({ entries: [], available: false });
  }

  const { data: entries } = await db
    .from("contest_leaderboard")
    .select("user_id, score, rank_global, rank_country, completion_time_seconds, accuracy_pct, country")
    .eq("contest_id", id)
    .order("score", { ascending: false })
    .limit(100);

  const userIds = (entries ?? []).map(e => e.user_id);
  const userNames: Record<string, string> = {};
  if (userIds.length) {
    const { data: profiles } = await db
      .from("profiles")
      .select("id, full_name, display_name")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      userNames[p.id] = p.display_name || p.full_name || "Anonyme";
    }
  }

  const ranked = (entries ?? []).map((e, i) => ({
    ...e,
    rank: i + 1,
    name: userNames[e.user_id] ?? "Anonyme",
  }));

  return NextResponse.json({ entries: ranked, available: true });
}
