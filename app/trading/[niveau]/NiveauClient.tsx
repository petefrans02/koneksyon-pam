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
import { isLevelUnlocked, isMastered, levelMastery, markLessonRead } from "@/lib/trading/progress";
import { saveStudent, useStudent } from "@/lib/trading/store";
import { color, gradient } from "@/lib/design";

export default function NiveauClient({ slug }: { slug: string }) {
  const niveau = getLevel(slug)!;
  const student = useStudent();
  const [ouverte, setOuverte] = useState<string | null>(null);

  const debloque = isLevelUnlocked(student, niveau);
  const maitrise = levelMastery(student, niveau);

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

                {/* Pratique */}
                {niveau.slug === "bougies" && (
                  <Bloc
                    titre="L'entraînement est le cœur de ce niveau"
                    ton={color.gold}
                    texte="Lire les leçons ne suffit pas à valider les compétences : il faut les démontrer. L'entraînement génère des graphiques illimités et corrige chaque réponse."
                    lien={{ href: "/trading/entrainement", label: "Lancer l'entraînement" }}
                  />
                )}
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
