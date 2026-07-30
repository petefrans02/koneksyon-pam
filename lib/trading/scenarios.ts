/**
 * ACADÉMIE TRADING — générateur d'exercices sur bougies.
 *
 * Objectif pédagogique : l'élève doit pouvoir enchaîner des milliers de cas
 * différents. Deux façons de faire ça — un entrepôt de données historiques
 * (lourd, à maintenir, fini), ou une génération procédurale déterministe.
 * On choisit la seconde : à partir d'une graine (`seed`), on reconstruit
 * exactement le même graphique. Un exercice se partage donc par un simple
 * numéro, se rejoue à l'identique, et le stock est infini.
 *
 * Le point important, et c'est le cœur de la méthode : **la bonne réponse
 * n'est pas le biais théorique de la figure.** On génère un futur réel selon
 * un régime de marché, puis on lit ce qui s'est passé. Un marteau dans un
 * marché qui continue de chuter donne « ça baisse » — et c'est la bonne
 * réponse. L'élève apprend donc que les figures sont des probabilités, pas
 * des promesses. C'est exactement l'objectif du Niveau 6.
 */

import { Candle, PATTERN_BY_KEY, detectAt } from "./candles";
import { Reading, TrendState, read } from "./structure";
import { MomentumReading, MomentumState, isExpansionSansProgression, readMomentum } from "./momentum";

// ------------------------------------------------------------------ hasard ---

/**
 * Mulberry32 — générateur pseudo-aléatoire déterministe, 32 bits.
 * `Math.random()` ne convient pas : on a besoin de rejouer un exercice.
 */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tirage gaussien approché (somme de tirages uniformes) — mouvements plus réalistes. */
function gauss(r: () => number): number {
  return (r() + r() + r() - 1.5) * 2;
}

// -------------------------------------------------------------- fabrication ---

export type Regime = "hausse" | "baisse" | "range";

interface Ctx {
  r: () => number;
  price: number;
  vol: number;
}

/**
 * Une bougie « ordinaire » cohérente avec un régime donné.
 *
 * `force` multiplie la dérive. Il en faut : avec une dérive faible, le bruit
 * gaussien noie la tendance et une figure de retournement se retrouve plantée
 * dans un marché qui ne monte ni ne descend — donc indétectable, et surtout
 * illisible pour l'élève. Une dérive franche rend le contexte évident.
 */
function ordinary(ctx: Ctx, regime: Regime, t: number, force = 1): Candle {
  const base = regime === "hausse" ? 0.28 : regime === "baisse" ? -0.28 : 0;
  const drift = base * force;
  const o = ctx.price;
  const move = (gauss(ctx.r) + drift) * ctx.vol;
  const c = Math.max(0.01, o + move);
  // Les mèches dépassent le corps de façon aléatoire mais bornée.
  const top = Math.max(o, c) + ctx.r() * ctx.vol * 0.8;
  const bottom = Math.min(o, c) - ctx.r() * ctx.vol * 0.8;
  ctx.price = c;
  return { t, o, h: top, l: Math.max(0.01, bottom), c, v: Math.round(1000 + ctx.r() * 9000) };
}

/**
 * Fabrique les bougies qui composent une figure donnée, en partant du prix
 * courant. Renvoie les bougies de la figure — le contexte de tendance est
 * produit séparément par `buildDrill`, car marteau et pendu ont la même forme
 * et ne se distinguent que par ce qui les précède.
 */
function buildPattern(ctx: Ctx, key: string, t0: number): Candle[] {
  const { r } = ctx;
  const u = ctx.vol; // unité de mouvement
  const p = ctx.price;
  const out: Candle[] = [];
  const push = (k: Candle) => {
    out.push(k);
    ctx.price = k.c;
  };
  const jitter = (base: number) => base * (0.6 + r() * 0.8);

  switch (key) {
    case "doji": {
      const w = jitter(u);
      push({ t: t0, o: p, h: p + w, l: p - w, c: p + u * 0.02 });
      break;
    }
    case "marteau":
    case "pendu": {
      // Petit corps en haut, longue mèche basse, sommet rasé.
      const body = jitter(u * 0.25);
      const wick = body * (2.5 + r() * 2);
      push({ t: t0, o: p, h: p + body + body * 0.1, l: p - wick, c: p + body });
      break;
    }
    case "etoile_filante":
    case "marteau_inverse": {
      // Corps en bas, longue mèche haute. Le bas de la bougie doit passer
      // SOUS le corps, sinon low > close et la bougie est incohérente.
      const body = jitter(u * 0.25);
      const wick = body * (2.5 + r() * 2);
      const c = p - body;
      push({ t: t0, o: p, h: p + wick, l: c - body * 0.1, c });
      break;
    }
    case "marubozu_haussier": {
      const body = jitter(u * 1.6);
      push({ t: t0, o: p, h: p + body, l: p, c: p + body });
      break;
    }
    case "marubozu_baissier": {
      const body = jitter(u * 1.6);
      push({ t: t0, o: p, h: p, l: p - body, c: p - body });
      break;
    }
    case "avalement_haussier": {
      const b1 = jitter(u);
      // Rouge : ouvre haut, clôture bas.
      push({ t: t0, o: p + b1, h: p + b1 + u * 0.2, l: p - u * 0.1, c: p });
      const marge = u * (0.2 + r() * 0.3);
      const o2 = p - marge;
      const c2 = p + b1 + marge;
      push({ t: t0 + 1, o: o2, h: c2 + u * 0.1, l: o2 - u * 0.1, c: c2 });
      break;
    }
    case "avalement_baissier": {
      const b1 = jitter(u);
      push({ t: t0, o: p, h: p + b1 + u * 0.1, l: p - u * 0.1, c: p + b1 });
      const marge = u * (0.2 + r() * 0.3);
      const o2 = p + b1 + marge;
      const c2 = p - marge;
      push({ t: t0 + 1, o: o2, h: o2 + u * 0.1, l: c2 - u * 0.1, c: c2 });
      break;
    }
    case "harami": {
      const b1 = jitter(u * 1.5);
      push({ t: t0, o: p, h: p + b1 + u * 0.4, l: p - u * 0.4, c: p + b1 });
      // Entièrement contenue dans les extrêmes de la précédente.
      const hi = p + b1 + u * 0.25;
      const lo = p - u * 0.25;
      const mid = (hi + lo) / 2;
      const b2 = (hi - lo) * 0.3;
      push({ t: t0 + 1, o: mid - b2 / 2, h: hi, l: lo, c: mid + b2 / 2 });
      break;
    }
    case "etoile_du_matin": {
      const big = jitter(u * 2);
      push({ t: t0, o: p + big, h: p + big + u * 0.2, l: p - u * 0.1, c: p });
      // L'étoile : corps minuscule, sous la clôture de la grande rouge.
      const gap = u * (0.15 + r() * 0.25);
      const sTop = p - gap;
      const sBody = big * 0.15;
      push({ t: t0 + 1, o: sTop, h: sTop + u * 0.15, l: sTop - sBody - u * 0.3, c: sTop - sBody });
      // La reprise doit clôturer au-dessus du milieu de la grande rouge.
      const cible = p + big * 0.65;
      const o3 = p - gap * 0.5;
      push({ t: t0 + 2, o: o3, h: cible + u * 0.15, l: o3 - u * 0.15, c: cible });
      break;
    }
    case "etoile_du_soir": {
      const big = jitter(u * 2);
      push({ t: t0, o: p, h: p + big + u * 0.1, l: p - u * 0.1, c: p + big });
      const gap = u * (0.15 + r() * 0.25);
      const sBottom = p + big + gap;
      const sBody = big * 0.15;
      push({
        t: t0 + 1,
        o: sBottom,
        h: sBottom + sBody + u * 0.3,
        l: sBottom - u * 0.15,
        c: sBottom + sBody,
      });
      const cible = p + big * 0.35;
      const o3 = p + big + gap * 0.5;
      push({ t: t0 + 2, o: o3, h: o3 + u * 0.15, l: cible - u * 0.15, c: cible });
      break;
    }
    case "trois_soldats": {
      let base = p;
      for (let i = 0; i < 3; i++) {
        const body = jitter(u * 1.1);
        // Ouvre légèrement SOUS la clôture de la veille : la progression est
        // tenue, pas une série de gaps (qui serait un autre phénomène).
        const o = base - body * 0.15;
        const c = o + body;
        push({ t: t0 + i, o, h: c + body * 0.06, l: o - body * 0.06, c });
        base = c;
      }
      break;
    }
    case "trois_corbeaux": {
      let base = p;
      for (let i = 0; i < 3; i++) {
        const body = jitter(u * 1.1);
        // Le miroir : ouvre légèrement AU-DESSUS de la clôture de la veille.
        const o = base + body * 0.15;
        const c = o - body;
        push({ t: t0 + i, o, h: o + body * 0.06, l: c - body * 0.06, c });
        base = c;
      }
      break;
    }
    default:
      push(ordinary(ctx, "range", t0));
  }
  return out;
}

// ------------------------------------------------------------------ drills ---

export type Answer = "hausse" | "baisse" | "indecis";

export interface Drill {
  seed: number;
  /** Bougies montrées à l'élève. */
  visible: Candle[];
  /** Bougies cachées, révélées après la réponse. */
  future: Candle[];
  /** Index (dans `visible`) de la bougie qui termine la figure. */
  patternAt: number;
  /** Clé de la figure plantée, ou null pour un cas sans figure notable. */
  patternKey: string | null;
  /** Ce qui s'est réellement passé — la seule vérité de l'exercice. */
  answer: Answer;
  /** Variation en % sur l'horizon. */
  outcomePct: number;
  /** Régime qui a produit le futur (pour l'explication). */
  regime: Regime;
}

/** Seuil d'indécision : en dessous, le mouvement n'est pas concluant. */
const SEUIL_INDECIS = 0.35; // en % du prix

export interface DrillOptions {
  /** Figure à planter. `null` = tirage au sort, `"aucune"` = marché quelconque. */
  pattern?: string | null;
  /** Nombre de bougies de contexte avant la figure. */
  context?: number;
  /** Nombre de bougies à prédire. */
  horizon?: number;
  /**
   * Force du lien entre la figure et le futur, de 0 à 1.
   * 0 = le futur ignore la figure (pur hasard) ; 1 = la figure se réalise
   * presque toujours. La valeur par défaut (0.62) reflète l'idée honnête
   * qu'une figure penche sans garantir — et c'est réglable par niveau :
   * les débutants commencent avec des cas nets, les avancés avec du bruit.
   */
  fiabilite?: number;
}

export function buildDrill(seed: number, opts: DrillOptions = {}): Drill {
  const r = rng(seed);
  const keys = Object.keys(PATTERN_BY_KEY);
  const context = opts.context ?? 22;
  const horizon = opts.horizon ?? 5;
  const fiabilite = opts.fiabilite ?? 0.62;

  const patternKey =
    opts.pattern === "aucune"
      ? null
      : (opts.pattern ?? keys[Math.floor(r() * keys.length)]);

  const def = patternKey ? PATTERN_BY_KEY[patternKey] : null;

  const ctx: Ctx = { r, price: 80 + r() * 340, vol: 0 };
  ctx.vol = ctx.price * (0.006 + r() * 0.012);

  // 1. Le contexte. Les figures de retournement n'ont de sens qu'après un
  //    mouvement : on impose donc la tendance qui rend la figure lisible.
  let amont: Regime;
  if (def?.bias === "haussier") amont = "baisse";
  else if (def?.bias === "baissier") amont = "hausse";
  else amont = r() < 0.5 ? "hausse" : "baisse";
  if (!def) amont = r() < 0.34 ? "hausse" : r() < 0.67 ? "baisse" : "range";

  // Dérive appuyée : le contexte doit être lisible d'un coup d'œil, et la
  // tendance suffisamment nette pour que marteau et pendu se distinguent.
  const visible: Candle[] = [];
  for (let i = 0; i < context; i++) visible.push(ordinary(ctx, amont, i, 2));

  // 2. La figure.
  if (patternKey) {
    for (const k of buildPattern(ctx, patternKey, visible.length)) visible.push(k);
  } else {
    visible.push(ordinary(ctx, amont, visible.length));
  }
  const patternAt = visible.length - 1;

  // 3. Le futur. On tire à la courte paille pondérée par `fiabilite` : la
  //    figure penche, mais le marché garde le dernier mot.
  let aval: Regime;
  if (def && def.bias !== "neutre") {
    const respecte = r() < fiabilite;
    const sens: Regime = def.bias === "haussier" ? "hausse" : "baisse";
    const contre: Regime = def.bias === "haussier" ? "baisse" : "hausse";
    aval = respecte ? sens : r() < 0.6 ? contre : "range";
  } else {
    aval = r() < 0.4 ? "hausse" : r() < 0.8 ? "baisse" : "range";
  }

  // Le futur suit son régime avec une dérive marquée : sans ça, le bruit
  // ramène tout à 50/50 et il n'y a plus rien à apprendre. Avec ça, une
  // figure devient un vrai penchant lisible — sans jamais être une garantie.
  const future: Candle[] = [];
  const depart = ctx.price;
  for (let i = 0; i < horizon; i++) future.push(ordinary(ctx, aval, visible.length + i, 1.8));

  // 4. La correction : ce qui s'est réellement passé.
  const fin = future[future.length - 1].c;
  const outcomePct = ((fin - depart) / depart) * 100;
  const answer: Answer =
    outcomePct > SEUIL_INDECIS ? "hausse" : outcomePct < -SEUIL_INDECIS ? "baisse" : "indecis";

  return { seed, visible, future, patternAt, patternKey, answer, outcomePct, regime: aval };
}

/**
 * Vérifie qu'un drill est bien formé : la figure annoncée doit réellement
 * être détectée par le moteur. Sert de garde-fou — un exercice qui montre un
 * « marteau » que le détecteur ne reconnaît pas enseignerait du faux.
 */
export function drillIsValid(d: Drill): boolean {
  if (!d.patternKey) return true;
  return detectAt(d.visible, d.patternAt).some((p) => p.key === d.patternKey);
}

/**
 * Suite d'exercices valides à partir d'une graine de départ.
 * Les graines invalides sont sautées (une figure plantée peut échouer au test
 * si le hasard a produit un contexte de tendance ambigu).
 */
export function drillSeries(seedStart: number, count: number, opts: DrillOptions = {}): Drill[] {
  const out: Drill[] = [];
  let seed = seedStart;
  let gardeFou = 0;
  while (out.length < count && gardeFou < count * 60) {
    const d = buildDrill(seed, opts);
    if (drillIsValid(d)) out.push(d);
    seed++;
    gardeFou++;
  }
  return out;
}

// ------------------------------------------------- drill de structure (N3) ---

/**
 * Exercice du Niveau 3 : lire la structure d'un graphique.
 *
 * Point de méthode important : on ne fabrique pas la réponse à la main. On
 * génère un marché, on le fait lire par `structure.read()` — qui est couvert
 * par ses propres tests — et **c'est sa lecture qui fait foi**. On ne retient
 * la série que si cette lecture correspond au régime demandé.
 *
 * Deux bénéfices : l'énoncé ne peut pas contredire ce que le graphique montre
 * réellement, et la correction peut afficher les pivots exacts qui ont servi à
 * conclure.
 */
export interface StructureDrill {
  seed: number;
  candles: Candle[];
  reading: Reading;
  /** Réponse attendue : l'état lu par le moteur. */
  answer: TrendState;
}

const REGIMES: Regime[] = ["hausse", "baisse", "range"];

/** Un exercice de structure, ou `null` si cette graine ne donne rien de net. */
export function tryStructureDrill(seed: number, longueur = 78): StructureDrill | null {
  const r = rng(seed);
  const regime = REGIMES[Math.floor(r() * REGIMES.length)];
  const ctx: Ctx = { r, price: 80 + r() * 340, vol: 0 };
  ctx.vol = ctx.price * (0.007 + r() * 0.01);

  const candles: Candle[] = [];
  // Dérive modérée : trop forte, la structure devient une droite sans pivots ;
  // trop faible, aucune tendance ne se dessine.
  for (let i = 0; i < longueur; i++) candles.push(ordinary(ctx, regime, i, 1.1));

  const reading = read(candles, 3);
  // Il faut assez de pivots pour que la question ait un sens visuellement.
  if (reading.pivots.length < 4) return null;
  // Et la lecture du moteur doit correspondre au régime voulu : sinon le
  // graphique raconterait autre chose que ce qu'on a demandé.
  const attendu: TrendState =
    regime === "hausse" ? "haussiere" : regime === "baisse" ? "baissiere" : "range";
  if (reading.state !== attendu) return null;

  return { seed, candles, reading, answer: reading.state };
}

// ----------------------------------------- drill « vraie ou fausse cassure » ---

/**
 * Exercice du Niveau 4 : la cassure tient-elle ?
 *
 * On construit une tendance haussière lisible, on repère son dernier sommet,
 * puis on fabrique une bougie décisive qui soit :
 *
 * - **franchit vraiment** le niveau (clôture au-delà), soit
 * - **le balaye seulement** (mèche au-delà, clôture en deçà) — le stop hunt.
 *
 * La vérification est faite par `structure.events()` : une vraie cassure doit
 * produire un BOS à ce niveau, une fausse ne doit produire aucun. Si le moteur
 * n'est pas d'accord avec l'intention, la graine est rejetée. L'énoncé ne peut
 * donc pas mentir sur ce que le graphique contient.
 *
 * Le niveau n'est pas tracé avant la réponse : l'élève doit identifier
 * lui-même le sommet pertinent, puis comparer la clôture à ce niveau. C'est
 * exactement la compétence visée.
 */
export interface BreakoutDrill {
  seed: number;
  candles: Candle[];
  /** Bougies postérieures, masquées jusqu'à la réponse. */
  future: Candle[];
  /** Niveau mis en jeu (dernier sommet structurel). */
  level: number;
  /** Index de la bougie décisive dans `candles`. */
  at: number;
  /** `true` = la cassure tient (clôture au-delà et BOS enregistré). */
  answer: boolean;
  reading: Reading;
}

export function tryBreakoutDrill(seed: number, vraieVoulue?: boolean): BreakoutDrill | null {
  const r = rng(seed);
  // Le type peut être imposé. C'est nécessaire pour équilibrer : les fausses
  // cassures sont rejetées plus souvent que les vraies (le moteur détecte
  // parfois un BOS au même niveau ailleurs dans la série), donc un tirage à
  // pile ou face produit environ deux tiers de vraies — partiellement
  // devinable. `buildBreakoutDrill` alterne donc explicitement.
  const vraie = vraieVoulue ?? r() < 0.5;
  const ctx: Ctx = { r, price: 90 + r() * 300, vol: 0 };
  ctx.vol = ctx.price * (0.007 + r() * 0.009);

  // 1. Une tendance haussière lisible, validée par le moteur.
  const candles: Candle[] = [];
  for (let i = 0; i < 58; i++) candles.push(ordinary(ctx, "hausse", i, 1.1));
  const base = read(candles, 3);
  if (base.state !== "haussiere" || base.pivots.length < 4) return null;

  const sommets = base.pivots.filter((p) => p.kind === "sommet");
  const sommet = sommets[sommets.length - 1];
  if (!sommet) return null;
  const level = sommet.price;

  // 2. Ramener le prix sous le niveau, pour qu'il y ait quelque chose à casser.
  let garde = 0;
  while (ctx.price > level * 0.988 && garde < 40) {
    candles.push(ordinary(ctx, "baisse", candles.length, 1.5));
    garde++;
  }
  if (ctx.price >= level) return null;

  // 3. La bougie décisive.
  const u = ctx.vol;
  const o = ctx.price;
  const depasse = level * (1 + 0.004 + r() * 0.008);
  let decisive: Candle;
  if (vraie) {
    // Clôture franchement au-dessus du niveau.
    decisive = { t: candles.length, o, h: depasse + u * 0.3, l: o - u * 0.4, c: depasse };
  } else {
    // Mèche au-dessus, clôture en dessous : le niveau n'est pas cassé.
    const c = level * (1 - 0.004 - r() * 0.005);
    decisive = { t: candles.length, o, h: depasse, l: Math.min(o, c) - u * 0.3, c };
  }
  candles.push(decisive);
  ctx.price = decisive.c;
  const at = candles.length - 1;

  // 4. La suite, masquée : elle confirme visuellement le verdict.
  const future: Candle[] = [];
  for (let i = 0; i < 6; i++)
    future.push(ordinary(ctx, vraie ? "hausse" : "baisse", candles.length + i, 1.6));

  // 5. Le moteur doit confirmer l'intention.
  const reading = read(candles, 3);
  const bos = reading.events.some(
    (e) => e.kind === "BOS" && e.direction === "haussier" && Math.abs(e.level - level) < level * 0.002,
  );
  if (bos !== vraie) return null;

  return { seed, candles, future, level, at, answer: vraie, reading };
}

export function buildBreakoutDrill(seed: number): BreakoutDrill {
  // Alternance imposée par la parité de la graine : sur une série d'exercices,
  // vraies et fausses cassures s'équilibrent exactement.
  const cible = seed % 2 === 0;
  let s = seed;
  for (let i = 0; i < 900; i++) {
    const d = tryBreakoutDrill(s, cible);
    if (d) return d;
    s += 2; // on reste sur la même parité pour ne pas dériver
  }
  // Aucune graine exploitable : on remonte l'échec plutôt que d'inventer un
  // exercice bancal. L'appelant affiche un message et propose de réessayer.
  throw new Error("aucun exercice de cassure exploitable à partir de la graine " + seed);
}

// ------------------------------------------ drill de momentum (Niveau 5) ---

/**
 * Exercice du Niveau 5 : ce marché accélère-t-il ou s'essouffle-t-il ?
 *
 * Quatre régimes générés, dont un piège :
 *
 * - accélération : la dérive et la volatilité montent ensemble ;
 * - ralentissement : les deux retombent ;
 * - stable : rien ne change ;
 * - **agitation** : les bougies grossissent mais alternent, donc le prix
 *   n'avance pas. C'est le piège de la leçon 5. Le moteur le classe en perte
 *   de momentum, parce que la vitesse s'effondre — et c'est la lecture juste.
 *
 * Comme partout ailleurs, la réponse vient de `readMomentum()`, pas de
 * l'intention : la graine est rejetée si le moteur ne confirme pas.
 */
/**
 * Quatre réponses possibles, pas trois. L'agitation sans progression a la
 * sienne : la confondre avec un simple ralentissement effacerait justement la
 * distinction que le niveau enseigne. Et sans réponse distincte, deux des
 * quatre régimes générés donneraient la même réponse, qui deviendrait
 * statistiquement devinable.
 */
export type MomentumAnswer = MomentumState | "agitation";

export interface MomentumDrill {
  seed: number;
  candles: Candle[];
  reading: MomentumReading;
  answer: MomentumAnswer;
}

/** La réponse se DÉDUIT de la lecture, jamais de l'intention du générateur. */
export function momentumAnswer(reading: MomentumReading): MomentumAnswer {
  if (isExpansionSansProgression(reading)) return "agitation";
  return reading.state;
}

/** Fenêtre de mesure. Doit rester alignée avec l'appel à `readMomentum`. */
const FENETRE_MOMENTUM = 8;

type MomentumPlan = "acceleration" | "ralentissement" | "stable" | "agitation";
const PLANS: MomentumPlan[] = ["acceleration", "ralentissement", "stable", "agitation"];

export function tryMomentumDrill(seed: number, planVoulu?: MomentumPlan): MomentumDrill | null {
  const r = rng(seed);
  const plan = planVoulu ?? PLANS[Math.floor(r() * PLANS.length)];
  const sens: Regime = r() < 0.5 ? "hausse" : "baisse";
  const signe = sens === "hausse" ? 1 : -1;

  const ctx: Ctx = { r, price: 90 + r() * 300, vol: 0 };
  const volBase = ctx.price * 0.008;
  const candles: Candle[] = [];

  // IMPORTANT — les longueurs de phase doivent coïncider avec les fenêtres du
  // moteur. `readMomentum(candles, 8)` compare les 8 dernières bougies aux 8
  // qui les précèdent. La phase cible fait donc exactement 8 bougies, et la
  // phase de référence au moins 8 juste avant, sinon le moteur comparerait le
  // régime cible à lui-même — et ne mesurerait plus rien.
  const CONTEXTE = 24; // dont les 8 dernières servent de référence au moteur
  const CIBLE = FENETRE_MOMENTUM;

  ctx.vol = volBase;
  for (let i = 0; i < CONTEXTE; i++) candles.push(ordinary(ctx, sens, i, 1.2));

  if (plan === "acceleration") {
    ctx.vol = volBase * 2.6;
    for (let i = 0; i < CIBLE; i++) candles.push(ordinary(ctx, sens, CONTEXTE + i, 2.4));
  } else if (plan === "ralentissement") {
    ctx.vol = volBase * 0.35;
    for (let i = 0; i < CIBLE; i++) candles.push(ordinary(ctx, sens, CONTEXTE + i, 0.4));
  } else if (plan === "stable") {
    for (let i = 0; i < CIBLE; i++) candles.push(ordinary(ctx, sens, CONTEXTE + i, 1.2));
  } else {
    // Agitation : grands corps alternés, construits à la main pour que
    // l'annulation soit franche. Le prix revient près de son point de départ.
    const u = volBase * 3.2;
    let p = ctx.price;
    for (let i = 0; i < CIBLE; i++) {
      const alt = i % 2 === 0 ? 1 : -1;
      const corps = u * (0.85 + r() * 0.3) * alt * signe;
      const o = p;
      const c = Math.max(0.01, o + corps);
      candles.push({
        t: CONTEXTE + i,
        o,
        h: Math.max(o, c) + u * 0.15,
        l: Math.max(0.01, Math.min(o, c) - u * 0.15),
        c,
      });
      p = c;
    }
    ctx.price = p;
  }

  const reading = readMomentum(candles, FENETRE_MOMENTUM);
  const answer = momentumAnswer(reading);

  // Le moteur doit confirmer l'intention, sans quoi la graine est rejetée.
  // Notamment : un plan « ralentissement » ne doit PAS être lu comme une
  // agitation, et inversement — sinon l'énoncé et le graphique divergeraient.
  const attendu: MomentumAnswer =
    plan === "acceleration" ? "acceleration"
    : plan === "stable" ? "stable"
    : plan === "agitation" ? "agitation"
    : "ralentissement";
  if (answer !== attendu) return null;

  return { seed, candles, reading, answer };
}

export function buildMomentumDrill(seed: number): MomentumDrill {
  // Rotation des quatre plans sur la graine : chaque type revient à intervalle
  // régulier, y compris le piège.
  const plan = PLANS[seed % PLANS.length];
  let s = seed;
  for (let i = 0; i < 500; i++) {
    const d = tryMomentumDrill(s, plan);
    if (d) return d;
    s += PLANS.length; // on garde le même plan
  }
  // Repli : n'importe quel exercice valide plutôt qu'aucun.
  for (let i = 0; i < 500; i++) {
    const d = tryMomentumDrill(seed + i);
    if (d) return d;
  }
  throw new Error("aucun exercice de momentum exploitable à partir de " + seed);
}

/** Premier exercice de structure exploitable à partir de `seed`. */
export function buildStructureDrill(seed: number): StructureDrill {
  let s = seed;
  for (let i = 0; i < 600; i++) {
    const d = tryStructureDrill(s);
    if (d) return d;
    s++;
  }
  // Repli : on renvoie la meilleure série possible même si elle est en range.
  const r = rng(s);
  const ctx: Ctx = { r, price: 200, vol: 2 };
  const candles: Candle[] = [];
  for (let i = 0; i < 78; i++) candles.push(ordinary(ctx, "range", i, 1.1));
  const reading = read(candles, 3);
  return { seed: s, candles, reading, answer: reading.state };
}
