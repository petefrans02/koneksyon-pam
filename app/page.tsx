"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { featuredPsalms } from "@/lib/psalms-data";
import Link from "next/link";
import BibleQuiz from "./components/BibleQuiz";

function Hero() {
  const { lang } = useLang();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const psalm = featuredPsalms[dayOfYear % featuredPsalms.length];

  return (
    <section className="bg-gradient-to-br from-[#0a1628] via-[#0f2044] to-[#1a1040] text-white px-6 py-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-48 h-48 bg-blue-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-cyan-500/8 rounded-full blur-[100px]" />
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="text-center sm:text-left flex-1">
            <div className="flex justify-center sm:justify-start mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1 border border-blue-400/30">
                <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              {lang === "fr" ? "La plateforme de l'Église connectée" : lang === "ht" ? "Platfòm Legliz ki konekte" : "The connected Church platform"}
            </h1>
            <p className="text-blue-200/70 text-sm sm:text-base mb-6 max-w-lg">
              {lang === "fr"
                ? "Prière, louange, études bibliques, communauté, espace église — tout ce dont l'Église a besoin, en un seul endroit."
                : lang === "ht"
                ? "Lapriyè, lwanj, etid biblik, kominote, espas legliz — tout sa Legliz la bezwen, nan yon sèl kote."
                : "Prayer, praise, Bible studies, community, church space — everything the Church needs, in one place."}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <Link href="/eglise" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all shadow-lg shadow-blue-500/30">
                {lang === "fr" ? "⛪ Créer l'espace église" : lang === "ht" ? "⛪ Kreye espas legliz" : "⛪ Create church space"}
              </Link>
              <Link href="/communaute" className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-colors border border-white/10">
                {lang === "fr" ? "Explorer →" : lang === "ht" ? "Eksplore →" : "Explore →"}
              </Link>
            </div>
          </div>
          {/* Verse of the day card */}
          <div className="w-full sm:w-80 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 shrink-0">
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2">✦ {t("verseOfDay", lang)}</p>
            <h3 className="font-bold text-lg mb-1">{t("psalms", lang)} {psalm.number}</h3>
            <p className="text-cyan-300/60 text-xs mb-3">{psalm.title[lang]}</p>
            <p className="text-blue-100/80 text-sm italic leading-relaxed line-clamp-4">{psalm.text[lang]}</p>
            <Link href="/psaumes" className="text-cyan-400 text-xs font-medium hover:underline mt-3 block">
              {lang === "fr" ? "Lire le psaume complet →" : "Read full psalm →"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformFeatures() {
  const { lang } = useLang();
  const features = [
    { href: "/psaumes", image: "https://cdn-icons-png.flaticon.com/512/3330/3330999.png", title: lang === "fr" ? "Psaumes" : lang === "ht" ? "Sòm" : "Psalms", desc: lang === "fr" ? "150 Psaumes en 3 langues" : "150 Psalms in 3 languages", color: "from-blue-500 to-indigo-600" },
    { href: "/prieres", image: "https://cdn-icons-png.flaticon.com/512/4305/4305512.png", title: lang === "fr" ? "Prière" : lang === "ht" ? "Lapriyè" : "Prayer", desc: lang === "fr" ? "Mur de prière mondial" : "Global prayer wall", color: "from-cyan-500 to-blue-600" },
    { href: "/etude", image: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png", title: lang === "fr" ? "Études" : lang === "ht" ? "Etid" : "Studies", desc: lang === "fr" ? "Sujets profonds + IA" : "Deep topics + AI", color: "from-purple-500 to-violet-600" },
    { href: "/quiz", image: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png", title: "Quiz", desc: lang === "fr" ? "5 niveaux, testez-vous" : "5 levels, test yourself", color: "from-orange-500 to-red-600" },
    { href: "/communaute", image: "https://cdn-icons-png.flaticon.com/512/1533/1533908.png", title: lang === "fr" ? "Communauté" : lang === "ht" ? "Kominote" : "Community", desc: lang === "fr" ? "7 groupes thématiques" : "7 thematic groups", color: "from-green-500 to-emerald-600" },
    { href: "/eglise", image: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png", title: lang === "fr" ? "Espace Église" : lang === "ht" ? "Espas Legliz" : "Church Space", desc: lang === "fr" ? "Votre église privée" : "Your private church", color: "from-blue-600 to-blue-800" },
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 py-14">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-stone-900">
          {lang === "fr" ? "Tout pour l'Église, en un seul endroit" : lang === "ht" ? "Tout pou Legliz la, nan yon sèl kote" : "Everything for the Church, in one place"}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="bg-white rounded-2xl border border-blue-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all group text-center">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
              <img src={f.image} alt="" className="w-8 h-8 brightness-0 invert" />
            </div>
            <h3 className="font-bold text-stone-900 group-hover:text-blue-600 transition-colors">{f.title}</h3>
            <p className="text-xs text-stone-500 mt-1">{f.desc}</p>
          </Link>
        ))}
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
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0f2044] rounded-2xl p-8 sm:p-10 border border-blue-800/30 text-center relative overflow-hidden">
        <div className="absolute top-6 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-6 right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <span className="text-5xl block mb-4">⛪</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {lang === "fr" ? "Votre église sur KONEKSYON PAM" : lang === "ht" ? "Legliz ou sou KONEKSYON PAM" : "Your church on KONEKSYON PAM"}
          </h2>
          <p className="text-blue-300/60 text-sm mb-6 max-w-lg mx-auto">
            {lang === "fr"
              ? "Créez l'espace privé de votre église. Vos membres rejoignent avec un code. Études, prières, événements, jeux — tout centralisé."
              : "Create your church's private space. Members join with a code. Studies, prayers, events, games — all centralized."}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/eglise/creer" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30">
              {lang === "fr" ? "Créer l'espace église" : "Create church space"}
            </Link>
            <Link href="/eglise" className="bg-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-colors border border-white/10">
              {lang === "fr" ? "Rejoindre" : "Join"}
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
    <section className="bg-[#0a1628] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-4">
          🌍 {countries.length} {t("countries", lang)}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {countries.map((flag, i) => (
            <span key={i} className="text-3xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{flag}</span>
          ))}
        </div>
        <p className="text-blue-300/40 text-sm">
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
      <PlatformFeatures />
      <AIBanner />
      <BibleQuiz />
      <ChurchCTA />
      <ConnectedWorld />
    </div>
  );
}
