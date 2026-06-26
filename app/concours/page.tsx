"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

type Lang = "fr" | "ht" | "en";

interface Contest {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "active" | "voting" | "completed";
  start_at: string | null;
  max_participants: number;
  contest_participants: { count: number }[];
}

interface PlatformStats {
  participants: number;
  contests: number;
  questions: number;
  votes: number;
}

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

function StatCard({ icon, value, label, suffix = "" }: { icon: string; value: number; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="relative group flex flex-col items-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-[#c5a84f]/40 transition-all duration-500 text-center">
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className="text-3xl font-black text-white mb-1 tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-white/50 text-xs font-medium tracking-wide leading-relaxed">{label}</p>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#c5a84f]/0 to-[#c5a84f]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
}

function ContestCard({ c, l }: { c: Contest; l: Lang }) {
  const count = c.contest_participants?.[0]?.count ?? 0;
  const pct = Math.round((count / (c.max_participants || 10)) * 100);
  const isLive = c.status === "active" || c.status === "voting";

  const statusConfig = {
    upcoming:  { label: { fr: "Inscriptions ouvertes", ht: "Enskripsyon louvri", en: "Open" }, color: "text-[#1d4ed8] bg-[#eff6ff] border-[#bfdbfe]", dot: "bg-[#1d4ed8]" },
    active:    { label: { fr: "En cours", ht: "Kap fèt", en: "Live" }, color: "text-green-700 bg-green-50 border-green-200", dot: "bg-green-500" },
    voting:    { label: { fr: "Vote ouvert", ht: "Ap vote", en: "Voting" }, color: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
    completed: { label: { fr: "Terminé", ht: "Fini", en: "Done" }, color: "text-stone-500 bg-stone-50 border-stone-200", dot: "bg-stone-400" },
  };
  const cfg = statusConfig[c.status];

  const ctaLabel = {
    upcoming:  { fr: "S'inscrire", ht: "Enskri", en: "Register" },
    active:    { fr: "Regarder en direct", ht: "Gade an dirèk", en: "Watch live" },
    voting:    { fr: "Voter maintenant", ht: "Vote kounye a", en: "Vote now" },
    completed: { fr: "Voir les résultats", ht: "Rezilta", en: "Results" },
  };

  return (
    <Link href={`/concours/${c.id}`} className="group block">
      <div className={`relative h-full flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#0f2044]/20 ${
        isLive ? "border-[#1d4ed8]/40 shadow-md shadow-[#1d4ed8]/10" : "border-stone-200 hover:border-[#0f2044]/30"
      } bg-white`}>

        {/* Live gradient bar */}
        {isLive && <div className="h-1 bg-gradient-to-r from-[#0f2044] via-[#1d4ed8] to-[#38bdf8]" />}

        {/* Gold accent top for upcoming */}
        {c.status === "upcoming" && <div className="h-0.5 bg-gradient-to-r from-transparent via-[#c5a84f]/50 to-transparent" />}

        {/* Card header with cross decoration */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute top-4 right-4 opacity-5 text-6xl select-none pointer-events-none">✝</div>

          {/* Status badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isLive ? "animate-pulse" : ""}`} />
              {cfg.label[l]}
            </span>
            {isLive && (
              <span className="text-[10px] text-green-600 font-bold animate-pulse">● LIVE</span>
            )}
          </div>

          <h3 className="font-black text-[#0f2044] text-base leading-snug mb-2 group-hover:text-[#1d4ed8] transition-colors">
            {c.title}
          </h3>
          {c.description && (
            <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">{c.description}</p>
          )}
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-stone-100" />

        {/* Stats row */}
        <div className="px-6 py-3 flex items-center gap-4 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <span className="text-[#c5a84f]">👥</span>
            {count}<span className="text-stone-300">/</span>{c.max_participants}
          </span>
          <span className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <span
              className={`block h-full rounded-full transition-all duration-700 ${
                pct > 80 ? "bg-red-400" : pct > 50 ? "bg-amber-400" : "bg-[#1d4ed8]"
              }`}
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className={`font-bold ${pct > 80 ? "text-red-500" : "text-stone-400"}`}>
            {pct > 80 ? (l === "fr" ? "Presque complet" : "Plis plen") : `${pct}%`}
          </span>
        </div>

        {/* CTA footer */}
        <div className="mt-auto px-6 pb-6">
          <div className={`w-full py-2.5 rounded-xl text-center text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            isLive
              ? "bg-[#0f2044] text-white group-hover:bg-[#1d4ed8]"
              : c.status === "completed"
              ? "border border-stone-200 text-stone-500 group-hover:border-[#0f2044] group-hover:text-[#0f2044]"
              : "border border-[#0f2044]/20 text-[#0f2044] group-hover:bg-[#0f2044] group-hover:text-white"
          }`}>
            {ctaLabel[c.status][l]} →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ConcoursPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({ participants: 0, contests: 0, questions: 0, votes: 0 });

  useEffect(() => {
    fetch("/api/contests")
      .then(r => r.json())
      .then(d => {
        const list: Contest[] = d.contests || [];
        setContests(list);
        setLoading(false);
        // Compute stats from loaded contests
        const totalParts = list.reduce((s, c) => s + (c.contest_participants?.[0]?.count ?? 0), 0);
        setPlatformStats(prev => ({ ...prev, participants: totalParts, contests: list.length }));
      });
    // Fetch deeper stats
    fetch("/api/platform-stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPlatformStats(prev => ({ ...prev, ...d })); })
      .catch(() => {});
  }, []);

  const live   = contests.filter(c => c.status === "active" || c.status === "voting");
  const coming = contests.filter(c => c.status === "upcoming");
  const past   = contests.filter(c => c.status === "completed");

  return (
    <div className="bg-white min-h-screen">

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden bg-[#0a1628]" style={{ minHeight: "clamp(460px, 65vh, 680px)" }}>

        {/* Animated background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2044] via-[#0a1628] to-[#060d1a]" />

        {/* Radial glow — golden light from above */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse at center top, #c5a84f 0%, transparent 70%)" }} />

        {/* Stars / particles */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 80}%`,
              animationDuration: `${Math.random() * 3 + 2}s`, animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.1,
            }} />
        ))}

        {/* Globe decoration right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] rounded-full border border-white/5 opacity-30"
          style={{ background: "radial-gradient(circle at 35% 40%, #1d4ed820, transparent)" }} />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 translate-x-1/4 w-[380px] h-[380px] rounded-full border border-[#c5a84f]/10" />

        {/* Cross decoration */}
        <div className="absolute right-16 top-16 opacity-5 text-[200px] text-[#c5a84f] select-none font-serif pointer-events-none leading-none">✝</div>

        {/* Bible icon — floating */}
        <div className="absolute right-12 bottom-8 opacity-[0.07] text-[120px] select-none pointer-events-none"
          style={{ animation: "float 6s ease-in-out infinite" }}>
          📖
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 flex flex-col justify-center h-full"
          style={{ minHeight: "clamp(460px, 65vh, 680px)" }}>
          <div className="max-w-3xl py-20">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-[#c5a84f]/30 bg-[#c5a84f]/10 rounded-full px-4 py-2 mb-8">
              <span className="w-1.5 h-1.5 bg-[#c5a84f] rounded-full animate-pulse" />
              <span className="text-[#c5a84f] text-[11px] font-black uppercase tracking-[0.2em]">
                {l === "fr" ? "Championnat Biblique International" : l === "ht" ? "Chanpyona Biblik Entènasyonal" : "International Biblical Championship"}
              </span>
            </div>

            {/* Main title */}
            <h1 className="font-black text-white leading-tight mb-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
              {l === "fr" ? <>Les Plus Grands<br /><span className="text-[#c5a84f]">Concours Bibliques</span><br />Internationaux</> :
               l === "ht" ? <>Pi Gran<br /><span className="text-[#c5a84f]">Konkou Biblik</span><br />Entènasyonal</> :
               <>The World&apos;s Greatest<br /><span className="text-[#c5a84f]">Biblical Championships</span></>}
            </h1>

            {/* Subtitle */}
            <p className="text-white/55 text-base leading-relaxed mb-10 max-w-xl">
              {l === "fr"
                ? "Étudiez la Parole de Dieu, relevez les défis bibliques, gagnez des récompenses et inspirez des milliers de croyants à travers le monde."
                : l === "ht"
                ? "Etidye Pawòl Bondye, releye defi biblik yo, genyen rekonpans epi enspire dè milye kwayan atravè mond lan."
                : "Study the Word of God, tackle biblical challenges, win rewards and inspire thousands of believers across the world."}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              {coming.length > 0 && (
                <Link href={`/concours/${coming[0].id}`}
                  className="inline-flex items-center gap-2 bg-[#c5a84f] hover:bg-[#d4b86a] text-[#0f2044] font-black text-sm px-7 py-3.5 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#c5a84f]/30 hover:-translate-y-0.5">
                  {l === "fr" ? "Participer" : l === "ht" ? "Patisipe" : "Participate"} →
                </Link>
              )}
              <Link href="/concours/hall-of-fame"
                className="inline-flex items-center gap-2 border border-[#c5a84f]/30 hover:border-[#c5a84f]/60 text-[#c5a84f] font-bold text-sm px-7 py-3.5 rounded-full transition-all duration-200">
                🏆 {l === "fr" ? "Hall of Fame" : "Hall of Fame"}
              </Link>
              {live.length > 0 && (
                <Link href={`/concours/${live[0].id}`}
                  className="inline-flex items-center gap-2 border border-white/20 hover:border-white/50 text-white font-bold text-sm px-7 py-3.5 rounded-full transition-all duration-200 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {l === "fr" ? "Regarder en direct" : l === "ht" ? "Gade an dirèk" : "Watch live"}
                </Link>
              )}
              {live.length === 0 && coming.length === 0 && (
                <span className="inline-flex items-center gap-2 border border-white/20 text-white/60 font-bold text-sm px-7 py-3.5 rounded-full">
                  {l === "fr" ? "Bientôt disponible" : "Byento disponib"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Gold bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c5a84f]/40 to-transparent" />
      </div>

      {/* ══════════ STATS ══════════ */}
      <div className="bg-[#0f2044] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon="🌍" value={12} label={l === "fr" ? "Pays représentés" : "Peyi reprezante"} suffix="+" />
            <StatCard icon="👥" value={platformStats.participants} label={l === "fr" ? "Participants" : "Patisipan"} />
            <StatCard icon="🏆" value={platformStats.contests} label={l === "fr" ? "Concours organisés" : "Konkou òganize"} />
            <StatCard icon="📖" value={platformStats.questions || 18} label={l === "fr" ? "Questions bibliques" : "Kesyon biblik"} />
            <StatCard icon="❤️" value={platformStats.votes} label={l === "fr" ? "Votes du public" : "Vòt piblik" } />
            <StatCard icon="⭐" value={100} label={l === "fr" ? "Satisfaction" : "Satisfaksyon"} suffix="%" />
          </div>
        </div>
      </div>

      {/* ══════════ CONTESTS ══════════ */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 flex flex-col gap-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-3 border-[#c5a84f] border-t-transparent rounded-full animate-spin" style={{ borderWidth: "3px" }} />
            <p className="text-stone-400 text-sm">{l === "fr" ? "Chargement des concours..." : "Ap chaje konkou yo..."}</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-dashed border-stone-200">
            <div className="text-6xl mb-4 opacity-30">📖</div>
            <p className="text-stone-400 text-sm font-medium">
              {l === "fr" ? "Aucun concours pour le moment. Revenez bientôt." : "Pa gen konkou pou kounye a. Tounen byento."}
            </p>
          </div>
        ) : (
          <>
            {/* LIVE */}
            {live.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    <h2 className="text-[#0f2044] font-black text-xl">
                      {l === "fr" ? "En cours maintenant" : l === "ht" ? "Kap fèt kounye a" : "Happening now"}
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {live.map(c => <ContestCard key={c.id} c={c} l={l} />)}
                </div>
              </section>
            )}

            {/* UPCOMING */}
            {coming.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-[#0f2044] font-black text-xl">
                      {l === "fr" ? "Inscriptions ouvertes" : l === "ht" ? "Enskripsyon louvri" : "Open registrations"}
                    </h2>
                    <p className="text-stone-400 text-xs mt-0.5">
                      {l === "fr" ? "Rejoignez avant le début — places limitées" : "Antre anvan kòmansman — plas limite"}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#1d4ed8]/20 to-transparent" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {coming.map(c => <ContestCard key={c.id} c={c} l={l} />)}
                </div>
              </section>
            )}

            {/* COMPLETED */}
            {past.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-[#0f2044] font-black text-xl opacity-60">
                    {l === "fr" ? "Concours terminés" : l === "ht" ? "Konkou fini" : "Completed contests"}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-stone-200 to-transparent" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {past.map(c => <ContestCard key={c.id} c={c} l={l} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ══════════ FOOTER CTA ══════════ */}
      <div className="bg-[#0a1628] py-16">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <div className="text-4xl mb-4 opacity-40">✝</div>
          <h3 className="text-white font-black text-2xl mb-3">
            {l === "fr" ? "Une Mission • Un Dieu • Une Vision" : "Yon Misyon • Yon Bondye • Yon Vizyon"}
          </h3>
          <p className="text-white/40 text-sm leading-relaxed">
            {l === "fr"
              ? "Koneksyon Pam vous invite à grandir dans la Parole de Dieu à travers les concours bibliques les plus inspirants du monde."
              : "Koneksyon Pam envite ou grandi nan Pawòl Bondye a atravè konkou biblik ki pi enpresyonan nan mond lan."}
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
