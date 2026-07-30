"use client";

/**
 * Exercice du Niveau 4 : la cassure tient-elle ?
 *
 * Le graphique montre une tendance haussière et une bougie qui vient de passer
 * au-delà du dernier sommet. Deux issues possibles, et une seule question :
 * est-ce une vraie cassure, ou un balayage ?
 *
 * Le niveau n'est **pas** tracé avant la réponse. C'est délibéré : si on le
 * dessine, l'exercice devient une comparaison triviale. Sans le trait, l'élève
 * doit identifier lui-même le sommet pertinent, ce qui mobilise le Niveau 3, et
 * seulement ensuite comparer la clôture à ce niveau — la leçon de celui-ci.
 *
 * La correction trace le niveau, révèle la suite, et dit si le moteur de
 * structure a enregistré un BOS. Réponse et graphique ne peuvent pas diverger :
 * une graine n'est retenue que si le moteur confirme l'intention.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CandleChart from "../CandleChart";
import { buildBreakoutDrill } from "@/lib/trading/scenarios";
import { applyResult } from "@/lib/trading/progress";
import { saveStudent, today, useStudent } from "@/lib/trading/store";
import { color, gradient } from "@/lib/design";

const XP_REUSSITE = 45;
const COMPETENCES = ["fausses_cassures", "stop_hunt", "manipulation"];

export default function BreakoutDrillClient() {
  const student = useStudent();
  const [reponse, setReponse] = useState<boolean | null>(null);
  const [session, setSession] = useState({ vus: 0, justes: 0 });

  // Décalage de graine propre à ce drill, pour que les trois entraînements
  // (bougies, structure, cassures) ne montrent pas la même série.
  const drill = useMemo(() => {
    try {
      return buildBreakoutDrill(student.lastSeed + 120000);
    } catch {
      return null;
    }
  }, [student.lastSeed]);

  const suivant = useCallback(() => {
    setReponse(null);
    // On repart APRÈS la graine réellement trouvée, pas après celle demandée :
    // `buildBreakoutDrill` cherche en avant, donc deux positions consécutives
    // peuvent retomber sur le même exercice. En prime, le décalage de 1 inverse
    // la parité, donc vraie et fausse cassure alternent.
    const suivante = drill ? drill.seed - 120000 + 1 : student.lastSeed + 1;
    saveStudent({ ...student, lastSeed: suivante });
  }, [student, drill]);

  const repondre = useCallback(
    (choix: boolean) => {
      if (reponse !== null || !drill) return;
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
      if (e.key === "1") repondre(true);
      else if (e.key === "2") repondre(false);
      else if (e.key === "Enter" && reponse !== null) suivant();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [repondre, suivant, reponse]);

  if (!drill) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 18px", textAlign: "center" }}>
        <p style={{ color: color.textBody, fontSize: 15.5, lineHeight: 1.7 }}>
          Aucun exercice exploitable n’a pu être généré à partir de cette position. Passe au suivant.
        </p>
        <button onClick={suivant} style={{ ...bouton(true), marginTop: 14 }}>
          Exercice suivant →
        </button>
      </div>
    );
  }

  const decisive = drill.candles[drill.at];
  const juste = reponse !== null && reponse === drill.answer;
  const precision = session.vus ? Math.round((session.justes / session.vus) * 100) : 0;
  const ecart = ((decisive.c - drill.level) / drill.level) * 100;

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
            href="/trading/institutions"
            style={{ color: color.textMuted, fontSize: 13, textDecoration: "none" }}
          >
            ← Niveau 4 · Institutions
          </Link>
          <h1 style={{ margin: "6px 0 0", fontSize: 26, color: color.textDark, fontWeight: 800 }}>
            Cette cassure tient-elle&nbsp;?
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
          future={drill.future}
          reveal={reponse !== null}
          highlight={drill.at}
          height={380}
          // Le niveau n'apparaît qu'après la réponse — sinon l'exercice
          // se réduit à lire un trait.
          levels={
            reponse !== null
              ? [{ price: drill.level, label: `niveau ${drill.level.toFixed(2)}` }]
              : undefined
          }
          pivots={drill.reading.pivots}
          legs={drill.reading.legs}
          showStructure={reponse !== null}
        />
      </div>

      <p style={{ fontSize: 13, color: color.textMuted, margin: "10px 0 22px" }}>
        {reponse === null
          ? "La bougie encadrée vient de dépasser le dernier sommet. Repère ce sommet, puis regarde où la bougie a CLÔTURÉ."
          : "Le trait doré est le niveau mis en jeu. Les bougies après la zone masquée montrent la suite."}{" "}
        Exercice n°{drill.seed}.
      </p>

      {reponse === null ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
          <Choix
            n={1}
            titre="Vraie cassure"
            sub="la clôture est au-delà du niveau"
            teinte="#16a34a"
            onClick={() => repondre(true)}
          />
          <Choix
            n={2}
            titre="Fausse cassure"
            sub="seule la mèche a dépassé"
            teinte="#dc2626"
            onClick={() => repondre(false)}
          />
        </div>
      ) : (
        <div>
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
              {juste ? "Bonne lecture" : "Raté"} — c’était une{" "}
              {drill.answer ? "vraie" : "fausse"} cassure
            </strong>
            <p style={{ margin: "9px 0 0", fontSize: 14.5, lineHeight: 1.7, color: color.textBody }}>
              La mèche est montée à <strong>{decisive.h.toFixed(2)}</strong>, au-dessus du niveau{" "}
              <strong>{drill.level.toFixed(2)}</strong>. Mais la clôture s’est faite à{" "}
              <strong style={{ color: drill.answer ? color.success : color.danger }}>
                {decisive.c.toFixed(2)}
              </strong>{" "}
              — soit {ecart >= 0 ? "+" : ""}
              {ecart.toFixed(2)}&nbsp;% par rapport au niveau.{" "}
              {drill.answer
                ? "La clôture est au-delà : la structure est réellement cassée, le moteur enregistre un BOS."
                : "La clôture est en deçà : rien n’est cassé, aucun BOS. Le prix est allé chercher la liquidité au-dessus du sommet, puis il est revenu — c’est la signature d’un balayage."}
            </p>
          </div>

          <div
            style={{
              border: `1px solid ${color.borderBlue}`,
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 18,
              background: color.white,
            }}
          >
            <strong style={{ fontSize: 14.5, color: color.textDark }}>Le réflexe à garder</strong>
            <p style={{ margin: "7px 0 0", fontSize: 14, lineHeight: 1.65, color: color.textBody }}>
              {drill.answer
                ? "Même sur une vraie cassure, entrer au dépassement plutôt qu’à la clôture ne t’aurait rien fait gagner ici — mais c’est ce qui te ruine sur les fausses. La règle reste la même dans les deux cas : attendre la clôture."
                : "Ceux qui sont entrés dès le dépassement du sommet ont été servis, puis pris au piège quand le prix est revenu. Attendre la clôture coûte un peu de prix d’entrée et évite exactement ce cas."}
            </p>
          </div>

          <button onClick={suivant} style={bouton(true)}>
            Exercice suivant →
          </button>
          <span style={{ marginLeft: 12, fontSize: 12.5, color: color.textFaint }}>ou touche Entrée</span>
        </div>
      )}
    </div>
  );
}

function bouton(principal: boolean): React.CSSProperties {
  return {
    padding: "14px 26px",
    borderRadius: 11,
    border: principal ? "none" : `1.5px solid ${color.border}`,
    background: principal ? gradient.gold : color.white,
    color: principal ? color.navyDeep : color.textBody,
    fontWeight: 800,
    fontSize: 15.5,
    cursor: "pointer",
  };
}

function Choix({
  n,
  titre,
  sub,
  teinte,
  onClick,
}: {
  n: number;
  titre: string;
  sub: string;
  teinte: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
        <span style={{ width: 9, height: 9, borderRadius: 99, background: teinte, display: "inline-block" }} />
        <strong style={{ fontSize: 16, color: color.textDark }}>{titre}</strong>
        <span style={{ marginLeft: "auto", fontSize: 11, color: color.textFaint }}>{n}</span>
      </div>
      <div style={{ fontSize: 12.5, color: color.textMuted, marginTop: 4 }}>{sub}</div>
    </button>
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
