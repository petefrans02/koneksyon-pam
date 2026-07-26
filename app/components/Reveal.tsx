"use client";
/**
 * Design System — apparition élégante au scroll (Framer Motion).
 * Fade + léger translate. `whileInView` + `once` → discret, jamais excessif.
 * N'utilise PAS de transform persistant après l'animation (évite de casser
 * les enfants `position: fixed`).
 */
import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 24 }, down: { y: -24 }, left: { x: 24 }, right: { x: -24 }, none: {},
};

export interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Reveal({ children, direction = "up", delay = 0, className, style }: RevealProps) {
  const off = OFFSET[direction];
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, ...off }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
