"use client";

/**
 * Persistance de la progression — point de bascule unique.
 *
 * Pour l'instant : localStorage. C'est assumé et temporaire. Le reste de
 * l'académie ne connaît QUE le hook `useStudent()` et `saveStudent()`, donc
 * passer à Supabase (à l'image de la table `english_progress` du cours
 * d'anglais) ne touchera aucun composant — seulement ce fichier.
 *
 * Conséquence à connaître tant que c'est du localStorage : la progression est
 * liée au navigateur, pas au compte. Elle ne suit pas l'élève d'un appareil à
 * l'autre et disparaît si le stockage est vidé.
 *
 * Implémenté avec `useSyncExternalStore` plutôt qu'un `useEffect` qui appelle
 * `setState` : c'est le mécanisme prévu par React pour lire une source externe.
 * Il gère proprement le rendu serveur (qui renvoie l'état vide) puis la reprise
 * côté navigateur, sans rendu en cascade ni écart d'hydratation.
 */

import { useSyncExternalStore } from "react";
import { EMPTY_STUDENT, Student } from "./progress";

const CLE = "kp-trading-progress-v1";

/**
 * Instantané mémoïsé. `useSyncExternalStore` appelle `getSnapshot` à chaque
 * rendu et compare par identité : renvoyer un objet neuf à chaque appel
 * provoquerait une boucle de rendu infinie. On ne remplace donc le cache que
 * lorsque les données changent réellement.
 */
let cache: Student | null = null;
const listeners = new Set<() => void>();

function lire(): Student {
  if (typeof window === "undefined") return EMPTY_STUDENT;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return EMPTY_STUDENT;
    const lu = JSON.parse(brut) as Partial<Student>;
    // Fusion avec l'état vide : l'ajout d'un champ dans une version future ne
    // doit pas casser la lecture d'une progression enregistrée avant.
    return { ...EMPTY_STUDENT, ...lu, skills: lu.skills ?? {}, levels: lu.levels ?? {} };
  } catch {
    return EMPTY_STUDENT;
  }
}

function getSnapshot(): Student {
  if (cache === null) cache = lire();
  return cache;
}

function getServerSnapshot(): Student {
  return EMPTY_STUDENT;
}

function notifier(): void {
  for (const l of listeners) l();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Un autre onglet peut modifier la progression : on se resynchronise.
  const onStorage = (e: StorageEvent) => {
    if (e.key === CLE) {
      cache = lire();
      notifier();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Lecture réactive de la progression. */
export function useStudent(): Student {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Écrit la progression et prévient tous les composants abonnés. */
export function saveStudent(s: Student): void {
  cache = s;
  notifier();
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(s));
  } catch {
    // Quota dépassé ou navigation privée : on perd la sauvegarde, pas la session.
  }
}

export function resetStudent(): void {
  cache = EMPTY_STUDENT;
  notifier();
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    /* sans effet */
  }
}

/** Jour courant au format AAAA-MM-JJ, en heure locale (pour les séries). */
export function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${j}`;
}
