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
    ],
  },
  {
    slug: "jeunesse",
    title: { fr: "Jeunesse", ht: "Jèn", en: "Youth" },
    description: { fr: "La prochaine génération au service de Dieu", ht: "Pwochen jenerasyon nan sèvis Bondye", en: "The next generation serving God" },
    image: "https://cdn-icons-png.flaticon.com/512/2534/2534493.png",
    color: "from-orange-500 to-amber-600",
    memberCount: 2103,
    sections: [
      { slug: "defis", title: { fr: "Défis de foi", ht: "Defi lafwa", en: "Faith challenges" }, description: { fr: "Un défi par semaine", ht: "Yon defi pa semèn", en: "One challenge per week" }, icon: "🎯" },
      { slug: "discussions", title: { fr: "Discussions", ht: "Diskisyon", en: "Discussions" }, description: { fr: "Questions, débats, échanges", ht: "Kesyon, deba, echanj", en: "Questions, debates, exchanges" }, icon: "💬" },
      { slug: "temoignages-jeunes", title: { fr: "Témoignages de jeunes", ht: "Temwayaj jèn yo", en: "Youth testimonies" }, description: { fr: "Histoires inspirantes", ht: "Istwa ki enspire", en: "Inspiring stories" }, icon: "⭐" },
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
    ],
  },
];
