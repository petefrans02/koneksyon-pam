// Demo content — replace individual entries with real DB records as the community grows.
// Pattern: show demo data + real API data merged, demo always fills empty states.

export type Lang = "fr" | "ht" | "en";

// ─── PRAYER CATEGORIES ───────────────────────────────────────────────────────
export const PRAYER_CATEGORIES = {
  "healing":      { fr: "Guérison",        ht: "Gerizon",      en: "Healing",      color: "#7c3aed" },
  "wisdom":       { fr: "Sagesse",          ht: "Sajès",        en: "Wisdom",       color: "#1d4ed8" },
  "family":       { fr: "Famille",          ht: "Fanmi",        en: "Family",       color: "#16a34a" },
  "guidance":     { fr: "Direction",        ht: "Direksyon",    en: "Guidance",     color: "#b45309" },
  "mission":      { fr: "Mission",          ht: "Misyon",       en: "Mission",      color: "#0891b2" },
  "thanksgiving": { fr: "Action de grâce", ht: "Remèsiman",    en: "Thanksgiving", color: "#c5a84f" },
  "peace":        { fr: "Paix",             ht: "Lapè",         en: "Peace",        color: "#059669" },
  "intercession": { fr: "Intercession",     ht: "Entèsesyon",   en: "Intercession", color: "#6d28d9" },
} as const;

export type PrayerCategory = keyof typeof PRAYER_CATEGORIES;

// ─── DEMO PRAYER REQUESTS ────────────────────────────────────────────────────
export interface DemoPrayer {
  id: string;
  name: string;
  flag: string;
  countryName: { fr: string; ht: string; en: string };
  category: PrayerCategory;
  pray_count: number;
  created_at: string;
  featured?: boolean;
  text: { fr: string; ht: string; en: string };
}

const ago = (days: number) => new Date(Date.now() - 86400000 * days).toISOString();

export const DEMO_PRAYERS: DemoPrayer[] = [
  {
    id: "dp1",
    name: "Marie-Claire",
    flag: "🇭🇹",
    countryName: { fr: "Haïti", ht: "Ayiti", en: "Haiti" },
    category: "healing",
    pray_count: 2847,
    created_at: ago(2),
    featured: true,
    text: {
      fr: "Seigneur, guéris mon enfant qui souffre depuis des semaines. Tu es le médecin des médecins. Nous croyons en Ta puissance souveraine. Que Ta volonté soit faite.",
      ht: "Seyè, geri pitit mwen ki ap soufri depi plizyè semèn. Ou se doktè nan doktè. Nou kwè nan pouvwa ou. Ke volonte ou fèt.",
      en: "Lord, heal my child who has been suffering for weeks. You are the doctor of doctors. We believe in Your sovereign power. Let Your will be done.",
    },
  },
  {
    id: "dp2",
    name: "Thomas",
    flag: "🇫🇷",
    countryName: { fr: "France", ht: "Fwans", en: "France" },
    category: "wisdom",
    pray_count: 1432,
    created_at: ago(1),
    featured: true,
    text: {
      fr: "Père céleste, j'ai mes examens finals la semaine prochaine. Accorde-moi la sagesse, la mémoire et la paix. Je remets ce temps entre tes mains. Que ta grâce m'accompagne.",
      ht: "Papa nan syèl, mwen gen egzamen final semèn pwochen. Ban mwen sajès, memwa ak lapè. Mwen mete moman sa a nan men ou. Ke gras ou akonpanye mwen.",
      en: "Heavenly Father, I have my final exams next week. Grant me wisdom, memory and peace. I place this time in Your hands. May Your grace accompany me.",
    },
  },
  {
    id: "dp3",
    name: "Jean-Baptiste",
    flag: "🇨🇦",
    countryName: { fr: "Canada", ht: "Kanada", en: "Canada" },
    category: "family",
    pray_count: 3100,
    created_at: ago(3),
    featured: true,
    text: {
      fr: "Seigneur Jésus, restaure notre famille. Les conflits ont brisé notre foyer depuis deux ans. Tu es Celui qui réconcilie et guérit les cœurs brisés. Ramène la paix parmi nous.",
      ht: "Seyè Jezi, restore fanmi nou. Konfli yo kraze kay nou depi de an. Ou se Moun ki rekonsilye epi ki geri kè kase. Renmèt lapè nan mitan nou.",
      en: "Lord Jesus, restore our family. Conflicts have broken our home for two years. You are the One who reconciles and heals broken hearts. Bring peace among us.",
    },
  },
  {
    id: "dp4",
    name: "Esther",
    flag: "🇨🇮",
    countryName: { fr: "Côte d'Ivoire", ht: "Kòt d'Ivwa", en: "Côte d'Ivoire" },
    category: "guidance",
    pray_count: 987,
    created_at: ago(1),
    text: {
      fr: "Dieu, j'ai 22 ans et je cherche Ta volonté pour ma vie. Quelle carrière ? Quel chemin ? Parle à mon cœur, Seigneur. Que Tes plans pour moi se réalisent selon Jérémie 29:11.",
      ht: "Bondye, mwen gen 22 an epi mwen ap chèche volonte ou pou lavi mwen. Ki karyè ? Ki chemen ? Pale ak kè mwen, Seyè. Ke plan ou pou mwen reyalize selon Jeremi 29:11.",
      en: "God, I am 22 and I am seeking Your will for my life. What career? Which path? Speak to my heart, Lord. Let Your plans for me come to pass according to Jeremiah 29:11.",
    },
  },
  {
    id: "dp5",
    name: "Samuel",
    flag: "🇰🇪",
    countryName: { fr: "Kenya", ht: "Kenya", en: "Kenya" },
    category: "mission",
    pray_count: 2987,
    created_at: ago(3),
    featured: true,
    text: {
      fr: "Père, je pars en mission en zone rurale le mois prochain. Protège mon équipe. Ouvre les cœurs. Que la Parole porte du fruit. Donne-nous la sagesse et la protection du Saint-Esprit.",
      ht: "Papa, mwen ap pati nan misyon nan zòn riral mwa pwochen. Pwoteje ekip mwen. Ouvri kè yo. Ke Pawòl la pote fwi. Ban nou sajès ak pwoteksyon Lespri Sen an.",
      en: "Father, I leave on mission in a rural area next month. Protect my team. Open hearts. Let the Word bear fruit. Give us wisdom and the protection of the Holy Spirit.",
    },
  },
  {
    id: "dp6",
    name: "Christine",
    flag: "🇧🇪",
    countryName: { fr: "Belgique", ht: "Bèljik", en: "Belgium" },
    category: "thanksgiving",
    pray_count: 4120,
    created_at: ago(0),
    featured: true,
    text: {
      fr: "Gloire à Dieu ! Il y a trois mois les médecins m'ont dit que ma guérison était impossible. Aujourd'hui je suis debout et en bonne santé. Jésus-Christ est toujours le même ! Alléluia !",
      ht: "Glwa pou Bondye ! Sa gen twa mwa doktè yo te di mwen gerizon mwen te enposib. Jodi a mwen kanpe epi mwen ansante. Jezi Kris toujou menm ! Alelouya !",
      en: "Glory to God! Three months ago doctors told me my healing was impossible. Today I am standing and in good health. Jesus Christ is still the same! Hallelujah!",
    },
  },
  {
    id: "dp7",
    name: "Pastor David",
    flag: "🇧🇷",
    countryName: { fr: "Brésil", ht: "Brezil", en: "Brazil" },
    category: "intercession",
    pray_count: 5312,
    created_at: ago(5),
    featured: true,
    text: {
      fr: "Seigneur Jésus, verse Ton Esprit sur nos nations. Que le réveil commence dans nos familles, nos écoles, nos gouvernements. Le monde a besoin de Toi maintenant plus que jamais. Amen !",
      ht: "Seyè Jezi, vide Lespri ou sou nasyon nou yo. Ke revèy la kòmanse nan fanmi nou yo, lekòl nou yo, gouvènman nou yo. Mond lan bezwen ou kounye a plis pase tout tan. Amèn !",
      en: "Lord Jesus, pour Your Spirit on our nations. Let revival begin in our families, schools, governments. The world needs You now more than ever. Amen!",
    },
  },
  {
    id: "dp8",
    name: "Claudette",
    flag: "🇭🇹",
    countryName: { fr: "Haïti", ht: "Ayiti", en: "Haiti" },
    category: "peace",
    pray_count: 6234,
    created_at: ago(6),
    featured: true,
    text: {
      fr: "Bon Dieu, touche le peuple haïtien dans cette période difficile. Que la paix revienne. Que les familles soient protégées. Nous T'adorons même dans la tempête. Tu es notre seul refuge.",
      ht: "Bon Dye, touche pèp ayisyen an nan peryòd difisil sa a. Ke lapè tounen. Ke fanmi yo pwoteje. Nou adore ou menm nan tanpèt la. Ou se sèl refij nou.",
      en: "Good God, touch the Haitian people in this difficult time. Let peace return. Let families be protected. We worship You even in the storm. You are our only refuge.",
    },
  },
  {
    id: "dp9",
    name: "Grace",
    flag: "🇳🇬",
    countryName: { fr: "Nigeria", ht: "Nijeria", en: "Nigeria" },
    category: "family",
    pray_count: 4156,
    created_at: ago(1),
    text: {
      fr: "Père Dieu, je prie pour la provision divine pour ma famille. Tu as dit que Tu subviendrais à tous nos besoins selon Tes richesses en gloire. Je te fais confiance, Seigneur.",
      ht: "Papa Bondye, mwen priye pou pwovizyon divine pou fanmi mwen. Ou di ke ou pral ban nou tout bezwen nou yo dapre richès ou nan glwa. Mwen fè ou konfyans, Seyè.",
      en: "Father God, I pray for divine provision for my family. You said You will supply all our needs according to Your riches in glory. I trust You, Lord.",
    },
  },
  {
    id: "dp10",
    name: "Isabelle",
    flag: "🇧🇪",
    countryName: { fr: "Belgique", ht: "Bèljik", en: "Belgium" },
    category: "healing",
    pray_count: 4521,
    created_at: ago(1),
    featured: true,
    text: {
      fr: "Seigneur, guéris ceux qui souffrent de dépression et d'anxiété. Rappelle-leur que Tu es avec eux. Ta présence dissipe toutes les ténèbres. Tu ne nous abandonnes jamais.",
      ht: "Seyè, geri moun ki ap soufri depresyon ak angwas. Raple yo ke ou avèk yo. Prezans ou chase tout fènwa. Ou pa janm abandone nou.",
      en: "Lord, heal those suffering from depression and anxiety. Remind them that You are with them. Your presence dispels all darkness. You never abandon us.",
    },
  },
  {
    id: "dp11",
    name: "Josué",
    flag: "🇨🇩",
    countryName: { fr: "Congo", ht: "Kongo", en: "DR Congo" },
    category: "intercession",
    pray_count: 3721,
    created_at: ago(3),
    text: {
      fr: "Bon Dieu, protège toute la famille chrétienne en République Démocratique du Congo. Que Ta paix règne dans notre pays. Nous T'adorons et reconnaissons Ta souveraineté.",
      ht: "Bon Dye, pwoteje tout fanmi kretyen an Repiblik Demokratik Kongo a. Ke lapè ou renye nan peyi nou. Nou adore ou epi nou rekonèt souverènte ou.",
      en: "Good God, protect the entire Christian family in the Democratic Republic of Congo. Let Your peace reign in our country. We worship You and acknowledge Your sovereignty.",
    },
  },
  {
    id: "dp12",
    name: "Ana",
    flag: "🇲🇽",
    countryName: { fr: "Mexique", ht: "Meksik", en: "Mexico" },
    category: "healing",
    pray_count: 1876,
    created_at: ago(2),
    text: {
      fr: "Mon Dieu, guéris mon corps et restaure ma santé. Tu es mon médecin céleste. Merci pour Ton amour et Ta miséricorde infinie. Je place ma vie entre Tes mains. Amen.",
      ht: "Bondye mwen, geri kò mwen epi restore sante mwen. Ou se doktè selès mwen. Mèsi pou renmen ou ak mizèrikòd ou san limit. Mwen mete lavi mwen nan men ou. Amèn.",
      en: "My God, heal my body and restore my health. You are my heavenly physician. Thank You for Your love and infinite mercy. I place my life in Your hands. Amen.",
    },
  },
];

// ─── DEMO TESTIMONIALS ────────────────────────────────────────────────────────
export interface DemoTestimony {
  id: string;
  name: string;
  flag: string;
  countryName: { fr: string; ht: string; en: string };
  category: { fr: string; ht: string; en: string };
  categoryIcon: string;
  date: string;
  avatarColor: string;
  verse: { fr: string; ht: string; en: string };
  verseText: { fr: string; ht: string; en: string };
  text: { fr: string; ht: string; en: string };
  likes: number;
}

export const DEMO_TESTIMONIES: DemoTestimony[] = [
  {
    id: "dt1",
    name: "Nadine",
    flag: "🇫🇷",
    countryName: { fr: "France", ht: "Fwans", en: "France" },
    category: { fr: "Restauration conjugale", ht: "Restourasyon maryaj", en: "Marital restoration" },
    categoryIcon: "🕊️",
    date: ago(12),
    avatarColor: "#7c3aed",
    verse: { fr: "Ésaïe 54:5", ht: "Ezayi 54:5", en: "Isaiah 54:5" },
    verseText: {
      fr: "Car c'est ton Créateur qui t'épouse, l'Éternel des armées est son nom.",
      ht: "Paske Kreyatè ou a se Mari ou, non li se Seyè dèzame yo.",
      en: "For your Maker is your husband — the Lord Almighty is his name.",
    },
    text: {
      fr: "Mon mari et moi étions au bord du divorce après sept ans de mariage. Nous avions tout essayé sauf Dieu. Un soir, j'ai trouvé KONEKSYON PAM et j'ai commencé à prier sur le mur de prière. Des centaines de frères ont prié avec nous. Trois mois plus tard, mon mari a recommencé à lire la Bible. Aujourd'hui notre mariage est transformé. Ce que l'homme disait impossible, Dieu l'a fait.",
      ht: "Mari mwen ak mwen te sou bò divòs apre sèt an maryaj. Nou te eseye tout bagay eksepte Bondye. Yon swa, mwen jwenn KONEKSYON PAM epi mwen kòmanse priye sou mi lapriyè a. Dè santèn frè te priye avèk nou. Twa mwa pita, mari mwen rekòmanse li Bib la. Jodi a maryaj nou an chanje nèt. Sa moun te di enposib, Bondye fè l.",
      en: "My husband and I were on the verge of divorce after seven years of marriage. We had tried everything except God. One evening, I found KONEKSYON PAM and began praying on the prayer wall. Hundreds of brothers prayed with us. Three months later, my husband began reading the Bible again. Today our marriage is transformed. What man said was impossible, God did.",
    },
    likes: 284,
  },
  {
    id: "dt2",
    name: "Emmanuel",
    flag: "🇨🇲",
    countryName: { fr: "Cameroun", ht: "Kamerun", en: "Cameroon" },
    category: { fr: "Guérison miraculeuse", ht: "Gerizon mirakile", en: "Miraculous healing" },
    categoryIcon: "✨",
    date: ago(8),
    avatarColor: "#059669",
    verse: { fr: "Matthieu 9:35", ht: "Matye 9:35", en: "Matthew 9:35" },
    verseText: {
      fr: "Jésus guérissait toute maladie et toute infirmité.",
      ht: "Jezi t ap geri tout maladi ak tout enfimite.",
      en: "Jesus healed every disease and sickness.",
    },
    text: {
      fr: "En janvier 2026, les médecins m'ont diagnostiqué une tumeur et m'ont donné six mois à vivre. Ma famille a pleuré. Mais quelque chose en moi ne pouvait pas accepter ce verdict. J'ai posté ma demande sur le mur de prière de KONEKSYON PAM. En quatre jours, plus de 2 000 personnes ont prié pour moi. Lors de ma deuxième IRM en mars, le radiologue était stupéfait — la tumeur avait disparu. Dieu est Dieu !",
      ht: "Nan janvye 2026, doktè yo dyagnostike yon timè nan mwen epi yo ba mwen sis mwa pou viv. Fanmi mwen kriye. Men yon bagay nan mwen pa t ka aksepte vèdik sa a. Mwen poste demann mwen sou mi lapriyè KONEKSYON PAM. Nan kat jou, plis pase 2 000 moun priye pou mwen. Nan dezyèm IRM mwen nan mas, radyolojis la te sezi — timè a disparèt. Bondye se Bondye !",
      en: "In January 2026, doctors diagnosed me with a tumor and gave me six months to live. My family wept. But something in me could not accept that verdict. I posted my request on the KONEKSYON PAM prayer wall. Within four days, more than 2,000 people prayed for me. At my second MRI in March, the radiologist was stunned — the tumor had disappeared. God is God!",
    },
    likes: 512,
  },
  {
    id: "dt3",
    name: "Kevin",
    flag: "🇺🇸",
    countryName: { fr: "États-Unis", ht: "Etazini", en: "United States" },
    category: { fr: "Conversion", ht: "Konvèsyon", en: "Conversion" },
    categoryIcon: "🔥",
    date: ago(20),
    avatarColor: "#1d4ed8",
    verse: { fr: "2 Corinthiens 5:17", ht: "2 Korentyen 5:17", en: "2 Corinthians 5:17" },
    verseText: {
      fr: "Si quelqu'un est en Christ, il est une nouvelle créature.",
      ht: "Si yon moun nan Kris la, li se yon nouvo kreyati.",
      en: "If anyone is in Christ, the new creation has come.",
    },
    text: {
      fr: "J'avais 28 ans et je n'avais jamais mis les pieds dans une église. Un ami m'a envoyé un lien vers KONEKSYON PAM. Par curiosité, j'ai joué au jeu biblique. Une question sur Jean 3:16 m'a arrêté net. J'ai lu le verset, puis j'ai lu l'Évangile de Jean en entier. Cette nuit-là, j'ai rencontré Jésus-Christ. Deux mois plus tard, je me suis fait baptiser. Ma vie n'est plus jamais la même.",
      ht: "Mwen te gen 28 an epi mwen pa t janm ale nan yon legliz. Yon zanmi voye yon lyen ban mwen sou KONEKSYON PAM. Paske mwen te kuryè, mwen jwe jwèt biblik la. Yon kesyon sou Jan 3:16 te kanpe mwen nèt. Mwen li vèsè a, apre mwen li Levanjil Jan an antye. Nuit sa a, mwen rankontre Jezi Kris. De mwa pita, mwen batize. Lavi mwen pa janm menm ankò.",
      en: "I was 28 and had never set foot in a church. A friend sent me a link to KONEKSYON PAM. Out of curiosity, I played the Bible game. A question about John 3:16 stopped me cold. I read the verse, then read the entire Gospel of John. That night, I met Jesus Christ. Two months later, I was baptized. My life has never been the same.",
    },
    likes: 378,
  },
  {
    id: "dt4",
    name: "Precious",
    flag: "🇬🇭",
    countryName: { fr: "Ghana", ht: "Gana", en: "Ghana" },
    category: { fr: "Réponse à la prière", ht: "Repons lapriyè", en: "Answered prayer" },
    categoryIcon: "🙏",
    date: ago(5),
    avatarColor: "#b45309",
    verse: { fr: "Psaumes 34:4", ht: "Sòm 34:4", en: "Psalm 34:4" },
    verseText: {
      fr: "J'ai cherché l'Éternel, et il m'a répondu ; il m'a délivré de toutes mes frayeurs.",
      ht: "Mwen chèche Seyè a, li reponn mwen ; li delivre mwen nan tout krent mwen yo.",
      en: "I sought the Lord, and he answered me; he delivered me from all my fears.",
    },
    text: {
      fr: "Pendant trois ans, j'ai prié pour trouver un emploi dans mon domaine. Ma famille commençait à douter. J'ai soumis ma demande au mur de prière. En 48 heures, 847 personnes priaient avec moi. La semaine suivante, j'ai reçu un appel d'une entreprise qui m'avait refusée un an auparavant — ils voulaient me rappeler. Dieu tient ses promesses dans Ses temps parfaits.",
      ht: "Pandan twa an, mwen priye pou jwenn yon travay nan domèn mwen. Fanmi mwen kòmanse doute. Mwen soumèt demann mwen sou mi lapriyè a. Nan 48 èdtan, 847 moun t ap priye avèk mwen. Semèn kap vini an, mwen resevwa yon apèl nan yon konpayi ki te refize mwen yon an anvan — yo vle rele mwen tounen. Bondye kenbe pwomès li nan tan pafè li.",
      en: "For three years I prayed to find a job in my field. My family was starting to doubt. I submitted my request to the prayer wall. Within 48 hours, 847 people were praying with me. The following week, I received a call from a company that had rejected me a year earlier — they wanted to call me back. God keeps His promises in His perfect timing.",
    },
    likes: 206,
  },
  {
    id: "dt5",
    name: "Marie-Claire",
    flag: "🇭🇹",
    countryName: { fr: "Haïti", ht: "Ayiti", en: "Haiti" },
    category: { fr: "Réussite après l'épreuve", ht: "Siksè apre eprèv", en: "Success after trials" },
    categoryIcon: "🌟",
    date: ago(30),
    avatarColor: "#0891b2",
    verse: { fr: "Romains 8:28", ht: "Women 8:28", en: "Romans 8:28" },
    verseText: {
      fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.",
      ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.",
      en: "In all things God works for the good of those who love him.",
    },
    text: {
      fr: "En 2023, j'ai tout perdu dans un tremblement de terre — ma maison, mes affaires, l'école de mes enfants. J'ai failli abandonner la foi. C'est sur KONEKSYON PAM que j'ai trouvé des frères qui ont prié avec moi chaque jour. Aujourd'hui, mes enfants sont à l'école, j'ai reconstruit ma maison et je dirige un groupe de femmes dans mon église. L'Éternel rend tout en double.",
      ht: "An 2023, mwen pèdi tout bagay nan yon tranblemann tè — kay mwen, bagay mwen yo, lekòl pitit mwen yo. Mwen te prèske abandone lafwa. Se sou KONEKSYON PAM mwen jwenn frè ki priye avèk mwen chak jou. Jodi a, pitit mwen yo lekòl, mwen rebati kay mwen epi mwen dirije yon gwoup fanm nan legliz mwen. Seyè a renmèt tout bagay doub.",
      en: "In 2023, I lost everything in an earthquake — my home, my belongings, my children's school. I almost abandoned faith. It was on KONEKSYON PAM that I found brothers who prayed with me every day. Today, my children are in school, I have rebuilt my home and I lead a women's group in my church. The Lord restores double.",
    },
    likes: 447,
  },
  {
    id: "dt6",
    name: "Frère Pierre",
    flag: "🇨🇩",
    countryName: { fr: "Congo", ht: "Kongo", en: "DR Congo" },
    category: { fr: "Témoignage missionnaire", ht: "Temwayaj misyonè", en: "Missionary testimony" },
    categoryIcon: "🌍",
    date: ago(45),
    avatarColor: "#6d28d9",
    verse: { fr: "Marc 16:15", ht: "Mak 16:15", en: "Mark 16:15" },
    verseText: {
      fr: "Allez par tout le monde, et prêchez la bonne nouvelle à toute la création.",
      ht: "Ale nan tout mond lan, preche bònn nouvèl la bay tout kreyati.",
      en: "Go into all the world and preach the gospel to all creation.",
    },
    text: {
      fr: "Je suis pasteur dans un village isolé en RDC. Nous n'avions pas les moyens de nous former. Grâce aux études bibliques de KONEKSYON PAM, notre église a étudié ensemble chaque semaine pendant six mois. Trente membres ont maintenant terminé le programme. Cinq sont devenus responsables de cellules. Une plateforme gratuite a fait ce que des années de projets n'ont pas pu accomplir.",
      ht: "Mwen se pastè nan yon vilaj izole nan RDK. Nou pa t gen mwayen pou fòme tèt nou. Gras ak etid biblik KONEKSYON PAM, legliz nou an etidye ansanm chak semèn pandan sis mwa. Trant manm kounye a fini pwogram nan. Sen tounen responsab selil. Yon platfòm gratis fè sa ane pwojè pa t ka akonpli.",
      en: "I am a pastor in an isolated village in DRC. We did not have the means to train ourselves. Thanks to KONEKSYON PAM's Bible studies, our church studied together every week for six months. Thirty members have now completed the program. Five became cell group leaders. A free platform achieved what years of projects could not.",
    },
    likes: 329,
  },
];

// ─── COMMUNITY ACTIVITY ───────────────────────────────────────────────────────
export interface ActivityItem {
  id: string;
  name: string;
  flag: string;
  countryName: { fr: string; ht: string; en: string };
  action: { fr: string; ht: string; en: string };
  icon: string;
  color: string;
  time: string;
}

export const DEMO_ACTIVITY: ActivityItem[] = [
  { id: "a1", name: "Marie",    flag: "🇫🇷", countryName: { fr: "France",         ht: "Fwans",      en: "France"       }, action: { fr: "a partagé une demande de prière",   ht: "pataje yon demann lapriyè",    en: "shared a prayer request"  }, icon: "🙏", color: "#7c3aed", time: "2min"  },
  { id: "a2", name: "Samuel",   flag: "🇭🇹", countryName: { fr: "Haïti",          ht: "Ayiti",      en: "Haiti"        }, action: { fr: "a terminé une étude biblique",       ht: "fini yon etid biblik",         en: "completed a Bible study"  }, icon: "📖", color: "#1d4ed8", time: "8min"  },
  { id: "a3", name: "Grace",    flag: "🇨🇦", countryName: { fr: "Canada",         ht: "Kanada",     en: "Canada"       }, action: { fr: "a rejoint un groupe d'église",       ht: "rantre nan yon gwoup legliz",  en: "joined a church group"    }, icon: "⛪", color: "#16a34a", time: "15min" },
  { id: "a4", name: "John",     flag: "🇺🇸", countryName: { fr: "États-Unis",     ht: "Etazini",    en: "USA"          }, action: { fr: "participe au concours biblique",     ht: "patisipe nan konkou biblik",   en: "joined a Bible contest"   }, icon: "🏆", color: "#b45309", time: "22min" },
  { id: "a5", name: "Anne",     flag: "🇨🇮", countryName: { fr: "Côte d'Ivoire",  ht: "Kòt d'Ivwa", en: "Côte d'Ivoire"}, action: { fr: "a partagé un témoignage",           ht: "pataje yon temwayaj",          en: "shared a testimony"       }, icon: "✨", color: "#c5a84f", time: "31min" },
  { id: "a6", name: "Pedro",    flag: "🇧🇷", countryName: { fr: "Brésil",         ht: "Brezil",     en: "Brazil"       }, action: { fr: "a prié pour 12 demandes",            ht: "priye pou 12 demann",          en: "prayed for 12 requests"   }, icon: "🕊️", color: "#0891b2", time: "45min" },
  { id: "a7", name: "Élodie",   flag: "🇧🇪", countryName: { fr: "Belgique",       ht: "Bèljik",     en: "Belgium"      }, action: { fr: "a complété le défi du jour",         ht: "konplete defi jou a",          en: "completed today's quiz"   }, icon: "🏛️", color: "#ea580c", time: "1h"    },
  { id: "a8", name: "Esther",   flag: "🇨🇩", countryName: { fr: "Congo",          ht: "Kongo",      en: "DR Congo"     }, action: { fr: "a créé un groupe de prière",         ht: "kreye yon gwoup lapriyè",      en: "created a prayer group"   }, icon: "⛪", color: "#6d28d9", time: "2h"    },
];
