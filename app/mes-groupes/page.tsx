"use client";
import RequireAuth from "@/app/components/RequireAuth";
import { useLang } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
  description: string;
  join_code: string;
  logo_url?: string;
  role: "owner" | "member";
  department: { name: string; icon: string } | null;
}

function typeTag(description: string) {
  const raw = description || "";
  if (!raw.startsWith("[")) return "";
  const m = raw.match(/^\[([^\]]+)\]/);
  return m ? m[1].trim() : "";
}

export default function MesGroupesPage() {
  const { lang } = useLang();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/churches/my-groups")
      .then((r) => r.json())
      .then((d) => { setGroups(d.groups || []); setLoading(false); });
  }, []);

  const owned = groups.filter((g) => g.role === "owner");
  const member = groups.filter((g) => g.role === "member");

  const label = {
    title: lang === "fr" ? "Mes Groupes" : lang === "ht" ? "Gwoup Mwen Yo" : "My Groups",
    subtitle: lang === "fr" ? "Les groupes que vous gérez ou dont vous faites partie."
            : lang === "ht" ? "Gwoup ou jere oswa ou fè pati ladan yo."
            : "Groups you manage or belong to.",
    myGroups: lang === "fr" ? "Mes groupes créés" : lang === "ht" ? "Gwoup mwen kreye" : "Groups I created",
    joined: lang === "fr" ? "Groupes rejoints" : lang === "ht" ? "Gwoup mwen rantre" : "Groups I joined",
    empty: lang === "fr" ? "Aucun groupe pour le moment." : lang === "ht" ? "Pa gen gwoup pou kounye a." : "No groups yet.",
    joinNow: lang === "fr" ? "Rejoindre ou créer un groupe" : lang === "ht" ? "Rantre oswa kreye yon gwoup" : "Join or create a group",
    owner: lang === "fr" ? "Responsable" : lang === "ht" ? "Responsab" : "Owner",
    dept: lang === "fr" ? "Département :" : lang === "ht" ? "Depatman :" : "Department:",
    noDept: lang === "fr" ? "Pas encore de département" : lang === "ht" ? "Pa gen depatman encore" : "No department yet",
    open: lang === "fr" ? "Ouvrir" : lang === "ht" ? "Ouvri" : "Open",
  };

  function GroupCard({ group }: { group: Group }) {
    const tag = typeTag(group.description);
    const isOwner = group.role === "owner";
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-lg transition-all group">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden border border-stone-200">
            {group.logo_url ? (
              <img src={group.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-black">
                {group.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-900 text-base uppercase tracking-wide truncate">{group.name}</h3>
            {tag && (
              <span className="inline-block text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 mt-1">{tag}</span>
            )}
          </div>
          {isOwner && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full shrink-0">⭐ {label.owner}</span>
          )}
        </div>

        {/* Access code */}
        <div className="bg-slate-50 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
          <span className="text-xs text-stone-400 uppercase tracking-wider">{lang === "fr" ? "Code d'accès" : lang === "ht" ? "Kòd aksè" : "Access code"}</span>
          <span className="font-mono font-black text-stone-800 tracking-[0.2em] text-sm">{group.join_code}</span>
        </div>

        {/* Department (for members) */}
        {!isOwner && (
          <div className={`rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2 ${group.department ? "bg-green-50 border border-green-100" : "bg-amber-50 border border-amber-100"}`}>
            {group.department ? (
              <>
                <span className="text-lg">{group.department.icon}</span>
                <span className="text-sm font-medium text-green-800">{label.dept} <strong>{group.department.name}</strong></span>
              </>
            ) : (
              <>
                <span className="text-sm text-amber-700">⚠️ {label.noDept}</span>
                <Link href={`/eglise/${group.id}`} className="ml-auto text-xs text-blue-500 underline">
                  {lang === "fr" ? "Choisir" : lang === "ht" ? "Chwazi" : "Choose"}
                </Link>
              </>
            )}
          </div>
        )}

        <Link
          href={`/eglise/${group.id}`}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          {label.open} →
        </Link>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-stone-900 mb-1">{label.title}</h1>
          <p className="text-stone-500 text-sm">{label.subtitle}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
            <p className="text-5xl mb-4">⛪</p>
            <p className="text-stone-500 mb-4">{label.empty}</p>
            <Link href="/eglise" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-bold hover:opacity-90">
              {label.joinNow} →
            </Link>
          </div>
        ) : (
          <>
            {/* Owned groups */}
            {owned.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">⭐ {label.myGroups}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {owned.map((g) => <GroupCard key={g.id} group={g} />)}
                </div>
              </section>
            )}

            {/* Member groups */}
            {member.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">🤝 {label.joined}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {member.map((g) => <GroupCard key={g.id} group={g} />)}
                </div>
              </section>
            )}

            {/* CTA to join more */}
            <div className="text-center pt-4">
              <Link href="/eglise" className="inline-flex items-center gap-2 text-blue-500 hover:underline text-sm font-medium">
                + {lang === "fr" ? "Rejoindre un autre groupe" : lang === "ht" ? "Rantre nan yon lòt gwoup" : "Join another group"}
              </Link>
            </div>
          </>
        )}
      </div>
    </RequireAuth>
  );
}
