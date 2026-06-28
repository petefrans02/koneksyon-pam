"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";

const ROUND_ICONS: Record<string, string> = {
  mcq: "⚡", tf: "🔮", fill: "📝", match: "🔗",
  order_verse: "📖", chrono: "⏳", character: "👤",
  location: "🗺️", book: "📚", finale: "🏆",
};

const ROUND_LABELS: Record<string, string> = {
  mcq: "QCM", tf: "Vrai/Faux", fill: "Compléter", match: "Associer",
  order_verse: "Ordre verset", chrono: "Chronologique", character: "Personnage",
  location: "Lieu biblique", book: "Livre", finale: "Finale",
};

interface Round {
  id: string;
  round_number: number;
  round_type: string;
  title: { fr: string; ht?: string; en?: string };
  color_theme: string;
  icon: string;
  time_limit_sec: number;
  points_per_q: number;
  questions: unknown[];
}

interface Contest {
  id: string;
  title: string;
  description?: string;
  theme?: string;
  status: string;
  scheduled_start_at?: string;
  started_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  season_number?: number;
  generated_by_ai?: boolean;
  enabled?: boolean;
}

interface LiveStats {
  registered: number;
  playing: number;
  completed: number;
  seconds_remaining: number | null;
}

export default function AdminContestDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [contest, setContest] = useState<Contest | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [controlling, setControlling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) router.replace("/admin");
      else setAuthed(true);
    });
  }, [router]);

  const loadData = useCallback(async () => {
    const [contestRes, roundsRes, statsRes] = await Promise.all([
      fetch(`/api/contests/${id}`),
      fetch(`/api/contests/${id}/rounds`),
      fetch(`/api/contests/${id}/live-stats`),
    ]);
    const [cd, rd, sd] = await Promise.all([contestRes.json(), roundsRes.json(), statsRes.json()]);
    setContest(cd.contest ?? cd);
    setRounds(rd.rounds ?? []);
    setStats(sd);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  async function control(action: string) {
    setControlling(true);
    await fetch(`/api/contests/${id}/control`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await loadData();
    setControlling(false);
  }

  async function deleteContest() {
    if (!contest || !confirm(`Supprimer définitivement « ${contest.title} » ?`)) return;
    await fetch(`/api/contests/${id}`, { method: "DELETE" });
    router.replace("/admin?tab=contests");
  }

  if (!authed || loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!contest) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-stone-400">Concours introuvable.</p>
    </div>
  );

  const statusColors: Record<string, string> = {
    upcoming: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-stone-100 text-stone-500",
  };
  const statusLabel: Record<string, string> = {
    upcoming: "Programmé",
    active: "En direct",
    completed: "Terminé",
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleString("fr-FR") : "—";
  const fmtSec = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin?tab=contests" className="text-white/50 hover:text-white text-sm transition-colors">
            ← Tous les concours
          </Link>
          <div className="mt-3 flex flex-wrap items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColors[contest.status] ?? "bg-stone-100 text-stone-500"}`}>
                  {contest.status === "active" && <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse" />}
                  {statusLabel[contest.status] ?? contest.status}
                </span>
                {contest.generated_by_ai && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700">⚡ IA</span>
                )}
              </div>
              <h1 className="text-xl font-black text-white">{contest.title}</h1>
              {contest.theme && <p className="text-[#c5a84f] text-sm mt-0.5">{contest.theme}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Inscrits", value: stats.registered, icon: "👥" },
              { label: "En jeu", value: stats.playing, icon: "🎮" },
              { label: "Terminés", value: stats.completed, icon: "✅" },
              { label: "Temps restant", value: stats.seconds_remaining != null ? fmtSec(stats.seconds_remaining) : "—", icon: "⏱️" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-stone-200 p-5 text-center shadow-sm">
                <span className="text-2xl block mb-1">{s.icon}</span>
                <p className="text-2xl font-black text-[#0f2044]">{s.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Contest info */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <h2 className="font-bold text-stone-900 mb-4">Informations</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "Programmé le", value: fmtDate(contest.scheduled_start_at) },
              { label: "Démarré le", value: fmtDate(contest.started_at) },
              { label: "Terminé le", value: fmtDate(contest.ended_at) },
              { label: "Durée", value: contest.duration_minutes ? `${contest.duration_minutes} min` : "45 min" },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">{f.label}</p>
                <p className="text-stone-800 font-medium mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <h2 className="font-bold text-stone-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {contest.status === "upcoming" && (
              <button onClick={() => control("next_status")} disabled={controlling}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
                ▶ Démarrer maintenant
              </button>
            )}
            {contest.status === "active" && (
              <button onClick={() => control("next_status")} disabled={controlling}
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
                Terminer le concours
              </button>
            )}
            <button onClick={() => control("reset")} disabled={controlling}
              className="bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
              Réinitialiser
            </button>
            <button onClick={deleteContest}
              className="bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
              Supprimer
            </button>
          </div>
        </div>

        {/* Rounds */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-bold text-stone-900">{rounds.length} Manches</h2>
          </div>
          {rounds.length === 0 ? (
            <div className="px-6 py-10 text-center text-stone-400 text-sm">
              Aucune manche — ce concours utilise l&apos;ancien système de questions.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {rounds.map(r => {
                const isOpen = expandedRound === r.id;
                const qs = r.questions as Record<string, unknown>[];
                return (
                  <div key={r.id}>
                    <button
                      onClick={() => setExpandedRound(isOpen ? null : r.id)}
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shrink-0"
                        style={{ background: r.color_theme }}
                      >
                        {ROUND_ICONS[r.round_type] ?? "📋"}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-stone-900 text-sm">
                          Manche {r.round_number} — {ROUND_LABELS[r.round_type] ?? r.round_type}
                        </p>
                        <p className="text-xs text-stone-400">
                          {qs?.length ?? 0} questions · {r.time_limit_sec}s · {r.points_per_q} pts/q
                        </p>
                      </div>
                      <span className="text-stone-300 text-xs">{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && (
                      <div className="bg-slate-50 px-6 py-4 border-t border-stone-100 space-y-2">
                        {!qs || qs.length === 0 ? (
                          <p className="text-xs text-stone-400">Aucune question</p>
                        ) : qs.map((q, qi) => (
                          <div key={qi} className="bg-white rounded-xl p-4 border border-stone-200 text-sm">
                            <p className="font-semibold text-stone-800 mb-1">
                              Q{qi + 1}.{" "}
                              {String((q.q as Record<string, string>)?.fr ?? (q.statement as Record<string, string>)?.fr ?? q.verse_with_blank ?? "Question")}
                            </p>
                            {q.ref ? <p className="text-xs text-[#c5a84f] font-medium">{String(q.ref)}</p> : null}
                            {Array.isArray(q.options) && (
                              <div className="grid grid-cols-2 gap-1 mt-2">
                                {(q.options as Record<string, string>[]).map((opt, oi) => (
                                  <div key={oi} className={`text-xs px-3 py-1.5 rounded-lg border ${
                                    q.correct === oi ? "bg-green-50 border-green-300 text-green-800 font-semibold" : "bg-stone-50 border-stone-200 text-stone-600"
                                  }`}>
                                    {String.fromCharCode(65 + oi)}. {opt.fr ?? String(opt)}
                                    {q.correct === oi && " ✓"}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
