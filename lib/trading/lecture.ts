/**
 * LA LECTURE, SUR DE VRAIES BOUGIES.
 *
 * Ce fichier ne contient presque aucune analyse : elle existe déjà. Il branche
 * `structure.ts`, `momentum.ts` et `candles.ts` — écrits pour les exercices de
 * l'académie — sur les prix réels du marché, et en tire un plan exécutable.
 *
 * Le point important, et c'est ce qui distingue ce chemin de celui de la
 * capture d'écran : **rien ici n'est estimé**. Les niveaux ne sont pas lus sur
 * un axe, ils sont calculés à partir des prix. L'amplitude d'une bougie n'est
 * pas devinée, elle est mesurée. Deux lectures des mêmes bougies donnent le
 * même résultat, toujours — ce qui rend le backtest possible, et donc la
 * mesure honnête d'une méthode.
 *
 * Le modèle de langage n'intervient pas dans ce fichier. Sa place est après :
 * expliquer en français ce que le moteur a trouvé. Il ne décide de rien.
 */

import { Candle, PATTERN_BY_KEY, PatternDef, detectAt, geometry } from "./candles";
import { MomentumReading, readMomentum } from "./momentum";
import { Leg, Reading, StructureEvent, Zone, read } from "./structure";
import { MINUTES, Unite } from "./marche";

// ------------------------------------------------------------------ types ---

export type Sens = "achat" | "vente" | "attendre";

export interface Duree {
  temps: string;
  secondes: number;
  bougies: number;
}

export interface Lecture {
  symbole: string;
  unite: Unite;
  prix: number;
  /** Horodatage de la dernière bougie. */
  t: number;

  tendance: Reading["state"];
  momentum: MomentumReading;
  /** Figures détectées sur la dernière bougie clôturée. */
  figures: PatternDef[];
  /** Le dernier événement de structure, s'il est récent. */
  evenement: StructureEvent | null;

  /** Niveau opposé le plus proche — la résistance sur une vente, le support sur un achat. */
  obstacle: Zone | null;
  /** Niveau visé dans le sens du mouvement. */
  objectif: Zone | null;

  sens: Sens;
  /** 0 à 100 — somme de critères objectifs, pas une impression. */
  confiance: number;
  /** Les critères retenus, un par ligne. C'est la justification du score. */
  raisons: string[];

  /** Progression moyenne du prix par bougie, en unités de prix. */
  amplitude: number;
  directe: Duree | null;
  couverte: Duree | null;
}

// -------------------------------------------------------------- durées -----

/** Durées réellement sélectionnables dans le champ « Time » de Pocket Option. */
const DUREES = [30, 60, 120, 180, 300, 600, 900, 1800, 3600, 7200, 14400];

function enHorloge(secondes: number): string {
  const h = Math.floor(secondes / 3600);
  const m = Math.floor((secondes % 3600) / 60);
  const s = secondes % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * Convertit un nombre de bougies en durée sélectionnable.
 *
 * On arrondit VERS LE HAUT : une expiration trop courte fait perdre un trade
 * dont la lecture était juste, une expiration un peu longue ne coûte que de
 * l'attente. Plafond à 20 bougies — au-delà, la lecture qui justifie l'entrée
 * a toutes les chances d'être périmée avant l'échéance.
 */
function duree(bougies: number, minutesParBougie: number): Duree | null {
  const n = Math.min(20, Math.max(1, Math.ceil(bougies)));
  const secondes = DUREES.find((d) => d >= n * minutesParBougie * 60);
  return secondes ? { temps: enHorloge(secondes), secondes, bougies: n } : null;
}

// ------------------------------------------------------------- les zones ----

/**
 * Le niveau le plus proche au-dessus et en dessous du prix.
 *
 * `zones()` renvoie les regroupements de pivots triés par nombre de touches.
 * Ce qui compte ici, c'est la distance : un niveau touché cinq fois mais très
 * loin ne gêne pas un trade de trois minutes, alors qu'un niveau touché deux
 * fois juste au-dessus le décide.
 */
function encadrement(zones: Zone[], prix: number): { dessus: Zone | null; dessous: Zone | null } {
  let dessus: Zone | null = null;
  let dessous: Zone | null = null;

  for (const z of zones) {
    if (z.price > prix && (!dessus || z.price < dessus.price)) dessus = z;
    if (z.price < prix && (!dessous || z.price > dessous.price)) dessous = z;
  }
  return { dessus, dessous };
}

/**
 * L'objectif quand il n'existe aucun niveau devant.
 *
 * C'est le cas le plus fréquent dans une vraie tendance : le prix vient de
 * faire un plus bas, donc plus rien n'a jamais été touché en dessous. Sans
 * repli de calcul, l'outil resterait muet exactement quand le signal est le
 * plus net — le défaut est apparu au premier test.
 *
 * On projette alors un « mouvement mesuré » : la dernière jambe complète du
 * mouvement, reportée depuis le prix actuel. C'est ce que fait un trader qui
 * dit « le marché a fait 40 points, il en refera 40 ». À défaut de jambe
 * exploitable, on retombe sur cinq bougies moyennes — l'ordre de grandeur
 * d'une expiration courte.
 */
function objectifProjete(
  legs: Leg[],
  prix: number,
  amplitude: number,
  vente: boolean,
): Zone | null {
  const derniers = legs.slice(-4);
  const jambes: number[] = [];
  for (let i = 1; i < derniers.length; i++) {
    jambes.push(Math.abs(derniers[i].pivot.price - derniers[i - 1].pivot.price));
  }

  const utiles = jambes.filter((d) => d > 0).sort((a, b) => a - b);
  const mesure = utiles.length
    ? utiles[Math.floor(utiles.length / 2)] // médiane : robuste aux jambes aberrantes
    : amplitude * 5;

  if (!isFinite(mesure) || mesure <= 0) return null;

  return {
    price: vente ? prix - mesure : prix + mesure,
    // Zéro touche : ce niveau n'a jamais été visité, et l'affichage doit le
    // dire — c'est une projection, pas un niveau observé.
    touches: 0,
    kind: vente ? "creux" : "sommet",
  };
}

// ----------------------------------------------------------- la décision ----

/**
 * Le sens et la confiance, par accumulation de critères objectifs.
 *
 * Aucune pondération magique : chaque critère vaut ce qu'il vaut, il est nommé
 * dans `raisons`, et l'élève peut refaire l'addition. Un score de 70 qu'on ne
 * peut pas décomposer ne vaut rien ; c'est exactement le reproche qu'on fait
 * aux canaux de signaux.
 *
 * La règle de fond vient du Niveau 3 : **on ne trade pas contre la structure.**
 * Une figure haussière dans une tendance baissière n'est pas un achat, c'est
 * un rebond — et c'est la façon la plus courante de perdre en ayant « bien lu ».
 */
function decider(
  tendance: Reading["state"],
  momentum: MomentumReading,
  figures: PatternDef[],
  evenement: StructureEvent | null,
): { sens: Sens; confiance: number; raisons: string[] } {
  const raisons: string[] = [];
  let haussier = 0;
  let baissier = 0;

  if (tendance === "haussiere") {
    haussier += 30;
    raisons.push("Structure haussière : sommets et creux plus hauts (+30)");
  } else if (tendance === "baissiere") {
    baissier += 30;
    raisons.push("Structure baissière : sommets et creux plus bas (+30)");
  } else {
    raisons.push("Range : aucune structure directionnelle (0)");
  }

  // Le momentum compte à deux titres : sa direction, et sa vigueur. Une
  // tendance propre dont le momentum va dans le même sens est tradable même
  // sans accélération — n'accorder de points qu'à l'accélération faisait
  // répondre « attendre » à des tendances parfaitement lisibles.
  if (momentum.direction !== "plat") {
    const haut = momentum.direction === "hausse";
    const points = momentum.state === "acceleration" ? 20 : momentum.state === "stable" ? 10 : 0;
    if (points) {
      if (haut) haussier += points;
      else baissier += points;
      raisons.push(
        `Momentum ${haut ? "haussier" : "baissier"} ${
          momentum.state === "acceleration" ? "en accélération" : "régulier"
        } (+${points})`,
      );
    }
  }
  if (momentum.state === "ralentissement") {
    raisons.push("Momentum en essoufflement : le mouvement perd sa force (0)");
  }

  // Une figure ne compte que si elle va dans le sens de la structure.
  for (const f of figures) {
    if (f.bias === "neutre") continue;
    const alignee =
      (f.bias === "haussier" && tendance === "haussiere") ||
      (f.bias === "baissier" && tendance === "baissiere");
    if (alignee) {
      if (f.bias === "haussier") haussier += 20;
      else baissier += 20;
      raisons.push(`${f.name} dans le sens de la structure (+20)`);
    } else {
      raisons.push(`${f.name} contre la structure — ignorée, c'est un rebond (0)`);
    }
  }

  if (evenement) {
    const points = evenement.kind === "CHoCH" ? 15 : 10;
    if (evenement.direction === "haussier") haussier += points;
    else baissier += points;
    raisons.push(
      `${evenement.kind} ${evenement.direction} à ${evenement.level.toFixed(5)} (+${points})`,
    );
  }

  const ecart = haussier - baissier;
  // Sous 35, les critères ne convergent pas assez pour engager de l'argent.
  const sens: Sens = Math.abs(ecart) < 35 ? "attendre" : ecart > 0 ? "achat" : "vente";
  const confiance = Math.min(100, Math.max(haussier, baissier));

  if (sens === "attendre") {
    raisons.push("Les critères ne convergent pas assez — on n'entre pas.");
  }

  return { sens, confiance, raisons };
}

// ------------------------------------------------------------ la lecture ----

/**
 * Lit une série et en tire un plan complet.
 *
 * `fenetre` limite le nombre de bougies examinées : sur du 1 minute, deux
 * cents bougies remontent à plus de trois heures, ce qui n'a plus rien à voir
 * avec un trade de trois minutes.
 */
export function lire(
  symbole: string,
  unite: Unite,
  toutes: Candle[],
  fenetre = 120,
): Lecture {
  const candles = toutes.slice(-fenetre);
  const derniere = candles[candles.length - 1];
  const prix = derniere.c;

  const structure = read(candles);
  const momentum = readMomentum(candles);
  const figures = detectAt(candles, candles.length - 1);

  // Un événement de structure ne compte que s'il est récent : une cassure
  // vieille de cinquante bougies ne dit plus rien du trade de maintenant.
  const dernierEvenement = structure.events[structure.events.length - 1] ?? null;
  const evenement =
    dernierEvenement && candles.length - dernierEvenement.i <= 10 ? dernierEvenement : null;

  const { sens, confiance, raisons } = decider(structure.state, momentum, figures, evenement);

  const { dessus, dessous } = encadrement(structure.zones, prix);
  const obstacle = sens === "achat" ? dessous : sens === "vente" ? dessus : null;
  let objectif = sens === "achat" ? dessus : sens === "vente" ? dessous : null;

  // L'amplitude moyenne des corps donne la vitesse réelle du marché — c'est
  // elle qui convertit une distance en nombre de bougies, donc en durée.
  const recentes = candles.slice(-10);
  const amplitude =
    recentes.reduce((s, k) => s + geometry(k).body, 0) / Math.max(1, recentes.length);

  // Dans une vraie tendance, il n'y a par définition aucun niveau déjà touché
  // devant le prix : on projette alors un mouvement mesuré.
  if (sens !== "attendre" && !objectif) {
    objectif = objectifProjete(structure.legs, prix, amplitude, sens === "vente");
  }

  let directe: Duree | null = null;
  let couverte: Duree | null = null;

  if (sens !== "attendre" && objectif && amplitude > 0) {
    directe = duree(Math.abs(objectif.price - prix) / amplitude, MINUTES[unite]);

    // La durée couverte encaisse un aller-retour : le prix va d'abord tester
    // le niveau opposé, puis repart. En binaire, seul compte de quel côté du
    // prix d'entrée on se trouve à l'échéance — expirer pendant ce repli fait
    // perdre un trade dont la lecture était juste.
    //
    // Mais ça n'a de sens que si le repli est PLAUSIBLE. Un obstacle à seize
    // bougies ne sera pas testé pendant un trade de trois minutes : le couvrir
    // produisait une expiration au plafond, inutilisable, et c'est ce qu'a
    // montré le premier test. Au-delà de quatre bougies de distance, le prix
    // aurait le temps d'invalider la lecture avant d'y arriver — il n'y a plus
    // rien à couvrir, la durée directe est la bonne réponse.
    if (obstacle) {
      const bougiesJusquObstacle = Math.abs(obstacle.price - prix) / amplitude;
      if (bougiesJusquObstacle <= 4) {
        const trajet = Math.abs(obstacle.price - prix) + Math.abs(objectif.price - obstacle.price);
        couverte = duree(trajet / amplitude, MINUTES[unite]);
      }
    }
  }

  return {
    symbole,
    unite,
    prix,
    t: derniere.t,
    tendance: structure.state,
    momentum,
    figures,
    evenement,
    obstacle,
    objectif,
    sens,
    confiance,
    raisons,
    amplitude,
    directe,
    couverte,
  };
}

// ------------------------------------------------------------ la synthèse ---

export interface Synthese {
  symbole: string;
  sens: Sens;
  confiance: number;
  alignement: "total" | "majoritaire" | "conflit";
  accord: number;
  /** L'unité sur laquelle on entre : la plus courte qui va dans le sens retenu. */
  entree: Lecture | null;
  lectures: Lecture[];
}

/**
 * Confronte plusieurs unités de temps.
 *
 * Même principe que la synthèse de la page d'analyse, et pour la même raison :
 * un M1 haussier dans une H1 baissière n'est pas un achat. Le poids croît avec
 * le logarithme de la durée — une H1 pèse plus qu'une M1, mais pas soixante
 * fois plus, sans quoi l'analyse multi-échelles ne servirait à rien.
 */
export function synthetiser(lectures: Lecture[]): Synthese {
  const poids = (l: Lecture) => 1 + Math.log2(MINUTES[l.unite]);
  const total = lectures.reduce((s, l) => s + poids(l), 0);
  const score = lectures.reduce(
    (s, l) => s + poids(l) * (l.sens === "achat" ? 1 : l.sens === "vente" ? -1 : 0),
    0,
  );

  const part = total > 0 ? Math.abs(score) / total : 0;
  const votants = lectures.filter((l) => l.sens !== "attendre");
  const tousDaccord = votants.length > 1 && votants.every((l) => l.sens === votants[0].sens);

  const alignement =
    tousDaccord && part > 0.85 ? "total" : part >= 0.6 ? "majoritaire" : "conflit";

  // Un conflit entre échelles n'est pas un signal faible, c'est une absence de
  // signal. On s'abstient au lieu de diluer.
  const sens: Sens =
    alignement === "conflit" ? "attendre" : score > 0 ? "achat" : score < 0 ? "vente" : "attendre";

  const moyenne =
    total > 0 ? lectures.reduce((s, l) => s + poids(l) * l.confiance, 0) / total : 0;
  const facteur = alignement === "total" ? 1 : alignement === "majoritaire" ? 0.8 : 0.45;

  const entree =
    sens === "attendre"
      ? null
      : lectures
          .filter((l) => l.sens === sens)
          .sort((a, b) => MINUTES[a.unite] - MINUTES[b.unite])[0] ?? null;

  return {
    symbole: lectures[0]?.symbole ?? "",
    sens,
    confiance: Math.round(Math.max(0, Math.min(100, moyenne * facteur))),
    alignement,
    accord: Math.round(part * 100),
    entree,
    lectures: [...lectures].sort((a, b) => MINUTES[a.unite] - MINUTES[b.unite]),
  };
}

/** Nom lisible d'une figure, pour l'affichage. */
export const nomFigure = (cle: string): string => PATTERN_BY_KEY[cle]?.name ?? cle;
