"use client";

import RequireAuth from "@/app/components/RequireAuth";
import { useLang } from "@/lib/LangContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";

type Lang = "fr" | "ht" | "en";

interface Question {
  id: string;
  question_fr: string; question_ht: string; question_en: string;
  options_fr: string[]; options_ht: string[]; options_en: string[];
  reference: string;
  time_limit: number;
  order_num: number;
  correct_answer: number;
}

interface Contest {
  id: string; title: string; status: string; current_question: number;
}

interface MyParticipant {
  id: string; score: number;
  answers: { q: number; a: number; correct: boolean; time: number }[];
}

type Phase = "loading" | "waiting" | "question" | "feedback" | "done_waiting" | "voting" | "completed";

export default function ParticiperPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const params = useParams();
  const id = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myParticipant, setMyParticipant] = useState<MyParticipant | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  // Current question index the participant is answering
  const [myQIndex, setMyQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; points: number; correct_answer: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [animIn, setAnimIn] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/contests/${id}`);
    const data = await res.json();
    if (data.contest) {
      setContest(data.contest);
      setQuestions(data.questions || []);
      const mp: MyParticipant = data.myParticipant;
      setMyParticipant(mp);

      // Determine where participant is
      if (data.contest.status === "voting") { setPhase("voting"); return; }
      if (data.contest.status === "completed") { setPhase("completed"); return; }
      if (data.contest.status === "upcoming") { setPhase("waiting"); return; }

      // Active — find next unanswered question
      const answered = mp?.answers?.map((a: { q: number }) => a.q) ?? [];
      const qs: Question[] = data.questions || [];
      const nextQ = qs.findIndex((_: Question, i: number) => !answered.includes(i));
      if (nextQ === -1) {
        setPhase("done_waiting"); // all answered, wait for voting
      } else {
        setMyQIndex(nextQ);
        setPhase("question");
      }
    } else {
      setPhase("waiting");
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Realtime: contest status changes
  useEffect(() => {
    const ch = supabase.channel(`part-room-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "contests", filter: `id=eq.${id}` }, (payload) => {
        const updated = payload.new as Contest;
        setContest(prev => prev ? { ...prev, ...updated } : updated);
        if (updated.status === "voting") setPhase("voting");
        if (updated.status === "completed") setPhase("completed");
        if (updated.status === "active") load();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, load]);

  // Start timer when question phase begins
  useEffect(() => {
    if (phase !== "question") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const q = questions[myQIndex];
    if (!q) return;

    setAnimIn(false);
    const anim = setTimeout(() => setAnimIn(true), 50);

    startTimeRef.current = Date.now();
    setTimeLeft(q.time_limit || 30);
    setSelected(null);
    setResult(null);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-submit empty on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(anim);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, myQIndex]);

  // Auto-advance when time runs out without answer
  useEffect(() => {
    if (timeLeft !== 0 || phase !== "question" || result) return;
    // Time up with no answer — show timeout and advance
    setPhase("feedback");
    setResult({ correct: false, points: 0, correct_answer: questions[myQIndex]?.correct_answer ?? 0 });
    scheduleNextQuestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function scheduleNextQuestion() {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      const nextIdx = myQIndex + 1;
      if (nextIdx >= questions.length) {
        setPhase("done_waiting");
      } else {
        setMyQIndex(nextIdx);
        setPhase("question");
      }
    }, 2800);
  }

  async function submitAnswer(optIdx: number) {
    if (!contest || submitting || result || phase !== "question") return;
    const timeTaken = Date.now() - startTimeRef.current;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(optIdx);
    setSubmitting(true);
    setPhase("feedback");

    const res = await fetch(`/api/contests/${id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_index: myQIndex, answer_index: optIdx, time_taken: timeTaken }),
    });
    const data = await res.json();
    if (data.ok !== undefined) {
      setResult({ correct: data.correct, points: data.points, correct_answer: data.correct_answer });
      setMyParticipant(prev => prev ? {
        ...prev,
        score: (prev.score || 0) + (data.points || 0),
        answers: [...(prev.answers || []), { q: myQIndex, a: optIdx, correct: data.correct, time: timeTaken }],
      } : prev);
    }
    setSubmitting(false);
    scheduleNextQuestion();
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  const q = questions[myQIndex];
  const qText = q ? (q[`question_${l}` as keyof Question] as string || q.question_fr) : "";
  const qOpts = q ? (q[`options_${l}` as keyof Question] as string[] || q.options_fr) : [];
  const timerCritical = timeLeft !== null && timeLeft <= 5;
  const timerPct = q && timeLeft !== null ? (timeLeft / (q.time_limit || 30)) * 100 : 0;
  const totalAnswered = (myParticipant?.answers?.length ?? 0);
  const totalScore = myParticipant?.score ?? 0;

  const txt = {
    score: l === "fr" ? "Score" : "Pwen",
    pts: l === "fr" ? "pts" : "pwen",
    q: l === "fr" ? "Question" : "Kesyon",
    of: l === "fr" ? "sur" : "sou",
    correct: l === "fr" ? "Bonne réponse" : "Bon repons",
    wrong: l === "fr" ? "Mauvaise réponse" : "Move repons",
    timeUp: l === "fr" ? "Temps écoulé" : "Tan fini",
    points: l === "fr" ? "points" : "pwen",
    waitingStart: l === "fr" ? "Le concours commence bientôt. Restez ici." : "Konkou a ap kòmanse byento. Rete la.",
    waitingVote: l === "fr" ? "Excellent ! Vous avez répondu à toutes les questions. En attente du vote du public..." : "Ekselan ! Ou reponn tout kesyon yo. Ap tann vòt piblik la...",
    voting: l === "fr" ? "Vote du public en cours !" : "Vòt piblik la kap fèt !",
    completed: l === "fr" ? "Concours terminé" : "Konkou a fini",
    finalScore: l === "fr" ? "Score final" : "Pwen final",
    seeResults: l === "fr" ? "Voir le classement" : "Wè klasman an",
    ref: l === "fr" ? "Référence" : "Referans",
    connecting: l === "fr" ? "Connexion à la salle..." : "Koneksyon nan sal la...",
    answered: l === "fr" ? "réponses données" : "repons bay",
  };

  // ─── SCREENS ──────────────────────────────────────────────────────────────

  if (phase === "loading") return (
    <RequireAuth>
      <Screen>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#c5a84f] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-white/40 text-sm">{txt.connecting}</p>
        </div>
      </Screen>
    </RequireAuth>
  );

  if (phase === "waiting") return (
    <RequireAuth>
      <Screen>
        <div className="text-center max-w-sm mx-auto">
          <div className="text-6xl mb-6 animate-pulse">📖</div>
          <h2 className="text-white font-black text-xl mb-3">{contest?.title}</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-6">{txt.waitingStart}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-[#c5a84f] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[#c5a84f] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[#c5a84f] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </Screen>
    </RequireAuth>
  );

  if (phase === "done_waiting") return (
    <RequireAuth>
      <Screen>
        <div className="text-center max-w-sm mx-auto">
          <div className="text-5xl mb-6">🎉</div>
          <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-widest mb-3">
            {totalAnswered} {txt.answered}
          </p>
          <p className="text-white font-black text-3xl mb-2">{totalScore}</p>
          <p className="text-white/30 text-xs mb-8">{txt.pts}</p>
          <p className="text-white/50 text-sm leading-relaxed">{txt.waitingVote}</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </Screen>
    </RequireAuth>
  );

  if (phase === "voting") return (
    <RequireAuth>
      <Screen>
        <div className="text-center max-w-sm mx-auto">
          <div className="text-5xl mb-6">❤️</div>
          <p className="text-white font-black text-xl mb-2">{txt.voting}</p>
          <p className="text-white/40 text-sm mb-8">
            {l === "fr" ? "Le public vote pour son favori. Suivez le classement en direct." : "Piblik la ap vote pou favori li. Swiv klasman an an dirèk."}
          </p>
          <ScoreCard score={totalScore} answered={totalAnswered} total={questions.length} txt={txt} />
          <Link href={`/concours/${id}`}
            className="inline-block mt-6 bg-[#c5a84f] text-[#0b0f1a] px-8 py-3 rounded-full font-black text-sm">
            {txt.seeResults} →
          </Link>
        </div>
      </Screen>
    </RequireAuth>
  );

  if (phase === "completed") return (
    <RequireAuth>
      <Screen>
        <div className="text-center max-w-sm mx-auto">
          <div className="text-5xl mb-6">🏆</div>
          <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-widest mb-3">{txt.completed}</p>
          <p className="text-white font-black text-4xl mb-1">{totalScore}</p>
          <p className="text-white/30 text-xs mb-8">{txt.finalScore}</p>
          <ScoreCard score={totalScore} answered={totalAnswered} total={questions.length} txt={txt} />
          <Link href={`/concours/${id}`}
            className="inline-block mt-6 bg-[#c5a84f] text-[#0b0f1a] px-8 py-3 rounded-full font-black text-sm">
            {txt.seeResults} →
          </Link>
        </div>
      </Screen>
    </RequireAuth>
  );

  // ─── MAIN QUESTION SCREEN ─────────────────────────────────────────────────
  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#080d18] flex flex-col">

        {/* Top bar */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link href={`/concours/${id}`} className="text-white/20 hover:text-white/50 transition-colors text-xs">←</Link>
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{contest?.title}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] text-white/30 uppercase tracking-wider">{txt.score}</p>
              <p className="text-[#c5a84f] font-black text-sm tabular-nums">{totalScore} {txt.pts}</p>
            </div>
          </div>
        </div>

        {/* Question progress dots */}
        <div className="px-5 py-3 flex items-center gap-1.5 justify-center">
          {questions.map((_, i) => {
            const ans = myParticipant?.answers?.find(a => a.q === i);
            return (
              <div key={i} className={`rounded-full transition-all duration-300 ${
                i === myQIndex && phase === "question"
                  ? "w-6 h-2 bg-[#c5a84f]"
                  : ans
                  ? `w-2 h-2 ${ans.correct ? "bg-green-500" : "bg-red-400/60"}`
                  : "w-2 h-2 bg-white/10"
              }`} />
            );
          })}
        </div>

        {/* Timer bar */}
        {phase === "question" && timeLeft !== null && (
          <div className="mx-5 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 linear ${timerCritical ? "bg-red-400" : "bg-[#c5a84f]"}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-5 py-6"
          style={{
            opacity: animIn ? 1 : 0,
            transform: animIn ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}>

          {/* Q counter + timer */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
              {txt.q} {myQIndex + 1} {txt.of} {questions.length}
            </p>
            {phase === "question" && timeLeft !== null && (
              <div className={`flex items-center gap-1.5 ${timerCritical ? "text-red-400 animate-pulse" : "text-white/60"}`}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                <span className="font-black text-base tabular-nums">{timeLeft}s</span>
              </div>
            )}
            {phase === "feedback" && <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">
              {l === "fr" ? "Prochaine dans 3s..." : "Pwochen nan 3s..."}
            </span>}
          </div>

          {/* Reference badge */}
          {q?.reference && (
            <div className="inline-flex items-center gap-1.5 mb-4 self-start">
              <span className="text-[10px] font-black text-[#c5a84f] border border-[#c5a84f]/30 bg-[#c5a84f]/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {txt.ref} · {q.reference}
              </span>
            </div>
          )}

          {/* Question text */}
          <div className="flex-1 flex flex-col">
            <p className="text-white font-bold leading-snug mb-8" style={{ fontSize: "clamp(1.1rem, 3vw, 1.35rem)" }}>
              {qText}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {qOpts.map((opt, i) => {
                const isCorrect = result && i === result.correct_answer;
                const isWrong = result && i === selected && !result.correct;
                const isNeutral = result && i !== result.correct_answer && i !== selected;
                const isSelected = selected === i;

                let cls = "";
                if (!result && phase === "question") {
                  cls = isSelected
                    ? "border-[#c5a84f] bg-[#c5a84f]/10 text-white"
                    : "border-white/10 text-white/70 hover:border-[#c5a84f]/50 hover:text-white hover:bg-white/5 cursor-pointer";
                } else if (isCorrect) {
                  cls = "border-green-500 bg-green-500/15 text-green-400";
                } else if (isWrong) {
                  cls = "border-red-500/60 bg-red-500/10 text-red-400";
                } else if (isNeutral) {
                  cls = "border-white/5 text-white/20";
                } else {
                  cls = "border-white/10 text-white/60";
                }

                return (
                  <button key={i}
                    onClick={() => phase === "question" && !submitting && submitAnswer(i)}
                    disabled={phase !== "question" || submitting || timeLeft === 0}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-medium transition-all duration-200 flex items-center gap-4 ${cls}`}
                    style={{ transitionProperty: "border-color, background-color, color, transform" }}>
                    <span className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-black border ${
                      isCorrect ? "bg-green-500/20 border-green-500/40 text-green-400"
                      : isWrong ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-white/5 border-white/10 text-white/30"
                    }`}>
                      {isCorrect ? "✓" : isWrong ? "✗" : String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {submitting && selected === i && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result feedback */}
            {phase === "feedback" && result && (
              <div className={`mt-6 rounded-2xl px-5 py-4 flex items-center gap-3 border ${
                result.correct
                  ? "bg-green-500/10 border-green-500/30"
                  : timeLeft === 0 && selected === null
                  ? "bg-white/5 border-white/10"
                  : "bg-red-500/10 border-red-500/20"
              }`}
                style={{ animation: "slideUp 0.3s ease" }}>
                <span className="text-2xl shrink-0">
                  {result.correct ? "✅" : timeLeft === 0 && selected === null ? "⏱" : "❌"}
                </span>
                <div>
                  <p className={`font-black text-sm ${result.correct ? "text-green-400" : "text-white/60"}`}>
                    {result.correct
                      ? `${txt.correct} · +${result.points} ${txt.points}`
                      : timeLeft === 0 && selected === null
                      ? txt.timeUp
                      : txt.wrong}
                  </p>
                  {!result.correct && q?.reference && (
                    <p className="text-white/30 text-xs mt-0.5">{txt.ref}: {q.reference}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </RequireAuth>
  );
}

// Reusable components
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080d18] flex items-center justify-center px-5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #c5a84f 0%, transparent 70%)" }} />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

function ScoreCard({ score, answered, total, txt }: {
  score: number; answered: number; total: number; txt: { pts: string; answered: string };
}) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex items-center gap-6 justify-center">
      <div className="text-center">
        <p className="text-[#c5a84f] font-black text-2xl">{score}</p>
        <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">{txt.pts}</p>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="text-center">
        <p className="text-white font-black text-2xl">{answered}/{total}</p>
        <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">{txt.answered}</p>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="text-center">
        <p className="text-white font-black text-2xl">{pct}%</p>
        <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Score</p>
      </div>
    </div>
  );
}
