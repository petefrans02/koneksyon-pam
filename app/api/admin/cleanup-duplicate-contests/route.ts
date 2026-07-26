import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

export async function POST(request: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all private upcoming contests
  const { data: contests, error } = await db
    .from("contests")
    .select("id, title, theme, organizer_id, status, created_at, is_private")
    .eq("is_private", true)
    .in("status", ["upcoming", "active"])
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by organizer_id + lowercase theme
  const groups: Record<string, typeof contests> = {};
  for (const c of (contests ?? [])) {
    const key = `${c.organizer_id}::${c.theme?.toLowerCase().trim()}`;
    if (!groups[key]) groups[key] = [];
    groups[key]!.push(c);
  }

  const toDelete: string[] = [];
  for (const group of Object.values(groups)) {
    if (!group || group.length <= 1) continue;
    // Keep the most recent one; delete the rest
    const sorted = [...group].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    for (const dup of sorted.slice(1)) {
      toDelete.push(dup.id);
    }
  }

  if (toDelete.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0, message: "Aucun doublon trouvé" });
  }

  // Delete associated data first
  await Promise.allSettled([
    db.from("championship_state").delete().in("contest_id", toDelete),
    db.from("championship_answers").delete().in("contest_id", toDelete),
    db.from("championship_leaderboard").delete().in("contest_id", toDelete),
    db.from("championship_round_results").delete().in("contest_id", toDelete),
    db.from("contest_participants").delete().in("contest_id", toDelete),
    db.from("contest_rounds").delete().in("contest_id", toDelete),
  ]);

  const { error: delError } = await db.from("contests").delete().in("id", toDelete);
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

  return NextResponse.json({ ok: true, deleted: toDelete.length, ids: toDelete });
}
