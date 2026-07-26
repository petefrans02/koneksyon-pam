"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import Icon, { IconName } from "@/app/components/Icon";

const ROUND_ICONS: Record<string, IconName> = {
  mcq: "eclair", tf: "etincelles", fill: "editer", match: "lien",
  order_verse: "etude", chrono: "chrono", character: "utilisateur",
  location: "localisation", book: "cours", finale: "trophee",
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
  const [generatingRounds, setGeneratingRounds] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

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

  async function generateRounds() {
    setGeneratingRounds(true);
    setGenError(null);
    const res = await fetch(`/api/admin/contests/${id}/generate-rounds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ num_rounds: 5 }),
    });
    const d = await res.json();
    if (d.ok) {
      await loadData();
    } else {
      setGenError(d.error || "Erreur lors de la génération");
    }
    setGeneratingRounds(false);
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
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700"><span className="inline-flex items-center gap-1"><Icon name="eclair" size={12} /> IA</span></span>
                )}
              </div>
              <h1 className="text-xl font-black text-white">{contest.title}</h1>
              {contest.theme && <p className="text-[#c5a84f] text-sm mt-0.5">{contest.theme}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Championship Studio Link */}
        <Link
          href={`/admin/championship-studio/${id}`}
          className="flex items-center gap-4 bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-700/50 rounded-2xl px-6 py-4 hover:from-indigo-900 hover:to-purple-900 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-600/40 flex items-center justify-center text-2xl shrink-0">
            <Icon name="video" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-black text-indigo-300 text-base">Championship Studio</p>
            <p className="text-indigo-600 text-xs mt-0.5">Éditer les questions, prévisualiser, générer avec l&apos;IA</p>
          </div>
          <span className="text-indigo-600 group-hover:text-indigo-400 transition-colors text-xl">→</span>
        </Link>

        {/* Championship Control Panel Link */}
        <Link
          href={`/admin/concours/${id}/championship-control`}
          className="flex items-center gap-4 bg-gradient-to-r from-green-950 to-emerald-950 border border-green-700/50 rounded-2xl px-6 py-4 hover:from-green-900 hover:to-emerald-900 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-600/40 flex items-center justify-center text-2xl shrink-0">
            <Icon name="defi" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-black text-green-300 text-base">Contrôle Championnat</p>
            <p className="text-green-600 text-xs mt-0.5">Lancer, surveiller et contrôler le championnat en direct</p>
          </div>
          <span className="text-green-600 group-hover:text-green-400 transition-colors text-xl">→</span>
        </Link>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Inscrits", value: stats.registered, icon: "utilisateurs" },
              { label: "En jeu", value: stats.playing, icon: "defi" },
              { label: "Terminés", value: stats.completed, icon: "succes" },
              { label: "Temps restant", value: stats.seconds_remaining != null ? fmtSec(stats.seconds_remaining) : "—", icon: "chrono" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-stone-200 p-5 text-center shadow-sm">
                <span className="block mb-1"><Icon name={s.icon as IconName} size={24} /></span>
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
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-bold text-stone-900">{rounds.length} Manche{rounds.length !== 1 ? "s" : ""}</h2>
            {rounds.length > 0 && (
              <button onClick={generateRounds} disabled={generatingRounds}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 disabled:opacity-40 flex items-center gap-1">
                {generatingRounds ? "⏳ Génération..." : <><Icon name="eclair" size={14} /> Régénérer avec IA</>}
              </button>
            )}
          </div>

          {rounds.length === 0 ? (
            <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl"><Icon name="eclair" size={24} /></div>
              <div>
                <p className="font-bold text-stone-700 mb-1">Aucune manche disponible</p>
                <p className="text-stone-400 text-sm max-w-xs">
                  Ce concours a été créé avec l&apos;ancien système. Générez les manches avec l&apos;IA pour le rendre jouable.
                </p>
              </div>
              {genError && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-2">{genError}</p>
              )}
              <button
                onClick={generateRounds}
                disabled={generatingRounds}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl disabled:opacity-50 transition-colors"
              >
                {generatingRounds ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Génération en cours... (30-60s)
                  </>
                ) : (
                  <><Icon name="eclair" size={16} /> Générer les manches avec l&apos;IA</>
                )}
              </button>
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
                        <Icon name={ROUND_ICONS[r.round_type] ?? "exercice"} size={20} />
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
                                    {q.correct === oi && <Icon name="valider" size={13} className="inline align-middle ml-1" />}
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
