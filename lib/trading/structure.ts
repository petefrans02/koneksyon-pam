/**
 * ACADÉMIE TRADING — moteur de structure de marché (Niveau 3, Price Action).
 *
 * Les bougies disent ce qui vient de se passer sur une période. La structure
 * dit *où tu es* dans le mouvement d'ensemble. Ce module extrait cette
 * structure d'une série de bougies, sans indicateur : uniquement des sommets
 * et des creux, et la façon dont ils se succèdent.
 *
 * Chaîne de traitement :
 *
 *   bougies → pivots (sommets/creux) → alternance → jambes (HH/HL/LH/LL)
 *          → état de tendance → événements (BOS / CHoCH)
 *
 * Chaque étape est une fonction pure et testable séparément. C'est nécessaire :
 * la détection de structure est le genre de code où une erreur d'un indice
 * produit des résultats plausibles mais faux, donc invisibles à l'œil.
 */

import { Candle } from "./candles";

export type PivotKind = "sommet" | "creux";

export interface Pivot {
  /** Index dans le tableau de bougies. */
  i: number;
  /** Prix du pivot : le haut pour un sommet, le bas pour un creux. */
  price: number;
  kind: PivotKind;
}

/** Classification d'un pivot par rapport au pivot de même nature précédent. */
export type LegLabel = "HH" | "HL" | "LH" | "LL";

export interface Leg {
  pivot: Pivot;
  label: LegLabel;
  /** Prix du pivot de même nature auquel on a comparé. */
  reference: number;
}

export type TrendState = "haussiere" | "baissiere" | "range";

export type EventKind = "BOS" | "CHoCH";

export interface StructureEvent {
  kind: EventKind;
  /** Index de la bougie dont la clôture a provoqué l'événement. */
  i: number;
  /** Sens de la cassure. */
  direction: "haussier" | "baissier";
  /** Niveau franchi. */
  level: number;
  /** État de tendance juste avant l'événement. */
  from: TrendState;
}

/**
 * Détecte les pivots par balayage fractal : une bougie est un sommet si son
 * haut domine les `lookback` bougies de chaque côté.
 *
 * `lookback` gouverne la sensibilité. Petit, on détecte le moindre zigzag ;
 * grand, seuls les tournants majeurs ressortent. C'est le seul réglage du
 * module, et il est volontairement exposé : faire varier l'échelle et voir la
 * structure changer fait partie de ce que l'élève doit comprendre.
 */
export function pivots(candles: Candle[], lookback = 3): Pivot[] {
  const out: Pivot[] = [];
  if (candles.length < lookback * 2 + 1) return out;

  for (let i = lookback; i < candles.length - lookback; i++) {
    let estSommet = true;
    let estCreux = true;
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j === i) continue;
      // Asymétrie volontaire : strict à gauche, permissif à droite.
      //
      // Avec du strict des deux côtés, un sommet où deux bougies partagent le
      // même haut ne produit AUCUN pivot — chacune voit l'autre à égalité et
      // s'élimine. Les égalités sont fréquentes dès que la cotation est peu
      // précise, ou simplement au sommet d'un mouvement.
      //
      // Ici, en cas d'égalité c'est la bougie la plus à gauche qui gagne : on
      // obtient exactement un pivot, le premier du plateau — celui où le
      // niveau a été atteint pour la première fois.
      if (j < i) {
        if (candles[j].h >= candles[i].h) estSommet = false;
        if (candles[j].l <= candles[i].l) estCreux = false;
      } else {
        if (candles[j].h > candles[i].h) estSommet = false;
        if (candles[j].l < candles[i].l) estCreux = false;
      }
    }
    if (estSommet) out.push({ i, price: candles[i].h, kind: "sommet" });
    else if (estCreux) out.push({ i, price: candles[i].l, kind: "creux" });
  }
  return out;
}

/**
 * Force l'alternance sommet / creux.
 *
 * Le balayage fractal peut produire deux sommets consécutifs sans creux entre
 * eux. Sans cette étape, la comparaison « ce sommet contre le sommet
 * précédent » deviendrait ambiguë. On ne garde que le plus extrême de chaque
 * série consécutive de même nature.
 */
export function alternate(ps: Pivot[]): Pivot[] {
  const out: Pivot[] = [];
  for (const p of ps) {
    const dernier = out[out.length - 1];
    if (!dernier || dernier.kind !== p.kind) {
      out.push(p);
      continue;
    }
    // Même nature que le précédent : on garde le plus significatif.
    const remplace =
      p.kind === "sommet" ? p.price > dernier.price : p.price < dernier.price;
    if (remplace) out[out.length - 1] = p;
  }
  return out;
}

/**
 * Étiquette chaque pivot par rapport au pivot de même nature qui le précède.
 * Le premier sommet et le premier creux n'ont pas de référence : ils sont
 * ignorés, car « plus haut que quoi ? » n'a pas de réponse.
 */
export function legs(ps: Pivot[]): Leg[] {
  const out: Leg[] = [];
  let dernierSommet: number | null = null;
  let dernierCreux: number | null = null;

  for (const p of ps) {
    if (p.kind === "sommet") {
      if (dernierSommet !== null) {
        out.push({
          pivot: p,
          label: p.price > dernierSommet ? "HH" : "LH",
          reference: dernierSommet,
        });
      }
      dernierSommet = p.price;
    } else {
      if (dernierCreux !== null) {
        out.push({
          pivot: p,
          label: p.price > dernierCreux ? "HL" : "LL",
          reference: dernierCreux,
        });
      }
      dernierCreux = p.price;
    }
  }
  return out;
}

/**
 * État de tendance déduit des deux dernières jambes étiquetées.
 *
 * Une tendance haussière exige des sommets ET des creux qui montent : des
 * sommets plus hauts avec des creux plus bas n'est pas une tendance, c'est une
 * expansion. C'est une distinction que beaucoup de cours escamotent.
 */
export function trendState(ls: Leg[]): TrendState {
  const dernierSommet = [...ls].reverse().find((l) => l.pivot.kind === "sommet");
  const dernierCreux = [...ls].reverse().find((l) => l.pivot.kind === "creux");
  if (!dernierSommet || !dernierCreux) return "range";
  if (dernierSommet.label === "HH" && dernierCreux.label === "HL") return "haussiere";
  if (dernierSommet.label === "LH" && dernierCreux.label === "LL") return "baissiere";
  return "range";
}

/**
 * Détecte les cassures de structure au fil des bougies.
 *
 * Vocabulaire, et c'est la partie que les débutants confondent le plus :
 *
 * - **BOS** (Break of Structure) : la tendance en cours franchit le dernier
 *   extrême dans *son propre sens*. C'est une continuation confirmée.
 * - **CHoCH** (Change of Character) : le prix casse dans le sens *opposé* à la
 *   tendance en cours — en tendance haussière, il clôture sous le dernier
 *   creux plus haut. C'est le premier signe que le récit change.
 *
 * La cassure est jugée sur la **clôture**, pas sur la mèche : un dépassement
 * en intraséance immédiatement rejeté n'est pas une cassure, c'est justement
 * le piège étudié au Niveau 4.
 */
export function events(candles: Candle[], lookback = 3): StructureEvent[] {
  const ps = alternate(pivots(candles, lookback));
  const out: StructureEvent[] = [];
  if (ps.length < 3) return out;

  for (let i = 0; i < candles.length; i++) {
    // Pivots confirmés à cet instant : un pivot n'est connu qu'une fois ses
    // `lookback` bougies de droite écoulées. Ignorer ce délai reviendrait à
    // lire le futur.
    const connus = ps.filter((p) => p.i + lookback <= i);
    if (connus.length < 3) continue;

    const etat = trendState(legs(connus));
    const dernierSommet = [...connus].reverse().find((p) => p.kind === "sommet");
    const dernierCreux = [...connus].reverse().find((p) => p.kind === "creux");
    if (!dernierSommet || !dernierCreux) continue;

    const c = candles[i].c;
    const precedent = out[out.length - 1];

    if (etat === "haussiere") {
      if (c > dernierSommet.price && precedent?.level !== dernierSommet.price) {
        out.push({ kind: "BOS", i, direction: "haussier", level: dernierSommet.price, from: etat });
      } else if (c < dernierCreux.price && precedent?.level !== dernierCreux.price) {
        out.push({ kind: "CHoCH", i, direction: "baissier", level: dernierCreux.price, from: etat });
      }
    } else if (etat === "baissiere") {
      if (c < dernierCreux.price && precedent?.level !== dernierCreux.price) {
        out.push({ kind: "BOS", i, direction: "baissier", level: dernierCreux.price, from: etat });
      } else if (c > dernierSommet.price && precedent?.level !== dernierSommet.price) {
        out.push({ kind: "CHoCH", i, direction: "haussier", level: dernierSommet.price, from: etat });
      }
    }
  }
  return out;
}

/**
 * Niveaux horizontaux les plus significatifs : ceux où plusieurs pivots se
 * sont formés à peu près au même prix.
 *
 * Un niveau touché trois fois vaut plus qu'un niveau touché une fois — non par
 * magie, mais parce que des acteurs y ont réagi de façon répétée. La tolérance
 * est exprimée en fraction du prix pour rester valable à toutes les échelles.
 */
export interface Zone {
  price: number;
  /** Nombre de pivots regroupés à ce niveau. */
  touches: number;
  kind: PivotKind;
}

export function zones(candles: Candle[], lookback = 3, tolerance = 0.006): Zone[] {
  const ps = pivots(candles, lookback);
  const groupes: Zone[] = [];

  for (const p of ps) {
    const proche = groupes.find(
      (g) => g.kind === p.kind && Math.abs(g.price - p.price) / p.price <= tolerance,
    );
    if (proche) {
      // Moyenne glissante du niveau, pour que le regroupement ne dérive pas
      // vers le premier pivot rencontré.
      proche.price = (proche.price * proche.touches + p.price) / (proche.touches + 1);
      proche.touches++;
    } else {
      groupes.push({ price: p.price, touches: 1, kind: p.kind });
    }
  }
  return groupes.filter((g) => g.touches >= 2).sort((a, b) => b.touches - a.touches);
}

/** Lecture complète d'une série : tout ce dont l'interface a besoin. */
export interface Reading {
  pivots: Pivot[];
  legs: Leg[];
  state: TrendState;
  events: StructureEvent[];
  zones: Zone[];
}

export function read(candles: Candle[], lookback = 3): Reading {
  const ps = alternate(pivots(candles, lookback));
  const ls = legs(ps);
  return {
    pivots: ps,
    legs: ls,
    state: trendState(ls),
    events: events(candles, lookback),
    zones: zones(candles, lookback),
  };
}
