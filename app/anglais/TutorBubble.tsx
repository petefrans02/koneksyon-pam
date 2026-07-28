"use client";

// GRACE — la professeure d'anglais, accessible partout dans l'Académie.
// Bulle flottante en bas à droite : on l'ouvre, on pose sa question, elle
// répond dans la langue de l'élève. Elle sait quelle leçon est en cours.

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/LangContext";

interface Msg { role: "user" | "assistant"; content: string }

const CSS = `
@keyframes tb-in { from { opacity:0; transform: translateY(14px) scale(.97) } to { opacity:1; transform:none } }
@keyframes tb-bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
@keyframes tb-dot { 0%,80%,100% { opacity:.25 } 40% { opacity:1 } }
`;

export default function TutorBubble({ lessonTitle }: { lessonTitle?: string }) {
  const { lang } = useLang();
  const l: "fr" | "ht" = lang === "ht" ? "ht" : "fr";
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const t = {
    fr: {
      name: "Grace", role: "Ta professeure d'anglais",
      hello: "Bonjour ! Je suis Grace, ta professeure d'anglais. Pose-moi n'importe quelle question : grammaire, traduction, prononciation… Je suis là pour toi. 🕊️",
      ph: "Écris ta question…", send: "Envoyer", close: "Fermer",
      s1: "Comment on dit « merci » ?", s2: "Explique-moi le verbe to be", s3: "Corrige : I is happy",
    },
    ht: {
      name: "Grace", role: "Pwofesè anglè ou",
      hello: "Bonjou ! Mwen se Grace, pwofesè anglè ou. Poze m nenpòt kesyon : gramè, tradiksyon, pwononsyasyon… Mwen la pou ou. 🕊️",
      ph: "Ekri kesyon ou…", send: "Voye", close: "Fèmen",
      s1: "Kijan yo di « mèsi » ?", s2: "Esplike m vèb to be a", s3: "Korije : I is happy",
    },
  }[l];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/english/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, lang: l, lessonTitle, history: msgs }),
      });
      const d = await res.json();
      setMsgs([...next, { role: "assistant", content: d.reply ?? d.error ?? "…" }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: l === "ht" ? "Koneksyon an pa bon. Eseye ankò." : "La connexion a échoué. Réessaie." }]);
    }
    setBusy(false);
  }

  // Met en valeur l'anglais que la professeure écrit entre **astérisques**.
  const render = (txt: string) =>
    txt.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <b key={i} style={{ color: "#4ade80" }}>{part.slice(2, -2)}</b>
        : <span key={i}>{part}</span>
    );

  return (
    <>
      <style>{CSS}</style>

      {/* Bouton flottant */}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label={t.name}
          style={{
            position: "fixed", right: 18, bottom: 18, zIndex: 60,
            width: 60, height: 60, borderRadius: "50%", cursor: "pointer",
            background: "linear-gradient(160deg,#4ade80,#16a34a)", border: "3px solid rgba(255,255,255,0.25)",
            fontSize: 28, boxShadow: "0 12px 34px rgba(22,163,74,0.45)", animation: "tb-bounce 3s ease-in-out infinite",
          }}>
          🕊️
        </button>
      )}

      {/* Panneau de discussion */}
      {open && (
        <div style={{
          position: "fixed", right: 14, bottom: 14, zIndex: 60,
          width: "min(380px, calc(100vw - 28px))", height: "min(560px, calc(100vh - 90px))",
          display: "flex", flexDirection: "column",
          background: "rgba(6,14,28,0.97)", border: "1px solid rgba(74,222,128,0.32)",
          borderRadius: 20, overflow: "hidden", backdropFilter: "blur(12px)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.6)", animation: "tb-in .3s ease both",
        }}>
          {/* En-tête */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "linear-gradient(135deg,rgba(74,222,128,0.18),transparent)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 26 }}>🕊️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900, color: "#fff", fontSize: 15 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{t.role}</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t.close}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer" }}>✕</button>
          </div>

          {/* Conversation */}
          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <Bubble who="assistant">{t.hello}</Bubble>
            {msgs.map((m, i) => <Bubble key={i} who={m.role}>{m.role === "assistant" ? render(m.content) : m.content}</Bubble>)}
            {busy && (
              <Bubble who="assistant">
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ animation: `tb-dot 1.3s ${i * 0.2}s infinite` }}>●</span>
                ))}
              </Bubble>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          {msgs.length === 0 && (
            <div style={{ display: "flex", gap: 6, padding: "0 12px 10px", flexWrap: "wrap" }}>
              {[t.s1, t.s2, t.s3].map((s) => (
                <button key={s} onClick={() => send(s)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.75)", borderRadius: 999, padding: "6px 11px", fontSize: 11, cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Saisie */}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }}
            style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.ph}
              style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: "11px 13px", color: "#fff", fontSize: 14, outline: "none" }} />
            <button type="submit" disabled={busy || !input.trim()}
              style={{ background: "linear-gradient(135deg,#4ade80,#16a34a)", border: "none", borderRadius: 12, padding: "0 16px", fontSize: 17, cursor: "pointer", opacity: busy || !input.trim() ? 0.45 : 1 }}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ who, children }: { who: "user" | "assistant"; children: React.ReactNode }) {
  const me = who === "user";
  return (
    <div style={{
      alignSelf: me ? "flex-end" : "flex-start", maxWidth: "85%",
      background: me ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "rgba(255,255,255,0.07)",
      border: me ? "none" : "1px solid rgba(255,255,255,0.1)",
      borderRadius: me ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
      padding: "10px 13px", fontSize: 14, lineHeight: 1.55, color: "#fff",
      animation: "tb-in .25s ease both", whiteSpace: "pre-wrap",
    }}>
      {children}
    </div>
  );
}
