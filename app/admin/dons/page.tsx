"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Stats {
  totalCount: number;
  totalAmount: number;
  todayAmount: number;
  monthAmount: number;
  byStatus: Record<string, number>;
}

interface Donation {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  donor_name: string | null;
  donor_email: string | null;
  paypal_capture_id: string | null;
  webhook_confirmed_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  completed:          "bg-emerald-100 text-emerald-700",
  webhook_confirmed:  "bg-blue-100   text-blue-700",
  pending:            "bg-yellow-100 text-yellow-700",
  denied:             "bg-red-100    text-red-700",
  refunded:           "bg-stone-100  text-stone-600",
};

const STATUS_LABEL: Record<string, string> = {
  completed:         "Confirmé",
  webhook_confirmed: "Webhook ✓",
  pending:           "En attente",
  denied:            "Refusé",
  refunded:          "Remboursé",
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminDonsPage() {
  const [user,  setUser]  = useState<{ email?: string } | null>(null);
  const [auth,  setAuth]  = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows,  setRows]  = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [exporting, setExporting] = useState(false);

  // ── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      if (user?.email === "petefrans03@gmail.com") setAuth(true);
      setLoading(false);
    });
  }, []);

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/donations");
    if (!res.ok) {
      setError("Erreur de chargement");
      setLoading(false);
      return;
    }
    const json = await res.json() as { stats: Stats; transactions: Donation[] };
    setStats(json.stats);
    setRows(json.transactions);
    setLoading(false);
  }, []);

  useEffect(() => { if (auth) load(); }, [auth, load]);

  // ── CSV export ─────────────────────────────────────────────────────────────
  async function exportCsv() {
    setExporting(true);
    const res = await fetch("/api/admin/donations?format=csv&limit=1000");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `koneksyonpam-dons-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!loading && (!user || !auth)) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Accès restreint</h2>
          <p className="text-stone-500 text-sm mb-6">Ce tableau de bord est réservé à l'administrateur.</p>
          <Link href="/admin" className="text-blue-600 underline text-sm">← Retour</Link>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: "Dons au total",    value: `$${fmt(stats.totalAmount)}`,  sub: `${stats.totalCount} transactions`, icon: "💝", color: "from-emerald-500 to-teal-600" },
    { label: "Ce mois",          value: `$${fmt(stats.monthAmount)}`,  sub: "dons du mois en cours",           icon: "📅", color: "from-blue-500 to-indigo-600" },
    { label: "Aujourd'hui",      value: `$${fmt(stats.todayAmount)}`,  sub: "reçus aujourd'hui",               icon: "☀️", color: "from-amber-500 to-orange-500" },
    { label: "Taux confirmation",
      value: stats.totalCount > 0
        ? `${Math.round(((stats.byStatus.webhook_confirmed ?? 0) / stats.totalCount) * 100)}%`
        : "—",
      sub: "webhooks PayPal confirmés", icon: "✓", color: "from-violet-500 to-purple-600" },
  ] : [];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-stone-400 hover:text-stone-700 text-sm">← Admin</Link>
            <span className="text-stone-300">/</span>
            <h1 className="font-bold text-stone-800 flex items-center gap-2">
              <span>💝</span> Tableau de bord des dons
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="text-sm text-stone-500 hover:text-stone-800 border border-stone-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              {loading ? (
                <span className="w-3 h-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
              ) : "↻"} Actualiser
            </button>
            <button
              onClick={exportCsv}
              disabled={exporting}
              className="text-sm font-semibold text-white bg-stone-800 hover:bg-stone-900 px-4 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              {exporting ? "…" : "⬇"} Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 text-xs font-medium uppercase tracking-wider">{card.label}</span>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="text-3xl font-black">{card.value}</p>
              <p className="text-white/60 text-xs mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        {stats && Object.keys(stats.byStatus).length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-stone-700 text-sm mb-3">Répartition par statut</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byStatus).map(([s, n]) => (
                <span key={s} className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[s] ?? "bg-stone-100 text-stone-600"}`}>
                  {STATUS_LABEL[s] ?? s} ({n})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transactions table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-bold text-stone-800">Dernières transactions</h2>
            <span className="text-xs text-stone-400">{rows.length} entrées</span>
          </div>

          {loading && rows.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-sm">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-stone-500 text-sm">Aucun don enregistré pour l'instant.</p>
              <p className="text-stone-400 text-xs mt-1">Les dons apparaîtront ici après la création de la table Supabase.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-left text-xs text-stone-500 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Donateur</th>
                    <th className="px-5 py-3">Montant</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3">Webhook</th>
                    <th className="px-5 py-3">ID Capture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5 text-stone-500 whitespace-nowrap">{fmtDate(row.created_at)}</td>
                      <td className="px-5 py-3.5">
                        {row.donor_name && <p className="font-medium text-stone-800">{row.donor_name}</p>}
                        {row.donor_email && <p className="text-xs text-stone-400">{row.donor_email}</p>}
                        {!row.donor_name && !row.donor_email && (
                          <span className="text-stone-300 italic text-xs">Anonyme</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-black text-stone-800">${fmt(row.amount)}</span>
                        <span className="text-stone-400 text-xs ml-1">{row.currency}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[row.status] ?? "bg-stone-100 text-stone-600"}`}>
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {row.webhook_confirmed_at ? (
                          <span className="text-emerald-600 font-semibold text-xs">✓ {fmtDate(row.webhook_confirmed_at)}</span>
                        ) : (
                          <span className="text-stone-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {row.paypal_capture_id ? (
                          <span className="font-mono text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                            {row.paypal_capture_id.slice(0, 14)}…
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-stone-300 mt-6">
          Les données proviennent de Supabase via le service role. Aucune donnée n'est exposée côté client.
        </p>
      </div>
    </div>
  );
}
