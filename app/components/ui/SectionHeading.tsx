"use client";
/** Design System — En-tête de section (eyebrow + titre Playfair + sous-titre). */
import { CSSProperties, ReactNode } from "react";
import { color, font } from "@/lib/design";

export interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  onDark?: boolean;
  style?: CSSProperties;
}

export default function SectionHeading({
  eyebrow, title, subtitle, align = "center", onDark = false, style,
}: SectionHeadingProps) {
  const titleColor = onDark ? "#fff" : color.navy;
  const subColor = onDark ? "rgba(255,255,255,0.55)" : color.textMuted;
  const textAlign = align;

  return (
    <div style={{ textAlign, marginBottom: 32, ...style }}>
      {eyebrow && (
        <p style={{
          fontSize: 11, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase",
          color: color.cyan, marginBottom: 10,
        }}>{eyebrow}</p>
      )}
      <div style={{
        width: 48, height: 3, background: "linear-gradient(90deg,#c8960f,#f0c840)",
        borderRadius: 999, margin: align === "center" ? "0 auto 14px" : "0 0 14px",
      }} />
      <h2 style={{
        fontFamily: font.display, fontWeight: 900, color: titleColor,
        fontSize: "clamp(1.4rem,3vw,2rem)", lineHeight: 1.15, marginBottom: subtitle ? 8 : 0,
      }}>{title}</h2>
      {subtitle && (
        <p style={{ color: subColor, fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 560, margin: align === "center" ? "0 auto" : 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
