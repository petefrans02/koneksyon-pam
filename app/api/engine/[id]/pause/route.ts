import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await req.json(); // "pause" | "resume"

  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Autorisé : un admin, OU l'organisateur d'un concours privé (jouer avec amis).
  // Les championnats publics lancés par l'admin ne peuvent PAS être mis en pause par un joueur.
  let allowed = isAdmin(user);
  if (!allowed) {
    const { data: c } = await db
      .from("contests")
      .select("is_private, organizer_id, created_by")
      .eq("id", id)
      .single();
    allowed = !!c && c.is_private === true && (c.organizer_id === user.id || c.created_by === user.id);
  }
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: state, error } = await db
    .from("championship_state")
    .select("*")
    .eq("contest_id", id)
    .single();

  if (error || !state) {
    return NextResponse.json({ error: "State not found" }, { status: 404 });
  }

  const meta = (state.metadata ?? {}) as Record<string, unknown>;

  if (action === "pause") {
    // Compute remaining ms on current phase
    const remainingMs = state.phase_ends_at
      ? Math.max(0, new Date(state.phase_ends_at).getTime() - Date.now())
      : null;

    await db.from("championship_state")
      .update({
        metadata: { ...meta, is_paused: true, paused_remaining_ms: remainingMs, paused_at: new Date().toISOString() },
        phase_ends_at: null, // freeze timer
      })
      .eq("contest_id", id);

    return NextResponse.json({ ok: true, paused: true });
  }

  if (action === "resume") {
    const remainingMs = typeof meta.paused_remaining_ms === "number" ? meta.paused_remaining_ms : null;
    const newEndsAt = remainingMs ? new Date(Date.now() + remainingMs).toISOString() : null;

    const { is_paused: _, paused_remaining_ms: __, paused_at: ___, ...cleanMeta } = meta as Record<string, unknown>;

    await db.from("championship_state")
      .update({
        metadata: cleanMeta,
        phase_ends_at: newEndsAt,
      })
      .eq("contest_id", id);

    return NextResponse.json({ ok: true, paused: false });
  }

  return NextResponse.json({ error: "action must be pause or resume" }, { status: 400 });
}
