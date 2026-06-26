"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useRef, useState } from "react";

type Lang = "fr" | "ht" | "en";

const series = [
  {
    id: "nature-dieu",
    tag: { fr: "Doctrine", ht: "Doktrin", en: "Doctrine" },
    title: { fr: "La Nature de Dieu", ht: "Nati Bondye a", en: "The Nature of God" },
    desc: { fr: "Une série de 5 messages sur la trinité, la sainteté et la souveraineté de Dieu.", ht: "Yon seri 5 mesaj sou trinite, sentete ak souverènte Bondye.", en: "A 5-message series on the Trinity, holiness and sovereignty of God." },
    messages: [
      {
        num: 1,
        title: { fr: "Dieu existe — Les preuves de la Bible", ht: "Bondye egziste — Prèv nan Bib la", en: "God Exists — Evidence from the Bible" },
        ref: "Hébreux 11:6",
        body: {
          fr: "La foi chrétienne commence par une conviction fondamentale : Dieu existe et il récompense ceux qui le cherchent. Hébreux 11:6 nous dit qu'il est impossible de plaire à Dieu sans la foi. Mais cette foi n'est pas un saut dans l'obscurité — elle est ancrée dans les témoignages de la création, de l'histoire et de la Parole de Dieu.\n\nLa création elle-même est un témoignage puissant. Le Psaume 19:1 déclare : « Les cieux racontent la gloire de Dieu. » Partout où nous regardons — la complexité d'une cellule vivante, l'ordre de l'univers, la conscience humaine — nous voyons les empreintes d'un Créateur intelligent et personnel.\n\nMais au-delà de la création, c'est la Bible qui nous révèle qui est Dieu. Elle ne cherche pas à prouver son existence — elle l'affirme dès la première ligne : « Au commencement, Dieu créa les cieux et la terre. » (Genèse 1:1). Votre foi n'est pas une illusion. Elle est ancrée dans une réalité éternelle.",
          ht: "Lafwa kretyen kòmanse ak yon konviksyon fondamantal : Bondye egziste epi li rekonpanse moun ki chèche li. Ebre 11:6 di nou ke li enposib pou plezi Bondye san lafwa. Men lafwa sa a pa yon sot nan fènwa — li anchore nan temwanyaj kreyasyon, listwa ak Pawòl Bondye.\n\nKreyasyon li menm se yon temwayaj pwisan. Sòm 19:1 deklare : « Syèl yo ap pale glwa Bondye. » Toupatou nou gade — konpleksite yon selil vivan, lòd linivè a, konsyans imen — nou wè tras yon Kreyatè entèlijan ak pèsonèl.\n\nMen anplis kreyasyon, se Bib la ki reveye nou ki Bondye ye. Li pa chèche pwouve egzistans li — li afime li depi premye liy : « Nan kòmansman, Bondye kreye syèl la ak tè a. » (Jenèz 1:1). Lafwa ou pa yon ilizyon. Li anchore nan yon reyalite etènèl.",
          en: "Christian faith begins with a fundamental conviction: God exists and he rewards those who seek him. Hebrews 11:6 tells us it is impossible to please God without faith. But this faith is not a leap into the dark — it is anchored in the testimonies of creation, history and God's Word.\n\nCreation itself is a powerful testimony. Psalm 19:1 declares: 'The heavens declare the glory of God.' Everywhere we look — the complexity of a living cell, the order of the universe, human consciousness — we see the fingerprints of an intelligent, personal Creator.\n\nBut beyond creation, it is the Bible that reveals to us who God is. It does not try to prove his existence — it affirms it from the very first line: 'In the beginning, God created the heavens and the earth.' (Genesis 1:1). Your faith is not an illusion. It is anchored in an eternal reality.",
        },
      },
      {
        num: 2,
        title: { fr: "La Trinité — Un seul Dieu en trois personnes", ht: "Trinite a — Yon sèl Bondye an twa pèsòn", en: "The Trinity — One God in Three Persons" },
        ref: "Matthieu 28:19",
        body: {
          fr: "La doctrine de la Trinité est l'une des plus profondes et des plus mal comprises de la foi chrétienne. Dieu est Un dans son essence, mais il existe en trois personnes distinctes : le Père, le Fils et le Saint-Esprit. Ce n'est pas trois dieux — c'est un seul Dieu qui se révèle en trois personnes.\n\nJésus lui-même nous a donné cette formule : « Allez, faites des disciples de toutes les nations, les baptisant au nom du Père, du Fils et du Saint-Esprit. » (Matthieu 28:19). Remarquez : il dit « au nom » (singulier), pas « aux noms » (pluriel). Un seul nom, trois personnes.\n\nCette vérité a des implications pratiques pour notre vie spirituelle. Nous prions au Père (Matthieu 6:9), par le Fils (Jean 14:6) et dans la puissance du Saint-Esprit (Éphésiens 6:18). La Trinité n'est pas un concept théologique abstrait — c'est la réalité dans laquelle nous vivons notre relation avec Dieu.",
          ht: "Doktrin Trinite a se youn nan pi pwofon ak pi mal konprann nan lafwa kretyen. Bondye Se Youn nan esans li, men li egziste an twa pèsòn disteng : Papa a, Pitit la ak Sentespri a. Se pa twa bondye — se yon sèl Bondye ki reveye li an twa pèsòn.\n\nJezi li menm ban nou fòmil sa a : « Al fè disip nan tout nasyon yo, batize yo nan non Papa a, Pitit la ak Sentespri a. » (Matye 28:19). Remake : li di « non » (sengile), pa « non yo » (pliryèl). Yon sèl non, twa pèsòn.\n\nVerite sa a gen enplikasyon pratik pou lavi espirityèl nou. Nou priye Papa a (Matye 6:9), atravè Pitit la (Jan 14:6) ak nan pisans Sentespri a (Efezyen 6:18). Trinite a pa yon konsèp teyolojik abstré — se reyalite nou viv relasyon nou ak Bondye ladan l.",
          en: "The doctrine of the Trinity is one of the most profound and misunderstood in the Christian faith. God is One in his essence, but he exists in three distinct persons: the Father, the Son and the Holy Spirit. This is not three gods — it is one God who reveals himself in three persons.\n\nJesus himself gave us this formula: 'Go, make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.' (Matthew 28:19). Notice: he says 'in the name' (singular), not 'in the names' (plural). One name, three persons.\n\nThis truth has practical implications for our spiritual life. We pray to the Father (Matthew 6:9), through the Son (John 14:6) and in the power of the Holy Spirit (Ephesians 6:18). The Trinity is not an abstract theological concept — it is the reality in which we live our relationship with God.",
        },
      },
      {
        num: 3,
        title: { fr: "La Sainteté de Dieu", ht: "Sentete Bondye a", en: "The Holiness of God" },
        ref: "Ésaïe 6:1-8",
        body: {
          fr: "Ésaïe chapitre 6 nous offre l'une des visions les plus saisissantes de Dieu dans toute la Bible. Le prophète voit le Seigneur assis sur un trône élevé. Les séraphins proclament : « Saint, saint, saint est l'Éternel des armées ; toute la terre est pleine de sa gloire. » (Ésaïe 6:3).\n\nPourquoi répètent-ils « saint » trois fois ? Dans l'hébreu, la répétition d'un mot était la façon d'exprimer le superlatif absolu. « Saint, saint, saint » signifie que la sainteté est l'attribut fondamental de Dieu — il est infiniment, absolument, totalement saint.\n\nFace à cette sainteté, Ésaïe s'écrie : « Malheur à moi ! car je suis perdu ; car je suis un homme dont les lèvres sont impures. » La sainteté de Dieu révèle notre péché. Mais voici la bonne nouvelle : Dieu purifie ceux qui reconnaissent leur état. Il envoya un ange avec une braise pour purifier les lèvres d'Ésaïe. C'est une image parfaite de la grâce.",
          ht: "Ezayi chapit 6 ofri nou youn nan vizyon ki pi frappan sou Bondye nan tout Bib la. Pwofèt la wè Seyè a chita sou yon twòn wo. Serafin yo pwoklaime : « Sen, sen, sen se Seyè a dè lame yo ; tout tè a plen glwa li. » (Ezayi 6:3).\n\nPoukisa yo repete « sen » twa fwa ? Nan Ebre, repetisyon yon mo se te fason eksprime sipèlatif absoli. « Sen, sen, sen » vle di ke sentete se atribi fondamantal Bondye — li enfiniман, absòliman, totalman sen.\n\nFas ak sentete sa a, Ezayi rele : « Malè pou mwen ! paske mwen pèdi ; paske mwen se yon nonm ki gen lèv sal. » Sentete Bondye revele peche nou. Men men bon nouvèl la : Bondye pirifye moun ki rekonèt eta yo. Li voye yon zanj ak yon chabon pou pirifye lèv Ezayi yo. Se yon imaj pafè gras.",
          en: "Isaiah chapter 6 offers us one of the most striking visions of God in all the Bible. The prophet sees the Lord seated on a high throne. The seraphim proclaim: 'Holy, holy, holy is the LORD of hosts; the whole earth is full of his glory.' (Isaiah 6:3).\n\nWhy do they repeat 'holy' three times? In Hebrew, the repetition of a word was the way to express the absolute superlative. 'Holy, holy, holy' means that holiness is the fundamental attribute of God — he is infinitely, absolutely, totally holy.\n\nFaced with this holiness, Isaiah cries out: 'Woe is me! For I am lost; for I am a man of unclean lips.' God's holiness reveals our sin. But here is the good news: God purifies those who acknowledge their condition. He sent an angel with a burning coal to purify Isaiah's lips. It is a perfect image of grace.",
        },
      },
    ],
  },
  {
    id: "foi-quotidienne",
    tag: { fr: "Vie Chrétienne", ht: "Lavi Kretyen", en: "Christian Life" },
    title: { fr: "Vivre par la Foi", ht: "Viv pa Lafwa", en: "Living by Faith" },
    desc: { fr: "Comment marcher par la foi dans les décisions quotidiennes et les temps d'incertitude.", ht: "Kijan pou mache pa lafwa nan desizyon chak jou ak nan moman enkertitid.", en: "How to walk by faith in daily decisions and times of uncertainty." },
    messages: [
      {
        num: 1,
        title: { fr: "La foi, qu'est-ce que c'est vraiment ?", ht: "Lafwa, kisa sa rèlman ye ?", en: "Faith — What Is It Really?" },
        ref: "Hébreux 11:1",
        body: {
          fr: "« Or la foi, c'est la substance des choses qu'on espère, la démonstration de celles qu'on ne voit pas. » (Hébreux 11:1). Cette définition biblique de la foi est profonde. Ce n'est pas une simple croyance intellectuelle ou un sentiment émotionnel — c'est une certitude qui agit.\n\nHébreux 11 nous présente les grands héros de la foi : Abel, Noé, Abraham, Moïse... Chacun d'eux a agi en se basant sur ce que Dieu avait dit, même quand les circonstances semblaient impossibles. Abraham a quitté son pays sans savoir où il allait. Noé a construit une arche sans jamais avoir vu de pluie.\n\nLa foi véritable n'est pas l'absence de doute — c'est le choix d'agir sur la Parole de Dieu malgré le doute. Chaque jour, vous avez l'occasion d'exercer cette foi dans les petites décisions : choisir l'honnêteté quand le mensonge serait plus facile, pardonner quand la rancœur semble justifiée, espérer quand les circonstances disent le contraire.",
          ht: "« Men lafwa, se la sibstans bagay nou espere yo, se demonstrasyon bagay nou pa wè yo. » (Ebre 11:1). Definisyon biblik lafwa sa a pwofon. Se pa yon kwayans entelektyèl senp oswa yon santiman emosyonèl — se yon sètitid ki aji.\n\nEbre 11 prezante nou gran ewo lafwa yo : Abel, Noe, Abraham, Moyiz... Chak youn te aji sou sa Bondye te di a, menm lè sikonstans yo te sanble enposib. Abraham te kite peyi li san li pa te konnen ki kote li t ap ale. Noe te bati yon bato san li pa janm wè lapli.\n\nLafwa veritab pa absan dout — se chwa pou aji sou Pawòl Bondye malgre dout la. Chak jou, ou gen opòtinite pou egzèse lafwa sa a nan ti desizyon yo : chwazi onètete lè manti t ap pi fasil, padone lè rankin sanble jistifye, espere lè sikonstans yo di opoze.",
          en: "\"Now faith is the substance of things hoped for, the evidence of things not seen.\" (Hebrews 11:1). This biblical definition of faith is profound. It is not a simple intellectual belief or an emotional feeling — it is a certainty that acts.\n\nHebrews 11 presents the great heroes of faith: Abel, Noah, Abraham, Moses... Each of them acted based on what God had said, even when circumstances seemed impossible. Abraham left his country without knowing where he was going. Noah built an ark without ever having seen rain.\n\nTrue faith is not the absence of doubt — it is the choice to act on God's Word despite doubt. Every day, you have the opportunity to exercise this faith in small decisions: choosing honesty when lying would be easier, forgiving when resentment seems justified, hoping when circumstances say otherwise.",
        },
      },
      {
        num: 2,
        title: { fr: "Quand Dieu semble silencieux", ht: "Lè Bondye sanble silansye", en: "When God Seems Silent" },
        ref: "Psaumes 22:1-2",
        body: {
          fr: "Le Psaume 22 commence par ces mots déchirants : « Mon Dieu, mon Dieu, pourquoi m'as-tu abandonné ? » Ce sont les mots que Jésus lui-même a crié sur la croix. Si le Fils de Dieu a ressenti l'absence de Dieu, nous ne devrions pas être surpris quand nous traversons des moments de sécheresse spirituelle.\n\nLe silence de Dieu n'est pas son absence. Dans les moments où Dieu semble lointain, plusieurs choses se passent : il teste notre foi pour la renforcer, il nous invite à le chercher plus profondément, ou il travaille en coulisses de façon que nous ne voyons pas encore.\n\nDavid, après avoir exprimé son désespoir dans les premiers versets du Psaume 22, arrive à cette confession : « Car il n'a pas méprisé ni dédaigné la souffrance du misérable. » (v. 24). La foi mature reconnaît que Dieu est fidèle même quand les émotions disent le contraire. Continuez à vous présenter devant lui — le silence finira.",
          ht: "Sòm 22 kòmanse ak mo sa yo kite nan kè : « Bondye mwen, Bondye mwen, poukisa ou abandone mwen ? » Se mo sa yo menm Jezi te rele sou kwa a. Si Pitit Bondye te santi absans Bondye, nou pa ta dwe sezi lè nou travèse moman sekrès espirityèl.\n\nSilans Bondye pa absans li. Nan moman kote Bondye sanble lwen, plizyè bagay ap pase : li ap teste lafwa nou pou ranfòse li, li envite nou chèche li pi fon, oswa li ap travay dèyè koulise yon fason nou pa wè ankò.\n\nDavid, apre l te eksprime dezespwa li nan premye vèsè Sòm 22 yo, rive nan konfesyon sa a : « Paske li pa meprize ni dedaye soufrans malere a. » (v. 24). Lafwa mi rekonèt ke Bondye fidèl menm lè emosyon yo di opoze. Kontinye prezante devan li — silans lan ap fini.",
          en: "Psalm 22 begins with these heartbreaking words: 'My God, my God, why have you forsaken me?' These are the words that Jesus himself cried out on the cross. If the Son of God felt the absence of God, we should not be surprised when we go through moments of spiritual dryness.\n\nGod's silence is not his absence. In moments when God seems distant, several things are happening: he is testing our faith to strengthen it, he is inviting us to seek him more deeply, or he is working behind the scenes in ways we cannot yet see.\n\nDavid, after expressing his despair in the first verses of Psalm 22, arrives at this confession: 'For he has not despised or scorned the suffering of the afflicted one.' (v. 24). Mature faith recognizes that God is faithful even when emotions say otherwise. Keep presenting yourself before him — the silence will end.",
        },
      },
    ],
  },
  {
    id: "ecole-priere",
    tag: { fr: "Prière", ht: "Lapriyè", en: "Prayer" },
    title: { fr: "L'École de la Prière", ht: "Lekòl Lapriyè a", en: "School of Prayer" },
    desc: { fr: "Les fondements bibliques d'une vie de prière efficace et persévérante.", ht: "Fondasyon biblik yon lavi lapriyè ki efikas ak pèseveran.", en: "The biblical foundations of an effective and persevering prayer life." },
    messages: [
      {
        num: 1,
        title: { fr: "Pourquoi prier si Dieu sait déjà tout ?", ht: "Poukisa priye si Bondye deja konnen tout bagay ?", en: "Why Pray If God Already Knows Everything?" },
        ref: "Matthieu 6:8",
        body: {
          fr: "C'est l'une des questions les plus fréquentes : si Dieu connaît déjà nos besoins avant même que nous les exprimions (Matthieu 6:8), pourquoi prier ? La réponse révèle la nature profonde de la prière.\n\nLa prière n'est pas principalement un mécanisme pour changer les circonstances — c'est un moyen de cultiver une relation intime avec Dieu. Un père aime entendre son enfant lui parler, pas parce qu'il ne sait pas ce dont l'enfant a besoin, mais parce que la relation elle-même a de la valeur.\n\nJésus lui-même priait constamment, et il savait tout ! Il passait des nuits entières en prière (Luc 6:12). La prière était son oxygène. Pour nous aussi, la prière est le moyen par lequel nous alignons notre cœur avec la volonté de Dieu, nous renforçons notre foi, et nous participons à l'œuvre de Dieu dans le monde. Ne cherchez pas seulement des réponses dans la prière — cherchez le Dieu qui répond.",
          ht: "Se youn nan kesyon ki pi frekant yo : si Bondye deja konnen bezwen nou yo anvan nou menm eksprime yo (Matye 6:8), poukisa priye ? Repons lan reveye nati pwofon lapriyè.\n\nLapriyè pa prensipalman yon mekanis pou chanje sikonstans — se yon mwayen pou kiltivre yon relasyon entim ak Bondye. Yon papa renmen tande pitit li ap pale avèk li, pa paske li pa konnen sa pitit la bezwen, men paske relasyon an li menm gen valè.\n\nJezi li menm te priye konstan, epi li te konnen tout bagay ! Li te pase lannwit antye nan lapriyè (Lik 6:12). Lapriyè se te oksijèn li. Pou nou tou, lapriyè se mwayen nou aliye kè nou ak volonte Bondye, nou ranfòse lafwa nou, epi nou patisipe nan travay Bondye nan mond lan. Pa chèche sèlman repons nan lapriyè — chèche Bondye ki repon.",
          en: "This is one of the most common questions: if God already knows our needs before we even express them (Matthew 6:8), why pray? The answer reveals the deep nature of prayer.\n\nPrayer is not primarily a mechanism to change circumstances — it is a means of cultivating an intimate relationship with God. A father loves to hear his child talk to him, not because he does not know what the child needs, but because the relationship itself has value.\n\nJesus himself prayed constantly, and he knew everything! He spent entire nights in prayer (Luke 6:12). Prayer was his oxygen. For us too, prayer is the means by which we align our hearts with God's will, strengthen our faith, and participate in God's work in the world. Do not only look for answers in prayer — look for the God who answers.",
        },
      },
    ],
  },
  {
    id: "message-croix",
    tag: { fr: "Évangile", ht: "Levanjil", en: "Gospel" },
    title: { fr: "Le Message de la Croix", ht: "Mesaj Kwa a", en: "The Message of the Cross" },
    desc: { fr: "Pourquoi la crucifixion est le centre de toute la théologie chrétienne.", ht: "Poukisa krisifiksyon an se sant tout teyoloji kretyen.", en: "Why the crucifixion is the center of all Christian theology." },
    messages: [
      {
        num: 1,
        title: { fr: "La croix — scandale ou sagesse ?", ht: "Kwa a — skandal oswa sajès ?", en: "The Cross — Scandal or Wisdom?" },
        ref: "1 Corinthiens 1:18",
        body: {
          fr: "« Car la prédication de la croix est une folie pour ceux qui périssent ; mais pour nous qui sommes sauvés, elle est une puissance de Dieu. » (1 Corinthiens 1:18). Paul écrit ces mots dans un contexte où la croix était le symbole de la honte — une mort réservée aux criminels.\n\nLes Juifs demandaient des signes miraculeux. Les Grecs cherchaient la sagesse philosophique. Et Paul leur prêche un Messie crucifié — ce qui était un scandale pour les uns et une folie pour les autres. Pourtant c'est précisément là que réside la puissance de Dieu.\n\nPourquoi la croix ? Parce que le péché exige une peine, et la justice de Dieu ne peut être ignorée. Mais la grâce de Dieu a trouvé un moyen : Jésus, le parfait, a pris notre place. Il a subi la peine que nous méritions. La croix n'est pas un accident de l'histoire — c'est le plan éternel de Dieu pour réconcilier l'humanité avec lui-même.",
          ht: "« Paske pawòl kwa a se yon foli pou moun ki pèdi yo ; men pou nou menm ki sove yo, se yon pisans Bondye. » (1 Korentyen 1:18). Pòl ekri mo sa yo nan yon kontèks kote kwa a te senbòl wont — yon lanmò rezève pou kriminèl.\n\nJuif yo t ap mande siy mirakile. Grèk yo t ap chèche sajès filozofik. Epi Pòl preche yo yon Mesi krisifye — sa ki te yon skandal pou youn ak yon foli pou lòt. Sepandan se presisman la pisans Bondye chita.\n\nPoukisa kwa a ? Paske peche a mande yon penalite, epi jistis Bondye pa ka inyore. Men gras Bondye a jwenn yon mwayen : Jezi, ki pafè, te pran plas nou. Li sibi penalite nou te merite a. Kwa a pa yon aksidan listwa — se plan etènèl Bondye pou rekonsilye limanite ak li menm.",
          en: "\"For the word of the cross is folly to those who are perishing, but to us who are being saved it is the power of God.\" (1 Corinthians 1:18). Paul writes these words in a context where the cross was a symbol of shame — a death reserved for criminals.\n\nThe Jews were demanding miraculous signs. The Greeks were seeking philosophical wisdom. And Paul preaches to them a crucified Messiah — which was a scandal to some and folly to others. Yet it is precisely there that the power of God resides.\n\nWhy the cross? Because sin demands a penalty, and God's justice cannot be ignored. But God's grace found a way: Jesus, the perfect one, took our place. He bore the penalty we deserved. The cross is not an accident of history — it is God's eternal plan to reconcile humanity with himself.",
        },
      },
    ],
  },
];

export default function EnseignementPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const [openSeries, setOpenSeries] = useState<string | null>(null);
  const [openMsg, setOpenMsg] = useState<{ seriesId: string; msgNum: number } | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiRef = useRef<HTMLDivElement>(null);

  const activeMsg = openMsg
    ? series.find(s => s.id === openMsg.seriesId)?.messages.find(m => m.num === openMsg.msgNum)
    : null;

  function closeModal() {
    setOpenMsg(null);
    setAiQuestion("");
    setAiAnswer("");
  }

  async function askAI() {
    if (!aiQuestion.trim() || !activeMsg) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: aiQuestion,
          context: activeMsg.body[l],
          lang,
        }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || "");
      setTimeout(() => aiRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">

      {/* Page header — university style */}
      <div className="bg-[#0f2044]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded px-3 py-1.5 mb-6">
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
              {l === "fr" ? "Enseignement" : l === "ht" ? "Ansèyman" : "Teaching"}
            </span>
          </div>
          <h1 className="text-white font-black leading-tight mb-3"
            style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
            {l === "fr" ? "Des messages qui édifient." : l === "ht" ? "Mesaj ki bati." : "Messages that build up."}
          </h1>
          <p className="text-white/50 text-sm sm:text-base max-w-xl leading-relaxed">
            {l === "fr" ? "Séries bibliques, messages doctrinaux et enseignements pratiques pour votre croissance spirituelle."
           : l === "ht" ? "Seri biblik, mesaj doktrinal ak ansèyman pratik pou kwasans espirityèl ou."
           : "Bible series, doctrinal messages and practical teachings for your spiritual growth."}
          </p>
        </div>
      </div>

      {/* Blue strip */}
      <div className="h-1 bg-gradient-to-r from-[#0f2044] via-[#1d4ed8] to-[#38bdf8]" />

      {/* ── Message modal overlay ── */}
      {activeMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(15,32,68,0.7)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="bg-[#0f2044] rounded-t-xl px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[#93c5fd] text-[10px] font-bold uppercase tracking-widest mb-1">
                  {activeMsg.ref}
                </p>
                <h2 className="text-white font-bold text-lg leading-snug">{activeMsg.title[l]}</h2>
              </div>
              <button onClick={closeModal}
                className="shrink-0 text-white/50 hover:text-white transition-colors mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal body */}
            <div className="px-6 py-6 overflow-y-auto flex-1">
              {/* Message content */}
              {activeMsg.body[l].split("\n\n").map((para, i) => (
                <p key={i} className="text-[#0f2044]/80 text-sm leading-relaxed mb-4">{para}</p>
              ))}

              {/* AI section */}
              <div className="mt-6 border-t border-[#bfdbfe] pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#38bdf8] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-2h2v2zm0-4H9V7h2v2z"/>
                    </svg>
                  </div>
                  <p className="text-[#0f2044] font-bold text-sm">
                    {l === "fr" ? "Approfondir avec l'IA" : l === "ht" ? "Apwfondi ak IA a" : "Explore deeper with AI"}
                  </p>
                </div>
                <p className="text-stone-400 text-xs mb-3">
                  {l === "fr" ? "Posez une question sur ce message et l'IA vous répondra avec une explication approfondie."
                 : l === "ht" ? "Poze yon kesyon sou mesaj sa a epi IA a ap repon ou ak yon eksplikasyon pwofon."
                 : "Ask a question about this message and the AI will respond with a deeper explanation."}
                </p>
                <div className="flex gap-2">
                  <input
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && askAI()}
                    placeholder={l === "fr" ? "Ex: Que signifie la sainteté de Dieu pour ma vie ?" : l === "ht" ? "Ex: Kisa sentete Bondye vle di pou lavi mwen ?" : "Ex: What does God's holiness mean for my life?"}
                    className="flex-1 border border-[#bfdbfe] rounded-lg px-4 py-2.5 text-sm text-[#0f2044] placeholder:text-stone-300 focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
                  />
                  <button
                    onClick={askAI}
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="shrink-0 bg-[#1d4ed8] disabled:opacity-40 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors hover:bg-[#1e40af]"
                  >
                    {aiLoading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {l === "fr" ? "..." : "..."}
                      </span>
                    ) : (l === "fr" ? "Demander" : l === "ht" ? "Mande" : "Ask")}
                  </button>
                </div>

                {/* AI Answer */}
                {aiAnswer && (
                  <div ref={aiRef} className="mt-4 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#38bdf8]" />
                      <p className="text-[#1d4ed8] text-[10px] font-bold uppercase tracking-widest">
                        {l === "fr" ? "Réponse de l'IA" : l === "ht" ? "Repons IA a" : "AI Response"}
                      </p>
                    </div>
                    {aiAnswer.split("\n\n").map((para, i) => (
                      <p key={i} className="text-[#0f2044]/80 text-sm leading-relaxed mb-2 last:mb-0">{para}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100">
              <button onClick={closeModal}
                className="text-[#1d4ed8] text-sm font-semibold hover:underline">
                ← {l === "fr" ? "Retour aux séries" : l === "ht" ? "Retounen nan seri yo" : "Back to series"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Series accordion ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="border-l-4 border-[#1d4ed8] pl-5 mb-10">
          <p className="text-[#1d4ed8] text-xs font-bold uppercase tracking-[0.2em] mb-0.5">
            {l === "fr" ? "Séries disponibles" : l === "ht" ? "Seri disponib" : "Available series"}
          </p>
          <h2 className="text-[#0f2044] font-black text-xl">
            {l === "fr" ? "Cliquez sur une série pour accéder aux messages" : l === "ht" ? "Klike sou yon seri pou jwenn mesaj yo" : "Click a series to access its messages"}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {series.map((s) => {
            const expanded = openSeries === s.id;
            return (
              <div key={s.id} className={`border rounded-lg overflow-hidden transition-all ${expanded ? "border-[#1d4ed8] shadow-md" : "border-stone-200 hover:border-[#93c5fd]"}`}>
                {/* Series header */}
                <button className="w-full px-6 py-5 flex items-center gap-4 text-left"
                  onClick={() => setOpenSeries(expanded ? null : s.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1d4ed8] bg-[#eff6ff] px-2.5 py-0.5 rounded border border-[#bfdbfe]">
                        {s.tag[l]}
                      </span>
                      <span className="text-stone-400 text-xs">
                        {s.messages.length} {l === "fr" ? "messages" : l === "ht" ? "mesaj" : "messages"}
                      </span>
                    </div>
                    <p className="text-[#0f2044] font-bold text-base">{s.title[l]}</p>
                    <p className="text-stone-500 text-sm mt-1">{s.desc[l]}</p>
                  </div>
                  <div className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${expanded ? "border-[#1d4ed8] text-[#1d4ed8] rotate-180" : "border-stone-200 text-stone-400"}`}>
                    <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Messages list */}
                {expanded && (
                  <div className="border-t border-[#bfdbfe] bg-[#f8fbff]">
                    {s.messages.map((m) => (
                      <button key={m.num}
                        onClick={() => setOpenMsg({ seriesId: s.id, msgNum: m.num })}
                        className="w-full px-6 py-4 flex items-center gap-4 text-left border-b border-[#e0eaff] last:border-0 hover:bg-[#eff6ff] transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-[#0f2044] text-white text-xs font-black flex items-center justify-center shrink-0">
                          {m.num}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#0f2044] font-semibold text-sm group-hover:text-[#1d4ed8] transition-colors">{m.title[l]}</p>
                          <p className="text-stone-400 text-xs mt-0.5">{m.ref}</p>
                        </div>
                        <span className="shrink-0 text-[#1d4ed8] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {l === "fr" ? "Lire →" : l === "ht" ? "Li →" : "Read →"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA for pastors */}
      <div className="bg-[#eff6ff] border-t border-[#bfdbfe] px-5 sm:px-8 py-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-[#0f2044] font-black text-lg mb-1.5">
              {l === "fr" ? "Vous êtes pasteur ou enseignant ?" : l === "ht" ? "Ou se pastè oswa ansegnant ?" : "Are you a pastor or teacher?"}
            </p>
            <p className="text-stone-500 text-sm leading-relaxed">
              {l === "fr" ? "Créez un groupe d'église et partagez vos enseignements directement avec votre communauté."
             : l === "ht" ? "Kreye yon gwoup legliz epi pataje ansèyman ou yo dirèkteman ak kominote ou a."
             : "Create a church group and share your teachings directly with your community."}
            </p>
          </div>
          <Link href="/eglise/creer"
            className="shrink-0 bg-[#0f2044] hover:bg-[#1d4ed8] text-white px-7 py-3 rounded font-bold text-sm transition-colors">
            {l === "fr" ? "Créer mon groupe" : l === "ht" ? "Kreye gwoup mwen" : "Create my group"} →
          </Link>
        </div>
      </div>

    </div>
  );
}
