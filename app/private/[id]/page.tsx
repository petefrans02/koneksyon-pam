"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/LangContext";
import Icon from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

interface Round {
  id: string;
  round_number: number;
  round_type: string;
  title: Record<string, string>;
  questions: unknown[];
  icon?: string;
  color_theme?: string;
}

interface Participant {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  joined_at?: string;
}

interface Contest {
  id: string;
  title: string;
  theme: string;
  status: string;
  invite_code: string;
  difficulty: string;
  target_language: string;
  num_rounds: number;
  organizer_id: string;
  auto_launch_count?: number;
  parent_contest_id?: string;
}

interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  player_avatar?: string;
  total_score: number;
  current_rank: number;
}

function t(o: Record<string, string> | undefined | null, l: Lang): string {
  if (!o) return "";
  return o[l] || o.fr || "";
}

const DIFF_LABELS: Record<string, Record<Lang, string>> = {
  easy: { fr: "Facile", ht: "Fasil", en: "Easy", es: "Fácil" },
  medium: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" },
  hard: { fr: "Expert", ht: "Ekspè", en: "Expert", es: "Experto" },
};

const LANG_LABELS: Record<string, string> = { fr: "Français", ht: "Kreyòl", en: "English" };

export default function OrganizerDashboard() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;

  const [contest, setContest] = useState<Contest | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [championshipPhase, setChampionshipPhase] = useState<string | null>(null);
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = useCallback(async () => {
    const [contestRes, roundsRes] = await Promise.all([
      fetch(`/api/contests/${id}`).then(r => r.json()),
      fetch(`/api/contests/${id}/rounds`).then(r => r.json()),
    ]);

    if (contestRes.contest) setContest(contestRes.contest);
    if (Array.isArray(roundsRes.rounds)) setRounds(roundsRes.rounds);
    // /api/contests/[id] already returns participants
    if (Array.isArray(contestRes.participants)) setParticipants(contestRes.participants);

    // Load championship state — redirect immediately if already active
    const stateRes = await fetch(`/api/engine/${id}/state`).then(r => r.json()).catch(() => ({}));
    if (stateRes.state) {
      const phase = stateRes.state.phase as string;
      setChampionshipPhase(phase);
      if (!["LOBBY", "CLOSED", "CANCELLED", "PODIUM", null].includes(phase)) {
        router.push(`/championnats/${id}/lobby`);
        return;
      }
    }

    // Engine leaderboard returns `entries`
    const lbRes = await fetch(`/api/engine/${id}/leaderboard`).then(r => r.json()).catch(() => ({}));
    if (Array.isArray(lbRes.entries)) setLeaderboard(lbRes.entries);

    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Poll every 3s while waiting for players — Realtime alone is not reliable enough
  useEffect(() => {
    if (!id) return;
    const poll = setInterval(async () => {
      // Only poll while in pending state (no active championship)
      const stateRes = await fetch(`/api/engine/${id}/state`).then(r => r.json()).catch(() => ({}));
      const phase = stateRes.state?.phase as string | undefined;
      if (phase && !["LOBBY", "CLOSED", "CANCELLED", "PODIUM", undefined, null].includes(phase)) {
        router.push(`/championnats/${id}/lobby`);
        clearInterval(poll);
        return;
      }
      // Refresh participant list
      const res = await fetch(`/api/contests/${id}`).then(r => r.json()).catch(() => ({}));
      if (Array.isArray(res.participants)) setParticipants(res.participants);
    }, 3000);
    return () => clearInterval(poll);
  }, [id, router]);

  // Realtime subscriptions for participants and championship state
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`organizer-${id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any,
        { event: "*", schema: "public", table: "contest_participants", filter: `contest_id=eq.${id}` },
        () => { load(); }
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any,
        { event: "*", schema: "public", table: "championship_state", filter: `contest_id=eq.${id}` },
        (payload: { new: { phase: string } }) => {
          const newPhase = payload.new?.phase;
          if (!newPhase) return;
          setChampionshipPhase(newPhase);
          // Auto-launched — redirect organizer to the game immediately
          if (!["LOBBY", "CLOSED", "CANCELLED", "PODIUM"].includes(newPhase)) {
            router.push(`/championnats/${id}/lobby`);
            return;
          }
          // Refresh leaderboard on phase change
          fetch(`/api/engine/${id}/leaderboard`).then(r => r.json()).then(d => {
            if (Array.isArray(d.entries)) setLeaderboard(d.entries);
          }).catch(() => {});
        }
      )
      .subscribe();

    realtimeRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [id, load]);

  async function handleLaunch() {
    if (!confirm(l === "fr" ? "Lancer le championnat maintenant ?" : l === "ht" ? "Kòmanse chanpyona a kounye a ?" : l === "es" ? "¿Lanzar el campeonato ahora?" : "Launch the championship now?")) return;
    setLaunching(true);
    try {
      const res = await fetch(`/api/engine/${id}/launch`, { method: "POST" });
      const d = await res.json();
      if (d.ok) {
        router.push(`/admin/concours/${id}/championship-control`);
      } else {
        alert(d.error || "Erreur lors du lancement");
      }
    } finally {
      setLaunching(false);
    }
  }

  async function handleStop() {
    if (!confirm(l === "fr" ? "Arrêter le championnat ?" : l === "es" ? "¿Detener el campeonato?" : "Stop the championship?")) return;
    await fetch(`/api/engine/${id}/end`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "end" }) });
    setChampionshipPhase("CLOSED");
  }

  function copyInviteCode() {
    if (!contest?.invite_code) return;
    navigator.clipboard.writeText(`${window.location.origin}/play/${contest.invite_code}`);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  }

  async function downloadResults() {
    const res = await fetch(`/api/engine/${id}/leaderboard`).then(r => r.json()).catch(() => ({}));
    const entries: LeaderboardEntry[] = res.leaderboard ?? [];
    const header = "Rang,Nom,Score Total";
    const rows = entries.map((e, i) => `${i + 1},${e.player_name},${e.total_score}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultats-${contest?.invite_code ?? id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isActive = championshipPhase && !["LOBBY", "CLOSED", "CANCELLED", null].includes(championshipPhase);
  const isDone = championshipPhase === "CLOSED" || championshipPhase === "PODIUM" || contest?.status === "completed";
  const inviteUrl = contest ? `${typeof window !== "undefined" ? window.location.origin : "https://koneksyonpam.com"}/play/${contest.invite_code}` : "";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#030918" }}>
      <div className="w-8 h-8 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );

  if (!contest) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#030918" }}>
      <p className="text-white/40">{l === "fr" ? "Championnat introuvable" : l === "ht" ? "Chanpyona pa jwenn" : l === "es" ? "Campeonato no encontrado" : "Championship not found"}</p>
      <Link href="/championnats" className="text-amber-400 text-sm font-bold">{l === "fr" ? "← Retour" : l === "ht" ? "← Tounen" : l === "es" ? "← Volver" : "← Back"}</Link>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#030918" }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(197,168,79,0.12) 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-5 py-10">
          <Link href="/championnats" className="inline-flex items-center gap-1 text-white/30 text-xs font-bold hover:text-white transition-colors mb-6">
            ← {l === "fr" ? "Mes championnats" : l === "ht" ? "Chanpyona mwen yo" : l === "es" ? "Mis campeonatos" : "My championships"}
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
                <Icon name="cadenas" size={12} /> {l === "fr" ? "Championnat Privé" : l === "ht" ? "Chanpyona Prive" : l === "es" ? "Campeonato Privado" : "Private Championship"}
              </div>
              <h1 className="text-white font-black text-2xl sm:text-3xl">{contest.title}</h1>
              {contest.theme && <p className="text-white/40 text-sm mt-0.5">{contest.theme}</p>}
              <div className="flex items-center gap-3 mt-2 text-white/30 text-xs">
                <span>{DIFF_LABELS[contest.difficulty]?.[l] ?? contest.difficulty}</span>
                <span>·</span>
                <span>{LANG_LABELS[contest.target_language] ?? contest.target_language}</span>
                <span>·</span>
                <span>{rounds.length} {l === "fr" ? "épreuves" : l === "ht" ? "epwèv" : l === "es" ? "rondas" : "rounds"}</span>
              </div>
            </div>
            <div className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
              contest.status === "active" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
              contest.status === "completed" ? "bg-stone-500/20 text-stone-400 border border-stone-500/30" :
              "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            }`}>
              {contest.status === "active" ? (l === "fr" ? "En cours" : l === "es" ? "En curso" : "Active") : contest.status === "completed" ? (l === "fr" ? "Terminé" : l === "es" ? "Terminado" : "Done") : (l === "fr" ? "En attente" : l === "es" ? "En espera" : "Pending")}
            </div>
          </div>

          {/* Invite code card */}
          <div className="rounded-3xl border border-amber-400/20 p-6 mb-6" style={{ background: "rgba(197,168,79,0.06)" }}>
            <p className="text-amber-400/60 text-xs font-black uppercase tracking-wider mb-3">
              {l === "fr" ? "Code d'invitation" : l === "ht" ? "Kòd envitasyon" : l === "es" ? "Código de invitación" : "Invite code"}
            </p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-amber-400 font-black text-4xl tracking-widest">{contest.invite_code}</span>
            </div>
            <div className="text-white/30 text-xs mb-4 font-mono break-all">{inviteUrl}</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={copyInviteCode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                style={{ background: copyDone ? "rgba(34,197,94,0.15)" : "rgba(197,168,79,0.12)", borderColor: copyDone ? "rgba(34,197,94,0.3)" : "rgba(197,168,79,0.3)", color: copyDone ? "#22c55e" : "#c5a84f", border: "1px solid" }}>
                <Icon name={copyDone ? "succes" : "lien"} size={16} />{copyDone ? (l === "fr" ? "Copié !" : l === "es" ? "¡Copiado!" : "Copied!") : (l === "fr" ? "Copier le lien" : l === "ht" ? "Kopye lyen" : l === "es" ? "Copiar enlace" : "Copy link")}
              </button>
              {typeof navigator !== "undefined" && navigator.share && (
                <button onClick={() => navigator.share({ title: contest.title, url: inviteUrl })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 font-bold text-sm hover:text-white transition-colors">
                  <Icon name="partage" size={16} /> {l === "fr" ? "Partager" : l === "ht" ? "Pataje" : l === "es" ? "Compartir" : "Share"}
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            {!isActive && !isDone && (() => {
              const target = contest?.auto_launch_count ?? 0;
              const ready = target > 0 && participants.length >= target;
              return (
                <>
                  {/* Player count indicator */}
                  {target > 0 && (
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${
                      ready
                        ? "border-green-500/40 bg-green-500/10"
                        : "border-amber-400/20 bg-amber-400/8"
                    }`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${ready ? "bg-green-400" : "bg-amber-400"}`} />
                      <span className={`font-bold text-sm ${ready ? "text-green-400" : "text-amber-400"}`}>
                        {ready
                          ? (l === "fr" ? `${participants.length}/${target} joueurs — Prêt à lancer !` : l === "ht" ? `${participants.length}/${target} jwè — Prè pou lanse !` : l === "es" ? `${participants.length}/${target} jugadores — ¡Listo para iniciar!` : `${participants.length}/${target} players — Ready to launch!`)
                          : (l === "fr" ? `${participants.length}/${target} connectés — vous pouvez commencer` : l === "ht" ? `${participants.length}/${target} konekte — ou ka kòmanse` : l === "es" ? `${participants.length}/${target} conectados — puedes empezar` : `${participants.length}/${target} joined — you can start`)}
                      </span>
                    </div>
                  )}
                  {/* Launch button — le host peut lancer dès qu'il est présent (dès le début) */}
                  <button
                    onClick={handleLaunch}
                    disabled={launching || participants.length === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-40"
                    style={participants.length > 0 ? {
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      color: "#fff",
                      boxShadow: "0 4px 24px rgba(34,197,94,0.35)",
                    } : {
                      background: "rgba(197,168,79,0.10)",
                      color: "#c5a84f",
                      border: "1px solid rgba(197,168,79,0.25)",
                    }}>
                    <Icon name={launching ? "chrono" : "fusee"} size={16} />
                    {" "}
                    {launching
                      ? (l === "fr" ? "Lancement…" : l === "es" ? "Iniciando…" : "Launching…")
                      : ready
                      ? (l === "fr" ? "Lancer le match !" : l === "ht" ? "Kòmanse match lan !" : l === "es" ? "¡Iniciar el partido!" : "Launch the match!")
                      : (l === "fr" ? "Commencer maintenant !" : l === "ht" ? "Kòmanse kounye a !" : l === "es" ? "¡Empezar ahora!" : "Start now!")}
                  </button>
                </>
              );
            })()}
            {isActive && (
              <>
                <Link href={`/admin/concours/${id}/championship-control`}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors">
                  <Icon name="classement" size={16} /> {l === "fr" ? "Panneau de contrôle" : l === "es" ? "Panel de control" : "Control panel"}
                </Link>
                <button onClick={handleStop}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                  <Icon name="fermer" size={16} /> {l === "fr" ? "Arrêter" : l === "es" ? "Detener" : "Stop"}
                </button>
              </>
            )}
            {(isDone || leaderboard.length > 0) && (
              <button onClick={downloadResults}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border border-white/10 text-white/50 hover:text-white transition-colors">
                <Icon name="telechargement" size={16} /> {l === "fr" ? "Télécharger résultats" : l === "es" ? "Descargar resultados" : "Download results"}
              </button>
            )}
          </div>

          {participants.length < (contest?.auto_launch_count ?? 2) && !isActive && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/8 px-5 py-4 mb-6">
              <p className="text-blue-400 text-sm inline-flex items-start gap-1.5">
                <Icon name="partage" size={14} className="mt-0.5 shrink-0" /> {l === "fr"
                  ? `Vous pouvez commencer dès maintenant, ou partager le code ci-dessus et attendre vos amis (départ automatique à ${contest?.auto_launch_count ?? 2} joueurs).`
                  : l === "ht"
                  ? `Ou ka kòmanse kounye a, oswa pataje kòd la pi wo epi tann zanmi ou yo (l ap kòmanse otomatikman ak ${contest?.auto_launch_count ?? 2} jwè).`
                  : l === "es"
                  ? `Puedes empezar ahora mismo, o compartir el código de arriba y esperar a tus amigos (inicio automático con ${contest?.auto_launch_count ?? 2} jugadores).`
                  : `You can start right now, or share the code above and wait for friends (auto-start at ${contest?.auto_launch_count ?? 2} players).`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Participants */}
            <div className="rounded-2xl border border-white/8 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-white/30 text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Icon name="utilisateurs" size={14} /> {l === "fr" ? "Participants" : l === "ht" ? "Patisipan" : l === "es" ? "Participantes" : "Participants"} ({participants.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {participants.length === 0 ? (
                  <p className="text-white/20 text-xs">{l === "fr" ? "En attente…" : l === "es" ? "Esperando…" : "Waiting…"}</p>
                ) : participants.slice(0, 20).map(p => (
                  <div key={p.user_id} className="flex items-center gap-2">
                    {p.user_avatar ? (
                      <img src={p.user_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                        {p.user_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-white/60 text-xs truncate">{p.user_name}</span>
                  </div>
                ))}
                {participants.length > 20 && (
                  <p className="text-white/20 text-xs">+{participants.length - 20} {l === "fr" ? "autres" : l === "ht" ? "lòt" : l === "es" ? "más" : "more"}</p>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="rounded-2xl border border-white/8 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-white/30 text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Icon name="trophee" size={14} /> {l === "fr" ? "Classement" : l === "ht" ? "Klasman" : l === "es" ? "Clasificación" : "Leaderboard"}
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {leaderboard.length === 0 ? (
                  <p className="text-white/20 text-xs">{l === "fr" ? "En attente du championnat…" : l === "es" ? "Esperando el campeonato…" : "Waiting for championship…"}</p>
                ) : leaderboard.slice(0, 10).map((e, i) => (
                  <div key={e.player_id} className="flex items-center gap-2">
                    <span className="text-white/30 text-[10px] w-4 text-right">{i + 1}</span>
                    <span className="flex-1 text-white/70 text-xs truncate">{e.player_name}</span>
                    <span className="text-amber-400 font-black text-xs">{e.total_score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rounds */}
          <div>
            <p className="text-white/30 text-xs font-black uppercase tracking-wider mb-4">
              {l === "fr" ? "Épreuves générées" : l === "ht" ? "Epwèv yo" : l === "es" ? "Rondas generadas" : "Generated rounds"}
            </p>
            <div className="space-y-2">
              {rounds.map(round => {
                const isOpen = expandedRound === round.round_number;
                const qs = Array.isArray(round.questions) ? round.questions : [];
                return (
                  <div key={round.id} className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <button onClick={() => setExpandedRound(isOpen ? null : round.round_number)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left">
                      <span className="text-xl">{round.icon ?? <Icon name="eclair" size={20} />}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{t(round.title, l)}</p>
                        <p className="text-white/30 text-xs">{qs.length} {l === "fr" ? "questions" : "kesyon"} · {round.round_type}</p>
                      </div>
                      <span className="text-white/20 text-xs">{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/5 px-5 py-4 space-y-2">
                        {qs.map((q, qi) => {
                          const qObj = q as Record<string, unknown>;
                          const qText = (qObj.q as Record<string, string>)?.[l] ||
                            (qObj.statement as Record<string, string>)?.[l] ||
                            (qObj.verse as Record<string, string>)?.[l] ||
                            `Question ${qi + 1}`;
                          return (
                            <div key={qi} className="flex items-start gap-2 py-1 border-b border-white/5 last:border-0">
                              <span className="text-white/20 text-xs font-mono shrink-0 mt-0.5">{qi + 1}.</span>
                              <p className="text-white/50 text-xs leading-snug">{qText}</p>
                            </div>
                          );
                        })}
                        <Link href={`/admin/championship-studio/${id}`}
                          className="inline-flex items-center gap-1 text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors mt-2">
                          <Icon name="editer" size={13} /> {l === "fr" ? "Modifier dans le Studio" : l === "es" ? "Editar en el Studio" : "Edit in Studio"}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
