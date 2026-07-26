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
  // ─── GROUPES SPIRITUELS ─────────────────────────────────────────────────────
  {
    slug: "temoignages-miracles",
    title: { fr: "Témoignages & Miracles", ht: "Temwayaj & Mirak", en: "Testimonies & Miracles", es: "Testimonios & Milagros" },
    description: { fr: "Ce que Dieu fait encore aujourd'hui dans les vies", ht: "Sa Bondye ap fè toujou nan lavi moun yo", en: "What God is still doing in lives today", es: "Lo que Dios sigue haciendo en las vidas" },
    image: "https://cdn-icons-png.flaticon.com/512/2570/2570287.png",
    color: "from-yellow-500 to-orange-500",
    memberCount: 3187,
    badge: "✨ Tendance",
    sections: [
      { slug: "guerisons", title: { fr: "Guérisons miraculeuses", ht: "Gerizon mirakile", en: "Miraculous healings", es: "Sanidades milagrosas" }, description: { fr: "Dieu guérit encore aujourd'hui", ht: "Bondye geri toujou jodi a", en: "God still heals today", es: "Dios todavía sana hoy" }, icon: "coeur" },
      { slug: "delivrances", title: { fr: "Délivrances puissantes", ht: "Delivrans pwisan", en: "Powerful deliverances", es: "Liberaciones poderosas" }, description: { fr: "Témoignages de liberté en Christ", ht: "Temwayaj libète nan Kris", en: "Freedom testimonies in Christ", es: "Testimonios de libertad en Cristo" }, icon: "cle" },
      { slug: "provision-divine", title: { fr: "Provision divine", ht: "Pwovizyon divin", en: "Divine provision", es: "Provisión divina" }, description: { fr: "Dieu a pourvu à mes besoins", ht: "Bondye te pouvi pou bezwen mwen", en: "God provided for my needs", es: "Dios proveyó para mis necesidades" }, icon: "main_pieces" },
      { slug: "rencontres-dieu", title: { fr: "Rencontres avec Dieu", ht: "Rankont ak Bondye", en: "Encounters with God", es: "Encuentros con Dios" }, description: { fr: "Rêves, visions, expériences spirituelles", ht: "Rèv, vizyon, eksperyans espirityèl", en: "Dreams, visions, spiritual experiences", es: "Sueños, visiones, experiencias espirituales" }, icon: "etincelles" },
    ],
  },
  {
    slug: "questions-foi",
    title: { fr: "Questions Difficiles de la Foi", ht: "Kesyon Difisil Lafwa", en: "Hard Questions of Faith", es: "Preguntas Difíciles de la Fe" },
    description: { fr: "Les questions que tout chrétien se pose", ht: "Kesyon tout kretyen poze tèt yo", en: "The questions every Christian asks", es: "Las preguntas que todo cristiano se hace" },
    image: "https://cdn-icons-png.flaticon.com/512/1998/1998664.png",
    color: "from-slate-600 to-slate-800",
    memberCount: 2891,
    badge: "🔥 Trending",
    sections: [
      { slug: "souffrance", title: { fr: "Dieu et la souffrance", ht: "Bondye ak soufrans", en: "God and suffering", es: "Dios y el sufrimiento" }, description: { fr: "Pourquoi Dieu permet-il la souffrance ?", ht: "Poukisa Bondye pèmèt soufrans ?", en: "Why does God allow suffering?", es: "¿Por qué Dios permite el sufrimiento?" }, icon: "idee" },
      { slug: "science-foi", title: { fr: "Science & Foi", ht: "Syans & Lafwa", en: "Science & Faith", es: "Ciencia & Fe" }, description: { fr: "Évolution, big bang, création...", ht: "Evolisyon, big bang, kreyasyon...", en: "Evolution, big bang, creation...", es: "Evolución, big bang, creación..." }, icon: "recherche" },
      { slug: "salut-exclusif", title: { fr: "Le salut exclusif en Christ", ht: "Sovtaj eksklizif nan Kris", en: "Exclusive salvation in Christ", es: "La salvación exclusiva en Cristo" }, description: { fr: "Une seule voie vers Dieu ?", ht: "Yon sèl chemen pou rive Bondye ?", en: "Only one way to God?", es: "¿Solo un camino a Dios?" }, icon: "croix" },
      { slug: "miracles-aujourd-hui", title: { fr: "Les miracles existent-ils encore ?", ht: "Èske mirak egziste toujou ?", en: "Do miracles still exist?", es: "¿Aún existen los milagros?" }, description: { fr: "Le surnaturel dans l'Église moderne", ht: "Sinatirel nan legliz modèn", en: "The supernatural in the modern Church", es: "Lo sobrenatural en la Iglesia moderna" }, icon: "etincelles" },
      { slug: "homosexualite-bible", title: { fr: "Questions sociétales & Bible", ht: "Kesyon sosyetal & Bib la", en: "Social questions & the Bible", es: "Cuestiones sociales & la Biblia" }, description: { fr: "Ce que la Bible dit sur les débats modernes", ht: "Sa Bib la di sou deba modèn yo", en: "What the Bible says about modern debates", es: "Lo que la Biblia dice sobre debates modernos" }, icon: "bible" },
    ],
  },
  {
    slug: "femme-dieu",
    title: { fr: "Femme de Dieu", ht: "Fanm Bondye", en: "Woman of God", es: "Mujer de Dios" },
    description: { fr: "La beauté, la force et la grâce de la femme chrétienne", ht: "Bote, fòs ak grès fanm kretyen", en: "The beauty, strength and grace of the Christian woman", es: "La belleza, fuerza y gracia de la mujer cristiana" },
    image: "https://cdn-icons-png.flaticon.com/512/236/236831.png",
    color: "from-rose-500 to-pink-600",
    memberCount: 2341,
    badge: "💕 Actif",
    sections: [
      { slug: "identite-femme", title: { fr: "Identité de la femme chrétienne", ht: "Idantite fanm kretyen", en: "Christian woman's identity", es: "Identidad de la mujer cristiana" }, description: { fr: "Sa valeur aux yeux de Dieu", ht: "Valè li nan je Bondye", en: "Her value in God's eyes", es: "Su valor a los ojos de Dios" }, icon: "couronne" },
      { slug: "femme-proverbes", title: { fr: "La femme de Proverbes 31", ht: "Fanm Proverb 31", en: "The Proverbs 31 woman", es: "La mujer de Proverbios 31" }, description: { fr: "Un modèle pour aujourd'hui", ht: "Yon modèl pou jodi a", en: "A model for today", es: "Un modelo para hoy" }, icon: "bible" },
      { slug: "leadership-feminin", title: { fr: "Femmes leaders dans la Bible", ht: "Fanm lidè nan Bib la", en: "Women leaders in the Bible", es: "Mujeres líderes en la Biblia" }, description: { fr: "Débat : rôle de la femme dans l'Église", ht: "Deba : wòl fanm nan legliz la", en: "Debate: women's role in the Church", es: "Debate: el rol de la mujer en la Iglesia" }, icon: "eclair" },
      { slug: "beaute-interieure", title: { fr: "Beauté intérieure & Sainteté", ht: "Bote enteryè & Sentete", en: "Inner beauty & Holiness", es: "Belleza interior & Santidad" }, description: { fr: "La parure qui vient de Dieu", ht: "Parèt ki soti nan Bondye", en: "The adornment that comes from God", es: "El adorno que viene de Dios" }, icon: "coeur" },
    ],
  },
  {
    slug: "jeunesse",
    title: { fr: "Jeunesse", ht: "Jèn", en: "Youth", es: "Juventud" },
    description: { fr: "La prochaine génération au service de Dieu", ht: "Pwochen jenerasyon nan sèvis Bondye", en: "The next generation serving God", es: "La próxima generación al servicio de Dios" },
    image: "https://cdn-icons-png.flaticon.com/512/2534/2534493.png",
    color: "from-orange-500 to-amber-600",
    memberCount: 2103,
    badge: "🔥 Hot",
    sections: [
      { slug: "defis", title: { fr: "Défis de foi", ht: "Defi lafwa", en: "Faith challenges", es: "Desafíos de fe" }, description: { fr: "Un défi par semaine", ht: "Yon defi pa semèn", en: "One challenge per week", es: "Un desafío por semana" }, icon: "cible" },
      { slug: "discussions", title: { fr: "Discussions & Débats", ht: "Diskisyon & Deba", en: "Discussions & Debates", es: "Discusiones & Debates" }, description: { fr: "Questions, débats, échanges", ht: "Kesyon, deba, echanj", en: "Questions, debates, exchanges", es: "Preguntas, debates, intercambios" }, icon: "message" },
      { slug: "temoignages-jeunes", title: { fr: "Témoignages de jeunes", ht: "Temwayaj jèn yo", en: "Youth testimonies", es: "Testimonios de jóvenes" }, description: { fr: "Histoires inspirantes", ht: "Istwa ki enspire", en: "Inspiring stories", es: "Historias inspiradoras" }, icon: "etoile" },
      { slug: "reseaux-sociaux-foi", title: { fr: "Foi & Réseaux sociaux", ht: "Lafwa & Rezo sosyal", en: "Faith & Social media", es: "Fe & Redes sociales" }, description: { fr: "Être chrétien à l'ère numérique", ht: "Kretyen nan epòk dijital", en: "Being Christian in the digital age", es: "Ser cristiano en la era digital" }, icon: "telephone" },
    ],
  },
  {
    slug: "priere",
    title: { fr: "Prière & Intercession", ht: "Lapriyè & Entèsesyon", en: "Prayer & Intercession", es: "Oración & Intercesión" },
    description: { fr: "Priez ensemble, portez-vous mutuellement dans la prière", ht: "Priye ansanm, pote youn lòt nan lapriyè", en: "Pray together, carry each other in prayer", es: "Oren juntos, sosténganse mutuamente en la oración" },
    image: "https://cdn-icons-png.flaticon.com/512/4305/4305512.png",
    color: "from-blue-500 to-indigo-600",
    memberCount: 1247,
    sections: [
      { slug: "demandes", title: { fr: "Demandes de prière", ht: "Demann lapriyè", en: "Prayer requests", es: "Peticiones de oración" }, description: { fr: "Partagez vos besoins", ht: "Pataje bezwen ou", en: "Share your needs", es: "Comparte tus necesidades" }, icon: "editer" },
      { slug: "chaines", title: { fr: "Chaînes de prière", ht: "Chèn lapriyè", en: "Prayer chains", es: "Cadenas de oración" }, description: { fr: "Priez 24h/24 en relai", ht: "Priye 24/7 an relè", en: "Pray 24/7 in relay", es: "Oren 24/7 por turnos" }, icon: "lien" },
      { slug: "sujets", title: { fr: "Sujets de prière du jour", ht: "Sijè lapriyè jou a", en: "Today's prayer topics", es: "Temas de oración del día" }, description: { fr: "Un sujet par jour", ht: "Yon sijè pa jou", en: "One topic per day", es: "Un tema por día" }, icon: "signet" },
      { slug: "jeune-priere", title: { fr: "Jeûne & Prière", ht: "Jèn & Lapriyè", en: "Fasting & Prayer", es: "Ayuno & Oración" }, description: { fr: "Pratiques du jeûne biblique", ht: "Pratik jèn biblik", en: "Biblical fasting practices", es: "Prácticas del ayuno bíblico" }, icon: "etincelles" },
    ],
  },
  {
    slug: "famille",
    title: { fr: "Famille & Mariage", ht: "Fanmi & Maryaj", en: "Family & Marriage", es: "Familia & Matrimonio" },
    description: { fr: "Construire des foyers solides sur le roc de la foi", ht: "Bati fwaye solid sou wòch lafwa", en: "Build strong homes on the rock of faith", es: "Construir hogares firmes sobre la roca de la fe" },
    image: "https://cdn-icons-png.flaticon.com/512/3884/3884151.png",
    color: "from-pink-500 to-rose-600",
    memberCount: 856,
    sections: [
      { slug: "mariage", title: { fr: "Le mariage chrétien", ht: "Maryaj kretyen", en: "Christian marriage", es: "El matrimonio cristiano" }, description: { fr: "Conseils et sagesse", ht: "Konsèy ak sajès", en: "Advice and wisdom", es: "Consejos y sabiduría" }, icon: "main_coeur" },
      { slug: "enfants", title: { fr: "Éducation des enfants", ht: "Edikasyon timoun", en: "Raising children", es: "Crianza de los hijos" }, description: { fr: "Élever ses enfants dans la foi", ht: "Leve timoun nan lafwa", en: "Raising children in faith", es: "Criar a los hijos en la fe" }, icon: "enfant" },
      { slug: "relations", title: { fr: "Relations saines", ht: "Relasyon ki bon", en: "Healthy relationships", es: "Relaciones sanas" }, description: { fr: "Amitié, amour, respect", ht: "Amitye, lanmou, respè", en: "Friendship, love, respect", es: "Amistad, amor, respeto" }, icon: "coeur" },
      { slug: "divorce-reconciliation", title: { fr: "Réconciliation & Pardon", ht: "Rekonsilyasyon & Padon", en: "Reconciliation & Forgiveness", es: "Reconciliación & Perdón" }, description: { fr: "La guérison des relations brisées", ht: "Gerizon relasyon kase", en: "Healing broken relationships", es: "La sanidad de las relaciones rotas" }, icon: "colombe" },
    ],
  },
  {
    slug: "theologie",
    title: { fr: "Théologie & Doctrine", ht: "Teyoloji & Doktrin", en: "Theology & Doctrine", es: "Teología & Doctrina" },
    description: { fr: "Approfondissez votre connaissance de la Parole de Dieu", ht: "Apwofondi konesans ou nan Pawòl Bondye a", en: "Deepen your knowledge of God's Word", es: "Profundiza tu conocimiento de la Palabra de Dios" },
    image: "https://cdn-icons-png.flaticon.com/512/3330/3330999.png",
    color: "from-violet-600 to-purple-700",
    memberCount: 1834,
    badge: "📚 Nouveau",
    sections: [
      { slug: "debats-doctrinaux", title: { fr: "Grands débats doctrinaux", ht: "Gran deba doktrinal yo", en: "Major doctrinal debates", es: "Grandes debates doctrinales" }, description: { fr: "Prédestination, libre-arbitre, grâce...", ht: "Prédestinasyon, libète, grès...", en: "Predestination, free will, grace...", es: "Predestinación, libre albedrío, gracia..." }, icon: "eclair" },
      { slug: "eschatologie", title: { fr: "Fin des temps & Eschatologie", ht: "Fen tan yo & Eschatology", en: "End times & Eschatology", es: "Fin de los tiempos & Escatología" }, description: { fr: "Rapture, millénium, jugement", ht: "Rapti, milenyòm, jijman", en: "Rapture, millennium, judgment", es: "Arrebatamiento, milenio, juicio" }, icon: "chrono" },
      { slug: "hermeneutique", title: { fr: "Interprétation biblique", ht: "Entèpretasyon biblik", en: "Biblical interpretation", es: "Interpretación bíblica" }, description: { fr: "Comment lire et comprendre la Bible", ht: "Kijan li ak konprann Bib la", en: "How to read and understand the Bible", es: "Cómo leer y comprender la Biblia" }, icon: "recherche" },
      { slug: "faux-enseignements", title: { fr: "Faux enseignements & Discernement", ht: "Fo ansèyman & Disènman", en: "False teachings & Discernment", es: "Falsas enseñanzas & Discernimiento" }, description: { fr: "Tester les esprits selon la Parole", ht: "Teste lespri yo selon Pawòl la", en: "Testing the spirits according to the Word", es: "Probar los espíritus según la Palabra" }, icon: "bouclier" },
    ],
  },
  {
    slug: "evangelisation",
    title: { fr: "Évangélisation", ht: "Evanjelizasyon", en: "Evangelism", es: "Evangelismo" },
    description: { fr: "Allez et faites des disciples de toutes les nations", ht: "Ale fè disip nan tout nasyon", en: "Go and make disciples of all nations", es: "Id y haced discípulos a todas las naciones" },
    image: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
    color: "from-red-500 to-orange-600",
    memberCount: 634,
    sections: [
      { slug: "methodes", title: { fr: "Méthodes d'évangélisation", ht: "Metòd evanjelizasyon", en: "Evangelism methods", es: "Métodos de evangelismo" }, description: { fr: "Comment partager sa foi", ht: "Kijan pou pataje lafwa ou", en: "How to share your faith", es: "Cómo compartir tu fe" }, icon: "mission" },
      { slug: "ressources", title: { fr: "Ressources", ht: "Resous", en: "Resources", es: "Recursos" }, description: { fr: "Tracts, vidéos, outils", ht: "Trak, videyo, zouti", en: "Tracts, videos, tools", es: "Folletos, videos, herramientas" }, icon: "telechargement" },
      { slug: "conversions", title: { fr: "Témoignages de conversion", ht: "Temwayaj konvèsyon", en: "Conversion testimonies", es: "Testimonios de conversión" }, description: { fr: "Comment j'ai rencontré Dieu", ht: "Kijan mwen te rankontre Bondye", en: "How I met God", es: "Cómo encontré a Dios" }, icon: "etincelles" },
      { slug: "mission-numerique", title: { fr: "Évangélisation numérique", ht: "Evanjelizasyon nimerik", en: "Digital evangelism", es: "Evangelismo digital" }, description: { fr: "Partager Christ sur les réseaux sociaux", ht: "Pataje Kris sou rezo sosyal", en: "Sharing Christ on social media", es: "Compartir a Cristo en las redes sociales" }, icon: "wifi" },
    ],
  },
  {
    slug: "sante-foi",
    title: { fr: "Santé Mentale & Foi", ht: "Sante Mantal & Lafwa", en: "Mental Health & Faith", es: "Salud Mental & Fe" },
    description: { fr: "La guérison intérieure par la foi en Christ", ht: "Gerizon enteryè pa lafwa nan Kris", en: "Inner healing through faith in Christ", es: "La sanidad interior por la fe en Cristo" },
    image: "https://cdn-icons-png.flaticon.com/512/2491/2491365.png",
    color: "from-teal-500 to-cyan-600",
    memberCount: 1623,
    badge: "❤️ Populaire",
    sections: [
      { slug: "depression-anxiete", title: { fr: "Dépression & Anxiété", ht: "Depresyon & Anksyete", en: "Depression & Anxiety", es: "Depresión & Ansiedad" }, description: { fr: "Guérir par la Parole et la prière", ht: "Geri pa Pawòl la ak lapriyè", en: "Healing through the Word and prayer", es: "Sanar por la Palabra y la oración" }, icon: "esperance" },
      { slug: "guerison-interieure", title: { fr: "Guérison intérieure", ht: "Gerizon enteryè", en: "Inner healing", es: "Sanidad interior" }, description: { fr: "Blessures, traumatismes et foi", ht: "Blese, twoma ak lafwa", en: "Wounds, trauma and faith", es: "Heridas, traumas y fe" }, icon: "coeur" },
      { slug: "delivrance", title: { fr: "Délivrance & Liberté", ht: "Delivrans & Libète", en: "Deliverance & Freedom", es: "Liberación & Libertad" }, description: { fr: "Briser les liens de l'ennemi", ht: "Kase chèn lènmi an", en: "Breaking the chains of the enemy", es: "Romper las cadenas del enemigo" }, icon: "cle" },
      { slug: "addiction", title: { fr: "Dépendances & Victoire", ht: "Depandans & Viktwa", en: "Addictions & Victory", es: "Adicciones & Victoria" }, description: { fr: "La liberté en Christ face aux addictions", ht: "Libète nan Kris fas ak depandans", en: "Freedom in Christ over addictions", es: "La libertad en Cristo frente a las adicciones" }, icon: "trophee" },
    ],
  },
  {
    slug: "finances",
    title: { fr: "Finances & Bénédiction", ht: "Finans & Benediksyon", en: "Finances & Blessing", es: "Finanzas & Bendición" },
    description: { fr: "La gestion biblique de l'argent et la prospérité de Dieu", ht: "Jesyon biblik lajan ak pwospere Bondye a", en: "Biblical money management and God's prosperity", es: "La administración bíblica del dinero y la prosperidad de Dios" },
    image: "https://cdn-icons-png.flaticon.com/512/2830/2830284.png",
    color: "from-green-600 to-emerald-700",
    memberCount: 1102,
    sections: [
      { slug: "dime-offrande", title: { fr: "Dîme & Offrande", ht: "Ladim & Ofrann", en: "Tithe & Offering", es: "Diezmo & Ofrenda" }, description: { fr: "Débat : obligation ou liberté ?", ht: "Deba : obligasyon oswa libète ?", en: "Debate: obligation or freedom?", es: "Debate: ¿obligación o libertad?" }, icon: "main_pieces" },
      { slug: "prosperite", title: { fr: "Théologie de la prospérité", ht: "Teyoloji pwospere", en: "Prosperity theology", es: "Teología de la prosperidad" }, description: { fr: "Évangile de santé-richesse : vrai ou faux ?", ht: "Levanjil sante-richès : vre oswa fo ?", en: "Health-wealth gospel: true or false?", es: "Evangelio de salud y riqueza: ¿verdadero o falso?" }, icon: "balance" },
      { slug: "gestion-budget", title: { fr: "Budget & Épargne chrétienne", ht: "Bidjè & Epay kretyen", en: "Christian budgeting & saving", es: "Presupuesto & Ahorro cristiano" }, description: { fr: "Gérer ses finances en chrétien", ht: "Jere finans ou kòm kretyen", en: "Manage your finances as a Christian", es: "Administrar tus finanzas como cristiano" }, icon: "portefeuille" },
      { slug: "generosite", title: { fr: "Culture de la générosité", ht: "Kilti jenewozite", en: "Culture of generosity", es: "Cultura de la generosidad" }, description: { fr: "Donner comme Dieu nous a donné", ht: "Bay tankou Bondye te ban nou", en: "Give as God has given to us", es: "Dar como Dios nos ha dado" }, icon: "cadeau" },
    ],
  },
  {
    slug: "musique-arts",
    title: { fr: "Musique & Arts Chrétiens", ht: "Mizik & Atizay Kretyen", en: "Christian Music & Arts", es: "Música & Artes Cristianas" },
    description: { fr: "La créativité au service de la gloire de Dieu", ht: "Kreyativite nan sèvis glwa Bondye a", en: "Creativity in service of God's glory", es: "La creatividad al servicio de la gloria de Dios" },
    image: "https://cdn-icons-png.flaticon.com/512/3659/3659784.png",
    color: "from-fuchsia-500 to-purple-600",
    memberCount: 1456,
    sections: [
      { slug: "chants-esperance", title: { fr: "Chants d'Espérance", ht: "Chan Desperans", en: "Songs of Hope", es: "Cantos de Esperanza" }, description: { fr: "Partage de cantiques et hymnes", ht: "Pataje kantik ak im", en: "Sharing hymns and canticles", es: "Compartir himnos y cánticos" }, icon: "musique" },
      { slug: "louange-adoration", title: { fr: "Louange contemporaine", ht: "Lwanj kontanporen", en: "Contemporary worship", es: "Alabanza contemporánea" }, description: { fr: "Nouvelles chansons pour adorer Dieu", ht: "Nouvo chante pou adore Bondye", en: "New songs to worship God", es: "Nuevas canciones para adorar a Dios" }, icon: "louange" },
      { slug: "danse-chorale", title: { fr: "Danse Sacrée & Chœurs", ht: "Dans Sakre & Koral", en: "Sacred Dance & Choirs", es: "Danza Sagrada & Coros" }, description: { fr: "L'adoration par le corps et la voix", ht: "Adorasyon pa kò ak vwa", en: "Worship through body and voice", es: "La adoración con el cuerpo y la voz" }, icon: "chants" },
      { slug: "arts-visuels", title: { fr: "Arts visuels & Foi", ht: "Atizay vizyèl & Lafwa", en: "Visual arts & Faith", es: "Artes visuales & Fe" }, description: { fr: "Peinture, dessin, photographie chrétienne", ht: "Penti, desen, fotografi kretyen", en: "Christian painting, drawing, photography", es: "Pintura, dibujo, fotografía cristiana" }, icon: "image" },
    ],
  },
  {
    slug: "homme-dieu",
    title: { fr: "Homme de Dieu", ht: "Gason Bondye", en: "Man of God", es: "Hombre de Dios" },
    description: { fr: "L'identité, le rôle et la force de l'homme chrétien", ht: "Idantite, wòl ak fòs gason kretyen", en: "The identity, role and strength of the Christian man", es: "La identidad, el rol y la fuerza del hombre cristiano" },
    image: "https://cdn-icons-png.flaticon.com/512/236/236832.png",
    color: "from-blue-700 to-blue-900",
    memberCount: 987,
    sections: [
      { slug: "masculinite-biblique", title: { fr: "Masculinité biblique", ht: "Maskilinite biblik", en: "Biblical masculinity", es: "Masculinidad bíblica" }, description: { fr: "Qu'est-ce qu'un vrai homme selon Dieu ?", ht: "Kisa yon vre gason ye selon Bondye ?", en: "What is a real man according to God?", es: "¿Qué es un verdadero hombre según Dios?" }, icon: "epee" },
      { slug: "paternite", title: { fr: "Paternité & Responsabilité", ht: "Patènite & Responsabilite", en: "Fatherhood & Responsibility", es: "Paternidad & Responsabilidad" }, description: { fr: "Être un bon père, mari et leader", ht: "Yon bon papa, mari ak lidè", en: "Being a good father, husband and leader", es: "Ser un buen padre, esposo y líder" }, icon: "utilisateurs" },
      { slug: "purity-homme", title: { fr: "Pureté & Intégrité", ht: "Pirete & Entegrite", en: "Purity & Integrity", es: "Pureza & Integridad" }, description: { fr: "Vivre dans la sainteté au quotidien", ht: "Viv nan sentete nan lavi chak jou", en: "Living in holiness daily", es: "Vivir en santidad cada día" }, icon: "bouclier" },
      { slug: "homme-priere", title: { fr: "Homme de prière", ht: "Gason lapriyè", en: "Man of prayer", es: "Hombre de oración" }, description: { fr: "L'homme qui intercède pour sa famille", ht: "Gason ki entèsede pou fanmi li", en: "The man who intercedes for his family", es: "El hombre que intercede por su familia" }, icon: "priere" },
    ],
  },
  {
    slug: "social",
    title: { fr: "Social & Communauté", ht: "Sosyal & Kominote", en: "Social & Community", es: "Social & Comunidad" },
    description: { fr: "L'entraide et le service au sein de l'Église", ht: "Antred ak sèvis nan legliz la", en: "Mutual aid and service within the Church", es: "La ayuda mutua y el servicio dentro de la Iglesia" },
    image: "https://cdn-icons-png.flaticon.com/512/1533/1533908.png",
    color: "from-green-500 to-emerald-600",
    memberCount: 978,
    sections: [
      { slug: "entraide", title: { fr: "Entraide", ht: "Antred", en: "Mutual aid", es: "Ayuda mutua" }, description: { fr: "Demandes et offres d'aide", ht: "Demann ak òf èd", en: "Help requests and offers", es: "Solicitudes y ofertas de ayuda" }, icon: "poignee_main" },
      { slug: "evenements", title: { fr: "Événements", ht: "Evènman", en: "Events", es: "Eventos" }, description: { fr: "Conférences, cultes, concerts", ht: "Konferans, kilt, konsè", en: "Conferences, services, concerts", es: "Conferencias, cultos, conciertos" }, icon: "evenements" },
      { slug: "annonces", title: { fr: "Annonces d'église", ht: "Anons legliz", en: "Church announcements", es: "Anuncios de la iglesia" }, description: { fr: "Nouvelles de votre communauté", ht: "Nouvèl kominote ou", en: "News from your community", es: "Noticias de tu comunidad" }, icon: "notifications" },
      { slug: "volontariat", title: { fr: "Volontariat & Service", ht: "Volontè & Sèvis", en: "Volunteering & Service", es: "Voluntariado & Servicio" }, description: { fr: "Servir les plus démunis", ht: "Sèvi pi pòv yo", en: "Serving the most needy", es: "Servir a los más necesitados" }, icon: "monde" },
    ],
  },
  {
    slug: "formation",
    title: { fr: "Formation de Leaders", ht: "Fòmasyon Lidè", en: "Leadership Training", es: "Formación de Líderes" },
    description: { fr: "Équiper les serviteurs de Dieu pour le ministère", ht: "Ekipe sèvitè Bondye pou ministè", en: "Equipping God's servants for ministry", es: "Equipar a los siervos de Dios para el ministerio" },
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
    color: "from-purple-500 to-violet-600",
    memberCount: 412,
    sections: [
      { slug: "predication", title: { fr: "Prédication", ht: "Predikayon", en: "Preaching", es: "Predicación" }, description: { fr: "Apprendre à prêcher", ht: "Aprann preche", en: "Learn to preach", es: "Aprender a predicar" }, icon: "micro" },
      { slug: "leadership", title: { fr: "Leadership chrétien", ht: "Lidèchip kretyen", en: "Christian leadership", es: "Liderazgo cristiano" }, description: { fr: "Diriger comme Christ", ht: "Dirije tankou Kris", en: "Lead like Christ", es: "Liderar como Cristo" }, icon: "couronne" },
      { slug: "gestion", title: { fr: "Gestion d'église", ht: "Jesyon legliz", en: "Church management", es: "Administración de la iglesia" }, description: { fr: "Finances, organisation, vision", ht: "Finans, òganizasyon, vizyon", en: "Finances, organization, vision", es: "Finanzas, organización, visión" }, icon: "eglise" },
      { slug: "mentorat", title: { fr: "Mentorat & Discipulat", ht: "Mentora & Disipla", en: "Mentoring & Discipleship", es: "Mentoría & Discipulado" }, description: { fr: "Faire des disciples qui font des disciples", ht: "Fè disip ki fè disip", en: "Making disciples who make disciples", es: "Hacer discípulos que hacen discípulos" }, icon: "poignee_main" },
    ],
  },
  {
    slug: "mission",
    title: { fr: "Mission & Voyage", ht: "Misyon & Vwayaj", en: "Mission & Travel", es: "Misión & Viaje" },
    description: { fr: "Porter l'Évangile jusqu'aux extrémités de la terre", ht: "Pote Levanjil jiska bout latè", en: "Bringing the Gospel to the ends of the earth", es: "Llevar el Evangelio hasta los confines de la tierra" },
    image: "https://cdn-icons-png.flaticon.com/512/3097/3097114.png",
    color: "from-sky-500 to-blue-600",
    memberCount: 743,
    sections: [
      { slug: "missions-terrain", title: { fr: "Missions sur le terrain", ht: "Misyon sou teren", en: "Field missions", es: "Misiones en el campo" }, description: { fr: "Témoignages de missionnaires", ht: "Temwayaj misyonè yo", en: "Missionary testimonies", es: "Testimonios de misioneros" }, icon: "monde" },
      { slug: "haiti-diaspora", title: { fr: "Haïti & Diaspora", ht: "Ayiti & Dyaspora", en: "Haiti & Diaspora", es: "Haití & Diáspora" }, description: { fr: "La mission pour Haïti", ht: "Misyon pou Ayiti", en: "Mission for Haiti", es: "La misión para Haití" }, icon: "drapeau" },
      { slug: "afrique-mission", title: { fr: "Mission en Afrique", ht: "Misyon an Afrik", en: "Mission in Africa", es: "Misión en África" }, description: { fr: "Réveils et mouvements africains", ht: "Revèy ak mouvman afriken", en: "African revivals and movements", es: "Avivamientos y movimientos africanos" }, icon: "monde" },
      { slug: "priez-nations", title: { fr: "Priez pour les nations", ht: "Priye pou nasyon yo", en: "Pray for the nations", es: "Oren por las naciones" }, description: { fr: "Un pays en prière chaque semaine", ht: "Yon peyi nan lapriyè chak semèn", en: "One country in prayer each week", es: "Un país en oración cada semana" }, icon: "priere" },
    ],
  },
  {
    slug: "actualites",
    title: { fr: "Actualités Chrétiennes", ht: "Aktyalite Kretyen", en: "Christian News", es: "Noticias Cristianas" },
    description: { fr: "Ce qui se passe dans le monde chrétien", ht: "Sa k ap pase nan mond kretyen an", en: "What's happening in the Christian world", es: "Lo que sucede en el mundo cristiano" },
    image: "https://cdn-icons-png.flaticon.com/512/2965/2965879.png",
    color: "from-cyan-500 to-teal-600",
    memberCount: 1567,
    sections: [
      { slug: "monde", title: { fr: "Nouvelles du monde", ht: "Nouvèl mond lan", en: "World news", es: "Noticias del mundo" }, description: { fr: "Actualités internationales", ht: "Aktyalite entènasyonal", en: "International news", es: "Noticias internacionales" }, icon: "monde" },
      { slug: "persecution", title: { fr: "Église persécutée", ht: "Legliz ki pèsekite", en: "Persecuted Church", es: "Iglesia perseguida" }, description: { fr: "Prions pour nos frères", ht: "Ann priye pou frè nou yo", en: "Let's pray for our brothers", es: "Oremos por nuestros hermanos" }, icon: "bouclier" },
      { slug: "reveil", title: { fr: "Réveils & Mouvements", ht: "Revèy & Mouvman", en: "Revivals & Movements", es: "Avivamientos & Movimientos" }, description: { fr: "Ce que Dieu fait partout", ht: "Sa Bondye ap fè toupatou", en: "What God is doing everywhere", es: "Lo que Dios hace en todas partes" }, icon: "feu" },
      { slug: "tendances-eglise", title: { fr: "Tendances dans l'Église", ht: "Tandans nan legliz la", en: "Church trends", es: "Tendencias en la Iglesia" }, description: { fr: "Déclin ou croissance ? Débat ouvert", ht: "Desann oswa kwasans ? Deba ouvè", en: "Decline or growth? Open debate", es: "¿Declive o crecimiento? Debate abierto" }, icon: "progression" },
    ],
  },
  {
    slug: "technologie-foi",
    title: { fr: "Technologie & Foi", ht: "Teknoloji & Lafwa", en: "Technology & Faith", es: "Tecnología & Fe" },
    description: { fr: "L'intelligence artificielle, le numérique et la foi chrétienne", ht: "Entèlijans atifisyèl, nimerik ak lafwa kretyen", en: "AI, digital world and Christian faith", es: "La inteligencia artificial, lo digital y la fe cristiana" },
    image: "https://cdn-icons-png.flaticon.com/512/2313/2313888.png",
    color: "from-indigo-500 to-blue-600",
    memberCount: 891,
    badge: "🤖 IA & Foi",
    sections: [
      { slug: "ia-foi", title: { fr: "Intelligence Artificielle & Foi", ht: "Entèlijans Atifisyèl & Lafwa", en: "AI & Faith", es: "Inteligencia Artificial & Fe" }, description: { fr: "L'IA remet-elle en question la foi ?", ht: "Èske IA mete lafwa an kesyon ?", en: "Does AI challenge faith?", es: "¿La IA cuestiona la fe?" }, icon: "idee" },
      { slug: "eglise-en-ligne", title: { fr: "Église en ligne : pour ou contre ?", ht: "Legliz anliy : pou oswa kont ?", en: "Online church: for or against?", es: "Iglesia en línea: ¿a favor o en contra?" }, description: { fr: "Débat : peut-on remplacer la présence physique ?", ht: "Deba : ka nou ranplase prezans fizik ?", en: "Debate: can we replace physical presence?", es: "Debate: ¿se puede reemplazar la presencia física?" }, icon: "wifi" },
      { slug: "reseaux-temoignage", title: { fr: "Réseaux sociaux comme outil de témoignage", ht: "Rezo sosyal kòm zouti temwayaj", en: "Social media as a testimony tool", es: "Redes sociales como herramienta de testimonio" }, description: { fr: "Utiliser Instagram, TikTok pour Christ", ht: "Itilize Instagram, TikTok pou Kris", en: "Using Instagram, TikTok for Christ", es: "Usar Instagram, TikTok para Cristo" }, icon: "telephone" },
    ],
  },
  {
    slug: "etudes-bibliques",
    title: { fr: "Études Bibliques Approfondies", ht: "Etid Biblik Apwofondi", en: "In-depth Bible Studies", es: "Estudios Bíblicos Profundos" },
    description: { fr: "Plongez dans la Parole de Dieu livre par livre", ht: "Plonnje nan Pawòl Bondye a liv pa liv", en: "Dive into God's Word book by book", es: "Sumérgete en la Palabra de Dios libro por libro" },
    image: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    color: "from-amber-600 to-yellow-700",
    memberCount: 1298,
    sections: [
      { slug: "ancien-testament", title: { fr: "Ancien Testament", ht: "Ansyen Testaman", en: "Old Testament", es: "Antiguo Testamento" }, description: { fr: "Genèse à Malachie — étude complète", ht: "Jenèz a Malachi — etid konplè", en: "Genesis to Malachi — complete study", es: "De Génesis a Malaquías — estudio completo" }, icon: "etude" },
      { slug: "nouveau-testament", title: { fr: "Nouveau Testament", ht: "Nouvo Testaman", en: "New Testament", es: "Nuevo Testamento" }, description: { fr: "Les Évangiles, Actes, Épîtres", ht: "Levanjil yo, Travay, Epitou", en: "The Gospels, Acts, Epistles", es: "Los Evangelios, Hechos, Epístolas" }, icon: "croix" },
      { slug: "propheties", title: { fr: "Prophéties accomplies", ht: "Pwofesi ki akonpli", en: "Prophecies fulfilled", es: "Profecías cumplidas" }, description: { fr: "Les 300+ prophéties accomplies en Christ", ht: "300+ pwofesi akonpli nan Kris", en: "300+ prophecies fulfilled in Christ", es: "Las 300+ profecías cumplidas en Cristo" }, icon: "etoile" },
      { slug: "parole-du-jour", title: { fr: "Parole du jour — Discussion", ht: "Pawòl jou a — Diskisyon", en: "Word of the day — Discussion", es: "Palabra del día — Discusión" }, description: { fr: "Un verset, une discussion, chaque jour", ht: "Yon vèsè, yon diskisyon, chak jou", en: "One verse, one discussion, every day", es: "Un versículo, una discusión, cada día" }, icon: "verset" },
    ],
  },
];
