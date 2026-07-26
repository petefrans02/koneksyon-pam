"use client";
// Effets « diffusion live » pour la page spectateur : compteurs animés, réactions flottantes,
// confettis d'événement, particules. Purement décoratif, 60 fps (transform/opacity).
import { useEffect, useRef, useState } from "react";

export const BROADCAST_CSS = `
@keyframes bfx-float-up { 0% { transform: translateY(0) scale(.6); opacity: 0; } 12% { opacity: 1; } 100% { transform: translateY(-70vh) scale(1.3); opacity: 0; } }
@keyframes bfx-feed-in { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
@keyframes bfx-confetti { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(var(--cx), 90vh) rotate(var(--cr)); opacity: 0; } }
@keyframes bfx-pop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
@keyframes bfx-particle { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: var(--po,.5); } 100% { transform: translateY(-100vh); opacity: 0; } }
@keyframes bfx-glow { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
@keyframes bfx-spot { 0%,100% { transform: translateX(-50%) rotate(-14deg); opacity:.35; } 50% { transform: translateX(-50%) rotate(14deg); opacity:.6; } }
@keyframes bfx-spot2 { 0%,100% { transform: translateX(-50%) rotate(12deg); opacity:.3; } 50% { transform: translateX(-50%) rotate(-12deg); opacity:.55; } }
@keyframes bfx-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes bfx-bubble { 0% { opacity:0; transform: translateY(8px) scale(.96); } 100% { opacity:1; transform:none; } }
@keyframes bfx-ad-in { 0% { opacity:0; transform: scale(.8); } 12% { opacity:1; transform: scale(1); } 88% { opacity:1; transform: scale(1); } 100% { opacity:0; transform: scale(1.05); } }
@keyframes bfx-ring-pulse { 0% { box-shadow:0 0 0 0 rgba(230,184,60,.6); } 100% { box-shadow:0 0 0 16px rgba(230,184,60,0); } }
@keyframes bfx-score-pop { 0% { transform: scale(1.5); color:#fff; } 100% { transform: scale(1); } }
@keyframes bfx-urgent { 0%,100% { box-shadow:0 24px 70px rgba(248,113,113,0.22); } 50% { box-shadow:0 24px 90px rgba(248,113,113,0.55); } }
@keyframes bfx-trophy3d { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
@keyframes bfx-camera { 0%,100% { transform: scale(1) translate(0,0); } 33% { transform: scale(1.013) translate(-0.4%,0.25%); } 66% { transform: scale(1.007) translate(0.4%,-0.2%); } }
/* Transitions diaporama entre deux vues (match vedette qui tourne) */
@keyframes bfx-slide-in { 0% { opacity:0; transform: translateX(7%) scale(.965); } 100% { opacity:1; transform:none; } }
@keyframes bfx-slide-up { 0% { opacity:0; transform: translateY(16px) scale(.98); } 100% { opacity:1; transform:none; } }
@keyframes bfx-card-in { 0% { opacity:0; transform: translateY(10px); } 100% { opacity:1; transform:none; } }
@keyframes bfx-sweep { 0% { transform: translateX(-120%); } 100% { transform: translateX(220%); } }
/* Plaque d'honneur du champion : gravure, lumiere et faisceaux */
@keyframes bfx-plaque-in { 0% { opacity:0; transform: perspective(1200px) rotateX(28deg) scale(.72); filter: blur(8px); } 60% { opacity:1; transform: perspective(1200px) rotateX(-5deg) scale(1.04); filter: blur(0); } 100% { opacity:1; transform: perspective(1200px) rotateX(0) scale(1); } }
@keyframes bfx-plaque-shine { 0% { transform: translateX(-140%) skewX(-18deg); } 55%,100% { transform: translateX(260%) skewX(-18deg); } }
@keyframes bfx-plaque-glow { 0%,100% { box-shadow: 0 0 60px rgba(230,184,60,.35), inset 0 2px 0 rgba(255,255,255,.5), inset 0 -3px 10px rgba(0,0,0,.4); } 50% { box-shadow: 0 0 130px rgba(230,184,60,.75), inset 0 2px 0 rgba(255,255,255,.7), inset 0 -3px 10px rgba(0,0,0,.4); } }
@keyframes bfx-engrave { 0% { opacity:0; letter-spacing:.5em; } 100% { opacity:1; letter-spacing:.06em; } }
@keyframes bfx-beam { 0%,100% { opacity:.18; transform: translateX(-50%) rotate(var(--ang,0deg)) scaleY(1); } 50% { opacity:.5; transform: translateX(-50%) rotate(var(--ang,0deg)) scaleY(1.12); } }
@keyframes bfx-star-twinkle { 0%,100% { opacity:.25; transform: scale(.7); } 50% { opacity:1; transform: scale(1.25); } }
`;

// PLAQUE D'HONNEUR du champion : plaque doree gravee au nom de l'equipe,
// faisceaux de lumiere, reflet qui balaye et etoiles scintillantes.
export function ChampionPlaque({
  teamName, logoSeed, color = "#e6b83c", subtitle = "CHAMPION BIBLIQUE", season, light = false,
}: {
  teamName: string; logoSeed?: string; color?: string; subtitle?: string; season?: string; light?: boolean;
}) {
  const GOLD = "#e6b83c";
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(10px,2vw,26px) 0" }}>
      {/* Faisceaux de projecteurs */}
      {!light && [-26, -9, 9, 26].map((ang, i) => (
        <span key={i} aria-hidden style={{
          position: "absolute", top: "-12%", left: "50%", width: "clamp(60px,7vw,120px)", height: "150%",
          background: `linear-gradient(to bottom, ${GOLD}55, transparent 72%)`,
          filter: "blur(22px)", transformOrigin: "top center",
          ["--ang" as string]: `${ang}deg`,
          animation: `bfx-beam ${3.4 + i * 0.45}s ease-in-out infinite`, pointerEvents: "none",
        }} />
      ))}
      {/* Etoiles scintillantes */}
      {!light && Array.from({ length: 14 }).map((_, i) => (
        <span key={`s${i}`} aria-hidden style={{
          position: "absolute", left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`,
          fontSize: 10 + (i % 3) * 5, color: GOLD, opacity: .3,
          animation: `bfx-star-twinkle ${1.8 + (i % 5) * 0.5}s ease-in-out ${i * 0.17}s infinite`, pointerEvents: "none",
        }}>✦</span>
      ))}

      {/* La plaque */}
      <div style={{
        position: "relative", overflow: "hidden", zIndex: 3,
        padding: "clamp(18px,2.6vw,40px) clamp(26px,4vw,68px)",
        borderRadius: 22,
        background: "linear-gradient(160deg,#3a2c07 0%,#7a5c12 18%,#e6b83c 45%,#fff3c4 52%,#e6b83c 60%,#7a5c12 86%,#3a2c07 100%)",
        border: "3px solid rgba(255,240,190,0.75)",
        animation: light ? "bfx-plaque-in .9s cubic-bezier(0.22,1,0.36,1) both" : "bfx-plaque-in .9s cubic-bezier(0.22,1,0.36,1) both, bfx-plaque-glow 2.6s ease-in-out .9s infinite",
      }}>
        {/* Reflet qui balaye la plaque */}
        {!light && <span aria-hidden style={{
          position: "absolute", top: 0, bottom: 0, width: "38%",
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)",
          animation: "bfx-plaque-shine 3.8s ease-in-out 1s infinite", pointerEvents: "none",
        }} />}

        <div style={{ position: "relative", textAlign: "center", color: "#2a1e02" }}>
          <div style={{ fontSize: "clamp(9px,1vw,14px)", fontWeight: 900, letterSpacing: "0.42em", opacity: .72 }}>
            {season ? `SAISON ${season} · ` : ""}{subtitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(10px,1.6vw,24px)", margin: "clamp(6px,1vw,14px) 0" }}>
            {logoSeed && (
              <span style={{
                width: "clamp(42px,5vw,76px)", height: "clamp(42px,5vw,76px)", borderRadius: 16, background: color,
                color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: "clamp(17px,2vw,30px)", boxShadow: "0 8px 26px rgba(0,0,0,0.45)", flexShrink: 0,
              }}>{logoSeed}</span>
            )}
            <span style={{
              fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900,
              fontSize: "clamp(30px,6vw,86px)", lineHeight: 1,
              textShadow: "0 2px 0 rgba(255,255,255,.55), 0 -1px 0 rgba(0,0,0,.35)",
              animation: "bfx-engrave 1.1s ease .5s both",
            }}>{teamName.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: "clamp(16px,2vw,30px)" }}>🏆</div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: "clamp(10px,1.1vw,15px)", fontWeight: 800, letterSpacing: "0.3em", color: `${GOLD}cc`, animation: "bfx-engrave 1.1s ease .9s both" }}>
        KONEKSYON PAM
      </div>
    </div>
  );
}

// Met le contenu À L'ÉCHELLE pour qu'il tienne TOUJOURS dans la hauteur donnée :
// en diffusion (TV / plein écran) rien ne doit être coupé ni demander de scroll.
// On mesure la hauteur réelle du contenu et on applique un simple scale.
export function FitToScreen({ children, padding = 12 }: { children: React.ReactNode; padding?: number }) {
  const outer = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      // On mesure par rapport à la FENÊTRE (et non au parent) : c'est fiable
      // quel que soit le calcul de hauteur des conteneurs flex au-dessus.
      const top = o.getBoundingClientRect().top;
      const avail = Math.min(o.clientHeight || Infinity, window.innerHeight - top) - padding;
      const h = i.scrollHeight;
      // Mesure pas encore fiable (layout non calculé) : on ne touche à rien.
      // Sans ce garde-fou, `avail` valait 0 au premier rendu et l'échelle
      // devenait négative — tout le contenu disparaissait de l'écran.
      if (avail <= 0 || h <= 0) return;
      // On ne grossit jamais le contenu ; on le réduit au besoin, mais JAMAIS
      // sous 68 % : en dessous les textes deviennent illisibles sur un
      // téléviseur. Si ça ne tient toujours pas, c'est qu'il faut retirer un
      // bloc de la page, pas rapetisser davantage.
      // Plancher a 55 % : en dessous c'est illisible, mais mieux vaut un texte
      // un peu plus petit qu'une question coupee en bas de l'ecran.
      const next = Math.max(0.55, Math.min(1, avail / h));
      setScale((prev) => (Math.abs(prev - next) > 0.004 ? next : prev));
    };
    measure();
    // Deux passes differees : les polices et les images arrivent apres le
    // premier rendu et changent la hauteur reelle du contenu.
    const t1 = setTimeout(measure, 120);
    const t2 = setTimeout(measure, 600);
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(i);
    ro.observe(o);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(t1); clearTimeout(t2); cancelAnimationFrame(raf);
    };
  }, [padding]);

  return (
    <div ref={outer} style={{ height: "100%", width: "100%", overflow: "hidden", display: "flex", justifyContent: "center" }}>
      <div ref={inner} style={{ width: "100%", transform: `scale(${scale})`, transformOrigin: "top center", transition: "transform .45s cubic-bezier(0.22,1,0.36,1)" }}>
        {children}
      </div>
    </div>
  );
}

// Nombre qui monte en animation vers sa valeur.
export function AnimatedNumber({ value, dur = 900 }: { value: number; dur?: number }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    startRef.current = 0;
    const step = (t: number) => {
      if (!startRef.current) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, dur]);
  return <>{display.toLocaleString("fr-FR")}</>;
}

// Particules lumineuses qui montent lentement (fond vivant).
const PARTS = Array.from({ length: 22 }, (_, i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453; const r = s - Math.floor(s);
  const s2 = Math.sin(i * 78.233) * 12543.14; const r2 = s2 - Math.floor(s2);
  return { left: `${Math.round(r * 100)}%`, size: 2 + Math.round(r2 * 4), dur: `${(10 + r2 * 10).toFixed(1)}s`, delay: `${(r * 10).toFixed(1)}s`, o: (0.2 + r2 * 0.4).toFixed(2), gold: i % 3 !== 0 };
});
export function LiveParticles({ accent = "#e6b83c" }: { accent?: string }) {
  return (
    <div className="pointer-events-none" style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 1 }} aria-hidden>
      {PARTS.map((p, i) => (
        <span key={i} style={{ position: "absolute", bottom: -8, left: p.left, width: p.size, height: p.size, borderRadius: "50%", background: p.gold ? accent : "#93c5fd", boxShadow: `0 0 6px ${p.gold ? accent : "#93c5fd"}`, "--po": p.o, opacity: 0, animation: `bfx-particle ${p.dur} ${p.delay} linear infinite` } as React.CSSProperties} />
      ))}
    </div>
  );
}

// Réactions flottantes (❤️🔥👏…) façon Facebook Live.
const EMOJIS = ["❤️", "🔥", "👏", "🙌", "📖", "🏆", "⭐", "🙏"];
export function FloatingReactions() {
  const [items, setItems] = useState<{ id: number; e: string; left: number; dur: number }[]>([]);
  const idRef = useRef(0);
  useEffect(() => {
    const iv = setInterval(() => {
      const id = ++idRef.current;
      const it = { id, e: EMOJIS[id % EMOJIS.length], left: 4 + Math.random() * 16, dur: 4 + Math.random() * 3 };
      setItems(x => [...x.slice(-14), it]);
      window.setTimeout(() => setItems(x => x.filter(i => i.id !== id)), it.dur * 1000);
    }, 1100);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="pointer-events-none" style={{ position: "fixed", right: "clamp(10px,2vw,40px)", bottom: "clamp(60px,8vw,110px)", width: 90, height: "60vh", zIndex: 5 }} aria-hidden>
      {items.map(it => (
        <span key={it.id} style={{ position: "absolute", bottom: 0, left: `${it.left}px`, fontSize: 30, animation: `bfx-float-up ${it.dur}s ease-out forwards`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>{it.e}</span>
      ))}
    </div>
  );
}

// Confettis : se déclenchent quand `fireKey` change (nouvel événement fort).
const CONF = Array.from({ length: 60 }, (_, i) => {
  const s = Math.sin(i * 4.17) * 9271.7; const r = s - Math.floor(s);
  const s2 = Math.sin(i * 9.71) * 3571.3; const r2 = s2 - Math.floor(s2);
  return { left: `${Math.round(r * 100)}%`, cx: `${Math.round((r2 - 0.5) * 240)}px`, cr: `${Math.round(r * 720)}deg`, dur: `${(2.2 + r2 * 1.8).toFixed(2)}s`, delay: `${(r2 * 0.4).toFixed(2)}s`, color: ["#e6b83c", "#fcd34d", "#22c55e", "#3b82f6", "#ef4444", "#fff"][i % 6], size: 7 + Math.round(r * 8) };
});
// Fond de STADE immersif : foule floue, écrans géants, faisceaux, drapeaux, halos.
const STAD_FLAGS = ["🇭🇹", "🇺🇸", "🇨🇦", "🇫🇷", "🇩🇴", "🇧🇷", "🇨🇩", "🇨🇮", "🇭🇹", "🇬🇧"];
export function StadiumBackground({ accent = "#e6b83c" }: { accent?: string }) {
  return (
    <div className="pointer-events-none" style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }} aria-hidden>
      {/* dégradé de profondeur + terrain */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% -10%, #1c2f5e 0%, #0d1a3a 45%, #060c1e 100%)" }} />
      {/* faisceaux de projecteurs depuis le haut */}
      <div style={{ position: "absolute", top: "-30%", left: "18%", width: "22vw", height: "150%", background: `linear-gradient(to bottom, ${accent}26, transparent 65%)`, filter: "blur(26px)", transformOrigin: "top center", animation: "bfx-spot 17s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "-30%", left: "50%", width: "18vw", height: "150%", background: "linear-gradient(to bottom, rgba(255,255,255,0.14), transparent 62%)", filter: "blur(26px)", transformOrigin: "top center", animation: "bfx-spot2 21s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "-30%", left: "80%", width: "22vw", height: "150%", background: `linear-gradient(to bottom, rgba(96,165,250,0.2), transparent 65%)`, filter: "blur(26px)", transformOrigin: "top center", animation: "bfx-spot 23s ease-in-out infinite" }} />
      {/* écrans géants latéraux */}
      {[10, 80].map((x, i) => (
        <div key={i} style={{ position: "absolute", top: "12%", left: `${x}%`, transform: "translateX(-50%)", width: "clamp(70px,9vw,150px)", height: "clamp(44px,5.6vw,92px)", borderRadius: 8, background: `linear-gradient(135deg, ${accent}33, rgba(59,130,246,0.25))`, border: `1px solid ${accent}55`, boxShadow: `0 0 30px ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "clamp(10px,1.1vw,16px)", opacity: 0.7, animation: "bfx-glow 3.5s ease-in-out infinite" }}>KP 🏆</div>
      ))}
      {/* foule floue en bas */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "26%", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1.2px, transparent 1.3px)", backgroundSize: "13px 13px", opacity: 0.5, maskImage: "linear-gradient(to top, #000 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, #000 0%, transparent 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to top, rgba(6,12,30,0.9), transparent)" }} />
      {/* drapeaux qui flottent (ambiance mondiale) */}
      {STAD_FLAGS.map((f, i) => {
        const s = Math.sin(i * 7.1) * 999; const r = s - Math.floor(s);
        return <span key={i} style={{ position: "absolute", bottom: `${6 + (i % 3) * 5}%`, left: `${6 + i * 9}%`, fontSize: "clamp(16px,1.8vw,26px)", opacity: 0.5, animation: `bfx-bob ${(3 + r * 2).toFixed(1)}s ${(r * 2).toFixed(1)}s ease-in-out infinite`, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))" }}>{f}</span>;
      })}
    </div>
  );
}

// Projecteurs de stade qui balaient le fond.
export function Spotlights({ accent = "#e6b83c" }: { accent?: string }) {
  return (
    <div className="pointer-events-none" style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }} aria-hidden>
      <div style={{ position: "absolute", top: "-40%", left: "28%", width: "26vw", height: "160%", background: `linear-gradient(to bottom, ${accent}22, transparent 70%)`, filter: "blur(30px)", transformOrigin: "top center", animation: "bfx-spot 16s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "-40%", left: "72%", width: "22vw", height: "160%", background: "linear-gradient(to bottom, rgba(96,165,250,0.18), transparent 70%)", filter: "blur(30px)", transformOrigin: "top center", animation: "bfx-spot2 20s ease-in-out infinite" }} />
    </div>
  );
}

// Présentateur virtuel (avatar) en bas à droite, avec bulle d'annonce.
export function PresenterAvatar({ line, urgent = false }: { line: string; urgent?: boolean }) {
  return (
    <div className="pointer-events-none" style={{ position: "fixed", right: "clamp(12px,2vw,32px)", bottom: "clamp(74px,9vw,116px)", zIndex: 12, display: "flex", alignItems: "flex-end", gap: 10, maxWidth: "min(92vw,460px)" }}>
      {line && (
        <div key={line} style={{ background: "rgba(2,7,23,0.86)", border: `1px solid ${urgent ? "#f87171" : "#e6b83c"}66`, borderRadius: "16px 16px 4px 16px", padding: "10px 16px", color: "#fff", fontSize: "clamp(12px,1.3vw,17px)", fontWeight: 700, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", animation: "bfx-bubble .4s ease both", textAlign: "right" }}>{line}</div>
      )}
      <div style={{ position: "relative", flexShrink: 0, animation: "bfx-bob 3s ease-in-out infinite" }}>
        <div style={{ width: "clamp(56px,6vw,84px)", height: "clamp(56px,6vw,84px)", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #1e3a8a, #0b1220)", border: "2px solid #e6b83c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(28px,3vw,42px)", boxShadow: "0 8px 30px rgba(230,184,60,0.4)", ...(urgent ? { animation: "bfx-ring-pulse 1s ease-out infinite" } : {}) }}>🎙️</div>
        <div style={{ position: "absolute", bottom: -4, right: -4, background: "#22c55e", border: "2px solid #05070f", borderRadius: 999, padding: "1px 6px", fontSize: 8, fontWeight: 900, color: "#04140a" }}>LIVE</div>
      </div>
    </div>
  );
}

// Écran publicitaire KONEKSYON PAM (apparaît périodiquement).
export function AdBreak() {
  return (
    <div className="pointer-events-none" style={{ position: "fixed", inset: 0, zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2,7,23,0.55)", backdropFilter: "blur(4px)" }} aria-hidden>
      <div style={{ textAlign: "center", animation: "bfx-ad-in 2.4s ease both", padding: 24 }}>
        <div style={{ fontSize: "clamp(50px,9vw,120px)" }}>🏆</div>
        <div style={{ fontSize: "clamp(30px,6vw,72px)", fontWeight: 900, background: "linear-gradient(135deg,#fff,#e6b83c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.02em" }}>KONEKSYON PAM</div>
        <div style={{ fontSize: "clamp(14px,2vw,26px)", color: "rgba(255,255,255,0.85)", fontWeight: 700, marginTop: 8 }}>La plus grande plateforme de championnat biblique en ligne</div>
        <div style={{ display: "inline-block", marginTop: 18, padding: "10px 26px", borderRadius: 999, background: "linear-gradient(135deg,#e6b83c,#a97d18)", color: "#1a1203", fontWeight: 900, fontSize: "clamp(14px,1.8vw,22px)" }}>🌐 KONEKSYONPAM.COM</div>
      </div>
    </div>
  );
}

export function ConfettiBurst({ fireKey }: { fireKey: string | number }) {
  if (!fireKey) return null;
  return (
    <div key={fireKey} className="pointer-events-none" style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 40 }} aria-hidden>
      {CONF.map((c, i) => (
        <span key={i} style={{ position: "absolute", top: -20, left: c.left, width: c.size, height: c.size * 0.6, background: c.color, borderRadius: 2, "--cx": c.cx, "--cr": c.cr, animation: `bfx-confetti ${c.dur} ${c.delay} ease-in forwards` } as React.CSSProperties} />
      ))}
    </div>
  );
}
