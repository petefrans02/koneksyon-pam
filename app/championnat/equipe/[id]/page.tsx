"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Team { id: string; name: string; color: string; logo_seed: string; group_label: string; played: number; won: number; drawn: number; lost: number; points: number; correct_total: number; score_for: number; score_against: number; final_rank: number | null; }
interface Member { id: string; name: string; avatar: string | null; country: string | null; level: string | null; }
interface Hist { stage: string; group_label: string | null; opponent: { name: string; color: string; logo_seed: string } | null; my_score: number | null; opp_score: number | null; result: string; status: string; }

const GOLD = "#e6b83c";
const stageLabel = (s: string) => s === "group" ? "Poule" : s === "quarter" ? "Quart" : s === "semi" ? "Demi" : s === "final" ? "Finale" : s === "third" ? "3e place" : s;

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ team: Team; members: Member[]; history: Hist[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/championship/team/${id}`).then(r => r.json()).then(d => { if (!d.error) setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ minHeight: "100vh", background: "#04070f", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>Chargement…</div>;
  if (!data) return <div style={{ minHeight: "100vh", background: "#04070f", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>Équipe introuvable.</div>;

  const { team, members, history } = data;
  const winPct = team.played ? Math.round((team.won / team.played) * 100) : 0;
  const rankLabel = team.final_rank === 1 ? "🏆 Champion" : team.final_rank === 2 ? "🥈 Vice-champion" : team.final_rank === 3 ? "🥉 Troisième" : null;

  const resColor = (r: string) => r === "V" ? "#22c55e" : r === "D" ? "#ef4444" : r === "N" ? "#eab308" : "rgba(255,255,255,0.3)";

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 40% at 50% 0%, #14213f 0%, #070c1a 55%, #04070f 100%)", color: "#fff", paddingBottom: 60 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>
        <Link href="/championnat" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 700 }}>← Championnat</Link>

        {/* HERO ÉQUIPE */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "20px 0 28px", flexWrap: "wrap" }}>
          <span style={{ width: 74, height: 74, borderRadius: 20, background: team.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 30, boxShadow: `0 8px 30px ${team.color}66` }}>{team.logo_seed}</span>
          <div>
            <h1 style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", fontWeight: 900 }}>{team.name}</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Groupe {team.group_label} · {team.points} pts</p>
            {rankLabel && <p style={{ color: GOLD, fontWeight: 900, marginTop: 4 }}>{rankLabel}</p>}
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 10, marginBottom: 30 }}>
          {[
            { l: "Matchs", v: team.played },
            { l: "Victoires", v: team.won, c: "#22c55e" },
            { l: "Défaites", v: team.lost, c: "#ef4444" },
            { l: "% Victoire", v: `${winPct}%`, c: GOLD },
            { l: "Bonnes rép.", v: team.correct_total, c: "#60a5fa" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: s.c ?? "#fff", fontVariantNumeric: "tabular-nums" }}>{s.v}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 2 }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* JOUEURS */}
        <h2 style={{ fontSize: 12, fontWeight: 900, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Effectif ({members.length})</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 30 }}>
          {members.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 12px" }}>
              {m.avatar ? <img src={m.avatar} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", background: "#fff" }} />
                : <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{(m.name ?? "?")[0]}</span>}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</p>
                {m.country && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.country}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* HISTORIQUE */}
        <h2 style={{ fontSize: 12, fontWeight: 900, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Matchs</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 14px" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", width: 44 }}>{stageLabel(h.stage)}</span>
              {h.opponent && <span style={{ width: 24, height: 24, borderRadius: 7, background: h.opponent.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10 }}>{h.opponent.logo_seed}</span>}
              <span style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{h.opponent?.name.replace("Équipe ", "") ?? "—"}</span>
              {h.status === "done"
                ? <span style={{ fontWeight: 900, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.85)" }}>{Math.round(h.my_score ?? 0)} - {Math.round(h.opp_score ?? 0)}</span>
                : <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>à jouer</span>}
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${resColor(h.result)}22`, color: resColor(h.result), fontWeight: 900, fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{h.result}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
