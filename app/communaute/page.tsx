"use client";

import { useLang } from "@/lib/LangContext";
import { groups } from "@/lib/groups-data";
import Link from "next/link";

export default function CommunautePage() {
  const { lang } = useLang();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <img src="https://cdn-icons-png.flaticon.com/512/1533/1533908.png" alt="" className="w-14 h-14 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "Communauté" : lang === "ht" ? "Kominote" : "Community"}
        </h1>
        <p className="text-stone-500 mt-2">
          {lang === "fr" ? "Rejoignez un groupe et grandissez ensemble dans la foi" : lang === "ht" ? "Rantre nan yon gwoup epi grandi ansanm nan lafwa" : "Join a group and grow together in faith"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map((group) => (
          <Link
            key={group.slug}
            href={`/communaute/${group.slug}`}
            className="bg-white rounded-2xl border border-blue-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className={`h-24 bg-gradient-to-br ${group.color} flex items-center justify-center relative`}>
              <img src={group.image} alt="" className="w-12 h-12 drop-shadow-lg" />
              <div className="absolute bottom-2 right-3 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-xs font-medium">
                {group.memberCount.toLocaleString()} {lang === "fr" ? "membres" : lang === "ht" ? "manm" : "members"}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-stone-900 group-hover:text-blue-600 transition-colors mb-1">
                {group.title[lang] || group.title.fr}
              </h3>
              <p className="text-sm text-stone-500 mb-4">{group.description[lang] || group.description.fr}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.sections.map((s) => (
                  <span key={s.slug} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                    {s.icon} {s.title[lang] || s.title.fr}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}

        {/* Espace Église Card */}
        <Link
          href="/eglise"
          className="bg-gradient-to-br from-[#0a1628] to-[#0f2044] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group border border-blue-800/30 sm:col-span-2 lg:col-span-3"
        >
          <div className="p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1.5 border border-blue-400/30 shrink-0">
              <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                {lang === "fr" ? "⛪ Espace Église" : lang === "ht" ? "⛪ Espas Legliz" : "⛪ Church Space"}
              </h3>
              <p className="text-blue-300/70 text-sm mb-3">
                {lang === "fr"
                  ? "Votre église a son propre espace privé. Le pasteur crée le groupe, les membres rejoignent. Études, jeux, concours, réunions — tout en un."
                  : lang === "ht"
                  ? "Legliz ou gen pwòp espas prive li. Pastè a kreye gwoup la, manm yo rantre. Etid, jwèt, konkou, reyinyon — tout nan yon sèl."
                  : "Your church has its own private space. The pastor creates the group, members join. Studies, games, contests, meetings — all in one."}
              </p>
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2 rounded-full text-sm font-medium">
                {lang === "fr" ? "Créer mon église →" : lang === "ht" ? "Kreye legliz mwen →" : "Create my church →"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
