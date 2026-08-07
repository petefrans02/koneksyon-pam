"use client";

/**
 * LE RELEVÉ DE TRADES.
 *
 * Raison d'être : distinguer ce qui marche de ce qui a bien marché la semaine
 * dernière. Un élève qui « trouve que les expirations longues marchent mieux »
 * a une impression ; trente lignes notées lui donnent une réponse.
 *
 * Deux exigences, et elles comptent plus que les chiffres eux-mêmes :
 *
 * 1. **Le seuil de rentabilité est affiché à côté du taux de réussite.** En
 *    options à durée fixe, gagner « plus d'une fois sur deux » ne veut rien
 *    dire : à 92 % de payout il faut 52,1 %, à 80 % il en faut 55,6 %. Un taux
 *    sans son seuil est un chiffre qui ment.
 *
 * 2. **La taille de l'échantillon décide de ce qu'on a le droit de conclure.**
 *    Sur 20 trades, 60 % contre 45 % n'est pas une découverte, c'est du bruit.
 *    On calcule donc une marge d'erreur et on refuse de trancher tant qu'elle
 *    chevauche le seuil. Un outil qui dit « tu es rentable » sur douze trades
 *    fait plus de mal que pas d'outil du tout.
 *
 * Persistance : localStorage, comme `store.ts`, et avec la même limite — lié au
 * navigateur, pas au compte.
 */

import { useSyncExternalStore } from "react";

const CLE = "kp-trading-journal-v1";

export type Resultat = "gagne" | "perdu" | "en_cours";

export interface Trade {
  id: string;
  /** ISO complet : on veut pouvoir trier et afficher l'heure. */
  date: string;
  instrument: string | null;
  unite: string | null;
  bouton: "BUY" | "SELL";
  /** Durée de l'expiration en secondes — c'est elle qu'on analyse. */
  secondes: number | null;
  temps: string | null;
  confiance: number;
  alignement: "total" | "majoritaire" | "conflit" | null;
  /** La durée retenue couvrait-elle un repli, ou visait-elle direct ? */
  scenario: "direct" | "couvert" | null;
  /** Payout affiché par la plateforme au moment du trade, en %. */
  payout: number | null;
  mise: number | null;
  resultat: Resultat;
}

export interface Journal {
  trades: Trade[];
  /** Payout par défaut proposé pour les prochains trades. */
  payoutDefaut: number;
}

export const JOURNAL_VIDE: Journal = { trades: [], payoutDefaut: 92 };

// ------------------------------------------------------------ persistance ---

let cache: Journal | null = null;
const listeners = new Set<() => void>();

function lire(): Journal {
  if (typeof window === "undefined") return JOURNAL_VIDE;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return JOURNAL_VIDE;
    const lu = JSON.parse(brut) as Partial<Journal>;
    return {
      ...JOURNAL_VIDE,
      ...lu,
      trades: Array.isArray(lu.trades) ? lu.trades : [],
    };
  } catch {
    return JOURNAL_VIDE;
  }
}

function getSnapshot(): Journal {
  if (cache === null) cache = lire();
  return cache;
}

const getServerSnapshot = (): Journal => JOURNAL_VIDE;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CLE) {
      cache = lire();
      for (const l of listeners) l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useJournal(): Journal {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveJournal(j: Journal): void {
  cache = j;
  for (const l of listeners) l();
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(j));
  } catch {
    // Quota dépassé ou navigation privée : on perd la sauvegarde, pas la session.
  }
}

// --------------------------------------------------------------- écriture ---

export function ajouterTrade(j: Journal, t: Omit<Trade, "id" | "date" | "resultat">): Journal {
  const trade: Trade = {
    ...t,
    id: `${Date.now()}-${j.trades.length}`,
    date: new Date().toISOString(),
    resultat: "en_cours",
  };
  return { ...j, trades: [trade, ...j.trades] };
}

export function noterResultat(j: Journal, id: string, resultat: Resultat): Journal {
  return { ...j, trades: j.trades.map((t) => (t.id === id ? { ...t, resultat } : t)) };
}

export function supprimerTrade(j: Journal, id: string): Journal {
  return { ...j, trades: j.trades.filter((t) => t.id !== id) };
}

// -------------------------------------------------------------- l'analyse ---

/**
 * Le taux de réussite qui met à l'équilibre, pour un payout donné.
 *
 * À 92 % de payout : 100/192 = 52,1 %. C'est le chiffre que tout le reste doit
 * dépasser — un taux de réussite affiché sans lui n'informe de rien.
 */
export function seuilEquilibre(payout: number): number {
  const p = Math.max(1, Math.min(500, payout));
  return (100 / (100 + p)) * 100;
}

export interface Tranche {
  cle: string;
  label: string;
  /** Borne haute en secondes, incluse. */
  max: number;
}

/** Les trois familles de durées. Découpées là où le comportement change. */
export const TRANCHES: Tranche[] = [
  { cle: "court", label: "30 s à 2 min", max: 120 },
  { cle: "moyen", label: "3 à 10 min", max: 600 },
  { cle: "long", label: "15 min et plus", max: Infinity },
];

export type Verdict = "insuffisant" | "au-dessus" | "en-dessous" | "indecis";

export interface Stat {
  cle: string;
  label: string;
  n: number;
  gagnes: number;
  /** En pourcentage, ou null si aucun trade terminé. */
  taux: number | null;
  /** Demi-largeur de l'intervalle à 95 %, en points de pourcentage. */
  marge: number | null;
  verdict: Verdict;
}

/** En dessous, aucune conclusion n'est défendable — on le dit au lieu de trancher. */
const MINIMUM = 20;

/**
 * Taux de réussite d'un groupe, avec sa marge d'erreur.
 *
 * La marge est l'intervalle de Wald à 95 % (1,96 × erreur type). Elle est
 * approximative aux extrêmes, mais elle remplit son office : empêcher de
 * conclure sur douze trades.
 */
function statDe(cle: string, label: string, trades: Trade[], seuil: number): Stat {
  const finis = trades.filter((t) => t.resultat !== "en_cours");
  const n = finis.length;
  const gagnes = finis.filter((t) => t.resultat === "gagne").length;

  if (n === 0) {
    return { cle, label, n: 0, gagnes: 0, taux: null, marge: null, verdict: "insuffisant" };
  }

  const p = gagnes / n;
  const taux = p * 100;
  const marge = 1.96 * Math.sqrt((p * (1 - p)) / n) * 100;

  const verdict: Verdict =
    n < MINIMUM
      ? "insuffisant"
      : taux - marge > seuil
        ? "au-dessus"
        : taux + marge < seuil
          ? "en-dessous"
          : "indecis";

  return { cle, label, n, gagnes, taux, marge, verdict };
}

export function statsParDuree(trades: Trade[], payout: number): Stat[] {
  const seuil = seuilEquilibre(payout);
  let precedent = 0;
  return TRANCHES.map((tr) => {
    const dedans = trades.filter(
      (t) => t.secondes !== null && t.secondes > precedent && t.secondes <= tr.max,
    );
    precedent = tr.max;
    return statDe(tr.cle, tr.label, dedans, seuil);
  });
}

export function statsParAlignement(trades: Trade[], payout: number): Stat[] {
  const seuil = seuilEquilibre(payout);
  const groupes: { cle: Trade["alignement"]; label: string }[] = [
    { cle: "total", label: "Toutes les unités d'accord" },
    { cle: "majoritaire", label: "Majorité d'accord" },
    { cle: null, label: "Un seul graphique" },
  ];
  return groupes.map((g) =>
    statDe(
      String(g.cle),
      g.label,
      trades.filter((t) => (t.alignement ?? null) === g.cle),
      seuil,
    ),
  );
}

export function statGlobale(trades: Trade[], payout: number): Stat {
  return statDe("tout", "Tous les trades", trades, seuilEquilibre(payout));
}

/**
 * Deux groupes diffèrent-ils vraiment, ou est-ce du hasard ?
 *
 * C'est la question posée par « les expirations longues marchent mieux ». On
 * compare l'écart des deux taux à la marge combinée : tant qu'il ne la dépasse
 * pas, l'écart observé est compatible avec le pur hasard, et on refuse de
 * conclure.
 */
export function comparer(a: Stat, b: Stat): { concluant: boolean; ecart: number | null } {
  if (a.taux === null || b.taux === null || a.marge === null || b.marge === null) {
    return { concluant: false, ecart: null };
  }
  const ecart = a.taux - b.taux;
  const combinee = Math.sqrt(a.marge ** 2 + b.marge ** 2);
  return { concluant: a.n >= MINIMUM && b.n >= MINIMUM && Math.abs(ecart) > combinee, ecart };
}

/** Nombre de trades à ajouter dans un groupe avant de pouvoir conclure. */
export function manquants(s: Stat): number {
  return Math.max(0, MINIMUM - s.n);
}
