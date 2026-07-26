export type Lang = "fr" | "ht" | "en" | "es";

export type LangText = Partial<Record<Lang, string>> & { fr: string; en: string };
export type LangTextArray = Partial<Record<Lang, string[]>> & { fr: string[]; en: string[] };

// Central translation dictionary — ALL UI strings belong here.
// Add new strings here; never hardcode text in components.
const translations: Record<string, Record<Lang, string>> = {

  // ── App identity ──────────────────────────────────────────────────────────
  appName:        { fr: "KONEKSYON PAM",            ht: "KONEKSYON PAM",                en: "KONEKSYON PAM",              es: "KONEKSYON PAM" },
  tagline:        { fr: "Connectés par la foi",     ht: "Konekte pa lafwa",              en: "Connected by faith",         es: "Conectados por la fe" },
  platformType:   { fr: "Plateforme Chrétienne",    ht: "Platfòm Kretyen",               en: "Christian Platform",         es: "Plataforma Cristiana" },
  missionSlogan:  { fr: "UNE MISSION · UN DIEU · UNE VISION", ht: "YON MISYON · YON BONDYE · YON VIZYON", en: "ONE MISSION · ONE GOD · ONE VISION", es: "UNA MISIÓN · UN DIOS · UNA VISIÓN" },

  // ── Navigation ────────────────────────────────────────────────────────────
  today:          { fr: "Aujourd'hui",   ht: "Jodi a",       en: "Today",        es: "Hoy" },
  discover:       { fr: "Découvrir",     ht: "Dekouvri",     en: "Discover",     es: "Descubrir" },
  dashboard:      { fr: "Dashboard",     ht: "Dashboard",    en: "Dashboard",    es: "Panel" },
  home:           { fr: "Accueil",       ht: "Akèy",         en: "Home",         es: "Inicio" },
  myGroups:       { fr: "Mes groupes",   ht: "Gwoup mwen yo",en: "My groups",    es: "Mis grupos" },

  // ── Sections ─────────────────────────────────────────────────────────────
  sectionPrayer:    { fr: "Prière",        ht: "Lapriyè",    en: "Prayer",       es: "Oración" },
  sectionStudy:     { fr: "Étude",         ht: "Etid",       en: "Study",        es: "Estudio" },
  sectionTeaching:  { fr: "Enseignement",  ht: "Ansèyman",   en: "Teaching",     es: "Enseñanza" },
  sectionGames:     { fr: "Jeux",          ht: "Jwèt",       en: "Games",        es: "Juegos" },
  sectionContests:  { fr: "Concours",      ht: "Konkou",     en: "Contests",     es: "Concursos" },
  sectionGroups:    { fr: "Groupes",       ht: "Gwoup",      en: "Groups",       es: "Grupos" },

  // ── Auth ──────────────────────────────────────────────────────────────────
  signIn:         { fr: "Connexion",               ht: "Konekte",               en: "Sign in",                      es: "Iniciar sesión" },
  signOut:        { fr: "Déconnexion",             ht: "Dekonekte",             en: "Sign out",                     es: "Cerrar sesión" },
  signInGoogle:   { fr: "Se connecter avec Google",ht: "Konekte ak Google",     en: "Sign in with Google",          es: "Iniciar sesión con Google" },
  createAccount:  { fr: "Créer un compte avec Google", ht: "Kreye yon kont ak Google", en: "Create account with Google", es: "Crear cuenta con Google" },
  loginRequired:  { fr: "Connexion requise",       ht: "Koneksyon obligatwa",   en: "Login required",               es: "Inicio de sesión requerido" },
  loginDesc:      { fr: "Connectez-vous pour accéder à toutes les fonctionnalités de KONEKSYON PAM", ht: "Konekte pou jwenn aksè nan tout fonksyonalite KONEKSYON PAM", en: "Sign in to access all KONEKSYON PAM features", es: "Inicia sesión para acceder a todas las funciones de KONEKSYON PAM" },
  loginFreeSafe:  { fr: "Gratuit • Sécurisé • En un clic", ht: "Gratis • An sekirite • Yon klik", en: "Free • Secure • One click", es: "Gratis • Seguro • Un clic" },
  connecting:     { fr: "Connexion en cours...",   ht: "Ap konekte...",          en: "Connecting...",                es: "Conectando..." },

  // ── General actions ───────────────────────────────────────────────────────
  submit:         { fr: "Envoyer",         ht: "Voye",          en: "Submit",       es: "Enviar" },
  cancel:         { fr: "Annuler",         ht: "Anile",         en: "Cancel",       es: "Cancelar" },
  back:           { fr: "Retour",          ht: "Tounen",        en: "Back",         es: "Volver" },
  backHome:       { fr: "← Retour à l'accueil", ht: "← Tounen akèy", en: "← Back to home", es: "← Volver al inicio" },
  seeAll:         { fr: "Tout voir →",     ht: "Wè tout →",     en: "See all →",    es: "Ver todo →" },
  loading:        { fr: "Chargement...",   ht: "Ap chaje...",   en: "Loading...",   es: "Cargando..." },
  processing:     { fr: "Traitement...",   ht: "Ap trete...",   en: "Processing...", es: "Procesando..." },
  later:          { fr: "Plus tard",       ht: "Pita",          en: "Later",        es: "Más tarde" },
  share:          { fr: "Partager",        ht: "Pataje",        en: "Share",        es: "Compartir" },
  copy:           { fr: "Copier le lien", ht: "Kopye lyen an", en: "Copy link",    es: "Copiar enlace" },
  copied:         { fr: "Lien copié !",   ht: "Lyen kopye !",  en: "Link copied!", es: "¡Enlace copiado!" },
  open:           { fr: "Accéder →",       ht: "Antre →",       en: "Open →",       es: "Abrir →" },
  register:       { fr: "S'inscrire",      ht: "Enskri",        en: "Register",     es: "Registrarse" },
  watch:          { fr: "Regarder en direct", ht: "Gade an dirèk", en: "Watch live", es: "Ver en vivo" },
  join:           { fr: "Rejoindre →",     ht: "Antre →",       en: "Join →",       es: "Unirse →" },
  invite:         { fr: "Inviter un ami", ht: "Envite yon zanmi", en: "Invite a friend", es: "Invitar a un amigo" },
  startToday:     { fr: "Commencer aujourd'hui", ht: "Kòmanse jodi a", en: "Start today", es: "Empezar hoy" },

  // ── Prayer wall ───────────────────────────────────────────────────────────
  verseOfDay:     { fr: "Verset du jour",          ht: "Vèsè jou a",          en: "Verse of the day",        es: "Versículo del día" },
  prayers:        { fr: "Demandes de prière",       ht: "Demann lapriyè",      en: "Prayer requests",         es: "Peticiones de oración" },
  prayerButton:   { fr: "J'ai prié 🙏",            ht: "Mwen priye 🙏",       en: "I prayed 🙏",             es: "Oré 🙏" },
  peoplePrayed:   { fr: "personnes ont prié",      ht: "moun te priye",        en: "people prayed",           es: "personas oraron" },
  submitPrayer:   { fr: "Soumettre une demande de prière", ht: "Soumèt yon demann lapriyè", en: "Submit a prayer request", es: "Enviar una petición de oración" },
  yourName:       { fr: "Votre nom (ou anonyme)",  ht: "Non ou (oswa anonim)", en: "Your name (or anonymous)", es: "Tu nombre (o anónimo)" },
  yourPrayer:     { fr: "Écrivez votre demande de prière...", ht: "Ekri demann lapriyè ou...", en: "Write your prayer request...", es: "Escribe tu petición de oración..." },
  prayWithMe:     { fr: "Priez avec moi",          ht: "Priye avèk mwen",     en: "Pray with me",            es: "Ora conmigo" },
  amen:           { fr: "Amen",                    ht: "Amèn",                en: "Amen",                    es: "Amén" },
  anonymous:      { fr: "Anonyme",                 ht: "Anonim",              en: "Anonymous",               es: "Anónimo" },
  prayNow:        { fr: "Prier maintenant",        ht: "Priye kounye a",      en: "Pray now",                es: "Orar ahora" },

  // ── Testimonies ───────────────────────────────────────────────────────────
  testimonies:    { fr: "Témoignages",             ht: "Temwayaj",            en: "Testimonies",             es: "Testimonios" },
  shareTestimony: { fr: "Partager un témoignage",  ht: "Pataje yon temwayaj", en: "Share a testimony",       es: "Compartir un testimonio" },
  yourTestimony:  { fr: "Racontez ce que Dieu a fait dans votre vie...", ht: "Rakonte sa Bondye fè nan lavi ou...", en: "Tell us what God has done in your life...", es: "Cuéntanos lo que Dios ha hecho en tu vida..." },

  // ── Bible / Content ───────────────────────────────────────────────────────
  psalms:         { fr: "Psaumes",          ht: "Sòm",           en: "Psalms",         es: "Salmos" },
  listen:         { fr: "Écouter",          ht: "Koute",         en: "Listen",         es: "Escuchar" },
  read:           { fr: "Lire",             ht: "Li",            en: "Read",           es: "Leer" },
  lessons:        { fr: "leçons",           ht: "leson",         en: "lessons",        es: "lecciones" },
  bibleStudy:     { fr: "Études Bibliques", ht: "Etid Biblik",   en: "Bible Studies",  es: "Estudios Bíblicos" },
  studySubtitle:  { fr: "Approfondissez votre connaissance de la Parole de Dieu", ht: "Apwofondi konesans ou nan Pawòl Bondye a", en: "Deepen your knowledge of God's Word", es: "Profundiza tu conocimiento de la Palabra de Dios" },
  dailyChallenge: { fr: "Défi du jour",     ht: "Defi jou a",    en: "Challenge of the day", es: "Desafío del día" },
  seeAnswer:      { fr: "Voir la réponse",  ht: "Wè repons",     en: "See answer",     es: "Ver respuesta" },

  // ── Contests ─────────────────────────────────────────────────────────────
  liveNow:        { fr: "En direct maintenant",  ht: "An dirèk kounye a",  en: "Live now",             es: "En vivo ahora" },
  upcoming:       { fr: "À venir",               ht: "Ap vini",            en: "Upcoming",             es: "Próximamente" },
  completed:      { fr: "Terminé",               ht: "Fini",               en: "Completed",            es: "Terminado" },
  voting:         { fr: "Vote ouvert",            ht: "Ap vote",            en: "Voting open",          es: "Votación abierta" },
  participants:   { fr: "participants",           ht: "patisipan",          en: "participants",         es: "participantes" },
  leaderboard:    { fr: "Classement",            ht: "Klasman",            en: "Leaderboard",          es: "Clasificación" },
  soonAvailable:  { fr: "Bientôt disponible",   ht: "Byento disponib",    en: "Coming soon",          es: "Próximamente" },
  almostFull:     { fr: "Presque complet",       ht: "Prèske konplè",      en: "Almost full",          es: "Casi lleno" },
  spots:          { fr: "places",                ht: "plas",               en: "spots",                es: "lugares" },
  contestChampion: { fr: "Champion Biblique",   ht: "Chanpyon Biblik",     en: "Biblical Champion",    es: "Campeón Bíblico" },
  totalVotes:     { fr: "votes au total",        ht: "vòt an total",       en: "total votes",          es: "votos en total" },
  noParticipants: { fr: "Aucun participant encore.", ht: "Pa gen patisipan ankò.", en: "No participants yet.", es: "Ningún participante aún." },
  hallOfFame:     { fr: "Hall of Fame",          ht: "Hall of Fame",       en: "Hall of Fame",         es: "Salón de la Fama" },
  lastWinners:    { fr: "Derniers vainqueurs",   ht: "Dènye venkè yo",    en: "Last winners",          es: "Últimos ganadores" },
  popularContests: { fr: "Concours les plus actifs", ht: "Konkou ki pi aktif yo", en: "Most active contests", es: "Concursos más activos" },

  // ── Realtime notifications ────────────────────────────────────────────────
  newParticipant: { fr: "Un nouveau participant vient de rejoindre !", ht: "Yon nouvo patisipan rantre !", en: "New participant joined!", es: "¡Nuevo participante se unió!" },
  newVote:        { fr: "Nouveau vote enregistré !", ht: "Nouvo vòt anrejistre !", en: "New vote recorded!", es: "¡Nuevo voto registrado!" },
  contestStarted: { fr: "Le concours vient de commencer !", ht: "Konkou a kòmanse !", en: "Contest has started!", es: "¡El concurso ha comenzado!" },
  votingOpen:     { fr: "Phase de vote ouverte — votez maintenant !", ht: "Faz vote a louvri — vote kounye a !", en: "Voting phase open — vote now!", es: "¡Fase de votación abierta — vota ahora!" },

  // ── Stats ─────────────────────────────────────────────────────────────────
  countries:      { fr: "pays connectés",        ht: "peyi konekte",        en: "countries connected",   es: "países conectados" },
  members:        { fr: "membres",               ht: "manm",                en: "members",               es: "miembros" },
  activeMembers:  { fr: "Membres actifs",        ht: "Manm aktif",          en: "Active members",        es: "Miembros activos" },
  countriesRep:   { fr: "Pays représentés",      ht: "Peyi reprezante",     en: "Countries",             es: "Países" },
  prayersShared:  { fr: "Prières publiées",      ht: "Lapriyè pibliye",     en: "Prayers shared",        es: "Oraciones publicadas" },
  satisfaction:   { fr: "Satisfaction membres",  ht: "Satisfaksyon manm",   en: "Member satisfaction",   es: "Satisfacción de miembros" },
  connectedNow:   { fr: "connectés maintenant",  ht: "konekte kounye a",    en: "connected now",         es: "conectados ahora" },

  // ── Groups / Church ───────────────────────────────────────────────────────
  myGroup:        { fr: "Mon groupe d'église", ht: "Gwoup legliz mwen", en: "My church group",  es: "Mi grupo de iglesia" },
  churchGroups:   { fr: "Groupes d'Église",    ht: "Gwoup Legliz",      en: "Church Groups",    es: "Grupos de Iglesia" },
  newGroups:      { fr: "Nouveaux groupes",    ht: "Nouvo gwoup",       en: "New groups",       es: "Nuevos grupos" },

  // ── Sharing ───────────────────────────────────────────────────────────────
  sharePrompt:    { fr: "Partagez cette expérience avec votre communauté", ht: "Pataje eksperyans sa a ak kominote ou a", en: "Share this experience with your community", es: "Comparte esta experiencia con tu comunidad" },
  friendNeeds:    { fr: "Un ami pourrait avoir besoin de ça aujourd'hui.", ht: "Yon zanmi ka bezwen sa a jodi a.", en: "A friend might need this today.", es: "Un amigo podría necesitar esto hoy." },
  shareWithChurch: { fr: "Partager avec mon église", ht: "Pataje ak legliz mwen", en: "Share with my church", es: "Compartir con mi iglesia" },

  // ── Discover tabs ─────────────────────────────────────────────────────────
  tabToday:       { fr: "Aujourd'hui",  ht: "Jodi a",    en: "Today",     es: "Hoy" },
  tabTrending:    { fr: "Tendances",    ht: "Tandans",   en: "Trending",  es: "Tendencias" },
  tabNew:         { fr: "Nouveautés",   ht: "Nouvote",   en: "New",       es: "Novedades" },
  tabCommunity:   { fr: "Communauté",   ht: "Kominote",  en: "Community", es: "Comunidad" },

  // ── Welcome popup ─────────────────────────────────────────────────────────
  welcomeTitle:   { fr: "Bienvenue ! 🙏",  ht: "Byenveni ! 🙏",  en: "Welcome! 🙏",  es: "¡Bienvenido! 🙏" },
  welcomeDesc:    { fr: "Bienvenue sur la plateforme des chrétiens connectés. Créez un compte gratuitement et rejoignez cette belle famille !", ht: "Byenveni sou platfòm kretyen ki konekte. Kreye yon kont gratis epi rantre nan bèl fanmi sa a !", en: "Welcome to the platform for connected Christians. Create a free account and join this beautiful family!", es: "Bienvenido a la plataforma de los cristianos conectados. ¡Crea una cuenta gratis y únete a esta hermosa familia!" },

  // ── About ─────────────────────────────────────────────────────────────────
  about:          { fr: "À propos",     ht: "Konsènan",  en: "About",         es: "Acerca de" },
  ourMission:     { fr: "Notre Mission",ht: "Misyon Nou",en: "Our Mission",    es: "Nuestra Misión" },
  ourServices:    { fr: "Nos Services", ht: "Sèvis Nou", en: "Our Services",   es: "Nuestros Servicios" },

  // ── Countdown labels ─────────────────────────────────────────────────────
  days:    { fr: "Jours",    ht: "Jou",      en: "Days",   es: "Días" },
  hours:   { fr: "Heures",   ht: "Èd tan",   en: "Hours",  es: "Horas" },
  minutes: { fr: "Min",      ht: "Min",      en: "Min",    es: "Min" },
  seconds: { fr: "Sec",      ht: "Sek",      en: "Sec",    es: "Seg" },

  // ── Community ─────────────────────────────────────────────────────────────
  globalCommunity: { fr: "Notre communauté mondiale", ht: "Kominote mondyal nou an", en: "Our global community", es: "Nuestra comunidad mundial" },
  inviteCommunity: { fr: "Inviter ma communauté",     ht: "Envite kominote mwen",   en: "Invite my community",  es: "Invitar a mi comunidad" },
  missionaryAct:   { fr: "Un ami qui découvre la Parole de Dieu grâce à vous — c'est un acte missionnaire.", ht: "Yon zanmi ki dekouvri Pawòl Bondye a gras a ou — se yon zak misyonè.", en: "A friend who discovers God's Word because of you — that is a missionary act.", es: "Un amigo que descubre la Palabra de Dios gracias a ti — eso es un acto misionero." },

  // ── Quick challenge ───────────────────────────────────────────────────────
  quickChallenge:  { fr: "Défi rapide",   ht: "Defi rapid", en: "Quick challenge",               es: "Desafío rápido" },
  testKnowledge:   { fr: "Testez vos connaissances bibliques", ht: "Teste konesans biblik ou", en: "Test your biblical knowledge", es: "Pon a prueba tu conocimiento bíblico" },

  // ── Donation ──────────────────────────────────────────────────────────────
  supportMission:  { fr: "SOUTENEZ LA MISSION", ht: "SIPÒTE MISYON AN",  en: "SUPPORT THE MISSION",  es: "APOYA LA MISIÓN" },
  donationTitle:   { fr: "Votre don construit l'Église connectée", ht: "Don ou bati legliz konekte", en: "Your gift builds the connected Church", es: "Tu donación construye la Iglesia conectada" },
  donationReceived: { fr: "Votre don a bien été reçu. Merci pour votre générosité envers l'œuvre du Seigneur.", ht: "Don ou resevwa. Mèsi pou jenerozite ou nan travay Seyè a.", en: "Your donation was received. Thank you for your generosity.", es: "Tu donación fue recibida. Gracias por tu generosidad." },
  godBlessYou:     { fr: "Que Dieu vous bénisse !", ht: "Ke Bondye beni ou !", en: "God bless you!", es: "¡Dios te bendiga!" },
  makeDonation:    { fr: "❤️ Faire un don",    ht: "❤️ Fè yon don",     en: "❤️ Make a donation",  es: "❤️ Hacer una donación" },
  chooseAmount:    { fr: "Choisissez un montant", ht: "Chwazi yon montan", en: "Choose an amount",   es: "Elige un monto" },
  customAmount:    { fr: "Montant personnalisé (USD)", ht: "Montan pèsonalize (USD)", en: "Custom amount (USD)", es: "Monto personalizado (USD)" },
  enterCustom:     { fr: "Entrer un montant personnalisé", ht: "Antre yon montan pèsonalize", en: "Enter a custom amount", es: "Ingresa un monto personalizado" },
  sslSecured:      { fr: "SSL sécurisé",  ht: "SSL an sekirite", en: "SSL secured",    es: "SSL seguro" },
  donationUsedFor: { fr: "Votre don sert à", ht: "Don ou sèvi pou", en: "Your donation serves", es: "Tu donación sirve para" },
  siteHosting:     { fr: "Hébergement du site", ht: "Ebergman sit la",  en: "Site hosting",     es: "Alojamiento del sitio" },
  biblicalContent: { fr: "Contenu biblique",    ht: "Kontni biblik",    en: "Biblical content",  es: "Contenido bíblico" },
  aiTools:         { fr: "Outils IA bibliques", ht: "Zouti IA biblik",  en: "AI Bible tools",    es: "Herramientas IA bíblicas" },
  globalExpansion: { fr: "Expansion mondiale",  ht: "Ekspansyon mondyal", en: "Global expansion", es: "Expansión mundial" },
  membersCount:    { fr: "membres",             ht: "manm",              en: "members",           es: "miembros" },
  free100:         { fr: "gratuit",             ht: "gratis",            en: "free",              es: "gratis" },

  // ── Next step ─────────────────────────────────────────────────────────────
  nextStepTitle:   { fr: "Que souhaitez-vous faire maintenant ?", ht: "Kisa ou vle fè kounye a ?", en: "What would you like to do next?", es: "¿Qué te gustaría hacer ahora?" },
  whereStart:      { fr: "Par où voulez-vous commencer ?", ht: "Ki kote ou vle kòmanse ?", en: "Where do you want to start?", es: "¿Por dónde quieres empezar?" },

  // ── Errors ────────────────────────────────────────────────────────────────
  errorGeneric:    { fr: "Une erreur est survenue. Réessayez.", ht: "Yon erè rive. Eseye ankò.", en: "An error occurred. Please try again.", es: "Ocurrió un error. Inténtalo de nuevo." },
  error404Title:   { fr: "Page introuvable",       ht: "Paj pa jwenn",       en: "Page not found",       es: "Página no encontrada" },
  error404Desc:    { fr: "Cette page n'existe pas.", ht: "Paj sa a pa egziste.", en: "This page does not exist.", es: "Esta página no existe." },
  connectionError: { fr: "Erreur de connexion. Réessayez.", ht: "Erè koneksyon. Eseye ankò.", en: "Connection error. Please try again.", es: "Error de conexión. Inténtalo de nuevo." },

  // ── Time ──────────────────────────────────────────────────────────────────
  now:             { fr: "maintenant", ht: "kounye a", en: "now", es: "ahora" },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? translations[key]?.["en"] ?? translations[key]?.["fr"] ?? key;
}

// Shorthand for components using useLang
export function tl(key: string, l: Lang): string {
  return t(key, l);
}
