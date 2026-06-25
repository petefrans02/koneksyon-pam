"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import Link from "next/link";
import BibleQuiz from "./components/BibleQuiz";
import { useState, useEffect } from "react";

const versePool = [
  { ref: "Jean 3:16", fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.", ht: "Paske Bondye sitèlman renmen lèzòm, li bay sèl Pitit li a pou tout moun ki kwè nan li." },
  { ref: "Philippiens 4:13", fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs." },
  { ref: "Psaumes 23:1", fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen; mwen p ap manke anyen." },
  { ref: "Romains 8:28", fr: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Nou konnen ke tout bagay travay ansanm pou byen moun ki renmen Bondye." },
  { ref: "Ésaïe 41:10", fr: "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu.", ht: "Pa pè, paske mwen avèk ou; pa dekouraje, paske mwen se Bondye ou." },
  { ref: "Jérémie 29:11", fr: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", ht: "Paske mwen konnen plan mwen genyen pou nou, se plan pou fè nou jwenn lapè, pa dezas." },
  { ref: "Matthieu 11:28", fr: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", ht: "Vini jwenn mwen, nou tout ki fatige ak ki chaje ak fado lou, m ap ban nou repo." },
  { ref: "Psaumes 119:105", fr: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.", ht: "Pawòl ou se yon lanp ki klere pye mwen, yon limyè ki montre mwen wout mwen." },
  { ref: "Proverbes 3:5-6", fr: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse ; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.", ht: "Fè konfyans nan Seyè a de tout kè ou, pa konte sou pwòp entèlijans ou. Rekonèt li nan tout chemen ou yo, l ap moutre ou wout la." },
  { ref: "Matthieu 5:9", fr: "Heureux les artisans de paix, car ils seront appelés fils de Dieu !", ht: "Benediksyon pou moun ki fè lapè, paske yo pral rele yo pitit Bondye." },
  { ref: "Psaumes 46:1", fr: "Dieu est notre refuge et notre force, un secours qui ne manque jamais dans la détresse.", ht: "Bondye se pwoteksyon nou ak fòs nou; li toujou la pou ede nou lè nou nan traka." },
  { ref: "Galates 5:22-23", fr: "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance.", ht: "Men fwi Lespri a: renmen, kè kontan, lapè, pasyans, jantiyès, bonte, fidelite, dousè, mètrize tèt ou." },
  { ref: "2 Chroniques 7:14", fr: "Si mon peuple sur qui est invoqué mon nom s'humilie, prie, et cherche ma face, et s'il se détourne de ses mauvaises voies, je l'exaucerai des cieux.", ht: "Si pèp mwen an, moun yo rele pam yo, imilye yo, lapriyè ak chache figi mwen, m ap koute yo nan syèl la." },
  { ref: "Hébreux 11:1", fr: "Or la foi, c'est la ferme assurance des choses qu'on espère, la démonstration de celles qu'on ne voit pas.", ht: "Lafwa se gen asirans pou bagay nou espere yo, se prèv bagay nou pa wè yo." },
  { ref: "1 Jean 4:8", fr: "Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour.", ht: "Moun ki pa renmen pa konnen Bondye, paske Bondye se renmen." },
  { ref: "Romains 10:9", fr: "Si tu confesses de ta bouche le Seigneur Jésus, et si tu crois dans ton cœur que Dieu l'a ressuscité des morts, tu seras sauvé.", ht: "Si ou konfese ak bouch ou ke Jezi se Seyè a, e si ou kwè nan kè ou ke Bondye leve li vivan, ou pral sove." },
  { ref: "Apocalypse 3:20", fr: "Voici, je me tiens à la porte, et je frappe. Si quelqu'un entend ma voix et ouvre la porte, j'entrerai chez lui.", ht: "Gade, mwen kanpe bò pòt la, mwen frape. Si yon moun tande vwa mwen e ouvri pòt la, m ap antre." },
  { ref: "Psaumes 91:1", fr: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant.", ht: "Moun ki rete anba pwoteksyon Bondye ki pi Wo a ap viv anba lonbraj Bondye ki Toupuisan an." },
  { ref: "Éphésiens 2:8-9", fr: "C'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu.", ht: "Se pa gras Bondye ou sove, se pa fòs pa ou. Se yon kado Bondye ba ou." },
  { ref: "Jean 14:6", fr: "Jésus lui dit : Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.", ht: "Jezi di li: Mwen se chemen an, verite a, ak lavi a. Pesonn pa ka al jwenn Papa a si se pa pase nan mwen." },
  { ref: "Psaumes 34:8", fr: "Goûtez et voyez combien l'Éternel est bon ! Heureux l'homme qui cherche en lui son refuge !", ht: "Goute epi wè jan Seyè a bon ! Benediksyon pou moun ki mete konfyans yo nan li !" },
  { ref: "Romains 12:2", fr: "Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence, afin que vous discerniez quelle est la volonté de Dieu.", ht: "Pa kite monn nan chanje ou, men kite Bondye chanje fason ou panse pou ou ka konnen sa Bondye vle." },
  { ref: "Ésaïe 40:31", fr: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles ; ils courent sans se fatiguer.", ht: "Men moun ki mete espwa yo nan Seyè a pran nouvo fòs. Yo pral vole tankou malfini." },
  { ref: "Matthieu 6:33", fr: "Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus.", ht: "Men chèche dabò Wayòm Bondye a ak jistis li, tout lòt bagay sa yo ap ban nou tou." },
  { ref: "1 Corinthiens 13:4-5", fr: "La charité est patiente, elle est pleine de bonté ; la charité n'est point envieuse ; la charité ne se vante point, elle ne s'enfle point d'orgueil.", ht: "Renmen pran pasyans, renmen janti. Renmen pa jalou, li pa vante tèt li, li pa fè lwòj." },
  { ref: "Nombres 6:24-26", fr: "Que l'Éternel te bénisse, et qu'il te garde ! Que l'Éternel fasse luire sa face sur toi, et qu'il t'accorde sa grâce !", ht: "Ke Seyè a beni ou e pwoteje ou ! Ke Seyè a fè figi li klere sou ou e ba ou gras li !" },
  { ref: "Luc 1:37", fr: "Car rien n'est impossible à Dieu.", ht: "Paske pa gen anyen ki difisil pou Bondye." },
  { ref: "Psaumes 27:1", fr: "L'Éternel est ma lumière et mon salut : de qui aurais-je crainte ? L'Éternel est le soutien de ma vie : de qui aurais-je peur ?", ht: "Seyè a se limyè mwen ak delivrans mwen, kilès mwen ta pè ? Seyè a se fòs lavi mwen, kilès mwen ta krent ?" },
  { ref: "Philippiens 4:6-7", fr: "Ne vous inquiétez de rien ; mais en toutes choses faites connaître vos besoins à Dieu par des prières et des supplications.", ht: "Pa bay kò ou traka pou anyen. Men nan tout bagay, mande Bondye sa ou bezwen nan lapriyè." },
  { ref: "Jacques 1:2-3", fr: "Mes frères, regardez comme un sujet de joie complète les diverses épreuves auxquelles vous pouvez vous trouver exposés.", ht: "Frè m yo, rejwi ou lè ou pase nan tout kalite eprèv, paske ou konnen ke eprèv fè pasyans ou grandi." },
  { ref: "2 Timothée 1:7", fr: "Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse.", ht: "Paske Bondye pa ba nou yon lespri pè, men yon lespri fòs, renmen ak disiplin." },
  { ref: "Psaumes 37:4", fr: "Fais de l'Éternel tes délices, et il te donnera ce que ton cœur désire.", ht: "Jwi Seyè a, l ap ba ou sa kè ou vle." },
  { ref: "Matthieu 5:14", fr: "Vous êtes la lumière du monde. Une ville située sur une montagne ne peut être cachée.", ht: "Nou se limyè monn nan. Yon vil sou tèt yon mòn pa ka kache." },
  { ref: "Actes 1:8", fr: "Mais vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins.", ht: "Men nou pral resevwa pouvwa lè Sentespri a desann sou nou, e nou pral temwen pou mwen." },
  { ref: "1 Pierre 5:7", fr: "Déchargez-vous sur lui de tous vos soucis, car il prend soin de vous.", ht: "Kite tout enkyetid ou sou li, paske li pran swen ou." },
  { ref: "Jean 10:10", fr: "Le voleur ne vient que pour dérober, égorger et détruire ; moi, je suis venu afin que les brebis aient la vie, et qu'elles l'aient en abondance.", ht: "Vòlè a pa vini pou anyen, sinon pou vòlè, touye ak detwi. Mwen menm, mwen vini pou mouton yo ka gen lavi, e pou yo gen li an abondans." },
  { ref: "Psaumes 121:1-2", fr: "Je lève mes yeux vers les montagnes... Mon secours vient de l'Éternel, qui a fait les cieux et la terre.", ht: "Mwen leve je mwen gade mòn yo... Sekou mwen soti nan Seyè a, ki fè syèl la ak tè a." },
  { ref: "Romains 5:8", fr: "Mais Dieu prouve son amour envers nous, en ce que, lorsque nous étions encore des pécheurs, Christ est mort pour nous.", ht: "Men Bondye montre jan li renmen nou, paske lè nou te peche toujou, Kris te mouri pou nou." },
  { ref: "Deutéronome 31:6", fr: "Fortifiez-vous et ayez du courage ! Ne craignez point et ne soyez point effrayés devant eux ; car l'Éternel, ton Dieu, marche avec toi.", ht: "Fòtifye ou, mete kouraj. Pa pè, pa kite kè ou sote devan yo, paske Seyè a, Bondye ou a, ap mache avèk ou." },
  { ref: "Michée 6:8", fr: "Il t'a fait connaître, ô homme, ce qui est bien ; et ce que l'Éternel demande de toi, c'est que tu pratiques la justice, que tu aimes la miséricorde, et que tu marches humblement avec ton Dieu.", ht: "Li montre ou, o moun, sa ki bon; sa Seyè a mande ou se pou fè sa ki jis, renmen bonte, e mache avèk Bondye ou an nan imilite." },
  { ref: "Éphésiens 6:10", fr: "Au reste, fortifiez-vous dans le Seigneur, et par sa force toute-puissante.", ht: "Pran fòs nan Seyè a ak nan gwo pouvwa li a." },
  { ref: "Psaumes 100:4", fr: "Entrez dans ses portes avec des actions de grâce, dans ses parvis avec des louanges ! Célébrez-le, bénissez son nom !", ht: "Antre nan kay li ak aksyon de gras, antre nan lakou li ak lwanj. Beni non li !" },
  { ref: "Jean 15:5", fr: "Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit.", ht: "Mwen se pye rezen an, nou menm se branch yo. Moun ki rete nan mwen e mwen rete nan li, li bay anpil fwi." },
  { ref: "Ésaïe 53:5", fr: "Mais il était blessé pour nos péchés, brisé pour nos iniquités ; le châtiment qui nous donne la paix est tombé sur lui.", ht: "Li te blese pou peche nou yo, li te kraze pou move zak nou yo; pinisyon ki ban nou lapè a tonbe sou li." },
  { ref: "Genèse 1:1", fr: "Au commencement, Dieu créa les cieux et la terre.", ht: "Nan konmansman, Bondye kreye syèl la ak tè a." },
  { ref: "Apocalypse 21:4", fr: "Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n'y aura plus ni deuil, ni cri, ni douleur.", ht: "L ap siye tout dlo nan je yo; pa pral gen lanmò ankò, pa gen lapenn, pa gen kri, pa gen soufrans." },
  { ref: "Psaumes 32:8", fr: "Je t'instruirai et te montrerai la voie que tu dois suivre ; je te conseillerai, j'aurai les yeux sur toi.", ht: "M ap moutre ou, m ap anseye ou nan wout ou dwe swiv la; m ap konseye ou e m ap veye sou ou." },
  { ref: "Matthieu 28:19-20", fr: "Allez, faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit.", ht: "Al fè tout nasyon tounen disip mwen, batize yo nan non Papa a, Pitit la ak Sentespri a." },
  { ref: "2 Corinthiens 5:17", fr: "Si quelqu'un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées ; voici, toutes choses sont devenues nouvelles.", ht: "Si yon moun nan Kris, li se yon nouvo kreyati. Bagay lontan yo pase; gade, tout bagay vin nouvo." },
  { ref: "Proverbes 18:10", fr: "Le nom de l'Éternel est une tour forte ; le juste s'y réfugie et se trouve en sûreté.", ht: "Non Seyè a se yon fò solid; moun ki jis ka kouri mete ladan li pou yo an sekirite." },
  { ref: "Jean 16:33", fr: "Je vous ai dit ces choses, afin que vous ayez la paix en moi. Vous aurez des tribulations dans le monde ; mais prenez courage, j'ai vaincu le monde.", ht: "Mwen di nou bagay sa yo pou nou ka gen lapè nan mwen. Nan monn nan nou pral gen traka; men pran kouraj, mwen te genyen sou monn nan." },
  { ref: "Hébreux 13:8", fr: "Jésus-Christ est le même hier, aujourd'hui, et éternellement.", ht: "Jezi Kris la menm yè, jodi a, e pou tout tan." },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function Hero() {
  const { lang } = useLang();
  const verse = versePool[getDayOfYear() % versePool.length];
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white px-6 py-16 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-300/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-400/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "8s" }} />
        {/* Floating sparkles */}
        {[["10%","20%","1s"],["80%","15%","2s"],["25%","80%","3s"],["70%","70%","0.5s"],["50%","40%","1.5s"]].map(([l,t,d],i) => (
          <span key={i} className="absolute text-cyan-300/40 text-xs" style={{ left: l, top: t, animation: `twinkle 2s ease-in-out ${d} infinite` }}>✦</span>
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-10">

          {/* Left — text */}
          <div className={`text-center sm:text-left flex-1 transition-all duration-700 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex justify-center sm:justify-start mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 p-1 border border-white/30 shadow-lg shadow-blue-500/30 animate-pulse" style={{ animationDuration: "3s" }}>
                <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">
              {lang === "fr" ? "La plateforme des chrétiens connectés" : lang === "ht" ? "Platfòm kretyen ki konekte" : "The platform for connected Christians"}
            </h1>
            <p className="text-blue-100/80 text-sm sm:text-base mb-8 max-w-lg leading-relaxed" style={{ animationDelay: "0.2s" }}>
              {lang === "fr"
                ? "Prière, louange, études bibliques, communauté, groupes d'église — tout ce dont chaque chrétien a besoin, en un seul endroit."
                : lang === "ht"
                ? "Lapriyè, lwanj, etid biblik, kominote, gwoup legliz — tout sa chak kretyen bezwen, nan yon sèl kote."
                : "Prayer, praise, Bible studies, community, church groups — everything every Christian needs, in one place."}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <Link href="/eglise" className="bg-white text-blue-700 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-all shadow-xl hover:scale-105 hover:shadow-white/30">
                {lang === "fr" ? "⛪ Créer l'espace église" : lang === "ht" ? "⛪ Kreye espas legliz" : "⛪ Create church space"}
              </Link>
              <Link href="/communaute" className="bg-white/15 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-white/25 transition-colors border border-white/20">
                {lang === "fr" ? "Explorer →" : lang === "ht" ? "Eksplore →" : "Explore →"}
              </Link>
            </div>
          </div>

          {/* Right — verse card with float + glow */}
          <div className={`w-full sm:w-80 shrink-0 transition-all duration-1000 delay-300 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="relative animate-float animate-glow rounded-2xl">
              {/* Glowing border ring */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cyan-400/60 via-white/20 to-blue-400/40" />
              <div className="relative bg-blue-800/60 backdrop-blur-md rounded-2xl p-6">
                {/* Label */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg" style={{ animation: "twinkle 2s ease-in-out infinite" }}>✨</span>
                  <span className="animate-shimmer text-xs font-black uppercase tracking-[0.15em]">{t("verseOfDay", lang)}</span>
                </div>
                {/* Reference */}
                <h3 className="font-black text-xl text-white mb-3 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                  {verse.ref}
                </h3>
                {/* Verse text */}
                <p className="text-cyan-100/90 text-sm italic leading-relaxed animate-fade-up" style={{ animationDelay: "0.6s" }}>
                  &ldquo;{lang === "ht" ? verse.ht : verse.fr}&rdquo;
                </p>
                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent my-4" />
                <Link href="/bible" className="flex items-center gap-2 text-cyan-300 text-xs font-bold hover:text-white transition-colors group">
                  <span>{lang === "fr" ? "Lire la Bible complète" : lang === "ht" ? "Li Bib la konplè" : "Read full Bible"}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ServicesShowcase() {
  const { lang } = useLang();

  const services = [
    { href: "/bible",       icon: "📖", grad: "from-indigo-500 to-blue-600",    glow: "shadow-indigo-500/40", title: lang === "fr" ? "La Bible" : lang === "ht" ? "Bib la" : "The Bible",                desc: lang === "fr" ? "66 livres · 3 langues" : "66 books · 3 languages" },
    { href: "/prieres",     icon: "🙏", grad: "from-cyan-500 to-teal-600",       glow: "shadow-cyan-500/40",   title: lang === "fr" ? "Prière" : lang === "ht" ? "Lapriyè" : "Prayer",                    desc: lang === "fr" ? "Mur de prière mondial" : "Global prayer wall" },
    { href: "/temoignages", icon: "✨", grad: "from-pink-500 to-rose-600",       glow: "shadow-pink-500/40",   title: lang === "fr" ? "Témoignages" : lang === "ht" ? "Temwayaj" : "Testimonies",           desc: lang === "fr" ? "Partagez votre histoire" : "Share your story" },
    { href: "/etude",       icon: "📚", grad: "from-purple-500 to-violet-600",   glow: "shadow-purple-500/40", title: lang === "fr" ? "Études" : lang === "ht" ? "Etid" : "Studies",                     desc: lang === "fr" ? "Études bibliques + IA" : "Bible studies + AI" },
    { href: "/quiz",        icon: "🏆", grad: "from-amber-400 to-orange-500",    glow: "shadow-amber-500/40",  title: lang === "fr" ? "Quiz Biblique" : lang === "ht" ? "Kiz Biblik" : "Bible Quiz",       desc: lang === "fr" ? "5 niveaux de difficulté" : "5 difficulty levels" },
    { href: "/jeu",         icon: "🎮", grad: "from-green-500 to-emerald-600",   glow: "shadow-green-500/40",  title: lang === "fr" ? "Jeux Bibliques" : lang === "ht" ? "Jwèt Biblik" : "Bible Games",    desc: lang === "fr" ? "3 jeux interactifs" : "3 interactive games" },
    { href: "/louange",     icon: "🎵", grad: "from-red-500 to-rose-600",        glow: "shadow-red-500/40",    title: lang === "fr" ? "Louange" : lang === "ht" ? "Lwanj" : "Praise",                     desc: lang === "fr" ? "Musique & adoration" : "Music & worship" },
    { href: "/communaute",  icon: "🌍", grad: "from-teal-500 to-green-600",      glow: "shadow-teal-500/40",   title: lang === "fr" ? "Communauté" : lang === "ht" ? "Kominote" : "Community",              desc: lang === "fr" ? "Groupes & débats" : "Groups & debates" },
    { href: "/eglise",      icon: "⛪", grad: "from-blue-600 to-indigo-700",     glow: "shadow-blue-500/40",   title: lang === "fr" ? "Espace Église" : lang === "ht" ? "Espas Legliz" : "Church Space",  desc: lang === "fr" ? "Groupes privés" : "Private groups" },
    { href: "/don",         icon: "❤️", grad: "from-orange-400 to-amber-500",    glow: "shadow-orange-500/40", title: lang === "fr" ? "Faire un don" : lang === "ht" ? "Fè yon don" : "Donate",            desc: lang === "fr" ? "Soutenir la mission" : "Support the mission" },
    { href: "/contact",     icon: "📬", grad: "from-slate-500 to-gray-600",      glow: "shadow-slate-500/40",  title: "Contact",                                                                          desc: lang === "fr" ? "Nous écrire" : "Write to us" },
  ];

  const doubled = [...services, ...services];

  return (
    <section className="bg-slate-100 py-10 overflow-hidden group-pause">
      <div className="mb-6 text-center">
        <p className="text-blue-500 text-xs font-bold uppercase tracking-[0.2em]">
          ✦ {lang === "fr" ? "Tous nos services" : lang === "ht" ? "Tout sèvis nou yo" : "All our services"}
        </p>
      </div>

      {/* Scrolling strip */}
      <div className="overflow-hidden">
        <div className="flex gap-4 animate-scroll-x" style={{ width: "max-content" }}>
          {doubled.map((s, i) => (
            <Link
              key={i}
              href={s.href}
              className={`flex-shrink-0 w-44 bg-white border border-slate-200 rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all group cursor-pointer`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${s.grad} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <p className="text-stone-800 font-bold text-sm mb-1 leading-tight">{s.title}</p>
              <p className="text-slate-400 text-xs leading-tight">{s.desc}</p>
              <span className="block mt-3 text-blue-500 text-xs group-hover:text-blue-600 font-medium transition-colors">
                {lang === "fr" ? "Accéder →" : lang === "ht" ? "Antre →" : "Open →"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIBanner() {
  const { lang } = useLang();
  return (
    <section className="max-w-4xl mx-auto px-6 py-4">
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute top-4 right-8 w-3 h-3 bg-white rounded-full animate-ping opacity-40" style={{ animationDuration: "1.5s" }} />
        <div className="absolute bottom-6 right-12 w-2 h-2 bg-white rounded-full animate-ping opacity-30" style={{ animationDuration: "2.5s", animationDelay: "1s" }} />
        <div className="flex items-center gap-5 relative z-10">
          <div className="shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-20 blur-md" />
              <span className="text-5xl block animate-bounce relative" style={{ animationDuration: "2.5s" }}>🕊️</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">
              {lang === "fr" ? "Assistant Biblique IA" : lang === "ht" ? "Asistan Biblik IA" : "AI Bible Assistant"}
            </h2>
            <p className="text-purple-200 text-xs">
              {lang === "fr" ? "Posez n'importe quelle question sur la Bible — réponse instantanée 24h/24" : "Ask any Bible question — instant answer 24/7"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-purple-200 text-xs">{lang === "fr" ? "En ligne" : "Online"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChurchCTA() {
  const { lang } = useLang();
  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 sm:p-10 border border-blue-400/20 text-center relative overflow-hidden">
        <div className="absolute top-6 left-10 w-32 h-32 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-6 right-10 w-40 h-40 bg-cyan-300/15 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <span className="text-5xl block mb-4">🏠</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {lang === "fr" ? "La communauté chrétienne sur KONEKSYON PAM" : lang === "ht" ? "Kominote kretyen sou KONEKSYON PAM" : "The Christian community on KONEKSYON PAM"}
          </h2>
          <p className="text-blue-300/60 text-sm mb-6 max-w-lg mx-auto">
            {lang === "fr"
              ? "Pasteur, responsable ou croyant — créez votre espace de groupe ou rejoignez une communauté existante. Études, prières, événements, tout centralisé."
              : lang === "ht"
              ? "Pastè, responsab oswa kretyen — kreye espas gwoup ou oswa rantre nan yon kominote. Etid, lapriyè, evènman, tout santralize."
              : "Pastor, leader or believer — create your group space or join an existing community. Studies, prayers, events, all centralized."}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/eglise/creer" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30">
              {lang === "fr" ? "Créer mon groupe" : lang === "ht" ? "Kreye gwoup mwen" : "Create my group"}
            </Link>
            <Link href="/eglise" className="bg-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-colors border border-white/10">
              {lang === "fr" ? "Rejoindre" : lang === "ht" ? "Rantre" : "Join"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConnectedWorld() {
  const { lang } = useLang();
  const countries = ["🇺🇸", "🇭🇹", "🇫🇷", "🇨🇦", "🇧🇷", "🇬🇧", "🇩🇴", "🇨🇱", "🇧🇪", "🇨🇭", "🇲🇽", "🇨🇲"];

  return (
    <section className="bg-blue-50 px-6 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-4">
          🌍 {countries.length} {t("countries", lang)}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {countries.map((flag, i) => (
            <span key={i} className="text-3xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{flag}</span>
          ))}
        </div>
        <p className="text-blue-600/60 text-sm">
          {lang === "fr" ? "Des frères et sœurs du monde entier connectés par la foi" : "Brothers and sisters worldwide connected by faith"}
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <Hero />
      <ServicesShowcase />
      <AIBanner />
      <BibleQuiz />
      <ChurchCTA />
      <ConnectedWorld />
    </div>
  );
}
