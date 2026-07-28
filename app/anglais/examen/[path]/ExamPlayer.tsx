"use client";

// EXAMEN FINAL — ce qui donne sa valeur au certificat.
//
// 20 questions tirées de TOUT le parcours, sans cœurs et sans indices : on
// vérifie ce qui reste su, pas ce qui a été cliqué. Il faut 80 % pour réussir.
// La réussite est enregistrée dans la progression sous la forme « exam:<parcours> »,
// et le certificat la vérifie côté serveur.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { lessonsOfPath, PATHS, type Exercise, type Path } from "@/lib/english-course";
import { loadLocal, completeLesson } from "@/lib/english-progress";

const PASS = 80;          // pourcentage requis
const QUESTIONS = 20;

type Mcq = { prompt: string; hint?: string; options: string[]; correct: number; audio?: string };

// On ne retient que les exercices à choix : un examen doit se corriger sans
// ambiguïté. Les exercices de construction et de parole restent aux leçons.
function toMcq(ex: Exercise, l: "fr" | "ht"): Mcq | null {
  if (ex.t === "choose") return { prompt: ex.ask[l], options: ex.options, correct: ex.correct };
  if (ex.t === "fill") return { prompt: `${ex.before}____${ex.after}`, hint: ex.hint[l], options: ex.options, correct: ex.correct };
  if (ex.t === "listen") return { prompt: "🔊", audio: ex.en, options: ex.options, correct: ex.correct };
  return null;
}

function speak(text: string) {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.85;
    s.speak(u);
  } catch { /* pas de synthèse vocale */ }
}

export default function ExamPlayer({ path }: { path: Path }) {
  const router = useRouter();
  const { lang } = useLang();
  const l: "fr" | "ht" = lang === "ht" ? "ht" : "fr";

  const t = {
    fr: { title: "Examen final", sub: "20 questions tirées de tout le parcours", need: `Il faut ${PASS}% pour réussir`,
          q: "Question", check: "Valider", passed: "Réussi !", failed: "Pas encore", again: "Repasser l'examen",
          back: "Retour au parcours", your: "Ton score", unlocked: "Certificat débloqué", retry: "Révise et retente ta chance.",
          quit: "Quitter" },
    ht: { title: "Egzamen final", sub: "20 kesyon soti nan tout pakou a", need: `Ou bezwen ${PASS}% pou pase`,
          q: "Kesyon", check: "Valide", passed: "Ou pase !", failed: "Poko", again: "Repase egzamen an",
          back: "Tounen nan pakou a", your: "Nòt ou", unlocked: "Sètifika debloke", retry: "Revize epi eseye ankò.",
          quit: "Kite" },
  }[l];

  // Tirage aléatoire à chaque tentative : impossible d'apprendre les réponses.
  const questions = useMemo(() => {
    const all: Mcq[] = [];
    for (const les of lessonsOfPath(path)) {
      for (const ex of les.exercises) {
        const m = toMcq(ex, l);
        if (m) all.push(m);
      }
    }
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, QUESTIONS);
  }, [path, l]);

  const [step, setStep] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[step];
  const score = questions.length ? Math.round((right / questions.length) * 100) : 0;
  const passed = score >= PASS;

  function validate() {
    if (picked === null || !q) return;
    const ok = picked === q.correct;
    const nextRight = right + (ok ? 1 : 0);
    setRight(nextRight);
    setPicked(null);

    if (step + 1 >= questions.length) {
      setDone(true);
      const final = Math.round((nextRight / questions.length) * 100);
      // On n'enregistre la réussite qu'au-dessus du seuil.
      if (final >= PASS && !loadLocal().done.includes(`exam:${path}`)) {
        completeLesson(`exam:${path}`, 0);
      }
      return;
    }
    setStep((s) => s + 1);
  }

  if (done) {
    return (
      <Shell>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 76 }}>{passed ? "🎓" : "📚"}</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0" }}>{passed ? t.passed : t.failed}</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", margin: 0 }}>{t.your}</p>
          <p style={{ fontSize: 54, fontWeight: 900, color: passed ? "#4ade80" : "#fbbf24", margin: "4px 0 6px" }}>{score}%</p>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>{right}/{questions.length} · {t.need}</p>

          <p style={{ marginTop: 18, fontWeight: 800, color: passed ? "#4ade80" : "rgba(255,255,255,0.6)" }}>
            {passed ? `✅ ${t.unlocked}` : t.retry}
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
            {!passed && (
              <button onClick={() => { setStep(0); setRight(0); setDone(false); setPicked(null); }} style={btnGhost}>
                {t.again}
              </button>
            )}
            <button onClick={() => router.push("/anglais")} style={btn}>{t.back}</button>
          </div>
        </div>
      </Shell>
    );
  }

  if (!q) {
    return <Shell><p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)" }}>…</p></Shell>;
  }

  return (
    <Shell>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href="/anglais" style={{ fontSize: 22, textDecoration: "none", color: "rgba(255,255,255,0.4)" }} title={t.quit}>✕</Link>
        <div style={{ flex: 1, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.09)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(step / questions.length) * 100}%`, background: "linear-gradient(90deg,#e6b83c,#a97d18)", transition: "width .4s ease" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.55)" }}>{step + 1}/{questions.length}</span>
      </div>

      <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "#e6b83c", margin: 0 }}>
        {t.title} · {t.q} {step + 1}
      </p>

      <div style={{ textAlign: "center", margin: "20px 0 24px" }}>
        {q.audio ? (
          <button onClick={() => speak(q.audio!)} style={{ ...btnGhost, fontSize: 38, padding: "18px 30px" }}>🔊</button>
        ) : (
          <p style={{ fontSize: "clamp(19px,3.6vw,28px)", fontWeight: 800, margin: 0, lineHeight: 1.35 }}>{q.prompt}</p>
        )}
        {q.hint && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 8 }}>{q.hint}</p>}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {q.options.map((o, i) => (
          <button key={i} onClick={() => setPicked(i)}
            style={{
              background: picked === i ? "rgba(230,184,60,0.16)" : "rgba(255,255,255,0.05)",
              border: `2px solid ${picked === i ? "#e6b83c" : "rgba(255,255,255,0.13)"}`,
              color: "#fff", borderRadius: 14, padding: "15px 18px", fontSize: 16, fontWeight: 700,
              cursor: "pointer", textAlign: "left", transition: "all .15s",
            }}>
            {o}
          </button>
        ))}
      </div>

      <button onClick={validate} disabled={picked === null}
        style={{ ...btn, width: "100%", marginTop: 24, opacity: picked === null ? 0.4 : 1 }}>
        {t.check}
      </button>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04080f,#0a1020 60%,#04080f)", color: "#fff", padding: "22px clamp(16px,4vw,40px) 60px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

const btn: React.CSSProperties = { background: "linear-gradient(135deg,#e6b83c,#a97d18)", color: "#1a1203", border: "none", borderRadius: 14, padding: "14px 28px", fontWeight: 900, fontSize: 16, cursor: "pointer" };
const btnGhost: React.CSSProperties = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", borderRadius: 14, padding: "12px 22px", fontWeight: 800, cursor: "pointer" };
