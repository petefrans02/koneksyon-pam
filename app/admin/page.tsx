"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";
import Link from "next/link";

type Tab = "overview" | "contests" | "prayers" | "testimonies" | "churches" | "contacts" | "users";

interface Stats {
  users: number;
  prayers: number;
  testimonies: number;
  churches: number;
  contacts: number;
  totalDons: number;
}

interface Row {
  id: string;
  created_at: string;
  [key: string]: unknown;
}

interface ContestRow {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "active" | "voting" | "completed";
  max_participants: number;
  current_question: number;
  created_at: string;
  contest_participants: { count: number }[];
}

interface Question {
  id: string;
  order_num: number;
  question_fr: string;
  options_fr: string[];
  correct_answer: number;
  reference: string;
}

interface Participant {
  id: string;
  score: number;
  votes_count: number;
  profiles: { name: string; avatar_url: string | null } | null;
}

interface ContestDetail {
  questions: Question[];
  participants: Participant[];
}

export default function AdminPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Contests state
  const [contests, setContests] = useState<ContestRow[]>([]);
  const [loadingContests, setLoadingContests] = useState(false);
  const [expandedContest, setExpandedContest] = useState<string | null>(null);
  const [contestDetail, setContestDetail] = useState<Record<string, ContestDetail>>({});
  const [controlling, setControlling] = useState<string | null>(null);
  const [deletingContest, setDeletingContest] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setStatsError(true);
        else setStats(d);
      })
      .catch(() => setStatsError(true));
  }, [user]);

  const loadTable = useCallback((tab: Tab) => {
    if (tab === "overview") return;
    const map: Record<string, string> = {
      prayers: "prayers",
      testimonies: "testimonies",
      churches: "churches",
      contacts: "contact_messages",
      users: "profiles",
    };
    setLoadingData(true);
    fetch(`/api/admin/data?table=${map[tab]}&limit=100`)
      .then((r) => r.json())
      .then((d) => { setRows(d.data || []); setLoadingData(false); });
  }, []);

  useEffect(() => {
    setRows([]);
    loadTable(activeTab);
  }, [activeTab, loadTable]);

  // Load contests when tab is selected
  useEffect(() => {
    if (activeTab !== "contests" || !user) return;
    setLoadingContests(true);
    fetch("/api/contests")
      .then(r => r.json())
      .then(d => { setContests(d.contests || []); setLoadingContests(false); });
  }, [activeTab, user]);

  async function loadDetail(contestId: string) {
    if (expandedContest === contestId) { setExpandedContest(null); return; }
    const res = await fetch(`/api/contests/${contestId}`);
    const data = await res.json();
    setContestDetail(prev => ({
      ...prev,
      [contestId]: { questions: data.questions || [], participants: data.participants || [] },
    }));
    setExpandedContest(contestId);
  }

  async function resetContest(contestId: string, title: string) {
    if (!confirm(`Réinitialiser « ${title} » ? Tous les participants et votes seront supprimés, le statut revient à "inscriptions ouvertes".`)) return;
    setControlling(contestId);
    const res = await fetch(`/api/contests/${contestId}/control`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    const data = await res.json();
    if (data.ok) {
      setContests(prev => prev.map(c => c.id === contestId
        ? { ...c, status: "upcoming", current_question: 0, contest_participants: [{ count: 0 }] }
        : c
      ));
      setContestDetail(prev => { const n = { ...prev }; delete n[contestId]; return n; });
      setExpandedContest(null);
    }
    setControlling(null);
  }

  async function controlContest(contestId: string, action: string) {
    setControlling(contestId);
    const res = await fetch(`/api/contests/${contestId}/control`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.ok) {
      setContests(prev => prev.map(c => c.id === contestId
        ? { ...c, status: data.status ?? c.status, current_question: data.current_question ?? c.current_question }
        : c
      ));
    }
    setControlling(null);
  }

  async function deleteContest(contestId: string, title: string) {
    if (!confirm(`Supprimer définitivement « ${title} » et toutes ses données ?`)) return;
    setDeletingContest(contestId);
    await fetch(`/api/contests/${contestId}`, { method: "DELETE" });
    setContests(prev => prev.filter(c => c.id !== contestId));
    setDeletingContest(null);
  }

  async function deleteRow(tab: Tab, id: string) {
    const map: Record<string, string> = {
      prayers: "prayers", testimonies: "testimonies",
      churches: "churches", contacts: "contact_messages",
    };
    if (!map[tab]) return;
    if (!confirm("Supprimer définitivement cet élément ?")) return;
    setDeleting(id);
    await fetch("/api/admin/data", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: map[tab], id }),
    });
    setRows((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
    if (stats) {
      const key = tab === "contacts" ? "contacts" : tab as keyof Stats;
      setStats((s) => s ? { ...s, [key]: Math.max(0, (s[key] as number) - 1) } : s);
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Panel Admin</h1>
        <p className="text-stone-500 text-sm mb-6">Accès réservé aux administrateurs de KONEKSYON PAM</p>
        <button
          onClick={() => signInWithGoogle()}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
        >
          Se connecter avec Google
        </button>
      </div>
    </div>
  );

  if (statsError) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Accès refusé</h1>
        <p className="text-stone-500 text-sm mb-4">Ce compte n&apos;est pas autorisé à accéder au panel admin.</p>
        <Link href="/" className="text-blue-500 hover:underline text-sm">← Retour à l&apos;accueil</Link>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Chargement du panel...</p>
      </div>
    </div>
  );

  const tabs: { id: Tab; icon: string; label: string; count?: number }[] = [
    { id: "overview",    icon: "📊", label: "Vue d'ensemble" },
    { id: "contests",   icon: "🏆", label: "Concours",       count: contests.length || undefined },
    { id: "prayers",    icon: "🙏", label: "Prières",         count: stats.prayers },
    { id: "testimonies",icon: "✨", label: "Témoignages",     count: stats.testimonies },
    { id: "churches",   icon: "⛪", label: "Groupes",         count: stats.churches },
    { id: "contacts",   icon: "📧", label: "Messages",        count: stats.contacts },
    { id: "users",      icon: "👥", label: "Utilisateurs",    count: stats.users },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-5 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-sm shadow-lg">
              KP
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Panel Administrateur</h1>
              <p className="text-white/40 text-xs">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-xs font-medium border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Connecté
            </div>
            <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
              ← Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-blue-300"
              }`}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Utilisateurs", value: stats.users, icon: "👥", color: "from-violet-500 to-purple-600" },
                { label: "Prières", value: stats.prayers, icon: "🙏", color: "from-cyan-500 to-blue-600" },
                { label: "Témoignages", value: stats.testimonies, icon: "✨", color: "from-amber-400 to-orange-500" },
                { label: "Groupes", value: stats.churches, icon: "⛪", color: "from-blue-600 to-indigo-700" },
                { label: "Messages", value: stats.contacts, icon: "📧", color: "from-green-500 to-emerald-600" },
                { label: "Dons (USD)", value: `$${(stats.totalDons / 100).toFixed(0)}`, icon: "💝", color: "from-rose-500 to-pink-600" },
              ].map((s) => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
                  <span className="text-2xl block mb-2">{s.icon}</span>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="font-bold text-stone-900 mb-4">Navigation rapide</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { href: "/eglise", label: "⛪ Groupes" },
                  { href: "/prieres", label: "🙏 Prières" },
                  { href: "/temoignages", label: "✨ Témoignages" },
                  { href: "/don", label: "💝 Dons" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 text-center font-medium text-blue-700 text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <p className="font-bold text-cyan-400 text-sm mb-3">🔐 Architecture de sécurité</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-white/70"><strong className="text-white">Middleware Edge</strong> — chaque requête /admin est interceptée et vérifiée avant le chargement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-white/70"><strong className="text-white">Double vérification serveur</strong> — chaque API /api/admin/* re-vérifie indépendamment la session</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-white/70"><strong className="text-white">Service Role Key</strong> — les requêtes DB admin utilisent la clé privée Supabase (jamais exposée au client)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-white/70"><strong className="text-white">Email autorisé</strong> — {user.email}</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ── CONCOURS ── */}
        {activeTab === "contests" && (
          <div className="space-y-4">
            {loadingContests ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 text-sm">Aucun concours</div>
            ) : contests.map(c => {
              const count = c.contest_participants?.[0]?.count ?? 0;
              const statusColor: Record<string, string> = {
                upcoming: "bg-blue-100 text-blue-700", active: "bg-green-100 text-green-700",
                voting: "bg-amber-100 text-amber-700", completed: "bg-stone-100 text-stone-500",
              };
              const statusLabel: Record<string, string> = {
                upcoming: "Inscriptions ouvertes", active: "En cours", voting: "Vote en cours", completed: "Terminé",
              };
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  {/* Contest header */}
                  <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColor[c.status]}`}>
                          {c.status === "active" && <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse" />}
                          {statusLabel[c.status]}
                        </span>
                        <span className="text-stone-400 text-xs">{count}/{c.max_participants} participants</span>
                      </div>
                      <h3 className="font-bold text-stone-900">{c.title}</h3>
                      {c.description && <p className="text-stone-400 text-xs mt-0.5 line-clamp-1">{c.description}</p>}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      {/* Status controls */}
                      {c.status === "upcoming" && (
                        <button onClick={() => controlContest(c.id, "next_status")} disabled={controlling === c.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                          {controlling === c.id ? "..." : "▶ Démarrer"}
                        </button>
                      )}
                      {c.status === "active" && (
                        <>
                          <button onClick={() => controlContest(c.id, "advance_question")} disabled={controlling === c.id}
                            className="bg-[#0f2044] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                            {controlling === c.id ? "..." : `Q.${c.current_question + 1} → Suivante`}
                          </button>
                          <button onClick={() => controlContest(c.id, "next_status")} disabled={controlling === c.id}
                            className="border border-amber-400 text-amber-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-50 disabled:opacity-50 transition-colors">
                            Ouvrir le vote
                          </button>
                        </>
                      )}
                      {c.status === "voting" && (
                        <button onClick={() => controlContest(c.id, "next_status")} disabled={controlling === c.id}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                          {controlling === c.id ? "..." : "Terminer & publier"}
                        </button>
                      )}
                      {/* View detail */}
                      <button onClick={() => loadDetail(c.id)}
                        className="border border-stone-200 text-stone-600 hover:border-stone-400 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                        {expandedContest === c.id ? "Masquer" : "Questions & Votes"}
                      </button>
                      {/* Reset */}
                      <button onClick={() => resetContest(c.id, c.title)} disabled={controlling === c.id}
                        className="bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                        {controlling === c.id ? "..." : "Réinitialiser"}
                      </button>
                      {/* Delete */}
                      <button onClick={() => deleteContest(c.id, c.title)} disabled={deletingContest === c.id}
                        className="bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                        {deletingContest === c.id ? "..." : "Supprimer"}
                      </button>
                    </div>
                  </div>

                  {/* Detail panel — questions + participants side by side */}
                  {expandedContest === c.id && (
                    <div className="border-t border-stone-100 bg-slate-50 px-6 py-5">
                      {!contestDetail[c.id] ? (
                        <p className="text-stone-400 text-xs py-4 text-center">Chargement...</p>
                      ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Questions */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Questions ({contestDetail[c.id].questions.length})</p>
                            {contestDetail[c.id].questions.length === 0 ? (
                              <p className="text-stone-400 text-xs">Aucune question</p>
                            ) : (
                              <div className="space-y-3">
                                {contestDetail[c.id].questions.map((q, i) => (
                                  <div key={q.id} className={`bg-white rounded-xl p-4 border ${c.status === "active" && c.current_question === i ? "border-green-400 ring-1 ring-green-200" : "border-stone-200"}`}>
                                    <div className="flex items-start gap-2 mb-2">
                                      <span className={`text-xs font-black shrink-0 ${c.status === "active" && c.current_question === i ? "text-green-600" : "text-[#c5a84f]"}`}>
                                        Q{i + 1}{c.status === "active" && c.current_question === i ? " ◀ en cours" : ""}
                                      </span>
                                      <p className="text-sm font-semibold text-stone-900">{q.question_fr}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                                      {q.options_fr.map((opt, oi) => (
                                        <div key={oi} className={`text-xs px-3 py-1.5 rounded-lg border ${
                                          q.correct_answer === oi
                                            ? "bg-green-50 border-green-300 text-green-800 font-semibold"
                                            : "bg-stone-50 border-stone-200 text-stone-600"
                                        }`}>
                                          <span className="font-black opacity-40 mr-1">{String.fromCharCode(65 + oi)}</span>
                                          {opt}
                                          {q.correct_answer === oi && " ✓"}
                                        </div>
                                      ))}
                                    </div>
                                    {q.reference && <p className="text-[10px] text-stone-400 font-medium">{q.reference}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Participants / votes */}
                          <div className="lg:w-64 shrink-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">
                              Participants ({contestDetail[c.id].participants.length})
                            </p>
                            {contestDetail[c.id].participants.length === 0 ? (
                              <p className="text-stone-400 text-xs">Aucun participant</p>
                            ) : (
                              <div className="space-y-2">
                                {[...contestDetail[c.id].participants]
                                  .sort((a, b) => (b.score + b.votes_count * 25) - (a.score + a.votes_count * 25))
                                  .map((p, i) => (
                                  <div key={p.id} className="bg-white rounded-xl px-4 py-3 border border-stone-200 flex items-center gap-3">
                                    <span className="text-xs font-black text-stone-300 w-4 shrink-0">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-stone-800 truncate">{p.profiles?.name ?? "Anonyme"}</p>
                                      <p className="text-[10px] text-stone-400">{p.score} pts · {p.votes_count} vote{p.votes_count !== 1 ? "s" : ""}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── DATA TABLES ── */}
        {activeTab !== "overview" && activeTab !== "contests" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-bold text-stone-900">
                {tabs.find((t) => t.id === activeTab)?.icon}{" "}
                {tabs.find((t) => t.id === activeTab)?.label}
                {rows.length > 0 && (
                  <span className="text-stone-400 font-normal ml-2 text-sm">({rows.length})</span>
                )}
              </h2>
              <button
                onClick={() => loadTable(activeTab)}
                className="text-blue-500 text-sm hover:underline"
              >
                Actualiser
              </button>
            </div>

            {loadingData ? (
              <div className="py-16 flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rows.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-stone-400 text-sm">Aucune donnée</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {rows.map((row) => (
                  <RowCard
                    key={row.id}
                    row={row}
                    tab={activeTab}
                    onDelete={() => deleteRow(activeTab, row.id)}
                    deleting={deleting === row.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RowCard({
  row, tab, onDelete, deleting,
}: {
  row: Row;
  tab: Tab;
  onDelete: () => void;
  deleting: boolean;
}) {
  const date = new Date(row.created_at).toLocaleString("fr");
  const canDelete = ["prayers", "testimonies", "churches", "contacts"].includes(tab);

  return (
    <div className="px-6 py-4 hover:bg-stone-50 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {tab === "prayers" && (
            <>
              <p className="font-medium text-stone-900 text-sm">
                {String(row.name || "Anonyme")}
                <span className="text-stone-400 font-normal"> · {String(row.country || "")}</span>
              </p>
              <p className="text-stone-600 text-sm mt-0.5 line-clamp-2">{String(row.text || "")}</p>
              <p className="text-stone-400 text-xs mt-1">{date} · 🙏 {String(row.pray_count || 0)}</p>
            </>
          )}
          {tab === "testimonies" && (
            <>
              <p className="font-medium text-stone-900 text-sm">
                {String(row.name || "Anonyme")}
                <span className="text-stone-400 font-normal"> · {String(row.country || "")}</span>
              </p>
              <p className="text-stone-600 text-sm mt-0.5 line-clamp-2">{String(row.text || "")}</p>
              <p className="text-stone-400 text-xs mt-1">{date}</p>
            </>
          )}
          {tab === "churches" && (
            <>
              <p className="font-medium text-stone-900 text-sm">
                {String(row.name || "")}
                <span className="text-stone-400 font-normal"> · {String(row.pastor_name || "")}</span>
              </p>
              <p className="text-stone-600 text-sm mt-0.5 line-clamp-1">{String(row.description || "")}</p>
              <p className="text-stone-400 text-xs mt-1">
                {date} · Code: <code className="bg-stone-100 px-1 rounded text-stone-600">{String(row.join_code || "")}</code>
              </p>
            </>
          )}
          {tab === "contacts" && (
            <>
              <p className="font-medium text-stone-900 text-sm">
                {String(row.name || "")}
                <span className="text-blue-500 font-normal"> · {String(row.email || "")}</span>
              </p>
              <p className="text-stone-600 text-sm mt-0.5 line-clamp-2">{String(row.message || "")}</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-stone-400 text-xs">{date}</p>
                <a
                  href={`mailto:${String(row.email || "")}?subject=Re: KONEKSYON PAM`}
                  className="text-blue-500 text-xs hover:underline"
                >
                  Répondre →
                </a>
              </div>
            </>
          )}
          {tab === "users" && (
            <>
              <p className="font-medium text-stone-900 text-sm">
                {String(row.display_name || row.full_name || row.name || "—")}
              </p>
              <p className="text-stone-500 text-xs mt-0.5">{String(row.email || "")}</p>
              <p className="text-stone-400 text-xs mt-1">{date}</p>
            </>
          )}
        </div>

        {canDelete && (
          <button
            onClick={onDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium border border-red-200 shrink-0"
          >
            {deleting ? "..." : "Supprimer"}
          </button>
        )}
      </div>
    </div>
  );
}
