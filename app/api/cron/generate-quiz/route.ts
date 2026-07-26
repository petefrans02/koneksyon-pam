import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.COURSE_GEN_MODEL || "claude-haiku-4-5-20251001";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("["); const end = raw.lastIndexOf("]");
  return JSON.parse(raw.slice(start, end + 1));
}
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "no api key" }, { status: 500 });

  const supabase = db();
  const today = new Date().toISOString().slice(0, 10);

  // Déjà généré aujourd'hui ? on ne refait pas.
  const { data: existing } = await supabase.from("daily_quiz").select("id").eq("quiz_date", today).maybeSingle();
  if (existing && !req.nextUrl.searchParams.get("force")) {
    return NextResponse.json({ ok: true, skipped: "already generated today" });
  }

  const client = new Anthropic({ apiKey });
  const prompt = `Tu es concepteur de quiz biblique pour KONEKSYON PAM. Crée le "Quiz du Jour" : 5 questions bibliques variées, engageantes et exactes, mélangeant différents niveaux et thèmes (Ancien et Nouveau Testament, personnages, prophéties, sagesse).

Réponds UNIQUEMENT avec un tableau JSON valide de 5 objets, sans texte autour, de cette forme EXACTE :
[
  {
    "question": { "fr": "...", "ht": "...", "en": "...", "es": "..." },
    "options": { "fr": ["A","B","C","D"], "ht": ["A","B","C","D"], "en": ["A","B","C","D"], "es": ["A","B","C","D"] },
    "correct": 0,
    "explanation": { "fr": "...", "ht": "...", "en": "...", "es": "..." },
    "verse": "Livre 0:0"
  }
]
Règles: EXACTEMENT 4 options par langue, dans le MÊME ordre pour les 4 langues. "correct" = index (0-3) de la bonne réponse. Les 4 langues (fr, ht=créole haïtien, en, es) sont OBLIGATOIRES et complètes. Fidélité biblique absolue.`;

  let questions: unknown;
  try {
    const msg = await client.messages.create({ model: MODEL, max_tokens: 4000, messages: [{ role: "user", content: prompt }] });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    questions = extractJson(text);
  } catch (e) {
    return NextResponse.json({ error: "generation failed", detail: String(e) }, { status: 500 });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "invalid generation" }, { status: 500 });
  }

  const { error } = await supabase.from("daily_quiz").upsert({ quiz_date: today, questions }, { onConflict: "quiz_date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, date: today, count: questions.length });
}
