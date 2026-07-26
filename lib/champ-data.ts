// Données & génération pour le Championnat Biblique (équipes, couleurs, joueurs IA).

// ── Noms d'équipes bibliques (lieux) ────────────────────────────────────────
export const BIBLICAL_PLACES = [
  "Jérusalem", "Nazareth", "Béthanie", "Galilée", "Sion", "Juda", "Éphraïm",
  "Bethléem", "Cana", "Jéricho", "Capernaüm", "Samarie", "Béthel", "Hébron",
  "Silo", "Gabaon", "Naïn", "Emmaüs", "Bethsaïda", "Magdala", "Tibériade",
  "Césarée", "Antioche", "Corinthe", "Éphèse", "Philippes", "Thessalonique",
  "Colosses", "Béroé", "Damas", "Ninive", "Babylone", "Sichem", "Guilgal",
  "Ramah", "Mitspa", "Endor", "Béer-Shéba", "Dan", "Tyr", "Sidon", "Gath",
  "Ascalon", "Gaza", "Aï", "Mamré", "Péniel", "Béthanie-au-delà", "Gethsémané",
  "Golgotha", "Patmos", "Laodicée", "Smyrne", "Pergame", "Thyatire", "Sardes",
  "Philadelphie", "Macédoine", "Galatie", "Achaïe", "Judée", "Pérée", "Idumée",
];

// ── Palette de couleurs d'équipes ───────────────────────────────────────────
export const TEAM_COLORS = [
  "#e11d48", "#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#0891b2",
  "#db2777", "#ca8a04", "#059669", "#4f46e5", "#dc2626", "#0d9488",
  "#9333ea", "#ea580c", "#0284c7", "#65a30d", "#be123c", "#7c2d12",
];

// ── Joueurs IA : prénoms, noms, pays (public francophone/chrétien) ─────────────
const AI_FIRST = [
  "Emmanuel", "Grâce", "Jean", "Marie", "Josué", "Esther", "Daniel", "Ruth",
  "Samuel", "Débora", "Élie", "Naomi", "David", "Sara", "Paul", "Rebecca",
  "Timothée", "Lydia", "Nathan", "Priscille", "Ézéchiel", "Anne", "Gédéon",
  "Marthe", "Josaphat", "Rachel", "Abel", "Judith", "Barnabé", "Dorcas",
  "Silas", "Phoebé", "Étienne", "Tabitha", "Philémon", "Junie", "Aristarque",
  "Christ-Roi", "Bénédiction", "Merveille", "Dieudonné", "Fidèle", "Espérance",
];
const AI_LAST = [
  "Kouassi", "Mbeki", "Toussaint", "Ngoma", "Diallo", "Okonkwo", "Baptiste",
  "Mensah", "Traoré", "Nkusu", "Pierre", "Adjovi", "Bokassa", "Rabe",
  "Cissé", "Owusu", "Jean-Louis", "Mutombo", "Sène", "Kagame", "Achille",
  "Bemba", "Coulibaly", "Eyadéma", "Randria", "Zongo", "Moïse", "Kalombo",
];
const AI_COUNTRIES = [
  "Haïti", "RD Congo", "Côte d'Ivoire", "Cameroun", "Sénégal", "France",
  "Canada", "Bénin", "Togo", "Burkina Faso", "Mali", "Gabon", "Congo",
  "Rwanda", "Kenya", "Nigéria", "Ghana", "Brésil", "Belgique", "Madagascar",
];

// ── Niveaux IA → compétence (prob. bonne réponse) + rapidité ────────────────
export type AILevel = "debutant" | "moyen" | "fort" | "expert";
// Niveaux volontairement BEATABLES : un vrai joueur qui connaît bien la Bible doit pouvoir gagner.
const LEVEL_PROFILE: Record<AILevel, { skill: number; speed: number }> = {
  debutant: { skill: 0.22, speed: 0.4 },
  moyen: { skill: 0.35, speed: 0.52 },
  fort: { skill: 0.48, speed: 0.64 },
  expert: { skill: 0.6, speed: 0.78 },
};

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }
function rand(min: number, max: number) { return min + Math.random() * (max - min); }

export function teamName(index: number): string {
  const base = pick(BIBLICAL_PLACES, index);
  const cycle = Math.floor(index / BIBLICAL_PLACES.length);
  return cycle === 0 ? `Équipe ${base}` : `Équipe ${base} ${cycle + 1}`;
}
export function teamColor(index: number): string { return pick(TEAM_COLORS, index); }

// Traduit le préfixe « Équipe » du nom d'une équipe selon la langue du tableau de bord.
export const TEAM_WORD: Record<string, string> = { fr: "Équipe", en: "Team", ht: "Ekip", es: "Equipo" };
export function teamLabel(name: string | undefined | null, lang: string = "fr"): string {
  if (!name) return "";
  const m = name.match(/^Équipe\s+(.*)$/i);
  return m ? `${TEAM_WORD[lang] ?? "Équipe"} ${m[1]}` : name; // noms d'église personnalisés inchangés
}

// Logo auto : on stocke une "graine" (initiales + couleur), rendue côté client en SVG.
export function logoSeed(name: string): string {
  const initials = name.replace(/^Équipe\s+/i, "").slice(0, 2).toUpperCase();
  return initials;
}

// Génère un joueur IA (déterminisme partiel via index + aléa réaliste).
export function makeAIPlayer(index: number, difficulty: "easy" | "medium" | "hard" | "mixed") {
  const levels: AILevel[] =
    difficulty === "easy" ? ["debutant", "debutant", "debutant", "moyen"]
    : difficulty === "medium" ? ["debutant", "debutant", "moyen", "moyen", "fort"]
    : difficulty === "hard" ? ["moyen", "moyen", "fort", "expert"]
    : ["debutant", "debutant", "moyen", "moyen", "fort"]; // mixed (par défaut, équilibré)
  const level = pick(levels, index + Math.floor(Math.random() * levels.length));
  const prof = LEVEL_PROFILE[level];
  const first = pick(AI_FIRST, index * 7 + 3);
  const last = pick(AI_LAST, index * 5 + 1);
  const country = pick(AI_COUNTRIES, index * 3 + 2);
  // Variation individuelle pour que ça paraisse humain.
  const skill = Math.max(0.2, Math.min(0.97, prof.skill + rand(-0.08, 0.08)));
  const speed = Math.max(0.2, Math.min(0.97, prof.speed + rand(-0.1, 0.1)));
  return {
    name: `${first} ${last}`,
    country,
    level,
    skill: Number(skill.toFixed(3)),
    speed: Number(speed.toFixed(3)),
    // Avatar généré (DiceBear, sans dépendance, URL publique déterministe).
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(first + last + index)}`,
  };
}

export const GROUP_LABELS = "ABCDEFGHIJKLMNOP".split("");
