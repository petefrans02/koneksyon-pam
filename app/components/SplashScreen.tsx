"use client";
import { useEffect, useState } from "react";
import Icon from "@/app/components/Icon";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"), 1900);
    const t3 = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const glowIntensity = phase === "hold" ? 50 : 20;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #030d1f 0%, #020717 60%, #0a0f1f 100%)",
        opacity: phase === "out" ? 0 : 1,
        transition: phase === "out" ? "opacity 0.6s ease" : "opacity 0.4s ease",
        pointerEvents: "none",
      }}>
      {/* Radial background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(197,168,79,${phase === "hold" ? 0.18 : 0.06}) 0%, transparent 70%)`,
        transition: "background 1.2s ease",
      }} />

      {/* Outer ring pulse */}
      <div style={{
        position: "absolute",
        width: 240, height: 240,
        borderRadius: "50%",
        border: `1px solid rgba(197,168,79,${phase === "hold" ? 0.25 : 0.05})`,
        boxShadow: `0 0 ${glowIntensity}px rgba(197,168,79,0.15)`,
        transition: "border-color 1.2s ease, box-shadow 1.2s ease",
      }} />
      <div style={{
        position: "absolute",
        width: 180, height: 180,
        borderRadius: "50%",
        border: `1px solid rgba(197,168,79,${phase === "hold" ? 0.15 : 0.03})`,
        transition: "border-color 1.2s ease",
      }} />

      {/* Logo + text */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        opacity: phase === "in" ? 0 : 1,
        transform: phase === "in" ? "scale(0.75) translateY(10px)" : "scale(1) translateY(0)",
        transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative", zIndex: 1,
      }}>
        {/* Logo image with glow */}
        <div style={{
          width: 90, height: 90,
          borderRadius: "50%",
          background: "rgba(197,168,79,0.08)",
          border: "1px solid rgba(197,168,79,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 ${phase === "hold" ? 40 : 16}px rgba(197,168,79,0.4), 0 0 ${phase === "hold" ? 80 : 30}px rgba(197,168,79,0.15)`,
          transition: "box-shadow 1.2s ease",
          animation: "kp-splash-logo 4s ease-in-out infinite",
          position: "relative",
        }}>
          <img
            src="/logo-kpf.png"
            alt="KONEKSYON PAM"
            style={{
              width: 58, height: 58, objectFit: "contain",
              filter: `drop-shadow(0 0 ${phase === "hold" ? 16 : 6}px rgba(197,168,79,0.9))`,
              transition: "filter 1.2s ease",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const fallback = document.getElementById("kp-cross-fallback");
              if (fallback) fallback.style.display = "block";
            }}
          />
          <span
            id="kp-cross-fallback"
            style={{
              position: "absolute", color: "#c5a84f",
              filter: `drop-shadow(0 0 ${phase === "hold" ? 16 : 6}px rgba(197,168,79,0.9))`,
              transition: "filter 1.2s ease",
              display: "none",
            }}>
            <Icon name="croix" size={40} />
          </span>
        </div>

        {/* Text */}
        <div style={{ textAlign: "center" }}>
          <p style={{
            color: "#c5a84f", fontWeight: 900, fontSize: "1.3rem",
            letterSpacing: "0.28em", textTransform: "uppercase",
            textShadow: `0 0 ${phase === "hold" ? 20 : 8}px rgba(197,168,79,0.6)`,
            transition: "text-shadow 1.2s ease",
            fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
          }}>
            KONEKSYON PAM
          </p>
          <p style={{
            color: "rgba(255,255,255,0.3)", fontSize: "0.65rem",
            letterSpacing: "0.35em", marginTop: 6, textTransform: "uppercase",
            fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
          }}>
            CONNECTÉS PAR LA FOI
          </p>
        </div>
      </div>

      {/* Bottom shimmer line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(197,168,79,0.4), transparent)",
        opacity: phase === "hold" ? 1 : 0,
        transition: "opacity 1s ease",
      }} />

      <style>{`
        @keyframes kp-splash-logo {
          0%,100% { transform: rotate(-6deg) scale(1); }
          50% { transform: rotate(6deg) scale(1.04); }
        }
      `}</style>
    </div>
  );
}
