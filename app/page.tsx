"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import NextStep from "@/app/components/NextStep";
import ShareButton from "@/app/components/ShareButton";
import MissionBanner from "@/app/components/MissionBanner";
import { DEMO_ACTIVITY, DEMO_PRAYERS, PRAYER_CATEGORIES, DEMO_TESTIMONIES } from "@/lib/demo-data";

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
  if (value === 0) return null;
  return (
    <div ref={ref} className="text-center">
      <p className="text-white font-black text-3xl sm:text-4xl tabular-nums">{count.toLocaleString()}{suffix}</p>
      <p className="text-white/40 text-xs font-medium mt-1 leading-tight">{label}</p>
    </div>
  );
}

interface PlatformStats {
  members: number;
  prayers: number;
  testimonies: number;
  churches: number;
  contests: number;
  votes: number;
  hasRealData: boolean;
  loaded: boolean;
}

function usePlatformStats(): PlatformStats {
  const [s, setS] = useState<PlatformStats>({
    members: 0, prayers: 0, testimonies: 0, churches: 0, contests: 0, votes: 0,
    hasRealData: false, loaded: false,
  });
  useEffect(() => {
    fetch("/api/platform-stats")
      .then(r => r.json())
      .then(d => setS({ ...d, loaded: true }))
      .catch(() => setS(prev => ({ ...prev, loaded: true })));
  }, []);
  return s;
}

export default function Home() {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;

  const day = getDay();
  const verse = VERSES[day % VERSES.length];
  const challenge = CHALLENGES[day % CHALLENGES.length];

  const platformStats = usePlatformStats();

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
      <section className="relative overflow-hidden" style={{
        minHeight: "clamp(600px, 82vh, 860px)",
        background: "linear-gradient(145deg, #020717 0%, #07102a 30%, #0d0b2c 60%, #06091c 100%)"
      }}>
        {/* ── Central divine glow ── */}
        <div className="absolute inset-0 pointer-events-none animate-hero-glow" style={{
          background: "radial-gradient(ellipse 75% 55% at 50% 15%, rgba(197,168,79,0.22) 0%, rgba(99,102,241,0.10) 40%, transparent 68%)"
        }} />
        {/* ── Blue depth left ── */}
        <div className="absolute inset-0 pointer-events-none animate-hero-side" style={{
          background: "radial-gradient(ellipse 55% 75% at -5% 55%, rgba(29,78,216,0.14) 0%, transparent 58%)"
        }} />
        {/* ── Purple depth right ── */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 48% 65% at 105% 25%, rgba(124,58,237,0.11) 0%, transparent 58%)",
          animation: "heroGlowSide 11s ease-in-out infinite 2s"
        }} />
        {/* ── Soft blur center shimmer ── */}
        <div className="absolute pointer-events-none animate-shimmer-gold" style={{
          top: "-10%", left: "25%", right: "25%", height: "45%",
          background: "radial-gradient(ellipse at center, rgba(197,168,79,0.07) 0%, transparent 70%)",
          filter: "blur(48px)"
        }} />
        {/* ── Top accent line ── */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(197,168,79,0.5) 35%, rgba(197,168,79,0.7) 50%, rgba(197,168,79,0.5) 65%, transparent 100%)" }} />

        {/* ── Cross watermark ── */}
        <div className="absolute right-4 sm:right-8 bottom-0 select-none pointer-events-none leading-none text-white animate-cross"
          style={{ fontSize: "clamp(180px, 26vw, 360px)", opacity: 0.028 }}>✝</div>

        {/* ── White star particles ── */}
        {[...Array(22)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white pointer-events-none"
            style={{
              width: `${0.7 + (i % 4) * 0.55}px`, height: `${0.7 + (i % 4) * 0.55}px`,
              left: `${(i * 14.3 + 5) % 100}%`, top: `${(i * 11.7 + 8) % 88}%`,
              opacity: 0.05 + (i % 5) * 0.025,
              animation: `${i % 2 === 0 ? "floatParticle" : "floatParticleB"} ${3.5 + (i % 5) * 0.8}s ease-in-out infinite`,
              animationDelay: `${(i * 0.4) % 4}s`
            }} />
        ))}
        {/* ── Golden particles ── */}
        {[...Array(7)].map((_, i) => (
          <div key={`g${i}`} className="absolute rounded-full pointer-events-none"
            style={{
              width: `${1.2 + (i % 3) * 0.7}px`, height: `${1.2 + (i % 3) * 0.7}px`,
              backgroundColor: "#c5a84f",
              left: `${8 + i * 13}%`, top: `${12 + (i * 17) % 65}%`,
              opacity: 0.18 + (i % 3) * 0.07,
              animation: `floatParticle ${4.5 + i * 0.7}s ease-in-out infinite`,
              animationDelay: `${i * 0.6}s`
            }} />
        ))}

        {/* ── Content ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 flex flex-col justify-center"
          style={{ minHeight: "clamp(600px, 82vh, 860px)" }}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20">

            {/* Left — headline */}
            <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16,1,0.3,1)" }}>

              {greeting && (
                <div className="inline-flex items-center gap-2 bg-[#c5a84f]/10 border border-[#c5a84f]/25 rounded-full px-4 py-2 mb-5 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-[#c5a84f] rounded-full animate-pulse" />
                  <span className="text-[#c5a84f] text-xs font-bold">{greeting}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-2 border border-white/12 rounded-full px-4 py-2 mb-7 backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <span className="w-1.5 h-1.5 bg-[#c5a84f] rounded-full animate-pulse" />
                <span className="text-white/55 text-[10px] font-bold uppercase tracking-[0.22em]">
                  {l === "fr" ? "Communauté Chrétienne Mondiale" : l === "ht" ? "Kominote Kretyen Mondyal" : "Global Christian Community"}
                </span>
              </div>

              <h1 className="font-black leading-[1.04] mb-6" style={{ fontSize: "clamp(2.7rem, 5.5vw, 4.9rem)" }}>
                <span className="block text-white/90">
                  {l === "fr" ? "Grandissez dans" : l === "ht" ? "Grandi nan" : "Grow in"}
                </span>
                <span className="block" style={{
                  background: "linear-gradient(135deg, #c5a84f 0%, #f0d888 45%, #c5a84f 75%, #9d8035 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>
                  {l === "fr" ? "la Foi." : l === "ht" ? "Lafwa." : "the Faith."}
                </span>
                <span className="block text-white">
                  {l === "fr" ? "Ensemble." : l === "ht" ? "Ansanm." : "Together."}
                </span>
              </h1>

              <p className="text-white/48 leading-relaxed mb-9 max-w-lg"
                style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}>
                {l === "fr" ? "Une plateforme chrétienne internationale — prière, études bibliques, concours, enseignements et communautés d'église pour votre croissance spirituelle."
               : l === "ht" ? "Yon platfòm kretyen entènasyonal — lapriyè, etid biblik, konkou, ansèyman ak kominote legliz pou kwasans espirityèl ou."
               : "An international Christian platform — prayer, Bible studies, contests, teachings and church communities for your spiritual growth."}
              </p>

              <div className="flex flex-wrap gap-3"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.35s" }}>
                <Link href="/aujourd-hui"
                  className="group inline-flex items-center gap-2.5 font-black text-sm px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: "linear-gradient(135deg, #c5a84f 0%, #d8bc5e 50%, #b89440 100%)",
                    color: "#07102a",
                    boxShadow: "0 4px 28px rgba(197,168,79,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(197,168,79,0.45), inset 0 1px 0 rgba(255,255,255,0.18)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 28px rgba(197,168,79,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"; }}>
                  <span>✨</span>
                  {l === "fr" ? "Commencer aujourd'hui" : l === "ht" ? "Kòmanse jodi a" : "Start today"}
                </Link>
                <Link href="/decouvrir"
                  className="inline-flex items-center gap-2 border border-white/18 hover:border-white/35 text-white hover:text-white/90 font-bold text-sm px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-sm"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  {l === "fr" ? "Découvrir" : l === "ht" ? "Dekouvri" : "Discover"} →
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 mt-7"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.55s" }}>
                <div className="flex -space-x-1.5">
                  {["G","M","P","J","A"].map((letter, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-black text-white"
                      style={{ backgroundColor: ["#7c3aed","#1d4ed8","#b45309","#16a34a","#0891b2"][i], borderColor: "#07102a" }}>
                      {letter}
                    </div>
                  ))}
                </div>
                <p className="text-white/35 text-xs leading-tight">
                  {l === "fr" ? "Des milliers de chrétiens vous ont rejoint" : l === "ht" ? "Milye kretyen deja antre" : "Thousands of Christians joined"}
                </p>
              </div>
            </div>

            {/* Right — Today card */}
            <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.22s" }}>
              <div className="rounded-3xl overflow-hidden backdrop-blur-md"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 12px 72px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset"
                }}>
                {/* Card header */}
                <div className="border-b px-6 py-4 flex items-center justify-between"
                  style={{ background: "linear-gradient(90deg, rgba(197,168,79,0.18) 0%, transparent 100%)", borderColor: "rgba(255,255,255,0.08)" }}>
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
                <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mb-2">📖 {l === "fr" ? "Verset du jour" : l === "ht" ? "Vèsè jou a" : "Verse of the day"}</p>
                  <blockquote className="text-white text-sm font-semibold leading-relaxed italic mb-1">
                    &ldquo;{verse[l]}&rdquo;
                  </blockquote>
                  <p className="text-[#c5a84f] text-[10px] font-bold">{verse.ref[l]}</p>
                </div>

                {/* Challenge */}
                <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
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

        {/* Bottom gradient separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(197,168,79,0.35) 50%, transparent 100%)" }} />
      </section>

      {/* ══════ STATS BAR ══════ */}
      <section className="bg-[#0f2044] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          {platformStats.loaded && !platformStats.hasRealData ? (
            /* Launch message — shown only while platform is brand new */
            <div className="text-center py-4">
              <p className="text-[#c5a84f] font-black text-lg mb-2">
                {l === "fr" ? "🌱 Rejoignez les premiers membres fondateurs"
                 : l === "ht" ? "🌱 Rantre nan premye manm fondatè yo"
                 : "🌱 Join the founding members"}
              </p>
              <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
                {l === "fr" ? "KONEKSYON PAM vient de lancer. Votre inscription compte — soyez parmi les premières pierres de cette communauté mondiale."
                 : l === "ht" ? "KONEKSYON PAM fèk lanse. Enskripsyon ou konte — swa youn nan premye wòch kominote mondyal sa a."
                 : "KONEKSYON PAM just launched. Your registration matters — be among the first stones of this global community."}
              </p>
              <Link href="/auth"
                className="inline-flex items-center gap-2 mt-5 bg-[#c5a84f] hover:bg-[#d4b85c] text-[#0f2044] font-black text-sm px-7 py-3 rounded-full transition-all">
                {l === "fr" ? "Devenir membre fondateur →"
                 : l === "ht" ? "Tounen manm fondatè →"
                 : "Become a founding member →"}
              </Link>
            </div>
          ) : (
            /* Real stats — shown as soon as we have real data */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
              {platformStats.members > 0 && (
                <AnimatedStat value={platformStats.members}
                  label={l === "fr" ? "Membres inscrits" : l === "ht" ? "Manm enskri" : "Members"} />
              )}
              {platformStats.prayers > 0 && (
                <AnimatedStat value={platformStats.prayers}
                  label={l === "fr" ? "Prières partagées" : l === "ht" ? "Lapriyè pataje" : "Prayers shared"} />
              )}
              {platformStats.testimonies > 0 && (
                <AnimatedStat value={platformStats.testimonies}
                  label={l === "fr" ? "Témoignages" : l === "ht" ? "Temwayaj" : "Testimonies"} />
              )}
              {platformStats.churches > 0 && (
                <AnimatedStat value={platformStats.churches}
                  label={l === "fr" ? "Groupes actifs" : l === "ht" ? "Gwoup aktif" : "Active groups"} />
              )}
              {/* Fallback cols when some stats are still 0 */}
              {platformStats.contests > 0 && platformStats.churches === 0 && (
                <AnimatedStat value={platformStats.contests}
                  label={l === "fr" ? "Concours organisés" : l === "ht" ? "Konkou òganize" : "Contests held"} />
              )}
              {platformStats.votes > 0 && platformStats.testimonies === 0 && (
                <AnimatedStat value={platformStats.votes}
                  label={l === "fr" ? "Votes exprimés" : l === "ht" ? "Vòt eksprime" : "Votes cast"} />
              )}
            </div>
          )}
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

      {/* ══════ COMMUNITY ACTIVITY ══════ */}
      <section className="py-16 px-5 sm:px-8 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Activity feed */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 mb-2">
                {l === "fr" ? "En ce moment" : l === "ht" ? "Kounye a" : "Right now"}
              </p>
              <h2 className="text-[#0f2044] font-black text-2xl sm:text-3xl mb-8">
                {l === "fr" ? "La communauté en action" : l === "ht" ? "Kominote a an aksyon" : "The community in action"}
              </h2>
              <div className="space-y-3">
                {DEMO_ACTIVITY.map((item, i) => (
                  <div key={item.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 hover:border-stone-200 transition-all"
                    style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${item.color}15` }}>
                      {item.action[l] === item.action[l] ? item.icon : ""}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-800 text-sm">
                        <span className="font-black">{item.name}</span>
                        <span className="text-stone-400 mx-1">{item.flag}</span>
                        <span className="text-stone-500">{item.action[l]}</span>
                      </p>
                      <p className="text-stone-300 text-[10px] mt-0.5">{item.countryName[l]} · {item.time}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                      style={{ backgroundColor: item.color }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Prayer preview */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 mb-2">
                {l === "fr" ? "Mur de prière" : l === "ht" ? "Mi lapriyè" : "Prayer wall"}
              </p>
              <h2 className="text-[#0f2044] font-black text-2xl sm:text-3xl mb-8">
                {l === "fr" ? "Priez avec eux" : l === "ht" ? "Priye avèk yo" : "Pray with them"}
              </h2>
              <div className="space-y-4">
                {DEMO_PRAYERS.filter(p => p.featured).slice(0, 3).map(prayer => {
                  const cat = PRAYER_CATEGORIES[prayer.category];
                  return (
                    <div key={prayer.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl bg-stone-50 shrink-0">
                          {prayer.flag}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-stone-900 font-bold text-sm">{prayer.name}</p>
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                              {cat[l]}
                            </span>
                          </div>
                          <p className="text-stone-400 text-xs">{prayer.countryName[l]}</p>
                        </div>
                        <span className="text-stone-200 font-bold text-xs shrink-0">
                          🙏 {prayer.pray_count.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-stone-600 text-xs leading-relaxed line-clamp-2 italic">
                        &ldquo;{prayer.text[l].slice(0, 120)}…&rdquo;
                      </p>
                    </div>
                  );
                })}
              </div>
              <Link href="/prieres"
                className="mt-5 inline-flex items-center gap-2 text-[#7c3aed] text-sm font-black hover:opacity-75 transition-opacity">
                {l === "fr" ? "Voir toutes les demandes →" : l === "ht" ? "Wè tout demann yo →" : "See all prayer requests →"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIAL PREVIEW ══════ */}
      <section className="py-16 px-5 sm:px-8 bg-[#080d18]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-2">
                {l === "fr" ? "Témoignages" : l === "ht" ? "Temwayaj" : "Testimonies"}
              </p>
              <h2 className="text-white font-black text-2xl sm:text-3xl">
                {l === "fr" ? "Ce que Dieu a fait dans nos vies" : l === "ht" ? "Sa Bondye fè nan lavi nou" : "What God has done in our lives"}
              </h2>
            </div>
            <Link href="/temoignages"
              className="hidden sm:block text-white/30 text-sm font-black hover:text-white transition-colors shrink-0">
              {l === "fr" ? "Tous les témoignages →" : l === "ht" ? "Tout temwayaj →" : "All testimonies →"}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {DEMO_TESTIMONIES.slice(0, 3).map(testimony => (
              <div key={testimony.id}
                className="bg-white/[0.04] border border-white/8 rounded-2xl p-6 hover:border-white/20 transition-all">
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full mb-4"
                  style={{ backgroundColor: `${testimony.avatarColor}20`, color: testimony.avatarColor }}>
                  {testimony.categoryIcon} {testimony.category[l]}
                </span>
                <p className="text-white/55 text-sm leading-relaxed mb-5 line-clamp-4 italic">
                  &ldquo;{testimony.text[l].slice(0, 200)}…&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ backgroundColor: testimony.avatarColor }}>
                    {testimony.name[0]}
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-bold">{testimony.name} {testimony.flag}</p>
                    <p className="text-white/30 text-[10px]">{testimony.countryName[l]}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-[10px]">★</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/temoignages"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-7 py-3 rounded-full hover:border-white/40 transition-colors text-sm">
              {l === "fr" ? "Lire tous les témoignages" : l === "ht" ? "Li tout temwayaj yo" : "Read all testimonies"} →
            </Link>
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
            <Image src="/logo-kp.png" alt="KP" width={32} height={32} className="rounded-lg" />
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
