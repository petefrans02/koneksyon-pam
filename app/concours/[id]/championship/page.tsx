"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/LangContext";
import {
  startLobbyMusic, startQuestionMusic, stopMusic, destroyAudio,
  playCorrect, playWrong, playCountdown, playCountdownFinal,
  playRoundStart, playVictoryFanfare, playTransition, resumeAudio,
  playChampionshipIntro, playCountdownRiser, playRoundResults,
  preloadMatchAudio, loadAudioPrefs, saveAudioPrefs,
} from "@/lib/championship-audio";
import { ROUND_SPECS } from "@/lib/championship-rounds";
import type {
  Lang, ChampionshipStateRow, ChampionshipPhase,
  ChampionshipMetadata, LText, ChampionshipQuestion,
} from "@/lib/championship-types";
import Icon, { IconName } from "@/app/components/Icon";
import { AmbientFX, CoachFX, LevelBadgeFX, TeamStandingsFX, MyTeamRoomFX, PREMIUM_CSS } from "@/lib/championship-premium";
import { useWakeLock } from "@/lib/useWakeLock";

// ─── Types ──────────────────────────────────────────────────────────────────

interface MyAnswer { is_correct: boolean; points_earned: number; answer_index: number; }
interface ShuffledOpt { text: LText; origIdx: number; }

// ─── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
@keyframes champ-fade {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
@keyframes champ-pop {
  0%   { transform: scale(0.85); opacity: 0; }
  70%  { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes champ-count {
  0%   { transform: scale(1.4); opacity: 0; }
  20%  { transform: scale(1);   opacity: 1; }
  80%  { transform: scale(1);   opacity: 1; }
  100% { transform: scale(0.7); opacity: 0; }
}
@keyframes champ-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
@keyframes champ-reveal {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes champ-danger {
  0%, 100% { transform: scale(1); }
  25%       { transform: scale(1.12) rotate(-2deg); }
  75%       { transform: scale(1.12) rotate(2deg); }
}
@keyframes champ-shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-4px); }
  40%       { transform: translateX(4px); }
  60%       { transform: translateX(-3px); }
  80%       { transform: translateX(3px); }
}
@keyframes champ-score-pop {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.35); color: #fbbf24; }
  100% { transform: scale(1); }
}
@keyframes champ-streak {
  0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
  60%  { transform: scale(1.2) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes champ-correct-flash {
  0%   { background: rgba(34,197,94,0); }
  30%  { background: rgba(34,197,94,0.18); }
  100% { background: rgba(34,197,94,0); }
}
@keyframes confetti-fall {
  0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
}
@keyframes champ-answer-in {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes champ-glow-pulse {
  0%, 100% { box-shadow: 0 0 0px rgba(245,158,11,0); }
  50%       { box-shadow: 0 0 18px rgba(245,158,11,0.35); }
}
@keyframes champ-reveal-correct {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.03); box-shadow: 0 0 24px rgba(34,197,94,0.5); }
  100% { transform: scale(1); }
}
@keyframes finale-title {
  0%   { opacity: 0; transform: scale(0.7) translateY(20px); letter-spacing: 0.1em; }
  60%  { opacity: 1; transform: scale(1.04) translateY(-4px); letter-spacing: 0.5em; }
  100% { opacity: 1; transform: scale(1) translateY(0); letter-spacing: 0.4em; }
}
@keyframes finale-sub {
  0%,40% { opacity: 0; transform: translateY(10px); }
  100%    { opacity: 1; transform: translateY(0); }
}
@keyframes finale-crown {
  0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
  60%  { transform: scale(1.3) rotate(8deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes firework-burst {
  0%   { transform: scale(0); opacity: 1; }
  70%  { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.2); opacity: 0; }
}
@keyframes finale-rank-in {
  0%   { transform: translateX(-20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes finale-bg-pulse {
  0%,100% { opacity: 0.04; }
  50%      { opacity: 0.09; }
}
` + PREMIUM_CSS;

// ─── Helpers ────────────────────────────────────────────────────────────────

function t(o: LText | undefined | null, l: Lang): string {
  if (!o) return "";
  return (l === "ht" ? o.ht : l === "en" ? o.en : l === "es" ? (o.es ?? o.en) : undefined) || o.fr || "";
}

function timeColor(pct: number): string {
  if (pct > 0.5) return "#22c55e";
  if (pct > 0.25) return "#f59e0b";
  return "#ef4444";
}

function arcPath(pct: number): string {
  const r = 36, cx = 44, cy = 44;
  const angle = pct * 2 * Math.PI - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const large = pct > 0.5 ? 1 : 0;
  if (pct <= 0) return "";
  if (pct >= 1) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r}`;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`;
}

function toLText(o: LText | string): LText {
  return typeof o === "string" ? { fr: o, ht: o, en: o } : o;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Confetti ────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#fbbf24","#f59e0b","#34d399","#60a5fa","#f472b6","#a78bfa","#fff"];

function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    delay: `${Math.random() * 0.4}s`,
    duration: `${0.7 + Math.random() * 0.6}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: `${5 + Math.random() * 6}px`,
    shape: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0%",
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", top: "35%", left: p.left,
          width: p.size, height: p.size, borderRadius: p.shape,
          background: p.color, animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

// ─── Streak Banner ────────────────────────────────────────────────────────────

function StreakBanner({ streak, l }: { streak: number; l: Lang }) {
  if (streak < 3) return null;
  const flameCount = streak >= 7 ? 3 : streak >= 5 ? 2 : 1;
  const label = streak >= 7
    ? (l === "fr" ? "INARRÊTABLE" : l === "ht" ? "ENSTOPABL" : l === "es" ? "IMPARABLE" : "UNSTOPPABLE")
    : streak >= 5
    ? (l === "fr" ? "EN FEU" : l === "ht" ? "AN FÈ" : l === "es" ? "EN LLAMAS" : "ON FIRE")
    : (l === "fr" ? "SÉRIE" : l === "ht" ? "SERI" : l === "es" ? "RACHA" : "STREAK");
  return (
    <div key={streak} className="fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
      style={{ animation: "champ-streak 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-black"
        style={{ background: "rgba(251,191,36,0.12)", borderColor: "rgba(251,191,36,0.4)", color: "#fbbf24" }}>
        <span className="inline-flex items-center gap-0.5">{Array.from({ length: flameCount }).map((_, i) => <Icon key={i} name="feu" size={14} />)}</span> {streak}x {label}
      </div>
    </div>
  );
}

// ─── Animated Score ───────────────────────────────────────────────────────────

function AnimatedScore({ score, prevScore }: { score: number; prevScore: number }) {
  const [displayed, setDisplayed] = useState(prevScore);
  const [popping, setPopping] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (score === prevScore) return;
    setPopping(true);
    const diff = score - prevScore;
    const steps = Math.min(30, Math.abs(diff));
    const step = diff / steps;
    let current = prevScore;
    let count = 0;
    function tick() {
      count++;
      current += step;
      setDisplayed(Math.round(current));
      if (count < steps) { rafRef.current = requestAnimationFrame(tick); }
      else { setDisplayed(score); setTimeout(() => setPopping(false), 300); }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score, prevScore]);

  return (
    <span className="font-black text-white/60 tabular-nums"
      style={{ animation: popping ? "champ-score-pop 0.5s ease both" : "none" }}>
      {displayed.toLocaleString()}
    </span>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChampionshipPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;

  // ── Server state ──────────────────────────────────────────────────────────
  const [state, setState] = useState<ChampionshipStateRow | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [prevScore, setPrevScore] = useState(0);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [myLastAnswer, setMyLastAnswer] = useState<MyAnswer | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [countNum, setCountNum] = useState(10);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const [visibleClues, setVisibleClues] = useState(1);
  const [clueCountdown, setClueCountdown] = useState(4);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [audioPrefs, setAudioPrefs] = useState(() => loadAudioPrefs());
  // L'organisateur d'un concours privé peut mettre en pause (pas les joueurs d'un championnat admin).
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [pauseBusy, setPauseBusy] = useState(false);
  useWakeLock(true); // garder l'écran allumé pendant le jeu

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const d = await fetch(`/api/contests/${id}`).then(r => r.json());
        const c = d?.contest;
        if (c?.contest_type === "advanced") setIsAdvanced(true);
        if (user && c && c.is_private === true && (c.organizer_id === user.id || c.created_by === user.id)) setIsOrganizer(true);
      } catch { /* non-bloquant */ }
    })();
  }, [id]);

  const togglePause = useCallback(async (action: "pause" | "resume") => {
    setPauseBusy(true);
    try {
      await fetch(`/api/engine/${id}/pause`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } catch { /* ignore */ }
    setPauseBusy(false);
  }, [id]);

  // Auto-enable audio on first user interaction (browser requirement)
  useEffect(() => {
    if (audioEnabled) return;
    function handleFirstInteraction() {
      resumeAudio();
      setAudioEnabled(true);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    }
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [audioEnabled]);

  // Grande Finale live leaderboard
  const [finaleLb, setFinaleLb] = useState<{ rank: number; player_name: string; total_score: number }[]>([]);
  const finaleLbRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Interactive ordering (chrono / order_verse)
  const [orderedItems, setOrderedItems] = useState<number[]>([]);
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const itemRectsRef = useRef<DOMRect[]>([]);
  const orderContainerRef = useRef<HTMLDivElement | null>(null);
  // Match/association
  const [matchPairs, setMatchPairs] = useState<Record<number, number>>({});
  const [matchSelected, setMatchSelected] = useState<number | null>(null);
  const [shuffledRight, setShuffledRight] = useState<number[]>([]);

  // Shuffled fill options (keyed on question)
  const [shuffledFillOpts, setShuffledFillOpts] = useState<ShuffledOpt[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clueTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clueCountRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const rafRef2 = useRef<number | null>(null);
  const tickCalledRef = useRef(false);
  const prevPhaseRef = useRef<ChampionshipPhase | null>(null);
  const prevQKeyRef = useRef("");   // tracks round_index + question_index
  const lastCountRef = useRef(-1);

  // ── Full cleanup — stops every timer, channel, animation, and audio ────────
  const cleanupAll = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (clueTimerRef.current) { clearInterval(clueTimerRef.current); clueTimerRef.current = null; }
    if (clueCountRef.current) { clearInterval(clueCountRef.current); clueCountRef.current = null; }
    if (finaleLbRef.current) { clearInterval(finaleLbRef.current); finaleLbRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (rafRef2.current) { cancelAnimationFrame(rafRef2.current); rafRef2.current = null; }
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    destroyAudio();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Question key tracking ─────────────────────────────────────────────────
  // Reset per-question state whenever we enter a new question (phase or index changes)

  const handleStateChange = useCallback((row: ChampionshipStateRow) => {
    const prev = prevPhaseRef.current;
    const phaseChanged = prev !== row.phase;
    prevPhaseRef.current = row.phase;

    const qKey = `${row.round_index}_${row.question_index}`;
    const questionChanged = qKey !== prevQKeyRef.current;
    if (row.phase === "QUESTION_ACTIVE") prevQKeyRef.current = qKey;

    setState(row);

    if (phaseChanged) {
      tickCalledRef.current = false;
      lastCountRef.current = -1;
    }

    // Reset answer state on new question
    if (phaseChanged && row.phase === "QUESTION_ACTIVE") {
      setSelectedOption(null);
      setMyLastAnswer(null);
      setAlreadyAnswered(false);
      setRevealReady(false);
      setVisibleClues(1);
      setClueCountdown(4);
      setMatchPairs({});
      setMatchSelected(null);
      setDragFromIdx(null);
      setDragOverIdx(null);
    } else if (row.phase === "QUESTION_ACTIVE" && questionChanged) {
      setSelectedOption(null);
      setMyLastAnswer(null);
      setAlreadyAnswered(false);
      setRevealReady(false);
      setVisibleClues(1);
      setClueCountdown(4);
      setMatchPairs({});
      setMatchSelected(null);
      setDragFromIdx(null);
      setDragOverIdx(null);
    }

    // Suspense delay before reveal
    if (phaseChanged && row.phase === "ANSWER_REVEAL") {
      setRevealReady(false);
      setTimeout(() => setRevealReady(true), 900);
    }

    // Routing
    if (row.phase === "LOBBY") { router.push(`/concours/${id}/lobby`); return; }
    if (row.phase === "PODIUM") { stopMusic(2); if (audioEnabled) playVictoryFanfare(); router.push(`/concours/${id}/podium`); return; }
    if (row.phase === "CLOSED" || row.phase === "CANCELLED") { stopMusic(); router.push("/dashboard"); return; }

    // Sound cues (only on actual phase transitions)
    if (audioEnabled && phaseChanged) {
      // COUNTDOWN : le lit du lobby continue, la montee de 12 s passe par-dessus.
      if (row.phase === "COUNTDOWN") { startLobbyMusic(); playCountdownRiser(); }
      // CHAMPIONSHIP_INTRO : fanfare d'ouverture, la musique s'efface derriere.
      else if (row.phase === "CHAMPIONSHIP_INTRO") playChampionshipIntro();
      else if (row.phase === "ROUND_INTRO") { stopMusic(1.2); setTimeout(() => playRoundStart(), 300); }
      // La boucle de questions depend de la manche (standard / rapide / finale)
      // et tourne sans interruption pendant les reveals.
      else if (row.phase === "QUESTION_ACTIVE") startQuestionMusic(row.round_index);
      else if (row.phase === "ROUND_RESULTS") { stopMusic(1.5); playRoundResults(); }
      else if (row.phase === "BETWEEN_ROUNDS") playTransition();
    }
  }, [id, router, audioEnabled]);

  // ── Shuffle fill options when question changes ────────────────────────────

  useEffect(() => {
    if (!state) return;
    const question = (state.metadata as ChampionshipMetadata)?.question;
    // Use question's own type, then fall back to ROUND_SPECS position type
    const effectiveType = question?.type ?? ROUND_SPECS[state.round_index]?.type ?? "";
    if (effectiveType !== "fill") { setShuffledFillOpts([]); return; }

    const rawOpts = (question?.fill_options ?? question?.options ?? []) as (LText | string)[];
    const opts: ShuffledOpt[] = rawOpts.map((o, i) => ({ text: toLText(o), origIdx: i }));
    setShuffledFillOpts(shuffleArray(opts));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.round_index, state?.question_index, state?.phase]);

  // ── Live leaderboard for Grande Finale (round 14) ────────────────────────

  useEffect(() => {
    if (!id) return;
    if (state?.round_index !== 14) {
      if (finaleLbRef.current) clearInterval(finaleLbRef.current);
      return;
    }
    const fetchLb = () => {
      fetch(`/api/engine/${id}/leaderboard`)
        .then(r => r.json())
        .then(d => { if (d.entries) setFinaleLb((d.entries as typeof finaleLb).slice(0, 5)); })
        .catch(() => {});
    };
    fetchLb();
    finaleLbRef.current = setInterval(fetchLb, 5000);
    return () => { if (finaleLbRef.current) clearInterval(finaleLbRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, state?.round_index]);

  // ── Initialize ordering/matching items when question changes ─────────────

  useEffect(() => {
    if (!state) return;
    const question = (state.metadata as ChampionshipMetadata)?.question;
    const qType = question?.type ?? "";

    if (qType === "chrono" || qType === "order_verse") {
      const count = ((question as Record<string, unknown>)?.items as unknown[] ?? (question as Record<string, unknown>)?.fragments as unknown[] ?? []).length;
      setOrderedItems(shuffleArray(Array.from({ length: count }, (_, i) => i)));
    } else if (qType === "match") {
      const count = ((question as Record<string, unknown>)?.right as unknown[] ?? []).length;
      setShuffledRight(shuffleArray(Array.from({ length: count }, (_, i) => i)));
      setOrderedItems([]);
    } else {
      setOrderedItems([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.round_index, state?.question_index, state?.phase]);

  // ── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    fetch(`/api/engine/${id}/state`)
      .then(r => r.json())
      .then(d => {
        if (d.state) {
          handleStateChange(d.state);
          setMyScore(d.your_score ?? 0);
          setMyRank(d.your_rank ?? null);
          setAlreadyAnswered(d.already_answered ?? false);
          if (d.my_answer_index !== null && d.my_answer_index !== undefined) {
            setSelectedOption(d.my_answer_index);
          }
        } else {
          router.push(`/concours/${id}/lobby`);
        }
      })
      .catch(() => router.push(`/concours/${id}/lobby`));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Supabase Realtime ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`champ-${id}-${Date.now()}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any,
        { event: "*", schema: "public", table: "championship_state", filter: `contest_id=eq.${id}` },
        (payload: { new: ChampionshipStateRow }) => { if (payload.new) handleStateChange(payload.new); }
      )
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [id, handleStateChange]);

  // ── Polling fallback every 5s ─────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    const poll = setInterval(() => {
      fetch(`/api/engine/${id}/state`)
        .then(r => r.json())
        .then(d => {
          if (d.state) {
            handleStateChange(d.state);
            setMyScore(d.your_score ?? 0);
            setMyRank(d.your_rank ?? null);
            // Authoritative answered state from server
            setAlreadyAnswered(d.already_answered ?? false);
            if (d.my_answer_index !== null && d.my_answer_index !== undefined) {
              setSelectedOption(d.my_answer_index);
            }
          }
        })
        .catch(() => {});
    }, 5_000);
    pollRef.current = poll;
    return () => {
      clearInterval(poll);
      pollRef.current = null;
    };
  }, [id, handleStateChange]);

  // ── Progressive clue reveal for M13 questions ────────────────────────────

  useEffect(() => {
    if (clueTimerRef.current) clearInterval(clueTimerRef.current);
    if (clueCountRef.current) clearInterval(clueCountRef.current);

    if (state?.phase !== "QUESTION_ACTIVE") return;
    const q = (state.metadata as ChampionshipMetadata)?.question;
    if (!q?.progressive_clues) return;
    const totalClues = (q.clues ?? []).length;
    if (totalClues <= 1) return;

    // Count down 4s per clue, then reveal next
    let secsLeft = 4;
    setClueCountdown(secsLeft);

    clueCountRef.current = setInterval(() => {
      secsLeft -= 1;
      setClueCountdown(secsLeft > 0 ? secsLeft : 4);
    }, 1000);

    clueTimerRef.current = setInterval(() => {
      setVisibleClues(prev => {
        if (prev >= totalClues) {
          clearInterval(clueTimerRef.current!);
          clearInterval(clueCountRef.current!);
          return prev;
        }
        secsLeft = 4;
        return prev + 1;
      });
    }, 4000);

    return () => {
      clearInterval(clueTimerRef.current!);
      clearInterval(clueCountRef.current!);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.phase, state?.round_index, state?.question_index]);

  // ── Server timer (countdown + tick) ──────────────────────────────────────

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!state?.phase_ends_at) { setTimeRemaining(null); return; }

    const endsAt = new Date(state.phase_ends_at).getTime();

    timerRef.current = setInterval(() => {
      const rem = Math.max(0, endsAt - Date.now());
      setTimeRemaining(rem);

      // Countdown sound cues
      if (state.phase === "COUNTDOWN" || state.phase === "QUESTION_ACTIVE") {
        const sec = Math.ceil(rem / 1000);
        if (sec <= 5 && sec !== lastCountRef.current) {
          lastCountRef.current = sec;
          if (audioEnabled) {
            if (sec === 0) playCountdownFinal(); else playCountdown();
          }
          if (state.phase === "COUNTDOWN") setCountNum(sec);
        }
      }

      // Trigger tick when timer expires (idempotent)
      if (rem === 0 && !tickCalledRef.current) {
        tickCalledRef.current = true;
        fetch(`/api/engine/${id}/tick`, { method: "POST" }).catch(() => {});
      }
    }, 100);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state?.phase_ends_at, state?.phase, id, audioEnabled]);

  // ── Answer submission ─────────────────────────────────────────────────────

  const submitAnswer = useCallback(async (answerIndex: number) => {
    if (submitting || alreadyAnswered || selectedOption !== null) return;
    if (state?.phase !== "QUESTION_ACTIVE") return;

    setSelectedOption(answerIndex);
    setSubmitting(true);
    resumeAudio();

    try {
      const res = await fetch(`/api/engine/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer_index: answerIndex,
          question_index: state.question_index,
          round_index: state.round_index,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        setAlreadyAnswered(true);
        setMyLastAnswer({ is_correct: data.is_correct, points_earned: data.points_earned ?? 0, answer_index: answerIndex });
        if (data.new_total !== undefined) {
          setPrevScore(myScore);
          setMyScore(data.new_total);
        }
        if (data.is_correct) {
          setStreak(s => s + 1);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1200);
        } else {
          setStreak(0);
        }
        if (audioEnabled) { if (data.is_correct) playCorrect(); else playWrong(); }
      } else if (data.already_submitted) {
        setAlreadyAnswered(true);
      } else {
        // Error — roll back selection
        setSelectedOption(null);
      }
    } catch {
      setSelectedOption(null);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, alreadyAnswered, selectedOption, state?.phase, state?.question_index, state?.round_index, id, audioEnabled]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    if (state?.phase !== "QUESTION_ACTIVE" || alreadyAnswered) return;
    const meta = state.metadata as ChampionshipMetadata;
    const qType = (meta?.question?.type ?? ROUND_SPECS[state.round_index]?.type ?? "mcq") as string;

    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const key = e.key.toLowerCase();
      if (key === "1") submitAnswer(0);
      else if (key === "2") submitAnswer(1);
      else if (key === "3") submitAnswer(2);
      else if (key === "4") submitAnswer(3);
      else if ((key === "v" || key === "t") && qType === "tf") submitAnswer(0);
      else if (key === "f" && qType === "tf") submitAnswer(1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [state?.phase, state?.round_index, state?.metadata, alreadyAnswered, submitAnswer]);

  // ─── Render helpers ───────────────────────────────────────────────────────

  function enableAudio() {
    resumeAudio();
    preloadMatchAudio();
    setAudioEnabled(true);
    const ph = state?.phase;
    if (ph === "LOBBY" || ph === "COUNTDOWN" || ph === "CHAMPIONSHIP_INTRO") startLobbyMusic();
    else if (ph === "QUESTION_ACTIVE" && state) startQuestionMusic(state.round_index);
  }

  const meta: ChampionshipMetadata = (state?.metadata as ChampionshipMetadata) ?? {};
  const roundSpec = meta.round_spec ?? (state ? ROUND_SPECS[state.round_index] : null);
  const accentColor = roundSpec?.color ?? "#f59e0b";
  const isPaused = !!(meta as Record<string, unknown>)?.is_paused;

  // ── PAUSE OVERLAY ─────────────────────────────────────────────────────────

  if (isPaused) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <div className="text-6xl animate-pulse">⏸️</div>
        <div className="text-center space-y-2">
          <p className="text-white text-2xl font-black tracking-tight">
            {l === "fr" ? "Championnat en pause" : l === "ht" ? "Chanpyona an pòz" : l === "es" ? "Campeonato en pausa" : "Championship paused"}
          </p>
          <p className="text-white/40 text-sm">
            {isOrganizer
              ? (l === "fr" ? "Vous avez mis le concours en pause." : l === "ht" ? "Ou mete konkou a an pòz." : l === "es" ? "Has pausado el concurso." : "You paused the contest.")
              : (l === "fr" ? "Veuillez patienter, l'organisateur reprendra bientôt…" : l === "ht" ? "Tanpri tann, òganizatè a ap reprann byento…" : l === "es" ? "Por favor espere, el organizador reanudará pronto…" : "Please wait, the organizer will resume shortly…")}
          </p>
        </div>
        {isOrganizer && (
          <button onClick={() => togglePause("resume")} disabled={pauseBusy}
            className="mt-2 inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", boxShadow: "0 4px 24px rgba(34,197,94,0.35)" }}>
            ▶ {l === "fr" ? "Reprendre" : l === "ht" ? "Reprann" : l === "es" ? "Reanudar" : "Resume"}
          </button>
        )}
      </div>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────────────────

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
          <p className="text-white/30 text-sm">{l === "fr" ? "Connexion au championnat…" : l === "ht" ? "Koneksyon chanpyona a…" : l === "es" ? "Conectando al campeonato…" : "Connecting to championship…"}</p>
        </div>
      </div>
    );
  }

  // ── COUNTDOWN ─────────────────────────────────────────────────────────────

  if (state.phase === "COUNTDOWN") {
    const sec = Math.ceil((timeRemaining ?? 0) / 1000);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <p className="text-white/30 text-xs font-black tracking-widest uppercase">
          {l === "fr" ? "Le championnat commence dans" : l === "ht" ? "Chanpyona a kòmanse nan" : l === "es" ? "El campeonato comienza en" : "Championship starts in"}
        </p>
        <div key={sec} className="text-9xl font-black flex items-center justify-center" style={{ animation: "champ-count 1s ease forwards", color: sec <= 3 ? "#ef4444" : "#f59e0b", textShadow: `0 0 60px ${sec <= 3 ? "#ef4444" : "#f59e0b"}60` }}>
          {sec <= 0 ? <Icon name="feu" size={110} color="#ef4444" /> : sec}
        </div>
        <p className="text-white/20 text-sm">{state.player_count} {l === "fr" ? "joueurs" : l === "ht" ? "jwè" : l === "es" ? "jugadores" : "players"}</p>
        {!audioEnabled && (
          <button onClick={enableAudio} className="mt-4 px-5 py-2 rounded-full border border-white/10 text-white/40 text-xs hover:text-white/70 transition-colors">
            <Icon name="audio" size={14} /> {l === "fr" ? "Activer le son" : l === "ht" ? "Aktive son an" : l === "es" ? "Activar el sonido" : "Enable sound"}
          </button>
        )}
        <span className="sr-only">{countNum}</span>
      </div>
    );
  }

  // ── CHAMPIONSHIP_INTRO ────────────────────────────────────────────────────

  if (state.phase === "CHAMPIONSHIP_INTRO") {
    const introTitle = meta.contest_title ?? (l === "fr" ? "Championnat Biblique" : l === "ht" ? "Chanpyona Biblik" : l === "es" ? "Campeonato Bíblico" : "Biblical Championship");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center relative overflow-hidden" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <AmbientFX accent="#f59e0b" />
        {/* Faisceau de lumière dorée */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 200, height: "78%", transformOrigin: "top", background: "linear-gradient(to bottom, rgba(251,191,36,0.30), transparent 75%)", filter: "blur(14px)", animation: "prem-ray 1.8s 0.3s ease both", opacity: 0 }} />
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Bible qui s'ouvre */}
          <div style={{ animation: "prem-book-open 1.2s cubic-bezier(0.34,1.56,0.64,1) both", filter: "drop-shadow(0 0 30px rgba(251,191,36,0.6))" }}>
            <Icon name="bible" size={76} color="#fbbf24" />
          </div>
          <div>
            <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-3" style={{ animation: "finale-sub 0.8s 0.6s ease both", opacity: 0, animationFillMode: "forwards" }}>KONEKSYON PAM</p>
            <h1 className="text-white font-black text-4xl sm:text-5xl mb-2" style={{ animation: "prem-title-in 1s 0.8s ease both", opacity: 0, animationFillMode: "forwards" }}>{introTitle}</h1>
            <p className="text-amber-400/70 text-lg font-bold" style={{ animation: "finale-sub 0.8s 1.3s ease both", opacity: 0, animationFillMode: "forwards" }}>{state.player_count} {l === "fr" ? "joueurs en direct" : l === "ht" ? "jwè an dirèk" : l === "es" ? "jugadores en vivo" : "live players"}</p>
          </div>
          <div className="mt-2 text-white/45 text-sm font-bold" style={{ animation: "champ-pulse 1.5s 1.8s ease-in-out infinite", opacity: 0, animationFillMode: "forwards" }}>
            {l === "fr" ? "Préparez-vous…" : l === "ht" ? "Prepare ou…" : l === "es" ? "Prepárate…" : "Get ready…"}
          </div>
        </div>
      </div>
    );
  }

  // ── ROUND_INTRO ───────────────────────────────────────────────────────────

  if (state.phase === "ROUND_INTRO") {
    const spec = ROUND_SPECS[state.round_index] ?? ROUND_SPECS[0];

    // ── 👑 Grande Finale special intro (round 14 = manche 15) ──────────────
    if (state.round_index === 14) {
      const fireworks = Array.from({ length: 12 }, (_, i) => ({
        left: `${8 + (i * 8) % 84}%`,
        top: `${10 + (i * 13) % 55}%`,
        delay: `${i * 0.18}s`,
        size: 60 + (i % 4) * 30,
        color: ["#f59e0b","#fcd34d","#ffffff","#ec4899","#60a5fa","#34d399"][i % 6],
      }));
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 text-center relative overflow-hidden"
          style={{ background: "#000008" }}>
          <style>{CSS}</style>

          {/* Fireworks */}
          <div className="fixed inset-0 pointer-events-none">
            {fireworks.map((fw, i) => (
              <div key={i} className="absolute rounded-full" style={{
                left: fw.left, top: fw.top,
                width: fw.size, height: fw.size,
                border: `2px solid ${fw.color}`,
                animation: `firework-burst 1.2s ${fw.delay} ease-out infinite`,
                opacity: 0,
              }} />
            ))}
          </div>

          {/* Gold ambient */}
          <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(245,158,11,0.07) 0%, transparent 70%)", animation: "finale-bg-pulse 3s ease-in-out infinite" }} />

          {/* Crown */}
          <div className="flex justify-center" style={{ animation: "finale-crown 0.9s 0.2s cubic-bezier(0.34,1.56,0.64,1) both", opacity: 0, animationFillMode: "forwards", filter: "drop-shadow(0 0 30px rgba(245,158,11,0.60))" }}>
            <Icon name="couronne" size={72} color="#f59e0b" />
          </div>

          {/* Title */}
          <div>
            <p className="font-black text-sm text-amber-400/50 mb-3" style={{ animation: "finale-sub 0.8s 0.1s ease both", opacity: 0, animationFillMode: "forwards", letterSpacing: "0.5em" }}>
              KONEKSYON PAM
            </p>
            <h1 className="font-black text-white" style={{
              fontSize: "clamp(1.8rem, 8vw, 3.2rem)",
              animation: "finale-title 1.2s 0.4s ease both",
              opacity: 0,
              animationFillMode: "forwards",
              background: "linear-gradient(135deg, #f59e0b, #fcd34d, #fff, #f59e0b)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {l === "fr" ? "LA GRANDE FINALE" : l === "ht" ? "GRAN FINAL LA" : l === "es" ? "LA GRAN FINAL" : "THE GRAND FINALE"}
            </h1>
          </div>

          {/* Sub message */}
          <p className="text-white/50 text-base font-bold max-w-xs" style={{ animation: "finale-sub 0.8s 1.2s ease both", opacity: 0, animationFillMode: "forwards" }}>
            {l === "fr" ? "Une seule personne deviendra Champion." : l === "ht" ? "Yon sèl moun ap vin Chanpyon." : l === "es" ? "Solo una persona se convertirá en Campeón." : "Only one will become Champion."}
          </p>

          {/* Player count */}
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border" style={{ borderColor: "rgba(245,158,11,0.30)", background: "rgba(245,158,11,0.06)", animation: "finale-sub 0.8s 1.6s ease both", opacity: 0, animationFillMode: "forwards" }}>
            <span className="w-2 h-2 rounded-full bg-amber-400" style={{ animation: "champ-pulse 0.8s ease-in-out infinite" }} />
            <span className="text-amber-400 font-black text-sm">{state.player_count} {l === "fr" ? "joueurs en compétition" : l === "ht" ? "jwè ap konpetisyon" : l === "es" ? "jugadores compitiendo" : "players competing"}</span>
          </div>

          {/* Pulse text */}
          <p className="text-white/20 text-xs" style={{ animation: "champ-pulse 1s 2s ease-in-out infinite", animationFillMode: "forwards", opacity: 0 }}>
            {l === "fr" ? "Que le meilleur gagne…" : l === "ht" ? "Ke pi bon an genyen…" : l === "es" ? "Que gane el mejor…" : "May the best win…"}
          </p>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center relative overflow-hidden" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <AmbientFX accent={spec.color} />
        <div className="relative z-10" style={{ animation: "champ-pop 0.6s ease both" }}>
          <div className="text-6xl mb-4" style={{ filter: `drop-shadow(0 0 20px ${spec.color}80)`, animation: "prem-book-open 1s cubic-bezier(0.34,1.56,0.64,1) both", display: "inline-block" }}>{spec.icon}</div>
          <p className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: spec.color }}>
            {l === "fr" ? "Épreuve" : l === "ht" ? "Epwèv" : l === "es" ? "Ronda" : "Round"} {state.round_index + 1} / 15
          </p>
          <h2 className="text-white font-black text-3xl mb-3">{t(spec.name, l)}</h2>
          <p className="text-white/40 text-sm max-w-xs mx-auto">{t(spec.description, l)}</p>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold" style={{ borderColor: spec.color + "40", color: spec.color, background: spec.color + "10" }}>
            <Icon name="etoile" size={14} /> {spec.questions_count} {l === "fr" ? "questions · 15s par question" : l === "ht" ? "kesyon · 15s chak" : l === "es" ? "preguntas · 15s cada una" : "questions · 15s each"}
          </div>
        </div>
        <p className="text-white/30 text-sm mt-2" style={{ animation: "champ-pulse 1s ease-in-out infinite" }}>
          {l === "fr" ? "Préparez-vous !" : l === "ht" ? "Prepare ou !" : l === "es" ? "¡Prepárate!" : "Get ready!"}
        </p>
      </div>
    );
  }

  // ── BETWEEN_ROUNDS ────────────────────────────────────────────────────────

  if (state.phase === "BETWEEN_ROUNDS") {
    const nextSpec = meta.next_round_spec;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <div style={{ animation: "champ-fade 0.5s ease both" }}>
          <p className="text-white/30 text-sm mb-6">{l === "fr" ? "Épreuve suivante…" : l === "ht" ? "Epwèv pwochen an…" : l === "es" ? "Siguiente ronda…" : "Next round…"}</p>
          {nextSpec && (
            <>
              <div className="text-5xl mb-3" style={{ filter: `drop-shadow(0 0 20px ${nextSpec.color}80)` }}>{nextSpec.icon}</div>
              <p className="text-white font-black text-2xl">{t(nextSpec.name, l)}</p>
              <p className="mt-1 text-xs font-black tracking-widest uppercase" style={{ color: nextSpec.color }}>
                {l === "fr" ? "Épreuve" : l === "ht" ? "Epwèv" : l === "es" ? "Ronda" : "Round"} {(meta.next_round_index ?? 0) + 1} / 15
              </p>
            </>
          )}
        </div>
        <div className="mt-4 rounded-2xl border border-white/8 px-6 py-3 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-white/30 text-xs">{l === "fr" ? "Votre score" : l === "ht" ? "Pwen ou" : l === "es" ? "Tu puntuación" : "Your score"}</p>
          <p className="text-white font-black text-2xl">{myScore.toLocaleString()}</p>
          {myRank && <p className="text-amber-400 text-xs font-bold">#{myRank}</p>}
        </div>
      </div>
    );
  }

  // ── ROUND_RESULTS ─────────────────────────────────────────────────────────

  if (state.phase === "ROUND_RESULTS") {
    const top3 = meta.top3 ?? [];
    const spec = ROUND_SPECS[state.round_index] ?? ROUND_SPECS[0];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <div style={{ animation: "champ-pop 0.5s ease both" }}>
          <div className="text-4xl mb-2">{spec.icon}</div>
          <p className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: spec.color }}>{t(meta.round_name ?? spec.name, l)}</p>
          <p className="text-white/30 text-sm">{l === "fr" ? "Résultats de l'épreuve" : l === "ht" ? "Rezilta epwèv la" : l === "es" ? "Resultados de la ronda" : "Round results"}</p>
        </div>
        <div className="w-full max-w-sm rounded-3xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.03)", borderColor: accentColor + "30" }}>
          <p className="text-white/30 text-xs mb-1">{l === "fr" ? "Votre score total" : l === "ht" ? "Total pwen ou" : l === "es" ? "Tu puntuación total" : "Your total score"}</p>
          <p className="text-white font-black text-4xl">{myScore.toLocaleString()}</p>
          {myRank && <p className="text-amber-400 text-sm font-bold mt-1">#{myRank} {l === "fr" ? "au classement" : l === "ht" ? "nan klasman an" : l === "es" ? "en clasificación" : "in ranking"}</p>}
        </div>
        {top3.length > 0 && (
          <div className="w-full max-w-sm space-y-2">
            <p className="text-white/20 text-xs uppercase tracking-wider mb-3">{l === "fr" ? "Top 3 de l'épreuve" : l === "ht" ? "Top 3 epwèv la" : l === "es" ? "Top 3 de la ronda" : "Round Top 3"}</p>
            {top3.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                <Icon name="medaille" size={18} color={i === 0 ? "#c5a84f" : i === 1 ? "#c0c0c0" : "#cd7f32"} />
                {p.player_avatar
                  ? <img src={p.player_avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  : <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/50">{(p.player_name ?? "?")[0]?.toUpperCase()}</div>}
                <span className="flex-1 text-white/70 text-sm font-medium text-left">{p.player_name}</span>
                <span className="text-white font-black text-sm">{p.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── ANSWER_REVEAL ─────────────────────────────────────────────────────────

  if (state.phase === "ANSWER_REVEAL") {
    const question = meta.question;
    const correctIdx = meta.correct_index;
    const isCorrect = myLastAnswer?.is_correct ?? false;
    const didAnswer = myLastAnswer !== null;
    const correctCount = meta.correct_count ?? 0;
    const totalPlayers = state.player_count;
    const spec = ROUND_SPECS[state.round_index] ?? ROUND_SPECS[0];

    const revealQType = (question?.type ?? spec.type ?? "mcq") as string;
    const revealOpts = question?.options ?? [];
    const revealRawOpts = (question?.fill_options ?? question?.options ?? []) as (LText | string)[];
    const revealFillOpts: LText[] = revealRawOpts.map(toLText);

    // 1 seconde de suspense avant de montrer la bonne réponse
    if (!revealReady) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: "#020717" }}>
          <style>{CSS}</style>
          <div className="flex justify-center" style={{ animation: "champ-pulse 0.6s ease-in-out infinite" }}><Icon name="idee" size={48} color="#f59e0b" /></div>
          <p className="text-white/40 font-black text-base tracking-wide">
            {l === "fr" ? "La réponse est…" : l === "ht" ? "Repons lan se…" : l === "es" ? "La respuesta es…" : "The answer is…"}
          </p>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-amber-400/40"
                style={{ animation: `champ-pulse 0.8s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 py-10" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <AmbientFX accent={accentColor} />
        <ConfettiBurst active={showConfetti} />

        {/* Round badge */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-lg" style={{ animation: "prem-breath-icon 4s ease-in-out infinite", display: "inline-block" }}>{spec.icon}</span>
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: spec.color }}>
            {l === "fr" ? "Épreuve" : l === "ht" ? "Eprèv" : l === "es" ? "Ronda" : "Round"} {state.round_index + 1} · Q{state.question_index + 1}
          </span>
        </div>

        {/* Result card */}
        {didAnswer && (
          <div className="w-full max-w-sm rounded-3xl p-5 text-center border" style={{
            background: isCorrect ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)",
            borderColor: isCorrect ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.30)",
            animation: "champ-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
            boxShadow: isCorrect ? "0 0 30px rgba(34,197,94,0.15)" : "0 0 20px rgba(239,68,68,0.10)",
          }}>
            <div className="mb-2 flex justify-center" style={{ animation: "champ-pop 0.6s 0.1s ease both" }}>
              {isCorrect ? <Icon name="succes" size={48} color="#22c55e" /> : <Icon name="fermer" size={48} color="#ef4444" />}
            </div>
            <p className="font-black text-xl" style={{ color: isCorrect ? "#22c55e" : "#ef4444" }}>
              {isCorrect
                ? (l === "fr" ? "Bonne réponse !" : l === "ht" ? "Bon repons !" : l === "es" ? "¡Correcto!" : "Correct!")
                : (l === "fr" ? "Mauvaise réponse" : l === "ht" ? "Move repons" : l === "es" ? "Respuesta incorrecta" : "Wrong answer")}
            </p>
            {isCorrect && myLastAnswer && (
              <p className="text-green-400 font-black text-lg mt-1" style={{ animation: "champ-score-pop 0.6s 0.3s ease both" }}>
                +{myLastAnswer.points_earned} pts
              </p>
            )}
            {streak >= 3 && isCorrect && (
              <p className="text-amber-400 text-xs font-black mt-1 inline-flex items-center gap-1"><Icon name="feu" size={13} /> {streak}x {l === "fr" ? "en série !" : l === "ht" ? "an seri !" : l === "es" ? "en racha !" : "streak!"}</p>
            )}
          </div>
        )}
        {!didAnswer && (
          <div className="w-full max-w-sm rounded-3xl p-5 text-center border border-amber-400/20" style={{ background: "rgba(245,158,11,0.06)", animation: "champ-fade 0.4s ease both" }}>
            <div className="mb-2 flex justify-center"><Icon name="chrono" size={40} color="#f59e0b" /></div>
            <p className="font-black text-lg text-amber-400">{l === "fr" ? "Temps écoulé" : l === "ht" ? "Tan fin" : l === "es" ? "¡Tiempo!" : "Time's up"}</p>
          </div>
        )}

        {/* Correct answer reveal — very prominent when wrong */}
        <div className="w-full max-w-sm" style={{ animation: "champ-reveal 0.5s 0.2s ease both", opacity: 0 }}>
          {!isCorrect && (
            <p className="text-green-400 text-xs text-center font-black mb-2 uppercase tracking-widest"
              style={{ animation: "champ-pulse 1s ease-in-out 3" }}>
              ✦ {l === "fr" ? "La bonne réponse était" : l === "ht" ? "Bon repons lan te" : l === "es" ? "La respuesta correcta era" : "The correct answer was"} ✦
            </p>
          )}
          {isCorrect && (
            <p className="text-white/30 text-xs text-center mb-2 uppercase tracking-wider">
              {l === "fr" ? "Bonne réponse" : l === "ht" ? "Bon repons" : l === "es" ? "Respuesta correcta" : "Correct answer"}
            </p>
          )}

          {revealOpts.length > 0 && correctIdx !== undefined && (
            <div className="grid grid-cols-1 gap-2">
              {revealOpts.map((opt, i) => {
                const isCorrectOpt = i === correctIdx;
                const isWrongPick = !isCorrect && myLastAnswer?.answer_index === i;
                return (
                  <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-2xl border font-bold text-sm"
                    style={{
                      background: isCorrectOpt
                        ? (!isCorrect ? "rgba(34,197,94,0.22)" : "rgba(34,197,94,0.14)")
                        : isWrongPick ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)",
                      borderColor: isCorrectOpt
                        ? (!isCorrect ? "rgba(34,197,94,0.70)" : "rgba(34,197,94,0.45)")
                        : isWrongPick ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.06)",
                      color: isCorrectOpt ? "#22c55e" : isWrongPick ? "#ef4444" : "rgba(255,255,255,0.22)",
                      boxShadow: isCorrectOpt && !isCorrect ? "0 0 24px rgba(34,197,94,0.30)" : isCorrectOpt ? "0 0 12px rgba(34,197,94,0.15)" : "none",
                      transform: isCorrectOpt && !isCorrect ? "scale(1.02)" : "scale(1)",
                      animation: isCorrectOpt ? "champ-reveal-correct 0.9s 0.3s ease both" : "none",
                      fontSize: isCorrectOpt && !isCorrect ? "0.95rem" : undefined,
                    }}>
                    <span className="text-sm font-black">{isCorrectOpt ? "✓" : isWrongPick ? "✗" : "·"}</span>
                    <span className="flex-1">{t(opt, l)}</span>
                    {isCorrectOpt && !isCorrect && <span className="text-green-400 text-xs font-black shrink-0">← {l === "fr" ? "bonne réponse" : l === "ht" ? "bon repons" : l === "es" ? "respuesta correcta" : "correct answer"}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {revealFillOpts.length > 0 && revealOpts.length === 0 && correctIdx !== undefined && (
            <div className="rounded-2xl p-5 border text-center font-black text-xl"
              style={{ background: "rgba(34,197,94,0.14)", borderColor: "rgba(34,197,94,0.50)", color: "#22c55e", boxShadow: "0 0 28px rgba(34,197,94,0.22)", animation: "champ-reveal-correct 0.8s ease both" }}>
              {t(revealFillOpts[correctIdx], l)}
            </div>
          )}

          {revealOpts.length === 0 && revealFillOpts.length === 0 && meta.correct_answer && (
            <div className="rounded-2xl p-5 border text-center font-black text-xl"
              style={{ background: "rgba(34,197,94,0.14)", borderColor: "rgba(34,197,94,0.50)", color: "#22c55e", boxShadow: "0 0 28px rgba(34,197,94,0.22)", animation: "champ-reveal-correct 0.8s ease both" }}>
              {typeof meta.correct_answer === "string" ? meta.correct_answer : t(meta.correct_answer as LText, l)}
            </div>
          )}

          {/* Reveal — chrono / order_verse : show correct order */}
          {(revealQType === "chrono" || revealQType === "order_verse") && revealOpts.length === 0 && (() => {
            const rawItems = ((question as Record<string,unknown>)?.items ?? (question as Record<string,unknown>)?.fragments ?? []) as (LText | string)[];
            const correctOrder = ((question as Record<string,unknown>)?.correct_order ?? rawItems.map((_,i) => i)) as number[];
            return (
              <div className="w-full space-y-2">
                {!isCorrect && <p className="text-green-400 text-xs text-center font-black uppercase tracking-widest mb-2 shrink-0" style={{ animation: "champ-pulse 1s ease-in-out 3" }}>✦ {l === "fr" ? "Le bon ordre" : l === "ht" ? "Bon lòd la" : l === "es" ? "El orden correcto" : "The correct order"} ✦</p>}
                {correctOrder.map((idx, pos) => (
                  <div key={pos} className="flex items-center gap-3 px-4 py-3 rounded-2xl border font-bold text-sm"
                    style={{ background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)", color: "#22c55e", animation: `champ-reveal-correct 0.6s ${pos * 0.1}s ease both` }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0" style={{ background: "rgba(34,197,94,0.22)" }}>{pos+1}</span>
                    <span>{t(toLText(rawItems[idx] ?? ""), l)}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Reveal — match : show correct pairs */}
          {revealQType === "match" && revealOpts.length === 0 && (() => {
            const leftItems = ((question as Record<string,unknown>)?.left ?? []) as (LText | string)[];
            const rightItems = ((question as Record<string,unknown>)?.right ?? []) as (LText | string)[];
            const pairs = ((question as Record<string,unknown>)?.pairs ?? leftItems.map((_,i) => i)) as number[];
            return (
              <div className="w-full space-y-2">
                {!isCorrect && <p className="text-green-400 text-xs text-center font-black uppercase tracking-widest mb-2" style={{ animation: "champ-pulse 1s ease-in-out 3" }}>✦ {l === "fr" ? "Les bonnes associations" : l === "ht" ? "Bon asosiyasyon yo" : l === "es" ? "Asociaciones correctas" : "Correct matches"} ✦</p>}
                {leftItems.map((left, li) => (
                  <div key={li} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border"
                    style={{ background: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.30)", animation: `champ-reveal-correct 0.6s ${li * 0.1}s ease both` }}>
                    <span className="text-green-400 font-bold text-xs flex-1">{t(toLText(left), l)}</span>
                    <span className="text-white/25 text-xs">→</span>
                    <span className="text-green-300 font-bold text-xs flex-1 text-right">{t(toLText(rightItems[pairs[li]] ?? ""), l)}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Explanation */}
        {meta.explanation && (
          <div className="w-full max-w-sm rounded-2xl border border-white/5 p-4" style={{ background: "rgba(255,255,255,0.02)", animation: "champ-fade 0.5s 0.5s ease both", opacity: 0 }}>
            <p className="text-white/40 text-xs text-center italic">{t(meta.explanation, l)}</p>
          </div>
        )}

        {/* Stats */}
        <p className="text-white/20 text-xs" style={{ animation: "champ-fade 0.5s 0.6s ease both", opacity: 0 }}>
          {correctCount}/{totalPlayers} {l === "fr" ? "ont répondu correctement" : l === "ht" ? "reponn kòrèkteman" : l === "es" ? "respondieron correctamente" : "answered correctly"}
        </p>

        <p className="text-white/15 text-xs" style={{ animation: "champ-pulse 1.2s ease-in-out infinite" }}>
          {l === "fr" ? "Prochaine question dans quelques secondes…" : l === "ht" ? "Pwochen kesyon nan kèk segonn…" : l === "es" ? "Siguiente pregunta en unos segundos…" : "Next question in a few seconds…"}
        </p>
      </div>
    );
  }

  // ── QUESTION_ACTIVE ───────────────────────────────────────────────────────

  if (state.phase === "QUESTION_ACTIVE") {
    const question: ChampionshipQuestion | null = meta.question ?? null;
    const spec = ROUND_SPECS[state.round_index] ?? ROUND_SPECS[0];
    const totalMs = (spec.time_per_question ?? 15) * 1000;
    const pct = timeRemaining !== null ? Math.max(0, timeRemaining / totalMs) : 1;
    const secLeft = Math.ceil((timeRemaining ?? 0) / 1000);
    const qType = (question?.type ?? spec.type ?? "mcq") as string;

    const answerCount = state.answer_count ?? 0;
    const playerCount = state.player_count ?? 0;

    // ── Render answer UI ────────────────────────────────────────────────────

    function renderAnswers() {
      if (!question) return null;

      // ── TF ──────────────────────────────────────────────────────────────
      if (qType === "tf") {
        const btns = [
          { idx: 0, icon: "valider" as IconName, label: l === "fr" ? "Vrai" : l === "ht" ? "Vre" : l === "es" ? "Verdadero" : "True", color: "#22c55e" },
          { idx: 1, icon: "fermer" as IconName, label: l === "fr" ? "Faux" : l === "ht" ? "Fo" : l === "es" ? "Falso" : "False", color: "#ef4444" },
        ];
        return (
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {btns.map(btn => {
              const sel = selectedOption === btn.idx;
              const correct = alreadyAnswered && myLastAnswer?.is_correct && sel;
              const wrong = alreadyAnswered && !myLastAnswer?.is_correct && sel;
              return (
                <button key={btn.idx} onClick={() => submitAnswer(btn.idx)}
                  disabled={alreadyAnswered || submitting}
                  className="py-6 rounded-3xl border font-black text-base transition-all active:scale-95 disabled:cursor-default"
                  style={{
                    background: correct ? "rgba(34,197,94,0.18)" : wrong ? "rgba(239,68,68,0.18)" : sel ? btn.color + "15" : "rgba(255,255,255,0.04)",
                    borderColor: correct ? "#22c55e" : wrong ? "#ef4444" : sel ? btn.color : "rgba(255,255,255,0.10)",
                    color: correct ? "#22c55e" : wrong ? "#ef4444" : sel ? btn.color : "rgba(255,255,255,0.75)",
                    opacity: alreadyAnswered && !sel ? 0.35 : 1,
                  }}>
                  <span className="inline-flex items-center justify-center gap-2"><Icon name={btn.icon} size={18} />{btn.label}</span>
                </button>
              );
            })}
          </div>
        );
      }

      // ── FILL ────────────────────────────────────────────────────────────
      if (qType === "fill") {
        const verseText = t(question.verse, l) || "";
        // Split on 3+ underscores as a single blank
        const parts = verseText.split(/_{3,}/);
        const numBlanks = Math.min(parts.length - 1, 1); // always 1 blank

        // Which shuffled slots have been filled (support up to numBlanks)
        // For single blank: selectedOption is the origIdx of the chosen word
        // For simplicity, we only handle single blank with full submit on click
        const selectedLabel = selectedOption !== null
          ? (shuffledFillOpts.find(o => o.origIdx === selectedOption)?.text ?? null)
          : null;

        return (
          <div className="w-full max-w-sm space-y-5">
            {/* Verse with blank */}
            <div className="rounded-2xl border border-white/8 p-5" style={{ background: "rgba(255,255,255,0.025)" }}>
              <p className="text-white/80 text-base leading-relaxed text-center italic">
                {parts.map((part, pi) => (
                  <span key={pi}>
                    {part}
                    {pi < numBlanks && (
                      <span className="inline-flex items-center justify-center mx-1 px-3 py-0.5 rounded-lg border font-black text-sm not-italic min-w-[60px]"
                        style={{
                          background: selectedLabel && pi === 0 ? accentColor + "20" : "rgba(255,255,255,0.05)",
                          borderColor: selectedLabel && pi === 0 ? accentColor + "70" : "rgba(255,255,255,0.20)",
                          color: selectedLabel && pi === 0 ? accentColor : "rgba(255,255,255,0.30)",
                        }}>
                        {selectedLabel && pi === 0 ? t(selectedLabel, l) : "______"}
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </div>

            {/* Shuffled word chips */}
            {shuffledFillOpts.length > 0 ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {shuffledFillOpts.map((opt, si) => {
                  const isSel = selectedOption === opt.origIdx;
                  const isCorrectChoice = alreadyAnswered && myLastAnswer?.is_correct && isSel;
                  const isWrongChoice = alreadyAnswered && !myLastAnswer?.is_correct && isSel;
                  return (
                    <button key={si}
                      onClick={() => submitAnswer(opt.origIdx)}
                      disabled={alreadyAnswered || submitting}
                      className="px-5 py-2.5 rounded-full border font-bold text-sm transition-all active:scale-95 disabled:cursor-default"
                      style={{
                        background: isCorrectChoice ? "rgba(34,197,94,0.15)" : isWrongChoice ? "rgba(239,68,68,0.15)" : isSel ? accentColor + "15" : "rgba(255,255,255,0.05)",
                        borderColor: isCorrectChoice ? "#22c55e60" : isWrongChoice ? "#ef444460" : isSel ? accentColor + "80" : "rgba(255,255,255,0.15)",
                        color: isCorrectChoice ? "#22c55e" : isWrongChoice ? "#ef4444" : isSel ? accentColor : "rgba(255,255,255,0.70)",
                        opacity: alreadyAnswered && !isSel ? 0.30 : 1,
                      }}>
                      {t(opt.text, l)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button onClick={() => submitAnswer(0)} disabled={alreadyAnswered || submitting}
                className="w-full py-3 rounded-2xl border text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}>
                {l === "fr" ? "Passer →" : l === "ht" ? "Pase →" : l === "es" ? "Saltar →" : "Skip →"}
              </button>
            )}
          </div>
        );
      }

      // ── CHARACTER / LOCATION / BOOK ──────────────────────────────────────
      if (qType === "character" || qType === "location" || qType === "book") {
        const clues = question.clues ?? [];
        const isProgressive = question.progressive_clues === true;
        const shown = isProgressive ? Math.min(visibleClues, clues.length) : clues.length;
        const hasMore = isProgressive && shown < clues.length;
        const rawOpts = (question.options ?? []) as (LText | string)[];
        const opts: LText[] = rawOpts.map(toLText);
        const letters = ["A", "B", "C", "D"];
        const optColors = ["#f59e0b", "#3b82f6", "#10b981", "#ec4899"];

        return (
          <div className="w-full max-w-sm space-y-4">
            {/* Clues — revealed progressively if progressive_clues */}
            {clues.length > 0 && (
              <div className="rounded-2xl border border-white/8 divide-y divide-white/5" style={{ background: "rgba(255,255,255,0.025)" }}>
                {clues.slice(0, shown).map((clue, ci) => (
                  <div key={ci} className="flex items-start gap-3 px-4 py-3" style={{ animation: "champ-fade 0.5s ease both" }}>
                    <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: accentColor + "20", color: accentColor }}>
                      {ci + 1}
                    </span>
                    <p className="text-white/70 text-sm leading-snug">{t(clue, l)}</p>
                  </div>
                ))}
                {/* Next clue countdown row */}
                {hasMore && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.20)" }}>
                      {shown + 1}
                    </span>
                    <p className="text-white/20 text-xs italic">
                      {l === "fr" ? `Prochain indice dans ${clueCountdown}s…` : l === "ht" ? `Pwochèn endis nan ${clueCountdown}s…` : l === "es" ? `Siguiente pista en ${clueCountdown}s…` : `Next clue in ${clueCountdown}s…`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* A/B/C/D options (new format) */}
            {opts.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {opts.map((opt, i) => {
                  const sel = selectedOption === i;
                  const col = optColors[i] ?? accentColor;
                  const correct = alreadyAnswered && myLastAnswer?.is_correct && sel;
                  const wrong = alreadyAnswered && !myLastAnswer?.is_correct && sel;
                  return (
                    <button key={i} onClick={() => submitAnswer(i)}
                      disabled={alreadyAnswered || submitting}
                      className="flex items-center gap-3 py-3.5 px-4 rounded-2xl border font-bold text-sm text-left transition-all active:scale-[0.98] disabled:cursor-default"
                      style={{
                        background: correct ? "rgba(34,197,94,0.14)" : wrong ? "rgba(239,68,68,0.14)" : sel ? col + "15" : "rgba(255,255,255,0.04)",
                        borderColor: correct ? "#22c55e50" : wrong ? "#ef444450" : sel ? col + "60" : "rgba(255,255,255,0.08)",
                        color: correct ? "#22c55e" : wrong ? "#ef4444" : sel ? col : "rgba(255,255,255,0.80)",
                        opacity: alreadyAnswered && !sel ? 0.30 : 1,
                      }}>
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: sel ? col + "22" : "rgba(255,255,255,0.06)", color: sel ? col : "rgba(255,255,255,0.35)" }}>
                        {letters[i]}
                      </span>
                      <span className="flex-1 leading-snug">{t(opt, l)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Old format — no options — skip button */
              <button onClick={() => submitAnswer(0)} disabled={alreadyAnswered || submitting}
                className="w-full py-4 rounded-2xl border font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}>
                {l === "fr" ? "Passer →" : l === "ht" ? "Pase →" : l === "es" ? "Saltar →" : "Skip →"}
              </button>
            )}
          </div>
        );
      }

      // ── CHRONO / ORDER_VERSE — drag to reorder ───────────────────────────
      if (qType === "chrono" || qType === "order_verse") {
        const rawItems = (question as Record<string, unknown>)?.items as (LText | string)[] | undefined
          ?? (question as Record<string, unknown>)?.fragments as (LText | string)[] | undefined
          ?? [];
        const items: LText[] = rawItems.map(toLText);
        const correctOrder: number[] = (question as Record<string, unknown>)?.correct_order as number[] ?? items.map((_, i) => i);

        const confirmOrder = () => {
          if (alreadyAnswered || submitting) return;
          const isCorrect = orderedItems.every((origIdx, pos) => origIdx === correctOrder[pos]);
          submitAnswer(isCorrect ? 0 : 1);
        };

        const captureRects = () => {
          if (orderContainerRef.current) {
            const els = orderContainerRef.current.querySelectorAll("[data-order-item]");
            itemRectsRef.current = Array.from(els).map(el => el.getBoundingClientRect());
          }
        };

        const handleTouchStart = (pos: number) => (e: React.TouchEvent) => {
          if (alreadyAnswered) return;
          e.preventDefault();
          captureRects();
          setDragFromIdx(pos);
          setDragOverIdx(pos);
        };

        const handleTouchMove = (e: React.TouchEvent) => {
          if (dragFromIdx === null) return;
          e.preventDefault();
          const touch = e.touches[0];
          const overIdx = itemRectsRef.current.findIndex(r => touch.clientY >= r.top && touch.clientY <= r.bottom);
          if (overIdx !== -1 && overIdx !== dragOverIdx) setDragOverIdx(overIdx);
        };

        const handleTouchEnd = () => {
          if (dragFromIdx === null) return;
          const from = dragFromIdx;
          const to = dragOverIdx;
          if (to !== null && from !== to) {
            setOrderedItems(prev => {
              const a = [...prev];
              const item = a.splice(from, 1)[0];
              a.splice(to, 0, item);
              return a;
            });
          }
          setDragFromIdx(null);
          setDragOverIdx(null);
        };

        const handleMouseDown = (pos: number) => (e: React.MouseEvent) => {
          if (alreadyAnswered) return;
          e.preventDefault();
          captureRects();
          setDragFromIdx(pos);
          setDragOverIdx(pos);
        };

        const handleMouseMove = (e: React.MouseEvent) => {
          if (dragFromIdx === null) return;
          const overIdx = itemRectsRef.current.findIndex(r => e.clientY >= r.top && e.clientY <= r.bottom);
          if (overIdx !== -1 && overIdx !== dragOverIdx) setDragOverIdx(overIdx);
        };

        const handleMouseUp = () => {
          if (dragFromIdx === null) return;
          const from = dragFromIdx;
          const to = dragOverIdx;
          if (to !== null && from !== to) {
            setOrderedItems(prev => {
              const a = [...prev];
              const item = a.splice(from, 1)[0];
              a.splice(to, 0, item);
              return a;
            });
          }
          setDragFromIdx(null);
          setDragOverIdx(null);
        };

        const displayItems = orderedItems.length > 0 ? orderedItems : items.map((_, i) => i);

        return (
          <div ref={orderContainerRef} className="w-full max-w-sm space-y-3"
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}>
            {!alreadyAnswered && (
              <p className="text-center text-[11px] font-medium mb-1" style={{ color: "rgba(255,255,255,0.30)" }}>
                {l === "fr" ? "Cliquez et glissez pour réorganiser" : l === "ht" ? "Klike epi glise pou reòganize" : l === "es" ? "Haz clic y arrastra para reordenar" : "Click and drag to reorder"}
              </p>
            )}
            <div className="space-y-2">
              {displayItems.map((origIdx, pos) => {
                const isDragging = dragFromIdx === pos;
                const isOver = dragOverIdx === pos && dragFromIdx !== null && dragFromIdx !== pos;
                return (
                  <div key={origIdx}
                    data-order-item
                    onTouchStart={handleTouchStart(pos)}
                    onMouseDown={handleMouseDown(pos)}
                    className="flex items-center gap-2 touch-none select-none transition-all duration-100"
                    style={{
                      animation: `champ-answer-in 0.3s ${pos * 0.06}s ease both`,
                      opacity: isDragging ? 0.45 : 1,
                      transform: isOver ? "scale(1.025)" : "scale(1)",
                      cursor: dragFromIdx !== null ? "grabbing" : "grab",
                    }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: accentColor + "20", color: accentColor }}>{pos + 1}</span>
                    <div className="flex-1 rounded-2xl border px-4 py-3.5 font-bold text-sm text-white/80 flex items-center gap-3"
                      style={{
                        background: isDragging ? accentColor + "10" : isOver ? accentColor + "0a" : "rgba(255,255,255,0.04)",
                        borderColor: isDragging ? accentColor + "50" : isOver ? accentColor + "40" : "rgba(255,255,255,0.10)",
                        boxShadow: isOver ? `0 0 10px ${accentColor}25` : "none",
                      }}>
                      <span style={{ color: "rgba(255,255,255,0.20)", fontSize: "1.1rem", lineHeight: 1 }}>⠿</span>
                      {t(items[origIdx], l)}
                    </div>
                  </div>
                );
              })}
            </div>
            {!alreadyAnswered && (
              <button onClick={confirmOrder} disabled={submitting || dragFromIdx !== null}
                className="w-full py-4 rounded-3xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: "#020717", boxShadow: `0 0 20px ${accentColor}30` }}>
                {l === "fr" ? "Confirmer l'ordre ✓" : l === "ht" ? "Konfime lòd la ✓" : l === "es" ? "Confirmar orden ✓" : "Confirm order ✓"}
              </button>
            )}
          </div>
        );
      }

      // ── MATCH — tap left then right to pair ──────────────────────────────
      if (qType === "match") {
        const leftRaw = (question as Record<string, unknown>)?.left as (LText | string)[] ?? [];
        const rightRaw = (question as Record<string, unknown>)?.right as (LText | string)[] ?? [];
        const correctPairs: number[] = (question as Record<string, unknown>)?.pairs as number[] ?? leftRaw.map((_, i) => i);
        const leftItems: LText[] = leftRaw.map(toLText);
        const rightItems: LText[] = rightRaw.map(toLText);
        const displayRight = shuffledRight.length === rightItems.length ? shuffledRight : rightItems.map((_, i) => i);
        const allPaired = Object.keys(matchPairs).length === leftItems.length;

        const selectLeft = (i: number) => {
          if (alreadyAnswered) return;
          setMatchSelected(prev => prev === i ? null : i);
        };
        const selectRight = (rightDisplayIdx: number) => {
          if (alreadyAnswered || matchSelected === null) return;
          const rightOrigIdx = displayRight[rightDisplayIdx];
          const newPairs = { ...matchPairs, [matchSelected]: rightOrigIdx };
          setMatchPairs(newPairs);
          setMatchSelected(null);
        };
        const confirmMatch = () => {
          if (!allPaired || alreadyAnswered || submitting) return;
          const isCorrect = leftItems.every((_, li) => matchPairs[li] === correctPairs[li]);
          submitAnswer(isCorrect ? 0 : 1);
        };
        const pairColor = (li: number) => ["#f59e0b","#3b82f6","#10b981","#ec4899"][li % 4];

        return (
          <div className="w-full max-w-sm space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Left column */}
              <div className="space-y-2">
                <p className="text-white/25 text-[10px] font-black uppercase tracking-widest text-center">{l === "fr" ? "Élément" : l === "ht" ? "Eleman" : l === "es" ? "Elemento" : "Element"}</p>
                {leftItems.map((item, li) => {
                  const isPaired = matchPairs[li] !== undefined;
                  const isSelected = matchSelected === li;
                  const col = pairColor(li);
                  return (
                    <button key={li} onClick={() => selectLeft(li)} disabled={alreadyAnswered}
                      className="w-full rounded-xl px-3 py-2.5 text-xs font-bold text-left transition-all active:scale-95"
                      style={{
                        background: isSelected ? col + "22" : isPaired ? col + "12" : "rgba(255,255,255,0.04)",
                        borderWidth: 1, borderStyle: "solid",
                        borderColor: isSelected ? col : isPaired ? col + "60" : "rgba(255,255,255,0.08)",
                        color: isSelected ? col : isPaired ? col + "cc" : "rgba(255,255,255,0.70)",
                        boxShadow: isSelected ? `0 0 12px ${col}40` : "none",
                      }}>
                      {t(item, l)}
                    </button>
                  );
                })}
              </div>
              {/* Right column (shuffled) */}
              <div className="space-y-2">
                <p className="text-white/25 text-[10px] font-black uppercase tracking-widest text-center">{l === "fr" ? "Association" : l === "ht" ? "Asosiyasyon" : l === "es" ? "Asociación" : "Match"}</p>
                {displayRight.map((origIdx, di) => {
                  const pairedBy = Object.entries(matchPairs).find(([, v]) => v === origIdx);
                  const li = pairedBy ? Number(pairedBy[0]) : -1;
                  const col = li >= 0 ? pairColor(li) : "rgba(255,255,255,0.25)";
                  const isHighlight = matchSelected !== null;
                  return (
                    <button key={di} onClick={() => selectRight(di)}
                      disabled={alreadyAnswered || (pairedBy !== undefined)}
                      className="w-full rounded-xl px-3 py-2.5 text-xs font-bold text-left transition-all active:scale-95"
                      style={{
                        background: li >= 0 ? pairColor(li) + "12" : isHighlight ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                        borderWidth: 1, borderStyle: "solid",
                        borderColor: li >= 0 ? col + "60" : isHighlight ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.08)",
                        color: li >= 0 ? col + "cc" : isHighlight ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.50)",
                        opacity: pairedBy !== undefined && li < 0 ? 0.35 : 1,
                      }}>
                      {t(rightItems[origIdx], l)}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Pairs summary */}
            {Object.keys(matchPairs).length > 0 && !alreadyAnswered && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {Object.entries(matchPairs).map(([li, ri]) => (
                  <button key={li} onClick={() => { const np = { ...matchPairs }; delete np[Number(li)]; setMatchPairs(np); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: pairColor(Number(li)) + "15", border: `1px solid ${pairColor(Number(li))}40`, color: pairColor(Number(li)) + "cc" }}>
                    <span>{t(leftItems[Number(li)], l)}</span>
                    <span className="opacity-50">→</span>
                    <span>{t(rightItems[ri], l)}</span>
                    <span className="opacity-40 ml-0.5">✕</span>
                  </button>
                ))}
              </div>
            )}
            {matchSelected !== null && (
              <p className="text-center text-xs font-bold" style={{ color: pairColor(matchSelected), animation: "champ-pulse 0.8s ease-in-out infinite" }}>
                {l === "fr" ? `"${t(leftItems[matchSelected], l)}" — choisissez l'association →` : l === "ht" ? `"${t(leftItems[matchSelected], l)}" — chwazi asosiyasyon →` : l === "es" ? `"${t(leftItems[matchSelected], l)}" — elige la asociación →` : `"${t(leftItems[matchSelected], l)}" — choose the match →`}
              </p>
            )}
            {allPaired && !alreadyAnswered && (
              <button onClick={confirmMatch} disabled={submitting}
                className="w-full py-4 rounded-3xl font-black text-sm transition-all active:scale-95"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: "#020717", boxShadow: `0 0 20px ${accentColor}30` }}>
                {l === "fr" ? "Confirmer les associations ✓" : l === "ht" ? "Konfime asosiyasyon yo ✓" : l === "es" ? "Confirmar asociaciones ✓" : "Confirm matches ✓"}
              </button>
            )}
          </div>
        );
      }

      // ── MCQ / FINALE (default) ───────────────────────────────────────────
      const opts = (question.options ?? []) as (LText | string)[];
      const mcqOpts: LText[] = opts.map(toLText);
      const letters = ["A", "B", "C", "D"];
      const optColors = ["#f59e0b", "#3b82f6", "#10b981", "#ec4899"];
      return (
        <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
          {mcqOpts.map((opt, i) => {
            const sel = selectedOption === i;
            const col = optColors[i] ?? accentColor;
            const correct = alreadyAnswered && myLastAnswer?.is_correct && sel;
            const wrong = alreadyAnswered && !myLastAnswer?.is_correct && sel;
            return (
              <button key={i} onClick={() => submitAnswer(i)}
                disabled={alreadyAnswered || submitting}
                className="flex items-center gap-3 py-4 px-4 rounded-2xl border font-bold text-sm text-left active:scale-[0.97] disabled:cursor-default"
                style={{
                  background: correct ? "rgba(34,197,94,0.14)" : wrong ? "rgba(239,68,68,0.14)" : sel ? col + "15" : "rgba(255,255,255,0.04)",
                  borderColor: correct ? "#22c55e50" : wrong ? "#ef444450" : sel ? col + "60" : "rgba(255,255,255,0.08)",
                  color: correct ? "#22c55e" : wrong ? "#ef4444" : sel ? col : "rgba(255,255,255,0.80)",
                  opacity: alreadyAnswered && !sel ? 0.25 : 1,
                  transition: "all 0.2s ease",
                  animation: `champ-answer-in 0.35s ${i * 0.07}s ease both`,
                  boxShadow: sel && !alreadyAnswered ? `0 0 14px ${col}30` : "none",
                }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all"
                  style={{ background: sel ? col + "25" : "rgba(255,255,255,0.06)", color: sel ? col : "rgba(255,255,255,0.35)" }}>
                  {letters[i]}
                </span>
                <span className="flex-1 leading-snug">{t(opt, l)}</span>
                {correct && <span className="text-green-400 text-base shrink-0">✓</span>}
                {wrong && <span className="text-red-400 text-base shrink-0">✗</span>}
              </button>
            );
          })}
        </div>
      );
    }

    const qNumber = ROUND_SPECS.slice(0, state.round_index).reduce((a, r) => a + (r.questions_count || 5), 0) + state.question_index + 1;
    const qKey = `${state.round_index}_${state.question_index}`;

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <AmbientFX accent={accentColor} />
        <ConfettiBurst active={showConfetti} />
        <StreakBanner streak={streak} l={l} />
        <CoachFX qKey={qKey} qNumber={qNumber} streak={streak} lang={l} accent={accentColor} />
        <LevelBadgeFX score={myScore} streak={streak} lang={l} accent={accentColor} />
        {isAdvanced && <TeamStandingsFX contestId={id} lang={l} />}
        {isAdvanced && <MyTeamRoomFX contestId={id} lang={l} />}
        {isOrganizer && (
          <button onClick={() => togglePause("pause")} disabled={pauseBusy}
            className="fixed z-40 bottom-4 right-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-black text-xs transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "rgba(2,7,23,0.82)", backdropFilter: "blur(8px)", border: "1px solid rgba(251,191,36,0.45)", color: "#fbbf24" }}>
            ⏸ {l === "fr" ? "Pause" : l === "ht" ? "Pòz" : l === "es" ? "Pausa" : "Pause"}
          </button>
        )}
        <div className="fixed inset-0 pointer-events-none z-[1]" style={{ background: `radial-gradient(ellipse 70% 25% at 50% 0%, ${accentColor}12 0%, transparent 70%)` }} />

        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-white/5" style={{ background: "rgba(2,7,23,0.95)", backdropFilter: "blur(12px)" }}>
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
            <span className="text-xl" style={{ animation: "prem-breath-icon 4s ease-in-out infinite", display: "inline-block" }}>{spec.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-wider leading-none">
                {l === "fr" ? "Épreuve" : l === "ht" ? "Eprèv" : l === "es" ? "Ronda" : "Round"} {state.round_index + 1}/15 · Q<span key={state.question_index} style={{ display: "inline-block", animation: "champ-pop 0.4s ease both" }}>{state.question_index + 1}</span>/{spec.questions_count}
              </p>
              <div className="mt-1 h-1 rounded-full bg-white/5 overflow-visible relative">
                <div className="h-full rounded-full relative transition-all duration-700"
                  style={{ width: `${(state.question_index / spec.questions_count) * 100}%`, background: "linear-gradient(90deg, #3b82f6, #60a5fa 45%, #fbbf24 100%)", boxShadow: "0 0 8px rgba(251,191,36,0.45)" }}>
                  {state.question_index > 0 && (
                    <span style={{ position: "absolute", right: -3, top: "50%", transform: "translateY(-50%)", width: 6, height: 6, borderRadius: "50%", background: "#fde68a", boxShadow: "0 0 8px 2px rgba(251,191,36,0.85)", animation: "champ-glow-pulse 1.2s ease-in-out infinite" }} />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Icon name="etoile" size={13} className="text-white/20" />
              <AnimatedScore score={myScore} prevScore={prevScore} />
            </div>
            {myRank && <span className="text-amber-400/60 text-xs font-black">#{myRank}</span>}
            {!audioEnabled ? (
              <button onClick={enableAudio} className="text-white/20 hover:text-white/50 text-xs px-2 py-1 rounded-lg border border-white/10 transition-colors inline-flex items-center"><Icon name="audio" size={14} /></button>
            ) : (
              <button onClick={() => setShowAudioPanel(p => !p)} className="text-white/40 hover:text-white/70 text-xs px-2 py-1 rounded-lg border border-white/10 transition-colors" title={l === "fr" ? "Réglages audio" : l === "ht" ? "Réglaj son" : l === "es" ? "Configuración de audio" : "Audio settings"}>
                <Icon name="musique" size={14} />
              </button>
            )}
            <button onClick={() => setShowQuitConfirm(true)}
              className="text-white/20 hover:text-red-400/70 text-xs px-2 py-1 rounded-lg border border-white/10 hover:border-red-500/30 transition-colors ml-1">
              ✕
            </button>
          </div>
        </div>

        {/* Audio settings panel */}
        {showAudioPanel && (
          <div className="fixed top-14 right-4 z-40 rounded-2xl border border-white/10 p-4 w-64 shadow-xl" style={{ background: "rgba(10,15,40,0.95)", backdropFilter: "blur(16px)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-xs font-black uppercase tracking-wider">{l === "fr" ? "Son" : l === "ht" ? "Son" : l === "es" ? "Audio" : "Audio"}</span>
              <button onClick={() => setShowAudioPanel(false)} className="text-white/30 hover:text-white/60 text-sm">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">{l === "fr" ? "Effets" : l === "ht" ? "Efè" : l === "es" ? "Efectos" : "Effects"}</span>
                <button
                  onClick={() => {
                    const next = { ...audioPrefs, fxEnabled: !audioPrefs.fxEnabled };
                    setAudioPrefs(next);
                    saveAudioPrefs(next);
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${audioPrefs.fxEnabled ? "bg-blue-500" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${audioPrefs.fxEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">{l === "fr" ? "Musique" : l === "ht" ? "Mizik" : l === "es" ? "Música" : "Music"}</span>
                <button
                  onClick={() => {
                    const next = { ...audioPrefs, musicEnabled: !audioPrefs.musicEnabled };
                    setAudioPrefs(next);
                    saveAudioPrefs(next);
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${audioPrefs.musicEnabled ? "bg-blue-500" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${audioPrefs.musicEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/50 text-sm">{l === "fr" ? "Volume" : l === "ht" ? "Volim" : l === "es" ? "Volumen" : "Volume"}</span>
                  <span className="text-white/30 text-xs">{Math.round(audioPrefs.volume * 100)}%</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.05} value={audioPrefs.volume}
                  onChange={e => {
                    const next = { ...audioPrefs, volume: parseFloat(e.target.value) };
                    setAudioPrefs(next);
                    saveAudioPrefs(next);
                  }}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quit confirm overlay */}
        {showQuitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(2,7,23,0.88)", backdropFilter: "blur(8px)" }}>
            <div className="rounded-3xl border border-white/10 p-8 text-center max-w-xs w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="mb-4 flex justify-center"><Icon name="deconnexion" size={36} color="#e5e7eb" /></div>
              <h2 className="text-white font-black text-xl mb-2">
                {l === "fr" ? "Quitter le championnat ?" : l === "ht" ? "Kite chanpyona a ?" : l === "es" ? "¿Salir del campeonato?" : "Leave the championship?"}
              </h2>
              <p className="text-white/40 text-sm mb-6">
                {l === "fr" ? "Votre progression sera sauvegardée. Le championnat continuera pour les autres." : l === "ht" ? "Pwogresyon ou pral sovgade. Chanpyona a ap kontinye pou lòt yo." : l === "es" ? "Tu progreso se guardará. El campeonato continuará para los demás." : "Your progress is saved. The championship continues for others."}
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={() => { cleanupAll(); router.push("/dashboard"); }}
                  className="w-full py-3 rounded-2xl font-black text-sm bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors">
                  {l === "fr" ? "Oui, quitter" : l === "ht" ? "Wi, kite" : l === "es" ? "Sí, salir" : "Yes, leave"}
                </button>
                <button onClick={() => setShowQuitConfirm(false)}
                  className="w-full py-3 rounded-2xl font-bold text-sm border border-white/10 text-white/40 hover:border-white/20 transition-colors">
                  {l === "fr" ? "Continuer à jouer" : l === "ht" ? "Kontinye jwe" : l === "es" ? "Continuar jugando" : "Keep playing"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 gap-5 max-w-lg mx-auto w-full" style={{ animation: "champ-fade 0.3s ease both" }}>

          {/* Timer arc */}
          <div className="relative shrink-0" style={{
            animation: secLeft <= 5 && secLeft > 0 ? "champ-danger 0.4s ease-in-out infinite" : "none",
            filter: secLeft <= 3 ? `drop-shadow(0 0 12px ${timeColor(pct)}90)` : "none",
          }}>
            <svg width="80" height="80" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              {pct > 0 && <path d={arcPath(pct)} fill="none" stroke={timeColor(pct)} strokeWidth={secLeft <= 5 ? 6 : 4} strokeLinecap="round" style={{ transition: "stroke 0.3s, stroke-width 0.3s" }} />}
              {secLeft <= 5 && secLeft > 0 && (
                <circle cx="44" cy="44" r="36" fill="none" stroke={timeColor(pct)} strokeWidth="1" opacity="0.15" style={{ animation: "champ-glow-pulse 0.4s ease-in-out infinite" }} />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-black text-lg" style={{ color: timeColor(pct), transition: "color 0.3s" }}>{secLeft}</span>
            </div>
          </div>

          {/* Question header for character types */}
          {(qType === "character" || qType === "location" || qType === "book") && (
            <div className="text-center space-y-1">
              <p className="text-white/60 font-bold text-base">
                {qType === "character"
                  ? (l === "fr" ? "Qui est ce personnage ?" : l === "ht" ? "Ki moun sa a ye ?" : l === "es" ? "¿Quién es este personaje?" : "Who is this character?")
                  : qType === "location"
                    ? (l === "fr" ? "Quel est ce lieu ?" : l === "ht" ? "Ki kote sa a ye ?" : l === "es" ? "¿Cuál es este lugar?" : "What is this place?")
                    : (l === "fr" ? "Quel est ce livre ?" : l === "ht" ? "Ki liv sa a ye ?" : l === "es" ? "¿Qué libro es este?" : "Which book is this?")}
              </p>
              {question?.ref && (
                <p className="text-amber-400/70 text-xs font-semibold tracking-wide inline-flex items-center gap-1"><Icon name="bible" size={12} /> {t(toLText(question.ref), l)}</p>
              )}
            </div>
          )}

          {/* Question text (for non-character types) */}
          {qType !== "character" && qType !== "location" && qType !== "book" && qType !== "fill" && (
            <div className="w-full max-w-sm text-center">
              <p className="text-white font-bold text-lg leading-snug">
                {qType === "tf" && question?.statement
                  ? t(question.statement, l)
                  : question?.q
                    ? t(question.q, l)
                    : (l === "fr" ? "Question…" : l === "ht" ? "Kesyon…" : l === "es" ? "Pregunta…" : "Question…")}
              </p>
              {question?.ref && (
                <p className="text-amber-400/70 text-xs mt-2 font-semibold tracking-wide inline-flex items-center gap-1">
                  <Icon name="bible" size={12} /> {t(toLText(question.ref), l)}
                </p>
              )}
            </div>
          )}
          {qType === "fill" && (
            <div className="text-center space-y-1">
              <p className="text-white/50 text-sm">
                {l === "fr" ? "Quel mot complète ce verset ?" : l === "ht" ? "Ki mo konplete vèsèt sa a ?" : l === "es" ? "¿Qué palabra completa este versículo?" : "Which word completes this verse?"}
              </p>
              {question?.ref && (
                <p className="text-amber-400/70 text-xs font-semibold tracking-wide inline-flex items-center gap-1"><Icon name="bible" size={12} /> {t(toLText(question.ref), l)}</p>
              )}
            </div>
          )}

          {/* Answer buttons */}
          {renderAnswers()}

          {/* Grande Finale — live mini leaderboard */}
          {state.round_index === 14 && finaleLb.length > 0 && (
            <div className="w-full max-w-sm rounded-2xl border border-amber-400/15 overflow-hidden" style={{ background: "rgba(245,158,11,0.04)" }}>
              <p className="text-amber-400/40 text-[9px] font-black uppercase tracking-widest text-center py-1.5 border-b border-amber-400/10">
                <Icon name="couronne" size={11} /> {l === "fr" ? "Classement en direct" : l === "ht" ? "Klasman an dirèk" : l === "es" ? "Clasificación en vivo" : "Live ranking"}
              </p>
              <div className="divide-y divide-white/5">
                {finaleLb.map((entry, i) => {
                  const isMe = entry.rank === myRank;
                  const gapToFirst = i === 0 ? 0 : finaleLb[0].total_score - entry.total_score;
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-2"
                      style={{ background: isMe ? "rgba(245,158,11,0.08)" : "transparent", animation: `finale-rank-in 0.3s ${i * 0.06}s ease both` }}>
                      <span className="text-sm w-5 text-center shrink-0 inline-flex items-center justify-center">{i < 3 ? <Icon name="medaille" size={14} color={i === 0 ? "#c5a84f" : i === 1 ? "#c0c0c0" : "#cd7f32"} /> : `#${entry.rank}`}</span>
                      <span className="flex-1 text-xs font-bold truncate" style={{ color: isMe ? "#fbbf24" : "rgba(255,255,255,0.55)" }}>{entry.player_name}{isMe ? " ★" : ""}</span>
                      <span className="text-xs font-black" style={{ color: isMe ? "#fbbf24" : "rgba(255,255,255,0.40)" }}>{entry.total_score.toLocaleString()}</span>
                      {i > 0 && <span className="text-red-400/60 text-[10px] font-bold shrink-0">-{gapToFirst}</span>}
                    </div>
                  );
                })}
                {myRank && !finaleLb.find(e => e.rank === myRank) && (
                  <div className="flex items-center gap-2 px-3 py-2 border-t-2 border-amber-400/20" style={{ background: "rgba(245,158,11,0.06)" }}>
                    <span className="text-[10px] text-amber-400/60 w-5">#{myRank}</span>
                    <span className="flex-1 text-xs font-bold text-amber-400">{l === "fr" ? "Vous" : l === "ht" ? "Ou" : l === "es" ? "Tú" : "You"} ★</span>
                    <span className="text-xs font-black text-amber-400">{myScore.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inline feedback after answering */}
          {alreadyAnswered && myLastAnswer && (
            <div className="text-center space-y-1" style={{ animation: "champ-pop 0.35s ease both" }}>
              <p className={`font-black text-sm ${myLastAnswer.is_correct ? "text-green-400" : "text-red-400"}`}>
                {myLastAnswer.is_correct
                  ? `+${myLastAnswer.points_earned} pts ✓`
                  : (l === "fr" ? "Mauvaise réponse" : l === "ht" ? "Move repons" : l === "es" ? "Respuesta incorrecta" : "Wrong answer")}
              </p>
            </div>
          )}

          {/* Players answered progress bar */}
          {alreadyAnswered && playerCount > 0 && (
            <div className="w-full max-w-sm space-y-1.5" style={{ animation: "champ-fade 0.4s 0.2s ease both", opacity: 0 }}>
              <div className="flex justify-between items-center">
                <span className="text-white/20 text-xs">{l === "fr" ? "Joueurs ayant répondu" : l === "ht" ? "Jwè ki reponn" : l === "es" ? "Jugadores que respondieron" : "Players answered"}</span>
                <span className="text-white/30 text-xs font-black">{answerCount}/{playerCount}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (answerCount / playerCount) * 100)}%`, background: `linear-gradient(90deg, ${accentColor}99, ${accentColor})` }} />
              </div>
              <p className="text-white/15 text-xs text-center" style={{ animation: "champ-pulse 2s ease-in-out infinite" }}>
                {l === "fr" ? "En attente des autres joueurs…" : l === "ht" ? "Ap tann lòt jwè yo…" : l === "es" ? "Esperando a los demás jugadores…" : "Waiting for others…"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#020717" }}>
      <style>{CSS}</style>
      <div className="text-center space-y-2">
        <div className="w-8 h-8 mx-auto rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
        <p className="text-white/30 text-sm">{state.phase}</p>
      </div>
    </div>
  );
}
