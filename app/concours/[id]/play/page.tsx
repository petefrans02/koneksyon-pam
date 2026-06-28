"use client";

import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/LangContext";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Lang = "fr" | "ht" | "en";
type Phase =
  | "loading"
  | "round_intro"
  | "playing"
  | "submitting_round"
  | "round_results"
  | "round_transition"
  | "championship_complete";
type RoundType =
  | "mcq" | "tf" | "fill" | "match"
  | "order_verse" | "chrono" | "character"
  | "location" | "book" | "finale";

interface LText { fr: string; ht?: string; en?: string; }
function t(o: LText, l: Lang): string { return (l === "ht" ? o.ht : l === "en" ? o.en : undefined) || o.fr; }
function pad(n: number) { return String(n).padStart(2, "0"); }

interface Round {
  id: string;
  round_number: number;
  round_type: RoundType;
  title: LText;
  instructions: LText;
  color_theme: string;
  icon: string;
  time_limit_sec: number;
  points_per_q: number;
  questions: Record<string, unknown>[];
}

interface RoundResult {
  round_number: number;
  score: number;
  correct: number;
  total: number;
  time_taken_sec: number;
  accuracy: number;
  color_theme: string;
  icon: string;
  round_type?: string;
}

interface MatchState {
  selectedLeft: number | null;
  pairs: { left: number; right: number }[];
  shuffledRight: number[];
}

type OrderState = string[];

// ── Visual identity per round type ─────────────────────────────────────────
const ROUND_ACCENT: Record<string, string> = {
  mcq: "#3b82f6", tf: "#a78bfa", fill: "#22d3ee",
  match: "#fb923c", order_verse: "#4ade80", chrono: "#fbbf24",
  character: "#f472b6", location: "#2dd4bf", book: "#a16207",
  finale: "#c5a84f",
};

const ROUND_DESCRIPTION: Record<string, { fr: string; en: string; ht: string }> = {
  mcq:         { fr: "Choix multiple", en: "Multiple choice", ht: "Chwa miltip" },
  tf:          { fr: "Vrai ou Faux", en: "True or False", ht: "Vre oswa Fo" },
  fill:        { fr: "Compléter le verset", en: "Fill the verse", ht: "Konplete vèsèt la" },
  match:       { fr: "Associer les paires", en: "Match pairs", ht: "Asosye pè yo" },
  order_verse: { fr: "Remettre en ordre", en: "Put in order", ht: "Remèt nan lòd" },
  chrono:      { fr: "Ordre chronologique", en: "Chronological order", ht: "Lòd kronolojik" },
  character:   { fr: "Identifier le personnage", en: "Identify character", ht: "Idantifye pèsonaj" },
  location:    { fr: "Identifier le lieu", en: "Identify location", ht: "Idantifye kote a" },
  book:        { fr: "Reconnaître le livre", en: "Recognize the book", ht: "Rekonèt liv la" },
  finale:      { fr: "Finale — Niveau Expert", en: "Finale — Expert level", ht: "Final — Nivo Ekspè" },
};

// ── Badge system ─────────────────────────────────────────────────────────────
interface Badge { id: string; icon: string; label: string; color: string; }
const BADGE_DEF = {
  PARFAIT:  { id: "parfait",  icon: "✨", label: "Manche parfaite !",      color: "#c5a84f" },
  PROPHETE: { id: "prophete", icon: "👑", label: "Prophète de la Bible",   color: "#c5a84f" },
  ECLAIR:   { id: "eclair",   icon: "⚡", label: "Rapide comme l'éclair",  color: "#3b82f6" },
  CHAMPION: { id: "champion", icon: "🏆", label: "Champion biblique !",    color: "#c5a84f" },
};

function getMedal(accuracy: number): string {
  if (accuracy === 100) return "🥇";
  if (accuracy >= 70)  return "🥈";
  if (accuracy >= 40)  return "🥉";
  return "📖";
}

// ── Particle dots background ──────────────────────────────────────────────
function Particles({ color, count = 10 }: { color: string; count?: number }) {
  const pts = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      x: 5 + (i / count) * 90 + (Math.sin(i * 7.3) * 8),
      delay: (i * 0.37) % 2.5,
      size: 3 + (i % 4),
      dur: 2.4 + (i % 3) * 0.8,
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [count, color]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pts.map((p, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: "-8px",
            width: p.size,
            height: p.size,
            background: color,
            opacity: 0,
            animation: `kp-float ${p.dur}s ${p.delay}s ease-out infinite`,
          }} />
      ))}
    </div>
  );
}

// ── Confetti burst ────────────────────────────────────────────────────────
function ConfettiBurst({ color }: { color: string }) {
  const pieces = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      x: 30 + Math.random() * 40,
      delay: Math.random() * 0.6,
      dur: 1.2 + Math.random() * 1,
      size: 5 + Math.random() * 6,
      angle: Math.random() * 360,
      colors: [color, "#c5a84f", "#fff", "#f472b6", "#4ade80"][i % 5],
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p, i) => (
        <div key={i} className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: "40%",
            width: p.size,
            height: p.size * 0.5,
            background: p.colors,
            opacity: 0,
            transform: `rotate(${p.angle}deg)`,
            animation: `kp-confetti ${p.dur}s ${p.delay}s ease-out forwards`,
          }} />
      ))}
    </div>
  );
}

// ── Badge toast ───────────────────────────────────────────────────────────
function BadgeToast({ badge, onDone }: { badge: Badge; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl"
      style={{
        background: `${badge.color}18`,
        borderColor: `${badge.color}50`,
        animation: "kp-badge-slide 0.4s ease-out forwards",
        backdropFilter: "blur(16px)",
      }}>
      <span className="text-2xl">{badge.icon}</span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: badge.color }}>Badge débloqué</p>
        <p className="text-white text-sm font-bold">{badge.label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PlayPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [phase, setPhase] = useState<Phase>("loading");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [currentRoundResult, setCurrentRoundResult] = useState<RoundResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [collectedAnswers, setCollectedAnswers] = useState<unknown[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [matchState, setMatchState] = useState<MatchState>({ selectedLeft: null, pairs: [], shuffledRight: [] });
  const [orderState, setOrderState] = useState<OrderState>([]);
  const [availableItems, setAvailableItems] = useState<{ id: string; text: LText }[]>([]);

  const [roundTimeLeft, setRoundTimeLeft] = useState(0);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const globalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStartMs = useRef<number>(Date.now());
  const forceSubmittingRef = useRef(false);

  const [introProgress, setIntroProgress] = useState(100);
  const introRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── New: transitions & badges ──────────────────────────────────────────
  const [transitionStep, setTransitionStep] = useState<0 | 1>(0);
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const currentRound = rounds[roundIdx] ?? null;
  const currentQ = currentRound?.questions[qIdx] ?? null;

  function awardBadge(badge: Badge) {
    setEarnedBadgeIds(prev => {
      if (prev.has(badge.id)) return prev;
      const next = new Set(prev);
      next.add(badge.id);
      setActiveBadge(badge);
      return next;
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`/auth?redirect=/concours/${id}/play`); return; }

      const storedToken = sessionStorage.getItem(`kp_session_${id}`);
      let token = storedToken;
      if (!token) {
        const startRes = await fetch(`/api/contests/${id}/session/start`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
        });
        const startd = await startRes.json();
        if (!startRes.ok) {
          if (startd.error === "Already completed") { router.replace(`/concours/${id}/results`); return; }
          setError(startd.error || "Impossible de démarrer");
          return;
        }
        token = startd.session_token;
        sessionStorage.setItem(`kp_session_${id}`, token!);
      }
      setSessionToken(token);

      const [roundsRes, statsRes] = await Promise.all([
        fetch(`/api/contests/${id}/rounds`),
        fetch(`/api/contests/${id}/live-stats`),
      ]);
      const roundsData = await roundsRes.json();
      const statsData = await statsRes.json();

      if (!roundsData.rounds?.length) {
        const cd = await fetch(`/api/contests/${id}`).then(r => r.json());
        if (cd.questions?.length) { router.replace(`/concours/${id}/play-legacy`); return; }
        setError("Aucune manche disponible pour ce concours.");
        return;
      }

      setRounds(roundsData.rounds);
      if (statsData.seconds_remaining !== null) setGlobalTimeLeft(statsData.seconds_remaining);

      const myResult = await fetch(`/api/contests/${id}/my-result`).then(r => r.json()).catch(() => null);
      const completedRounds: number[] = (myResult?.session?.round_scores ?? []).map((rs: RoundResult) => rs.round_number);
      const nextRoundIdx = roundsData.rounds.findIndex((r: Round) => !completedRounds.includes(r.round_number));
      const startRoundIdx = nextRoundIdx === -1 ? roundsData.rounds.length - 1 : nextRoundIdx;
      if (myResult?.session?.score) setTotalScore(myResult.session.score);
      if (myResult?.session?.round_scores) setRoundResults(myResult.session.round_scores);

      setRoundIdx(startRoundIdx);
      setPhase("round_intro");
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Global timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (globalTimeLeft === null) return;
    globalTimerRef.current = setInterval(() => {
      setGlobalTimeLeft(prev => {
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) { clearInterval(globalTimerRef.current!); handleForceComplete(); return 0; }
        return next;
      });
    }, 1000);
    return () => { if (globalTimerRef.current) clearInterval(globalTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalTimeLeft !== null]);

  // ─── Round intro countdown ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "round_intro") return;
    setIntroProgress(100);
    let pct = 100;
    introRef.current = setInterval(() => {
      pct -= 100 / 30;
      setIntroProgress(Math.max(0, pct));
      if (pct <= 0) { clearInterval(introRef.current!); startRound(); }
    }, 100);
    return () => { if (introRef.current) clearInterval(introRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIdx]);

  // ─── Per-round timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || !currentRound) return;
    setRoundTimeLeft(currentRound.time_limit_sec);
    forceSubmittingRef.current = false;
    let remaining = currentRound.time_limit_sec;
    roundTimerRef.current = setInterval(() => {
      remaining -= 1;
      setRoundTimeLeft(remaining);
      if (remaining <= 0 && !forceSubmittingRef.current) {
        forceSubmittingRef.current = true;
        clearInterval(roundTimerRef.current!);
        submitCurrentRound(true);
      }
    }, 1000);
    return () => { if (roundTimerRef.current) clearInterval(roundTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIdx]);

  useEffect(() => { setSelectedOption(null); }, [qIdx]);

  // ─── Start round ───────────────────────────────────────────────────────
  function startRound() {
    if (!currentRound) return;
    setQIdx(0);
    setCollectedAnswers([]);
    setSelectedOption(null);
    roundStartMs.current = Date.now();

    if (currentRound.round_type === "match") {
      const q = currentRound.questions[0] as { pairs: { left: LText; right: LText }[] };
      const rightIndices = q.pairs.map((_, i) => i).sort(() => Math.random() - 0.5);
      setMatchState({ selectedLeft: null, pairs: [], shuffledRight: rightIndices });
    }
    if (currentRound.round_type === "order_verse" || currentRound.round_type === "chrono") {
      const q = currentRound.questions[0] as { parts?: { id: string; text: LText }[]; events?: { id: string; text: LText }[] };
      const items = q.parts || q.events || [];
      setAvailableItems([...items].sort(() => Math.random() - 0.5));
      setOrderState([]);
    }
    setPhase("playing");
  }

  // ─── Answer handlers ───────────────────────────────────────────────────
  function handleSimpleAnswer(optionIdx: number) {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    const newAnswers = [...collectedAnswers, optionIdx];
    setTimeout(() => {
      if (!currentRound) return;
      if (newAnswers.length >= currentRound.questions.length) {
        setCollectedAnswers(newAnswers);
        submitCurrentRound(false, newAnswers);
      } else {
        setCollectedAnswers(newAnswers);
        setQIdx(prev => prev + 1);
        setSelectedOption(null);
      }
    }, 600);
  }

  function handleTFAnswer(value: boolean) {
    if (selectedOption !== null) return;
    setSelectedOption(value ? 1 : 0);
    const newAnswers = [...collectedAnswers, value];
    setTimeout(() => {
      if (!currentRound) return;
      if (newAnswers.length >= currentRound.questions.length) {
        setCollectedAnswers(newAnswers);
        submitCurrentRound(false, newAnswers);
      } else {
        setCollectedAnswers(newAnswers);
        setQIdx(prev => prev + 1);
        setSelectedOption(null);
      }
    }, 600);
  }

  function handleMatchLeft(idx: number) {
    setMatchState(prev => ({ ...prev, selectedLeft: idx }));
  }

  function handleMatchRight(rightIdx: number) {
    if (matchState.selectedLeft === null) return;
    const leftIdx = matchState.selectedLeft;
    if (matchState.pairs.find(p => p.left === leftIdx || p.right === rightIdx)) return;
    const newPairs = [...matchState.pairs, { left: leftIdx, right: rightIdx }];
    const q = currentRound!.questions[0] as { pairs: { left: LText; right: LText }[] };
    setMatchState(prev => ({ ...prev, selectedLeft: null, pairs: newPairs }));
    if (newPairs.length >= q.pairs.length) {
      setTimeout(() => submitCurrentRound(false, newPairs), 600);
    }
  }

  function handleOrderSelect(itemId: string) {
    const newOrder = [...orderState, itemId];
    const newAvailable = availableItems.filter(i => i.id !== itemId);
    setOrderState(newOrder);
    setAvailableItems(newAvailable);
    if (newAvailable.length === 0) {
      setTimeout(() => submitCurrentRound(false, newOrder), 600);
    }
  }

  // ─── Submit round ──────────────────────────────────────────────────────
  const submitCurrentRound = useCallback(async (forced: boolean, overrideAnswers?: unknown) => {
    if (!currentRound || !sessionToken) return;
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    setPhase("submitting_round");

    const timeTakenSec = Math.round((Date.now() - roundStartMs.current) / 1000);
    const answers = overrideAnswers ?? collectedAnswers;

    let score = 0, correct = 0, total = currentRound.questions.length;
    try {
      const res = await fetch(`/api/contests/${id}/session/round-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_token: sessionToken,
          round_number: currentRound.round_number,
          answers,
          time_taken_sec: timeTakenSec,
        }),
      });
      const d = await res.json();
      score = d.score ?? 0;
      correct = d.correct ?? 0;
      total = d.total ?? currentRound.questions.length;
    } catch { /* keep zeros */ }

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const result: RoundResult = {
      round_number: currentRound.round_number,
      round_type: currentRound.round_type,
      score, correct, total,
      time_taken_sec: timeTakenSec,
      accuracy,
      color_theme: currentRound.color_theme,
      icon: currentRound.icon,
    };

    setCurrentRoundResult(result);
    setRoundResults(prev => [...prev, result]);
    setTotalScore(prev => prev + score);

    // ── Badge detection ─────────────────────────────────────────────────
    if (accuracy === 100 && total > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      if (currentRound.round_type === "finale") {
        awardBadge(BADGE_DEF.PROPHETE);
      } else {
        awardBadge(BADGE_DEF.PARFAIT);
      }
    }
    if (timeTakenSec < currentRound.time_limit_sec * 0.4 && !forced) {
      setTimeout(() => awardBadge(BADGE_DEF.ECLAIR), 800);
    }

    setPhase("round_results");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound, sessionToken, collectedAnswers, id]);

  // ─── Advance to next round ─────────────────────────────────────────────
  async function advanceToNextRound() {
    const nextIdx = roundIdx + 1;
    if (nextIdx >= rounds.length) {
      await fetch(`/api/contests/${id}/session/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_token: sessionToken }),
      });
      sessionStorage.removeItem(`kp_session_${id}`);
      awardBadge(BADGE_DEF.CHAMPION);
      setPhase("championship_complete");
      setTimeout(() => router.replace(`/concours/${id}/results`), 3200);
      return;
    }

    // Two-step transition: 2s "terminée" + 2s "préparez-vous"
    setTransitionStep(0);
    setPhase("round_transition");
    setTimeout(() => {
      setTransitionStep(1);
      setTimeout(() => {
        setRoundIdx(nextIdx);
        setPhase("round_intro");
      }, 2200);
    }, 2200);
  }

  async function handleForceComplete() {
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    await fetch(`/api/contests/${id}/session/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_token: sessionToken }),
    });
    sessionStorage.removeItem(`kp_session_${id}`);
    router.replace(`/concours/${id}/results`);
  }

  // ─── Derived values ────────────────────────────────────────────────────
  const gMin = globalTimeLeft !== null ? Math.floor(globalTimeLeft / 60) : null;
  const gSec = globalTimeLeft !== null ? globalTimeLeft % 60 : null;
  const introCountdown = introProgress > 66 ? 3 : introProgress > 33 ? 2 : 1;

  const globalTimerBadge = gMin !== null && gSec !== null ? (
    <div className={`fixed top-3 right-3 z-50 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black tabular-nums border transition-all ${
      globalTimeLeft! < 300
        ? "bg-red-500/20 border-red-500/40 text-red-300 animate-pulse"
        : "bg-black/50 border-white/10 text-white/25"
    }`} style={{ backdropFilter: "blur(8px)" }}>
      ⏰ {pad(gMin)}:{pad(gSec)}
    </div>
  ) : null;

  // CSS animations (defined once at root)
  const CSS = `
    @keyframes kp-float { 0%{opacity:.7;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-90px) scale(.4)} }
    @keyframes kp-confetti { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(180px) rotate(540deg)} }
    @keyframes kp-badge-slide { 0%{opacity:0;transform:translateX(80px) scale(.85)} 100%{opacity:1;transform:translateX(0) scale(1)} }
    @keyframes kp-bounce-in { 0%{opacity:0;transform:scale(.2) rotate(-15deg)} 60%{transform:scale(1.15) rotate(3deg)} 80%{transform:scale(.95)} 100%{opacity:1;transform:scale(1) rotate(0)} }
    @keyframes kp-fade-up { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes kp-pulse-ring { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:.5;transform:scale(1.08)} }
    @keyframes kp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes kp-slide-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes kp-num-pop { 0%{opacity:0;transform:scale(1.6)} 30%{opacity:1;transform:scale(1)} 80%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(.7)} }
    @keyframes kp-check-draw { 0%{opacity:0;transform:scale(0) rotate(-20deg)} 60%{opacity:1;transform:scale(1.2) rotate(5deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
    @keyframes kp-glow-pulse { 0%,100%{opacity:.3} 50%{opacity:.7} }
    @keyframes kp-dots { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
  `;

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: LOADING / ERROR
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "loading" || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "linear-gradient(160deg, #030d1f 0%, #020717 100%)" }}>
        <style>{CSS}</style>
        {error ? (
          <>
            <div className="text-5xl">⚠️</div>
            <p className="text-white/50 text-sm text-center max-w-xs px-5">{error}</p>
            <button onClick={() => router.replace(`/concours/${id}`)} className="text-[#c5a84f] text-sm font-bold">← Retour</button>
          </>
        ) : (
          <>
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#c5a84f]/20 flex items-center justify-center">
                <span className="text-3xl" style={{ animation: "kp-spin 3s linear infinite" }}>✝</span>
              </div>
              <div className="absolute -inset-3 rounded-full border border-[#c5a84f]/10" style={{ animation: "kp-pulse-ring 2s ease-in-out infinite" }} />
            </div>
            <div className="text-center">
              <p className="text-[#c5a84f] font-black text-xs uppercase tracking-[0.3em]">Championnat Biblique</p>
              <p className="text-white/30 text-sm mt-1">Chargement en cours...</p>
            </div>
          </>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: ROUND INTRO
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "round_intro" && currentRound) {
    const bg = currentRound.color_theme;
    const accent = ROUND_ACCENT[currentRound.round_type] ?? bg;
    const desc = ROUND_DESCRIPTION[currentRound.round_type];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${bg}28 0%, #020717 45%, #020717 100%)` }}>
        <style>{CSS}</style>
        {globalTimerBadge}
        <Particles color={accent} count={12} />

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${bg}35 0%, transparent 70%)` }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${bg}20 0%, transparent 70%)`, animation: "kp-glow-pulse 3s ease-in-out infinite" }} />

        <div className="relative z-10 flex flex-col items-center text-center gap-5 max-w-md w-full">
          {/* Round badge */}
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{ background: `${bg}18`, borderColor: `${bg}40` }}
            >
            <span className="font-black text-[10px] uppercase tracking-[0.3em]" style={{ color: bg }}>
              MANCHE {currentRound.round_number} / {rounds.length}
            </span>
          </div>

          {/* Animated icon */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${bg}30 0%, transparent 70%)`, animation: "kp-pulse-ring 2s ease-in-out infinite" }} />
            <div className="relative text-8xl md:text-9xl" style={{
              filter: `drop-shadow(0 0 24px ${bg}90)`,
              animation: "kp-bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}>
              {currentRound.icon}
            </div>
          </div>

          {/* Type label */}
          {desc && (
            <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: `${accent}cc` }}>
              {desc[l] ?? desc.fr}
            </p>
          )}

          {/* Title */}
          <h1 className="text-white font-black leading-tight"
            style={{ fontSize: "clamp(1.5rem, 5vw, 2.2rem)", animation: "kp-fade-up .5s .2s ease-out both" }}>
            {t(currentRound.title, l)}
          </h1>

          {/* Instructions */}
          <p className="text-white/55 text-sm leading-relaxed max-w-xs"
            style={{ animation: "kp-fade-up .5s .35s ease-out both" }}>
            {t(currentRound.instructions, l)}
          </p>

          {/* Info chips */}
          <div className="flex gap-2 flex-wrap justify-center mt-1"
            style={{ animation: "kp-fade-up .5s .5s ease-out both" }}>
            {[
              { icon: "❓", val: `${currentRound.questions.length} question${currentRound.questions.length > 1 ? "s" : ""}` },
              { icon: "⏱", val: `${currentRound.time_limit_sec}s` },
              { icon: "⭐", val: `${currentRound.points_per_q} pts/q` },
            ].map((chip, i) => (
              <span key={i} className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border"
                style={{ background: `${bg}15`, borderColor: `${bg}35`, color: "rgba(255,255,255,0.6)" }}>
                {chip.icon} {chip.val}
              </span>
            ))}
          </div>

          {/* Countdown number */}
          <div className="mt-4 w-16 h-16 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: `${bg}60`, background: `${bg}18` }}>
            <span key={introCountdown} className="text-white font-black text-2xl"
              style={{ animation: "kp-num-pop .9s ease forwards", color: accent }}>
              {introCountdown}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/8">
          <div className="h-full transition-none" style={{ width: `${introProgress}%`, background: `linear-gradient(90deg, ${bg}, ${accent})` }} />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: ROUND TRANSITION
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "round_transition") {
    const completedRound = rounds[roundIdx];
    const nextRound = rounds[roundIdx + 1];
    const bg = completedRound?.color_theme ?? "#c5a84f";

    if (transitionStep === 0) {
      // Step 1: "Manche terminée ✓"
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 relative overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${bg}30 0%, #020717 50%)` }}>
          <style>{CSS}</style>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 50% 40% at 50% 40%, ${bg}35 0%, transparent 70%)` }} />
          <Particles color={bg} count={14} />

          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            {/* Big checkmark */}
            <div className="text-7xl" style={{ animation: "kp-check-draw .6s cubic-bezier(.34,1.56,.64,1) forwards" }}>✓</div>

            <div style={{ animation: "kp-fade-up .4s .3s ease-out both" }}>
              <p className="font-black text-xs uppercase tracking-[0.4em] mb-2" style={{ color: `${bg}cc` }}>
                MANCHE {completedRound?.round_number} TERMINÉE
              </p>
              <p className="text-white font-black" style={{ fontSize: "clamp(1.4rem,4vw,2rem)" }}>
                {completedRound?.icon} {currentRoundResult && `+${currentRoundResult.score} pts`}
              </p>
            </div>

            {currentRoundResult && (
              <div className="flex gap-8 mt-2" style={{ animation: "kp-fade-up .4s .5s ease-out both" }}>
                <div className="text-center">
                  <p className="text-white font-black text-xl">{currentRoundResult.correct}/{currentRoundResult.total}</p>
                  <p className="text-white/30 text-[11px] uppercase tracking-wider">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-xl">{currentRoundResult.accuracy}%</p>
                  <p className="text-white/30 text-[11px] uppercase tracking-wider">Précision</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-xl">{currentRoundResult.time_taken_sec}s</p>
                  <p className="text-white/30 text-[11px] uppercase tracking-wider">Temps</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Step 2: "Préparez-vous"
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8"
        style={{ background: "#020717" }}>
        <style>{CSS}</style>

        {/* Rounds progress */}
        <div className="flex gap-2" style={{ animation: "kp-fade-up .3s ease-out both" }}>
          {rounds.map((r, i) => (
            <div key={r.id} className="w-3 h-3 rounded-full transition-all"
              style={{ background: i <= roundIdx ? r.color_theme : "rgba(255,255,255,0.1)", transform: i === roundIdx ? "scale(1.3)" : "scale(1)" }} />
          ))}
        </div>

        <div className="text-center" style={{ animation: "kp-fade-up .3s .1s ease-out both" }}>
          <p className="text-white/30 text-xs uppercase tracking-[0.3em] mb-2">
            Préparez-vous pour la prochaine épreuve
          </p>
          {nextRound && (
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="text-5xl" style={{ filter: `drop-shadow(0 0 16px ${nextRound.color_theme}70)` }}>
                {nextRound.icon}
              </div>
              <p className="text-white font-black text-lg">{t(nextRound.title, l)}</p>
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: nextRound.color_theme }}>
                {ROUND_DESCRIPTION[nextRound.round_type]?.[l] ?? ROUND_DESCRIPTION[nextRound.round_type]?.fr}
              </p>
            </div>
          )}
        </div>

        {/* Pulsing dots */}
        <div className="flex gap-2" style={{ animation: "kp-fade-up .3s .25s ease-out both" }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/30"
              style={{ animation: `kp-dots 1.2s ${i * 0.2}s ease-in-out infinite` }} />
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: SUBMITTING ROUND
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "submitting_round") {
    const bg = currentRound?.color_theme ?? "#c5a84f";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5"
        style={{ background: "#020717" }}>
        <style>{CSS}</style>
        {globalTimerBadge}
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent"
          style={{ borderColor: `${bg}60`, borderTopColor: bg, animation: "kp-spin .9s linear infinite" }} />
        <div className="text-center">
          <p className="font-black text-xs uppercase tracking-[0.3em]" style={{ color: bg }}>Calcul du score</p>
          <p className="text-white/25 text-xs mt-1">Vérification des réponses...</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: ROUND RESULTS
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "round_results" && currentRoundResult) {
    const r = currentRoundResult;
    const isLast = roundIdx >= rounds.length - 1;
    const bg = r.color_theme;
    const accent = ROUND_ACCENT[currentRound?.round_type ?? "mcq"] ?? bg;
    const medal = getMedal(r.accuracy);
    const perfect = r.accuracy === 100 && r.total > 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${bg}20 0%, #020717 50%)` }}>
        <style>{CSS}</style>
        {globalTimerBadge}
        {showConfetti && <ConfettiBurst color={bg} />}

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 50% 35% at 50% 0%, ${bg}28 0%, transparent 65%)` }} />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-5">
          {/* Medal / trophy */}
          <div className="text-center" style={{ animation: "kp-bounce-in .6s cubic-bezier(.34,1.56,.64,1) forwards" }}>
            <div className="text-6xl mb-2">{medal}</div>
            <p className="font-black text-xs uppercase tracking-[0.35em]" style={{ color: `${bg}cc` }}>
              MANCHE {r.round_number} / {rounds.length}
            </p>
            {perfect && (
              <p className="text-white font-black text-xl mt-1" style={{ animation: "kp-fade-up .4s .3s ease-out both" }}>
                PARFAIT ! ✨
              </p>
            )}
          </div>

          {/* Score card */}
          <div className="w-full rounded-3xl border p-6"
            style={{ background: `${bg}12`, borderColor: `${bg}35`, animation: "kp-fade-up .5s .2s ease-out both" }}>
            <div className="text-center mb-5">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Score de la manche</p>
              <p className="font-black tabular-nums" style={{ fontSize: "3.5rem", color: accent, lineHeight: 1 }}>
                +{r.score}
              </p>
              <p className="text-white/25 text-xs mt-1">points</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-0 divide-x divide-white/8">
              {[
                { val: `${r.correct}/${r.total}`, label: "Correct" },
                { val: `${r.time_taken_sec}s`, label: "Temps" },
                { val: `${r.accuracy}%`, label: "Précision" },
              ].map((s, i) => (
                <div key={i} className="text-center py-2 px-2">
                  <p className="text-white font-black text-lg">{s.val}</p>
                  <p className="text-white/30 text-[10px] uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Accuracy bar */}
            <div className="mt-4">
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${r.accuracy}%`, background: `linear-gradient(90deg, ${bg}, ${accent})` }} />
              </div>
            </div>
          </div>

          {/* Cumulative score + progress */}
          <div className="w-full" style={{ animation: "kp-fade-up .5s .4s ease-out both" }}>
            <div className="flex items-center justify-between px-1 mb-4">
              <p className="text-white/25 text-xs">Score total</p>
              <p className="font-black text-sm tabular-nums" style={{ color: "#c5a84f" }}>{totalScore} pts</p>
            </div>
            {/* Round progress dots with icons */}
            <div className="flex justify-center gap-3">
              {rounds.map((rnd, i) => (
                <div key={rnd.id} className="flex flex-col items-center gap-1">
                  <div className="text-base transition-all" style={{
                    opacity: i <= roundIdx ? 1 : 0.2,
                    filter: i <= roundIdx ? `drop-shadow(0 0 6px ${rnd.color_theme}80)` : "none",
                  }}>
                    {rnd.icon}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{ background: i <= roundIdx ? rnd.color_theme : "rgba(255,255,255,0.1)" }} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button onClick={advanceToNextRound}
            className="w-full py-4 rounded-2xl font-black text-sm transition-all mt-1 hover:opacity-90 active:scale-[.98]"
            style={{
              background: isLast ? "linear-gradient(135deg, #c5a84f, #d8bc5e)" : `linear-gradient(135deg, ${bg}, ${bg}cc)`,
              color: isLast ? "#030918" : "#fff",
              animation: "kp-fade-up .5s .55s ease-out both",
            }}>
            {isLast ? "🏆 Voir mon résultat final" : "Continuer →"}
          </button>
        </div>

        {/* Active badge */}
        {activeBadge && <BadgeToast badge={activeBadge} onDone={() => setActiveBadge(null)} />}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: CHAMPIONSHIP COMPLETE
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "championship_complete") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #c5a84f20 0%, #020717 40%)" }}>
        <style>{CSS}</style>
        <ConfettiBurst color="#c5a84f" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 40% at 50% 30%, #c5a84f28 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className="text-8xl" style={{ animation: "kp-bounce-in .7s cubic-bezier(.34,1.56,.64,1) forwards" }}>🏆</div>
          <div style={{ animation: "kp-fade-up .5s .4s ease-out both" }}>
            <p className="font-black text-xs uppercase tracking-[0.4em] text-[#c5a84f] mb-2">Championnat Biblique</p>
            <p className="text-white font-black" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)" }}>Terminé !</p>
          </div>
          <p className="text-[#c5a84f] font-black text-2xl tabular-nums"
            style={{ animation: "kp-fade-up .5s .6s ease-out both" }}>
            {totalScore} pts
          </p>
          <p className="text-white/20 text-xs mt-4" style={{ animation: "kp-fade-up .5s .8s ease-out both" }}>
            Redirection vers vos résultats...
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: PLAYING
  // ══════════════════════════════════════════════════════════════════════════
  if (!currentRound || !currentQ) return null;

  const bg = currentRound.color_theme;
  const accent = ROUND_ACCENT[currentRound.round_type] ?? bg;
  const roundProgress = currentRound.questions.length > 0 ? (qIdx / currentRound.questions.length) * 100 : 0;
  const timerPct = currentRound.time_limit_sec > 0 ? (roundTimeLeft / currentRound.time_limit_sec) * 100 : 100;
  const timerCritical = roundTimeLeft <= 20;
  const timerColor = timerCritical ? "#ef4444" : roundTimeLeft <= 40 ? "#f59e0b" : bg;

  // Question text helpers
  function getQText() {
    const type = currentRound!.round_type;
    if (type === "tf") return t((currentQ as { statement: LText }).statement, l);
    if (type === "fill") return t((currentQ as { verse_with_blank: LText }).verse_with_blank, l);
    if (type === "match") return l === "fr" ? "Associez chaque élément de gauche à celui de droite." : l === "ht" ? "Asosye chak eleman gòch ak sou bò dwat." : "Match each item on the left to the right.";
    if (type === "chrono") return l === "fr" ? "Remettez ces événements dans l'ordre chronologique." : l === "ht" ? "Mete evènman sa yo nan lòd kronolojik." : "Put these events in chronological order.";
    if (type === "order_verse") return l === "fr" ? "Remettez les parties de ce verset dans le bon ordre." : l === "ht" ? "Mete pati vèsèt sa a nan bon lòd." : "Put the parts of this verse in the correct order.";
    return t((currentQ as { q: LText }).q, l);
  }

  function getRef() { return (currentQ as { ref?: string }).ref ?? null; }

  // ── Answer renderers ─────────────────────────────────────────────────────
  function renderMCQOptions() {
    const opts: LText[] = (currentQ as { options: LText[] }).options ?? [];
    const letters = ["A", "B", "C", "D"];
    return (
      <div className="flex flex-col gap-3 w-full">
        {opts.map((opt, i) => {
          const isSelected = selectedOption === i;
          return (
            <button key={i} onClick={() => handleSimpleAnswer(i)}
              disabled={selectedOption !== null}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-200 disabled:cursor-default active:scale-[.98]"
              style={{
                background: isSelected ? `${bg}28` : "rgba(255,255,255,0.04)",
                borderColor: isSelected ? bg : "rgba(255,255,255,0.10)",
                opacity: selectedOption !== null && !isSelected ? 0.35 : 1,
                transform: isSelected ? "scale(1.01)" : "scale(1)",
              }}>
              <span className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-black shrink-0 transition-all"
                style={{ borderColor: isSelected ? bg : "rgba(255,255,255,0.2)", background: isSelected ? `${bg}40` : "transparent", color: isSelected ? bg : "rgba(255,255,255,0.4)" }}>
                {letters[i]}
              </span>
              <span className="font-semibold text-sm leading-snug text-white/85">{t(opt, l)}</span>
              {isSelected && <span className="ml-auto text-lg shrink-0">→</span>}
            </button>
          );
        })}
      </div>
    );
  }

  function renderTFOptions() {
    const choices = [
      { label: l === "fr" ? "VRAI" : l === "ht" ? "VRÈ" : "TRUE",  emoji: "✅", value: true,  color: "#22c55e" },
      { label: l === "fr" ? "FAUX" : l === "ht" ? "FO"  : "FALSE", emoji: "❌", value: false, color: "#ef4444" },
    ];
    return (
      <div className="flex flex-col gap-4 w-full">
        {choices.map(({ label, emoji, value, color }) => {
          const isSelected = selectedOption === (value ? 1 : 0);
          return (
            <button key={label} onClick={() => handleTFAnswer(value)}
              disabled={selectedOption !== null}
              className="w-full py-6 rounded-2xl border font-black text-xl transition-all disabled:cursor-default active:scale-[.98]"
              style={{
                background: isSelected ? `${color}22` : "rgba(255,255,255,0.04)",
                borderColor: isSelected ? color : "rgba(255,255,255,0.10)",
                color: isSelected ? color : "rgba(255,255,255,0.65)",
                transform: isSelected ? "scale(1.02)" : "scale(1)",
              }}>
              {emoji} {label}
            </button>
          );
        })}
      </div>
    );
  }

  function renderFillOptions() {
    const choices: string[] = (currentQ as { choices: string[] }).choices ?? [];
    return (
      <div className="grid grid-cols-2 gap-3 w-full">
        {choices.map((choice, i) => {
          const isSelected = selectedOption === i;
          return (
            <button key={i} onClick={() => handleSimpleAnswer(i)}
              disabled={selectedOption !== null}
              className="py-5 px-4 rounded-2xl border font-bold text-sm text-center transition-all disabled:cursor-default active:scale-[.97]"
              style={{
                background: isSelected ? `${bg}28` : "rgba(255,255,255,0.04)",
                borderColor: isSelected ? bg : "rgba(255,255,255,0.10)",
                color: isSelected ? bg : "rgba(255,255,255,0.75)",
                opacity: selectedOption !== null && !isSelected ? 0.3 : 1,
                transform: isSelected ? "scale(1.03)" : "scale(1)",
              }}>
              {choice}
            </button>
          );
        })}
      </div>
    );
  }

  function renderMatchUI() {
    const q = currentQ as { pairs: { left: LText; right: LText }[] };
    const pairColors = [bg, "#22c55e", "#f472b6", "#fbbf24"];
    function getPairColor(leftIdx: number) {
      const pair = matchState.pairs.find(p => p.left === leftIdx);
      return pair ? pairColors[matchState.pairs.indexOf(pair) % pairColors.length] : null;
    }
    function getRightPairColor(shuffledIdx: number) {
      const originalIdx = matchState.shuffledRight[shuffledIdx];
      const pair = matchState.pairs.find(p => p.right === originalIdx);
      return pair ? pairColors[matchState.pairs.indexOf(pair) % pairColors.length] : null;
    }
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="grid grid-cols-2 gap-3">
          {/* Left */}
          <div className="flex flex-col gap-2">
            <p className="text-white/25 text-[10px] uppercase tracking-[0.25em] text-center">Élément</p>
            {q.pairs.map((pair, i) => {
              const pairColor = getPairColor(i);
              const isSelected = matchState.selectedLeft === i;
              return (
                <button key={i} onClick={() => !pairColor && handleMatchLeft(i)}
                  disabled={!!pairColor}
                  className="p-3 rounded-xl border text-left text-xs font-semibold transition-all leading-snug"
                  style={{
                    background: pairColor ? `${pairColor}22` : isSelected ? `${bg}22` : "rgba(255,255,255,0.05)",
                    borderColor: pairColor ?? (isSelected ? bg : "rgba(255,255,255,0.12)"),
                    color: pairColor ?? (isSelected ? bg : "rgba(255,255,255,0.8)"),
                    boxShadow: isSelected ? `0 0 12px ${bg}40` : "none",
                  }}>
                  {t(pair.left, l)}
                </button>
              );
            })}
          </div>
          {/* Right */}
          <div className="flex flex-col gap-2">
            <p className="text-white/25 text-[10px] uppercase tracking-[0.25em] text-center">Correspond à</p>
            {matchState.shuffledRight.map((originalIdx, shuffledIdx) => {
              const pairColor = getRightPairColor(shuffledIdx);
              return (
                <button key={shuffledIdx}
                  onClick={() => !pairColor && matchState.selectedLeft !== null && handleMatchRight(originalIdx)}
                  disabled={!!pairColor || matchState.selectedLeft === null}
                  className="p-3 rounded-xl border text-left text-xs font-semibold transition-all leading-snug"
                  style={{
                    background: pairColor ? `${pairColor}22` : "rgba(255,255,255,0.05)",
                    borderColor: pairColor ?? "rgba(255,255,255,0.12)",
                    color: pairColor ?? "rgba(255,255,255,0.8)",
                    opacity: !pairColor && matchState.selectedLeft === null ? 0.45 : 1,
                  }}>
                  {t(q.pairs[originalIdx].right, l)}
                </button>
              );
            })}
          </div>
        </div>
        {matchState.selectedLeft !== null && (
          <p className="text-center text-xs mt-1" style={{ color: `${bg}cc` }}>
            → Sélectionnez l'élément correspondant à droite
          </p>
        )}
      </div>
    );
  }

  function renderOrderUI() {
    const q = currentQ as { parts?: { id: string; text: LText }[]; events?: { id: string; text: LText }[] };
    const allItems = q.parts || q.events || [];
    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Placed */}
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-[0.25em] mb-2">Votre ordre</p>
          {orderState.length === 0 ? (
            <div className="border border-dashed rounded-xl p-5 text-center text-white/15 text-xs"
              style={{ borderColor: `${bg}30` }}>
              Sélectionnez les éléments ci-dessous dans le bon ordre
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {orderState.map((itemId, i) => {
                const item = allItems.find(it => it.id === itemId);
                return item ? (
                  <div key={itemId} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ background: `${bg}12`, borderColor: `${bg}28` }}>
                    <span className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: bg, color: "#020717" }}>{i + 1}</span>
                    <span className="text-white/85 text-xs leading-snug">{t(item.text, l)}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {availableItems.length > 0 && (
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.25em] mb-2">Éléments disponibles</p>
            <div className="flex flex-col gap-2">
              {availableItems.map(item => (
                <button key={item.id} onClick={() => handleOrderSelect(item.id)}
                  className="p-3 rounded-xl border text-left text-xs font-semibold transition-all hover:opacity-80 active:scale-[.98]"
                  style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
                  {t(item.text, l)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderAnswerUI() {
    const type = currentRound!.round_type;
    if (type === "tf") return renderTFOptions();
    if (type === "fill") return renderFillOptions();
    if (type === "match") return renderMatchUI();
    if (type === "order_verse" || type === "chrono") return renderOrderUI();
    return renderMCQOptions();
  }

  const qTypeLabels: Record<string, string> = {
    match:       l === "fr" ? "Associez les paires" : l === "ht" ? "Asosye pè yo" : "Match pairs",
    order_verse: l === "fr" ? "Remettez dans l'ordre" : l === "ht" ? "Remèt nan lòd" : "Put in order",
    chrono:      l === "fr" ? "Ordre chronologique" : l === "ht" ? "Lòd kronolojik" : "Chronological order",
    character:   l === "fr" ? "Qui est ce personnage ?" : l === "ht" ? "Ki pèsonaj sa a ?" : "Who is this person?",
    location:    l === "fr" ? "Quel est ce lieu ?" : l === "ht" ? "Ki kote sa a ?" : "What is this place?",
    book:        l === "fr" ? "De quel livre s'agit-il ?" : l === "ht" ? "Ki liv sa a ?" : "Which book?",
    tf:          l === "fr" ? "Vrai ou Faux ?" : l === "ht" ? "Vre oswa Fo ?" : "True or False?",
    fill:        l === "fr" ? "Complétez le verset" : l === "ht" ? "Konplete vèsèt la" : "Fill the verse",
    mcq:         `Question ${qIdx + 1}`,
    finale:      l === "fr" ? "⚔️ Question Finale" : l === "ht" ? "⚔️ Kesyon Final" : "⚔️ Final Question",
  };
  const qTypeLabel = qTypeLabels[currentRound.round_type] ?? `Question ${qIdx + 1}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#020717" }}>
      <style>{CSS}</style>
      {globalTimerBadge}

      {/* Subtle round-colored background tint */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 30% at 50% 0%, ${bg}12 0%, transparent 60%)` }} />

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: "rgba(2,7,23,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Round icon + info */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg">{currentRound.icon}</span>
            <span className="text-white/30 text-[10px] font-bold hidden sm:block">
              Manche {currentRound.round_number}
            </span>
          </div>

          {/* Progress */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${roundProgress}%`, background: `linear-gradient(90deg, ${bg}, ${accent})` }} />
            </div>
            <span className="text-white/25 text-[11px] tabular-nums shrink-0">
              {qIdx + 1}/{currentRound.questions.length}
            </span>
          </div>

          {/* Round timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black tabular-nums shrink-0 transition-all ${timerCritical ? "animate-pulse" : ""}`}
            style={{
              background: timerCritical ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
              borderColor: timerCritical ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.10)",
              color: timerColor,
            }}>
            ⏱ {roundTimeLeft}s
          </div>

          {/* Score chip */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border shrink-0"
            style={{ background: `${bg}15`, borderColor: `${bg}30` }}>
            <span className="font-black text-xs tabular-nums" style={{ color: accent }}>{totalScore}</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-0.5 bg-white/5">
          <div className="h-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, background: timerColor, boxShadow: `0 0 8px ${timerColor}80` }} />
        </div>
      </div>

      {/* ── Question area ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl flex flex-col gap-6" key={`q-${roundIdx}-${qIdx}`}
          style={{ animation: "kp-slide-up 0.3s ease-out forwards" }}>

          {/* Question label + text */}
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] mb-3"
              style={{ color: `${accent}aa` }}>
              {qTypeLabel}
            </p>
            <p className="text-white font-bold leading-snug"
              style={{ fontSize: "clamp(1rem, 3.5vw, 1.35rem)" }}>
              {getQText()}
            </p>
            {getRef() && (
              <p className="text-white/20 text-[10px] mt-2 italic">{getRef()}</p>
            )}
          </div>

          {/* Answer UI */}
          {renderAnswerUI()}
        </div>
      </div>

      {/* Active badge toast */}
      {activeBadge && <BadgeToast badge={activeBadge} onDone={() => setActiveBadge(null)} />}
    </div>
  );
}
