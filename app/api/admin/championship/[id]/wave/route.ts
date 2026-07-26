import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { waveKeyOf, scheduleNextWave, KICKOFF_DELAY_MS } from "@/lib/champ-sequence";
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
    // On ne passe PAS en direct tout de suite : on programme le coup d'envoi
    // dans 30 s. Pendant ce temps les joueurs sont amenés automatiquement dans
    // la salle, voient le compte à rebours avec la musique, et le match démarre
    // tout seul (advanceSeason bascule les matchs en direct à l'heure dite).
    const kickoff = new Date(Date.now() + KICKOFF_DELAY_MS).toISOString();
    if (ids.length) await db.from("champ_matches").update({ started_at: kickoff }).in("id", ids);
    return NextResponse.json({
      ok: true,
      started: ids.length,
      kickoff_at: kickoff,
      countdown_sec: Math.round(KICKOFF_DELAY_MS / 1000),
    });
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
