import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

// Règle la durée (secondes/question) d'une manche — utilisée en LIVE et dans le test.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(req); } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({})) as { round_number?: number; time_limit_sec?: number };
  const { round_number, time_limit_sec } = body;

  if (round_number === undefined || typeof time_limit_sec !== "number") {
    return NextResponse.json({ error: "round_number et time_limit_sec requis" }, { status: 400 });
  }
  const sec = Math.max(3, Math.min(120, Math.round(time_limit_sec)));

  const db = adminDb();
  const { error } = await db
    .from("contest_rounds")
    .update({ time_limit_sec: sec })
    .eq("contest_id", id)
    .eq("round_number", round_number);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, time_limit_sec: sec });
}
