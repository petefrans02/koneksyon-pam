"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

type Lang = "fr" | "ht" | "en";

interface Contest {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "active" | "voting" | "completed";
  start_at: string | null;
  max_participants: number;
  contest_participants: { count: number }[];
}

const statusColors: Record<string, string> = {
  upcoming: "text-blue-500 bg-blue-50 border-blue-200",
  active: "text-green-600 bg-green-50 border-green-200",
  voting: "text-amber-600 bg-amber-50 border-amber-200",
  completed: "text-stone-400 bg-stone-50 border-stone-200",
};

export default function ConcoursPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAdminUser(isAdmin(data.user)));
  }, []);

  useEffect(() => {
    fetch("/api/contests")
      .then(r => r.json())
      .then(d => { setContests(d.contests || []); setLoading(false); });
  }, []);

  const statusLabel: Record<string, string> = {
    upcoming: l === "fr" ? "Inscriptions ouvertes" : l === "ht" ? "Enskripsyon louvri" : "Registrations open",
    active: l === "fr" ? "En cours" : l === "ht" ? "Kap fèt" : "In progress",
    voting: l === "fr" ? "Phase de vote" : l === "ht" ? "Faz vote a" : "Voting phase",
    completed: l === "fr" ? "Terminé" : l === "ht" ? "Fini" : "Completed",
  };

  const txt = {
    headline: l === "fr" ? "Les Concours Bibliques." : l === "ht" ? "Konkou Biblik Yo." : "Biblical Contests.",
    sub: l === "fr" ? "Des milliers de spectateurs. Des participants désignés. Un seul vainqueur."
       : l === "ht" ? "Dè milye espektatè. Patisipan dezinye. Yon sèl venkè."
       : "Thousands of spectators. Designated participants. One winner.",
    active: l === "fr" ? "En direct" : l === "ht" ? "An dirèk" : "Live",
    upcoming: l === "fr" ? "À venir" : l === "ht" ? "Ap vini" : "Upcoming",
    past: l === "fr" ? "Terminés" : l === "ht" ? "Fini yo" : "Completed",
    empty: l === "fr" ? "Aucun concours pour le moment." : l === "ht" ? "Pa gen konkou pou kounye a." : "No contests yet.",
    create: l === "fr" ? "Organiser un concours" : l === "ht" ? "Organize yon konkou" : "Organize a contest",
    watch: l === "fr" ? "Regarder" : l === "ht" ? "Gade" : "Watch",
    join: l === "fr" ? "S'inscrire" : l === "ht" ? "Enskri" : "Register",
    results: l === "fr" ? "Résultats" : l === "ht" ? "Rezilta" : "Results",
    participants: l === "fr" ? "participants" : l === "ht" ? "patisipan" : "participants",
  };

  const active = contests.filter(c => c.status === "active" || c.status === "voting");
  const upcoming = contests.filter(c => c.status === "upcoming");
  const past = contests.filter(c => c.status === "completed");

  function ContestCard({ c }: { c: Contest }) {
    const count = c.contest_participants?.[0]?.count ?? 0;
    const btnLabel = c.status === "upcoming" ? txt.join : c.status === "completed" ? txt.results : txt.watch;
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-[#c5a84f]/50 hover:shadow-md transition-all group flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[#0b0f1a] font-bold text-base leading-snug mb-1 truncate">{c.title}</p>
            {c.description && (
              <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">{c.description}</p>
            )}
          </div>
          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[c.status]}`}>
            {statusLabel[c.status]}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-stone-100">
          <span className="text-stone-400 text-xs">
            {count}/{c.max_participants || 10} {txt.participants}
          </span>
          <Link
            href={`/concours/${c.id}`}
            className="text-[#0b0f1a] text-xs font-bold hover:text-[#c5a84f] transition-colors"
          >
            {btnLabel} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-[#0b0f1a] px-5 sm:px-8 py-16">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div>
            <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.25em] mb-6">
              {l === "fr" ? "Concours" : l === "ht" ? "Konkou" : "Contests"}
            </p>
            <h1 className="text-white font-black text-3xl sm:text-5xl leading-tight mb-4">
              {txt.headline}
            </h1>
            <p className="text-white/40 text-base max-w-xl leading-relaxed">{txt.sub}</p>
          </div>
          {adminUser && (
            <Link
              href="/concours/creer"
              className="shrink-0 border border-[#c5a84f]/40 text-[#c5a84f] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#c5a84f] hover:text-[#0b0f1a] transition-all whitespace-nowrap"
            >
              + {txt.create}
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 flex flex-col gap-14">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#0b0f1a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Live */}
            {active.length > 0 && (
              <section>
                <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {txt.active}
                </p>
                <div className="flex flex-col gap-4">
                  {active.map(c => <ContestCard key={c.id} c={c} />)}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">{txt.upcoming}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {upcoming.map(c => <ContestCard key={c.id} c={c} />)}
                </div>
              </section>
            )}

            {/* Empty */}
            {contests.length === 0 && (
              <div className="text-center py-20 border border-dashed border-stone-200 rounded-2xl">
                <p className="text-stone-400 text-sm mb-6">{txt.empty}</p>
                <Link
                  href="/concours/creer"
                  className="inline-block bg-[#0b0f1a] text-white px-7 py-3 rounded-full text-sm font-bold hover:bg-[#131926] transition-colors"
                >
                  + {txt.create}
                </Link>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">{txt.past}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {past.map(c => <ContestCard key={c.id} c={c} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
