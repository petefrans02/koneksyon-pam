/**
 * LE REGISTRE DES MARCHÉS.
 *
 * XAU/USD est le seul marché actif au lancement. Les huit autres existent
 * déjà en base, éteints. Les allumer sera une case à cocher dans l'admin plus
 * un script Pine sur le graphique correspondant — jamais un déploiement.
 *
 * C'est ce que veut dire « architecture flexible » concrètement : rien dans
 * le code du Trading Center ne connaît le mot « or ». Le webhook, le score,
 * l'IA, la diffusion et l'interface travaillent tous sur un `code` de marché
 * lu en base. Ajouter le NASDAQ n'ouvre aucun de ces fichiers.
 */

import { adminDb } from "@/lib/admin-auth";
import { Marche } from "./types";

let cache: { valeur: Marche[]; expire: number } | null = null;
const DUREE_CACHE = 60_000;

/**
 * Le repli quand la table n'existe pas encore.
 *
 * Il ne contient QUE l'or. Un repli qui listerait les neuf marchés ferait
 * accepter des alertes pour des marchés qu'on n'a jamais mis en service, à
 * l'instant précis où la base est en difficulté.
 */
const REPLI: Marche[] = [
  {
    code: "XAUUSD",
    paire: "XAU/USD",
    nom_fr: "Or / Dollar américain",
    nom_en: "Gold / US Dollar",
    categorie: "metal",
    symbole_tv: "OANDA:XAUUSD",
    decimales: 2,
    pip: 0.1,
    actif: true,
    ordre: 1,
  },
];

/** Tous les marchés, actifs ou non. Réservé à l'admin. */
export async function tousLesMarches(): Promise<Marche[]> {
  if (cache && cache.expire > Date.now()) return cache.valeur;

  try {
    const { data, error } = await adminDb()
      .from("tc_marches")
      .select("*")
      .order("ordre", { ascending: true });

    if (error || !data) throw new Error(error?.message ?? "aucune donnée");

    const valeur = data as Marche[];
    cache = { valeur, expire: Date.now() + DUREE_CACHE };
    return valeur;
  } catch {
    return REPLI;
  }
}

/** Les marchés en service — la seule liste qui autorise une alerte. */
export async function marchesActifs(): Promise<Marche[]> {
  return (await tousLesMarches()).filter((m) => m.actif);
}

export async function codesActifs(): Promise<string[]> {
  return (await marchesActifs()).map((m) => m.code);
}

export async function trouverMarche(code: string): Promise<Marche | null> {
  return (await tousLesMarches()).find((m) => m.code === code) ?? null;
}

export function viderCacheMarches(): void {
  cache = null;
}

/** Formate un prix avec la précision propre au marché. */
export function formaterPrix(valeur: number | null | undefined, marche: Marche | null): string {
  if (valeur === null || valeur === undefined || !Number.isFinite(valeur)) return "—";
  return valeur.toFixed(marche?.decimales ?? 2);
}

/**
 * Convertit une distance de prix en pips.
 *
 * Le pip n'a pas la même valeur d'un marché à l'autre — 0,1 sur l'or, 0,0001
 * sur l'EUR/USD, 1 point sur un indice. Compter « en points » sans cette
 * conversion rendrait toute comparaison entre marchés absurde le jour où le
 * deuxième marché s'allumera.
 */
export function enPips(distance: number, marche: Marche | null): number {
  const pip = marche?.pip ?? 0.1;
  return Math.round((distance / pip) * 10) / 10;
}
