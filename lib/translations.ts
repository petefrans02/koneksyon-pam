export type Lang = "fr" | "ht" | "en";

export type LangText = Partial<Record<Lang, string>> & { fr: string; en: string };
export type LangTextArray = Partial<Record<Lang, string[]>> & { fr: string[]; en: string[] };

// Central translation dictionary — ALL UI strings belong here.
// Add new strings here; never hardcode text in components.
const translations: Record<string, Record<Lang, string>> = {

  // ── App identity ──────────────────────────────────────────────────────────
  appName:        { fr: "KONEKSYON PAM",            ht: "KONEKSYON PAM",                en: "KONEKSYON PAM" },
  tagline:        { fr: "Connectés par la foi",     ht: "Konekte pa lafwa",              en: "Connected by faith" },
  platformType:   { fr: "Plateforme Chrétienne",    ht: "Platfòm Kretyen",               en: "Christian Platform" },
  missionSlogan:  { fr: "UNE MISSION · UN DIEU · UNE VISION", ht: "YON MISYON · YON BONDYE · YON VIZYON", en: "ONE MISSION · ONE GOD · ONE VISION" },

  // ── Navigation ────────────────────────────────────────────────────────────
  today:          { fr: "Aujourd'hui",   ht: "Jodi a",       en: "Today" },
  discover:       { fr: "Découvrir",     ht: "Dekouvri",     en: "Discover" },
  dashboard:      { fr: "Dashboard",     ht: "Dashboard",    en: "Dashboard" },
  home:           { fr: "Accueil",       ht: "Akèy",         en: "Home" },
  myGroups:       { fr: "Mes groupes",   ht: "Gwoup mwen yo",en: "My groups" },

  // ── Sections ─────────────────────────────────────────────────────────────
  sectionPrayer:    { fr: "Prière",        ht: "Lapriyè",    en: "Prayer" },
  sectionStudy:     { fr: "Étude",         ht: "Etid",       en: "Study" },
  sectionTeaching:  { fr: "Enseignement",  ht: "Ansèyman",   en: "Teaching" },
  sectionGames:     { fr: "Jeux",          ht: "Jwèt",       en: "Games" },
  sectionContests:  { fr: "Concours",      ht: "Konkou",     en: "Contests" },
  sectionGroups:    { fr: "Groupes",       ht: "Gwoup",      en: "Groups" },

  // ── Auth ──────────────────────────────────────────────────────────────────
  signIn:         { fr: "Connexion",               ht: "Konekte",               en: "Sign in" },
  signOut:        { fr: "Déconnexion",             ht: "Dekonekte",             en: "Sign out" },
  signInGoogle:   { fr: "Se connecter avec Google",ht: "Konekte ak Google",     en: "Sign in with Google" },
  createAccount:  { fr: "Créer un compte avec Google", ht: "Kreye yon kont ak Google", en: "Create account with Google" },
  loginRequired:  { fr: "Connexion requise",       ht: "Koneksyon obligatwa",   en: "Login required" },
  loginDesc:      { fr: "Connectez-vous pour accéder à toutes les fonctionnalités de KONEKSYON PAM", ht: "Konekte pou jwenn aksè nan tout fonksyonalite KONEKSYON PAM", en: "Sign in to access all KONEKSYON PAM features" },
  loginFreeSafe:  { fr: "Gratuit • Sécurisé • En un clic", ht: "Gratis • An sekirite • Yon klik", en: "Free • Secure • One click" },
  connecting:     { fr: "Connexion en cours...",   ht: "Ap konekte...",          en: "Connecting..." },

  // ── General actions ───────────────────────────────────────────────────────
  submit:         { fr: "Envoyer",         ht: "Voye",          en: "Submit" },
  cancel:         { fr: "Annuler",         ht: "Anile",         en: "Cancel" },
  back:           { fr: "Retour",          ht: "Tounen",        en: "Back" },
  backHome:       { fr: "← Retour à l'accueil", ht: "← Tounen akèy", en: "← Back to home" },
  seeAll:         { fr: "Tout voir →",     ht: "Wè tout →",     en: "See all →" },
  loading:        { fr: "Chargement...",   ht: "Ap chaje...",   en: "Loading..." },
  processing:     { fr: "Traitement...",   ht: "Ap trete...",   en: "Processing..." },
  later:          { fr: "Plus tard",       ht: "Pita",          en: "Later" },
  share:          { fr: "Partager",        ht: "Pataje",        en: "Share" },
  copy:           { fr: "Copier le lien", ht: "Kopye lyen an", en: "Copy link" },
  copied:         { fr: "Lien copié !",   ht: "Lyen kopye !",  en: "Link copied!" },
  open:           { fr: "Accéder →",       ht: "Antre →",       en: "Open →" },
  register:       { fr: "S'inscrire",      ht: "Enskri",        en: "Register" },
  watch:          { fr: "Regarder en direct", ht: "Gade an dirèk", en: "Watch live" },
  join:           { fr: "Rejoindre →",     ht: "Antre →",       en: "Join →" },
  invite:         { fr: "Inviter un ami", ht: "Envite yon zanmi", en: "Invite a friend" },
  startToday:     { fr: "Commencer aujourd'hui", ht: "Kòmanse jodi a", en: "Start today" },

  // ── Prayer wall ───────────────────────────────────────────────────────────
  verseOfDay:     { fr: "Verset du jour",          ht: "Vèsè jou a",          en: "Verse of the day" },
  prayers:        { fr: "Demandes de prière",       ht: "Demann lapriyè",      en: "Prayer requests" },
  prayerButton:   { fr: "J'ai prié 🙏",            ht: "Mwen priye 🙏",       en: "I prayed 🙏" },
  peoplePrayed:   { fr: "personnes ont prié",      ht: "moun te priye",        en: "people prayed" },
  submitPrayer:   { fr: "Soumettre une demande de prière", ht: "Soumèt yon demann lapriyè", en: "Submit a prayer request" },
  yourName:       { fr: "Votre nom (ou anonyme)",  ht: "Non ou (oswa anonim)", en: "Your name (or anonymous)" },
  yourPrayer:     { fr: "Écrivez votre demande de prière...", ht: "Ekri demann lapriyè ou...", en: "Write your prayer request..." },
  prayWithMe:     { fr: "Priez avec moi",          ht: "Priye avèk mwen",     en: "Pray with me" },
  amen:           { fr: "Amen",                    ht: "Amèn",                en: "Amen" },
  anonymous:      { fr: "Anonyme",                 ht: "Anonim",              en: "Anonymous" },
  prayNow:        { fr: "Prier maintenant",        ht: "Priye kounye a",      en: "Pray now" },

  // ── Testimonies ───────────────────────────────────────────────────────────
  testimonies:    { fr: "Témoignages",             ht: "Temwayaj",            en: "Testimonies" },
  shareTestimony: { fr: "Partager un témoignage",  ht: "Pataje yon temwayaj", en: "Share a testimony" },
  yourTestimony:  { fr: "Racontez ce que Dieu a fait dans votre vie...", ht: "Rakonte sa Bondye fè nan lavi ou...", en: "Tell us what God has done in your life..." },

  // ── Bible / Content ───────────────────────────────────────────────────────
  psalms:         { fr: "Psaumes",          ht: "Sòm",           en: "Psalms" },
  listen:         { fr: "Écouter",          ht: "Koute",         en: "Listen" },
  read:           { fr: "Lire",             ht: "Li",            en: "Read" },
  lessons:        { fr: "leçons",           ht: "leson",         en: "lessons" },
  bibleStudy:     { fr: "Études Bibliques", ht: "Etid Biblik",   en: "Bible Studies" },
  studySubtitle:  { fr: "Approfondissez votre connaissance de la Parole de Dieu", ht: "Apwofondi konesans ou nan Pawòl Bondye a", en: "Deepen your knowledge of God's Word" },
  dailyChallenge: { fr: "Défi du jour",     ht: "Defi jou a",    en: "Challenge of the day" },
  seeAnswer:      { fr: "Voir la réponse",  ht: "Wè repons",     en: "See answer" },

  // ── Contests ─────────────────────────────────────────────────────────────
  liveNow:        { fr: "En direct maintenant",  ht: "An dirèk kounye a",  en: "Live now" },
  upcoming:       { fr: "À venir",               ht: "Ap vini",            en: "Upcoming" },
  completed:      { fr: "Terminé",               ht: "Fini",               en: "Completed" },
  voting:         { fr: "Vote ouvert",            ht: "Ap vote",            en: "Voting open" },
  participants:   { fr: "participants",           ht: "patisipan",          en: "participants" },
  leaderboard:    { fr: "Classement",            ht: "Klasman",            en: "Leaderboard" },
  soonAvailable:  { fr: "Bientôt disponible",   ht: "Byento disponib",    en: "Coming soon" },
  almostFull:     { fr: "Presque complet",       ht: "Prèske konplè",      en: "Almost full" },
  spots:          { fr: "places",                ht: "plas",               en: "spots" },
  contestChampion: { fr: "Champion Biblique",   ht: "Chanpyon Biblik",     en: "Biblical Champion" },
  totalVotes:     { fr: "votes au total",        ht: "vòt an total",       en: "total votes" },
  noParticipants: { fr: "Aucun participant encore.", ht: "Pa gen patisipan ankò.", en: "No participants yet." },
  hallOfFame:     { fr: "Hall of Fame",          ht: "Hall of Fame",       en: "Hall of Fame" },
  lastWinners:    { fr: "Derniers vainqueurs",   ht: "Dènye venkè yo",    en: "Last winners" },
  popularContests: { fr: "Concours les plus actifs", ht: "Konkou ki pi aktif yo", en: "Most active contests" },

  // ── Realtime notifications ────────────────────────────────────────────────
  newParticipant: { fr: "Un nouveau participant vient de rejoindre !", ht: "Yon nouvo patisipan rantre !", en: "New participant joined!" },
  newVote:        { fr: "Nouveau vote enregistré !", ht: "Nouvo vòt anrejistre !", en: "New vote recorded!" },
  contestStarted: { fr: "Le concours vient de commencer !", ht: "Konkou a kòmanse !", en: "Contest has started!" },
  votingOpen:     { fr: "Phase de vote ouverte — votez maintenant !", ht: "Faz vote a louvri — vote kounye a !", en: "Voting phase open — vote now!" },

  // ── Stats ─────────────────────────────────────────────────────────────────
  countries:      { fr: "pays connectés",        ht: "peyi konekte",        en: "countries connected" },
  members:        { fr: "membres",               ht: "manm",                en: "members" },
  activeMembers:  { fr: "Membres actifs",        ht: "Manm aktif",          en: "Active members" },
  countriesRep:   { fr: "Pays représentés",      ht: "Peyi reprezante",     en: "Countries" },
  prayersShared:  { fr: "Prières publiées",      ht: "Lapriyè pibliye",     en: "Prayers shared" },
  satisfaction:   { fr: "Satisfaction membres",  ht: "Satisfaksyon manm",   en: "Member satisfaction" },
  connectedNow:   { fr: "connectés maintenant",  ht: "konekte kounye a",    en: "connected now" },

  // ── Groups / Church ───────────────────────────────────────────────────────
  myGroup:        { fr: "Mon groupe d'église", ht: "Gwoup legliz mwen", en: "My church group" },
  churchGroups:   { fr: "Groupes d'Église",    ht: "Gwoup Legliz",      en: "Church Groups" },
  newGroups:      { fr: "Nouveaux groupes",    ht: "Nouvo gwoup",       en: "New groups" },

  // ── Sharing ───────────────────────────────────────────────────────────────
  sharePrompt:    { fr: "Partagez cette expérience avec votre communauté", ht: "Pataje eksperyans sa a ak kominote ou a", en: "Share this experience with your community" },
  friendNeeds:    { fr: "Un ami pourrait avoir besoin de ça aujourd'hui.", ht: "Yon zanmi ka bezwen sa a jodi a.", en: "A friend might need this today." },
  shareWithChurch: { fr: "Partager avec mon église", ht: "Pataje ak legliz mwen", en: "Share with my church" },

  // ── Discover tabs ─────────────────────────────────────────────────────────
  tabToday:       { fr: "Aujourd'hui",  ht: "Jodi a",    en: "Today" },
  tabTrending:    { fr: "Tendances",    ht: "Tandans",   en: "Trending" },
  tabNew:         { fr: "Nouveautés",   ht: "Nouvote",   en: "New" },
  tabCommunity:   { fr: "Communauté",   ht: "Kominote",  en: "Community" },

  // ── Welcome popup ─────────────────────────────────────────────────────────
  welcomeTitle:   { fr: "Bienvenue ! 🙏",  ht: "Byenveni ! 🙏",  en: "Welcome! 🙏" },
  welcomeDesc:    { fr: "Bienvenue sur la plateforme des chrétiens connectés. Créez un compte gratuitement et rejoignez cette belle famille !", ht: "Byenveni sou platfòm kretyen ki konekte. Kreye yon kont gratis epi rantre nan bèl fanmi sa a !", en: "Welcome to the platform for connected Christians. Create a free account and join this beautiful family!" },

  // ── About ─────────────────────────────────────────────────────────────────
  about:          { fr: "À propos",     ht: "Konsènan",  en: "About" },
  ourMission:     { fr: "Notre Mission",ht: "Misyon Nou",en: "Our Mission" },
  ourServices:    { fr: "Nos Services", ht: "Sèvis Nou", en: "Our Services" },

  // ── Countdown labels ─────────────────────────────────────────────────────
  days:    { fr: "Jours",    ht: "Jou",      en: "Days" },
  hours:   { fr: "Heures",   ht: "Èd tan",   en: "Hours" },
  minutes: { fr: "Min",      ht: "Min",      en: "Min" },
  seconds: { fr: "Sec",      ht: "Sek",      en: "Sec" },

  // ── Community ─────────────────────────────────────────────────────────────
  globalCommunity: { fr: "Notre communauté mondiale", ht: "Kominote mondyal nou an", en: "Our global community" },
  inviteCommunity: { fr: "Inviter ma communauté",     ht: "Envite kominote mwen",   en: "Invite my community" },
  missionaryAct:   { fr: "Un ami qui découvre la Parole de Dieu grâce à vous — c'est un acte missionnaire.", ht: "Yon zanmi ki dekouvri Pawòl Bondye a gras a ou — se yon zak misyonè.", en: "A friend who discovers God's Word because of you — that is a missionary act." },

  // ── Quick challenge ───────────────────────────────────────────────────────
  quickChallenge:  { fr: "Défi rapide",   ht: "Defi rapid", en: "Quick challenge" },
  testKnowledge:   { fr: "Testez vos connaissances bibliques", ht: "Teste konesans biblik ou", en: "Test your biblical knowledge" },

  // ── Donation ──────────────────────────────────────────────────────────────
  supportMission:  { fr: "SOUTENEZ LA MISSION", ht: "SIPÒTE MISYON AN",  en: "SUPPORT THE MISSION" },
  donationTitle:   { fr: "Votre don construit l'Église connectée", ht: "Don ou bati legliz konekte", en: "Your gift builds the connected Church" },
  donationReceived: { fr: "Votre don a bien été reçu. Merci pour votre générosité envers l'œuvre du Seigneur.", ht: "Don ou resevwa. Mèsi pou jenerozite ou nan travay Seyè a.", en: "Your donation was received. Thank you for your generosity." },
  godBlessYou:     { fr: "Que Dieu vous bénisse !", ht: "Ke Bondye beni ou !", en: "God bless you!" },
  makeDonation:    { fr: "❤️ Faire un don",    ht: "❤️ Fè yon don",     en: "❤️ Make a donation" },
  chooseAmount:    { fr: "Choisissez un montant", ht: "Chwazi yon montan", en: "Choose an amount" },
  customAmount:    { fr: "Montant personnalisé (USD)", ht: "Montan pèsonalize (USD)", en: "Custom amount (USD)" },
  enterCustom:     { fr: "Entrer un montant personnalisé", ht: "Antre yon montan pèsonalize", en: "Enter a custom amount" },
  sslSecured:      { fr: "SSL sécurisé",  ht: "SSL an sekirite", en: "SSL secured" },
  donationUsedFor: { fr: "Votre don sert à", ht: "Don ou sèvi pou", en: "Your donation serves" },
  siteHosting:     { fr: "Hébergement du site", ht: "Ebergman sit la",  en: "Site hosting" },
  biblicalContent: { fr: "Contenu biblique",    ht: "Kontni biblik",    en: "Biblical content" },
  aiTools:         { fr: "Outils IA bibliques", ht: "Zouti IA biblik",  en: "AI Bible tools" },
  globalExpansion: { fr: "Expansion mondiale",  ht: "Ekspansyon mondyal", en: "Global expansion" },
  membersCount:    { fr: "membres",             ht: "manm",              en: "members" },
  free100:         { fr: "gratuit",             ht: "gratis",            en: "free" },

  // ── Next step ─────────────────────────────────────────────────────────────
  nextStepTitle:   { fr: "Que souhaitez-vous faire maintenant ?", ht: "Kisa ou vle fè kounye a ?", en: "What would you like to do next?" },
  whereStart:      { fr: "Par où voulez-vous commencer ?", ht: "Ki kote ou vle kòmanse ?", en: "Where do you want to start?" },

  // ── Errors ────────────────────────────────────────────────────────────────
  errorGeneric:    { fr: "Une erreur est survenue. Réessayez.", ht: "Yon erè rive. Eseye ankò.", en: "An error occurred. Please try again." },
  error404Title:   { fr: "Page introuvable",       ht: "Paj pa jwenn",       en: "Page not found" },
  error404Desc:    { fr: "Cette page n'existe pas.", ht: "Paj sa a pa egziste.", en: "This page does not exist." },
  connectionError: { fr: "Erreur de connexion. Réessayez.", ht: "Erè koneksyon. Eseye ankò.", en: "Connection error. Please try again." },

  // ── Time ──────────────────────────────────────────────────────────────────
  now:             { fr: "maintenant", ht: "kounye a", en: "now" },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? translations[key]?.["en"] ?? translations[key]?.["fr"] ?? key;
}

// Shorthand for components using useLang
export function tl(key: string, l: Lang): string {
  return t(key, l);
}
