"use client";

// PRATIQUE ORALE — l'élève prononce la phrase, le navigateur l'écoute.
//
// On s'appuie sur la reconnaissance vocale intégrée (Chrome, Edge, Safari
// mobile) : rien à installer, aucun service payant. On compare mot à mot avec
// la phrase attendue et on rend un score de prononciation.
//
// On est VOLONTAIREMENT indulgent : 60 % des mots reconnus suffisent. L'accent
// d'un débutant ne doit jamais être un motif de découragement.

import { useEffect, useState } from "react";

const norm = (s: string) =>
  s.toLowerCase().replace(/[.,!?;:'"]/g, "").replace(/\s+/g, " ").trim();

export function scoreSpeech(said: string, target: string): number {
  const heard = norm(said).split(" ").filter(Boolean);
  const want = norm(target).split(" ").filter(Boolean);
  if (!want.length) return 0;
  const pool = [...heard];
  let hits = 0;
  for (const w of want) {
    const i = pool.indexOf(w);
    if (i >= 0) { hits++; pool.splice(i, 1); }
  }
  return Math.round((hits / want.length) * 100);
}

export const PASS_SCORE = 60;

// Types minimaux de l'API vocale (absente des définitions TypeScript standard).
interface Alt { transcript: string }
interface ResultEvent { results: { [i: number]: { length: number; [j: number]: Alt } } }
interface Recognition {
  lang: string; interimResults: boolean; maxAlternatives: number;
  start(): void; abort(): void;
  onresult: (e: ResultEvent) => void;
  onerror: () => void;
  onend: () => void;
}
type RecCtor = new () => Recognition;

function getRecognition(): RecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function SpeakExercise({
  target, hint, labels, locked, onRight, onWrong, onSpeak,
}: {
  target: string;
  hint: string;
  labels: { speak: string; tapMic: string; listening: string; heard: string; noMic: string; skip: string; score: string };
  locked: boolean;
  onRight: () => void;
  onWrong: () => void;
  onSpeak: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => { setSupported(!!getRecognition()); }, []);

  const listen = () => {
    const Ctor = getRecognition();
    if (!Ctor) { setSupported(false); return; }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    setListening(true); setHeard(""); setScore(null);

    rec.onresult = (e) => {
      // Le navigateur propose plusieurs interprétations : on garde la meilleure.
      const alts = e.results[0];
      let best = "", bestScore = -1;
      for (let i = 0; i < alts.length; i++) {
        const sc = scoreSpeech(alts[i].transcript, target);
        if (sc > bestScore) { bestScore = sc; best = alts[i].transcript; }
      }
      setHeard(best); setScore(bestScore); setListening(false);
      setTimeout(() => (bestScore >= PASS_SCORE ? onRight() : onWrong()), 800);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try { rec.start(); } catch { setListening(false); }
  };

  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>{labels.speak}</p>

      <div style={{ textAlign: "center", margin: "18px 0 6px" }}>
        <p style={{ fontSize: "clamp(20px,4vw,30px)", fontWeight: 800, margin: "0 0 6px", lineHeight: 1.3 }}>{target}</p>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: 0 }}>{hint}</p>
        <button onClick={() => onSpeak(target)}
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)", color: "#fff", borderRadius: 14, padding: "10px 18px", cursor: "pointer", marginTop: 12 }}>
          🔊
        </button>
      </div>

      {supported === false ? (
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{labels.noMic}</p>
          <button onClick={onRight} style={btn}>{labels.skip}</button>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={listen} disabled={locked || listening} aria-label={labels.tapMic}
            style={{
              width: 96, height: 96, borderRadius: "50%", fontSize: 40, cursor: "pointer", color: "#fff",
              background: listening ? "linear-gradient(160deg,#f87171,#b91c1c)" : "linear-gradient(160deg,#4ade80,#16a34a)",
              border: "4px solid rgba(255,255,255,0.2)",
              boxShadow: listening ? "0 0 0 14px rgba(248,113,113,0.16)" : "0 10px 30px rgba(22,163,74,0.4)",
              animation: listening ? "lp-pop 1s ease-in-out infinite" : undefined,
            }}>
            🎤
          </button>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, marginTop: 14 }}>
            {listening ? labels.listening : labels.tapMic}
          </p>

          {heard && (
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", animation: "lp-in .3s ease both", textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{labels.heard} :</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{heard}</div>
              {score !== null && (
                <>
                  <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginTop: 9 }}>
                    <div style={{ height: "100%", width: `${score}%`, borderRadius: 999, transition: "width .6s ease", background: score >= PASS_SCORE ? "linear-gradient(90deg,#4ade80,#22c55e)" : "linear-gradient(90deg,#fbbf24,#f87171)" }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginTop: 5, color: score >= PASS_SCORE ? "#4ade80" : "#fbbf24" }}>
                    {labels.score} : {score}%
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = { background: "linear-gradient(135deg,#4ade80,#16a34a)", color: "#04140a", border: "none", borderRadius: 14, padding: "14px 30px", fontWeight: 900, fontSize: 16, cursor: "pointer" };
