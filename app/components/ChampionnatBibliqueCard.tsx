"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";

// Accès direct au Championnat Biblique en direct depuis le compte (sans lien partagé).
// Ne s'affiche que s'il existe un championnat.
export default function ChampionnatBibliqueCard() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as "fr" | "ht" | "en" | "es";
  const [season, setSeason] = useState<{ id: string; name: string; status: string } | null>(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/championship").then(r => r.json()).then(d => {
      const s = (d.seasons ?? [])[0];
      if (!alive || !s) return;
      setSeason(s);
      fetch(`/api/championship/${s.id}/my-matches`).then(r => r.json()).then(mm => { if (alive) setIsMember(!!mm.member); }).catch(() => {});
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!season) return null;
  const finished = season.status === "finished";
  const title = l === "fr" ? "Championnat Biblique" : l === "ht" ? "Chanpyona Biblik" : l === "es" ? "Campeonato Bíblico" : "Bible Championship";
  const sub = finished
    ? (l === "fr" ? "Découvre le champion et le classement" : l === "ht" ? "Dekouvri chanpyon an" : l === "es" ? "Descubre al campeón" : "See the champion & standings")
    : isMember
      ? (l === "fr" ? "Tu es inscrit ! Va jouer tes matchs" : l === "ht" ? "Ou enskri ! Al jwe" : l === "es" ? "¡Estás inscrito! Ve a jugar" : "You're in! Go play your matches")
      : (l === "fr" ? "En direct — rejoins ton équipe et joue !" : l === "ht" ? "An dirèk — antre nan ekip ou !" : l === "es" ? "En vivo — ¡únete a tu equipo!" : "Live — join your team and play!");
  const cta = finished
    ? (l === "fr" ? "Voir le résultat" : l === "ht" ? "Wè rezilta" : l === "es" ? "Ver resultado" : "See result")
    : isMember
      ? (l === "fr" ? "Mes matchs" : l === "ht" ? "Match mwen" : l === "es" ? "Mis partidos" : "My matches")
      : (l === "fr" ? "Rejoindre" : l === "ht" ? "Antre" : l === "es" ? "Unirse" : "Join");

  return (
    <Link href="/championnat" className="block" style={{ textDecoration: "none", animation: "dash-card-in 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, padding: "16px 18px", marginBottom: 20, background: "linear-gradient(135deg,#14213f,#1a3568 60%,#0d1d3d)", border: "1px solid rgba(230,184,60,0.4)", boxShadow: "0 10px 34px rgba(200,150,15,0.18)" }}>
        <style>{`@keyframes cbc-shine{0%{transform:translateX(-140%) skewX(-20deg)}100%{transform:translateX(260%) skewX(-20deg)}}@keyframes cbc-pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        <div style={{ position: "absolute", top: 0, bottom: 0, width: "35%", background: "linear-gradient(90deg,transparent,rgba(230,184,60,0.18),transparent)", animation: "cbc-shine 4.5s 1s ease-in-out infinite", pointerEvents: "none" }} aria-hidden />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 38, filter: "drop-shadow(0 4px 12px rgba(230,184,60,0.5))" }}>🏆</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{title}</span>
              {!finished && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 900, color: "#f87171", letterSpacing: "0.1em" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", animation: "cbc-pulse 1s ease-in-out infinite" }} /> LIVE</span>}
            </div>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</p>
          </div>
          <span style={{ flexShrink: 0, padding: "9px 18px", borderRadius: 999, background: "linear-gradient(135deg,#e6b83c,#a97d18)", color: "#1a1203", fontWeight: 900, fontSize: 13, whiteSpace: "nowrap" }}>{cta} →</span>
        </div>
      </div>
    </Link>
  );
}
