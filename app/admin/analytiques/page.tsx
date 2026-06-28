"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface PlatformStats {
  users: number;
  prayers: number;
  testimonies: number;
  churches: number;
  contacts: number;
  totalDons: number;
  newUsersToday?: number;
  newUsersThisWeek?: number;
  activeUsers?: number;
}

interface DonStats {
  totalAmount: number;
  totalCount: number;
  todayAmount: number;
  monthAmount: number;
}

export default function AdminAnalytiquesPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [donStats, setDonStats] = useState<DonStats | null>(null);
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === "petefrans03@gmail.com") {
        setAuthorized(true);
        loadData();
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function loadData() {
    const [platformRes, donRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/donations"),
    ]);

    if (platformRes.ok) setStats((await platformRes.json()) as PlatformStats);
    if (donRes.ok) {
      const d = (await donRes.json()) as { stats: DonStats };
      setDonStats(d.stats);
    }

    // Check if GA is configured
    if (typeof window !== "undefined") {
      setGaId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null);
    }

    setLoading(false);
  }

  if (!authorized && !loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <Link href="/admin" className="text-blue-600 underline">← Retour</Link>
        </div>
      </div>
    );
  }

  const kpis = stats && donStats ? [
    { label: "Membres inscrits",    value: stats.users.toLocaleString("fr-FR"),      icon: "👥", color: "from-violet-500 to-purple-600", desc: "comptes actifs" },
    { label: "Prières soumises",    value: stats.prayers.toLocaleString("fr-FR"),    icon: "🙏", color: "from-cyan-500 to-blue-600",   desc: "demandes de prière" },
    { label: "Témoignages",         value: stats.testimonies.toLocaleString("fr-FR"), icon: "✨", color: "from-amber-400 to-orange-500", desc: "histoires publiées" },
    { label: "Groupes d'église",    value: stats.churches.toLocaleString("fr-FR"),   icon: "⛪", color: "from-blue-500 to-indigo-600",  desc: "groupes créés" },
    { label: "Dons reçus",          value: `$${(donStats.totalAmount || 0).toFixed(2)}`, icon: "💝", color: "from-emerald-500 to-teal-600", desc: `${donStats.totalCount} transactions` },
    { label: "Messages de contact", value: stats.contacts.toLocaleString("fr-FR"),   icon: "📧", color: "from-rose-500 to-pink-600",   desc: "messages reçus" },
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
              <span>📊</span> Analytiques
            </h1>
          </div>
          <Link href="/admin/dons" className="text-sm text-blue-600 hover:underline">
            Voir détails des dons →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {loading ? (
          <div className="py-20 text-center text-stone-400">Chargement des données…</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {kpis.map((kpi) => (
                <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-sm`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
                    <span className="text-2xl">{kpi.icon}</span>
                  </div>
                  <p className="text-3xl font-black">{kpi.value}</p>
                  <p className="text-white/60 text-xs mt-1">{kpi.desc}</p>
                </div>
              ))}
            </div>

            {/* Dons breakdown */}
            {donStats && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-stone-800 mb-4">💰 Dons — Répartition temporelle</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center bg-stone-50 rounded-xl p-4">
                    <p className="text-2xl font-black text-stone-800">${donStats.todayAmount?.toFixed(2) ?? "0.00"}</p>
                    <p className="text-xs text-stone-500 mt-1">Aujourd'hui</p>
                  </div>
                  <div className="text-center bg-stone-50 rounded-xl p-4">
                    <p className="text-2xl font-black text-stone-800">${donStats.monthAmount?.toFixed(2) ?? "0.00"}</p>
                    <p className="text-xs text-stone-500 mt-1">Ce mois</p>
                  </div>
                  <div className="text-center bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-2xl font-black text-emerald-700">${donStats.totalAmount?.toFixed(2) ?? "0.00"}</p>
                    <p className="text-xs text-emerald-600 mt-1">Total historique</p>
                  </div>
                </div>
              </div>
            )}

            {/* Google Analytics section */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-stone-800">📈 Google Analytics 4</h2>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  gaId ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {gaId ? `✓ Actif · ${gaId}` : "Non configuré"}
                </span>
              </div>

              {gaId ? (
                <div>
                  <p className="text-stone-500 text-sm mb-5">
                    GA4 collecte : pages vues, sessions, pays, appareils, langues, et tous vos événements personnalisés (dons, prières, concours…).
                    Les données s'affichent sur <strong>analytics.google.com</strong> — cliquez un rapport ci-dessous pour y accéder directement.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Temps réel",       desc: "Visiteurs actifs maintenant", icon: "🔴", path: "realtime/overview" },
                      { label: "Rapport d'accueil",desc: "Vue générale 7 derniers jours", icon: "🏠", path: "reports/reportinghub" },
                      { label: "Pages vues",        desc: "Quelles pages sont visitées", icon: "📄", path: "reports/engagement/pages-and-screens" },
                      { label: "Pays & langues",    desc: "D'où viennent vos visiteurs", icon: "🌍", path: "reports/user/user-demographics-detail" },
                      { label: "Événements",        desc: "Dons, prières, concours…",    icon: "⚡", path: "reports/engagement/events" },
                      { label: "Appareils",         desc: "Mobile vs Desktop",            icon: "📱", path: "reports/user/user-technology-detail" },
                    ].map((r) => (
                      <a
                        key={r.label}
                        href={`https://analytics.google.com/analytics/web/#/${r.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col gap-1 bg-stone-50 hover:bg-blue-50 border border-stone-200 hover:border-blue-200 rounded-xl p-4 transition-colors group"
                      >
                        <span className="text-2xl">{r.icon}</span>
                        <span className="text-stone-800 font-semibold text-sm group-hover:text-blue-700">{r.label} →</span>
                        <span className="text-stone-400 text-xs">{r.desc}</span>
                      </a>
                    ))}
                  </div>
                  <p className="text-stone-400 text-xs mt-4">
                    Les données GA4 ne peuvent pas s'afficher directement ici pour des raisons de sécurité Google (OAuth requis).
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <p className="text-amber-800 font-semibold text-sm mb-2">Configuration requise</p>
                  <ol className="text-amber-700 text-sm space-y-1.5 list-decimal list-inside">
                    <li>Créez une propriété GA4 sur analytics.google.com</li>
                    <li>Copiez le Measurement ID (format G-XXXXXXXXXX)</li>
                    <li>Ajoutez <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX</code> dans Vercel</li>
                    <li>Redéployez — le tracking sera actif immédiatement</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Événements trackés */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h2 className="font-bold text-stone-800 mb-1">⚡ Événements suivis automatiquement</h2>
              <p className="text-stone-400 text-xs mb-4">Visibles dans GA4 → Engagement → Événements</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { icon: "📄", label: "page_view",             desc: "Chaque navigation" },
                  { icon: "🗣️", label: "language_change",       desc: "FR / HT / EN" },
                  { icon: "💳", label: "donate_click",           desc: "Clic bouton don" },
                  { icon: "🚀", label: "donate_paypal_start",    desc: "Redirection PayPal" },
                  { icon: "✅", label: "donate_paypal_success",  desc: "Don complété" },
                  { icon: "❌", label: "donate_paypal_error",    desc: "Erreur PayPal" },
                  { icon: "🙏", label: "prayer_submit",          desc: "Demande de prière" },
                  { icon: "✨", label: "testimony_publish",      desc: "Témoignage publié" },
                  { icon: "🏆", label: "contest_vote",           desc: "Vote concours" },
                  { icon: "🔐", label: "sign_up / login",        desc: "Création / Connexion" },
                  { icon: "🔍", label: "site_search",            desc: "Recherche" },
                  { icon: "⚠️", label: "app_error",              desc: "Erreurs app" },
                ].map((e) => (
                  <div key={e.label} className="flex items-start gap-2.5 bg-stone-50 rounded-xl p-3">
                    <span className="text-lg shrink-0">{e.icon}</span>
                    <div>
                      <p className="text-stone-700 text-xs font-mono font-bold leading-tight">{e.label}</p>
                      <p className="text-stone-400 text-[10px]">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
