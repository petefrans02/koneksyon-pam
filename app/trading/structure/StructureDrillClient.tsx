"use client";

/**
 * Exercice du Niveau 3 : lire la structure d'un graphique.
 *
 * L'élève voit un graphique nu et doit dire dans quel état est le marché.
 * Après la réponse, la superposition apparaît — zigzag des pivots, étiquettes
 * HH/HL/LH/LL, niveaux cassés. C'est cette révélation qui enseigne : l'élève
 * voit exactement les points sur lesquels la conclusion repose.
 *
 * La bonne réponse vient du moteur `structure.read()`, pas d'une étiquette
 * posée à la main lors de la génération. L'énoncé ne peut donc pas contredire
 * ce que le graphique montre.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CandleChart from "../CandleChart";
import { buildStructureDrill } from "@/lib/trading/scenarios";
import { TrendState } from "@/lib/trading/structure";
import { applyResult } from "@/lib/trading/progress";
import { saveStudent, today, useStudent } from "@/lib/trading/store";
import { color, gradient } from "@/lib/design";

const XP_REUSSITE = 40;
const COMPETENCES = ["structure", "hh_hl", "lh_ll"];

const CHOIX: { key: TrendState; label: string; sub: string; teinte: string }[] = [
  { key: "haussiere", label: "Haussière", sub: "sommets ET creux qui montent", teinte: "#16a34a" },
  { key: "baissiere", label: "Baissière", sub: "sommets ET creux qui descendent", teinte: "#dc2626" },
  { key: "range", label: "Range", sub: "tout le reste, expansion comprise", teinte: "#64748b" },
];

/** Explication adaptée à la réponse donnée — le cas instructif est le piège HH+LL. */
function expliquer(attendu: TrendState, donne: TrendState, labels: string[]) {
  const sommets = labels.filter((l) => l === "HH" || l === "LH");
  const creux = labels.filter((l) => l === "HL" || l === "LL");
  const resume = `Sommets : ${sommets.join(", ") || "—"} · Creux : ${creux.join(", ") || "—"}.`;

  if (attendu === donne) {
    return {
      titre: "Bonne lecture",
      ton: color.success,
      texte: `${resume} ${
        attendu === "range"
          ? "Un range ne veut pas dire « rien ne bouge » : il suffit que les sommets et les creux n'aillent pas dans le même sens."
          : "Les deux séries pointent dans la même direction, c'est ce qui fait une tendance."
      }`,
    };
  }
  // L'erreur la plus instructive : voir une tendance dans une expansion.
  if (attendu === "range" && donne !== "range") {
    return {
      titre: "C'est un range, pas une tendance",
      ton: color.warning,
      texte: `${resume} Tu n'as probablement regardé qu'une des deux séries. Pour une tendance il faut les DEUX dans le même sens — des sommets plus hauts avec des creux plus bas est une expansion : le marché s'agite davantage, sans direction.`,
    };
  }
  if (attendu !== "range" && donne === "range") {
    return {
      titre: "La structure était bien orientée",
      ton: color.danger,
      texte: `${resume} Les deux séries allaient dans le même sens : c'est une tendance ${attendu}. Un range demande que les séries se contredisent, ou qu'il manque une référence.`,
    };
  }
  return {
    titre: "Sens inversé",
    ton: color.danger,
    texte: `${resume} Relis les étiquettes du zigzag : la structure est ${attendu}. Compare toujours un sommet à un sommet et un creux à un creux — jamais un sommet à un creux.`,
  };
}

export default function StructureDrillClient() {
  const student = useStudent();
  const [reponse, setReponse] = useState<TrendState | null>(null);
  const [session, setSession] = useState({ vus: 0, justes: 0 });

  // L'exercice découle de la graine persistée : reprise là où on s'est arrêté,
  // et aucun écart entre rendu serveur et rendu navigateur.
  const drill = useMemo(() => buildStructureDrill(student.lastSeed + 50000), [student.lastSeed]);

  const suivant = useCallback(() => {
    setReponse(null);
    saveStudent({ ...student, lastSeed: drill.seed - 50000 + 1 });
  }, [student, drill.seed]);

  const repondre = useCallback(
    (choix: TrendState) => {
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") repondre("haussiere");
      else if (e.key === "2") repondre("baissiere");
      else if (e.key === "3") repondre("range");
      else if (e.key === "Enter" && reponse) suivant();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [repondre, suivant, reponse]);

  const correction = useMemo(
    () =>
      reponse
        ? expliquer(drill.answer, reponse, drill.reading.legs.map((l) => l.label))
        : null,
    [reponse, drill],
  );

  const precision = session.vus ? Math.round((session.justes / session.vus) * 100) : 0;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 18px 64px" }}>
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
          <Link
            href="/trading/price-action"
            style={{ color: color.textMuted, fontSize: 13, textDecoration: "none" }}
          >
            ← Niveau 3 · Price Action
          </Link>
          <h1 style={{ margin: "6px 0 0", fontSize: 26, color: color.textDark, fontWeight: 800 }}>
            Quelle est la structure de ce marché&nbsp;?
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Stat label="Exercices" valeur={String(session.vus)} />
          <Stat label="Précision" valeur={`${precision}%`} />
          <Stat label="XP" valeur={String(student.xp)} accent />
        </div>
      </div>

      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${color.border}`,
          boxShadow: "0 8px 28px rgba(6,13,26,.14)",
        }}
      >
        <CandleChart
          candles={drill.candles}
          height={380}
          pivots={drill.reading.pivots}
          legs={drill.reading.legs}
          events={drill.reading.events}
          showStructure={reponse !== null}
        />
      </div>

      <p style={{ fontSize: 13, color: color.textMuted, margin: "10px 0 22px" }}>
        {reponse === null
          ? "Repère les sommets et les creux, puis compare chaque point à celui de même nature qui le précède."
          : "Le zigzag relie les pivots retenus. Les étiquettes comparent chaque point au précédent de même nature."}{" "}
        Exercice n°{drill.seed}.
      </p>

      {reponse === null ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
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
          <div
            style={{
              borderLeft: `4px solid ${correction?.ton}`,
              background: color.bgLight,
              borderRadius: 10,
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            <strong style={{ color: correction?.ton, fontSize: 16 }}>{correction?.titre}</strong>
            <p style={{ margin: "9px 0 0", fontSize: 14.5, lineHeight: 1.7, color: color.textBody }}>
              {correction?.texte}
            </p>
          </div>

          {drill.reading.events.length > 0 && (
            <div
              style={{
                border: `1px solid ${color.borderBlue}`,
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 18,
                background: color.white,
              }}
            >
              <strong style={{ fontSize: 14.5, color: color.textDark }}>
                Cassures détectées sur ce graphique
              </strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 19 }}>
                {drill.reading.events.slice(0, 4).map((e, k) => (
                  <li
                    key={k}
                    style={{ fontSize: 14, lineHeight: 1.6, color: color.textBody, marginBottom: 4 }}
                  >
                    <strong style={{ color: e.kind === "BOS" ? color.gold : "#db2777" }}>
                      {e.kind}
                    </strong>{" "}
                    {e.direction} — clôture au-delà de {e.level.toFixed(2)}.{" "}
                    {e.kind === "BOS"
                      ? "La structure se prolonge dans son sens."
                      : "Cassure contre la tendance : le caractère change."}
                  </li>
                ))}
              </ul>
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
      <div style={{ fontSize: 10.5, color: color.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: color.textDark }}>{valeur}</div>
    </div>
  );
}
