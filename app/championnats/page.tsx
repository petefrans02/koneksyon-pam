"use client";
import HeroBackdrop from "@/app/components/HeroBackdrop";

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
          background: "linear-gradient(160deg, rgba(200,150,15,0.10) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(200,150,15,0.25)",
        }}>
        {pad(value)}
      </div>
      <p className="text-[#c8960f]/60 text-[9px] font-black uppercase tracking-[0.25em] mt-2">{label}</p>
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
    <div className="min-h-screen" style={{
      background: "linear-gradient(180deg,#ffffff,#ffffff)",
      backgroundImage: "radial-gradient(circle, rgba(200,150,15,0.03) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
      color: "#1c1c2e",
    }}>

      <style>{`
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
          0%,100% { box-shadow: 0 0 0 0 rgba(200,150,15,0); }
          50%      { box-shadow: 0 0 0 6px rgba(200,150,15,0.10); }
        }
        @keyframes ring-gold {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        .contest-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s ease, box-shadow 0.25s ease; }
        .contest-card:hover { transform: translateY(-5px) !important; border-color: rgba(200,150,15,0.35) !important; box-shadow: 0 12px 32px rgba(200,150,15,0.12) !important; }
        .countdown-box { animation: countdown-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ minHeight: "clamp(460px, 65vh, 740px)" }}>

        {/* Navy gradient background */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1a3568 0%, #0d1d3d 50%, #0a1830 100%)", pointerEvents: "none" }} />
        <HeroBackdrop image="/hero/championnats.jpg" tint="dark" />

        {/* Gold orb */}
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 350, borderRadius: "50%", background: "rgba(200,150,15,0.15)", filter: "blur(80px)", animation: "orb-gold-1 10s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "3%", width: 250, height: 250, borderRadius: "50%", background: "rgba(0,170,200,0.10)", filter: "blur(60px)", animation: "orb-gold-2 8s ease-in-out infinite 2s", pointerEvents: "none" }} />

        {/* Anneau décoratif */}
        <div style={{ position: "absolute", top: "42%", left: "50%", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(200,150,15,0.10)", animation: "ring-gold 30s linear infinite", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#c8960f", opacity: 0.8 }} />
          <div style={{ position: "absolute", bottom: -4, right: "20%", width: 5, height: 5, borderRadius: "50%", background: "#1a3568", opacity: 0.5 }} />
        </div>

        {/* Sparkles */}
        {["✦","✧","★","✦","✧"].map((s, i) => (
          <div key={i} style={{ position: "absolute", left: `${12 + i * 18}%`, top: `${15 + (i % 3) * 14}%`, fontSize: `${0.7 + (i % 3) * 0.3}rem`, color: "#c8960f", opacity: 0, animation: `sparkle ${3 + i * 0.9}s ease-in-out infinite ${i * 0.6}s`, pointerEvents: "none", userSelect: "none" }}>{s}</div>
        ))}

        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(200,150,15,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,150,15,0.025) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,15,0.7), transparent)" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-20 flex flex-col items-center text-center">

          {/* Trophy flottant */}
          <div className="mb-8 select-none relative" style={{ lineHeight: 1 }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(200,150,15,0.25) 0%, transparent 70%)", filter: "blur(20px)", transform: "scale(2.5)", pointerEvents: "none" }} />
            <div style={{ animation: "trophy-float 4s ease-in-out infinite", display: "inline-block", filter: "drop-shadow(0 0 32px rgba(200,150,15,0.45))" }}><Icon name="trophee" size={92} color="#c8960f" /></div>
          </div>

          {/* Accès au Championnat par équipes (live) */}
          <Link href="/championnat" className="mb-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-sm transition-transform hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#e6b83c,#a97d18)", color: "#1a1203", boxShadow: "0 6px 24px rgba(230,184,60,0.35)", animation: "hero-in 0.6s ease both" }}>
            🏆 {l === "fr" ? "Championnat en Direct" : l === "ht" ? "Chanpyona an Dirèk" : l === "es" ? "Campeonato en Vivo" : "Live Championship"} →
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border border-[#c8960f]/25"
            style={{ background: "rgba(200,150,15,0.10)", animation: "hero-in 0.6s ease 0.1s both" }}>
            <span className="w-1.5 h-1.5 bg-[#c8960f] rounded-full animate-pulse" />
            <Icon name="trophee" size={12} color="#c8960f" />
            <span className="text-[#c8960f] text-[10px] font-black uppercase tracking-[0.3em]">
              {l === "fr" ? "Championnat Biblique" : l === "ht" ? "Chanpyona Biblik" : l === "es" ? "Campeonato Bíblico" : "Biblical Championship"}
            </span>
          </div>

          <h1 className="text-white font-black mb-4" style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)", lineHeight: 1.05, letterSpacing: "-0.03em", animation: "hero-in 0.7s ease 0.2s both", textShadow: "0 0 80px rgba(200,150,15,0.15)" }}>
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
            <Link href={`/championnats/${active.id}`} className="group flex flex-col items-center gap-5">
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
              <Link href={`/championnats/${featured.id}`}
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
            <div className="w-8 h-8 border-2 border-[#c8960f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : others.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(200,150,15,0.35), transparent)" }} />
              <p style={{ color:"#c8960f", fontSize:10, fontWeight:900, letterSpacing:"0.25em", textTransform:"uppercase" as const }}>
                {l === "fr" ? "Tous les concours" : l === "ht" ? "Tout konkou yo" : l === "es" ? "Todos los concursos" : "All contests"}
              </p>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,15,0.35))" }} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((c, i) => {
                const cc = ["#c8960f", "#2563eb", "#7c3aed", "#16a34a", "#ea580c"][i % 5];
                return (
                <Link key={c.id} href={`/championnats/${c.id}`}
                  className="contest-card group block overflow-hidden"
                  style={{ background: `#ffffff`, border:"1px solid #e8e4de", borderTop:`3px solid ${cc}`, borderRadius:16, boxShadow:"0 4px 16px rgba(26,53,104,0.06)", animation: `card-reveal 0.5s ease ${i * 0.07}s both`, textDecoration:"none" }}>
                  <div className="px-5 py-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <StatusBadge status={c.status} l={l} />
                      <span style={{ color:"#4a6080", fontSize:10 }}>{participantCount(c)} <span style={{ color:"#9ca3af" }}>{l === "fr" ? "joueurs" : l === "ht" ? "jwè" : l === "es" ? "jugadores" : "players"}</span></span>
                    </div>
                    <p style={{ color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:900, fontSize:"1rem", lineHeight:1.3, marginBottom:4 }} className="group-hover:text-[#c8960f] transition-colors">{title(c)}</p>
                    {c.theme && <p style={{ color:"#4a6080", fontSize:"0.76rem" }}>{c.theme}</p>}
                    {c.scheduled_start_at && c.status === "upcoming" && (
                      <p style={{ color:"#9ca3af", fontSize:10, marginTop:8 }}>
                        {new Date(c.scheduled_start_at).toLocaleDateString(l === "ht" ? "fr" : l, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop:"1px solid #ffffff" }}>
                    <span style={{ color:"#9ca3af", fontSize:10 }}>{c.max_participants} max</span>
                    <span style={{ color:cc, fontSize:10, fontWeight:900 }}>
                      {c.status === "completed" ? (l === "fr" ? "Voir résultats →" : l === "ht" ? "Wè rezilta →" : l === "es" ? "Ver resultados →" : "See results →")
                       : (l === "fr" ? "Voir →" : l === "ht" ? "Wè →" : l === "es" ? "Ver →" : "View →")}
                    </span>
                  </div>
                </Link>
                );
              })}
            </div>
          </>
        ) : null}

        {!loading && contests.length === 0 && (
          <div className="text-center py-20">
            <p className="mb-4 flex justify-center" style={{ color:"#c8960f" }}><Icon name="trophee" size={48} /></p>
            <p style={{ color:"#4a6080" }} className="text-sm">
              {l === "fr" ? "Aucun concours pour le moment. Revenez bientôt !" : l === "ht" ? "Pa gen konkou pou kounye a. Tounen byento !" : l === "es" ? "¡Aún no hay concursos. ¡Vuelve pronto!" : "No contests yet. Check back soon!"}
            </p>
          </div>
        )}
      </div>

      {/* ── Jeu entre amis section ── */}
      <div className="max-w-5xl mx-auto px-5 pb-16">
        <div className="overflow-hidden" style={{ background:"#ffffff", border:"1px solid #e8e4de", borderTop:"3px solid #c8960f", borderRadius:20, boxShadow:"0 4px 16px rgba(26,53,104,0.06)" }}>
          <div className="px-6 sm:px-8 pt-8 pb-6">

            {/* Two columns: join by code | how it works */}
            <div className="flex flex-wrap items-start gap-8">

              {/* Left — join by code */}
              <div className="flex-1 min-w-[240px]">
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(200,150,15,0.10)", border:"1px solid rgba(200,150,15,0.25)", borderRadius:999, padding:"4px 12px", color:"#a07800", fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>
                  <Icon name="groupe" size={12} /> {l === "fr" ? "Jeu entre amis" : l === "ht" ? "Jwèt ant zanmi" : l === "es" ? "Jugar con amigos" : "Play with friends"}
                </div>
                <h2 style={{ color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:"1.3rem", marginBottom:6 }}>
                  {l === "fr" ? "Rejoindre une session" : l === "ht" ? "Rantre nan yon sesyon" : l === "es" ? "Unirse a una sesión" : "Join a session"}
                </h2>
                <p style={{ color:"#4a6080", fontSize:"0.84rem", marginBottom:20 }}>
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
                    style={{ flex:1, borderRadius:12, border:"1px solid #e8e4de", background:"#ffffff", color:"#1c1c2e", padding:"12px 16px", fontSize:"0.88rem", outline:"none", fontFamily:"monospace", letterSpacing:"0.15em", textAlign:"center" }}
                  />
                  <button type="submit"
                    style={{ padding:"12px 20px", borderRadius:12, fontWeight:900, fontSize:"0.84rem", border:"1px solid #c8960f", color:"#a07800", background:"rgba(200,150,15,0.08)", cursor:"pointer", whiteSpace:"nowrap" as const }}>
                    {l === "fr" ? "Rejoindre" : l === "ht" ? "Antre" : l === "es" ? "Unirse" : "Join"}
                  </button>
                </form>
                {joinCodeError && <p style={{ color:"#e53e3e", fontSize:"0.76rem", marginTop:6 }}>{joinCodeError}</p>}
              </div>

              {/* Right — how to organize */}
              <div className="flex-1 min-w-[240px]" style={{ borderLeft:"1px solid #e8e4de", paddingLeft:32 }}>
                <p style={{ color:"#4a6080", fontSize:10, fontWeight:900, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:16 }}>
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
                      <span style={{ flexShrink:0, width:22, height:22, borderRadius:"50%", background:"rgba(200,150,15,0.12)", color:"#c8960f", fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", marginTop:2 }}>{step.n}</span>
                      <p style={{ color:"#4a6080", fontSize:"0.84rem" }}>{step[l]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User's own private championships */}
          {myPrivate.length > 0 && (
            <div style={{ borderTop:"1px solid #ffffff", padding:"24px 32px" }}>
              <p style={{ color:"#c8960f", fontSize:10, fontWeight:900, letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:16 }}>
                {l === "fr" ? "Mes championnats" : l === "ht" ? "Chanpyona mwen yo" : l === "es" ? "Mis campeonatos" : "My championships"}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myPrivate.map(c => {
                  const playerCount = c.contest_participants?.[0]?.count ?? 0;
                  return (
                    <Link key={c.id} href={`/private/${c.id}`}
                      className="group block transition-all duration-200 p-4"
                      style={{ background:"#ffffff", border:"1px solid #e8e4de", borderTop:"3px solid #c8960f", borderRadius:16, boxShadow:"0 4px 16px rgba(26,53,104,0.06)", textDecoration:"none" }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p style={{ color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:"0.88rem", lineHeight:1.3 }} className="line-clamp-2">{c.title}</p>
                        <span style={{ flexShrink:0, display:"inline-flex" }}>
                          {c.status === "active"
                            ? <Icon name="eclair" size={13} color="#e11d48" />
                            : c.status === "completed"
                            ? <Icon name="succes" size={13} color="#16a34a" />
                            : <Icon name="chrono" size={13} color="#c8960f" />}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span style={{ fontFamily:"monospace", color:"#c8960f", fontSize:10, letterSpacing:"0.1em" }}>{c.invite_code}</span>
                        <span style={{ color:"#4a6080", fontSize:10 }}>{playerCount} {l === "fr" ? "joueurs" : l === "ht" ? "jwè" : l === "es" ? "jugadores" : "players"}</span>
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
