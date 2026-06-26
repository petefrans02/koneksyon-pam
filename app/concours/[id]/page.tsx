"use client";

import { useLang } from "@/lib/LangContext";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Lang = "fr" | "ht" | "en";
type Status = "upcoming" | "active" | "voting" | "completed";

interface Participant {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  score: number;
  votes_count: number;
  answers: { q: number; a: number; correct: boolean }[];
}

interface Contest {
  id: string;
  title: string;
  description: string;
  status: Status;
  current_question: number;
  max_participants: number;
  created_by: string;
}

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

export default function ContestPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [myParticipant, setMyParticipant] = useState<Participant | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [controlling, setControlling] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const load = useCallback(async () => {
    const res = await fetch(`/api/contests/${id}`);
    const data = await res.json();
    if (data.contest) {
      setContest(data.contest);
      setParticipants(data.participants || []);
      setQuestions(data.questions || []);
      setMyVote(data.myVote);
      setMyParticipant(data.myParticipant);
      setIsOrganizer(data.isOrganizer);
      setIsRegistered(!!data.myParticipant);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Real-time updates
  useEffect(() => {
    const ch = supabase.channel(`contest-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "contest_participants", filter: `contest_id=eq.${id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "contests", filter: `id=eq.${id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "contest_votes", filter: `contest_id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, load]);

  async function joinContest() {
    setJoinError(null);
    if (!currentUser) {
      router.push("/auth/login?redirect=/concours/" + id);
      return;
    }
    setJoining(true);
    const res = await fetch(`/api/contests/${id}/join`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setIsRegistered(true);
      setJoinSuccess(true);
      await load();
    } else {
      setJoinError(
        data.error === "Contest is full"
          ? (l === "fr" ? "Le concours est complet." : l === "ht" ? "Konkou a plen." : "Contest is full.")
          : data.error === "Registration closed"
          ? (l === "fr" ? "Les inscriptions sont fermées." : "Enskripsyon yo fèmen.")
          : (l === "fr" ? "Une erreur est survenue. Réessayez." : "Yon erè rive. Eseye ankò.")
      );
    }
    setJoining(false);
  }

  async function voteFor(participantId: string) {
    setVoting(participantId);
    const res = await fetch(`/api/contests/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participant_id: participantId }),
    });
    const data = await res.json();
    if (data.ok) { setMyVote(participantId); await load(); }
    setVoting(null);
  }

  async function control(action: string) {
    setControlling(true);
    await fetch(`/api/contests/${id}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
    setControlling(false);
  }

  const txt = {
    back: l === "fr" ? "Concours" : l === "ht" ? "Konkou" : "Contests",
    register: l === "fr" ? "S'inscrire comme participant" : l === "ht" ? "Enskri kòm patisipan" : "Register as participant",
    registered: l === "fr" ? "Inscrit · Participer" : l === "ht" ? "Enskri · Patisipe" : "Registered · Participate",
    participate: l === "fr" ? "Rejoindre la salle des participants" : l === "ht" ? "Antre nan sal patisipan" : "Join participant room",
    leaderboard: l === "fr" ? "Classement en direct" : l === "ht" ? "Klasman an dirèk" : "Live rankings",
    votePhase: l === "fr" ? "Votez pour votre favori" : l === "ht" ? "Vote pou favori ou" : "Vote for your favorite",
    alreadyVoted: l === "fr" ? "Vote enregistré" : l === "ht" ? "Vòt anrejistre" : "Vote recorded",
    vote: l === "fr" ? "Voter" : l === "ht" ? "Vote" : "Vote",
    pts: l === "fr" ? "pts" : l === "ht" ? "pwen" : "pts",
    votes: l === "fr" ? "votes" : l === "ht" ? "vòt" : "votes",
    correct: l === "fr" ? "bonnes réponses" : l === "ht" ? "bon repons" : "correct",
    startContest: l === "fr" ? "Démarrer le concours" : l === "ht" ? "Kòmanse konkou a" : "Start contest",
    startVoting: l === "fr" ? "Ouvrir le vote" : l === "ht" ? "Ouvri vote a" : "Open voting",
    endContest: l === "fr" ? "Terminer et publier les résultats" : l === "ht" ? "Fini epi pibliye rezilta" : "End and publish results",
    nextQ: l === "fr" ? "Question suivante →" : l === "ht" ? "Pwochen kesyon →" : "Next question →",
    participants: l === "fr" ? "participants inscrits" : l === "ht" ? "patisipan enskri" : "registered participants",
    full: l === "fr" ? "Complet" : l === "ht" ? "Konplè" : "Full",
    waitingStart: l === "fr" ? "Le concours n'a pas encore commencé." : l === "ht" ? "Konkou a poko kòmanse." : "Contest has not started yet.",
    results: l === "fr" ? "Résultats finaux" : l === "ht" ? "Rezilta final" : "Final results",
    winner: l === "fr" ? "Vainqueur" : l === "ht" ? "Venkè" : "Winner",
    currentQ: l === "fr" ? "Question en cours" : l === "ht" ? "Kesyon kap fèt" : "Current question",
    answers: l === "fr" ? "Réponses" : l === "ht" ? "Repons" : "Answers",
  };

  const statusMeta: Record<Status, { label: string; color: string }> = {
    upcoming: { label: l === "fr" ? "Inscriptions ouvertes" : "Enskripsyon louvri", color: "text-blue-500" },
    active: { label: l === "fr" ? "En cours" : "Kap fèt", color: "text-green-500" },
    voting: { label: l === "fr" ? "Vote en cours" : "Vote kap fèt", color: "text-amber-500" },
    completed: { label: l === "fr" ? "Terminé" : "Fini", color: "text-stone-400" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0b0f1a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-stone-400">
        Contest not found.
      </div>
    );
  }

  const meta = statusMeta[contest.status];
  const currentQ = questions[contest.current_question];
  const qText = currentQ ? (currentQ[`question_${l}` as keyof Question] as string || currentQ.question_fr) : "";
  const qOpts = currentQ ? (currentQ[`options_${l}` as keyof Question] as string[] || currentQ.options_fr) : [];

  const sortedParticipants = [...participants].sort((a, b) => {
    if (contest.status === "completed") return (b.score - a.score);
    return b.score - a.score;
  });

  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-[#0f2044] px-5 sm:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <Link href="/concours" className="text-white/30 text-xs hover:text-white transition-colors mb-5 inline-block">
            ← {txt.back}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {contest.status === "active" && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
                <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
              </div>
              <h1 className="text-white font-black text-2xl sm:text-4xl leading-tight mb-2">{contest.title}</h1>
              {contest.description && (
                <p className="text-white/40 text-sm max-w-xl">{contest.description}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-white/30 text-xs">{participants.length}/{contest.max_participants} {txt.participants}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 flex flex-col lg:flex-row gap-10">

        {/* Left: main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">

          {/* Organizer controls */}
          {isOrganizer && (
            <div className="bg-[#f8f6f2] rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0b0f1a]/50">
                {l === "fr" ? "Contrôles organisateur" : "Kontwòl ògànizatè"}
              </p>
              <div className="flex flex-wrap gap-3">
                {contest.status === "upcoming" && (
                  <button onClick={() => control("next_status")} disabled={controlling}
                    className="bg-[#0b0f1a] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#131926] transition-colors disabled:opacity-40">
                    ▶ {txt.startContest}
                  </button>
                )}
                {contest.status === "active" && (
                  <>
                    <button onClick={() => control("advance_question")} disabled={controlling}
                      className="bg-[#0b0f1a] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#131926] transition-colors disabled:opacity-40">
                      {txt.nextQ}
                    </button>
                    <button onClick={() => control("next_status")} disabled={controlling}
                      className="border border-amber-400 text-amber-600 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-amber-50 transition-colors disabled:opacity-40">
                      {txt.startVoting}
                    </button>
                  </>
                )}
                {contest.status === "voting" && (
                  <button onClick={() => control("next_status")} disabled={controlling}
                    className="bg-[#c5a84f] text-[#0b0f1a] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#d4b85c] transition-colors disabled:opacity-40">
                    {txt.endContest}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Current question display (active state, for spectators) */}
          {contest.status === "active" && currentQ && (
            <div className="border border-stone-200 rounded-2xl p-7">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0b0f1a]/40">
                  {txt.currentQ} {contest.current_question + 1}/{questions.length}
                </p>
                {currentQ.reference && (
                  <span className="text-[10px] font-bold text-[#c5a84f] border border-[#c5a84f]/30 px-2 py-0.5 rounded">
                    {currentQ.reference}
                  </span>
                )}
              </div>
              <p className="text-[#0b0f1a] font-bold text-lg leading-snug mb-6">{qText}</p>
              <div className="grid grid-cols-2 gap-2">
                {qOpts.map((opt, i) => (
                  <div key={i} className={`px-4 py-3 rounded-xl border text-sm ${
                    contest.status === "completed" && currentQ.correct_answer === i
                      ? "border-green-400 bg-green-50 text-green-800 font-semibold"
                      : "border-stone-200 text-stone-600"
                  }`}>
                    <span className="text-xs font-black opacity-40 mr-2">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </div>
                ))}
              </div>
              {isRegistered && !myParticipant?.answers?.find(a => a.q === contest.current_question) && (
                <div className="mt-5 pt-5 border-t border-stone-100">
                  <Link
                    href={`/concours/${id}/participer`}
                    className="inline-block bg-[#0b0f1a] text-white px-7 py-3 rounded-full text-sm font-bold hover:bg-[#131926] transition-colors"
                  >
                    {txt.participate} →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Upcoming — register */}
          {contest.status === "upcoming" && (
            <div className="border-2 border-[#1d4ed8]/20 bg-[#f8fbff] rounded-xl p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1">
                  <p className="text-[#0f2044] font-black text-lg mb-1">
                    {l === "fr" ? "Inscrivez-vous pour participer" : l === "ht" ? "Enskri pou patisipe" : "Register to participate"}
                  </p>
                  <p className="text-stone-500 text-sm">
                    {participants.length}/{contest.max_participants} {txt.participants}
                    {" · "}
                    {l === "fr" ? "Places limitées" : l === "ht" ? "Plas limite" : "Limited spots"}
                  </p>
                  {!currentUser && (
                    <p className="text-[#1d4ed8] text-xs mt-2 font-semibold">
                      {l === "fr" ? "Vous devez être connecté pour vous inscrire." : l === "ht" ? "Ou dwe konekte pou enskri." : "You must be logged in to register."}
                    </p>
                  )}
                  {joinError && (
                    <p className="text-red-500 text-xs mt-2 font-semibold">{joinError}</p>
                  )}
                  {joinSuccess && (
                    <p className="text-green-600 text-xs mt-2 font-semibold">
                      {l === "fr" ? "Inscription réussie ! Le concours démarrera bientôt." : l === "ht" ? "Enskripsyon reyisi ! Konkou a ap kòmanse byento." : "Successfully registered! Contest will start soon."}
                    </p>
                  )}
                </div>
                {!isRegistered ? (
                  <button
                    onClick={joinContest}
                    disabled={joining || participants.length >= contest.max_participants}
                    className="shrink-0 bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    {joining ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {l === "fr" ? "Inscription..." : "Ap enskri..."}
                      </>
                    ) : participants.length >= contest.max_participants ? (
                      txt.full
                    ) : (
                      <>
                        {l === "fr" ? "S'inscrire" : l === "ht" ? "Enskri" : "Register"} →
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/concours/${id}/participer`}
                    className="shrink-0 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded font-bold text-sm transition-colors"
                  >
                    ✓ {txt.registered}
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Voting phase */}
          {contest.status === "voting" && (
            <div>
              <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">{txt.votePhase}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {sortedParticipants.map((p, i) => (
                  <div key={p.id} className={`border rounded-2xl p-5 transition-all ${
                    myVote === p.id ? "border-[#c5a84f] bg-[#c5a84f]/5" : "border-stone-200 hover:border-stone-300"
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-lg font-black text-stone-300">#{i + 1}</span>
                      {p.user_avatar ? (
                        <img src={p.user_avatar} className="w-10 h-10 rounded-full" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#0b0f1a] flex items-center justify-center text-white text-sm font-black">
                          {p.user_name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[#0b0f1a] font-bold text-sm truncate">{p.user_name}</p>
                        <p className="text-stone-400 text-xs">{p.score} {txt.pts} · {p.votes_count} {txt.votes}</p>
                      </div>
                    </div>
                    {myVote === p.id ? (
                      <div className="text-[#c5a84f] text-xs font-bold text-center py-1">✓ {txt.alreadyVoted}</div>
                    ) : (
                      <button
                        onClick={() => voteFor(p.id)}
                        disabled={voting !== null || myParticipant?.user_id === p.user_id}
                        className="w-full bg-[#0b0f1a] text-white py-2 rounded-full text-xs font-bold hover:bg-[#131926] transition-colors disabled:opacity-30"
                      >
                        {voting === p.id ? "..." : txt.vote}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {contest.status === "completed" && (
            <div>
              <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">{txt.results}</p>
              {sortedParticipants[0] && (
                <div className="bg-[#0b0f1a] rounded-2xl p-8 text-center mb-6">
                  <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-widest mb-4">🏆 {txt.winner}</p>
                  {sortedParticipants[0].user_avatar ? (
                    <img src={sortedParticipants[0].user_avatar} className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-[#c5a84f]" alt="" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#c5a84f] flex items-center justify-center text-[#0b0f1a] text-3xl font-black mx-auto mb-3">
                      {sortedParticipants[0].user_name[0]}
                    </div>
                  )}
                  <p className="text-white font-black text-xl">{sortedParticipants[0].user_name}</p>
                  <p className="text-[#c5a84f] font-bold">{sortedParticipants[0].score} {txt.pts}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Leaderboard */}
        <div className="w-full lg:w-72 shrink-0">
          <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
            {txt.leaderboard}
          </p>
          <div className="flex flex-col divide-y divide-stone-100">
            {sortedParticipants.map((p, i) => {
              const correctCount = (p.answers || []).filter(a => a.correct).length;
              return (
                <div key={p.id} className={`py-4 flex items-center gap-3 ${myParticipant?.id === p.id ? "bg-[#f8f6f2] -mx-3 px-3 rounded-xl" : ""}`}>
                  <span className={`text-xs font-black w-5 text-center shrink-0 ${i === 0 && contest.status === "completed" ? "text-[#c5a84f]" : "text-stone-300"}`}>
                    {i + 1}
                  </span>
                  {p.user_avatar ? (
                    <img src={p.user_avatar} className="w-8 h-8 rounded-full shrink-0" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0b0f1a] flex items-center justify-center text-white text-xs font-black shrink-0">
                      {p.user_name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0b0f1a] truncate">{p.user_name}</p>
                    <p className="text-[10px] text-stone-400">
                      {correctCount}/{questions.length} {txt.correct} · {p.votes_count} {txt.votes}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-stone-500 shrink-0">{p.score}</span>
                </div>
              );
            })}
            {participants.length === 0 && (
              <p className="text-stone-300 text-xs py-8 text-center">
                {l === "fr" ? "Aucun participant encore." : "Pa gen patisipan ankò."}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
