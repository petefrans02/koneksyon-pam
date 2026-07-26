import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import { makeAIPlayer } from "@/lib/champ-data";

// Recalcule les classements de poule à partir des scores des matchs (après correction).
async function recompute(db: ReturnType<typeof adminDb>, seasonId: string) {
  const { data: teams } = await db.from("champ_teams").select("id").eq("season_id", seasonId);
  const stats: Record<string, { played: number; won: number; drawn: number; lost: number; points: number; sf: number; sa: number }> = {};
  for (const t of teams ?? []) stats[t.id as string] = { played: 0, won: 0, drawn: 0, lost: 0, points: 0, sf: 0, sa: 0 };

  const { data: matches } = await db.from("champ_matches")
    .select("team_a, team_b, score_a, score_b, winner").eq("season_id", seasonId).eq("stage", "group").eq("status", "done");
  for (const m of matches ?? []) {
    const a = m.team_a as string, b = m.team_b as string;
    const sa = Number(m.score_a ?? 0), sb = Number(m.score_b ?? 0);
    const w = m.winner as string | null;
    if (!stats[a] || !stats[b]) continue;
    stats[a].played++; stats[b].played++;
    stats[a].sf += sa; stats[a].sa += sb; stats[b].sf += sb; stats[b].sa += sa;
    if (w === null) { stats[a].drawn++; stats[b].drawn++; stats[a].points++; stats[b].points++; }
    else if (w === a) { stats[a].won++; stats[a].points += 3; stats[b].lost++; }
    else { stats[b].won++; stats[b].points += 3; stats[a].lost++; }
  }
  for (const [tid, s] of Object.entries(stats)) {
    await db.from("champ_teams").update({
      played: s.played, won: s.won, drawn: s.drawn, lost: s.lost, points: s.points, score_for: s.sf, score_against: s.sa,
    }).eq("id", tid);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }
  const { id } = await params;
  const db = adminDb();
  const body = await req.json().catch(() => ({})) as { action?: string; match_id?: string; score_a?: number; score_b?: number; member_id?: string; paused?: boolean };

  // Pause / reprise du championnat. Tant que `paused` est vrai, advanceSeason
  // fige l'horloge : aucune journée ne démarre et aucun match ne se résout.
  if (body.action === "pause") {
    const paused = body.paused !== false;
    const { error } = await db.from("champ_seasons").update({ paused }).eq("id", id);
    if (error) return NextResponse.json({ error: `Colonne « paused » absente ? ${error.message}` }, { status: 500 });
    return NextResponse.json({ ok: true, paused });
  }

  if (body.action === "recompute") {
    await recompute(db, id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "correct_score" && body.match_id) {
    const sa = Number(body.score_a ?? 0), sb = Number(body.score_b ?? 0);
    const { data: m } = await db.from("champ_matches").select("team_a, team_b").eq("id", body.match_id).maybeSingle();
    if (!m) return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
    const winner = sa > sb ? m.team_a : sb > sa ? m.team_b : null;
    await db.from("champ_matches").update({ score_a: sa, score_b: sb, winner, status: "done" }).eq("id", body.match_id);
    await recompute(db, id);
    return NextResponse.json({ ok: true });
  }

  // Suspendre un joueur = le retirer et le remplacer par une IA.
  if (body.action === "suspend" && body.member_id) {
    const ai = makeAIPlayer(Math.floor(Math.random() * 9999), "mixed");
    await db.from("champ_members").update({
      user_id: null, is_ai: true, name: ai.name, avatar: ai.avatar, country: ai.country, level: ai.level, skill: ai.skill, speed: ai.speed,
    }).eq("id", body.member_id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}

// DELETE — supprime le championnat et tout son contenu (pas de FK cascade dans le schéma).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }
  const { id } = await params;
  const db = adminDb();
  await db.from("champ_player_results").delete().eq("season_id", id).then(() => {}, () => {});
  await db.from("champ_matches").delete().eq("season_id", id);
  await db.from("champ_members").delete().eq("season_id", id);
  await db.from("champ_teams").delete().eq("season_id", id);
  await db.from("champ_seasons").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
