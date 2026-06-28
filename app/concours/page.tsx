"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

type Lang = "fr" | "ht" | "en";

interface Contest {
  id: string;
  title: string;
  title_ht?: string;
  title_en?: string;
  status: "upcoming" | "active" | "completed";
  scheduled_start_at?: string;
  theme?: string;
  max_participants: number;
  contest_participants?: { count: number }[];
  contest_sessions?: { count: number }[];
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useCountdown(target: string | null) {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!target) return;
    function calc() {
      const diff = new Date(target!).getTime() - Date.now();
      if (diff <= 0) { setParts({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }); return; }
      const totalSec = Math.floor(diff / 1000);
      setParts({
        days: Math.floor(totalSec / 86400),
        hours: Math.floor((totalSec % 86400) / 3600),
        minutes: Math.floor((totalSec % 3600) / 60),
        seconds: totalSec % 60,
        expired: false,
      });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [target]);

  return parts;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-20 sm:w-28 h-20 sm:h-28 rounded-2xl flex items-center justify-center font-black text-white"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
          }}>
          {pad(value)}
        </div>
      </div>
      <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em] mt-2">{label}</p>
    </div>
  );
}

function StatusBadge({ status, l }: { status: Contest["status"]; l: Lang }) {
  const map = {
    upcoming: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-400", label: { fr: "À venir", ht: "Ap vini", en: "Upcoming" } },
    active:   { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30", dot: "bg-green-400 animate-pulse", label: { fr: "En direct", ht: "An dirèk", en: "Live" } },
    completed:{ bg: "bg-stone-500/10", text: "text-stone-400", border: "border-stone-500/20", dot: "bg-stone-400", label: { fr: "Terminé", ht: "Fini", en: "Ended" } },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${m.bg} ${m.text} ${m.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label[l]}
    </span>
  );
}

export default function ConcoursPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/contests");
    const d = await res.json();
    setContests(d.contests || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = contests.find(c => c.status === "active");
  const nextUpcoming = contests.find(c => c.status === "upcoming" && c.scheduled_start_at);
  const featured = active ?? nextUpcoming ?? null;
  const others = contests.filter(c => c.id !== featured?.id);

  const countdown = useCountdown(featured?.scheduled_start_at ?? null);

  const title = (c: Contest) => l === "ht" ? (c.title_ht || c.title) : l === "en" ? (c.title_en || c.title) : c.title;
  const participantCount = (c: Contest) => {
    if (c.contest_sessions?.length) return c.contest_sessions[0].count;
    if (c.contest_participants?.length) return c.contest_participants[0].count;
    return 0;
  };

  return (
    <div className="min-h-screen" style={{ background: "#030918" }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ minHeight: "clamp(420px, 60vh, 700px)" }}>
        {/* BG layers */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 10%, rgba(197,168,79,0.18) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 70% at 0% 60%, rgba(29,78,216,0.10) 0%, transparent 55%)" }} />
        <div className="absolute right-4 bottom-0 text-white select-none pointer-events-none opacity-[0.025] leading-none" style={{ fontSize: "clamp(160px, 22vw, 300px)" }}>✝</div>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(197,168,79,0.6), transparent)" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-16 flex flex-col items-center text-center">
          <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            {l === "fr" ? "Championnat Biblique Hebdomadaire" : l === "ht" ? "Chanpyona Biblik Chak Semèn" : "Weekly Biblical Championship"}
          </p>
          <h1 className="text-white font-black mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            {l === "fr" ? "Concours Bibliques" : l === "ht" ? "Konkou Biblik" : "Biblical Contests"}
          </h1>
          <p className="text-white/40 text-sm max-w-lg mb-10">
            {l === "fr" ? "45 minutes. Une seule chance. Des milliers de chrétiens à travers le monde."
           : l === "ht" ? "45 minit. Yon sèl chans. Dè milye kretyen atravè mond lan."
           : "45 minutes. One chance. Thousands of Christians around the world."}
          </p>

          {/* Active: EN DIRECT banner */}
          {active && (
            <Link href={`/concours/${active.id}`} className="group flex flex-col items-center gap-5">
              <div className="flex items-center gap-3 bg-green-500/15 border border-green-500/30 rounded-full px-5 py-2.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-black text-sm uppercase tracking-widest">
                  {l === "fr" ? "Maintenant en direct" : l === "ht" ? "Kounye a an dirèk" : "Live now"}
                </span>
              </div>
              <p className="text-white font-black text-2xl group-hover:text-[#c5a84f] transition-colors">{title(active)}</p>
              <div className="inline-flex items-center gap-2 bg-[#c5a84f] text-[#030918] font-black text-sm px-8 py-3.5 rounded-full hover:bg-[#d4b85c] transition-colors"
                style={{ boxShadow: "0 4px 24px rgba(197,168,79,0.35)" }}>
                {l === "fr" ? "Rejoindre maintenant →" : l === "ht" ? "Antre kounye a →" : "Join now →"}
              </div>
            </Link>
          )}

          {/* Upcoming: countdown */}
          {!active && featured && featured.status === "upcoming" && (
            <div className="flex flex-col items-center gap-6 w-full">
              {featured.theme && (
                <p className="text-white/60 text-sm">
                  {l === "fr" ? "Thème : " : l === "ht" ? "Tèm : " : "Theme: "}
                  <span className="text-[#c5a84f] font-bold">{featured.theme}</span>
                </p>
              )}
              {featured.scheduled_start_at && (
                <p className="text-white/40 text-xs">
                  {new Date(featured.scheduled_start_at).toLocaleString(l === "ht" ? "fr" : l, {
                    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              )}
              {!countdown.expired ? (
                <div className="flex items-start gap-3 sm:gap-5">
                  <CountdownBlock value={countdown.days} label={l === "ht" ? "Jou" : l === "en" ? "Days" : "Jours"} />
                  <span className="text-white/30 font-black text-3xl sm:text-5xl mt-4">:</span>
                  <CountdownBlock value={countdown.hours} label={l === "ht" ? "Èdtan" : l === "en" ? "Hours" : "Heures"} />
                  <span className="text-white/30 font-black text-3xl sm:text-5xl mt-4">:</span>
                  <CountdownBlock value={countdown.minutes} label="Min" />
                  <span className="text-white/30 font-black text-3xl sm:text-5xl mt-4">:</span>
                  <CountdownBlock value={countdown.seconds} label="Sec" />
                </div>
              ) : (
                <p className="text-[#c5a84f] font-black text-xl">
                  {l === "fr" ? "Le concours commence..." : l === "ht" ? "Konkou a kòmanse..." : "Contest starting..."}
                </p>
              )}
              <Link href={`/concours/${featured.id}`}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-7 py-3 rounded-full transition-all">
                {l === "fr" ? "S'inscrire →" : l === "ht" ? "Enskri →" : "Register →"}
              </Link>
            </div>
          )}

          {/* No upcoming */}
          {!active && !featured && !loading && (
            <p className="text-white/30 text-sm">
              {l === "fr" ? "Aucun concours programmé pour le moment" : l === "ht" ? "Pa gen konkou pwograme pou kounye a" : "No contest scheduled at this time"}
            </p>
          )}
        </div>
      </div>

      {/* ── Contest list ── */}
      <div className="max-w-5xl mx-auto px-5 py-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#c5a84f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : others.length > 0 ? (
          <>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em] mb-6">
              {l === "fr" ? "Tous les concours" : l === "ht" ? "Tout konkou yo" : "All contests"}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map(c => (
                <Link key={c.id} href={`/concours/${c.id}`}
                  className="group block rounded-2xl border border-white/8 hover:border-[#c5a84f]/30 transition-all duration-300 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="px-5 py-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <StatusBadge status={c.status} l={l} />
                      <span className="text-white/25 text-[10px]">{participantCount(c)} <span className="text-white/20">{l === "fr" ? "joueurs" : l === "ht" ? "jwè" : "players"}</span></span>
                    </div>
                    <p className="text-white font-black text-base leading-snug group-hover:text-[#c5a84f] transition-colors mb-1">{title(c)}</p>
                    {c.theme && <p className="text-white/30 text-xs">{c.theme}</p>}
                    {c.scheduled_start_at && c.status === "upcoming" && (
                      <p className="text-white/25 text-[10px] mt-2">
                        {new Date(c.scheduled_start_at).toLocaleDateString(l === "ht" ? "fr" : l, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-white/25 text-[10px]">{c.max_participants} max</span>
                    <span className="text-[#c5a84f] text-[10px] font-black group-hover:translate-x-0.5 transition-transform">
                      {c.status === "completed" ? (l === "fr" ? "Voir résultats →" : l === "ht" ? "Wè rezilta →" : "See results →")
                       : (l === "fr" ? "Voir →" : l === "ht" ? "Wè →" : "View →")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        {!loading && contests.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-white/30 text-sm">
              {l === "fr" ? "Aucun concours pour le moment. Revenez bientôt !" : l === "ht" ? "Pa gen konkou pou kounye a. Tounen byento !" : "No contests yet. Check back soon!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
