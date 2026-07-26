/**
 * KONEKSYON PAM — Design System : tokens (source unique de vérité).
 *
 * Le code style majoritairement en `style={{}}` inline avec des hex codés en
 * dur. Ce module centralise couleurs, rayons, ombres, espacements et
 * typographie pour que TOUTES les pages parlent le même langage visuel.
 * Les mêmes valeurs existent en variables CSS dans globals.css (--kpf-*).
 *
 * Palette : bleu nuit profond · blanc · doré élégant · gris clair · turquoise.
 */

export const color = {
  // Bleu nuit
  navy:      "#1a3568",
  navyDark:  "#0d1d3d",
  navyDeep:  "#060d1a",
  navyMid:   "#1e3f7a",
  // Doré
  gold:      "#c8960f",
  goldWarm:  "#d4a017",
  goldLight: "#f0c840",
  goldPale:  "#fffbf0",
  // Turquoise (accent)
  cyan:      "#00aac8",
  cyanLight: "#38bdf8",
  cyanGlow:  "#67e8f9",
  // Neutres
  white:     "#ffffff",
  bgLight:   "#faf8f4",
  bgWarm:    "#f5f0e8",
  grayLight: "#f0ede8",
  border:    "#e8e4de",
  borderBlue:"#c8daf0",
  // Texte
  textDark:  "#0d1d3d",
  textMid:   "#1a3568",
  textBody:  "#2d3748",
  textMuted: "#4a6080",
  textFaint: "#9ca3af",
  // Statuts
  success:   "#16a34a",
  warning:   "#d97706",
  danger:    "#dc2626",
  info:      "#0891b2",
} as const;

export const gradient = {
  gold:      "linear-gradient(135deg,#c8960f,#f0c840)",
  goldSoft:  "linear-gradient(135deg,#d4a017,#e8b84b)",
  navy:      "linear-gradient(135deg,#06122a,#0d2048)",
  navyDeep:  "linear-gradient(180deg,#060d1a 0%,#0a1628 35%,#080e1c 100%)",
  cyan:      "linear-gradient(135deg,#00aac8,#38bdf8)",
  heroText:  "linear-gradient(135deg,#fff 0%,#67e8f9 55%,#00aac8 100%)",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const shadow = {
  sm:   "0 2px 12px rgba(0,0,0,0.04)",
  md:   "0 8px 28px rgba(26,53,104,0.10)",
  lg:   "0 14px 44px rgba(26,53,104,0.14)",
  gold: "0 6px 24px rgba(200,150,15,0.30)",
  cyan: "0 12px 36px rgba(0,170,200,0.15)",
} as const;

/** Espacements (px) — échelle 4pt. */
export const space = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
} as const;

export const font = {
  display: "'Playfair Display', Georgia, serif",
  body:    "Inter, system-ui, sans-serif",
} as const;

/** Transition premium par défaut (ressort doux). */
export const ease = "cubic-bezier(.34,1.56,.64,1)";
export const transition = `all .3s ${ease}`;

export const design = { color, gradient, radius, shadow, space, font, ease, transition };
export default design;
