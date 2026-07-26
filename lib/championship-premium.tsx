"use client";
// Couche d'animations premium partagée par les deux pages de concours.
// 60 fps garanti : uniquement transform/opacity, respecte prefers-reduced-motion.
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/championship-types";

// ─────────────────────────────────────────────────────────────────────────────
// Classement des équipes en direct (concours avancé) — panneau compact, top gauche.
// ─────────────────────────────────────────────────────────────────────────────
interface TeamRow { id: string; name: string; total_score: number; member_count: number; }

export function TeamStandingsFX({ contestId, lang }: { contestId: string; lang: Lang }) {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [open, setOpen] = useState(false);
  const medal = ["#f59e0b", "#cbd5e1", "#d97706"];

  useEffect(() => {
    if (!contestId) return;
    let alive = true;
    const load = () => fetch(`/api/contests/${contestId}/teams`).then(r => r.json()).then(d => { if (alive) setTeams(d.teams ?? []); }).catch(() => {});
    load();
    const iv = setInterval(load, 4000);
    return () => { alive = false; clearInterval(iv); };
  }, [contestId]);

  if (teams.length === 0) return null;
  const shown = open ? teams : teams.slice(0, 3);
  const label = lang === "fr" ? "Équipes" : lang === "ht" ? "Ekip" : lang === "es" ? "Equipos" : "Teams";

  return (
    <div className="fixed z-40 pointer-events-auto" style={{ top: 62, left: 8, maxWidth: 220 }}>
      <div style={{ background: "rgba(2,7,23,0.82)", backdropFilter: "blur(10px)", border: "1px solid rgba(99,102,241,0.35)", borderRadius: 14, padding: "8px 10px", boxShadow: "0 8px 30px rgba(0,0,0,0.35)" }}>
        <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-1.5 mb-1.5" style={{ color: "#a5b4fc", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ⛪ {label} <span style={{ marginLeft: "auto", opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
        </button>
        <div className="space-y-1">
          {shown.map((t, i) => (
            <div key={t.id} className="flex items-center gap-2">
              <span style={{ width: 16, textAlign: "center", fontWeight: 900, fontSize: 11, color: i < 3 ? medal[i] : "rgba(255,255,255,0.35)" }}>{i + 1}</span>
              <span className="truncate" style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#fff", maxWidth: 120 }}>{t.name}</span>
              <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 900, color: "#fbbf24" }}>{t.total_score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// La « room » de mon association — mes coéquipiers de la même église (à distance).
// ─────────────────────────────────────────────────────────────────────────────
interface Member { player_id: string; player_name: string; player_avatar: string | null; total_score: number; }

export function MyTeamRoomFX({ contestId, lang }: { contestId: string; lang: Lang }) {
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [me, setMe] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!contestId) return;
    let alive = true;
    const load = () => fetch(`/api/contests/${contestId}/my-team`).then(r => r.json()).then(d => {
      if (!alive) return;
      setTeam(d.team ?? null); setMembers(d.members ?? []); setMe(d.me ?? "");
    }).catch(() => {});
    load();
    const iv = setInterval(load, 4000);
    return () => { alive = false; clearInterval(iv); };
  }, [contestId]);

  if (!team) return null;
  const roster = lang === "fr" ? "Mon équipe" : lang === "ht" ? "Ekip mwen" : lang === "es" ? "Mi equipo" : "My team";
  const shown = open ? members : members.slice(0, 4);

  return (
    <div className="fixed z-40 pointer-events-auto" style={{ top: 62, right: 8, maxWidth: 210 }}>
      <div style={{ background: "rgba(2,7,23,0.82)", backdropFilter: "blur(10px)", border: "1px solid rgba(99,102,241,0.35)", borderRadius: 14, padding: "8px 10px", boxShadow: "0 8px 30px rgba(0,0,0,0.35)" }}>
        <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-1.5 mb-1.5" style={{ color: "#a5b4fc", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span style={{ opacity: 0.7 }}>⛪</span>
          <span className="truncate" style={{ maxWidth: 120 }}>{team.name}</span>
          <span style={{ marginLeft: "auto", opacity: 0.6, fontSize: 9 }}>{open ? "▲" : "▼"}</span>
        </button>
        <p style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{roster} · {members.length}</p>
        <div className="space-y-1.5">
          {shown.map((m) => (
            <div key={m.player_id} className="flex items-center gap-2" style={{ opacity: m.player_id === me ? 1 : 0.85 }}>
              {m.player_avatar
                ? <img src={m.player_avatar} alt="" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", border: m.player_id === me ? "1.5px solid #a5b4fc" : "1.5px solid rgba(255,255,255,0.15)" }} />
                : <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.6)" }}>{(m.player_name ?? "?")[0]?.toUpperCase()}</span>}
              <span className="truncate" style={{ flex: 1, fontSize: 11, fontWeight: m.player_id === me ? 800 : 600, color: m.player_id === me ? "#c7d2fe" : "#fff", maxWidth: 105 }}>{m.player_name}{m.player_id === me ? " •" : ""}</span>
              <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24" }}>{m.total_score.toLocaleString()}</span>
            </div>
          ))}
          {!open && members.length > 4 && (
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>+{members.length - 4}…</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS (à concaténer au bloc <style> existant des pages)
// ─────────────────────────────────────────────────────────────────────────────
export const PREMIUM_CSS = `
@keyframes prem-drift {
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  10%  { opacity: var(--o, 0.5); }
  90%  { opacity: var(--o, 0.5); }
  100% { transform: translateY(-120px) translateX(var(--dx, 10px)); opacity: 0; }
}
@keyframes prem-light-a {
  0%,100% { transform: translate(-10%, -10%) scale(1); }
  50%     { transform: translate(15%, 10%) scale(1.25); }
}
@keyframes prem-light-b {
  0%,100% { transform: translate(10%, 5%) scale(1.1); }
  50%     { transform: translate(-15%, -8%) scale(0.85); }
}
@keyframes prem-halo {
  0%,100% { opacity: 0.10; transform: scale(1); }
  50%     { opacity: 0.22; transform: scale(1.12); }
}
@keyframes prem-breath {
  0%,100% { transform: scale(1) translateY(0); }
  50%     { transform: scale(1.018) translateY(-2px); }
}
@keyframes prem-breath-icon {
  0%,100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(251,191,36,0)); }
  50%     { transform: scale(1.08); filter: drop-shadow(0 0 6px rgba(251,191,36,0.5)); }
}
@keyframes prem-toast-in {
  0%   { opacity: 0; transform: translateY(14px) scale(0.96); }
  12%  { opacity: 1; transform: translateY(0) scale(1); }
  85%  { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-10px) scale(0.98); }
}
@keyframes prem-verse-in {
  0%   { opacity: 0; transform: translateY(18px) scale(0.94); filter: blur(4px); }
  15%  { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  82%  { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  100% { opacity: 0; transform: translateY(-12px) scale(0.98); filter: blur(3px); }
}
@keyframes prem-combo {
  0%   { opacity: 0; transform: scale(0.4) rotate(-8deg); }
  40%  { opacity: 1; transform: scale(1.18) rotate(3deg); }
  60%  { transform: scale(0.98) rotate(-1deg); }
  75%  { transform: scale(1.04); }
  88%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.1); }
}
@keyframes prem-burst {
  0%   { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(var(--bx), var(--by)) scale(0.2); opacity: 0; }
}
@keyframes prem-ray {
  0%   { opacity: 0; transform: translateX(-50%) scaleY(0.3); }
  40%  { opacity: 0.9; }
  100% { opacity: 0.55; transform: translateX(-50%) scaleY(1); }
}
@keyframes prem-book-open {
  0%   { opacity: 0; transform: scale(0.4) rotateX(60deg); }
  60%  { opacity: 1; transform: scale(1.12) rotateX(0deg); }
  100% { opacity: 1; transform: scale(1) rotateX(0deg); }
}
@keyframes prem-title-in {
  0%   { opacity: 0; transform: translateY(20px); letter-spacing: 0.02em; }
  100% { opacity: 1; transform: translateY(0); letter-spacing: 0.14em; }
}
@keyframes prem-pulse-btn {
  0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.5); transform: scale(1); }
  50%     { box-shadow: 0 0 0 12px rgba(251,191,36,0); transform: scale(1.04); }
}
@keyframes prem-float-glyph {
  0%   { transform: translate3d(0,0,0) rotate(var(--rot,0deg)) scale(var(--sc,1)); }
  33%  { transform: translate3d(var(--gx,20px), calc(var(--gy,-30px) * 0.6), 0) rotate(calc(var(--rot,0deg) + 6deg)) scale(calc(var(--sc,1) * 1.08)); }
  66%  { transform: translate3d(calc(var(--gx,20px) * -0.5), var(--gy,-30px), 0) rotate(calc(var(--rot,0deg) - 5deg)) scale(calc(var(--sc,1) * 0.95)); }
  100% { transform: translate3d(0,0,0) rotate(var(--rot,0deg)) scale(var(--sc,1)); }
}
@keyframes prem-glyph-fade {
  0%,100% { opacity: 0; }
  20%,80% { opacity: var(--go, 0.12); }
}
@keyframes prem-aurora {
  0%   { transform: translate(-25%,-15%) rotate(0deg); opacity: 0.5; }
  50%  { transform: translate(15%,10%) rotate(180deg); opacity: 0.85; }
  100% { transform: translate(-25%,-15%) rotate(360deg); opacity: 0.5; }
}
@keyframes prem-sweep {
  0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
  15%  { opacity: 0.5; }
  50%  { opacity: 0.18; }
  100% { transform: translateX(120%) skewX(-18deg); opacity: 0; }
}
@keyframes prem-zoompan {
  0%,100% { transform: scale(1) translate(0,0); }
  50%     { transform: scale(1.15) translate(-2%, -3%); }
}
@keyframes prem-sparkle-fall {
  0%   { transform: translateY(-12%) rotate(0deg) scale(var(--sc,1)); opacity: 0; }
  10%  { opacity: var(--o,0.9); }
  90%  { opacity: var(--o,0.9); }
  100% { transform: translateY(680%) rotate(320deg) scale(var(--sc,1)); opacity: 0; }
}
@keyframes prem-twinkle {
  0%,100% { transform: scale(0.6); opacity: 0.25; }
  50%     { transform: scale(1.25); opacity: 1; }
}
@keyframes prem-rays-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes prem-trophy-pop {
  0%   { transform: scale(0.3) rotate(-12deg); opacity: 0; }
  55%  { transform: scale(1.18) rotate(5deg); opacity: 1; }
  72%  { transform: scale(0.96) rotate(-2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes prem-trophy-float { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
@keyframes prem-cert-in { 0% { opacity: 0; transform: translateY(30px) scale(0.96) rotateX(12deg); } 100% { opacity: 1; transform: none; } }
@keyframes prem-seal-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes prem-shine-sweep { 0% { transform: translateX(-140%) skewX(-20deg); } 100% { transform: translateX(240%) skewX(-20deg); } }
.prem-breath { animation: prem-breath 5.5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .prem-breath, [data-prem] { animation: none !important; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Fond vivant : lumière dorée mouvante, halos, particules flottantes (item 13/20)
// ─────────────────────────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  // pseudo-aléatoire déterministe (pas de Math.random → pas de mismatch)
  const s = Math.sin(i * 12.9898) * 43758.5453;
  const r = s - Math.floor(s);
  const s2 = Math.sin(i * 78.233) * 12543.14;
  const r2 = s2 - Math.floor(s2);
  return {
    left: `${Math.round(r * 100)}%`,
    size: 2 + Math.round(r2 * 4),
    delay: `${(r * 9).toFixed(2)}s`,
    dur: `${(9 + r2 * 8).toFixed(2)}s`,
    dx: `${Math.round((r2 - 0.5) * 40)}px`,
    o: (0.25 + r2 * 0.4).toFixed(2),
    gold: i % 3 !== 0,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Fond IMMERSIF du match en direct : aurore mouvante, grands symboles bibliques
// qui dérivent/pulsent lentement, faisceaux de lumière qui balaient l'écran.
// Purement décoratif (pointer-events:none), 60fps (transform/opacity only).
// ─────────────────────────────────────────────────────────────────────────────
const GLYPHS = ["✝️", "📖", "🕊️", "👑", "⭐", "🌿", "🔥", "🙏", "☁️", "🌅", "📜", "⛪"];
const FLOATERS = Array.from({ length: 14 }, (_, i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453; const r = s - Math.floor(s);
  const s2 = Math.sin(i * 78.233) * 12543.14; const r2 = s2 - Math.floor(s2);
  const s3 = Math.sin(i * 3.111) * 9271.7; const r3 = s3 - Math.floor(s3);
  return {
    glyph: GLYPHS[i % GLYPHS.length],
    left: `${Math.round(r * 92) + 2}%`,
    top: `${Math.round(r2 * 82) + 4}%`,
    size: 34 + Math.round(r3 * 66),           // 34–100px
    rot: `${Math.round((r - 0.5) * 30)}deg`,
    sc: (0.85 + r2 * 0.5).toFixed(2),
    gx: `${Math.round((r2 - 0.5) * 60)}px`,
    gy: `${Math.round(-20 - r3 * 40)}px`,
    go: (0.06 + r3 * 0.1).toFixed(2),         // très discret
    dur: `${(16 + r2 * 16).toFixed(1)}s`,
    fadeDur: `${(9 + r * 8).toFixed(1)}s`,
    delay: `${(r3 * 8).toFixed(1)}s`,
  };
});

export function ImmersiveBackdrop({ accent = "#e6b83c", embedded = false }: { accent?: string; embedded?: boolean }) {
  return (
    <div className="pointer-events-none overflow-hidden" style={{ position: embedded ? "absolute" : "fixed", inset: 0, zIndex: 0 }} aria-hidden>
      {/* Aurore colorée mouvante */}
      <div style={{
        position: "absolute", top: "-40%", left: "-30%", width: "160%", height: "160%",
        background: `conic-gradient(from 0deg at 50% 50%, ${accent}22, transparent 25%, rgba(59,130,246,0.18) 50%, transparent 72%, ${accent}22)`,
        filter: "blur(60px)", animation: "prem-aurora 40s linear infinite", willChange: "transform, opacity",
      }} data-prem />
      {/* Grands symboles bibliques qui dérivent et pulsent */}
      {FLOATERS.map((f, i) => (
        <span key={i} style={{
          position: "absolute", left: f.left, top: f.top, fontSize: f.size,
          // @ts-expect-error custom props
          "--rot": f.rot, "--sc": f.sc, "--gx": f.gx, "--gy": f.gy, "--go": f.go,
          filter: `drop-shadow(0 6px 24px ${accent}30)`,
          animation: `prem-float-glyph ${f.dur} ${f.delay} ease-in-out infinite, prem-glyph-fade ${f.fadeDur} ${f.delay} ease-in-out infinite`,
          willChange: "transform, opacity",
        }} data-prem>{f.glyph}</span>
      ))}
      {/* Faisceaux de lumière qui balaient l'écran de temps en temps */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "45%", height: "100%",
        background: `linear-gradient(90deg, transparent, ${accent}18, transparent)`,
        animation: "prem-sweep 11s 2s ease-in-out infinite", willChange: "transform, opacity",
      }} data-prem />
      <div style={{
        position: "absolute", top: 0, left: 0, width: "35%", height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.14), transparent)",
        animation: "prem-sweep 15s 7s ease-in-out infinite", willChange: "transform, opacity",
      }} data-prem />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CÉLÉBRATION DU CHAMPION : pluie d'étincelles + certificat imprimable.
// ─────────────────────────────────────────────────────────────────────────────
const SPARKLES = Array.from({ length: 40 }, (_, i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453; const r = s - Math.floor(s);
  const s2 = Math.sin(i * 78.233) * 12543.14; const r2 = s2 - Math.floor(s2);
  const s3 = Math.sin(i * 3.7) * 9271.7; const r3 = s3 - Math.floor(s3);
  return {
    left: `${Math.round(r * 100)}%`,
    glyph: ["✦", "✧", "⋆", "✨", "•"][i % 5],
    size: 8 + Math.round(r3 * 18),
    dur: `${(3.2 + r2 * 3.5).toFixed(2)}s`,
    delay: `${(r * 5).toFixed(2)}s`,
    o: (0.55 + r3 * 0.45).toFixed(2),
    sc: (0.7 + r2 * 0.8).toFixed(2),
    gold: i % 3 !== 0,
  };
});

export function ChampionSparkles({ accent = "#e6b83c", embedded = true }: { accent?: string; embedded?: boolean }) {
  return (
    <div className="pointer-events-none overflow-hidden" style={{ position: embedded ? "absolute" : "fixed", inset: 0, zIndex: 2 }} aria-hidden>
      {SPARKLES.map((p, i) => (
        <span key={i} style={{
          position: "absolute", top: 0, left: p.left, fontSize: p.size,
          color: p.gold ? accent : "#fff", textShadow: `0 0 8px ${p.gold ? accent : "#fff"}`,
          // @ts-expect-error custom props
          "--o": p.o, "--sc": p.sc,
          opacity: 0, animation: `prem-sparkle-fall ${p.dur} ${p.delay} linear infinite`,
          willChange: "transform, opacity",
        }} data-prem>{p.glyph}</span>
      ))}
    </div>
  );
}

const CERT_WORDS: Record<Lang, { title: string; to: string; crowned: string; of: string; signed: string }> = {
  fr: { title: "Certificat de Champion", to: "Décerné à", crowned: "Sacré Champion Biblique du tournoi", of: "", signed: "KONEKSYON PAM — Communauté" },
  en: { title: "Champion Certificate", to: "Awarded to", crowned: "Crowned Bible Champion of the tournament", of: "", signed: "KONEKSYON PAM — Community" },
  ht: { title: "Sètifika Chanpyon", to: "Bay", crowned: "Kouwone Chanpyon Biblik tounwa a", of: "", signed: "KONEKSYON PAM — Kominote" },
  es: { title: "Certificado de Campeón", to: "Otorgado a", crowned: "Coronado Campeón Bíblico del torneo", of: "", signed: "KONEKSYON PAM — Comunidad" },
};

export function ChampionCertificate({ teamName, logoSeed, color = "#e6b83c", seasonName, dateStr, lang = "fr" }: { teamName: string; logoSeed: string; color?: string; seasonName: string; dateStr: string; lang?: Lang }) {
  const w = CERT_WORDS[lang] ?? CERT_WORDS.fr;
  const GOLD = "#c8960f";
  return (
    <div id="champ-certificate" style={{ maxWidth: 560, margin: "0 auto", animation: "prem-cert-in 0.9s cubic-bezier(0.22,1,0.36,1) both" }}>
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 14,
        background: "linear-gradient(150deg,#fffdf5,#fbf3dd)",
        border: `2px solid ${GOLD}`, boxShadow: `0 24px 70px rgba(0,0,0,0.4), inset 0 0 0 6px #fff, inset 0 0 0 8px ${GOLD}55`,
        padding: "34px 28px", textAlign: "center",
      }}>
        {/* reflet qui balaie */}
        <div style={{ position: "absolute", top: 0, bottom: 0, width: "40%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)", animation: "prem-shine-sweep 4.5s 0.8s ease-in-out infinite", pointerEvents: "none" }} aria-hidden />
        <div style={{ fontSize: 40, animation: "prem-trophy-float 3s ease-in-out infinite" }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.32em", color: GOLD, textTransform: "uppercase", marginTop: 6 }}>{w.title}</div>
        <div style={{ width: 60, height: 2, background: GOLD, margin: "12px auto", opacity: 0.5 }} />
        <div style={{ fontSize: 12, color: "#8a6d2f", fontWeight: 700, letterSpacing: "0.1em" }}>{w.to}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "10px 0 6px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 10, background: color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, boxShadow: `0 4px 14px ${color}88` }}>{logoSeed}</span>
          <span style={{ fontSize: "clamp(1.5rem,6vw,2.3rem)", fontWeight: 900, color: "#1a1203", fontFamily: "'Playfair Display',Georgia,serif" }}>{teamName.replace("Équipe ", "")}</span>
        </div>
        <div style={{ fontSize: 13, color: "#5a4a22", fontStyle: "italic", maxWidth: 380, margin: "8px auto 0", lineHeight: 1.5 }}>{w.crowned}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, marginTop: 4 }}>« {seasonName} »</div>
        {/* Sceau + signature */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22, gap: 12 }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 10, color: "#8a6d2f" }}>{dateStr}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#5a4a22", borderTop: "1px solid #d8c48a", paddingTop: 3, marginTop: 3 }}>{w.signed}</div>
          </div>
          <div style={{ position: "relative", width: 54, height: 54, flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle,${GOLD},#a97d18)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, boxShadow: `0 4px 14px ${GOLD}99` }}>★</div>
            <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `2px dashed ${GOLD}`, animation: "prem-seal-spin 12s linear infinite" }} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AmbientFX({ accent = "#f59e0b", embedded = false }: { accent?: string; embedded?: boolean }) {
  return (
    <div className="pointer-events-none overflow-hidden" style={{ position: embedded ? "absolute" : "fixed", inset: 0, zIndex: 0 }} aria-hidden>
      {/* Lumières dorées lentes */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%",
        background: `radial-gradient(circle, ${accent}22 0%, transparent 65%)`,
        animation: "prem-light-a 22s ease-in-out infinite", willChange: "transform",
      }} data-prem />
      <div style={{
        position: "absolute", bottom: "-25%", right: "-10%", width: "55%", height: "55%",
        background: "radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 65%)",
        animation: "prem-light-b 26s ease-in-out infinite", willChange: "transform",
      }} data-prem />
      {/* Halos */}
      <div style={{
        position: "absolute", top: "30%", left: "20%", width: 260, height: 260, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        animation: "prem-halo 9s ease-in-out infinite", willChange: "transform, opacity",
      }} data-prem />
      {/* Particules flottantes */}
      {PARTICLES.map((p, i) => (
        <span key={i} style={{
          position: "absolute", bottom: "-10px", left: p.left,
          width: p.size, height: p.size, borderRadius: "50%",
          background: p.gold ? accent : "#93c5fd",
          // @ts-expect-error custom props
          "--dx": p.dx, "--o": p.o,
          opacity: 0, animation: `prem-drift ${p.dur} ${p.delay} ease-in-out infinite`,
          willChange: "transform, opacity",
        }} data-prem />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Messages motivants (item 10) + versets inspirants (item 11) + combos (item 14)
// ─────────────────────────────────────────────────────────────────────────────
const CHEERS: Record<Lang, string[]> = {
  fr: ["⭐ Excellent !", "Continuez !", "Dieu vous donne la sagesse.", "Vous progressez très bien.", "Gardez votre concentration !", "Incroyable !", "Superbe, continuez ainsi !", "Restez focalisé."],
  en: ["⭐ Excellent!", "Keep going!", "God gives you wisdom.", "You're doing great.", "Stay focused!", "Incredible!", "Superb, keep it up!", "Stay sharp."],
  ht: ["⭐ Ekselan !", "Kontinye !", "Bondye ba ou sajès.", "W ap byen vanse.", "Rete konsantre !", "Enkwayab !", "Sipèb, kontinye konsa !", "Rete fokis."],
  es: ["⭐ ¡Excelente!", "¡Sigue así!", "Dios te da sabiduría.", "Lo estás haciendo muy bien.", "¡Mantén la concentración!", "¡Increíble!", "¡Estupendo, sigue así!", "Mantente atento."],
};

const VERSES: Record<Lang, { t: string; r: string }[]> = {
  fr: [
    { t: "La parole de Dieu est une lampe à mes pieds.", r: "Psaume 119:105" },
    { t: "Cherchez et vous trouverez.", r: "Matthieu 7:7" },
    { t: "La sagesse vient de Dieu.", r: "Proverbes 2:6" },
    { t: "Tout est possible à celui qui croit.", r: "Marc 9:23" },
    { t: "L'Éternel est ma lumière et mon salut.", r: "Psaume 27:1" },
  ],
  en: [
    { t: "Your word is a lamp to my feet.", r: "Psalm 119:105" },
    { t: "Seek and you will find.", r: "Matthew 7:7" },
    { t: "Wisdom comes from God.", r: "Proverbs 2:6" },
    { t: "Everything is possible for one who believes.", r: "Mark 9:23" },
    { t: "The Lord is my light and my salvation.", r: "Psalm 27:1" },
  ],
  ht: [
    { t: "Pawòl Bondye se yon lanp pou pye m.", r: "Sòm 119:105" },
    { t: "Chèche epi n ap jwenn.", r: "Matye 7:7" },
    { t: "Sajès soti nan men Bondye.", r: "Pwovèb 2:6" },
    { t: "Tout bagay posib pou moun ki kwè.", r: "Mak 9:23" },
    { t: "Senyè a se limyè m ak delivrans mwen.", r: "Sòm 27:1" },
  ],
  es: [
    { t: "Tu palabra es lámpara a mis pies.", r: "Salmo 119:105" },
    { t: "Busca y hallarás.", r: "Mateo 7:7" },
    { t: "La sabiduría viene de Dios.", r: "Proverbios 2:6" },
    { t: "Todo es posible para el que cree.", r: "Marcos 9:23" },
    { t: "El Señor es mi luz y mi salvación.", r: "Salmo 27:1" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Jauge XP / niveau (item 15) + badges débloqués (item 17)
// ─────────────────────────────────────────────────────────────────────────────
const XP_PER_LEVEL = 400;

type Badge = { id: string; emoji: string; label: Record<Lang, string> };
const BADGES: { badge: Badge; when: (score: number, streak: number) => boolean }[] = [
  { badge: { id: "rapide", emoji: "🔥", label: { fr: "Rapide", en: "Fast", ht: "Rapid", es: "Veloz" } }, when: (_s, k) => k >= 3 },
  { badge: { id: "persev", emoji: "💪", label: { fr: "Persévérant", en: "Persistent", ht: "Pèseveran", es: "Perseverante" } }, when: (_s, k) => k >= 5 },
  { badge: { id: "conn", emoji: "📖", label: { fr: "Connaisseur", en: "Connoisseur", ht: "Konesè", es: "Conocedor" } }, when: (s) => s >= 500 },
  { badge: { id: "fidele", emoji: "🎓", label: { fr: "Étudiant fidèle", en: "Faithful Student", ht: "Etidyan fidèl", es: "Estudiante fiel" } }, when: (s) => s >= 1200 },
  { badge: { id: "maitre", emoji: "👑", label: { fr: "Maître Biblique", en: "Bible Master", ht: "Mèt Biblik", es: "Maestro Bíblico" } }, when: (s) => s >= 2500 },
];

const LEVEL_WORD: Record<Lang, string> = { fr: "Niveau", en: "Level", ht: "Nivo", es: "Nivel" };
const NEWBADGE_WORD: Record<Lang, string> = { fr: "Nouveau badge !", en: "New badge!", ht: "Nouvo badj !", es: "¡Nueva insignia!" };

export function LevelBadgeFX({
  score, streak, lang, accent = "#f59e0b", embedded = false,
}: { score: number; streak: number; lang: Lang; accent?: string; embedded?: boolean }) {
  const pos = embedded ? "absolute" : "fixed";
  const level = Math.floor(score / XP_PER_LEVEL) + 1;
  const progress = (score % XP_PER_LEVEL) / XP_PER_LEVEL;
  const prevLevel = useRef(level);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const awarded = useRef<Set<string>>(new Set());
  const [badge, setBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (level > prevLevel.current) {
      setLevelUp(level);
      const to = setTimeout(() => setLevelUp(null), 1800);
      prevLevel.current = level;
      return () => clearTimeout(to);
    }
    prevLevel.current = level;
  }, [level]);

  useEffect(() => {
    for (const { badge: b, when } of BADGES) {
      if (!awarded.current.has(b.id) && when(score, streak)) {
        awarded.current.add(b.id);
        setBadge(b);
        const to = setTimeout(() => setBadge(null), 2600);
        return () => clearTimeout(to);
      }
    }
  }, [score, streak]);

  return (
    <>
      {/* Jauge XP permanente (bas gauche) */}
      <div className="pointer-events-none" style={{ position: pos, left: 12, bottom: 12, zIndex: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(2,7,23,0.65)", backdropFilter: "blur(10px)", border: `1px solid ${accent}33`, borderRadius: 999, padding: "5px 10px 5px 6px" }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #fcd34d)`, color: "#020717", fontWeight: 900, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 10px ${accent}66` }}>{level}</span>
          <div style={{ width: 72 }}>
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", lineHeight: 1 }}>{LEVEL_WORD[lang] ?? "Niveau"} {level}</div>
            <div style={{ marginTop: 3, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round(progress * 100)}%`, borderRadius: 999, background: `linear-gradient(90deg, #3b82f6, ${accent})`, transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Montée de niveau */}
      {levelUp !== null && (
        <div className="pointer-events-none flex items-center justify-center" style={{ position: pos, inset: 0, zIndex: 40 }} aria-hidden>
          <div key={levelUp} style={{ animation: "prem-combo 1.8s cubic-bezier(0.34,1.56,0.64,1) both", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.2em", color: accent, textTransform: "uppercase" }}>{LEVEL_WORD[lang] ?? "Niveau"}</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: "#fff", textShadow: `0 4px 30px ${accent}, 0 0 50px ${accent}aa`, lineHeight: 1 }}>{levelUp}</div>
          </div>
        </div>
      )}

      {/* Badge débloqué */}
      {badge && (
        <div className="pointer-events-none" style={{ position: pos, left: "50%", transform: "translateX(-50%)", bottom: "18%", zIndex: 40 }}>
          <div key={badge.id} style={{
            animation: "prem-verse-in 2.6s ease both",
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(10,15,40,0.82)", backdropFilter: "blur(14px)",
            border: `1px solid ${accent}55`, borderRadius: 18, padding: "12px 20px",
            boxShadow: `0 12px 50px ${accent}33`,
          }}>
            <span style={{ fontSize: 34, animation: "prem-breath-icon 1.2s ease-in-out infinite" }}>{badge.emoji}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: accent, textTransform: "uppercase" }}>{NEWBADGE_WORD[lang] ?? "Nouveau badge !"}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{badge.label[lang] ?? badge.label.fr}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function comboLabel(streak: number, lang: Lang): string | null {
  const m: Record<number, Record<Lang, string>> = {
    3: { fr: "🔥 Série de 3 !", en: "🔥 3 in a row!", ht: "🔥 Seri de 3 !", es: "🔥 ¡Racha de 3!" },
    5: { fr: "⭐ Impressionnant !", en: "⭐ Impressive!", ht: "⭐ Enpresyonan !", es: "⭐ ¡Impresionante!" },
    10: { fr: "👑 Expert Biblique !", en: "👑 Bible Expert!", ht: "👑 Ekspè Biblik !", es: "👑 ¡Experto Bíblico!" },
  };
  return m[streak]?.[lang] ?? null;
}

const BURST = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  return { bx: `${Math.round(Math.cos(a) * 90)}px`, by: `${Math.round(Math.sin(a) * 90)}px`, i };
});

/**
 * Overlay pédago/motivation. Se déclenche à chaque nouvelle question (qKey change)
 * et sur les paliers de série. Pointer-events none, ne gêne jamais la lecture.
 */
export function CoachFX({
  qKey, qNumber, streak, lang, accent = "#f59e0b", embedded = false,
}: { qKey: string; qNumber: number; streak: number; lang: Lang; accent?: string; embedded?: boolean }) {
  const pos = embedded ? "absolute" : "fixed";
  const [cheer, setCheer] = useState<string | null>(null);
  const [verse, setVerse] = useState<{ t: string; r: string } | null>(null);
  const [combo, setCombo] = useState<string | null>(null);
  const seenQ = useRef<string>("");
  const cheerIdx = useRef(0);
  const prevStreak = useRef(0);

  // Nouvelle question → message d'encouragement, et verset tous les 5 questions.
  useEffect(() => {
    if (!qKey || qKey === seenQ.current) return;
    const first = seenQ.current === "";
    seenQ.current = qKey;
    if (first) return; // pas de toast avant la 1re réponse
    if (qNumber > 0 && qNumber % 5 === 0) {
      const list = VERSES[lang] ?? VERSES.fr;
      setVerse(list[(qNumber / 5) % list.length]);
      const to = setTimeout(() => setVerse(null), 2600);
      return () => clearTimeout(to);
    }
    const list = CHEERS[lang] ?? CHEERS.fr;
    setCheer(list[cheerIdx.current % list.length]);
    cheerIdx.current += 1;
    const to = setTimeout(() => setCheer(null), 2200);
    return () => clearTimeout(to);
  }, [qKey, qNumber, lang]);

  // Palier de série (3 / 5 / 10) → combo + explosion de particules.
  useEffect(() => {
    if (streak > prevStreak.current) {
      const label = comboLabel(streak, lang);
      if (label) {
        setCombo(label);
        const to = setTimeout(() => setCombo(null), 1600);
        prevStreak.current = streak;
        return () => clearTimeout(to);
      }
    }
    prevStreak.current = streak;
  }, [streak, lang]);

  return (
    <>
      {/* Encouragement */}
      {cheer && (
        <div className="pointer-events-none" style={{ position: pos, left: "50%", transform: "translateX(-50%)", top: embedded ? 56 : 68, zIndex: 40 }}>
          <div key={cheer} style={{
            animation: "prem-toast-in 2.2s ease both",
            background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
            border: `1px solid ${accent}40`, color: "#fff",
            padding: "8px 18px", borderRadius: 999, fontWeight: 800, fontSize: 14,
            boxShadow: `0 8px 30px ${accent}22`, whiteSpace: "nowrap",
          }}>{cheer}</div>
        </div>
      )}

      {/* Verset inspirant */}
      {verse && (
        <div className="pointer-events-none flex justify-center px-6" style={{ position: pos, left: 0, right: 0, top: "18%", zIndex: 40 }}>
          <div key={verse.r} style={{
            animation: "prem-verse-in 2.6s ease both",
            background: "rgba(10,15,40,0.72)", backdropFilter: "blur(14px)",
            border: `1px solid ${accent}33`, borderRadius: 20, padding: "18px 24px",
            textAlign: "center", maxWidth: 420, boxShadow: `0 12px 50px rgba(0,0,0,0.4)`,
          }}>
            <p style={{ color: "#fff", fontSize: 16, fontStyle: "italic", lineHeight: 1.5, marginBottom: 6 }}>“{verse.t}”</p>
            <p style={{ color: accent, fontSize: 12, fontWeight: 800, letterSpacing: "0.04em" }}>{verse.r}</p>
          </div>
        </div>
      )}

      {/* Combo + explosion */}
      {combo && (
        <div className="pointer-events-none flex items-center justify-center" style={{ position: pos, inset: 0, zIndex: 40 }} aria-hidden>
          <div style={{ position: "relative" }}>
            {BURST.map((b) => (
              <span key={b.i} style={{
                position: "absolute", top: "50%", left: "50%", width: 8, height: 8, borderRadius: "50%",
                background: b.i % 2 ? accent : "#fde68a",
                // @ts-expect-error custom props
                "--bx": b.bx, "--by": b.by,
                animation: "prem-burst 0.9s ease-out forwards",
              }} />
            ))}
            <div key={combo} style={{
              animation: "prem-combo 1.6s cubic-bezier(0.34,1.56,0.64,1) both",
              fontSize: 30, fontWeight: 900, color: "#fff", textAlign: "center",
              textShadow: `0 4px 30px ${accent}, 0 0 40px ${accent}88`, whiteSpace: "nowrap",
            }}>{combo}</div>
          </div>
        </div>
      )}
    </>
  );
}
