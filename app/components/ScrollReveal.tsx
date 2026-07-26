"use client";
/**
 * Animation de défilement globale — chaque <section> apparaît en fondu
 * quand elle entre dans l'écran, sur TOUTES les pages. Automatique.
 *
 * Sûr : fondu d'opacité uniquement (pas de transform) → ne crée pas de
 * containing block, donc n'affecte jamais les éléments position:fixed.
 * Les sections déjà visibles au chargement restent visibles (pas de flash).
 * Respecte prefers-reduced-motion.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Laisse le DOM de la nouvelle page se peindre avant d'observer.
    const raf = requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("main section"));
      if (!els.length) return;

      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("kp-reveal-in");
              io.unobserve(e.target);
            }
          }
        },
        { threshold: 0.06, rootMargin: "0px 0px -6% 0px" },
      );

      const vh = window.innerHeight;
      els.forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top < vh * 0.92) {
          // Déjà visible → montrée immédiatement, aucun flash.
          el.classList.add("kp-reveal", "kp-reveal-in");
        } else {
          el.classList.add("kp-reveal");
          io.observe(el);
        }
      });

      // Nettoyage stocké sur l'élément pour le disconnect au changement de page.
      (window as unknown as { __kpRevealIO?: IntersectionObserver }).__kpRevealIO?.disconnect();
      (window as unknown as { __kpRevealIO?: IntersectionObserver }).__kpRevealIO = io;
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
