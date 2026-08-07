/**
 * LE FILTRE IA.
 *
 * Le moteur déterministe (`score.ts`) a déjà donné une note. L'IA arrive
 * après, avec un mandat étroit et deux pouvoirs seulement :
 *
 *   — REFUSER un setup que les chiffres trouvent bon.
 *   — AJUSTER la confiance de ±15 points, pas davantage.
 *
 * ── Pourquoi ce mandat est aussi étroit ───────────────────────────────────
 *
 * Parce qu'un modèle de langage est excellent pour repérer une incohérence
 * qu'aucune règle n'avait prévue — « la cassure s'est faite sur une mèche, en
 * volume divisé par trois, quinze minutes avant la clôture de Londres » — et
 * mauvais pour produire un nombre stable. Lui confier la note elle-même
 * donnerait 88 aujourd'hui et 93 demain sur les mêmes données, et plus aucune
 * statistique ne serait calculable.
 *
 * Le bornage à ±15 n'est donc pas de la méfiance décorative : il garantit
 * qu'un signal à 70 ne peut pas être publié parce que le modèle l'a trouvé
 * beau, et qu'un signal à 96 ne peut pas être détruit par un doute vague. Un
 * refus, lui, est toujours possible — parce que refuser ne coûte qu'un trade
 * manqué, alors qu'accepter à tort coûte de l'argent.
 *
 * ── Quand l'IA est indisponible ───────────────────────────────────────────
 *
 * Clé absente, API en panne, réponse illisible : on N'A PAS de repli
 * permissif. Le signal continue avec sa note déterministe et un drapeau
 * indiquant que le filtre n'a pas tourné. Publier sans filtre est acceptable
 * parce que le score, lui, a bien été calculé ; publier en INVENTANT un
 * verdict favorable ne le serait pas.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  AlerteValide,
  DRAPEAUX_IA,
  DrapeauIA,
  Marche,
  Score,
  VerdictIA,
} from "./types";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
});

export function iaConfiguree(): boolean {
  return !!(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY);
}

/** L'amplitude maximale de l'arbitrage. Voir l'en-tête du fichier. */
const BORNE = 15;

const SYSTEME = `Tu es l'analyste de contrôle du KONEKSYON PAM TRADING CENTER.

Un moteur déterministe a déjà analysé un setup de trading et lui a donné une note chiffrée, critère par critère. Ton rôle N'EST PAS de refaire cette analyse ni de renoter le setup.

Ton rôle est de chercher ce que les règles n'ont pas pu voir, et une seule question t'intéresse : « ce setup a-t-il un défaut qui rendrait la note trompeuse ? »

Les défauts que tu cherches en priorité :
- FAUSSE CASSURE : cassure sur une mèche, sans clôture franche au-delà, ou en volume anémique. C'est le piège le plus coûteux.
- SUR-EXTENSION : le mouvement est déjà fait, l'entrée arrive à la fin.
- STRUCTURE CONTRADICTOIRE : les échelles ne racontent pas la même histoire, même si la majorité vote dans un sens.
- MAUVAIS TIMING : fin de séance, veille de week-end, période creuse.
- ZONE DÉJÀ CONSOMMÉE : l'order block ou le FVG a déjà été retesté et n'a plus de réserve d'ordres.
- RISQUE/RENDEMENT TROMPEUR : le TP2 est de l'autre côté d'une résistance majeure, donc inatteignable en pratique.

Règles absolues :
1. Tu refuses (valide = false) dès qu'un défaut RÉDHIBITOIRE est présent. Dans le doute sur un défaut grave, tu refuses. Un trade manqué ne coûte rien ; un mauvais trade coûte de l'argent.
2. Ton ajustement est borné à -15 / +15. Tu n'as pas le pouvoir de renoter.
3. Tu ne mets un drapeau que si tu peux le justifier par une donnée présente dans ce qu'on te transmet. Tu n'inventes ni actualité économique, ni prix, ni niveau.
4. Ton explication est en FRANÇAIS, 2 à 4 phrases, destinée à un trader qui va risquer de l'argent. Concret, jamais promotionnel. Pas de « excellente opportunité », pas de superlatif.
5. Tu ne promets jamais un résultat. Tu décris une configuration et ce qui l'invaliderait.`;

const SCHEMA = {
  type: "object",
  properties: {
    valide: {
      type: "boolean",
      description:
        "false si un défaut rédhibitoire rend le setup non publiable, quelle que soit sa note.",
    },
    ajustement: {
      type: "integer",
      minimum: -BORNE,
      maximum: BORNE,
      description:
        "Correction de confiance en points. Négatif si tu vois un risque que les règles ont manqué, positif si une confluence évidente n'était pas comptée. 0 si rien à signaler.",
    },
    drapeaux: {
      type: "array",
      maxItems: 4,
      items: { type: "string", enum: DRAPEAUX_IA as unknown as string[] },
      description: "Les risques identifiés. Liste vide si aucun.",
    },
    explication: {
      type: "string",
      maxLength: 700,
      description:
        "2 à 4 phrases en français expliquant le setup au trader : pourquoi cette entrée, et ce qui l'invaliderait.",
    },
    refus: {
      type: ["string", "null"],
      maxLength: 300,
      description:
        "Si valide = false : la raison du refus, en une phrase. Sinon null.",
    },
  },
  required: ["valide", "ajustement", "drapeaux", "explication", "refus"],
} as const;

/** Met en forme les données du setup pour le modèle, sans rien interpréter. */
function dossier(a: AlerteValide, score: Score, marche: Marche): string {
  const d = marche.decimales;
  const px = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toFixed(d));
  const i = a.indicateurs;

  const echelles = Object.entries(a.unites)
    .map(([u, l]) => `  ${u} : ${l.tendance ?? "?"}${l.rsi !== undefined ? ` · RSI ${l.rsi.toFixed(0)}` : ""}${l.adx !== undefined ? ` · ADX ${l.adx.toFixed(0)}` : ""}${l.ema_position ? ` · prix ${l.ema_position} des EMA` : ""}`)
    .join("\n");

  const criteres = score.criteres
    .map((c) => `  ${c.points >= 0 ? "+" : ""}${c.points}  ${c.libelle}`)
    .join("\n");

  const smc = Object.entries(a.smc)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `  ${k} : ${typeof v === "number" ? v.toFixed(d) : v}`)
    .join("\n");

  const niveaux = Object.entries(a.niveaux)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `  ${k} : ${Number(v).toFixed(d)}`)
    .join("\n");

  return `MARCHÉ : ${marche.paire} (${marche.nom_fr})
SENS : ${a.sens}   ·   UNITÉ D'ENTRÉE : ${a.unite}   ·   SÉANCE : ${a.session}
PRIX ACTUEL : ${px(a.prix)}

PLAN PROPOSÉ
  Zone d'entrée : ${px(a.plan.zone_bas)} — ${px(a.plan.zone_haut)}
  Entrée        : ${px(a.plan.entree)}
  Stop          : ${px(a.plan.stop)}   (risque : ${a.risque.toFixed(d)})
  TP1           : ${px(a.plan.tp1)}
  TP2           : ${px(a.plan.tp2)}
  TP3           : ${px(a.plan.tp3)}
  Risque/rendement : ${a.rr.toFixed(2)}:1

INDICATEURS (unité ${a.unite})
  EMA 20/50/200 : ${px(i.ema20)} / ${px(i.ema50)} / ${px(i.ema200)}
  VWAP : ${px(i.vwap)}   ·   ATR : ${i.atr?.toFixed(d) ?? "—"}
  RSI : ${i.rsi?.toFixed(1) ?? "—"}   ·   ADX : ${i.adx?.toFixed(1) ?? "—"}
  MACD : ${i.macd?.toFixed(4) ?? "—"} / signal ${i.macd_signal?.toFixed(4) ?? "—"}
  Volume relatif : ${i.rvol?.toFixed(2) ?? "—"}× la moyenne

TOUTES LES ÉCHELLES
${echelles || "  (non transmises)"}

STRUCTURE SMART MONEY
${smc || "  (aucune)"}

NIVEAUX
${niveaux || "  (aucun)"}

CONFIRMATION EN BOUGIE : ${a.bougie ?? "aucune"}
NOTE DU SCRIPT : ${a.note ?? "—"}

NOTE DÉTERMINISTE : ${score.valeur}/100, obtenue ainsi :
${criteres}

Appelle rendre_verdict.`;
}

/** Verdict de repli quand le filtre ne peut pas tourner. Neutre, jamais complaisant. */
function verdictNeutre(raison: string): VerdictIA {
  return {
    valide: true,
    ajustement: 0,
    drapeaux: [],
    explication: "",
    refus: null,
    modele: `indisponible (${raison})`,
  };
}

/**
 * Soumet un setup au filtre IA.
 *
 * Ne lève jamais : un incident côté modèle ne doit pas faire perdre une
 * alerte. Le repli est neutre — score inchangé, aucune explication — et
 * `modele` porte la trace de l'incident, visible dans l'admin.
 */
export async function filtrer(
  a: AlerteValide,
  score: Score,
  marche: Marche,
  modele: string,
): Promise<VerdictIA> {
  if (!iaConfiguree()) return verdictNeutre("clé absente");

  try {
    const message = await client.messages.create({
      model: modele,
      max_tokens: 900,
      system: SYSTEME,
      tools: [
        {
          name: "rendre_verdict",
          description: "Rend le verdict sur le setup. À appeler une seule fois.",
          input_schema: SCHEMA as unknown as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "rendre_verdict" },
      messages: [{ role: "user", content: dossier(a, score, marche) }],
    });

    const bloc = message.content.find((c) => c.type === "tool_use");
    if (!bloc || bloc.type !== "tool_use") return verdictNeutre("réponse sans verdict");

    const brut = bloc.input as Record<string, unknown>;

    // On re-borne côté serveur au lieu de faire confiance au schéma. Un
    // ajustement de -60 renvoyé malgré la contrainte annulerait à lui seul
    // tout le travail du moteur déterministe ; le schéma est une indication
    // pour le modèle, pas une garantie d'exécution.
    const ajustementBrut = typeof brut.ajustement === "number" ? Math.round(brut.ajustement) : 0;
    const ajustement = Math.max(-BORNE, Math.min(BORNE, ajustementBrut));

    const drapeaux = Array.isArray(brut.drapeaux)
      ? (brut.drapeaux.filter((d): d is DrapeauIA =>
          typeof d === "string" && (DRAPEAUX_IA as readonly string[]).includes(d),
        ))
      : [];

    return {
      valide: brut.valide !== false,
      ajustement,
      drapeaux,
      explication: typeof brut.explication === "string" ? brut.explication.trim() : "",
      refus: typeof brut.refus === "string" && brut.refus.trim() ? brut.refus.trim() : null,
      modele,
    };
  } catch (e) {
    const raison = e instanceof Error ? e.message.slice(0, 120) : "erreur inconnue";
    console.error("[trading-center/ia]", raison);
    return verdictNeutre(raison);
  }
}
