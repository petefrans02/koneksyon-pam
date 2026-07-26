import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CLAUDE_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "";

// Walk obj recursively: collect all { fr: "..." } nodes that have no `es` key.
// Only collects leaf nodes (objects where `fr` is a string value — the actual translatable text).
function collectLeaves(obj: unknown, out: Array<{ node: Record<string, string>; fr: string }>) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) { obj.forEach(v => collectLeaves(v, out)); return; }
  const o = obj as Record<string, unknown>;
  // This is a translatable leaf: has `fr` string and no `es`
  if (typeof o.fr === "string" && typeof o.es !== "string") {
    out.push({ node: o as Record<string, string>, fr: o.fr });
    return; // don't recurse further into the leaf
  }
  // Otherwise recurse into values
  Object.values(o).forEach(v => collectLeaves(v, out));
}

// Translate a set of French strings to Spanish via Claude Haiku.
// Returns a map of { fr_text -> es_text }.
async function translateBatch(strings: string[]): Promise<Record<string, string>> {
  if (!strings.length) return {};
  const prompt = `Tu es un traducteur biblique expert. Traduis ces phrases du français vers l'espagnol (espagnol neutre/universel).
RÈGLES STRICTES :
- Noms propres bibliques → formes espagnoles standard (Moïse→Moisés, Noé→Noé, Ève→Eva, etc.)
- Livres bibliques → noms espagnols (Genèse→Génesis, Psaumes→Salmos, etc.)
- Ne traduis PAS les chiffres seuls ni les références bibliques (ex: "Genèse 1:1" → "Génesis 1:1")
- Retourne UNIQUEMENT un objet JSON valide, sans markdown ni explications
- Format : {"texte français": "traducción española", ...}

Textes à traduire :
${JSON.stringify(strings)}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": CLAUDE_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json() as { content: Array<{ text: string }> };
  const raw = data.content[0]?.text?.trim() ?? "";

  // Strip markdown fences if any
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  return JSON.parse(cleaned) as Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all rounds
  const roundsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/contest_rounds?select=id,questions&limit=1000`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  const rounds = await roundsRes.json() as Array<{ id: string; questions: unknown[] }>;

  let roundsUpdated = 0;
  let questionsTranslated = 0;
  const errors: string[] = [];

  for (const round of rounds) {
    const questions = round.questions ?? [];
    if (!questions.length) continue;

    // Collect all leaves that need es translation
    const leaves: Array<{ node: Record<string, string>; fr: string }> = [];
    collectLeaves(questions, leaves);
    if (!leaves.length) continue; // already fully translated

    // Deduplicate by french text
    const uniqueFr = [...new Set(leaves.map(l => l.fr))];

    try {
      // Translate in chunks of 40 to stay within token limits
      const map: Record<string, string> = {};
      for (let i = 0; i < uniqueFr.length; i += 40) {
        const chunk = uniqueFr.slice(i, i + 40);
        const partial = await translateBatch(chunk);
        Object.assign(map, partial);
      }

      // Apply translations: mutate each node in-place (add `es` key)
      for (const { node, fr } of leaves) {
        const es = map[fr];
        if (es && typeof es === "string") node.es = es;
      }

      // Deep copy to ensure JSON serialisation is clean
      const updatedQuestions = JSON.parse(JSON.stringify(questions));

      // Update the round in Supabase
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/contest_rounds?id=eq.${round.id}`,
        {
          method: "PATCH",
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ questions: updatedQuestions }),
        }
      );

      if (!updateRes.ok) {
        errors.push(`Round ${round.id}: update failed ${updateRes.status}`);
      } else {
        roundsUpdated++;
        questionsTranslated += questions.length;
      }
    } catch (e) {
      errors.push(`Round ${round.id}: ${String(e)}`);
    }
  }

  return NextResponse.json({
    ok: true,
    roundsUpdated,
    questionsTranslated,
    errors: errors.slice(0, 20),
  });
}
