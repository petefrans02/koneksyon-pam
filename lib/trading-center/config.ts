/**
 * LA CONFIGURATION VIVANTE.
 *
 * Le seuil de confiance, le modèle d'IA ou le délai du plan gratuit vivent en
 * base, pas dans le code. Ce n'est pas un caprice d'architecture : le seuil
 * est le réglage qu'on voudra bouger le plus souvent, et le bouger ne doit
 * pas demander un déploiement pendant une séance ouverte.
 *
 * Un cache court (30 s) évite d'aller chercher neuf lignes en base à chaque
 * alerte, tout en garantissant qu'un changement fait dans l'admin est pris en
 * compte avant la minute suivante — largement assez réactif pour un système
 * qui publie quelques signaux par semaine.
 */

import { adminDb } from "@/lib/admin-auth";

export interface ConfigTC {
  /** % minimum de confiance pour qu'un signal soit publié. */
  seuil_confiance: number;
  ia_active: boolean;
  ia_modele: string;
  /** Retard appliqué au plan gratuit, en minutes. */
  delai_gratuit_min: number;
  /** Nombre de signaux passés visibles en gratuit. */
  historique_gratuit: number;
  /** Garde-fou anti-spam : maximum de signaux par marché et par jour. */
  max_signaux_jour: number;
  /** Délai minimal entre deux signaux du même marché, en minutes. */
  anti_doublon_min: number;
  /** Risque/rendement en dessous duquel on refuse, quoi qu'en dise le score. */
  rr_minimum: number;
  /** Séances pendant lesquelles on accepte de publier. */
  sessions_autorisees: string[];
}

/**
 * Les valeurs par défaut.
 *
 * Elles servent quand la table n'existe pas encore (migration non exécutée)
 * ou quand la base est injoignable. Le principe : en cas de doute, le système
 * doit être PLUS strict, jamais moins. Un seuil par défaut à 90 et une IA
 * active signifient qu'une base muette ne peut pas déclencher un flot de
 * signaux médiocres — au pire, elle n'en publie aucun.
 */
export const DEFAUTS: ConfigTC = {
  seuil_confiance: 90,
  ia_active: true,
  ia_modele: "claude-sonnet-5",
  delai_gratuit_min: 60,
  historique_gratuit: 5,
  max_signaux_jour: 4,
  anti_doublon_min: 90,
  rr_minimum: 1.5,
  sessions_autorisees: ["londres", "new-york", "chevauchement"],
};

let cache: { valeur: ConfigTC; expire: number } | null = null;
const DUREE_CACHE = 30_000;

/** Lit la configuration, en repliant sur les défauts pour toute clé absente. */
export async function config(): Promise<ConfigTC> {
  if (cache && cache.expire > Date.now()) return cache.valeur;

  const resultat = { ...DEFAUTS };

  try {
    const { data, error } = await adminDb().from("tc_config").select("cle, valeur");
    if (!error && data) {
      for (const ligne of data as { cle: string; valeur: unknown }[]) {
        if (ligne.cle in resultat) {
          // Le type est imposé par ConfigTC ; la base ne peut que fournir la valeur.
          (resultat as unknown as Record<string, unknown>)[ligne.cle] = ligne.valeur;
        }
      }
    }
  } catch {
    // Base injoignable : on garde les défauts, qui sont les réglages stricts.
  }

  cache = { valeur: resultat, expire: Date.now() + DUREE_CACHE };
  return resultat;
}

/** Écrit une clé et invalide le cache immédiatement. */
export async function ecrireConfig(cle: keyof ConfigTC, valeur: unknown): Promise<void> {
  await adminDb()
    .from("tc_config")
    .upsert({ cle, valeur, maj_le: new Date().toISOString() }, { onConflict: "cle" });
  cache = null;
}

/** Force la relecture — utilisé par l'admin après une salve de modifications. */
export function viderCache(): void {
  cache = null;
}
