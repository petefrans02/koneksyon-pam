"use client";
/** Design System — Carte premium unifiée. */
import Link from "next/link";
import { CSSProperties, ReactNode } from "react";
import { color, radius, shadow, ease } from "@/lib/design";

export interface CardProps {
  children: ReactNode;
  href?: string;
  hover?: boolean;
  accent?: string;      // couleur de la barre supérieure (optionnelle)
  padding?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Card({
  children, href, hover = true, accent, padding = 22, className, style,
}: CardProps) {
  const base: CSSProperties = {
    display: "block", background: color.white, border: `1px solid ${color.border}`,
    borderRadius: radius.xl, overflow: "hidden", textDecoration: "none", color: "inherit",
    boxShadow: shadow.sm, transition: `transform .35s ${ease}, box-shadow .3s ease, border-color .3s ease`,
    ...style,
  };

  const content = (
    <>
      {accent && <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />}
      <div style={{ padding }}>{children}</div>
    </>
  );

  const hoverClass = hover ? "kp-card-hover" : "";

  if (href) {
    return (
      <Link href={href} className={`${hoverClass} ${className ?? ""}`} style={base}>
        {content}
      </Link>
    );
  }
  return (
    <div className={`${hoverClass} ${className ?? ""}`} style={base}>
      {content}
    </div>
  );
}
