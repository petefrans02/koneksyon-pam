"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import NextStep from "@/app/components/NextStep";
import ShareButton from "@/app/components/ShareButton";
import MissionBanner from "@/app/components/MissionBanner";

type Lang = "fr" | "ht" | "en";

const VERSES = [
  { ref: { fr: "Jérémie 29:11", ht: "Jeremi 29:11", en: "Jeremiah 29:11" }, fr: "Car je connais les projets que j'ai formés sur vous — projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", ht: "Paske mwen konnen plan mwen genyen pou nou — plan pou fè nou jwenn lapè, pa dezas, pou ba nou yon avni ak espwa.", en: "For I know the plans I have for you — plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: { fr: "Philippiens 4:13", ht: "Filipyen 4:13", en: "Philippians 4:13" }, fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me." },
  { ref: { fr: "Ésaïe 41:10", ht: "Ezayi 41:10", en: "Isaiah 41:10" }, fr: "Ne crains rien, car je suis avec toi. Ne promène pas des regards inquiets, car je suis ton Dieu.", ht: "Pa pè, paske mwen avèk ou. Pa dekouraje, paske mwen se Bondye ou.", en: "Do not fear, for I am with you. Do not be dismayed, for I am your God." },
  { ref: { fr: "Psaumes 23:1", ht: "Sòm 23:1", en: "Psalm 23:1" }, fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen — mwen p ap manke anyen.", en: "The Lord is my shepherd — I lack nothing." },
  { ref: { fr: "Romains 8:28", ht: "Women 8:28", en: "Romans 8:28" }, fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.", en: "In all things God works for the good of those who love him." },
  { ref: { fr: "2 Timothée 1:7", ht: "2 Timote 1:7", en: "2 Timothy 1:7" }, fr: "Dieu ne nous a pas donné un esprit de timidité, mais un esprit de force, d'amour et de sagesse.", ht: "Bondye pa ba nou yon lespri pè, men yon lespri fòs, renmen ak disiplin.", en: "God has not given us a spirit of fear, but of power, love and sound mind." },
  { ref: { fr: "Jean 14:6", ht: "Jan 14:6", en: "John 14:6" }, fr: "Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.", ht: "Mwen se chemen an, verite a, ak lavi a. Pesonn pa ka al jwenn Papa a si se pa pase nan mwen.", en: "I am the way and the truth and the life. No one comes to the Father except through me." },
];

const CHALLENGES = [
  { fr: "Quel est le premier livre de la Bible ?", ht: "Ki premye liv Labib la ?", en: "What is the first book of the Bible?", answer: { fr: "La Genèse", ht: "Jenèz", en: "Genesis" } },
  { fr: "Combien de disciples Jésus avait-il ?", ht: "Konbyen disip Jezi te genyen ?", en: "How many disciples did Jesus have?", answer: { fr: "12 disciples", ht: "12 disip", en: "12 disciples" } },
  { fr: "Qui a construit l'arche ?", ht: "Ki moun ki te bati bato a ?", en: "Who built the ark?", answer: { fr: "Noé", ht: "Noe", en: "Noah" } },
  { fr: "Dans quelle ville Jésus est-il né ?", ht: "Nan ki vil Jezi te fèt ?", en: "In which city was Jesus born?", answer: { fr: "Bethléem", ht: "Betleyèm", en: "Bethlehem" } },
  { fr: "Combien de jours Jésus a-t-il jeûné dans le désert ?", ht: "Konbyen jou Jezi te jejinen nan dezè a ?", en: "How many days did Jesus fast in the desert?", answer: { fr: "40 jours", ht: "40 jou", en: "40 days" } },
  { fr: "Quel prophète a reçu les Dix Commandements ?", ht: "Ki pwofèt ki te resevwa Dis Kòmandman yo ?", en: "Which prophet received the Ten Commandments?", answer: { fr: "Moïse", ht: "Moyiz", en: "Moses" } },
  { fr: "Qui a écrit le livre des Psaumes en grande partie ?", ht: "Ki moun ki te ekri pifò nan liv Sòm yo ?", en: "Who wrote most of the book of Psalms?", answer: { fr: "Le roi David", ht: "Wa David", en: "King David" } },
];

const SECTIONS = [
  { href: "/prieres",      icon: "🙏", color: "#7c3aed", bg: "#f5f3ff", fr: "Prière & Intercession", ht: "Lapriyè & Entèsesyon", en: "Prayer & Intercession", desc: { fr: "Déposez vos besoins. Intercédez pour d'autres.", ht: "Depoze bezwen ou. Entèsede pou lòt moun.", en: "Share your needs. Intercede for others." } },
  { href: "/etude",        icon: "📖", color: "#1d4ed8", bg: "#eff6ff", fr: "Étude Biblique",          ht: "Etid Biblik",          en: "Bible Study",         desc: { fr: "Plans de lecture et ressources théologiques.", ht: "Plan lekti ak resous teyolojik.", en: "Reading plans and theological resources." } },
  { href: "/enseignement", icon: "🎓", color: "#0891b2", bg: "#ecfeff", fr: "Enseignement",            ht: "Ansèyman",             en: "Teaching",            desc: { fr: "Séries et messages de pasteurs et leaders.", ht: "Seri ak mesaj pastè ak lidè.", en: "Series and messages from pastors and leaders." } },
  { href: "/jeu",          icon: "🏛️", color: "#ea580c", bg: "#fff7ed", fr: "Jeux Bibliques",          ht: "Jwèt Biblik",          en: "Bible Games",         desc: { fr: "Trois formats de défi pour tester vos connaissances.", ht: "Twa fòma defi pou teste konesans ou.", en: "Three challenge formats to test your knowledge." } },
  { href: "/concours",     icon: "🏆", color: "#b45309", bg: "#fffbeb", fr: "Concours Bibliques",      ht: "Konkou Biblik",        en: "Biblical Contests",   desc: { fr: "Compétitions en direct avec vote du public.", ht: "Konpetisyon an dirèk ak vòt piblik.", en: "Live competitions with public voting." } },
  { href: "/eglise",       icon: "⛪", color: "#16a34a", bg: "#f0fdf4", fr: "Groupes d'Église",        ht: "Gwoup Legliz",         en: "Church Groups",       desc: { fr: "Créez ou rejoignez votre communauté privée.", ht: "Kreye oswa rantre nan kominote prive ou.", en: "Create or join your private community." } },
];

const TESTIMONIALS = [
  { name: "Grace O.", country: "Nigeria", fr: "Je participe chaque semaine au concours. J'ai appris plus en un mois sur cette plateforme qu'en une année de cours.", ht: "Mwen patisipe chak semèn. Mwen aprann plis nan yon mwa sou platfòm sa a pase yon ane nan klas.", en: "I participate every week. I've learned more in one month here than in a year of classes." },
  { name: "Pasteur Emmanuel K.", country: "Cameroun", fr: "Enfin une plateforme sérieuse pour les chrétiens francophones. Les enseignements sont profonds et accessibles.", ht: "Anfin yon platfòm serye pou kretyen frankofòn yo. Ansèyman yo pwofon epi aksesib.", en: "Finally a serious platform for French-speaking Christians. The teachings are deep and accessible." },
  { name: "Marie-Claire D.", country: "Haïti", fr: "Le mur de prière a transformé ma façon d'intercéder. Des milliers de frères prient avec moi chaque jour.", ht: "Mi lapriyè a chanje fason mwen entèsede. Dè milye frè priye avèk mwen chak jou.", en: "The prayer wall transformed how I intercede. Thousands of brothers pray with me daily." },
];

function getDay() {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
}

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      observer.disconnect();
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

function AnimatedStat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-white font-black text-3xl sm:text-4xl tabular-nums">{count.toLocaleString()}{suffix}</p>
      <p className="text-white/40 text-xs font-medium mt-1 leading-tight">{label}</p>
    </div>
  );
}

export default function Home() {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;

  const day = getDay();
  const verse = VERSES[day % VERSES.length];
  const challenge = CHALLENGES[day % CHALLENGES.length];

  const [visible, setVisible] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [liveContest, setLiveContest] = useState<{ id: string; title: string; status: string } | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch("/api/contests").then(r => r.json()).then(d => {
      const live = (d.contests || []).find((c: { status: string }) => c.status === "active" || c.status === "voting" || c.status === "upcoming");
      setLiveContest(live || null);
    });
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserName(data.user.user_metadata?.full_name?.split(" ")[0] || null);
    });
  }, []);

  const greeting = userName
    ? (l === "fr" ? `Bonjour, ${userName} 👋` : l === "ht" ? `Bonjou, ${userName} 👋` : `Hello, ${userName} 👋`)
    : null;

  return (
    <main className="bg-white">

      {/* ══════ HERO ══════ */}
      <section className="relative overflow-hidden bg-[#080d18]" style={{ minHeight: "clamp(520px, 70vh, 740px)" }}>
        {/* Gold radial */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-[0.12] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, #c5a84f 0%, transparent 65%)" }} />
        {/* Cross */}
        <div className="absolute right-0 bottom-0 text-[320px] text-white opacity-[0.025] select-none pointer-events-none leading-none pr-4">✝</div>
        {/* Stars */}
        {[...Array(18)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse pointer-events-none"
            style={{ width: `${1 + Math.sin(i)*1}px`, height: `${1 + Math.sin(i)*1}px`, left: `${(i*17.3)%100}%`, top: `${(i*13.7+8)%80}%`, animationDuration: `${2+i%3}s`, opacity: 0.08 + (i%4)*0.04 }} />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 flex flex-col justify-center"
          style={{ minHeight: "clamp(520px, 70vh, 740px)" }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center py-16">

            {/* Left — headline */}
            <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s ease" }}>
              {greeting && (
                <div className="inline-flex items-center gap-2 bg-[#c5a84f]/10 border border-[#c5a84f]/20 rounded-full px-4 py-2 mb-5">
                  <span className="text-[#c5a84f] text-xs font-bold">{greeting}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-2 mb-6">
                <span className="w-1.5 h-1.5 bg-[#c5a84f] rounded-full animate-pulse" />
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {l === "fr" ? "Communauté Chrétienne Mondiale" : l === "ht" ? "Kominote Kretyen Mondyal" : "Global Christian Community"}
                </span>
              </div>

              <h1 className="text-white font-black leading-[1.06] mb-6" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
                {l === "fr" ? <>Grandissez dans la foi.<br /><span className="text-[#c5a84f]">Ensemble.</span></> :
                 l === "ht" ? <>Grandi nan lafwa.<br /><span className="text-[#c5a84f]">Ansanm.</span></> :
                 <>Grow in faith.<br /><span className="text-[#c5a84f]">Together.</span></>}
              </h1>

              <p className="text-white/45 text-base leading-relaxed mb-8 max-w-lg">
                {l === "fr" ? "Prière, étude biblique, concours, enseignements et communautés d'église — tout ce dont vous avez besoin pour votre croissance spirituelle."
               : l === "ht" ? "Lapriyè, etid biblik, konkou, ansèyman ak kominote legliz — tout sa ou bezwen pou kwasans espirityèl ou."
               : "Prayer, Bible study, contests, teachings and church communities — everything you need for your spiritual growth."}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/aujourd-hui"
                  className="inline-flex items-center gap-2 bg-[#c5a84f] hover:bg-[#d4b85c] text-[#0f2044] font-black text-sm px-7 py-3.5 rounded-full transition-all hover:shadow-lg hover:shadow-[#c5a84f]/20 hover:-translate-y-0.5">
                  ✨ {l === "fr" ? "Commencer aujourd'hui" : l === "ht" ? "Kòmanse jodi a" : "Start today"}
                </Link>
                <Link href="/decouvrir"
                  className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-bold text-sm px-7 py-3.5 rounded-full transition-all">
                  {l === "fr" ? "Découvrir" : l === "ht" ? "Dekouvri" : "Discover"} →
                </Link>
              </div>
            </div>

            {/* Right — Today's content card */}
            <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}>
              <div className="bg-white/[0.06] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                {/* Card header */}
                <div className="bg-gradient-to-r from-[#c5a84f]/20 to-transparent border-b border-white/10 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#c5a84f] rounded-full animate-pulse" />
                    <span className="text-[#c5a84f] text-[10px] font-black uppercase tracking-[0.2em]">
                      {l === "fr" ? "Aujourd'hui" : l === "ht" ? "Jodi a" : "Today"}
                    </span>
                  </div>
                  <Link href="/aujourd-hui" className="text-white/30 text-[10px] hover:text-white/60 transition-colors font-bold">
                    {l === "fr" ? "Tout voir →" : l === "ht" ? "Wè tout →" : "See all →"}
                  </Link>
                </div>

                {/* Verse */}
                <div className="px-6 py-5 border-b border-white/8">
                  <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mb-2">📖 {l === "fr" ? "Verset du jour" : l === "ht" ? "Vèsè jou a" : "Verse of the day"}</p>
                  <blockquote className="text-white text-sm font-semibold leading-relaxed italic mb-1">
                    &ldquo;{verse[l]}&rdquo;
                  </blockquote>
                  <p className="text-[#c5a84f] text-[10px] font-bold">{verse.ref[l]}</p>
                </div>

                {/* Challenge */}
                <div className="px-6 py-4 border-b border-white/8">
                  <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mb-2">🏛️ {l === "fr" ? "Défi du jour" : l === "ht" ? "Defi jou a" : "Daily challenge"}</p>
                  <p className="text-white/70 text-xs font-medium mb-3">{challenge[l]}</p>
                  {!showAnswer ? (
                    <button onClick={() => setShowAnswer(true)}
                      className="text-[10px] font-black text-[#c5a84f] border border-[#c5a84f]/20 bg-[#c5a84f]/5 px-3 py-1.5 rounded-full hover:bg-[#c5a84f]/15 transition-colors">
                      {l === "fr" ? "Voir la réponse" : l === "ht" ? "Wè repons" : "See answer"}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-green-400 text-[10px] font-black bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                      ✓ {challenge.answer[l]}
                    </span>
                  )}
                </div>

                {/* Live contest */}
                {liveContest && (
                  <div className="px-6 py-4">
                    <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mb-2">
                      🏆 {liveContest.status === "active"
                        ? (l === "fr" ? "En direct maintenant" : l === "ht" ? "An dirèk kounye a" : "Live now")
                        : (l === "fr" ? "Prochain concours" : l === "ht" ? "Pwochen konkou" : "Next contest")}
                    </p>
                    <p className="text-white text-xs font-bold mb-3 truncate">{liveContest.title}</p>
                    <Link href={`/concours/${liveContest.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#0f2044] border border-white/10 text-white/80 hover:text-white text-[10px] font-black px-4 py-2 rounded-full transition-colors">
                      {liveContest.status === "active"
                        ? (l === "fr" ? "Regarder en direct" : l === "ht" ? "Gade an dirèk" : "Watch live")
                        : (l === "fr" ? "S'inscrire" : l === "ht" ? "Enskri" : "Register")} →
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c5a84f]/30 to-transparent" />
      </section>

      {/* ══════ STATS BAR ══════ */}
      <section className="bg-[#0f2044] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            <AnimatedStat value={12} suffix="+" label={l === "fr" ? "Pays représentés" : l === "ht" ? "Peyi reprezante" : "Countries"} />
            <AnimatedStat value={500} suffix="+" label={l === "fr" ? "Membres actifs" : l === "ht" ? "Manm aktif" : "Active members"} />
            <AnimatedStat value={1200} suffix="+" label={l === "fr" ? "Prières publiées" : l === "ht" ? "Lapriyè pibliye" : "Prayers shared"} />
            <AnimatedStat value={98} suffix="%" label={l === "fr" ? "Satisfaction membres" : l === "ht" ? "Satisfaksyon manm" : "Member satisfaction"} />
          </div>
        </div>
      </section>

      {/* ══════ 6 SECTIONS ══════ */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 mb-2">
              {l === "fr" ? "L'écosystème complet" : l === "ht" ? "Ekosistèm konplè a" : "The complete ecosystem"}
            </p>
            <h2 className="text-[#0f2044] font-black text-2xl sm:text-3xl">
              {l === "fr" ? "Tout ce dont vous avez besoin pour grandir" : l === "ht" ? "Tout sa ou bezwen pou grandi" : "Everything you need to grow"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTIONS.map(s => (
              <Link key={s.href} href={s.href}
                className="group flex items-start gap-4 p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: `${s.color}20`, backgroundColor: `${s.color}05` }}>
                <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[#0f2044] text-base mb-1 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: s.color }}>{s[l]}</p>
                  <p className="text-stone-400 text-xs leading-relaxed">{s.desc[l]}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-wider" style={{ color: s.color }}>
                    {l === "fr" ? "Accéder →" : l === "ht" ? "Antre →" : "Open →"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WHY KP / EMOTIONAL SECTION ══════ */}
      <section className="bg-[#080d18] py-16 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 50%, #1d4ed808 0%, transparent 60%)" }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-[0.25em] mb-4">
                {l === "fr" ? "Pourquoi KONEKSYON PAM ?" : l === "ht" ? "Poukisa KONEKSYON PAM ?" : "Why KONEKSYON PAM?"}
              </p>
              <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-6">
                {l === "fr" ? "Pas un réseau social. Une communauté de foi."
               : l === "ht" ? "Se pa yon rezo sosyal. Se yon kominote lafwa."
               : "Not a social network. A community of faith."}
              </h2>
              <div className="space-y-4">
                {[
                  { icon: "🕐", fr: "Revenez chaque jour — quelque chose de nouveau vous attend.", ht: "Tounen chak jou — yon bagay nouvo ap tann ou.", en: "Come back every day — something new awaits you." },
                  { icon: "🌍", fr: "Une communauté mondiale qui parle votre langue et partage votre foi.", ht: "Yon kominote mondyal ki pale lang ou epi pataje lafwa ou.", en: "A global community that speaks your language and shares your faith." },
                  { icon: "📖", fr: "Grandir dans la Parole, pas défiler du contenu vide.", ht: "Grandi nan Pawòl la, pa juste derule kontni vid.", en: "Grow in the Word, not scroll through empty content." },
                  { icon: "⛪", fr: "Recommandé par des pasteurs et des leaders d'église.", ht: "Rekòmande pa pastè ak lidè legliz.", en: "Recommended by pastors and church leaders." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-white/50 text-sm leading-relaxed">{item[l]}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-white/60 text-sm italic leading-relaxed mb-3">&ldquo;{t[l]}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#c5a84f]/20 flex items-center justify-center text-[#c5a84f] text-xs font-black shrink-0">{t.name[0]}</div>
                    <div>
                      <p className="text-white/70 text-xs font-bold">{t.name}</p>
                      <p className="text-white/30 text-[10px]">{t.country}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[1,2,3,4,5].map(s => <span key={s} className="text-[#c5a84f] text-[10px]">★</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SHARE / INVITE ══════ */}
      <section className="py-12 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <ShareButton
            title="KONEKSYON PAM"
            context="default"
            variant="banner"
          />
        </div>
      </section>

      {/* ══════ MISSION BANNER ══════ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
        <MissionBanner variant="card" />
      </section>

      {/* ══════ NEXT STEP ══════ */}
      <NextStep context="default" title={
        l === "fr" ? "Par où voulez-vous commencer ?" :
        l === "ht" ? "Ki kote ou vle kòmanse ?" :
        "Where do you want to start?"
      } />

      {/* ══════ FOOTER BAND ══════ */}
      <section className="bg-[#0f2044] py-8 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src="/logo-kp.png" alt="KP" className="w-8 h-8 rounded-lg" />
            <div>
              <p className="text-white font-black text-sm">KONEKSYON PAM</p>
              <p className="text-white/30 text-[9px] uppercase tracking-widest">
                {l === "fr" ? "Plateforme Chrétienne" : l === "ht" ? "Platfòm Kretyen" : "Christian Platform"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {SECTIONS.slice(0,4).map(s => (
              <Link key={s.href} href={s.href}
                className="text-white/40 text-xs hover:text-white transition-colors font-medium">{s[l]}</Link>
            ))}
            <Link href="/aujourd-hui" className="text-[#c5a84f]/60 text-xs hover:text-[#c5a84f] transition-colors font-medium">
              {l === "fr" ? "Aujourd'hui" : l === "ht" ? "Jodi a" : "Today"}
            </Link>
            <Link href="/decouvrir" className="text-white/40 text-xs hover:text-white transition-colors font-medium">
              {l === "fr" ? "Découvrir" : l === "ht" ? "Dekouvri" : "Discover"}
            </Link>
            <Link href="/don" className="text-rose-400/60 text-xs hover:text-rose-300 transition-colors font-bold">
              ❤ {l === "fr" ? "Soutenir" : l === "ht" ? "Sipòte" : "Support"}
            </Link>
          </div>
          <p className="text-white/20 text-[10px]">© {new Date().getFullYear()} KONEKSYON PAM</p>
        </div>
      </section>
    </main>
  );
}
