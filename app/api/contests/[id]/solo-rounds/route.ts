import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { adminDb } from "@/lib/admin-auth";

// Manches complètes (avec bonnes réponses) pour le MODE SOLO / entraînement.
// Le solo est joué et corrigé côté client et n'écrit PAS dans le classement compétitif,
// donc exposer les réponses au joueur connecté est acceptable ici.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authentification obligatoire (jouer en solo se fait avec un compte).
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = adminDb();
  const { data: contest } = await db.from("contests").select("id, status, title").eq("id", id).single();
  if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });

  const { data: rounds, error } = await db
    .from("contest_rounds")
    .select("id, round_number, round_type, title, instructions, color_theme, icon, time_limit_sec, points_per_q, questions")
    .eq("contest_id", id)
    .order("round_number");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    rounds: rounds ?? [],
    total: (rounds ?? []).length,
    contest_title: contest.title ?? null,
  });
}
