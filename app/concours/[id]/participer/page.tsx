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
  question_fr: string;
  question_ht: string;
  question_en: string;
  options_fr: string[];
  options_ht: string[];
  options_en: string[];
  reference: string;
  time_limit: number;
  order_num: number;
  correct_answer: number;
}

interface Contest {
  id: string;
  title: string;
  status: string;
  current_question: number;
}

interface MyParticipant {
  id: string;
  score: number;
  answers: { q: number; a: number; correct: boolean; time: number }[];
}

export default function ParticiperPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const params = useParams();
  const id = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myParticipant, setMyParticipant] = useState<MyParticipant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; points: number; correct_answer: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const load = useCallback(async () => {
    const res = await fetch(`/api/contests/${id}`);
    const data = await res.json();
    if (data.contest) {
      setContest(data.contest);
      setQuestions(data.questions || []);
      setMyParticipant(data.myParticipant);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Real-time: listen for question advances
  useEffect(() => {
    const ch = supabase.channel(`participant-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "contests", filter: `id=eq.${id}` }, (payload) => {
        const updated = payload.new as Contest;
        setContest(prev => prev ? { ...prev, ...updated } : updated);
        // Reset state for new question
        setSelected(null);
        setResult(null);
        startTimeRef.current = Date.now();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  // Timer
  useEffect(() => {
    if (!contest || contest.status !== "active") return;
    const q = questions[contest.current_question];
    if (!q) return;

    const hasAnswered = myParticipant?.answers?.find(a => a.q === contest.current_question);
    if (hasAnswered) { setTimeLeft(0); return; }

    startTimeRef.current = Date.now();
    setTimeLeft(q.time_limit);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [contest?.current_question, contest?.status, questions]);

  async function submitAnswer(optIdx: number) {
    if (!contest || submitting || result) return;
    const timeTaken = Date.now() - startTimeRef.current;
    setSelected(optIdx);
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const res = await fetch(`/api/contests/${id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_index: contest.current_question,
        answer_index: optIdx,
        time_taken: timeTaken,
      }),
    });
    const data = await res.json();
    if (data.ok !== undefined) {
      setResult({ correct: data.correct, points: data.points, correct_answer: data.correct_answer });
      // Update local score
      setMyParticipant(prev => prev ? { ...prev, score: (prev.score || 0) + (data.points || 0) } : prev);
    }
    setSubmitting(false);
  }

  const txt = {
    loading: l === "fr" ? "Connexion à la salle..." : l === "ht" ? "Koneksyon nan sal la..." : "Connecting...",
    waiting: l === "fr" ? "En attente de la prochaine question..." : l === "ht" ? "Ap tann pwochen kesyon an..." : "Waiting for next question...",
    waiting_start: l === "fr" ? "Le concours n'a pas encore commencé. Restez ici." : l === "ht" ? "Konkou a poko kòmanse. Rete la." : "Contest hasn't started yet. Stay here.",
    correct: l === "fr" ? "Bonne réponse" : l === "ht" ? "Bon repons" : "Correct",
    wrong: l === "fr" ? "Mauvaise réponse" : l === "ht" ? "Move repons" : "Incorrect",
    points: l === "fr" ? "points" : l === "ht" ? "pwen" : "points",
    pts: l === "fr" ? "pts" : l === "ht" ? "pwen" : "pts",
    score: l === "fr" ? "Votre score" : l === "ht" ? "Pwen ou" : "Your score",
    timeUp: l === "fr" ? "Temps écoulé !" : l === "ht" ? "Tan fini !" : "Time's up!",
    ref: l === "fr" ? "Référence" : l === "ht" ? "Referans" : "Reference",
    q: l === "fr" ? "Question" : l === "ht" ? "Kesyon" : "Q",
    backToContest: l === "fr" ? "Voir le classement" : l === "ht" ? "Wè klasman an" : "View rankings",
    votingOpen: l === "fr" ? "Phase de vote ouverte — le public vote maintenant !" : l === "ht" ? "Faz vote a louvri — piblik la ap vote kounye a !" : "Voting phase open — the public is voting now!",
    contestOver: l === "fr" ? "Concours terminé. Voici votre score final." : l === "ht" ? "Konkou a fini. Men pwen final ou a." : "Contest over. Here's your final score.",
    answered: l === "fr" ? "Répondu" : l === "ht" ? "Reponn" : "Answered",
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#c5a84f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/40 text-sm">{txt.loading}</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  const q = contest ? questions[contest.current_question] : null;
  const qText = q ? (q[`question_${l}` as keyof Question] as string || q.question_fr) : "";
  const qOpts = q ? (q[`options_${l}` as keyof Question] as string[] || q.options_fr) : [];
  const hasAnswered = myParticipant?.answers?.find(a => a.q === (contest?.current_question ?? -1));

  const progressPct = q && timeLeft !== null ? (timeLeft / q.time_limit) * 100 : 0;
  const timerCritical = timeLeft !== null && timeLeft <= 5;

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#0b0f1a] px-5 py-10 flex flex-col">
        <div className="max-w-xl mx-auto w-full flex-1 flex flex-col gap-6">

          {/* Header bar */}
          <div className="flex items-center justify-between">
            <Link href={`/concours/${id}`} className="text-white/30 text-xs hover:text-[#c5a84f] transition-colors">
              ← {txt.backToContest}
            </Link>
            <div className="text-right">
              <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-wider">{txt.score}</p>
              <p className="text-white font-black text-lg">{myParticipant?.score || 0} {txt.pts}</p>
            </div>
          </div>

          {/* Status: voting */}
          {contest?.status === "voting" && (
            <div className="bg-[#131926] border border-amber-500/30 rounded-2xl p-8 text-center flex-1 flex flex-col items-center justify-center gap-4">
              <p className="text-amber-400 text-3xl">🗳</p>
              <p className="text-white font-bold text-lg">{txt.votingOpen}</p>
              <Link href={`/concours/${id}`} className="bg-[#c5a84f] text-[#0b0f1a] px-7 py-3 rounded-full text-sm font-black hover:bg-[#d4b85c] transition-colors mt-2">
                {txt.backToContest} →
              </Link>
            </div>
          )}

          {/* Status: completed */}
          {contest?.status === "completed" && (
            <div className="bg-[#131926] border border-[#c5a84f]/20 rounded-2xl p-8 text-center flex-1 flex flex-col items-center justify-center gap-4">
              <p className="text-white/40 text-sm">{txt.contestOver}</p>
              <p className="text-[#c5a84f] font-black text-4xl">{myParticipant?.score || 0}</p>
              <p className="text-white/30 text-xs">{txt.pts}</p>
              <Link href={`/concours/${id}`} className="bg-[#c5a84f] text-[#0b0f1a] px-7 py-3 rounded-full text-sm font-black mt-2">
                {txt.backToContest}
              </Link>
            </div>
          )}

          {/* Status: upcoming */}
          {contest?.status === "upcoming" && (
            <div className="bg-[#131926] border border-white/5 rounded-2xl p-10 text-center flex-1 flex items-center justify-center">
              <p className="text-white/40 text-sm leading-relaxed">{txt.waiting_start}</p>
            </div>
          )}

          {/* Status: active */}
          {contest?.status === "active" && (
            <>
              {/* Question counter */}
              <div className="flex items-center justify-between">
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">
                  {txt.q} {(contest.current_question ?? 0) + 1}/{questions.length}
                </p>
                {hasAnswered ? (
                  <span className="text-green-400 text-xs font-bold">✓ {txt.answered}</span>
                ) : timeLeft !== null && (
                  <span className={`font-black text-lg ${timerCritical ? "text-red-400 animate-pulse" : "text-white"}`}>
                    {timeLeft}s
                  </span>
                )}
              </div>

              {/* Timer bar */}
              {!hasAnswered && timeLeft !== null && (
                <div className="w-full bg-white/5 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-1000 ${timerCritical ? "bg-red-400" : "bg-[#c5a84f]"}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}

              {/* Question */}
              {q ? (
                <div className="bg-[#131926] border border-white/5 rounded-2xl p-7 flex-1 flex flex-col gap-6">
                  {q.reference && (
                    <span className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-widest">
                      {txt.ref} · {q.reference}
                    </span>
                  )}
                  <p className="text-white font-bold text-xl leading-snug">{qText}</p>

                  <div className="flex flex-col gap-3 mt-auto">
                    {qOpts.map((opt, i) => {
                      let cls = "border border-white/10 text-white/70 hover:border-white/30 hover:text-white cursor-pointer";
                      if (hasAnswered || result) {
                        if (i === (result?.correct_answer ?? -1)) cls = "border-2 border-green-500 bg-green-500/10 text-green-400 font-semibold cursor-default";
                        else if (i === selected && !result?.correct) cls = "border border-red-500/50 bg-red-500/10 text-red-400 cursor-default";
                        else cls = "border border-white/5 text-white/20 cursor-default";
                      }
                      if (timeLeft === 0 && !hasAnswered) cls = "border border-white/5 text-white/20 cursor-default";

                      return (
                        <button
                          key={i}
                          onClick={() => !hasAnswered && !result && timeLeft !== 0 && submitAnswer(i)}
                          disabled={submitting || !!hasAnswered || !!result || timeLeft === 0}
                          className={`w-full text-left px-5 py-4 rounded-xl text-sm transition-all ${cls}`}
                        >
                          <span className="text-xs font-black opacity-40 mr-3">{String.fromCharCode(65 + i)}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Result feedback */}
                  {result && (
                    <div className={`rounded-xl px-5 py-4 text-sm font-bold ${result.correct ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-white/5 border border-white/5 text-white/40"}`}>
                      {result.correct ? `✓ ${txt.correct} · +${result.points} ${txt.points}` : `— ${txt.wrong}`}
                    </div>
                  )}

                  {timeLeft === 0 && !result && (
                    <p className="text-red-400 text-sm font-bold text-center">{txt.timeUp}</p>
                  )}
                </div>
              ) : (
                <div className="bg-[#131926] border border-white/5 rounded-2xl p-10 text-center flex-1 flex items-center justify-center">
                  <p className="text-white/30 text-sm">{txt.waiting}</p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </RequireAuth>
  );
}
