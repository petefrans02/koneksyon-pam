import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const size        = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: "linear-gradient(135deg, #0a1628, #0f2044)",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(197,168,79,0.3)",
      }}
    >
      <span style={{
        fontSize: 14,
        fontWeight: 900,
        color: "#c5a84f",
        display: "flex",
        letterSpacing: -0.5,
      }}>
        KP
      </span>
    </div>,
    { ...size }
  );
}
