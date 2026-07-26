import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { advanceKnockout } from "@/lib/champ-knockout";
import { scheduleNextWave } from "@/lib/champ-sequence";

// POST — génère le TOUR SUIVANT du tableau final (quarts → demi → finale → couronnement).
// La logique vit dans lib/champ-knockout.ts : le championnat l'appelle aussi tout
// seul (advanceSeason). Cette route reste le déclenchement manuel de l'admin.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }
  const { id } = await params;

  const db = adminDb();
  const r = await advanceKnockout(db, id);

  if (r.ok) {
    if (r.phase !== "finished") await scheduleNextWave(db, id);
    return NextResponse.json(r);
  }

  const messages: Record<string, { msg: string; status: number }> = {
    not_found: { msg: "Saison introuvable", status: 404 },
    groups_pending: { msg: "Termine d'abord tous les matchs de poule.", status: 400 },
    not_enough_teams: { msg: "Pas assez d'équipes qualifiées.", status: 400 },
    round_in_progress: { msg: "Termine tous les matchs du tour en cours avant de générer le suivant.", status: 400 },
  };
  const m = messages[r.reason];
  return NextResponse.json({ ok: false, error: m.msg }, { status: m.status });
}
