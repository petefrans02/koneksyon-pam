"use client";

/**
 * ACADÉMIE TRADING — accès administrateur.
 *
 * Un admin voit et ouvre tous les niveaux, sans avoir à les valider. C'est
 * indispensable pour relire le contenu, tester un examen ou vérifier un drill
 * sans devoir traverser cinq niveaux à chaque fois.
 *
 * Deux principes tenus ici :
 *
 * 1. **La règle de progression n'est pas modifiée.** `progress.ts` reste pur et
 *    ignore complètement la notion d'admin. Le contournement est une couche
 *    au-dessus (`isLevelAccessible`), pas une exception glissée dans le verrou.
 *    Autrement dit : le verrou continue de fonctionner exactement pareil, on
 *    décide juste de ne pas le consulter.
 *
 * 2. **La progression de l'admin reste réelle.** On n'invente ni maîtrise ni
 *    score : seul l'accès est ouvert. Un admin qui fait un exercice le fait
 *    pour de vrai, ce qui permet de tester le parcours tel que les élèves le
 *    vivent.
 *
 * Implémenté avec `useSyncExternalStore` plutôt qu'un `useEffect` qui appelle
 * `setState` — même raison que dans `store.ts` : c'est le mécanisme prévu pour
 * lire une source externe, et il gère proprement le rendu serveur.
 */

import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

/** `null` = pas encore déterminé. On considère « non-admin » tant qu'on ne sait pas. */
let etat: boolean | null = null;
let enCours = false;
const listeners = new Set<() => void>();

function notifier(): void {
  for (const l of listeners) l();
}

/**
 * Interroge la session une seule fois par chargement de page.
 * Lancé depuis `subscribe`, pas depuis le rendu : on ne déclenche jamais
 * d'effet de bord pendant qu'un composant se dessine.
 */
function charger(): void {
  if (enCours || etat !== null) return;
  enCours = true;
  supabase.auth
    .getUser()
    .then(({ data }) => {
      etat = isAdmin(data.user);
      notifier();
    })
    .catch(() => {
      // Pas de session, env absente, réseau coupé : on reste sur « non-admin ».
      // Le pire cas est un admin qui voit le parcours comme un élève — gênant,
      // jamais dangereux. L'inverse serait un vrai problème.
      etat = false;
      notifier();
    })
    .finally(() => {
      enCours = false;
    });
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  charger();
  // La session peut changer sans rechargement (connexion, déconnexion).
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    etat = isAdmin(session?.user ?? null);
    notifier();
  });
  return () => {
    listeners.delete(onChange);
    data?.subscription?.unsubscribe?.();
  };
}

/** `getSnapshot` doit renvoyer une valeur stable : un booléen l'est par nature. */
function getSnapshot(): boolean {
  return etat === true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * `true` si l'utilisateur courant est administrateur.
 *
 * Renvoie `false` pendant le court instant où la session n'est pas encore lue :
 * l'interface s'ouvre donc juste après, ce qui est visuellement acceptable et
 * évite d'afficher un contenu verrouillé comme accessible par erreur.
 */
export function useAdminAccess(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
