"use client";

import { useEffect, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/LangContext";
import { playVictoryFanfare, stopMusic, resumeAudio } from "@/lib/championship-audio";
import type { Lang, LeaderboardResponse } from "@/lib/championship-types";
import { ROUND_SPECS } from "@/lib/championship-rounds";
import Icon from "@/app/components/Icon";

const TOTAL_QUESTIONS = ROUND_SPECS.reduce((a, r) => a + (r.questions_count || 0), 0) || 70;
function fmtTime(sec: number | null | undefined): string {
  if (sec == null || sec <= 0) return "—";
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Compte progressif — le score final s'anime au lieu d'apparaître d'un coup (item 18).
function useCountUp(target: number, duration = 1200): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target <= 0) { setVal(0); return; }
    let raf = 0; let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

const CSS = `
@keyframes podium-rise {
  from { transform: translateY(60px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes podium-pop {
  0%   { transform: scale(0.5);  opacity: 0; }
  70%  { transform: scale(1.08); }
  100% { transform: scale(1);    opacity: 1; }
}
@keyframes podium-mount {
  from { transform: scaleY(0); transform-origin: bottom; }
  to   { transform: scaleY(1); transform-origin: bottom; }
}
@keyframes confetti-a {
  0%   { transform: translateY(-20px) rotate(0deg)   translateX(0);    opacity: 1; }
  100% { transform: translateY(120vh) rotate(720deg) translateX(40px);  opacity: 0; }
}
@keyframes confetti-b {
  0%   { transform: translateY(-20px) rotate(0deg)   translateX(0);     opacity: 1; }
  100% { transform: translateY(100vh) rotate(-540deg) translateX(-60px); opacity: 0; }
}
@keyframes shimmer-gold {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes badge-pop {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes ceremony-in {
  0%   { opacity: 0; transform: scale(0.8); }
  60%  { opacity: 1; transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes ceremony-out {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(1.1); }
}
@keyframes champion-glow {
  0%, 100% { text-shadow: 0 0 20px rgba(245,158,11,0.6); }
  50%       { text-shadow: 0 0 50px rgba(245,158,11,1), 0 0 80px rgba(245,158,11,0.5); }
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
`;

const CONFETTI_COLORS = ["#f59e0b", "#fcd34d", "#ffffff", "#6366f1", "#ec4899", "#22c55e", "#3b82f6"];

interface PodiumEntry {
  rank: number;
  player_name: string;
  player_avatar: string | null;
  total_score: number;
  total_correct: number;
}

interface Reward {
  badge_type: string;
  badge_label_fr: string;
  badge_label_ht: string;
  badge_label_en: string;
  badge_label_es?: string;
  badge_icon: string;
}

export default function PodiumPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;

  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [stage, setStage] = useState<"ceremony" | "podium">("ceremony");
  const [shared, setShared] = useState(false);
  const [teams, setTeams] = useState<{ id: string; name: string; total_score: number; member_count: number }[]>([]);
  const [isAdvanced, setIsAdvanced] = useState(false);

  const fetchLeaderboard = useCallback(() => {
    if (!id) return;
    fetch(`/api/engine/${id}/leaderboard`)
      .then(r => r.json())
      .then(d => setLeaderboard(d))
      .catch(() => {});
  }, [id]);

  const fetchTeams = useCallback(() => {
    if (!id) return;
    fetch(`/api/contests/${id}/teams`).then(r => r.json()).then(d => setTeams(d.teams ?? [])).catch(() => {});
  }, [id]);

  // Initial load
  useEffect(() => {
    fetchLeaderboard();
    if (!id) return;
    fetch(`/api/contests/${id}/my-result`)
      .then(r => r.json())
      .then(d => { if (d.rewards) setRewards(d.rewards); })
      .catch(() => {});
    fetch(`/api/contests/${id}`).then(r => r.json()).then(d => {
      if (d?.contest?.contest_type === "advanced") { setIsAdvanced(true); fetchTeams(); }
    }).catch(() => {});
  }, [id, fetchLeaderboard, fetchTeams]);

  // Supabase Realtime — refresh leaderboard when scores change
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`podium-${id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any,
        { event: "*", schema: "public", table: "championship_leaderboard", filter: `contest_id=eq.${id}` },
        () => { fetchLeaderboard(); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, fetchLeaderboard]);

  // Victory ceremony: show champion screen for 2.5s then transition to podium
  useEffect(() => {
    const t = setTimeout(() => setStage("podium"), 2500);
    return () => clearTimeout(t);
  }, []);

  // L'hymne du podium tourne en boucle : on le coupe en quittant la page.
  useEffect(() => () => { stopMusic(1.5); }, []);

  function handleAudio() {
    resumeAudio();
    if (!audioPlayed) { playVictoryFanfare(); setAudioPlayed(true); }
  }

  async function handleShare() {
    const msg = l === "fr"
      ? `J'ai participé au Championnat Biblique KONEKSYON PAM ! 🏆 Score : ${myScore.toLocaleString()} pts, Classement : #${myRank ?? "?"}`
      : l === "es"
      ? `¡Participé en el Campeonato Bíblico KONEKSYON PAM! 🏆 Puntaje: ${myScore.toLocaleString()} pts, Clasificación: #${myRank ?? "?"}`
      : `Mwen patisipe nan Chanpyona Biblik KONEKSYON PAM ! 🏆 Pwen : ${myScore.toLocaleString()}, Klasman : #${myRank ?? "?"}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "KONEKSYON PAM", text: msg });
      } else {
        await navigator.clipboard.writeText(msg);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch { /* user dismissed */ }
  }

  const top3: PodiumEntry[] = (leaderboard?.entries ?? []).slice(0, 3) as PodiumEntry[];
  const champion = top3[0] ?? null;
  const myRank = leaderboard?.your_rank;
  const myScore = leaderboard?.your_score ?? 0;
  const myCorrect = leaderboard?.your_correct ?? 0;
  const animatedScore = useCountUp(myScore);
  const myPct = Math.round((myCorrect / TOTAL_QUESTIONS) * 100);
  const myTime = leaderboard?.your_time_sec ?? null;

  const medalColors = ["#f59e0b", "#9ca3af", "#b45309"];
  const medalBgs    = ["rgba(245,158,11,0.12)", "rgba(156,163,175,0.10)", "rgba(180,83,9,0.12)"];

  const confettiItems = Array.from({ length: 30 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${(i * 0.12).toFixed(2)}s`,
    duration: `${2.5 + (i % 5) * 0.4}s`,
    anim: i % 2 === 0 ? "confetti-a" : "confetti-b",
    size: 4 + (i % 4),
  }));

  // ── Victory ceremony screen ───────────────────────────────────────────────
  if (stage === "ceremony") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {confettiItems.map((c, i) => (
            <div key={i} className="absolute rounded-sm" style={{
              left: c.left, top: "-10px",
              width: c.size, height: c.size,
              background: c.color,
              animation: `${c.anim} ${c.duration} ${c.delay} ease-in forwards`,
            }} />
          ))}
        </div>
        <div className="text-center space-y-6" style={{ animation: "ceremony-in 0.7s ease both" }}>
          <p className="text-amber-400/60 text-xs font-black tracking-[0.5em] uppercase">KONEKSYON PAM</p>
          <p className="text-white/50 text-lg font-bold">
            {l === "fr" ? "Le Champion est…" : l === "ht" ? "Chanpyon an se…" : l === "es" ? "El Campeón es…" : "The Champion is…"}
          </p>
          {champion ? (
            <>
              <div className="w-28 h-28 mx-auto rounded-full border-4 overflow-hidden" style={{ borderColor: "#f59e0b", boxShadow: "0 0 40px rgba(245,158,11,0.5)" }}>
                {champion.player_avatar ? (
                  <img src={champion.player_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                    {(champion.player_name ?? "?")[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <h1 className="font-black text-4xl sm:text-5xl" style={{
                background: "linear-gradient(135deg, #f59e0b, #fcd34d, #f59e0b)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer-gold 2s linear infinite, champion-glow 2s ease-in-out infinite",
              }}>
                {champion.player_name}
              </h1>
              {champion.total_correct >= 70 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/30"
                  style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b" }}>
                  <Icon name="trophee" size={16} />
                  <span className="font-black text-sm">
                    {l === "fr" ? "Champion Parfait" : l === "ht" ? "Chanpyon Pafè" : l === "es" ? "Campeón Perfecto" : "Perfect Champion"}
                  </span>
                </div>
              )}
              <p className="text-white/40 font-bold text-lg">{champion.total_score.toLocaleString()} pts</p>
            </>
          ) : (
            <div className="w-24 h-2 rounded-full bg-white/10 mx-auto" style={{ animation: "live-pulse 1s ease-in-out infinite" }} />
          )}
        </div>
      </div>
    );
  }

  // ── Main podium screen ────────────────────────────────────────────────────
  return (
    <div className="animate-page-awaken min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)" }}>
      <style>{CSS}</style>

      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {confettiItems.map((c, i) => (
          <div key={i} className="absolute rounded-sm" style={{
            left: c.left, top: "-10px",
            width: c.size, height: c.size,
            background: c.color,
            animation: `${c.anim} ${c.duration} ${c.delay} ease-in forwards`,
          }} />
        ))}
      </div>

      {/* Gold spotlight from top — ceremony atmosphere */}
      <div className="fixed inset-0 pointer-events-none animate-spotlight-gold"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,160,23,0.22) 0%, transparent 65%)" }} />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-10 gap-8">

        {/* Header */}
        <div className="text-center" style={{ animation: "podium-rise 0.8s ease both" }}>
          <p className="text-amber-400/50 text-xs font-black tracking-[0.4em] uppercase mb-2">KONEKSYON PAM</p>
          <h1 className="text-white font-black text-3xl sm:text-4xl" style={{
            background: "linear-gradient(135deg, #f59e0b, #fcd34d, #f59e0b)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer-gold 3s linear infinite",
          }}>
            {l === "fr" ? "Championnat Terminé !" : l === "ht" ? "Chanpyona Fini !" : l === "es" ? "¡Campeonato Terminado!" : "Championship Over!"}
          </h1>
          <p className="text-white/30 text-sm mt-2 flex items-center justify-center gap-1.5">
            {l === "fr" ? "Merci à tous les participants" : l === "ht" ? "Mèsi a tout patisipan yo" : l === "es" ? "Gracias a todos los participantes" : "Thank you to all participants"} <Icon name="priere" size={14} />
          </p>
          {/* Live indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "live-pulse 1.2s ease-in-out infinite" }} />
            <span className="text-green-400/60 text-[10px] font-black uppercase tracking-wider">
              {l === "fr" ? "Classement en direct" : l === "ht" ? "Klasman an dirèk" : l === "es" ? "Clasificación en vivo" : "Live ranking"}
            </span>
          </div>
        </div>

        {/* ── PODIUM DES ÉQUIPES (concours avancé) ── */}
        {isAdvanced && teams.length > 0 && (
          <div className="w-full max-w-sm" style={{ animation: "podium-rise 0.9s 0.15s ease both", opacity: 0, animationFillMode: "forwards" }}>
            <p className="text-center text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-3">
              ⛪ {l === "fr" ? "Classement des équipes" : l === "ht" ? "Klasman ekip yo" : l === "es" ? "Clasificación de equipos" : "Team ranking"}
            </p>
            <div className="space-y-2">
              {teams.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border"
                  style={{ background: i === 0 ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)", borderColor: i < 3 ? `${medalColors[i]}50` : "rgba(255,255,255,0.06)" }}>
                  <span className="w-7 flex justify-center shrink-0">
                    {i < 3 ? <Icon name="medaille" size={18} color={medalColors[i]} /> : <span className="text-white/40 font-black text-sm">#{i + 1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-sm truncate">{t.name}</p>
                    <p className="text-white/35 text-[11px]">{t.member_count} {l === "fr" ? "joueur(s)" : l === "ht" ? "jwè" : l === "es" ? "jugador(es)" : "player(s)"}</p>
                  </div>
                  <span className="font-black text-amber-400 tabular-nums shrink-0">{t.total_score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio button */}
        {!audioPlayed && (
          <button onClick={handleAudio}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-400/20 text-amber-400/60 text-xs font-bold hover:border-amber-400/40 hover:text-amber-400 transition-all"
            style={{ animation: "podium-rise 1s 0.3s ease both", opacity: 0, animationFillMode: "forwards" }}>
            <Icon name="musique" size={14} /> {l === "fr" ? "Jouer la fanfare de victoire" : l === "ht" ? "Jwe fanfà viktwa a" : l === "es" ? "Reproducir el himno de victoria" : "Play victory fanfare"}
          </button>
        )}

        {/* Podium visual */}
        {top3.length > 0 && (
          <div className="w-full max-w-sm" style={{ animation: "podium-rise 0.9s 0.2s ease both", opacity: 0, animationFillMode: "forwards" }}>
            {/* Avatars + info row */}
            <div className="flex items-end justify-center gap-2 mb-0">
              {[top3[1], top3[0], top3[2]].map((p, vi) => {
                const originalIdx = vi === 0 ? 1 : vi === 1 ? 0 : 2;
                if (!p) return <div key={vi} className="w-20" />;
                const isFirst = originalIdx === 0;
                const size = isFirst ? "w-20 h-20" : "w-16 h-16";
                const color = medalColors[originalIdx];
                const blockHeightPx = [40, 64, 28][vi]; // 2nd, 1st, 3rd
                const mountDelay = `${[0.3, 0.1, 0.5][vi]}s`;

                return (
                  <div key={vi} className="flex flex-col items-center gap-1">
                    <span className="inline-flex" style={{ animation: `badge-pop 0.5s ${0.3 + vi * 0.15}s ease both`, opacity: 0, animationFillMode: "forwards" }}>
                      <Icon name="medaille" size={24} color={medalColors[originalIdx]} />
                    </span>
                    <div className={`${size} rounded-full border-2 overflow-hidden`} style={{ borderColor: color, boxShadow: `0 0 20px ${color}50` }}>
                      {p.player_avatar ? (
                        <img src={p.player_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-lg" style={{ background: color + "20", color }}>
                          {(p.player_name ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className="text-white/70 text-xs font-bold text-center max-w-[72px] truncate">{p.player_name}</p>
                    {isFirst && p.total_correct >= 70 && (
                      <p className="text-amber-400 text-[9px] font-black flex items-center justify-center gap-1"><Icon name="trophee" size={10} /> {l === "fr" ? "Parfait" : l === "ht" ? "Pafè" : l === "es" ? "¡Perfecto!" : "Perfect!"}</p>
                    )}
                    <p className="font-black text-sm" style={{ color }}>{p.total_score.toLocaleString()}</p>
                    {/* Podium block — mounts from bottom */}
                    <div className="w-20 rounded-t-xl flex items-center justify-center overflow-hidden"
                      style={{
                        height: blockHeightPx,
                        background: medalBgs[originalIdx],
                        border: `1px solid ${color}30`,
                        animation: `podium-mount 0.6s ${mountDelay} cubic-bezier(0.34,1.3,0.64,1) both`,
                      }}>
                      <span className="text-xs font-black" style={{ color: color + "80" }}>#{originalIdx + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My result card */}
        <div className="w-full max-w-sm rounded-3xl border border-white/8 p-6"
          style={{ background: "rgba(255,255,255,0.03)", animation: "podium-rise 1s 0.5s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <p className="text-white/30 text-xs text-center mb-4">
            {l === "fr" ? "Votre résultat" : l === "ht" ? "Rezilta ou" : l === "es" ? "Tu resultado" : "Your result"}
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-white font-black text-2xl tabular-nums">{animatedScore.toLocaleString()}</p>
              <p className="text-white/30 text-[10px]">{l === "fr" ? "Points" : l === "ht" ? "Pwen" : l === "es" ? "Puntos" : "Points"}</p>
            </div>
            <div>
              <p className="text-amber-400 font-black text-2xl">#{myRank ?? "—"}</p>
              <p className="text-white/30 text-[10px]">{l === "fr" ? "Classement" : l === "ht" ? "Klasman" : l === "es" ? "Clasificación" : "Rank"}</p>
            </div>
            <div>
              <p className="text-green-400 font-black text-2xl">{myCorrect}</p>
              <p className="text-white/30 text-[10px]">{l === "fr" ? "Correctes" : l === "ht" ? "Kòrèk" : l === "es" ? "Correctas" : "Correct"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center mt-4 pt-4 border-t border-white/5">
            <div>
              <p className="font-black text-2xl tabular-nums" style={{ color: "#a78bfa" }}>{myPct}%</p>
              <p className="text-white/30 text-[10px]">{l === "fr" ? "Réussite" : l === "ht" ? "Reyisit" : l === "es" ? "Acierto" : "Accuracy"}</p>
            </div>
            <div>
              <p className="font-black text-2xl tabular-nums" style={{ color: "#60a5fa" }}>{fmtTime(myTime)}</p>
              <p className="text-white/30 text-[10px]">{l === "fr" ? "Temps" : l === "ht" ? "Tan" : l === "es" ? "Tiempo" : "Time"}</p>
            </div>
          </div>

          {/* Badges */}
          {rewards.length > 0 && (
            <div className="mt-5 pt-5 border-t border-white/5">
              <p className="text-white/20 text-xs text-center mb-3">
                {l === "fr" ? "Récompenses obtenues" : l === "ht" ? "Rekonpans ou resevwa" : l === "es" ? "Recompensas obtenidas" : "Rewards earned"}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {rewards.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/20 text-xs font-bold text-amber-300"
                    style={{ background: "rgba(245,158,11,0.08)", animation: `badge-pop 0.4s ${i * 0.1}s ease both`, opacity: 0, animationFillMode: "forwards" }}>
                    <span>{r.badge_icon}</span>
                    <span>{l === "fr" ? r.badge_label_fr : l === "ht" ? r.badge_label_ht : l === "es" ? (r.badge_label_es ?? r.badge_label_en) : r.badge_label_en}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share button */}
          <button onClick={handleShare}
            className="w-full mt-5 py-3 rounded-2xl border font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: shared ? "rgba(34,197,94,0.10)" : "rgba(255,255,255,0.04)", borderColor: shared ? "rgba(34,197,94,0.30)" : "rgba(255,255,255,0.08)", color: shared ? "#22c55e" : "rgba(255,255,255,0.50)" }}>
            {shared
              ? (l === "fr" ? "✓ Copié dans le presse-papier !" : l === "es" ? "✓ ¡Copiado!" : "✓ Kopye !")
              : <><Icon name="partage" size={15} /> {l === "fr" ? "Partager mon résultat" : l === "ht" ? "Pataje rezilta mwen" : l === "es" ? "Compartir mi resultado" : "Share my result"}</>}
          </button>
        </div>

        {/* Full leaderboard top 10 */}
        {(leaderboard?.entries?.length ?? 0) > 3 && (
          <div className="w-full max-w-sm"
            style={{ animation: "podium-rise 1s 0.7s ease both", opacity: 0, animationFillMode: "forwards" }}>
            <p className="text-white/20 text-xs uppercase tracking-wider text-center mb-3">
              {l === "fr" ? "Classement général" : l === "ht" ? "Klasman jeneral" : l === "es" ? "Clasificación general" : "Overall ranking"}
            </p>
            <div className="space-y-2">
              {leaderboard!.entries.slice(0, 10).map((entry, i) => {
                const isMe = entry.rank === myRank;
                const color = i < 3 ? medalColors[i] : "rgba(255,255,255,0.30)";
                return (
                  <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all"
                    style={{
                      background: isMe ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                      borderColor: isMe ? "rgba(245,158,11,0.30)" : "rgba(255,255,255,0.05)",
                      animation: `podium-rise 0.4s ${i * 0.05}s ease both`,
                      opacity: 0,
                      animationFillMode: "forwards",
                    }}>
                    <span className="w-6 flex justify-center text-xs font-black" style={{ color }}>
                      {i < 3 ? <Icon name="medaille" size={15} color={medalColors[i]} /> : `#${entry.rank}`}
                    </span>
                    {entry.player_avatar ? (
                      <img src={entry.player_avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                        {(entry.player_name ?? "?")[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 text-white/70 text-sm font-medium truncate">{entry.player_name}</span>
                    {(entry as PodiumEntry).total_correct >= 70 && (
                      <span className="text-amber-400 inline-flex"><Icon name="trophee" size={11} /></span>
                    )}
                    {isMe && <span className="text-amber-400 text-[10px] font-black">YOU</span>}
                    <span className="text-white font-black text-sm">{entry.total_score.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 mt-2 pb-8"
          style={{ animation: "podium-rise 1s 0.9s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <Link href={`/championnats/${id}/certificate`} className="w-full max-w-sm flex items-center justify-center gap-2 py-4 rounded-3xl font-black text-base transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#020717", boxShadow: "0 0 30px rgba(245,158,11,0.25)" }}>
            <Icon name="medaille" size={18} /> {l === "fr" ? "Voir mon certificat" : l === "ht" ? "Wè sètifika mwen" : l === "es" ? "Ver mi certificado" : "View my certificate"}
          </Link>
          <Link href="/championnats" className="w-full max-w-sm flex items-center justify-center gap-2 py-3.5 rounded-3xl font-black text-sm transition-all active:scale-95"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.30)", color: "#fbbf24" }}>
            <Icon name="trophee" size={16} /> {l === "fr" ? "Rejouer un concours" : l === "ht" ? "Rejwe yon konkou" : l === "es" ? "Jugar otro concurso" : "Play another contest"}
          </Link>
          <div className="flex gap-4">
            <Link href="/profile" className="text-white/30 text-sm hover:text-white/50 transition-colors">
              {l === "fr" ? "Mon profil" : l === "ht" ? "Pwofil mwen" : l === "es" ? "Mi perfil" : "My profile"}
            </Link>
            <Link href="/dashboard" className="text-white/30 text-sm hover:text-white/50 transition-colors">
              {l === "fr" ? "Tableau de bord" : l === "ht" ? "Tablo" : l === "es" ? "Panel" : "Dashboard"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
