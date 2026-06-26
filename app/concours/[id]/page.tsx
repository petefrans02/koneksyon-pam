"use client";

import { useLang } from "@/lib/LangContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Countdown from "@/app/components/Countdown";
import ToastNotifications from "@/app/components/ToastNotifications";
import NextStep from "@/app/components/NextStep";
import ShareButton from "@/app/components/ShareButton";

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
  start_at?: string | null;
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
  const searchParams = useSearchParams();
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const didAutoJoin = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-join after Google login redirect — fires when currentUser becomes available
  useEffect(() => {
    if (searchParams.get("join") !== "1") return;
    if (!currentUser) return;
    if (didAutoJoin.current) return;
    didAutoJoin.current = true;
    router.replace(`/concours/${id}`);
    fetch(`/api/contests/${id}/join`, { method: "POST" })
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setIsRegistered(true); setJoinSuccess(true); load(); }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, searchParams]);

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
      setShowAuthModal(true);
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
          ? (l === "fr" ? "Les inscriptions sont fermées." : l === "ht" ? "Enskripsyon yo fèmen." : "Registration is closed.")
          : (l === "fr" ? "Une erreur est survenue. Réessayez." : l === "ht" ? "Yon erè rive. Eseye ankò." : "An error occurred. Please try again.")
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
    upcoming: { label: l === "fr" ? "Inscriptions ouvertes" : l === "ht" ? "Enskripsyon louvri" : "Open registrations", color: "text-blue-500" },
    active: { label: l === "fr" ? "En cours" : l === "ht" ? "Kap fèt" : "Live now", color: "text-green-500" },
    voting: { label: l === "fr" ? "Vote en cours" : l === "ht" ? "Vote kap fèt" : "Voting open", color: "text-amber-500" },
    completed: { label: l === "fr" ? "Terminé" : l === "ht" ? "Fini" : "Completed", color: "text-stone-400" },
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

      {/* Real-time toast notifications */}
      <ToastNotifications contestId={id} lang={l} />

      {/* Auth modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(15,32,68,0.85)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: "fadeScaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
            onClick={e => e.stopPropagation()}>
            <style>{`@keyframes fadeScaleIn { from { opacity:0; transform:scale(0.9) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

            {/* Modal header */}
            <div className="bg-[#0f2044] px-7 py-6">
              <div className="flex items-center gap-3 mb-3">
                <img src="/logo-kp.png" alt="KP" className="w-9 h-9 rounded-lg" />
                <p className="text-white font-black text-sm">KONEKSYON PAM</p>
              </div>
              <h2 className="text-white font-black text-lg leading-snug">
                {l === "fr" ? "Connectez-vous pour participer" : l === "ht" ? "Konekte pou patisipe" : "Sign in to participate"}
              </h2>
              <p className="text-white/50 text-sm mt-1">
                {l === "en" ? `Contest: ${contest.title}` : l === "ht" ? `Konkou : ${contest.title}` : `Concours : ${contest.title}`}
              </p>
            </div>

            {/* Modal body */}
            <div className="px-7 py-7 flex flex-col gap-4">
              <p className="text-stone-500 text-sm leading-relaxed">
                {l === "fr"
                  ? "Une fois connecté, votre inscription sera automatique et votre nom apparaîtra immédiatement dans la liste des participants."
                  : l === "ht"
                  ? "Yon fwa ou konekte, enskripsyon ou ap otomatik epi non ou ap parèt imedyatman nan lis patisipan yo."
                  : "Once logged in, your registration will be automatic and your name will appear immediately in the participants list."}
              </p>

              <button
                onClick={() => {
                  setShowAuthModal(false);
                  signInWithGoogle(`/concours/${id}?join=1`);
                }}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-200 hover:border-[#1d4ed8] hover:shadow-md text-[#0f2044] font-bold px-6 py-3.5 rounded-xl text-sm transition-all"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {l === "fr" ? "Continuer avec Google" : l === "ht" ? "Kontinye ak Google" : "Continue with Google"}
              </button>

              <button onClick={() => setShowAuthModal(false)}
                className="text-stone-400 text-xs text-center hover:text-stone-600 transition-colors">
                {l === "fr" ? "Annuler" : l === "ht" ? "Anile" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-[#0a1628]">
        {/* Gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, #c5a84f 0%, transparent 70%)" }} />
        {/* Cross watermark */}
        <div className="absolute right-8 bottom-0 text-[180px] text-white opacity-[0.03] select-none pointer-events-none leading-none">✝</div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-8 pb-10">
          <Link href="/concours" className="text-white/30 text-xs hover:text-white/80 transition-colors mb-8 inline-flex items-center gap-1">
            ← {txt.back}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Status badge */}
              <div className="flex items-center gap-2 mb-4">
                {contest.status === "active" && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                {contest.status === "voting" && <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${meta.color}`}>{meta.label}</span>
              </div>

              <h1 className="text-white font-black leading-tight mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)" }}>
                {contest.title}
              </h1>
              {contest.description && (
                <p className="text-white/40 text-sm max-w-xl leading-relaxed">{contest.description}</p>
              )}

              {/* Countdown for upcoming contests */}
              {contest.status === "upcoming" && contest.start_at && (
                <div className="mt-5">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">
                    {l === "fr" ? "Le concours commence dans" : l === "ht" ? "Konkou a kòmanse nan" : "Contest starts in"}
                  </p>
                  <Countdown targetDate={contest.start_at} lang={l} />
                </div>
              )}
            </div>

            {/* Participants counter */}
            <div className="shrink-0 text-right">
              <div className="inline-flex flex-col items-end gap-2">
                <p className="text-white/40 text-xs">{participants.length} / {contest.max_participants} {txt.participants}</p>
                <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#c5a84f] to-[#e8c97a] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (participants.length / (contest.max_participants || 1)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#c5a84f]/30 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 flex flex-col lg:flex-row gap-10">

        {/* Left: main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">

          {/* Organizer controls */}
          {isOrganizer && (
            <div className="bg-[#f8f6f2] rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0b0f1a]/50">
                {l === "fr" ? "Contrôles organisateur" : l === "ht" ? "Kontwòl ògànizatè" : "Organizer controls"}
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

          {/* Upcoming — register (hidden for organizer/admin) */}
          {contest.status === "upcoming" && !isOrganizer && (
            <div className="relative overflow-hidden rounded-2xl border border-[#1d4ed8]/20 bg-gradient-to-br from-[#f8fbff] to-white">
              <div className="absolute top-0 right-0 w-40 h-40 opacity-5 text-[120px] select-none pointer-events-none leading-none">✝</div>
              <div className="px-8 py-8">
                {joinSuccess ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl shrink-0">✓</div>
                    <div>
                      <p className="text-green-700 font-black text-lg">
                        {l === "fr" ? "Inscription confirmée !" : l === "ht" ? "Enskripsyon konfime !" : "Registration confirmed!"}
                      </p>
                      <p className="text-stone-400 text-sm mt-0.5">
                        {l === "fr" ? "Le concours démarrera bientôt. Revenez quand il est en cours." : l === "ht" ? "Konkou a ap kòmanse byento. Tounen lè li kap fèt." : "The contest will start soon. Come back when it's live."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] mb-2">
                        {l === "fr" ? "Championnat Biblique" : l === "ht" ? "Chanpyona Biblik" : "Biblical Championship"}
                      </p>
                      <p className="text-[#0f2044] font-black text-xl mb-1">
                        {l === "fr" ? "Rejoignez le concours" : l === "ht" ? "Antre nan konkou a" : "Join the contest"}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full bg-[#1d4ed8] rounded-full"
                            style={{ width: `${Math.min(100, (participants.length / (contest.max_participants || 1)) * 100)}%` }} />
                        </div>
                        <span className="text-stone-400 text-xs">{participants.length}/{contest.max_participants} {l === "fr" ? "places" : l === "ht" ? "plas" : "spots"}</span>
                        {participants.length >= contest.max_participants * 0.8 && (
                          <span className="text-red-500 text-[10px] font-bold">
                            {l === "fr" ? "Presque complet !" : l === "ht" ? "Prèske plen !" : "Almost full!"}
                          </span>
                        )}
                      </div>
                      {!currentUser && (
                        <p className="text-[#1d4ed8] text-xs mt-2">
                          {l === "fr" ? "Connexion Google gratuite et rapide." : l === "ht" ? "Koneksyon Google gratis epi rapid." : "Free and fast Google sign-in."}
                        </p>
                      )}
                      {joinError && <p className="text-red-500 text-xs mt-2 font-semibold">{joinError}</p>}
                    </div>
                    {!isRegistered ? (
                      <button onClick={joinContest}
                        disabled={joining || participants.length >= contest.max_participants}
                        className="shrink-0 bg-[#0f2044] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-black text-sm transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:shadow-[#1d4ed8]/20">
                        {joining ? (
                          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{l === "fr" ? "Inscription..." : l === "ht" ? "Ap enskri..." : "Registering..."}</>
                        ) : participants.length >= contest.max_participants ? txt.full : (
                          <>{l === "fr" ? "S'inscrire" : l === "ht" ? "Enskri" : "Register"} →</>
                        )}
                      </button>
                    ) : (
                      <Link href={`/concours/${id}/participer`}
                        className="shrink-0 bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-xl font-black text-sm transition-colors">
                        ✓ {txt.registered}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voting phase */}
          {contest.status === "voting" && (
            <div>
              {/* Vote header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3">
                <span className="text-2xl">❤️</span>
                <div>
                  <p className="font-black text-amber-800 text-sm">{txt.votePhase}</p>
                  <p className="text-amber-600 text-xs mt-0.5">
                    {l === "fr" ? "Votez pour le participant qui vous a le plus inspiré." : l === "ht" ? "Vote pou patisipan ki te enspire ou plis la." : "Vote for the participant who inspired you the most."}
                  </p>
                </div>
              </div>

              {/* Total votes count */}
              <p className="text-stone-400 text-xs mb-4 text-center">
                {sortedParticipants.reduce((s, p) => s + p.votes_count, 0)} {l === "fr" ? "votes au total" : l === "ht" ? "vòt an total" : "total votes"}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {sortedParticipants.map((p, i) => {
                  const totalVotes = sortedParticipants.reduce((s, x) => s + x.votes_count, 0);
                  const pct = totalVotes > 0 ? Math.round((p.votes_count / totalVotes) * 100) : 0;
                  const isMyVote = myVote === p.id;
                  const isMe = myParticipant?.user_id === p.user_id;
                  return (
                    <div key={p.id} className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                      isMyVote ? "border-[#c5a84f] shadow-lg shadow-[#c5a84f]/20" : "border-stone-200 hover:border-stone-300"
                    }`}>
                      {isMyVote && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#c5a84f] to-[#e8c97a]" />}
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-sm font-black w-6 text-center shrink-0 ${i === 0 ? "text-[#c5a84f]" : "text-stone-300"}`}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                          </span>
                          {p.user_avatar ? (
                            <img src={p.user_avatar} className="w-11 h-11 rounded-full border-2 border-white shadow-sm" alt="" />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-[#0f2044] flex items-center justify-center text-white font-black shrink-0">
                              {p.user_name[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#0b0f1a] font-bold text-sm truncate">{p.user_name}</p>
                            <p className="text-stone-400 text-xs">{p.score} {txt.pts} · {p.votes_count} {txt.votes}</p>
                          </div>
                        </div>

                        {/* Vote progress bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                            <span>{pct}% {l === "fr" ? "des votes" : l === "ht" ? "vòt yo" : "of votes"}</span>
                            <span>{p.votes_count} ❤️</span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${isMyVote ? "bg-[#c5a84f]" : "bg-stone-300"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        {isMyVote ? (
                          <div className="flex items-center justify-center gap-2 py-2 text-[#c5a84f] text-xs font-black">
                            <span>✓</span> {txt.alreadyVoted}
                          </div>
                        ) : (
                          <button onClick={() => voteFor(p.id)}
                            disabled={voting !== null || isMe || !!myVote}
                            className="w-full bg-[#0f2044] hover:bg-[#1d4ed8] disabled:opacity-30 text-white py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5">
                            {voting === p.id ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>❤️ {txt.vote}{isMe ? ` (${l === "fr" ? "vous" : l === "ht" ? "ou" : "you"})` : ""}</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed */}
          {contest.status === "completed" && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 mb-6">{txt.results}</p>

              {/* Trophy podium */}
              {sortedParticipants.length > 0 && (
                <div className="relative overflow-hidden rounded-3xl bg-[#0a1628] p-8 mb-6 text-center">
                  {/* Gold glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 opacity-20 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, #c5a84f 0%, transparent 70%)" }} />

                  <div className="relative z-10">
                    <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                      🏆 {l === "fr" ? "Champion Biblique KONEKSYON PAM" : l === "ht" ? "Chanpyon Biblik KONEKSYON PAM" : "KONEKSYON PAM Biblical Champion"}
                    </p>

                    {sortedParticipants[0].user_avatar ? (
                      <img src={sortedParticipants[0].user_avatar}
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[#c5a84f] shadow-xl shadow-[#c5a84f]/20" alt="" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c5a84f] to-[#e8c97a] flex items-center justify-center text-[#0b0f1a] text-4xl font-black mx-auto mb-4 shadow-xl">
                        {sortedParticipants[0].user_name[0]}
                      </div>
                    )}

                    <p className="text-white font-black text-2xl mb-1">{sortedParticipants[0].user_name}</p>
                    <p className="text-[#c5a84f] font-bold text-lg mb-2">{sortedParticipants[0].score} {txt.pts}</p>
                    <p className="text-white/30 text-xs">
                      {(sortedParticipants[0].answers || []).filter(a => a.correct).length}/{questions.length} {txt.correct}
                    </p>

                    {/* Vote champion separately */}
                    {sortedParticipants.reduce((m, p) => p.votes_count > (m?.votes_count ?? 0) ? p : m, sortedParticipants[0]) !== sortedParticipants[0] && (() => {
                      const voteChamp = sortedParticipants.reduce((m, p) => p.votes_count > m.votes_count ? p : m);
                      return (
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">
                            ❤️ {l === "fr" ? "Prix du Public" : l === "ht" ? "Pri Piblik" : "People's Choice"}
                          </p>
                          <p className="text-white font-bold">{voteChamp.user_name}</p>
                          <p className="text-white/40 text-xs">{voteChamp.votes_count} {txt.votes}</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Leaderboard */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex-1">{txt.leaderboard}</p>
              {(contest.status === "active" || contest.status === "voting") && (
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
              {participants.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-4xl mb-2 opacity-20">👥</div>
                  <p className="text-stone-300 text-xs">
                    {l === "fr" ? "Aucun participant encore." : l === "ht" ? "Pa gen patisipan ankò." : "No participants yet."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-50">
                  {sortedParticipants.map((p, i) => {
                    const correctCount = (p.answers || []).filter(a => a.correct).length;
                    const isMe = myParticipant?.id === p.id;
                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                    return (
                      <div key={p.id} className={`px-4 py-3.5 flex items-center gap-3 transition-colors ${isMe ? "bg-[#f8f6f2]" : "hover:bg-stone-50"}`}>
                        <span className="text-sm w-6 text-center shrink-0 font-black">
                          {medal ?? <span className="text-xs text-stone-300">{i + 1}</span>}
                        </span>
                        {p.user_avatar ? (
                          <img src={p.user_avatar} className="w-8 h-8 rounded-full shrink-0 border border-stone-100" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#0f2044] flex items-center justify-center text-white text-xs font-black shrink-0">
                            {p.user_name[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#0b0f1a] truncate">
                            {p.user_name}{isMe && <span className="text-[#c5a84f] text-[10px] ml-1">({l === "fr" ? "moi" : l === "ht" ? "mwen" : "me"})</span>}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {questions.length > 0 ? `${correctCount}/${questions.length} · ` : ""}{p.votes_count} ❤️
                          </p>
                        </div>
                        <span className="text-xs font-black text-[#0f2044] shrink-0 tabular-nums">{p.score}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Share + Next Step after voting/completed */}
      {(contest.status === "voting" || contest.status === "completed") && (
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-10 space-y-4">
          <ShareButton title={contest.title} context="contest" variant="banner" />
        </div>
      )}

      <NextStep context="contest" exclude={`/concours/${id}`} />
    </div>
  );
}
