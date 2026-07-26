import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { findCourse } from "@/lib/academy-data";
import { COURSE_CONTENT } from "@/lib/courses";
import { countLessons } from "@/lib/courses/types";

// Objectif : amener chaque formation à un programme "complet" (niveau université).
const TARGET_LESSONS = Number(process.env.COURSE_TARGET_LESSONS || 30);
const MODEL = process.env.COURSE_GEN_MODEL || "claude-haiku-4-5-20251001";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{"); const end = raw.lastIndexOf("}");
  return JSON.parse(raw.slice(start, end + 1));
}
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
function txt(o: unknown): string {
  if (!o) return ""; if (typeof o === "string") return o;
  const r = o as Record<string, string>; return r.fr || r.en || "";
}

// Choisit le cours le MOINS avancé (statique + dynamique) encore sous l'objectif.
async function pickCourse(supabase: ReturnType<typeof db>): Promise<{ slug: string; existingTitles: string[] } | null> {
  const slugs = Object.keys(COURSE_CONTENT);
  const dyn: Record<string, number> = Object.fromEntries(slugs.map((s) => [s, 0]));
  const { data } = await supabase.from("course_lessons").select("course_slug");
  for (const row of data ?? []) if (row.course_slug in dyn) dyn[row.course_slug] += 1;

  let best: string | null = null, bestTotal = Infinity;
  for (const s of slugs) {
    const total = countLessons(COURSE_CONTENT[s]) + dyn[s];
    if (total < TARGET_LESSONS && total < bestTotal) { best = s; bestTotal = total; }
  }
  if (!best) return null; // tous les cours ont atteint l'objectif

  // Titres déjà couverts (statiques + dynamiques) pour éviter les doublons.
  const staticTitles = COURSE_CONTENT[best].modules.flatMap((m) => m.lessons.map((l) => txt(l.title)));
  const { data: dynRows } = await supabase.from("course_lessons").select("title").eq("course_slug", best);
  const dynTitles = (dynRows ?? []).map((r) => txt(r.title));
  return { slug: best, existingTitles: [...staticTitles, ...dynTitles].filter(Boolean) };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "no api key" }, { status: 500 });

  const supabase = db();
  const forced = req.nextUrl.searchParams.get("course");
  const pick = forced
    ? { slug: forced.trim(), existingTitles: [] as string[] }
    : await pickCourse(supabase);

  if (!pick) return NextResponse.json({ ok: true, done: "toutes les formations ont atteint l'objectif" });

  const course = findCourse(pick.slug);
  if (!course) return NextResponse.json({ error: "unknown course" }, { status: 400 });

  const client = new Anthropic({ apiKey });
  const avoid = pick.existingTitles.slice(0, 40).map((t) => `- ${t}`).join("\n");

  const prompt = `Tu es concepteur pédagogique pour KONEKSYON PAM, une académie chrétienne francophone qui construit des formations COMPLÈTES, de niveau universitaire.
Rédige LA PROCHAINE leçon du cours « ${course.title.fr} » (${course.description?.fr ?? ""}) pour enrichir progressivement son programme vers un cursus complet.
La leçon doit approfondir un aspect NOUVEAU, logique et utile — PAS un sujet déjà traité.

Sujets DÉJÀ couverts (à NE PAS répéter) :
${avoid || "(aucun)"}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{
  "module_title": { "fr": "...", "ht": "...", "en": "...", "es": "..." },
  "title": { "fr": "...", "ht": "...", "en": "...", "es": "..." },
  "content": { "fr": "...", "ht": "...", "en": "...", "es": "..." },
  "key_points": { "fr": ["...","...","...","..."], "ht": ["..."], "en": ["..."], "es": ["..."] },
  "exercise": { "fr": "...", "ht": "...", "en": "...", "es": "..." }${course.domain === "biblique" ? ',\n  "verse": "Référence Livre 0:0"' : ""}
}
Règles: "module_title" = un nom de module cohérent avec le sujet (ex. "Approfondissement", "Concepts avancés", "Pratique"). "content" = 4 à 6 paragraphes concrets et pédagogiques séparés par \\n\\n. Les 4 langues (fr, ht = créole haïtien, en, es) OBLIGATOIRES et complètes. Fidélité et qualité de niveau universitaire.`;

  let parsed: {
    module_title?: Record<string, string>; title: Record<string, string>; content: Record<string, string>;
    key_points?: Record<string, string[]>; exercise?: Record<string, string>; verse?: string;
  };
  try {
    const msg = await client.messages.create({ model: MODEL, max_tokens: 3500, messages: [{ role: "user", content: prompt }] });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    parsed = extractJson(text) as typeof parsed;
  } catch (e) {
    return NextResponse.json({ error: "generation failed", detail: String(e) }, { status: 500 });
  }
  if (!parsed?.title?.fr || !parsed?.content?.fr) {
    return NextResponse.json({ error: "invalid generation" }, { status: 500 });
  }

  const { error } = await supabase.from("course_lessons").insert({
    course_slug: pick.slug,
    module_title: parsed.module_title ?? { fr: "Approfondissement", ht: "Apwofondisman", en: "Deep dive", es: "Profundización" },
    title: parsed.title, content: parsed.content,
    key_points: parsed.key_points ?? null, exercise: parsed.exercise ?? null, verse: parsed.verse ?? null,
    published: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = countLessons(COURSE_CONTENT[pick.slug]) + 1;
  return NextResponse.json({ ok: true, course: pick.slug, title: parsed.title.fr, progress: `~${total}/${TARGET_LESSONS}` });
}
