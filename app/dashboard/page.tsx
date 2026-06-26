"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";
import { SECTIONS } from "@/app/components/NavBar";
import MissionBanner from "@/app/components/MissionBanner";

type Lang = "fr" | "ht" | "en";

interface Level { name: string; min: number; icon: string; }
interface Badge { icon: string; name: string; earned: boolean; }
interface LiveContest { id: string; title: string; status: string; score: number; }
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
  { ref: { fr: "Jérémie 29:11", ht: "Jeremi 29:11", en: "Jeremiah 29:11" }, fr: "Car je connais les projets que j'ai formés sur vous — projets de paix et non de malheur.", ht: "Paske mwen konnen plan mwen genyen pou nou — plan pou fè nou jwenn lapè.", en: "For I know the plans I have for you — plans to prosper you and not to harm you." },
  { ref: { fr: "Philippiens 4:13", ht: "Filipyen 4:13", en: "Philippians 4:13" }, fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me." },
  { ref: { fr: "Ésaïe 41:10", ht: "Ezayi 41:10", en: "Isaiah 41:10" }, fr: "Ne crains rien, car je suis avec toi.", ht: "Pa pè, paske mwen avèk ou.", en: "Do not fear, for I am with you." },
  { ref: { fr: "Psaumes 23:1", ht: "Sòm 23:1", en: "Psalm 23:1" }, fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen — mwen p ap manke anyen.", en: "The Lord is my shepherd — I lack nothing." },
  { ref: { fr: "Romains 8:28", ht: "Women 8:28", en: "Romans 8:28" }, fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.", en: "In all things God works for the good of those who love him." },
  { ref: { fr: "Jean 3:16", ht: "Jan 3:16", en: "John 3:16" }, fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique.", ht: "Paske Bondye te renmen mond lan sitèlman li te bay Pitit li a ki fèk li.", en: "For God so loved the world that he gave his one and only Son." },
  { ref: { fr: "2 Timothée 1:7", ht: "2 Timote 1:7", en: "2 Timothy 1:7" }, fr: "Dieu ne nous a pas donné un esprit de timidité, mais un esprit de force.", ht: "Bondye pa ba nou yon lespri pè, men yon lespri fòs.", en: "God has not given us a spirit of fear, but of power and love." },
];

function getDayVerse() {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return VERSE_OF_DAY[day % VERSE_OF_DAY.length];
}

export default function DashboardPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [noUser, setNoUser] = useState(false);
  const [liveContests, setLiveContests] = useState<{ id: string; title: string; status: string }[]>([]);

  const verse = getDayVerse();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setNoUser(true); setLoading(false); return; }
      fetch("/api/user-stats").then(r => r.json()).then(d => {
        setStats(d);
        setLoading(false);
      });
    });
    fetch("/api/contests").then(r => r.json()).then(d => {
      const live = (d.contests || []).filter((c: { status: string }) => c.status === "active" || c.status === "upcoming");
      setLiveContests(live.slice(0, 3));
    });
  }, []);

  const txt = {
    welcome: { fr: "Bienvenue", ht: "Byenveni", en: "Welcome" },
    level: { fr: "Niveau", ht: "Nivo", en: "Level" },
    xp: { fr: "points d'expérience", ht: "pwen eksperyans", en: "experience points" },
    to: { fr: "pour atteindre", ht: "pou rive", en: "to reach" },
    contests: { fr: "Concours joués", ht: "Konkou jwe", en: "Contests played" },
    score: { fr: "Score total", ht: "Pwen total", en: "Total score" },
    accuracy: { fr: "Précision", ht: "Presizyon", en: "Accuracy" },
    prayers: { fr: "Prières publiées", ht: "Lapriyè pibliye", en: "Prayers posted" },
    votes: { fr: "Votes donnés", ht: "Vòt bay", en: "Votes cast" },
    correct: { fr: "Bonnes réponses", ht: "Bon repons", en: "Correct answers" },
    badges: { fr: "Mes badges", ht: "Baj mwen yo", en: "My badges" },
    locked: { fr: "Verrouillé", ht: "Vewouye", en: "Locked" },
    verse: { fr: "Verset du jour", ht: "Vèsè jou a", en: "Verse of the day" },
    explore: { fr: "Continuer à explorer", ht: "Kontinye eksplore", en: "Keep exploring" },
    live: { fr: "Concours en direct", ht: "Konkou an dirèk", en: "Live contests" },
    join: { fr: "Rejoindre", ht: "Rantre", en: "Join" },
    viewAll: { fr: "Voir tous les concours", ht: "Wè tout konkou yo", en: "View all contests" },
    signin: { fr: "Connectez-vous pour accéder à votre tableau de bord personnalisé.", ht: "Konekte pou jwenn tablo bò ou a.", en: "Sign in to access your personalized dashboard." },
    signinBtn: { fr: "Se connecter avec Google", ht: "Konekte ak Google", en: "Sign in with Google" },
    today: { fr: "Aujourd'hui", ht: "Jodi a", en: "Today" },
    stats: { fr: "Statistiques", ht: "Estatistik", en: "Statistics" },
    progression: { fr: "Progression", ht: "Pwogresyon", en: "Progression" },
    current: { fr: "← vous", ht: "← ou", en: "← you" },
    levelNames: {
      fr: ["Disciple","Serviteur","Évangéliste","Missionnaire","Ancien","Pasteur","Docteur","Champion KP","Maître Biblik","Légende"],
      ht: ["Disip","Sèvitè","Evanjelis","Misyonè","Ansyen","Pastè","Doktè","Chanpyon KP","Mèt Biblik","Lejann"],
      en: ["Disciple","Servant","Evangelist","Missionary","Elder","Pastor","Doctor","KP Champion","Bible Master","Legend"],
    },
  };
  const t = (k: keyof typeof txt) => txt[k][l];

  // NOT LOGGED IN
  if (noUser) return (
    <div className="min-h-screen bg-[#080d18] flex flex-col items-center justify-center px-5 text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #c5a84f 0%, transparent 70%)" }} />
      <div className="relative z-10 max-w-sm">
        <img src="/logo-kp.png" alt="KP" className="w-16 h-16 rounded-2xl mx-auto mb-6" />
        <h1 className="text-white font-black text-2xl mb-3">KONEKSYON PAM</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">{t("signin")}</p>
        <button onClick={() => signInWithGoogle("/dashboard")}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#0f2044] font-bold px-6 py-3.5 rounded-xl text-sm hover:shadow-lg transition-all">
          <GoogleIcon />
          {t("signinBtn")}
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#c5a84f] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
    </div>
  );

  const s = stats!;
  const firstName = s.name?.split(" ")[0] || "";

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Dashboard header */}
      <div className="relative overflow-hidden bg-[#0a1628]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top left, #1d4ed810 0%, transparent 60%)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5 text-[200px] select-none pointer-events-none leading-none text-right">✝</div>
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {s.avatar
                ? <img src={s.avatar} className="w-14 h-14 rounded-full border-2 border-[#c5a84f]/50 shadow-lg" alt="" />
                : <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c5a84f] to-[#e8c97a] flex items-center justify-center text-[#0f2044] font-black text-xl shadow-lg">
                    {s.name?.[0] ?? "?"}
                  </div>
              }
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest">{t("welcome")}</p>
                <h1 className="text-white font-black text-xl">{firstName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">{s.currentLevel.icon}</span>
                  <span className="text-[#c5a84f] text-xs font-bold">{s.currentLevel.name}</span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/40 text-xs">{s.xp} XP</span>
                </div>
              </div>
            </div>
            <Link href="/aujourd-hui"
              className="flex items-center gap-2 border border-[#c5a84f]/30 bg-[#c5a84f]/10 text-[#c5a84f] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#c5a84f]/20 transition-colors">
              ✨ {t("today")}
            </Link>
          </div>

          {/* XP Progress bar */}
          {s.nextLevel && (
            <div className="mt-6">
              <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
                <span>{s.currentLevel.icon} {s.currentLevel.name}</span>
                <span>{s.xpToNext} XP {t("to")} {s.nextLevel.icon} {s.nextLevel.name}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#c5a84f] to-[#e8c97a] rounded-full transition-all duration-1000"
                  style={{ width: `${s.xpProgress}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#c5a84f]/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Verse of the day */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2044] to-[#1e3a6e] p-6">
            <div className="absolute right-4 top-4 text-[80px] opacity-5 leading-none select-none">✝</div>
            <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-widest mb-3">✨ {t("verse")}</p>
            <blockquote className="text-white font-bold text-base leading-relaxed mb-3 italic max-w-lg">
              &ldquo;{verse[l as "fr"|"ht"|"en"]}&rdquo;
            </blockquote>
            <p className="text-white/40 text-xs font-semibold">{verse.ref[l]}</p>
          </div>

          {/* Live contests */}
          {(s.liveContests.length > 0 || liveContests.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">🏆 {t("live")}</p>
                <Link href="/concours" className="text-[#1d4ed8] text-xs font-bold hover:underline">{t("viewAll")}</Link>
              </div>
              <div className="flex flex-col gap-2">
                {(s.liveContests.length > 0 ? s.liveContests : liveContests).map(c => (
                  <Link key={c.id} href={`/concours/${c.id}`}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-stone-100 hover:border-[#1d4ed8]/30 hover:shadow-sm transition-all group">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.status === "active" ? "bg-green-500 animate-pulse" : "bg-[#1d4ed8]"}`} />
                    <p className="flex-1 text-sm font-semibold text-[#0f2044] truncate group-hover:text-[#1d4ed8] transition-colors">{c.title}</p>
                    <span className="text-[10px] font-bold text-[#1d4ed8] shrink-0">{t("join")} →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">📊 {t("stats")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: t("contests"), value: s.stats.contests, icon: "🏆" },
                { label: t("score"), value: s.stats.totalScore, icon: "⭐" },
                { label: t("accuracy"), value: `${s.stats.accuracy}%`, icon: "🎯" },
                { label: t("correct"), value: s.stats.correctAnswers, icon: "✅" },
                { label: t("prayers"), value: s.stats.prayers, icon: "🙏" },
                { label: t("votes"), value: s.stats.votes, icon: "❤️" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 hover:shadow-sm transition-all">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-[#0f2044] font-black text-xl tabular-nums">{item.value}</p>
                  <p className="text-stone-400 text-[10px] font-medium mt-0.5 leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Explore ecosystem */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">🌐 {t("explore")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SECTIONS.map(sec => (
                <Link key={sec.href} href={sec.href}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm group"
                  style={{ borderColor: `${sec.color}20`, color: sec.color, backgroundColor: `${sec.color}08` }}>
                  <span className="text-lg">{sec.icon}</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">{sec[l]}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — badges */}
        <div className="flex flex-col gap-6">

          {/* Badges */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">🏅 {t("badges")}</p>
            <div className="grid grid-cols-2 gap-2">
              {s.badges.map((b, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                  b.earned
                    ? "border-[#c5a84f]/30 bg-gradient-to-b from-[#fffbeb] to-white"
                    : "border-stone-100 bg-stone-50 opacity-40"
                }`}>
                  <span className="text-2xl">{b.earned ? b.icon : "🔒"}</span>
                  <p className={`text-[10px] font-bold text-center leading-tight ${b.earned ? "text-[#b45309]" : "text-stone-400"}`}>
                    {b.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Level progression */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">⬆️ {t("progression")}</p>
            <div className="space-y-1">
              {[
                { icon: "🌱", min: 0     },
                { icon: "🌿", min: 200   },
                { icon: "📢", min: 500   },
                { icon: "🌍", min: 1000  },
                { icon: "🕊️", min: 2000  },
                { icon: "📖", min: 3500  },
                { icon: "🎓", min: 5000  },
                { icon: "🏆", min: 7500  },
                { icon: "👑", min: 10000 },
                { icon: "⭐", min: 15000 },
              ].map((lv, i) => {
                const name = txt.levelNames[l][i];
                const isCurrent = lv.min === s.currentLevel.min;
                const reached = s.xp >= lv.min;
                return (
                  <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                    isCurrent ? "bg-[#c5a84f]/10 border border-[#c5a84f]/30" : ""
                  }`}>
                    <span className={`text-base ${reached ? "" : "opacity-30"}`}>{lv.icon}</span>
                    <span className={`flex-1 font-semibold ${reached ? "text-[#0f2044]" : "text-stone-300"}`}>{name}</span>
                    <span className={`text-[10px] font-bold ${isCurrent ? "text-[#c5a84f]" : "text-stone-300"}`}>
                      {isCurrent ? t("current") : `${lv.min} XP`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
