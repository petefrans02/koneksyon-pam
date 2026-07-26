"use client";
import { useEffect, useRef, useState, Dispatch, SetStateAction } from "react";

/**
 * useState dont la valeur survit à un rafraîchissement (localStorage).
 * Permet de rester sur la même page/étape et de continuer après un refresh.
 *
 * @param key     clé de stockage unique (ex. `kp:course:foi:lesson`)
 * @param initial valeur par défaut si rien n'est encore stocké
 */
export function useStickyState<T>(
  key: string,
  initial: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const hydrated = useRef(false);

  // Chargement depuis le stockage au montage (client uniquement).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* stockage indisponible — on garde la valeur initiale */
    }
    hydrated.current = true;
  }, [key]);

  // Persistance à chaque changement (après le chargement initial).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* stockage plein ou indisponible — on ignore */
    }
  }, [key, value]);

  return [value, setValue];
}
