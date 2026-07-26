import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "";

const LANG_NAME: Record<string, string> = {
  fr: "français", ht: "créole haïtien", en: "English", es: "español",
};

interface QuizQ { question: string; options: string[]; correct: number; explanation: string; verse?: string }

// Cache en mémoire par étude+langue (réutilisé tant que l'instance est chaude).
const CACHE = new Map<string, QuizQ[]>();

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("["); const end = raw.lastIndexOf("]");
  return JSON.parse(raw.slice(start, end + 1));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { slug, title, content, lang } = body as { slug?: string; title?: string; content?: string; lang?: string };
  const l = ["fr", "ht", "en", "es"].includes(lang || "") ? (lang as string) : "fr";

  if (!title || !content) return Response.json({ error: "missing" }, { status: 400 });

  const key = `${slug || title}:${l}`;
  const cached = CACHE.get(key);
  if (cached) return Response.json({ questions: cached });

  if (!CLAUDE_API_KEY) return Response.json({ questions: [] });

  const prompt = `Tu es concepteur pédagogique pour une académie biblique chrétienne.
À partir de CETTE leçon uniquement, rédige un test de connaissances de 5 questions à choix multiple, en ${LANG_NAME[l]}.

Titre de la leçon : « ${title} »
Contenu de la leçon :
${(content || "").slice(0, 3500)}

Règles :
- Les questions portent EXCLUSIVEMENT sur le contenu ci-dessus (pas de culture générale hors-sujet).
- 4 options par question, UNE seule correcte.
- Ajoute une brève explication et une référence biblique pertinente.
- Tout en ${LANG_NAME[l]}.

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour :
[
  { "question": "...", "options": ["...","...","...","..."], "correct": 0, "explanation": "...", "verse": "Livre 0:0" }
]`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": CLAUDE_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return Response.json({ questions: [] });
    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const parsed = extractJson(text) as QuizQ[];
    const clean = (Array.isArray(parsed) ? parsed : [])
      .filter((q) => q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length === 4 && typeof q.correct === "number")
      .slice(0, 5)
      .map((q) => ({ ...q, correct: Math.max(0, Math.min(3, q.correct)) }));
    if (clean.length) CACHE.set(key, clean);
    return Response.json({ questions: clean });
  } catch {
    return Response.json({ questions: [] });
  }
}
