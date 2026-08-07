/**
 * SYNTHÈSE MULTI-UNITÉS DE TEMPS.
 *
 * Une lecture sur une seule unité de temps est aveugle : un M1 haussier dans
 * une H1 baissière n'est pas un achat, c'est un rebond dans une baisse — et
 * c'est la façon la plus courante de perdre un trade dont la lecture était
 * pourtant « juste ».
 *
 * L'élève envoie plusieurs captures du même actif ; chacune est analysée
 * séparément (route `analyse-chart`), puis cette route les confronte.
 *
 * Partage des rôles, volontaire :
 *
 * — **La DÉCISION est calculée**, pas demandée au modèle. Sens, alignement et
 *   confiance sortent d'une pondération explicite : les grandes unités de temps
 *   pèsent plus lourd sur la direction, parce qu'il faut plus de monde pour
 *   faire bouger une H1 qu'une M1. Un chiffre qu'on peut refaire à la main vaut
 *   mieux qu'un chiffre qu'il faut croire.
 *
 * — **L'EXPLICATION vient du modèle.** Dire « la H1 monte, la M5 corrige, donc
 *   attends le retour sur le support avant d'acheter » demande un jugement que
 *   ne produit aucune moyenne pondérée.
 *
 * L'expiration reste celle de l'unité d'entrée — la plus courte qui va dans le
 * sens retenu. C'est sur celle-là qu'on entre, donc c'est sa vitesse qui compte.
 */

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { minutesDeUnite } from "@/lib/trading/unites";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.TRADING_CHAT_MODEL || "claude-sonnet-5";

export const maxDuration = 300;

// ------------------------------------------------------------------ types ---

type Sens = "achat" | "vente" | "attendre";
type Alignement = "total" | "majoritaire" | "conflit";

/**
 * Le plan binaire calculé par `analyse-chart`. Il traverse cette route sans
 * être recalculé : celui de l'unité d'entrée est déjà le bon, puisque c'est
 * sur cette unité qu'on entre.
 */
interface Binaire {
  bouton: "BUY" | "SELL" | null;
  temps: string | null;
  secondes: number | null;
  bougies: number | null;
  minutes_par_bougie: number | null;
  source: "calcul" | "estimation" | null;
  direct: unknown;
  couvert: unknown;
  repli: unknown;
}

interface AnalyseEntrante {
  unite_temps?: string | null;
  instrument?: string | null;
  tendance?: string;
  verdict?: string;
  confiance?: number;
  resume?: string;
  invalidation?: string;
  binaire?: Binaire;
  niveaux_action?: unknown[];
}

interface Unite extends AnalyseEntrante {
  minutes: number;
  sens: Sens;
  poids: number;
}

const sensDe = (verdict: unknown): Sens =>
  verdict === "achat" || verdict === "vente" ? verdict : "attendre";

/**
 * Le poids d'une unité de temps dans la décision.
 *
 * Proportionnel au logarithme de sa durée : une H1 pèse plus qu'une M1, mais
 * pas soixante fois plus — sinon une seule grande unité écraserait toutes les
 * autres et l'analyse multi-échelles ne servirait plus à rien.
 */
const poidsDe = (minutes: number): number => 1 + Math.log2(Math.max(1, minutes));

// ------------------------------------------------------------ la décision ---

interface Decision {
  sens: Sens;
  alignement: Alignement;
  confiance: number;
  accord_pourcent: number;
  entree: Unite | null;
  binaire: Binaire | null;
  /** Ceux de l'unité d'entrée : c'est sur elle qu'on se place. */
  niveaux_action: unknown[];
  unites: {
    unite: string;
    minutes: number;
    sens: Sens;
    confiance: number;
    accord: boolean;
    resume: string;
  }[];
}

function decider(unites: Unite[]): Decision {
  // Une unité qui dit « attendre » ne vote pas pour un sens, mais son poids
  // compte dans le total : trois unités indécises ne font pas un signal.
  const total = unites.reduce((s, u) => s + u.poids, 0);
  const score = unites.reduce(
    (s, u) => s + u.poids * (u.sens === "achat" ? 1 : u.sens === "vente" ? -1 : 0),
    0,
  );

  const part = total > 0 ? Math.abs(score) / total : 0;
  const sensBrut: Sens = score > 0 ? "achat" : score < 0 ? "vente" : "attendre";

  const votants = unites.filter((u) => u.sens !== "attendre");
  const tousDaccord = votants.length > 1 && votants.every((u) => u.sens === votants[0].sens);

  const alignement: Alignement =
    tousDaccord && part > 0.85 ? "total" : part >= 0.6 ? "majoritaire" : "conflit";

  // Un conflit entre unités de temps n'est pas un signal faible : c'est
  // l'absence de signal. On ne dilue pas, on s'abstient.
  const sens: Sens = alignement === "conflit" ? "attendre" : sensBrut;

  // Confiance : moyenne pondérée des confiances individuelles, corrigée par le
  // degré d'accord. Deux unités sûres qui se contredisent ne donnent pas une
  // conclusion sûre.
  const moyenne =
    total > 0
      ? unites.reduce((s, u) => s + u.poids * (typeof u.confiance === "number" ? u.confiance : 0), 0) /
        total
      : 0;
  const facteur = alignement === "total" ? 1 : alignement === "majoritaire" ? 0.8 : 0.45;
  const confiance = Math.round(Math.max(0, Math.min(100, moyenne * facteur)));

  // L'entrée se fait sur la plus petite unité qui va dans le sens retenu :
  // c'est elle qui donne le tempo, donc l'expiration.
  const entree =
    sens === "attendre"
      ? null
      : unites.filter((u) => u.sens === sens).sort((a, b) => a.minutes - b.minutes)[0] ?? null;

  return {
    sens,
    alignement,
    confiance,
    accord_pourcent: Math.round(part * 100),
    entree,
    binaire: entree?.binaire ?? null,
    niveaux_action: entree?.niveaux_action ?? [],
    unites: unites.map((u) => ({
      unite: u.unite_temps || `${u.minutes} min`,
      minutes: u.minutes,
      sens: u.sens,
      confiance: typeof u.confiance === "number" ? u.confiance : 0,
      accord: sens !== "attendre" && u.sens === sens,
      resume: typeof u.resume === "string" ? u.resume : "",
    })),
  };
}

// ------------------------------------------------------------ le récit -----

const SYSTEM = `Tu es l'analyste de l'Académie Trading de KONEKSYON PAM. On te donne la lecture de plusieurs unités de temps du MÊME actif, et la conclusion déjà calculée. Ton travail est de l'expliquer, pas de la refaire.

RÈGLES
— La direction, l'alignement et la confiance sont DÉJÀ décidés par le calcul. Tu ne les contredis pas, tu les expliques. Si tu penses que la conclusion est fragile, dis-le dans "a_surveiller", jamais en proposant un autre sens.
— Deux à trois phrases pour "lecture", pas plus. L'élève lit un tableau juste en dessous : ne récite pas les unités une par une, dis ce que leur ensemble raconte.
— Ce qui compte : les grandes unités donnent la direction, les petites donnent le moment. Quand elles divergent, nomme précisément la divergence — « la H1 monte mais la M5 corrige encore » vaut mieux que « signaux mitigés ».
— En cas de conflit, "a_surveiller" dit ce qu'il faut ATTENDRE pour que le signal se forme : un niveau à retrouver, une clôture à voir, une unité à laisser se retourner. Concret, pas « attendre plus de clarté ».
— Quand tout est aligné, "a_surveiller" dit ce qui casserait cet alignement.
— Français, direct, technique. Vocabulaire du programme : HH/HL, LH/LL, BOS, CHoCH, mèche de rejet, essoufflement, prise de liquidité. Pas de politesse, pas de « il semblerait ».
— Ne promets aucun résultat et n'annonce aucun chiffre d'expiration : il est calculé et affiché ailleurs.`;

const SCHEMA = {
  type: "object",
  properties: {
    lecture: {
      type: "string",
      maxLength: 340,
      description:
        "2 à 3 phrases : ce que les unités de temps racontent ENSEMBLE, et pourquoi cette direction.",
    },
    a_surveiller: {
      type: "string",
      maxLength: 240,
      description:
        "UNE phrase concrète : ce qui casserait l'alignement, ou ce qu'il faut attendre en cas de conflit.",
    },
  },
  required: ["lecture", "a_surveiller"],
} as const;

// ------------------------------------------------------------------ route ---

export async function POST(request: NextRequest) {
  if (!process.env.CLAUDE_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "La synthèse n'est pas configurée." }, { status: 503 });
  }

  let body: { analyses?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requête illisible." }, { status: 400 });
  }

  if (!Array.isArray(body.analyses)) {
    return Response.json({ error: "Aucune analyse reçue." }, { status: 400 });
  }

  // Une unité de temps illisible ne peut pas être pondérée : on l'écarte de la
  // décision plutôt que de lui inventer un rang.
  const unites: Unite[] = (body.analyses as AnalyseEntrante[])
    .filter((a) => a && typeof a === "object")
    .map((a) => {
      const minutes = minutesDeUnite(a.unite_temps) ?? a.binaire?.minutes_par_bougie ?? null;
      return minutes ? { ...a, minutes, sens: sensDe(a.verdict), poids: poidsDe(minutes) } : null;
    })
    .filter((u): u is Unite => u !== null)
    .sort((a, b) => a.minutes - b.minutes);

  if (unites.length < 2) {
    return Response.json(
      {
        error:
          "Il faut au moins deux graphiques dont l'unité de temps est lisible pour comparer les échelles.",
      },
      { status: 400 },
    );
  }

  const decision = decider(unites);

  const tableau = decision.unites
    .map(
      (u) =>
        `- ${u.unite} : ${u.sens} (confiance ${u.confiance}%) — ${u.resume || "pas de résumé"}`,
    )
    .join("\n");

  const instrument = unites.find((u) => u.instrument)?.instrument ?? "l'actif";

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: SYSTEM,
      tools: [
        {
          name: "rendre_synthese",
          description: "Rend l'explication de la synthèse. À appeler une seule fois.",
          input_schema: SCHEMA as unknown as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "rendre_synthese" },
      messages: [
        {
          role: "user",
          content: `Actif : ${instrument}

Lecture de chaque unité de temps, de la plus courte à la plus longue :
${tableau}

Conclusion déjà calculée (ne la contredis pas) :
- Sens retenu : ${decision.sens}
- Alignement : ${decision.alignement} (${decision.accord_pourcent}% du poids va dans le même sens)
- Confiance : ${decision.confiance}%
- Unité d'entrée : ${decision.entree?.unite_temps ?? "aucune"}

Appelle rendre_synthese.`,
        },
      ],
    });

    const bloc = message.content.find((c) => c.type === "tool_use");
    const recit =
      bloc && bloc.type === "tool_use" ? (bloc.input as Record<string, unknown>) : null;

    return Response.json({
      synthese: {
        ...decision,
        instrument,
        lecture: typeof recit?.lecture === "string" ? recit.lecture : "",
        a_surveiller: typeof recit?.a_surveiller === "string" ? recit.a_surveiller : "",
      },
    });
  } catch (e) {
    console.error("[trading/synthese]", e instanceof Error ? e.message : e);
    // Le calcul, lui, a abouti : mieux vaut rendre la décision sans son récit
    // que de tout perdre parce que la rédaction a échoué.
    return Response.json({
      synthese: { ...decision, instrument, lecture: "", a_surveiller: "" },
    });
  }
}
