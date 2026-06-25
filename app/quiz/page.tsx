"use client";
import RequireAuth from "@/app/components/RequireAuth";
import { gl, gla } from "@/lib/lang-helper";

import { useLang } from "@/lib/LangContext";
import { quizLevels, QuizLevel, QuizQuestion } from "@/lib/quiz-data";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

function LevelSelector({ onSelect, progress }: { onSelect: (l: QuizLevel) => void; progress: Progress }) {
  const { lang } = useLang();
  const title = lang === "fr" ? "Quiz Biblique" : lang === "ht" ? "Kiz Biblik" : "Bible Quiz";
  const subtitle = lang === "fr" ? "Testez vos connaissances — niveau par niveau" : lang === "ht" ? "Teste konesans ou — nivo pa nivo" : "Test your knowledge — level by level";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <span className="text-5xl block mb-3">📖</span>
        <h1 className="text-3xl font-bold text-stone-900">{title}</h1>
        <p className="text-stone-500 mt-2">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {quizLevels.map((level) => {
          const unlocked = isUnlocked(level.id, progress);
          const p = progress[level.id];
          return (
            <button
              key={level.id}
              onClick={() => unlocked && onSelect(level)}
              disabled={!unlocked}
              className={`w-full text-left rounded-2xl border p-5 transition-all ${
                unlocked
                  ? "bg-white border-stone-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  : "bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-3xl shrink-0 ${!unlocked ? "grayscale" : ""}`}>
                  {unlocked ? level.icon : "🔒"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-400 uppercase">
                      {lang === "fr" ? "Niveau" : lang === "ht" ? "Nivo" : "Level"} {level.id}
                    </span>
                    {p?.completed && (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        ✓ {p.bestScore}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-stone-900 text-lg">{gl(level.title, lang)}</h3>
                  <p className="text-sm text-stone-500">{gl(level.description, lang)}</p>
                </div>
                <div className="text-stone-300 text-2xl shrink-0">
                  {unlocked ? "→" : "🔒"}
                </div>
              </div>
              {unlocked && !p?.completed && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-300 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-xs text-stone-400">{level.questions.length} {lang === "fr" ? "questions" : lang === "ht" ? "kesyon" : "questions"}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuizPlay({ level, onComplete }: { level: QuizLevel; onComplete: (score: number) => void }) {
  const { lang } = useLang();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = level.questions[current];
  const total = level.questions.length;
  const progress = ((current + (selected !== null ? 1 : 0)) / total) * 100;

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setCorrect(correct + 1);
    setShowExplanation(true);
  }

  function next() {
    if (current + 1 >= total) {
      const score = Math.round(((correct + (selected === q.correct ? 0 : 0)) / total) * 100);
      onComplete(score);
      return;
    }
    setCurrent(current + 1);
    setSelected(null);
    setShowExplanation(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{level.icon}</span>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase">
              {lang === "fr" ? "Niveau" : lang === "ht" ? "Nivo" : "Level"} {level.id}
            </p>
            <h2 className="font-bold text-stone-900">{gl(level.title, lang)}</h2>
          </div>
        </div>
        <span className="text-sm font-bold text-stone-500">{current + 1}/{total}</span>
      </div>

      <div className="h-2 bg-stone-200 rounded-full mb-8 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${level.color} rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <p className="text-xl font-semibold text-stone-900 mb-6">{gl(q.question, lang)}</p>

        <div className="space-y-3">
          {gla(q.options, lang).map((opt, i) => {
            let style = "border-stone-200 hover:border-stone-400 hover:bg-stone-50";
            if (selected !== null) {
              if (i === q.correct) style = "border-green-500 bg-green-50 shadow-md";
              else if (i === selected) style = "border-red-400 bg-red-50";
              else style = "border-stone-100 opacity-40";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${style}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    selected !== null && i === q.correct ? "bg-green-500 text-white" :
                    selected === i && i !== q.correct ? "bg-red-400 text-white" :
                    "bg-stone-100 text-stone-500"
                  }`}>
                    {selected !== null && i === q.correct ? "✓" : selected === i && i !== q.correct ? "✗" : String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-medium text-stone-800">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className={`mt-6 p-4 rounded-xl ${selected === q.correct ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
            <p className="font-semibold text-sm mb-1">
              {selected === q.correct
                ? (lang === "fr" ? "✓ Excellent !" : lang === "ht" ? "✓ Ekselan !" : "✓ Excellent!")
                : (lang === "fr" ? "✗ Pas tout à fait..." : lang === "ht" ? "✗ Pa tout a fè..." : "✗ Not quite...")}
            </p>
            <p className="text-sm text-stone-700">{gl(q.explanation, lang)}</p>
            <p className="text-xs text-stone-400 mt-2 italic">📖 {q.verse}</p>
          </div>
        )}

        {selected !== null && (
          <div className="flex gap-3 mt-6">
            {current > 0 && (
              <button
                onClick={() => { setCurrent(current - 1); setSelected(null); setShowExplanation(false); }}
                className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                ← {lang === "fr" ? "Précédent" : lang === "ht" ? "Anvan" : "Previous"}
              </button>
            )}
            <button
              onClick={next}
              className={`flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${level.color} hover:opacity-90 transition-opacity`}
            >
              {current + 1 >= total
                ? (lang === "fr" ? "Voir le résultat ★" : lang === "ht" ? "Wè rezilta ★" : "See results ★")
                : (lang === "fr" ? "Suivant →" : lang === "ht" ? "Swivan →" : "Next →")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizResult({ level, score, onBack }: { level: QuizLevel; score: number; onBack: () => void }) {
  const { lang } = useLang();
  const passed = score >= level.requiredScore;

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <span className="text-7xl block mb-4">{passed ? "🏆" : "💪"}</span>
      <h2 className="text-3xl font-bold text-stone-900 mb-2">
        {passed
          ? (lang === "fr" ? "Félicitations !" : lang === "ht" ? "Felisitasyon !" : "Congratulations!")
          : (lang === "fr" ? "Bon effort !" : lang === "ht" ? "Bon efò !" : "Good effort!")}
      </h2>
      <div className={`inline-block text-5xl font-black my-4 ${passed ? "text-green-600" : "text-amber-600"}`}>
        {score}%
      </div>
      <p className="text-stone-500 mb-2">
        {gl(level.title, lang)} — {lang === "fr" ? "Niveau" : lang === "ht" ? "Nivo" : "Level"} {level.id}
      </p>
      {passed ? (
        <p className="text-green-600 font-medium mb-8">
          {lang === "fr" ? `✓ Niveau suivant débloqué ! (${level.requiredScore}% requis)` : lang === "ht" ? `✓ Pwochen nivo debloke ! (${level.requiredScore}% obligatwa)` : `✓ Next level unlocked! (${level.requiredScore}% required)`}
        </p>
      ) : (
        <p className="text-amber-600 font-medium mb-8">
          {lang === "fr" ? `Il faut ${level.requiredScore}% pour débloquer le niveau suivant. Réessaye !` : lang === "ht" ? `Ou bezwen ${level.requiredScore}% pou debloke pwochen nivo a. Eseye ankò !` : `You need ${level.requiredScore}% to unlock the next level. Try again!`}
        </p>
      )}
      <button
        onClick={onBack}
        className={`px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${level.color} hover:opacity-90 transition-opacity`}
      >
        {lang === "fr" ? "Retour aux niveaux" : lang === "ht" ? "Retounen nan nivo yo" : "Back to levels"}
      </button>
    </div>
  );
}

export default function QuizPage() {
  const [progress, setProgress] = useState<Progress>({});
  const [activeLevel, setActiveLevel] = useState<QuizLevel | null>(null);
  const [result, setResult] = useState<{ level: QuizLevel; score: number } | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Load from localStorage first
    setProgress(getProgress());
    // Then try to load from Supabase if logged in
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
    // Save to Supabase
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
      <QuizResult
        level={result.level}
        score={result.score}
        onBack={() => setResult(null)}
      />
    );
  }

  if (activeLevel) {
    return <QuizPlay level={activeLevel} onComplete={handleComplete} />;
  }

  return <LevelSelector onSelect={setActiveLevel} progress={progress} />;
}
