"use client";

/**
 * Moteur de quiz, partagé par la pratique et l'examen.
 *
 * Les deux partagent la même mécanique mais pas la même intention, d'où le
 * `mode` :
 *
 * - **pratique** : correction immédiate après chaque question, avec le
 *   raisonnement. On peut enchaîner indéfiniment. C'est ici que la maîtrise
 *   des compétences se construit.
 * - **examen** : aucune correction avant la fin, puis le score, le verdict et
 *   le détail par compétence. C'est un contrôle, pas un apprentissage.
 *
 * Dans les deux cas chaque réponse crédite la compétence rattachée à la
 * question. Un bon examen ne suffit donc jamais à valider un niveau : la
 * maîtrise exige plusieurs tentatives par compétence (voir MIN_ATTEMPTS).
 */

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Level } from "@/lib/trading/curriculum";
import { Question, hashString, shuffle } from "@/lib/trading/questions";
import { applyExam, applyResult, isMastered } from "@/lib/trading/progress";
import { saveStudent, today, useStudent } from "@/lib/trading/store";
import { color, gradient } from "@/lib/design";

const XP_PRATIQUE = 15;
const XP_EXAMEN_REUSSI = 120;

export interface QuizRunnerProps {
  niveau: Level;
  questions: Question[];
  mode: "pratique" | "examen";
}

export default function QuizRunner({ niveau, questions, mode }: QuizRunnerProps) {
  const student = useStudent();
  const [index, setIndex] = useState(0);
  const [choisi, setChoisi] = useState<number | null>(null);
  /** Réponses de l'examen : index de question → index choisi. */
  const [copie, setCopie] = useState<Record<number, number>>({});
  const [rendu, setRendu] = useState(false);
  const [sessionJustes, setSessionJustes] = useState(0);
  const [sessionVues, setSessionVues] = useState(0);

  const courante = questions[index];

  // L'ordre des propositions est mélangé, mais de façon stable pour une
  // question donnée : sinon les boutons se réorganiseraient à chaque rendu.
  // La graine vient d'un hachage de l'identifiant, pas de sa longueur : sinon
  // toutes les questions au nom de même taille partageraient la permutation.
  const propositions = useMemo(() => {
    if (!courante) return [];
    const paires = courante.choices.map((texte, i) => ({ texte, original: i }));
    return shuffle(paires, hashString(courante.id));
  }, [courante]);

  const valider = useCallback(
    (originalIndex: number) => {
      if (!courante) return;
      const juste = originalIndex === courante.answer;

      if (mode === "pratique") {
        if (choisi !== null) return; // déjà répondu
        setChoisi(originalIndex);
        setSessionVues((n) => n + 1);
        setSessionJustes((n) => n + (juste ? 1 : 0));
        saveStudent(
          applyResult(
            student,
            { skills: [courante.skill], success: juste, xp: XP_PRATIQUE },
            today(),
          ),
        );
      } else {
        // En examen on enregistre sans rien révéler.
        setChoisi(originalIndex);
        setCopie((c) => ({ ...c, [index]: originalIndex }));
      }
    },
    [courante, choisi, mode, student, index],
  );

  const suivante = useCallback(() => {
    setChoisi(null);
    setIndex((i) => (mode === "pratique" ? (i + 1) % questions.length : i + 1));
  }, [mode, questions.length]);

  /** Fin d'examen : on corrige tout, on crédite, on enregistre le score. */
  const rendreCopie = useCallback(() => {
    let justes = 0;
    let etat = student;
    questions.forEach((qs, i) => {
      const rep = copie[i];
      const juste = rep === qs.answer;
      if (juste) justes++;
      etat = applyResult(etat, { skills: [qs.skill], success: juste, xp: 0 }, today());
    });
    const score = Math.round((justes / questions.length) * 100);
    etat = applyExam(etat, niveau.slug, score);
    if (score >= niveau.passingScore) etat = { ...etat, xp: etat.xp + XP_EXAMEN_REUSSI };
    saveStudent(etat);
    setRendu(true);
  }, [copie, questions, student, niveau.slug, niveau.passingScore]);

  // ------------------------------------------------------------- résultat ---

  if (mode === "examen" && rendu) {
    const justes = questions.filter((qs, i) => copie[i] === qs.answer).length;
    const score = Math.round((justes / questions.length) * 100);
    const reussi = score >= niveau.passingScore;
    // Détail par compétence : c'est ça qui dit à l'élève quoi retravailler.
    const parCompetence = niveau.skills.map((sk) => {
      const liees = questions.map((qs, i) => ({ qs, i })).filter((x) => x.qs.skill === sk.key);
      const ok = liees.filter((x) => copie[x.i] === x.qs.answer).length;
      return { sk, total: liees.length, ok };
    });

    return (
      <Cadre>
        <div
          style={{
            textAlign: "center",
            padding: "26px 20px",
            borderRadius: 14,
            background: reussi ? "#eaf7ee" : color.bgWarm,
            border: `1.5px solid ${reussi ? color.success : color.warning}`,
            marginBottom: 22,
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 800, color: reussi ? color.success : color.warning }}>
            {score}%
          </div>
          <strong style={{ fontSize: 18, color: color.textDark }}>
            {reussi ? "Examen réussi" : "Examen non validé"}
          </strong>
          <p style={{ margin: "8px auto 0", fontSize: 14.5, lineHeight: 1.65, color: color.textBody, maxWidth: 480 }}>
            {justes} bonnes réponses sur {questions.length}. Le seuil de ce niveau est de{" "}
            {niveau.passingScore}%.{" "}
            {reussi
              ? "Il reste à maîtriser toutes les compétences pour débloquer le niveau suivant — les deux conditions sont exigées."
              : "Retravaille les compétences ci-dessous en pratique, puis repasse l’examen : les questions seront différentes."}
          </p>
        </div>

        <h3 style={{ fontSize: 16, color: color.textDark, margin: "0 0 11px", fontWeight: 800 }}>
          Détail par compétence
        </h3>
        <div style={{ display: "grid", gap: 7, marginBottom: 22 }}>
          {parCompetence.map(({ sk, total, ok }) => {
            const parfait = total > 0 && ok === total;
            return (
              <div
                key={sk.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 9,
                  background: color.white,
                  border: `1px solid ${total === 0 ? color.border : parfait ? color.success : color.warning}`,
                }}
              >
                <span style={{ flex: 1, fontSize: 14.5, color: color.textBody }}>{sk.label.fr}</span>
                <strong
                  style={{
                    fontSize: 13.5,
                    color: total === 0 ? color.textFaint : parfait ? color.success : color.warning,
                  }}
                >
                  {total === 0 ? "non évaluée" : `${ok}/${total}`}
                </strong>
                {isMastered(student.skills[sk.key]) && (
                  <span style={{ fontSize: 11.5, color: color.success, fontWeight: 700 }}>maîtrisée</span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Bouton href={`/trading/${niveau.slug}/pratique`} principal>
            S’entraîner sur les points faibles
          </Bouton>
          <Bouton href={`/trading/${niveau.slug}`}>Retour au niveau</Bouton>
        </div>
      </Cadre>
    );
  }

  // -------------------------------------------------- fin de série d'examen ---

  if (mode === "examen" && index >= questions.length) {
    const repondues = Object.keys(copie).length;
    return (
      <Cadre>
        <h2 style={{ fontSize: 21, color: color.textDark, margin: "0 0 10px", fontWeight: 800 }}>
          Prêt à rendre ta copie ?
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: color.textBody, margin: "0 0 18px" }}>
          Tu as répondu à {repondues} question{repondues > 1 ? "s" : ""} sur {questions.length}.
          {repondues < questions.length &&
            " Les questions sans réponse seront comptées comme fausses."}{" "}
          Une fois la copie rendue, tu verras la correction et ton score.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={rendreCopie} style={styleBouton(true)}>
            Rendre ma copie
          </button>
          <button onClick={() => setIndex(0)} style={styleBouton(false)}>
            Revoir mes réponses
          </button>
        </div>
      </Cadre>
    );
  }

  if (!courante) {
    return (
      <Cadre>
        <p style={{ color: color.textMuted }}>
          Aucune question disponible pour ce niveau pour l’instant.
        </p>
        <Bouton href={`/trading/${niveau.slug}`}>Retour au niveau</Bouton>
      </Cadre>
    );
  }

  // ------------------------------------------------------------- question ---

  const repondu = choisi !== null;
  const juste = repondu && choisi === courante.answer;
  const precision = sessionVues ? Math.round((sessionJustes / sessionVues) * 100) : 0;

  return (
    <Cadre>
      {/* Barre de tête */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, color: color.textMuted }}>
          {mode === "examen" ? (
            <>
              Question {index + 1} / {questions.length}
            </>
          ) : (
            <>
              Pratique · {sessionVues} question{sessionVues > 1 ? "s" : ""}
              {sessionVues > 0 && ` · ${precision}% de réussite`}
            </>
          )}
        </div>
        <div style={{ fontSize: 12, color: color.textFaint }}>
          Compétence : {niveau.skills.find((s) => s.key === courante.skill)?.label.fr ?? courante.skill}
        </div>
      </div>

      {/* Progression en examen */}
      {mode === "examen" && (
        <div style={{ height: 4, borderRadius: 99, background: color.grayLight, marginBottom: 20 }}>
          <div
            style={{
              width: `${((index + 1) / questions.length) * 100}%`,
              height: "100%",
              background: niveau.color,
              borderRadius: 99,
              transition: "width .3s",
            }}
          />
        </div>
      )}

      <h2
        style={{
          fontSize: 19.5,
          lineHeight: 1.45,
          color: color.textDark,
          margin: "0 0 18px",
          fontWeight: 700,
        }}
      >
        {courante.prompt}
      </h2>

      <div style={{ display: "grid", gap: 9, marginBottom: 18 }}>
        {propositions.map(({ texte, original }) => {
          const estChoisi = choisi === original;
          const estBonne = original === courante.answer;
          // En pratique on colore après réponse ; en examen on montre seulement
          // la sélection, jamais la solution.
          // Annotation explicite : `color` est déclaré `as const`, donc sans elle
          // TypeScript infère le type littéral de la première valeur.
          let bordure: string = color.border;
          let fond: string = color.white;
          if (mode === "pratique" && repondu) {
            if (estBonne) {
              bordure = color.success;
              fond = "#eaf7ee";
            } else if (estChoisi) {
              bordure = color.danger;
              fond = "#fdecec";
            }
          } else if (estChoisi) {
            bordure = niveau.color;
            fond = color.bgLight;
          }
          return (
            <button
              key={original}
              onClick={() => valider(original)}
              disabled={mode === "pratique" && repondu}
              style={{
                textAlign: "left",
                padding: "13px 16px",
                borderRadius: 10,
                border: `1.5px solid ${bordure}`,
                background: fond,
                cursor: mode === "pratique" && repondu ? "default" : "pointer",
                fontSize: 15,
                lineHeight: 1.5,
                color: color.textBody,
              }}
            >
              {mode === "pratique" && repondu && estBonne && (
                <strong style={{ color: color.success, marginRight: 7 }}>✓</strong>
              )}
              {mode === "pratique" && repondu && estChoisi && !estBonne && (
                <strong style={{ color: color.danger, marginRight: 7 }}>✕</strong>
              )}
              {texte}
            </button>
          );
        })}
      </div>

      {/* Explication — uniquement en pratique */}
      {mode === "pratique" && repondu && (
        <div
          style={{
            borderLeft: `4px solid ${juste ? color.success : color.danger}`,
            background: color.bgLight,
            borderRadius: 9,
            padding: "14px 17px",
            marginBottom: 18,
          }}
        >
          <strong style={{ fontSize: 15, color: juste ? color.success : color.danger }}>
            {juste ? "Correct" : "Incorrect"}
          </strong>
          <p style={{ margin: "7px 0 0", fontSize: 14.5, lineHeight: 1.7, color: color.textBody }}>
            {courante.why}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {mode === "pratique" ? (
          repondu && (
            <button onClick={suivante} style={styleBouton(true)}>
              Question suivante →
            </button>
          )
        ) : (
          <>
            <button onClick={suivante} disabled={choisi === null} style={styleBouton(choisi !== null)}>
              {index + 1 === questions.length ? "Terminer" : "Suivante →"}
            </button>
            {index > 0 && (
              <button
                onClick={() => {
                  setIndex((i) => i - 1);
                  setChoisi(copie[index - 1] ?? null);
                }}
                style={styleBouton(false)}
              >
                ← Précédente
              </button>
            )}
          </>
        )}
        <Link
          href={`/trading/${niveau.slug}`}
          style={{ marginLeft: "auto", fontSize: 13, color: color.textMuted, textDecoration: "none" }}
        >
          Quitter
        </Link>
      </div>
    </Cadre>
  );
}

function styleBouton(principal: boolean): React.CSSProperties {
  return {
    padding: "12px 22px",
    borderRadius: 10,
    border: principal ? "none" : `1.5px solid ${color.border}`,
    background: principal ? gradient.gold : color.white,
    color: principal ? color.navyDeep : color.textBody,
    fontWeight: principal ? 800 : 600,
    fontSize: 14.5,
    cursor: "pointer",
    opacity: 1,
  };
}

function Bouton({
  href,
  children,
  principal,
}: {
  href: string;
  children: React.ReactNode;
  principal?: boolean;
}) {
  return (
    <Link href={href} style={{ ...styleBouton(!!principal), textDecoration: "none", display: "inline-block" }}>
      {children}
    </Link>
  );
}

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: color.bgLight, minHeight: "100vh", padding: "28px 18px 70px" }}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: color.white,
          border: `1px solid ${color.border}`,
          borderRadius: 14,
          padding: "24px 26px",
          boxShadow: "0 6px 22px rgba(6,13,26,.07)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
