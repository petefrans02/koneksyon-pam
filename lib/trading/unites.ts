/**
 * Lecture des unités de temps telles que les plateformes les écrivent.
 *
 * Partagé entre l'API de synthèse (qui pondère les échelles) et la page
 * d'analyse (qui trie les graphiques de la plus courte à la plus longue).
 * Aucune dépendance : ce fichier doit rester importable des deux côtés.
 */

/**
 * « M15 », « 15 min », « H1 », « 1 heure », « D », « journalier » → minutes.
 *
 * Renvoie null quand l'unité n'est pas reconnue : une échelle inconnue ne peut
 * ni être pondérée ni être classée, et il vaut mieux l'écarter que lui inventer
 * un rang.
 */
export function minutesDeUnite(u: unknown): number | null {
  if (typeof u !== "string") return null;
  const t = u.toLowerCase().trim();

  if (/^(d|d1|1d|j|journalier|daily|jour)\b/.test(t)) return 1440;
  if (/^(w|w1|1w|hebdo)/.test(t)) return 10080;
  if (/^(mn|mois|monthly)/.test(t)) return 43200;

  // Formes compactes : m1, m5, h1, h4.
  const compact = t.match(/^([mh])\s*(\d+)/);
  if (compact) {
    const n = parseInt(compact[2], 10);
    return compact[1] === "h" ? n * 60 : n;
  }

  // Formes écrites : « 15 minutes », « 4 heures », « 30 sec ».
  const ecrit = t.match(/(\d+)\s*(sec|s\b|min|m\b|heure|hour|h\b)/);
  if (ecrit) {
    const n = parseInt(ecrit[1], 10);
    const unite = ecrit[2];
    if (unite.startsWith("sec") || unite === "s") return Math.max(1, Math.round(n / 60));
    if (unite.startsWith("h")) return n * 60;
    return n;
  }
  return null;
}
