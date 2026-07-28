"use client";

// LECTEUR DE LEÇON — les cinq types d'exercices, les cœurs, l'XP, les animations.
// Prononciation par la synthèse vocale du navigateur : aucun fichier audio à
// héberger, et ça marche aussi sur téléphone.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { HEARTS, XP_PER_EXERCISE, type Exercise, type Lesson } from "@/lib/english-course";
import { completeLesson } from "@/lib/english-progress";
import TutorBubble from "../TutorBubble";

const CSS = `
@keyframes lp-in { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform:none } }
@keyframes lp-shake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-9px) } 40% { transform: translateX(9px) } 60% { transform: translateX(-5px) } 80% { transform: translateX(5px) } }
@keyframes lp-pop { 0% { transform: scale(.86) } 55% { transform: scale(1.07) } 100% { transform: scale(1) } }
@keyframes lp-heart { 0% { transform: scale(1) } 40% { transform: scale(1.5) } 100% { transform: scale(1); opacity:.25 } }
@keyframes lp-confetti { 0% { transform: translate(0,0) rotate(0); opacity:1 } 100% { transform: translate(var(--cx),85vh) rotate(var(--cr)); opacity:0 } }
@keyframes lp-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
`;

// ── Prononciation anglaise ───────────────────────────────────────────────────
function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.85; // un peu lent : on apprend
    synth.speak(u);
  } catch { /* navigateur sans synthèse vocale */ }
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export default function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const { lang } = useLang();
  const l: "fr" | "ht" = lang === "ht" ? "ht" : "fr";

  const [step, setStep] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [xp, setXp] = useState(0);
  const [state, setState] = useState<"answering" | "right" | "wrong">("answering");
  const [finished, setFinished] = useState(false);
  const [lostHeart, setLostHeart] = useState(-1);

  const ex = lesson.exercises[step];
  const total = lesson.exercises.length;

  const t = {
    fr: { check: "Vérifier", cont: "Continuer", right: "Bravo !", wrong: "Pas tout à fait", answer: "Réponse", quit: "Quitter", done: "Leçon terminée !", again: "Recommencer", back: "Retour au parcours", noHearts: "Plus de cœurs", noHeartsSub: "Reprends la leçon, tu vas y arriver.", listen: "Écoute et choisis", tapWords: "Touche les mots dans l'ordre", pick: "Choisis la bonne traduction", complete: "Complète la phrase", link: "Relie les mots" },
    ht: { check: "Verifye", cont: "Kontinye", right: "Bravo !", wrong: "Pa tout afè", answer: "Repons", quit: "Kite", done: "Leson fini !", again: "Rekòmanse", back: "Tounen nan pakou a", noHearts: "Pa gen kè ankò", noHeartsSub: "Rekòmanse leson an, w ap rive.", listen: "Koute epi chwazi", tapWords: "Manyen mo yo nan lòd", pick: "Chwazi bon tradiksyon an", complete: "Konplete fraz la", link: "Konekte mo yo" },
  }[l];

  const onRight = () => {
    setState("right");
    setXp((v) => v + XP_PER_EXERCISE);
  };
  const onWrong = () => {
    setState("wrong");
    setHearts((h) => { setLostHeart(h - 1); return h - 1; });
  };

  const next = useCallback(() => {
    if (step + 1 >= total) {
      setFinished(true);
      completeLesson(lesson.slug, xp);
      return;
    }
    setStep((s) => s + 1);
    setState("answering");
  }, [step, total, lesson.slug, xp]);

  // Fin par épuisement des cœurs.
  if (hearts <= 0 && !finished) {
    return (
      <Shell lessonTitle={lesson.title.fr}>
        <div style={{ textAlign: "center", animation: "lp-in .5s ease both" }}>
          <div style={{ fontSize: 74 }}>💔</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, margin: "10px 0 6px" }}>{t.noHearts}</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: 22 }}>{t.noHeartsSub}</p>
          <button onClick={() => { setHearts(HEARTS); setStep(0); setXp(0); setState("answering"); }} style={btnPrimary}>{t.again}</button>
          <div style={{ marginTop: 14 }}><Link href="/anglais" style={linkStyle}>{t.back}</Link></div>
        </div>
      </Shell>
    );
  }

  // Écran de fin.
  if (finished) {
    return (
      <Shell>
        <Confetti />
        <div style={{ textAlign: "center", animation: "lp-in .6s ease both", position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 80, animation: "lp-float 2.6s ease-in-out infinite" }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0" }}>{t.done}</h2>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", margin: "18px 0 24px" }}>
            <Badge icon="⚡" value={`+${xp}`} color="#fbbf24" />
            <Badge icon="❤️" value={`${hearts}/${HEARTS}`} color="#f87171" />
          </div>
          <div style={{ background: "rgba(230,184,60,0.1)", border: "1px solid rgba(230,184,60,0.35)", borderRadius: 16, padding: "16px 18px", marginBottom: 22 }}>
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", fontSize: 17, margin: 0 }}>« {lesson.verse.en} »</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "8px 0 4px" }}>{lesson.verse.fr}</p>
            <p style={{ color: "#e6b83c", fontWeight: 800, fontSize: 13, margin: 0 }}>📖 {lesson.verse.ref}</p>
            <button onClick={() => speak(lesson.verse.en)} style={{ ...btnGhost, marginTop: 10 }}>🔊</button>
          </div>
          <button onClick={() => router.push("/anglais")} style={btnPrimary}>{t.back}</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell lessonTitle={lesson.title.fr}>
      {/* Barre du haut : sortie, progression, cœurs */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <Link href="/anglais" style={{ fontSize: 22, textDecoration: "none", color: "rgba(255,255,255,0.45)" }} title={t.quit}>✕</Link>
        <div style={{ flex: 1, height: 12, borderRadius: 999, background: "rgba(255,255,255,0.09)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(step / total) * 100}%`, background: "linear-gradient(90deg,#4ade80,#22c55e)", borderRadius: 999, transition: "width .45s cubic-bezier(0.22,1,0.36,1)" }} />
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: HEARTS }).map((_, i) => (
            <span key={i} style={{ fontSize: 17, opacity: i < hearts ? 1 : 0.22, animation: i === lostHeart ? "lp-heart .6s ease both" : undefined }}>❤️</span>
          ))}
        </div>
      </div>

      <div key={step} style={{ animation: "lp-in .35s ease both" }}>
        <ExerciseView ex={ex} l={l} t={t} state={state} onRight={onRight} onWrong={onWrong} />
      </div>

      {/* Bandeau de résultat */}
      {state !== "answering" && (
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0, padding: "18px clamp(16px,4vw,40px) 26px",
          background: state === "right" ? "rgba(22,101,52,0.96)" : "rgba(127,29,29,0.96)",
          borderTop: `2px solid ${state === "right" ? "#4ade80" : "#f87171"}`,
          animation: "lp-in .3s ease both", zIndex: 20,
        }}>
          <div style={{ maxWidth: 620, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 30 }}>{state === "right" ? "✅" : "❌"}</span>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontWeight: 900, fontSize: 17 }}>{state === "right" ? t.right : t.wrong}</div>
              {state === "wrong" && <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{t.answer} : <b>{answerOf(ex)}</b></div>}
            </div>
            <button onClick={next} style={{ ...btnPrimary, background: "#fff", color: state === "right" ? "#166534" : "#7f1d1d" }}>{t.cont}</button>
          </div>
        </div>
      )}
    </Shell>
  );
}

// ── Les cinq types d'exercices ───────────────────────────────────────────────

function ExerciseView({ ex, l, t, state, onRight, onWrong }: {
  ex: Exercise; l: "fr" | "ht"; t: Record<string, string>;
  state: string; onRight: () => void; onWrong: () => void;
}) {
  const locked = state !== "answering";

  if (ex.t === "match") return <MatchEx ex={ex} l={l} title={t.link} onRight={onRight} onWrong={onWrong} locked={locked} />;
  if (ex.t === "build") return <BuildEx ex={ex} l={l} title={t.tapWords} onRight={onRight} onWrong={onWrong} locked={locked} />;

  // choose / fill / listen partagent la même grille de réponses.
  const title = ex.t === "listen" ? t.listen : ex.t === "fill" ? t.complete : t.pick;
  const prompt =
    ex.t === "choose" ? <Big>{ex.ask[l]}</Big>
    : ex.t === "fill" ? (
      <>
        <Big>{ex.before}<span style={{ color: "#fbbf24" }}>____</span>{ex.after}</Big>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>{ex.hint[l]}</p>
      </>
    ) : (
      <button onClick={() => speak(ex.en)} style={{ ...btnGhost, fontSize: 40, padding: "18px 30px", animation: "lp-float 2.4s ease-in-out infinite" }}>🔊</button>
    );

  return (
    <div>
      <Title>{title}</Title>
      <div style={{ textAlign: "center", margin: "18px 0 26px" }}>{prompt}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {ex.options.map((o, i) => (
          <button key={i} disabled={locked}
            onClick={() => { speak(o); i === ex.correct ? onRight() : onWrong(); }}
            style={optionStyle}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function BuildEx({ ex, l, title, onRight, onWrong, locked }: { ex: Extract<Exercise, { t: "build" }>; l: "fr" | "ht"; title: string; onRight: () => void; onWrong: () => void; locked: boolean }) {
  const bank = useMemo(() => shuffle([...ex.en.split(" "), ...(ex.extra ?? [])]), [ex]);
  const [picked, setPicked] = useState<number[]>([]);
  const usedRef = useRef<Set<number>>(new Set());
  useEffect(() => { setPicked([]); usedRef.current = new Set(); }, [ex]);

  const sentence = picked.map((i) => bank[i]).join(" ");
  const check = () => { speak(sentence); sentence.trim() === ex.en ? onRight() : onWrong(); };

  return (
    <div>
      <Title>{title}</Title>
      <div style={{ textAlign: "center", margin: "16px 0 22px" }}><Big>{ex.ask[l]}</Big></div>

      {/* Zone de construction */}
      <div style={{ minHeight: 62, borderTop: "2px solid rgba(255,255,255,0.12)", borderBottom: "2px solid rgba(255,255,255,0.12)", padding: "12px 6px", display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {picked.map((bi, k) => (
          <button key={k} disabled={locked} onClick={() => setPicked((p) => p.filter((_, j) => j !== k))} style={chipStyle(true)}>{bank[bi]}</button>
        ))}
      </div>

      {/* Banque de mots */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {bank.map((w, i) => picked.includes(i) ? <span key={i} style={{ ...chipStyle(false), opacity: 0.2 }}>{w}</span>
          : <button key={i} disabled={locked} onClick={() => setPicked((p) => [...p, i])} style={chipStyle(false)}>{w}</button>)}
      </div>

      {!locked && (
        <button onClick={check} disabled={picked.length === 0} style={{ ...btnPrimary, width: "100%", marginTop: 26, opacity: picked.length ? 1 : 0.4 }}>✓</button>
      )}
    </div>
  );
}

function MatchEx({ ex, l, title, onRight, onWrong, locked }: { ex: Extract<Exercise, { t: "match" }>; l: "fr" | "ht"; title: string; onRight: () => void; onWrong: () => void; locked: boolean }) {
  const left = useMemo(() => shuffle(ex.pairs.map((p) => p.en)), [ex]);
  const right = useMemo(() => shuffle(ex.pairs.map((p) => p[l])), [ex, l]);
  const [sel, setSel] = useState<string | null>(null);
  const [ok, setOk] = useState<Set<string>>(new Set());
  const [bad, setBad] = useState<string | null>(null);

  useEffect(() => { setSel(null); setOk(new Set()); }, [ex]);
  useEffect(() => { if (ok.size === ex.pairs.length && ok.size > 0) onRight(); }, [ok, ex.pairs.length, onRight]);

  const tryPair = (fr: string) => {
    if (!sel) return;
    const pair = ex.pairs.find((p) => p.en === sel);
    if (pair && pair[l] === fr) { setOk((s) => new Set([...s, sel, fr])); setSel(null); }
    else { setBad(fr); setTimeout(() => setBad(null), 500); onWrong(); setSel(null); }
  };

  return (
    <div>
      <Title>{title}</Title>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
        <div style={{ display: "grid", gap: 10 }}>
          {left.map((en) => (
            <button key={en} disabled={locked || ok.has(en)}
              onClick={() => { speak(en); setSel(en); }}
              style={{ ...optionStyle, opacity: ok.has(en) ? 0.35 : 1, borderColor: sel === en ? "#fbbf24" : "rgba(255,255,255,0.14)", background: sel === en ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.05)" }}>
              {en}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {right.map((fr) => (
            <button key={fr} disabled={locked || ok.has(fr)} onClick={() => tryPair(fr)}
              style={{ ...optionStyle, opacity: ok.has(fr) ? 0.35 : 1, animation: bad === fr ? "lp-shake .45s ease" : undefined }}>
              {fr}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Petits éléments ──────────────────────────────────────────────────────────

function Shell({ children, lessonTitle }: { children: React.ReactNode; lessonTitle?: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04080f,#061020 60%,#04080f)", color: "#fff", padding: "18px clamp(16px,4vw,40px) 130px" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>{children}</div>
      {/* Grace connaît la leçon en cours : ses explications restent dans le contexte. */}
      <TutorBubble lessonTitle={lessonTitle} />
    </div>
  );
}
const Title = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>{children}</p>
);
const Big = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: "clamp(20px,4vw,30px)", fontWeight: 800, margin: "0 0 6px", lineHeight: 1.3 }}>{children}</p>
);
function Badge({ icon, value, color }: { icon: string; value: string; color: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "10px 18px", animation: "lp-pop .5s ease both" }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontWeight: 900, color, fontSize: 18 }}>{value}</div>
    </div>
  );
}
function Confetti() {
  const bits = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    left: Math.random() * 100, cx: `${(Math.random() - 0.5) * 220}px`, cr: `${Math.random() * 720}deg`,
    delay: Math.random() * 0.5, color: ["#4ade80", "#fbbf24", "#60a5fa", "#f472b6"][i % 4],
  })), []);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
      {bits.map((b, i) => (
        <span key={i} style={{
          position: "absolute", top: -20, left: `${b.left}%`, width: 9, height: 14, background: b.color, borderRadius: 2,
          ["--cx" as string]: b.cx, ["--cr" as string]: b.cr,
          animation: `lp-confetti ${1.8 + Math.random()}s ${b.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

function answerOf(ex: Exercise): string {
  if (ex.t === "build") return ex.en;
  if (ex.t === "match") return ex.pairs.map((p) => p.en).join(", ");
  return ex.options[ex.correct];
}

const btnPrimary: React.CSSProperties = { background: "linear-gradient(135deg,#4ade80,#16a34a)", color: "#04140a", border: "none", borderRadius: 14, padding: "14px 30px", fontWeight: 900, fontSize: 16, cursor: "pointer" };
const btnGhost: React.CSSProperties = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)", color: "#fff", borderRadius: 14, padding: "10px 18px", cursor: "pointer" };
const linkStyle: React.CSSProperties = { color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14 };
const optionStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.14)", color: "#fff", borderRadius: 14, padding: "15px 18px", fontSize: 16, fontWeight: 700, cursor: "pointer", textAlign: "left", transition: "all .15s" };
const chipStyle = (picked: boolean): React.CSSProperties => ({
  background: picked ? "rgba(74,222,128,0.16)" : "rgba(255,255,255,0.07)",
  border: `2px solid ${picked ? "#4ade8066" : "rgba(255,255,255,0.16)"}`,
  color: "#fff", borderRadius: 12, padding: "10px 15px", fontSize: 16, fontWeight: 700, cursor: "pointer",
});
