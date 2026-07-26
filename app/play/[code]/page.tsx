"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import Icon from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

interface ContestPreview {
  id: string;
  title: string;
  theme: string;
  status: string;
  invite_code: string;
  difficulty: string;
  target_language: string;
  num_rounds: number;
  player_count: number;
}

const DIFF_LABELS: Record<string, Record<Lang, string>> = {
  easy: { fr: "Facile", ht: "Fasil", en: "Easy", es: "Fácil" },
  medium: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
  hard: { fr: "Expert", ht: "Ekspè", en: "Expert", es: "Experto" },
};
const DIFF_COLORS: Record<string, string> = {
  easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444",
};

const LANG_LABELS: Record<string, string> = { fr: "Français", ht: "Kreyòl", en: "English" };

const LABELS = {
  fr: {
    loading: "Chargement…",
    invalid: "Code invalide",
    invalidDesc: "Ce code d'invitation n'existe pas ou a expiré.",
    back: "← Revenir à l'accueil",
    preview: "Championnat Privé",
    byInvite: "Par invitation",
    rounds: "épreuves",
    players: "joueurs inscrits",
    lang: "Langue",
    diff: "Niveau",
    join: "Rejoindre ce championnat",
    joining: "Inscription…",
    lobby: "Rejoindre la salle d'attente →",
    alreadyJoined: "Vous êtes déjà inscrit",
    active: "En cours — rejoignez maintenant !",
    completed: "Ce championnat est terminé.",
    upcoming: "En attente du lancement",
    loginRequired: "Connexion requise",
    loginHint: "Connectez-vous pour rejoindre ce championnat.",
    login: "Se connecter",
    joinError: "Erreur lors de l'inscription",
  },
  ht: {
    loading: "Ap chaje…",
    invalid: "Kòd pa valab",
    invalidDesc: "Kòd envitasyon sa a pa egziste oswa li ekspire.",
    back: "← Tounen",
    preview: "Chanpyona Prive",
    byInvite: "Pa envitasyon",
    rounds: "epwèv",
    players: "jwè enskriven",
    lang: "Lang",
    diff: "Nivo",
    join: "Rantre nan chanpyona a",
    joining: "Enskripsyon…",
    lobby: "Rantre nan chanm datant →",
    alreadyJoined: "Ou deja enskriven",
    active: "Ap jwe — rantre kounye a !",
    completed: "Chanpyona sa a fini.",
    upcoming: "Ap tann lancement an",
    loginRequired: "Koneksyon obligatwa",
    loginHint: "Konekte pou rantre nan chanpyona a.",
    login: "Konekte",
    joinError: "Erè pandan enskripsyon",
  },
  en: {
    loading: "Loading…",
    invalid: "Invalid code",
    invalidDesc: "This invite code doesn't exist or has expired.",
    back: "← Back to home",
    preview: "Private Championship",
    byInvite: "By invitation",
    rounds: "rounds",
    players: "players joined",
    lang: "Language",
    diff: "Level",
    join: "Join this championship",
    joining: "Joining…",
    lobby: "Enter the waiting room →",
    alreadyJoined: "You're already joined",
    active: "In progress — join now!",
    completed: "This championship is over.",
    upcoming: "Waiting to launch",
    loginRequired: "Login required",
    loginHint: "Sign in to join this championship.",
    login: "Sign in",
    joinError: "Error joining",
  },
  es: {
    loading: "Cargando…",
    invalid: "Código inválido",
    invalidDesc: "Este código de invitación no existe o ha expirado.",
    back: "← Volver al inicio",
    preview: "Campeonato Privado",
    byInvite: "Por invitación",
    rounds: "rondas",
    players: "jugadores inscritos",
    lang: "Idioma",
    diff: "Nivel",
    join: "Unirse a este campeonato",
    joining: "Uniéndose…",
    lobby: "Entrar a la sala de espera →",
    alreadyJoined: "Ya estás inscrito",
    active: "En curso — ¡únete ahora!",
    completed: "Este campeonato ha terminado.",
    upcoming: "Esperando el lanzamiento",
    loginRequired: "Inicio de sesión requerido",
    loginHint: "Inicia sesión para unirte a este campeonato.",
    login: "Iniciar sesión",
    joinError: "Error al unirse",
  },
};

export default function PlayByCodePage() {
  const params = useParams<{ code: string }>();
  const code = params.code?.toUpperCase();
  const router = useRouter();
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;
  const lb = LABELS[l];

  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<ContestPreview | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [loginNeeded, setLoginNeeded] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/private/join/${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.contest) {
          setContest(d.contest);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  async function handleJoin() {
    if (!contest) return;
    setJoinError(null);
    setJoining(true);

    const res = await fetch(`/api/contests/${contest.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (res.status === 401) {
      setLoginNeeded(true);
      setJoining(false);
      return;
    }

    const d = await res.json();
    if (d.ok || d.already_joined) {
      setJoined(true);
      // Auto-redirect to lobby so join-lobby can trigger the auto-launch
      setTimeout(() => router.push(`/championnats/${contest.id}/lobby`), 600);
    } else {
      setJoinError(d.error || lb.joinError);
    }
    setJoining(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#030918" }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/30 text-sm">{lb.loading}</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: "#030918" }}>
      <Icon name="recherche" size={56} className="mb-2 text-amber-400/70" />
      <h1 className="text-white font-black text-2xl text-center">{lb.invalid}</h1>
      <p className="text-white/40 text-sm text-center">{lb.invalidDesc}</p>
      <div className="mt-2 font-mono text-amber-400/50 text-sm border border-amber-400/20 rounded-xl px-5 py-2">
        {code}
      </div>
      <Link href="/" className="text-white/30 text-xs font-bold hover:text-white transition-colors mt-4">{lb.back}</Link>
    </div>
  );

  if (!contest) return null;

  const isCompleted = contest.status === "completed";
  const isActive = contest.status === "active";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#030918" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(197,168,79,0.14) 0%, transparent 60%)" }} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-amber-400 text-[11px] font-black uppercase tracking-widest">
              <Icon name="cadenas" size={13} /> {lb.preview}
            </div>
          </div>

          {/* Code display */}
          <div className="text-center mb-8">
            <p className="text-white/20 text-xs font-black uppercase tracking-widest mb-2">{lb.byInvite}</p>
            <div className="font-mono text-3xl font-black text-amber-400 tracking-[0.2em] mb-1">{contest.invite_code}</div>
          </div>

          {/* Contest card */}
          <div className="rounded-3xl border border-white/10 p-6 mb-6" style={{ background: "rgba(255,255,255,0.04)" }}>
            <h1 className="text-white font-black text-xl leading-tight mb-1">{contest.title}</h1>
            {contest.theme && contest.theme !== contest.title && (
              <p className="text-white/40 text-sm mb-4">{contest.theme}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-center">
                <p className="text-white font-black text-lg">{contest.num_rounds}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">{lb.rounds}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-center">
                <p className="text-white font-black text-lg">{contest.player_count}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">{lb.players}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-wider">{lb.diff}</p>
                <p className="font-bold text-xs mt-0.5" style={{ color: DIFF_COLORS[contest.difficulty] ?? "#c5a84f" }}>
                  {DIFF_LABELS[contest.difficulty]?.[l] ?? contest.difficulty}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/25 text-[10px] uppercase tracking-wider">{lb.lang}</p>
                <p className="text-white/60 font-bold text-xs mt-0.5">{LANG_LABELS[contest.target_language] ?? contest.target_language}</p>
              </div>
            </div>

            {/* Status */}
            <div className={`mt-4 rounded-xl px-3 py-2 text-center text-xs font-bold ${
              isActive ? "bg-green-500/15 text-green-400 border border-green-500/25" :
              isCompleted ? "bg-stone-500/15 text-stone-400 border border-stone-500/25" :
              "bg-blue-500/15 text-blue-400 border border-blue-500/25"
            }`}>
              <span className="inline-flex items-center justify-center gap-1.5">
                <Icon name={isActive ? "eclair" : isCompleted ? "succes" : "chrono"} size={14} />
                {isActive ? lb.active : isCompleted ? lb.completed : lb.upcoming}
              </span>
            </div>
          </div>

          {/* Actions */}
          {isCompleted ? (
            <p className="text-center text-white/20 text-sm">{lb.completed}</p>
          ) : loginNeeded ? (
            <div className="text-center">
              <p className="text-white/40 text-sm mb-4">{lb.loginHint}</p>
              <Link href={`/auth?redirect=/play/${code}`}
                className="block w-full py-4 rounded-2xl font-black text-center"
                style={{ background: "linear-gradient(135deg, #c5a84f, #d4b85c)", color: "#030918" }}>
                {lb.login}
              </Link>
            </div>
          ) : joined ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-center">
                <p className="text-green-400 font-bold text-sm inline-flex items-center gap-1.5"><Icon name="succes" size={14} /> {lb.alreadyJoined}</p>
              </div>
              <button
                onClick={() => router.push(`/championnats/${contest.id}/lobby`)}
                className="w-full py-4 rounded-2xl font-black text-base text-left px-6 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #c5a84f, #d4b85c)", color: "#030918" }}>
                <span>{lb.lobby}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {joinError && (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3">
                  <p className="text-red-400 text-sm">{joinError}</p>
                </div>
              )}
              <button onClick={handleJoin} disabled={joining}
                className="w-full py-4 rounded-2xl font-black text-base transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #c5a84f, #d4b85c)", color: "#030918", boxShadow: "0 4px 24px rgba(197,168,79,0.3)" }}>
                {joining ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                    {lb.joining}
                  </span>
                ) : lb.join}
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/" className="text-white/20 text-xs font-bold hover:text-white transition-colors">{lb.back}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
