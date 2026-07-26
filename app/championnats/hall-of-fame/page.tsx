"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

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
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hall-of-fame")
      .then(r => r.json())
      .then(d => { setChampions(d.champions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const txt = {
    title: { fr: "Hall of Fame", ht: "Hall of Fame", en: "Hall of Fame", es: "Hall of Fame" },
    subtitle: {
      fr: "Les Champions Bibliques de KONEKSYON PAM",
      ht: "Chanpyon Biblik KONEKSYON PAM yo",
      en: "KONEKSYON PAM Biblical Champions",
      es: "Campeones Bíblicos de KONEKSYON PAM",
    },
    score: { fr: "Score", ht: "Pwen", en: "Score", es: "Puntos" },
    votes: { fr: "votes du public", ht: "vòt piblik", en: "public votes", es: "votos del público" },
    correct: { fr: "bonnes réponses", ht: "bon repons", en: "correct answers", es: "respuestas correctas" },
    noData: { fr: "Aucun champion pour le moment. Soyez le premier !", ht: "Pa gen chanpyon ankò. Soyez premye a !", en: "No champions yet. Be the first!", es: "¡Aún no hay campeones. Sé el primero!" },
    back: { fr: "Retour aux concours", ht: "Tounen nan konkou", en: "Back to contests", es: "Volver a los concursos" },
    champion: { fr: "Champion Biblique", ht: "Chanpyon Biblik", en: "Biblical Champion", es: "Campeón Bíblico" },
    publicPrize: { fr: "Prix du Public", ht: "Pri Piblik", en: "Public Prize", es: "Premio del Público" },
  };

  const t = (key: keyof typeof txt) => txt[key][l];

  return (
    <div className="animate-page-awaken min-h-screen" style={{ background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)", color: "#fff" }}>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #060d1e 0%, #04080f 100%)" }}>
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
          <Link href="/championnats" className="text-white/30 text-xs hover:text-white/60 transition-colors mb-8 inline-block">
            ← {t("back")}
          </Link>
          <div className="mb-6 flex justify-center" style={{ color: "#c5a84f" }}><Icon name="trophee" size={48} /></div>
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
            <div className="w-10 h-10 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3, borderColor: "#c5a84f", borderStyle: "solid" }} />
          </div>
        ) : champions.length === 0 ? (
          <div className="text-center py-24 rounded-3xl" style={{ border: "1px dashed rgba(255,255,255,0.12)" }}>
            <div className="mb-4 flex justify-center opacity-30" style={{ color: "#c5a84f" }}><Icon name="trophee" size={48} /></div>
            <p className="text-white/35 text-sm">{t("noData")}</p>
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
                    <div className="w-full h-24 rounded-t-xl flex items-center justify-center mt-3"
                      style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)", border: "1px solid rgba(255,255,255,0.10)", borderBottom: "none" }}>
                      <span className="inline-flex"><Icon name="medaille" size={30} color="#c0c0c0" /></span>
                    </div>
                  </div>
                )}

                {/* 1st place — tallest */}
                <div className="flex flex-col items-center">
                  <PodiumCard champion={champions[0]} rank={1} l={l} t={t} featured />
                  <div className="w-full h-36 rounded-t-xl flex items-center justify-center mt-3"
                    style={{ background: "linear-gradient(180deg, rgba(212,160,23,0.18) 0%, rgba(212,160,23,0.05) 100%)", border: "1px solid rgba(212,160,23,0.30)", borderBottom: "none" }}>
                    <span className="inline-flex"><Icon name="medaille" size={36} color="#c5a84f" /></span>
                  </div>
                </div>

                {/* 3rd place */}
                {champions[2] && (
                  <div className="flex flex-col items-center">
                    <PodiumCard champion={champions[2]} rank={3} l={l} t={t} />
                    <div className="w-full h-16 rounded-t-xl flex items-center justify-center mt-3"
                      style={{ background: "linear-gradient(180deg, rgba(205,127,50,0.12) 0%, rgba(205,127,50,0.04) 100%)", border: "1px solid rgba(205,127,50,0.20)", borderBottom: "none" }}>
                      <span className="inline-flex"><Icon name="medaille" size={30} color="#b45309" /></span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All champions list */}
            {champions.length > 3 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.30)" }}>
                    {l === "fr" ? "Tous les champions" : l === "ht" ? "Tout chanpyon yo" : l === "es" ? "Todos los campeones" : "All champions"}
                  </p>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
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
  const borderColor = rank === 1 ? "rgba(197,168,79,0.70)" : rank === 2 ? "rgba(192,192,192,0.50)" : "rgba(205,127,50,0.50)";
  return (
    <div className={`flex flex-col items-center text-center w-48 sm:w-52 ${featured ? "scale-105" : ""}`}>
      <div className={`relative ${featured ? "w-24 h-24" : "w-16 h-16"} mb-3`}>
        {c.user_avatar ? (
          <img src={c.user_avatar} className="w-full h-full rounded-full object-cover border-4" style={{ borderColor }} alt="" />
        ) : (
          <div className={`w-full h-full rounded-full flex items-center justify-center font-black ${featured ? "text-3xl" : "text-xl"}`}
            style={{
              background: rank === 1 ? "linear-gradient(135deg, #c5a84f, #e8c97a)" : "rgba(255,255,255,0.08)",
              color: rank === 1 ? "#04040d" : "#fff",
              border: `3px solid ${borderColor}`,
            }}>
            {c.user_name[0]}
          </div>
        )}
      </div>
      <p className="font-black text-white" style={{ fontSize: featured ? "1rem" : "0.875rem" }}>{c.user_name}</p>
      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.35)" }}>{c.contest_title}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="font-black" style={{ color: rank === 1 ? "#c5a84f" : "rgba(255,255,255,0.65)", fontSize: featured ? "1.125rem" : "0.875rem" }}>{c.score}</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{t("score")}</span>
      </div>
      <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>{year}</p>
    </div>
  );
}

function ChampionRow({ champion: c, rank, l: _l, t }: {
  champion: Champion; rank: number; l: Lang; t: (k: TxtKey) => string;
}) {
  const year = new Date(c.created_at).getFullYear();
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <span className="font-black text-sm w-6 text-center shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>#{rank}</span>
      {c.user_avatar ? (
        <img src={c.user_avatar} className="w-12 h-12 rounded-full shrink-0" style={{ border: "1px solid rgba(255,255,255,0.12)" }} alt="" />
      ) : (
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black shrink-0"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          {c.user_name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm truncate">{c.user_name}</p>
        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{c.contest_title} · {year}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black text-white text-sm">{c.score}</p>
        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{t("score")}</p>
      </div>
    </div>
  );
}
