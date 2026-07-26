import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// GET — l'équipe du joueur connecté + la liste de ses coéquipiers (la « room »).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ team: null, members: [] });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: mine } = await db
    .from("championship_leaderboard")
    .select("team_id")
    .eq("contest_id", id)
    .eq("player_id", user.id)
    .maybeSingle();

  const teamId = (mine as { team_id?: string | null } | null)?.team_id;
  if (!teamId) return NextResponse.json({ team: null, members: [], me: user.id });

  const { data: team } = await db.from("contest_teams").select("id, name").eq("id", teamId).maybeSingle();

  const { data: members } = await db
    .from("championship_leaderboard")
    .select("player_id, player_name, player_avatar, total_score")
    .eq("contest_id", id)
    .eq("team_id", teamId)
    .order("total_score", { ascending: false });

  return NextResponse.json({
    team: team ?? null,
    members: (members ?? []).map((m) => ({
      player_id: m.player_id,
      player_name: m.player_name,
      player_avatar: m.player_avatar as string | null,
      total_score: m.total_score ?? 0,
    })),
    me: user.id,
  });
}
