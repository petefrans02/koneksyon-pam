import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "KONEKSYON PAM — Connectés par la foi";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: "#060d1e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gold radial glow — top center */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(197,168,79,0.20) 0%, rgba(6,13,30,0) 65%)",
          top: -350,
          left: 150,
          display: "flex",
        }}
      />

      {/* Blue radial glow — bottom */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(30,64,175,0.25) 0%, rgba(6,13,30,0) 65%)",
          bottom: -300,
          right: 100,
          display: "flex",
        }}
      />

      {/* Cross watermark — right side */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          opacity: 0.05,
        }}
      >
        <div style={{ position: "relative", width: 200, height: 500, display: "flex" }}>
          {/* Vertical bar */}
          <div style={{
            position: "absolute",
            width: 48,
            height: 500,
            background: "white",
            borderRadius: 10,
            left: 76,
            top: 0,
            display: "flex",
          }} />
          {/* Horizontal bar */}
          <div style={{
            position: "absolute",
            width: 200,
            height: 48,
            background: "white",
            borderRadius: 10,
            left: 0,
            top: 100,
            display: "flex",
          }} />
        </div>
      </div>

      {/* Top gold accent line */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 5,
        background: "linear-gradient(90deg, #060d1e 5%, #c5a84f 30%, #f0b429 50%, #c5a84f 70%, #060d1e 95%)",
        display: "flex",
      }} />

      {/* KP logo circle */}
      <div
        style={{
          width: 112,
          height: 112,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #b8912a, #f0b429)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 26,
          boxShadow: "0 0 80px rgba(197,168,79,0.45)",
          border: "3px solid rgba(255,255,255,0.12)",
        }}
      >
        <span style={{ color: "#060d1e", fontSize: 48, fontWeight: 900, display: "flex", letterSpacing: -1 }}>KP</span>
      </div>

      {/* Main title */}
      <div style={{
        fontSize: 82,
        fontWeight: 900,
        color: "white",
        letterSpacing: -2,
        marginBottom: 8,
        display: "flex",
      }}>
        KONEKSYON PAM
      </div>

      {/* Platform tagline */}
      <div style={{
        fontSize: 15,
        color: "rgba(255,255,255,0.38)",
        letterSpacing: 9,
        marginBottom: 38,
        display: "flex",
      }}>
        CONNECTÉS PAR LA FOI
      </div>

      {/* Gold divider with dots */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div style={{ width: 120, height: 1, background: "rgba(197,168,79,0.35)", display: "flex" }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c5a84f", display: "flex" }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f0b429", display: "flex" }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c5a84f", display: "flex" }} />
        <div style={{ width: 120, height: 1, background: "rgba(197,168,79,0.35)", display: "flex" }} />
      </div>

      {/* Slogan */}
      <div style={{
        fontSize: 27,
        fontWeight: 800,
        color: "#c5a84f",
        letterSpacing: 4,
        display: "flex",
        marginBottom: 36,
      }}>
        UNE MISSION  •  UN DIEU  •  UNE VISION
      </div>

      {/* Feature pills */}
      <div style={{ display: "flex", gap: 10 }}>
        {["📖 Bible", "🙏 Prières", "🏆 Concours", "✨ Témoignages", "🌍 Communauté"].map((tag) => (
          <div key={tag} style={{
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100,
            padding: "7px 18px",
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            display: "flex",
          }}>
            {tag}
          </div>
        ))}
      </div>

      {/* URL bottom-right */}
      <div style={{
        position: "absolute",
        bottom: 26,
        right: 44,
        fontSize: 14,
        color: "rgba(255,255,255,0.18)",
        letterSpacing: 3,
        display: "flex",
      }}>
        koneksyonpam.com
      </div>

      {/* Bottom gold accent line */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 5,
        background: "linear-gradient(90deg, #060d1e 5%, #c5a84f 30%, #f0b429 50%, #c5a84f 70%, #060d1e 95%)",
        display: "flex",
      }} />
    </div>,
    { ...size }
  );
}
