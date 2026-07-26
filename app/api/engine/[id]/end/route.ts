import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import { awardBadges } from "@/lib/championship-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({})) as { action?: string };
  const action = body.action === "cancel" ? "cancel" : "end";

  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const newPhase = action === "cancel" ? "CANCELLED" : "CLOSED";

  await db.from("championship_state").update({
    phase: newPhase,
    phase_ends_at: null,
    updated_at: new Date().toISOString(),
  }).eq("contest_id", id);

  await db.from("contests").update({
    status: action === "cancel" ? "upcoming" : "completed",
  }).eq("id", id);

  if (action === "end") {
    void awardBadges(id);
  }

  try {
    await db.from("championship_events").insert({
      contest_id: id,
      event_type: action === "cancel" ? "admin_cancel" : "admin_stop",
      actor_id: user.id,
      payload: { action },
    });
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true, phase: newPhase });
}
