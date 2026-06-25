export type Lang = "fr" | "ht" | "en" | "es";
export type LangText = Partial<Record<Lang, string>> & { fr: string; en: string };
export type LangTextArray = Partial<Record<Lang, string[]>> & { fr: string[]; en: string[] };

const translations: Record<string, Record<Lang, string>> = {
  appName: { fr: "KONEKSYON PAM", ht: "KONEKSYON PAM", en: "KONEKSYON PAM", es: "KONEKSYON PAM" },
  tagline: { fr: "Connectés par la foi", ht: "Konekte pa lafwa", en: "Connected by faith", es: "Conectados por la fe" },
  verseOfDay: { fr: "Verset du jour", ht: "Vèsè jou a", en: "Verse of the day", es: "Versículo del día" },
  psalms: { fr: "Psaumes", ht: "Sòm", en: "Psalms", es: "Salmos" },
  prayers: { fr: "Demandes de prière", ht: "Demann lapriyè", en: "Prayer requests", es: "Peticiones de oración" },
  testimonies: { fr: "Témoignages", ht: "Temwayaj", en: "Testimonies", es: "Testimonios" },
  prayerButton: { fr: "J'ai prié 🙏", ht: "Mwen priye 🙏", en: "I prayed 🙏", es: "He orado 🙏" },
  peoplePrayed: { fr: "personnes ont prié", ht: "moun te priye", en: "people prayed", es: "personas oraron" },
  submitPrayer: { fr: "Soumettre une demande de prière", ht: "Soumèt yon demann lapriyè", en: "Submit a prayer request", es: "Enviar una petición de oración" },
  yourName: { fr: "Votre nom (ou anonyme)", ht: "Non ou (oswa anonim)", en: "Your name (or anonymous)", es: "Tu nombre (o anónimo)" },
  yourPrayer: { fr: "Écrivez votre demande de prière...", ht: "Ekri demann lapriyè ou...", en: "Write your prayer request...", es: "Escribe tu petición de oración..." },
  submit: { fr: "Envoyer", ht: "Voye", en: "Submit", es: "Enviar" },
  shareTestimony: { fr: "Partager un témoignage", ht: "Pataje yon temwayaj", en: "Share a testimony", es: "Compartir un testimonio" },
  yourTestimony: { fr: "Racontez ce que Dieu a fait dans votre vie...", ht: "Rakonte sa Bondye fè nan lavi ou...", en: "Tell us what God has done in your life...", es: "Cuéntanos lo que Dios ha hecho en tu vida..." },
  listen: { fr: "Écouter", ht: "Koute", en: "Listen", es: "Escuchar" },
  read: { fr: "Lire", ht: "Li", en: "Read", es: "Leer" },
  share: { fr: "Partager", ht: "Pataje", en: "Share", es: "Compartir" },
  countries: { fr: "pays connectés", ht: "peyi konekte", en: "countries connected", es: "países conectados" },
  home: { fr: "Accueil", ht: "Akèy", en: "Home", es: "Inicio" },
  anonymous: { fr: "Anonyme", ht: "Anonim", en: "Anonymous", es: "Anónimo" },
  prayWithMe: { fr: "Priez avec moi", ht: "Priye avèk mwen", en: "Pray with me", es: "Ora conmigo" },
  amen: { fr: "Amen", ht: "Amèn", en: "Amen", es: "Amén" },
  connectedNow: { fr: "connectés maintenant", ht: "konekte kounye a", en: "connected now", es: "conectados ahora" },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] || translations[key]?.["fr"] || key;
}
