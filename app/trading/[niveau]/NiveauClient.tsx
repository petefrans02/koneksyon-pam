"use client";

/**
 * Page d'un niveau : ses leçons, ses compétences, son entraînement.
 *
 * Le verrou est appliqué ici aussi, pas seulement sur la carte des niveaux —
 * sinon il suffirait de taper l'URL pour contourner la progression. Un niveau
 * non débloqué affiche ce qu'il faut faire pour y accéder au lieu de son
 * contenu.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { getLevel } from "@/lib/trading/curriculum";
import { isLevelAccessible, isMastered, levelMastery, levelState, markLessonRead } from "@/lib/trading/progress";
import { questionsForLevel } from "@/lib/trading/questions";
import { saveStudent, useStudent } from "@/lib/trading/store";
import { useAdminAccess } from "@/lib/trading/access";
import { color, gradient } from "@/lib/design";

export default function NiveauClient({ slug }: { slug: string }) {
  const niveau = getLevel(slug)!;
  const student = useStudent();
  const admin = useAdminAccess();
  const [ouverte, setOuverte] = useState<string | null>(null);

  const debloque = isLevelAccessible(student, niveau, admin);
  const maitrise = levelMastery(student, niveau);
  const etat = levelState(student, slug);
  const nbQuestions = useMemo(() => questionsForLevel(slug).length, [slug]);

  const precedent = useMemo(
    () => (niveau.n > 1 ? getLevel(getSlugParNumero(niveau.n - 1)) : undefined),
    [niveau.n],
  );

  function lire(lessonSlug: string) {
    setOuverte((cur) => (cur === lessonSlug ? null : lessonSlug));
    saveStudent(markLessonRead(student, slug, lessonSlug));
  }

  return (
    <div style={{ background: color.bgLight, minHeight: "100vh" }}>
      {/* Bandeau */}
      <div style={{ background: gradient.navy, padding: "44px 18px 34px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/trading" style={{ color: "#c8daf0", fontSize: 13.5, textDecoration: "none" }}>
            ← Académie Trading
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 12 }}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: niveau.color,
                color: color.white,
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              {niveau.n}
            </span>
            <h1 style={{ margin: 0, fontSize: "clamp(24px,4vw,34px)", color: color.white, fontWeight: 800 }}>
              {niveau.title.fr}
            </h1>
          </div>
          <p style={{ color: "#c8daf0", fontSize: 16, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 620 }}>
            {niveau.tagline.fr}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "26px 18px 70px" }}>
        {!debloque ? (
          <Bloc
            titre="Niveau verrouillé"
            ton={color.warning}
            texte={`Il faut d'abord valider le niveau ${niveau.n - 1}${
              precedent ? ` — ${precedent.title.fr}` : ""
            } : maîtriser toutes ses compétences et réussir son examen. Ce n'est pas une formalité : sauter une étape ici, c'est se retrouver à gérer du risque sans savoir lire une bougie.`}
            lien={precedent ? { href: `/trading/${precedent.slug}`, label: `Aller au niveau ${precedent.n}` } : undefined}
          />
        ) : (
          <>
            {/* Pourquoi ce niveau */}
            <div
              style={{
                background: color.white,
                border: `1px solid ${color.border}`,
                borderRadius: 12,
                padding: "18px 20px",
                marginBottom: 22,
              }}
            >
              <h2 style={{ margin: "0 0 8px", fontSize: 15, color: color.textMuted, fontWeight: 700 }}>
                Pourquoi ce niveau
              </h2>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: color.textBody }}>
                {niveau.why.fr}
              </p>
            </div>

            {/* Compétences */}
            <h2 style={{ fontSize: 19, color: color.textDark, margin: "0 0 12px", fontWeight: 800 }}>
              Compétences à démontrer{" "}
              <span style={{ fontSize: 14, color: color.textFaint, fontWeight: 600 }}>
                — {Math.round(maitrise * 100)}% maîtrisé
              </span>
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
              {niveau.skills.map((sk) => {
                const acquise = isMastered(student.skills[sk.key]);
                return (
                  <span
                    key={sk.key}
                    style={{
                      fontSize: 13,
                      padding: "6px 12px",
                      borderRadius: 99,
                      background: acquise ? "#eaf7ee" : color.white,
                      border: `1px solid ${acquise ? color.success : color.border}`,
                      color: acquise ? color.success : color.textMuted,
                      fontWeight: acquise ? 700 : 500,
                    }}
                  >
                    {acquise ? "✓ " : ""}
                    {sk.label.fr}
                  </span>
                );
              })}
            </div>

            {/* Leçons */}
            {niveau.lessons.length > 0 ? (
              <>
                <h2 style={{ fontSize: 19, color: color.textDark, margin: "0 0 12px", fontWeight: 800 }}>
                  Leçons
                </h2>
                <div style={{ display: "grid", gap: 10, marginBottom: 26 }}>
                  {niveau.lessons.map((lec, i) => {
                    const lue = student.levels[slug]?.lessonsRead.includes(lec.slug);
                    const ouvert = ouverte === lec.slug;
                    return (
                      <div
                        key={lec.slug}
                        style={{
                          background: color.white,
                          border: `1px solid ${ouvert ? color.borderBlue : color.border}`,
                          borderRadius: 12,
                          overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() => lire(lec.slug)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 13,
                            padding: "15px 18px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              width: 27,
                              height: 27,
                              borderRadius: 99,
                              background: lue ? color.success : color.grayLight,
                              color: lue ? color.white : color.textMuted,
                              display: "grid",
                              placeItems: "center",
                              fontSize: 12.5,
                              fontWeight: 700,
                            }}
                          >
                            {lue ? "✓" : i + 1}
                          </span>
                          <span style={{ flex: 1, fontSize: 15.5, fontWeight: 700, color: color.textDark }}>
                            {lec.title.fr}
                          </span>
                          <span style={{ color: color.textFaint, fontSize: 15 }}>{ouvert ? "−" : "+"}</span>
                        </button>

                        {ouvert && (
                          <div style={{ padding: "0 18px 20px" }}>
                            {lec.outcome?.fr && (
                              <div
                                style={{
                                  fontSize: 13.5,
                                  color: color.info,
                                  background: "#f0f9fb",
                                  border: `1px solid ${color.borderBlue}`,
                                  borderRadius: 8,
                                  padding: "9px 13px",
                                  marginBottom: 14,
                                }}
                              >
                                <strong>À la fin, tu sauras :</strong> {lec.outcome.fr}
                              </div>
                            )}

                            {lec.content.fr?.split("\n\n").map((par, k) => (
                              <p
                                key={k}
                                style={{
                                  fontSize: 15.5,
                                  lineHeight: 1.75,
                                  color: color.textBody,
                                  margin: "0 0 13px",
                                }}
                                dangerouslySetInnerHTML={{ __html: gras(par) }}
                              />
                            ))}

                            {lec.keyPoints?.fr && (
                              <div
                                style={{
                                  background: color.goldPale,
                                  border: `1px solid ${color.goldLight}`,
                                  borderRadius: 9,
                                  padding: "13px 17px",
                                  marginTop: 6,
                                }}
                              >
                                <strong style={{ fontSize: 13, color: color.gold, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                  À retenir
                                </strong>
                                <ul style={{ margin: "9px 0 0", paddingLeft: 19 }}>
                                  {lec.keyPoints.fr.map((p, k) => (
                                    <li
                                      key={k}
                                      style={{ fontSize: 14.5, lineHeight: 1.6, color: color.textBody, marginBottom: 5 }}
                                    >
                                      {p}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {lec.activities?.some((a) => a.kind === "drill_bougie") && (
                              <Link
                                href="/trading/entrainement"
                                style={{
                                  display: "inline-block",
                                  marginTop: 15,
                                  padding: "11px 20px",
                                  borderRadius: 10,
                                  background: gradient.gold,
                                  color: color.navyDeep,
                                  fontWeight: 800,
                                  fontSize: 14.5,
                                  textDecoration: "none",
                                }}
                              >
                                Passer à la pratique →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Valider le niveau : pratique, entraînement, examen */}
                <h2 style={{ fontSize: 19, color: color.textDark, margin: "26px 0 6px", fontWeight: 800 }}>
                  Valider le niveau
                </h2>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: color.textMuted, margin: "0 0 14px" }}>
                  Lire les leçons ne valide rien. Il faut <strong>maîtriser les {niveau.skills.length}{" "}
                  compétences</strong> en pratique <strong>et</strong> réussir l’examen à{" "}
                  {niveau.passingScore}%. Les deux sont exigés.
                </p>

                <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
                  <Action
                    href={`/trading/${niveau.slug}/pratique`}
                    titre="Pratique corrigée"
                    detail={`${nbQuestions} questions, correction et raisonnement après chaque réponse. C’est ici que la maîtrise se construit.`}
                    ton={niveau.color}
                    disponible={nbQuestions > 0}
                  />
                  {niveau.slug === "bougies" && (
                    <Action
                      href="/trading/entrainement"
                      titre="Entraînement sur graphiques"
                      detail="« Que va faire le marché ensuite ? » — graphiques illimités, correction expliquée."
                      ton={color.gold}
                      disponible
                    />
                  )}
                  {niveau.slug === "momentum" && (
                    <Action
                      href="/trading/tempo"
                      titre="Où va le momentum ?"
                      detail="Accélération, essoufflement, ou agitation sans progression ? La correction montre les trois mesures brutes."
                      ton="#ea580c"
                      disponible
                    />
                  )}
                  {niveau.slug === "institutions" && (
                    <Action
                      href="/trading/cassures"
                      titre="Vraie ou fausse cassure ?"
                      detail="Le niveau est franchi — mais la clôture le confirme-t-elle ? Le niveau n'est révélé qu'après ta réponse."
                      ton={color.navy}
                      disponible
                    />
                  )}
                  {niveau.slug === "price-action" && (
                    <Action
                      href="/trading/structure"
                      titre="Lire la structure"
                      detail="« Haussière, baissière ou range ? » — la correction révèle les pivots et les étiquettes HH/HL/LH/LL."
                      ton={color.cyan}
                      disponible
                    />
                  )}
                  <Action
                    href={`/trading/${niveau.slug}/examen`}
                    titre="Examen du niveau"
                    detail={
                      etat.examScore === null
                        ? `${Math.min(12, nbQuestions)} questions, au moins une par compétence. Aucune correction avant la fin.`
                        : `Meilleur score : ${etat.examScore}% (seuil ${niveau.passingScore}%) sur ${etat.examAttempts} tentative${etat.examAttempts > 1 ? "s" : ""}. Repasser tire de nouvelles questions.`
                    }
                    ton={etat.examScore !== null && etat.examScore >= niveau.passingScore ? color.success : color.info}
                    disponible={nbQuestions > 0}
                    badge={
                      etat.examScore === null
                        ? undefined
                        : etat.examScore >= niveau.passingScore
                          ? "Réussi"
                          : "À repasser"
                    }
                  />
                </div>
              </>
            ) : (
              <Bloc
                titre="Contenu en cours de rédaction"
                ton={color.textMuted}
                texte="Le programme et les compétences de ce niveau sont arrêtés — les leçons arrivent. En attendant, consolide les niveaux précédents : c'est ce qui rendra celui-ci facile."
                lien={{ href: "/trading/entrainement", label: "S'entraîner sur les bougies" }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** `**gras**` → `<strong>`. Le contenu vient de nos propres fichiers, pas d'une saisie utilisateur. */
function gras(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function getSlugParNumero(n: number): string {
  const slugs = [
    "fondations", "bougies", "price-action", "institutions", "momentum",
    "probabilites", "gestion-du-risque", "psychologie", "strategie", "autonomie",
  ];
  return slugs[n - 1] ?? "fondations";
}

/** Carte d'action cliquable — pratique, entraînement, examen. */
function Action({
  href,
  titre,
  detail,
  ton,
  disponible,
  badge,
}: {
  href: string;
  titre: string;
  detail: string;
  ton: string;
  disponible: boolean;
  badge?: string;
}) {
  const corps = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        padding: "15px 18px",
        borderRadius: 11,
        background: color.white,
        border: `1px solid ${color.border}`,
        borderLeft: `4px solid ${ton}`,
        opacity: disponible ? 1 : 0.55,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 15.5, color: color.textDark }}>{titre}</strong>
          {badge && (
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: ton,
                border: `1px solid ${ton}`,
                borderRadius: 99,
                padding: "2px 8px",
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              {badge}
            </span>
          )}
          {!disponible && (
            <span style={{ fontSize: 11.5, color: color.textFaint }}>questions à venir</span>
          )}
        </div>
        <p style={{ margin: "5px 0 0", fontSize: 14, lineHeight: 1.6, color: color.textMuted }}>
          {detail}
        </p>
      </div>
      {disponible && <span style={{ color: ton, fontSize: 18, flexShrink: 0 }}>→</span>}
    </div>
  );
  return disponible ? (
    <Link href={href} style={{ textDecoration: "none" }}>
      {corps}
    </Link>
  ) : (
    corps
  );
}

function Bloc({
  titre,
  texte,
  ton,
  lien,
}: {
  titre: string;
  texte: string;
  ton: string;
  lien?: { href: string; label: string };
}) {
  return (
    <div
      style={{
        borderLeft: `4px solid ${ton}`,
        background: color.white,
        border: `1px solid ${color.border}`,
        borderLeftWidth: 4,
        borderLeftColor: ton,
        borderRadius: 10,
        padding: "17px 20px",
      }}
    >
      <strong style={{ fontSize: 16, color: color.textDark }}>{titre}</strong>
      <p style={{ margin: "8px 0 0", fontSize: 15, lineHeight: 1.65, color: color.textBody }}>{texte}</p>
      {lien && (
        <Link
          href={lien.href}
          style={{
            display: "inline-block",
            marginTop: 13,
            padding: "10px 18px",
            borderRadius: 9,
            background: color.navy,
            color: color.white,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          {lien.label}
        </Link>
      )}
    </div>
  );
}
