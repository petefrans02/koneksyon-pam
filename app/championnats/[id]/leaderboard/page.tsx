"use client";

import { useLang } from "@/lib/LangContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  score: number;
  accuracy_pct?: number;
  completion_time_seconds?: number;
  country?: string;
  streak_bonus?: number;
  speed_bonus?: number;
  perfect_bonus?: number;
}

interface Contest {
  id: string;
  title: string;
  status: string;
  theme?: string;
  started_at?: string;
}

const FLAG: Record<string, string> = {
  HT: "🇭🇹", US: "🇺🇸", FR: "🇫🇷", CA: "🇨🇦",
  GB: "🇬🇧", DE: "🇩🇪", BE: "🇧🇪", CH: "🇨🇭",
  BR: "🇧🇷", MX: "🇲🇽", CI: "🇨🇮", SN: "🇸🇳",
};

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmtTime(s?: number) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}m${pad(s % 60)}s`;
}

function PodiumEntry({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) {
  const config = {
    1: { height: "h-36", bg: "bg-gradient-to-b from-[#c5a84f]/20 to-transparent", border: "border-[#c5a84f]/40", nameSize: "text-base", glow: "0 0 30px rgba(197,168,79,0.18)", crownIcon: "couronne" as IconName, crownColor: "#c5a84f" },
    2: { height: "h-24", bg: "bg-gradient-to-b from-white/8 to-transparent", border: "border-white/20", nameSize: "text-sm", glow: undefined, crownIcon: "medaille" as IconName, crownColor: "#cbd5e1" },
    3: { height: "h-20", bg: "bg-gradient-to-b from-amber-700/15 to-transparent", border: "border-amber-700/30", nameSize: "text-sm", glow: undefined, crownIcon: "medaille" as IconName, crownColor: "#b45309" },
  }[position];

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <p className="flex justify-center"><Icon name={config.crownIcon} size={18} color={config.crownColor} /></p>
      <div className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/40 font-black text-sm">
        {entry.name?.[0]?.toUpperCase() ?? "?"}
      </div>
      <p className={`text-white font-black text-center leading-tight max-w-[80px] truncate ${config.nameSize}`}>{entry.name}</p>
      {entry.country && <span className="text-sm">{FLAG[entry.country] ?? entry.country}</span>}
      <p className="text-[#c5a84f] font-black text-sm tabular-nums">{entry.score} pts</p>
      <div className={`w-full ${config.height} rounded-t-2xl border-t border-l border-r flex items-start justify-center pt-3 ${config.bg} ${config.border}`}
        style={{ boxShadow: config.glow }}>
        <span className="text-white/30 font-black text-xl">#{position}</span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;
  const params = useParams();
  const id = params.id as string;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [contest, setContest] = useState<Contest | null>(null);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"global" | "country">("global");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`/api/contests/${id}`).then(r => r.json()),
      fetch(`/api/contests/${id}/leaderboard`).then(r => r.json()),
      fetch(`/api/contests/${id}/my-result`).then(r => r.json()).catch(() => null),
    ]).then(([cd, ld, rd]) => {
      if (cd.contest) setContest(cd.contest);
      const allEntries: LeaderboardEntry[] = ld.entries ?? [];
      if (filter === "country" && myUserId) {
        const myCountry = allEntries.find(e => e.user_id === myUserId)?.country;
        setEntries(myCountry ? allEntries.filter(e => e.country === myCountry) : allEntries);
      } else {
        setEntries(allEntries);
      }
      if (rd?.leaderboard && rd.session) {
        setMyEntry({ rank: rd.leaderboard.rank_global, user_id: myUserId ?? "", name: l === "fr" ? "Moi" : l === "ht" ? "Mwen" : l === "es" ? "Yo" : "Me", score: rd.session.score, ...rd.leaderboard });
      }
      setLoading(false);
    });
  }, [id, filter, myUserId]);

  const top3 = entries.slice(0, 3);
  const showPodium = top3.length >= 3;
  const tableEntries = showPodium ? entries.slice(3, page * PER_PAGE) : entries.slice(0, page * PER_PAGE);
  const hasMore = showPodium ? entries.length > 3 + page * PER_PAGE : entries.length > page * PER_PAGE;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#030918" }}>
      <div className="w-8 h-8 border-2 border-[#c5a84f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#030918" }}>
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(197,168,79,0.10) 0%, transparent 60%)" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/championnats/${id}`} className="text-white/25 hover:text-white/60 transition-colors text-xs font-bold">←</Link>
          <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.25em]">
            {l === "fr" ? "Classement" : l === "ht" ? "Klasman" : l === "es" ? "Clasificación" : "Leaderboard"}
          </p>
        </div>
        {contest && (
          <div className="mb-8">
            <h1 className="text-white font-black text-xl">{contest.title}</h1>
            {contest.theme && <p className="text-[#c5a84f] text-xs mt-0.5">{contest.theme}</p>}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-10">
          {(["global", "country"] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                filter === f
                  ? "bg-[#c5a84f]/15 border-[#c5a84f]/40 text-[#c5a84f]"
                  : "bg-white/4 border-white/10 text-white/30 hover:text-white/60"
              }`}>
              {f === "global"
                ? (l === "fr" ? "Mondial" : l === "ht" ? "Mondyal" : l === "es" ? "Global" : "Global")
                : (l === "fr" ? "Mon pays" : l === "ht" ? "Peyi mwen" : l === "es" ? "Mi país" : "My country")}
            </button>
          ))}
          <span className="ml-auto text-white/20 text-xs self-center">{entries.length} {l === "fr" ? "joueurs" : l === "ht" ? "jwè" : l === "es" ? "jugadores" : "players"}</span>
        </div>

        {/* Podium */}
        {showPodium && (
          <div className="mb-12">
            <div className="flex items-end justify-center gap-4">
              {top3[1] && <PodiumEntry entry={top3[1]} position={2} />}
              {top3[0] && <PodiumEntry entry={top3[0]} position={1} />}
              {top3[2] && <PodiumEntry entry={top3[2]} position={3} />}
            </div>
          </div>
        )}

        {/* My rank sticky card */}
        {myEntry && myEntry.rank > 3 && (
          <div className="mb-6 bg-[#c5a84f]/10 border border-[#c5a84f]/25 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#c5a84f]/20 border border-[#c5a84f]/30 flex items-center justify-center font-black text-[#c5a84f] text-sm">
              #{myEntry.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm">{l === "fr" ? "Votre position" : l === "ht" ? "Pozisyon ou" : l === "es" ? "Tu posición" : "Your position"}</p>
              <p className="text-[#c5a84f] text-xs">{myEntry.score} pts · {myEntry.accuracy_pct ?? 0}% {l === "fr" ? "précision" : l === "ht" ? "presizyon" : l === "es" ? "precisión" : "accuracy"}</p>
            </div>
            <Link href={`/championnats/${id}/results`} className="text-[#c5a84f] text-xs font-black shrink-0">
              {l === "fr" ? "Détails →" : l === "ht" ? "Detay →" : l === "es" ? "Detalles →" : "Details →"}
            </Link>
          </div>
        )}

        {/* Full table */}
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/25 text-sm">
              {l === "fr" ? "Le classement n'est pas encore disponible." : l === "ht" ? "Klasman an pa disponib ankò." : l === "es" ? "El clasificador aún no está disponible." : "Leaderboard not available yet."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-white/8">
            {/* Table header */}
            <div className="grid grid-cols-[2.5rem_1fr_5rem_4rem_4rem] gap-0 px-4 py-3 bg-white/[0.03] border-b border-white/8">
              <span className="text-white/20 text-[10px] font-black uppercase text-center">#</span>
              <span className="text-white/20 text-[10px] font-black uppercase">{l === "fr" ? "Joueur" : l === "ht" ? "Jwè" : l === "es" ? "Jugador" : "Player"}</span>
              <span className="text-white/20 text-[10px] font-black uppercase text-right">{l === "es" ? "Puntos" : "Points"}</span>
              <span className="text-white/20 text-[10px] font-black uppercase text-right hidden sm:block">{l === "fr" ? "Précis." : l === "ht" ? "Presi." : l === "es" ? "Precis." : "Acc."}</span>
              <span className="text-white/20 text-[10px] font-black uppercase text-right hidden sm:block">{l === "fr" ? "Temps" : l === "ht" ? "Tan" : l === "es" ? "Tiempo" : "Time"}</span>
            </div>

            {tableEntries.map((entry, i) => {
              const isMe = entry.user_id === myUserId;
              const actualRank = entry.rank;
              return (
                <div key={entry.user_id}
                  className={`grid grid-cols-[2.5rem_1fr_5rem_4rem_4rem] gap-0 px-4 py-3.5 border-b border-white/5 last:border-0 items-center transition-colors ${isMe ? "bg-[#c5a84f]/8" : "hover:bg-white/[0.02]"}`}>
                  {/* Rank */}
                  <div className="flex justify-center">
                    <span className={`text-sm font-black tabular-nums inline-flex items-center ${
                      actualRank === 1 ? "text-[#c5a84f]" : actualRank === 2 ? "text-gray-300" : actualRank === 3 ? "text-amber-700" : "text-white/25"
                    }`}>
                      {actualRank <= 3
                        ? <Icon name={actualRank === 1 ? "couronne" : "medaille"} size={16} color={actualRank === 1 ? "#c5a84f" : actualRank === 2 ? "#cbd5e1" : "#b45309"} />
                        : `#${actualRank}`}
                    </span>
                  </div>

                  {/* Player */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/30 text-[11px] font-black shrink-0">
                      {entry.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${isMe ? "text-[#c5a84f]" : "text-white/80"}`}>
                        {entry.name} {isMe && <span className="text-[10px] text-[#c5a84f]/60">({l === "fr" ? "vous" : l === "ht" ? "ou" : l === "es" ? "tú" : "you"})</span>}
                      </p>
                      {entry.country && <span className="text-[11px]">{FLAG[entry.country] ?? entry.country}</span>}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-white font-black text-sm tabular-nums">{entry.score}</span>
                    <span className="text-white/25 text-[10px] ml-0.5">pts</span>
                  </div>

                  {/* Accuracy */}
                  <div className="text-right hidden sm:block">
                    <span className="text-white/40 text-xs tabular-nums">{entry.accuracy_pct ?? "—"}%</span>
                  </div>

                  {/* Time */}
                  <div className="text-right hidden sm:block">
                    <span className="text-white/30 text-xs tabular-nums">{fmtTime(entry.completion_time_seconds)}</span>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="px-4 py-4 flex justify-center border-t border-white/5">
                <button onClick={() => setPage(p => p + 1)}
                  className="text-white/30 hover:text-white text-xs font-bold transition-colors">
                  {l === "fr" ? "Voir plus" : l === "ht" ? "Wè plis" : l === "es" ? "Ver más" : "Load more"} ↓
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom links */}
        <div className="flex flex-wrap gap-3 justify-center mt-10">
          {myEntry && (
            <Link href={`/championnats/${id}/results`}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 hover:text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all">
              {l === "fr" ? "Mes résultats" : l === "ht" ? "Rezilta mwen" : l === "es" ? "Mis resultados" : "My results"}
            </Link>
          )}
          <Link href="/championnats"
            className="inline-flex items-center gap-2 text-white/25 hover:text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all">
            {l === "fr" ? "Tous les concours" : l === "ht" ? "Tout konkou yo" : l === "es" ? "Todos los concursos" : "All contests"} →
          </Link>
        </div>
      </div>
    </div>
  );
}
