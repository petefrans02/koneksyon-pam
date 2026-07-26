"use client";

import { useEffect, useRef, useState, useCallback, type PointerEvent } from "react";

// Petit jeu de distraction pendant que le joueur attend la suite du championnat.
// « Attrape les étoiles » : tape les symboles qui tombent pour marquer des points. 100% local, juste pour s'amuser.
const EMOJIS = ["⭐", "🕊️", "✨", "📖", "✝️", "🌟", "😇", "🙏", "🌿", "👑"];

const T: Record<string, { title: string; sub: string; score: string; best: string; go: string }> = {
  fr: { title: "🎮 En attendant… attrape les étoiles !", sub: "Tape les symboles qui tombent 👇", score: "Score", best: "Record", go: "Rejouer" },
  ht: { title: "🎮 Pandan w ap tann… pran zetwal yo !", sub: "Tape senbòl k ap tonbe yo 👇", score: "Pwen", best: "Rekò", go: "Rejwe" },
  en: { title: "🎮 While you wait… catch the stars!", sub: "Tap the falling symbols 👇", score: "Score", best: "Best", go: "Replay" },
  es: { title: "🎮 Mientras esperas… ¡atrapa las estrellas!", sub: "Toca los símbolos que caen 👇", score: "Puntos", best: "Récord", go: "Jugar" },
};

interface Item { id: number; x: number; emoji: string; dur: number }
interface Pop { id: number; x: number; y: number }

export default function WaitingMiniGame({ lang = "fr" }: { lang?: string }) {
  const t = T[lang] ?? T.fr;
  const [items, setItems] = useState<Item[]>([]);
  const [pops, setPops] = useState<Pop[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const idRef = useRef(0);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spawn = setInterval(() => {
      const id = ++idRef.current;
      const item: Item = { id, x: 5 + Math.random() * 84, emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)], dur: 3 + Math.random() * 2.4 };
      setItems((it) => [...it, item]);
      window.setTimeout(() => setItems((it) => it.filter((i) => i.id !== id)), item.dur * 1000);
    }, 720);
    return () => clearInterval(spawn);
  }, []);

  const tap = useCallback((id: number, e: React.PointerEvent) => {
    const rect = areaRef.current?.getBoundingClientRect();
    const px = rect ? e.clientX - rect.left : 0, py = rect ? e.clientY - rect.top : 0;
    const popId = ++idRef.current;
    setPops((p) => [...p, { id: popId, x: px, y: py }]);
    window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== popId)), 700);
    setItems((it) => it.filter((i) => i.id !== id));
    setScore((s) => { const ns = s + 1; setBest((b) => Math.max(b, ns)); return ns; });
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
      <style>{`
        @keyframes wmg-fall { from { transform: translateY(-34px) rotate(0deg); } to { transform: translateY(330px) rotate(28deg); } }
        @keyframes wmg-pop { 0% { transform: scale(.4); opacity: 1; } 100% { transform: scale(1.8) translateY(-24px); opacity: 0; } }
        @keyframes wmg-pulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .wmg-item { animation: wmg-fall linear forwards; }
        @media (prefers-reduced-motion: reduce){ .wmg-item{ animation-duration: 6s !important; } }
      `}</style>
      <p style={{ fontSize: 13, fontWeight: 900, color: "#e6b83c", marginBottom: 2 }}>{t.title}</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>{t.sub}</p>
      <div ref={areaRef} style={{ position: "relative", height: 300, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(230,184,60,0.25)", background: "linear-gradient(180deg,rgba(20,33,63,0.6),rgba(5,11,24,0.6))", touchAction: "manipulation" }}>
        {items.map((i) => (
          <button key={i.id} onPointerDown={(e) => tap(i.id, e)} aria-label="catch"
            className="wmg-item"
            style={{ position: "absolute", top: 0, left: `${i.x}%`, fontSize: 30, lineHeight: 1, background: "none", border: "none", padding: 6, cursor: "pointer", animationDuration: `${i.dur}s`, filter: "drop-shadow(0 3px 8px rgba(230,184,60,0.4))" }}>
            {i.emoji}
          </button>
        ))}
        {pops.map((p) => (
          <span key={p.id} aria-hidden style={{ position: "absolute", left: p.x - 10, top: p.y - 10, fontSize: 20, fontWeight: 900, color: "#e6b83c", animation: "wmg-pop .7s ease-out forwards", pointerEvents: "none" }}>+1</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{t.score} : <b style={{ color: "#e6b83c" }}>{score}</b></span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>{t.best} : {best}</span>
      </div>
    </div>
  );
}
