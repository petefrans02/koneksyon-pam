"use client";

/**
 * Schémas des leçons — Niveau 2.
 *
 * Une leçon sur les chandeliers sans image n'enseigne rien. Ces composants
 * dessinent en SVG ce que le texte décrit : l'anatomie d'une bougie, la
 * différence entre finir en force ou non, et la galerie des figures.
 *
 * Les bougies viennent de `examples.ts`, dont chaque entrée est vérifiée par
 * les tests comme étant une véritable instance de sa figure. Autrement dit :
 * ce que l'élève voit dans la leçon est exactement ce que le détecteur
 * reconnaît dans les exercices. Illustrer une forme et en détecter une autre
 * serait le meilleur moyen de le perdre.
 */

import { Candle, PATTERN_BY_KEY, geometry } from "@/lib/trading/candles";
import {
  ANATOMY,
  FORCE_VS_FAIBLESSE,
  GALLERY_COMBINEES,
  GALLERY_UNE_BOUGIE,
  PATTERN_EXAMPLES,
} from "@/lib/trading/examples";
import { color } from "@/lib/design";

const VERT = "#16a34a";
const ROUGE = "#dc2626";

/* ------------------------------------------------------------------ base --- */

/**
 * Dessine une petite série de bougies. Sans axe, sans grille : c'est un schéma,
 * pas un graphique. Les bougies hors de `highlightFrom`..`highlightTo` sont
 * atténuées pour que l'œil aille droit à la figure.
 */
function MiniCandles({
  candles,
  highlightFrom,
  highlightTo,
  height = 130,
  step = 16,
}: {
  candles: Candle[];
  highlightFrom?: number;
  highlightTo?: number;
  height?: number;
  step?: number;
}) {
  const lows = candles.map((k) => k.l);
  const highs = candles.map((k) => k.h);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const span = max - min || 1;
  const lo = min - span * 0.1;
  const hi = max + span * 0.1;
  const width = candles.length * step;
  const y = (p: number) => 6 + ((hi - p) / (hi - lo)) * (height - 12);
  const bodyW = step * 0.58;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", maxWidth: width * 1.6, height: "auto", display: "block" }}
      role="img"
      aria-label={`Schéma de ${candles.length} bougies`}
    >
      {candles.map((k, i) => {
        const up = k.c >= k.o;
        const teinte = up ? VERT : ROUGE;
        const dedans =
          highlightFrom === undefined ||
          (i >= highlightFrom && i <= (highlightTo ?? highlightFrom));
        const cx = i * step + step / 2;
        const top = Math.min(y(k.o), y(k.c));
        const h = Math.max(Math.abs(y(k.c) - y(k.o)), 1.5);
        return (
          <g key={i} opacity={dedans ? 1 : 0.28}>
            <line x1={cx} x2={cx} y1={y(k.h)} y2={y(k.l)} stroke={teinte} strokeWidth={1.6} />
            <rect
              x={cx - bodyW / 2}
              y={top}
              width={bodyW}
              height={h}
              fill={teinte}
              rx={1}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------- anatomie --- */

/**
 * Un repère du schéma d'anatomie : trait pointillé vers la droite, nom et
 * valeur. Défini au niveau module et non dans le rendu — un composant créé
 * pendant le rendu change d'identité à chaque passage, donc se remonte.
 */
function Repere({ x, py, texte, valeur }: { x: number; py: number; texte: string; valeur: number }) {
  return (
    <>
      <line x1={x} x2={x + 72} y1={py} y2={py} stroke={color.textFaint} strokeWidth={1} strokeDasharray="3 2" />
      <text x={x + 78} y={py + 4} fontSize={12} fill={color.textBody} fontWeight={600}>
        {texte}
      </text>
      <text x={x + 78} y={py + 17} fontSize={11} fill={color.textFaint} fontFamily="ui-monospace, monospace">
        {valeur}
      </text>
    </>
  );
}

/**
 * Le schéma d'anatomie : une bougie unique, chaque partie nommée.
 *
 * C'est le seul schéma entièrement annoté du cours. Il mérite ce traitement :
 * tout le reste du Niveau 2 suppose qu'on sait où sont l'ouverture, la clôture
 * et les deux mèches.
 */
export function AnatomyDiagram() {
  const k = ANATOMY;
  const g = geometry(k);
  const H = 260;
  const lo = k.l - 2;
  const hi = k.h + 2;
  const y = (p: number) => 16 + ((hi - p) / (hi - lo)) * (H - 32);
  const cx = 150;
  const bodyW = 46;
  const bodyTop = y(Math.max(k.o, k.c));
  const bodyBottom = y(Math.min(k.o, k.c));

  return (
    <svg viewBox={`0 0 400 ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img"
      aria-label="Anatomie d'une bougie : ouverture, haut, bas, clôture, corps et mèches">
      {/* La bougie */}
      <line x1={cx} x2={cx} y1={y(k.h)} y2={bodyTop} stroke={VERT} strokeWidth={2.4} />
      <line x1={cx} x2={cx} y1={bodyBottom} y2={y(k.l)} stroke={VERT} strokeWidth={2.4} />
      <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyBottom - bodyTop} fill={VERT} rx={2} />

      {/* Repères à droite */}
      <Repere x={cx + bodyW / 2 + 6} py={y(k.h)} texte="Haut (High)" valeur={k.h} />
      <Repere x={cx + bodyW / 2 + 6} py={y(k.c)} texte="Clôture (Close)" valeur={k.c} />
      <Repere x={cx + bodyW / 2 + 6} py={y(k.o)} texte="Ouverture (Open)" valeur={k.o} />
      <Repere x={cx + bodyW / 2 + 6} py={y(k.l)} texte="Bas (Low)" valeur={k.l} />

      {/* Mesures à gauche */}
      <g>
        <line x1={cx - bodyW / 2 - 14} x2={cx - bodyW / 2 - 14} y1={bodyTop} y2={bodyBottom} stroke={color.gold} strokeWidth={1.6} />
        <text x={cx - bodyW / 2 - 20} y={(bodyTop + bodyBottom) / 2 + 4} fontSize={12} fill={color.gold} fontWeight={700} textAnchor="end">
          corps
        </text>
        <text x={cx - bodyW / 2 - 20} y={(bodyTop + bodyBottom) / 2 + 18} fontSize={11} fill={color.textFaint} textAnchor="end" fontFamily="ui-monospace, monospace">
          {g.body}
        </text>

        <line x1={cx - 12} x2={cx - 12} y1={y(k.h)} y2={bodyTop} stroke={color.cyan} strokeWidth={1.4} />
        <text x={cx - 18} y={(y(k.h) + bodyTop) / 2 + 4} fontSize={11.5} fill={color.cyan} textAnchor="end" fontWeight={600}>
          mèche haute
        </text>

        <line x1={cx - 12} x2={cx - 12} y1={bodyBottom} y2={y(k.l)} stroke={color.cyan} strokeWidth={1.4} />
        <text x={cx - 18} y={(bodyBottom + y(k.l)) / 2 + 4} fontSize={11.5} fill={color.cyan} textAnchor="end" fontWeight={600}>
          mèche basse
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------- force / faiblesse --- */

/** Une des deux colonnes du schéma force / faiblesse. */
function CarteForce({ k, titre, verdict, ton }: { k: Candle; titre: string; verdict: string; ton: string }) {
  const g = geometry(k);
  const pos = Math.round(((k.c - k.l) / g.range) * 100);
  return (
    <div
      style={{
        flex: "1 1 180px",
        background: color.white,
        border: `1px solid ${color.border}`,
        borderTop: `3px solid ${ton}`,
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <strong style={{ fontSize: 14.5, color: color.textDark }}>{titre}</strong>
      <div style={{ margin: "10px 0", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 54 }}>
          <MiniCandles candles={[k]} height={130} step={54} />
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: color.textMuted, lineHeight: 1.55 }}>
        Corps <strong>{g.body}</strong> · clôture à <strong>{pos}%</strong> de l’amplitude
      </div>
      <div style={{ fontSize: 13, color: ton, fontWeight: 700, marginTop: 6 }}>{verdict}</div>
    </div>
  );
}

/** Deux bougies vertes de corps identique : l'une finit en force, l'autre non. */
export function ForceDiagram() {
  const { forte, faible } = FORCE_VS_FAIBLESSE;
  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <CarteForce k={forte} titre="Finit en force" verdict="Personne n’a fait refluer le prix" ton={VERT} />
        <CarteForce k={faible} titre="Finit en faiblesse" verdict="Les acheteurs ont été absorbés en haut" ton={color.warning} />
      </div>
      <p style={{ fontSize: 13.5, color: color.textMuted, margin: "11px 0 0", lineHeight: 1.6 }}>
        Même couleur, même corps, même ouverture et même clôture. Seule la position de la clôture
        dans l’amplitude diffère — et c’est ce qui change complètement la lecture.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- galerie --- */

/** Une vignette : le schéma de la figure, son nom, son biais. */
function Vignette({ cle }: { cle: string }) {
  const def = PATTERN_BY_KEY[cle];
  const ex = PATTERN_EXAMPLES[cle];
  if (!def || !ex) return null;

  const debut = ex.at - ex.span + 1;
  const depuis = Math.max(0, debut - ex.contextShown);
  const visibles = ex.candles.slice(depuis);
  const hlFrom = debut - depuis;

  const ton = def.bias === "haussier" ? VERT : def.bias === "baissier" ? ROUGE : color.textMuted;

  return (
    <div
      style={{
        background: color.white,
        border: `1px solid ${color.border}`,
        borderRadius: 11,
        padding: "12px 13px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ background: color.navyDeep, borderRadius: 8, padding: "6px 4px" }}>
        <MiniCandles
          candles={visibles}
          highlightFrom={hlFrom}
          highlightTo={hlFrom + ex.span - 1}
          height={110}
          step={14}
        />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 13.5, color: color.textDark }}>{def.name}</strong>
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: ton,
              border: `1px solid ${ton}`,
              borderRadius: 99,
              padding: "1px 6px",
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}
          >
            {def.bias}
          </span>
        </div>
        <p style={{ margin: "5px 0 0", fontSize: 12, lineHeight: 1.5, color: color.textMuted }}>
          {def.meaning}
        </p>
      </div>
    </div>
  );
}

function Galerie({ cles }: { cles: string[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))",
        gap: 11,
      }}
    >
      {cles.map((c) => (
        <Vignette key={c} cle={c} />
      ))}
    </div>
  );
}

/** Les sept figures à une bougie. */
export function GalerieUneBougie() {
  return <Galerie cles={GALLERY_UNE_BOUGIE} />;
}

/** Les sept figures à deux et trois bougies. */
export function GalerieCombinees() {
  return <Galerie cles={GALLERY_COMBINEES} />;
}

/* ----------------------------------------------------------- répartiteur --- */

export type FigureKind = "anatomie" | "force" | "figures_simples" | "figures_combinees";

/** Rend le schéma correspondant à la clé posée sur une leçon. */
export function LessonFigure({ kind }: { kind: FigureKind }) {
  if (kind === "anatomie") return <AnatomyDiagram />;
  if (kind === "force") return <ForceDiagram />;
  if (kind === "figures_simples") return <GalerieUneBougie />;
  return <GalerieCombinees />;
}
