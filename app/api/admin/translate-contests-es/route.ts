import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";
import Anthropic from "@anthropic-ai/sdk";

// POST /api/admin/translate-contests-es
// Translates all contests without title_es to Spanish using Claude
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No AI API key" }, { status: 500 });

  const db = adminDb();
  const { data: contests, error } = await db
    .from("contests")
    .select("id, title, title_en, description, description_en")
    .is("title_es", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!contests?.length) return NextResponse.json({ updated: 0, message: "All contests already have Spanish titles" });

  const client = new Anthropic({ apiKey });
  let updated = 0;

  for (const contest of contests) {
    const sourceTitle = contest.title_en || contest.title;
    const sourceDesc = contest.description_en || contest.description;

    const prompt = `Translate these biblical contest fields to natural Spanish (for a Christian platform). Return JSON only.

Title: "${sourceTitle}"
${sourceDesc ? `Description: "${sourceDesc}"` : ""}

Return: {"title_es": "...", "description_es": "..."}`;

    try {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = (msg.content[0] as { type: string; text: string }).text;
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) continue;
      const result = JSON.parse(match[0]);

      await db
        .from("contests")
        .update({ title_es: result.title_es, description_es: result.description_es || null })
        .eq("id", contest.id);

      updated++;
    } catch {
      // skip on error
    }
  }

  return NextResponse.json({ updated, total: contests.length });
}
