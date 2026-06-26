import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export async function POST(request: NextRequest) {
  const { question, context, lang } = await request.json();

  if (!question || !context) {
    return Response.json({ error: "Missing question or context" }, { status: 400 });
  }

  const systemPrompt =
    lang === "ht"
      ? "Ou se yon pwofesè biblik ekspè. Repon an kreyòl ayisyen, ak klète, pwofondè, epi aksesib. Baze repons ou sou Bib la ak teyoloji kretyen. Pa depase 3 paragraf kout."
      : lang === "en"
      ? "You are an expert biblical teacher. Respond in English with clarity, depth, and accessibility. Base your answers on the Bible and Christian theology. Do not exceed 3 short paragraphs."
      : "Tu es un professeur biblique expert. Réponds en français avec clarté, profondeur, et accessibilité. Base tes réponses sur la Bible et la théologie chrétienne. Ne dépasse pas 3 paragraphes courts.";

  const userPrompt = `Contexte de l'enseignement :\n${context}\n\nQuestion de l'utilisateur : ${question}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return Response.json({ answer: text });
}
