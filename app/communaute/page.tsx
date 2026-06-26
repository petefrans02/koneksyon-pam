"use client";
import RequireAuth from "@/app/components/RequireAuth";

import { useLang } from "@/lib/LangContext";
import { groups } from "@/lib/groups-data";
import Link from "next/link";
import { useState } from "react";

const TOTAL_MEMBERS = 24563;

export default function CommunautePage() {
  const { lang } = useLang();
  const [search, setSearch] = useState("");

  const filtered = groups.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (g.title[lang] || g.title.fr).toLowerCase().includes(q) ||
      (g.description[lang] || g.description.fr).toLowerCase().includes(q)
    );
  });

  return (
    <RequireAuth>
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
          🌍 {TOTAL_MEMBERS.toLocaleString()} {lang === "fr" ? "chrétiens connectés" : lang === "ht" ? "kretyen konekte" : "connected Christians"}
        </div>
        <h1 className="text-4xl font-black text-stone-900 mb-3">
          {lang === "fr" ? "Communauté" : lang === "ht" ? "Kominote" : "Community"}
        </h1>
        <p className="text-stone-500 max-w-lg mx-auto">
          {lang === "fr"
            ? "Rejoignez un groupe, participez aux débats, grandissez ensemble dans la foi"
            : lang === "ht"
            ? "Rantre nan yon gwoup, patisipe nan deba yo, grandi ansanm nan lafwa"
            : "Join a group, participate in debates, grow together in faith"}
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto mt-6 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "fr" ? "🔍 Rechercher un groupe ou sujet..." : lang === "ht" ? "🔍 Chèche yon gwoup..." : "🔍 Search a group..."}
            className="w-full border border-stone-200 rounded-2xl px-5 py-3 text-sm bg-white shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: lang === "fr" ? "Groupes actifs" : lang === "ht" ? "Gwoup aktif" : "Active groups", value: groups.length.toString(), icon: "🏠" },
          { label: lang === "fr" ? "Membres" : lang === "ht" ? "Manm" : "Members", value: "24.5K+", icon: "👥" },
          { label: lang === "fr" ? "Débats ouverts" : lang === "ht" ? "Deba ouvè" : "Open debates", value: "48", icon: "💬" },
          { label: lang === "fr" ? "Nations" : lang === "ht" ? "Nasyon" : "Nations", value: "12+", icon: "🌍" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-blue-50 p-4 text-center">
            <span className="text-2xl block mb-1">{s.icon}</span>
            <p className="text-xl font-black text-stone-900">{s.value}</p>
            <p className="text-xs text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-400">
            {lang === "fr" ? "Aucun groupe trouvé pour" : lang === "ht" ? "Pa gen gwoup jwenn pou" : "No group found for"} &ldquo;{search}&rdquo;
          </p>
          <button onClick={() => setSearch("")} className="text-blue-500 text-sm mt-2 hover:underline">
            {lang === "fr" ? "Voir tous les groupes" : lang === "ht" ? "Wè tout gwoup yo" : "See all groups"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((group) => (
            <Link
              key={group.slug}
              href={`/communaute/${group.slug}`}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group relative"
            >
              {/* Badge */}
              {group.badge && (
                <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {group.badge}
                </div>
              )}

              {/* Cover */}
              <div className={`h-28 bg-gradient-to-br ${group.color} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-2 right-4 w-16 h-16 bg-white rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-6 w-12 h-12 bg-white rounded-full blur-xl" />
                </div>
                <img src={group.image} alt="" className="w-14 h-14 drop-shadow-lg relative z-10" />
                <div className="absolute bottom-2 right-3 bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-white text-xs font-bold">
                  {group.memberCount.toLocaleString()} {lang === "fr" ? "membres" : lang === "ht" ? "manm" : "members"}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-base text-stone-900 group-hover:text-blue-600 transition-colors mb-1">
                  {group.title[lang] || group.title.fr}
                </h3>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed line-clamp-2">
                  {group.description[lang] || group.description.fr}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.sections.slice(0, 3).map((s) => (
                    <span key={s.slug} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      {s.icon} {s.title[lang] || s.title.fr}
                    </span>
                  ))}
                  {group.sections.length > 3 && (
                    <span className="bg-blue-50 text-blue-500 text-xs px-2.5 py-1 rounded-full">
                      +{group.sections.length - 3}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-stone-400">{group.sections.length} {lang === "fr" ? "sujets" : lang === "ht" ? "sijè" : "topics"}</span>
                  <span className="text-blue-500 text-xs font-bold group-hover:translate-x-1 transition-transform inline-block">
                    {lang === "fr" ? "Rejoindre →" : lang === "ht" ? "Rantre →" : "Join →"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Église Space Banner */}
      <Link
        href="/eglise"
        className="mt-8 block bg-gradient-to-br from-[#0a1628] to-[#0f2044] rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all border border-blue-800/30"
      >
        <div className="p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1.5 border border-blue-400/30 shrink-0">
            <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">
              🏠 {lang === "fr" ? "Créez votre espace de groupe" : lang === "ht" ? "Kreye espas gwoup ou" : "Create your group space"}
            </h3>
            <p className="text-blue-300/70 text-sm mb-3">
              {lang === "fr"
                ? "Pasteur, croyant, responsable ou animateur — créez votre espace privé avec photo de profil, publications, sous-groupes et plus."
                : lang === "ht"
                ? "Pastè, kretyen, responsab — kreye espas prive ou ak foto pwofil, piblikasyon, sou-gwoup ak plis."
                : "Pastor, believer, leader or organizer — create your private space with profile photo, posts, subgroups and more."}
            </p>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-full text-sm font-bold">
              {lang === "fr" ? "Créer mon groupe →" : lang === "ht" ? "Kreye gwoup mwen →" : "Create my group →"}
            </span>
          </div>
          <div className="hidden lg:block text-6xl">✝️</div>
        </div>
      </Link>
    </div>
    </RequireAuth>
  );
}
