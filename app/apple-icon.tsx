import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const size        = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "linear-gradient(145deg, #0a1628 0%, #0f2044 60%, #0a1628 100%)",
        borderRadius: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      {/* Gold circle */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #b8912a, #f0b429)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
      }}>
        <span style={{ color: "#060d1e", fontSize: 34, fontWeight: 900, display: "flex", letterSpacing: -1 }}>KP</span>
      </div>

      {/* Gold line */}
      <div style={{
        width: 50,
        height: 2,
        background: "rgba(197,168,79,0.5)",
        borderRadius: 2,
        display: "flex",
      }} />
    </div>,
    { ...size }
  );
}
