// COURS D'ANGLAIS BIBLIQUE — parcours type « Duolingo chrétien ».
//
// On apprend l'anglais À TRAVERS la Bible. Public : francophone / créolophone,
// du grand débutant au niveau avancé.
//
// AJOUTER UNE LEÇON = ajouter un THÈME (8 mots + 5 phrases + un verset).
// Les exercices sont ensuite FABRIQUÉS automatiquement par buildLesson() :
// association, choix, phrase à reconstituer, texte à trou, écoute. On garde
// ainsi une qualité constante sans écrire des milliers de lignes à la main.

export type Lang = "fr" | "ht";
export interface Bi { fr: string; ht: string }

export type Exercise =
  | { t: "build"; ask: Bi; en: string; extra?: string[] }
  | { t: "choose"; ask: Bi; options: string[]; correct: number }
  | { t: "fill"; before: string; after: string; options: string[]; correct: number; hint: Bi }
  | { t: "match"; pairs: { en: string; fr: string; ht: string }[] }
  | { t: "listen"; en: string; options: string[]; correct: number };

import { GENERAL_UNITS } from "./english-general";

export type Path = "general" | "chretien";
export type Cefr = "a1" | "a2" | "b1" | "b2" | "c1" | "c2";
/** Conservé pour compatibilité : les unités chrétiennes portaient ces niveaux. */
export type Level = "debutant" | "intermediaire" | "avance";

/** Un mot : anglais, français, créole. */
type W = [string, string, string];
/** Une phrase : anglais, français, créole. */
type S = [string, string, string];

interface Theme {
  slug: string;
  title: Bi;
  icon: string;
  verse: { en: string; fr: string; ref: string };
  words: W[];       // 8 recommandés
  sentences: S[];   // 5 recommandées
}

export interface Lesson {
  slug: string;
  title: Bi;
  icon: string;
  verse: { en: string; fr: string; ref: string };
  exercises: Exercise[];
}

export interface Unit {
  slug: string;
  path: Path;
  cefr: Cefr;
  level: Level;
  title: Bi;
  subtitle: Bi;
  color: string;
  icon: string;
  lessons: Lesson[];
}

export const XP_PER_EXERCISE = 10;
export const HEARTS = 5;

export const PATHS: { key: Path; title: Bi; desc: Bi; color: string; icon: string }[] = [
  { key: "general", icon: "🌍", color: "#2563eb",
    title: { fr: "Anglais général", ht: "Anglè jeneral" },
    desc: { fr: "La vie de tous les jours : travail, santé, voyage, achats.", ht: "Lavi chak jou : travay, sante, vwayaj, acha." } },
  { key: "chretien", icon: "✝️", color: "#16a34a",
    title: { fr: "Anglais chrétien", ht: "Anglè kretyen" },
    desc: { fr: "La Bible, l'Église, la prière et le ministère.", ht: "Bib la, legliz, lapriyè ak ministè." } },
];

/** Les six niveaux du cadre européen, de grand débutant à courant. */
export const CEFR: { key: Cefr; title: Bi; color: string; icon: string }[] = [
  { key: "a1", title: { fr: "A1 · Grand débutant", ht: "A1 · Gran debitan" }, color: "#16a34a", icon: "🌱" },
  { key: "a2", title: { fr: "A2 · Élémentaire", ht: "A2 · Elemantè" }, color: "#0891b2", icon: "🌿" },
  { key: "b1", title: { fr: "B1 · Intermédiaire", ht: "B1 · Entèmedyè" }, color: "#2563eb", icon: "🔥" },
  { key: "b2", title: { fr: "B2 · Avancé", ht: "B2 · Avanse" }, color: "#7c3aed", icon: "⚡" },
  { key: "c1", title: { fr: "C1 · Autonome", ht: "C1 · Otonòm" }, color: "#c026d3", icon: "👑" },
  { key: "c2", title: { fr: "C2 · Courant", ht: "C2 · Kouran" }, color: "#e6b83c", icon: "🏆" },
];

export const LEVELS = CEFR; // ancien nom, gardé pour ne rien casser

// ── Fabrique d'exercices ─────────────────────────────────────────────────────

// Tirage déterministe : la même leçon donne toujours les mêmes exercices.
function rnd(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
}

// Mots pièges : ressemblent au bon mot, pour forcer la lecture attentive.
const DECOYS = [
  "world", "word", "work", "walk", "well", "will", "with", "wish", "want", "wait",
  "have", "hear", "here", "help", "hold", "home", "hope", "holy", "hour", "heart",
  "give", "live", "love", "life", "light", "like", "lead", "learn", "listen", "long",
  "come", "call", "care", "carry", "clean", "close", "cross", "crown", "child", "choose",
  "praise", "peace", "power", "pray", "place", "path", "part", "pure", "poor", "promise",
];

function pickDecoys(correct: string, pool: string[], seed: string, n: number): string[] {
  const r = rnd(seed);
  const bag = [...pool.filter((w) => w.toLowerCase() !== correct.toLowerCase()), ...DECOYS]
    .filter((w) => w.toLowerCase() !== correct.toLowerCase());
  const out: string[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < n && guard++ < 400) {
    const w = bag[Math.floor(r() * bag.length)];
    if (w && !seen.has(w.toLowerCase())) { seen.add(w.toLowerCase()); out.push(w); }
  }
  return out;
}

function shuffleWithAnswer(correct: string, others: string[], seed: string) {
  const r = rnd(seed + ":o");
  const all = [correct, ...others];
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return { options: all, correct: all.indexOf(correct) };
}

/** Le mot « porteur » d'une phrase : le plus long, donc le plus significatif. */
function keyWord(en: string): string {
  return [...en.replace(/[.,!?]/g, "").split(" ")].sort((a, b) => b.length - a.length)[0] ?? en;
}

function buildLesson(th: Theme): Lesson {
  const wordPool = th.words.map((w) => w[0]);
  const ex: Exercise[] = [];

  // 1) Associer 4 mots à leur traduction.
  ex.push({ t: "match", pairs: th.words.slice(0, 4).map(([en, fr, ht]) => ({ en, fr, ht })) });

  // 2) Choisir la traduction anglaise de deux mots.
  for (const [en, fr, ht] of [th.words[4] ?? th.words[0], th.words[5] ?? th.words[1]]) {
    const { options, correct } = shuffleWithAnswer(en, pickDecoys(en, wordPool, th.slug + en, 3), th.slug + en);
    ex.push({ t: "choose", ask: { fr, ht }, options, correct });
  }

  // 3) Reconstituer deux phrases.
  for (const [en, fr, ht] of th.sentences.slice(0, 2)) {
    ex.push({ t: "build", ask: { fr, ht }, en, extra: pickDecoys(en, wordPool, th.slug + en, 2) });
  }

  // 4) Texte à trou sur une phrase.
  const [fEn, fFr, fHt] = th.sentences[2] ?? th.sentences[0];
  const kw = keyWord(fEn);
  const idx = fEn.indexOf(kw);
  const { options: fo, correct: fc } = shuffleWithAnswer(kw, pickDecoys(kw, wordPool, th.slug + "fill", 3), th.slug + "fill");
  ex.push({
    t: "fill",
    before: fEn.slice(0, idx),
    after: fEn.slice(idx + kw.length),
    options: fo, correct: fc, hint: { fr: fFr, ht: fHt },
  });

  // 5) Écoute : reconnaître la phrase entendue.
  const [lEn] = th.sentences[3] ?? th.sentences[0];
  const near = th.sentences.filter((s) => s[0] !== lEn).slice(0, 3).map((s) => s[0]);
  const { options: lo, correct: lc } = shuffleWithAnswer(lEn, near.length >= 3 ? near : [...near, ...pickDecoys(lEn, wordPool, th.slug + "l", 3 - near.length)], th.slug + "listen");
  ex.push({ t: "listen", en: lEn, options: lo, correct: lc });

  // 6) Une dernière phrase à reconstituer, pour finir sur du concret.
  const last = th.sentences[4] ?? th.sentences[th.sentences.length - 1];
  ex.push({ t: "build", ask: { fr: last[1], ht: last[2] }, en: last[0], extra: pickDecoys(last[0], wordPool, th.slug + "z", 2) });

  return { slug: th.slug, title: th.title, icon: th.icon, verse: th.verse, exercises: ex };
}

// ── LE CONTENU ───────────────────────────────────────────────────────────────

const T = (
  slug: string, fr: string, ht: string, icon: string,
  verse: { en: string; fr: string; ref: string },
  words: W[], sentences: S[],
): Theme => ({ slug, title: { fr, ht }, icon, verse, words, sentences });

interface UnitDef { slug: string; level: Level; cefr?: Cefr; fr: string; ht: string; sfr: string; sht: string; color: string; icon: string; themes: Theme[] }

const UNIT_DEFS: UnitDef[] = [
  // ═══════════ NIVEAU DÉBUTANT ═══════════
  {
    slug: "dieu-creation", level: "debutant", color: "#16a34a", icon: "🌍",
    fr: "Dieu et la création", ht: "Bondye ak kreyasyon an",
    sfr: "Tes tout premiers mots d'anglais", sht: "Premye mo anglè ou yo",
    themes: [
      T("dieu-est-amour", "Dieu est amour", "Bondye se lanmou", "❤️",
        { en: "God is love.", fr: "Dieu est amour.", ref: "1 John 4:8" },
        [["God", "Dieu", "Bondye"], ["love", "amour", "lanmou"], ["good", "bon", "bon"], ["great", "grand", "gran"],
         ["is", "est", "se"], ["my", "mon", "mwen"], ["the", "le", "la"], ["and", "et", "ak"]],
        [["God is love", "Dieu est amour", "Bondye se lanmou"],
         ["God is good", "Dieu est bon", "Bondye bon"],
         ["My God is great", "Mon Dieu est grand", "Bondye mwen gran"],
         ["God is my love", "Dieu est mon amour", "Bondye se lanmou mwen"],
         ["God is good and great", "Dieu est bon et grand", "Bondye bon e gran"]]),
      T("le-createur", "Le Créateur", "Kreyatè a", "✨",
        { en: "In the beginning God created the heaven and the earth.", fr: "Au commencement, Dieu créa les cieux et la terre.", ref: "Genesis 1:1" },
        [["heaven", "ciel", "syèl"], ["earth", "terre", "tè"], ["light", "lumière", "limyè"], ["day", "jour", "jou"],
         ["night", "nuit", "nwit"], ["water", "eau", "dlo"], ["created", "créa", "kreye"], ["beginning", "commencement", "kòmansman"]],
        [["God created the light", "Dieu créa la lumière", "Bondye kreye limyè a"],
         ["God created the earth", "Dieu créa la terre", "Bondye kreye tè a"],
         ["The light is good", "La lumière est bonne", "Limyè a bon"],
         ["God created the day and the night", "Dieu créa le jour et la nuit", "Bondye kreye jou a ak nwit la"],
         ["The earth is the Lord's", "La terre est à l'Éternel", "Tè a se pou Senyè a"]]),
      T("je-suis-tu-es", "Je suis, tu es", "Mwen se, ou se", "🗣️",
        { en: "I am the light of the world.", fr: "Je suis la lumière du monde.", ref: "John 8:12" },
        [["I", "je", "mwen"], ["you", "tu", "ou"], ["am", "suis", "se"], ["are", "es", "ye"],
         ["we", "nous", "nou"], ["they", "ils", "yo"], ["he", "il", "li"], ["world", "monde", "lemonn"]],
        [["I am the light", "Je suis la lumière", "Mwen se limyè a"],
         ["You are my God", "Tu es mon Dieu", "Ou se Bondye mwen"],
         ["I am the light of the world", "Je suis la lumière du monde", "Mwen se limyè lemonn nan"],
         ["We are the children of God", "Nous sommes les enfants de Dieu", "Nou se pitit Bondye"],
         ["He is my Lord", "Il est mon Seigneur", "Li se Senyè mwen"]]),
      T("merci-seigneur", "Merci, Seigneur", "Mèsi, Senyè", "🙏",
        { en: "Give thanks unto the Lord, for he is good.", fr: "Louez l'Éternel, car il est bon.", ref: "Psalm 136:1" },
        [["thanks", "merci", "mèsi"], ["Lord", "Seigneur", "Senyè"], ["give", "donner", "bay"], ["heart", "cœur", "kè"],
         ["praise", "louange", "lwanj"], ["sing", "chanter", "chante"], ["always", "toujours", "toujou"], ["name", "nom", "non"]],
        [["Thank you Lord", "Merci Seigneur", "Mèsi Senyè"],
         ["Give thanks to the Lord", "Louez l'Éternel", "Fè lwanj Senyè a"],
         ["My heart is for God", "Mon cœur est à Dieu", "Kè mwen se pou Bondye"],
         ["I praise your name", "Je loue ton nom", "Mwen fè lwanj non ou"],
         ["I sing to the Lord always", "Je chante toujours à l'Éternel", "Mwen chante pou Senyè a toujou"]]),
    ],
  },
  {
    slug: "priere-foi", level: "debutant", color: "#0891b2", icon: "🕊️",
    fr: "La prière et la foi", ht: "Lapriyè ak lafwa",
    sfr: "Parler à Dieu en anglais", sht: "Pale ak Bondye an anglè",
    themes: [
      T("notre-pere", "Notre Père", "Papa nou", "👑",
        { en: "Our Father which art in heaven, hallowed be thy name.", fr: "Notre Père qui es aux cieux, que ton nom soit sanctifié.", ref: "Matthew 6:9" },
        [["Father", "Père", "Papa"], ["our", "notre", "nou"], ["name", "nom", "non"], ["holy", "saint", "sen"],
         ["kingdom", "royaume", "wayòm"], ["will", "volonté", "volonte"], ["bread", "pain", "pen"], ["today", "aujourd'hui", "jodi a"]],
        [["Our Father in heaven", "Notre Père aux cieux", "Papa nou ki nan syèl la"],
         ["Your name is holy", "Ton nom est saint", "Non ou sen"],
         ["Your kingdom come", "Que ton règne vienne", "Se pou wayòm ou vini"],
         ["Give us our bread today", "Donne-nous notre pain aujourd'hui", "Ban nou pen nou jodi a"],
         ["Our Father is good", "Notre Père est bon", "Papa nou bon"]]),
      T("prier-chaque-jour", "Prier chaque jour", "Priye chak jou", "🌅",
        { en: "Pray without ceasing.", fr: "Priez sans cesse.", ref: "1 Thessalonians 5:17" },
        [["pray", "prier", "priye"], ["every", "chaque", "chak"], ["morning", "matin", "maten"], ["evening", "soir", "aswè"],
         ["together", "ensemble", "ansanm"], ["quiet", "calme", "trankil"], ["ask", "demander", "mande"], ["listen", "écouter", "koute"]],
        [["I pray every day", "Je prie chaque jour", "Mwen priye chak jou"],
         ["We pray together", "Nous prions ensemble", "Nou priye ansanm"],
         ["I pray every morning", "Je prie chaque matin", "Mwen priye chak maten"],
         ["Pray without ceasing", "Priez sans cesse", "Priye san rete"],
         ["I ask and God listens", "Je demande et Dieu écoute", "Mwen mande e Bondye koute"]]),
      T("la-foi", "La foi", "Lafwa", "⛰️",
        { en: "Faith is the substance of things hoped for.", fr: "La foi est une ferme assurance des choses qu'on espère.", ref: "Hebrews 11:1" },
        [["faith", "foi", "lafwa"], ["hope", "espérance", "espwa"], ["believe", "croire", "kwè"], ["strong", "fort", "fò"],
         ["fear", "peur", "pè"], ["trust", "confiance", "konfyans"], ["mountain", "montagne", "mòn"], ["move", "déplacer", "deplase"]],
        [["I believe in God", "Je crois en Dieu", "Mwen kwè nan Bondye"],
         ["My faith is strong", "Ma foi est forte", "Lafwa mwen fò"],
         ["Do not fear", "N'aie pas peur", "Pa pè"],
         ["I trust in the Lord", "Je me confie en l'Éternel", "Mwen mete konfyans mwen nan Senyè a"],
         ["Faith can move a mountain", "La foi peut déplacer une montagne", "Lafwa ka deplase yon mòn"]]),
      T("dieu-ecoute", "Dieu écoute", "Bondye koute", "👂",
        { en: "The Lord hears my voice.", fr: "L'Éternel entend ma voix.", ref: "Psalm 116:1" },
        [["hear", "entendre", "tande"], ["voice", "voix", "vwa"], ["call", "appeler", "rele"], ["answer", "répondre", "reponn"],
         ["prayer", "prière", "lapriyè"], ["near", "proche", "toupre"], ["speak", "parler", "pale"], ["word", "parole", "pawòl"]],
        [["God hears my voice", "Dieu entend ma voix", "Bondye tande vwa mwen"],
         ["I call his name", "J'appelle son nom", "Mwen rele non li"],
         ["The Lord hears my prayer", "L'Éternel entend ma prière", "Senyè a tande lapriyè mwen"],
         ["God is near to me", "Dieu est proche de moi", "Bondye toupre mwen"],
         ["He answers when I call", "Il répond quand j'appelle", "Li reponn lè m rele"]]),
    ],
  },
  {
    slug: "eglise-famille", level: "debutant", color: "#d97706", icon: "⛪",
    fr: "L'Église et la famille", ht: "Legliz ak fanmi",
    sfr: "Vivre ensemble en anglais", sht: "Viv ansanm an anglè",
    themes: [
      T("a-l-eglise", "À l'église", "Nan legliz", "🎵",
        { en: "I was glad when they said, Let us go into the house of the Lord.", fr: "Je suis dans la joie quand on me dit : Allons à la maison de l'Éternel.", ref: "Psalm 122:1" },
        [["church", "église", "legliz"], ["house", "maison", "kay"], ["sing", "chanter", "chante"], ["song", "chant", "chan"],
         ["glad", "joyeux", "kontan"], ["worship", "adorer", "adore"], ["Sunday", "dimanche", "dimanch"], ["people", "peuple", "pèp"]],
        [["We go to church", "Nous allons à l'église", "Nou ale nan legliz"],
         ["I sing for God", "Je chante pour Dieu", "Mwen chante pou Bondye"],
         ["We sing to the Lord", "Nous chantons à l'Éternel", "Nou chante pou Senyè a"],
         ["The house of the Lord is good", "La maison de l'Éternel est bonne", "Kay Senyè a bon"],
         ["The people worship together", "Le peuple adore ensemble", "Pèp la adore ansanm"]]),
      T("la-famille", "La famille", "Fanmi an", "👨‍👩‍👧",
        { en: "As for me and my house, we will serve the Lord.", fr: "Moi et ma maison, nous servirons l'Éternel.", ref: "Joshua 24:15" },
        [["family", "famille", "fanmi"], ["mother", "mère", "manman"], ["father", "père", "papa"], ["child", "enfant", "timoun"],
         ["brother", "frère", "frè"], ["sister", "sœur", "sè"], ["serve", "servir", "sèvi"], ["bless", "bénir", "beni"]],
        [["My family loves God", "Ma famille aime Dieu", "Fanmi mwen renmen Bondye"],
         ["God blesses my house", "Dieu bénit ma maison", "Bondye beni kay mwen"],
         ["We will serve the Lord", "Nous servirons l'Éternel", "Nou va sèvi Senyè a"],
         ["My mother prays for me", "Ma mère prie pour moi", "Manman m priye pou mwen"],
         ["My brother and my sister sing", "Mon frère et ma sœur chantent", "Frè m ak sè m chante"]]),
      T("aimer-son-prochain", "Aimer son prochain", "Renmen pwochen ou", "🤝",
        { en: "Love thy neighbour as thyself.", fr: "Tu aimeras ton prochain comme toi-même.", ref: "Mark 12:31" },
        [["neighbour", "prochain", "pwochen"], ["friend", "ami", "zanmi"], ["help", "aider", "ede"], ["peace", "paix", "lapè"],
         ["kind", "bienveillant", "janti"], ["share", "partager", "pataje"], ["need", "besoin", "bezwen"], ["poor", "pauvre", "pòv"]],
        [["Love your neighbour", "Aime ton prochain", "Renmen pwochen ou"],
         ["Help me please", "Aide-moi s'il te plaît", "Ede m souple"],
         ["My friend needs help", "Mon ami a besoin d'aide", "Zanmi m bezwen èd"],
         ["We share with the poor", "Nous partageons avec les pauvres", "Nou pataje ak pòv yo"],
         ["Be kind to your neighbour", "Sois bienveillant envers ton prochain", "Se pou ou janti ak pwochen ou"]]),
      T("la-paix-de-dieu", "La paix de Dieu", "Lapè Bondye", "🕊️",
        { en: "Peace I leave with you, my peace I give unto you.", fr: "Je vous laisse la paix, je vous donne ma paix.", ref: "John 14:27" },
        [["peace", "paix", "lapè"], ["joy", "joie", "kè kontan"], ["heart", "cœur", "kè"], ["rest", "repos", "repo"],
         ["troubled", "troublé", "twouble"], ["give", "donner", "bay"], ["comfort", "réconfort", "konsolasyon"], ["safe", "en sécurité", "an sekirite"]],
        [["I give you my peace", "Je vous donne ma paix", "Mwen ban nou lapè mwen"],
         ["God gives me peace", "Dieu me donne la paix", "Bondye ban m lapè"],
         ["My heart has joy", "Mon cœur a de la joie", "Kè m gen kè kontan"],
         ["I am safe in God", "Je suis en sécurité en Dieu", "Mwen an sekirite nan Bondye"],
         ["He gives rest to my heart", "Il donne du repos à mon cœur", "Li bay kè m repo"]]),
    ],
  },
  {
    slug: "vie-quotidienne", level: "debutant", color: "#db2777", icon: "🌞",
    fr: "La vie de chaque jour", ht: "Lavi chak jou",
    sfr: "Les mots utiles au quotidien", sht: "Mo itil chak jou",
    themes: [
      T("saluer", "Se saluer", "Di bonjou", "👋",
        { en: "Grace be unto you, and peace.", fr: "Que la grâce et la paix vous soient données.", ref: "1 Corinthians 1:3" },
        [["hello", "bonjour", "bonjou"], ["goodbye", "au revoir", "orevwa"], ["please", "s'il te plaît", "souple"], ["sorry", "pardon", "padon"],
         ["welcome", "bienvenue", "byenveni"], ["how", "comment", "kijan"], ["fine", "bien", "byen"], ["grace", "grâce", "gras"]],
        [["Hello my friend", "Bonjour mon ami", "Bonjou zanmi m"],
         ["How are you", "Comment vas-tu", "Kijan ou ye"],
         ["I am fine thank you", "Je vais bien merci", "Mwen byen mèsi"],
         ["Welcome to our church", "Bienvenue dans notre église", "Byenveni nan legliz nou"],
         ["Grace and peace to you", "Grâce et paix à toi", "Gras ak lapè pou ou"]]),
      T("les-nombres", "Les nombres", "Nonb yo", "🔢",
        { en: "Teach us to number our days.", fr: "Enseigne-nous à bien compter nos jours.", ref: "Psalm 90:12" },
        [["one", "un", "youn"], ["two", "deux", "de"], ["three", "trois", "twa"], ["five", "cinq", "senk"],
         ["seven", "sept", "sèt"], ["ten", "dix", "dis"], ["first", "premier", "premye"], ["many", "beaucoup", "anpil"]],
        [["One God and one Lord", "Un seul Dieu et un seul Seigneur", "Yon sèl Bondye ak yon sèl Senyè"],
         ["Jesus called twelve men", "Jésus appela douze hommes", "Jezi rele douz gason"],
         ["God rested on the seventh day", "Dieu se reposa le septième jour", "Bondye repoze setyèm jou a"],
         ["I have two brothers", "J'ai deux frères", "Mwen gen de frè"],
         ["Many people came to hear him", "Beaucoup de gens vinrent l'écouter", "Anpil moun vin koute l"]]),
      T("les-jours", "Les jours et le temps", "Jou yo ak tan an", "📅",
        { en: "This is the day which the Lord hath made.", fr: "C'est ici la journée que l'Éternel a faite.", ref: "Psalm 118:24" },
        [["today", "aujourd'hui", "jodi a"], ["tomorrow", "demain", "demen"], ["week", "semaine", "semèn"], ["year", "année", "ane"],
         ["time", "temps", "tan"], ["now", "maintenant", "kounye a"], ["soon", "bientôt", "byento"], ["forever", "pour toujours", "pou tout tan"]],
        [["This is the day", "C'est ici le jour", "Se jou sa a"],
         ["I pray today and tomorrow", "Je prie aujourd'hui et demain", "Mwen priye jodi a ak demen"],
         ["God is good all the time", "Dieu est bon en tout temps", "Bondye bon tout tan"],
         ["His love is forever", "Son amour est pour toujours", "Lanmou li se pou tout tan"],
         ["Jesus is coming soon", "Jésus revient bientôt", "Jezi ap vini byento"]]),
      T("la-nourriture", "La nourriture", "Manje a", "🍞",
        { en: "Man shall not live by bread alone.", fr: "L'homme ne vivra pas de pain seulement.", ref: "Matthew 4:4" },
        [["bread", "pain", "pen"], ["water", "eau", "dlo"], ["fish", "poisson", "pwason"], ["eat", "manger", "manje"],
         ["drink", "boire", "bwè"], ["hungry", "affamé", "grangou"], ["food", "nourriture", "manje"], ["table", "table", "tab"]],
        [["Give us our daily bread", "Donne-nous notre pain quotidien", "Ban nou pen chak jou nou"],
         ["Jesus gave them bread and fish", "Jésus leur donna du pain et du poisson", "Jezi ba yo pen ak pwason"],
         ["I am hungry", "J'ai faim", "Mwen grangou"],
         ["We eat together", "Nous mangeons ensemble", "Nou manje ansanm"],
         ["He gives water to the thirsty", "Il donne de l'eau à celui qui a soif", "Li bay moun ki swaf dlo"]]),
    ],
  },

  // ═══════════ NIVEAU INTERMÉDIAIRE ═══════════
  {
    slug: "vie-de-jesus", level: "intermediaire", color: "#2563eb", icon: "✝️",
    fr: "La vie de Jésus", ht: "Lavi Jezi",
    sfr: "Raconter l'Évangile en anglais", sht: "Rakonte Levanjil an anglè",
    themes: [
      T("la-naissance", "La naissance", "Nesans lan", "⭐",
        { en: "For unto you is born this day a Saviour.", fr: "Aujourd'hui vous est né un Sauveur.", ref: "Luke 2:11" },
        [["born", "né", "fèt"], ["Saviour", "Sauveur", "Sovè"], ["star", "étoile", "zetwal"], ["shepherd", "berger", "gadò"],
         ["angel", "ange", "zanj"], ["manger", "mangeoire", "manjwa"], ["wise", "sage", "saj"], ["gift", "cadeau", "kado"]],
        [["A Saviour is born today", "Un Sauveur nous est né aujourd'hui", "Yon Sovè fèt pou nou jodi a"],
         ["The shepherds saw the star", "Les bergers virent l'étoile", "Gadò yo wè zetwal la"],
         ["The angel spoke to Mary", "L'ange parla à Marie", "Zanj lan pale ak Mari"],
         ["The wise men brought gifts", "Les mages apportèrent des cadeaux", "Nonm saj yo pote kado"],
         ["They found the child in a manger", "Ils trouvèrent l'enfant dans une mangeoire", "Yo jwenn timoun nan nan yon manjwa"]]),
      T("les-miracles", "Les miracles", "Mirak yo", "🌊",
        { en: "Jesus said, Peace, be still.", fr: "Jésus dit : Silence ! tais-toi !", ref: "Mark 4:39" },
        [["miracle", "miracle", "mirak"], ["heal", "guérir", "geri"], ["blind", "aveugle", "avèg"], ["walk", "marcher", "mache"],
         ["storm", "tempête", "tanpèt"], ["still", "calme", "trankil"], ["touch", "toucher", "manyen"], ["amazed", "étonné", "sezi"]],
        [["Jesus healed the blind man", "Jésus guérit l'aveugle", "Jezi geri avèg la"],
         ["He calmed the storm", "Il calma la tempête", "Li kalme tanpèt la"],
         ["The people were amazed", "Les gens étaient étonnés", "Moun yo te sezi"],
         ["He touched her hand and she rose", "Il toucha sa main et elle se leva", "Li manyen men l epi li leve"],
         ["The man could walk again", "L'homme put marcher de nouveau", "Nonm nan te ka mache ankò"]]),
      T("les-paraboles", "Les paraboles", "Parabòl yo", "🌾",
        { en: "A sower went out to sow his seed.", fr: "Un semeur sortit pour semer sa semence.", ref: "Luke 8:5" },
        [["parable", "parabole", "parabòl"], ["seed", "semence", "semans"], ["sow", "semer", "simen"], ["ground", "terre", "tè"],
         ["grow", "grandir", "grandi"], ["fruit", "fruit", "fwi"], ["lost", "perdu", "pèdi"], ["found", "trouvé", "jwenn"]],
        [["A sower went out to sow", "Un semeur sortit pour semer", "Yon simenè soti pou l simen"],
         ["The seed fell on good ground", "La semence tomba dans la bonne terre", "Semans lan tonbe nan bon tè"],
         ["The seed grew and gave fruit", "La semence grandit et donna du fruit", "Semans lan grandi e li bay fwi"],
         ["The son was lost and is found", "Le fils était perdu et il est retrouvé", "Pitit la te pèdi e li jwenn"],
         ["Jesus taught them in parables", "Jésus leur enseignait en paraboles", "Jezi te anseye yo an parabòl"]]),
      T("la-croix", "La croix", "Kwa a", "✝️",
        { en: "For God so loved the world, that he gave his only begotten Son.", fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique.", ref: "John 3:16" },
        [["cross", "croix", "kwa"], ["Son", "Fils", "Pitit"], ["die", "mourir", "mouri"], ["rose", "ressuscité", "leve"],
         ["sin", "péché", "peche"], ["forgive", "pardonner", "padone"], ["save", "sauver", "sove"], ["eternal", "éternel", "etènèl"]],
        [["God gave his only Son", "Dieu a donné son Fils unique", "Bondye bay sèl Pitit li"],
         ["Jesus died on the cross", "Jésus mourut sur la croix", "Jezi mouri sou kwa a"],
         ["He rose on the third day", "Il ressuscita le troisième jour", "Li leve twazyèm jou a"],
         ["He forgives our sins", "Il pardonne nos péchés", "Li padone peche nou yo"],
         ["We have eternal life in him", "Nous avons la vie éternelle en lui", "Nou gen lavi etènèl nan li"]]),
    ],
  },
  {
    slug: "caractere-chretien", level: "intermediaire", color: "#0d9488", icon: "🌿",
    fr: "Le caractère chrétien", ht: "Karaktè kretyen an",
    sfr: "Décrire les qualités du cœur", sht: "Dekri kalite kè a",
    themes: [
      T("le-fruit-de-esprit", "Le fruit de l'Esprit", "Fwi Lespri a", "🍇",
        { en: "The fruit of the Spirit is love, joy, peace.", fr: "Le fruit de l'Esprit est amour, joie, paix.", ref: "Galatians 5:22" },
        [["patience", "patience", "pasyans"], ["kindness", "bonté", "bonte"], ["gentle", "doux", "dous"], ["faithful", "fidèle", "fidèl"],
         ["self-control", "maîtrise de soi", "kontwòl tèt"], ["Spirit", "Esprit", "Lespri"], ["fruit", "fruit", "fwi"], ["grow", "grandir", "grandi"]],
        [["The fruit of the Spirit is love", "Le fruit de l'Esprit est amour", "Fwi Lespri a se lanmou"],
         ["Patience is a gift from God", "La patience est un don de Dieu", "Pasyans se yon kado Bondye"],
         ["Be gentle and kind", "Sois doux et bienveillant", "Se pou ou dous e janti"],
         ["God is faithful to his people", "Dieu est fidèle envers son peuple", "Bondye fidèl ak pèp li"],
         ["We grow in the Spirit each day", "Nous grandissons dans l'Esprit chaque jour", "Nou grandi nan Lespri a chak jou"]]),
      T("humilite-service", "Humilité et service", "Imilite ak sèvis", "🧎",
        { en: "Whosoever will be great among you, let him be your servant.", fr: "Quiconque veut être grand parmi vous, qu'il soit votre serviteur.", ref: "Matthew 20:26" },
        [["humble", "humble", "enb"], ["servant", "serviteur", "sèvitè"], ["wash", "laver", "lave"], ["feet", "pieds", "pye"],
         ["proud", "orgueilleux", "ògeye"], ["last", "dernier", "dènye"], ["greatest", "le plus grand", "pi gran an"], ["obey", "obéir", "obeyi"]],
        [["Jesus washed their feet", "Jésus lava leurs pieds", "Jezi lave pye yo"],
         ["Be humble before God", "Sois humble devant Dieu", "Se pou ou enb devan Bondye"],
         ["The servant is the greatest", "Le serviteur est le plus grand", "Sèvitè a se pi gran an"],
         ["He who is last will be first", "Celui qui est dernier sera premier", "Sa ki dènye a ap premye"],
         ["We obey the word of God", "Nous obéissons à la parole de Dieu", "Nou obeyi pawòl Bondye"]]),
      T("le-pardon", "Le pardon", "Padon an", "🕊️",
        { en: "Forgive us our debts, as we forgive our debtors.", fr: "Pardonne-nous nos offenses, comme nous pardonnons.", ref: "Matthew 6:12" },
        [["forgive", "pardonner", "padone"], ["mercy", "miséricorde", "mizerikòd"], ["anger", "colère", "kòlè"], ["enemy", "ennemi", "lènmi"],
         ["heal", "guérir", "geri"], ["free", "libre", "lib"], ["again", "encore", "ankò"], ["seventy", "soixante-dix", "swasanndis"]],
        [["Forgive us our debts", "Pardonne-nous nos offenses", "Padone nou dèt nou yo"],
         ["We forgive our enemies", "Nous pardonnons à nos ennemis", "Nou padone lènmi nou yo"],
         ["God is rich in mercy", "Dieu est riche en miséricorde", "Bondye rich nan mizerikòd"],
         ["Forgiveness makes the heart free", "Le pardon rend le cœur libre", "Padon fè kè a lib"],
         ["Forgive seventy times seven", "Pardonne septante fois sept fois", "Padone swasanndis fwa sèt fwa"]]),
      T("la-sagesse", "La sagesse", "Sajès la", "🦉",
        { en: "The fear of the Lord is the beginning of wisdom.", fr: "La crainte de l'Éternel est le commencement de la sagesse.", ref: "Proverbs 9:10" },
        [["wisdom", "sagesse", "sajès"], ["understand", "comprendre", "konprann"], ["teach", "enseigner", "anseye"], ["learn", "apprendre", "aprann"],
         ["truth", "vérité", "verite"], ["foolish", "insensé", "moun sòt"], ["counsel", "conseil", "konsèy"], ["knowledge", "connaissance", "konesans"]],
        [["The fear of the Lord is wisdom", "La crainte de l'Éternel est la sagesse", "Krent Senyè a se sajès"],
         ["Teach me your truth", "Enseigne-moi ta vérité", "Anseye m verite ou"],
         ["I want to understand your word", "Je veux comprendre ta parole", "Mwen vle konprann pawòl ou"],
         ["Wisdom is better than gold", "La sagesse vaut mieux que l'or", "Sajès pi bon pase lò"],
         ["We learn from good counsel", "Nous apprenons du bon conseil", "Nou aprann nan bon konsèy"]]),
    ],
  },

  // ═══════════ NIVEAU AVANCÉ ═══════════
  {
    slug: "temoigner", level: "avance", color: "#7c3aed", icon: "📢",
    fr: "Témoigner et servir", ht: "Temwaye ak sèvi",
    sfr: "Parler de sa foi avec aisance", sht: "Pale de lafwa ou alèz",
    themes: [
      T("mon-temoignage", "Mon témoignage", "Temwayaj mwen", "🗣️",
        { en: "Be ready always to give an answer of the hope that is in you.", fr: "Soyez toujours prêts à rendre compte de l'espérance qui est en vous.", ref: "1 Peter 3:15" },
        [["testimony", "témoignage", "temwayaj"], ["ready", "prêt", "pare"], ["answer", "réponse", "repons"], ["reason", "raison", "rezon"],
         ["changed", "changé", "chanje"], ["before", "avant", "anvan"], ["since", "depuis", "depi"], ["share", "partager", "pataje"]],
        [["I am ready to share my testimony", "Je suis prêt à partager mon témoignage", "Mwen pare pou pataje temwayaj mwen"],
         ["God changed my life", "Dieu a changé ma vie", "Bondye chanje lavi mwen"],
         ["Before I did not believe", "Avant, je ne croyais pas", "Anvan, mwen pa t kwè"],
         ["Since that day I follow him", "Depuis ce jour je le suis", "Depi jou sa a mwen swiv li"],
         ["I can give an answer for my hope", "Je peux rendre compte de mon espérance", "Mwen ka bay yon repons pou espwa mwen"]]),
      T("la-mission", "La mission", "Misyon an", "🌍",
        { en: "Go ye therefore, and teach all nations.", fr: "Allez, faites de toutes les nations des disciples.", ref: "Matthew 28:19" },
        [["mission", "mission", "misyon"], ["nation", "nation", "nasyon"], ["disciple", "disciple", "disip"], ["gospel", "évangile", "levanjil"],
         ["send", "envoyer", "voye"], ["preach", "prêcher", "preche"], ["harvest", "moisson", "rekòt"], ["laborer", "ouvrier", "travayè"]],
        [["Go and teach all nations", "Allez et enseignez toutes les nations", "Ale epi anseye tout nasyon yo"],
         ["The gospel is for every nation", "L'Évangile est pour chaque nation", "Levanjil la se pou chak nasyon"],
         ["The harvest is great", "La moisson est grande", "Rekòt la gran"],
         ["Send laborers into your harvest", "Envoie des ouvriers dans ta moisson", "Voye travayè nan rekòt ou"],
         ["We preach the word with joy", "Nous prêchons la parole avec joie", "Nou preche pawòl la ak kè kontan"]]),
      T("l-esperance", "L'espérance", "Espwa a", "🌄",
        { en: "They that wait upon the Lord shall renew their strength.", fr: "Ceux qui se confient en l'Éternel renouvellent leur force.", ref: "Isaiah 40:31" },
        [["strength", "force", "fòs"], ["renew", "renouveler", "renouvle"], ["wait", "attendre", "tann"], ["weary", "fatigué", "fatige"],
         ["run", "courir", "kouri"], ["wings", "ailes", "zèl"], ["promise", "promesse", "pwomès"], ["future", "avenir", "avni"]],
        [["They that wait shall renew their strength", "Ceux qui attendent renouvellent leur force", "Sa k ap tann yo ap renouvle fòs yo"],
         ["I am weary but God gives me strength", "Je suis fatigué mais Dieu me donne la force", "Mwen fatige men Bondye ban m fòs"],
         ["They shall run and not be weary", "Ils courront sans se fatiguer", "Y ap kouri san yo pa fatige"],
         ["God keeps his promise", "Dieu tient sa promesse", "Bondye kenbe pwomès li"],
         ["Our future is in his hands", "Notre avenir est entre ses mains", "Avni nou nan men li"]]),
      T("la-perseverance", "La persévérance", "Pèseverans", "🏃",
        { en: "I have fought a good fight, I have finished my course.", fr: "J'ai combattu le bon combat, j'ai achevé la course.", ref: "2 Timothy 4:7" },
        [["fight", "combat", "batay"], ["finish", "achever", "fini"], ["race", "course", "kous"], ["keep", "garder", "kenbe"],
         ["crown", "couronne", "kouwòn"], ["reward", "récompense", "rekonpans"], ["endure", "endurer", "andire"], ["victory", "victoire", "viktwa"]],
        [["I have fought a good fight", "J'ai combattu le bon combat", "Mwen batay bon batay la"],
         ["I have finished the race", "J'ai achevé la course", "Mwen fini kous la"],
         ["I have kept the faith", "J'ai gardé la foi", "Mwen kenbe lafwa"],
         ["A crown of life is my reward", "Une couronne de vie est ma récompense", "Yon kouwòn lavi se rekonpans mwen"],
         ["We endure and God gives the victory", "Nous endurons et Dieu donne la victoire", "Nou andire e Bondye bay viktwa a"]]),
    ],
  },
];

// Correspondance entre l'ancien étiquetage et le cadre européen.
const LEVEL_TO_CEFR: Record<Level, Cefr> = { debutant: "a1", intermediaire: "b1", avance: "b2" };

const CHRISTIAN_UNITS: Unit[] = UNIT_DEFS.map((u) => ({
  slug: u.slug,
  path: "chretien" as Path,
  cefr: u.cefr ?? LEVEL_TO_CEFR[u.level],
  level: u.level,
  title: { fr: u.fr, ht: u.ht },
  subtitle: { fr: u.sfr, ht: u.sht },
  color: u.color,
  icon: u.icon,
  lessons: u.themes.map(buildLesson),
}));

// ── Parcours ANGLAIS GÉNÉRAL (données dans lib/english-general.ts) ───────────

const CEFR_TO_LEVEL: Record<Cefr, Level> = {
  a1: "debutant", a2: "debutant", b1: "intermediaire", b2: "intermediaire", c1: "avance", c2: "avance",
};

const GENERAL: Unit[] = GENERAL_UNITS.map((u) => ({
  slug: u.slug,
  path: "general" as Path,
  cefr: u.cefr,
  level: CEFR_TO_LEVEL[u.cefr],
  title: { fr: u.fr, ht: u.ht },
  subtitle: { fr: u.sfr, ht: u.sht },
  color: u.color,
  icon: u.icon,
  lessons: u.themes.map((th) => buildLesson({
    slug: th.slug, title: { fr: th.fr, ht: th.ht }, icon: th.icon,
    verse: th.verse, words: th.words, sentences: th.sentences,
  })),
}));

export const UNITS: Unit[] = [...GENERAL, ...CHRISTIAN_UNITS];

// ── Utilitaires ──────────────────────────────────────────────────────────────

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })));
export const TOTAL_LESSONS = ALL_LESSONS.length;

export function findLesson(slug: string) {
  return ALL_LESSONS.find((l) => l.slug === slug) ?? null;
}

/** Rang d'une leçon dans tout le parcours — sert au verrouillage progressif. */
export function lessonIndex(slug: string): number {
  return ALL_LESSONS.findIndex((l) => l.slug === slug);
}

export function unitsOf(path: Path, cefr: Cefr): Unit[] {
  return UNITS.filter((u) => u.path === path && u.cefr === cefr);
}

/** Les leçons d'un parcours, dans l'ordre — sert au verrouillage progressif. */
export function lessonsOfPath(path: Path) {
  return ALL_LESSONS.filter((l) => l.unit.path === path);
}
