import { NextRequest } from "next/server";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "";

const LANG_NAME: Record<string, string> = {
  fr: "français",
  ht: "créole haïtien",
  en: "English",
  es: "español",
};

const ERR_MSG: Record<string, string> = {
  fr: "Erreur de connexion. Réessayez.",
  ht: "Erè koneksyon. Eseye ankò.",
  en: "Connection error. Please try again.",
  es: "Error de conexión. Inténtalo de nuevo.",
};

const NO_ANSWER: Record<string, string> = {
  fr: "Pas de réponse.",
  ht: "Pa gen repons.",
  en: "No answer.",
  es: "Sin respuesta.",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { question, studyTitle, studyContent, lang } = body;
  const l: string = ["fr", "ht", "en", "es"].includes(lang) ? lang : "fr";

  if (!question) {
    return Response.json({ error: "Missing question" }, { status: 400 });
  }
  if (question.length > 500) {
    return Response.json({ error: "Question too long" }, { status: 400 });
  }

  if (!CLAUDE_API_KEY) {
    return Response.json({ answer: ERR_MSG[l] }, { status: 200 });
  }

  const systemPrompt = `Tu es un assistant biblique sage et bienveillant pour l'app KONEKSYON PAM.

RÈGLES DE FORMAT :
- Écris en paragraphes clairs et bien séparés
- N'utilise JAMAIS de guillemets autour de tes phrases
- Cite les versets bibliques ainsi : (Jean 3:16) — sans guillemets
- N'utilise pas de markdown (pas de ** ni de #)
- Pas de listes à puces sauf si vraiment nécessaire
- Garde un ton chaleureux et accessible
- Maximum 3-4 paragraphes

RÈGLES DE CONTENU :
- Réponds en ${LANG_NAME[l]}
- Cite toujours au moins un verset biblique pertinent
- Sois respectueux de toutes les dénominations chrétiennes
- Laisse la Bible parler plutôt que donner ton opinion
${studyTitle ? `\nL'utilisateur étudie : ${studyTitle}. Contenu : ${studyContent?.slice(0, 400)}` : ""}`;

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
      return Response.json({ answer: ERR_MSG[l] });
    }

    const data = await res.json();
    const answer = data.content?.[0]?.text || NO_ANSWER[l];
    return Response.json({ answer });
  } catch (e) {
    console.error("Claude API error:", e);
    return Response.json({ answer: ERR_MSG[l] });
  }
}
