"use client";

/**
 * Graphique en chandeliers, en SVG pur.
 *
 * Pourquoi pas une librairie de charting : le composant doit pouvoir masquer
 * une portion du futur, mettre une bougie en évidence, puis révéler la suite
 * avec une animation. Les librairies grand public rendent ça pénible, et elles
 * pèsent lourd pour un besoin qui tient en une centaine de lignes de SVG.
 *
 * Le rendu est déterministe et sans état : les mêmes props donnent le même
 * dessin, ce qui va de pair avec des exercices reproductibles par graine.
 */

import { useId, useMemo } from "react";
import { Candle } from "@/lib/trading/candles";
import { color } from "@/lib/design";

export interface CandleChartProps {
  /** Bougies affichées en clair. */
  candles: Candle[];
  /** Bougies du futur — réservent la place mais ne sont dessinées que si `reveal`. */
  future?: Candle[];
  reveal?: boolean;
  /** Index (dans `candles`) de la bougie à mettre en évidence. */
  highlight?: number;
  /** Nombre de bougies que couvre la figure mise en évidence. */
  highlightSpan?: number;
  height?: number;
  /** Affiche l'axe des prix à droite. */
  showAxis?: boolean;
}

const UP = "#16a34a";
const DOWN = "#dc2626";
const PAD_TOP = 14;
const PAD_BOTTOM = 14;

export default function CandleChart({
  candles,
  future = [],
  reveal = false,
  highlight,
  highlightSpan = 1,
  height = 340,
  showAxis = true,
}: CandleChartProps) {
  const uid = useId().replace(/:/g, "");
  const axisW = showAxis ? 52 : 6;

  const model = useMemo(() => {
    // On réserve toujours la place du futur, révélé ou non : sinon l'échelle
    // change au moment de la révélation et l'élève voit le graphique « sauter »,
    // ce qui donne involontairement un indice sur l'amplitude à venir.
    const all = [...candles, ...future];
    const lows = all.map((k) => k.l);
    const highs = all.map((k) => k.h);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const span = max - min || 1;
    // Marge de 6% en haut et en bas pour que rien ne touche les bords.
    const lo = min - span * 0.06;
    const hi = max + span * 0.06;
    const total = all.length;
    // Largeur logique : chaque bougie occupe 10 unités, mèche centrée.
    const step = 10;
    const width = total * step;
    const y = (p: number) => PAD_TOP + ((hi - p) / (hi - lo)) * (height - PAD_TOP - PAD_BOTTOM);
    return { all, lo, hi, step, width, y };
  }, [candles, future, height]);

  const { all, lo, hi, step, width, y } = model;
  const bodyW = step * 0.62;

  // Quatre repères de prix, arrondis proprement.
  const ticks = useMemo(() => {
    const n = 4;
    return Array.from({ length: n + 1 }, (_, i) => lo + ((hi - lo) * i) / n);
  }, [lo, hi]);

  const hiddenFrom = candles.length;
  const hlStart = highlight === undefined ? -1 : highlight - (highlightSpan - 1);

  return (
    <div style={{ width: "100%", overflow: "hidden", borderRadius: 12 }}>
      <svg
        viewBox={`0 0 ${width + axisW} ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height, display: "block", background: color.navyDeep }}
        role="img"
        aria-label={`Graphique de ${candles.length} bougies`}
      >
        <defs>
          <linearGradient id={`hl-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.goldLight} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color.goldLight} stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Grille horizontale */}
        {ticks.map((p, i) => (
          <line
            key={`g${i}`}
            x1={0}
            x2={width}
            y1={y(p)}
            y2={y(p)}
            stroke="#ffffff"
            strokeOpacity={0.055}
            strokeWidth={1}
          />
        ))}

        {/* Bandeau doré sur la figure à observer */}
        {highlight !== undefined && (
          <rect
            x={hlStart * step}
            y={PAD_TOP * 0.4}
            width={highlightSpan * step}
            height={height - PAD_TOP * 0.4 - 4}
            fill={`url(#hl-${uid})`}
            stroke={color.goldLight}
            strokeOpacity={0.5}
            strokeWidth={1}
            rx={3}
          />
        )}

        {/* Zone du futur : voilée tant qu'on n'a pas répondu */}
        {future.length > 0 && !reveal && (
          <>
            <rect
              x={hiddenFrom * step}
              y={0}
              width={future.length * step}
              height={height}
              fill={color.navyDark}
              fillOpacity={0.92}
            />
            <line
              x1={hiddenFrom * step}
              x2={hiddenFrom * step}
              y1={0}
              y2={height}
              stroke={color.cyanGlow}
              strokeOpacity={0.55}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
          </>
        )}

        {/* Les bougies */}
        {all.map((k, i) => {
          const futur = i >= hiddenFrom;
          if (futur && !reveal) return null;
          const up = k.c >= k.o;
          const teinte = up ? UP : DOWN;
          const cx = i * step + step / 2;
          const yO = y(k.o);
          const yC = y(k.c);
          const top = Math.min(yO, yC);
          const h = Math.max(Math.abs(yC - yO), 1); // une bougie plate reste visible
          const dansFigure = highlight !== undefined && i >= hlStart && i <= highlight;
          return (
            <g key={i} opacity={futur ? 0.95 : dansFigure || highlight === undefined ? 1 : 0.62}>
              <line
                x1={cx}
                x2={cx}
                y1={y(k.h)}
                y2={y(k.l)}
                stroke={teinte}
                strokeWidth={1.4}
              />
              <rect
                x={cx - bodyW / 2}
                y={top}
                width={bodyW}
                height={h}
                fill={teinte}
                stroke={dansFigure ? color.goldLight : teinte}
                strokeWidth={dansFigure ? 1.2 : 0.6}
                rx={0.8}
              />
            </g>
          );
        })}

        {/* Axe des prix */}
        {showAxis && (
          <g>
            <rect x={width} y={0} width={axisW} height={height} fill={color.navyDeep} />
            {ticks.map((p, i) => (
              <text
                key={`t${i}`}
                x={width + 6}
                y={y(p) + 3.2}
                fill={color.textFaint}
                fontSize={8}
                fontFamily="ui-monospace, monospace"
              >
                {p.toFixed(p < 20 ? 2 : 1)}
              </text>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
