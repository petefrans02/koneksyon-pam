"use client";
import { useEffect } from "react";

// Empêche l'écran de s'éteindre pendant le jeu (Screen Wake Lock API).
// Ré-acquiert le verrou quand l'onglet redevient visible.
export function useWakeLock(active = true) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined") return;
    let lock: { release?: () => Promise<void> } | null = null;

    const request = async () => {
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<{ release?: () => Promise<void> }> } };
        if (nav.wakeLock?.request) lock = await nav.wakeLock.request("screen");
      } catch { /* non supporté / refusé — sans conséquence */ }
    };
    const onVisible = () => { if (document.visibilityState === "visible") request(); };

    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      try { lock?.release?.(); } catch { /* ignore */ }
    };
  }, [active]);
}
