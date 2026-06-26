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

  const statusLabel: Record<string, Record<Lang, string>> = {
    upcoming: { fr: "Inscriptions ouvertes", ht: "Enskripsyon louvri", en: "Registrations open" },
    active:   { fr: "En cours", ht: "Kap fèt kounye a", en: "In progress" },
    voting:   { fr: "Phase de vote", ht: "Faz vote a", en: "Voting phase" },
    completed:{ fr: "Terminé", ht: "Fini", en: "Completed" },
  };

  const statusStyle: Record<string, string> = {
    upcoming:  "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
    active:    "bg-green-50 text-green-700 border-green-200",
    voting:    "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-stone-50 text-stone-400 border-stone-200",
  };

  const live   = contests.filter(c => c.status === "active" || c.status === "voting");
  const coming = contests.filter(c => c.status === "upcoming");
  const past   = contests.filter(c => c.status === "completed");

  function ContestCard({ c }: { c: Contest }) {
    const count  = c.contest_participants?.[0]?.count ?? 0;
    const isLive = c.status === "active" || c.status === "voting";
    return (
      <div className={`border rounded-lg overflow-hidden flex flex-col transition-all hover:shadow-md ${isLive ? "border-[#1d4ed8] shadow-sm" : "border-stone-200"}`}>
        {isLive && <div className="h-1 bg-gradient-to-r from-[#0f2044] via-[#1d4ed8] to-[#38bdf8]" />}
        <div className="p-5 flex flex-col gap-4 flex-1 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[#0f2044] font-bold text-sm leading-snug mb-1">{c.title}</p>
              {c.description && (
                <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">{c.description}</p>
              )}
            </div>
            <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border whitespace-nowrap ${statusStyle[c.status]}`}>
              {statusLabel[c.status]?.[l] ?? c.status}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <div className="flex items-center gap-2">
              {isLive && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
              <span className="text-stone-400 text-xs">
                {count}/{c.max_participants || 10} {l === "fr" ? "participants" : l === "ht" ? "patisipan" : "participants"}
              </span>
            </div>
            <Link href={`/concours/${c.id}`}
              className={`text-xs font-bold transition-colors ${isLive ? "text-[#1d4ed8] hover:underline" : "text-[#0f2044]/60 hover:text-[#1d4ed8]"}`}>
              {c.status === "upcoming"
                ? (l === "fr" ? "S'inscrire" : l === "ht" ? "Enskri" : "Register")
                : c.status === "completed"
                ? (l === "fr" ? "Résultats" : l === "ht" ? "Rezilta" : "Results")
                : (l === "fr" ? "Regarder en direct" : l === "ht" ? "Gade an dirèk" : "Watch live")} →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-[#0f2044]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded px-3 py-1.5 mb-5">
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                {l === "fr" ? "Concours Bibliques" : l === "ht" ? "Konkou Biblik" : "Biblical Contests"}
              </span>
            </div>
            <h1 className="text-white font-black leading-tight mb-3"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
              {l === "fr" ? "Des milliers de spectateurs. Un seul vainqueur."
             : l === "ht" ? "Dè milye espektatè. Yon sèl venkè."
             : "Thousands of spectators. One winner."}
            </h1>
            <p className="text-white/50 text-sm max-w-xl leading-relaxed">
              {l === "fr" ? "Participez ou votez pour votre champion. Les concours sont organisés par l'équipe Koneksyon Pam."
             : l === "ht" ? "Patisipe oswa vote pou chanpyon ou. Konkou yo òganize pa ekip Koneksyon Pam."
             : "Participate or vote for your champion. Contests are organized by the Koneksyon Pam team."}
            </p>
          </div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-[#0f2044] via-[#1d4ed8] to-[#38bdf8]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 flex flex-col gap-14">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-stone-200 rounded-lg">
            <p className="text-stone-400 text-sm">
              {l === "fr" ? "Aucun concours pour le moment. Revenez bientôt."
             : l === "ht" ? "Pa gen konkou pou kounye a. Tounen byento."
             : "No contests yet. Check back soon."}
            </p>
          </div>
        ) : (
          <>
            {/* Live */}
            {live.length > 0 && (
              <section>
                <div className="border-l-4 border-green-500 pl-4 mb-8 flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-[#0f2044] font-black text-lg">
                    {l === "fr" ? "En cours" : l === "ht" ? "Kap fèt kounye a" : "Live now"}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {live.map(c => <ContestCard key={c.id} c={c} />)}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {coming.length > 0 && (
              <section>
                <div className="border-l-4 border-[#1d4ed8] pl-4 mb-8">
                  <p className="text-[#0f2044] font-black text-lg">
                    {l === "fr" ? "Inscriptions ouvertes" : l === "ht" ? "Enskripsyon louvri" : "Open registrations"}
                  </p>
                  <p className="text-stone-400 text-xs mt-0.5">
                    {l === "fr" ? "Inscrivez-vous avant le début" : l === "ht" ? "Enskri anvan kòmansman an" : "Register before it starts"}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coming.map(c => <ContestCard key={c.id} c={c} />)}
                </div>
              </section>
            )}

            {/* Completed */}
            {past.length > 0 && (
              <section>
                <div className="border-l-4 border-stone-300 pl-4 mb-8">
                  <p className="text-[#0f2044] font-black text-lg">
                    {l === "fr" ? "Concours terminés" : l === "ht" ? "Konkou fini" : "Completed contests"}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
