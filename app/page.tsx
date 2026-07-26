"use client";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import ShareButtons from "@/app/components/ShareButtons";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

const SLIDES = [
  {
    id: "championnats",
    gradient: "linear-gradient(135deg, #0d0820 0%, #1a1240 40%, #0a0618 100%)",
    accent: "#c8960f",
    badge: { fr: "🏆 Championnat Biblique Mondial", en: "🏆 World Bible Championship", ht: "🏆 Chanpyona Biblik Mondyal", es: "🏆 Campeonato Bíblico Mundial" },
    title: { fr: "Le grand Championnat\nBiblique Mondial.", en: "The great World\nBible Championship.", ht: "Gwo Chanpyona\nBiblik Mondyal la.", es: "El gran Campeonato\nBíblico Mundial." },
    sub:   { fr: "Des compétitions interactives EN DIRECT, équipe contre équipe, avec des croyants du monde entier. Apprendre la Parole n'a jamais été aussi captivant.", en: "LIVE interactive competitions, team vs team, with believers worldwide. Learning the Word has never been so captivating.", ht: "Konpetisyon entèaktif AN DIRÈK, ekip kont ekip, ak kwayan toupatou. Apran Pawòl la pa t janm konsa.", es: "Competencias interactivas EN VIVO, equipo contra equipo, con creyentes del mundo entero. Aprender la Palabra nunca fue tan cautivador." },
    cta1href: "/championnat",
    cta1: { fr: "Regarder en direct", en: "Watch live", ht: "Gade an dirèk", es: "Ver en vivo" },
    cta2href: "/championnats",
    cta2: { fr: "Rejoindre un championnat", en: "Join a championship", ht: "Antre nan yon chanpyona", es: "Unirse a un campeonato" },
    icon: "trophee" as IconName,
    glow: "rgba(200,150,15,0.20)",
    orb1: "rgba(80,40,120,0.70)",
    orb2: "rgba(200,150,15,0.22)",
  },
  {
    id: "academie",
    gradient: "linear-gradient(135deg, #061820 0%, #0b2d30 40%, #071e20 100%)",
    accent: "#00aac8",
    badge: { fr: "📚 Académie Biblique", en: "📚 Biblical Academy", ht: "📚 Akademi Biblik", es: "📚 Academia Bíblica" },
    title: { fr: "Apprends et grandis\ndans la Parole de Dieu.", en: "Learn and grow\nin the Word of God.", ht: "Aprann epi grandi\nnan Pawòl Bondye.", es: "Aprende y crece\nen la Palabra de Dios." },
    sub:   { fr: "Des parcours bibliques structurés, des cours et des quiz — 100% gratuits. Une vraie plateforme d'éducation biblique, à ton rythme.", en: "Structured biblical courses, lessons and quizzes — 100% free. A real Bible education platform, at your pace.", ht: "Kous biblik estrikti, leson ak kiz — 100% gratis. Yon vrè platfòm edikasyon biblik, nan ritmou ou.", es: "Cursos bíblicos estructurados, lecciones y quizzes — 100% gratis. Una verdadera plataforma de educación bíblica, a tu ritmo." },
    cta1href: "/academie",
    cta1: { fr: "Commencer à apprendre", en: "Start learning", ht: "Kòmanse aprann", es: "Empezar a aprender" },
    cta2href: "/etude",
    cta2: { fr: "Études bibliques", en: "Bible studies", ht: "Etid biblik", es: "Estudios bíblicos" },
    icon: "bible" as IconName,
    glow: "rgba(0,170,200,0.18)",
    orb1: "rgba(0,85,100,0.70)",
    orb2: "rgba(0,200,180,0.20)",
  },
  {
    id: "mission",
    gradient: "linear-gradient(135deg, #06122a 0%, #0d2048 40%, #0a1830 100%)",
    accent: "#c8960f",
    badge: { fr: "🌍 Le Mouvement", en: "🌍 The Movement", ht: "🌍 Mouvman an", es: "🌍 El Movimiento" },
    title: { fr: "Vis ta foi,\nau-delà des frontières.", en: "Live your faith,\nbeyond borders.", ht: "Viv lafwa ou,\nopòte fwontyè yo.", es: "Vive tu fe,\nmás allá de las fronteras." },
    sub:   { fr: "Rejoins une communauté mondiale de croyants qui apprennent, jouent et grandissent ensemble — présente dans 12 pays.", en: "Join a global community of believers who learn, play and grow together — across 12 countries.", ht: "Antre nan yon kominote mondyal kwayan k ap aprann, jwe epi grandi ansanm — nan 12 peyi.", es: "Únete a una comunidad mundial de creyentes que aprenden, juegan y crecen juntos — en 12 países." },
    cta1href: "/dashboard",
    cta1: { fr: "Rejoindre la communauté", en: "Join the community", ht: "Antre nan kominote a", es: "Unirse a la comunidad" },
    cta2href: "/championnat",
    cta2: { fr: "Le Championnat en direct", en: "The live Championship", ht: "Chanpyona an dirèk", es: "El Campeonato en vivo" },
    icon: "croix" as IconName,
    glow: "rgba(200,150,15,0.18)",
    orb1: "rgba(26,53,104,0.70)",
    orb2: "rgba(0,170,200,0.25)",
  },
  {
    id: "impact",
    gradient: "linear-gradient(135deg, #0a1a10 0%, #0d2d18 40%, #081408 100%)",
    accent: "#52b788",
    badge: { fr: "🤝 Ensemble", en: "🤝 Together", ht: "🤝 Ansanm", es: "🤝 Juntos" },
    title: { fr: "Ensemble,\non transforme des vies.", en: "Together,\nwe transform lives.", ht: "Ansanm,\nn ap transfòme lavi.", es: "Juntos,\ntransformamos vidas." },
    sub:   { fr: "Des milliers de croyants apprennent, prient et grandissent ensemble. Ton engagement fait grandir le mouvement, concrètement.", en: "Thousands of believers learn, pray and grow together. Your engagement grows the movement, concretely.", ht: "Dè milye kwayan ap aprann, priye epi grandi ansanm. Angajman ou fè mouvman an grandi, konkrètman.", es: "Miles de creyentes aprenden, oran y crecen juntos. Tu compromiso hace crecer el movimiento, concretamente." },
    cta1href: "/dashboard",
    cta1: { fr: "Rejoindre le mouvement", en: "Join the movement", ht: "Antre nan mouvman an", es: "Unirse al movimiento" },
    cta2href: "/communaute",
    cta2: { fr: "La communauté", en: "The community", ht: "Kominote a", es: "La comunidad" },
    icon: "monde" as IconName,
    glow: "rgba(82,183,136,0.15)",
    orb1: "rgba(30,80,45,0.70)",
    orb2: "rgba(82,183,136,0.25)",
  },
];

// Fallback membres partagé avec /decouvrir — même valeur sur les deux pages
// pour éviter toute contradiction si l'API /api/platform-stats est indisponible.
const FALLBACK_MEMBERS = 500;

const STATS: { id: string; icon: IconName; value: number; suffix: string; fr: string; en: string; ht: string; es: string }[] = [
  { id: "pays",     icon: "monde",        value: 12,    suffix: "+", fr: "Pays",    en: "Countries", ht: "Peyi",   es: "Países"     },
  { id: "membres",  icon: "utilisateurs", value: 24000, suffix: "+", fr: "Membres", en: "Members",   ht: "Manm",   es: "Miembros"   },
  { id: "gratuit",  icon: "bible",        value: 100,   suffix: "%", fr: "Gratuit", en: "Free",      ht: "Gratis", es: "Gratuito"   },
  { id: "champ",    icon: "trophee",      value: 500,   suffix: "+", fr: "Champ.",  en: "Champ.",    ht: "Chanp.", es: "Campeonatos" },
];

const ACADEMY_COURSES: { id: string; icon: IconName; fr: string; en: string; lessons: number; active: boolean }[] = [
  { id: "foi",      icon: "bible",    fr: "Fondements de la Foi", en: "Foundations of Faith", lessons: 8,  active: true  },
  { id: "nt",       icon: "academie", fr: "Nouveau Testament",    en: "New Testament",        lessons: 12, active: true  },
  { id: "theo",     icon: "croix",    fr: "Théologie Biblique",   en: "Biblical Theology",    lessons: 10, active: false },
  { id: "priere",   icon: "priere",   fr: "Vie de Prière",        en: "Life of Prayer",       lessons: 6,  active: false },
];

const PROGRAMMES: { id: string; icon: IconName; href: string; color: string; fr: string; en: string; descFr: string; descEn: string }[] = [
  { id: "champ",  icon: "trophee", href: "/championnats", color: "#c8960f", fr: "Championnats Bibliques", en: "Biblical Championships", descFr: "Compétitions interactives mondiales",          descEn: "Global interactive competitions"          },
  { id: "bible",  icon: "bible",   href: "/bible",         color: "#2563eb", fr: "Bible & Études",          en: "Bible & Studies",        descFr: "Lire, Étudier, Méditer la Parole",            descEn: "Read, Study, Meditate on the Word"        },
  { id: "acad",   icon: "academie",href: "/academie",      color: "#00aac8", fr: "Académie Biblique",       en: "Biblical Academy",       descFr: "Parcours guidés pour grandir dans la foi",    descEn: "Guided courses to grow in faith"          },
  { id: "prier",  icon: "priere",  href: "/prieres",       color: "#7c3aed", fr: "Prière",                  en: "Prayer",                 descFr: "Mur de prières, intercession collective",     descEn: "Prayer wall, collective intercession"     },
  { id: "louange",icon: "louange", href: "/louange",       color: "#ec4899", fr: "Louange & Adoration",     en: "Worship & Praise",       descFr: "Chants, Psaumes, Adoration",                  descEn: "Worship, Psalms, Adoration"               },
  { id: "comm",   icon: "utilisateurs", href: "/communaute", color: "#16a34a", fr: "Communauté",              en: "Community",              descFr: "Témoignages, discussions, connexions",        descEn: "Testimonies, discussions, connections"    },
];

// Verset du jour — sélection déterministe par date.
const DAILY_VERSES: { ref: string; fr: string; en: string; ht: string; es: string }[] = [
  { ref: "Jean 3:16",        fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique.", en: "For God so loved the world that he gave his one and only Son.", ht: "Paske Bondye sitèlman renmen lèzòm, li bay sèl Pitit li a.", es: "Porque tanto amó Dios al mundo, que dio a su Hijo unigénito." },
  { ref: "Philippiens 4:13", fr: "Je puis tout par celui qui me fortifie.", en: "I can do all things through Christ who strengthens me.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", es: "Todo lo puedo en Cristo que me fortalece." },
  { ref: "Psaumes 23:1",     fr: "L'Éternel est mon berger : je ne manquerai de rien.", en: "The Lord is my shepherd — I lack nothing.", ht: "Seyè a se gadò mwen — mwen p ap manke anyen.", es: "El Señor es mi pastor — nada me faltará." },
  { ref: "Ésaïe 40:31",      fr: "Ceux qui se confient en l'Éternel renouvellent leur force.", en: "Those who hope in the Lord will renew their strength.", ht: "Moun ki espere nan Seyè a va ranplase fòs yo.", es: "Los que esperan en el Señor renovarán sus fuerzas." },
  { ref: "Jérémie 29:11",    fr: "Je connais les projets que j'ai formés sur vous : projets de paix.", en: "For I know the plans I have for you — plans to give you hope.", ht: "Mwen konnen plan mwen genyen pou nou : plan pou fè nou jwenn lapè.", es: "Yo sé los planes que tengo para ustedes: planes de paz." },
  { ref: "Matthieu 11:28",   fr: "Venez à moi, vous tous qui êtes fatigués, et je vous donnerai du repos.", en: "Come to me, all you who are weary, and I will give you rest.", ht: "Vini jwenn mwen, nou tout ki fatige, m ap ba nou repo.", es: "Vengan a mí todos los que están fatigados, y yo les daré descanso." },
  { ref: "Proverbes 3:5",    fr: "Confie-toi en l'Éternel de tout ton cœur.", en: "Trust in the Lord with all your heart.", ht: "Mete konfyans ou nan Seyè a ak tout kè ou.", es: "Confía en el Señor con todo tu corazón." },
  { ref: "Josué 1:9",        fr: "Fortifie-toi et prends courage, car l'Éternel ton Dieu est avec toi partout où tu iras.", en: "Be strong and courageous, for the Lord your God is with you wherever you go.", ht: "Pran kouraj, kanpe fèm, paske Senyè a, Bondye ou la, ap avèk ou tout kote ou prale.", es: "Esfuérzate y sé valiente, porque el Señor tu Dios estará contigo dondequiera que vayas." },
  { ref: "Romains 8:28",     fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.", en: "In all things God works for the good of those who love him.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.", es: "Todas las cosas ayudan a bien a los que aman a Dios." },
  { ref: "Psaumes 46:1",     fr: "Dieu est pour nous un refuge et un appui, un secours toujours présent dans la détresse.", en: "God is our refuge and strength, an ever-present help in trouble.", ht: "Bondye se pwoteksyon nou ak fòs nou, yon sekou ki toujou la nan tan difisil.", es: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones." },
  { ref: "Ésaïe 41:10",      fr: "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu.", en: "Do not fear, for I am with you; do not be dismayed, for I am your God.", ht: "Ou pa bezwen pè, paske mwen la avè ou. Pa kite anyen bat ou, se mwen ki Bondye ou.", es: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios." },
  { ref: "Matthieu 6:33",    fr: "Cherchez premièrement le royaume et la justice de Dieu.", en: "Seek first the kingdom of God and his righteousness.", ht: "Chèche anvan tout bagay pou nou nan peyi kote Bondye wa a, epi fè volonte li.", es: "Buscad primeramente el reino de Dios y su justicia." },
  { ref: "Psaumes 27:1",     fr: "L'Éternel est ma lumière et mon salut : de qui aurais-je peur ?", en: "The Lord is my light and my salvation — whom shall I fear?", ht: "Seyè a se limyè mwen ak delivrans mwen — ki moun mwen ta pè ?", es: "El Señor es mi luz y mi salvación, ¿de quién temeré?" },
  { ref: "Jean 14:6",        fr: "Je suis le chemin, la vérité et la vie.", en: "I am the way, the truth and the life.", ht: "Se mwen menm ki chemen an, verite a ak lavi a.", es: "Yo soy el camino, la verdad y la vida." },
  { ref: "2 Corinthiens 5:17", fr: "Si quelqu'un est en Christ, il est une nouvelle création.", en: "If anyone is in Christ, he is a new creation.", ht: "Si yon moun nan Kris la, li tounen yon lòt moun nèf.", es: "Si alguno está en Cristo, nueva criatura es." },
  { ref: "Psaumes 119:105",  fr: "Ta parole est une lampe à mes pieds et une lumière sur mon sentier.", en: "Your word is a lamp for my feet, a light on my path.", ht: "Pawòl ou se yon lanp ki klere pye m, yon limyè sou chemen m.", es: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino." },
  { ref: "1 Corinthiens 13:4", fr: "L'amour est patient, il est plein de bonté.", en: "Love is patient, love is kind.", ht: "Renmen gen pasyans, renmen gen bon kè.", es: "El amor es paciente, es bondadoso." },
  { ref: "Romains 12:2",     fr: "Ne vous conformez pas au monde présent, mais soyez transformés par le renouvellement de votre intelligence.", en: "Do not conform to this world, but be transformed by the renewing of your mind.", ht: "Pa fè tankou moun k ap viv nan lemonn, men kite Bondye chanje nou nan renouvle lespri nou.", es: "No os conforméis a este mundo, sino transformaos por la renovación de vuestro entendimiento." },
  { ref: "Galates 2:20",     fr: "Ce n'est plus moi qui vis, c'est Christ qui vit en moi.", en: "It is no longer I who live, but Christ lives in me.", ht: "Se pa mwen k ap viv ankò, se Kris k ap viv nan mwen.", es: "Ya no vivo yo, mas vive Cristo en mí." },
  { ref: "Hébreux 11:1",     fr: "La foi est une ferme assurance des choses qu'on espère.", en: "Faith is confidence in what we hope for.", ht: "Lafwa se yon asirans fèm pou bagay n ap espere yo.", es: "La fe es la certeza de lo que se espera." },
  { ref: "Psaumes 37:4",     fr: "Fais de l'Éternel tes délices, et il te donnera ce que ton cœur désire.", en: "Delight yourself in the Lord, and he will give you the desires of your heart.", ht: "Mete kè ou kontan nan Seyè a, l ap ba ou tou sa kè ou anvi.", es: "Deléitate en el Señor, y él te concederá los deseos de tu corazón." },
  { ref: "Jean 8:12",        fr: "Je suis la lumière du monde ; celui qui me suit ne marchera pas dans les ténèbres.", en: "I am the light of the world; whoever follows me will not walk in darkness.", ht: "Se mwen menm ki limyè lemonn. Moun ki swiv mwen p ap mache nan fènwa.", es: "Yo soy la luz del mundo; el que me sigue no andará en tinieblas." },
  { ref: "Psaumes 91:1",     fr: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant.", en: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty.", ht: "Moun ki chache pwoteksyon bò kote Bondye ki anwo nèt la ap pase nwit li anba zèl Bondye ki gen tout pouvwa a.", es: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente." },
  { ref: "Ésaïe 26:3",       fr: "À celui qui est ferme dans ses sentiments tu assures la paix.", en: "You will keep in perfect peace those whose minds are steadfast.", ht: "W ap kenbe nan yon lapè pafè moun ki gen konfyans fèm nan ou.", es: "Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera." },
  { ref: "1 Jean 4:19",      fr: "Nous l'aimons, parce qu'il nous a aimés le premier.", en: "We love because he first loved us.", ht: "Nou renmen paske se li menm ki renmen nou anvan.", es: "Nosotros le amamos a él, porque él nos amó primero." },
  { ref: "Psaumes 34:8",     fr: "Goûtez et voyez combien l'Éternel est bon !", en: "Taste and see that the Lord is good.", ht: "Goute, epi wè jan Seyè a bon !", es: "Gustad, y ved que es bueno el Señor." },
  { ref: "Romains 15:13",    fr: "Que le Dieu de l'espérance vous remplisse de toute joie et de toute paix.", en: "May the God of hope fill you with all joy and peace.", ht: "Se pou Bondye ki bay espwa a plen nou ak kè kontan ak lapè.", es: "El Dios de esperanza os llene de todo gozo y paz." },
  { ref: "Deutéronome 31:6", fr: "Fortifiez-vous et ayez du courage : c'est l'Éternel qui marche lui-même avec toi.", en: "Be strong and courageous; the Lord your God goes with you.", ht: "Pran kouraj, kanpe fèm : se Seyè a menm k ap mache avèk ou.", es: "Esforzaos y cobrad ánimo; el Señor tu Dios es el que va contigo." },
  { ref: "Jean 16:33",       fr: "Prenez courage, j'ai vaincu le monde.", en: "Take heart! I have overcome the world.", ht: "Pran kouraj, mwen deja genyen batay la sou lemonn.", es: "Confiad, yo he vencido al mundo." },
  { ref: "Sophonie 3:17",    fr: "L'Éternel ton Dieu est au milieu de toi, comme un héros qui sauve.", en: "The Lord your God is with you, the Mighty Warrior who saves.", ht: "Seyè a, Bondye ou la, nan mitan ou. Se yon vanyan gason k ap delivre.", es: "El Señor tu Dios está en medio de ti, poderoso para salvar." },
];

const TESTIMONIALS = [
  { id: "t1", name: "Marie-Chantal D.", location: "Montréal, Canada",         textFr: "Cette plateforme a transformé ma façon d'étudier la Bible. Je me sens connectée à des croyants du monde entier.",                                             textEn: "This platform transformed the way I study the Bible. I feel connected to believers worldwide.",                           textHt: "Platfòm sa a transfòme fason mwen etidye Bib la. Mwen santi mwen konekte ak kwayan toupatou.",                             textEs: "Esta plataforma transformó mi forma de estudiar la Biblia. Me siento conectada con creyentes de todo el mundo."           },
  { id: "t2", name: "Jean-Baptiste M.", location: "Port-au-Prince, Haïti",    textFr: "Les championnats m'ont motivé à mémoriser des centaines de versets. Dieu m'a vraiment touché à travers ce ministère.",                                        textEn: "The championships motivated me to memorize hundreds of verses. God truly touched me through this ministry.",               textHt: "Chanpyona yo motive m pou memorize santin vèsè. Bondye vrèman touche m nan ministè sa a.",                                 textEs: "Los campeonatos me motivaron a memorizar cientos de versículos. Dios me tocó verdaderamente a través de este ministerio." },
  { id: "t3", name: "Esther K.",        location: "Abidjan, Côte d'Ivoire",   textFr: "Grâce à l'Académie Biblique, j'ai pu approfondir ma foi comme jamais auparavant. C'est un vrai cadeau pour l'Église africaine.",                             textEn: "Thanks to the Biblical Academy, I was able to deepen my faith like never before. It's a true gift for the African church.", textHt: "Gras a Akademi Biblik la, mwen te ka apwofondi lafwa m jan mwen pa t janm fè anvan. Se yon vrè kado pou Legliz Afriken an.", textEs: "Gracias a la Academia Bíblica, pude profundizar mi fe como nunca antes. Es un verdadero regalo para la iglesia africana."  },
];

const IMPACT_GOALS: { id: string; icon: IconName; color: string; goal: number; current: number; fr: string; en: string }[] = [
  { id: "bibles",  icon: "bible",    color: "#00aac8", goal: 500,  current: 0,   fr: "Bibles distribuées",     en: "Bibles distributed"   },
  { id: "enfants", icon: "enfant",   color: "#c8960f", goal: 200,  current: 0,   fr: "Enfants soutenus",       en: "Children supported"   },
  { id: "pays",    icon: "monde",    color: "#52b788", goal: 15,   current: 12,  fr: "Pays touchés",           en: "Countries reached"    },
  { id: "disci",   icon: "academie", color: "#1a3568", goal: 1000, current: 0,   fr: "Disciples formés",       en: "Disciples trained"    },
  { id: "champ",   icon: "trophee",  color: "#c8960f", goal: 1000, current: 500, fr: "Championnats organisés", en: "Championships held"   },
];

function useCountUp(target: number, triggered: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!triggered) return;
    let current = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [triggered, target, duration]);
  return count;
}

function StatItem({ stat, triggered, l, color }: { stat: typeof STATS[0]; triggered: boolean; l: Lang; color?: string }) {
  const count = useCountUp(stat.value, triggered);
  const display = stat.value >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${count}`;
  const label = stat[l as keyof typeof stat] as string | undefined;
  const col = color ?? "#1a3568";
  return (
    <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
      <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: "clamp(2rem,4vw,2.6rem)", color: col, lineHeight: 1 }}>
        {display}{stat.suffix}
      </div>
      <div style={{ color: "#4a6080", fontSize: "0.82rem", fontWeight: 600, marginTop: 6 }}>
        {label ?? stat.fr}
      </div>
    </div>
  );
}

/* ── Newsletter Component ── */
function NewsletterSection({ l }: { l: Lang }) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [status,    setStatus]    = useState<"idle"|"loading"|"ok"|"err">("idle");

  const txt = {
    title:   { fr:"Rejoignez la Mission",              en:"Join the Mission",              ht:"Rantre nan Misyon an",        es:"Únase a la Misión"              },
    sub:     { fr:"Recevez en premier nos actualités, projets humanitaires et ressources bibliques. Restez connecté à la Fondation.",
               en:"Be the first to know about our news, humanitarian projects and biblical resources. Stay connected to the Foundation.",
               ht:"Resevwa premye nouvèl nou yo, pwojè imanitè ak resous biblik. Rete konekte ak Fondasyon an.",
               es:"Sea el primero en conocer nuestras noticias, proyectos humanitarios y recursos bíblicos. Manténgase conectado con la Fundación." },
    fname:   { fr:"Prénom (optionnel)",  en:"First Name (optional)",  ht:"Prenon (opsyonèl)",  es:"Nombre (opcional)"  },
    lname:   { fr:"Nom (optionnel)",     en:"Last Name (optional)",   ht:"Siyati (opsyonèl)",  es:"Apellido (opcional)" },
    email:   { fr:"Adresse e-mail",      en:"Email address",          ht:"Adrès e-mail",        es:"Correo electrónico"  },
    submit:  { fr:"S'INSCRIRE",          en:"SUBSCRIBE",              ht:"ENSKRI",               es:"SUSCRIBIRSE"         },
    ok:      { fr:"Inscription confirmée ! Merci de soutenir la mission.", en:"Subscribed! Thank you for supporting the mission.", ht:"Enskripsyon konfime! Mèsi pou sipòte misyon an.", es:"¡Suscripción confirmada! Gracias por apoyar la misión." },
    err:     { fr:"Une erreur est survenue. Réessayez.", en:"An error occurred. Please try again.", ht:"Yon erè rive. Eseye ankò.", es:"Ocurrió un error. Inténtelo de nuevo." },
  };

  const t = (k: keyof typeof txt) => txt[k][l] ?? txt[k].fr;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: firstName, last_name: lastName, lang: l }),
      });
      setStatus(res.ok ? "ok" : "err");
    } catch { setStatus("err"); }
  }

  return (
    <section style={{
      background: "linear-gradient(135deg, #0a1628 0%, #1a3568 50%, #0a1628 100%)",
      padding: "0 24px", position: "relative", overflow: "hidden",
    }}>
      {/* Motif de fond */}
      <div style={{
        position:"absolute", inset:0, opacity:0.04,
        backgroundImage:"radial-gradient(#00aac8 1px, transparent 1px)",
        backgroundSize:"32px 32px", pointerEvents:"none",
      }} />
      <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:1 }}>
        <div className="kpf-newsletter-grid" style={{
          display:"grid", gridTemplateColumns:"1fr 1px 1fr", gap:"0 48px",
          alignItems:"center", padding:"64px 0",
        }}>

          {/* Gauche — texte */}
          <div>
            <h2 style={{
              fontFamily:"'Playfair Display',Georgia,serif",
              fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:900,
              color:"#00aac8", marginBottom:12, lineHeight:1.2,
            }}>
              {t("title")}
            </h2>
            <p style={{ color:"rgba(255,255,255,0.72)", fontSize:"0.95rem", lineHeight:1.7 }}>
              {t("sub")}
            </p>
          </div>

          {/* Séparateur vertical */}
          <div className="kpf-newsletter-sep" style={{ background:"rgba(0,170,200,0.30)", height:"100%", minHeight:120 }} />

          {/* Droite — formulaire */}
          <div>
            {status === "ok" ? (
              <div style={{
                background:"rgba(0,170,200,0.12)", border:"1px solid rgba(0,170,200,0.30)",
                borderRadius:16, padding:"24px 20px", color:"#00aac8",
                fontWeight:700, fontSize:"0.95rem", textAlign:"center",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}>
                <Icon name="succes" size={18} /> {t("ok")}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}
                  className="grid grid-cols-1 sm:grid-cols-2">
                  <input
                    type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder={t("fname")}
                    style={{
                      padding:"14px 18px", borderRadius:999,
                      border:"1.5px solid rgba(255,255,255,0.15)",
                      background:"rgba(255,255,255,0.07)",
                      color:"#fff", fontSize:"0.88rem", outline:"none",
                      transition:"border-color .2s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "rgba(0,170,200,0.60)")}
                    onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                  />
                  <input
                    type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder={t("lname")}
                    style={{
                      padding:"14px 18px", borderRadius:999,
                      border:"1.5px solid rgba(255,255,255,0.15)",
                      background:"rgba(255,255,255,0.07)",
                      color:"#fff", fontSize:"0.88rem", outline:"none",
                      transition:"border-color .2s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "rgba(0,170,200,0.60)")}
                    onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                  />
                </div>
                <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.07)", borderRadius:999, border:"1.5px solid rgba(255,255,255,0.15)", overflow:"hidden" }}>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={t("email")}
                    style={{
                      flex:1, padding:"14px 20px",
                      background:"transparent", border:"none",
                      color:"#fff", fontSize:"0.88rem", outline:"none",
                    }}
                  />
                  <button type="submit" disabled={status === "loading"}
                    style={{
                      padding:"14px 24px", borderRadius:999,
                      background: status === "loading" ? "rgba(0,170,200,0.50)" : "#00aac8",
                      color:"#0a1628", fontWeight:900, fontSize:"0.82rem",
                      letterSpacing:"0.10em", border:"none", cursor:"pointer",
                      transition:"background .2s", flexShrink:0,
                    }}>
                    {status === "loading" ? "..." : t("submit")}
                  </button>
                </div>
                {status === "err" && (
                  <p style={{ color:"#f87171", fontSize:"0.78rem", textAlign:"center" }}>{t("err")}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;

  // Vrais chiffres publics (comptes réels) via l'API existante.
  // Fallback partagé avec /decouvrir pour rester cohérent si l'API échoue.
  const [realMembers, setRealMembers] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/platform-stats")
      .then(r => r.json())
      .then(d => { if (typeof d?.members === "number" && d.members > 0) setRealMembers(d.members); })
      .catch(() => {});
  }, []);

  // Le nombre de membres est branché sur la vraie valeur ; le reste reste tel quel.
  const stats = STATS.map(s =>
    s.id === "membres" ? { ...s, value: realMembers ?? FALLBACK_MEMBERS } : s
  );

  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => { setCurrent(idx); setTransitioning(false); }, 400);
  }, [transitioning]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsTriggered, setStatsTriggered] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsTriggered(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const impactRef = useRef<HTMLDivElement>(null);
  const [impactVis, setImpactVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setImpactVis(true); }, { threshold: 0.2 });
    if (impactRef.current) obs.observe(impactRef.current);
    return () => obs.disconnect();
  }, []);

  const [testi, setTesti] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTesti(c => (c + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const missionRef  = useRef<HTMLDivElement>(null);
  const acadRef     = useRef<HTMLDivElement>(null);
  const progRef     = useRef<HTMLDivElement>(null);
  const [missionVis, setMissionVis] = useState(false);
  const [acadVis,    setAcadVis]    = useState(false);
  const [progVis,    setProgVis]    = useState(false);
  useEffect(() => {
    const make = (setter: (v: boolean) => void) =>
      new IntersectionObserver(([e]) => { if (e.isIntersecting) setter(true); }, { threshold: 0.15 });
    const o1 = make(setMissionVis); if (missionRef.current) o1.observe(missionRef.current);
    const o2 = make(setAcadVis);    if (acadRef.current)    o2.observe(acadRef.current);
    const o3 = make(setProgVis);    if (progRef.current)    o3.observe(progRef.current);
    return () => { o1.disconnect(); o2.disconnect(); o3.disconnect(); };
  }, []);

  const slide = SLIDES[current];

  const PILLARS: { icon: IconName; label: string; color: string }[] = [
    { icon: "croix", label: l === "en" ? "Evangelize" : l === "ht" ? "Evanjeliz" : l === "es" ? "Evangelizar" : "Évangéliser", color: "#c8960f" },
    { icon: "bible", label: l === "en" ? "Train" : l === "ht" ? "Fòme" : l === "es" ? "Formar" : "Former", color: "#1a3568" },
    { icon: "poignee_main", label: l === "en" ? "Serve" : l === "ht" ? "Sèvi" : l === "es" ? "Servir" : "Servir", color: "#2d6a4f" },
    { icon: "monde", label: l === "en" ? "Connect" : l === "ht" ? "Konekte" : l === "es" ? "Conectar" : "Connecter", color: "#00aac8" },
  ];

  const txt = {
    missionLabel:  l === "en" ? "OUR MISSION" : l === "ht" ? "MISYON NOU" : l === "es" ? "NUESTRA MISIÓN" : "NOTRE MISSION",
    missionTitle:  l === "en" ? "Making faithful disciples\nthroughout the whole world." : l === "ht" ? "Fòme disip fidèl\nan tout mond lan." : l === "es" ? "Formando discípulos fieles\npor todo el mundo." : "Former des disciples fidèles\nà travers le monde entier.",
    missionBody:   l === "en" ? "KONEKSYON PAM shines across 12 countries. Our vision: a Church equipped, evangelizing the nations until Christ's return." : l === "ht" ? "KONEKSYON PAM klere nan 12 peyi. Vizyon nou : yon Legliz ki ekipe, k ap evanjeliz nasyon yo jiskaske Kris retounen." : l === "es" ? "KONEKSYON PAM brilla en 12 países. Nuestra visión: una Iglesia equipada, evangelizando las naciones hasta el retorno de Cristo." : "KONEKSYON PAM rayonne dans 12 pays. Notre vision : une Église équipée, évangélisant les nations jusqu'au retour de Christ.",
    missionLink:   l === "en" ? "Read our story →" : l === "ht" ? "Li istwa nou →" : l === "es" ? "Leer nuestra historia →" : "Lire notre histoire →",
    acadLabel:     l === "en" ? "BIBLICAL ACADEMY" : l === "ht" ? "AKADEMI BIBLIK" : l === "es" ? "ACADEMIA BÍBLICA" : "ACADÉMIE BIBLIQUE",
    acadTitle:     l === "en" ? "Deepen your faith\nwith structured courses." : l === "ht" ? "Apwofondi lafwa ou\navèk kous ki estrikti." : l === "es" ? "Profundice su fe\ncon cursos estructurados." : "Approfondissez votre foi\navec des parcours structurés.",
    acadSub:       l === "en" ? "100% free · Multilingual · Available everywhere" : l === "ht" ? "100% gratis · Multiling · Disponib toupatou" : l === "es" ? "100% gratis · Multilingüe · Disponible en todas partes" : "100% gratuit · Multilingue · Disponible partout",
    acadCta:       l === "en" ? "See all courses →" : l === "ht" ? "Wè tout kous yo →" : l === "es" ? "Ver todos los cursos →" : "Voir tous les parcours →",
    free:          l === "en" ? "Free" : l === "ht" ? "Gratis" : l === "es" ? "Gratis" : "Gratuit",
    soon:          l === "en" ? "Coming soon" : l === "ht" ? "Byento" : l === "es" ? "Próximamente" : "Bientôt",
    start:         l === "en" ? "Start →" : l === "ht" ? "Kòmanse →" : l === "es" ? "Comenzar →" : "Commencer →",
    impactLabel:   l === "en" ? "OUR IMPACT" : l === "ht" ? "ENPAK NOU" : l === "es" ? "NUESTRO IMPACTO" : "NOTRE IMPACT",
    impactTitle:   l === "en" ? "Every number\ntells a soul reached." : l === "ht" ? "Chak chif\nrakonte yon nanm touche." : l === "es" ? "Cada número\ncuenta un alma alcanzada." : "Chaque chiffre\nraconte une âme touchée.",
    impactSub:     l === "en" ? "Full transparency · Real data only" : l === "ht" ? "Transparan total · Données reyèl sèlman" : l === "es" ? "Transparencia total · Solo datos reales" : "Transparence totale · Données réelles uniquement",
    impactLink:    l === "en" ? "See our reports →" : l === "ht" ? "Wè rapò nou yo →" : l === "es" ? "Ver nuestros informes →" : "Voir nos rapports →",
    progLabel:     l === "en" ? "OUR PROGRAMS" : l === "ht" ? "PWOGRAM NOU YO" : l === "es" ? "NUESTROS PROGRAMAS" : "NOS PROGRAMMES",
    progTitle:     l === "en" ? "A complete platform for\nyour spiritual growth." : l === "ht" ? "Yon platfòm konplè an\nsèvis kwasans ou." : l === "es" ? "Una plataforma completa al\nservicio de su crecimiento." : "Une plateforme complète au\nservice de votre croissance.",
    testiLabel:    l === "en" ? "TESTIMONIALS" : l === "ht" ? "TEMWAYAJ" : l === "es" ? "TESTIMONIOS" : "ILS TÉMOIGNENT",
    ctaLabel:      l === "en" ? "SUPPORT THE MISSION" : l === "ht" ? "SIPÒTE MISYON AN" : l === "es" ? "APOYAR LA MISIÓN" : "SOUTENIR LA MISSION",
    ctaVerse:      l === "en" ? "« Go and make disciples of all nations… »" : l === "ht" ? "« Ale, fè tout nasyon yo tounen disip… »" : l === "es" ? "« Id y haced discípulos a todas las naciones… »" : "« Allez, faites de toutes les nations des disciples… »",
    ctaRef:        l === "en" ? "Matthew 28:19" : l === "ht" ? "Matye 28:19" : l === "es" ? "Mateo 28:19" : "Matthieu 28:19",
    ctaTitle:      l === "en" ? "Support the mission of\nKONEKSYON PAM." : l === "ht" ? "Sipòte misyon\nKONEKSYON PAM." : l === "es" ? "Apoye la misión de\nKONEKSYON PAM." : "Soutenez la mission de\nKONEKSYON PAM.",
    donSoon:       l === "en" ? "Donate — Coming soon" : l === "ht" ? "Fè yon don — Byento" : l === "es" ? "Donar — Próximamente" : "Faire un don — Bientôt",
    pray:          l === "en" ? "Pray for us" : l === "ht" ? "Priye pou nou" : l === "es" ? "Orar por nosotros" : "Prier pour nous",
    discover:      l === "en" ? "Discover" : l === "ht" ? "Dekouvri" : l === "es" ? "Descubrir" : "Découvrir",
    lessons:       l === "en" ? "lessons" : l === "ht" ? "leson" : l === "es" ? "lecciones" : "leçons",
  };

  const slideAccentDark = slide.accent === "#52b788" ? "#0a1a10" : "#0d1d3d";

  return (
    <main className="kpf-home" style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#fff", color: "#1c1c2e" }}>

      {/* ── HERO SLIDESHOW ── */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.6s ease",
        }}>
          {/* 1. Dégradé de base (repli si aucune image/vidéo) */}
          <div style={{ position: "absolute", inset: 0, background: slide.gradient }} />

          {/* 2. Photo de personnes en fond (déposer dans /public/hero/<id>.jpg) — zoom lent «vivant».
                Si le fichier n'existe pas, l'image se masque et le dégradé reste. */}
          <img
            key={slide.id}
            src={`/hero/${slide.id}.jpg`}
            alt=""
            aria-hidden="true"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", animation: "heroKenBurns 22s ease-in-out infinite alternate",
            }}
          />

          {/* 3. Voile sombre — lisibilité du texte (foncé à gauche → clair à droite) */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(5,11,24,0.86) 0%, rgba(5,11,24,0.55) 48%, rgba(5,11,24,0.22) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,11,24,0.55) 0%, transparent 38%)" }} />

          {/* 4. Halo d'accent subtil */}
          <div style={{
            position: "absolute", top: "-25%", right: "-8%", width: "55%", height: "85%",
            background: `radial-gradient(circle, ${slide.accent}22 0%, transparent 62%)`,
            pointerEvents: "none",
          }} />
        </div>

        <div style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: 1500, margin: "0 auto",
          padding: "120px clamp(24px,4vw,64px)", textAlign: "left",
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? "translateY(10px)" : "translateY(0)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999, marginBottom: 30,
          }}>
            <span style={{ color: slide.accent, display: "inline-flex" }}><Icon name={slide.icon} size={14} /></span>
            <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {slide.badge[l] || slide.badge.fr}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: "clamp(2.9rem,6.5vw,6rem)", fontWeight: 800, color: "#fff",
            lineHeight: 1.04, letterSpacing: "-0.02em", maxWidth: 1050, whiteSpace: "pre-line",
            marginBottom: 28,
          }}>
            {slide.title[l] || slide.title.fr}
          </h1>

          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "clamp(1.15rem,1.7vw,1.6rem)", lineHeight: 1.6, maxWidth: 760, marginBottom: 44 }}>
            {slide.sub[l] || slide.sub.fr}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <Link href={slide.cta1href}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "17px 38px", background: "#fff", color: "#0d1d3d",
                fontWeight: 800, fontSize: "1.1rem", borderRadius: 12,
                textDecoration: "none", transition: "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.28)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              {slide.cta1[l] || slide.cta1.fr} <Icon name="fleche_droite" size={17} />
            </Link>
            <Link href={slide.cta2href}
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "17px 34px", background: "transparent", color: "#fff",
                fontWeight: 700, fontSize: "1.1rem",
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12,
                textDecoration: "none", transition: "background .2s, border-color .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}>
              {slide.cta2[l] || slide.cta2.fr}
            </Link>
          </div>

          {/* Indicateurs minimalistes */}
          <div style={{ display: "flex", gap: 8, marginTop: 60 }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`slide ${i + 1}`} style={{
                width: i === current ? 30 : 8, height: 4, borderRadius: 999,
                background: i === current ? "#fff" : "rgba(255,255,255,0.28)",
                border: "none", cursor: "pointer", transition: "all .3s ease", padding: 0,
              }} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes heroPulse { 0%,100%{opacity:.8;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
          @keyframes heroOrb2  { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-20px) translateX(10px)} }
          @keyframes logoFloat { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
          @keyframes logoHalo  { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.12)} }
          @keyframes logoRing1 { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.7;transform:scale(1.08)} }
          @keyframes logoRing2 { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.9;transform:scale(1.05)} }
          @keyframes fadeSlideUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeSlideLeft { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
          @keyframes fadeSlideRight { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
          @keyframes scaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
          @keyframes statPop { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
          .kpf-home .reveal-up   { opacity:0; }
          .kpf-home .reveal-up.in{ animation: fadeSlideUp   0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
          .kpf-home .reveal-l.in { animation: fadeSlideLeft  0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
          .kpf-home .reveal-r.in { animation: fadeSlideRight 0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
          .kpf-home .scale-in.in { animation: scaleIn        0.70s cubic-bezier(0.16,1,0.3,1) forwards; }
          /* Mobile overrides */
          @media (max-width: 768px) {
            .kpf-mission-grid  { grid-template-columns: 1fr !important; gap: 36px !important; }
            .kpf-pillars-grid  { grid-template-columns: 1fr 1fr !important; }
            .kpf-stats-grid    { grid-template-columns: repeat(2,1fr) !important; }
            .kpf-acad-grid     { grid-template-columns: repeat(2,1fr) !important; }
            .kpf-impact-grid   { grid-template-columns: 1fr !important; gap: 36px !important; }
            .kpf-prog-grid     { grid-template-columns: repeat(2,1fr) !important; gap: 14px !important; }
            .kpf-verse-grid    { grid-template-columns: 1fr !important; }
            .kpf-newsletter-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
            .kpf-newsletter-sep  { display: none !important; }
            .kpf-home section, .kpf-home > div > div { padding-left: 16px !important; padding-right: 16px !important; }
          }
          @media (max-width: 480px) {
            .kpf-acad-grid  { grid-template-columns: 1fr !important; }
            .kpf-prog-grid  { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── STATS BAR ── */}
      <section ref={statsRef} style={{ background: "#fff", position: "relative", overflow: "hidden", borderBottom: "1px solid #e8e4de" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", position: "relative", zIndex: 1,
          display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}
          className="kpf-stats-grid">
          {stats.map((stat, i) => {
            const COLORS = ["#1a3568","#00aac8","#c8960f","#2d6a4f"];
            const col = COLORS[i % 4];
            return (
              <div key={stat.fr} style={{
                textAlign: "center", padding: "36px 16px",
                borderRight: i < 3 ? "1px solid #e8e4de" : "none",
                display: "flex", flexDirection: "column", alignItems: "center",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `${col}10`, border: `2px solid ${col}28`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14, color: col,
                }}>
                  <Icon name={stat.icon} size={24} />
                </div>
                <StatItem stat={stat} triggered={statsTriggered} l={l} color={col} />
              </div>
            );
          })}
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e8e4de,transparent)" }} />
      </section>

      {/* ── VERSET DU JOUR + COMMUNAUTÉ (mis en valeur) ── */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid #e8e4de", padding: "56px 24px" }}>
        <div className="kpf-verse-grid" style={{ maxWidth: 1340, margin: "0 auto", display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20 }}>
          {/* Verset du jour */}
          {(() => {
            const v = DAILY_VERSES[Math.floor(Date.now() / 86400000) % DAILY_VERSES.length];
            const vt = l === "en" ? v.en : l === "ht" ? v.ht : l === "es" ? v.es : v.fr;
            return (
              <div style={{ background: "linear-gradient(135deg,#0d2048 0%,#16307a 55%,#0d2048 100%)", borderRadius: 24, padding: "38px 36px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 12px 38px rgba(13,32,72,0.22)" }}>
                <style>{`
                  @keyframes kpfVerseGlow { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.12)} }
                  @keyframes kpfVerseText { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
                  @keyframes kpfVerseUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
                `}</style>
                <div style={{ position: "absolute", top: "-30%", right: "-10%", width: 280, height: 280, background: "radial-gradient(circle, rgba(200,150,15,0.18) 0%, transparent 65%)", pointerEvents: "none", animation: "kpfVerseGlow 5s ease-in-out infinite" }} />
                <div style={{ position: "relative" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(200,150,15,0.16)", border: "1px solid rgba(200,150,15,0.35)", color: "#f0c840", fontSize: 10, fontWeight: 900, padding: "5px 14px", borderRadius: 999, letterSpacing: "0.2em", marginBottom: 18, animation: "kpfVerseUp .6s ease-out both" }}>
                    <Icon name="verset" size={12} /> {l === "en" ? "VERSE OF THE DAY" : l === "ht" ? "VÈSÈ JOU A" : l === "es" ? "VERSÍCULO DEL DÍA" : "VERSET DU JOUR"}
                  </span>
                  <p key={v.ref} style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.25rem,2.4vw,1.7rem)", fontWeight: 700, lineHeight: 1.45, marginBottom: 16, fontStyle: "italic", animation: "kpfVerseText .9s cubic-bezier(.16,1,.3,1) .15s both" }}>
                    &ldquo;{vt}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, animation: "kpfVerseUp .8s ease-out .35s both" }}>
                    <span style={{ color: "#67e8f9", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.05em" }}>— {v.ref}</span>
                    <Link href="/bible" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#c8960f,#f0c840)", color: "#0d1d3d", fontWeight: 800, fontSize: "0.82rem", padding: "9px 18px", borderRadius: 999, textDecoration: "none" }}>
                      <Icon name="bible" size={15} /> {l === "en" ? "Read the Bible" : l === "ht" ? "Li Bib la" : l === "es" ? "Leer la Biblia" : "Lire la Bible"} →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Communauté */}
          <Link href="/communaute" style={{ textDecoration: "none", display: "block" }}>
            <div style={{ height: "100%", background: "#ffffff", border: "1px solid #e8e4de", borderTop: "3px solid #16a34a", borderRadius: 24, padding: "30px 28px", boxShadow: "0 4px 16px rgba(26,53,104,0.06)", transition: "transform .3s, box-shadow .3s", display: "flex", flexDirection: "column" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 18px 44px rgba(22,163,74,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,53,104,0.06)"; }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: "#16a34a1f", border: "1.5px solid #16a34a3a", boxShadow: "0 4px 14px #16a34a22", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", marginBottom: 16 }}>
                <Icon name="utilisateurs" size={26} />
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 8px #16a34a" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "#16a34a", textTransform: "uppercase" }}>{l === "en" ? "LIVE" : l === "ht" ? "AN DIRÈK" : l === "es" ? "EN VIVO" : "EN DIRECT"}</span>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 800, color: "#1a3568", fontSize: "1.2rem", marginBottom: 8 }}>
                {l === "en" ? "Join the Community" : l === "ht" ? "Rantre nan Kominote a" : l === "es" ? "Únete a la Comunidad" : "Rejoins la Communauté"}
              </h3>
              <p style={{ color: "#4a6080", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                {l === "en" ? "Debates, testimonies and prayer with 24,500+ believers in 12 countries." : l === "ht" ? "Deba, temwayaj ak lapriyè ak 24,500+ kwayan nan 12 peyi." : l === "es" ? "Debates, testimonios y oración con más de 24,500 creyentes en 12 países." : "Débats, témoignages et prière avec 24 500+ croyants dans 12 pays."}
              </p>
              <span style={{ color: "#16a34a", fontWeight: 800, fontSize: "0.85rem" }}>
                {l === "en" ? "Discover" : l === "ht" ? "Dekouvri" : l === "es" ? "Descubrir" : "Découvrir"} →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="kpf-section-pad" style={{ background: "#fff", padding: "128px 24px", position: "relative", overflow: "hidden" }} ref={missionRef}>
        <div className="kpf-mission-grid" style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", position: "relative", zIndex: 1 }}>
          <div className={`reveal-l ${missionVis ? "in" : ""}`}>
            <p style={{ color: "#00aac8", fontWeight: 800, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12 }}>
              {txt.missionLabel}
            </p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#c8960f,#f0c840)", borderRadius: 999, marginBottom: 24 }} />
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, color: "#1a3568", lineHeight: 1.2, whiteSpace: "pre-line", marginBottom: 20 }}>
              {txt.missionTitle}
            </h2>
            <p style={{ color: "#4a6080", fontSize: "1rem", lineHeight: 1.8, marginBottom: 28 }}>
              {txt.missionBody}
            </p>
            <Link href="/mission" style={{ color: "#c8960f", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", borderBottom: "2px solid #c8960f", paddingBottom: 2 }}>
              {txt.missionLink}
            </Link>
          </div>
          <div className={`reveal-r kpf-pillars-grid ${missionVis ? "in" : ""}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, animationDelay: "0.15s" }}>
            {PILLARS.map((p, i) => (
              <div key={p.label}
                className={`scale-in ${missionVis ? "in" : ""}`}
                style={{ background: "#fff", border: "1px solid #e8e4de", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s,border-color .3s", cursor: "default", animationDelay: `${0.1 + i * 0.08}s` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 18px 44px rgba(16,24,40,0.10)"; e.currentTarget.style.borderColor = `${p.color}44`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#e8e4de"; }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${p.color}12`, border: `1.5px solid ${p.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 12, color: p.color,
                }}>
                  <Icon name={p.icon} size={24} />
                </div>
                <div style={{ fontWeight: 800, color: p.color, fontSize: "0.9rem" }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACADÉMIE BIBLIQUE ── */}
      <section style={{
        background: "#fafbfc",
        padding: "128px 24px", position: "relative", overflow: "hidden",
      }} ref={acadRef}>
        <div style={{
          position: "absolute", width: 400, height: 400,
          top: "50%", right: "-100px", transform: "translateY(-50%)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(0,170,200,0.07) 0%,transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 220, height: 220,
          bottom: "10%", left: "5%", borderRadius: "50%",
          border: "1px dashed rgba(0,170,200,0.18)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0,
          fontFamily: "'Playfair Display',Georgia,serif",
          fontSize: "clamp(120px,15vw,200px)", fontWeight: 900,
          color: "#00aac8", opacity: 0.04, lineHeight: 1,
          userSelect: "none", pointerEvents: "none",
        }}>02</div>
        <div style={{ maxWidth: 1440, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className={`reveal-up ${acadVis ? "in" : ""}`} style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#2d6a4f", fontWeight: 800, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12 }}>
              {txt.acadLabel}
            </p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#c8960f,#f0c840)", borderRadius: 999, margin: "0 auto 24px" }} />
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, color: "#1a3568", whiteSpace: "pre-line", marginBottom: 12 }}>
              {txt.acadTitle}
            </h2>
            <p style={{ color: "#4a6080", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.06em" }}>{txt.acadSub}</p>
          </div>
          <div className="kpf-acad-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {ACADEMY_COURSES.map((c, i) => (
              <div key={c.id}
                className={`scale-in ${acadVis ? "in" : ""}`}
                style={{ background: "#fff", border: "1px solid #e8e4de", borderRadius: 16, padding: "28px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", transition: "transform .3s,box-shadow .3s", opacity: c.active ? 1 : 0.65, animationDelay: `${0.1 + i * 0.1}s` }}
                onMouseEnter={e => { if (c.active) { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(26,53,104,0.14)"; e.currentTarget.style.borderTop = "3px solid #c8960f"; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.borderTop = "1px solid #e8e4de"; }}>
                <div style={{ marginBottom: 12, color: "#1a3568" }}><Icon name={c.icon} size={30} /></div>
                <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, color: "#1a3568", fontSize: "1rem", marginBottom: 8, flex: 1 }}>
                  {l === "en" ? c.en : c.fr}
                </div>
                <div style={{ color: "#9ca3af", fontSize: "0.78rem", marginBottom: 16 }}>
                  {c.lessons} {txt.lessons}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: c.active ? "rgba(200,150,15,0.10)" : "rgba(0,0,0,0.05)", color: c.active ? "#c8960f" : "#718096", fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.10em", marginBottom: c.active ? 16 : 0 }}>
                  {c.active ? <><Icon name="valider" size={13} /> {txt.free}</> : txt.soon}
                </div>
                {c.active && (
                  <Link href="/academie" style={{ color: "#1a3568", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none", borderBottom: "1.5px solid #1a3568", paddingBottom: 2, width: "fit-content" }}>
                    {txt.start}
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/academie" style={{ color: "#1a3568", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", borderBottom: "2px solid #1a3568", paddingBottom: 2 }}>
              {txt.acadCta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section style={{ background: "#fff", padding: "100px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.02,
          backgroundImage: "linear-gradient(#1a3568 1px,transparent 1px),linear-gradient(90deg,#1a3568 1px,transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          fontFamily: "'Playfair Display',Georgia,serif",
          fontSize: "clamp(120px,15vw,200px)", fontWeight: 900,
          color: "#c8960f", opacity: 0.04, lineHeight: 0.85,
          userSelect: "none", pointerEvents: "none",
        }}>03</div>
        <div ref={impactRef} className="kpf-impact-grid" style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <p style={{ color: "#c8960f", fontWeight: 800, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12 }}>
              {txt.impactLabel}
            </p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#c8960f,#f0c840)", borderRadius: 999, marginBottom: 24 }} />
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 900, color: "#1a3568", whiteSpace: "pre-line", marginBottom: 16 }}>
              {txt.impactTitle}
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 28 }}>{txt.impactSub}</p>
            <Link href="/impact" style={{ color: "#c8960f", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", borderBottom: "2px solid #c8960f", paddingBottom: 2 }}>
              {txt.impactLink}
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {IMPACT_GOALS.map(g => {
              const pct = Math.min(100, Math.round((g.current / g.goal) * 100));
              return (
                <div key={g.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#2d3748", fontSize: "0.88rem" }}>
                      <Icon name={g.icon} size={16} color={g.color} /> {l === "en" ? g.en : g.fr}
                    </span>
                    <span style={{ color: g.color, fontWeight: 800, fontSize: "0.8rem" }}>
                      {g.current.toLocaleString()}/{g.goal.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: 8, background: "#e8e4de", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: impactVis ? `${Math.max(pct, 2)}%` : "0%",
                      background: `linear-gradient(90deg,${g.color},${g.color}99)`,
                      borderRadius: 999,
                      transition: impactVis ? "width 1.5s cubic-bezier(0.16,1,0.3,1)" : "none",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROGRAMMES ── */}
      <section style={{
        background: "#ffffff",
        padding: "100px 24px", position: "relative", overflow: "hidden",
      }} ref={progRef}>
        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          <div className={`reveal-up ${progVis ? "in" : ""}`} style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#00aac8", fontWeight: 800, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12 }}>
              {txt.progLabel}
            </p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#c8960f,#f0c840)", borderRadius: 999, margin: "0 auto 24px" }} />
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, color: "#1a3568", whiteSpace: "pre-line" }}>
              {txt.progTitle}
            </h2>
          </div>
          <div className="kpf-prog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {PROGRAMMES.map((p, i) => (
              <Link key={p.id} href={p.href} style={{ textDecoration: "none" }}>
                <div className={`reveal-up ${progVis ? "in" : ""}`}
                  style={{ background: `#ffffff`, border: "1px solid #e8e4de", borderTop: `3px solid ${p.color}`, borderRadius: 16, padding: "26px 24px", boxShadow: "0 4px 16px rgba(26,53,104,0.06)", transition: "transform .3s,box-shadow .3s", height: "100%", animationDelay: `${0.05 + i * 0.08}s` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 18px 44px ${p.color}26`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,53,104,0.06)"; }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, marginBottom: 16,
                    background: `${p.color}1f`,
                    border: `1.5px solid ${p.color}3a`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: p.color,
                    boxShadow: `0 4px 14px ${p.color}22`,
                  }}>
                    <Icon name={p.icon} size={26} />
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, color: "#1a3568", fontSize: "1rem", marginBottom: 8 }}>
                    {l === "en" ? p.en : p.fr}
                  </h3>
                  <p style={{ color: "#4a6080", fontSize: "0.82rem", lineHeight: 1.6 }}>
                    {l === "en" ? p.descEn : p.descFr}
                  </p>
                  <div style={{ marginTop: 16, color: p.color, fontWeight: 800, fontSize: "0.82rem" }}>
                    {txt.discover} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section style={{
        background: "#fafbfc",
        padding: "100px 24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          fontFamily: "Georgia,serif",
          fontSize: "clamp(160px,22vw,260px)", fontWeight: 900,
          color: "#1a3568", opacity: 0.03, lineHeight: 1,
          userSelect: "none", pointerEvents: "none",
        }}>&ldquo;</div>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ color: "#c8960f", fontWeight: 800, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12 }}>
            {txt.testiLabel}
          </p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#c8960f,#f0c840)", borderRadius: 999, margin: "0 auto 36px" }} />
          <div style={{ position: "relative", minHeight: 200 }}>
            {TESTIMONIALS.map((te, i) => (
              <div key={te.id} style={{ position: i === testi ? "relative" : "absolute", inset: 0, opacity: i === testi ? 1 : 0, transition: "opacity 0.6s ease", pointerEvents: i === testi ? "auto" : "none" }}>
                <div style={{ fontSize: "3rem", color: "#c8960f", lineHeight: 1, marginBottom: 4, fontFamily: "Georgia,serif" }}>&ldquo;</div>
                <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1rem,2.5vw,1.2rem)", color: "#1a3568", lineHeight: 1.7, fontStyle: "italic", marginBottom: 20 }}>
                  {l === "en" ? te.textEn : l === "ht" ? te.textHt : l === "es" ? te.textEs : te.textFr}
                </p>
                <div style={{ fontWeight: 800, color: "#2d3748", fontSize: "0.88rem" }}>{te.name}</div>
                <div style={{ color: "#9ca3af", fontSize: "0.78rem", marginTop: 2 }}>{te.location}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTesti(i)} style={{ width: i === testi ? 24 : 8, height: 8, borderRadius: 999, background: i === testi ? "#c8960f" : "#e8e4de", border: "none", cursor: "pointer", transition: "all .3s" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER — Devenir Soutien Actif ── */}
      <NewsletterSection l={l} />

      {/* ── CTA SOUTIEN ── */}
      <section style={{ background: "#06122a", padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Photo de fond + voile sombre (texte lisible) */}
        <img src="/hero/impact.jpg" alt="" aria-hidden="true"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(6,18,42,0.90) 0%, rgba(13,32,72,0.84) 50%, rgba(6,18,42,0.92) 100%)" }} />
        <div style={{ position: "absolute", width: "50%", height: "50%", top: "10%", left: "25%", background: "radial-gradient(ellipse,rgba(200,150,15,0.12) 0%,transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
          <p style={{ color: "rgba(200,150,15,0.80)", fontWeight: 800, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20 }}>
            {txt.ctaLabel}
          </p>
          <blockquote style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1rem,2vw,1.2rem)", color: "rgba(255,255,255,0.75)", fontStyle: "italic", lineHeight: 1.7, marginBottom: 6 }}>
            {txt.ctaVerse}
          </blockquote>
          <p style={{ color: "rgba(255,255,255,0.40)", fontSize: "0.8rem", marginBottom: 40 }}>
            — {txt.ctaRef}
          </p>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, color: "#fff", whiteSpace: "pre-line", marginBottom: 36 }}>
            {txt.ctaTitle}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 36 }}>
            <button disabled style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "rgba(200,150,15,0.25)", color: "rgba(200,150,15,0.50)", fontWeight: 800, fontSize: "0.9rem", borderRadius: 10, border: "1px solid rgba(200,150,15,0.25)", cursor: "not-allowed" }}>
              <Icon name="cadenas" size={17} /> {txt.donSoon}
            </button>
            <Link href="/prieres"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, textDecoration: "none", transition: "all .2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
              <Icon name="priere" size={17} /> {txt.pray}
            </Link>
          </div>
          {/* Partage */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.78rem", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>
              {l === "en" ? "Share this mission" : l === "ht" ? "Pataje misyon sa a" : l === "es" ? "Comparte esta misión" : "Partager cette mission"}
            </p>
            <ShareButtons
              url="https://koneksyonpam.com"
              title="KONEKSYON PAM"
              description={l === "en" ? "Global evangelical platform — Bible, prayer, championships. Free for all." : l === "ht" ? "Platfòm evanjelik mondyal — Bib, priyè, chanpyona. Gratis pou tout moun." : l === "es" ? "Plataforma evangélica mundial — Biblia, oración, campeonatos. Gratis para todos." : "Plateforme évangélique mondiale — Bible, prières, championnats. Gratuit pour tous."}
              compact
            />
          </div>
        </div>
      </section>
    </main>
  );
}
