import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rate-limit";

// ANALYSEUR DE GRAPHIQUE — l'élève envoie une capture d'écran d'un graphique
// en bougies, Claude (vision) lit les bougies visibles et explique quelle
// décision de trading il en tirerait. Outil pédagogique de l'Académie Trading :
// jamais un conseil financier, toujours accompagné du même garde-fou que le
// reste de la section (voir AcademieTradingClient.tsx).

const KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB, même limite que /api/upload

const SYSTEM = `Tu es le formateur de l'Académie Trading de KONEKSYON PAM. Un élève
t'envoie une capture d'écran d'un graphique en bougies (chandeliers japonais).

TA TÂCHE, dans cet ordre :

1. TENDANCE GÉNÉRALE — décris en 1-2 phrases ce que fait le marché sur
   l'ensemble du graphique (hausse, baisse, range / consolidation).

2. LECTURE DES BOUGIES — parcours le graphique de gauche à droite. Regroupe les
   bougies qui se ressemblent, mais commente en détail les 5 à 10 dernières
   bougies à droite (les plus récentes) : couleur (haussière/baissière), taille
   du corps (fort/faible momentum), longueur des mèches (rejet, indécision),
   et ce que chacune raconte sur le rapport de force acheteurs/vendeurs.

3. FIGURES REPÉRÉES — nomme les figures ou structures que tu reconnais si il y
   en a (marteau, étoile filante, avalement/engulfing, double sommet/creux,
   support, résistance, cassure, ligne de tendance...). Si rien de net ne se
   dégage, dis-le clairement plutôt que d'inventer une figure.

4. DÉCISION — termine par une décision nette : ACHAT, VENTE, ou NE RIEN FAIRE
   (attendre une confirmation). Donne : le raisonnement en 2-3 phrases, une
   zone d'entrée approximative si elle est identifiable sur l'image, une
   invalidation logique (où l'idée serait fausse), et un objectif basé sur la
   structure visible (ex. prochaine résistance/support).

5. LIMITE HONNÊTE — rappelle en une phrase que tu lis une image statique, sans
   prix exacts, sans volume, sans savoir si l'échelle de temps ou le contexte
   (actualités, tendance de fond) sont favorables, et que ceci est un exercice
   pédagogique, jamais un conseil financier ni une invitation à trader.

FORMAT : réponds en français, en paragraphes courts avec des titres en
MAJUSCULES suivis de deux-points (comme ci-dessus), sans markdown (pas de ** ni
de #). Sois concret et direct, pas de généralités vagues.`;

export async function POST(req: NextRequest) {
  if (!KEY) {
    return NextResponse.json(
      { error: "L'analyseur n'est pas configuré (clé Claude absente)." },
      { status: 503 },
    );
  }

  if (!rateLimit(getIp(req.headers), 10, 60 * 60_000)) {
    return NextResponse.json(
      { error: "Trop d'analyses en une heure. Réessaie plus tard." },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    imageData?: string;
    mediaType?: string;
    context?: string;
  };

  const { imageData, mediaType } = body;
  const context = (body.context ?? "").trim().slice(0, 200);

  if (!imageData || !mediaType) {
    return NextResponse.json({ error: "Image manquante." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(mediaType)) {
    return NextResponse.json(
      { error: "Format d'image non pris en charge (JPG, PNG, WebP, GIF uniquement)." },
      { status: 400 },
    );
  }
  // Une chaîne base64 fait ~4/3 de la taille des octets d'origine.
  if (imageData.length > MAX_BYTES * 1.4) {
    return NextResponse.json({ error: "Image trop lourde. Maximum 5 Mo." }, { status: 400 });
  }

  const userText = context
    ? `Voici le graphique. Contexte donné par l'élève : ${context}`
    : "Voici le graphique. Aucun contexte supplémentaire n'a été donné.";

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
        max_tokens: 1300,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageData } },
              { type: "text", text: userText },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[analyse-chart] Claude", res.status, detail.slice(0, 200));
      return NextResponse.json(
        { error: "L'analyse a échoué. Réessaie dans un instant." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { content?: { text?: string }[] };
    const analyse = data.content?.map((c) => c.text ?? "").join("").trim();
    if (!analyse) {
      return NextResponse.json({ error: "Aucune analyse produite." }, { status: 502 });
    }
    return NextResponse.json({ analyse });
  } catch {
    return NextResponse.json({ error: "L'analyseur est momentanément indisponible." }, { status: 503 });
  }
}
