"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { clockState, ANSWER_SEC } from "@/lib/champ-sync";
import { playTick, playChime } from "@/lib/sound";
import {
  startLobbyMusic, startQuestionMusic, stopMusic, playCorrect, playWrong,
  resumeAudio, preloadMatchAudio, loadAudioPrefs, saveAudioPrefs,
} from "@/lib/championship-audio";
import { LiveParticles, StadiumBackground, BROADCAST_CSS } from "@/lib/broadcast-fx";

interface Q { prompt: string; options: string[]; correct: number; ref: string }
interface SyncData { started_at: string; server_now: string; count: number; questions: Q[]; my_answers: Record<number, number> }
interface TeamInfo { name: string; color: string; logo_seed: string }

const GOLD = "#e6b83c";
const LETTERS = ["A", "B", "C", "D", "E", "F"];
const short = (n: string) => n.replace(/^Équipe\s+/i, "");

// Écran de jeu SYNCHRONISÉ et IMMERSIF (proche de la diffusion) : même question/chrono pour tous,
// dans une ambiance premium « championnat mondial » pour captiver le joueur.
export default function SyncPlay({ matchId, teamA, teamB, soundOn = false, onFinish }: { matchId: string; teamA?: TeamInfo | null; teamB?: TeamInfo | null; soundOn?: boolean; onFinish: (r: { score: number; correct: number; answered: number }) => void }) {
  const [data, setData] = useState<SyncData | null>(null);
  const [now, setNow] = useState(Date.now());
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const offsetRef = useRef(0);
  const submittedRef = useRef(false);
  const lastTickRef = useRef(-1);
  const prevIdxRef = useRef(-1);
  // La musique ne peut démarrer qu'après un geste de l'utilisateur (règle des
  // navigateurs) : le bouton 🔊 sert d'autorisation explicite.
  // Herite de la salle d'attente : si la musique y tournait deja, elle continue.
  const [audioOn, setAudioOn] = useState(soundOn);
  const revealSoundRef = useRef(-1);

  useEffect(() => {
    fetch(`/api/championship/match/${matchId}/sync`).then(r => r.json()).then((d: SyncData & { error?: string }) => {
      if (d.error) return;
      offsetRef.current = new Date(d.server_now).getTime() - Date.now();
      setData(d);
      setAnswered(d.my_answers || {});
    }).catch(() => {});
  }, [matchId]);

  useEffect(() => { const iv = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(iv); }, []);

  const st = data ? clockState(new Date(data.started_at).getTime(), now + offsetRef.current, data.count) : null;
  const q = data && st && !st.over && st.phase !== "pre" ? data.questions[st.index] : null;
  const myChoice = st ? answered[st.index] : undefined;

  useEffect(() => {
    if (!st || !data) return;
    if (st.index !== prevIdxRef.current && st.phase === "answer") { prevIdxRef.current = st.index; playChime(); }
    if (st.phase === "answer" && st.secLeft <= 5 && st.secLeft > 0 && lastTickRef.current !== st.secLeft) { lastTickRef.current = st.secLeft; playTick(st.secLeft % 2 === 0); }
  }, [st?.index, st?.phase, st?.secLeft, data]);

  // Musique de fond selon la phase du match.
  useEffect(() => {
    if (!audioOn || !st) return;
    if (st.over) { stopMusic(1.5); return; }
    if (st.phase === "pre") startLobbyMusic();
    // La boucle de questions continue pendant la révélation (pas de coupure).
    else if (st.phase === "answer") startQuestionMusic(0);
  }, [audioOn, st?.phase, st?.over, st]);

  // Son de résultat, une seule fois par question, et uniquement si on a répondu.
  useEffect(() => {
    if (!audioOn || !st || !data || st.phase !== "reveal") return;
    if (revealSoundRef.current === st.index) return;
    revealSoundRef.current = st.index;
    const mine = answered[st.index];
    if (mine === undefined) return;
    if (data.questions[st.index]?.correct === mine) playCorrect(); else playWrong();
  }, [audioOn, st?.phase, st?.index, data, answered, st]);

  useEffect(() => () => { stopMusic(1); }, []);

  function toggleAudio() {
    resumeAudio();
    if (!audioOn) {
      preloadMatchAudio();
      saveAudioPrefs({ musicEnabled: true, fxEnabled: true, volume: loadAudioPrefs().volume });
      setAudioOn(true);
    } else {
      stopMusic(0.8);
      setAudioOn(false);
    }
  }

  const tap = useCallback((i: number) => {
    resumeAudio();
    if (!st || st.phase !== "answer" || answered[st.index] !== undefined) return;
    setAnswered(a => ({ ...a, [st.index]: i }));
    fetch(`/api/championship/match/${matchId}/answer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q_index: st.index, choice: i }) }).catch(() => {});
  }, [st, answered, matchId]);

  useEffect(() => {
    if (!st || !data || !st.over || submittedRef.current || data.count === 0) return;
    submittedRef.current = true;
    const cc = Object.entries(answered).filter(([i, c]) => data.questions[+i]?.correct === c).length;
    const res = { score: cc * 100, correct: cc, answered: Object.keys(answered).length };
    fetch(`/api/championship/match/${matchId}/play`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: res.score, correct: res.correct, total_q: data.count }) }).catch(() => {});
    onFinish(res);
  }, [st?.over, data, answered, matchId, onFinish, st]);

  const bg = (c: React.ReactNode) => (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", background: "radial-gradient(ellipse 100% 60% at 50% 0%, #16264d, #0a1330 55%, #05070f)", color: "#fff", display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes sp-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes sp-pulse{0%,100%{opacity:1}50%{opacity:.45}}@keyframes sp-ring{0%{transform:scale(.9);opacity:.6}50%{transform:scale(1.05);opacity:1}100%{transform:scale(.9);opacity:.6}}` + BROADCAST_CSS}</style>
      <StadiumBackground accent={GOLD} />
      <LiveParticles accent={GOLD} />
      {c}
    </div>
  );

  const VsBar = () => (
    <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(10px,2vw,24px)", padding: "6px 16px" }}>
      {teamA && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 30, height: 30, borderRadius: 8, background: teamA.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12 }}>{teamA.logo_seed}</span><b style={{ fontSize: "clamp(13px,1.4vw,18px)" }}>{short(teamA.name)}</b></div>}
      <span style={{ color: GOLD, fontWeight: 900, fontSize: "clamp(12px,1.2vw,16px)" }}>VS</span>
      {teamB && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><b style={{ fontSize: "clamp(13px,1.4vw,18px)" }}>{short(teamB.name)}</b><span style={{ width: 30, height: 30, borderRadius: 8, background: teamB.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12 }}>{teamB.logo_seed}</span></div>}
    </div>
  );

  if (!data) return bg(<div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>Chargement…</div>);

  if (!st || st.phase === "pre") return bg(
    <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 64, animation: "sp-pulse 1.2s infinite" }}>⏳</div>
      <p style={{ fontSize: 22, fontWeight: 900 }}>Le match démarre…</p>
      <VsBar />
    </div>
  );

  if (st.over) {
    const cc = Object.entries(answered).filter(([i, c]) => data.questions[+i]?.correct === c).length;
    return bg(
      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 64, animation: "prem-trophy-pop 1s cubic-bezier(0.34,1.56,0.64,1) both" }}>✅</div>
        <p style={{ fontSize: 26, fontWeight: 900 }}>Manche terminée !</p>
        <p style={{ color: GOLD, fontWeight: 900, fontSize: 22 }}>{cc} bonnes réponses 🎯</p>
        <VsBar />
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>En attente du résultat de l'équipe…</p>
      </div>
    );
  }

  const reveal = st.phase === "reveal";
  const correctCount = Object.entries(answered).filter(([i, c]) => data.questions[+i]?.correct === c).length;
  const ringPct = reveal ? 100 : Math.round((st.secLeft / ANSWER_SEC) * 100);
  const ringColor = reveal ? "#22c55e" : (st.secLeft <= 5 ? "#f87171" : GOLD);

  return bg(
    <>
      {/* halo d'urgence */}
      {!reveal && st.secLeft <= 5 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, rgba(248,113,113,0.16), transparent 60%)", animation: "sp-pulse 0.9s ease-in-out infinite", pointerEvents: "none", zIndex: 1 }} />}

      {/* En-tête premium */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12, padding: "12px 18px" }}>
        <span style={{ fontSize: "clamp(22px,3vw,34px)", display: "inline-block", animation: "bfx-trophy3d 6s linear infinite" }}>🏆</span>
        <div style={{ fontSize: "clamp(13px,1.6vw,22px)", fontWeight: 900, background: "linear-gradient(135deg,#fff,#e6b83c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.02em" }}>CHAMPIONNAT BIBLIQUE MONDIAL</div>
        <button onClick={toggleAudio} title={audioOn ? "Couper la musique" : "Activer la musique"}
          style={{ marginLeft: "auto", background: audioOn ? "rgba(230,184,60,0.18)" : "rgba(255,255,255,0.06)", border: `1px solid ${audioOn ? "rgba(230,184,60,0.5)" : "rgba(255,255,255,0.15)"}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>
          {audioOn ? "🔊" : "🔇"}
        </button>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(220,38,38,0.18)", border: "1px solid rgba(248,113,113,0.5)", borderRadius: 999, padding: "5px 12px" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", animation: "sp-pulse 1s infinite" }} /><b style={{ fontSize: 11, color: "#fecaca", letterSpacing: "0.1em" }}>LIVE</b>
        </span>
      </div>
      <VsBar />

      {/* Barre : question + chrono en anneau + score */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12, padding: "8px 18px" }}>
        <span style={{ fontSize: "clamp(12px,1.3vw,17px)", fontWeight: 900, color: GOLD }}>📖 Question {st.index + 1}/{data.count}</span>
        <span style={{ marginLeft: "auto", fontSize: "clamp(12px,1.2vw,16px)", fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>✅ {correctCount}</span>
        <div style={{ position: "relative", width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(${ringColor} ${ringPct * 3.6}deg, rgba(255,255,255,0.1) 0deg)` }} />
          <div style={{ position: "absolute", inset: 4, borderRadius: "50%", background: "#0a1330" }} />
          <span style={{ position: "relative", fontSize: 18, fontWeight: 900, color: ringColor, fontVariantNumeric: "tabular-nums" }}>{reveal ? "✓" : st.secLeft}</span>
        </div>
      </div>

      {/* Corps : question + options */}
      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "18px 22px 30px", maxWidth: 840, width: "100%", margin: "0 auto" }}>
        <div key={st.index} style={{ background: reveal ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.04)", border: `1px solid ${reveal ? "#22c55e55" : GOLD + "44"}`, borderRadius: 22, padding: "clamp(18px,2.6vw,34px)", boxShadow: "0 20px 60px rgba(0,0,0,0.45)", animation: "sp-in .4s ease both" }}>
          <h1 style={{ fontSize: "clamp(1.35rem,4vw,2.2rem)", fontWeight: 900, lineHeight: 1.3, marginBottom: "clamp(16px,2.2vw,26px)", fontFamily: "'Playfair Display',Georgia,serif" }}>{q?.prompt}</h1>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(10px,1.2vw,14px)" }}>
            {q?.options.map((opt, i) => {
              if (!opt?.trim()) return null;
              const isCorrect = i === q.correct, chosen = myChoice === i;
              let bgc = "rgba(255,255,255,0.05)", bd = "1px solid rgba(255,255,255,0.12)";
              if (reveal && isCorrect) { bgc = "linear-gradient(90deg,rgba(34,197,94,0.4),rgba(34,197,94,0.1))"; bd = "2px solid #22c55e"; }
              else if (reveal && chosen && !isCorrect) { bgc = "rgba(239,68,68,0.25)"; bd = "2px solid #ef4444"; }
              else if (!reveal && chosen) { bgc = `${GOLD}33`; bd = `2px solid ${GOLD}`; }
              return (
                <button key={i} onClick={() => tap(i)} disabled={reveal || myChoice !== undefined}
                  style={{ display: "flex", alignItems: "center", gap: 13, padding: "clamp(13px,1.5vw,18px)", borderRadius: 15, background: bgc, border: bd, color: "#fff", textAlign: "left", cursor: !reveal && myChoice === undefined ? "pointer" : "default", fontSize: "clamp(0.95rem,1.6vw,1.15rem)", fontWeight: 700, transition: "all .2s", animation: "sp-in .4s ease both" }}>
                  <span style={{ width: 38, height: 38, borderRadius: "50%", background: reveal && isCorrect ? "#22c55e" : GOLD, color: "#1a1203", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, flexShrink: 0 }}>{LETTERS[i]}</span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {reveal && isCorrect && <span style={{ fontSize: 22 }}>✅</span>}
                  {reveal && chosen && !isCorrect && <span style={{ fontSize: 18 }}>❌</span>}
                </button>
              );
            })}
          </div>
          {reveal && q?.ref && <p style={{ textAlign: "center", marginTop: 18, color: GOLD, fontWeight: 800 }}>📖 {q.ref}</p>}
          {!reveal && myChoice !== undefined && <p style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>Réponse enregistrée ✓ — attends la suite…</p>}
        </div>
      </div>
    </>
  );
}
