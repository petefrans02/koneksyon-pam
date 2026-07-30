"use client";

/**
 * Carte des niveaux — la page d'accueil de l'Académie Trading.
 *
 * Elle doit répondre à trois questions en un écran : où j'en suis, ce que je
 * fais maintenant, et où ça mène. Les niveaux verrouillés restent visibles :
 * voir le chemin motive, et masquer la suite donnerait l'impression d'un cours
 * sans fin. En revanche ils ne sont pas cliquables — la règle de progression
 * n'est pas décorative.
 */

import Link from "next/link";
import { LEVELS, TOTAL_SKILLS } from "@/lib/trading/curriculum";
import {
  isLevelAccessible,
  isLevelPassed,
  isMastered,
  levelMastery,
  overview,
} from "@/lib/trading/progress";
import { useStudent } from "@/lib/trading/store";
import { useAdminAccess } from "@/lib/trading/access";
import { color, gradient } from "@/lib/design";

export default function AcademieTradingClient() {
  // La progression vient du store externe : rendu serveur avec l'état vide,
  // puis reprise automatique de la valeur enregistrée dans le navigateur.
  const student = useStudent();
  // Un admin ouvre tous les niveaux sans les valider (voir access.ts).
  const admin = useAdminAccess();
  const vue = overview(student);

  return (
    <div style={{ background: color.bgLight, minHeight: "100vh" }}>
      {/* Bandeau */}
      <div style={{ background: gradient.navy, padding: "56px 18px 42px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11.5,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: color.goldLight,
              border: `1px solid ${color.goldWarm}`,
              borderRadius: 99,
              padding: "4px 13px",
              marginBottom: 16,
            }}
          >
            Académie Trading
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(28px,5vw,44px)",
              lineHeight: 1.14,
              color: color.white,
              fontWeight: 800,
              maxWidth: 720,
            }}
          >
            Apprends à lire le marché, pas à mémoriser des stratégies.
          </h1>
          <p
            style={{
              color: "#c8daf0",
              fontSize: 16.5,
              lineHeight: 1.65,
              maxWidth: 640,
              margin: "16px 0 28px",
            }}
          >
            Dix niveaux, du fonctionnement d’un marché jusqu’à l’analyse autonome. Chaque
            compétence doit être démontrée avant de débloquer la suivante — on ne passe pas
            en cliquant «&nbsp;suivant&nbsp;».
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/trading/entrainement"
              style={{
                padding: "14px 26px",
                borderRadius: 11,
                background: gradient.gold,
                color: color.navyDeep,
                fontWeight: 800,
                fontSize: 15.5,
                textDecoration: "none",
              }}
            >
              Commencer l’entraînement
            </Link>
            <Link
              href={`/trading/${vue.currentLevel.slug}`}
              style={{
                padding: "14px 24px",
                borderRadius: 11,
                border: `1.5px solid ${color.borderBlue}`,
                color: color.white,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              Reprendre : {vue.currentLevel.title.fr}
            </Link>
          </div>
        </div>
      </div>

      {/* Bandeau de progression */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 18px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 12,
          }}
        >
          <Carte titre="Rang" valeur={vue.rank.label} />
          <Carte titre="XP" valeur={String(student.xp)} accent />
          <Carte titre="Compétences" valeur={`${vue.skillsMastered} / ${TOTAL_SKILLS}`} />
          <Carte titre="Niveaux validés" valeur={`${vue.passed} / ${LEVELS.length}`} />
          <Carte titre="Série" valeur={`${student.streak} j`} />
        </div>
      </div>

      {/* Les niveaux */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "30px 18px 70px" }}>
        <h2 style={{ fontSize: 21, color: color.textDark, margin: "0 0 16px", fontWeight: 800 }}>
          Le parcours
        </h2>
        {admin && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "10px 14px",
              borderRadius: 10,
              background: color.goldPale,
              border: `1px solid ${color.goldLight}`,
              marginBottom: 14,
              fontSize: 13.5,
              color: color.textBody,
            }}
          >
            <strong style={{ color: color.gold }}>Accès administrateur</strong>
            <span>
              tous les niveaux sont ouverts, sans validation. Le verrou reste actif pour les élèves.
            </span>
          </div>
        )}
        <div style={{ display: "grid", gap: 12 }}>
          {LEVELS.map((niv) => {
            const ouvert = isLevelAccessible(student, niv, admin);
            const valide = isLevelPassed(student, niv);
            const maitrise = levelMastery(student, niv);
            // Les niveaux 6 à 10 ne sont pas verrouillés, ils sont vides. Un
            // admin doit pouvoir les ouvrir quand même pour relire leur
            // structure et leurs compétences ; un élève n'y trouverait rien.
            const accessible = ouvert && (niv.status === "pret" || admin);

            const contenu = (
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  padding: "18px 20px",
                  borderRadius: 13,
                  background: color.white,
                  border: `1px solid ${valide ? color.success : accessible ? color.borderBlue : color.border}`,
                  opacity: accessible ? 1 : 0.62,
                }}
              >
                {/* Numéro */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background: accessible ? niv.color : color.grayLight,
                    color: accessible ? color.white : color.textFaint,
                    fontWeight: 800,
                    fontSize: 17,
                  }}
                >
                  {valide ? "✓" : niv.n}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 17, color: color.textDark }}>{niv.title.fr}</strong>
                    {niv.status === "bientot" && <Puce texte="Bientôt" ton={color.textMuted} />}
                    {!ouvert && niv.status === "pret" && <Puce texte="Verrouillé" ton={color.warning} />}
                    {valide && <Puce texte="Validé" ton={color.success} />}
                  </div>
                  <p style={{ margin: "5px 0 0", fontSize: 14, color: color.textMuted, lineHeight: 1.55 }}>
                    {niv.tagline.fr}
                  </p>

                  {/* Barre de maîtrise, seulement là où c'est pertinent */}
                  {accessible && niv.skills.length > 0 && (
                    <div style={{ marginTop: 11 }}>
                      <div
                        style={{
                          height: 5,
                          borderRadius: 99,
                          background: color.grayLight,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.round(maitrise * 100)}%`,
                            height: "100%",
                            background: niv.color,
                            transition: "width .4s",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11.5, color: color.textFaint, marginTop: 5 }}>
                        {niv.skills.filter((sk) => isMastered(student.skills[sk.key])).length} /{" "}
                        {niv.skills.length} compétences · {niv.lessons.length} leçons · examen à{" "}
                        {niv.passingScore}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );

            return accessible ? (
              <Link key={niv.slug} href={`/trading/${niv.slug}`} style={{ textDecoration: "none" }}>
                {contenu}
              </Link>
            ) : (
              <div key={niv.slug}>{contenu}</div>
            );
          })}
        </div>

        <p style={{ fontSize: 12.5, color: color.textFaint, marginTop: 26, lineHeight: 1.7 }}>
          Contenu éducatif. Rien ici n’est un conseil financier ni une recommandation
          d’investissement. Le trading comporte un risque de perte en capital.
        </p>
      </div>
    </div>
  );
}

function Carte({ titre, valeur, accent }: { titre: string; valeur: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: "13px 16px",
        borderRadius: 11,
        background: accent ? color.goldPale : color.white,
        border: `1px solid ${accent ? color.goldLight : color.border}`,
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          color: color.textMuted,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {titre}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color.textDark, marginTop: 2 }}>
        {valeur}
      </div>
    </div>
  );
}

function Puce({ texte, ton }: { texte: string; ton: string }) {
  return (
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
      {texte}
    </span>
  );
}
