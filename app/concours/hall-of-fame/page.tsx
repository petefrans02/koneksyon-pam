"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "fr" | "ht" | "en";

interface Champion {
  id: string;
  contest_id: string;
  contest_title: string;
  user_name: string;
  user_avatar: string | null;
  score: number;
  votes_count: number;
  correct_answers: number;
  total_questions: number;
  created_at: string;
}

export default function HallOfFamePage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hall-of-fame")
      .then(r => r.json())
      .then(d => { setChampions(d.champions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const txt = {
    title: { fr: "Hall of Fame", ht: "Hall of Fame", en: "Hall of Fame" },
    subtitle: {
      fr: "Les Champions Bibliques de KONEKSYON PAM",
      ht: "Chanpyon Biblik KONEKSYON PAM yo",
      en: "KONEKSYON PAM Biblical Champions",
    },
    score: { fr: "Score", ht: "Pwen", en: "Score" },
    votes: { fr: "votes du public", ht: "vòt piblik", en: "public votes" },
    correct: { fr: "bonnes réponses", ht: "bon repons", en: "correct answers" },
    noData: { fr: "Aucun champion pour le moment. Soyez le premier !", ht: "Pa gen chanpyon ankò. Soyez premye a !", en: "No champions yet. Be the first!" },
    back: { fr: "Retour aux concours", ht: "Tounen nan konkou", en: "Back to contests" },
    champion: { fr: "Champion Biblique", ht: "Chanpyon Biblik", en: "Biblical Champion" },
    publicPrize: { fr: "Prix du Public", ht: "Pri Piblik", en: "Public Prize" },
  };

  const t = (key: keyof typeof txt) => txt[key][l];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#080d18]">
        {/* Gold radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20"
            style={{ background: "radial-gradient(ellipse at center top, #c5a84f 0%, transparent 65%)" }} />
        </div>
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 4 + 2}s`,
              opacity: Math.random() * 0.4 + 0.05,
            }} />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-20 text-center">
          <Link href="/concours" className="text-white/30 text-xs hover:text-white/60 transition-colors mb-8 inline-block">
            ← {t("back")}
          </Link>
          <div className="text-5xl mb-6">🏆</div>
          <div className="inline-flex items-center gap-2 border border-[#c5a84f]/30 bg-[#c5a84f]/10 rounded-full px-4 py-2 mb-6">
            <span className="text-[#c5a84f] text-[10px] font-black uppercase tracking-[0.2em]">KONEKSYON PAM</span>
          </div>
          <h1 className="text-white font-black mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            {t("title")}
          </h1>
          <p className="text-white/40 text-base max-w-lg mx-auto">{t("subtitle")}</p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#c5a84f]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-[#c5a84f] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          </div>
        ) : champions.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-dashed border-stone-200">
            <div className="text-5xl mb-4 opacity-30">🏆</div>
            <p className="text-stone-400 text-sm">{t("noData")}</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {champions.length >= 1 && (
              <div className="flex flex-col sm:flex-row items-end justify-center gap-4 mb-16">
                {/* 2nd place */}
                {champions[1] && (
                  <div className="flex flex-col items-center sm:mb-0">
                    <PodiumCard champion={champions[1]} rank={2} l={l} t={t} />
                    <div className="w-full h-24 bg-gradient-to-b from-stone-100 to-stone-50 rounded-t-xl border border-stone-200 flex items-center justify-center mt-3">
                      <span className="text-stone-400 font-black text-3xl">🥈</span>
                    </div>
                  </div>
                )}

                {/* 1st place — tallest */}
                <div className="flex flex-col items-center">
                  <PodiumCard champion={champions[0]} rank={1} l={l} t={t} featured />
                  <div className="w-full h-36 bg-gradient-to-b from-[#c5a84f]/20 to-[#c5a84f]/5 rounded-t-xl border border-[#c5a84f]/30 flex items-center justify-center mt-3">
                    <span className="text-4xl">🥇</span>
                  </div>
                </div>

                {/* 3rd place */}
                {champions[2] && (
                  <div className="flex flex-col items-center">
                    <PodiumCard champion={champions[2]} rank={3} l={l} t={t} />
                    <div className="w-full h-16 bg-gradient-to-b from-amber-50 to-orange-50 rounded-t-xl border border-orange-100 flex items-center justify-center mt-3">
                      <span className="text-stone-500 font-black text-3xl">🥉</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All champions list */}
            {champions.length > 3 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                    {l === "fr" ? "Tous les champions" : "Tout chanpyon yo"}
                  </p>
                  <div className="flex-1 h-px bg-stone-100" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {champions.slice(3).map((c, i) => (
                    <ChampionRow key={c.id} champion={c} rank={i + 4} l={l} t={t} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type TxtKey = "title"|"score"|"votes"|"correct"|"subtitle"|"noData"|"back"|"champion"|"publicPrize";
function PodiumCard({ champion: c, rank, l, t, featured = false }: {
  champion: Champion; rank: number; l: Lang; t: (k: TxtKey) => string; featured?: boolean;
}) {
  const year = new Date(c.created_at).getFullYear();
  return (
    <div className={`flex flex-col items-center text-center w-48 sm:w-52 ${featured ? "scale-105" : ""}`}>
      <div className={`relative ${featured ? "w-24 h-24" : "w-16 h-16"} mb-3`}>
        {c.user_avatar ? (
          <img src={c.user_avatar} className={`w-full h-full rounded-full object-cover border-4 ${
            rank === 1 ? "border-[#c5a84f] shadow-lg shadow-[#c5a84f]/30" : rank === 2 ? "border-stone-300" : "border-amber-400/60"
          }`} alt="" />
        ) : (
          <div className={`w-full h-full rounded-full flex items-center justify-center font-black text-white ${
            rank === 1 ? "bg-gradient-to-br from-[#c5a84f] to-[#e8c97a] text-[#0f2044]" : "bg-[#0f2044]"
          } ${featured ? "text-3xl" : "text-xl"}`}>
            {c.user_name[0]}
          </div>
        )}
      </div>
      <p className={`font-black ${featured ? "text-[#0f2044] text-base" : "text-[#0f2044] text-sm"}`}>{c.user_name}</p>
      <p className="text-stone-400 text-xs mt-0.5 line-clamp-1">{c.contest_title}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className={`font-black ${featured ? "text-[#c5a84f] text-lg" : "text-stone-600 text-sm"}`}>{c.score}</span>
        <span className="text-stone-300 text-xs">{t("score")}</span>
      </div>
      <p className="text-stone-300 text-[10px] mt-1">{year}</p>
    </div>
  );
}

function ChampionRow({ champion: c, rank, l: _l, t }: {
  champion: Champion; rank: number; l: Lang; t: (k: TxtKey) => string;
}) {
  const year = new Date(c.created_at).getFullYear();
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 hover:border-[#c5a84f]/30 transition-colors bg-white hover:shadow-sm">
      <span className="text-stone-300 font-black text-sm w-6 text-center shrink-0">#{rank}</span>
      {c.user_avatar ? (
        <img src={c.user_avatar} className="w-12 h-12 rounded-full border border-stone-100 shrink-0" alt="" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-[#0f2044] flex items-center justify-center text-white font-black shrink-0">
          {c.user_name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#0f2044] text-sm truncate">{c.user_name}</p>
        <p className="text-stone-400 text-xs truncate">{c.contest_title} · {year}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black text-[#0f2044] text-sm">{c.score}</p>
        <p className="text-stone-300 text-[10px]">{t("score")}</p>
      </div>
    </div>
  );
}
