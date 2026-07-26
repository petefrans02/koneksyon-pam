import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

// POST /api/admin/translate
// Body: { content: Record<string, string | object>, source_lang?: "fr" | "en" }
// Returns: { translated: Record<string, { fr, ht, en, es }> }
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json();
  const { fields, source_lang = "fr" } = body as {
    fields: Record<string, string>;
    source_lang?: string;
  };

  if (!fields || typeof fields !== "object") {
    return NextResponse.json({ error: "fields object required" }, { status: 400 });
  }

  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No AI API key configured" }, { status: 500 });
  }

  const fieldEntries = Object.entries(fields).filter(([, v]) => typeof v === "string" && v.trim());
  if (!fieldEntries.length) {
    return NextResponse.json({ error: "No non-empty fields to translate" }, { status: 400 });
  }

  const fieldList = fieldEntries.map(([k, v]) => `- ${k}: "${v}"`).join("\n");

  const prompt = `You are a professional Bible content translator for a Christian platform called KONEKSYON PAM.

Translate each field below from ${source_lang === "fr" ? "French" : "English"} into all 4 languages: French (fr), English (en), Spanish (es), and Haitian Creole (ht).

Fields to translate:
${fieldList}

Return ONLY a valid JSON object with this exact structure — no explanation, no markdown:
{
  "fieldName": { "fr": "...", "en": "...", "es": "...", "ht": "..." },
  ...
}

Rules:
- Keep Biblical references (Genesis 1:1, Jean 3:16) unchanged
- Keep proper names (Moses, Moïse) in their standard form per language
- Haitian Creole uses ò, è, etc.
- Spanish uses ¿ ¡ accents naturally
- Tone: reverent, appropriate for a Christian platform`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `AI error: ${err}` }, { status: 500 });
  }

  const aiData = await res.json();
  const text = aiData.content?.[0]?.text ?? "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const translated = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
  }
}
