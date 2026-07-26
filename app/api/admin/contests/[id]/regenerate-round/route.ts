import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

const ROUND_COLORS: Record<string, string> = {
  mcq: "#1d4ed8", tf: "#7c3aed", fill: "#0891b2", match: "#ea580c",
  order_verse: "#16a34a", chrono: "#b45309", character: "#be185d",
  location: "#0f766e", book: "#7c2d12", finale: "#c5a84f",
};
const ROUND_ICONS: Record<string, string> = {
  mcq: "⚡", tf: "🔮", fill: "📝", match: "🔗",
  order_verse: "📖", chrono: "⏳", character: "👤",
  location: "🗺️", book: "📚", finale: "🏆",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try { await requireAdmin(request); }
  catch { return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); }

  const { id } = await params;
  const { round_id, theme } = await request.json() as { round_id: string; theme: string };

  if (!round_id) return NextResponse.json({ error: "round_id required" }, { status: 400 });

  const db = adminDb();

  const { data: round } = await db
    .from("contest_rounds")
    .select("round_type, round_number, time_limit_sec, points_per_q, title")
    .eq("id", round_id)
    .eq("contest_id", id)
    .single();

  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const { data: contest } = await db
    .from("contests")
    .select("theme, title")
    .eq("id", id)
    .single();

  const contestTheme = theme || contest?.theme || contest?.title || "La Bible";
  const rType = round.round_type;

  const prompt = `Génère UNE SEULE manche de type "${rType}" pour un championnat biblique sur le thème : "${contestTheme}".
Réponds UNIQUEMENT avec le JSON de la manche (pas le championnat complet), avec cette structure :
{
  "round_type": "${rType}",
  "title": { "fr": "...", "ht": "...", "en": "..." },
  "instructions": { "fr": "...", "ht": "...", "en": "..." },
  "color_theme": "${ROUND_COLORS[rType] || "#1d4ed8"}",
  "icon": "${ROUND_ICONS[rType] || "⚡"}",
  "time_limit_sec": ${round.time_limit_sec || 150},
  "points_per_q": ${round.points_per_q || 100},
  "questions": [ ... ]
}
Les questions doivent être différentes de celles de la manche précédente.
Génère des questions variées, bibliquement exactes, avec références précises.
Réponds UNIQUEMENT avec le JSON, rien d'autre.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let rawText = "";
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: `Tu es un théologien expert. Tu génères UNIQUEMENT du JSON valide, sans texte avant ou après. Chaque question doit être bibliquement exacte avec référence précise.`,
      messages: [{ role: "user", content: prompt }],
    });
    const block = message.content[0];
    rawText = block.type === "text" ? block.text.trim() : "";
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Claude API error", detail: msg }, { status: 502 });
  }

  const cleaned = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "Claude returned invalid JSON", raw: rawText.slice(0, 1000) }, { status: 422 });
  }

  const { error } = await db
    .from("contest_rounds")
    .update({
      title: parsed.title,
      instructions: parsed.instructions,
      questions: parsed.questions,
      color_theme: ROUND_COLORS[rType] || parsed.color_theme,
      icon: ROUND_ICONS[rType] || parsed.icon,
      time_limit_sec: parsed.time_limit_sec || round.time_limit_sec,
      points_per_q: parsed.points_per_q || round.points_per_q,
    })
    .eq("id", round_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    round_id,
    round_number: round.round_number,
    round_type: rType,
    questions_count: Array.isArray(parsed.questions) ? (parsed.questions as unknown[]).length : 0,
  });
}
