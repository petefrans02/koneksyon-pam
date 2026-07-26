import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await db
    .from("contests")
    .select("id, title, theme, status, invite_code, created_at, num_rounds, difficulty")
    .eq("organizer_id", user.id)
    .eq("is_private", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ matches: data ?? [] });
}

export async function DELETE(request: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify ownership
  const { data: contest } = await db
    .from("contests")
    .select("id, organizer_id, status")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .eq("is_private", true)
    .maybeSingle();

  if (!contest) return NextResponse.json({ error: "Concours introuvable" }, { status: 404 });

  // Clean associated data
  await Promise.allSettled([
    db.from("championship_state").delete().eq("contest_id", id),
    db.from("championship_answers").delete().eq("contest_id", id),
    db.from("championship_leaderboard").delete().eq("contest_id", id),
    db.from("championship_round_results").delete().eq("contest_id", id),
    db.from("contest_participants").delete().eq("contest_id", id),
    db.from("contest_rounds").delete().eq("contest_id", id),
  ]);

  await db.from("contests").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
