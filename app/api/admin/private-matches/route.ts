import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin(request: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user || !isAdmin(user)) throw new Error("Unauthorized");
  return user;
}

// GET — list all private matches (admin view)
export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const d = db();

  const { data: matches } = await d
    .from("contests")
    .select(`
      id, title, theme, status, invite_code, created_at,
      max_participants, organizer_id,
      contest_participants(count)
    `)
    .or("is_private.eq.true,invite_code.not.is.null")
    .neq("invite_code", "")
    .order("created_at", { ascending: false })
    .limit(200);

  // Fetch organizer names from profiles
  const organizerIds = [...new Set((matches ?? []).map(m => m.organizer_id).filter(Boolean))];
  let profileMap: Record<string, string> = {};
  if (organizerIds.length > 0) {
    const { data: profiles } = await d
      .from("profiles")
      .select("id, name")
      .in("id", organizerIds);
    profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.name]));
  }

  const result = (matches ?? []).map(m => ({
    ...m,
    organizer_name: profileMap[m.organizer_id] ?? "—",
    participant_count: m.contest_participants?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ matches: result, total: result.length });
}

// DELETE — delete a subset or all private matches
// ?mode=all → delete everything
// ?mode=completed → delete only completed/closed ones
// ?id=xxx → delete a single match
export async function DELETE(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const d = db();
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "all";
  const singleId = searchParams.get("id");

  // Cascade delete helper
  async function cascadeDelete(ids: string[]) {
    if (ids.length === 0) return 0;
    await d.from("championship_answers").delete().in("contest_id", ids);
    await d.from("championship_leaderboard").delete().in("contest_id", ids);
    try { await d.from("championship_round_results").delete().in("contest_id", ids); } catch { /* table may not exist */ }
    await d.from("championship_state").delete().in("contest_id", ids);
    await d.from("contest_participants").delete().in("contest_id", ids);
    try { await d.from("contest_rounds").delete().in("contest_id", ids); } catch { /* table may not exist */ }
    try { await d.from("contest_sessions").delete().in("contest_id", ids); } catch { /* table may not exist */ }
    const { error } = await d.from("contests").delete().in("id", ids);
    if (error) throw error;
    return ids.length;
  }

  if (singleId) {
    const count = await cascadeDelete([singleId]);
    return NextResponse.json({ ok: true, deleted: count });
  }

  // Fetch target IDs
  let query = d
    .from("contests")
    .select("id")
    .or("is_private.eq.true,invite_code.not.is.null")
    .neq("invite_code", "");

  if (mode === "completed") {
    query = query.in("status", ["completed", "closed", "cancelled"]);
  }

  const { data: targets } = await query;
  const ids = (targets ?? []).map(r => r.id);

  const deleted = await cascadeDelete(ids);
  return NextResponse.json({ ok: true, deleted });
}
