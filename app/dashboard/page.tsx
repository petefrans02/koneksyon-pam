"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";
import MissionBanner from "@/app/components/MissionBanner";
import ChampionnatBibliqueCard from "@/app/components/ChampionnatBibliqueCard";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

const SECTIONS: { href: string; icon: IconName; color: string; fr: string; ht: string; en: string; es: string }[] = [
  { href: "/championnats", icon: "trophee",     color: "#c8960f", fr: "Championnats", ht: "Chanpyona",  en: "Championships", es: "Campeonatos"  },
  { href: "/bible",        icon: "bible",       color: "#00aac8", fr: "Bible",         ht: "Bib",        en: "Bible",         es: "Biblia"       },
  { href: "/etude",        icon: "etude",       color: "#1a3568", fr: "Études",        ht: "Etid",       en: "Studies",       es: "Estudios"     },
  { href: "/prieres",      icon: "priere",      color: "#2d6a4f", fr: "Prières",       ht: "Lapriyè",    en: "Prayers",       es: "Oraciones"    },
  { href: "/louange",      icon: "musique",     color: "#ec4899", fr: "Louange",       ht: "Lwanj",      en: "Worship",       es: "Alabanza"     },
  { href: "/communaute",   icon: "communaute",  color: "#00aac8", fr: "Communauté",    ht: "Kominote",   en: "Community",     es: "Comunidad"    },
  { href: "/temoignages",  icon: "temoignages", color: "#c8960f", fr: "Témoignages",   ht: "Temwayaj",   en: "Testimonies",   es: "Testimonios"  },
  { href: "/etude?parcours=enseignements", icon: "enseignement",color: "#1a3568", fr: "Enseignements", ht: "Ansèyman",   en: "Teachings",     es: "Enseñanzas"   },
  { href: "/academie",     icon: "academie",    color: "#2d6a4f", fr: "Académie",      ht: "Akademi",    en: "Academy",       es: "Academia"     },
];

interface Level { name: string; min: number; icon: string; }
interface Badge { icon: string; name: string; earned: boolean; }
interface LiveContest { id: string; title: string; status: string; score: number; }
interface MatchHistory {
  contest_id: string;
  contest_title: string;
  score: number;
  accuracy: number;
  rank: number | null;
  total_players: number;
  played_at: string;
}
interface UserStats {
  xp: number;
  currentLevel: Level;
  nextLevel: Level | null;
  xpToNext: number;
  xpProgress: number;
  stats: { contests: number; totalScore: number; accuracy: number; prayers: number; votes: number; correctAnswers: number; };
  badges: Badge[];
  liveContests: LiveContest[];
  name: string;
  avatar: string | null;
}

const VERSE_OF_DAY = [
  { ref: { fr: "Jérémie 29:11", ht: "Jeremi 29:11", en: "Jeremiah 29:11", es: "Jeremías 29:11" }, fr: "Car je connais les projets que j'ai formés sur vous — projets de paix et non de malheur.", ht: "Paske mwen konnen plan mwen genyen pou nou — plan pou fè nou jwenn lapè.", en: "For I know the plans I have for you — plans to prosper you and not to harm you.", es: "Porque yo sé los planes que tengo para ustedes — planes de paz y no de mal." },
  { ref: { fr: "Philippiens 4:13", ht: "Filipyen 4:13", en: "Philippians 4:13", es: "Filipenses 4:13" }, fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me.", es: "Todo lo puedo en Cristo que me fortalece." },
  { ref: { fr: "Ésaïe 41:10", ht: "Ezayi 41:10", en: "Isaiah 41:10", es: "Isaías 41:10" }, fr: "Ne crains rien, car je suis avec toi.", ht: "Pa pè, paske mwen avèk ou.", en: "Do not fear, for I am with you.", es: "No temas, porque yo estoy contigo." },
  { ref: { fr: "Psaumes 23:1", ht: "Sòm 23:1", en: "Psalm 23:1", es: "Salmos 23:1" }, fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen — mwen p ap manke anyen.", en: "The Lord is my shepherd — I lack nothing.", es: "El Señor es mi pastor — nada me faltará." },
  { ref: { fr: "Romains 8:28", ht: "Women 8:28", en: "Romans 8:28", es: "Romanos 8:28" }, fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.", en: "In all things God works for the good of those who love him.", es: "En todas las cosas Dios obra para el bien de los que le aman." },
  { ref: { fr: "Jean 3:16", ht: "Jan 3:16", en: "John 3:16", es: "Juan 3:16" }, fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique.", ht: "Paske Bondye te renmen mond lan sitèlman li te bay Pitit li a ki fèk li.", en: "For God so loved the world that he gave his one and only Son.", es: "Porque tanto amó Dios al mundo que dio a su Hijo unigénito." },
  { ref: { fr: "2 Timothée 1:7", ht: "2 Timote 1:7", en: "2 Timothy 1:7", es: "2 Timoteo 1:7" }, fr: "Dieu ne nous a pas donné un esprit de timidité, mais un esprit de force.", ht: "Bondye pa ba nou yon lespri pè, men yon lespri fòs.", en: "God has not given us a spirit of fear, but of power and love.", es: "Dios no nos ha dado un espíritu de cobardía, sino de poder y amor." },
];

function getDayVerse() {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return VERSE_OF_DAY[day % VERSE_OF_DAY.length];
}

export default function DashboardPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [noUser, setNoUser] = useState(false);
  const [liveContests, setLiveContests] = useState<{ id: string; title: string | Record<string, string>; status: string; solo_enabled?: boolean }[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [privateMatches, setPrivateMatches] = useState<{ id: string; title: string; theme: string; status: string; invite_code: string; created_at: string; num_rounds: number }[]>([]);
  const [deletingMatch, setDeletingMatch] = useState<string | null>(null);
  const [xpAnimated, setXpAnimated] = useState(false);
  const matchRef = useRef<HTMLDivElement>(null);

  const verse = getDayVerse();

  const reveal = useCallback((ref: React.RefObject<HTMLDivElement | null>, cls: string) => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { ref.current?.classList.add(cls); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setNoUser(true); setLoading(false); return; }
      fetch("/api/user-stats").then(r => r.json()).then(d => {
        setStats(d);
        setLoading(false);
        setTimeout(() => setXpAnimated(true), 600);
      });
      try {
        const { data: sessions } = await supabase
          .from("contest_sessions")
          .select("score, completed_at, contest_id, round_scores")
          .eq("user_id", data.user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(10);
        if (sessions && sessions.length > 0) {
          const contestIds = [...new Set(sessions.map(s => s.contest_id))];
          const { data: contestsData } = await supabase
            .from("contests")
            .select("id, title")
            .in("id", contestIds);
          const titleMap = Object.fromEntries((contestsData ?? []).map(c => [c.id, c.title]));
          const { data: lbData } = await supabase
            .from("contest_leaderboard")
            .select("contest_id, rank_global, accuracy_pct")
            .eq("user_id", data.user.id)
            .in("contest_id", contestIds);
          const lbMap = Object.fromEntries((lbData ?? []).map(lb => [lb.contest_id, lb]));
          const history: MatchHistory[] = sessions.map(s => ({
            contest_id: s.contest_id,
            contest_title: titleMap[s.contest_id] ?? "Championnat",
            score: s.score ?? 0,
            accuracy: lbMap[s.contest_id]?.accuracy_pct ?? 0,
            rank: lbMap[s.contest_id]?.rank_global ?? null,
            total_players: 0,
            played_at: s.completed_at ?? "",
          }));
          setMatchHistory(history);
        }
      } catch { /* ignore */ }
    });
    fetch("/api/contests").then(r => r.json()).then(d => {
      // Concours activés (enabled) et publics — jouables en solo ou en équipe.
      const live = (d.contests || []).filter((c: { status: string; is_private?: boolean }) =>
        (c.status === "active" || c.status === "upcoming") && !c.is_private);
      setLiveContests(live.slice(0, 8));
    });
    fetch("/api/user/private-matches").then(r => r.json()).then(d => {
      if (d.matches) setPrivateMatches(d.matches);
    }).catch(() => {});
  }, []);

  useEffect(() => { return reveal(matchRef, "dash-visible"); }, [reveal]);

  const txt = {
    welcome: { fr: "Bienvenue", ht: "Byenveni", en: "Welcome", es: "Bienvenido" },
    level: { fr: "Niveau", ht: "Nivo", en: "Level", es: "Nivel" },
    xp: { fr: "points d'expérience", ht: "pwen eksperyans", en: "experience points", es: "puntos de experiencia" },
    to: { fr: "pour atteindre", ht: "pou rive", en: "to reach", es: "para alcanzar" },
    contests: { fr: "Concours joués", ht: "Konkou jwe", en: "Contests played", es: "Concursos jugados" },
    score: { fr: "Score total", ht: "Pwen total", en: "Total score", es: "Puntuación total" },
    accuracy: { fr: "Précision", ht: "Presizyon", en: "Accuracy", es: "Precisión" },
    prayers: { fr: "Prières publiées", ht: "Lapriyè pibliye", en: "Prayers posted", es: "Oraciones publicadas" },
    votes: { fr: "Votes donnés", ht: "Vòt bay", en: "Votes cast", es: "Votos dados" },
    correct: { fr: "Bonnes réponses", ht: "Bon repons", en: "Correct answers", es: "Respuestas correctas" },
    badges: { fr: "Mes badges", ht: "Baj mwen yo", en: "My badges", es: "Mis insignias" },
    locked: { fr: "Verrouillé", ht: "Vewouye", en: "Locked", es: "Bloqueado" },
    verse: { fr: "Verset du jour", ht: "Vèsè jou a", en: "Verse of the day", es: "Versículo del día" },
    explore: { fr: "Continuer à explorer", ht: "Kontinye eksplore", en: "Keep exploring", es: "Seguir explorando" },
    live: { fr: "Concours en direct", ht: "Konkou an dirèk", en: "Live contests", es: "Concursos en vivo" },
    join: { fr: "Rejoindre", ht: "Rantre", en: "Join", es: "Unirse" },
    viewAll: { fr: "Voir tous les concours", ht: "Wè tout konkou yo", en: "View all contests", es: "Ver todos los concursos" },
    signin: { fr: "Connectez-vous pour accéder à votre tableau de bord personnalisé.", ht: "Konekte pou jwenn tablo bò ou a.", en: "Sign in to access your personalized dashboard.", es: "Inicia sesión para acceder a tu panel personalizado." },
    signinBtn: { fr: "Se connecter avec Google", ht: "Konekte ak Google", en: "Sign in with Google", es: "Iniciar sesión con Google" },
    today: { fr: "Aujourd'hui", ht: "Jodi a", en: "Today", es: "Hoy" },
    stats: { fr: "Statistiques", ht: "Estatistik", en: "Statistics", es: "Estadísticas" },
    progression: { fr: "Progression", ht: "Pwogresyon", en: "Progression", es: "Progresión" },
    current: { fr: "← vous", ht: "← ou", en: "← you", es: "← tú" },
    levelNames: {
      fr: ["Disciple","Serviteur","Évangéliste","Missionnaire","Ancien","Pasteur","Docteur","Champion KP","Maître Biblik","Légende"],
      ht: ["Disip","Sèvitè","Evanjelis","Misyonè","Ansyen","Pastè","Doktè","Chanpyon KP","Mèt Biblik","Lejann"],
      en: ["Disciple","Servant","Evangelist","Missionary","Elder","Pastor","Doctor","KP Champion","Bible Master","Legend"],
      es: ["Discípulo","Siervo","Evangelista","Misionero","Anciano","Pastor","Doctor","Campeón KP","Maestro Bíblico","Leyenda"],
    },
  };
  const t = (k: keyof typeof txt) => txt[k][l];

  async function deletePrivateMatch(id: string) {
    if (!confirm(l === "fr" ? "Supprimer ce match privé ?" : l === "ht" ? "Efase match prive sa a ?" : l === "es" ? "¿Eliminar esta partida privada?" : "Delete this private match?")) return;
    setDeletingMatch(id);
    const res = await fetch(`/api/user/private-matches?id=${id}`, { method: "DELETE" });
    if (res.ok) setPrivateMatches(ms => ms.filter(m => m.id !== id));
    setDeletingMatch(null);
  }

  /* ── NOT LOGGED IN ── */
  if (noUser) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #f0f5ff 0%, #ffffff 50%, #fffbf0 100%)" }}>
      <style>{`
        @keyframes dash-login-in {
          from { opacity:0; transform:translateY(24px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes dash-login-pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(26,53,104,0); }
          50% { box-shadow:0 0 0 8px rgba(26,53,104,0.10); }
        }
      `}</style>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(26,53,104,0.06) 0%, transparent 68%)" }} />
      <div className="relative z-10 max-w-sm" style={{ animation: "dash-login-in 0.7s cubic-bezier(0.16,1,0.3,1) both" }}>
        <Image src="/logo-kpf.png" alt="KP" width={72} height={72}
          className="rounded-2xl mx-auto mb-6 shadow-2xl"
          style={{ filter: "drop-shadow(0 0 24px rgba(200,150,15,0.35))" }} />
        <h1 style={{ color:"#1a3568", fontWeight:900, fontSize:"1.75rem", marginBottom:8, letterSpacing:"-0.02em" }}>KONEKSYON PAM</h1>
        <p style={{ color:"#c8960f", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:24 }}>
          {l==="fr"?"Tableau de bord":l==="ht"?"Tablo bò":l==="es"?"Panel personal":"Dashboard"}
        </p>
        <p style={{ color:"#4a5568", fontSize:"0.88rem", lineHeight:1.6, marginBottom:32 }}>{t("signin")}</p>
        <button onClick={() => signInWithGoogle("/dashboard")}
          className="w-full flex items-center justify-center gap-3 font-bold px-6 py-4 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
          style={{ background:"#1a3568", color:"#fff", animation: "dash-login-pulse 3s ease-in-out infinite" }}>
          <GoogleIcon />
          {t("signinBtn")}
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%)" }}>
      <div className="w-8 h-8 border-2 border-[#1a3568] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = stats!;
  const firstName = s.name?.split(" ")[0] || "";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #ffffff 0%, #ffffff 50%, #ffffff 100%)", color:"#1c1c2e" }}>

      <style>{`
        @keyframes dash-aurora {
          0%,100% { opacity:1; transform:scale(1) rotate(-2deg); }
          50% { opacity:.7; transform:scale(1.08) rotate(3deg); }
        }
        @keyframes dash-orb-b {
          0%,100% { transform:translate(0,0) scale(1); }
          33% { transform:translate(-30px,20px) scale(1.08); }
          66% { transform:translate(25px,-15px) scale(0.92); }
        }
        @keyframes dash-shimmer {
          from { background-position:-200% center; }
          to { background-position:200% center; }
        }
        @keyframes dash-card-in {
          from { opacity:0; transform:translateY(18px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes dash-badge-pop {
          0% { opacity:0; transform:scale(0.7); }
          70% { transform:scale(1.08); }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes dash-ring {
          from { transform:rotate(0deg); }
          to { transform:rotate(360deg); }
        }
        @keyframes dash-float {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-8px); }
        }
        .dash-stat-card {
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
        }
        .dash-stat-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 32px rgba(200,150,15,0.12);
        }
        .dash-section-link {
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, border-color 0.2s;
        }
        .dash-section-link:hover { transform: translateX(3px); }
        .dash-live-card { transition: all 0.2s ease; }
        .dash-live-card:hover {
          border-color: rgba(0,170,200,0.5) !important;
          background: rgba(0,170,200,0.04) !important;
        }
        .dash-match-row {
          opacity: 0;
          transform: translateX(-12px);
          transition: opacity 0.4s ease, transform 0.4s ease, background 0.2s;
        }
        .dash-match-row:hover { background: #fffbf0; }
        .dash-visible .dash-match-row { opacity:1; transform:translateX(0); }
        .dash-badge-item { animation: dash-badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* ── DASHBOARD HEADER ── */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a3568 0%, #0d1d3d 50%, #0a1830 100%)", color:"#fff" }}>

        {/* Gold glow */}
        <div className="absolute -top-16 -left-16 w-[500px] h-[350px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(200,150,15,0.12) 0%, transparent 70%)", animation: "dash-aurora 10s ease-in-out infinite" }} />
        <div className="absolute -top-8 right-0 w-[350px] h-[280px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(0,170,200,0.10) 0%, transparent 70%)", animation: "dash-orb-b 13s ease-in-out infinite" }} />

        {/* Gold shimmer top line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 0%, #c8960f 40%, #f0c840 60%, transparent 100%)", backgroundSize: "200% 100%", animation: "dash-shimmer 4s linear infinite" }} />

        {/* Decorative rings */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-32 h-32 pointer-events-none opacity-[0.04]"
          style={{ border: "1px solid #c8960f", borderRadius: "50%", animation: "dash-ring 20s linear infinite" }} />
        <div className="absolute top-1/2 right-16 -translate-y-1/2 w-20 h-20 pointer-events-none opacity-[0.06]"
          style={{ border: "1px dashed #c8960f", borderRadius: "50%", animation: "dash-ring 14s linear infinite reverse" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ animation: "dash-card-in 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div className="flex items-center gap-4">
              {s.avatar
                ? <Image src={s.avatar} width={56} height={56}
                    className="rounded-full border-2 border-[#c8960f]/60 shadow-lg"
                    style={{ filter: "drop-shadow(0 0 12px rgba(200,150,15,0.3))" }}
                    alt="" unoptimized />
                : <div className="w-14 h-14 rounded-full flex items-center justify-center text-[#04040d] font-black text-xl shadow-lg"
                    style={{ background: "linear-gradient(135deg, #c8960f, #f0c840)", filter: "drop-shadow(0 0 12px rgba(200,150,15,0.35))" }}>
                    {s.name?.[0] ?? "?"}
                  </div>
              }
              <div>
                <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.65rem", textTransform:"uppercase", letterSpacing:"0.25em" }}>{t("welcome")}</p>
                <h1 style={{ color:"#fff", fontWeight:900, fontSize:"1.25rem", lineHeight:1.2 }}>{firstName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">{s.currentLevel.icon}</span>
                  <span className="font-black text-xs" style={{ color: "#f0c840" }}>{s.currentLevel.name}</span>
                  <span style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>·</span>
                  <span style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.75rem", fontWeight:700 }}>{s.xp} XP</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/aujourd-hui"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
                <Icon name="etincelles" size={14} /> {t("today")}
              </Link>
              <Link href="/championnats"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #c8960f, #f0c840)", color: "#0d1d3d", boxShadow: "0 2px 16px rgba(200,150,15,0.30)" }}>
                <Icon name="trophee" size={14} /> {l === "fr" ? "Jouer" : l === "ht" ? "Jwe" : l === "es" ? "Jugar" : "Play"}
              </Link>
            </div>
          </div>

          {/* XP Progress bar — animated fill on load */}
          {s.nextLevel && (
            <div className="mt-6" style={{ animation: "dash-card-in 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
              <div className="flex justify-between mb-2" style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.55)" }}>
                <span>{s.currentLevel.icon} {s.currentLevel.name}</span>
                <span>{s.xpToNext} XP → {s.nextLevel.icon} {s.nextLevel.name}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="h-full rounded-full relative overflow-hidden"
                  style={{
                    width: xpAnimated ? `${s.xpProgress}%` : "0%",
                    background: "linear-gradient(90deg, #c8960f, #00aac8)",
                    transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: "0 0 8px rgba(0,170,200,0.45)",
                  }}>
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "dash-shimmer 2s linear infinite" }} />
                </div>
              </div>
              <div className="flex justify-end mt-1">
                <span style={{ fontSize:"0.56rem", color:"rgba(255,255,255,0.55)", fontWeight:700 }}>{Math.round(s.xpProgress)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accès direct au Championnat Biblique (sans lien partagé) */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6">
        <ChampionnatBibliqueCard />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Verse of the day */}
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "#ffffff", border: "1px solid #e8e4de", boxShadow: "0 2px 8px rgba(26,53,104,0.05)", animation: "dash-card-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#c8960f,#1a3568,#00aac8)", borderRadius:999, marginBottom:16 }} />
            <Icon name="croix" size={80} className="absolute right-4 top-4 select-none" style={{ color:"rgba(26,53,104,0.04)", animation: "dash-float 6s ease-in-out infinite" }} />
            <p style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#c8960f", fontSize:"0.65rem", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:12 }}><Icon name="etincelles" size={13} /> {t("verse")}</p>
            <blockquote style={{ color:"#1a3568", fontWeight:700, fontSize:"1rem", lineHeight:1.6, marginBottom:12, fontStyle:"italic", fontFamily:"'Playfair Display',Georgia,serif" }}>
              &ldquo;{verse[l]}&rdquo;
            </blockquote>
            <p style={{ color:"#4a5568", fontSize:"0.75rem", fontWeight:700 }}>{verse.ref[l]}</p>
          </div>

          {/* Concours disponibles — jouer en solo ou en équipe */}
          {liveContests.length > 0 && (
            <div style={{ animation: "dash-card-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
              <div className="flex items-center justify-between mb-3">
                <p style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#1a3568", fontSize:"0.65rem", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.25em" }}><Icon name="trophee" size={13} /> {l === "fr" ? "Concours disponibles" : l === "ht" ? "Konkou disponib" : l === "es" ? "Concursos disponibles" : "Available contests"}</p>
                <Link href="/championnats" style={{ color:"#c8960f", fontSize:"0.75rem", fontWeight:700 }}>{t("viewAll")}</Link>
              </div>
              <div className="flex flex-col gap-2">
                {liveContests.map((c, i) => {
                  const title = typeof c.title === "string" ? c.title : (c.title?.[l] ?? c.title?.fr ?? Object.values(c.title || {})[0] ?? "Concours");
                  return (
                    <div key={c.id}
                      className="dash-live-card flex items-center gap-2.5 px-4 py-3 rounded-xl flex-wrap"
                      style={{ background: "#ffffff", border: "1px solid #e8e4de", animationDelay: `${i * 0.08}s` }}>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.status === "active" ? "animate-pulse" : ""}`}
                        style={c.status === "active" ? { background:"#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)" } : { background:"#c8960f" }} />
                      <p style={{ flex:1, minWidth:120, fontSize:"0.88rem", fontWeight:700, color:"#1a3568" }} className="truncate">{title}</p>
                      {c.solo_enabled && (
                        <Link href={`/championnats/${c.id}/solo`} className="shrink-0 transition-transform hover:-translate-y-0.5"
                          style={{ fontSize:"0.72rem", fontWeight:800, color:"#7c3aed", background:"#7c3aed12", border:"1px solid #7c3aed33", padding:"5px 12px", borderRadius:999 }}>
                          🎯 {l === "fr" ? "Solo" : l === "ht" ? "Pou kont ou" : l === "es" ? "Solo" : "Solo"}
                        </Link>
                      )}
                      <Link href={`/championnats/${c.id}`} className="shrink-0 transition-transform hover:-translate-y-0.5"
                        style={{ fontSize:"0.72rem", fontWeight:800, color:"#c8960f", background:"#c8960f12", border:"1px solid #c8960f33", padding:"5px 12px", borderRadius:999 }}>
                        👥 {l === "fr" ? "Équipe" : l === "ht" ? "Ekip" : l === "es" ? "Equipo" : "Team"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div style={{ animation: "dash-card-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
            <p style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#1a3568", fontSize:"0.65rem", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:12 }}><Icon name="classement" size={13} /> {t("stats")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {([
                { label: t("contests"), value: s.stats.contests, icon: "trophee", color: "#c8960f" },
                { label: t("score"), value: s.stats.totalScore, icon: "etoile", color: "#c8960f" },
                { label: t("accuracy"), value: `${s.stats.accuracy}%`, icon: "cible", color: "#1a3568" },
                { label: t("correct"), value: s.stats.correctAnswers, icon: "succes", color: "#2d6a4f" },
                { label: t("prayers"), value: s.stats.prayers, icon: "priere", color: "#00aac8" },
                { label: t("votes"), value: s.stats.votes, icon: "coeur", color: "#e05c94" },
              ] as { label: string; value: string | number; icon: IconName; color: string }[]).map((item, i) => (
                <div key={i} className="dash-stat-card rounded-2xl p-5 cursor-default"
                  style={{ background: "#ffffff", border: "1px solid #e8e4de", boxShadow: "0 2px 8px rgba(26,53,104,0.05)", borderTop: `3px solid ${item.color}` }}>
                  <div className="mb-2"
                    style={{ animation: `dash-float ${5 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}><Icon name={item.icon} size={26} color={item.color} /></div>
                  <p className="font-black text-xl tabular-nums" style={{ color: item.color }}>{item.value}</p>
                  <p style={{ color:"#4a5568", fontSize:"0.65rem", fontWeight:600, marginTop:2, lineHeight:1.3 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Explore sections */}
          <div style={{ animation: "dash-card-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both" }}>
            <p style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#1a3568", fontSize:"0.65rem", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:12 }}><Icon name="monde" size={13} /> {t("explore")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SECTIONS.map((sec, i) => (
                <Link key={sec.href} href={sec.href}
                  className="dash-section-link flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold"
                  style={{ background: `${sec.color}10`, color: sec.color, border: `1px solid ${sec.color}30`, animationDelay: `${i * 0.05}s` }}>
                  <Icon name={sec.icon} size={20} />
                  <span>{sec[l]}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Univers spirituel */}
          <div style={{ animation: "dash-card-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both" }}>
            <p style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#1a3568", fontSize:"0.65rem", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:12 }}>
              <Icon name="croix" size={13} /> {l==="fr"?"Univers Spirituel":l==="ht"?"Inivè Espirityèl":l==="es"?"Universo Espiritual":"Spiritual Universe"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { href:"/aujourd-hui",  icon:"etincelles", label:{fr:"Verset du jour",  ht:"Vèsè jou a",    en:"Verse of the day",  es:"Versículo del día"}, color:"#7c3aed" },
                { href:"/classement",   icon:"trophee",    label:{fr:"Classement",      ht:"Klasman",         en:"Rankings",          es:"Ranking"},           color:"#c8960f" },
                { href:"/communaute",   icon:"communaute", label:{fr:"Communauté",      ht:"Kominote",        en:"Community",         es:"Comunidad"},          color:"#2d6a4f" },
                { href:"/communaute",       icon:"eglise",     label:{fr:"Église",          ht:"Legliz",          en:"Church",            es:"Iglesia"},            color:"#1a3568" },
                { href:"/trophees",     icon:"medaille",   label:{fr:"Trophées",        ht:"Twofè",           en:"Trophies",          es:"Trofeos"},            color:"#00aac8" },
                { href:"/temoignages",  icon:"temoignages",label:{fr:"Témoignages",     ht:"Temwayaj",        en:"Testimonies",       es:"Testimonios"},        color:"#c8960f" },
              ] as { href: string; icon: IconName; label: Record<Lang,string>; color: string }[]).map((item, i) => (
                <Link key={item.href} href={item.href}
                  className="dash-section-link flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold"
                  style={{ background: `${item.color}10`, color: item.color, border: `1px solid ${item.color}30`, animationDelay: `${i * 0.06}s` }}>
                  <Icon name={item.icon} size={20} />
                  <span>{item.label[l]}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — badges + progression */}
        <div className="flex flex-col gap-5">

          {/* Badges */}
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "#ffffff", border: "1px solid #e8e4de", boxShadow: "0 2px 8px rgba(26,53,104,0.05)", animation: "dash-card-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#c8960f,#e8b84b)", borderRadius:999, marginBottom:16 }} />
            <p style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#1a3568", fontSize:"0.65rem", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:16 }}><Icon name="medaille" size={13} /> {t("badges")}</p>
            <div className="grid grid-cols-2 gap-2">
              {s.badges.map((b, i) => (
                <div key={i} className={`dash-badge-item flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  b.earned ? "hover:bg-[#fffbf0]" : "opacity-30"
                }`} style={{ border: b.earned ? "1px solid rgba(200,150,15,0.30)" : "1px solid #e8e4de", animationDelay: `${0.3 + i * 0.06}s` }}>
                  <span className="text-2xl">{b.earned ? b.icon : <Icon name="cadenas" size={22} />}</span>
                  <p style={{ fontSize:"0.65rem", fontWeight:700, textAlign:"center", lineHeight:1.3, color: b.earned ? "#c8960f" : "#718096" }}>
                    {b.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Level progression */}
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "#ffffff", border: "1px solid #e8e4de", boxShadow: "0 2px 8px rgba(26,53,104,0.05)", animation: "dash-card-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both" }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#1a3568,#00aac8)", borderRadius:999, marginBottom:16 }} />
            <p style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#1a3568", fontSize:"0.65rem", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:16 }}><Icon name="progression" size={13} /> {t("progression")}</p>
            <div className="space-y-1">
              {([
                { icon: "foi", min: 0 }, { icon: "foi", min: 200 }, { icon: "micro", min: 500 },
                { icon: "monde", min: 1000 }, { icon: "colombe", min: 2000 }, { icon: "bible", min: 3500 },
                { icon: "academie", min: 5000 }, { icon: "trophee", min: 7500 }, { icon: "couronne", min: 10000 }, { icon: "etoile", min: 15000 },
              ] as { icon: IconName; min: number }[]).map((lv, i) => {
                const name = txt.levelNames[l][i];
                const isCurrent = lv.min === s.currentLevel.min;
                const reached = s.xp >= lv.min;
                return (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all"
                    style={isCurrent ? { background:"rgba(200,150,15,0.08)", border:"1px solid rgba(200,150,15,0.25)" } : {}}>
                    <Icon name={lv.icon} size={16} className={reached ? "" : "opacity-25"} />
                    <span style={{ flex:1, fontWeight:700, color: reached ? "#1a3568" : "#b0b8c5" }}>{name}</span>
                    <span style={{ fontSize:"0.65rem", fontWeight:900, color: isCurrent ? "#c8960f" : "#b0b8c5" }}>
                      {isCurrent ? t("current") : `${lv.min}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Match history ── */}
      {matchHistory.length > 0 && (
        <div ref={matchRef} className="max-w-7xl mx-auto px-5 sm:px-8 pb-6">
          <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e8e4de", boxShadow: "0 2px 8px rgba(26,53,104,0.05)" }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#c8960f,#1a3568)", borderRadius:"999px 999px 0 0" }} />
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid #f0ede8" }}>
              <p style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#1a3568", fontSize:"0.65rem", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.25em" }}>
                <Icon name="trophee" size={13} /> {l === "fr" ? "Historique des matchs" : l === "ht" ? "Istwa match yo" : l === "es" ? "Historial de partidas" : "Match History"}
              </p>
              <span style={{ color:"#4a5568", fontSize:"0.75rem" }}>{matchHistory.length} match{matchHistory.length > 1 ? "s" : ""}</span>
            </div>
            <div>
              {matchHistory.map((m, i) => {
                const medalIcon: IconName = m.accuracy >= 40 ? "medaille" : "bible";
                const medalColor = m.accuracy === 100 ? "#d4a017" : m.accuracy >= 70 ? "#9ca3af" : m.accuracy >= 40 ? "#cd7f32" : "#1a3568";
                const rankLabel = m.rank ? `#${m.rank}${m.total_players ? ` / ${m.total_players}` : ""}` : "—";
                const date = m.played_at ? new Date(m.played_at).toLocaleDateString(l === "ht" ? "fr" : l, { day: "numeric", month: "short", year: "numeric" }) : "—";
                return (
                  <div key={i} className="dash-match-row px-6 py-4 flex items-center gap-4"
                    style={{ transitionDelay: `${i * 0.05}s`, borderBottom: i < matchHistory.length - 1 ? "1px solid #f0ede8" : "none" }}>
                    <Icon name={medalIcon} size={26} color={medalColor} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight:700, color:"#1a3568", fontSize:"0.88rem" }} className="truncate">{m.contest_title}</p>
                      <p style={{ color:"#4a5568", fontSize:"0.72rem", marginTop:2 }}>{date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <p style={{ fontWeight:900, color:"#c8960f", fontSize:"0.88rem" }}>{m.score.toLocaleString()} pts</p>
                      <p style={{ color:"#4a5568", fontSize:"0.65rem" }}>{Math.round(m.accuracy)}% · {rankLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Private matches ── */}
      {privateMatches.length > 0 && (
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-6">
          <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e8e4de", boxShadow: "0 2px 8px rgba(26,53,104,0.05)" }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#1a3568,#00aac8)", borderRadius:"999px 999px 0 0" }} />
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid #f0ede8" }}>
              <p style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#1a3568", fontSize:"0.65rem", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.25em" }}>
                <Icon name="cadenas" size={13} /> {l === "fr" ? "Mes matchs privés" : l === "ht" ? "Match prive mwen yo" : l === "es" ? "Mis partidas privadas" : "My private matches"}
              </p>
            </div>
            <div>
              {privateMatches.map((m, idx) => {
                const statusColor = m.status === "active" ? "#2d6a4f" : m.status === "completed" ? "#718096" : "#c8960f";
                const statusLabel = m.status === "active"
                  ? (l === "fr" ? "En cours" : l === "ht" ? "Ap jwe" : l === "es" ? "En curso" : "In progress")
                  : m.status === "completed"
                    ? (l === "fr" ? "Terminé" : l === "ht" ? "Fini" : l === "es" ? "Terminado" : "Completed")
                    : (l === "fr" ? "En attente" : l === "ht" ? "Ap tann" : l === "es" ? "En espera" : "Waiting");
                const date = new Date(m.created_at).toLocaleDateString(l === "ht" ? "fr" : l, { day: "numeric", month: "short", year: "numeric" });
                return (
                  <div key={m.id} className="px-6 py-4 flex items-center gap-4 transition-colors hover:bg-[#fffbf0]"
                    style={{ borderBottom: idx < privateMatches.length - 1 ? "1px solid #f0ede8" : "none" }}>
                    <Icon name="cadenas" size={20} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight:700, color:"#1a3568", fontSize:"0.88rem" }} className="truncate">{m.title || m.theme}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span style={{ color:"#4a5568", fontSize:"0.72rem" }}>{date}</span>
                        <span style={{ fontFamily:"monospace", fontSize:"0.65rem", color:"#718096" }}>{m.invite_code}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span style={{ fontSize:"0.72rem", fontWeight:900, color: statusColor, background: `${statusColor}15`, border: `1px solid ${statusColor}35`, padding:"2px 8px", borderRadius:999 }}>
                        {statusLabel}
                      </span>
                      {(m.status === "upcoming" || m.status === "active") && (
                        <Link href={`/championnats/${m.id}/lobby`} style={{ fontSize:"0.72rem", fontWeight:900, color:"#c8960f" }}>
                          {l === "fr" ? "Rejoindre" : l === "ht" ? "Rantre" : l === "es" ? "Unirse" : "Join"}
                        </Link>
                      )}
                      <button onClick={() => deletePrivateMatch(m.id)} disabled={deletingMatch === m.id}
                        className="transition-colors disabled:opacity-20 px-2 py-1 rounded-lg"
                        style={{ fontSize:"0.72rem", color:"#f87171" }}>
                        {deletingMatch === m.id ? "…" : <Icon name="supprimer" size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mission support banner */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-8">
        <MissionBanner variant="card" />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
