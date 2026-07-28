import { NextRequest, NextResponse } from "next/server";

// TUTEUR D'ANGLAIS — professeur particulier disponible dans toute l'Académie.
// Il explique la grammaire, corrige l'écrit, traduit, encourage, et pratique
// la conversation. Il connaît la leçon en cours pour rester dans le contexte.

const KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "";

const SYSTEM = `Tu es « Grace », professeure d'anglais de l'Académie KONEKSYON PAM.

TON PUBLIC : des chrétiens haïtiens et francophones, souvent grands débutants
en anglais. Beaucoup n'ont jamais eu de professeur. Ils sont motivés par leur foi.

TA MANIÈRE D'ENSEIGNER :
- Réponds TOUJOURS dans la langue de l'élève (français ou créole haïtien selon
  la sienne), et donne l'anglais en exemple.
- Sois brève : 4 phrases maximum, sauf si on te demande d'expliquer en détail.
- Donne toujours un exemple concret plutôt qu'une règle abstraite.
- Quand tu cites de l'anglais, écris-le entre **astérisques** pour qu'il ressorte.
- Encourage sincèrement. Ne dis jamais qu'une question est bête.
- Quand l'élève écrit une phrase en anglais, corrige-la gentiment : montre la
  version juste, puis explique l'erreur en une phrase.
- Utilise des exemples bibliques quand c'est naturel — c'est ce qui parle à ton
  public — mais sans forcer, l'anglais du quotidien compte tout autant.

CE QUE TU NE FAIS PAS :
- Pas de longs cours magistraux.
- Pas de jargon grammatical sans l'expliquer.
- Ne réponds pas aux sujets sans rapport avec l'apprentissage de l'anglais ou
  la foi : ramène gentiment l'élève vers sa leçon.`;

export async function POST(req: NextRequest) {
  if (!KEY) {
    return NextResponse.json({ error: "Le tuteur n'est pas configuré (clé Claude absente)." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({})) as {
    message?: string;
    lang?: "fr" | "ht";
    lessonTitle?: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };

  const message = (body.message ?? "").trim().slice(0, 800);
  if (!message) return NextResponse.json({ error: "Message vide" }, { status: 400 });

  const lang = body.lang === "ht" ? "créole haïtien" : "français";
  const context = body.lessonTitle
    ? `\n\nCONTEXTE : l'élève travaille en ce moment la leçon « ${body.lessonTitle} ».`
    : "";

  // On garde un historique court : assez pour suivre la conversation, pas trop
  // pour rester rapide et peu coûteux.
  const history = (body.history ?? []).slice(-6).map((m) => ({
    role: m.role,
    content: String(m.content).slice(0, 600),
  }));

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: `${SYSTEM}\n\nL'élève parle ${lang} : réponds dans cette langue.${context}`,
        messages: [...history, { role: "user", content: message }],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[tutor] Claude", res.status, detail.slice(0, 200));
      return NextResponse.json({ error: "Le tuteur n'a pas pu répondre. Réessaie dans un instant." }, { status: 502 });
    }

    const data = await res.json() as { content?: { text?: string }[] };
    const reply = data.content?.map((c) => c.text ?? "").join("").trim();
    return NextResponse.json({ reply: reply || "Je n'ai pas bien saisi — peux-tu reformuler ?" });
  } catch {
    return NextResponse.json({ error: "Le tuteur est momentanément indisponible." }, { status: 503 });
  }
}
