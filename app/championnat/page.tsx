"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChampionSparkles, ChampionCertificate } from "@/lib/championship-premium";
import { useLang } from "@/lib/LangContext";
import { teamLabel } from "@/lib/champ-data";

interface Team {
  id: string; name: string; color: string; logo_seed: string; group_label: string;
  played: number; won: number; drawn: number; lost: number; points: number;
  score_for: number; score_against: number; final_rank: number | null;
  members?: { real: number; ai: number };
}
interface Match { id: string; stage: string; team_a: string; team_b: string; score_a: number | null; score_b: number | null; winner: string | null; status: string; }
interface Season { id: string; name: string; status: string; }
interface Detail { season: Season; groups: Record<string, Team[]>; matches: Match[]; }

const GOLD = "#e6b83c";

export default function ChampionnatPage() {
  const { lang } = useLang();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [none, setNone] = useState(false);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  function invite() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/championnat` : "";
    const text = `🏆 Rejoins le Championnat Biblique KONEKSYON PAM ! Joue pour ton équipe : ${url}`;
    if (navigator.share) { navigator.share({ title: "Championnat Biblique", text, url }).catch(() => {}); return; }
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }).catch(() => {});
  }
  const [myMatches, setMyMatches] = useState<{ member: boolean; my_team?: { name: string; color: string; logo_seed: string } | null; my_team_eliminated?: boolean; matches?: { match_id: string; stage: string; opponent: { name: string; color: string; logo_seed: string } | null; played: boolean; playable: boolean; status: string; starts_in_sec: number | null }[] } | null>(null);
  const loadMyMatches = (sid: string) => fetch(`/api/championship/${sid}/my-matches`).then(r => r.json()).then(setMyMatches).catch(() => {});

  const [showPicker, setShowPicker] = useState(false);
  const [churchName, setChurchName] = useState("");
  async function createChurchTeam(seasonId: string) {
    if (churchName.trim().length < 2) { setJoinMsg("Nom trop court"); return; }
    setJoining(true); setJoinMsg(null);
    try {
      const res = await fetch(`/api/championship/${seasonId}/create-team`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: churchName.trim() }),
      });
      if (res.status === 401) { window.location.href = "/auth?redirect=/championnat"; return; }
      const d = await res.json();
      if (d.ok) { setShowPicker(false); setJoinMsg(`🏛️ Équipe « ${d.team?.name} » créée ! Invite tes membres.`); loadMyMatches(seasonId); fetch(`/api/championship/${seasonId}`).then(r => r.json()).then(setDetail).catch(() => {}); }
      else setJoinMsg(d.error || "Erreur");
    } catch { setJoinMsg("Erreur réseau"); }
    setJoining(false);
  }
  async function joinChampionship(seasonId: string, teamId?: string) {
    setJoining(true); setJoinMsg(null);
    try {
      const res = await fetch(`/api/championship/${seasonId}/join`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamId ? { team_id: teamId } : {}),
      });
      if (res.status === 401) { window.location.href = "/auth?redirect=/championnat"; return; }
      const d = await res.json();
      if (d.ok) { setShowPicker(false); setJoinMsg(d.already ? `Tu es déjà dans ${d.team?.name} ✓` : `🎉 Bienvenue dans ${d.team?.name} !`); loadMyMatches(seasonId); }
      else setJoinMsg(d.error || "Erreur");
    } catch { setJoinMsg("Erreur réseau"); }
    setJoining(false);
  }

  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | null = null;
    fetch("/api/championship").then(r => r.json()).then(d => {
      const s = (d.seasons ?? [])[0];
      if (!s) { setNone(true); setLoading(false); return; }
      const refresh = () => {
        fetch(`/api/championship/${s.id}`).then(r => r.json()).then((dd) => { setDetail(dd); setLoading(false); }).catch(() => setLoading(false));
        loadMyMatches(s.id);
      };
      refresh();
      // Rafraîchissement continu : compte à rebours, départ auto, points et éliminations en direct.
      iv = setInterval(refresh, 4000);
    }).catch(() => setLoading(false));
    return () => { if (iv) clearInterval(iv); };
  }, []);

  const css = `
    @keyframes champln-in { from { opacity:0; transform: translateY(16px);} to {opacity:1; transform:none;} }
    @keyframes champln-glow { 0%,100%{opacity:.5} 50%{opacity:1} }
    @keyframes champln-shine { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes champ-slide { from { opacity:0; transform: translateX(-26px) scale(.97);} to {opacity:1; transform:none;} }
    @keyframes champ-pop { 0%{opacity:0;transform:scale(.85) translateY(10px);} 60%{transform:scale(1.03);} 100%{opacity:1;transform:none;} }
    @keyframes champ-finalglow { 0%,100%{ box-shadow:0 0 0 0 rgba(230,184,60,0.0);} 50%{ box-shadow:0 0 26px 2px rgba(230,184,60,0.35);} }
    @keyframes champ-winrow { 0%{ background-position: 200% center;} 100%{ background-position:-200% center;} }
    .champ-card-hover { transition: transform .2s ease, box-shadow .2s ease; }
    .champ-card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.35); }
    @media (prefers-reduced-motion: reduce){ *{animation:none!important} }
    @media print {
      body * { visibility: hidden !important; }
      #champ-certificate, #champ-certificate * { visibility: visible !important; }
      #champ-certificate { position: absolute; left: 0; top: 0; width: 100%; }
      .champ-noprint { display: none !important; }
    }
  `;

  if (loading) return <div style={{ minHeight: "100vh", background: "#04070f", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>Chargement…</div>;
  if (none || !detail) return (
    <div style={{ minHeight: "100vh", background: "#04070f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "#fff", textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 54 }}>🏆</div>
      <p style={{ fontSize: 20, fontWeight: 900 }}>Aucun championnat en cours</p>
      <p style={{ color: "rgba(255,255,255,0.4)" }}>Le prochain Championnat Biblique arrive bientôt.</p>
      <Link href="/" style={{ color: GOLD, fontWeight: 700 }}>← Accueil</Link>
    </div>
  );

  // Carte des équipes (id → infos)
  const tmap: Record<string, Team> = {};
  for (const g of Object.values(detail.groups)) for (const t of g) tmap[t.id] = t;

  const finished = detail.season.status === "finished";
  const champion = Object.values(tmap).find(t => t.final_rank === 1);
  const vice = Object.values(tmap).find(t => t.final_rank === 2);
  const third = Object.values(tmap).find(t => t.final_rank === 3);

  const statusLabel = detail.season.status === "finished" ? "Terminé"
    : detail.season.status === "knockout" ? "Phase finale" : "Phase de poules";

  const Logo = ({ t, size = 30 }: { t: Team; size?: number }) => (
    <span style={{ width: size, height: size, borderRadius: size * 0.28, background: t.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: size * 0.38, flexShrink: 0, boxShadow: `0 2px 10px ${t.color}66` }}>{t.logo_seed}</span>
  );

  const stageMatches = (st: string) => detail.matches.filter(m => m.stage === st && m.status === "done");
  const hasKnockout = detail.matches.some(m => m.stage !== "group" && m.status === "done");

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 40% at 50% 0%, #14213f 0%, #070c1a 55%, #04070f 100%)", color: "#fff", paddingBottom: 60 }}>
      <style>{css}</style>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "48px 20px 30px", position: "relative" }}>
        <div style={{ fontSize: 40, animation: "champln-glow 2.5s ease-in-out infinite" }}>🏆</div>
        <h1 style={{ fontSize: "clamp(1.8rem,6vw,3rem)", fontWeight: 900, letterSpacing: "0.02em", margin: "6px 0", background: `linear-gradient(90deg,${GOLD},#fff5d6,${GOLD})`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "champln-shine 4s linear infinite" }}>
          CHAMPIONNAT BIBLIQUE
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{detail.season.name}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 12, padding: "6px 16px", borderRadius: 999, border: `1px solid ${GOLD}55`, background: `${GOLD}14`, color: GOLD, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: finished ? "#22c55e" : GOLD, animation: "champln-glow 1.4s ease-in-out infinite" }} /> {statusLabel}
        </span>

        {/* Rejoindre — choix d'équipe (église) ou automatique */}
        {!finished && (
          <div style={{ marginTop: 18 }}>
            {myMatches?.member ? (
              myMatches.my_team_eliminated ? (
                <div style={{ display: "inline-block", padding: "10px 20px", borderRadius: 14, border: "1px solid #f8717166", background: "rgba(248,113,113,0.1)" }}>
                  <p style={{ color: "#f87171", fontWeight: 900, fontSize: 15 }}>💔 {teamLabel(myMatches.my_team?.name, lang)}</p>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 }}>Merci d&apos;avoir joué ! Continue de suivre le championnat. 🙏</p>
                </div>
              ) : (
                <p style={{ color: "#4ade80", fontWeight: 800, fontSize: 15 }}>✓ {lang === "fr" ? "Tu es dans" : lang === "es" ? "Estás en" : lang === "ht" ? "Ou nan" : "You're in"} {teamLabel(myMatches.my_team?.name, lang)}</p>
              )
            ) : showPicker ? (
              <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
                {/* Créer l'équipe de son église */}
                <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, border: `1px solid ${GOLD}44`, background: "rgba(230,184,60,0.06)" }}>
                  <p style={{ color: GOLD, fontWeight: 900, fontSize: 12, marginBottom: 6 }}>🏛️ Créer l'équipe de mon église</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={churchName} onChange={e => setChurchName(e.target.value)} maxLength={40}
                      placeholder="Nom de ton église"
                      style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none" }} />
                    <button onClick={() => createChurchTeam(detail.season.id)} disabled={joining || churchName.trim().length < 2}
                      style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#a97d18)`, color: "#1a1203", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap" }}>Créer</button>
                  </div>
                </div>
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 8 }}>— ou rejoins une équipe existante —</p>
                <button onClick={() => joinChampionship(detail.season.id)} disabled={joining}
                  style={{ width: "100%", marginBottom: 10, padding: "11px", borderRadius: 12, border: `1px solid ${GOLD}55`, background: "rgba(230,184,60,0.1)", color: GOLD, fontWeight: 900, cursor: "pointer" }}>
                  🎲 Placez-moi automatiquement
                </button>
                <div style={{ maxHeight: 260, overflowY: "auto", display: "grid", gap: 6 }}>
                  {Object.values(detail.groups).flat().filter(t => (t.members?.ai ?? 1) > 0).map(t => (
                    <button key={t.id} onClick={() => joinChampionship(detail.season.id, t.id)} disabled={joining}
                      className="hover:opacity-80"
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ width: 26, height: 26, borderRadius: 7, background: t.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11 }}>{t.logo_seed}</span>
                      <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{teamLabel(t.name, lang)}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t.members?.real ?? 0} joueur(s)</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button onClick={() => setShowPicker(true)} disabled={joining}
                style={{ padding: "12px 30px", borderRadius: 999, border: "none", background: `linear-gradient(135deg,${GOLD},#a97d18)`, color: "#1a1203", fontWeight: 900, fontSize: 15, cursor: "pointer", boxShadow: `0 8px 30px ${GOLD}44` }}>
                🎯 Rejoindre le championnat
              </button>
            )}
            {joinMsg && <p style={{ marginTop: 10, color: joinMsg.startsWith("🎉") || joinMsg.includes("✓") ? "#4ade80" : "#f87171", fontWeight: 700, fontSize: 14 }}>{joinMsg}</p>}
            <div style={{ marginTop: 12 }}>
              <button onClick={invite} style={{ padding: "9px 22px", borderRadius: 999, border: `1px solid ${GOLD}55`, background: "rgba(230,184,60,0.1)", color: GOLD, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                📤 {copied ? "Lien copié !" : "Inviter des joueurs"}
              </button>
            </div>
            <p style={{ marginTop: 8, color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Choisis ton équipe (ton église) — ou laisse le système te placer automatiquement.</p>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}>

        {/* MES MATCHS (si le joueur est dans une équipe) */}
        {myMatches?.member && (myMatches.matches?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 30, borderRadius: 18, border: `1px solid ${GOLD}33`, background: "rgba(255,255,255,0.03)", overflow: "hidden", animation: "champln-in 0.5s ease both" }}>
            <div style={{ padding: "12px 18px", background: "linear-gradient(135deg,#14213f,#1a3568)", display: "flex", alignItems: "center", gap: 10 }}>
              {myMatches.my_team && <span style={{ width: 26, height: 26, borderRadius: 7, background: myMatches.my_team.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11 }}>{myMatches.my_team.logo_seed}</span>}
              <span style={{ fontWeight: 900, fontSize: 14 }}>{lang === "fr" ? "Mes matchs" : lang === "es" ? "Mis partidos" : lang === "ht" ? "Match mwen yo" : "My matches"} — {teamLabel(myMatches.my_team?.name, lang)}</span>
            </div>
            <div style={{ padding: 12, display: "grid", gap: 8 }}>
              {myMatches.matches!.map(m => (
                <div key={m.match_id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 14px" }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", width: 42 }}>{m.stage === "group" ? "Poule" : m.stage}</span>
                  {m.opponent && <span style={{ width: 22, height: 22, borderRadius: 6, background: m.opponent.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 9 }}>{m.opponent.logo_seed}</span>}
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>vs {m.opponent?.name.replace("Équipe ", "") ?? "—"}</span>
                  {m.played ? <span style={{ color: "#4ade80", fontWeight: 800, fontSize: 13 }}>✓ Joué</span>
                    : m.status === "done" ? <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Terminé</span>
                    : m.status === "live"
                      ? <Link href={`/championnat/jouer/${m.match_id}`} style={{ padding: "6px 18px", borderRadius: 999, background: `linear-gradient(135deg,${GOLD},#a97d18)`, color: "#1a1203", fontWeight: 900, fontSize: 13, textDecoration: "none" }}>▶ Jouer</Link>
                      : m.starts_in_sec !== null
                        ? <Link href={`/championnat/jouer/${m.match_id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 999, background: `linear-gradient(135deg,${GOLD},#a97d18)`, color: "#1a1203", fontWeight: 900, fontSize: 13, textDecoration: "none" }}>⏳ Démarre dans {m.starts_in_sec}s</Link>
                        : <Link href={`/championnat/jouer/${m.match_id}`} style={{ padding: "6px 16px", borderRadius: 999, border: `1px solid ${GOLD}44`, color: GOLD, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>⏳ Entrer</Link>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PODIUM CHAMPION + CERTIFICAT + ÉTINCELLES */}
        {finished && champion && (
          <div style={{ animation: "champln-in 0.6s ease both", marginBottom: 34 }}>
            <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", border: `1px solid ${GOLD}55`, boxShadow: `0 20px 60px ${GOLD}33` }}>
              <ChampionSparkles accent={GOLD} embedded />
              <div style={{ position: "relative", zIndex: 3, background: `linear-gradient(135deg,${GOLD},#a97d18)`, padding: "26px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 46, animation: "prem-trophy-pop 1s cubic-bezier(0.34,1.56,0.64,1) both, prem-trophy-float 3s 1s ease-in-out infinite" }}>🏆</div>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.28em", color: "#3a2a06", marginTop: 4 }}>CHAMPION BIBLIQUE</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8 }}>
                  <Logo t={champion} size={46} />
                  <span style={{ fontSize: "clamp(1.5rem,5vw,2.2rem)", fontWeight: 900, color: "#1a1203" }}>{teamLabel(champion.name, lang)}</span>
                </div>
              </div>
              <div style={{ position: "relative", zIndex: 3, display: "flex", justifyContent: "center", gap: 24, padding: "16px", background: "rgba(255,255,255,0.03)", flexWrap: "wrap" }}>
                {vice && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>🥈</span><Logo t={vice} size={26} /><span style={{ fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{teamLabel(vice.name, lang)}</span></div>}
                {third && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>🥉</span><Logo t={third} size={26} /><span style={{ fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{teamLabel(third.name, lang)}</span></div>}
              </div>
            </div>

            {/* CERTIFICAT du champion */}
            <div style={{ marginTop: 22 }}>
              <ChampionCertificate teamName={champion.name} logoSeed={champion.logo_seed} color={champion.color} seasonName={detail.season.name} dateStr={new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : lang === "ht" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" })} lang={lang} />
              <div style={{ textAlign: "center", marginTop: 14 }} className="champ-noprint">
                <button onClick={() => window.print()} style={{ padding: "10px 26px", borderRadius: 999, border: `1px solid ${GOLD}66`, background: `${GOLD}18`, color: GOLD, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>🖨️ Imprimer / Enregistrer le certificat (PDF)</button>
              </div>
            </div>
          </div>
        )}

        {/* BRACKET */}
        {hasKnockout && (
          <div style={{ marginBottom: 34, animation: "champln-in 0.6s 0.05s ease both" }}>
            <h2 style={{ fontSize: 13, fontWeight: 900, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14, textAlign: "center" }}>🏆 Tableau final</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
              {([["quarter", "Quarts", "🎯"], ["semi", "Demi-finales", "⚡"], ["final", "Finale", "🏆"], ["third", "3e place", "🥉"]] as [string, string, string][]).filter(([st]) => stageMatches(st).length > 0).map(([st, label, emoji], si) => (
                <div key={st} className="champ-card-hover" style={{ background: st === "final" ? `linear-gradient(160deg,${GOLD}14,rgba(255,255,255,0.02))` : "rgba(255,255,255,0.03)", border: `1px solid ${st === "final" ? GOLD + "55" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: 14, animation: `champ-slide 0.55s ${0.1 + si * 0.12}s cubic-bezier(0.22,1,0.36,1) both${st === "final" ? ", champ-finalglow 3s 1s ease-in-out infinite" : ""}` }}>
                  <p style={{ fontSize: 10, fontWeight: 900, color: st === "final" ? GOLD : "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13 }}>{emoji}</span>{label}</p>
                  {stageMatches(st).map((m, mi) => {
                    const a = tmap[m.team_a], b = tmap[m.team_b];
                    if (!a || !b) return null;
                    return (
                      <div key={m.id} style={{ marginBottom: 10, background: st === "final" ? `${GOLD}12` : "rgba(255,255,255,0.02)", border: `1px solid ${st === "final" ? GOLD + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "8px 10px", animation: `champ-pop 0.5s ${0.25 + si * 0.12 + mi * 0.06}s cubic-bezier(0.34,1.56,0.64,1) both` }}>
                        {[a, b].map(t => {
                          const win = m.winner === t.id;
                          return (
                            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", margin: "1px -4px", borderRadius: 7, opacity: win ? 1 : 0.55, background: win ? `linear-gradient(90deg, ${GOLD}22, transparent)` : "transparent" }}>
                              {win && <span style={{ fontSize: 11 }}>👑</span>}
                              <Logo t={t} size={20} />
                              <Link href={`/championnat/equipe/${t.id}`} style={{ flex: 1, fontWeight: win ? 800 : 600, color: win ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>{t.name.replace("Équipe ", "")}</Link>
                              <span style={{ fontWeight: 900, color: win ? GOLD : "rgba(255,255,255,0.5)", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{Math.round((t.id === m.team_a ? m.score_a : m.score_b) ?? 0)}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GROUPES / CLASSEMENTS */}
        <h2 style={{ fontSize: 13, fontWeight: 900, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14, textAlign: "center" }}>Phase de poules</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14 }}>
          {Object.entries(detail.groups).sort(([a], [b]) => a.localeCompare(b)).map(([g, ts], gi) => (
            <div key={g} className="champ-card-hover" style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", animation: `champln-in 0.5s ${gi * 0.05}s ease both` }}>
              <div style={{ background: "linear-gradient(135deg,#14213f,#0f1830)", padding: "10px 14px", fontWeight: 900, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: GOLD }}>◆</span> Groupe {g}
              </div>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead><tr style={{ color: "rgba(255,255,255,0.35)", textAlign: "center", fontSize: 10 }}>
                  <th style={{ padding: "6px 10px", textAlign: "left" }}>Équipe</th><th>J</th><th>V</th><th>N</th><th>D</th><th>Diff</th><th style={{ color: GOLD }}>Pts</th>
                </tr></thead>
                <tbody>
                  {ts.map((t, i) => {
                    const qualif = i < 2;
                    return (
                      <tr key={t.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", background: qualif && t.played > 0 ? `${GOLD}0d` : undefined }}>
                        <td style={{ padding: "8px 10px", textAlign: "left" }}>
                          <Link href={`/championnat/equipe/${t.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                            <span style={{ color: qualif ? GOLD : "rgba(255,255,255,0.3)", fontWeight: 900, width: 12 }}>{i + 1}</span>
                            <Logo t={t} size={22} />
                            <span style={{ fontWeight: 700, color: "#fff" }}>{t.name.replace("Équipe ", "")}</span>
                          </Link>
                        </td>
                        <td style={{ color: "rgba(255,255,255,0.5)" }}>{t.played}</td>
                        <td style={{ color: "#4ade80" }}>{t.won}</td>
                        <td style={{ color: "rgba(255,255,255,0.5)" }}>{t.drawn}</td>
                        <td style={{ color: "#f87171" }}>{t.lost}</td>
                        <td style={{ color: "rgba(255,255,255,0.6)" }}>{Math.round(t.score_for - t.score_against)}</td>
                        <td style={{ fontWeight: 900, color: "#fff" }}>{t.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
