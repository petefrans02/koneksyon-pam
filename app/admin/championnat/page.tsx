"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChampionSparkles, ChampionCertificate } from "@/lib/championship-premium";

interface Season { id: string; name: string; status: string; num_groups: number; teams_per_group: number; players_per_team: number; ai_difficulty: string; contest_id: string | null; created_at: string; paused?: boolean; }
interface Contest { id: string; title: string | Record<string, string>; }
interface Team { id: string; name: string; number: number; color: string; logo_seed: string; group_label: string; played: number; won: number; drawn: number; lost: number; points: number; correct_total: number; score_for: number; score_against: number; final_rank?: number | null; eliminated?: boolean; members: { real: number; ai: number }; }
interface Match { id: string; stage: string; team_a: string; team_b: string; score_a: number | null; score_b: number | null; winner: string | null; status: string; started_at: string | null; round_number: number | null; human_done: number | null; human_total: number | null; }

function ctitle(t: string | Record<string, string>): string { return typeof t === "string" ? t : (t?.fr ?? Object.values(t ?? {})[0] ?? "?"); }

export default function AdminChampionshipPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [detail, setDetail] = useState<{ season: Season; groups: Record<string, Team[]>; matches: Match[] } | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showMatches, setShowMatches] = useState(true);
  const [scoreEdits, setScoreEdits] = useState<Record<string, { a: string; b: string }>>({});
  const [matchBusy, setMatchBusy] = useState<string | null>(null);
  // Contrôle d'une JOURNÉE entière (tous les matchs démarrent / se terminent ensemble).
  async function waveAction(seasonId: string, wave: string, action: string) {
    // Sécurité : si on termine alors que des joueurs n'ont pas fini, on demande confirmation.
    if (action === "resolve" && detail) {
      const wkey = (m: Match) => m.stage === "group" ? `group-${m.round_number ?? 0}` : (m.stage === "final" || m.stage === "third") ? "finals" : m.stage;
      const wm = detail.matches.filter(m => wkey(m) === wave && m.status === "live");
      const notDone = wm.reduce((acc, m) => acc + Math.max(0, (m.human_total ?? 0) - (m.human_done ?? 0)), 0);
      if (notDone > 0 && !window.confirm(`⚠️ ${notDone} joueur(s) n'ont pas encore fini de jouer.\n\nSi tu termines maintenant, ils seront remplacés par l'IA.\n\nLe système termine DÉJÀ tout seul quand tout le monde a fini — tu peux attendre.\n\nTerminer quand même ?`)) return;
    }
    setMatchBusy(wave);
    try {
      const res = await fetch(`/api/admin/championship/${seasonId}/wave`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wave, action }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setMsg("❌ " + (d.error || "Erreur"));
      else if (action === "start") setMsg("▶ Journée lancée — les équipes jouent !");
      else if (action === "resolve") setMsg("✅ Journée terminée — points mis à jour");
      openDetail(seasonId);
    } catch { /* ignore */ }
    setMatchBusy(null);
  }
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Formulaire
  const [name, setName] = useState("Championnat Biblique — Saison 1");
  const [contestId, setContestId] = useState("");
  const [numGroups, setNumGroups] = useState(4);
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [playersPerTeam, setPlayersPerTeam] = useState(10);
  const [aiFill, setAiFill] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");

  const loadSeasons = useCallback(() => {
    fetch("/api/championship").then(r => r.json()).then(d => setSeasons(d.seasons ?? [])).catch(() => {});
  }, []);
  useEffect(() => {
    loadSeasons();
    fetch("/api/contests").then(r => r.json()).then(d => setContests(d.contests ?? [])).catch(() => {});
  }, [loadSeasons]);

  const openDetail = useCallback((id: string) => {
    fetch(`/api/championship/${id}`).then(r => r.json()).then(setDetail).catch(() => {});
  }, []);

  // Rafraîchissement AUTO du détail ouvert : les points/classements montent tout seuls
  // au fur et à mesure que les matchs se terminent (pas besoin de « Recalculer »).
  const openId = detail?.season.id;
  useEffect(() => {
    if (!openId) return;
    const iv = setInterval(() => {
      fetch(`/api/championship/${openId}`).then(r => r.json()).then(setDetail).catch(() => {});
    }, 5000);
    return () => clearInterval(iv);
  }, [openId]);

  // Horloge locale (1 s) pour un compte à rebours fluide « Démarre dans Xs » + barres de progression.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => { const iv = setInterval(() => setNowMs(Date.now()), 1000); return () => clearInterval(iv); }, []);

  // Réglages du bandeau de diffusion (partagés avec la page de diffusion via localStorage).
  useEffect(() => {
    try {
      const s = localStorage.getItem("champ-sponsors"); if (s) setSponsors(s);
      const m = localStorage.getItem("champ-ticker-msg"); if (m) setTickerMsg(m);
      const v = localStorage.getItem("champ-ticker-verses"); if (v !== null) setShowVerses(v !== "0");
    } catch { /* ignore */ }
  }, []);
  function saveDiffusion() {
    try {
      localStorage.setItem("champ-sponsors", sponsors.trim());
      localStorage.setItem("champ-ticker-msg", tickerMsg.trim());
      localStorage.setItem("champ-ticker-verses", showVerses ? "1" : "0");
    } catch { /* ignore */ }
    setSaved(true); setTimeout(() => setSaved(false), 1800);
  }

  // Barre de progression d'un match en cours : diminue avec le temps (repère visuel « vers la fin »).
  const EST_MATCH_SEC = 210; // durée moyenne estimée d'un match (~3 manches)
  const liveBar = (startedAt: string | null) => {
    if (!startedAt) return null;
    const elapsed = (nowMs - new Date(startedAt).getTime()) / 1000;
    const frac = Math.max(0, Math.min(1, 1 - elapsed / EST_MATCH_SEC));
    const col = frac > 0.5 ? "#16a34a" : frac > 0.2 ? "#d97706" : "#dc2626";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${frac * 100}%`, background: col, transition: "width 1s linear" }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: col, minWidth: 58, textAlign: "right" }}>{frac <= 0 ? "⏰ à terminer" : `${Math.ceil(frac * EST_MATCH_SEC)}s`}</span>
      </div>
    );
  };

  const [sponsors, setSponsors] = useState("");
  const [tickerMsg, setTickerMsg] = useState("");
  const [showVerses, setShowVerses] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);
  // `force` = renvoyer même à ceux qui ont déjà reçu la notification.
  async function notifyAll(seasonId: string, force = false) {
    const question = force
      ? "RENVOYER la notification + l'email à TOUS les inscrits, même ceux déjà notifiés ?"
      : "Envoyer la notification (cloche) ET un email à TOUS les inscrits du site ?";
    if (!window.confirm(question)) return;
    setNotifBusy(true);
    try {
      const res = await fetch(`/api/admin/championship/${seasonId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg("❌ " + (d.error || "Erreur")); }
      else {
        // On affiche les DEUX canaux séparément : une cloche remplie ne veut pas
        // dire qu'un email est parti.
        const parts = [
          `🔔 ${d.notified} notif(s) in-app`,
          `📧 ${d.emails_sent} email(s) envoyé(s)`,
          `📱 ${d.push_sent} push (${d.push_devices} appareil(s))`,
        ];
        if (d.emails_failed) parts.push(`⚠️ ${d.emails_failed} email(s) en échec`);
        if (d.push_failed) parts.push(`⚠️ ${d.push_failed} push en échec`);
        if (d.already) parts.push(`${d.already} déjà notifiés`);
        const errs = [d.in_app_error, d.email_error, d.push_error].filter(Boolean).join(" · ");
        setMsg(parts.join(" · ") + (errs ? ` — ❌ ${errs}` : ""));
      }
    } catch { setMsg("❌ Réseau"); }
    setNotifBusy(false);
  }

  // Pause / reprise : fige l'horloge du championnat (aucune journée ne démarre).
  const [pauseBusy, setPauseBusy] = useState(false);
  async function togglePause(seasonId: string, paused: boolean) {
    setPauseBusy(true);
    try {
      const res = await fetch(`/api/admin/championship/${seasonId}/manage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pause", paused }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setMsg("❌ " + (d.error || "Erreur"));
      else { setMsg(paused ? "⏸️ Championnat en pause" : "▶️ Championnat repris"); openDetail(seasonId); }
    } catch { setMsg("❌ Réseau"); }
    setPauseBusy(false);
  }

  const [simBusy, setSimBusy] = useState(false);
  const [ko, setKo] = useState<{ champion: string | null; vice: string | null; third: string | null; fourth: string | null; rounds: { stage: string; a: string; b: string; sa: number; sb: number; winner: string }[] } | null>(null);
  async function simulate(seasonId: string, stage: string) {
    setSimBusy(true);
    try {
      const res = await fetch(`/api/admin/championship/${seasonId}/simulate`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage }),
      });
      const d = await res.json();
      setMsg(d.ok ? `✅ ${d.played} matchs joués` : "❌ " + (d.error || "Erreur"));
      openDetail(seasonId);
    } catch { setMsg("❌ Réseau"); }
    setSimBusy(false);
  }
  async function runKnockout(seasonId: string) {
    setSimBusy(true); setKo(null);
    try {
      const res = await fetch(`/api/admin/championship/${seasonId}/knockout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const d = await res.json();
      if (d.ok) {
        const label: Record<string, string> = { quarter: "Quarts créés — à jouer en direct", semi: "Demi-finales créées", final: "Finale créée", finished: `🏆 Champion : ${d.champion}` };
        setMsg("✅ " + (label[d.phase] ?? "Tour généré")); openDetail(seasonId);
      } else setMsg("❌ " + (d.error || "Erreur"));
    } catch { setMsg("❌ Réseau"); }
    setSimBusy(false);
  }
  async function manage(seasonId: string, action: string, extra: Record<string, unknown> = {}) {
    setSimBusy(true);
    try {
      const res = await fetch(`/api/admin/championship/${seasonId}/manage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
      const d = await res.json(); setMsg(d.ok ? "✅ Fait" : "❌ " + (d.error || "Erreur")); openDetail(seasonId);
    } catch { setMsg("❌ Réseau"); }
    setSimBusy(false);
  }
  async function deleteSeason(seasonId: string) {
    if (!confirm("Supprimer ce championnat et toutes ses données ? (irréversible)")) return;
    await fetch(`/api/admin/championship/${seasonId}/manage`, { method: "DELETE" }).catch(() => {});
    setDetail(null); setKo(null); loadSeasons(); setMsg("🗑️ Championnat supprimé");
  }
  function exportCSV(d: { season: Season; groups: Record<string, Team[]> }) {
    const rows: (string | number)[][] = [["Groupe", "Équipe", "J", "V", "N", "D", "Pts", "Pour", "Contre", "Diff", "Rang final"]];
    for (const [g, ts] of Object.entries(d.groups)) for (const t of ts) rows.push([g, t.name, t.played, t.won, t.drawn, t.lost, t.points, t.score_for, t.score_against, t.score_for - t.score_against, (t as Team & { final_rank?: number }).final_rank ?? ""]);
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `${d.season.name}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  async function create() {
    setCreating(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/championship/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contest_id: contestId || null, num_groups: numGroups, teams_per_group: teamsPerGroup, players_per_team: playersPerTeam, ai_fill: aiFill, ai_difficulty: aiDifficulty }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg(`✅ Créé : ${d.teams} équipes · ${d.groups} groupes · ${d.members} membres (${d.real_players} réels + ${d.ai_players} IA) · ${d.matches} matchs`);
        loadSeasons(); openDetail(d.season_id);
      } else setMsg("❌ " + (d.error || "Erreur"));
    } catch { setMsg("❌ Réseau"); }
    setCreating(false);
  }

  const box: React.CSSProperties = { background: "#fff", border: "1px solid #e8e4de", borderRadius: 16, padding: 20 };
  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d6d0c6", fontSize: 14 };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f1ea", padding: "24px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#c8960f", fontWeight: 700, fontSize: 13 }}>← Admin</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1a3568", margin: "8px 0 20px" }}>🏆 Championnat Biblique</h1>

        {/* Formulaire de création */}
        <div style={{ ...box, marginBottom: 24 }}>
          <p style={{ fontWeight: 900, color: "#1a3568", marginBottom: 14 }}>Créer un championnat</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080" }}>Nom
              <input style={inp} value={name} onChange={e => setName(e.target.value)} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080" }}>Questions (concours source)
              <select style={inp} value={contestId} onChange={e => setContestId(e.target.value)}>
                <option value="">— Aucun —</option>
                {contests.map(c => <option key={c.id} value={c.id}>{ctitle(c.title)}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080" }}>Nombre de groupes
              <input style={inp} type="number" min={1} max={16} value={numGroups} onChange={e => setNumGroups(+e.target.value)} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080" }}>Équipes par groupe
              <input style={inp} type="number" min={2} max={8} value={teamsPerGroup} onChange={e => setTeamsPerGroup(+e.target.value)} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080" }}>Joueurs par équipe
              <input style={inp} type="number" min={2} max={20} value={playersPerTeam} onChange={e => setPlayersPerTeam(+e.target.value)} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080" }}>Difficulté IA
              <select style={inp} value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value as typeof aiDifficulty)}>
                <option value="easy">Facile</option><option value="medium">Moyen</option><option value="hard">Difficile</option><option value="mixed">Mixte</option>
              </select>
            </label>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080", display: "flex", alignItems: "center", gap: 8, alignSelf: "end" }}>
              <input type="checkbox" checked={aiFill} onChange={e => setAiFill(e.target.checked)} /> Compléter avec des IA
            </label>
          </div>
          <div style={{ fontSize: 12, color: "#718096", marginTop: 10 }}>
            Total : <b>{numGroups * teamsPerGroup} équipes</b> · {numGroups * teamsPerGroup * playersPerTeam} joueurs · {numGroups * (teamsPerGroup * (teamsPerGroup - 1) / 2)} matchs de poule
          </div>
          <button onClick={create} disabled={creating}
            style={{ marginTop: 14, padding: "12px 26px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#1a3568,#2563eb)", color: "#fff", fontWeight: 900, cursor: "pointer", opacity: creating ? 0.6 : 1 }}>
            {creating ? "Création…" : "🏆 Générer le championnat"}
          </button>
          {msg && <p style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: msg.startsWith("✅") ? "#16a34a" : "#dc2626" }}>{msg}</p>}
        </div>

        {/* Liste des championnats */}
        <div style={{ ...box, marginBottom: 24 }}>
          <p style={{ fontWeight: 900, color: "#1a3568", marginBottom: 12 }}>Championnats ({seasons.length})</p>
          {seasons.length === 0 ? <p style={{ color: "#a0aec0", fontSize: 14 }}>Aucun championnat.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {seasons.map(s => (
                <button key={s.id} onClick={() => openDetail(s.id)}
                  style={{ textAlign: "left", padding: "12px 14px", borderRadius: 12, border: `1px solid ${detail?.season?.id === s.id ? "#2563eb" : "#e8e4de"}`, background: detail?.season?.id === s.id ? "#eef2ff" : "#faf9f6", cursor: "pointer" }}>
                  <span style={{ fontWeight: 800, color: "#1a3568" }}>{s.name}</span>
                  <span style={{ marginLeft: 10, fontSize: 12, color: "#718096" }}>{s.status} · {s.num_groups} groupes · {s.num_groups * s.teams_per_group} équipes</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Détail : groupes + équipes */}
        {detail && (
          <div style={{ ...box }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
              <p style={{ fontWeight: 900, color: "#1a3568" }}>{detail.season.name}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={`/championnat/diffusion${sponsors.trim() ? `?sponsors=${encodeURIComponent(sponsors.trim())}` : ""}`} target="_blank" rel="noopener noreferrer"
                  title="Ouvrir la page plein écran à diffuser (StreamYard / OBS) sur Facebook Live"
                  style={{ padding: "8px 18px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#dc2626,#7c2d12)", color: "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  📺 Mode Diffusion TV
                </a>
                <button onClick={() => togglePause(detail.season.id, !detail.season.paused)} disabled={pauseBusy}
                  title={detail.season.paused ? "Reprendre : les journées repartent automatiquement" : "Pause : plus aucune journée ne démarre tant que tu n'as pas repris"}
                  style={{ padding: "8px 18px", borderRadius: 999, border: "none", background: detail.season.paused ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#f59e0b,#b45309)", color: "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer", opacity: pauseBusy ? 0.6 : 1 }}>
                  {pauseBusy ? "…" : detail.season.paused ? "▶️ Reprendre le championnat" : "⏸️ Mettre en pause"}
                </button>
                <button onClick={() => simulate(detail.season.id, "group")} disabled={simBusy}
                  style={{ padding: "8px 18px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", opacity: simBusy ? 0.6 : 1 }}>
                  {simBusy ? "…" : "▶ Simuler la phase de poules"}
                </button>
                <button onClick={() => notifyAll(detail.season.id)} disabled={notifBusy}
                  title="Notification dans la cloche du site + email réel à tous les inscrits"
                  style={{ padding: "8px 16px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", opacity: notifBusy ? 0.6 : 1 }}>
                  {notifBusy ? "…" : "🔔 Notifier les inscrits (cloche + email)"}
                </button>
                <button onClick={() => notifyAll(detail.season.id, true)} disabled={notifBusy}
                  title="Renvoyer à TOUT le monde, même à ceux déjà notifiés"
                  style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid #93c5fd", background: "transparent", color: "#1d4ed8", fontWeight: 800, fontSize: 12, cursor: "pointer", opacity: notifBusy ? 0.6 : 1 }}>
                  ↻ Renvoyer
                </button>
                <button onClick={() => runKnockout(detail.season.id)} disabled={simBusy || detail.matches.some(m => m.status === "live")}
                  title={detail.matches.some(m => m.status === "live") ? "Termine d'abord les matchs en cours" : "Créer les quarts, puis demis, puis finale"}
                  style={{ padding: "8px 18px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#c8960f,#a16207)", color: "#fff", fontWeight: 800, fontSize: 13, cursor: (simBusy || detail.matches.some(m => m.status === "live")) ? "not-allowed" : "pointer", opacity: (simBusy || detail.matches.some(m => m.status === "live")) ? 0.5 : 1 }}>
                  🏆 Générer le tour suivant
                </button>
                <button onClick={() => manage(detail.season.id, "recompute")} disabled={simBusy} title="Recalculer les classements depuis les scores"
                  style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>↻ Recalculer</button>
                <button onClick={() => exportCSV(detail)}
                  style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>⬇ Exporter CSV</button>
                <button onClick={() => deleteSeason(detail.season.id)}
                  style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid #fca5a5", background: "#fff", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🗑 Supprimer</button>
              </div>
            </div>

            {/* 📺 Diffusion TV — réglages du bandeau défilant (StreamYard / Ecamm / OBS → Facebook Live) */}
            <div style={{ marginBottom: 14, padding: 16, borderRadius: 14, border: "2px solid #fca5a5", background: "linear-gradient(135deg,#fff7f7,#fff)", display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#dc2626" }}>📺 Diffusion TV — Réglages du bandeau</span>
                <a href={`/championnat/diffusion${sponsors.trim() ? `?sponsors=${encodeURIComponent(sponsors.trim())}` : ""}`} target="_blank" rel="noopener noreferrer"
                  style={{ marginLeft: "auto", padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#dc2626,#7c2d12)", color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>📺 Ouvrir la page</a>
              </div>

              <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080" }}>🤝 Sponsors <span style={{ fontWeight: 400, color: "#94a3b8" }}>(séparés par des virgules)</span>
                <input value={sponsors} onChange={e => setSponsors(e.target.value)}
                  placeholder="Ex : Église Bethel, Radio Espoir, Librairie Chrétienne"
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "9px 12px", borderRadius: 8, border: "1px solid #e5c9c9", fontSize: 13, outline: "none", color: "#1a3568" }} />
              </label>

              <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080" }}>✏️ Message défilant personnalisé <span style={{ fontWeight: 400, color: "#94a3b8" }}>(ton texte à afficher dans le bandeau)</span>
                <textarea value={tickerMsg} onChange={e => setTickerMsg(e.target.value)} rows={2}
                  placeholder="Ex : Bienvenue à tous ! Invitez vos amis à jouer sur koneksyonpam.com 🙏 — Prochain match dans quelques minutes…"
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "9px 12px", borderRadius: 8, border: "1px solid #e5c9c9", fontSize: 13, outline: "none", color: "#1a3568", resize: "vertical", fontFamily: "inherit" }} />
              </label>

              <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6080", display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={showVerses} onChange={e => setShowVerses(e.target.checked)} /> 📖 Afficher les versets bibliques dans le bandeau
              </label>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={saveDiffusion}
                  style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>{saved ? "✓ Enregistré" : "💾 Enregistrer les réglages"}</button>
                <button onClick={() => { const p = new URLSearchParams(); if (sponsors.trim()) p.set("sponsors", sponsors.trim()); if (tickerMsg.trim()) p.set("msg", tickerMsg.trim()); if (!showVerses) p.set("verses", "0"); const url = window.location.origin + "/championnat/diffusion" + (p.toString() ? `?${p}` : ""); navigator.clipboard?.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
                  style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>{copied ? "✓ Copié" : "🔗 Copier le lien complet"}</button>
                <span style={{ fontSize: 11, color: "#a16207" }}>💡 « Enregistrer » → la page de diffusion affiche tout automatiquement. « Copier le lien » → pour diffuser depuis un autre appareil.</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#718096", marginBottom: 16 }}>{Object.keys(detail.groups).length} groupes · {detail.matches.length} matchs · {detail.matches.filter((m) => (m as { status: string }).status === "done").length} joués</p>

            {/* 🔴 JOURNÉE EN COURS / à venir — bien visible EN HAUT */}
            {(() => {
              const tById: Record<string, Team> = {};
              for (const ts of Object.values(detail.groups)) for (const t of ts) tById[t.id] = t;
              const wkey = (m: Match) => m.stage === "group" ? `group-${m.round_number ?? 0}` : (m.stage === "final" || m.stage === "third") ? "finals" : m.stage;
              const wlabel = (k: string) => k.startsWith("group-") ? `Journée ${k.slice(6)} — poules` : k === "quarter" ? "Quarts de finale" : k === "semi" ? "Demi-finales" : "Finale + petite finale";
              const live = detail.matches.filter(m => m.status === "live");
              const onDeck = detail.matches.filter(m => m.status === "scheduled" && m.started_at && new Date(m.started_at).getTime() > nowMs);
              if (live.length > 0) {
                const k = wkey(live[0]);
                return (
                  <div style={{ marginBottom: 18, borderRadius: 16, overflow: "hidden", border: "2px solid #dc2626", boxShadow: "0 10px 30px rgba(220,38,38,0.18)" }}>
                    <style>{`@keyframes admlive{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
                    <div style={{ background: "linear-gradient(135deg,#dc2626,#991b1b)", color: "#fff", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", animation: "admlive 1s ease-in-out infinite" }} />
                      <span style={{ fontWeight: 900, fontSize: 14 }}>🔴 EN DIRECT — {wlabel(k)}</span>
                      <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, opacity: 0.9 }}>{live.length} match{live.length > 1 ? "s" : ""} en cours</span>
                    </div>
                    <div style={{ padding: "10px 16px", background: "#fff5f5", display: "grid", gap: 6 }}>
                      {live.map(m => {
                        const a = tById[m.team_a], b = tById[m.team_b];
                        if (!a || !b) return null;
                        return (
                          <div key={m.id}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                              <span style={{ flex: 1, textAlign: "right", fontWeight: 800, color: "#1a3568" }}>{a.name.replace("Équipe ", "")}</span>
                              <span style={{ width: 30, textAlign: "center", color: "#dc2626", fontWeight: 900 }}>vs</span>
                              <span style={{ flex: 1, fontWeight: 800, color: "#1a3568" }}>{b.name.replace("Équipe ", "")}</span>
                              {(m.human_total ?? 0) > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: (m.human_done ?? 0) >= (m.human_total ?? 0) ? "#16a34a" : "#a16207", whiteSpace: "nowrap" }}>{(m.human_done ?? 0) >= (m.human_total ?? 0) ? "✅" : "👤"} {m.human_done ?? 0}/{m.human_total ?? 0}</span>}
                            </div>
                            {liveBar(m.started_at)}
                          </div>
                        );
                      })}
                      <p style={{ fontSize: 11, color: "#a16207", textAlign: "center", margin: "2px 0" }}>✅ La journée se termine <b>automatiquement</b> quand tous les joueurs ont fini. Le bouton ci-dessous force la fin (l'IA remplace les absents).</p>
                      <button onClick={() => waveAction(detail.season.id, k, "resolve")} disabled={matchBusy === k} style={{ marginTop: 2, padding: "9px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>{matchBusy === k ? "…" : "⏹ Forcer la fin de la journée"}</button>
                    </div>
                  </div>
                );
              }
              if (onDeck.length > 0) {
                const secs = Math.max(0, Math.ceil((Math.min(...onDeck.map(m => new Date(m.started_at!).getTime())) - nowMs) / 1000));
                return (
                  <div style={{ marginBottom: 18, borderRadius: 16, border: "2px solid #d97706", background: "linear-gradient(135deg,#fffbeb,#fef3c7)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>⏳</span>
                    <div>
                      <div style={{ fontWeight: 900, color: "#92400e", fontSize: 14 }}>Prochaine journée : {wlabel(wkey(onDeck[0]))}</div>
                      <div style={{ fontSize: 12, color: "#a16207" }}>Démarre automatiquement dans <b>{secs}s</b> ({onDeck.length} match{onDeck.length > 1 ? "s" : ""})</div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* 🏆 CÉLÉBRATION DU CHAMPION (quand la saison est terminée) — étincelles + certificat */}
            {detail.season.status === "finished" && (() => {
              const champ = Object.values(detail.groups).flat().find(t => t.final_rank === 1);
              if (!champ) return null;
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid #f0c86b", boxShadow: "0 16px 50px rgba(200,150,15,0.28)" }}>
                    <ChampionSparkles accent="#c8960f" embedded />
                    <div style={{ position: "relative", zIndex: 3, background: "linear-gradient(135deg,#c8960f,#a16207)", color: "#fff", padding: "20px 18px", textAlign: "center" }}>
                      <div style={{ fontSize: 40, animation: "prem-trophy-pop 1s cubic-bezier(0.34,1.56,0.64,1) both, prem-trophy-float 3s 1s ease-in-out infinite" }}>🏆</div>
                      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", opacity: 0.9 }}>CHAMPION BIBLIQUE</div>
                      <div style={{ fontSize: 26, fontWeight: 900 }}>{champ.name}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <ChampionCertificate teamName={champ.name} logoSeed={champ.logo_seed} color={champ.color} seasonName={detail.season.name} dateStr={new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} lang="fr" />
                    <div style={{ textAlign: "center", marginTop: 12 }} className="champ-noprint">
                      <button onClick={() => window.print()} style={{ padding: "9px 22px", borderRadius: 999, border: "1px solid #c8960f66", background: "#c8960f18", color: "#a16207", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>🖨️ Imprimer / Enregistrer le certificat (PDF)</button>
                    </div>
                  </div>
                  <style>{`@media print { body * { visibility: hidden !important; } #champ-certificate, #champ-certificate * { visibility: visible !important; } #champ-certificate { position: absolute; left: 0; top: 0; width: 100%; } .champ-noprint { display: none !important; } }`}</style>
                </div>
              );
            })()}

            {/* Phases finales / champion */}
            {ko && (
              <div style={{ marginBottom: 20, borderRadius: 14, overflow: "hidden", border: "1px solid #f0c86b" }}>
                <div style={{ background: "linear-gradient(135deg,#c8960f,#a16207)", color: "#fff", padding: "14px 18px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", opacity: 0.9 }}>CHAMPION BIBLIQUE</div>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>🏆 {ko.champion}</div>
                  <div style={{ fontSize: 12, marginTop: 4, opacity: 0.95 }}>🥈 {ko.vice} · 🥉 {ko.third}</div>
                </div>
                <div style={{ background: "#fffdf5", padding: 14 }}>
                  {["quarter", "semi", "final", "third"].filter(st => ko.rounds.some(r => r.stage === st)).map(st => (
                    <div key={st} style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 900, color: "#a16207", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                        {st === "quarter" ? "Quarts de finale" : st === "semi" ? "Demi-finales" : st === "final" ? "Finale" : "Petite finale (3e place)"}
                      </p>
                      {ko.rounds.filter(r => r.stage === st).map((r, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0" }}>
                          <span style={{ fontWeight: r.winner === r.a ? 900 : 500, color: r.winner === r.a ? "#16a34a" : "#4a6080", flex: 1, textAlign: "right" }}>{r.a.replace("Équipe ", "")}</span>
                          <span style={{ fontWeight: 900, color: "#1a3568", fontVariantNumeric: "tabular-nums" }}>{Math.round(r.sa)} - {Math.round(r.sb)}</span>
                          <span style={{ fontWeight: r.winner === r.b ? 900 : 500, color: r.winner === r.b ? "#16a34a" : "#4a6080", flex: 1 }}>{r.b.replace("Équipe ", "")}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
              {Object.entries(detail.groups).sort(([a], [b]) => a.localeCompare(b)).map(([g, ts]) => (
                <div key={g} style={{ border: "1px solid #e8e4de", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ background: "#1a3568", color: "#fff", padding: "8px 12px", fontWeight: 900, fontSize: 13 }}>Groupe {g}</div>
                  <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                    <thead><tr style={{ color: "#718096", textAlign: "center" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Équipe</th>
                      <th>J</th><th>V</th><th>N</th><th>D</th><th title="Différence">Diff</th><th style={{ color: "#1a3568" }}>Pts</th>
                    </tr></thead>
                    <tbody>
                      {ts.map((t, i) => {
                        const qualif = i < 2; // top 2 qualifiés
                        return (
                          <tr key={t.id} style={{ borderTop: "1px solid #f0ede8", textAlign: "center", background: t.eliminated ? "#fef2f2" : (qualif && t.played > 0 ? "#f0fdf4" : undefined), opacity: t.eliminated ? 0.6 : 1 }}>
                            <td style={{ padding: "6px 8px", textAlign: "left" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <span style={{ color: qualif ? "#16a34a" : "#a0aec0", fontWeight: 900, width: 12 }}>{i + 1}</span>
                                <span style={{ width: 20, height: 20, borderRadius: 5, background: t.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 9 }}>{t.logo_seed}</span>
                                <span style={{ fontWeight: 700, color: "#1a3568", textDecoration: t.eliminated ? "line-through" : "none" }}>{t.name.replace("Équipe ", "")}</span>
                                {t.eliminated && <span style={{ fontSize: 9, fontWeight: 900, color: "#dc2626", background: "#fee2e2", padding: "1px 6px", borderRadius: 999 }}>❌ ÉLIMINÉ</span>}
                              </span>
                            </td>
                            <td style={{ color: "#4a6080" }}>{t.played}</td>
                            <td style={{ color: "#16a34a" }}>{t.won}</td>
                            <td style={{ color: "#718096" }}>{t.drawn}</td>
                            <td style={{ color: "#dc2626" }}>{t.lost}</td>
                            <td style={{ color: "#4a6080" }}>{Math.round(t.score_for - t.score_against)}</td>
                            <td style={{ fontWeight: 900, color: "#1a3568" }}>{t.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Gérer les JOURNÉES en direct (toutes les équipes jouent ensemble) */}
            <div style={{ marginTop: 20, borderTop: "1px solid #eee", paddingTop: 14 }}>
              <button onClick={() => setShowMatches(v => !v)} style={{ background: "none", border: "none", color: "#1a3568", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>
                🎮 Journées en direct (toutes les équipes jouent ensemble) {showMatches ? "▲" : "▼"}
              </button>
              {showMatches && (() => {
                const tById: Record<string, Team> = {};
                for (const ts of Object.values(detail.groups)) for (const t of ts) tById[t.id] = t;
                const waveKey = (m: Match) => m.stage === "group" ? `group-${m.round_number ?? 0}` : (m.stage === "final" || m.stage === "third") ? "finals" : m.stage;
                const waveRank = (k: string) => k.startsWith("group-") ? (Number(k.slice(6)) || 0) : k === "quarter" ? 1000 : k === "semi" ? 1001 : 1002;
                const waveLabel = (k: string) => k.startsWith("group-") ? `Journée ${k.slice(6)} — poules` : k === "quarter" ? "Quarts de finale" : k === "semi" ? "Demi-finales" : "Finale + petite finale";
                const waves: Record<string, Match[]> = {};
                for (const m of detail.matches) { const k = waveKey(m); (waves[k] ??= []).push(m); }
                const orderedKeys = Object.keys(waves).sort((a, b) => waveRank(a) - waveRank(b));
                const someLive = detail.matches.some(m => m.status === "live");
                const someOnDeck = detail.matches.some(m => m.status === "scheduled" && m.started_at && new Date(m.started_at).getTime() > nowMs);
                const nextStartKey = (!someLive && !someOnDeck) ? orderedKeys.find(k => waves[k].some(m => m.status === "scheduled")) : undefined;
                return (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 12, color: "#718096", marginBottom: 10 }}>À chaque journée, <b>toutes les équipes jouent en même temps</b>. Lance la 1re journée : les suivantes démarrent seules 30 s après la fin de la précédente. Entre les phases, utilise « 🏆 Générer le tour suivant ».</p>
                    {orderedKeys.map(k => {
                      const ms = waves[k];
                      const busy = matchBusy === k;
                      const allDone = ms.every(m => m.status === "done");
                      const anyLive = ms.some(m => m.status === "live");
                      const kickoffs = ms.filter(m => m.status === "scheduled" && m.started_at).map(m => new Date(m.started_at!).getTime());
                      const isOnDeck = kickoffs.length > 0 && Math.min(...kickoffs) > nowMs;
                      const secs = isOnDeck ? Math.max(0, Math.ceil((Math.min(...kickoffs) - nowMs) / 1000)) : 0;
                      const isNext = k === nextStartKey;
                      const border = anyLive ? "#dc2626" : allDone ? "#16a34a" : isOnDeck ? "#d97706" : "#e2e8f0";
                      return (
                        <div key={k} style={{ marginBottom: 12, border: `1.5px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: anyLive ? "#fef2f2" : allDone ? "#f0fdf4" : "#f8fafc" }}>
                            <span style={{ fontSize: 12, fontWeight: 900, color: "#1a3568" }}>{waveLabel(k)}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{ms.length} match{ms.length > 1 ? "s" : ""}</span>
                            <span style={{ marginLeft: "auto" }} />
                            {allDone && <span style={{ color: "#16a34a", fontWeight: 900, fontSize: 12 }}>✓ Terminée</span>}
                            {anyLive && <><span style={{ color: "#dc2626", fontWeight: 900, fontSize: 11 }}>🔴 EN COURS</span><button onClick={() => waveAction(detail.season.id, k, "resolve")} disabled={busy} title="La journée se termine seule quand tous ont fini — ceci force la fin" style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{busy ? "…" : "⏹ Forcer la fin"}</button></>}
                            {isOnDeck && <><span style={{ padding: "4px 10px", borderRadius: 999, background: "#fef3c7", color: "#a16207", fontWeight: 900, fontSize: 12 }}>⏳ {secs}s</span><button onClick={() => waveAction(detail.season.id, k, "start")} disabled={busy} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{busy ? "…" : "▶ Maintenant"}</button></>}
                            {!allDone && !anyLive && !isOnDeck && isNext && <button onClick={() => waveAction(detail.season.id, k, "start")} disabled={busy} style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap" }}>{busy ? "…" : "▶ Démarrer la journée"}</button>}
                            {!allDone && !anyLive && !isOnDeck && !isNext && <span style={{ color: "#94a3b8", fontWeight: 800, fontSize: 12 }}>🔒 En attente</span>}
                          </div>
                          <div style={{ padding: "6px 12px" }}>
                            {ms.map(m => {
                              const a = tById[m.team_a], b = tById[m.team_b];
                              if (!a || !b) return null;
                              return (
                                <div key={m.id} style={{ padding: "5px 0", borderBottom: "1px solid #f5f2ec" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                    <span style={{ flex: 1, textAlign: "right", fontWeight: 700, color: "#1a3568" }}>{a.name.replace("Équipe ", "")}</span>
                                    <span style={{ minWidth: 60, textAlign: "center", fontWeight: 900, color: m.status === "done" ? "#1a3568" : "#cbd5e1" }}>{m.status === "done" ? `${Math.round(m.score_a ?? 0)}-${Math.round(m.score_b ?? 0)}` : m.status === "live" ? "● live" : "vs"}</span>
                                    <span style={{ flex: 1, fontWeight: 700, color: "#1a3568" }}>{b.name.replace("Équipe ", "")}</span>
                                    {m.status === "live" && (m.human_total ?? 0) > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: (m.human_done ?? 0) >= (m.human_total ?? 0) ? "#16a34a" : "#a16207", whiteSpace: "nowrap" }}>{(m.human_done ?? 0) >= (m.human_total ?? 0) ? "✅" : "👤"} {m.human_done ?? 0}/{m.human_total ?? 0}</span>}
                                  </div>
                                  {m.status === "live" && liveBar(m.started_at)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Corriger un score (poule) */}
            <div style={{ marginTop: 20, borderTop: "1px solid #eee", paddingTop: 14 }}>
              <button onClick={() => setShowEdit(v => !v)} style={{ background: "none", border: "none", color: "#1a3568", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>
                ✏️ Corriger un score {showEdit ? "▲" : "▼"}
              </button>
              {showEdit && (() => {
                const tById: Record<string, Team> = {};
                for (const ts of Object.values(detail.groups)) for (const t of ts) tById[t.id] = t;
                return (
                  <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                    {detail.matches.filter(m => m.stage === "group").map(m => {
                      const a = tById[m.team_a], b = tById[m.team_b];
                      if (!a || !b) return null;
                      const ed = scoreEdits[m.id] ?? { a: String(Math.round(m.score_a ?? 0)), b: String(Math.round(m.score_b ?? 0)) };
                      return (
                        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <span style={{ flex: 1, textAlign: "right", fontWeight: 700, color: "#1a3568" }}>{a.name.replace("Équipe ", "")}</span>
                          <input value={ed.a} onChange={e => setScoreEdits(p => ({ ...p, [m.id]: { ...ed, a: e.target.value } }))} style={{ width: 66, textAlign: "center", padding: 4, borderRadius: 6, border: "1px solid #d6d0c6" }} />
                          <span>-</span>
                          <input value={ed.b} onChange={e => setScoreEdits(p => ({ ...p, [m.id]: { ...ed, b: e.target.value } }))} style={{ width: 66, textAlign: "center", padding: 4, borderRadius: 6, border: "1px solid #d6d0c6" }} />
                          <span style={{ flex: 1, fontWeight: 700, color: "#1a3568" }}>{b.name.replace("Équipe ", "")}</span>
                          <button onClick={() => manage(detail.season.id, "correct_score", { match_id: m.id, score_a: Number(ed.a), score_b: Number(ed.b) })}
                            style={{ padding: "4px 12px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontWeight: 800, cursor: "pointer" }}>✓</button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
