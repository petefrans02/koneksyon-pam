"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";
import Link from "next/link";
import Icon, { IconName } from "@/app/components/Icon";

type Tab = "overview" | "contests" | "private_matches" | "prayers" | "testimonies" | "churches" | "contacts" | "users";

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
  status: "upcoming" | "active" | "completed";
  max_participants: number;
  current_question: number;
  created_at: string;
  scheduled_start_at?: string;
  theme?: string;
  generated_by_ai?: boolean;
  enabled?: boolean;
  is_private?: boolean;
  allow_rejoin?: boolean;
  contest_participants: { count: number }[];
  contest_sessions?: { count: number }[];
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
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "overview";
    const p = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    const valid: Tab[] = ["overview", "contests", "private_matches", "prayers", "testimonies", "churches", "contacts", "users"];
    return p && valid.includes(p) ? p : "overview";
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [cleaningDups, setCleaningDups] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState<string | null>(null);

  async function cleanupDuplicates() {
    if (!confirm("Supprimer tous les concours privés en double ? (garde le plus récent de chaque groupe)")) return;
    setCleaningDups(true);
    const res = await fetch("/api/admin/cleanup-duplicate-contests", { method: "POST" });
    const d = await res.json();
    if (d.ok) {
      setCleanupMsg(d.deleted === 0 ? "Aucun doublon trouvé." : `${d.deleted} doublon(s) supprimé(s) ✓`);
      // Refresh contests list if on that tab
      if (activeTab === "contests") {
        fetch("/api/admin/contests").then(r => r.json()).then(data => setContests(data.contests ?? []));
      }
    } else {
      setCleanupMsg("Erreur: " + d.error);
    }
    setCleaningDups(false);
    setTimeout(() => setCleanupMsg(null), 5000);
  }

  // Contests state
  const [contests, setContests] = useState<ContestRow[]>([]);
  const [loadingContests, setLoadingContests] = useState(false);
  const [expandedContest, setExpandedContest] = useState<string | null>(null);
  const [contestDetail, setContestDetail] = useState<Record<string, ContestDetail>>({});
  const [controlling, setControlling] = useState<string | null>(null);
  const [deletingContest, setDeletingContest] = useState<string | null>(null);
  const [sendingNotif, setSendingNotif] = useState<string | null>(null);
  const [notifResult, setNotifResult] = useState<Record<string, string>>({});
  const [notifSummary, setNotifSummary] = useState<Record<string, { sent: number; failed: number; last_sent: string }>>({});

  // Private matches
  interface PrivateMatch {
    id: string; title: string; theme?: string; status: string;
    invite_code?: string; created_at: string; organizer_name: string;
    participant_count: number; max_participants: number;
  }
  const [privateMatches, setPrivateMatches] = useState<PrivateMatch[]>([]);
  const [loadingPrivate, setLoadingPrivate] = useState(false);
  const [deletingAllPrivate, setDeletingAllPrivate] = useState(false);
  const [deletingPrivateId, setDeletingPrivateId] = useState<string | null>(null);
  const [privateMsg, setPrivateMsg] = useState<string | null>(null);

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

  function changeTab(tab: Tab) {
    setActiveTab(tab);
    const url = tab === "overview" ? "/admin" : `/admin?tab=${tab}`;
    history.replaceState(null, "", url);
  }

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

  // Load private matches when tab selected
  useEffect(() => {
    if (activeTab !== "private_matches" || !user) return;
    setLoadingPrivate(true);
    fetch("/api/admin/private-matches")
      .then(r => r.json())
      .then(d => { setPrivateMatches(d.matches ?? []); setLoadingPrivate(false); })
      .catch(() => setLoadingPrivate(false));
  }, [activeTab, user]);

  async function deleteAllPrivateMatches(mode: "all" | "completed") {
    const label = mode === "completed" ? "matchs privés terminés" : "TOUS les matchs privés";
    if (!confirm(`Supprimer ${label} ? Cette action est irréversible.`)) return;
    setDeletingAllPrivate(true);
    const res = await fetch(`/api/admin/private-matches?mode=${mode}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) {
      setPrivateMsg(`${d.deleted} match(s) supprimé(s) ✓`);
      setPrivateMatches(prev => mode === "completed"
        ? prev.filter(m => !["completed", "closed", "cancelled"].includes(m.status))
        : []
      );
    } else {
      setPrivateMsg("Erreur: " + d.error);
    }
    setDeletingAllPrivate(false);
    setTimeout(() => setPrivateMsg(null), 5000);
  }

  async function deleteOnePrivateMatch(id: string) {
    setDeletingPrivateId(id);
    const res = await fetch(`/api/admin/private-matches?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) setPrivateMatches(prev => prev.filter(m => m.id !== id));
    else setPrivateMsg("Erreur: " + d.error);
    setDeletingPrivateId(null);
  }

  // Load contests + notification summary when tab is selected
  useEffect(() => {
    if (activeTab !== "contests" || !user) return;
    setLoadingContests(true);
    Promise.all([
      fetch("/api/contests").then(r => r.json()),
      fetch("/api/admin/notifications").then(r => r.json()),
    ]).then(([contestsData, notifData]) => {
      // Filter out private matches (is_private true OR has an invite_code — catches old NULL records)
      setContests((contestsData.contests || []).filter((c: ContestRow & { invite_code?: string }) =>
        c.is_private !== true && !c.invite_code
      ));
      setNotifSummary(notifData.summary || {});
      setLoadingContests(false);
    }).catch(() => setLoadingContests(false));
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
    if (!confirm(`Réinitialiser « ${title} » ? Toutes les sessions et réponses seront supprimées, le statut revient à "programmé".`)) return;
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

  async function toggleContestEnabled(contestId: string, currentEnabled: boolean) {
    const newEnabled = !currentEnabled;
    // Optimistic update
    setContests(prev => prev.map(c => c.id === contestId ? { ...c, enabled: newEnabled } as ContestRow & { enabled: boolean } : c));
    const res = await fetch(`/api/contests/${contestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: newEnabled }),
    });
    if (!res.ok) {
      // Revert on failure
      setContests(prev => prev.map(c => c.id === contestId ? { ...c, enabled: currentEnabled } as ContestRow & { enabled: boolean } : c));
    }
  }

  async function toggleContestType(contestId: string, current: string) {
    const next = current === "advanced" ? "simple" : "advanced";
    setContests(prev => prev.map(c => c.id === contestId ? { ...c, contest_type: next } as ContestRow & { contest_type: string } : c));
    const res = await fetch(`/api/contests/${contestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contest_type: next }),
    });
    if (!res.ok) {
      setContests(prev => prev.map(c => c.id === contestId ? { ...c, contest_type: current } as ContestRow & { contest_type: string } : c));
    }
  }

  async function toggleSoloEnabled(contestId: string, current: boolean) {
    const next = !current;
    setContests(prev => prev.map(c => c.id === contestId ? { ...c, solo_enabled: next } as ContestRow & { solo_enabled: boolean } : c));
    const res = await fetch(`/api/contests/${contestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solo_enabled: next }),
    });
    if (!res.ok) {
      setContests(prev => prev.map(c => c.id === contestId ? { ...c, solo_enabled: current } as ContestRow & { solo_enabled: boolean } : c));
    }
  }

  async function toggleAllowRejoin(contestId: string, current: boolean) {
    const next = !current;
    setContests(prev => prev.map(c => c.id === contestId ? { ...c, allow_rejoin: next } as ContestRow : c));
    const res = await fetch(`/api/contests/${contestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allow_rejoin: next }),
    });
    if (!res.ok) {
      setContests(prev => prev.map(c => c.id === contestId ? { ...c, allow_rejoin: current } as ContestRow : c));
    }
  }

  async function sendContestNotification(contestId: string) {
    setSendingNotif(contestId);
    setNotifResult(prev => ({ ...prev, [contestId]: "" }));
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contest_id: contestId }),
    });
    const data = await res.json();
    setSendingNotif(null);
    if (data.ok) {
      setNotifSummary(prev => ({
        ...prev,
        [contestId]: {
          sent: (prev[contestId]?.sent ?? 0) + data.sent,
          failed: (prev[contestId]?.failed ?? 0) + data.failed,
          last_sent: new Date().toISOString(),
        },
      }));
    }
    setNotifResult(prev => ({
      ...prev,
      [contestId]: data.ok
        ? `✅ ${data.sent} envoyé(s) · ${data.failed} erreur(s) · ${data.already_sent} déjà notifiés`
        : `❌ ${data.error}`,
    }));
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
        <div className="mb-4 flex justify-center"><Icon name="cadenas" size={48} /></div>
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
        <div className="mb-4 flex justify-center"><Icon name="alerte" size={48} /></div>
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

  const tabs: { id: Tab; icon: IconName; label: string; count?: number }[] = [
    { id: "overview",       icon: "classement", label: "Vue d'ensemble" },
    { id: "contests",       icon: "trophee", label: "Concours",       count: contests.length || undefined },
    { id: "private_matches",icon: "cadenas", label: "Matchs Privés",  count: privateMatches.length || undefined },
    { id: "prayers",        icon: "priere", label: "Prières",         count: stats.prayers },
    { id: "testimonies",icon: "temoignages", label: "Témoignages",     count: stats.testimonies },
    { id: "churches",   icon: "eglise", label: "Groupes",         count: stats.churches },
    { id: "contacts",   icon: "email", label: "Messages",        count: stats.contacts },
    { id: "users",      icon: "utilisateurs", label: "Utilisateurs",    count: stats.users },
  ];
  // Note: Votes tab removed — contest system migrated to performance-based scoring

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
              onClick={() => changeTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-blue-300"
              }`}
            >
              <Icon name={tab.icon} size={18} /> {tab.label}
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
              {([
                { label: "Utilisateurs", value: stats.users, icon: "utilisateurs", color: "from-violet-500 to-purple-600" },
                { label: "Prières", value: stats.prayers, icon: "priere", color: "from-cyan-500 to-blue-600" },
                { label: "Témoignages", value: stats.testimonies, icon: "temoignages", color: "from-amber-400 to-orange-500" },
                { label: "Groupes", value: stats.churches, icon: "eglise", color: "from-blue-600 to-indigo-700" },
                { label: "Messages", value: stats.contacts, icon: "email", color: "from-green-500 to-emerald-600" },
                { label: "Dons (USD)", value: `$${(stats.totalDons / 100).toFixed(0)}`, icon: "don", color: "from-rose-500 to-pink-600" },
              ] as { label: string; value: string | number; icon: IconName; color: string }[]).map((s) => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
                  <span className="block mb-2"><Icon name={s.icon} size={24} /></span>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Bannière Championnat Biblique */}
            <Link href="/admin/championnat" className="block rounded-2xl p-6 mb-2 transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#14213f,#1a3568)", border: "1px solid #c8960f55", boxShadow: "0 8px 30px rgba(200,150,15,0.15)" }}>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 38 }}>🏆</span>
                <div className="flex-1">
                  <p style={{ color: "#e6b83c", fontWeight: 900, fontSize: 18 }}>Championnat Biblique</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Créer et gérer les championnats par équipes (façon Coupe du Monde) — groupes, poules, bracket, champion.</p>
                </div>
                <span style={{ color: "#e6b83c", fontWeight: 900 }}>→</span>
              </div>
            </Link>

            {/* Bannière Trading Center */}
            <Link href="/admin/trading-center" className="block rounded-2xl p-6 mb-2 transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#070e1c,#12203a)", border: "1px solid #38bdf855", boxShadow: "0 8px 30px rgba(56,189,248,0.13)" }}>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 38 }}>📈</span>
                <div className="flex-1">
                  <p style={{ color: "#67e8f9", fontWeight: 900, fontSize: 18 }}>Trading Center</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Flux d&apos;alertes TradingView, seuil de confiance, filtre IA, signaux, abonnements Premium et santé du webhook.</p>
                </div>
                <span style={{ color: "#67e8f9", fontWeight: 900 }}>→</span>
              </div>
            </Link>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="font-bold text-stone-900 mb-4">Navigation rapide</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {([
                  { href: "/communaute", icon: "eglise", label: "Groupes" },
                  { href: "/prieres", icon: "priere", label: "Prières" },
                  { href: "/temoignages", icon: "temoignages", label: "Témoignages" },
                  { href: "/admin/question-bank", icon: "fondation", label: "Banque de Questions" },
                  { href: "/admin/game-content", icon: "defi", label: "Contenu des Jeux" },
                  { href: "/admin/dons", icon: "don", label: "Dashboard Dons" },
                  { href: "/admin/analytiques", icon: "classement", label: "Analytiques" },
                  { href: "/admin/integrations", icon: "lien", label: "Intégrations" },
                  { href: "/admin/campaigns", icon: "notifications", label: "Campagnes email" },
                  { href: "/concours/creer", icon: "trophee", label: "Créer un concours" },
                  { href: "/admin/championnat", icon: "trophee", label: "🏆 Championnat" },
                ] as { href: string; icon: IconName; label: string }[]).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 text-center font-medium text-blue-700 text-sm transition-colors"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5"><Icon name={l.icon} size={18} /> {l.label}</span>
                  </Link>
                ))}
              </div>

              {/* Cleanup duplicates */}
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-3">
                <button onClick={cleanupDuplicates} disabled={cleaningDups}
                  className="px-4 py-2 rounded-xl font-bold text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors disabled:opacity-50">
                  {cleaningDups ? "Nettoyage…" : <span className="inline-flex items-center gap-1.5"><Icon name="supprimer" size={16} /> Supprimer les doublons privés</span>}
                </button>
                {cleanupMsg && <span className="text-sm font-bold text-stone-600">{cleanupMsg}</span>}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <p className="font-bold text-cyan-400 text-sm mb-3 flex items-center gap-1.5"><Icon name="cadenas" size={18} /> Architecture de sécurité</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5"><Icon name="valider" size={16} /></span>
                  <span className="text-white/70"><strong className="text-white">Middleware Edge</strong> — chaque requête /admin est interceptée et vérifiée avant le chargement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5"><Icon name="valider" size={16} /></span>
                  <span className="text-white/70"><strong className="text-white">Double vérification serveur</strong> — chaque API /api/admin/* re-vérifie indépendamment la session</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5"><Icon name="valider" size={16} /></span>
                  <span className="text-white/70"><strong className="text-white">Service Role Key</strong> — les requêtes DB admin utilisent la clé privée Supabase (jamais exposée au client)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5"><Icon name="valider" size={16} /></span>
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
              const count = c.contest_sessions?.[0]?.count ?? c.contest_participants?.[0]?.count ?? 0;
              const statusColor: Record<string, string> = {
                upcoming: "bg-blue-100 text-blue-700",
                active: "bg-green-100 text-green-700",
                completed: "bg-stone-100 text-stone-500",
              };
              const statusLabel: Record<string, string> = {
                upcoming: "Programmé", active: "En direct", completed: "Terminé",
              };
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  {/* Contest header */}
                  <div className="px-6 py-5 flex flex-col gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColor[c.status] ?? "bg-stone-100 text-stone-500"}`}>
                          {c.status === "active" && <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse" />}
                          {statusLabel[c.status] ?? c.status}
                        </span>
                        {c.generated_by_ai && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700 inline-flex items-center gap-1"><Icon name="eclair" size={12} /> IA</span>
                        )}
                        <span className="text-stone-400 text-xs">{count}/{c.max_participants}</span>
                        {c.scheduled_start_at && (
                          <span className="text-stone-400 text-xs">
                            · {new Date(c.scheduled_start_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-stone-900 text-lg leading-tight break-words">{c.title}</h3>
                      {c.theme && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#c5a84f]/10 text-[#c5a84f]">
                          {c.theme}
                        </span>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-stone-100">
                      {c.status === "upcoming" && (
                        <button onClick={() => controlContest(c.id, "next_status")} disabled={controlling === c.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                          {controlling === c.id ? "..." : "▶ Démarrer"}
                        </button>
                      )}
                      {c.status === "active" && (
                        <button onClick={() => controlContest(c.id, "next_status")} disabled={controlling === c.id}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                          {controlling === c.id ? "..." : "Terminer"}
                        </button>
                      )}
                      <button
                        onClick={() => toggleContestEnabled(c.id, c.enabled !== false)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                          c.enabled === false
                            ? "bg-stone-50 text-stone-400 border-stone-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-stone-50 hover:text-stone-500"
                        }`}>
                        {c.enabled === false ? "⏸ Inactif" : <span className="inline-flex items-center gap-1"><Icon name="succes" size={14} /> Actif</span>}
                      </button>
                      <button
                        onClick={() => toggleSoloEnabled(c.id, (c as ContestRow & { solo_enabled?: boolean }).solo_enabled === true)}
                        title="Autoriser les joueurs à jouer ce concours en solo (entraînement)"
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                          (c as ContestRow & { solo_enabled?: boolean }).solo_enabled === true
                            ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-stone-50 hover:text-stone-500"
                            : "bg-stone-50 text-stone-400 border-stone-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                        }`}>
                        {(c as ContestRow & { solo_enabled?: boolean }).solo_enabled === true ? "🎯 Solo activé" : "🎯 Solo désactivé"}
                      </button>
                      <button
                        onClick={() => toggleContestType(c.id, (c as ContestRow & { contest_type?: string }).contest_type ?? "simple")}
                        title="Concours par équipes (églises / associations) vs concours simple"
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                          (c as ContestRow & { contest_type?: string }).contest_type === "advanced"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-stone-50 hover:text-stone-500"
                            : "bg-stone-50 text-stone-400 border-stone-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                        }`}>
                        {(c as ContestRow & { contest_type?: string }).contest_type === "advanced" ? "⛪ Avancé (équipes)" : "👤 Simple"}
                      </button>
                      <button
                        onClick={() => toggleAllowRejoin(c.id, c.allow_rejoin !== false)}
                        title="Autoriser les joueurs à rejoindre après avoir quitté"
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                          c.allow_rejoin === false
                            ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-stone-50"
                            : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-orange-50 hover:text-orange-700"
                        }`}>
                        {c.allow_rejoin === false ? <span className="inline-flex items-center gap-1"><Icon name="cadenas" size={14} /> Sans reprise</span> : <span className="inline-flex items-center gap-1"><Icon name="cle" size={14} /> Reprise OK</span>}
                      </button>
                      <button onClick={() => sendContestNotification(c.id)} disabled={sendingNotif === c.id}
                        className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                        {sendingNotif === c.id ? "Envoi..." : <span className="inline-flex items-center gap-1"><Icon name="notifications" size={14} /> Notifier</span>}
                      </button>
                      <Link href={`/admin/concours/${c.id}`}
                        className="border border-stone-200 text-stone-600 hover:border-stone-400 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                        Détails
                      </Link>
                      <button onClick={() => loadDetail(c.id)}
                        className="border border-stone-200 text-stone-600 hover:border-stone-400 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                        {expandedContest === c.id ? "▲" : "▼ Questions"}
                      </button>
                      <button onClick={() => resetContest(c.id, c.title)} disabled={controlling === c.id}
                        className="bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                        {controlling === c.id ? "..." : "Reset"}
                      </button>
                      <button onClick={() => deleteContest(c.id, c.title)} disabled={deletingContest === c.id}
                        className="bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                        {deletingContest === c.id ? "..." : "Supprimer"}
                      </button>
                    </div>
                  </div>

                  {/* Notification summary (historical) */}
                  {notifSummary[c.id] && !notifResult[c.id] && (
                    <div className="px-6 py-2 text-xs text-stone-500 border-t border-stone-100 bg-stone-50 flex items-center gap-2">
                      <Icon name="email" size={14} />
                      <span>
                        {notifSummary[c.id].sent} email{notifSummary[c.id].sent !== 1 ? "s" : ""} envoyé{notifSummary[c.id].sent !== 1 ? "s" : ""}
                        {notifSummary[c.id].failed > 0 && ` · ${notifSummary[c.id].failed} erreur(s)`}
                        {notifSummary[c.id].last_sent && ` · dernier envoi ${new Date(notifSummary[c.id].last_sent).toLocaleDateString("fr")}`}
                      </span>
                    </div>
                  )}
                  {/* Notification result (after clicking Notifier) */}
                  {notifResult[c.id] && (
                    <div className={`px-6 py-2 text-xs font-medium border-t ${notifResult[c.id].startsWith("✅") ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                      {notifResult[c.id]}
                    </div>
                  )}

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
                                          {q.correct_answer === oi && <Icon name="valider" size={14} className="inline ml-1 align-middle" />}
                                        </div>
                                      ))}
                                    </div>
                                    {q.reference && <p className="text-[10px] text-stone-400 font-medium">{q.reference}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Participants */}
                          <div className="lg:w-64 shrink-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">
                              Participants ({contestDetail[c.id].participants.length})
                            </p>
                            {contestDetail[c.id].participants.length === 0 ? (
                              <p className="text-stone-400 text-xs">Aucun participant</p>
                            ) : (
                              <div className="space-y-2">
                                {[...contestDetail[c.id].participants]
                                  .sort((a, b) => b.score - a.score)
                                  .map((p, i) => (
                                  <div key={p.id} className="bg-white rounded-xl px-4 py-3 border border-stone-200 flex items-center gap-3">
                                    <span className="text-xs font-black text-stone-300 w-4 shrink-0">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-stone-800 truncate">{p.profiles?.name ?? "Anonyme"}</p>
                                      <p className="text-[10px] text-stone-400">{p.score} pts</p>
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

        {/* ── MATCHS PRIVÉS ── */}
        {activeTab === "private_matches" && (
          <div className="space-y-4">
            {/* Actions bar */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-stone-900 text-sm">Matchs privés créés par les utilisateurs</h2>
                <p className="text-stone-400 text-xs mt-0.5">Gérez ici toutes les sessions privées. Les championnats publics ne sont pas affectés.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => deleteAllPrivateMatches("completed")}
                  disabled={deletingAllPrivate}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-colors disabled:opacity-50"
                >
                  {deletingAllPrivate ? "Suppression…" : <span className="inline-flex items-center gap-1.5"><Icon name="supprimer" size={16} /> Supprimer les terminés</span>}
                </button>
                <button
                  onClick={() => deleteAllPrivateMatches("all")}
                  disabled={deletingAllPrivate}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                >
                  {deletingAllPrivate ? "Suppression…" : <span className="inline-flex items-center gap-1.5"><Icon name="alerte" size={16} /> Supprimer TOUT</span>}
                </button>
                <button
                  onClick={() => { setLoadingPrivate(true); fetch("/api/admin/private-matches").then(r => r.json()).then(d => { setPrivateMatches(d.matches ?? []); setLoadingPrivate(false); }); }}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors"
                >
                  ↺ Rafraîchir
                </button>
              </div>
              {privateMsg && <span className="w-full text-sm font-bold text-stone-600">{privateMsg}</span>}
            </div>

            {/* List */}
            {loadingPrivate ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : privateMatches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 text-sm">
                Aucun match privé trouvé
              </div>
            ) : (
              <div className="space-y-2">
                {privateMatches.map(m => {
                  const statusColor = m.status === "active"
                    ? "bg-green-100 text-green-700"
                    : m.status === "upcoming"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-stone-100 text-stone-500";
                  return (
                    <div key={m.id} className="bg-white rounded-2xl border border-stone-200 px-5 py-4 shadow-sm flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                            {m.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-stone-400">{m.participant_count}/{m.max_participants} joueurs</span>
                          {m.invite_code && (
                            <span className="text-xs font-mono bg-stone-100 text-stone-500 px-2 py-0.5 rounded">#{m.invite_code}</span>
                          )}
                        </div>
                        <p className="font-bold text-stone-900 mt-1 text-sm truncate">{m.title}</p>
                        <p className="text-stone-400 text-xs mt-0.5">
                          Par <strong className="text-stone-600">{m.organizer_name}</strong>
                          {" · "}
                          {new Date(m.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteOnePrivateMatch(m.id)}
                        disabled={deletingPrivateId === m.id}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {deletingPrivateId === m.id ? "…" : "Supprimer"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── DATA TABLES ── */}
        {activeTab !== "overview" && activeTab !== "contests" && activeTab !== "private_matches" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-bold text-stone-900">
                {tabs.find((t) => t.id === activeTab)?.icon && (
                  <Icon name={tabs.find((t) => t.id === activeTab)!.icon} size={18} className="inline align-middle" />
                )}{" "}
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
              <p className="text-stone-400 text-xs mt-1">{date} · <Icon name="priere" size={14} className="inline align-middle" /> {String(row.pray_count || 0)}</p>
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
