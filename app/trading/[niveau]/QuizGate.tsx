"use client";

/**
 * Portier des activités d'un niveau.
 *
 * Il fait deux choses que la page serveur ne peut pas faire, parce qu'elles
 * dépendent de la progression de l'élève (qui vit côté navigateur) :
 *
 * 1. **Refermer le verrou.** Un niveau non débloqué ne doit pas être
 *    praticable en tapant l'URL directement.
 * 2. **Tirer le jeu de questions.** Pour l'examen, la graine dépend du nombre
 *    de tentatives déjà passées : chaque nouveau passage donne un examen
 *    différent, mais reproductible.
 */

import Link from "next/link";
import { Level } from "@/lib/trading/curriculum";
import { Question, examSelection, shuffle } from "@/lib/trading/questions";
import { isLevelUnlocked, levelState } from "@/lib/trading/progress";
import { useStudent } from "@/lib/trading/store";
import { color } from "@/lib/design";
import QuizRunner from "./QuizRunner";

/** Nombre de questions d'un examen, borné par ce qui est disponible. */
const TAILLE_EXAMEN = 12;

export default function QuizGate({
  niveau,
  questions,
  mode,
}: {
  niveau: Level;
  questions: Question[];
  mode: "pratique" | "examen";
}) {
  const student = useStudent();
  const ouvert = isLevelUnlocked(student, niveau);
  const etat = levelState(student, niveau.slug);

  if (!ouvert) {
    return (
      <div style={{ background: color.bgLight, minHeight: "100vh", padding: "40px 18px" }}>
        <div
          style={{
            maxWidth: 620,
            margin: "0 auto",
            background: color.white,
            border: `1px solid ${color.border}`,
            borderLeft: `4px solid ${color.warning}`,
            borderRadius: 12,
            padding: "22px 24px",
          }}
        >
          <strong style={{ fontSize: 17, color: color.textDark }}>Niveau verrouillé</strong>
          <p style={{ margin: "9px 0 0", fontSize: 15, lineHeight: 1.7, color: color.textBody }}>
            Cette activité appartient au niveau {niveau.n}, qui n’est pas encore débloqué. Il faut
            d’abord valider le niveau précédent — maîtriser ses compétences et réussir son examen.
          </p>
          <Link
            href="/trading"
            style={{
              display: "inline-block",
              marginTop: 15,
              padding: "10px 18px",
              borderRadius: 9,
              background: color.navy,
              color: color.white,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Retour au parcours
          </Link>
        </div>
      </div>
    );
  }

  const jeu =
    mode === "examen"
      ? examSelection(
          niveau.slug,
          niveau.skills.map((s) => s.key),
          Math.min(TAILLE_EXAMEN, questions.length),
          // La graine change à chaque tentative : questions différentes,
          // mais un examen donné reste rejouable à l'identique.
          1000 + etat.examAttempts * 97,
        )
      : shuffle(questions, 500 + student.xp);

  return <QuizRunner niveau={niveau} questions={jeu} mode={mode} />;
}
