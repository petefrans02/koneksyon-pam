"use client";
import HeroBackdrop from "@/app/components/HeroBackdrop";
import RequireAuth from "@/app/components/RequireAuth";
import Link from "next/link";
import { gl, gla } from "@/lib/lang-helper";

import { useLang } from "@/lib/LangContext";
import { quizLevels, QuizLevel, QuizQuestion } from "@/lib/quiz-data";
import { useState, useEffect } from "react";
import { useStickyState } from "@/lib/useStickyState";
import { supabase } from "@/lib/supabase";
import Icon, { IconName } from "@/app/components/Icon";

type Progress = Record<number, { completed: boolean; score: number; bestScore: number }>;

function getProgress(): Progress {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem("kp-quiz-progress");
  return saved ? JSON.parse(saved) : {};
}

function saveProgress(p: Progress) {
  localStorage.setItem("kp-quiz-progress", JSON.stringify(p));
}

function isUnlocked(levelId: number, progress: Progress): boolean {
  if (levelId === 1) return true;
  const prev = progress[levelId - 1];
  return prev?.completed === true;
}

// ── Défi du Jour : sélection déterministe par date depuis tout le pool ──
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function buildDailyLevel(): QuizLevel {
  const pool = quizLevels.flatMap((lv) => lv.questions);
  const day = Math.floor(Date.now() / 86_400_000); // jour depuis epoch → change chaque jour
  const questions = seededShuffle(pool, day).slice(0, 5);
  return {
    id: -1,
    title: { fr: "Défi du Jour", ht: "Defi Jou a", en: "Daily Challenge", es: "Desafío del Día" },
    description: { fr: "5 questions fraîches — nouvelles chaque jour", ht: "5 kesyon fre — nouvo chak jou", en: "5 fresh questions — new every day", es: "5 preguntas nuevas cada día" },
    icon: "feu",
    color: "from-orange-500 to-amber-500",
    requiredScore: 0,
    questions,
  } as QuizLevel;
}

function LevelSelector({ onSelect, progress }: { onSelect: (l: QuizLevel) => void; progress: Progress }) {
  const { lang } = useLang();
  const title = lang === "fr" ? "Quiz Biblique" : lang === "ht" ? "Kiz Biblik" : lang === "es" ? "Quiz Bíblico" : "Bible Quiz";
  const subtitle = lang === "fr" ? "Testez vos connaissances — niveau par niveau" : lang === "ht" ? "Teste konesans ou — nivo pa nivo" : lang === "es" ? "Pon a prueba tu conocimiento — nivel por nivel" : "Test your knowledge — level by level";

  // Défi du Jour — questions générées par IA (si dispo), sinon sélection déterministe.
  const [aiDaily, setAiDaily] = useState<QuizQuestion[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/daily-quiz").then((r) => r.json()).then((d: { questions?: QuizQuestion[] }) => {
      if (alive && Array.isArray(d.questions) && d.questions.length) setAiDaily(d.questions);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const daily = buildDailyLevel();
  if (aiDaily?.length) daily.questions = aiDaily;
  const todayStr = new Date().toLocaleDateString(lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <main className="animate-page-awaken" style={{ background: "linear-gradient(180deg, #0a1020 0%, #0d1428 100%)", minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @keyframes qzin { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform: none; } }
        .qz-daily { background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,88,12,0.07)); border: 1px solid rgba(245,158,11,0.38); transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s, border-color .3s; animation: qzin .6s cubic-bezier(.16,1,.3,1) both; }
        .qz-daily:hover { transform: translateY(-3px); border-color: rgba(245,158,11,0.65); box-shadow: 0 16px 44px rgba(245,158,11,0.22); }
        .qz-daily-glow { position:absolute; top:-40%; right:-10%; width:60%; height:180%; background: radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 60%); pointer-events:none; animation: qzGlow 4s ease-in-out infinite; }
        @keyframes qzGlow { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.95;transform:scale(1.12)} }
        .qz-daily-icon { animation: qzFloat 3s ease-in-out infinite; }
        @keyframes qzFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .qz-pulse { animation: qzPulse 1.8s ease-in-out infinite; }
        @keyframes qzPulse { 0%,100%{opacity:1} 50%{opacity:.55} }
        .qz-daily-arrow { transition: transform .3s; }
        .qz-daily:hover .qz-daily-arrow { transform: translateX(5px); }
      `}</style>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <HeroBackdrop image="/hero/quiz.jpg" tint="dark" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(200,150,15,0.14) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-14 pb-10 text-center">
          <div className="mb-4 flex justify-center select-none"><Icon name="quiz" size={56} className="text-amber-400" /></div>
          <h1 className="font-black text-white mb-2" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>{title}</h1>
          <p className="text-white/40 mt-2">{subtitle}</p>
        </div>
      </div>

      {/* ══ DÉFI DU JOUR — change chaque jour, animé ══ */}
      <div className="max-w-3xl mx-auto px-6 mb-7">
        <button onClick={() => onSelect(daily)} className="qz-daily group w-full text-left rounded-3xl p-6 relative overflow-hidden">
          <div className="qz-daily-glow" />
          <div className="relative flex items-center gap-5">
            <div className="qz-daily-icon w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shrink-0" style={{ boxShadow: "0 10px 30px rgba(245,158,11,0.4)" }}>
              <Icon name="feu" size={32} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="qz-pulse text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background: "#f59e0b", color: "#451a03" }}>
                  {lang === "fr" ? "Nouveau aujourd'hui" : lang === "ht" ? "Nouvo jodi a" : lang === "es" ? "Nuevo hoy" : "New today"}
                </span>
                <span className="text-[11px] text-white/35 capitalize">{todayStr}</span>
              </div>
              <h3 className="font-black text-white text-xl">{gl(daily.title, lang)}</h3>
              <p className="text-sm text-white/50">{gl(daily.description, lang)}</p>
            </div>
            <div className="qz-daily-arrow shrink-0 text-amber-300"><Icon name="fleche_droite" size={26} /></div>
          </div>
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-4">
        {quizLevels.map((level, i) => {
          const unlocked = isUnlocked(level.id, progress);
          const p = progress[level.id];
          return (
            <button
              key={level.id}
              onClick={() => unlocked && onSelect(level)}
              disabled={!unlocked}
              className="relative overflow-hidden w-full text-left rounded-2xl p-5 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                background: "linear-gradient(150deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.10)",
                animation: `qzin .55s cubic-bezier(.16,1,.3,1) ${i * 0.07}s both`,
              }}
              onMouseEnter={e => { if (unlocked) (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(200,150,15,0.30)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,255,255,0.10)"; }}
            >
              <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${level.color} ${!unlocked ? "opacity-30 grayscale" : ""}`} aria-hidden />
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-3xl shrink-0 ${!unlocked ? "grayscale opacity-50" : ""}`}>
                  {unlocked ? <Icon name={level.icon as IconName} size={30} /> : <Icon name="cadenas" size={28} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/35 uppercase">
                      {lang === "fr" ? "Niveau" : lang === "ht" ? "Nivo" : lang === "es" ? "Nivel" : "Level"} {level.id}
                    </span>
                    {p?.completed && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(0,170,200,0.15)", color: "#00aac8", border: "1px solid rgba(0,170,200,0.20)" }}>
                        ✓ {p.bestScore}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-lg">{gl(level.title, lang)}</h3>
                  <p className="text-sm text-white/40">{gl(level.description, lang)}</p>
                </div>
                <div className="text-white/20 text-2xl shrink-0">
                  {unlocked ? "→" : <Icon name="cadenas" size={20} />}
                </div>
              </div>
              {unlocked && !p?.completed && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: "0%", background: "rgba(200,150,15,0.50)" }} />
                  </div>
                  <span className="text-xs text-white/30">{level.questions.length} {lang === "fr" ? "questions" : lang === "ht" ? "kesyon" : lang === "es" ? "preguntas" : "questions"}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ══ CONNEXION — réviser via les études bibliques ══ */}
      <div className="max-w-2xl mx-auto mt-8 px-2">
        <Link href="/etude" className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-amber-400/40 hover:bg-white/[0.05] transition-all">
          <div className="flex items-center gap-3">
            <Icon name="cours" size={24} className="text-amber-400" />
            <div>
              <p className="text-white font-semibold text-sm">
                {lang === "fr" ? "Révisez avec les études bibliques" : lang === "ht" ? "Revize ak etid biblik yo" : lang === "es" ? "Repasa con los estudios bíblicos" : "Review with the Bible studies"}
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                {lang === "fr" ? "Approfondissez avant de relever le défi" : lang === "ht" ? "Apwofondi anvan defi a" : lang === "es" ? "Profundiza antes del desafío" : "Go deeper before the challenge"}
              </p>
            </div>
          </div>
          <span className="text-amber-400 font-bold">→</span>
        </Link>
      </div>
    </main>
  );
}

function QuizPlay({ level, onComplete }: { level: QuizLevel; onComplete: (score: number) => void }) {
  const { lang } = useLang();
  // Question en cours — mémorisée par niveau pour reprendre au même endroit après un refresh.
  const [current, setCurrent] = useStickyState(`kp:quiz:${level.id}:current`, 0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = level.questions[current];
  const total = level.questions.length;
  const progressPct = ((current + (selected !== null ? 1 : 0)) / total) * 100;

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setCorrect(correct + 1);
    setShowExplanation(true);
  }

  function next() {
    if (current + 1 >= total) {
      const score = Math.round(((correct + (selected === q.correct ? 0 : 0)) / total) * 100);
      setCurrent(0); // repartir de zéro au prochain lancement de ce niveau
      onComplete(score);
      return;
    }
    setCurrent(current + 1);
    setSelected(null);
    setShowExplanation(false);
  }

  return (
    <main className="animate-page-awaken" style={{ background: "linear-gradient(180deg, #0a1020 0%, #0d1428 100%)", minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @keyframes qpCardIn { from { opacity:0; transform: translateY(28px) scale(.98); } to { opacity:1; transform:none; } }
        @keyframes qpOptIn { from { opacity:0; transform: translateX(-16px); } to { opacity:1; transform:none; } }
        @keyframes qpExpIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes qpPop { 0%{transform:scale(1)} 40%{transform:scale(1.035)} 100%{transform:scale(1)} }
        @keyframes qpShake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .qp-card { animation: qpCardIn .5s cubic-bezier(.16,1,.3,1) both; }
        .qp-opt { opacity:0; animation: qpOptIn .42s cubic-bezier(.16,1,.3,1) both; }
        .qp-exp { animation: qpExpIn .45s cubic-bezier(.16,1,.3,1) both; }
        .qp-correct { animation: qpPop .5s ease-out; }
        .qp-wrong { animation: qpShake .45s ease-out; }
      `}</style>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon name={level.icon as IconName} size={24} />
            <div>
              <p className="text-xs font-bold text-white/30 uppercase">
                {lang === "fr" ? "Niveau" : lang === "ht" ? "Nivo" : lang === "es" ? "Nivel" : "Level"} {level.id}
              </p>
              <h2 className="font-bold text-white">{gl(level.title, lang)}</h2>
            </div>
          </div>
          <span className="text-sm font-bold text-white/40">{current + 1}/{total}</span>
        </div>

        <div className="h-2 rounded-full mb-8 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className={`h-full bg-gradient-to-r ${level.color} rounded-full transition-all duration-500`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div key={current} className="qp-card rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xl font-semibold text-white mb-6">{gl(q.question, lang)}</p>

          <div className="space-y-3">
            {gla(q.options, lang).map((opt, i) => {
              let borderColor = "rgba(255,255,255,0.10)";
              let bg = "rgba(255,255,255,0.03)";
              let opacity = 1;
              if (selected !== null) {
                if (i === q.correct) { borderColor = "rgba(0,170,200,0.60)"; bg = "rgba(0,170,200,0.10)"; }
                else if (i === selected) { borderColor = "rgba(239,68,68,0.60)"; bg = "rgba(239,68,68,0.08)"; }
                else opacity = 0.35;
              }
              const animClass = selected !== null && i === q.correct ? "qp-correct" : selected === i && i !== q.correct ? "qp-wrong" : "";
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={`qp-opt ${animClass} w-full text-left px-5 py-4 rounded-xl border-2 transition-all`}
                  style={{ borderColor, background: bg, opacity, animationDelay: `${i * 0.07}s` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={
                        selected !== null && i === q.correct ? { background: "#00aac8", color: "#fff" } :
                        selected === i && i !== q.correct ? { background: "#ef4444", color: "#fff" } :
                        { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.50)" }
                      }>
                      {selected !== null && i === q.correct ? "✓" : selected === i && i !== q.correct ? "✗" : String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-medium text-white/85">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="qp-exp mt-6 p-4 rounded-xl"
              style={selected === q.correct
                ? { background: "rgba(0,170,200,0.08)", border: "1px solid rgba(0,170,200,0.20)" }
                : { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.20)" }}>
              <p className="font-semibold text-sm mb-1" style={{ color: selected === q.correct ? "#00aac8" : "#c8960f" }}>
                {selected === q.correct
                  ? (lang === "fr" ? "✓ Excellent !" : lang === "ht" ? "✓ Ekselan !" : lang === "es" ? "✓ ¡Excelente!" : "✓ Excellent!")
                  : (lang === "fr" ? "✗ Pas tout à fait..." : lang === "ht" ? "✗ Pa tout a fè..." : lang === "es" ? "✗ No del todo..." : "✗ Not quite...")}
              </p>
              <p className="text-sm text-white/65">{gl(q.explanation, lang)}</p>
              <p className="text-xs text-white/30 mt-2 italic flex items-center gap-1"><Icon name="verset" size={12} /> {q.verse}</p>
            </div>
          )}

          {selected !== null && (
            <div className="flex gap-3 mt-6">
              {current > 0 && (
                <button
                  onClick={() => { setCurrent(current - 1); setSelected(null); setShowExplanation(false); }}
                  className="flex-1 py-3 rounded-xl font-bold transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.60)" }}
                >
                  ← {lang === "fr" ? "Précédent" : lang === "ht" ? "Anvan" : lang === "es" ? "Anterior" : "Previous"}
                </button>
              )}
              <button
                onClick={next}
                className={`flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${level.color} hover:opacity-90 transition-opacity`}
              >
                {current + 1 >= total
                  ? (lang === "fr" ? "Voir le résultat ★" : lang === "ht" ? "Wè rezilta ★" : lang === "es" ? "Ver resultado ★" : "See results ★")
                  : (lang === "fr" ? "Suivant →" : lang === "ht" ? "Swivan →" : lang === "es" ? "Siguiente →" : "Next →")}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function QuizResult({ level, score, onBack }: { level: QuizLevel; score: number; onBack: () => void }) {
  const { lang } = useLang();
  const passed = score >= level.requiredScore;

  // Compteur animé du score (0 → score)
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const confetti = ["#c8960f", "#00aac8", "#f59e0b", "#22c55e", "#e879f9", "#fff"];

  return (
    <main className="animate-page-awaken" style={{ background: "linear-gradient(180deg, #0a1020 0%, #0d1428 100%)", minHeight: "100vh", color: "#fff", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes qrTrophy { 0%{transform:scale(0) rotate(-25deg);opacity:0} 55%{transform:scale(1.18) rotate(8deg)} 75%{transform:scale(.94) rotate(-4deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes qrUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes qrConfetti { 0%{transform:translateY(-12vh) rotate(0);opacity:1} 100%{transform:translateY(112vh) rotate(720deg);opacity:.9} }
        .qr-trophy { animation: qrTrophy .8s cubic-bezier(.2,1.3,.4,1) both; }
        .qr-up { animation: qrUp .55s ease-out both; }
        .qr-confetti span { position:absolute; top:-5vh; width:9px; height:14px; border-radius:2px; animation: qrConfetti linear forwards; }
      `}</style>
      {passed && (
        <div className="qr-confetti" aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} style={{
              left: `${(i * 2.5 + (i % 5) * 3) % 100}%`,
              background: confetti[i % confetti.length],
              animationDuration: `${2.4 + (i % 6) * 0.35}s`,
              animationDelay: `${(i % 10) * 0.13}s`,
            }} />
          ))}
        </div>
      )}
      <div className="relative max-w-md mx-auto px-6 py-16 text-center">
        <span className="qr-trophy mb-4 flex justify-center">{passed ? <Icon name="trophee" size={72} color="#c8960f" /> : <Icon name="defi" size={72} color="#c8960f" />}</span>
        <h2 className="qr-up text-3xl font-bold text-white mb-2" style={{ animationDelay: ".15s" }}>
          {passed
            ? (lang === "fr" ? "Félicitations !" : lang === "ht" ? "Felisitasyon !" : lang === "es" ? "¡Felicitaciones!" : "Congratulations!")
            : (lang === "fr" ? "Bon effort !" : lang === "ht" ? "Bon efò !" : lang === "es" ? "¡Buen esfuerzo!" : "Good effort!")}
        </h2>
        <div className="inline-block text-5xl font-black my-4"
          style={{ color: passed ? "#00aac8" : "#c8960f" }}>
          {shown}%
        </div>
        <p className="text-white/40 mb-2">
          {gl(level.title, lang)} — {lang === "fr" ? "Niveau" : lang === "ht" ? "Nivo" : lang === "es" ? "Nivel" : "Level"} {level.id}
        </p>
        {passed ? (
          <p className="font-medium mb-8" style={{ color: "#00aac8" }}>
            {lang === "fr" ? `✓ Niveau suivant débloqué ! (${level.requiredScore}% requis)` : lang === "ht" ? `✓ Pwochen nivo debloke ! (${level.requiredScore}% obligatwa)` : lang === "es" ? `✓ ¡Siguiente nivel desbloqueado! (${level.requiredScore}% requerido)` : `✓ Next level unlocked! (${level.requiredScore}% required)`}
          </p>
        ) : (
          <p className="font-medium mb-8" style={{ color: "#fbbf24" }}>
            {lang === "fr" ? `Il faut ${level.requiredScore}% pour débloquer le niveau suivant. Réessaye !` : lang === "ht" ? `Ou bezwen ${level.requiredScore}% pou debloke pwochen nivo a. Eseye ankò !` : lang === "es" ? `Necesitas ${level.requiredScore}% para desbloquear el siguiente nivel. ¡Inténtalo de nuevo!` : `You need ${level.requiredScore}% to unlock the next level. Try again!`}
          </p>
        )}
        <button
          onClick={onBack}
          className={`px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${level.color} hover:opacity-90 transition-opacity`}
        >
          {lang === "fr" ? "Retour aux niveaux" : lang === "ht" ? "Retounen nan nivo yo" : lang === "es" ? "Volver a los niveles" : "Back to levels"}
        </button>
      </div>
    </main>
  );
}

export default function QuizPage() {
  const [progress, setProgress] = useState<Progress>({});
  // Niveau ouvert — mémorisé pour rester dans le quiz après un refresh.
  const [activeLevel, setActiveLevel] = useStickyState<QuizLevel | null>("kp:quiz:activeLevel", null);
  const [result, setResult] = useState<{ level: QuizLevel; score: number } | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    setProgress(getProgress());
    supabase.auth.getUser().then(async ({ data }: { data: { user: { id?: string } | null } }) => {
      if (data.user?.id) {
        setUserId(data.user.id);
        const res = await fetch(`/api/quiz-progress?user_id=${data.user.id}`);
        const dbData = await res.json();
        if (dbData.progress?.length > 0) {
          const dbProgress: Progress = {};
          for (const p of dbData.progress) {
            dbProgress[p.level_id] = { completed: p.completed, score: p.score, bestScore: p.best_score };
          }
          setProgress(dbProgress);
          saveProgress(dbProgress);
        }
      }
    });
  }, []);

  async function handleComplete(score: number) {
    if (!activeLevel) return;
    const passed = score >= activeLevel.requiredScore;
    const newProgress = { ...progress };
    const existing = newProgress[activeLevel.id];
    newProgress[activeLevel.id] = {
      completed: passed || existing?.completed || false,
      score,
      bestScore: Math.max(score, existing?.bestScore || 0),
    };
    setProgress(newProgress);
    saveProgress(newProgress);
    if (userId) {
      await fetch("/api/quiz-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, level_id: activeLevel.id, score, completed: passed || existing?.completed || false }),
      });
    }
    setResult({ level: activeLevel, score });
    setActiveLevel(null);
  }

  if (result) {
    return (
      <RequireAuth>
        <QuizResult level={result.level} score={result.score} onBack={() => setResult(null)} />
      </RequireAuth>
    );
  }

  if (activeLevel) {
    return <RequireAuth><QuizPlay level={activeLevel} onComplete={handleComplete} /></RequireAuth>;
  }

  return <RequireAuth><LevelSelector onSelect={setActiveLevel} progress={progress} /></RequireAuth>;
}
