"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/LangContext";
import type { Lang, ChampionshipStateRow } from "@/lib/championship-types";
import { startLobbyMusic, stopMusic, resumeAudio } from "@/lib/championship-audio";
import Icon, { IconName } from "@/app/components/Icon";

interface Participant { user_name: string; user_avatar: string | null; }

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@keyframes lobby-fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes lobby-pop {
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.12); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes lobby-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.95); }
}
@keyframes lobby-glow {
  0%, 100% { box-shadow: 0 0 30px rgba(245,158,11,0.10); }
  50%       { box-shadow: 0 0 60px rgba(245,158,11,0.28); }
}
@keyframes lobby-orbit {
  from { transform: rotate(0deg)   translateX(32px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(32px) rotate(-360deg); }
}
@keyframes lobby-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes lobby-count {
  0%   { transform: scale(1.5); opacity: 0; }
  20%  { transform: scale(1);   opacity: 1; }
  80%  { transform: scale(1);   opacity: 1; }
  100% { transform: scale(0.6); opacity: 0; }
}
@keyframes lobby-float-reaction {
  0%   { transform: translateY(0)  scale(1);    opacity: 1; }
  100% { transform: translateY(-90px) scale(1.4); opacity: 0; }
}
@keyframes lobby-heartbeat {
  0%, 100% { transform: scale(1); }
  14%       { transform: scale(1.08); }
  28%       { transform: scale(1); }
  42%       { transform: scale(1.05); }
  70%       { transform: scale(1); }
}
@keyframes lobby-star-twinkle {
  0%, 100% { opacity: 0.2; }
  50%       { opacity: 0.8; }
}
@keyframes lobby-msg {
  0%   { opacity: 0; transform: translateY(8px); }
  15%  { opacity: 1; transform: translateY(0); }
  85%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-8px); }
}
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const ROUND_DOTS = [
  "#f59e0b","#3b82f6","#8b5cf6","#f97316","#10b981",
  "#7c3aed","#6366f1","#d97706","#ef4444","#0ea5e9",
  "#92400e","#065f46","#1e3a8a","#be123c","#b45309",
];
const ROUND_ICONS: IconName[] = ["bible","balance","editer","utilisateur","localisation","module","feu","chrono","eclair","etincelles","lien","psaumes","etoile","epee","couronne"];

const EMOJIS: IconName[] = ["priere","feu","croix","eclair","etincelles"];

const MSGS: Record<Lang, string[]> = {
  fr: [
    "Préparez votre esprit et votre cœur…",
    "Que la sagesse de Dieu vous guide.",
    "La Parole de Dieu est une lampe à vos pieds.",
    "Restez concentré — le titre vous attend !",
    "Chaque question est une opportunité d'apprendre.",
    "Des joueurs du monde entier vous rejoignent…",
    "KONEKSYON PAM — Championnat Biblique Mondial",
  ],
  ht: [
    "Prepare lespri ak kè ou…",
    "Se lasajès Bondye k ap gide ou.",
    "Pawòl Bondye a se yon flanbo pou pye ou.",
    "Rete konsantre — tit la ap tann ou !",
    "Chak kesyon se yon opòtinite pou aprann.",
    "Jwè ki soti toupatou ap rantre avèk ou…",
    "KONEKSYON PAM — Chanpyona Biblik Mondyal",
  ],
  en: [
    "Prepare your mind and heart…",
    "May the wisdom of God guide you.",
    "God's Word is a lamp to your feet.",
    "Stay focused — the title awaits you!",
    "Every question is an opportunity to learn.",
    "Players from around the world are joining…",
    "KONEKSYON PAM — World Biblical Championship",
  ],
  es: [
    "Prepara tu mente y tu corazón…",
    "Que la sabiduría de Dios te guíe.",
    "La Palabra de Dios es una lámpara a tus pies.",
    "Mantente enfocado — ¡el título te espera!",
    "Cada pregunta es una oportunidad de aprender.",
    "Jugadores de todo el mundo se están uniendo…",
    "KONEKSYON PAM — Campeonato Bíblico Mundial",
  ],
};

// ─── Floating star particles ──────────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 28 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    size: `${1 + Math.random() * 2}px`,
    delay: `${Math.random() * 4}s`, dur: `${2 + Math.random() * 3}s`,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", left: s.left, top: s.top,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "#f59e0b",
          animation: `lobby-star-twinkle ${s.dur} ${s.delay} ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Avatar bubble ─────────────────────────────────────────────────────────────
function AvatarBubble({ p, delay }: { p: Participant; delay: number }) {
  return (
    <div style={{ animation: `lobby-pop 0.5s ${delay}s ease both`, opacity: 0 }}
      className="flex flex-col items-center gap-1 shrink-0 w-14">
      {p.user_avatar
        ? <img src={p.user_avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/30" />
        : <div className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center text-sm font-black text-white/60"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            {(p.user_name ?? "?")[0]?.toUpperCase()}
          </div>}
      <span className="text-[9px] text-white/30 font-medium text-center leading-tight truncate w-full text-center">
        {p.user_name?.split(" ")[0]}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LobbyPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [contestTitle, setContestTitle] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);
  const [audioOn, setAudioOn] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [rejoinBlocked, setRejoinBlocked] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const launchRef = useRef(false);
  const reactionId = useRef(0);

  const launchChampionship = useCallback(() => {
    if (launchRef.current) return;
    launchRef.current = true;
    setLaunched(true);
    stopMusic();
    router.push(`/championnats/${id}/championship`);
  }, [id, router]);

  // Fetch contest title
  useEffect(() => {
    if (!id) return;
    supabase.from("contests").select("title").eq("id", id).single()
      .then(({ data }) => { if (data?.title) setContestTitle(data.title); });
  }, [id]);

  // Join lobby + fetch participants
  useEffect(() => {
    if (!id) return;
    fetch(`/api/engine/${id}/join-lobby`, { method: "POST" })
      .then(r => r.json())
      .then(d => {
        if (d.error === "REJOIN_NOT_ALLOWED") { setRejoinBlocked(true); return; }
        // Only launch if championship is actively running (not stale closed/cancelled state)
        if (d.phase && d.phase !== "LOBBY" && d.phase !== "CLOSED" && d.phase !== "CANCELLED") {
          launchChampionship(); return;
        }
        setPlayerCount(d.player_count ?? 0);
        setParticipants(d.participants ?? []);
      })
      .catch(() => {});
  }, [id, launchChampionship]);

  // Poll every 6s
  useEffect(() => {
    if (!id) return;
    const poll = setInterval(() => {
      fetch(`/api/engine/${id}/join-lobby`, { method: "POST" })
        .then(r => r.json())
        .then(d => {
          if (d.phase && d.phase !== "LOBBY" && d.phase !== "CLOSED" && d.phase !== "CANCELLED") {
            launchChampionship(); return;
          }
          setPlayerCount(d.player_count ?? 0);
          setParticipants(d.participants ?? []);
        })
        .catch(() => {});
    }, 6_000);
    return () => clearInterval(poll);
  }, [id, launchChampionship]);

  // Realtime
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`lobby-${id}-${Date.now()}`)
      .on("postgres_changes" as never,
        { event: "*", schema: "public", table: "championship_state", filter: `contest_id=eq.${id}` },
        (payload: { new: ChampionshipStateRow }) => {
          const row = payload.new;
          if (row?.player_count) setPlayerCount(row.player_count);
          if (row && row.phase === "COUNTDOWN" && row.phase_ends_at) {
            // Show dramatic countdown
            const endsAt = new Date(row.phase_ends_at).getTime();
            const tick = setInterval(() => {
              const rem = Math.ceil((endsAt - Date.now()) / 1000);
              setCountdownSec(rem);
              if (rem <= 0) { clearInterval(tick); launchChampionship(); }
            }, 200);
          } else if (row && row.phase !== "LOBBY" && row.phase !== "CLOSED" && row.phase !== "CANCELLED") {
            launchChampionship();
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, launchChampionship]);

  // Cycling messages
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % MSGS[l].length), 4_000);
    return () => clearInterval(t);
  }, [l]);

  function handleAudio() {
    resumeAudio();
    if (!audioOn) { startLobbyMusic(); setAudioOn(true); }
    else { stopMusic(); setAudioOn(false); }
  }

  function sendReaction(emoji: string) {
    const id = reactionId.current++;
    const x = 30 + Math.random() * 40;
    setReactions(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 1200);
  }

  // ── Rejoin blocked ────────────────────────────────────────────────────────
  if (rejoinBlocked) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center" style={{ background: "#020717" }}>
        <p className="flex justify-center text-white/70"><Icon name="deconnexion" size={48} /></p>
        <h1 className="text-white font-black text-2xl">
          {l === "fr" ? "Vous avez quitté" : l === "ht" ? "Ou te kite" : l === "es" ? "Te has ido" : "You left"}
        </h1>
        <p className="text-white/40 text-sm max-w-xs">
          {l === "fr"
            ? "Ce championnat ne permet pas de rejoindre après avoir quitté."
            : l === "ht"
            ? "Chanpyona sa pa pèmèt retounen apre ou kite."
            : l === "es" ? "Este campeonato no permite volver a unirse después de salir."
            : "This championship does not allow rejoining after leaving."}
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 px-8 py-3 rounded-2xl font-black text-sm text-white border border-white/20 hover:border-white/40 transition-colors"
        >
          {l === "fr" ? "Retour au tableau de bord" : l === "ht" ? "Retounen nan tablo bò" : l === "es" ? "Volver al panel" : "Back to dashboard"}
        </button>
      </div>
    );
  }

  // ── Fullscreen countdown ───────────────────────────────────────────────────
  if (countdownSec !== null) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <Stars />
        <p className="text-white/30 text-xs font-black tracking-widest uppercase">
          {l === "fr" ? "Le championnat commence dans" : l === "ht" ? "Chanpyona a kòmanse nan" : l === "es" ? "El campeonato comienza en" : "Championship starts in"}
        </p>
        <div key={countdownSec}
          className="font-black"
          style={{
            fontSize: "clamp(5rem,20vw,9rem)",
            animation: "lobby-count 1s ease forwards",
            color: countdownSec <= 3 ? "#ef4444" : "#f59e0b",
            textShadow: `0 0 80px ${countdownSec <= 3 ? "#ef4444" : "#f59e0b"}70`,
          }}>
          {countdownSec <= 0 ? <Icon name="feu" size={100} /> : countdownSec}
        </div>
        <p className="text-white/20 text-sm">{playerCount} {l === "fr" ? "joueurs en direct" : l === "ht" ? "jwè an dirèk" : l === "es" ? "jugadores en vivo" : "live players"}</p>
      </div>
    );
  }

  if (launched) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <p className="text-white/40 text-sm" style={{ animation: "lobby-pulse 1s ease-in-out infinite" }}>
          {l === "fr" ? "Lancement…" : l === "ht" ? "Kòmanse…" : l === "es" ? "Iniciando…" : "Launching…"}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-page-awaken min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)" }}>
      <style>{CSS}</style>
      <Stars />

      {/* Breathing blue glow — players waiting, Holy Spirit present */}
      <div className="fixed inset-0 pointer-events-none animate-halo-blue"
        style={{ background: "radial-gradient(ellipse 70% 45% at 50% 20%, rgba(96,165,250,0.10) 0%, transparent 65%)" }} />
      {/* Gold accent glow */}
      <div className="fixed inset-0 pointer-events-none animate-holy-breath"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)" }} />

      {/* ── Scrolling participants strip ─────────────────────────────────── */}
      {participants.length > 0 && (
        <div className="w-full overflow-hidden border-b border-white/5 py-2 shrink-0" style={{ background: "rgba(255,255,255,0.015)" }}>
          <div className="flex gap-4 px-4"
            style={{ width: "max-content", animation: `lobby-scroll ${Math.max(18, participants.length * 2.5)}s linear infinite` }}>
            {[...participants, ...participants].map((p, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                {p.user_avatar
                  ? <img src={p.user_avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                  : <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      {(p.user_name ?? "?")[0]?.toUpperCase()}
                    </div>}
                <span className="text-white/30 text-[11px] whitespace-nowrap">{p.user_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-7 max-w-lg mx-auto w-full">

        {/* Logo + orbit */}
        <div className="relative w-16 h-16 flex items-center justify-center" style={{ animation: "lobby-fade-up 0.7s ease both" }}>
          <div className="text-3xl select-none" style={{ animation: "lobby-pulse 3s ease-in-out infinite" }}>✝</div>
          {[0, 120, 240].map(deg => (
            <div key={deg} className="absolute w-1.5 h-1.5 rounded-full" style={{
              background: "#f59e0b", top: "50%", left: "50%",
              marginTop: "-3px", marginLeft: "-3px",
              animation: `lobby-orbit 3.5s linear infinite`,
              animationDelay: `${(deg / 360) * 3.5}s`, opacity: 0.7,
            }} />
          ))}
        </div>

        {/* Championship title */}
        <div className="text-center" style={{ animation: "lobby-fade-up 0.7s 0.1s ease both", opacity: 0 }}>
          <p className="text-white/25 text-[10px] font-black tracking-[0.35em] uppercase mb-1">KONEKSYON PAM</p>
          <h1 className="text-white font-black text-xl sm:text-2xl leading-tight">
            {contestTitle || "Championnat Biblique"}
          </h1>
        </div>

        {/* Player count card */}
        <div className="w-full rounded-3xl border border-white/8 p-6 text-center"
          style={{ background: "rgba(255,255,255,0.03)", animation: "lobby-glow 5s ease-in-out infinite, lobby-fade-up 0.7s 0.2s ease both", opacity: 0 }}>

          {/* Live dot */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400" style={{ animation: "lobby-pulse 1.5s ease-in-out infinite" }} />
            <span className="text-amber-400/80 text-[11px] font-black uppercase tracking-widest">
              {l === "fr" ? "En direct" : l === "ht" ? "An dirèk" : l === "es" ? "En vivo" : "Live"}
            </span>
          </div>

          {/* Big number */}
          <div className="text-6xl font-black text-white mb-1"
            style={{ animation: "lobby-heartbeat 2.5s ease-in-out infinite", textShadow: "0 0 30px rgba(245,158,11,0.25)" }}>
            {playerCount}
          </div>
          <p className="text-white/25 text-xs mb-5">
            {l === "fr" ? "joueurs inscrits" : l === "ht" ? "jwè enskri" : l === "es" ? "jugadores registrados" : "players registered"}
          </p>

          {/* Progress bar — visual energy */}
          <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-5">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, (playerCount / 50) * 100)}%`,
                background: "linear-gradient(90deg, #f59e0b, #ef4444)",
              }} />
          </div>

          <p className="text-white/30 text-xs leading-relaxed">
            {l === "fr"
              ? "L'administrateur lancera le championnat d'un moment à l'autre."
              : l === "ht"
              ? "Administratè a ap kòmanse chanpyona a nan kèk minit."
              : l === "es" ? "El administrador lanzará el campeonato en breve."
              : "The administrator will launch the championship shortly."}
          </p>
        </div>

        {/* Recent avatars grid */}
        {participants.length > 0 && (
          <div className="w-full" style={{ animation: "lobby-fade-up 0.7s 0.35s ease both", opacity: 0 }}>
            <p className="text-white/20 text-[10px] uppercase tracking-wider text-center mb-3">
              {l === "fr" ? "Derniers joueurs arrivés" : l === "ht" ? "Dènye jwè yo" : l === "es" ? "Últimos jugadores" : "Latest players"}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {participants.slice(-12).map((p, i) => (
                <AvatarBubble key={i} p={p} delay={i * 0.04} />
              ))}
            </div>
          </div>
        )}

        {/* 15 rounds preview */}
        <div className="w-full" style={{ animation: "lobby-fade-up 0.7s 0.4s ease both", opacity: 0 }}>
          <p className="text-white/20 text-[10px] uppercase tracking-wider text-center mb-3">
            {l === "fr" ? "15 manches vous attendent" : l === "ht" ? "15 epwèv ap tann ou" : l === "es" ? "15 rondas te esperan" : "15 rounds await you"}
          </p>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {ROUND_DOTS.map((color, i) => (
              <div key={i}
                className="w-7 h-7 rounded-full flex items-center justify-center border border-white/10 transition-all"
                style={{ background: color + "18", borderColor: color + "35" }}>
                <Icon name={ROUND_ICONS[i]} size={14} color={color} />
              </div>
            ))}
          </div>
        </div>

        {/* Emoji reactions */}
        <div className="relative w-full flex flex-col items-center gap-3"
          style={{ animation: "lobby-fade-up 0.7s 0.5s ease both", opacity: 0 }}>
          <p className="text-white/15 text-[10px] uppercase tracking-wider">
            {l === "fr" ? "Réagissez en attendant" : l === "ht" ? "Reyaji pandan w ap tann" : l === "es" ? "Reacciona mientras esperas" : "React while waiting"}
          </p>
          <div className="flex gap-3 relative">
            {/* Floating reactions */}
            {reactions.map(r => (
              <div key={r.id} className="absolute pointer-events-none z-10 text-amber-400"
                style={{
                  bottom: "100%", left: `${r.x}%`, transform: "translateX(-50%)",
                  animation: "lobby-float-reaction 1.1s ease forwards",
                }}>
                <Icon name={r.emoji as IconName} size={26} />
              </div>
            ))}
            {EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => sendReaction(emoji)}
                className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center transition-all active:scale-90 hover:border-white/25 hover:scale-105 text-white/70"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <Icon name={emoji} size={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Cycling message */}
        <div key={msgIdx} className="text-center max-w-xs px-2" style={{ animation: "lobby-msg 4s ease both" }}>
          <p className="text-white/35 text-sm italic leading-relaxed">"{MSGS[l][msgIdx]}"</p>
        </div>

        {/* Audio toggle */}
        <button onClick={handleAudio}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-white/25 text-xs hover:text-white/50 hover:border-white/20 transition-all">
          <span className="inline-flex"><Icon name="audio" size={14} /></span>
          <span>{audioOn
            ? (l === "fr" ? "Musique ON" : l === "ht" ? "Mizik ON" : l === "es" ? "Música ON" : "Music ON")
            : (l === "fr" ? "Activer la musique" : l === "ht" ? "Aktive mizik la" : l === "es" ? "Activar música" : "Enable music")}
          </span>
        </button>
      </div>
    </div>
  );
}
