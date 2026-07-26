import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import { launchChampionship } from "@/lib/championship-launch";

export async function POST(
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

  const { data: contest } = await db
    .from("contests")
    .select("id, status, title, is_private, organizer_id")
    .eq("id", id)
    .single();
  if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });

  // Allow: platform admins OR organizer of their own private championship
  const userIsAdmin = isAdmin(user);
  const userIsOrganizer = contest.is_private && contest.organizer_id === user.id;
  if (!userIsAdmin && !userIsOrganizer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const result = await launchChampionship(id, user.id, db);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true, phase: "COUNTDOWN", ends_at: result.ends_at });
}
