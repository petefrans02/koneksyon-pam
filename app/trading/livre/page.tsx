/**
 * LE LIVRE DES BOUGIES, dans l'académie.
 *
 * Neuf chapitres, trente-trois figures dessinées, quarante exercices corrigés.
 *
 * Composant **serveur**, et c'est un choix : le livre ne contient aucune
 * interaction qui exige du JavaScript. Les corrections d'exercices s'ouvrent
 * avec `<details>`, que le navigateur gère nativement. Résultat — la page est
 * prérendue à la compilation, elle s'affiche instantanément, elle fonctionne
 * sans JS, et son contenu est entièrement lisible par les moteurs de recherche.
 * Treize mille mots sur les bougies, c'est exactement le genre de page qu'on
 * veut voir indexée.
 *
 * Le HTML des sections est injecté tel quel. Il vient de `lib/trading/livre/`,
 * c'est-à-dire de ce dépôt — jamais d'une saisie utilisateur.
 */

import Link from "next/link";
import { alternates } from "@/lib/seo";
import { color, gradient } from "@/lib/design";
import { Chapitre, Niveau } from "@/lib/trading/livre/livre";
import { partie1 } from "@/lib/trading/livre/partie1";
import { partie2 } from "@/lib/trading/livre/partie2";
import { partie3 } from "@/lib/trading/livre/partie3";

export const metadata = {
  title: "Les bougies japonaises — étude complète, du débutant à l'avancé",
  description:
    "De Munehisa Homma à Sakata en 1750 jusqu'aux écrans d'aujourd'hui : anatomie d'une bougie, toutes les figures, pourquoi elles échouent, la lecture avancée et le passage au trade. 33 schémas et 40 exercices corrigés.",
  alternates: alternates("/trading/livre"),
};

const CHAPITRES: Chapitre[] = [...partie1, ...partie2, ...partie3];

const NIVEAUX: Record<Niveau, { label: string; ton: string }> = {
  debutant: { label: "Débutant", ton: color.success },
  intermediaire: { label: "Intermédiaire", ton: color.info },
  avance: { label: "Avancé", ton: color.gold },
};

/** Ancre stable, insensible aux accents. */
const ancre = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function Page() {
  const sections = CHAPITRES.reduce((n, c) => n + c.sections.length, 0);

  return (
    <div style={{ background: color.bgLight, minHeight: "100vh" }}>
      {/*
        Le corps des chapitres est du HTML injecté : il lui faut une feuille de
        style, là où le reste du site utilise des styles en ligne. Elle est
        posée ici plutôt qu'en global pour rester cantonnée au livre.
        Le sélecteur `.livre-corps` préfixe tout : rien ne peut déborder.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.livre-chap { margin-top: 56px; }
.livre-corps { font-size: 17px; line-height: 1.78; color: ${color.textBody}; }
.livre-corps p { margin: 0 0 15px; }
.livre-corps strong { color: ${color.navy}; }
.livre-corps ul, .livre-corps ol { margin: 0 0 15px; padding-left: 24px; }
.livre-corps li { margin-bottom: 7px; }
.livre-corps h4 { font-size: 18px; margin: 26px 0 8px; color: ${color.textDark}; font-weight: 800; }
.livre-corps code { font-family: ui-monospace, Menlo, monospace; font-size: .9em; background: ${color.grayLight}; padding: 1px 5px; border-radius: 4px; }

/* Figures */
.livre-corps .bloc-fig { margin: 24px 0; padding: 16px 18px 12px; background: ${color.white}; border: 1px solid ${color.border}; border-radius: 12px; text-align: center; break-inside: avoid; }
.livre-corps .fig { width: 100%; height: auto; max-width: 520px; }
.livre-corps figcaption { margin-top: 9px; font-size: 15px; line-height: 1.62; color: ${color.textMuted}; text-align: left; }
.livre-corps figcaption b { color: ${color.textDark}; }
.livre-corps .paire { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 24px 0; }
.livre-corps .paire .bloc-fig { margin: 0; }
@media (max-width: 640px) { .livre-corps .paire { grid-template-columns: 1fr; } }

/* Encadrés */
.livre-corps .definition, .livre-corps .piege, .livre-corps .retenir, .livre-corps .note {
  margin: 20px 0; padding: 15px 19px; border-radius: 10px; font-size: 16.5px; line-height: 1.72; break-inside: avoid;
}
.livre-corps .definition { background: #f2f7fc; border-left: 4px solid ${color.navy}; }
.livre-corps .piege { background: #fdeeee; border-left: 4px solid ${color.danger}; }
.livre-corps .retenir { background: ${color.goldPale}; border-left: 4px solid ${color.gold}; }
.livre-corps .note { background: ${color.white}; border: 1px solid ${color.border}; color: ${color.textMuted}; font-size: 16px; }
.livre-corps .terme, .livre-corps .etiq {
  display: block; font-size: 12px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase; margin-bottom: 6px;
}
.livre-corps .terme { color: ${color.navy}; }
.livre-corps .piege .etiq { color: ${color.danger}; }
.livre-corps .retenir .etiq { color: ${color.gold}; }

/* Tableaux */
.livre-corps table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15.5px; line-height: 1.6; }
.livre-corps th, .livre-corps td { text-align: left; padding: 9px 12px; border-bottom: 1px solid ${color.border}; vertical-align: top; }
.livre-corps th { font-weight: 800; color: ${color.navy}; background: ${color.bgWarm}; font-size: 14px; }
.livre-corps .tableau-defile { overflow-x: auto; }

/* Exercices */
.livre-corps .exos { margin: 32px 0; padding: 22px 24px; background: #f4f8fc; border: 1px solid ${color.borderBlue}; border-radius: 13px; }
.livre-corps .exos-titre { margin: 0 0 4px; font-size: 20px; color: ${color.navy}; font-weight: 800; }
.livre-corps .exo { margin-top: 20px; padding-top: 18px; border-top: 1px solid ${color.borderBlue}; break-inside: avoid; }
.livre-corps .exo:first-of-type { border-top: none; padding-top: 6px; }
.livre-corps .exo-tete { display: flex; gap: 12px; align-items: baseline; }
.livre-corps .exo-n { flex-shrink: 0; width: 27px; height: 27px; border-radius: 7px; background: ${color.info}; color: ${color.white}; display: grid; place-items: center; font-size: 13.5px; font-weight: 800; }
.livre-corps .exo-enonce { flex: 1; font-size: 16.5px; }
.livre-corps .choix { margin: 10px 0 0 39px; }
.livre-corps details { margin: 12px 0 0 39px; }
.livre-corps summary { cursor: pointer; font-size: 15px; font-weight: 700; color: ${color.info}; padding: 6px 0; }
.livre-corps summary:hover { color: ${color.navy}; }
.livre-corps .correction { margin-top: 8px; padding: 13px 17px; background: ${color.white}; border-left: 3px solid ${color.success}; border-radius: 8px; font-size: 16px; }

/* Impression : « Imprimer » doit donner un PDF propre. */
@media print {
  .livre-chap { break-before: page; margin-top: 0; }
  .livre-corps details { display: block; }
  .livre-corps details summary { display: none; }
  .livre-corps .correction { border-left-color: #999; }
}
`,
        }}
      />

      {/* Bandeau */}
      <div style={{ background: gradient.navy, padding: "44px 18px 38px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Link href="/trading" style={{ color: "#c8daf0", fontSize: 13.5, textDecoration: "none" }}>
            ← Académie Trading
          </Link>
          <div
            style={{
              marginTop: 16,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: color.goldLight,
            }}
          >
            Le livre
          </div>
          <h1
            style={{
              margin: "9px 0 0",
              fontSize: "clamp(28px,5vw,44px)",
              lineHeight: 1.12,
              color: color.white,
              fontWeight: 800,
              letterSpacing: "-.02em",
            }}
          >
            Les bougies japonaises
          </h1>
          <p style={{ margin: "12px 0 0", fontSize: 17.5, color: "#c8daf0", fontStyle: "italic" }}>
            Étude complète, du débutant au niveau avancé
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
            {[
              `${CHAPITRES.length} chapitres`,
              `${sections} sections`,
              "33 schémas",
              "40 exercices corrigés",
            ].map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: "5px 12px",
                  borderRadius: 99,
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.16)",
                  color: "#c8daf0",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "26px 18px 80px" }}>
        {/* Sommaire */}
        <nav
          style={{
            background: color.white,
            border: `1px solid ${color.border}`,
            borderRadius: 13,
            padding: "22px 24px",
            marginBottom: 12,
          }}
          aria-label="Sommaire"
        >
          <h2
            style={{
              margin: "0 0 15px",
              fontSize: 13,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: color.textFaint,
              fontWeight: 700,
            }}
          >
            Sommaire
          </h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {CHAPITRES.map((c) => {
              const niv = NIVEAUX[c.niveau];
              return (
                <li key={c.n} style={{ marginBottom: 13 }}>
                  <a
                    href={`#ch${c.n}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      textDecoration: "none",
                      color: color.textDark,
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        background: color.navy,
                        color: color.white,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {c.n}
                    </span>
                    {c.titre}
                  </a>
                  <span
                    style={{
                      marginLeft: 9,
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: niv.ton,
                      border: `1px solid ${niv.ton}`,
                      borderRadius: 99,
                      padding: "3px 8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {niv.label}
                  </span>
                  <ul style={{ listStyle: "none", margin: "7px 0 0 36px", padding: 0 }}>
                    {c.sections.map((s) => (
                      <li key={s.titre} style={{ marginBottom: 3 }}>
                        <a
                          href={`#${ancre(c.titre + "-" + s.titre)}`}
                          style={{ color: color.textMuted, textDecoration: "none", fontSize: 14.5 }}
                        >
                          {s.titre}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Les chapitres */}
        {CHAPITRES.map((c) => {
          const niv = NIVEAUX[c.niveau];
          return (
            <section key={c.n} id={`ch${c.n}`} className="livre-chap">
              <header
                style={{
                  paddingBottom: 16,
                  borderBottom: `1px solid ${color.border}`,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 7 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1.6,
                      textTransform: "uppercase",
                      color: color.gold,
                    }}
                  >
                    Chapitre {c.n}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: niv.ton,
                      border: `1px solid ${niv.ton}`,
                      borderRadius: 99,
                      padding: "3px 8px",
                    }}
                  >
                    {niv.label}
                  </span>
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "clamp(24px,4vw,33px)",
                    lineHeight: 1.15,
                    color: color.textDark,
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                  }}
                >
                  {c.titre}
                </h2>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 17.5,
                    lineHeight: 1.6,
                    color: color.textMuted,
                    fontStyle: "italic",
                  }}
                >
                  {c.accroche}
                </p>
              </header>

              {c.sections.map((s) => (
                <div
                  key={s.titre}
                  id={ancre(c.titre + "-" + s.titre)}
                  style={{ marginTop: 34, scrollMarginTop: 16 }}
                >
                  <h3
                    style={{
                      fontSize: 22,
                      margin: "0 0 12px",
                      color: color.textDark,
                      fontWeight: 800,
                      letterSpacing: "-.01em",
                    }}
                  >
                    {s.titre}
                  </h3>
                  {/* Contenu rédigé dans ce dépôt — jamais une saisie utilisateur. */}
                  <div className="livre-corps" dangerouslySetInnerHTML={{ __html: s.html }} />
                </div>
              ))}
            </section>
          );
        })}

        <footer
          style={{
            marginTop: 54,
            paddingTop: 20,
            borderTop: `1px solid ${color.border}`,
            color: color.textFaint,
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          <p>
            <strong>Contenu éducatif.</strong> Ce livre enseigne à lire un graphique. Il ne
            constitue ni un conseil financier ni une recommandation d&apos;investissement.
          </p>
          <p>
            Les figures de bougies déplacent des probabilités, elles ne décident de rien. Une
            figure démentie n&apos;est pas une erreur de lecture : c&apos;est le métier. Tout ce
            qui est enseigné ici n&apos;a de valeur qu&apos;associé à une gestion du risque — le
            chapitre 8 est le plus important du livre, et c&apos;est celui qu&apos;on saute.
          </p>
          <p>
            Les 33 schémas sont tracés à partir de valeurs OHLC réelles : les proportions sont
            exactes et vérifiables.
          </p>
        </footer>
      </div>
    </div>
  );
}
