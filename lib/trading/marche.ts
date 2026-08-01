/**
 * LES VRAIES BOUGIES.
 *
 * Jusqu'ici l'académie travaillait sur des bougies qu'elle génère, et la page
 * d'analyse sur des bougies lues au pixel dans une capture d'écran. Ce fichier
 * ouvre la troisième voie, et de loin la meilleure : les prix réels du marché.
 *
 * Ce que ça supprime d'un coup — et c'est considérable :
 *
 * — L'estimation des prix. On a passé du temps à faire lire deux graduations
 *   au modèle pour placer un niveau par règle de trois, parce qu'un niveau
 *   annoncé à 163 se dessinait vers 175. Avec un vrai flux, le prix EST le
 *   prix. Il n'y a plus rien à calibrer.
 * — La variabilité. Deux analyses de la même capture ne donnaient pas tout à
 *   fait le même résultat. Ici, mêmes bougies, même lecture, toujours.
 * — Le travail manuel. Quatre unités de temps, c'était quatre captures. C'est
 *   maintenant un appel.
 *
 * Ce que ça NE supprime pas : les actifs OTC de Pocket Option ne sont cotés
 * par personne d'autre que le broker. Aucune source au monde ne les fournit.
 * Pour ceux-là, la capture d'écran reste la seule voie.
 *
 * Fournisseur : Twelve Data, offre gratuite — 800 appels par jour, 8 par
 * minute, intervalles de 1 min à 1 mois, forex inclus. Le plafond par minute
 * est la vraie contrainte : une analyse multi-unités consomme un appel par
 * unité de temps.
 */

import { Candle } from "./candles";

const BASE = "https://api.twelvedata.com";

/** Les unités de temps utiles en options à durée fixe, et leur code Twelve Data. */
export const INTERVALLES = {
  M1: "1min",
  M5: "5min",
  M15: "15min",
  M30: "30min",
  H1: "1h",
  H4: "4h",
} as const;

export type Unite = keyof typeof INTERVALLES;

/** Durée d'une bougie en minutes — sert au calcul d'expiration. */
export const MINUTES: Record<Unite, number> = {
  M1: 1,
  M5: 5,
  M15: 15,
  M30: 30,
  H1: 60,
  H4: 240,
};

export interface Serie {
  symbole: string;
  unite: Unite;
  candles: Candle[];
  /** Horodatage de la dernière bougie, tel que renvoyé par le fournisseur. */
  derniere: string | null;
}

export class ErreurMarche extends Error {
  constructor(
    message: string,
    /** true quand réessayer plus tard a un sens (quota, réseau). */
    readonly temporaire = false,
  ) {
    super(message);
    this.name = "ErreurMarche";
  }
}

/**
 * Normalise ce que l'utilisateur tape en symbole Twelve Data.
 *
 * « eurusd », « EUR/USD », « eur usd » → « EUR/USD ». On accepte large parce
 * que la saisie viendra de Telegram, au pouce, souvent en minuscules.
 */
export function normaliserSymbole(saisie: string): string | null {
  const t = saisie.trim().toUpperCase().replace(/\s+/g, "");

  // Déjà au bon format.
  if (/^[A-Z]{3}\/[A-Z]{3}$/.test(t)) return t;
  // Six lettres collées : on coupe au milieu.
  if (/^[A-Z]{6}$/.test(t)) return `${t.slice(0, 3)}/${t.slice(3)}`;
  // Séparateurs courants.
  const m = t.match(/^([A-Z]{3})[-_.]([A-Z]{3})$/);
  if (m) return `${m[1]}/${m[2]}`;

  // Actions et indices : on laisse passer tel quel s'il n'y a que des lettres.
  if (/^[A-Z]{1,5}$/.test(t)) return t;

  return null;
}

/** Un symbole OTC ne peut venir que du broker : autant le dire tout de suite. */
export function estOTC(saisie: string): boolean {
  return /\bOTC\b/i.test(saisie);
}

interface ValeurBrute {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

/**
 * Récupère les dernières bougies d'un symbole.
 *
 * Twelve Data renvoie la série du plus RÉCENT au plus ancien ; les moteurs
 * d'analyse attendent l'inverse. L'ordre est donc inversé ici, une fois pour
 * toutes — une série à l'envers produirait une lecture de structure exactement
 * contraire à la réalité, et rien dans le résultat ne le signalerait.
 */
export async function bougies(
  symbole: string,
  unite: Unite,
  nombre = 120,
  cle = process.env.TWELVE_DATA_KEY,
): Promise<Serie> {
  if (!cle) throw new ErreurMarche("Clé de données de marché absente.");

  const url = new URL(`${BASE}/time_series`);
  url.searchParams.set("symbol", symbole);
  url.searchParams.set("interval", INTERVALLES[unite]);
  url.searchParams.set("outputsize", String(Math.min(5000, Math.max(30, nombre))));
  url.searchParams.set("format", "JSON");
  url.searchParams.set("apikey", cle);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new ErreurMarche("Le fournisseur de données est injoignable.", true);
  }

  if (!res.ok) {
    throw new ErreurMarche(`Le fournisseur a répondu ${res.status}.`, res.status >= 500);
  }

  const data = (await res.json()) as {
    status?: string;
    code?: number;
    message?: string;
    values?: ValeurBrute[];
  };

  // Twelve Data renvoie ses erreurs en HTTP 200, avec status: "error".
  if (data.status === "error" || !Array.isArray(data.values)) {
    const msg = data.message || "Symbole inconnu ou données indisponibles.";
    // 429 : quota par minute ou par jour dépassé.
    throw new ErreurMarche(msg, data.code === 429);
  }

  const candles: Candle[] = data.values
    .map((v) => ({
      t: Date.parse(v.datetime.replace(" ", "T") + "Z"),
      o: Number(v.open),
      h: Number(v.high),
      l: Number(v.low),
      c: Number(v.close),
      v: v.volume ? Number(v.volume) : undefined,
    }))
    // Une bougie incomplète fausserait tout le reste en silence.
    .filter((k) => [k.t, k.o, k.h, k.l, k.c].every((n) => typeof n === "number" && isFinite(n)))
    .reverse();

  if (candles.length < 30) {
    throw new ErreurMarche("Pas assez de bougies pour une lecture sérieuse.");
  }

  return {
    symbole,
    unite,
    candles,
    derniere: data.values[0]?.datetime ?? null,
  };
}

/**
 * Plusieurs unités de temps du même symbole, en parallèle.
 *
 * Une unité qui échoue ne fait pas tomber les autres : mieux vaut une synthèse
 * sur trois échelles qu'aucune analyse du tout. Le plafond de 8 appels par
 * minute de l'offre gratuite est la raison pour laquelle on ne demande jamais
 * plus de quatre unités à la fois.
 */
export async function plusieursUnites(
  symbole: string,
  unites: Unite[],
  nombre = 120,
): Promise<{ series: Serie[]; echecs: { unite: Unite; raison: string }[] }> {
  const resultats = await Promise.all(
    unites.slice(0, 4).map(async (u) => {
      try {
        return { serie: await bougies(symbole, u, nombre), unite: u, raison: null };
      } catch (e) {
        return {
          serie: null,
          unite: u,
          raison: e instanceof Error ? e.message : "échec inconnu",
        };
      }
    }),
  );

  return {
    series: resultats.filter((r) => r.serie).map((r) => r.serie!),
    echecs: resultats
      .filter((r) => !r.serie)
      .map((r) => ({ unite: r.unite, raison: r.raison! })),
  };
}
