"use client";
/**
 * Bloc de connectivité global — « Que faire ensuite ? ».
 * Injecté une seule fois dans ClientLayout, au-dessus du Footer.
 * Objectif manifeste : aucune page ne doit être une impasse.
 *
 * Il choisit automatiquement le contexte (et exclut la page courante)
 * selon le premier segment de l'URL, et se masque sur les écrans où il
 * n'a pas de sens (accueil riche, auth, admin, tableau de bord, écrans
 * de jeu immersifs, pages légales).
 */
import { usePathname } from "next/navigation";
import NextStep, { StepContext } from "@/app/components/NextStep";

const SECTION: Record<string, { context: StepContext; exclude?: string }> = {
  academie:      { context: "academy",    exclude: "/academie" },
  etude:         { context: "study",      exclude: "/etude" },
  bible:         { context: "bible",      exclude: "/etude" },
  "aujourd-hui": { context: "bible",      exclude: "/etude" },
  psaumes:       { context: "bible",      exclude: "/etude" },
  quiz:          { context: "game",       exclude: "/quiz" },
  championnats:  { context: "game",       exclude: "/championnats" },
  concours:      { context: "game",       exclude: "/championnats" },
  classement:    { context: "game" },
  trophees:      { context: "game" },
  communaute:    { context: "community",  exclude: "/communaute" },
  prieres:       { context: "prayer",     exclude: "/prieres" },
  louange:       { context: "worship",    exclude: "/louange" },
  chants:        { context: "worship" },
  temoignages:   { context: "community",  exclude: "/communaute" },
  enseignement:  { context: "teaching",   exclude: "/enseignement" },
  impact:        { context: "impact",     exclude: "/impact" },
  projets:       { context: "foundation", exclude: "/projets" },
  fondation:     { context: "foundation" },
  don:           { context: "give",       exclude: "/don" },
  mission:       { context: "default" },
  apropos:       { context: "default" },
  contact:       { context: "default" },
};

// Sections où le bloc ne doit jamais apparaître.
const HIDDEN_SECTIONS = new Set([
  "", "auth", "login", "inscription", "admin", "dashboard", "profile",
  "notifications", "play", "private", "decouvrir",
  "conditions-utilisation", "politique-confidentialite",
]);

export default function GlobalNextStep() {
  const pathname = usePathname() || "/";
  if (pathname === "/") return null;

  const seg = pathname.split("/").filter(Boolean);
  const first = seg[0] ?? "";
  if (HIDDEN_SECTIONS.has(first)) return null;

  // Écrans de concours/championnat immersifs (une manche précise) : pas de bloc.
  if ((first === "championnats" || first === "concours") && seg.length >= 2) return null;
  // Sous-pages d'église immersives / création : garder simple, masquer les profondes.
  if (first === "eglise" && seg.length >= 2) return null;

  const cfg = SECTION[first] ?? { context: "default" as StepContext };
  return <NextStep context={cfg.context} exclude={cfg.exclude} />;
}
