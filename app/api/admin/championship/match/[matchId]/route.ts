import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { scheduleNextWave } from "@/lib/champ-sequence";
import { resolveMatch } from "@/lib/champ-resolve";

// POST { action: "start" | "resolve" } — contrôle d'un seul match (fallback / correction).
// Le contrôle normal se fait par JOURNÉE via /api/admin/championship/[id]/wave.
export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }
  const { matchId } = await params;
  const db = adminDb();
  const body = await req.json().catch(() => ({})) as { action?: string };

  const { data: match } = await db.from("champ_matches").select("*").eq("id", matchId).maybeSingle();
  if (!match) return NextResponse.json({ error: "Match introuvable" }, { status: 404 });

  if (body.action === "start") {
    await db.from("champ_matches").update({ status: "live", started_at: new Date().toISOString() }).eq("id", matchId);
    return NextResponse.json({ ok: true, status: "live" });
  }

  if (body.action === "resolve") {
    const r = await resolveMatch(db, match as Parameters<typeof resolveMatch>[1]);
    const next = await scheduleNextWave(db, match.season_id as string);
    return NextResponse.json({ ok: true, ...r, next });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
