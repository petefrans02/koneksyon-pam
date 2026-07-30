/**
 * ACADÉMIE TRADING — illustrations canoniques.
 *
 * Les leçons ont besoin de montrer les figures, pas seulement de les décrire.
 * Ce fichier fabrique les bougies de chaque illustration.
 *
 * Règle absolue, vérifiée par les tests : **une illustration doit être une
 * véritable instance de la figure qu'elle prétend montrer.** Chaque exemple est
 * passé au détecteur de `candles.ts`, et un exemple que le détecteur ne
 * reconnaît pas est un bug — pas une approximation acceptable. Sans cette
 * contrainte, on enseignerait une forme et on en détecterait une autre dans les
 * exercices, ce qui est le meilleur moyen de perdre l'élève.
 *
 * Conséquence pratique : plusieurs figures dépendent de la tendance qui les
 * précède (marteau contre pendu, étoile filante contre marteau inversé). Leur
 * illustration embarque donc un contexte de bougies, même si l'affichage n'en
 * montre qu'une partie.
 */

import { Candle, PATTERN_BY_KEY, detectAt } from "./candles";

export interface Example {
  /** Toutes les bougies, contexte compris. */
  candles: Candle[];
  /** Index de la bougie qui termine la figure. */
  at: number;
  /** Nombre de bougies que couvre la figure. */
  span: number;
  /** Nombre de bougies de contexte à afficher avant la figure. */
  contextShown: number;
}

/**
 * Contexte en pente régulière. `from` → `to` sur `n` bougies, corps modestes
 * pour que le contexte ne vole pas la vedette à la figure.
 */
function ramp(from: number, to: number, n: number, t0 = 0): Candle[] {
  const out: Candle[] = [];
  const pas = (to - from) / n;
  for (let i = 0; i < n; i++) {
    const o = from + pas * i;
    const c = o + pas;
    out.push({
      t: t0 + i,
      o,
      h: Math.max(o, c) + Math.abs(pas) * 0.35,
      l: Math.min(o, c) - Math.abs(pas) * 0.35,
      c,
    });
  }
  return out;
}

/** Contexte baissier : prépare marteau et marteau inversé. */
const BAISSE = () => ramp(126, 100, 13);
/** Contexte haussier : prépare pendu et étoile filante. */
const HAUSSE = () => ramp(100, 126, 13);
/** Contexte plat : pour les figures qui ne dépendent pas de la tendance. */
const PLAT = () => ramp(100, 101.5, 13);

function ex(contexte: Candle[], figure: Candle[], contextShown = 5): Example {
  const candles = [...contexte, ...figure];
  return {
    candles,
    at: candles.length - 1,
    span: figure.length,
    contextShown,
  };
}

/**
 * Les illustrations, par clé de figure. Les valeurs sont choisies pour être
 * lisibles à petite taille : mèches franches, corps nets, proportions
 * exagérées par rapport à un vrai marché — c'est un schéma, pas une capture.
 */
export const PATTERN_EXAMPLES: Record<string, Example> = {
  doji: ex(PLAT(), [{ t: 20, o: 100, h: 106, l: 94, c: 100.3 }]),

  marteau: ex(BAISSE(), [{ t: 20, o: 100, h: 101.4, l: 92, c: 101.2 }]),

  pendu: ex(HAUSSE(), [{ t: 20, o: 126, h: 127.4, l: 118, c: 127.2 }]),

  etoile_filante: ex(HAUSSE(), [{ t: 20, o: 126, h: 134, l: 124.6, c: 124.8 }]),

  marteau_inverse: ex(BAISSE(), [{ t: 20, o: 100, h: 108, l: 98.6, c: 98.8 }]),

  marubozu_haussier: ex(PLAT(), [{ t: 20, o: 100, h: 108, l: 100, c: 108 }]),

  marubozu_baissier: ex(PLAT(), [{ t: 20, o: 108, h: 108, l: 100, c: 100 }]),

  avalement_haussier: ex(PLAT(), [
    { t: 20, o: 106, h: 106.8, l: 99.4, c: 100 },
    { t: 21, o: 98.5, h: 108.5, l: 98, c: 108 },
  ]),

  avalement_baissier: ex(PLAT(), [
    { t: 20, o: 100, h: 106.6, l: 99.4, c: 106 },
    { t: 21, o: 107.5, h: 108, l: 97.5, c: 98 },
  ]),

  harami: ex(PLAT(), [
    { t: 20, o: 100, h: 110, l: 98, c: 109 },
    { t: 21, o: 105.5, h: 107.5, l: 102.5, c: 103.5 },
  ]),

  etoile_du_matin: ex(HAUSSE(), [
    // Grande rouge : son corps doit dépasser le corps moyen du contexte.
    { t: 20, o: 126, h: 126.8, l: 111, c: 112 },
    // Étoile : corps minuscule, entièrement sous la clôture de la grande rouge.
    { t: 21, o: 110.5, h: 111.2, l: 107.5, c: 109.6 },
    // Reprise : clôture au-dessus du milieu de la grande rouge (119).
    { t: 22, o: 110.4, h: 121.5, l: 109.8, c: 121 },
  ]),

  etoile_du_soir: ex(BAISSE(), [
    { t: 20, o: 100, h: 115, l: 99.2, c: 114 },
    { t: 21, o: 115.5, h: 118.5, l: 114.8, c: 116.5 },
    { t: 22, o: 115.6, h: 116, l: 104.5, c: 105 },
  ]),

  trois_soldats: ex(PLAT(), [
    { t: 20, o: 100, h: 104.3, l: 99.7, c: 104 },
    // Chaque bougie ouvre dans le corps de la veille, pas au-dessus.
    { t: 21, o: 103.4, h: 107.7, l: 103.1, c: 107.4 },
    { t: 22, o: 106.8, h: 111.1, l: 106.5, c: 110.8 },
  ]),

  trois_corbeaux: ex(PLAT(), [
    { t: 20, o: 112, h: 112.3, l: 107.7, c: 108 },
    { t: 21, o: 108.6, h: 108.9, l: 104.3, c: 104.6 },
    { t: 22, o: 105.2, h: 105.5, l: 100.9, c: 101.2 },
  ]),
};

/**
 * Bougie de référence pour le schéma d'anatomie.
 * Valeurs rondes et volontairement asymétriques, pour que chaque partie soit
 * repérable sans ambiguïté : corps de 6, mèche haute de 2, mèche basse de 4.
 */
export const ANATOMY: Candle = { t: 0, o: 100, h: 108, l: 96, c: 106 };

/** Deux bougies vertes de même corps, mais l'une finit en force et l'autre pas. */
export const FORCE_VS_FAIBLESSE: { forte: Candle; faible: Candle } = {
  // Clôture collée au plus haut : personne n'a fait refluer le prix.
  forte: { t: 0, o: 100, h: 106.3, l: 99.4, c: 106 },
  // Même corps, même amplitude basse, mais le prix a été repoussé avant la fin.
  faible: { t: 1, o: 100, h: 112, l: 99.4, c: 106 },
};

/**
 * Vérifie qu'une illustration est bien une instance de sa figure.
 * Exposé pour être appelé par les tests, mais utilisable ailleurs.
 */
export function exampleIsValid(key: string): boolean {
  const ex = PATTERN_EXAMPLES[key];
  if (!ex) return false;
  return detectAt(ex.candles, ex.at).some((p) => p.key === key);
}

/** Clés illustrées, dans l'ordre pédagogique : 1 bougie, puis 2, puis 3. */
export const GALLERY_ORDER: string[] = [
  "doji",
  "marteau",
  "pendu",
  "etoile_filante",
  "marteau_inverse",
  "marubozu_haussier",
  "marubozu_baissier",
  "avalement_haussier",
  "avalement_baissier",
  "harami",
  "etoile_du_matin",
  "etoile_du_soir",
  "trois_soldats",
  "trois_corbeaux",
];

/** Sous-ensembles utilisés par les leçons. */
export const GALLERY_UNE_BOUGIE = GALLERY_ORDER.filter(
  (k) => PATTERN_BY_KEY[k]?.size === 1,
);
export const GALLERY_COMBINEES = GALLERY_ORDER.filter(
  (k) => (PATTERN_BY_KEY[k]?.size ?? 1) > 1,
);
