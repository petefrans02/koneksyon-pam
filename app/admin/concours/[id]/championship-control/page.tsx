"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import Icon from "@/app/components/Icon";
import { ROUND_SPECS } from "@/lib/championship-rounds";
import type { ChampionshipStateRow, ChampionshipPhase, LeaderboardResponse } from "@/lib/championship-types";

const PHASE_LABELS: Record<ChampionshipPhase, string> = {
  LOBBY: "Salle d'attente",
  COUNTDOWN: "Compte à rebours",
  CHAMPIONSHIP_INTRO: "Introduction",
  ROUND_INTRO: "Intro manche",
  QUESTION_ACTIVE: "Question en cours",
  ANSWER_REVEAL: "Révélation",
  ROUND_RESULTS: "Résultats manche",
  BETWEEN_ROUNDS: "Transition",
  PODIUM: "Podium",
  CLOSED: "Terminé",
  CANCELLED: "Annulé",
};

const PHASE_COLORS: Record<ChampionshipPhase, string> = {
  LOBBY: "bg-blue-900/40 text-blue-300 border-blue-700",
  COUNTDOWN: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
  CHAMPIONSHIP_INTRO: "bg-purple-900/40 text-purple-300 border-purple-700",
  ROUND_INTRO: "bg-indigo-900/40 text-indigo-300 border-indigo-700",
  QUESTION_ACTIVE: "bg-green-900/40 text-green-300 border-green-700",
  ANSWER_REVEAL: "bg-orange-900/40 text-orange-300 border-orange-700",
  ROUND_RESULTS: "bg-cyan-900/40 text-cyan-300 border-cyan-700",
  BETWEEN_ROUNDS: "bg-violet-900/40 text-violet-300 border-violet-700",
  PODIUM: "bg-amber-900/40 text-amber-300 border-amber-700",
  CLOSED: "bg-slate-800/40 text-slate-400 border-slate-600",
  CANCELLED: "bg-red-900/40 text-red-300 border-red-700",
};

interface ContestInfo {
  id: string;
  title: string;
  status: string;
}

interface EventLog {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export default function ChampionshipControlPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [contest, setContest] = useState<ContestInfo | null>(null);
  const [state, setState] = useState<ChampionshipStateRow | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pausing, setPausing] = useState(false);
  const lbIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickedRef = useRef(false);

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) router.replace("/admin");
      else setAuthed(true);
    });
  }, [router]);

  const loadContest = useCallback(async () => {
    const res = await fetch(`/api/contests/${id}`);
    const d = await res.json();
    setContest(d.contest ?? d);
  }, [id]);

  const loadState = useCallback(async () => {
    const res = await fetch(`/api/engine/${id}/state`);
    if (res.ok) {
      const d = await res.json();
      setState(d.state ?? null);
    } else {
      setState(null);
    }
  }, [id]);

  const loadLeaderboard = useCallback(async () => {
    const res = await fetch(`/api/engine/${id}/leaderboard`);
    if (res.ok) setLeaderboard(await res.json());
  }, [id]);

  const loadEvents = useCallback(async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await db
      .from("championship_events")
      .select("id, event_type, payload, created_at")
      .eq("contest_id", id)
      .order("created_at", { ascending: false })
      .limit(10);
    setEvents(data ?? []);
  }, [id]);

  useEffect(() => {
    if (!authed) return;
    Promise.all([loadContest(), loadState(), loadLeaderboard(), loadEvents()])
      .finally(() => setLoading(false));
  }, [authed, loadContest, loadState, loadLeaderboard, loadEvents]);

  // Realtime subscription on championship_state
  useEffect(() => {
    if (!authed) return;
    const channel = supabase
      .channel(`admin-control-${id}-${Date.now()}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("postgres_changes" as any, {
        event: "*", schema: "public", table: "championship_state",
        filter: `contest_id=eq.${id}`,
      }, (payload: { new: ChampionshipStateRow }) => {
        if (payload.new) setState(payload.new);
        tickedRef.current = false;
        loadLeaderboard();
        loadEvents();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authed, id, loadLeaderboard, loadEvents]);

  // Auto-refresh leaderboard every 5s during active championship
  useEffect(() => {
    if (!state) return;
    const isActive = !["LOBBY", "CLOSED", "CANCELLED"].includes(state.phase);
    if (isActive) {
      lbIntervalRef.current = setInterval(loadLeaderboard, 5000);
    }
    return () => { if (lbIntervalRef.current) clearInterval(lbIntervalRef.current); };
  }, [state?.phase, loadLeaderboard]);

  async function doAction(action: "launch" | "end" | "cancel") {
    setActing(true);
    setError(null);
    try {
      let res: Response;
      if (action === "launch") {
        res = await fetch(`/api/engine/${id}/launch`, { method: "POST" });
      } else {
        res = await fetch(`/api/engine/${id}/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: action === "end" ? "end" : "cancel" }),
        });
      }
      const d = await res.json();
      if (!res.ok) setError(d.error ?? "Erreur");
      else {
        await loadContest();
        await loadState();
        await loadEvents();
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setActing(false);
    }
  }

  const isLive = state && !["LOBBY", "CLOSED", "CANCELLED"].includes(state.phase);
  const canLaunch = !state || ["LOBBY", "CLOSED", "CANCELLED"].includes(state.phase);
  const isPaused = !!(state?.metadata as Record<string, unknown>)?.is_paused;

  async function togglePause() {
    setPausing(true);
    setError(null);
    try {
      const res = await fetch(`/api/engine/${id}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isPaused ? "resume" : "pause" }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error ?? "Erreur pause");
      else { await loadState(); }
    } catch { setError("Erreur réseau"); }
    finally { setPausing(false); }
  }

  if (!authed || loading) return (
    <div className="min-h-screen bg-[#060d1f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const currentSpec = state ? ROUND_SPECS[state.round_index] : null;
  const timeLeft = state?.phase_ends_at
    ? Math.max(0, Math.ceil((new Date(state.phase_ends_at).getTime() - Date.now()) / 1000))
    : null;

  return (
    <div className="min-h-screen bg-[#060d1f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/80 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href={`/admin/concours/${id}`}
              className="text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors">
              ← Admin / Concours
            </Link>
            <h1 className="text-lg font-black text-white mt-0.5">
              <span className="inline-flex items-center gap-1.5"><Icon name="defi" size={20} /> Contrôle Championnat</span>
            </h1>
            {contest && <p className="text-slate-400 text-xs mt-0.5">{contest.title}</p>}
          </div>
          <div className="flex items-center gap-2">
            {state && (
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${PHASE_COLORS[state.phase]}`}>
                {state.phase === "QUESTION_ACTIVE" && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse" />}
                {PHASE_LABELS[state.phase]}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 text-red-300 text-sm">
            <span className="inline-flex items-center gap-1.5"><Icon name="alerte" size={16} /> {error}</span>
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* LAUNCH */}
          <button
            onClick={() => doAction("launch")}
            disabled={acting || !canLaunch}
            className="relative flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 font-black text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed
              bg-green-900/30 border-green-600 text-green-300 hover:bg-green-900/50 active:scale-95"
          >
            <Icon name="fusee" size={28} />
            <span>LANCER LE CHAMPIONNAT</span>
            {acting && <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
          </button>

          {/* PAUSE / RESUME */}
          <button
            onClick={togglePause}
            disabled={pausing || !isLive}
            className={`relative flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 font-black text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95
              ${isPaused
                ? "bg-emerald-900/30 border-emerald-500 text-emerald-300 hover:bg-emerald-900/50"
                : "bg-yellow-900/30 border-yellow-600 text-yellow-300 hover:bg-yellow-900/50"
              }`}
          >
            <span className="text-3xl">{isPaused ? "▶️" : "⏸️"}</span>
            <span>{isPaused ? "REPRENDRE" : "PAUSE"}</span>
            {pausing && <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
          </button>

          {/* EMERGENCY STOP */}
          <button
            onClick={() => { if (confirm("Arrêter le championnat maintenant ? Les scores seront calculés.")) doAction("end"); }}
            disabled={acting || !isLive}
            className="relative flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 font-black text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed
              bg-red-900/30 border-red-700 text-red-300 hover:bg-red-900/50 active:scale-95"
          >
            <span className="text-3xl">🛑</span>
            <span>ARRÊTER D'URGENCE</span>
          </button>

          {/* CANCEL */}
          <button
            onClick={() => { if (confirm("Annuler et remettre en 'programmé' ?")) doAction("cancel"); }}
            disabled={acting || (!isLive && !state)}
            className="relative flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 font-black text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed
              bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 active:scale-95"
          >
            <Icon name="fleche_gauche" size={28} />
            <span>ANNULER</span>
          </button>
        </div>

        {/* Live Stats Grid */}
        {state && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Joueurs", value: state.player_count, icon: "👥", color: "text-blue-300" },
              { label: "Ont répondu", value: `${state.answer_count} / ${state.player_count}`, icon: "✍️", color: "text-green-300" },
              { label: "Manche", value: `${state.round_index + 1} / 15`, icon: currentSpec?.icon ?? "📋", color: "text-amber-300" },
              { label: "Timer", value: timeLeft !== null ? `${timeLeft}s` : "—", icon: "⏱️", color: timeLeft !== null && timeLeft < 10 ? "text-red-400 animate-pulse" : "text-slate-300" },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/50 border border-white/8 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Round Progress */}
          <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              Progression — 15 Épreuves
            </h2>
            <div className="space-y-1.5">
              {ROUND_SPECS.map((spec, i) => {
                const isDone = state ? i < state.round_index : false;
                const isCurrent = state ? i === state.round_index && isLive : false;
                return (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    isCurrent ? "bg-white/10 ring-1 ring-white/20" : isDone ? "bg-green-900/20" : "opacity-40"
                  }`}>
                    <span className="text-base shrink-0">{spec.icon}</span>
                    <span className={`flex-1 font-semibold ${isCurrent ? "text-white" : isDone ? "text-green-400" : "text-slate-500"}`}>
                      {spec.name.fr}
                    </span>
                    <span className="shrink-0 font-mono">
                      {isDone ? <Icon name="succes" size={14} /> : isCurrent ? "▶" : `${spec.questions_count}q`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Leaderboard */}
          <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              Classement en Direct
            </h2>
            {!leaderboard || leaderboard.entries.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-8">Aucun joueur au classement encore</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.entries.slice(0, 10).map((entry, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-6 text-center text-xs font-black shrink-0 ${
                      i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-600"
                    }`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    {entry.player_avatar ? (
                      <img src={entry.player_avatar} alt="" className="w-6 h-6 rounded-full shrink-0 object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs shrink-0">
                        {entry.player_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 text-xs text-slate-300 font-medium truncate">{entry.player_name}</span>
                    <span className="text-xs font-black text-amber-400 shrink-0">{entry.total_score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Journal des Événements
          </h2>
          {events.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-4">Aucun événement</p>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {events.map(ev => (
                <div key={ev.id} className="flex items-start gap-3 text-slate-400">
                  <span className="text-slate-600 shrink-0 tabular-nums">
                    {new Date(ev.created_at).toLocaleTimeString("fr-FR")}
                  </span>
                  <span className={`shrink-0 font-bold ${
                    ev.event_type.includes("launch") ? "text-green-400" :
                    ev.event_type.includes("stop") || ev.event_type.includes("cancel") ? "text-red-400" :
                    ev.event_type.includes("phase") ? "text-blue-400" : "text-slate-400"
                  }`}>{ev.event_type}</span>
                  <span className="text-slate-600 truncate">
                    {JSON.stringify(ev.payload).slice(0, 80)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
