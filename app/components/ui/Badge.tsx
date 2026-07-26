"use client";
/** Design System — Badge / pastille premium. */
import { CSSProperties, ReactNode } from "react";
import { color, radius } from "@/lib/design";
import Icon, { IconName } from "@/app/components/Icon";

type Tone = "gold" | "cyan" | "navy" | "success" | "danger" | "neutral";

const TONES: Record<Tone, { bg: string; fg: string; bd: string }> = {
  gold:    { bg: "rgba(200,150,15,0.10)", fg: "#c8960f", bd: "rgba(200,150,15,0.25)" },
  cyan:    { bg: "rgba(0,170,200,0.10)",  fg: "#00aac8", bd: "rgba(0,170,200,0.25)" },
  navy:    { bg: "rgba(26,53,104,0.08)",  fg: color.navy, bd: "rgba(26,53,104,0.18)" },
  success: { bg: "rgba(22,163,74,0.10)",  fg: "#16a34a", bd: "rgba(22,163,74,0.25)" },
  danger:  { bg: "rgba(220,38,38,0.10)",  fg: "#dc2626", bd: "rgba(220,38,38,0.25)" },
  neutral: { bg: "rgba(0,0,0,0.05)",      fg: "#6b7280", bd: "rgba(0,0,0,0.10)" },
};

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  icon?: IconName;
  uppercase?: boolean;
  style?: CSSProperties;
}

export default function Badge({ children, tone = "gold", icon, uppercase, style }: BadgeProps) {
  const t = TONES[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      fontSize: 10, fontWeight: 900, padding: "4px 12px", borderRadius: radius.pill,
      letterSpacing: uppercase ? "0.18em" : "0.02em",
      textTransform: uppercase ? "uppercase" : "none",
      ...style,
    }}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}
