"use client";
/** Design System — Bouton premium unifié. */
import Link from "next/link";
import { CSSProperties, ReactNode } from "react";
import { color, gradient, radius, shadow, ease } from "@/lib/design";
import Icon, { IconName } from "@/app/components/Icon";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  full?: boolean;
  onDark?: boolean;
  className?: string;
  style?: CSSProperties;
}

const SIZES: Record<Size, { padding: string; font: number; icon: number; gap: number }> = {
  sm: { padding: "8px 16px",  font: 13, icon: 15, gap: 6 },
  md: { padding: "12px 24px", font: 14, icon: 17, gap: 8 },
  lg: { padding: "15px 32px", font: 15, icon: 19, gap: 10 },
};

function variantStyle(v: Variant, onDark: boolean): CSSProperties {
  switch (v) {
    case "primary":   return { background: gradient.gold, color: color.navyDark, boxShadow: shadow.gold, border: "none" };
    case "secondary": return { background: color.navy, color: "#fff", border: "none" };
    case "outline":   return onDark
      ? { background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.30)" }
      : { background: "transparent", color: color.navy, border: `1.5px solid ${color.navy}` };
    case "ghost":     return onDark
      ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.14)" }
      : { background: "rgba(255,255,255,0.06)", color: color.navy, border: "1px solid rgba(26,53,104,0.12)" };
    case "danger":    return { background: color.danger, color: "#fff", border: "none" };
  }
}

export default function Button({
  children, variant = "primary", size = "md", href, onClick, type = "button",
  disabled, icon, iconRight, full, onDark = false, className, style,
}: ButtonProps) {
  const s = SIZES[size];
  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: s.gap,
    padding: s.padding, fontSize: s.font, fontWeight: 800, borderRadius: radius.pill,
    textDecoration: "none", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1, transition: `transform .2s ${ease}, box-shadow .2s ${ease}, filter .2s`,
    width: full ? "100%" : undefined, whiteSpace: "nowrap",
    ...variantStyle(variant, onDark), ...style,
  };

  const inner = (
    <>
      {icon && <Icon name={icon} size={s.icon} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.icon} />}
    </>
  );

  if (href && !disabled) {
    return <Link href={href} className={className} style={base}>{inner}</Link>;
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className} style={base}>
      {inner}
    </button>
  );
}
