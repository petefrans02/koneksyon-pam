/**
 * LECTURE EN DIRECT, DEPUIS LE SITE.
 *
 * Le même moteur que le bot Telegram, mais accessible par une simple URL. Deux
 * raisons de l'exposer ici, et la seconde est celle qui compte :
 *
 * 1. L'élève n'a plus à configurer quoi que ce soit pour s'en servir.
 * 2. Ça devient **testable**. Le chemin des données réelles n'existait
 *    jusqu'ici que derrière un webhook signé, donc impossible à vérifier
 *    autrement qu'en envoyant un message dans Telegram et en espérant. Une
 *    route publique se teste en une commande.
 *
 * Chaque appel consomme un crédit par unité de temps chez le fournisseur — la
 * gratuité plafonne à 8 par minute. D'où la limitation en tête de fichier :
 * elle protège le quota, pas le serveur.
 */

import { NextRequest } from "next/server";
import {
  ErreurMarche,
  Unite,
  estOTC,
  normaliserSymbole,
  plusieursUnites,
} from "@/lib/trading/marche";
import { lire, synthetiser } from "@/lib/trading/lecture";

export const maxDuration = 60;

const UNITES: Unite[] = ["M1", "M5", "M15", "H1"];

/**
 * Le fournisseur accepte 8 appels par minute et une lecture en consomme 4.
 * Deux lectures par minute, donc — au-delà on refuse ici plutôt que de se
 * faire couper là-bas, où l'erreur serait bien moins claire.
 */
const INTERVALLE_MIN = 30_000;
let dernierAppel = 0;

export async function GET(request: NextRequest) {
  if (!process.env.TWELVE_DATA_KEY) {
    return Response.json(
      { erreur: "La source de données n'est pas configurée sur ce serveur." },
      { status: 503 },
    );
  }

  const saisie = request.nextUrl.searchParams.get("symbole") ?? "";
  if (!saisie.trim()) {
    return Response.json({ erreur: "Indique un symbole, par exemple EURUSD." }, { status: 400 });
  }

  if (estOTC(saisie)) {
    return Response.json(
      {
        erreur:
          "Les actifs OTC ne sont cotés que par le broker : aucune source de données ne les fournit. Passe par l'analyse de capture d'écran.",
        otc: true,
      },
      { status: 422 },
    );
  }

  const symbole = normaliserSymbole(saisie);
  if (!symbole) {
    return Response.json(
      { erreur: `Symbole non reconnu : « ${saisie} ». Essaie EURUSD, GBPJPY, AUDCHF…` },
      { status: 400 },
    );
  }

  const depuis = Date.now() - dernierAppel;
  if (depuis < INTERVALLE_MIN) {
    return Response.json(
      {
        erreur: `Quota du fournisseur : attends ${Math.ceil((INTERVALLE_MIN - depuis) / 1000)} secondes.`,
        patienter: Math.ceil((INTERVALLE_MIN - depuis) / 1000),
      },
      { status: 429 },
    );
  }
  dernierAppel = Date.now();

  try {
    const { series, echecs } = await plusieursUnites(symbole, UNITES);

    if (!series.length) {
      return Response.json(
        {
          erreur: `Aucune donnée pour ${symbole}.`,
          detail: echecs[0]?.raison ?? "symbole inconnu du fournisseur",
          echecs,
        },
        { status: 502 },
      );
    }

    const lectures = series.map((s) => lire(s.symbole, s.unite, s.candles));
    const synthese = synthetiser(lectures);

    // Toutes les unités figées : le marché est fermé, pas l'outil en panne.
    const figee = series.every((s) => s.figee);
    const retard = Math.min(...series.map((s) => s.age));

    return Response.json({
      marche: {
        ouvert: !figee,
        retard_minutes: retard,
        message: figee
          ? `Marché fermé ou données figées : la dernière bougie a ${retard >= 120 ? Math.round(retard / 60) + " heures" : retard + " minutes"}. Toute lecture porterait sur un marché à l'arrêt.`
          : null,
      },
      synthese: {
        symbole: synthese.symbole,
        sens: synthese.sens,
        confiance: synthese.confiance,
        alignement: synthese.alignement,
        accord: synthese.accord,
        entree: synthese.entree
          ? {
              unite: synthese.entree.unite,
              prix: synthese.entree.prix,
              directe: synthese.entree.directe,
              couverte: synthese.entree.couverte,
              objectif: synthese.entree.objectif,
              obstacle: synthese.entree.obstacle,
              raisons: synthese.entree.raisons,
            }
          : null,
        unites: synthese.lectures.map((l) => ({
          unite: l.unite,
          sens: l.sens,
          confiance: l.confiance,
          tendance: l.tendance,
          prix: l.prix,
          momentum: { etat: l.momentum.state, direction: l.momentum.direction },
          figures: l.figures.map((f) => f.name),
          raisons: l.raisons,
          directe: l.directe,
          couverte: l.couverte,
        })),
      },
      // Le moment exact des données compte : une lecture de quinze minutes
      // n'est plus la même analyse.
      horodatage: new Date().toISOString(),
      echecs,
    });
  } catch (e) {
    const temporaire = e instanceof ErreurMarche && e.temporaire;
    console.error("[trading/marche]", e instanceof Error ? e.message : e);
    return Response.json(
      {
        erreur: temporaire
          ? "Fournisseur momentanément indisponible ou quota atteint. Réessaie dans une minute."
          : "La lecture a échoué.",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 502 },
    );
  }
}
