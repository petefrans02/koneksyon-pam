"use client";

import { useLang } from "@/lib/LangContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Lang = "fr" | "ht" | "en";

interface Contest {
  id: string;
  title: string; title_ht?: string; title_en?: string;
  description?: string; description_ht?: string; description_en?: string;
  status: "upcoming" | "active" | "completed";
  scheduled_start_at?: string;
  started_at?: string;
  theme?: string;
  max_participants: number;
  duration_minutes?: number;
}

interface LiveStats {
  registered: number; playing: number; completed: number;
  contest_status: string; seconds_remaining: number | null;
  scheduled_start_at: string | null;
}

interface MyResult {
  session?: { score: number; status: string; accuracy_pct?: number };
  leaderboard?: { rank_global: number; score: number; accuracy_pct: number } | null;
}

interface LeaderboardEntry {
  user_id: string; name: string; score: number; rank: number;
  country?: string; accuracy_pct?: number;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function useCountdown(target: string | null) {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  useEffect(() => {
    if (!target) return;
    function calc() {
      const diff = new Date(target!).getTime() - Date.now();
      if (diff <= 0) { setParts({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }); return; }
      const s = Math.floor(diff / 1000);
      setParts({ days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60, expired: false });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [target]);
  return parts;
}

function formatSeconds(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${pad(m)}:${pad(sec)}`;
}

export default function ContestDetailPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [myResult, setMyResult] = useState<MyResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const countdown = useCountdown(contest?.scheduled_start_at ?? null);

  const load = useCallback(async () => {
    const [contestRes, statsRes] = await Promise.all([
      fetch(`/api/contests/${id}`),
      fetch(`/api/contests/${id}/live-stats`),
    ]);
    const cd = await contestRes.json();
    const sd = await statsRes.json();
    if (cd.contest) setContest(cd.contest);
    setLiveStats(sd);

    // Load leaderboard if completed
    if (cd.contest?.status === "completed") {
      const lb = await fetch(`/api/contests/${id}/leaderboard`);
      const lbd = await lb.json();
      setLeaderboard(lbd.entries?.slice(0, 3) ?? []);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetch(`/api/contests/${id}/my-result`).then(r => r.json()).then(d => {
          if (d.session) setMyResult(d);
        }).catch(() => {});
      }
    });
    load();
  }, [id, load]);

  // Poll stats every 10s
  useEffect(() => {
    const t = setInterval(() => {
      fetch(`/api/contests/${id}/live-stats`).then(r => r.json()).then(d => setLiveStats(d));
    }, 10000);
    return () => clearInterval(t);
  }, [id]);

  // Realtime contest status changes
  useEffect(() => {
    const ch = supabase.channel(`contest-detail-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "contests", filter: `id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, load]);

  async function joinContest() {
    if (!user) { router.push(`/auth?redirect=/concours/${id}`); return; }
    setJoining(true); setJoinError(null);
    const res = await fetch(`/api/contests/${id}/join`, { method: "POST" });
    const d = await res.json();
    if (d.ok) setJoined(true);
    else setJoinError(d.error || "Erreur");
    setJoining(false);
  }

  const t = (c: Contest) => l === "ht" ? (c.title_ht || c.title) : l === "en" ? (c.title_en || c.title) : c.title;
  const desc = (c: Contest) => l === "ht" ? (c.description_ht || c.description) : l === "en" ? (c.description_en || c.description) : c.description;

  const alreadyPlayed = myResult?.session?.status === "completed";
  const currentlyPlaying = myResult?.session?.status === "playing";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#030918" }}>
      <div className="w-8 h-8 border-2 border-[#c5a84f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!contest) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#030918" }}>
      <p className="text-white/40">Concours introuvable</p>
      <Link href="/concours" className="text-[#c5a84f] text-sm font-bold">← Retour</Link>
    </div>
  );

  // ── COMPLETED VIEW ──────────────────────────────────────────────────────────
  if (contest.status === "completed") {
    return (
      <div className="min-h-screen" style={{ background: "#030918" }}>
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(197,168,79,0.14) 0%, transparent 65%)" }} />
          <div className="relative z-10 max-w-4xl mx-auto px-5 py-16 text-center">
            <span className="inline-flex items-center gap-2 bg-stone-500/10 border border-stone-500/20 rounded-full px-4 py-1.5 text-stone-400 text-[10px] font-black uppercase tracking-widest mb-6">
              {l === "fr" ? "Terminé" : l === "ht" ? "Fini" : "Ended"}
            </span>
            <h1 className="text-white font-black mb-2" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>{t(contest)}</h1>
            {contest.theme && <p className="text-[#c5a84f] text-sm mb-8">{contest.theme}</p>}

            {/* My result */}
            {alreadyPlayed && myResult?.leaderboard && (
              <div className="inline-flex flex-col items-center bg-[#c5a84f]/10 border border-[#c5a84f]/25 rounded-2xl px-8 py-6 mb-8">
                <p className="text-[#c5a84f] text-xs font-black uppercase tracking-widest mb-2">
                  {l === "fr" ? "Votre résultat" : l === "ht" ? "Rezilta ou" : "Your result"}
                </p>
                <p className="text-white font-black text-4xl mb-1">{myResult.session?.score ?? 0}</p>
                <p className="text-white/40 text-sm">
                  {l === "fr" ? `Rang #${myResult.leaderboard.rank_global} mondial` : l === "ht" ? `Klasman #${myResult.leaderboard.rank_global} mondyal` : `Rank #${myResult.leaderboard.rank_global} global`}
                </p>
              </div>
            )}

            {/* Podium */}
            {leaderboard.length > 0 && (
              <div className="mb-8">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em] mb-6">
                  {l === "fr" ? "Podium" : l === "ht" ? "Podiyòm" : "Podium"}
                </p>
                <div className="flex items-end justify-center gap-3">
                  {[leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean).map((entry, visualIdx) => {
                    const realRank = entry.rank;
                    const colors = ["bg-stone-400","bg-[#c5a84f]","bg-amber-700"];
                    const heights = ["h-24","h-32","h-20"];
                    const colorIdx = realRank === 1 ? 1 : realRank === 2 ? 0 : 2;
                    return (
                      <div key={entry.user_id} className="flex flex-col items-center gap-2" style={{ display: visualIdx === 1 ? "flex" : "flex" }}>
                        <p className="text-white text-xs font-black text-center max-w-[80px] truncate">{entry.name}</p>
                        <p className="text-white/50 text-[10px]">{entry.score} pts</p>
                        <div className={`w-16 ${heights[colorIdx]} rounded-t-xl ${colors[colorIdx]} flex items-start justify-center pt-2`}>
                          <span className="text-white font-black text-lg">#{realRank}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href={`/concours/${id}/leaderboard`}
                className="inline-flex items-center gap-2 bg-[#c5a84f] text-[#030918] font-black text-sm px-7 py-3.5 rounded-full hover:bg-[#d4b85c] transition-colors">
                {l === "fr" ? "Classement complet →" : l === "ht" ? "Klasman konplè →" : "Full leaderboard →"}
              </Link>
              {alreadyPlayed && (
                <Link href={`/concours/${id}/results`}
                  className="inline-flex items-center gap-2 border border-white/20 bg-white/5 text-white font-bold text-sm px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors">
                  {l === "fr" ? "Mes résultats" : l === "ht" ? "Rezilta mwen" : "My results"}
                </Link>
              )}
              <Link href="/concours" className="inline-flex items-center gap-2 border border-white/10 text-white/40 font-bold text-sm px-7 py-3.5 rounded-full hover:text-white transition-colors">
                ← {l === "fr" ? "Tous les concours" : l === "ht" ? "Tout konkou yo" : "All contests"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE VIEW ─────────────────────────────────────────────────────────────
  if (contest.status === "active") {
    const secLeft = liveStats?.seconds_remaining ?? null;
    return (
      <div className="min-h-screen" style={{ background: "#030918" }}>
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,197,94,0.10) 0%, transparent 65%)" }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)" }} />
          <div className="relative z-10 max-w-3xl mx-auto px-5 py-16 text-center">
            {/* LIVE badge */}
            <div className="inline-flex items-center gap-3 bg-green-500/15 border border-green-500/30 rounded-full px-5 py-2.5 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-black text-sm uppercase tracking-widest">
                {l === "fr" ? "Maintenant en direct" : l === "ht" ? "Kounye a an dirèk" : "Live now"}
              </span>
            </div>
            <h1 className="text-white font-black mb-3" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>{t(contest)}</h1>
            {contest.theme && <p className="text-[#c5a84f] text-sm mb-6">{contest.theme}</p>}

            {/* Time remaining */}
            {secLeft !== null && (
              <div className="inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-8 py-5 mb-8">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">
                  {l === "fr" ? "Temps restant" : l === "ht" ? "Tan ki rete" : "Time remaining"}
                </p>
                <p className={`font-black tabular-nums text-3xl ${secLeft < 300 ? "text-red-400" : "text-white"}`}>
                  {formatSeconds(secLeft)}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-10">
              <div className="text-center">
                <p className="text-white font-black text-2xl">{liveStats?.completed ?? 0}</p>
                <p className="text-white/30 text-xs">{l === "fr" ? "Terminés" : l === "ht" ? "Fini" : "Completed"}</p>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-2xl">{liveStats?.playing ?? 0}</p>
                <p className="text-white/30 text-xs">{l === "fr" ? "En jeu" : l === "ht" ? "Ap jwe" : "Playing"}</p>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-2xl">{liveStats?.registered ?? 0}</p>
                <p className="text-white/30 text-xs">{l === "fr" ? "Inscrits" : l === "ht" ? "Enskri" : "Registered"}</p>
              </div>
            </div>

            {/* CTA */}
            {alreadyPlayed ? (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-[#c5a84f]/10 border border-[#c5a84f]/25 rounded-2xl px-8 py-5 mb-2">
                  <p className="text-[#c5a84f] font-black text-lg">{myResult?.session?.score ?? 0} pts</p>
                  <p className="text-white/40 text-sm">{l === "fr" ? "Vous avez déjà participé" : l === "ht" ? "Ou deja patisipe" : "You already played"}</p>
                </div>
                <Link href={`/concours/${id}/results`}
                  className="inline-flex items-center gap-2 border border-white/20 bg-white/5 text-white font-bold text-sm px-7 py-3 rounded-full hover:bg-white/10 transition-colors">
                  {l === "fr" ? "Voir mes résultats →" : l === "ht" ? "Wè rezilta mwen →" : "View my results →"}
                </Link>
              </div>
            ) : currentlyPlaying ? (
              <Link href={`/concours/${id}/play`}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#030918] font-black text-base px-10 py-4 rounded-full transition-all"
                style={{ boxShadow: "0 4px 24px rgba(245,158,11,0.3)" }}>
                {l === "fr" ? "Reprendre le concours →" : l === "ht" ? "Reprann konkou a →" : "Resume contest →"}
              </Link>
            ) : (
              <Link href={`/concours/${id}/play`}
                className="inline-flex items-center gap-2 bg-[#c5a84f] hover:bg-[#d4b85c] text-[#030918] font-black text-base px-10 py-4 rounded-full transition-all"
                style={{ boxShadow: "0 4px 32px rgba(197,168,79,0.40)" }}>
                {l === "fr" ? "Participer au concours →" : l === "ht" ? "Patisipe nan konkou a →" : "Join the contest →"}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── UPCOMING / LOBBY VIEW ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#030918" }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 10%, rgba(197,168,79,0.18) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 70% at 0% 60%, rgba(29,78,216,0.10) 0%, transparent 55%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(197,168,79,0.5), transparent)" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-5 py-16 text-center">
          <Link href="/concours" className="inline-flex items-center gap-1 text-white/30 text-xs font-bold hover:text-white transition-colors mb-8">
            ← {l === "fr" ? "Tous les concours" : l === "ht" ? "Tout konkou yo" : "All contests"}
          </Link>

          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/25 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">
              {l === "fr" ? "Inscriptions ouvertes" : l === "ht" ? "Enskripsyon louvri" : "Registration open"}
            </span>
          </div>

          <h1 className="text-white font-black mb-2" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>{t(contest)}</h1>
          {contest.theme && <p className="text-[#c5a84f] text-sm font-semibold mb-3">{contest.theme}</p>}
          {desc(contest) && <p className="text-white/40 text-sm max-w-xl mx-auto mb-8 leading-relaxed">{desc(contest)}</p>}

          {/* Countdown */}
          {contest.scheduled_start_at && !countdown.expired && (
            <div className="mb-10">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em] mb-5">
                {l === "fr" ? "Début dans" : l === "ht" ? "Kòmanse nan" : "Starts in"}
              </p>
              <div className="flex items-start justify-center gap-3 sm:gap-5">
                {[
                  { v: countdown.days, l: l === "fr" ? "Jours" : l === "ht" ? "Jou" : "Days" },
                  { v: countdown.hours, l: l === "fr" ? "Heures" : l === "ht" ? "Èdtan" : "Hours" },
                  { v: countdown.minutes, l: "Min" },
                  { v: countdown.seconds, l: "Sec" },
                ].map(({ v, l: lbl }, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      {pad(v)}
                    </div>
                    <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mt-1">{lbl}</p>
                    {i < 3 && <span className="absolute text-white/20 font-black text-xl mt-3">:</span>}
                  </div>
                ))}
              </div>
              {contest.scheduled_start_at && (
                <p className="text-white/25 text-xs mt-4">
                  {new Date(contest.scheduled_start_at).toLocaleString(l === "ht" ? "fr" : l, {
                    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-10 mb-10">
            <div className="text-center">
              <p className="text-white font-black text-3xl">{liveStats?.registered ?? 0}</p>
              <p className="text-white/30 text-xs">{l === "fr" ? "Inscrits" : l === "ht" ? "Enskri" : "Registered"}</p>
            </div>
            <div className="text-center">
              <p className="text-white font-black text-3xl">{contest.duration_minutes ?? 45}</p>
              <p className="text-white/30 text-xs">min</p>
            </div>
            <div className="text-center">
              <p className="text-white font-black text-3xl">{contest.max_participants}</p>
              <p className="text-white/30 text-xs">max</p>
            </div>
          </div>

          {/* Rules */}
          <div className="max-w-lg mx-auto bg-white/[0.04] border border-white/8 rounded-2xl p-6 text-left mb-8">
            <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-3">
              {l === "fr" ? "Règles du concours" : l === "ht" ? "Règleman konkou a" : "Contest rules"}
            </p>
            {[
              { fr: `Durée : ${contest.duration_minutes ?? 45} minutes`, ht: `Dire : ${contest.duration_minutes ?? 45} minit`, en: `Duration: ${contest.duration_minutes ?? 45} minutes` },
              { fr: "Une seule participation autorisée par joueur", ht: "Yon sèl patisipasyon pèmèt pa jwè", en: "Only one participation per player" },
              { fr: "Les bonnes réponses rapides valent plus de points", ht: "Bon repons vit vo plis pwen", en: "Quick correct answers earn more points" },
              { fr: "Série de bonnes réponses = bonus de points", ht: "Seri bon repons = bonus pwen", en: "Answer streak = bonus points" },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <span className="text-[#c5a84f] font-black text-xs mt-0.5">✓</span>
                <p className="text-white/50 text-xs">{r[l]}</p>
              </div>
            ))}
          </div>

          {/* Join button */}
          {joined ? (
            <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 font-black text-sm px-7 py-3.5 rounded-full">
              ✓ {l === "fr" ? "Inscrit ! Le concours vous avertira au lancement." : l === "ht" ? "Enskri ! Konkou a ap avèti ou lè li kòmanse." : "Registered! You'll be notified when it starts."}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={joinContest}
                disabled={joining}
                className="inline-flex items-center gap-2 font-black text-base px-10 py-4 rounded-full transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #c5a84f, #d8bc5e)", color: "#030918", boxShadow: "0 4px 28px rgba(197,168,79,0.30)" }}>
                {joining ? (l === "fr" ? "Inscription..." : "...") : (l === "fr" ? "S'inscrire au concours" : l === "ht" ? "Enskri nan konkou a" : "Register for contest")}
              </button>
              {joinError && <p className="text-red-400 text-xs">{joinError}</p>}
              {!user && (
                <p className="text-white/30 text-xs">{l === "fr" ? "Connexion requise" : l === "ht" ? "Koneksyon obligatwa" : "Login required"}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
