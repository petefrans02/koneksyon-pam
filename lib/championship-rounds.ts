import type { RoundSpec } from "./championship-types";

export const ROUND_SPECS: RoundSpec[] = [
  {
    index: 0, type: "mcq",
    name: { fr: "L'Éveil", ht: "Reveye a", en: "The Awakening", es: "El Despertar" },
    description: { fr: "5 questions à choix multiples sur les fondements bibliques", ht: "5 kesyon sou fondasyon biblik yo", en: "5 multiple choice questions on biblical foundations", es: "5 preguntas de opción múltiple sobre los fundamentos bíblicos" },
    icon: "📖", color: "#f59e0b",
    questions_count: 5, time_per_question: 15, base_points: 100, total_points: 500,
  },
  {
    index: 1, type: "tf",
    name: { fr: "Le Témoignage", ht: "Temwayaj la", en: "The Testimony", es: "El Testimonio" },
    description: { fr: "6 affirmations bibliques — Vrai ou Faux ?", ht: "6 aflèmasyon biblik — Vre oswa Fo ?", en: "6 biblical statements — True or False?", es: "6 afirmaciones bíblicas — ¿Verdadero o Falso?" },
    icon: "⚖️", color: "#3b82f6",
    questions_count: 6, time_per_question: 15, base_points: 100, total_points: 600,
  },
  {
    index: 2, type: "fill",
    name: { fr: "La Parole", ht: "Pawòl la", en: "The Word", es: "La Palabra" },
    description: { fr: "Complétez les versets bibliques", ht: "Konplete vèsèt biblik yo", en: "Complete the biblical verses", es: "Completa los versículos bíblicos" },
    icon: "✍️", color: "#8b5cf6",
    questions_count: 4, time_per_question: 15, base_points: 100, total_points: 400,
  },
  {
    index: 3, type: "character",
    name: { fr: "La Galerie des Prophètes", ht: "Galeri Pwofèt yo", en: "The Prophets Gallery", es: "La Galería de los Profetas" },
    description: { fr: "Identifiez les personnages bibliques à partir d'indices", ht: "Idantifye pèsonaj biblik yo ak done yo", en: "Identify biblical characters from clues", es: "Identifica personajes bíblicos a partir de pistas" },
    icon: "👤", color: "#f97316",
    questions_count: 4, time_per_question: 15, base_points: 100, total_points: 400,
  },
  {
    index: 4, type: "location",
    name: { fr: "Les Terres Saintes", ht: "Tè Sen yo", en: "The Holy Lands", es: "Las Tierras Santas" },
    description: { fr: "Identifiez les lieux bibliques", ht: "Idantifye kote biblik yo", en: "Identify biblical places", es: "Identifica los lugares bíblicos" },
    icon: "📍", color: "#10b981",
    questions_count: 4, time_per_question: 15, base_points: 100, total_points: 400,
  },
  {
    index: 5, type: "book",
    name: { fr: "La Bibliothèque Sacrée", ht: "Bibliyotèk Sakre a", en: "The Sacred Library", es: "La Biblioteca Sagrada" },
    description: { fr: "Identifiez les livres de la Bible", ht: "Idantifye liv Bib la", en: "Identify the books of the Bible", es: "Identifica los libros de la Biblia" },
    icon: "📚", color: "#7c3aed",
    questions_count: 4, time_per_question: 15, base_points: 100, total_points: 400,
  },
  {
    index: 6, type: "mcq",
    name: { fr: "Le Défi du Sage", ht: "Defi Saj la", en: "The Wise Man's Challenge", es: "El Desafío del Sabio" },
    description: { fr: "5 questions avancées pour les experts bibliques", ht: "5 kesyon avanse pou ekspè biblik yo", en: "5 advanced questions for biblical experts", es: "5 preguntas avanzadas para expertos bíblicos" },
    icon: "🔥", color: "#6366f1",
    questions_count: 5, time_per_question: 15, base_points: 100, total_points: 500,
  },
  {
    index: 7, type: "chrono",
    name: { fr: "L'Ordre Éternel", ht: "Lòd Etènèl la", en: "The Eternal Order", es: "El Orden Eterno" },
    description: { fr: "Remettez les événements bibliques dans l'ordre chronologique", ht: "Mete evènman biblik yo nan lòd kronolojik", en: "Put biblical events in chronological order", es: "Ordena los eventos bíblicos en orden cronológico" },
    icon: "⏳", color: "#d97706",
    questions_count: 3, time_per_question: 30, base_points: 100, total_points: 300,
  },
  {
    index: 8, type: "tf",
    name: { fr: "L'Éclair", ht: "Zèklè a", en: "The Lightning", es: "El Relámpago" },
    description: { fr: "8 affirmations rapides — 15 secondes chacune", ht: "8 aflèmasyon rapid — 15 segonn chak", en: "8 fast statements — 15 seconds each", es: "8 afirmaciones rápidas — 15 segundos cada una" },
    icon: "⚡", color: "#ef4444",
    questions_count: 8, time_per_question: 15, base_points: 100, total_points: 800,
  },
  {
    index: 9, type: "fill",
    name: { fr: "Le Verset Précieux", ht: "Vèsèt Presye a", en: "The Precious Verse", es: "El Versículo Precioso" },
    description: { fr: "Complétez des versets plus difficiles", ht: "Konplete vèsèt ki pi difisil yo", en: "Complete more challenging verses", es: "Completa versículos más difíciles" },
    icon: "💎", color: "#0ea5e9",
    questions_count: 4, time_per_question: 15, base_points: 100, total_points: 400,
  },
  {
    index: 10, type: "match",
    name: { fr: "Les Alliances", ht: "Alyans yo", en: "The Alliances", es: "Las Alianzas" },
    description: { fr: "Associez chaque élément à sa correspondance biblique", ht: "Asosye chak eleman ak korespondans biblik li", en: "Match each element to its biblical counterpart", es: "Relaciona cada elemento con su contraparte bíblica" },
    icon: "🔗", color: "#92400e",
    questions_count: 3, time_per_question: 30, base_points: 100, total_points: 300,
  },
  {
    index: 11, type: "order_verse",
    name: { fr: "Le Verset Brisé", ht: "Vèsèt Kraze a", en: "The Broken Verse", es: "El Versículo Roto" },
    description: { fr: "Reconstituez les versets bibliques dans le bon ordre", ht: "Rekonstitye vèsèt biblik yo nan bon lòd", en: "Reconstruct biblical verses in the right order", es: "Reconstruye los versículos bíblicos en el orden correcto" },
    icon: "📜", color: "#065f46",
    questions_count: 3, time_per_question: 30, base_points: 100, total_points: 300,
  },
  {
    index: 12, type: "character",
    name: { fr: "Le Mystère Biblique", ht: "Mistè Biblik la", en: "The Biblical Mystery", es: "El Misterio Bíblico" },
    description: { fr: "Personnages mystères — indices progressifs", ht: "Pèsonaj mistè — done pwogresif yo", en: "Mystery characters — progressive clues", es: "Personajes misteriosos — pistas progresivas" },
    icon: "🌟", color: "#1e3a8a",
    questions_count: 4, time_per_question: 20, base_points: 100, total_points: 400,
  },
  {
    index: 13, type: "mcq",
    name: { fr: "Le Jugement", ht: "Jijman an", en: "The Judgment", es: "El Juicio" },
    description: { fr: "5 questions de maîtres — 15 secondes pour répondre", ht: "5 kesyon mèt — 15 segonn pou reponn", en: "5 master questions — 15 seconds to answer", es: "5 preguntas maestras — 15 segundos para responder" },
    icon: "⚔️", color: "#be123c",
    questions_count: 5, time_per_question: 15, base_points: 100, total_points: 500,
  },
  {
    index: 14, type: "finale",
    name: { fr: "La Grande Finale", ht: "Gran Final la", en: "The Grand Finale", es: "La Gran Final" },
    description: { fr: "5 questions de légende — le titre se joue ici", ht: "5 kesyon lejandè — tit la jwe isit la", en: "5 legendary questions — the title is decided here", es: "5 preguntas legendarias — el título se decide aquí" },
    icon: "👑", color: "#b45309",
    questions_count: 5, time_per_question: 20, base_points: 100, total_points: 500,
  },
];

// Barème unique : 100 points par bonne réponse, sans aucun bonus.
// Le total d'une manche est donc simplement questions_count x 100.
export const MAX_TOTAL_POINTS = ROUND_SPECS.reduce((sum, r) => sum + r.total_points, 0);

export function getRoundSpec(index: number): RoundSpec {
  return ROUND_SPECS[index] ?? ROUND_SPECS[0];
}

export const PHASE_DURATIONS = {
  COUNTDOWN: 10_000,
  CHAMPIONSHIP_INTRO: 8_000,
  ROUND_INTRO: 6_000,
  ANSWER_REVEAL: 6_500,
  ROUND_RESULTS: 8_000,
  BETWEEN_ROUNDS: 4_000,
  PODIUM: 60_000,
} as const;
