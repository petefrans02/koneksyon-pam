"use client";

/**
 * Exercice du Niveau 5 : où va le momentum ?
 *
 * Quatre réponses, et la quatrième est le cœur du niveau : « ça s'agite sans
 * avancer ». La distinguer d'un simple essoufflement est précisément la
 * compétence que la leçon 5 enseigne — de grosses bougies ne signifient pas du
 * momentum.
 *
 * La correction affiche les trois mesures brutes (corps, amplitude, vitesse).
 * C'est délibéré : le momentum est la notion la plus subjective du cours, et
 * « ça ralentit » est une impression facile à se raconter après coup. Confronter
 * son impression à trois nombres est ce qui ajuste l'œil.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CandleChart from "../CandleChart";
import { MomentumAnswer, buildMomentumDrill } from "@/lib/trading/scenarios";
import { applyResult } from "@/lib/trading/progress";
import { saveStudent, today, useStudent } from "@/lib/trading/store";
import { color, gradient } from "@/lib/design";

const XP_REUSSITE = 40;
const COMPETENCES = ["ralentissement", "acceleration", "faiblesse_marche"];
const DECALAGE = 200000;

const CHOIX: { key: MomentumAnswer; label: string; sub: string; teinte: string }[] = [
  { key: "acceleration", label: "Ça accélère", sub: "corps, amplitude et vitesse en hausse", teinte: "#16a34a" },
  { key: "ralentissement", label: "Ça s'essouffle", sub: "tout se resserre", teinte: "#d97706" },
  { key: "stable", label: "Stable", sub: "rien ne change vraiment", teinte: "#64748b" },
  { key: "agitation", label: "Ça s'agite sans avancer", sub: "grosses bougies, aucune progression", teinte: "#db2777" },
];

const EXPLIQUE: Record<MomentumAnswer, string> = {
  acceleration:
    "Les trois mesures montent ensemble : les bougies grossissent, l'amplitude s'élargit, et surtout le prix parcourt plus de terrain par période. C'est le moment le plus tentant d'entrer — et souvent le plus mauvais, puisque ceux qui étaient positionnés avant commencent à vendre leur position.",
  ralentissement:
    "Tout se resserre. Le marché reprend son souffle, sans dire encore s'il repartira ou se retournera. Ce n'est pas un signal de vente : c'est une raison de viser moins loin et de ne pas renforcer.",
  stable:
    "Rien de significatif n'a changé entre les deux fenêtres. C'est le cas le plus fréquent, et le reconnaître évite de voir des accélérations partout — l'erreur classique quand on découvre le momentum.",
  agitation:
    "Le piège du niveau. Les corps ont nettement grossi, donc l'œil voit un marché « très actif » et conclut à de la force. Mais regarde la vitesse : elle s'est effondrée. Le prix est revenu près de son point de départ. C'est de l'expansion de volatilité, pas du momentum — et c'est le pire terrain qui soit, parce que les stops sautent des deux côtés sans que rien n'aboutisse.",
};

export default function MomentumDrillClient() {
  const student = useStudent();
  const [reponse, setReponse] = useState<MomentumAnswer | null>(null);
  const [session, setSession] = useState({ vus: 0, justes: 0 });

  const drill = useMemo(() => {
    try {
      return buildMomentumDrill(student.lastSeed + DECALAGE);
    } catch {
      return null;
    }
  }, [student.lastSeed]);

  const suivant = useCallback(() => {
    setReponse(null);
    // On repart après la graine réellement trouvée : la recherche avance, donc
    // deux positions consécutives pourraient sinon donner le même exercice.
    const suivante = drill ? drill.seed - DECALAGE + 1 : student.lastSeed + 1;
    saveStudent({ ...student, lastSeed: suivante });
  }, [student, drill]);

  const repondre = useCallback(
    (choix: MomentumAnswer) => {
      if (reponse || !drill) return;
      const juste = choix === drill.answer;
      setReponse(choix);
      setSession((s) => ({ vus: s.vus + 1, justes: s.justes + (juste ? 1 : 0) }));
      saveStudent(
        applyResult(student, { skills: COMPETENCES, success: juste, xp: XP_REUSSITE }, today()),
      );
    },
    [drill, reponse, student],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key);
      if (i >= 1 && i <= 4) repondre(CHOIX[i - 1].key);
      else if (e.key === "Enter" && reponse) suivant();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [repondre, suivant, reponse]);

  if (!drill) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 18px", textAlign: "center" }}>
        <p style={{ color: color.textBody, fontSize: 15.5 }}>
          Aucun exercice exploitable ici. Passe au suivant.
        </p>
        <button onClick={suivant} style={{ ...bouton(), marginTop: 14 }}>
          Exercice suivant →
        </button>
      </div>
    );
  }

  const juste = reponse !== null && reponse === drill.answer;
  const precision = session.vus ? Math.round((session.justes / session.vus) * 100) : 0;
  const r = drill.reading;
  const attendu = CHOIX.find((c) => c.key === drill.answer);

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
          <Link href="/trading/momentum" style={{ color: color.textMuted, fontSize: 13, textDecoration: "none" }}>
            ← Niveau 5 · Momentum
          </Link>
          <h1 style={{ margin: "6px 0 0", fontSize: 26, color: color.textDark, fontWeight: 800 }}>
            Où va le momentum&nbsp;?
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
        <CandleChart candles={drill.candles} height={370} />
      </div>

      <p style={{ fontSize: 13, color: color.textMuted, margin: "10px 0 22px" }}>
        Compare les 8 dernières bougies aux 8 qui les précèdent. Trois questions : les corps
        grandissent-ils ? l’amplitude s’élargit-elle ? et surtout — le prix avance-t-il vraiment ?
        Exercice n°{drill.seed}.
      </p>

      {reponse === null ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(215px,1fr))", gap: 12 }}>
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
                <span style={{ width: 9, height: 9, borderRadius: 99, background: c.teinte, display: "inline-block" }} />
                <strong style={{ fontSize: 15.5, color: color.textDark }}>{c.label}</strong>
                <span style={{ marginLeft: "auto", fontSize: 11, color: color.textFaint }}>{i + 1}</span>
              </div>
              <div style={{ fontSize: 12.5, color: color.textMuted, marginTop: 4 }}>{c.sub}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          {/* Les trois mesures brutes : l'impression confrontée aux nombres. */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <Mesure label="Corps" valeur={r.bodyRatio} />
            <Mesure label="Amplitude" valeur={r.rangeRatio} />
            <Mesure label="Vitesse" valeur={r.speedRatio} vedette />
            <Mesure label="Score" valeur={r.score} />
          </div>

          <div
            style={{
              borderLeft: `4px solid ${juste ? color.success : color.danger}`,
              background: color.bgLight,
              borderRadius: 10,
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            <strong style={{ color: juste ? color.success : color.danger, fontSize: 16 }}>
              {juste ? "Bonne lecture" : "Raté"} — la réponse était «&nbsp;{attendu?.label}&nbsp;»
            </strong>
            <p style={{ margin: "9px 0 0", fontSize: 14.5, lineHeight: 1.7, color: color.textBody }}>
              {EXPLIQUE[drill.answer]}
            </p>
            {drill.answer !== "agitation" && r.speedRatio < 0.7 && r.bodyRatio > 1.2 && (
              <p style={{ margin: "9px 0 0", fontSize: 13.5, lineHeight: 1.6, color: color.textMuted }}>
                À noter : la vitesse est basse ici aussi, mais les corps n’ont pas assez grossi pour
                parler d’expansion sans progression.
              </p>
            )}
          </div>

          <button onClick={suivant} style={bouton()}>
            Exercice suivant →
          </button>
          <span style={{ marginLeft: 12, fontSize: 12.5, color: color.textFaint }}>ou touche Entrée</span>
        </div>
      )}
    </div>
  );
}

/** Un ratio affiché comme « ×1.85 », coloré selon qu'il monte ou descend. */
function Mesure({ label, valeur, vedette }: { label: string; valeur: number; vedette?: boolean }) {
  const monte = valeur > 1.1;
  const descend = valeur < 0.9;
  const teinte = monte ? color.success : descend ? color.danger : color.textMuted;
  return (
    <div
      style={{
        padding: "11px 14px",
        borderRadius: 10,
        background: vedette ? color.goldPale : color.white,
        border: `1px solid ${vedette ? color.goldLight : color.border}`,
      }}
    >
      <div style={{ fontSize: 10.5, color: color.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
        {vedette && " — la plus importante"}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: teinte, fontFamily: "ui-monospace, monospace" }}>
        ×{valeur.toFixed(2)}
      </div>
    </div>
  );
}

function bouton(): React.CSSProperties {
  return {
    padding: "14px 26px",
    borderRadius: 11,
    border: "none",
    background: gradient.gold,
    color: color.navyDeep,
    fontWeight: 800,
    fontSize: 15.5,
    cursor: "pointer",
  };
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
