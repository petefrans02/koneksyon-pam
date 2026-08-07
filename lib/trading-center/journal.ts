/**
 * LE JOURNAL DE PERFORMANCE.
 *
 * Ce fichier existe pour répondre à une seule question, et pour y répondre
 * sans complaisance : **est-ce que ça marche ?**
 *
 * ── Tout est compté en R, jamais en dollars ───────────────────────────────
 *
 * 1 R = la distance entre l'entrée et le stop D'ORIGINE. Un trade qui gagne
 * deux fois son risque vaut +2 R, que le compte fasse 500 $ ou 50 000 $.
 *
 * C'est la seule mesure comparable d'un mois à l'autre. Compter en dollars
 * mélange deux choses qui n'ont rien à voir : la qualité des signaux, et la
 * taille des positions. Un mois à +3 000 $ pris avec un risque triplé est un
 * mois MOINS bon qu'un mois à +1 200 $ — et un relevé en dollars montrerait
 * exactement l'inverse.
 *
 * ── Deux refus assumés ────────────────────────────────────────────────────
 *
 * 1. **On n'affiche pas un taux de réussite sous 20 trades clôturés.** Sur
 *    douze signaux, sept gagnants font 58 % et six en font 50 % — l'écart est
 *    du bruit pur. Afficher un chiffre là, c'est fabriquer une certitude que
 *    les données ne portent pas. Le journal indique alors ce qui manque.
 *
 * 2. **Un signal expiré ne compte ni en gain ni en perte.** On ne sait pas ce
 *    qui s'est passé. Le ranger en perte gonflerait artificiellement le
 *    drawdown ; en gain, le taux de réussite. Il reste `neutre` et sort du
 *    calcul du taux, ce qui est la seule position honnête.
 */

import { Signal, Statistiques } from "./types";

/** En dessous de ce nombre de trades clôturés, aucun taux n'est publié. */
export const MINIMUM_FIABLE = 20;

const arrondi = (n: number, d = 2): number => Math.round(n * 10 ** d) / 10 ** d;

/**
 * Le drawdown maximal, sur la courbe cumulée en R.
 *
 * On parcourt les trades dans l'ordre chronologique en gardant le sommet
 * atteint ; la chute la plus profonde depuis un sommet est le drawdown. C'est
 * le chiffre qui dit combien il faut pouvoir encaisser mentalement avant que
 * la méthode ne se remette à produire — et c'est celui que tous les relevés
 * de vente omettent.
 */
function drawdown(rs: number[]): number {
  let cumul = 0;
  let sommet = 0;
  let pire = 0;

  for (const r of rs) {
    cumul += r;
    if (cumul > sommet) sommet = cumul;
    const chute = sommet - cumul;
    if (chute > pire) pire = chute;
  }
  return arrondi(pire);
}

/** Calcule toutes les statistiques d'un lot de signaux. */
export function statistiques(signaux: Signal[]): Statistiques {
  const clotures = signaux.filter((s) => s.cloture_le !== null);
  const enCours = signaux.length - clotures.length;

  const gagnes = clotures.filter((s) => s.resultat === "gagne");
  const perdus = clotures.filter((s) => s.resultat === "perdu");
  const neutres = clotures.filter((s) => s.resultat === "neutre");

  // Le taux ne porte que sur les issues tranchées. Les neutres sont hors jeu.
  const tranches = gagnes.length + perdus.length;
  const taux = tranches >= MINIMUM_FIABLE ? arrondi((gagnes.length / tranches) * 100, 1) : null;

  // Ordre chronologique : le drawdown dépend de la séquence, pas de l'ensemble.
  const rs = clotures
    .filter((s) => s.r_realise !== null)
    .sort((a, b) => new Date(a.cloture_le!).getTime() - new Date(b.cloture_le!).getTime())
    .map((s) => s.r_realise!);

  const rGagnes = rs.filter((r) => r > 0);
  const rPerdus = rs.filter((r) => r < 0);
  const sommeGains = rGagnes.reduce((a, b) => a + b, 0);
  const sommePertes = Math.abs(rPerdus.reduce((a, b) => a + b, 0));

  // Facteur de profit = ce qu'on gagne divisé par ce qu'on perd. Sous 1, la
  // méthode détruit du capital, quel que soit le taux de réussite affiché.
  // Aucune perte du tout ne donne PAS l'infini : c'est un échantillon trop
  // petit, on renvoie null plutôt qu'un chiffre spectaculaire et faux.
  const facteur = sommePertes > 0 ? arrondi(sommeGains / sommePertes) : null;

  const durees = clotures
    .filter((s) => s.cloture_le)
    .map((s) => (new Date(s.cloture_le!).getTime() - new Date(s.publie_le).getTime()) / 60000);

  const moyenne = (xs: number[]): number | null =>
    xs.length ? arrondi(xs.reduce((a, b) => a + b, 0) / xs.length, 1) : null;

  return {
    total: signaux.length,
    gagnes: gagnes.length,
    perdus: perdus.length,
    neutres: neutres.length,
    en_cours: enCours,
    taux_reussite: taux,
    rr_moyen: moyenne(signaux.map((s) => s.rr)),
    r_cumule: arrondi(rs.reduce((a, b) => a + b, 0)),
    facteur_profit: facteur,
    duree_moyenne_min: moyenne(durees),
    drawdown_max: drawdown(rs),
    plus_gros_gain: rGagnes.length ? arrondi(Math.max(...rGagnes)) : null,
    plus_grosse_perte: rPerdus.length ? arrondi(Math.min(...rPerdus)) : null,
    confiance_moyenne: moyenne(signaux.map((s) => s.confiance)),
  };
}

/**
 * Ce qui manque pour qu'un taux soit publiable.
 *
 * Affiché à la place du chiffre tant que l'échantillon est trop mince. C'est
 * frustrant, et c'est voulu : la frustration coûte moins cher qu'une fausse
 * certitude sur laquelle on engage de l'argent.
 */
export function manquePourConclure(signaux: Signal[]): number {
  const tranches = signaux.filter((s) => s.resultat === "gagne" || s.resultat === "perdu").length;
  return Math.max(0, MINIMUM_FIABLE - tranches);
}

export type Periode = "jour" | "semaine" | "mois" | "tout";

/** Le début de la période, en heure UTC. */
export function debutPeriode(p: Periode, reference = new Date()): Date {
  const d = new Date(reference);
  d.setUTCHours(0, 0, 0, 0);

  if (p === "jour") return d;
  if (p === "semaine") {
    // Semaine commençant le lundi : c'est la semaine de marché, pas la
    // semaine du calendrier américain. Un relevé hebdomadaire qui coupe au
    // dimanche sépare le vendredi soir du lundi matin sans raison.
    const jour = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - jour);
    return d;
  }
  if (p === "mois") {
    d.setUTCDate(1);
    return d;
  }
  return new Date(0);
}

export interface Rapport {
  periode: Periode;
  debut: string;
  stats: Statistiques;
  signaux: Signal[];
}

/** Découpe un lot de signaux sur une période et le résume. */
export function rapport(signaux: Signal[], periode: Periode, reference = new Date()): Rapport {
  const debut = debutPeriode(periode, reference);
  const lot = signaux.filter((s) => new Date(s.publie_le).getTime() >= debut.getTime());
  return { periode, debut: debut.toISOString(), stats: statistiques(lot), signaux: lot };
}

/**
 * La courbe de capital, en R cumulés.
 *
 * Un point par trade clôturé, dans l'ordre. C'est le graphique qui dit la
 * vérité en un coup d'œil : une courbe qui monte en escalier régulier vaut
 * mieux qu'une courbe plus haute mais en dents de scie, parce que la seconde
 * se trade beaucoup plus mal en pratique.
 */
export function courbe(signaux: Signal[]): { t: string; r: number; cumul: number; id: string }[] {
  let cumul = 0;
  return signaux
    .filter((s) => s.cloture_le && s.r_realise !== null)
    .sort((a, b) => new Date(a.cloture_le!).getTime() - new Date(b.cloture_le!).getTime())
    .map((s) => {
      cumul = arrondi(cumul + s.r_realise!);
      return { t: s.cloture_le!, r: s.r_realise!, cumul, id: s.id };
    });
}

/**
 * Performance par tranche de confiance.
 *
 * C'est le tableau qui valide — ou détruit — le principe même du seuil à
 * 90 %. Si les signaux à 90-94 gagnent aussi souvent que ceux à 95-100, le
 * score ne discrimine rien et il faut revoir le barème. Aucun autre chiffre
 * du journal ne remet en cause le système lui-même.
 */
export function parConfiance(signaux: Signal[]): { tranche: string; total: number; taux: number | null; r: number }[] {
  const tranches = [
    { tranche: "90–92", min: 90, max: 92 },
    { tranche: "93–95", min: 93, max: 95 },
    { tranche: "96–100", min: 96, max: 100 },
  ];

  return tranches.map((t) => {
    const lot = signaux.filter((s) => s.confiance >= t.min && s.confiance <= t.max);
    const g = lot.filter((s) => s.resultat === "gagne").length;
    const p = lot.filter((s) => s.resultat === "perdu").length;
    return {
      tranche: t.tranche,
      total: lot.length,
      // Seuil abaissé à 10 ici : on compare des tranches entre elles, pas on
      // ne publie un taux absolu. L'ordre relatif est informatif plus tôt.
      taux: g + p >= 10 ? arrondi((g / (g + p)) * 100, 1) : null,
      r: arrondi(lot.reduce((s, x) => s + (x.r_realise ?? 0), 0)),
    };
  });
}

/** Performance par séance — répond à « à quelle heure vaut-il mieux trader ? ». */
export function parSession(signaux: Signal[]): { session: string; total: number; taux: number | null; r: number }[] {
  const sessions = ["chevauchement", "londres", "new-york", "asie"];
  return sessions
    .map((session) => {
      const lot = signaux.filter((s) => s.session === session);
      const g = lot.filter((s) => s.resultat === "gagne").length;
      const p = lot.filter((s) => s.resultat === "perdu").length;
      return {
        session,
        total: lot.length,
        taux: g + p >= 10 ? arrondi((g / (g + p)) * 100, 1) : null,
        r: arrondi(lot.reduce((s, x) => s + (x.r_realise ?? 0), 0)),
      };
    })
    .filter((x) => x.total > 0);
}
