"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ROUND_SPECS } from "@/lib/championship-rounds";
import type { ChampionshipQuestion, LText } from "@/lib/championship-types";
import Icon, { IconName } from "@/app/components/Icon";
import { AmbientFX, CoachFX, LevelBadgeFX, ImmersiveBackdrop, PREMIUM_CSS } from "@/lib/championship-premium";

type Lang = "fr" | "ht" | "en" | "es";
type Phase = "intro" | "question" | "reveal" | "round_end" | "finished";

interface Round { round_number: number; round_type: string; questions: ChampionshipQuestion[]; time_limit_sec?: number }

function tx(o: LText | string | undefined | null, l: Lang): string {
  if (!o) return "";
  if (typeof o === "string") return o;
  return o[l] || o.fr || o.en || "";
}

const DUR_INTRO = 2.8;
const DUR_REVEAL = 6.5;   // aligné sur le live corrigé
const DUR_ROUNDEND = 3.5;

function shuffleArr<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

function qType(q: ChampionshipQuestion | null, roundType: string): string {
  return (q?.type as string) || roundType || "mcq";
}
function correctIndex(q: ChampionshipQuestion, type: string): number {
  if (type === "tf") return q.is_true ? 0 : 1;
  return typeof q.correct === "number" ? q.correct : 0;
}
function options(q: ChampionshipQuestion, type: string, l: Lang): string[] {
  if (type === "tf") return [l === "en" ? "True" : l === "es" ? "Verdadero" : "Vrai", l === "en" ? "False" : l === "es" ? "Falso" : "Faux"];
  const raw = (type === "fill" ? (q.fill_options ?? q.options) : q.options) ?? [];
  return raw.map((o) => tx(o, l));
}
function promptOf(q: ChampionshipQuestion, type: string, l: Lang): { label: string; text: string; clues: string[] } {
  if (type === "tf") return { label: l === "en" ? "True or False?" : l === "es" ? "¿Verdadero o Falso?" : "Vrai ou Faux ?", text: tx(q.statement, l), clues: [] };
  if (type === "fill") return { label: l === "en" ? "Complete the verse" : l === "es" ? "Completa el versículo" : "Complète le verset", text: tx(q.verse, l), clues: [] };
  if (type === "character") return { label: l === "en" ? "Who am I?" : l === "es" ? "¿Quién soy?" : "Qui suis-je ?", text: "", clues: (q.clues ?? []).map((c) => tx(c, l)) };
  if (type === "location") return { label: l === "en" ? "Which place?" : l === "es" ? "¿Qué lugar?" : "Quel lieu ?", text: "", clues: (q.clues ?? []).map((c) => tx(c, l)) };
  if (type === "book") return { label: l === "en" ? "Which book?" : l === "es" ? "¿Qué libro?" : "Quel livre ?", text: "", clues: (q.clues ?? []).map((c) => tx(c, l)) };
  return { label: "", text: tx(q.q, l), clues: [] };
}

export default function LiveTest({ rounds, onClose, onEdit, lang = "fr", solo = false, storageKey, onFinish, noPause = false, immersive = false }: { rounds: Round[]; onClose: () => void; onEdit?: (roundIdx: number, qIdx: number) => void; lang?: Lang; solo?: boolean; storageKey?: string; onFinish?: (r: { score: number; correct: number; answered: number }) => void; noPause?: boolean; immersive?: boolean }) {
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;
  const [roundIdx, setRoundIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(DUR_INTRO);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [clueStep, setClueStep] = useState(1);
  // Ordre chronologique (chrono / order_verse) — glisser-déposer, identique au live.
  const [orderedItems, setOrderedItems] = useState<number[]>([]);
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const itemRectsRef = useRef<DOMRect[]>([]);
  const orderContainerRef = useRef<HTMLDivElement | null>(null);

  // Reprise après refresh (solo uniquement) — la progression est sauvegardée localement.
  const persistKey = solo && storageKey ? `kp:solo:${storageKey}` : null;
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!persistKey) { hydratedRef.current = true; return; }
    try {
      const raw = window.localStorage.getItem(persistKey);
      if (raw) {
        const s = JSON.parse(raw) as Record<string, unknown>;
        if (typeof s.roundIdx === "number" && typeof s.phase === "string" && s.phase !== "finished") {
          setRoundIdx(s.roundIdx as number);
          setQIdx((s.qIdx as number) ?? 0);
          setPhase(s.phase as Phase);
          setScore((s.score as number) ?? 0);
          setStreak((s.streak as number) ?? 0);
          setCorrectCount((s.correctCount as number) ?? 0);
          setAnsweredCount((s.answeredCount as number) ?? 0);
          if (Array.isArray(s.scored)) scoredRef.current = new Set(s.scored as string[]);
          const rd = rounds[s.roundIdx as number];
          const spc = ROUND_SPECS[s.roundIdx as number] ?? ROUND_SPECS[0];
          const qt = (rd?.time_limit_sec && rd.time_limit_sec > 0 ? rd.time_limit_sec : spc.time_per_question) || 15;
          setTimeLeft(s.phase === "question" ? qt : s.phase === "reveal" ? DUR_REVEAL : s.phase === "round_end" ? DUR_ROUNDEND : DUR_INTRO);
          setSelected(null);
        }
      }
    } catch { /* ignore */ }
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const round = rounds[roundIdx] ?? null;
  const spec = ROUND_SPECS[roundIdx] ?? ROUND_SPECS[0];
  const questions = round?.questions ?? [];
  const q = questions[qIdx] ?? null;
  const type = qType(q, round?.round_type ?? spec.type);
  const qTime = (round?.time_limit_sec && round.time_limit_sec > 0 ? round.time_limit_sec : spec.time_per_question) || 15;
  const totalQs = rounds.reduce((a, r) => a + (r.questions?.length ?? 0), 0);
  const globalIdx = rounds.slice(0, roundIdx).reduce((a, r) => a + (r.questions?.length ?? 0), 0) + qIdx;

  // ── Transition helpers ──────────────────────────────────────────────
  const scoredRef = useRef<Set<string>>(new Set());
  const goReveal = useCallback((explicitSel?: number | null) => {
    setPhase("reveal");
    setTimeLeft(DUR_REVEAL);
    if (q) {
      const key = `${roundIdx}-${qIdx}`;
      if (!scoredRef.current.has(key)) {
        scoredRef.current.add(key);
        const ci = correctIndex(q, type);
        const sel = explicitSel !== undefined ? explicitSel : selected;
        const isCorrect = sel !== null && sel === ci;
        setAnsweredCount((c) => c + 1);
        if (isCorrect) { setCorrectCount((c) => c + 1); setScore((s) => s + spec.base_points); setStreak((k) => k + 1); }
        else setStreak(0);
      }
    }
  }, [q, type, selected, spec.base_points, roundIdx, qIdx]);

  const advance = useCallback(() => {
    // From reveal → next question or round end
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1); setSelected(null); setClueStep(1); setPhase("question"); setTimeLeft(qTime);
    } else {
      setPhase("round_end"); setTimeLeft(DUR_ROUNDEND);
    }
  }, [qIdx, questions.length, qTime]);

  const nextRound = useCallback(() => {
    if (roundIdx + 1 < rounds.length) {
      setRoundIdx((r) => r + 1); setQIdx(0); setSelected(null); setClueStep(1); setPhase("intro"); setTimeLeft(DUR_INTRO);
    } else {
      setPhase("finished");
    }
  }, [roundIdx, rounds.length]);

  const answer = useCallback((i: number) => {
    if (phase !== "question" || selected !== null) return;
    setSelected(i);
    setTimeout(() => goReveal(i), 550);
  }, [phase, selected, goReveal]);

  const skip = useCallback(() => {
    if (phase === "question") goReveal();
    else if (phase === "reveal") advance();
    else if (phase === "intro") { setPhase("question"); setTimeLeft(qTime); }
    else if (phase === "round_end") nextRound();
  }, [phase, goReveal, advance, nextRound, qTime]);

  // Retour : recule d'une étape (navigation pour revoir).
  const goBack = useCallback(() => {
    if (phase === "reveal") { setPhase("question"); setSelected(null); setTimeLeft(qTime); return; }
    if (phase === "question") {
      if (qIdx > 0) { setQIdx((i) => i - 1); setSelected(null); setClueStep(1); setPhase("reveal"); setTimeLeft(DUR_REVEAL); return; }
      if (roundIdx > 0) {
        const pqs = rounds[roundIdx - 1]?.questions ?? [];
        setRoundIdx((r) => r - 1); setQIdx(Math.max(0, pqs.length - 1)); setSelected(null); setClueStep(1); setPhase("reveal"); setTimeLeft(DUR_REVEAL); return;
      }
      setPhase("intro"); setTimeLeft(DUR_INTRO); return;
    }
    if (phase === "intro") {
      if (roundIdx > 0) {
        const pqs = rounds[roundIdx - 1]?.questions ?? [];
        setRoundIdx((r) => r - 1); setQIdx(Math.max(0, pqs.length - 1)); setSelected(null); setClueStep(1); setPhase("reveal"); setTimeLeft(DUR_REVEAL);
      }
      return;
    }
    if (phase === "round_end") { setPhase("reveal"); setTimeLeft(DUR_REVEAL); return; }
    if (phase === "finished") { setPhase("round_end"); setTimeLeft(DUR_ROUNDEND); return; }
  }, [phase, qIdx, roundIdx, rounds, qTime]);

  const restart = useCallback(() => {
    if (persistKey) { try { window.localStorage.removeItem(persistKey); } catch { /* ignore */ } }
    scoredRef.current = new Set();
    setRoundIdx(0); setQIdx(0); setSelected(null); setClueStep(1); setScore(0); setStreak(0); setCorrectCount(0); setAnsweredCount(0); setPhase("intro"); setTimeLeft(DUR_INTRO); setPaused(false);
  }, [persistKey]);

  // Sauter directement à une manche à tester.
  const goToRound = useCallback((ri: number) => {
    setRoundIdx(ri); setQIdx(0); setSelected(null); setClueStep(1); setPhase("intro"); setTimeLeft(DUR_INTRO);
  }, []);

  // ── Ticker ──────────────────────────────────────────────────────────
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (paused || phase === "finished") return;
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const nt = +(t - 0.1).toFixed(2);
        if (nt <= 0) {
          if (phase === "intro") { setPhase("question"); return qTime; }
          if (phase === "question") { setTimeout(goReveal, 0); return 0; }
          if (phase === "reveal") { setTimeout(advance, 0); return 0; }
          if (phase === "round_end") { setTimeout(nextRound, 0); return 0; }
          return 0;
        }
        return nt;
      });
    }, 100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [phase, paused, qTime, goReveal, advance, nextRound]);

  // Progressive clues for character/location/book
  useEffect(() => {
    if (phase !== "question" || !(type === "character" || type === "location" || type === "book")) return;
    const clues = q?.clues?.length ?? 1;
    setClueStep(1);
    const iv = setInterval(() => setClueStep((s) => Math.min(clues, s + 1)), (qTime * 1000) / (clues + 1));
    return () => clearInterval(iv);
  }, [phase, type, qIdx, roundIdx, q?.clues?.length, qTime]);

  // Init de l'ordre (mélangé) quand on entre sur une question chrono/order_verse.
  useEffect(() => {
    const qq = questions[qIdx] ?? null;
    const tt = qType(qq, round?.round_type ?? spec.type);
    if (phase === "question" && qq && (tt === "chrono" || tt === "order_verse")) {
      const raw = ((qq as Record<string, unknown>).items ?? (qq as Record<string, unknown>).fragments ?? []) as unknown[];
      setOrderedItems(shuffleArr(raw.map((_, i) => i)));
      setDragFromIdx(null); setDragOverIdx(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIdx, qIdx]);

  // Sauvegarde de la progression solo (pour reprise après refresh).
  useEffect(() => {
    if (!persistKey || !hydratedRef.current) return;
    try {
      if (phase === "finished") { window.localStorage.removeItem(persistKey); return; }
      window.localStorage.setItem(persistKey, JSON.stringify({
        roundIdx, qIdx, phase, score, streak, correctCount, answeredCount, scored: [...scoredRef.current],
      }));
    } catch { /* ignore */ }
  }, [persistKey, roundIdx, qIdx, phase, score, streak, correctCount, answeredCount]);

  // Fin de partie → callback (pour enregistrer le résultat d'un match de championnat).
  const finishedRef = useRef(false);
  useEffect(() => {
    if (phase === "finished" && onFinish && !finishedRef.current) {
      finishedRef.current = true;
      onFinish({ score, correct: correctCount, answered: answeredCount });
    }
  }, [phase, onFinish, score, correctCount, answeredCount]);

  // Esc closes
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const accent = spec.color || "#c8960f";
  const ci = q ? correctIndex(q, type) : -1;
  const opts = q ? options(q, type, l) : [];
  const pr = q ? promptOf(q, type, l) : { label: "", text: "", clues: [] };
  // Éléments à ordonner (chrono / order_verse) et paires (match) — pour l'aperçu.
  const orderItems: string[] = q && (type === "chrono" || type === "order_verse")
    ? (((q as Record<string, unknown>).items ?? (q as Record<string, unknown>).fragments ?? []) as (LText | string)[]).map((o) => tx(o, l))
    : [];
  const matchLeft: string[] = q && type === "match" ? (((q as Record<string, unknown>).left ?? []) as (LText | string)[]).map((o) => tx(o, l)) : [];
  const matchRight: string[] = q && type === "match" ? (((q as Record<string, unknown>).right ?? []) as (LText | string)[]).map((o) => tx(o, l)) : [];
  const orderCorrect: number[] = q && (type === "chrono" || type === "order_verse")
    ? (((q as Record<string, unknown>).correct_order as number[]) ?? orderItems.map((_, i) => i))
    : [];
  const displayOrder = orderedItems.length > 0 ? orderedItems : orderItems.map((_, i) => i);
  const isOrderType = type === "chrono" || type === "order_verse";

  const captureRects = () => {
    if (orderContainerRef.current) {
      const els = orderContainerRef.current.querySelectorAll("[data-order-item]");
      itemRectsRef.current = Array.from(els).map((el) => el.getBoundingClientRect());
    }
  };
  const dragStart = (pos: number) => { if (phase !== "question") return; captureRects(); setDragFromIdx(pos); setDragOverIdx(pos); };
  const dragMoveY = (clientY: number) => {
    if (dragFromIdx === null) return;
    const over = itemRectsRef.current.findIndex((r) => clientY >= r.top && clientY <= r.bottom);
    if (over !== -1 && over !== dragOverIdx) setDragOverIdx(over);
  };
  const dragEnd = () => {
    if (dragFromIdx === null) return;
    const from = dragFromIdx, to = dragOverIdx;
    if (to !== null && from !== to) {
      setOrderedItems((prev) => { const a = [...prev]; const it = a.splice(from, 1)[0]; a.splice(to, 0, it); return a; });
    }
    setDragFromIdx(null); setDragOverIdx(null);
  };
  const confirmOrder = () => {
    if (phase !== "question") return;
    const ok = orderedItems.every((origIdx, pos) => origIdx === orderCorrect[pos]);
    setSelected(ok ? 0 : 1);
    goReveal(ok ? 0 : 1);
  };
  const isCorrect = selected !== null && selected === ci;
  const phaseDur = phase === "question" ? qTime : phase === "reveal" ? DUR_REVEAL : phase === "intro" ? DUR_INTRO : DUR_ROUNDEND;
  const pct = Math.max(0, Math.min(100, (timeLeft / phaseDur) * 100));

  return (
    <div style={solo
      ? { position: "relative", width: "100%", minHeight: "100vh", background: "linear-gradient(160deg,#050b18 0%,#0a1428 55%,#050b18 100%)", color: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }
      : { position: "relative", width: "100%", height: "100%", minHeight: 520, background: "linear-gradient(160deg,#050b18 0%,#0a1428 55%,#050b18 100%)", color: "#fff", display: "flex", flexDirection: "column", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      <style>{`@keyframes lt-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}} @keyframes lt-pop{0%{transform:scale(.9)}50%{transform:scale(1.04)}100%{transform:scale(1)}} @keyframes lt-glow{0%,100%{opacity:.5}50%{opacity:1}}` + PREMIUM_CSS}</style>
      {immersive && <ImmersiveBackdrop accent={accent} embedded />}
      <AmbientFX accent={accent} embedded={!solo} />
      {(phase === "question" || phase === "reveal") && (
        <>
          <CoachFX qKey={`${roundIdx}-${qIdx}`} qNumber={globalIdx + 1} streak={streak} lang={l} accent={accent} embedded={!solo} />
          <LevelBadgeFX score={score} streak={streak} lang={l} accent={accent} embedded={!solo} />
        </>
      )}

      {/* Top bar */}
      {solo ? (
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, background: "rgba(5,11,24,0.75)", backdropFilter: "blur(8px)" }}>
          <span style={{ fontSize: 16 }}>{spec.icon}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "42vw" }}>{tx(spec.name, l)}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{l === "en" ? "Round" : l === "es" ? "Ronda" : "Manche"} {roundIdx + 1}/{rounds.length} · Q{qIdx + 1}/{questions.length || "?"}</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 900, color: accent }}>{score} pts</span>
          {!noPause && <button onClick={() => setPaused((p) => !p)} style={btn(paused ? "#22c55e" : "#fbbf24")}>{paused ? "▶" : "⏸"}</button>}
          {!noPause && <button onClick={onClose} style={btn("#ef4444")}>✕</button>}
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, background: "rgba(5,11,24,0.75)", backdropFilter: "blur(8px)" }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#22c55e", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "lt-glow 1.4s ease-in-out infinite" }} /> TEST EN DIRECT
          </span>
          <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{l === "en" ? "Round:" : "Manche :"}</label>
          <select value={roundIdx} onChange={(e) => goToRound(Number(e.target.value))}
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, padding: "5px 8px", fontSize: 12, fontWeight: 700, cursor: "pointer", maxWidth: 220 }}>
            {rounds.map((r, i) => (
              <option key={i} value={i} style={{ color: "#000" }}>{i + 1}. {tx(ROUND_SPECS[i]?.name, l) || r.round_type} ({r.round_type})</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Q{qIdx + 1}/{questions.length || "?"}</span>
          <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 800 }}>{score} pts · {correctCount}/{answeredCount} ✓</span>
          {onEdit && (phase === "question" || phase === "reveal") && q && (
            <button onClick={() => { setPaused(true); onEdit(roundIdx, qIdx); }} style={btn("#f59e0b")}>✏️ {l === "en" ? "Fix" : "Corriger"}</button>
          )}
          <button onClick={goBack} style={btn("#a78bfa")}>◀ {l === "en" ? "Back" : "Retour"}</button>
          <button onClick={() => setPaused((p) => !p)} style={btn(paused ? "#22c55e" : "#fbbf24")}>{paused ? "▶ Play" : "⏸ Pause"}</button>
          <button onClick={skip} style={btn("#38bdf8")}>{l === "en" ? "Forward ▸" : "Avance ▸"}</button>
          <button onClick={restart} style={btn("#94a3b8")}>↻ {l === "en" ? "Restart" : "Recommencer"}</button>
          <button onClick={onClose} style={btn("#ef4444")}>✕ {l === "en" ? "Close" : "Fermer"}</button>
        </div>
      )}

      {/* Global progress */}
      <div style={{ position: "relative", zIndex: 2, height: 3, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${totalQs ? (globalIdx / totalQs) * 100 : 0}%`, background: "#22c55e", transition: "width .4s" }} />
      </div>

      {/* Body */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        {phase === "intro" && (
          <div style={{ textAlign: "center", animation: "lt-in .5s ease-out" }}>
            <div style={{ fontSize: 64, marginBottom: 14 }}>{spec.icon}</div>
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.28em", color: accent, textTransform: "uppercase", marginBottom: 10 }}>{l === "en" ? "Round" : l === "es" ? "Ronda" : "Manche"} {roundIdx + 1}</p>
            <h1 style={{ fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 900, marginBottom: 12, fontFamily: "'Playfair Display',Georgia,serif" }}>{tx(spec.name, l)}</h1>
            <p style={{ color: "rgba(255,255,255,0.55)", maxWidth: 520, margin: "0 auto" }}>{tx(spec.description, l)}</p>
          </div>
        )}

        {(phase === "question" || phase === "reveal") && q && (
          <div style={{ width: "100%", maxWidth: 780, animation: "lt-in .4s ease-out" }}>
            {/* Timer + type */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: accent, background: `${accent}20`, border: `1px solid ${accent}44`, padding: "4px 12px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.1em" }}>{type}</span>
              {pr.label && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{pr.label}</span>}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: phase === "question" && timeLeft <= 5 ? "#ef4444" : accent }}>{Math.ceil(timeLeft)}s</span>
              </div>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden", marginBottom: 22 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: phase === "reveal" ? "#22c55e" : accent, transition: "width .1s linear" }} />
            </div>

            {/* Prompt */}
            {pr.clues.length > 0 ? (
              <div style={{ marginBottom: 24 }}>
                {pr.clues.slice(0, phase === "reveal" ? pr.clues.length : clueStep).map((c, i) => (
                  <p key={i} style={{ fontSize: "1.05rem", lineHeight: 1.5, marginBottom: 10, padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderLeft: `3px solid ${accent}`, borderRadius: 10, animation: "lt-in .4s ease-out" }}>
                    <span style={{ color: accent, fontWeight: 900, marginRight: 8 }}>{i + 1}.</span>{c}
                  </p>
                ))}
              </div>
            ) : (
              <h2 style={{ fontSize: "clamp(1.3rem,3vw,2rem)", fontWeight: 800, lineHeight: 1.35, marginBottom: 26, fontFamily: "'Playfair Display',Georgia,serif" }}>
                {type === "fill" && phase === "reveal"
                  ? pr.text.replace(/_{2,}|___/, `【 ${opts[ci] ?? tx(q.answer_word, l)} 】`)
                  : pr.text}
              </h2>
            )}

            {/* Ordre chronologique — glisser-déposer interactif (identique au live) */}
            {isOrderType && orderItems.length > 0 && phase === "question" && (
              <div ref={orderContainerRef}
                onTouchMove={(e) => { if (dragFromIdx !== null) e.preventDefault(); dragMoveY(e.touches[0].clientY); }}
                onTouchEnd={dragEnd} onTouchCancel={dragEnd}
                onMouseMove={(e) => dragMoveY(e.clientY)} onMouseUp={dragEnd} onMouseLeave={dragEnd}
                style={{ display: "grid", gap: 10 }}>
                <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 2 }}>
                  {l === "en" ? "Click and drag to reorder" : l === "es" ? "Haz clic y arrastra para reordenar" : "Cliquez et glissez pour réorganiser"}
                </p>
                {displayOrder.map((origIdx, pos) => {
                  const isDragging = dragFromIdx === pos;
                  const isOver = dragOverIdx === pos && dragFromIdx !== null && dragFromIdx !== pos;
                  return (
                    <div key={origIdx} data-order-item
                      onTouchStart={(e) => { e.preventDefault(); dragStart(pos); }}
                      onMouseDown={(e) => { e.preventDefault(); dragStart(pos); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, touchAction: "none", userSelect: "none", opacity: isDragging ? 0.45 : 1, transform: isOver ? "scale(1.02)" : "scale(1)", cursor: dragFromIdx !== null ? "grabbing" : "grab", transition: "transform .1s" }}>
                      <span style={{ width: 26, height: 26, borderRadius: 8, background: `${accent}33`, color: accent, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>{pos + 1}</span>
                      <div style={{ flex: 1, borderRadius: 14, border: `1.5px solid ${isDragging ? accent + "55" : isOver ? accent + "44" : "rgba(255,255,255,0.12)"}`, background: isDragging ? accent + "14" : isOver ? accent + "0d" : "rgba(255,255,255,0.05)", padding: "13px 16px", fontWeight: 600, fontSize: "1rem", display: "flex", alignItems: "center", gap: 10, boxShadow: isOver ? `0 0 10px ${accent}30` : "none" }}>
                        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "1.1rem", lineHeight: 1 }}>⠿</span>
                        {orderItems[origIdx]}
                      </div>
                    </div>
                  );
                })}
                <button onClick={confirmOrder} disabled={dragFromIdx !== null}
                  style={{ marginTop: 6, width: "100%", padding: "14px", borderRadius: 18, border: "none", fontWeight: 900, fontSize: 14, cursor: "pointer", background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "#04120a", opacity: dragFromIdx !== null ? 0.5 : 1 }}>
                  {l === "en" ? "Confirm order ✓" : l === "es" ? "Confirmar orden ✓" : "Confirmer l’ordre ✓"}
                </button>
              </div>
            )}

            {/* Révélation — ordre correct */}
            {isOrderType && orderItems.length > 0 && phase === "reveal" && (
              <div style={{ display: "grid", gap: 10 }}>
                <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 800, marginBottom: 2 }}>{l === "en" ? "Correct order" : l === "es" ? "Orden correcto" : "Ordre correct"}</p>
                {orderCorrect.map((origIdx, pos) => (
                  <div key={pos} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 14, border: "1.5px solid #22c55e55", background: "rgba(34,197,94,0.10)", animation: "lt-in .35s ease-out" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: "#22c55e", color: "#04120a", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>{pos + 1}</span>
                    <span style={{ fontSize: "1rem", fontWeight: 600 }}>{orderItems[origIdx]}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Associations (match) */}
            {matchLeft.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  {matchLeft.map((it, i) => (
                    <div key={i} style={{ padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${accent}55`, background: `${accent}18`, fontSize: 14, fontWeight: 700 }}>{it}</div>
                  ))}
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {matchRight.map((it, i) => (
                    <div key={i} style={{ padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", fontSize: 14, fontWeight: 600 }}>{it}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            <div style={{ display: opts.length ? "grid" : "none", gridTemplateColumns: opts.length === 2 ? "1fr 1fr" : "1fr", gap: 12 }}>
              {opts.map((opt, i) => {
                let bg = "rgba(255,255,255,0.05)", bd = "rgba(255,255,255,0.10)", col = "#fff";
                if (phase === "reveal") {
                  if (i === ci) { bg = "rgba(34,197,94,0.16)"; bd = "#22c55e"; col = "#dcfce7"; }
                  else if (i === selected) { bg = "rgba(239,68,68,0.14)"; bd = "#ef4444"; col = "#fecaca"; }
                  else { bg = "rgba(255,255,255,0.03)"; col = "rgba(255,255,255,0.4)"; }
                } else if (i === selected) { bg = `${accent}22`; bd = accent; }
                return (
                  <button key={i} onClick={() => answer(i)} disabled={phase !== "question" || selected !== null}
                    style={{ textAlign: "left", padding: "15px 18px", borderRadius: 14, border: `1.5px solid ${bd}`, background: bg, color: col, fontSize: "1rem", fontWeight: 600, cursor: phase === "question" && selected === null ? "pointer" : "default", transition: "all .15s", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: phase === "reveal" && i === ci ? "#22c55e" : phase === "reveal" && i === selected ? "#ef4444" : "rgba(255,255,255,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
                      {phase === "reveal" && i === ci ? "✓" : phase === "reveal" && i === selected ? "✗" : String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Reveal feedback */}
            {phase === "reveal" && (
              <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 14, background: selected === null ? "rgba(148,163,184,0.10)" : isCorrect ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)", border: `1px solid ${selected === null ? "rgba(148,163,184,0.3)" : isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, animation: "lt-pop .4s ease-out" }}>
                <p style={{ fontWeight: 900, fontSize: "1rem", marginBottom: 6, color: selected === null ? "#94a3b8" : isCorrect ? "#22c55e" : "#ef4444" }}>
                  {selected === null ? (l === "en" ? "⏱ Time's up" : "⏱ Temps écoulé") : isCorrect ? (l === "en" ? "✓ Correct!" : "✓ Bonne réponse !") : (l === "en" ? "✗ Incorrect" : "✗ Mauvaise réponse")}
                  {isCorrect && <span style={{ color: "#fff", marginLeft: 10, fontWeight: 700 }}>+{spec.base_points} pts</span>}
                </p>
                {orderItems.length === 0 && matchLeft.length === 0 ? (
                  <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
                    {l === "en" ? "Answer" : l === "es" ? "Respuesta" : "Réponse"} : <b style={{ color: "#22c55e" }}>{type === "fill" ? (opts[ci] ?? tx(q.answer_word, l)) : type === "tf" ? opts[ci] : opts[ci] ?? tx(q.answer, l)}</b>
                    {q.ref && <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: 10 }}>({tx(q.ref, l)})</span>}
                  </p>
                ) : q.ref ? (
                  <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" }}>({tx(q.ref, l)})</p>
                ) : null}
                {tx(q.explanation, l) && <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.5 }}>{tx(q.explanation, l)}</p>}
              </div>
            )}
          </div>
        )}

        {phase === "round_end" && (
          <div style={{ textAlign: "center", animation: "lt-in .5s ease-out" }}>
            <div style={{ display: "inline-flex", color: accent, marginBottom: 12 }}><Icon name="valider" size={54} /></div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 8, fontFamily: "'Playfair Display',Georgia,serif" }}>{tx(spec.name, l)} ✓</h2>
            <p style={{ color: "rgba(255,255,255,0.55)" }}>{l === "en" ? "Round complete" : l === "es" ? "Ronda completada" : "Manche terminée"} · {score} pts</p>
          </div>
        )}

        {phase === "finished" && (
          <div style={{ textAlign: "center", animation: "lt-in .5s ease-out" }}>
            <div style={{ display: "inline-flex", color: "#f0c840", marginBottom: 14 }}><Icon name="trophee" size={72} /></div>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 10, fontFamily: "'Playfair Display',Georgia,serif" }}>{l === "en" ? "Test complete!" : l === "es" ? "¡Prueba completa!" : "Test terminé !"}</h1>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 24 }}>
              <div><p style={{ fontSize: "2.4rem", fontWeight: 900, color: "#22c55e" }}>{score}</p><p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>points</p></div>
              <div><p style={{ fontSize: "2.4rem", fontWeight: 900, color: "#38bdf8" }}>{answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0}%</p><p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{l === "en" ? "accuracy" : "précision"}</p></div>
              <div><p style={{ fontSize: "2.4rem", fontWeight: 900, color: "#f0c840" }}>{correctCount}/{answeredCount}</p><p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{l === "en" ? "correct" : "correctes"}</p></div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={restart} style={{ ...btn("#22c55e"), fontSize: 14, padding: "12px 26px" }}>↻ {l === "en" ? "Restart" : "Recommencer"}</button>
              <button onClick={onClose} style={{ ...btn("#94a3b8"), fontSize: 14, padding: "12px 26px" }}>{l === "en" ? "Close" : "Fermer"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function btn(color: string): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color, background: `${color}18`, border: `1px solid ${color}44`, padding: "6px 12px", borderRadius: 999, cursor: "pointer" };
}
