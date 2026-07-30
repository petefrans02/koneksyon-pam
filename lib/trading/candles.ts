/**
 * ACADÉMIE TRADING — moteur de lecture des bougies.
 *
 * Tout le cours sur les chandeliers repose sur ce fichier. Aucune dépendance,
 * aucun appel réseau : de l'arithmétique pure sur quatre nombres (open, high,
 * low, close). C'est volontaire — le moteur doit tourner côté client pour que
 * les exercices soient instantanés, et être testable sans marché ouvert.
 *
 * Vocabulaire visuel :
 *
 *        high ─┐          ← extrême haut de la période
 *              │  mèche haute
 *           ┌──┴──┐
 *           │corps│       ← de l'ouverture à la clôture
 *           └──┬──┘
 *              │  mèche basse
 *         low ─┘
 *
 * Les seuils sont exprimés en fraction de l'amplitude (high - low), jamais en
 * valeur absolue : un seuil en dollars n'aurait aucun sens entre une action à
 * 5 $ et une à 700 $.
 */

export interface Candle {
  /** Horodatage ou index de période. */
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

/** Géométrie dérivée d'une bougie — ce que l'élève doit apprendre à lire. */
export interface Geometry {
  /** Hauteur du corps, toujours positive. */
  body: number;
  /** Amplitude totale : high - low. */
  range: number;
  upperWick: number;
  lowerWick: number;
  bullish: boolean;
  bearish: boolean;
  /** Part de l'amplitude occupée par le corps, de 0 à 1. */
  bodyRatio: number;
  /** Part occupée par chaque mèche, de 0 à 1. */
  upperRatio: number;
  lowerRatio: number;
  /** Milieu du corps — sert aux figures en trois bougies. */
  mid: number;
}

// --- Seuils, conventions usuelles de la littérature sur les chandeliers -----
export const T = {
  /** Au-delà, un corps n'exprime plus l'indécision. */
  dojiBody: 0.1,
  /** Une mèche « longue » fait au moins 2× le corps. */
  wickToBody: 2,
  /** Le côté opposé à la longue mèche doit être quasi rasé. */
  oppositeWick: 0.15,
  /** Marteau / étoile filante : corps discret. */
  smallBody: 0.33,
  /** Marubozu : presque aucune mèche. */
  marubozuBody: 0.9,
  /** Corps de l'étoile comparé au corps de la 1re bougie. */
  starBody: 0.3,
  /** Soldats / corbeaux : bougies franches, pas des dojis alignés. */
  soldierBody: 0.5,
  /** Périodes servant à juger la tendance de fond. */
  trendWindow: 10,
} as const;

export function geometry(k: Candle): Geometry {
  const bodyTop = Math.max(k.o, k.c);
  const bodyBottom = Math.min(k.o, k.c);
  const body = Math.abs(k.c - k.o);
  const range = k.h - k.l;
  const upperWick = k.h - bodyTop;
  const lowerWick = bodyBottom - k.l;
  // Une bougie plate (high === low) a une amplitude nulle : on renvoie des
  // ratios à 0 plutôt que NaN, sinon toutes les comparaisons de seuils
  // deviennent silencieusement fausses.
  const safe = range > 0 ? range : 0;
  return {
    body,
    range,
    upperWick,
    lowerWick,
    bullish: k.c > k.o,
    bearish: k.c < k.o,
    bodyRatio: safe > 0 ? body / safe : 0,
    upperRatio: safe > 0 ? upperWick / safe : 0,
    lowerRatio: safe > 0 ? lowerWick / safe : 0,
    mid: (k.o + k.c) / 2,
  };
}

/**
 * Tendance de fond : écart relatif entre la dernière clôture et la moyenne
 * mobile des `window` périodes qui la précèdent.
 *
 * Positif = le marché vient de monter. On exclut la bougie courante du calcul
 * de la moyenne : une bougie énorme comparée à elle-même paraît normale.
 */
export function trend(candles: Candle[], at: number, window = T.trendWindow): number {
  const start = Math.max(0, at - window);
  const past = candles.slice(start, at);
  if (past.length < 2) return 0;
  const sma = past.reduce((s, k) => s + k.c, 0) / past.length;
  if (sma === 0) return 0;
  return (candles[at].c - sma) / sma;
}

/** Corps moyen des `window` bougies précédant `at` — référence de « grandeur ». */
export function averageBody(candles: Candle[], at: number, window = 14): number {
  const start = Math.max(0, at - window);
  const past = candles.slice(start, at);
  if (!past.length) return 0;
  return past.reduce((s, k) => s + Math.abs(k.c - k.o), 0) / past.length;
}

// ---------------------------------------------------------------- figures ---

export type Bias = "haussier" | "baissier" | "neutre";

export interface PatternDef {
  key: string;
  /** Nom affiché à l'élève. */
  name: string;
  bias: Bias;
  /** Nombre de bougies que la figure occupe. */
  size: 1 | 2 | 3;
  /** Ce que la figure raconte — la psychologie, pas la recette. */
  meaning: string;
  /** Vrai si la figure se termine sur la bougie d'index `at`. */
  test: (candles: Candle[], at: number) => boolean;
}

const g = geometry;

/** Petit corps en haut, longue mèche basse, presque rien au-dessus. */
function hammerShape(k: Candle): boolean {
  const m = g(k);
  return (
    m.bodyRatio <= T.smallBody &&
    m.body > 0 &&
    m.lowerWick >= T.wickToBody * m.body &&
    m.upperRatio <= T.oppositeWick
  );
}

/** Le miroir : petit corps en bas, longue mèche haute. */
function starShape(k: Candle): boolean {
  const m = g(k);
  return (
    m.bodyRatio <= T.smallBody &&
    m.body > 0 &&
    m.upperWick >= T.wickToBody * m.body &&
    m.lowerRatio <= T.oppositeWick
  );
}

export const PATTERNS: PatternDef[] = [
  {
    key: "doji",
    name: "Doji",
    bias: "neutre",
    size: 1,
    meaning:
      "Le prix finit là où il a commencé. Acheteurs et vendeurs se sont neutralisés : personne ne contrôle. Un doji ne dit pas où ça va — il dit que la tendance en cours hésite.",
    test: (c, i) => {
      const m = g(c[i]);
      return m.range > 0 && m.bodyRatio <= T.dojiBody;
    },
  },
  {
    key: "marteau",
    name: "Marteau",
    bias: "haussier",
    size: 1,
    meaning:
      "Les vendeurs ont poussé le prix loin vers le bas, puis ont totalement perdu le terrain gagné avant la clôture. Cette longue mèche basse est un rejet : à ce niveau, des acheteurs sont entrés en force.",
    test: (c, i) => hammerShape(c[i]) && trend(c, i) < 0,
  },
  {
    key: "pendu",
    name: "Pendu",
    bias: "baissier",
    size: 1,
    meaning:
      "Exactement la forme du marteau, mais après une hausse. Le marché a été vendu violemment en séance. Même si les acheteurs ont récupéré, des vendeurs se sont manifestés pour la première fois : c'est un avertissement.",
    test: (c, i) => hammerShape(c[i]) && trend(c, i) > 0,
  },
  {
    key: "etoile_filante",
    name: "Étoile filante",
    bias: "baissier",
    size: 1,
    meaning:
      "Le prix a grimpé haut puis a tout rendu. La longue mèche haute montre que les acheteurs ont été absorbés : quelqu'un vendait en quantité à ce niveau.",
    test: (c, i) => starShape(c[i]) && trend(c, i) > 0,
  },
  {
    key: "marteau_inverse",
    name: "Marteau inversé",
    bias: "haussier",
    size: 1,
    meaning:
      "Même forme que l'étoile filante mais après une baisse. Une première tentative de remontée a échoué — pourtant les acheteurs ont osé. Signal plus faible, à confirmer.",
    test: (c, i) => starShape(c[i]) && trend(c, i) < 0,
  },
  {
    key: "marubozu_haussier",
    name: "Marubozu haussier",
    bias: "haussier",
    size: 1,
    meaning:
      "Ouverture au plus bas, clôture au plus haut, aucune mèche. Les acheteurs ont contrôlé chaque instant de la période. Force pure, sans hésitation.",
    test: (c, i) => {
      const m = g(c[i]);
      return m.bodyRatio >= T.marubozuBody && m.bullish;
    },
  },
  {
    key: "marubozu_baissier",
    name: "Marubozu baissier",
    bias: "baissier",
    size: 1,
    meaning:
      "L'inverse : les vendeurs ont tenu la période de bout en bout. Aucun rebond n'a été toléré.",
    test: (c, i) => {
      const m = g(c[i]);
      return m.bodyRatio >= T.marubozuBody && m.bearish;
    },
  },
  {
    key: "avalement_haussier",
    name: "Avalement haussier",
    bias: "haussier",
    size: 2,
    meaning:
      "Une bougie verte engloutit tout le corps de la rouge précédente. Le travail d'une période entière de vendeurs a été effacé en une seule. Changement de main visible.",
    test: (c, i) => {
      if (i < 1) return false;
      const p = g(c[i - 1]);
      const m = g(c[i]);
      return p.bearish && m.bullish && c[i].c > c[i - 1].o && c[i].o < c[i - 1].c;
    },
  },
  {
    key: "avalement_baissier",
    name: "Avalement baissier",
    bias: "baissier",
    size: 2,
    meaning:
      "Le miroir : une rouge engloutit la verte précédente. Les acheteurs ont été débordés d'un coup.",
    test: (c, i) => {
      if (i < 1) return false;
      const p = g(c[i - 1]);
      const m = g(c[i]);
      return p.bullish && m.bearish && c[i].c < c[i - 1].o && c[i].o > c[i - 1].c;
    },
  },
  {
    key: "harami",
    name: "Harami",
    bias: "neutre",
    size: 2,
    meaning:
      "Une bougie entièrement contenue dans la précédente. L'amplitude se comprime : le marché respire, il accumule de l'énergie. Souvent avant un mouvement, sans dire dans quel sens.",
    test: (c, i) => i >= 1 && c[i].h < c[i - 1].h && c[i].l > c[i - 1].l,
  },
  {
    key: "etoile_du_matin",
    name: "Étoile du matin",
    bias: "haussier",
    size: 3,
    meaning:
      "Trois actes : chute franche, puis pause hésitante au plus bas, puis reprise décidée. C'est la séquence complète d'un retournement — la panique, le doute, le retour des acheteurs.",
    test: (c, i) => {
      if (i < 2) return false;
      const c1 = c[i - 2];
      const c2 = c[i - 1];
      const g1 = g(c1);
      const g3 = g(c[i]);
      const avg = averageBody(c, i - 2);
      const bigRed = g1.bearish && g1.body > avg && avg > 0;
      const smallStar = Math.abs(c2.c - c2.o) <= T.starBody * g1.body;
      // L'étoile doit se former sous le corps de la grande rouge : c'est le
      // creux du mouvement, pas une pause à mi-chemin.
      const starLow = Math.max(c2.o, c2.c) < c1.c;
      // La reprise doit récupérer plus de la moitié du terrain perdu.
      const recovery = g3.bullish && c[i].c > g1.mid;
      return bigRed && smallStar && starLow && recovery;
    },
  },
  {
    key: "etoile_du_soir",
    name: "Étoile du soir",
    bias: "baissier",
    size: 3,
    meaning:
      "Le miroir de l'étoile du matin : montée franche, hésitation au sommet, puis rechute. L'euphorie, le doute, la reprise en main des vendeurs.",
    test: (c, i) => {
      if (i < 2) return false;
      const c1 = c[i - 2];
      const c2 = c[i - 1];
      const g1 = g(c1);
      const g3 = g(c[i]);
      const avg = averageBody(c, i - 2);
      const bigGreen = g1.bullish && g1.body > avg && avg > 0;
      const smallStar = Math.abs(c2.c - c2.o) <= T.starBody * g1.body;
      const starHigh = Math.min(c2.o, c2.c) > c1.c;
      const drop = g3.bearish && c[i].c < g1.mid;
      return bigGreen && smallStar && starHigh && drop;
    },
  },
  {
    key: "trois_soldats",
    name: "Trois soldats blancs",
    bias: "haussier",
    size: 3,
    meaning:
      "Trois bougies vertes franches qui montent en escalier, chacune ouvrant dans le corps de la précédente. Ce n'est pas un saut : c'est une pression d'achat soutenue, période après période.",
    test: (c, i) => {
      if (i < 2) return false;
      const solid = (k: Candle) => {
        const m = g(k);
        return m.bullish && m.bodyRatio >= T.soldierBody;
      };
      return (
        solid(c[i]) &&
        solid(c[i - 1]) &&
        solid(c[i - 2]) &&
        c[i].c > c[i - 1].c &&
        c[i - 1].c > c[i - 2].c &&
        c[i].o <= c[i - 1].c &&
        c[i - 1].o <= c[i - 2].c
      );
    },
  },
  {
    key: "trois_corbeaux",
    name: "Trois corbeaux noirs",
    bias: "baissier",
    size: 3,
    meaning:
      "Trois rouges franches en escalier descendant. Distribution méthodique : les vendeurs sortent période après période, sans laisser respirer.",
    test: (c, i) => {
      if (i < 2) return false;
      const solid = (k: Candle) => {
        const m = g(k);
        return m.bearish && m.bodyRatio >= T.soldierBody;
      };
      return (
        solid(c[i]) &&
        solid(c[i - 1]) &&
        solid(c[i - 2]) &&
        c[i].c < c[i - 1].c &&
        c[i - 1].c < c[i - 2].c &&
        c[i].o >= c[i - 1].c &&
        c[i - 1].o >= c[i - 2].c
      );
    },
  },
];

export const PATTERN_BY_KEY: Record<string, PatternDef> = Object.fromEntries(
  PATTERNS.map((p) => [p.key, p]),
);

/** Toutes les figures qui se terminent sur la bougie `at`. */
export function detectAt(candles: Candle[], at: number): PatternDef[] {
  return PATTERNS.filter((p) => {
    try {
      return p.test(candles, at);
    } catch {
      return false;
    }
  });
}

/** Balaye une série entière : index de bougie → figures détectées. */
export function scan(candles: Candle[]): Map<number, PatternDef[]> {
  const found = new Map<number, PatternDef[]>();
  for (let i = 0; i < candles.length; i++) {
    const hits = detectAt(candles, i);
    if (hits.length) found.set(i, hits);
  }
  return found;
}
