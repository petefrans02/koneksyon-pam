import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { waveKeyOf, scheduleNextWave } from "@/lib/champ-sequence";
import { resolveMatch } from "@/lib/champ-resolve";

// POST { wave: "group-1"|"quarter"|"semi"|"finals", action: "start"|"resolve" }
// Contrôle d'une JOURNÉE entière : tous ses matchs démarrent / se terminent ENSEMBLE.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }
  const { id } = await params;
  const db = adminDb();
  const body = await req.json().catch(() => ({})) as { wave?: string; action?: string };
  const wave = body.wave;
  if (!wave) return NextResponse.json({ error: "Journée manquante" }, { status: 400 });

  const { data: all } = await db.from("champ_matches").select("*").eq("season_id", id);
  const waveMatches = (all ?? []).filter((m) => waveKeyOf(m as { stage: string; round_number: number | null }) === wave);
  if (waveMatches.length === 0) return NextResponse.json({ error: "Journée introuvable" }, { status: 404 });

  // ── DÉMARRER la journée : tous les matchs en direct en même temps ──
  if (body.action === "start") {
    // On ne démarre pas une journée s'il en reste une autre en cours.
    const otherLive = (all ?? []).some((m) => m.status === "live" && waveKeyOf(m as { stage: string; round_number: number | null }) !== wave);
    if (otherLive) return NextResponse.json({ error: "Une autre journée est en cours. Termine-la d'abord." }, { status: 409 });
    const ids = waveMatches.filter((m) => m.status === "scheduled").map((m) => m.id);
    if (ids.length) await db.from("champ_matches").update({ status: "live", started_at: new Date().toISOString() }).in("id", ids);
    return NextResponse.json({ ok: true, started: ids.length });
  }

  // ── TERMINER la journée : résout tous les matchs en cours de la journée, puis programme la suivante ──
  if (body.action === "resolve") {
    const toResolve = waveMatches.filter((m) => m.status === "live" || m.status === "scheduled");
    for (const m of toResolve) await resolveMatch(db, m as Parameters<typeof resolveMatch>[1]);
    const next = await scheduleNextWave(db, id);
    return NextResponse.json({ ok: true, resolved: toResolve.length, next });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
