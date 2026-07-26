"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Icon from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

interface Contest {
  id: string;
  title: string;
  title_ht?: string;
  title_en?: string;
  title_es?: string;
  status: "upcoming" | "active" | "completed";
  scheduled_start_at?: string;
  theme?: string;
  max_participants: number;
  contest_participants?: { count: number }[];
  contest_sessions?: { count: number }[];
}

interface PrivateChampionship {
  id: string;
  title: string;
  theme?: string;
  status: string;
  invite_code: string;
  difficulty?: string;
  num_rounds?: number;
  contest_participants?: { count: number }[];
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
      <div className="countdown-box w-20 sm:w-28 h-20 sm:h-28 rounded-2xl flex items-center justify-center font-black text-white"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          background: "linear-gradient(160deg, rgba(212,160,23,0.10) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(212,160,23,0.25)",
        }}>
        {pad(value)}
      </div>
      <p className="text-[#d4a017]/60 text-[9px] font-black uppercase tracking-[0.25em] mt-2">{label}</p>
    </div>
  );
}

function StatusBadge({ status, l }: { status: Contest["status"]; l: Lang }) {
  const map = {
    upcoming: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-400", label: { fr: "À venir", ht: "Ap vini", en: "Upcoming", es: "Próximo" } },
    active:   { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30", dot: "bg-green-400 animate-pulse", label: { fr: "En direct", ht: "An dirèk", en: "Live", es: "En vivo" } },
    completed:{ bg: "bg-stone-500/10", text: "text-stone-400", border: "border-stone-500/20", dot: "bg-stone-400", label: { fr: "Terminé", ht: "Fini", en: "Ended", es: "Terminado" } },
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
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;
  const [contests, setContests] = useState<Contest[]>([]);
  const [myPrivate, setMyPrivate] = useState<PrivateChampionship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/contests");
    const d = await res.json();
    // Filter out private championships from the official list
    setContests((d.contests || []).filter((c: Contest & { is_private?: boolean }) => !c.is_private));
    setLoading(false);

    // Load user's private championships (fails gracefully if not logged in)
    fetch("/api/private/mine").then(r => r.json()).then(d => {
      if (Array.isArray(d.championships)) setMyPrivate(d.championships);
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  // Check auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  async function handleJoinByCode(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;
    setJoinCodeError(null);
    const res = await fetch(`/api/private/join/${code}`);
    const d = await res.json();
    if (d.ok && d.contest?.id) {
      window.location.href = `/play/${code}`;
    } else {
      setJoinCodeError(l === "fr" ? "Code invalide" : l === "ht" ? "Kòd pa valab" : l === "es" ? "Código inválido" : "Invalid code");
    }
  }

  const active = contests.find(c => c.status === "active");
  const nextUpcoming = contests.find(c => c.status === "upcoming" && c.scheduled_start_at);
  const featured = active ?? nextUpcoming ?? null;
  const others = contests.filter(c => c.id !== featured?.id);

  const countdown = useCountdown(featured?.scheduled_start_at ?? null);

  const title = (c: Contest) => l === "ht" ? (c.title_ht || c.title) : l === "en" ? (c.title_en || c.title) : l === "es" ? (c.title_es || c.title_en || c.title) : c.title;
  const participantCount = (c: Contest) => {
    if (c.contest_sessions?.length) return c.contest_sessions[0].count;
    if (c.contest_participants?.length) return c.contest_participants[0].count;
    return 0;
  };

  return (
    <div className="min-h-screen" style={{ background: "#030918" }}>

      <style>{`
        @keyframes concours-aurora {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes trophy-float {
          0%,100% { transform: translateY(0) rotate(-3deg) scale(1); }
          50%      { transform: translateY(-18px) rotate(3deg) scale(1.05); }
        }
        @keyframes orb-gold-1 {
          0%,100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50%      { transform: translateY(-22px) scale(1.08); opacity: 1; }
        }
        @keyframes orb-gold-2 {
          0%,100% { transform: translateX(0) scale(1); }
          50%      { transform: translateX(-20px) scale(1.06); }
        }
        @keyframes sparkle {
          0%   { opacity: 0; transform: scale(0) rotate(0deg); }
          50%  { opacity: 1; transform: scale(1) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer-g {
          from { transform: translateX(-100%); }
          to   { transform: translateX(300%); }
        }
        @keyframes card-reveal {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes countdown-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(212,160,23,0); }
          50%      { box-shadow: 0 0 0 6px rgba(212,160,23,0.10); }
        }
        @keyframes ring-gold {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        .contest-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s ease, box-shadow 0.25s ease; }
        .contest-card:hover { transform: translateY(-5px) !important; border-color: rgba(212,160,23,0.35) !important; box-shadow: 0 12px 32px rgba(212,160,23,0.12) !important; }
        .countdown-box { animation: countdown-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ minHeight: "clamp(520px, 70vh, 820px)" }}>

        {/* Aurora gold bg */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #030918 0%, #0a0818 35%, #050b14 65%, #030918 100%)", backgroundSize: "400% 400%", animation: "concours-aurora 14s ease infinite", pointerEvents: "none" }} />

        {/* Orbes dorées */}
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 800, height: 450, borderRadius: "50%", background: "rgba(212,160,23,0.11)", filter: "blur(120px)", animation: "orb-gold-1 10s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "3%", width: 320, height: 320, borderRadius: "50%", background: "rgba(124,58,237,0.08)", filter: "blur(80px)", animation: "orb-gold-2 8s ease-in-out infinite 2s", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "5%", width: 280, height: 280, borderRadius: "50%", background: "rgba(212,160,23,0.07)", filter: "blur(70px)", animation: "orb-gold-1 11s ease-in-out infinite 4s", pointerEvents: "none" }} />

        {/* Anneau décoratif */}
        <div style={{ position: "absolute", top: "42%", left: "50%", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(212,160,23,0.10)", animation: "ring-gold 30s linear infinite", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#d4a017", opacity: 0.8 }} />
          <div style={{ position: "absolute", bottom: -4, right: "20%", width: 5, height: 5, borderRadius: "50%", background: "#7c3aed", opacity: 0.5 }} />
        </div>

        {/* Sparkles */}
        {["✦","✧","★","✦","✧"].map((s, i) => (
          <div key={i} style={{ position: "absolute", left: `${12 + i * 18}%`, top: `${15 + (i % 3) * 14}%`, fontSize: `${0.7 + (i % 3) * 0.3}rem`, color: "#d4a017", opacity: 0, animation: `sparkle ${3 + i * 0.9}s ease-in-out infinite ${i * 0.6}s`, pointerEvents: "none", userSelect: "none" }}>{s}</div>
        ))}

        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(212,160,23,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.025) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.7), transparent)" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-20 flex flex-col items-center text-center">

          {/* Trophy flottant */}
          <div className="mb-8 select-none relative" style={{ lineHeight: 1 }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(212,160,23,0.25) 0%, transparent 70%)", filter: "blur(20px)", transform: "scale(2.5)", pointerEvents: "none" }} />
            <div style={{ animation: "trophy-float 4s ease-in-out infinite", display: "inline-flex", filter: "drop-shadow(0 0 32px rgba(212,160,23,0.45))" }}><Icon name="trophee" size={90} color="#d4a017" strokeWidth={1.5} /></div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border border-[#d4a017]/25"
            style={{ background: "rgba(212,160,23,0.10)", animation: "hero-in 0.6s ease 0.1s both" }}>
            <span className="w-1.5 h-1.5 bg-[#d4a017] rounded-full animate-pulse" />
            <span className="text-[#d4a017] text-[10px] font-black uppercase tracking-[0.3em] inline-flex items-center gap-1.5">
              <Icon name="trophee" size={12} />
              {l === "fr" ? "Championnat Biblique" : l === "ht" ? "Chanpyona Biblik" : l === "es" ? "Campeonato Bíblico" : "Biblical Championship"}
            </span>
          </div>

          <h1 className="text-white font-black mb-4" style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)", lineHeight: 1.05, letterSpacing: "-0.03em", animation: "hero-in 0.7s ease 0.2s both", textShadow: "0 0 80px rgba(212,160,23,0.15)" }}>
            {l === "fr" ? "Face au monde entier." : l === "ht" ? "Fas ak mond lan antye." : l === "es" ? "Frente al mundo entero." : "Face the whole world."}
          </h1>
          <p className="text-white/35 text-sm max-w-lg mb-12" style={{ animation: "hero-in 0.7s ease 0.3s both", lineHeight: 1.75 }}>
            {l === "fr" ? "15 manches. Des milliers de chrétiens. Une seule couronne."
           : l === "ht" ? "15 manche. Dè milye kretyen. Yon sèl kouwòn."
           : l === "es" ? "15 rondas. Miles de cristianos. Una sola corona."
           : "15 rounds. Thousands of Christians. One crown."}
          </p>

          {/* Active: EN DIRECT banner */}
          {active && (
            <Link href={`/concours/${active.id}`} className="group flex flex-col items-center gap-5">
              <div className="flex items-center gap-3 bg-green-500/15 border border-green-500/30 rounded-full px-5 py-2.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-black text-sm uppercase tracking-widest">
                  {l === "fr" ? "Maintenant en direct" : l === "ht" ? "Kounye a an dirèk" : l === "es" ? "En vivo ahora" : "Live now"}
                </span>
              </div>
              <p className="text-white font-black text-2xl group-hover:text-[#c5a84f] transition-colors">{title(active)}</p>
              <div className="inline-flex items-center gap-2 bg-[#c5a84f] text-[#030918] font-black text-sm px-8 py-3.5 rounded-full hover:bg-[#d4b85c] transition-colors"
                style={{ boxShadow: "0 4px 24px rgba(197,168,79,0.35)" }}>
                {l === "fr" ? "Rejoindre maintenant →" : l === "ht" ? "Antre kounye a →" : l === "es" ? "Unirse ahora →" : "Join now →"}
              </div>
            </Link>
          )}

          {/* Upcoming: countdown */}
          {!active && featured && featured.status === "upcoming" && (
            <div className="flex flex-col items-center gap-6 w-full">
              {featured.theme && (
                <p className="text-white/60 text-sm">
                  {l === "fr" ? "Thème : " : l === "ht" ? "Tèm : " : l === "es" ? "Tema: " : "Theme: "}
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
                  <CountdownBlock value={countdown.days} label={l === "ht" ? "Jou" : l === "en" ? "Days" : l === "es" ? "Días" : "Jours"} />
                  <span className="text-white/30 font-black text-3xl sm:text-5xl mt-4">:</span>
                  <CountdownBlock value={countdown.hours} label={l === "ht" ? "Èdtan" : l === "en" ? "Hours" : l === "es" ? "Horas" : "Heures"} />
                  <span className="text-white/30 font-black text-3xl sm:text-5xl mt-4">:</span>
                  <CountdownBlock value={countdown.minutes} label="Min" />
                  <span className="text-white/30 font-black text-3xl sm:text-5xl mt-4">:</span>
                  <CountdownBlock value={countdown.seconds} label="Sec" />
                </div>
              ) : (
                <p className="text-[#c5a84f] font-black text-xl">
                  {l === "fr" ? "Le concours commence..." : l === "ht" ? "Konkou a kòmanse..." : l === "es" ? "El concurso comienza..." : "Contest starting..."}
                </p>
              )}
              <Link href={`/concours/${featured.id}`}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-7 py-3 rounded-full transition-all">
                {l === "fr" ? "S'inscrire →" : l === "ht" ? "Enskri →" : l === "es" ? "Registrarse →" : "Register →"}
              </Link>
            </div>
          )}

          {/* No upcoming */}
          {!active && !featured && !loading && (
            <p className="text-white/30 text-sm">
              {l === "fr" ? "Aucun concours programmé pour le moment" : l === "ht" ? "Pa gen konkou pwograme pou kounye a" : l === "es" ? "No hay concurso programado en este momento" : "No contest scheduled at this time"}
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
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(212,160,23,0.25), transparent)" }} />
              <p className="text-[#d4a017]/50 text-[10px] font-black uppercase tracking-[0.25em]">
                {l === "fr" ? "Tous les concours" : l === "ht" ? "Tout konkou yo" : l === "es" ? "Todos los concursos" : "All contests"}
              </p>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.25))" }} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((c, i) => (
                <Link key={c.id} href={`/concours/${c.id}`}
                  className="contest-card group block rounded-2xl border border-white/8 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", animation: `card-reveal 0.5s ease ${i * 0.07}s both` }}>
                  {/* Gold shimmer top line */}
                  <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.40), transparent)" }} />
                  <div className="px-5 py-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <StatusBadge status={c.status} l={l} />
                      <span className="text-white/25 text-[10px]">{participantCount(c)} <span className="text-white/20">{l === "fr" ? "joueurs" : l === "ht" ? "jwè" : l === "es" ? "jugadores" : "players"}</span></span>
                    </div>
                    <p className="text-white font-black text-base leading-snug group-hover:text-[#d4a017] transition-colors mb-1">{title(c)}</p>
                    {c.theme && <p className="text-white/30 text-xs">{c.theme}</p>}
                    {c.scheduled_start_at && c.status === "upcoming" && (
                      <p className="text-white/25 text-[10px] mt-2">
                        {new Date(c.scheduled_start_at).toLocaleDateString(l === "ht" ? "fr" : l, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-white/25 text-[10px]">{c.max_participants} max</span>
                    <span className="text-[#d4a017] text-[10px] font-black group-hover:translate-x-0.5 transition-transform">
                      {c.status === "completed" ? (l === "fr" ? "Voir résultats →" : l === "ht" ? "Wè rezilta →" : l === "es" ? "Ver resultados →" : "See results →")
                       : (l === "fr" ? "Voir →" : l === "ht" ? "Wè →" : l === "es" ? "Ver →" : "View →")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        {!loading && contests.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-4 flex justify-center"><Icon name="trophee" size={48} color="#c5a84f" /></div>
            <p className="text-white/30 text-sm">
              {l === "fr" ? "Aucun concours pour le moment. Revenez bientôt !" : l === "ht" ? "Pa gen konkou pou kounye a. Tounen byento !" : l === "es" ? "¡Aún no hay concursos. ¡Vuelve pronto!" : "No contests yet. Check back soon!"}
            </p>
          </div>
        )}
      </div>

      {/* ── Jeu entre amis section ── */}
      <div className="max-w-5xl mx-auto px-5 pb-16">
        <div className="rounded-3xl border border-amber-400/15 overflow-hidden" style={{ background: "rgba(197,168,79,0.04)" }}>
          <div className="px-6 sm:px-8 pt-8 pb-6">

            {/* Two columns: join by code | how it works */}
            <div className="flex flex-wrap items-start gap-8">

              {/* Left — join by code */}
              <div className="flex-1 min-w-[240px]">
                <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-3">
                  <Icon name="utilisateurs" size={12} /> {l === "fr" ? "Jeu entre amis" : l === "ht" ? "Jwèt ant zanmi" : l === "es" ? "Jugar con amigos" : "Play with friends"}
                </div>
                <h2 className="text-white font-black text-xl sm:text-2xl mb-1">
                  {l === "fr" ? "Rejoindre une session" : l === "ht" ? "Rantre nan yon sesyon" : l === "es" ? "Unirse a una sesión" : "Join a session"}
                </h2>
                <p className="text-white/40 text-sm mb-5">
                  {l === "fr" ? "Entrez le code reçu de votre ami pour rejoindre sa partie."
                  : l === "ht" ? "Antre kòd ou resevwa nan men zanmi ou a pou rantre nan jwèt li a."
                  : l === "es" ? "Ingresa el código que te envió tu amigo para unirte a su partida."
                  : "Enter the code your friend sent you to join their game."}
                </p>
                {/* Join by code */}
                <form onSubmit={handleJoinByCode} className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="KP-XXXXXX"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 transition-colors font-mono tracking-[0.2em] text-center"
                  />
                  <button type="submit"
                    className="px-5 py-3 rounded-xl font-black text-sm border border-amber-400/30 text-amber-400 hover:bg-amber-400/10 transition-colors whitespace-nowrap">
                    {l === "fr" ? "Rejoindre" : l === "ht" ? "Antre" : l === "es" ? "Unirse" : "Join"}
                  </button>
                </form>
                {joinCodeError && <p className="text-red-400 text-xs mt-1.5">{joinCodeError}</p>}
              </div>

              {/* Right — how to organize */}
              <div className="flex-1 min-w-[240px] border-l border-white/6 pl-8">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-4">
                  {l === "fr" ? "Vous voulez organiser ?" : l === "ht" ? "Ou vle òganize ?" : l === "es" ? "¿Quieres organizar?" : "Want to host?"}
                </p>
                <div className="space-y-3">
                  {[
                    { n: "1", fr: "Ouvrez un championnat ci-dessus", ht: "Ouvri yon chanpyona anwo a", en: "Open a championship above", es: "Abre un campeonato de arriba" },
                    { n: "2", fr: "Cliquez \"Jouer avec mes amis\"", ht: "Klike \"Jwe ak zanmi mwen yo\"", en: "Click \"Play with friends\"", es: "Haz clic en \"Jugar con amigos\"" },
                    { n: "3", fr: "Choisissez le nombre de joueurs", ht: "Chwazi kantite jwè yo", en: "Pick the number of players", es: "Elige el número de jugadores" },
                    { n: "4", fr: "Partagez le code — le match démarre tout seul !", ht: "Pataje kòd la — match lan kòmanse pou kont li !", en: "Share the code — the match auto-starts!", es: "Comparte el código — ¡el partido comienza solo!" },
                  ].map(step => (
                    <div key={step.n} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-amber-400/15 text-amber-400 text-[10px] font-black flex items-center justify-center mt-0.5">{step.n}</span>
                      <p className="text-white/50 text-sm">{step[l]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User's own private championships */}
          {myPrivate.length > 0 && (
            <div className="border-t border-amber-400/10 px-6 sm:px-8 py-6">
              <p className="text-amber-400/60 text-[10px] font-black uppercase tracking-widest mb-4">
                {l === "fr" ? "Mes championnats" : l === "ht" ? "Chanpyona mwen yo" : l === "es" ? "Mis campeonatos" : "My championships"}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myPrivate.map(c => {
                  const playerCount = c.contest_participants?.[0]?.count ?? 0;
                  return (
                    <Link key={c.id} href={`/private/${c.id}`}
                      className="group block rounded-2xl border border-white/8 hover:border-amber-400/30 transition-all duration-200 p-4"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-white font-bold text-sm leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">{c.title}</p>
                        <span className={`shrink-0 inline-flex items-center justify-center text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          c.status === "active" ? "bg-green-500/15 text-green-400 border-green-500/25" :
                          c.status === "completed" ? "bg-stone-500/15 text-stone-400 border-stone-500/25" :
                          "bg-blue-500/15 text-blue-400 border-blue-500/25"
                        }`}>
                          {c.status === "active" ? <Icon name="eclair" size={11} /> : c.status === "completed" ? <Icon name="succes" size={11} /> : <Icon name="chrono" size={11} />}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-amber-400/60 text-[10px] tracking-wider">{c.invite_code}</span>
                        <span className="text-white/30 text-[10px]">{playerCount} {l === "fr" ? "joueurs" : l === "ht" ? "jwè" : l === "es" ? "jugadores" : "players"}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
