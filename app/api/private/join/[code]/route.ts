import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: contest } = await db
    .from("contests")
    .select(`
      id, title, theme, status, is_private, invite_code,
      organizer_id, difficulty, target_language, num_rounds,
      contest_participants(count)
    `)
    .eq("invite_code", upperCode)
    .eq("is_private", true)
    .single();

  if (!contest) {
    return NextResponse.json({ error: "Code invalide ou championnat introuvable" }, { status: 404 });
  }

  const playerCount = (contest.contest_participants as { count: number }[])?.[0]?.count ?? 0;

  return NextResponse.json({
    ok: true,
    contest: {
      id: contest.id,
      title: contest.title,
      theme: contest.theme,
      status: contest.status,
      invite_code: contest.invite_code,
      difficulty: contest.difficulty,
      target_language: contest.target_language,
      num_rounds: contest.num_rounds,
      player_count: playerCount,
    },
  });
}
