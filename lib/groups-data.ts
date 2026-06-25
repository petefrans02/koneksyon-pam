export interface GroupSection {
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  icon: string;
}

export interface Group {
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  image: string;
  color: string;
  sections: GroupSection[];
  memberCount: number;
  badge?: string;
}

export const groups: Group[] = [
  {
    slug: "priere",
    title: { fr: "Prière & Intercession", ht: "Lapriyè & Entèsesyon", en: "Prayer & Intercession" },
    description: { fr: "Priez ensemble, portez-vous mutuellement dans la prière", ht: "Priye ansanm, pote youn lòt nan lapriyè", en: "Pray together, carry each other in prayer" },
    image: "https://cdn-icons-png.flaticon.com/512/4305/4305512.png",
    color: "from-blue-500 to-indigo-600",
    memberCount: 1247,
    sections: [
      { slug: "demandes", title: { fr: "Demandes de prière", ht: "Demann lapriyè", en: "Prayer requests" }, description: { fr: "Partagez vos besoins", ht: "Pataje bezwen ou", en: "Share your needs" }, icon: "📝" },
      { slug: "chaines", title: { fr: "Chaînes de prière", ht: "Chèn lapriyè", en: "Prayer chains" }, description: { fr: "Priez 24h/24 en relai", ht: "Priye 24/7 an relè", en: "Pray 24/7 in relay" }, icon: "🔗" },
      { slug: "sujets", title: { fr: "Sujets de prière du jour", ht: "Sijè lapriyè jou a", en: "Today's prayer topics" }, description: { fr: "Un sujet par jour", ht: "Yon sijè pa jou", en: "One topic per day" }, icon: "📋" },
      { slug: "jeune-priere", title: { fr: "Jeûne & Prière", ht: "Jèn & Lapriyè", en: "Fasting & Prayer" }, description: { fr: "Pratiques du jeûne biblique", ht: "Pratik jèn biblik", en: "Biblical fasting practices" }, icon: "✨" },
    ],
  },
  {
    slug: "famille",
    title: { fr: "Famille & Mariage", ht: "Fanmi & Maryaj", en: "Family & Marriage" },
    description: { fr: "Construire des foyers solides sur le roc de la foi", ht: "Bati fwaye solid sou wòch lafwa", en: "Build strong homes on the rock of faith" },
    image: "https://cdn-icons-png.flaticon.com/512/3884/3884151.png",
    color: "from-pink-500 to-rose-600",
    memberCount: 856,
    sections: [
      { slug: "mariage", title: { fr: "Le mariage chrétien", ht: "Maryaj kretyen", en: "Christian marriage" }, description: { fr: "Conseils et sagesse", ht: "Konsèy ak sajès", en: "Advice and wisdom" }, icon: "💍" },
      { slug: "enfants", title: { fr: "Éducation des enfants", ht: "Edikasyon timoun", en: "Raising children" }, description: { fr: "Élever ses enfants dans la foi", ht: "Leve timoun nan lafwa", en: "Raising children in faith" }, icon: "👶" },
      { slug: "relations", title: { fr: "Relations saines", ht: "Relasyon ki bon", en: "Healthy relationships" }, description: { fr: "Amitié, amour, respect", ht: "Amitye, lanmou, respè", en: "Friendship, love, respect" }, icon: "❤️" },
      { slug: "divorce-reconciliation", title: { fr: "Réconciliation & Pardon", ht: "Rekonsilyasyon & Padon", en: "Reconciliation & Forgiveness" }, description: { fr: "La guérison des relations brisées", ht: "Gerizon relasyon kase", en: "Healing broken relationships" }, icon: "🕊️" },
    ],
  },
  {
    slug: "jeunesse",
    title: { fr: "Jeunesse", ht: "Jèn", en: "Youth" },
    description: { fr: "La prochaine génération au service de Dieu", ht: "Pwochen jenerasyon nan sèvis Bondye", en: "The next generation serving God" },
    image: "https://cdn-icons-png.flaticon.com/512/2534/2534493.png",
    color: "from-orange-500 to-amber-600",
    memberCount: 2103,
    badge: "🔥 Hot",
    sections: [
      { slug: "defis", title: { fr: "Défis de foi", ht: "Defi lafwa", en: "Faith challenges" }, description: { fr: "Un défi par semaine", ht: "Yon defi pa semèn", en: "One challenge per week" }, icon: "🎯" },
      { slug: "discussions", title: { fr: "Discussions & Débats", ht: "Diskisyon & Deba", en: "Discussions & Debates" }, description: { fr: "Questions, débats, échanges", ht: "Kesyon, deba, echanj", en: "Questions, debates, exchanges" }, icon: "💬" },
      { slug: "temoignages-jeunes", title: { fr: "Témoignages de jeunes", ht: "Temwayaj jèn yo", en: "Youth testimonies" }, description: { fr: "Histoires inspirantes", ht: "Istwa ki enspire", en: "Inspiring stories" }, icon: "⭐" },
      { slug: "reseaux-sociaux-foi", title: { fr: "Foi & Réseaux sociaux", ht: "Lafwa & Rezo sosyal", en: "Faith & Social media" }, description: { fr: "Être chrétien à l'ère numérique", ht: "Kretyen nan epòk dijital", en: "Being Christian in the digital age" }, icon: "📱" },
    ],
  },
  {
    slug: "theologie",
    title: { fr: "Théologie & Doctrine", ht: "Teyoloji & Doktrin", en: "Theology & Doctrine" },
    description: { fr: "Approfondissez votre connaissance de la Parole de Dieu", ht: "Apwofondi konesans ou nan Pawòl Bondye a", en: "Deepen your knowledge of God's Word" },
    image: "https://cdn-icons-png.flaticon.com/512/3330/3330999.png",
    color: "from-violet-600 to-purple-700",
    memberCount: 1834,
    badge: "📚 Nouveau",
    sections: [
      { slug: "debats-doctrinaux", title: { fr: "Grands débats doctrinaux", ht: "Gran deba doktrinal yo", en: "Major doctrinal debates" }, description: { fr: "Prédestination, libre-arbitre, grâce...", ht: "Prédestinasyon, libète, grès...", en: "Predestination, free will, grace..." }, icon: "⚡" },
      { slug: "eschatologie", title: { fr: "Fin des temps & Eschatologie", ht: "Fen tan yo & Eschatology", en: "End times & Eschatology" }, description: { fr: "Rapture, millénium, jugement", ht: "Rapti, milenyòm, jijman", en: "Rapture, millennium, judgment" }, icon: "⏳" },
      { slug: "hermeneutique", title: { fr: "Interprétation biblique", ht: "Entèpretasyon biblik", en: "Biblical interpretation" }, description: { fr: "Comment lire et comprendre la Bible", ht: "Kijan li ak konprann Bib la", en: "How to read and understand the Bible" }, icon: "🔍" },
      { slug: "faux-enseignements", title: { fr: "Faux enseignements & Discernement", ht: "Fo ansèyman & Disènman", en: "False teachings & Discernment" }, description: { fr: "Tester les esprits selon la Parole", ht: "Teste lespri yo selon Pawòl la", en: "Testing the spirits according to the Word" }, icon: "🛡️" },
    ],
  },
  {
    slug: "questions-foi",
    title: { fr: "Questions Difficiles de la Foi", ht: "Kesyon Difisil Lafwa", en: "Hard Questions of Faith" },
    description: { fr: "Les questions que tout chrétien se pose", ht: "Kesyon tout kretyen poze tèt yo", en: "The questions every Christian asks" },
    image: "https://cdn-icons-png.flaticon.com/512/1998/1998664.png",
    color: "from-slate-600 to-slate-800",
    memberCount: 2891,
    badge: "🔥 Trending",
    sections: [
      { slug: "souffrance", title: { fr: "Dieu et la souffrance", ht: "Bondye ak soufrans", en: "God and suffering" }, description: { fr: "Pourquoi Dieu permet-il la souffrance ?", ht: "Poukisa Bondye pèmèt soufrans ?", en: "Why does God allow suffering?" }, icon: "💭" },
      { slug: "science-foi", title: { fr: "Science & Foi", ht: "Syans & Lafwa", en: "Science & Faith" }, description: { fr: "Évolution, big bang, création...", ht: "Evolisyon, big bang, kreyasyon...", en: "Evolution, big bang, creation..." }, icon: "🔬" },
      { slug: "salut-exclusif", title: { fr: "Le salut exclusif en Christ", ht: "Sovtaj eksklizif nan Kris", en: "Exclusive salvation in Christ" }, description: { fr: "Une seule voie vers Dieu ?", ht: "Yon sèl chemen pou rive Bondye ?", en: "Only one way to God?" }, icon: "✝️" },
      { slug: "miracles-aujourd-hui", title: { fr: "Les miracles existent-ils encore ?", ht: "Èske mirak egziste toujou ?", en: "Do miracles still exist?" }, description: { fr: "Le surnaturel dans l'Église moderne", ht: "Sinatirel nan legliz modèn", en: "The supernatural in the modern Church" }, icon: "✨" },
      { slug: "homosexualite-bible", title: { fr: "Questions sociétales & Bible", ht: "Kesyon sosyetal & Bib la", en: "Social questions & the Bible" }, description: { fr: "Ce que la Bible dit sur les débats modernes", ht: "Sa Bib la di sou deba modèn yo", en: "What the Bible says about modern debates" }, icon: "📖" },
    ],
  },
  {
    slug: "evangelisation",
    title: { fr: "Évangélisation", ht: "Evanjelizasyon", en: "Evangelism" },
    description: { fr: "Allez et faites des disciples de toutes les nations", ht: "Ale fè disip nan tout nasyon", en: "Go and make disciples of all nations" },
    image: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-red-500 to-orange-600",
    memberCount: 634,
    sections: [
      { slug: "methodes", title: { fr: "Méthodes d'évangélisation", ht: "Metòd evanjelizasyon", en: "Evangelism methods" }, description: { fr: "Comment partager sa foi", ht: "Kijan pou pataje lafwa ou", en: "How to share your faith" }, icon: "📢" },
      { slug: "ressources", title: { fr: "Ressources", ht: "Resous", en: "Resources" }, description: { fr: "Tracts, vidéos, outils", ht: "Trak, videyo, zouti", en: "Tracts, videos, tools" }, icon: "📦" },
      { slug: "conversions", title: { fr: "Témoignages de conversion", ht: "Temwayaj konvèsyon", en: "Conversion testimonies" }, description: { fr: "Comment j'ai rencontré Dieu", ht: "Kijan mwen te rankontre Bondye", en: "How I met God" }, icon: "🌟" },
      { slug: "mission-numerique", title: { fr: "Évangélisation numérique", ht: "Evanjelizasyon nimerik", en: "Digital evangelism" }, description: { fr: "Partager Christ sur les réseaux sociaux", ht: "Pataje Kris sou rezo sosyal", en: "Sharing Christ on social media" }, icon: "💻" },
    ],
  },
  {
    slug: "sante-foi",
    title: { fr: "Santé Mentale & Foi", ht: "Sante Mantal & Lafwa", en: "Mental Health & Faith" },
    description: { fr: "La guérison intérieure par la foi en Christ", ht: "Gerizon enteryè pa lafwa nan Kris", en: "Inner healing through faith in Christ" },
    image: "https://cdn-icons-png.flaticon.com/512/2491/2491365.png",
    color: "from-teal-500 to-cyan-600",
    memberCount: 1623,
    badge: "❤️ Populaire",
    sections: [
      { slug: "depression-anxiete", title: { fr: "Dépression & Anxiété", ht: "Depresyon & Anksyete", en: "Depression & Anxiety" }, description: { fr: "Guérir par la Parole et la prière", ht: "Geri pa Pawòl la ak lapriyè", en: "Healing through the Word and prayer" }, icon: "🌱" },
      { slug: "guerison-interieure", title: { fr: "Guérison intérieure", ht: "Gerizon enteryè", en: "Inner healing" }, description: { fr: "Blessures, traumatismes et foi", ht: "Blese, twoma ak lafwa", en: "Wounds, trauma and faith" }, icon: "💜" },
      { slug: "delivrance", title: { fr: "Délivrance & Liberté", ht: "Delivrans & Libète", en: "Deliverance & Freedom" }, description: { fr: "Briser les liens de l'ennemi", ht: "Kase chèn lènmi an", en: "Breaking the chains of the enemy" }, icon: "⛓️" },
      { slug: "addiction", title: { fr: "Dépendances & Victoire", ht: "Depandans & Viktwa", en: "Addictions & Victory" }, description: { fr: "La liberté en Christ face aux addictions", ht: "Libète nan Kris fas ak depandans", en: "Freedom in Christ over addictions" }, icon: "🏆" },
    ],
  },
  {
    slug: "finances",
    title: { fr: "Finances & Bénédiction", ht: "Finans & Benediksyon", en: "Finances & Blessing" },
    description: { fr: "La gestion biblique de l'argent et la prospérité de Dieu", ht: "Jesyon biblik lajan ak pwospere Bondye a", en: "Biblical money management and God's prosperity" },
    image: "https://cdn-icons-png.flaticon.com/512/2830/2830284.png",
    color: "from-green-600 to-emerald-700",
    memberCount: 1102,
    sections: [
      { slug: "dime-offrande", title: { fr: "Dîme & Offrande", ht: "Ladim & Ofrann", en: "Tithe & Offering" }, description: { fr: "Débat : obligation ou liberté ?", ht: "Deba : obligasyon oswa libète ?", en: "Debate: obligation or freedom?" }, icon: "💰" },
      { slug: "prosperite", title: { fr: "Théologie de la prospérité", ht: "Teyoloji pwospere", en: "Prosperity theology" }, description: { fr: "Évangile de santé-richesse : vrai ou faux ?", ht: "Levanjil sante-richès : vre oswa fo ?", en: "Health-wealth gospel: true or false?" }, icon: "⚖️" },
      { slug: "gestion-budget", title: { fr: "Budget & Épargne chrétienne", ht: "Bidjè & Epay kretyen", en: "Christian budgeting & saving" }, description: { fr: "Gérer ses finances en chrétien", ht: "Jere finans ou kòm kretyen", en: "Manage your finances as a Christian" }, icon: "📊" },
      { slug: "generosite", title: { fr: "Culture de la générosité", ht: "Kilti jenewozite", en: "Culture of generosity" }, description: { fr: "Donner comme Dieu nous a donné", ht: "Bay tankou Bondye te ban nou", en: "Give as God has given to us" }, icon: "🎁" },
    ],
  },
  {
    slug: "musique-arts",
    title: { fr: "Musique & Arts Chrétiens", ht: "Mizik & Atizay Kretyen", en: "Christian Music & Arts" },
    description: { fr: "La créativité au service de la gloire de Dieu", ht: "Kreyativite nan sèvis glwa Bondye a", en: "Creativity in service of God's glory" },
    image: "https://cdn-icons-png.flaticon.com/512/3659/3659784.png",
    color: "from-fuchsia-500 to-purple-600",
    memberCount: 1456,
    sections: [
      { slug: "chants-esperance", title: { fr: "Chants d'Espérance", ht: "Chan Desperans", en: "Songs of Hope" }, description: { fr: "Partage de cantiques et hymnes", ht: "Pataje kantik ak im", en: "Sharing hymns and canticles" }, icon: "🎶" },
      { slug: "louange-adoration", title: { fr: "Louange contemporaine", ht: "Lwanj kontanporen", en: "Contemporary worship" }, description: { fr: "Nouvelles chansons pour adorer Dieu", ht: "Nouvo chante pou adore Bondye", en: "New songs to worship God" }, icon: "🎸" },
      { slug: "danse-chorale", title: { fr: "Danse Sacrée & Chœurs", ht: "Dans Sakre & Koral", en: "Sacred Dance & Choirs" }, description: { fr: "L'adoration par le corps et la voix", ht: "Adorasyon pa kò ak vwa", en: "Worship through body and voice" }, icon: "💃" },
      { slug: "arts-visuels", title: { fr: "Arts visuels & Foi", ht: "Atizay vizyèl & Lafwa", en: "Visual arts & Faith" }, description: { fr: "Peinture, dessin, photographie chrétienne", ht: "Penti, desen, fotografi kretyen", en: "Christian painting, drawing, photography" }, icon: "🎨" },
    ],
  },
  {
    slug: "homme-dieu",
    title: { fr: "Homme de Dieu", ht: "Gason Bondye", en: "Man of God" },
    description: { fr: "L'identité, le rôle et la force de l'homme chrétien", ht: "Idantite, wòl ak fòs gason kretyen", en: "The identity, role and strength of the Christian man" },
    image: "https://cdn-icons-png.flaticon.com/512/236/236832.png",
    color: "from-blue-700 to-blue-900",
    memberCount: 987,
    sections: [
      { slug: "masculinite-biblique", title: { fr: "Masculinité biblique", ht: "Maskilinite biblik", en: "Biblical masculinity" }, description: { fr: "Qu'est-ce qu'un vrai homme selon Dieu ?", ht: "Kisa yon vre gason ye selon Bondye ?", en: "What is a real man according to God?" }, icon: "💪" },
      { slug: "paternite", title: { fr: "Paternité & Responsabilité", ht: "Patènite & Responsabilite", en: "Fatherhood & Responsibility" }, description: { fr: "Être un bon père, mari et leader", ht: "Yon bon papa, mari ak lidè", en: "Being a good father, husband and leader" }, icon: "👨‍👧‍👦" },
      { slug: "purity-homme", title: { fr: "Pureté & Intégrité", ht: "Pirete & Entegrite", en: "Purity & Integrity" }, description: { fr: "Vivre dans la sainteté au quotidien", ht: "Viv nan sentete nan lavi chak jou", en: "Living in holiness daily" }, icon: "🛡️" },
      { slug: "homme-priere", title: { fr: "Homme de prière", ht: "Gason lapriyè", en: "Man of prayer" }, description: { fr: "L'homme qui intercède pour sa famille", ht: "Gason ki entèsede pou fanmi li", en: "The man who intercedes for his family" }, icon: "🙏" },
    ],
  },
  {
    slug: "femme-dieu",
    title: { fr: "Femme de Dieu", ht: "Fanm Bondye", en: "Woman of God" },
    description: { fr: "La beauté, la force et la grâce de la femme chrétienne", ht: "Bote, fòs ak grès fanm kretyen", en: "The beauty, strength and grace of the Christian woman" },
    image: "https://cdn-icons-png.flaticon.com/512/236/236831.png",
    color: "from-rose-500 to-pink-600",
    memberCount: 2341,
    badge: "💕 Actif",
    sections: [
      { slug: "identite-femme", title: { fr: "Identité de la femme chrétienne", ht: "Idantite fanm kretyen", en: "Christian woman's identity" }, description: { fr: "Sa valeur aux yeux de Dieu", ht: "Valè li nan je Bondye", en: "Her value in God's eyes" }, icon: "👑" },
      { slug: "femme-proverbes", title: { fr: "La femme de Proverbes 31", ht: "Fanm Proverb 31", en: "The Proverbs 31 woman" }, description: { fr: "Un modèle pour aujourd'hui", ht: "Yon modèl pou jodi a", en: "A model for today" }, icon: "📖" },
      { slug: "leadership-feminin", title: { fr: "Femmes leaders dans la Bible", ht: "Fanm lidè nan Bib la", en: "Women leaders in the Bible" }, description: { fr: "Débat : rôle de la femme dans l'Église", ht: "Deba : wòl fanm nan legliz la", en: "Debate: women's role in the Church" }, icon: "⚡" },
      { slug: "beaute-interieure", title: { fr: "Beauté intérieure & Sainteté", ht: "Bote enteryè & Sentete", en: "Inner beauty & Holiness" }, description: { fr: "La parure qui vient de Dieu", ht: "Parèt ki soti nan Bondye", en: "The adornment that comes from God" }, icon: "🌸" },
    ],
  },
  {
    slug: "social",
    title: { fr: "Social & Communauté", ht: "Sosyal & Kominote", en: "Social & Community" },
    description: { fr: "L'entraide et le service au sein de l'Église", ht: "Antred ak sèvis nan legliz la", en: "Mutual aid and service within the Church" },
    image: "https://cdn-icons-png.flaticon.com/512/1533/1533908.png",
    color: "from-green-500 to-emerald-600",
    memberCount: 978,
    sections: [
      { slug: "entraide", title: { fr: "Entraide", ht: "Antred", en: "Mutual aid" }, description: { fr: "Demandes et offres d'aide", ht: "Demann ak òf èd", en: "Help requests and offers" }, icon: "🤝" },
      { slug: "evenements", title: { fr: "Événements", ht: "Evènman", en: "Events" }, description: { fr: "Conférences, cultes, concerts", ht: "Konferans, kilt, konsè", en: "Conferences, services, concerts" }, icon: "📅" },
      { slug: "annonces", title: { fr: "Annonces d'église", ht: "Anons legliz", en: "Church announcements" }, description: { fr: "Nouvelles de votre communauté", ht: "Nouvèl kominote ou", en: "News from your community" }, icon: "📣" },
      { slug: "volontariat", title: { fr: "Volontariat & Service", ht: "Volontè & Sèvis", en: "Volunteering & Service" }, description: { fr: "Servir les plus démunis", ht: "Sèvi pi pòv yo", en: "Serving the most needy" }, icon: "🌍" },
    ],
  },
  {
    slug: "formation",
    title: { fr: "Formation de Leaders", ht: "Fòmasyon Lidè", en: "Leadership Training" },
    description: { fr: "Équiper les serviteurs de Dieu pour le ministère", ht: "Ekipe sèvitè Bondye pou ministè", en: "Equipping God's servants for ministry" },
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
    color: "from-purple-500 to-violet-600",
    memberCount: 412,
    sections: [
      { slug: "predication", title: { fr: "Prédication", ht: "Predikayon", en: "Preaching" }, description: { fr: "Apprendre à prêcher", ht: "Aprann preche", en: "Learn to preach" }, icon: "🎤" },
      { slug: "leadership", title: { fr: "Leadership chrétien", ht: "Lidèchip kretyen", en: "Christian leadership" }, description: { fr: "Diriger comme Christ", ht: "Dirije tankou Kris", en: "Lead like Christ" }, icon: "👑" },
      { slug: "gestion", title: { fr: "Gestion d'église", ht: "Jesyon legliz", en: "Church management" }, description: { fr: "Finances, organisation, vision", ht: "Finans, òganizasyon, vizyon", en: "Finances, organization, vision" }, icon: "⛪" },
      { slug: "mentorat", title: { fr: "Mentorat & Discipulat", ht: "Mentora & Disipla", en: "Mentoring & Discipleship" }, description: { fr: "Faire des disciples qui font des disciples", ht: "Fè disip ki fè disip", en: "Making disciples who make disciples" }, icon: "🤲" },
    ],
  },
  {
    slug: "mission",
    title: { fr: "Mission & Voyage", ht: "Misyon & Vwayaj", en: "Mission & Travel" },
    description: { fr: "Porter l'Évangile jusqu'aux extrémités de la terre", ht: "Pote Levanjil jiska bout latè", en: "Bringing the Gospel to the ends of the earth" },
    image: "https://cdn-icons-png.flaticon.com/512/3097/3097114.png",
    color: "from-sky-500 to-blue-600",
    memberCount: 743,
    sections: [
      { slug: "missions-terrain", title: { fr: "Missions sur le terrain", ht: "Misyon sou teren", en: "Field missions" }, description: { fr: "Témoignages de missionnaires", ht: "Temwayaj misyonè yo", en: "Missionary testimonies" }, icon: "🌍" },
      { slug: "haiti-diaspora", title: { fr: "Haïti & Diaspora", ht: "Ayiti & Dyaspora", en: "Haiti & Diaspora" }, description: { fr: "La mission pour Haïti", ht: "Misyon pou Ayiti", en: "Mission for Haiti" }, icon: "🇭🇹" },
      { slug: "afrique-mission", title: { fr: "Mission en Afrique", ht: "Misyon an Afrik", en: "Mission in Africa" }, description: { fr: "Réveils et mouvements africains", ht: "Revèy ak mouvman afriken", en: "African revivals and movements" }, icon: "🌍" },
      { slug: "priez-nations", title: { fr: "Priez pour les nations", ht: "Priye pou nasyon yo", en: "Pray for the nations" }, description: { fr: "Un pays en prière chaque semaine", ht: "Yon peyi nan lapriyè chak semèn", en: "One country in prayer each week" }, icon: "🙏" },
    ],
  },
  {
    slug: "temoignages-miracles",
    title: { fr: "Témoignages & Miracles", ht: "Temwayaj & Mirak", en: "Testimonies & Miracles" },
    description: { fr: "Ce que Dieu fait encore aujourd'hui dans les vies", ht: "Sa Bondye ap fè toujou nan lavi moun yo", en: "What God is still doing in lives today" },
    image: "https://cdn-icons-png.flaticon.com/512/2570/2570287.png",
    color: "from-yellow-500 to-orange-500",
    memberCount: 3187,
    badge: "✨ Tendance",
    sections: [
      { slug: "guerisons", title: { fr: "Guérisons miraculeuses", ht: "Gerizon mirakile", en: "Miraculous healings" }, description: { fr: "Dieu guérit encore aujourd'hui", ht: "Bondye geri toujou jodi a", en: "God still heals today" }, icon: "💊" },
      { slug: "delivrances", title: { fr: "Délivrances puissantes", ht: "Delivrans pwisan", en: "Powerful deliverances" }, description: { fr: "Témoignages de liberté en Christ", ht: "Temwayaj libète nan Kris", en: "Freedom testimonies in Christ" }, icon: "⛓️" },
      { slug: "provision-divine", title: { fr: "Provision divine", ht: "Pwovizyon divin", en: "Divine provision" }, description: { fr: "Dieu a pourvu à mes besoins", ht: "Bondye te pouvi pou bezwen mwen", en: "God provided for my needs" }, icon: "🌾" },
      { slug: "rencontres-dieu", title: { fr: "Rencontres avec Dieu", ht: "Rankont ak Bondye", en: "Encounters with God" }, description: { fr: "Rêves, visions, expériences spirituelles", ht: "Rèv, vizyon, eksperyans espirityèl", en: "Dreams, visions, spiritual experiences" }, icon: "🌟" },
    ],
  },
  {
    slug: "actualites",
    title: { fr: "Actualités Chrétiennes", ht: "Aktyalite Kretyen", en: "Christian News" },
    description: { fr: "Ce qui se passe dans le monde chrétien", ht: "Sa k ap pase nan mond kretyen an", en: "What's happening in the Christian world" },
    image: "https://cdn-icons-png.flaticon.com/512/2965/2965879.png",
    color: "from-cyan-500 to-teal-600",
    memberCount: 1567,
    sections: [
      { slug: "monde", title: { fr: "Nouvelles du monde", ht: "Nouvèl mond lan", en: "World news" }, description: { fr: "Actualités internationales", ht: "Aktyalite entènasyonal", en: "International news" }, icon: "🌍" },
      { slug: "persecution", title: { fr: "Église persécutée", ht: "Legliz ki pèsekite", en: "Persecuted Church" }, description: { fr: "Prions pour nos frères", ht: "Ann priye pou frè nou yo", en: "Let's pray for our brothers" }, icon: "✊" },
      { slug: "reveil", title: { fr: "Réveils & Mouvements", ht: "Revèy & Mouvman", en: "Revivals & Movements" }, description: { fr: "Ce que Dieu fait partout", ht: "Sa Bondye ap fè toupatou", en: "What God is doing everywhere" }, icon: "🔥" },
      { slug: "tendances-eglise", title: { fr: "Tendances dans l'Église", ht: "Tandans nan legliz la", en: "Church trends" }, description: { fr: "Déclin ou croissance ? Débat ouvert", ht: "Desann oswa kwasans ? Deba ouvè", en: "Decline or growth? Open debate" }, icon: "📈" },
    ],
  },
  {
    slug: "technologie-foi",
    title: { fr: "Technologie & Foi", ht: "Teknoloji & Lafwa", en: "Technology & Faith" },
    description: { fr: "L'intelligence artificielle, le numérique et la foi chrétienne", ht: "Entèlijans atifisyèl, nimerik ak lafwa kretyen", en: "AI, digital world and Christian faith" },
    image: "https://cdn-icons-png.flaticon.com/512/2313/2313888.png",
    color: "from-indigo-500 to-blue-600",
    memberCount: 891,
    badge: "🤖 IA & Foi",
    sections: [
      { slug: "ia-foi", title: { fr: "Intelligence Artificielle & Foi", ht: "Entèlijans Atifisyèl & Lafwa", en: "AI & Faith" }, description: { fr: "L'IA remet-elle en question la foi ?", ht: "Èske IA mete lafwa an kesyon ?", en: "Does AI challenge faith?" }, icon: "🤖" },
      { slug: "eglise-en-ligne", title: { fr: "Église en ligne : pour ou contre ?", ht: "Legliz anliy : pou oswa kont ?", en: "Online church: for or against?" }, description: { fr: "Débat : peut-on remplacer la présence physique ?", ht: "Deba : ka nou ranplase prezans fizik ?", en: "Debate: can we replace physical presence?" }, icon: "💻" },
      { slug: "reseaux-temoignage", title: { fr: "Réseaux sociaux comme outil de témoignage", ht: "Rezo sosyal kòm zouti temwayaj", en: "Social media as a testimony tool" }, description: { fr: "Utiliser Instagram, TikTok pour Christ", ht: "Itilize Instagram, TikTok pou Kris", en: "Using Instagram, TikTok for Christ" }, icon: "📱" },
    ],
  },
  {
    slug: "etudes-bibliques",
    title: { fr: "Études Bibliques Approfondies", ht: "Etid Biblik Apwofondi", en: "In-depth Bible Studies" },
    description: { fr: "Plongez dans la Parole de Dieu livre par livre", ht: "Plonnje nan Pawòl Bondye a liv pa liv", en: "Dive into God's Word book by book" },
    image: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    color: "from-amber-600 to-yellow-700",
    memberCount: 1298,
    sections: [
      { slug: "ancien-testament", title: { fr: "Ancien Testament", ht: "Ansyen Testaman", en: "Old Testament" }, description: { fr: "Genèse à Malachie — étude complète", ht: "Jenèz a Malachi — etid konplè", en: "Genesis to Malachi — complete study" }, icon: "📜" },
      { slug: "nouveau-testament", title: { fr: "Nouveau Testament", ht: "Nouvo Testaman", en: "New Testament" }, description: { fr: "Les Évangiles, Actes, Épîtres", ht: "Levanjil yo, Travay, Epitou", en: "The Gospels, Acts, Epistles" }, icon: "✝️" },
      { slug: "propheties", title: { fr: "Prophéties accomplies", ht: "Pwofesi ki akonpli", en: "Prophecies fulfilled" }, description: { fr: "Les 300+ prophéties accomplies en Christ", ht: "300+ pwofesi akonpli nan Kris", en: "300+ prophecies fulfilled in Christ" }, icon: "🔮" },
      { slug: "parole-du-jour", title: { fr: "Parole du jour — Discussion", ht: "Pawòl jou a — Diskisyon", en: "Word of the day — Discussion" }, description: { fr: "Un verset, une discussion, chaque jour", ht: "Yon vèsè, yon diskisyon, chak jou", en: "One verse, one discussion, every day" }, icon: "📅" },
    ],
  },
];
