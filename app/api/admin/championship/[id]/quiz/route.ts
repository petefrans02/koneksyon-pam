import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

// GET — manches (avec réponses) du concours du championnat, pour l'affichage « jeu télé ».
// Réservé à l'admin. La page de diffusion en extrait le sous-ensemble de la JOURNÉE en cours,
// pour afficher EXACTEMENT les mêmes questions que les joueurs.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }
  const { id } = await params;
  const db = adminDb();

  const { data: season } = await db.from("champ_seasons").select("contest_id").eq("id", id).maybeSingle();
  if (!season?.contest_id) return NextResponse.json({ rounds: [] });

  const { data: rounds } = await db.from("contest_rounds")
    .select("round_number, round_type, questions, time_limit_sec").eq("contest_id", season.contest_id).order("round_number");

  return NextResponse.json({ rounds: rounds ?? [] });
}
