import { Lang } from "./translations";

/**
 * KONEKSYON PAM — Catalogue de l'Académie (évolutif).
 * Ajouter une formation = ajouter une entrée ici. Les formations "coming"
 * s'affichent avec une page de pré-lancement élégante (jamais de page vide).
 * `icon` = clé IconName (voir app/components/Icon.tsx).
 */
export type AcademyDomain = "biblique" | "numerique" | "developpement";

export interface Course {
  slug: string;
  domain: AcademyDomain;
  title: Partial<Record<Lang, string>>;
  description: Partial<Record<Lang, string>>;
  icon: string;
  color: string;
  level: Partial<Record<Lang, string>>;
  lessons: number;
  status: "available" | "coming";
  /** Destination si disponible (ex. un parcours d'étude). Sinon /academie/<slug>. */
  href?: string;
}

export const DOMAINS: { key: AcademyDomain; icon: string; color: string; title: Record<Lang, string>; desc: Record<Lang, string> }[] = [
  { key: "biblique", icon: "bible", color: "#1d4ed8",
    title: { fr: "Formation Biblique", ht: "Fòmasyon Biblik", en: "Biblical Training", es: "Formación Bíblica" },
    desc:  { fr: "Grandir dans la connaissance de Dieu et de sa Parole.", ht: "Grandi nan konesans Bondye ak Pawòl li.", en: "Grow in the knowledge of God and his Word.", es: "Crecer en el conocimiento de Dios y su Palabra." } },
  { key: "numerique", icon: "wifi", color: "#0891b2",
    title: { fr: "Académie Numérique", ht: "Akademi Nimerik", en: "Digital Academy", es: "Academia Digital" },
    desc:  { fr: "Maîtriser les outils du monde moderne pour servir et travailler.", ht: "Metrize zouti mond modèn nan pou sèvi ak travay.", en: "Master modern tools to serve and work.", es: "Dominar las herramientas del mundo moderno para servir y trabajar." } },
  { key: "developpement", icon: "progression", color: "#c8960f",
    title: { fr: "Développement & Talents", ht: "Devlopman & Talan", en: "Growth & Talents", es: "Desarrollo & Talentos" },
    desc:  { fr: "Développer ses dons, entreprendre et grandir personnellement.", ht: "Devlope don ou, antreprann ak grandi pèsonèlman.", en: "Develop your gifts, build and grow personally.", es: "Desarrollar tus dones, emprender y crecer personalmente." } },
];

const beginner  = { fr: "Débutant",   ht: "Debitan",  en: "Beginner",     es: "Principiante" };
const allLevels = { fr: "Tous niveaux", ht: "Tout nivo", en: "All levels", es: "Todos los niveles" };

export const courses: Course[] = [
  // ── Formation biblique (au-delà des parcours d'études déjà en ligne) ──
  { slug: "ecole-biblique", domain: "biblique", icon: "bible", color: "#1d4ed8", lessons: 26, status: "available", href: "/etude",
    title: { fr: "École Biblique", ht: "Lekòl Biblik", en: "Bible School", es: "Escuela Bíblica" },
    description: { fr: "Les parcours d'études bibliques, de la Genèse à l'Apocalypse.", ht: "Parcou etid biblik yo, depi Jenèz rive Apokalips.", en: "Bible study paths, from Genesis to Revelation.", es: "Itinerarios de estudio bíblico, de Génesis a Apocalipsis." }, level: allLevels },
  { slug: "leadership", domain: "biblique", icon: "couronne", color: "#7c3aed", lessons: 8, status: "coming",
    title: { fr: "Leadership Chrétien", ht: "Lidèchip Kretyen", en: "Christian Leadership", es: "Liderazgo Cristiano" },
    description: { fr: "Diriger et servir selon le modèle de Christ.", ht: "Dirije ak sèvi selon modèl Kris la.", en: "Lead and serve after the model of Christ.", es: "Dirigir y servir según el modelo de Cristo." }, level: allLevels },
  { slug: "discipulat", domain: "biblique", icon: "academie", color: "#0891b2", lessons: 5, status: "available", href: "/etude?parcours=formation-disciples",
    title: { fr: "Discipulat", ht: "Disipila", en: "Discipleship", es: "Discipulado" },
    description: { fr: "Faire des disciples qui font des disciples.", ht: "Fè disip ki fè disip.", en: "Make disciples who make disciples.", es: "Hacer discípulos que hacen discípulos." }, level: allLevels },
  { slug: "jeunesse", domain: "biblique", icon: "etincelles", color: "#ea580c", lessons: 6, status: "coming",
    title: { fr: "Ministère des Jeunes", ht: "Ministè Jèn yo", en: "Youth Ministry", es: "Ministerio Juvenil" },
    description: { fr: "Vivre sa foi avec passion à la nouvelle génération.", ht: "Viv lafwa ak pasyon nan nouvo jenerasyon an.", en: "Living faith with passion for the new generation.", es: "Vivir la fe con pasión en la nueva generación." }, level: beginner },
  { slug: "famille", domain: "biblique", icon: "utilisateurs", color: "#16a34a", lessons: 7, status: "coming",
    title: { fr: "Famille & Mariage", ht: "Fanmi & Maryaj", en: "Family & Marriage", es: "Familia & Matrimonio" },
    description: { fr: "Bâtir un foyer solide sur des fondations bibliques.", ht: "Bati yon fwaye solid sou fondasyon biblik.", en: "Build a strong home on biblical foundations.", es: "Construir un hogar sólido sobre fundamentos bíblicos." }, level: allLevels },
  { slug: "musique", domain: "biblique", icon: "musique", color: "#ec4899", lessons: 10, status: "coming",
    title: { fr: "Musique & Louange", ht: "Mizik & Lwanj", en: "Music & Worship", es: "Música & Alabanza" },
    description: { fr: "Servir Dieu par la musique et conduire l'adoration.", ht: "Sèvi Bondye ak mizik e mennen adorasyon.", en: "Serve God through music and lead worship.", es: "Servir a Dios con música y dirigir la adoración." }, level: beginner },

  // ── Académie numérique ──
  { slug: "informatique", domain: "numerique", icon: "parametres", color: "#0891b2", lessons: 12, status: "coming",
    title: { fr: "Initiation à l'Informatique", ht: "Inisyasyon Enfòmatik", en: "Computer Basics", es: "Iniciación a la Informática" },
    description: { fr: "Les bases de l'ordinateur pour bien démarrer.", ht: "Baz òdinatè a pou byen kòmanse.", en: "Computer fundamentals to get started right.", es: "Los fundamentos de la computadora para empezar bien." }, level: beginner },
  { slug: "internet", domain: "numerique", icon: "wifi", color: "#0284c7", lessons: 8, status: "coming",
    title: { fr: "Internet & Sécurité", ht: "Entènèt & Sekirite", en: "Internet & Safety", es: "Internet & Seguridad" },
    description: { fr: "Naviguer, rechercher et se protéger en ligne.", ht: "Navige, chèche ak pwoteje tèt ou anliy.", en: "Browse, search and stay safe online.", es: "Navegar, buscar y protegerse en línea." }, level: beginner },
  { slug: "word", domain: "numerique", icon: "pdf", color: "#2563eb", lessons: 10, status: "coming",
    title: { fr: "Microsoft Word", ht: "Microsoft Word", en: "Microsoft Word", es: "Microsoft Word" },
    description: { fr: "Rédiger et mettre en forme des documents professionnels.", ht: "Redije ak mete an fòm dokiman pwofesyonèl.", en: "Write and format professional documents.", es: "Redactar y dar formato a documentos profesionales." }, level: beginner },
  { slug: "excel", domain: "numerique", icon: "classement", color: "#16a34a", lessons: 14, status: "coming",
    title: { fr: "Microsoft Excel", ht: "Microsoft Excel", en: "Microsoft Excel", es: "Microsoft Excel" },
    description: { fr: "Tableaux, formules et gestion de données.", ht: "Tablo, fòmil ak jesyon done.", en: "Spreadsheets, formulas and data management.", es: "Tablas, fórmulas y gestión de datos." }, level: allLevels },
  { slug: "powerpoint", domain: "numerique", icon: "image", color: "#ea580c", lessons: 8, status: "coming",
    title: { fr: "PowerPoint & Présentations", ht: "PowerPoint & Prezantasyon", en: "PowerPoint & Slides", es: "PowerPoint & Presentaciones" },
    description: { fr: "Créer des présentations claires et percutantes.", ht: "Kreye prezantasyon klè ak konvenkan.", en: "Create clear, compelling presentations.", es: "Crear presentaciones claras y convincentes." }, level: beginner },
  { slug: "google", domain: "numerique", icon: "recherche", color: "#dc2626", lessons: 9, status: "coming",
    title: { fr: "Outils Google", ht: "Zouti Google", en: "Google Tools", es: "Herramientas Google" },
    description: { fr: "Gmail, Drive, Docs et Agenda pour s'organiser.", ht: "Gmail, Drive, Docs ak Ajennda pou òganize.", en: "Gmail, Drive, Docs and Calendar to get organized.", es: "Gmail, Drive, Docs y Calendario para organizarse." }, level: beginner },
  { slug: "canva", domain: "numerique", icon: "image", color: "#7c3aed", lessons: 8, status: "coming",
    title: { fr: "Design avec Canva", ht: "Design ak Canva", en: "Design with Canva", es: "Diseño con Canva" },
    description: { fr: "Créer des visuels professionnels sans être graphiste.", ht: "Kreye vizyèl pwofesyonèl san ou pa grafis.", en: "Create professional visuals without being a designer.", es: "Crear visuales profesionales sin ser diseñador." }, level: beginner },
  { slug: "chatgpt-ia", domain: "numerique", icon: "etincelles", color: "#0d9488", lessons: 10, status: "coming",
    title: { fr: "ChatGPT & Intelligence Artificielle", ht: "ChatGPT & Entèlijans Atifisyèl", en: "ChatGPT & Artificial Intelligence", es: "ChatGPT & Inteligencia Artificial" },
    description: { fr: "Utiliser l'IA pour apprendre, créer et gagner du temps.", ht: "Sèvi ak IA pou aprann, kreye ak gen tan.", en: "Use AI to learn, create and save time.", es: "Usar la IA para aprender, crear y ahorrar tiempo." }, level: allLevels },
  { slug: "creation-web", domain: "numerique", icon: "lien", color: "#4f46e5", lessons: 16, status: "coming",
    title: { fr: "Création de Sites Web", ht: "Kreyasyon Sit Web", en: "Web Development", es: "Creación de Sitios Web" },
    description: { fr: "Concevoir et publier son propre site internet.", ht: "Konsevwa ak pibliye pwòp sit entènèt ou.", en: "Design and publish your own website.", es: "Diseñar y publicar tu propio sitio web." }, level: allLevels },

  // ── Développement & talents ──
  { slug: "entrepreneuriat", domain: "developpement", icon: "cible", color: "#c8960f", lessons: 12, status: "coming",
    title: { fr: "Entrepreneuriat", ht: "Antreprenarya", en: "Entrepreneurship", es: "Emprendimiento" },
    description: { fr: "Lancer et gérer son activité avec sagesse.", ht: "Lanse ak jere aktivite ou ak sajès.", en: "Launch and run your venture with wisdom.", es: "Lanzar y gestionar tu actividad con sabiduría." }, level: allLevels },
  { slug: "marketing", domain: "developpement", icon: "notifications", color: "#db2777", lessons: 10, status: "coming",
    title: { fr: "Marketing Digital", ht: "Maketin Dijital", en: "Digital Marketing", es: "Marketing Digital" },
    description: { fr: "Faire connaître son projet sur les réseaux.", ht: "Fè pwojè ou konnen sou rezo yo.", en: "Grow your project's reach on social media.", es: "Dar a conocer tu proyecto en las redes." }, level: beginner },
  { slug: "communication", domain: "developpement", icon: "message", color: "#0891b2", lessons: 8, status: "coming",
    title: { fr: "Communication & Prise de Parole", ht: "Kominikasyon & Pran Lapawòl", en: "Communication & Public Speaking", es: "Comunicación & Oratoria" },
    description: { fr: "S'exprimer avec clarté, confiance et impact.", ht: "Eksprime tèt ou ak klète, konfyans ak enpak.", en: "Speak with clarity, confidence and impact.", es: "Expresarse con claridad, confianza e impacto." }, level: beginner },
  { slug: "developpement-personnel", domain: "developpement", icon: "progression", color: "#16a34a", lessons: 9, status: "coming",
    title: { fr: "Développement Personnel", ht: "Devlopman Pèsonèl", en: "Personal Growth", es: "Desarrollo Personal" },
    description: { fr: "Discipline, gestion du temps et vision de vie.", ht: "Disiplin, jesyon tan ak vizyon lavi.", en: "Discipline, time management and life vision.", es: "Disciplina, gestión del tiempo y visión de vida." }, level: allLevels },
];

export function coursesByDomain(key: AcademyDomain): Course[] {
  return courses.filter((c) => c.domain === key);
}
export function findCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}
