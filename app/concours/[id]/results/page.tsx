"use client";

import { useLang } from "@/lib/LangContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Lang = "fr" | "ht" | "en";

interface RoundScore {
  round_number: number;
  score: number;
  correct: number;
  total: number;
  time_taken_sec: number;
  round_type?: string;
  round_title?: string;
  color_theme?: string;
  icon?: string;
}

interface Session {
  score: number;
  status: string;
  round_scores?: RoundScore[];
  completed_at?: string;
  started_at?: string;
  perfect_bonus: number;
  accuracy_pct?: number;
}

interface LeaderboardData {
  rank_global: number;
  rank_country?: number;
  score: number;
  accuracy_pct: number;
  completion_time_seconds?: number;
}

interface Contest {
  id: string;
  title: string;
  title_ht?: string;
  title_en?: string;
  status: string;
  theme?: string;
}

const RANK_ICONS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function getMedal(accuracy: number): string {
  if (accuracy === 100) return "🥇";
  if (accuracy >= 70)  return "🥈";
  if (accuracy >= 40)  return "🥉";
  return "📖";
}

function ScoreRing({ score, max = 1000 }: { score: number; max?: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(score / max, 1) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#sg)" strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={circ - filled} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
      <defs>
        <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c5a84f" />
          <stop offset="100%" stopColor="#f0d888" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Radar chart (SVG) showing round performance
function RadarChart({ rounds }: { rounds: RoundScore[] }) {
  if (rounds.length < 3) return null;
  const cx = 110, cy = 110, r = 90;
  const n = rounds.length;
  const vals = rounds.map(rs => rs.total > 0 ? rs.correct / rs.total : 0);

  function point(i: number, magnitude: number) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + magnitude * r * Math.cos(angle), y: cy + magnitude * r * Math.sin(angle) };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPaths = gridLevels.map(lvl => {
    const pts = Array.from({ length: n }, (_, i) => point(i, lvl));
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";
  });

  const dataPath = vals.map((v, i) => {
    const p = point(i, v);
    return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ") + "Z";

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[220px] mx-auto">
      {gridPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const p = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      <path d={dataPath} fill="rgba(197,168,79,0.18)" stroke="#c5a84f" strokeWidth="2" />
      {vals.map((v, i) => {
        const p = point(i, v);
        const r = rounds[i];
        const lp = point(i, 1.22);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={r.color_theme ?? "#c5a84f"} />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="14">{r.icon ?? "⚡"}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ResultsPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [shown, setShown] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");
  const [activeTab, setActiveTab] = useState<"summary" | "rounds">("summary");

  useEffect(() => {
    Promise.all([
      fetch(`/api/contests/${id}/my-result`).then(r => r.json()),
      fetch(`/api/contests/${id}`).then(r => r.json()),
    ]).then(([rd, cd]) => {
      if (rd.session) setSession(rd.session);
      if (rd.leaderboard) setLeaderboard(rd.leaderboard);
      if (cd.contest) setContest(cd.contest);
      setLoading(false);
      setTimeout(() => setShown(true), 80);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleShare = useCallback(async () => {
    if (!session || !contest) return;
    const title = contest ? (l === "ht" ? (contest.title_ht || contest.title) : l === "en" ? (contest.title_en || contest.title) : contest.title) : "Championnat Biblique";
    const rankText = leaderboard ? ` — Rang #${leaderboard.rank_global}` : "";
    const accuracy = leaderboard?.accuracy_pct ?? 0;
    const text = [
      `🏆 ${l === "fr" ? "Je viens de terminer" : l === "ht" ? "Mwen fini" : "I just completed"} « ${title} » ${l === "fr" ? "sur KONEKSYON PAM" : l === "ht" ? "sou KONEKSYON PAM" : "on KONEKSYON PAM"} !`,
      `⭐ ${session.score} pts${rankText}`,
      `🎯 ${accuracy}% ${l === "fr" ? "de précision" : l === "ht" ? "presizyon" : "accuracy"}`,
      l === "fr" ? "Participe toi aussi !" : l === "ht" ? "Patisipe tou !" : "Join the challenge!",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        setShareState("shared");
      } catch { /* user dismissed */ }
    } else {
      await navigator.clipboard.writeText(text);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2500);
    }
  }, [session, contest, leaderboard, l]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#030918" }}>
      <div className="w-8 h-8 border-2 border-[#c5a84f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#030918" }}>
      <p className="text-white/40 text-sm">
        {l === "fr" ? "Résultats non disponibles" : l === "ht" ? "Rezilta pa disponib" : "Results not available"}
      </p>
      <Link href={`/concours/${id}`} className="text-[#c5a84f] text-sm font-bold">← Retour</Link>
    </div>
  );

  const roundScores = session.round_scores ?? [];
  const accuracy = leaderboard?.accuracy_pct ?? session.accuracy_pct ?? 0;
  const perfectBonus = session.perfect_bonus ?? 0;
  const isPerfect = perfectBonus > 0;
  const contestTitle = contest
    ? (l === "ht" ? (contest.title_ht || contest.title) : l === "en" ? (contest.title_en || contest.title) : contest.title)
    : "";
  const completionSecs = leaderboard?.completion_time_seconds
    ?? (session.completed_at && session.started_at
      ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 1000)
      : null);

  const bestRound = roundScores.length > 0
    ? roundScores.reduce((best, rs) => {
        const acc = rs.total > 0 ? rs.correct / rs.total : 0;
        const bAcc = best.total > 0 ? best.correct / best.total : 0;
        return acc > bAcc ? rs : best;
      })
    : null;

  const CSS = `
    @keyframes res-fade-up { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes res-bounce { 0%{transform:scale(.4) rotate(-15deg);opacity:0} 60%{transform:scale(1.12) rotate(3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
    @keyframes res-glow { 0%,100%{opacity:.3} 50%{opacity:.6} }
  `;

  return (
    <div className="min-h-screen" style={{ background: "#030918" }}>
      <style>{CSS}</style>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(197,168,79,0.13) 0%, transparent 65%)" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-12 flex flex-col items-center">

        {/* ── Trophy / perfect badge ── */}
        <div className={`mb-6 transition-all duration-700 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {isPerfect ? (
            <div className="flex flex-col items-center gap-3">
              <div className="text-7xl" style={{ animation: "res-bounce .7s .1s ease-out both" }}>👑</div>
              <div className="inline-flex items-center gap-2 bg-[#c5a84f]/15 border border-[#c5a84f]/35 rounded-full px-6 py-2.5">
                <span className="text-[#c5a84f] font-black text-xs uppercase tracking-widest">
                  {l === "fr" ? "Score parfait !" : l === "ht" ? "Pwen pafè !" : "Perfect score!"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-6xl text-center" style={{ animation: "res-bounce .7s .1s ease-out both" }}>🏆</div>
          )}
        </div>

        {/* ── Score ring ── */}
        <div className={`relative flex flex-col items-center mb-8 transition-all duration-700 delay-100 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="relative">
            <ScoreRing score={session.score} max={Math.max(1000, session.score)} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-white font-black tabular-nums" style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)" }}>{session.score}</p>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">pts</p>
            </div>
          </div>
          {contestTitle && <p className="text-white font-black text-lg mt-3 text-center">{contestTitle}</p>}
          {contest?.theme && <p className="text-[#c5a84f] text-xs mt-0.5">{contest.theme}</p>}
        </div>

        {/* ── Global rank ── */}
        {leaderboard && (
          <div className={`w-full mb-6 transition-all duration-700 delay-150 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center justify-center gap-6 bg-white/[0.04] border border-white/8 rounded-2xl p-6">
              <div className="text-center">
                <p className="text-white font-black tabular-nums" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
                  {RANK_ICONS[leaderboard.rank_global] ?? `#${leaderboard.rank_global}`}
                </p>
                {leaderboard.rank_global > 3 && (
                  <p className="text-white font-black text-2xl mt-1">#{leaderboard.rank_global}</p>
                )}
                <p className="text-white/30 text-xs mt-1">
                  {l === "fr" ? "Rang mondial" : l === "ht" ? "Klasman mondyal" : "Global rank"}
                </p>
              </div>
              {leaderboard.rank_country && (
                <>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-white font-black text-2xl">#{leaderboard.rank_country}</p>
                    <p className="text-white/30 text-xs mt-1">
                      {l === "fr" ? "Rang national" : l === "ht" ? "Klasman nasyonal" : "Country rank"}
                    </p>
                  </div>
                </>
              )}
              {accuracy > 0 && (
                <>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-white font-black text-2xl">{accuracy}%</p>
                    <p className="text-white/30 text-xs mt-1">
                      {l === "fr" ? "Précision" : l === "ht" ? "Presizyon" : "Accuracy"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Stats row ── */}
        <div className={`w-full grid grid-cols-3 gap-3 mb-6 transition-all duration-700 delay-200 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-white/8 bg-white/[0.04]">
            <p className="text-white font-black text-xl mb-0.5">{roundScores.length}</p>
            <p className="text-white/30 text-[11px]">{l === "fr" ? "Manches" : l === "ht" ? "Manche" : "Rounds"}</p>
          </div>
          {completionSecs !== null && (
            <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-white/8 bg-white/[0.04]">
              <p className="text-white font-black text-xl mb-0.5">
                {Math.floor(completionSecs / 60)}m{completionSecs % 60}s
              </p>
              <p className="text-white/30 text-[11px]">{l === "fr" ? "Durée" : l === "ht" ? "Dire" : "Time"}</p>
            </div>
          )}
          {bestRound && (
            <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-white/8 bg-white/[0.04]">
              <p className="text-xl mb-0.5">{bestRound.icon ?? "⚡"}</p>
              <p className="text-white/30 text-[11px]">
                {l === "fr" ? "Meilleure manche" : l === "ht" ? "Mye manche" : "Best round"}
              </p>
            </div>
          )}
        </div>

        {/* ── Score breakdown ── */}
        {perfectBonus > 0 && (
          <div className={`w-full mb-6 transition-all duration-700 delay-250 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.25em] mb-3">
              {l === "fr" ? "Détail des points" : l === "ht" ? "Detay pwen yo" : "Points detail"}
            </p>
            <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                <span className="text-white/50 text-sm">
                  {l === "fr" ? "Score des manches" : l === "ht" ? "Pwen manche yo" : "Round scores"}
                </span>
                <span className="font-black text-sm tabular-nums text-white/70">+{session.score - perfectBonus}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                <span className="text-white/50 text-sm">
                  {l === "fr" ? "Bonus parfait (100%)" : l === "ht" ? "Bonus pafè (100%)" : "Perfect bonus"}
                </span>
                <span className="font-black text-sm tabular-nums text-[#c5a84f]">+{perfectBonus}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4 bg-white/[0.02]">
                <span className="text-white font-black text-sm">Total</span>
                <span className="text-[#c5a84f] font-black tabular-nums">{session.score} pts</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab switcher ── */}
        {roundScores.length > 0 && (
          <div className={`w-full mb-5 transition-all duration-700 delay-300 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/8 rounded-xl">
              {[
                { key: "summary", label: l === "fr" ? "Résumé" : l === "ht" ? "Rezime" : "Summary" },
                { key: "rounds", label: l === "fr" ? "Par manche" : l === "ht" ? "Pa manche" : "By round" },
              ].map(tab => (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key as "summary" | "rounds")}
                  className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                  style={{
                    background: activeTab === tab.key ? "#c5a84f" : "transparent",
                    color: activeTab === tab.key ? "#030918" : "rgba(255,255,255,0.35)",
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Summary tab: radar + best/worst ── */}
        {activeTab === "summary" && roundScores.length > 0 && (
          <div className={`w-full mb-6 transition-all duration-700 delay-350 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <RadarChart rounds={roundScores.sort((a, b) => a.round_number - b.round_number)} />

            {/* Badges row */}
            <div className="flex justify-center gap-3 mt-5 flex-wrap">
              {roundScores.some(rs => rs.total > 0 && rs.correct === rs.total) && (
                <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold"
                  style={{ background: "#c5a84f15", borderColor: "#c5a84f40", color: "#c5a84f" }}>
                  ✨ {l === "fr" ? "Manche parfaite" : l === "ht" ? "Manche pafè" : "Perfect round"}
                </div>
              )}
              {roundScores.find(rs => rs.round_type === "finale" && rs.total > 0 && rs.correct === rs.total) && (
                <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold"
                  style={{ background: "#c5a84f15", borderColor: "#c5a84f40", color: "#c5a84f" }}>
                  👑 {l === "fr" ? "Prophète de la Bible" : l === "ht" ? "Pwofèt Bib la" : "Bible Prophet"}
                </div>
              )}
              {roundScores.length === (roundScores[roundScores.length - 1]?.round_number ?? 0) && (
                <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold"
                  style={{ background: "#c5a84f15", borderColor: "#c5a84f40", color: "#c5a84f" }}>
                  🏆 {l === "fr" ? "Champion biblique" : l === "ht" ? "Chanpyon biblik" : "Bible Champion"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Rounds tab: per-round cards ── */}
        {activeTab === "rounds" && roundScores.length > 0 && (
          <div className={`w-full mb-6 flex flex-col gap-3 transition-all duration-700 delay-300 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {roundScores.sort((a, b) => a.round_number - b.round_number).map(rs => {
              const acc = rs.total > 0 ? Math.round((rs.correct / rs.total) * 100) : 0;
              const color = rs.color_theme ?? "#1d4ed8";
              const medal = getMedal(acc);
              return (
                <div key={rs.round_number} className="rounded-2xl border p-4"
                  style={{ background: `${color}0a`, borderColor: `${color}28` }}>
                  <div className="flex items-center gap-3">
                    {/* Icon + medal */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 relative"
                      style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                      {rs.icon ?? "⚡"}
                      <span className="absolute -bottom-1 -right-1 text-xs">{medal}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-sm font-black truncate">
                          {rs.round_title ?? `Manche ${rs.round_number}`}
                        </p>
                        <span className="text-[10px] font-bold shrink-0" style={{ color }}>
                          #{rs.round_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${acc}%`, background: color }} />
                        </div>
                        <span className="text-white/40 text-[11px] shrink-0">{acc}%</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <p className="font-black tabular-nums" style={{ color }}>+{rs.score}</p>
                      <p className="text-white/30 text-[11px]">{rs.correct}/{rs.total} ✓</p>
                      <p className="text-white/20 text-[10px]">{rs.time_taken_sec}s</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Share button ── */}
        <div className={`w-full mb-4 transition-all duration-700 delay-400 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <button onClick={handleShare}
            className="w-full py-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
            {shareState === "copied" ? "✓ Copié dans le presse-papiers" :
             shareState === "shared" ? "✓ Partagé !" :
             l === "fr" ? "📤 Partager mon résultat" : l === "ht" ? "📤 Pataje rezilta mwen" : "📤 Share my result"}
          </button>
        </div>

        {/* ── CTAs ── */}
        <div className={`w-full flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-450 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {contest?.status === "completed" && (
            <Link href={`/concours/${id}/leaderboard`}
              className="flex-1 flex items-center justify-center gap-2 font-black text-sm py-3.5 px-6 rounded-2xl transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #c5a84f, #d8bc5e)", color: "#030918" }}>
              {l === "fr" ? "Classement →" : l === "ht" ? "Klasman →" : "Leaderboard →"}
            </Link>
          )}
          <Link href="/concours"
            className="flex-1 flex items-center justify-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-sm py-3.5 px-6 rounded-2xl transition-all">
            {l === "fr" ? "Tous les championnats" : l === "ht" ? "Tout chanpyona yo" : "All championships"}
          </Link>
        </div>
      </div>
    </div>
  );
}
