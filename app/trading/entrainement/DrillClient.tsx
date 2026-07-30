"use client";

/**
 * L'exercice central de l'académie : « que va faire le marché ensuite ? »
 *
 * L'élève voit un graphique dont les dernières bougies sont masquées, avec une
 * figure mise en évidence. Il parie sur la suite, puis le futur se révèle.
 *
 * Deux partis pris pédagogiques, volontairement inconfortables :
 *
 * 1. **On peut se tromper en raisonnant juste.** La figure penche mais ne
 *    garantit rien (voir `scenarios.ts`). Quand l'élève lit correctement la
 *    figure et que le marché fait l'inverse, la correction le dit explicitement
 *    au lieu de le laisser croire qu'il a mal lu. C'est le Niveau 6 en pratique.
 *
 * 2. **On explique toujours, y compris sur une bonne réponse.** Sinon l'élève
 *    apprend à deviner, pas à lire.
 *
 * Note d'architecture : l'exercice affiché n'est pas un état local, c'est une
 * *fonction* de la graine persistée dans la progression. Conséquences utiles —
 * l'élève reprend où il s'était arrêté, l'exercice est partageable par son
 * numéro, et il n'y a aucun écart entre rendu serveur et rendu navigateur.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CandleChart from "../CandleChart";
import { PATTERN_BY_KEY } from "@/lib/trading/candles";
import { Answer, Drill, buildDrill, drillIsValid } from "@/lib/trading/scenarios";
import { applyResult } from "@/lib/trading/progress";
import { saveStudent, today, useStudent } from "@/lib/trading/store";
import { color, gradient } from "@/lib/design";

const CHOIX: { key: Answer; label: string; sub: string; teinte: string }[] = [
  { key: "hausse", label: "Ça monte", sub: "clôture nettement plus haut", teinte: "#16a34a" },
  { key: "baisse", label: "Ça descend", sub: "clôture nettement plus bas", teinte: "#dc2626" },
  { key: "indecis", label: "Indécis", sub: "pas de mouvement net", teinte: "#64748b" },
];

const XP_REUSSITE = 40;
const COMPETENCES = ["prediction", "sequences", "faux_signaux"];

/**
 * Premier exercice valide à partir de `seed`. Une figure plantée peut échouer
 * au test de détection si le hasard a produit un contexte ambigu : on avance
 * alors d'une graine plutôt que de montrer un exercice mal formé.
 */
function drillDepuis(seed: number): Drill {
  let s = seed;
  for (let i = 0; i < 400; i++) {
    const d = buildDrill(s);
    if (drillIsValid(d)) return d;
    s++;
  }
  // Repli : un cas sans figure notable reste un exercice valable.
  return buildDrill(s, { pattern: "aucune" });
}

export default function DrillClient() {
  const student = useStudent();
  const [reponse, setReponse] = useState<Answer | null>(null);
  const [session, setSession] = useState({ vus: 0, justes: 0 });

  // L'exercice découle de la graine : aucun état à synchroniser.
  const drill = useMemo(() => drillDepuis(student.lastSeed), [student.lastSeed]);

  const suivant = useCallback(() => {
    setReponse(null);
    saveStudent({ ...student, lastSeed: drill.seed + 1 });
  }, [student, drill.seed]);

  const repondre = useCallback(
    (choix: Answer) => {
      if (reponse) return;
      const juste = choix === drill.answer;
      setReponse(choix);
      setSession((s) => ({ vus: s.vus + 1, justes: s.justes + (juste ? 1 : 0) }));
      saveStudent(
        applyResult(student, { skills: COMPETENCES, success: juste, xp: XP_REUSSITE }, today()),
      );
    },
    [drill.answer, reponse, student],
  );

  // Raccourcis clavier : l'entraînement doit pouvoir s'enchaîner vite.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") repondre("hausse");
      else if (e.key === "2") repondre("baisse");
      else if (e.key === "3") repondre("indecis");
      else if (e.key === "Enter" && reponse) suivant();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [repondre, suivant, reponse]);

  const figure = drill.patternKey ? PATTERN_BY_KEY[drill.patternKey] : null;
  const juste = reponse !== null && reponse === drill.answer;

  /**
   * La correction. Le cas intéressant est « bonne lecture, mauvais résultat » :
   * l'élève a suivi le biais de la figure et le marché ne l'a pas suivi. On le
   * nomme au lieu de le sanctionner comme une erreur de lecture.
   */
  const correction = useMemo(() => {
    if (!reponse) return null;
    const attendu: Answer | null =
      figure && figure.bias !== "neutre" ? (figure.bias === "haussier" ? "hausse" : "baisse") : null;
    const lectureConforme = attendu !== null && reponse === attendu;
    const figureTenue = attendu !== null && drill.answer === attendu;

    if (juste) {
      return {
        titre: "Bonne réponse",
        ton: color.success,
        texte: lectureConforme
          ? "Tu as lu la figure et le marché l’a suivie. Attention quand même : c’est ce qui arrive le plus souvent, pas ce qui arrive toujours."
          : "Bonne lecture — et notamment tu n’as pas suivi aveuglément la théorie de la figure.",
      };
    }
    if (lectureConforme && !figureTenue) {
      return {
        titre: "Lecture correcte, marché contraire",
        ton: color.warning,
        texte: `Ta lecture était juste : ${figure?.name} penche effectivement ${figure?.bias}. Le marché a fait l’inverse. Ce n’est pas une erreur d’analyse — c’est la nature du métier. Une figure décale les probabilités, elle ne décide de rien. Tu ne peux pas éviter ces cas ; tu peux seulement les rendre supportables par la taille de ta position.`,
      };
    }
    return {
      titre: "Réponse incorrecte",
      ton: color.danger,
      texte: figure
        ? `Relis la figure : ${figure.name}. ${figure.meaning}`
        : "Aucune figure nette ici. Dans ce cas, appuie-toi sur la tendance de fond plutôt que sur la dernière bougie.",
    };
  }, [reponse, juste, figure, drill.answer]);

  const precision = session.vus ? Math.round((session.justes / session.vus) * 100) : 0;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 18px 64px" }}>
      {/* En-tête */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <Link href="/trading" style={{ color: color.textMuted, fontSize: 13, textDecoration: "none" }}>
            ← Académie Trading
          </Link>
          <h1 style={{ margin: "6px 0 0", fontSize: 26, color: color.textDark, fontWeight: 800 }}>
            Que va faire le marché ensuite&nbsp;?
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Stat label="Exercices" valeur={String(session.vus)} />
          <Stat label="Précision" valeur={`${precision}%`} />
          <Stat label="XP" valeur={String(student.xp)} accent />
        </div>
      </div>

      {/* Graphique */}
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${color.border}`,
          boxShadow: "0 8px 28px rgba(6,13,26,.14)",
        }}
      >
        <CandleChart
          candles={drill.visible}
          future={drill.future}
          reveal={reponse !== null}
          highlight={drill.patternAt}
          highlightSpan={figure?.size ?? 1}
          height={360}
        />
      </div>

      <p style={{ fontSize: 13, color: color.textMuted, margin: "10px 0 22px" }}>
        La zone encadrée en doré est la figure à lire. Les {drill.future.length} bougies après le
        trait pointillé sont masquées. Exercice n°{drill.seed} — reproductible.
      </p>

      {/* Choix */}
      {reponse === null ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          {CHOIX.map((c, i) => (
            <button
              key={c.key}
              onClick={() => repondre(c.key)}
              style={{
                padding: "16px 14px",
                borderRadius: 12,
                border: `1.5px solid ${color.border}`,
                background: color.white,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{ width: 9, height: 9, borderRadius: 99, background: c.teinte, display: "inline-block" }}
                />
                <strong style={{ fontSize: 16, color: color.textDark }}>{c.label}</strong>
                <span style={{ marginLeft: "auto", fontSize: 11, color: color.textFaint }}>{i + 1}</span>
              </div>
              <div style={{ fontSize: 12.5, color: color.textMuted, marginTop: 4 }}>{c.sub}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          {/* Correction */}
          <div
            style={{
              borderLeft: `4px solid ${correction?.ton}`,
              background: color.bgLight,
              borderRadius: 10,
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <strong style={{ color: correction?.ton, fontSize: 16 }}>{correction?.titre}</strong>
              <span style={{ fontSize: 13, color: color.textMuted }}>
                Le marché a clôturé à{" "}
                <strong style={{ color: drill.outcomePct >= 0 ? color.success : color.danger }}>
                  {drill.outcomePct >= 0 ? "+" : ""}
                  {drill.outcomePct.toFixed(2)}%
                </strong>{" "}
                après {drill.future.length} bougies.
              </span>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.65, color: color.textBody }}>
              {correction?.texte}
            </p>
          </div>

          {/* La figure en détail */}
          {figure && (
            <div
              style={{
                border: `1px solid ${color.borderBlue}`,
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 18,
                background: color.white,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 15, color: color.textDark }}>{figure.name}</strong>
                <Etiquette biais={figure.bias} />
                <span style={{ fontSize: 12, color: color.textFaint }}>
                  {figure.size} bougie{figure.size > 1 ? "s" : ""}
                </span>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6, color: color.textBody }}>
                {figure.meaning}
              </p>
            </div>
          )}

          <button
            onClick={suivant}
            style={{
              padding: "14px 26px",
              borderRadius: 11,
              border: "none",
              background: gradient.gold,
              color: color.navyDeep,
              fontWeight: 800,
              fontSize: 15.5,
              cursor: "pointer",
            }}
          >
            Exercice suivant →
          </button>
          <span style={{ marginLeft: 12, fontSize: 12.5, color: color.textFaint }}>ou touche Entrée</span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, valeur, accent }: { label: string; valeur: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: "8px 14px",
        borderRadius: 10,
        background: accent ? color.goldPale : color.bgLight,
        border: `1px solid ${accent ? color.goldLight : color.border}`,
        minWidth: 74,
      }}
    >
      <div
        style={{ fontSize: 10.5, color: color.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: color.textDark }}>{valeur}</div>
    </div>
  );
}

function Etiquette({ biais }: { biais: string }) {
  const t = biais === "haussier" ? color.success : biais === "baissier" ? color.danger : color.textMuted;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: t,
        border: `1px solid ${t}`,
        borderRadius: 99,
        padding: "2px 9px",
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {biais}
    </span>
  );
}
