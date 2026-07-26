"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon, { IconName } from "@/app/components/Icon";
type Lang = "fr" | "ht" | "en" | "es";

const SECTIONS: { href: string; icon: IconName; color: string; fr: string; ht: string; en: string; es: string }[] = [
  { href: "/championnats", icon: "trophee",     color: "#c8960f", fr: "Championnats", ht: "Chanpyona",  en: "Championships", es: "Campeonatos"  },
  { href: "/bible",        icon: "bible",       color: "#00aac8", fr: "Bible",         ht: "Bib",        en: "Bible",         es: "Biblia"       },
  { href: "/etude",        icon: "etude",       color: "#1a3568", fr: "Études",        ht: "Etid",       en: "Studies",       es: "Estudios"     },
  { href: "/prieres",      icon: "priere",      color: "#2d6a4f", fr: "Prières",       ht: "Lapriyè",    en: "Prayers",       es: "Oraciones"    },
  { href: "/louange",      icon: "musique",     color: "#ec4899", fr: "Louange",       ht: "Lwanj",      en: "Worship",       es: "Alabanza"     },
  { href: "/communaute",   icon: "utilisateurs",color: "#00aac8", fr: "Communauté",    ht: "Kominote",   en: "Community",     es: "Comunidad"    },
  { href: "/temoignages",  icon: "temoignages", color: "#c8960f", fr: "Témoignages",   ht: "Temwayaj",   en: "Testimonies",   es: "Testimonios"  },
  { href: "/etude?parcours=enseignements", icon: "enseignement",color: "#1a3568", fr: "Enseignements", ht: "Ansèyman",   en: "Teachings",     es: "Enseñanzas"   },
  { href: "/academie",     icon: "academie",    color: "#2d6a4f", fr: "Académie",      ht: "Akademi",    en: "Academy",       es: "Academia"     },
];

const VERSES = [
  { ref: { fr: "Jérémie 29:11", ht: "Jeremi 29:11", en: "Jeremiah 29:11", es: "Jeremías 29:11" }, fr: "Car je connais les projets que j'ai formés sur vous — projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", ht: "Paske mwen konnen plan mwen genyen pou nou — plan pou fè nou jwenn lapè, pa dezas, pou ba nou yon avni ak espwa.", en: "For I know the plans I have for you — plans to prosper you and not to harm you, plans to give you hope and a future.", es: "Porque yo sé los planes que tengo para ustedes — planes de paz y no de mal, para darles un futuro y una esperanza.", color: "#00aac8" },
  { ref: { fr: "Philippiens 4:13", ht: "Filipyen 4:13", en: "Philippians 4:13", es: "Filipenses 4:13" }, fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me.", es: "Todo lo puedo en Cristo que me fortalece.", color: "#c8960f" },
  { ref: { fr: "Ésaïe 41:10", ht: "Ezayi 41:10", en: "Isaiah 41:10", es: "Isaías 41:10" }, fr: "Ne crains rien, car je suis avec toi. Ne promène pas des regards inquiets, car je suis ton Dieu.", ht: "Pa pè, paske mwen avèk ou. Pa dekouraje, paske mwen se Bondye ou.", en: "Do not fear, for I am with you. Do not be dismayed, for I am your God.", es: "No temas, porque yo estoy contigo. No te desalientes, porque yo soy tu Dios.", color: "#34d399" },
  { ref: { fr: "Psaumes 23:1", ht: "Sòm 23:1", en: "Psalm 23:1", es: "Salmos 23:1" }, fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen — mwen p ap manke anyen.", en: "The Lord is my shepherd — I lack nothing.", es: "El Señor es mi pastor — nada me faltará.", color: "#1a3568" },
  { ref: { fr: "Romains 8:28", ht: "Women 8:28", en: "Romans 8:28", es: "Romanos 8:28" }, fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.", en: "In all things God works for the good of those who love him.", es: "En todas las cosas Dios obra para el bien de los que le aman.", color: "#ec4899" },
  { ref: { fr: "2 Timothée 1:7", ht: "2 Timote 1:7", en: "2 Timothy 1:7", es: "2 Timoteo 1:7" }, fr: "Dieu ne nous a pas donné un esprit de timidité, mais un esprit de force, d'amour et de sagesse.", ht: "Bondye pa ba nou yon lespri pè, men yon lespri fòs, renmen ak disiplin.", en: "God has not given us a spirit of fear, but of power, love and sound mind.", es: "Dios no nos ha dado un espíritu de cobardía, sino de poder, amor y dominio propio.", color: "#f59e0b" },
  { ref: { fr: "Jean 14:6", ht: "Jan 14:6", en: "John 14:6", es: "Juan 14:6" }, fr: "Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.", ht: "Mwen se chemen an, verite a, ak lavi a. Pesonn pa ka al jwenn Papa a si se pa pase nan mwen.", en: "I am the way and the truth and the life. No one comes to the Father except through me.", es: "Yo soy el camino, la verdad y la vida. Nadie viene al Padre sino por mí.", color: "#00aac8" },
];

const CHALLENGES = [
  { fr: "Quel est le premier livre de la Bible ?", ht: "Ki premye liv Labib la ?", en: "What is the first book of the Bible?", es: "¿Cuál es el primer libro de la Biblia?", answer: { fr: "La Genèse", ht: "Jenèz", en: "Genesis", es: "Génesis" } },
  { fr: "Combien de disciples Jésus avait-il ?", ht: "Konbyen disip Jezi te genyen ?", en: "How many disciples did Jesus have?", es: "¿Cuántos discípulos tenía Jesús?", answer: { fr: "12 disciples", ht: "12 disip", en: "12 disciples", es: "12 discípulos" } },
  { fr: "Qui a construit l'arche ?", ht: "Ki moun ki te bati bato a ?", en: "Who built the ark?", es: "¿Quién construyó el arca?", answer: { fr: "Noé", ht: "Noe", en: "Noah", es: "Noé" } },
  { fr: "Dans quelle ville Jésus est-il né ?", ht: "Nan ki vil Jezi te fèt ?", en: "In which city was Jesus born?", es: "¿En qué ciudad nació Jesús?", answer: { fr: "Bethléem", ht: "Betleyèm", en: "Bethlehem", es: "Belén" } },
  { fr: "Combien de jours Jésus a-t-il jeûné dans le désert ?", ht: "Konbyen jou Jezi te jejinen nan dezè a ?", en: "How many days did Jesus fast in the desert?", es: "¿Cuántos días ayunó Jesús en el desierto?", answer: { fr: "40 jours", ht: "40 jou", en: "40 days", es: "40 días" } },
  { fr: "Quel prophète a reçu les Dix Commandements ?", ht: "Ki pwofèt ki te resevwa Dis Kòmandman yo ?", en: "Which prophet received the Ten Commandments?", es: "¿Qué profeta recibió los Diez Mandamientos?", answer: { fr: "Moïse", ht: "Moyiz", en: "Moses", es: "Moisés" } },
  { fr: "Qui a écrit le livre des Psaumes en grande partie ?", ht: "Ki moun ki te ekri pifò nan liv Sòm yo ?", en: "Who wrote most of the book of Psalms?", es: "¿Quién escribió la mayor parte del libro de los Salmos?", answer: { fr: "Le roi David", ht: "Wa David", en: "King David", es: "El rey David" } },
];

function getDay() {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
}

export default function AujourduiPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [contests, setContests] = useState<{ id: string; title: string; status: string; contest_participants: { count: number }[] }[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [verseIdx, setVerseIdx] = useState(0);
  const [verseAnim, setVerseAnim] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [gridVisible, setGridVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const day = getDay();
  const todayVerse = VERSES[day % VERSES.length];
  const challenge = CHALLENGES[day % CHALLENGES.length];

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGridVisible(true); }, { threshold: 0.05 });
    if (gridRef.current) obs.observe(gridRef.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    fetch("/api/contests").then(r => r.json()).then(d => setContests(d.contests || []));
  }, []);

  const goToVerse = (idx: number) => {
    setVerseAnim(false);
    setTimeout(() => { setVerseIdx(idx); setVerseAnim(true); }, 350);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      goToVerse((verseIdx + 1) % VERSES.length);
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseIdx]);

  const resetTimer = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    goToVerse(idx);
  };

  const verse = VERSES[verseIdx];

  const today = new Date();
  const dateStr = today.toLocaleDateString(l === "fr" ? "fr-FR" : l === "ht" ? "fr-HT" : l === "es" ? "es-ES" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const liveContest = contests.find(c => c.status === "active" || c.status === "voting");
  const upcomingContest = contests.find(c => c.status === "upcoming");
  const featuredContest = liveContest || upcomingContest;

  const txt = {
    today:        { fr: "Aujourd'hui",          ht: "Jodi a",             en: "Today",              es: "Hoy" },
    verseLabel:   { fr: "Verset du jour",        ht: "Vèsè jou a",         en: "Verse of the day",   es: "Versículo del día" },
    studyMore:    { fr: "Étudier →",             ht: "Etidye →",           en: "Study →",            es: "Estudiar →" },
    prayVerse:    { fr: "Prier →",               ht: "Priye →",            en: "Pray →",             es: "Orar →" },
    challenge:    { fr: "Défi biblique du jour", ht: "Defi biblik jou a",  en: "Bible challenge",    es: "Desafío bíblico" },
    reveal:       { fr: "Révéler la réponse",    ht: "Montre repons nan",  en: "Reveal answer",      es: "Revelar respuesta" },
    correct:      { fr: "Bonne réponse !",       ht: "Bon repons !",       en: "Correct!",           es: "¡Correcto!" },
    moreChallenges: { fr: "Plus de défis →",     ht: "Plis defi →",        en: "More challenges →",  es: "Más desafíos →" },
    featuredContest: { fr: "Concours du moment", ht: "Konkou kounye a",    en: "Featured contest",   es: "Concurso destacado" },
    participants: { fr: "participants",           ht: "patisipan",          en: "participants",       es: "participantes" },
    watchLive:    { fr: "Rejoindre en direct →", ht: "Antre an dirèk →",   en: "Join live →",        es: "Unirse en vivo →" },
    register:     { fr: "S'inscrire →",          ht: "Enskri →",           en: "Register →",         es: "Registrarse →" },
    ecosystem:    { fr: "Explorer l'univers KONEKSYON PAM", ht: "Eksplore KONEKSYON PAM", en: "Explore KONEKSYON PAM", es: "Explorar KONEKSYON PAM" },
    dashTitle:    { fr: "Votre tableau de bord", ht: "Tablo bò ou a",       en: "Your dashboard",     es: "Tu panel" },
    dashDesc:     { fr: "Niveau, badges, statistiques et concours en cours.", ht: "Nivo, baj, estatistik ak konkou an kou.", en: "Level, badges, stats and live contests.", es: "Nivel, insignias, estadísticas y concursos." },
    dashBtn:      { fr: "Mon Dashboard →",       ht: "Dashboard mwen →",   en: "My Dashboard →",     es: "Mi Panel →" },
  };
  const t = (k: keyof typeof txt) => txt[k][l];

  return (
    <div style={{ background: "linear-gradient(180deg, #04060f 0%, #050810 100%)", minHeight: "100vh", color: "#fff" }}>

      <style>{`
        @keyframes dawn-aurora {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes sun-rise {
          0%,100% { transform: translateY(0) scale(1); opacity: 0.9; }
          50%      { transform: translateY(-10px) scale(1.06); opacity: 1; }
        }
        @keyframes orb-dawn-1 {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-20px) scale(1.08); }
        }
        @keyframes orb-dawn-2 {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(-16px); }
        }
        @keyframes star-twinkle {
          0%,100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.4); }
        }
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes verse-slide-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes verse-slide-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-16px); }
        }
        @keyframes shimmer-d {
          from { transform: translateX(-100%); }
          to   { transform: translateX(300%); }
        }
        @keyframes card-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes reveal-btn {
          0%,100% { box-shadow: 0 0 0 0 rgba(251,146,60,0); }
          50%      { box-shadow: 0 0 0 6px rgba(251,146,60,0.12); }
        }
        @keyframes ring-dawn {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        .eco-link { transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease, background 0.2s ease; }
        .eco-link:hover { transform: translateY(-4px) scale(1.04) !important; }
      `}</style>

      {/* ══ HERO ══ */}
      <div style={{ position: "relative", overflow: "hidden" }}>

        {/* Aurora aube */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #04060f 0%, #0c0a1a 30%, #0a0c14 65%, #04060f 100%)", backgroundSize: "400% 400%", animation: "dawn-aurora 16s ease infinite", pointerEvents: "none" }} />

        {/* Orbe centrale dorée */}
        <div style={{ position: "absolute", top: "-5%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, borderRadius: "50%", background: "rgba(200,150,15,0.12)", filter: "blur(110px)", animation: "orb-dawn-1 9s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "4%", width: 280, height: 280, borderRadius: "50%", background: "rgba(0,170,200,0.08)", filter: "blur(70px)", animation: "orb-dawn-2 8s ease-in-out infinite 2s", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "0%", left: "6%", width: 240, height: 240, borderRadius: "50%", background: "rgba(200,150,15,0.06)", filter: "blur(65px)", animation: "orb-dawn-1 12s ease-in-out infinite 4s", pointerEvents: "none" }} />

        {/* Anneau */}
        <div style={{ position: "absolute", top: "46%", left: "50%", width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(200,150,15,0.10)", animation: "ring-dawn 28s linear infinite", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#c8960f", opacity: 0.8 }} />
        </div>

        {/* Stars */}
        {["✦","✧","★","·","✦","·","★"].map((s, i) => (
          <div key={i} style={{ position: "absolute", left: `${8 + i * 13}%`, top: `${8 + (i % 4) * 12}%`, fontSize: `${0.6 + (i % 3) * 0.25}rem`, color: "#c8960f", animation: `star-twinkle ${2.5 + i * 0.6}s ease-in-out infinite ${i * 0.4}s`, pointerEvents: "none", userSelect: "none" }}>{s}</div>
        ))}

        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(200,150,15,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(200,150,15,0.02) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(200,150,15,0.60), transparent)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "80px 24px 64px", textAlign: "center" }}>

          {/* Sun icon */}
          <div style={{ lineHeight: 1, marginBottom: 24, display: "inline-flex", animation: "sun-rise 5s ease-in-out infinite", filter: "drop-shadow(0 0 28px rgba(200,150,15,0.40))" }}><Icon name="soleil" size={80} color="#f0c840" /></div>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(200,150,15,0.10)", border: "1px solid rgba(200,150,15,0.28)", borderRadius: 999, padding: "6px 18px", marginBottom: 22, opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(-14px)", transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#c8960f", display: "inline-block", animation: "star-twinkle 1.8s ease-in-out infinite" }} />
            <Icon name="etincelles" size={12} color="#c8960f" />
            <span style={{ fontSize: 11, color: "#c8960f", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>{t("today")}</span>
          </div>

          {/* Titre date */}
          <h1 style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 12, background: "linear-gradient(135deg, #fff 0%, #f0c840 50%, #fff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "hero-in 0.7s ease 0.2s both" }}>
            {t("verseLabel")}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.30)", fontSize: 13, marginBottom: 0, textTransform: "capitalize", animation: "hero-in 0.7s ease 0.3s both" }}>{dateStr}</p>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div ref={gridRef} style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* ── Verse Carousel ── */}
        <div style={{
          position: "relative", overflow: "hidden", borderRadius: 28,
          background: "linear-gradient(135deg, rgba(8,14,36,0.95) 0%, rgba(14,24,56,0.85) 100%)",
          border: `1px solid ${verse.color}30`,
          padding: "40px 36px 32px", marginBottom: 20,
          opacity: gridVisible ? 1 : 0, transform: gridVisible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease, border-color 0.5s ease",
        }}>
          {/* Shimmer */}
          <div style={{ position: "absolute", top: 0, left: "-100%", width: "50%", height: "100%", background: `linear-gradient(90deg, transparent, ${verse.color}08, transparent)`, animation: "shimmer-d 5s ease-in-out infinite 1s", pointerEvents: "none" }} />
          {/* Top accent line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${verse.color}, transparent)`, transition: "background 0.5s ease" }} />
          {/* Déco cross */}
          <div style={{ position: "absolute", right: 20, top: 20, color: verse.color, opacity: 0.05, lineHeight: 1, userSelect: "none", transition: "color 0.5s ease" }}><Icon name="croix" size={90} /></div>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${verse.color}15`, border: `1px solid ${verse.color}30`, borderRadius: 999, padding: "5px 14px", marginBottom: 24, transition: "all 0.5s ease" }}>
            <Icon name="verset" size={11} color={verse.color} />
            <span style={{ fontSize: 9, color: verse.color, fontWeight: 800, letterSpacing: "0.20em", textTransform: "uppercase" }}>{t("verseLabel")}</span>
          </div>

          {/* Verse content — animated */}
          <div style={{ animation: verseAnim ? "verse-slide-in 0.4s ease" : "verse-slide-out 0.35s ease", minHeight: 120 }}>
            <blockquote style={{ fontSize: "clamp(1rem, 2.2vw, 1.3rem)", fontWeight: 700, fontStyle: "italic", lineHeight: 1.8, color: "rgba(255,255,255,0.88)", marginBottom: 18 }}>
              &ldquo;{verse[l]}&rdquo;
            </blockquote>
            <p style={{ color: verse.color, fontWeight: 800, fontSize: 14, transition: "color 0.5s ease" }}>{verse.ref[l]}</p>
          </div>

          {/* Navigation dots */}
          <div style={{ display: "flex", gap: 6, marginTop: 24, marginBottom: 20, alignItems: "center" }}>
            {VERSES.map((v, i) => (
              <button key={i} onClick={() => resetTimer(i)} style={{ width: i === verseIdx ? 24 : 6, height: 6, borderRadius: 999, background: i === verseIdx ? verse.color : "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", transition: "all 0.35s ease", padding: 0 }} />
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/etude" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 999, background: `${verse.color}12`, border: `1px solid ${verse.color}25`, color: verse.color, textDecoration: "none", transition: "all 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${verse.color}22`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${verse.color}12`; }}>
<Icon name="etude" size={14} /> {t("studyMore")}
            </Link>
            <Link href="/prieres" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 999, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "all 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}>
<Icon name="priere" size={14} /> {t("prayVerse")}
            </Link>
          </div>
        </div>

        {/* ── Bottom cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>

          {/* Défi biblique */}
          <div style={{ borderRadius: 24, padding: "28px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(251,146,60,0.15)", opacity: gridVisible ? 1 : 0, animation: gridVisible ? "card-up 0.5s ease 0.1s both" : "none" }}>
            <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.20em", textTransform: "uppercase", color: "#fb923c", marginBottom: 16 }}><Icon name="batiment" size={13} /> {t("challenge")}</p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: "1rem", lineHeight: 1.6, marginBottom: 22 }}>{challenge[l]}</p>
            {!showAnswer ? (
              <button onClick={() => setShowAnswer(true)}
                style={{ width: "100%", padding: "13px 0", borderRadius: 14, fontSize: 13, fontWeight: 800, background: "rgba(251,146,60,0.10)", border: "1px solid rgba(251,146,60,0.22)", color: "#fb923c", cursor: "pointer", animation: "reveal-btn 2.5s ease-in-out infinite" }}>
                {t("reveal")}
              </button>
            ) : (
              <div style={{ borderRadius: 14, padding: "16px 20px", background: "rgba(0,170,200,0.08)", border: "1px solid rgba(0,170,200,0.22)" }}>
                <p style={{ fontWeight: 900, fontSize: "1.1rem", color: "#4ade80", marginBottom: 4 }}>{challenge.answer[l]}</p>
                <p style={{ fontSize: 12, color: "rgba(74,222,128,0.60)" }}>{t("correct")}</p>
              </div>
            )}
            <Link href="/quiz" style={{ display: "inline-block", marginTop: 14, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.30)", textDecoration: "none" }}>{t("moreChallenges")}</Link>
          </div>

          {/* Concours featured */}
          {featuredContest ? (
            <div style={{ borderRadius: 24, padding: "28px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,150,15,0.18)", display: "flex", flexDirection: "column", opacity: gridVisible ? 1 : 0, animation: gridVisible ? "card-up 0.5s ease 0.18s both" : "none" }}>
              <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.20em", textTransform: "uppercase", color: "#c8960f", marginBottom: 16 }}><Icon name="trophee" size={13} /> {t("featuredContest")}</p>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
                {liveContest && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00aac8", animation: "star-twinkle 1.5s ease-in-out infinite", marginTop: 6, flexShrink: 0 }} />}
                <div>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", lineHeight: 1.5, marginBottom: 6 }}>{featuredContest.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.30)", fontSize: 12 }}>{featuredContest.contest_participants?.[0]?.count ?? 0} {t("participants")}</p>
                </div>
              </div>
              <Link href={`/championnats/${featuredContest.id}`}
                style={{ display: "block", textAlign: "center", padding: "13px 0", borderRadius: 14, fontWeight: 900, fontSize: 14, background: "linear-gradient(135deg, #b8860b 0%, #f0c840 100%)", color: "#04040d", textDecoration: "none" }}>
                {liveContest ? t("watchLive") : t("register")}
              </Link>
            </div>
          ) : (
            <div style={{ borderRadius: 24, padding: "28px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 12, opacity: gridVisible ? 1 : 0, animation: gridVisible ? "card-up 0.5s ease 0.18s both" : "none" }}>
              <Icon name="trophee" size={40} color="#c8960f" />
              <p style={{ color: "rgba(255,255,255,0.30)", fontSize: 14 }}>{l === "fr" ? "Aucun concours en cours" : l === "ht" ? "Pa gen konkou an kou" : l === "es" ? "No hay concursos activos" : "No active contests"}</p>
              <Link href="/championnats" style={{ fontSize: 13, fontWeight: 700, color: "#c8960f", textDecoration: "none" }}>{l === "fr" ? "Voir tous les concours →" : l === "ht" ? "Wè tout konkou →" : l === "es" ? "Ver concursos →" : "See all contests →"}</Link>
            </div>
          )}
        </div>

        {/* ── Écosystème ── */}
        <div style={{ marginTop: 20, borderRadius: 24, padding: "28px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", opacity: gridVisible ? 1 : 0, animation: gridVisible ? "card-up 0.5s ease 0.26s both" : "none" }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 20 }}><Icon name="monde" size={13} /> {t("ecosystem")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
            {SECTIONS.map((sec, i) => (
              <Link key={sec.href} href={sec.href} className="eco-link"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 8px", borderRadius: 18, textAlign: "center", background: `${sec.color}08`, border: `1px solid ${sec.color}20`, textDecoration: "none", animation: `card-up 0.4s ease ${0.30 + i * 0.05}s both`, opacity: gridVisible ? 1 : 0 }}>
                <Icon name={sec.icon} size={26} color={sec.color} />
                <span style={{ fontSize: 12, fontWeight: 700, color: sec.color, lineHeight: 1.3 }}>{sec[l]}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Dashboard link ── */}
        <div style={{
          marginTop: 20, borderRadius: 24, padding: "28px 28px",
          background: "linear-gradient(135deg, rgba(8,14,36,0.95) 0%, rgba(14,24,56,0.85) 100%)",
          border: "1px solid rgba(200,150,15,0.20)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          opacity: gridVisible ? 1 : 0, animation: gridVisible ? "card-up 0.5s ease 0.5s both" : "none",
        }}>
          <div>
            <p style={{ color: "#fff", fontWeight: 900, fontSize: "1rem", marginBottom: 6 }}>{t("dashTitle")}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{t("dashDesc")}</p>
          </div>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 999, fontWeight: 900, fontSize: 14, background: "linear-gradient(135deg, #b8860b 0%, #f0c840 100%)", color: "#04040d", textDecoration: "none", flexShrink: 0 }}>
            {t("dashBtn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
