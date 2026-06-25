import { NextRequest } from "next/server";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || "";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { question, studyTitle, studyContent, lang } = body;

  if (!question) {
    return Response.json({ error: "Missing question" }, { status: 400 });
  }

  if (!CLAUDE_API_KEY) {
    return Response.json({ answer: "API non configurée." }, { status: 200 });
  }

  const systemPrompt = `Tu es un assistant biblique sage et bienveillant pour l'app KONEKSYON PAM.
Tu réponds aux questions sur la Bible avec précision, en citant les versets pertinents.
Tu parles en ${lang === "fr" ? "français" : lang === "ht" ? "créole haïtien" : "anglais"}.
Tu es respectueux de toutes les dénominations chrétiennes.
Tu ne donnes jamais d'opinion personnelle — tu laisses la Bible parler.
Garde tes réponses concises (3-5 paragraphes max).
${studyTitle ? `L'utilisateur étudie : "${studyTitle}". Contenu de l'étude : ${studyContent?.slice(0, 500)}` : ""}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: question }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Claude API error:", err);
      return Response.json({ answer: "Erreur de connexion. Réessayez." });
    }

    const data = await res.json();
    const answer = data.content?.[0]?.text || "Pas de réponse.";
    return Response.json({ answer });
  } catch (e) {
    console.error("Claude API error:", e);
    return Response.json({ answer: "Erreur de connexion. Réessayez." });
  }
}
