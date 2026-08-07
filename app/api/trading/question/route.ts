/**
 * L'ASSISTANT DE QUESTIONS — n'importe quelle question de trading, avec le
 * graphique de l'élève sous les yeux.
 *
 * L'analyse rend un verdict ; elle ne répond pas à « et je prends quelle
 * expiration ? », « j'entre maintenant ou j'attends la clôture ? », « pourquoi
 * l'OTC du samedi ne ressemble pas à la paire réelle ? ». Ces questions sont
 * celles que l'élève se pose vraiment, et elles sont majoritairement des
 * questions d'options binaires — c'est le terrain de Pocket Option.
 *
 * Le graphique n'est joint qu'au premier tour de la conversation : le modèle
 * le garde en contexte pour la suite, inutile de le renvoyer à chaque question.
 *
 * La réponse est diffusée en flux : une question de trading appelle une
 * réponse qui commence tout de suite, pas un écran vide de quinze secondes.
 */

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.TRADING_CHAT_MODEL || "claude-sonnet-5";

const MAX_BASE64 = 5 * 1024 * 1024;
const MAX_QUESTION = 1200;
/** Au-delà, on coupe le début : le contexte utile d'une conversation reste récent. */
const MAX_TOURS = 12;

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

const SYSTEM = `Tu es l'assistant de l'Académie Trading de KONEKSYON PAM. Tu réponds aux questions de trading d'un élève, souvent avec son graphique sous les yeux.

TON DOMAINE
Analyse technique (bougies, structure, momentum, niveaux), gestion du risque, psychologie, et surtout les **options binaires à durée fixe** — c'est ce que pratiquent la majorité des élèves, via Pocket Option. Tu maîtrises aussi le forex, les actions et les options classiques quand on t'y amène.

CE QUE TU SAIS DES OPTIONS BINAIRES (Pocket Option et équivalents)
— Le principe : on mise sur un SENS (Higher/Up ou Lower/Down) pour une DURÉE fixée d'avance. À l'échéance, soit le prix est du bon côté du prix d'entrée et le gain est le payout annoncé, soit il ne l'est pas et la mise entière est perdue. Il n'y a pas de stop loss, pas de sortie partielle, pas de "laisser courir".
— Le payout tourne entre 70 % et 92 % selon l'actif et le moment. Conséquence arithmétique qu'il faut savoir citer : le taux de réussite d'équilibre vaut 100/(100+payout). À 80 % de payout il faut gagner 55,6 % des trades pour ne rien perdre ; à 92 %, 52,1 %. Gagner "un peu plus d'une fois sur deux" ne suffit donc pas.
— Le gain est plafonné et la perte est totale : le rapport risque/rendement est structurellement inférieur à 1. Tout repose sur le taux de réussite, jamais sur un gros trade qui rattrape la série.
— La seule variable de gestion du risque est la TAILLE DE LA MISE, puisqu'il n'y a pas de stop. Une mise fixe de 1 à 2 % du capital est le garde-fou standard.
— L'expiration compte autant que le sens. Avoir raison trop tard, c'est avoir tort. Règle de travail utile : l'expiration doit couvrir environ 3 à 5 bougies de l'unité de temps analysée — lecture en M1 → expiration 3 à 5 minutes, lecture en M5 → 15 à 25 minutes, lecture en M15 → 45 min à 1 h. Trop court, on subit le bruit ; trop long, la lecture qui justifiait l'entrée n'est plus valable.
— Beaucoup d'élèves entrent à l'ouverture d'une bougie avec une expiration calée sur sa clôture. C'est cohérent, à condition que la thèse tienne sur une seule bougie — sinon il faut viser plus loin.
— Les actifs OTC (disponibles le week-end) sont cotés par le broker, pas par le marché interbancaire. La lecture technique reste possible, mais le contexte macro n'existe pas, et une analyse faite sur la paire réelle ne se transpose pas telle quelle sur sa version OTC.
— La martingale (doubler la mise après chaque perte) est le mécanisme qui vide le plus de comptes. Une série de 6 pertes d'affilée arrive régulièrement même avec un bon taux de réussite ; à ce moment-là la mise exigée dépasse le capital.
— Les expirations très courtes (5 à 30 secondes) relèvent du bruit, pas de l'analyse. Le dis franchement si l'élève y va.

COMMENT TU RÉPONDS
— En français, direct, technique. Pas de formules de politesse, pas de "il semblerait que". L'élève a suivi les niveaux 1 à 5 : bougies, structure, institutions, momentum. Applique ce vocabulaire au lieu de réexpliquer les bases.
— Court : 2 à 5 paragraphes, ou une liste brève. Une question précise mérite une réponse précise, pas un cours.
— Quand on te demande un sens, donne-le, avec ce qui l'invaliderait. Un avis sans invalidation ne vaut rien.
— Quand on te demande une expiration, donne UNE valeur au format du champ "Time" de la plateforme : 00:03:00, pas "3 à 5 minutes". Les durées réellement sélectionnables sont 00:00:30 · 00:01:00 · 00:02:00 · 00:03:00 · 00:05:00 · 00:10:00 · 00:15:00 · 00:30:00 · 01:00:00 · 02:00:00 · 04:00:00. Précise aussi le bouton : BUY ou SELL.
La façon de la calculer, si on te demande de la justifier : la distance qui sépare le prix actuel de son objectif, divisée par la progression moyenne par bougie, donne le nombre de bougies nécessaires ; multiplié par la durée d'une bougie, puis arrondi à la valeur sélectionnable au-dessus. On arrondit vers le haut parce qu'une expiration trop courte fait perdre un trade dont la lecture était juste.
Si une analyse a déjà été rendue sur ce graphique et qu'elle donne une durée, reprends exactement la même : deux chiffres différents dans la même page ne servent personne.
— Tu peux dire "n'entre pas" ou "attends la clôture de cette bougie" — c'est souvent la bonne réponse.

HONNÊTETÉ
— Si un graphique est joint, appuie-toi sur ce que tu y vois. N'invente jamais un prix, un niveau ou une unité de temps que tu ne lis pas.
— Si la question porte sur un graphique et qu'aucun n'a été envoyé, dis-le et demande la capture au lieu de répondre dans le vide.
— Tu ne connais pas le prix actuel du marché, tu ne vois pas ce qui s'est passé après la capture, et tu n'as accès à aucune actualité. Dis-le quand ça compte.
— Ne promets aucun résultat, ne donne aucun taux de réussite espéré, ne présente jamais une configuration comme sûre.
— La mention légale est déjà affichée en permanence sur la page : ne la répète pas à chaque réponse. Un rappel de risque ne se justifie que lorsqu'il est réellement lié à la question (martingale, mise trop grosse, expiration absurde).`;

export const maxDuration = 300;

interface Tour {
  role: "user" | "assistant";
  contenu: string;
}

export async function POST(request: NextRequest) {
  if (!process.env.CLAUDE_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "L'assistant n'est pas configuré sur ce serveur (clé API manquante)." },
      { status: 503 },
    );
  }

  let body: {
    question?: unknown;
    image?: unknown;
    mediaType?: unknown;
    analyse?: unknown;
    historique?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requête illisible." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return Response.json({ error: "Aucune question reçue." }, { status: 400 });
  }
  if (question.length > MAX_QUESTION) {
    return Response.json({ error: "Question trop longue." }, { status: 400 });
  }

  const image =
    typeof body.image === "string" && body.image.length > 0 && body.image.length <= MAX_BASE64
      ? body.image
      : null;
  const mediaType =
    typeof body.mediaType === "string" && MEDIA_TYPES.includes(body.mediaType as MediaType)
      ? (body.mediaType as MediaType)
      : null;

  const historique: Tour[] = Array.isArray(body.historique)
    ? (body.historique as unknown[])
        .filter(
          (t): t is Tour =>
            !!t &&
            typeof t === "object" &&
            ((t as Tour).role === "user" || (t as Tour).role === "assistant") &&
            typeof (t as Tour).contenu === "string" &&
            (t as Tour).contenu.trim().length > 0,
        )
        .slice(-MAX_TOURS)
    : [];

  // L'historique doit commencer par l'élève et alterner : c'est ce que l'API
  // attend, et un client bogué ne doit pas faire échouer la requête.
  while (historique.length && historique[0].role !== "user") historique.shift();

  /**
   * Le verdict déjà rendu est rappelé au modèle, pour qu'il argumente à partir
   * de la même lecture au lieu d'en produire une seconde, différente, qui
   * laisserait l'élève avec deux avis contradictoires.
   */
  const rappel = resumeAnalyse(body.analyse);

  const tours: Tour[] = [...historique, { role: "user", contenu: question }];

  const messages: Anthropic.MessageParam[] = tours.map((t, i) => {
    if (i === 0 && t.role === "user" && image && mediaType) {
      return {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
          { type: "text", text: `${rappel}Ma question : ${t.contenu}` },
        ],
      };
    }
    if (i === 0 && t.role === "user" && rappel) {
      return { role: "user", content: `${rappel}Ma question : ${t.contenu}` };
    }
    return { role: t.role, content: t.contenu };
  });

  try {
    const flux = client.messages.stream({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM,
      messages,
    });

    const encodeur = new TextEncoder();
    const corps = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const ev of flux) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              controller.enqueue(encodeur.encode(ev.delta.text));
            }
          }
        } catch (e) {
          console.error("[trading/question] flux", e instanceof Error ? e.message : e);
          // Le flux a déjà commencé côté client : on termine par un message
          // lisible plutôt que sur une coupure silencieuse.
          controller.enqueue(encodeur.encode("\n\n[Réponse interrompue. Repose ta question.]"));
        } finally {
          controller.close();
        }
      },
      cancel() {
        flux.abort();
      },
    });

    return new Response(corps, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    console.error("[trading/question]", e instanceof Error ? e.message : e);
    return Response.json({ error: "L'assistant n'a pas répondu. Réessaie." }, { status: 502 });
  }
}

/** Remet le verdict déjà rendu dans le contexte, en texte court. */
function resumeAnalyse(a: unknown): string {
  if (!a || typeof a !== "object") return "";
  const o = a as Record<string, unknown>;
  if (o.lisible === false) return "";
  const bouts: string[] = [];
  const ajoute = (etiquette: string, v: unknown) => {
    if (typeof v === "string" && v.trim()) bouts.push(`${etiquette} : ${v.trim()}`);
  };
  ajoute("Instrument", o.instrument);
  ajoute("Unité de temps", o.unite_temps);
  ajoute("Tendance", o.tendance);
  ajoute("Verdict", o.verdict);
  if (typeof o.confiance === "number") bouts.push(`Confiance : ${o.confiance}%`);
  ajoute("Résumé", o.resume);
  ajoute("Invalidation", o.invalidation);
  // La durée calculée fait partie du contexte : sans elle, l'assistant en
  // propose une autre et l'élève se retrouve avec deux chiffres.
  const b = o.binaire as Record<string, unknown> | undefined;
  if (b && typeof b.temps === "string" && typeof b.bouton === "string") {
    bouts.push(`Plan binaire déjà donné : bouton ${b.bouton}, expiration ${b.temps}`);
  }
  if (!bouts.length) return "";
  return `Analyse déjà rendue sur ce graphique (garde-la cohérente, ne la contredis pas sans raison explicite) :\n${bouts.join("\n")}\n\n`;
}
