import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: entries } = await db
    .from("championship_leaderboard")
    .select("player_name, player_avatar, total_score, total_correct, current_rank")
    .eq("contest_id", id)
    .order("total_score", { ascending: false })
    .limit(50);

  const { data: mine } = await db
    .from("championship_leaderboard")
    .select("total_score, total_correct, current_rank")
    .eq("contest_id", id)
    .eq("player_id", user.id)
    .maybeSingle();

  // Temps du joueur : durée entre sa première et sa dernière réponse.
  const { data: myAnswers } = await db
    .from("championship_answers")
    .select("server_received_at")
    .eq("contest_id", id)
    .eq("player_id", user.id);
  let your_time_sec: number | null = null;
  if (myAnswers && myAnswers.length > 1) {
    const times = myAnswers
      .map((a) => new Date(a.server_received_at as string).getTime())
      .filter((n) => !isNaN(n));
    if (times.length > 1) your_time_sec = Math.round((Math.max(...times) - Math.min(...times)) / 1000);
  }

  return NextResponse.json({
    entries: (entries ?? []).map((e, i) => ({
      rank: e.current_rank ?? i + 1,
      player_name: e.player_name,
      player_avatar: e.player_avatar as string | null,
      total_score: e.total_score,
      total_correct: e.total_correct,
    })),
    your_rank: mine?.current_rank ?? null,
    your_score: mine?.total_score ?? 0,
    your_correct: mine?.total_correct ?? 0,
    your_time_sec,
  });
}
