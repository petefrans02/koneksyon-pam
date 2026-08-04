/**
 * ACADÉMIE TRADING — mesure du momentum (Niveau 5).
 *
 * Le momentum n'est pas la direction. Un marché peut monter en s'essoufflant,
 * et cette distinction est tout l'objet du niveau : le prix dit *où*, le
 * momentum dit *avec quelle conviction*.
 *
 * Trois mesures, toutes exprimées en ratio d'une fenêtre récente sur une
 * fenêtre antérieure. Aucune valeur absolue : un corps de 2 $ ne veut rien dire
 * sans savoir à quoi le comparer.
 *
 * - **corps** : les bougies deviennent-elles plus décidées ?
 * - **amplitude** : le marché prend-il plus de place ?
 * - **vitesse** : le prix parcourt-il plus de distance par période ?
 *
 * Volontairement sans indicateur classique (RSI, MACD…). Le but est que
 * l'élève voie *dans les bougies* ce que ces indicateurs résument, pas qu'il
 * apprenne à lire une courbe de plus.
 */

import { Candle } from "./candles";

export type MomentumState = "acceleration" | "ralentissement" | "stable";

export interface MomentumReading {
  /** Rapport corps moyen récent / corps moyen antérieur. */
  bodyRatio: number;
  /** Rapport amplitude moyenne récente / antérieure. */
  rangeRatio: number;
  /** Rapport de la distance parcourue par période, récente / antérieure. */
  speedRatio: number;
  /** Score composite : > 1 accélère, < 1 ralentit. */
  score: number;
  state: MomentumState;
  /**
   * Direction du mouvement sur la fenêtre récente. Le momentum se lit
   * toujours en regard d'une direction : un marché qui accélère à la baisse et
   * un qui accélère à la hausse ont le même score.
   */
  direction: "hausse" | "baisse" | "plat";
}

/**
 * Seuils du classement. Une bande morte autour de 1 est indispensable :
 * sans elle, le moindre écart de bruit basculerait le verdict, et l'élève
 * verrait des accélérations partout.
 */
export const SEUIL_ACCELERE = 1.25;
export const SEUIL_RALENTIT = 0.8;
/**
 * Déplacement net minimal pour affirmer une direction, exprimé en **amplitudes
 * moyennes de bougie** — pas en pourcentage du prix.
 *
 * Le seuil était auparavant absolu : 0,4 % de variation. Calibré sur les
 * bougies générées de l'académie, qui bougent beaucoup, il était inatteignable
 * sur un vrai marché — 0,4 % sur huit bougies d'EUR/USD en M1, c'est 46 pips
 * en huit minutes. La direction ressortait donc « plate » en permanence, le
 * momentum ne marquait jamais de points, et toute lecture finissait en
 * « attendre ». Sept symboles testés, sept fois le même verdict : c'est ce qui
 * a mis la puce à l'oreille.
 *
 * Rapporter le déplacement à l'amplitude moyenne des bougies rend le seuil
 * indépendant de l'instrument et de l'unité de temps : « le prix a-t-il
 * parcouru au moins une bougie moyenne dans un sens ? » veut dire la même
 * chose sur EUR/USD en M1 que sur le Bitcoin en H1.
 */
export const SEUIL_DIRECTION = 1.0;

function moyenne(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Rapport récent/antérieur, protégé contre la division par zéro. */
function ratio(recent: number, anterieur: number): number {
  if (anterieur <= 0) return recent > 0 ? 2 : 1;
  return recent / anterieur;
}

/**
 * Lit le momentum sur les `fenetre` dernières bougies, comparées aux
 * `fenetre` qui les précèdent.
 *
 * Deux fenêtres de taille égale, adjacentes : c'est la comparaison la plus
 * simple qui soit défendable. Comparer à une moyenne longue mélangerait des
 * régimes différents.
 */
export function readMomentum(candles: Candle[], fenetre = 8): MomentumReading {
  const neutre: MomentumReading = {
    bodyRatio: 1,
    rangeRatio: 1,
    speedRatio: 1,
    score: 1,
    state: "stable",
    direction: "plat",
  };
  if (candles.length < fenetre * 2) return neutre;

  const recent = candles.slice(-fenetre);
  const avant = candles.slice(-fenetre * 2, -fenetre);

  const corpsRecent = moyenne(recent.map((k) => Math.abs(k.c - k.o)));
  const corpsAvant = moyenne(avant.map((k) => Math.abs(k.c - k.o)));
  const ampRecent = moyenne(recent.map((k) => k.h - k.l));
  const ampAvant = moyenne(avant.map((k) => k.h - k.l));

  // Distance nette parcourue par période : c'est ça, la vitesse. Une série de
  // grandes bougies qui s'annulent a de gros corps mais une vitesse nulle —
  // et c'est exactement un marché qui s'agite sans avancer.
  const distRecent = Math.abs(recent[recent.length - 1].c - recent[0].o) / fenetre;
  const distAvant = Math.abs(avant[avant.length - 1].c - avant[0].o) / fenetre;

  const bodyRatio = ratio(corpsRecent, corpsAvant);
  const rangeRatio = ratio(ampRecent, ampAvant);
  const speedRatio = ratio(distRecent, distAvant);

  // Moyenne GÉOMÉTRIQUE, vitesse au carré. Deux raisons, et la seconde est un
  // piège dans lequel une moyenne arithmétique tombe :
  //
  // 1. On combine des ratios. La moyenne géométrique est la bonne opération
  //    pour ça — l'arithmétique surpondère les grandes valeurs.
  //
  // 2. Surtout : elle rend un facteur nul dominant. Prends un marché aux
  //    corps énormes mais alternés, qui s'agite sans avancer. Corps ×5,
  //    amplitude ×5, vitesse ×0. En moyenne arithmétique le score monte à 2,5
  //    et on annonce une « accélération » — alors que la progression
  //    directionnelle s'est effondrée. En géométrique le score tombe à 0 :
  //    perte de momentum, ce qui est la lecture juste.
  //
  // Autrement dit : sans avancée, pas d'accélération, quelle que soit la
  // taille des bougies.
  const score = Math.pow(bodyRatio * rangeRatio * speedRatio * speedRatio, 1 / 4);

  // Le déplacement net, comparé à ce que parcourt une bougie moyenne. Un
  // marché qui a avancé de moins d'une bougie en huit bougies n'a pas de
  // direction : il oscille.
  const deplacement = recent[recent.length - 1].c - recent[0].o;
  const seuil = ampRecent * SEUIL_DIRECTION;
  const direction =
    seuil <= 0
      ? "plat"
      : deplacement > seuil
        ? "hausse"
        : deplacement < -seuil
          ? "baisse"
          : "plat";

  const state: MomentumState =
    score >= SEUIL_ACCELERE ? "acceleration" : score <= SEUIL_RALENTIT ? "ralentissement" : "stable";

  return { bodyRatio, rangeRatio, speedRatio, score, state, direction };
}

/** Seuils de l'expansion sans progression. */
export const EXPANSION_CORPS_MIN = 1.4;
export const EXPANSION_VITESSE_MAX = 0.7;

/**
 * « Ça s'agite sans avancer » : les bougies grossissent nettement alors que la
 * progression nette s'effondre.
 *
 * C'est un régime à part, pas un simple ralentissement, et il mérite d'être
 * nommé : c'est le pire terrain pour la plupart des approches — mouvements
 * larges, stops qui sautent des deux côtés, rien qui aboutit. Le reconnaître
 * pour s'abstenir est une compétence en soi.
 */
export function isExpansionSansProgression(r: MomentumReading): boolean {
  return r.bodyRatio >= EXPANSION_CORPS_MIN && r.speedRatio <= EXPANSION_VITESSE_MAX;
}

/**
 * Force du marché sur la fenêtre récente, de 0 à 1.
 *
 * Combine trois signaux qu'un élève doit apprendre à voir simultanément :
 * la part des bougies allant dans le sens du mouvement, la taille de leurs
 * corps rapportée à l'amplitude, et la position des clôtures dans leur
 * amplitude (finir près de l'extrême = finir en force, cf. Niveau 2).
 */
export function strength(candles: Candle[], fenetre = 8): number {
  if (candles.length < 2) return 0.5;
  const recent = candles.slice(-fenetre);
  const monte = recent[recent.length - 1].c >= recent[0].o;

  let alignees = 0;
  let corpsPart = 0;
  let clotureForte = 0;
  for (const k of recent) {
    const amp = k.h - k.l;
    const haussiere = k.c > k.o;
    if (haussiere === monte) alignees++;
    if (amp > 0) {
      corpsPart += Math.abs(k.c - k.o) / amp;
      // Position de la clôture dans l'amplitude, ramenée au sens du mouvement.
      const pos = (k.c - k.l) / amp;
      clotureForte += monte ? pos : 1 - pos;
    }
  }
  const n = recent.length;
  const score = (alignees / n + corpsPart / n + clotureForte / n) / 3;
  return Math.max(0, Math.min(1, score));
}
