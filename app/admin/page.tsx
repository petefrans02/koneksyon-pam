"use client";

import { useState, useEffect } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";
import Link from "next/link";

const ADMIN_EMAIL = "petefrans03@gmail.com";

interface Stats { prayers: number; testimonies: number; churches: number; contacts: number; }
interface Row { id: string; created_at: string; [key: string]: unknown; }

export default function AdminPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ prayers: 0, testimonies: 0, churches: 0, contacts: 0 });
  const [recentPrayers, setRecentPrayers] = useState<Row[]>([]);
  const [recentContacts, setRecentContacts] = useState<Row[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "prayers" | "contacts">("overview");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: { email?: string } | null } }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    Promise.all([
      supabase.from("prayers").select("*", { count: "exact", head: true }),
      supabase.from("testimonies").select("*", { count: "exact", head: true }),
      supabase.from("churches").select("*", { count: "exact", head: true }),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    ]).then(([p, t, c, m]) => {
      setStats({
        prayers: (p as { count: number | null }).count || 0,
        testimonies: (t as { count: number | null }).count || 0,
        churches: (c as { count: number | null }).count || 0,
        contacts: (m as { count: number | null }).count || 0,
      });
    });
    supabase.from("prayers").select("*").order("created_at", { ascending: false }).limit(5).then(({ data }) => setRecentPrayers((data as Row[]) || []));
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(20).then(({ data }) => setRecentContacts((data as Row[]) || []));
  }, [user]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-stone-900 mb-4">Panel Admin</h1>
      <p className="text-stone-500 mb-6">Connexion requise</p>
      <button onClick={signInWithGoogle} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90">Se connecter</button>
    </div>
  );

  if (user.email !== ADMIN_EMAIL) return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <span className="text-5xl block mb-4">🚫</span>
      <h1 className="text-2xl font-bold text-red-600 mb-2">Accès refusé</h1>
      <p className="text-stone-500">Réservé à l&apos;administrateur</p>
      <Link href="/" className="text-blue-500 hover:underline mt-4 block">← Accueil</Link>
    </div>
  );

  const statCards = [
    { label: "Prières", value: stats.prayers, icon: "🙏", color: "from-cyan-500 to-blue-600", href: "/prieres" },
    { label: "Témoignages", value: stats.testimonies, icon: "✨", color: "from-purple-500 to-violet-600", href: "/temoignages" },
    { label: "Églises", value: stats.churches, icon: "⛪", color: "from-blue-600 to-blue-800", href: "/eglise" },
    { label: "Messages", value: stats.contacts, icon: "📧", color: "from-green-500 to-emerald-600", href: "#contacts" },
  ];

  const quickLinks = [
    { href: "/bible", label: "📖 Bible" },
    { href: "/chants", label: "🎶 Chants" },
    { href: "/communaute", label: "🌍 Communauté" },
    { href: "/don", label: "💝 Donations" },
    { href: "/jeu", label: "🎯 Jeu" },
    { href: "/louange", label: "🎵 Louange" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Panel Administrateur</h1>
          <p className="text-stone-500 text-sm mt-1">KONEKSYON PAM — {user.email}</p>
        </div>
        <Link href="/" className="text-blue-500 text-sm hover:underline">← Accueil</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-200">
        {(["overview", "prayers", "contacts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-stone-500 hover:text-stone-700"}`}
          >
            {tab === "overview" ? "Vue d'ensemble" : tab === "prayers" ? "Prières" : "Messages"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {statCards.map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white`}>
                <span className="text-3xl block mb-2">{s.icon}</span>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-white/70 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-6">
            <h2 className="font-bold text-stone-900 mb-4">Accès rapide</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {quickLinks.map((l) => (
                <Link key={l.href} href={l.href} className="bg-blue-50 hover:bg-blue-100 rounded-xl p-3 text-center text-sm font-medium text-blue-700 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Prayers */}
          <div className="bg-white rounded-2xl border border-blue-100 p-6">
            <h2 className="font-bold text-stone-900 mb-4">Dernières prières</h2>
            {recentPrayers.length === 0 ? (
              <p className="text-stone-400 text-sm">Aucune prière</p>
            ) : (
              <div className="space-y-3">
                {recentPrayers.map((p) => (
                  <div key={p.id} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
                    <span className="text-lg">🙏</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-700 line-clamp-2">{String(p.text || "")}</p>
                      <p className="text-xs text-stone-400 mt-1">{String(p.name || "Anonyme")} · {String(p.country || "")} · {new Date(p.created_at).toLocaleDateString("fr")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "prayers" && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6">
          <h2 className="font-bold text-stone-900 mb-4">Toutes les prières ({stats.prayers})</h2>
          {recentPrayers.length === 0 ? (
            <p className="text-stone-400">Aucune prière</p>
          ) : (
            <div className="space-y-3">
              {recentPrayers.map((p) => (
                <div key={p.id} className="p-4 bg-stone-50 rounded-xl">
                  <p className="font-medium text-stone-900 text-sm">{String(p.name || "Anonyme")} <span className="text-stone-400 font-normal">· {String(p.country || "")} · {String(p.pray_count || 0)} prières</span></p>
                  <p className="text-stone-600 text-sm mt-1">{String(p.text || "")}</p>
                  <p className="text-xs text-stone-400 mt-2">{new Date(p.created_at).toLocaleString("fr")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6">
          <h2 className="font-bold text-stone-900 mb-4">Messages de contact ({stats.contacts})</h2>
          {recentContacts.length === 0 ? (
            <p className="text-stone-400 text-sm">Aucun message reçu</p>
          ) : (
            <div className="space-y-4">
              {recentContacts.map((m) => (
                <div key={m.id} className="p-4 bg-stone-50 rounded-xl border-l-4 border-blue-400">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-stone-900">{String(m.name || "")}</p>
                    <p className="text-xs text-stone-400">{new Date(m.created_at).toLocaleString("fr")}</p>
                  </div>
                  <p className="text-xs text-blue-500 mb-2">{String(m.email || "")}</p>
                  <p className="text-stone-700 text-sm">{String(m.message || "")}</p>
                  <a href={`mailto:${String(m.email || "")}?subject=Re: KONEKSYON PAM`} className="text-blue-500 text-xs hover:underline mt-2 inline-block">Répondre →</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
