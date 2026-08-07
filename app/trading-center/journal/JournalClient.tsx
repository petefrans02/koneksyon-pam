"use client";

/**
 * LE JOURNAL DE PERFORMANCE.
 *
 * L'écran qui répond à « est-ce que ça marche ? », et qui a le droit de
 * répondre « on ne sait pas encore ».
 *
 * ── Trois refus, hérités de l'Académie et tenus ici aussi ─────────────────
 *
 * 1. **Aucun taux de réussite sous 20 trades clôturés.** À la place, le
 *    nombre qui manque. Sur douze signaux, sept gagnants font 58 % et six en
 *    font 50 % : l'écart est du bruit pur, et l'afficher fabrique une
 *    certitude que les données ne portent pas.
 *
 * 2. **La courbe de capital est en R, jamais en dollars.** Un mois à
 *    +3 000 $ pris avec un risque triplé est un moins bon mois qu'un mois à
 *    +1 200 $, et un relevé en dollars montrerait exactement l'inverse.
 *
 * 3. **Le tableau par tranche de confiance est affiché même quand il est
 *    gênant.** C'est le seul tableau de la page capable de démontrer que le
 *    score ne sert à rien — si les signaux à 90 gagnent autant que ceux à 98,
 *    le barème ne discrimine pas et il faut le refaire. Le retirer serait
 *    confortable, et malhonnête.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Statistiques } from "@/lib/trading-center/types";
import {
  Bouton,
  Carte,
  LIBELLE_SESSION,
  Squelette,
  Titre,
  Tuile,
  Vide,
  chiffres,
  tc,
  texteFaible,
} from "../ui";

interface Reponse {
  plan: string;
  global: Statistiques;
  manque_pour_conclure: number;
  rapports: { periode: string; debut: string; stats: Statistiques }[];
  courbe: { t: string; r: number; cumul: number; id: string }[];
  par_confiance: { tranche: string; total: number; taux: number | null; r: number }[];
  par_session: { session: string; total: number; taux: number | null; r: number }[];
}

const NOM_PERIODE: Record<string, string> = {
  jour: "Aujourd'hui",
  semaine: "Cette semaine",
  mois: "Ce mois",
  tout: "Depuis le début",
};

export default function JournalClient() {
  const [data, setData] = useState<Reponse | null>(null);
  const [refus, setRefus] = useState(false);

  useEffect(() => {
    fetch("/api/trading-center/journal", { cache: "no-store" })
      .then((r) => (r.status === 403 ? (setRefus(true), null) : r.json()))
      .then((j) => j && setData(j))
      .catch(() => setRefus(true));
  }, []);

  const fond = { minHeight: "100vh", background: `radial-gradient(1100px 560px at 50% -8%,#0d1f3d 0%,${tc.fond} 62%)`, color: tc.texte };

  if (refus) {
    return (
      <div style={fond}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "70px 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 25, fontWeight: 800, marginBottom: 12 }}>Journal réservé au Premium</h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.8, color: tc.texteDoux, marginBottom: 24 }}>
            Les statistiques globales restent publiques sur le tableau de bord — tu peux vérifier
            que le système est honnête sans payer. Le journal détaillé, lui, est l&apos;outil de
            travail : courbe de capital, performance par séance et par tranche de confiance.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Bouton href="/trading-center/premium">Voir les formules</Bouton>
            <Bouton href="/trading-center" variante="fantome">
              ← Tableau de bord
            </Bouton>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={fond}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "26px 18px", display: "grid", gap: 14 }}>
          <Squelette hauteur={100} />
          <Squelette hauteur={200} />
          <Squelette hauteur={300} />
        </div>
      </div>
    );
  }

  const g = data.global;

  return (
    <div style={fond}>
      <style>{`@keyframes tcPulse{0%,100%{background-position:200% 0}50%{background-position:0 0}}`}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 18px 80px" }}>
        <Link href="/trading-center" style={{ fontSize: 12.5, color: tc.texteDoux, textDecoration: "none" }}>
          ← Trading Center
        </Link>

        <h1 style={{ margin: "12px 0 8px", fontSize: "clamp(25px,4.4vw,36px)", fontWeight: 900, letterSpacing: -1 }}>
          Journal de performance
        </h1>
        <p style={{ margin: "0 0 26px", fontSize: 14.5, lineHeight: 1.75, color: tc.texteDoux, maxWidth: 640 }}>
          Tout est compté en <strong style={{ color: tc.or }}>R</strong> — le risque d&apos;un trade.
          Un gain de 2 R vaut deux fois le risque pris, que le compte fasse 500 $ ou 50 000 $. C&apos;est la
          seule mesure comparable d&apos;un mois à l&apos;autre.
        </p>

        {/* ══════════════════════════════════ échantillon insuffisant ══ */}
        {data.manque_pour_conclure > 0 && (
          <Carte fort style={{ borderColor: `${tc.or}44`, marginBottom: 22 }}>
            <p style={{ margin: "0 0 6px", fontSize: 15.5, fontWeight: 800, color: tc.or }}>
              Encore {data.manque_pour_conclure} trade{data.manque_pour_conclure > 1 ? "s" : ""} clôturé
              {data.manque_pour_conclure > 1 ? "s" : ""} avant de pouvoir conclure
            </p>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: tc.texteDoux }}>
              En dessous de vingt issues tranchées, un taux de réussite ne veut rien dire : l&apos;écart
              entre 50 % et 60 % tient entièrement dans le hasard. Le chiffre s&apos;affichera quand il
              sera fiable. En attendant, c&apos;est le R cumulé qu&apos;il faut regarder.
            </p>
          </Carte>
        )}

        {/* ══════════════════════════════════════════ vue globale ══════ */}
        <section style={{ marginBottom: 28 }}>
          <Titre sur="Depuis le premier signal">Vue d&apos;ensemble</Titre>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(152px,1fr))", gap: 11 }}>
            <Tuile libelle="Signaux publiés" valeur={g.total} note={`${g.en_cours} en cours`} />
            <Tuile
              libelle="Taux de réussite"
              valeur={g.taux_reussite ?? "—"}
              suffixe={g.taux_reussite !== null ? "%" : undefined}
              couleur={g.taux_reussite !== null && g.taux_reussite >= 50 ? tc.achat : tc.texte}
              note={`${g.gagnes} G · ${g.perdus} P · ${g.neutres} neutres`}
            />
            <Tuile
              libelle="R cumulé"
              valeur={`${g.r_cumule >= 0 ? "+" : ""}${g.r_cumule}`}
              suffixe="R"
              couleur={g.r_cumule >= 0 ? tc.achat : tc.vente}
            />
            <Tuile
              libelle="Facteur de profit"
              valeur={g.facteur_profit ?? "—"}
              couleur={g.facteur_profit && g.facteur_profit >= 1 ? tc.achat : tc.texte}
              note="sous 1 = perte"
            />
            <Tuile libelle="Drawdown max" valeur={`−${g.drawdown_max}`} suffixe="R" couleur={tc.vente} />
            <Tuile libelle="R:R moyen" valeur={g.rr_moyen ?? "—"} couleur={tc.or} />
            <Tuile
              libelle="Plus gros gain"
              valeur={g.plus_gros_gain !== null ? `+${g.plus_gros_gain}` : "—"}
              suffixe={g.plus_gros_gain !== null ? "R" : undefined}
              couleur={tc.achat}
            />
            <Tuile
              libelle="Plus grosse perte"
              valeur={g.plus_grosse_perte ?? "—"}
              suffixe={g.plus_grosse_perte !== null ? "R" : undefined}
              couleur={tc.vente}
            />
            <Tuile
              libelle="Durée moyenne"
              valeur={g.duree_moyenne_min !== null ? formatDuree(g.duree_moyenne_min) : "—"}
            />
            <Tuile
              libelle="Confiance moyenne"
              valeur={g.confiance_moyenne ?? "—"}
              suffixe={g.confiance_moyenne !== null ? "%" : undefined}
              couleur={tc.cyanClair}
            />
          </div>
        </section>

        {/* ═══════════════════════════════════ courbe de capital ═══════ */}
        <section style={{ marginBottom: 28 }}>
          <Titre sur="Un point par trade clôturé">Courbe de capital</Titre>
          {data.courbe.length < 2 ? (
            <Vide
              icone="◠"
              titre="Pas encore de courbe"
              texte="Il faut au moins deux trades clôturés pour tracer quelque chose. La courbe se construira toute seule."
            />
          ) : (
            <Carte>
              <Courbe points={data.courbe} />
              <p style={{ margin: "12px 0 0", fontSize: 11.5, color: texteFaible, lineHeight: 1.65 }}>
                Une courbe qui monte en escalier régulier vaut mieux qu&apos;une courbe plus haute mais
                en dents de scie : la seconde se trade beaucoup plus mal en pratique, parce qu&apos;il
                faut tenir pendant les creux.
              </p>
            </Carte>
          )}
        </section>

        {/* ════════════════════════════════════════ par période ════════ */}
        <section style={{ marginBottom: 28 }}>
          <Titre sur="Jour · semaine · mois">Rapports périodiques</Titre>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 11 }}>
            {data.rapports.map((r) => (
              <Carte key={r.periode}>
                <p style={{ margin: "0 0 11px", fontSize: 10.5, letterSpacing: 2.2, textTransform: "uppercase", color: tc.cyanClair, fontWeight: 700 }}>
                  {NOM_PERIODE[r.periode] ?? r.periode}
                </p>
                <p style={{ ...chiffres, margin: "0 0 3px", fontSize: 27, fontWeight: 800, color: r.stats.r_cumule >= 0 ? tc.achat : tc.vente }}>
                  {r.stats.r_cumule >= 0 ? "+" : ""}
                  {r.stats.r_cumule}
                  <span style={{ fontSize: 14, opacity: 0.55 }}> R</span>
                </p>
                <p style={{ margin: 0, fontSize: 12, color: tc.texteDoux }}>
                  {r.stats.total} signal{r.stats.total > 1 ? "aux" : ""} · {r.stats.gagnes} G / {r.stats.perdus} P
                </p>
              </Carte>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════ le tableau qui juge le système ══ */}
        <section style={{ marginBottom: 28 }}>
          <Titre sur="Le score discrimine-t-il vraiment ?">Performance par tranche de confiance</Titre>
          <Carte style={{ padding: 0, overflow: "hidden" }}>
            <Tableau
              entetes={["Tranche", "Signaux", "Réussite", "R cumulé"]}
              lignes={data.par_confiance.map((t) => [
                t.tranche + " %",
                String(t.total),
                t.taux !== null ? `${t.taux} %` : "trop peu",
                `${t.r >= 0 ? "+" : ""}${t.r} R`,
              ])}
            />
          </Carte>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: texteFaible, lineHeight: 1.7, maxWidth: 640 }}>
            C&apos;est le seul tableau capable de démontrer que le score ne sert à rien. Si les signaux
            à 90–92 gagnent aussi souvent que ceux à 96–100, le barème ne discrimine pas et il faut le
            refaire. Il est affiché même quand il dérange.
          </p>
        </section>

        {/* ═══════════════════════════════════════ par séance ══════════ */}
        {data.par_session.length > 0 && (
          <section>
            <Titre sur="À quelle heure vaut-il mieux trader ?">Performance par séance</Titre>
            <Carte style={{ padding: 0, overflow: "hidden" }}>
              <Tableau
                entetes={["Séance", "Signaux", "Réussite", "R cumulé"]}
                lignes={data.par_session.map((s) => [
                  LIBELLE_SESSION[s.session] ?? s.session,
                  String(s.total),
                  s.taux !== null ? `${s.taux} %` : "trop peu",
                  `${s.r >= 0 ? "+" : ""}${s.r} R`,
                ])}
              />
            </Carte>
          </section>
        )}
      </div>
    </div>
  );
}

function formatDuree(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  if (min < 1440) return `${(min / 60).toFixed(1)} h`;
  return `${(min / 1440).toFixed(1)} j`;
}

function Tableau({ entetes, lignes }: { entetes: string[]; lignes: string[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
        <thead>
          <tr>
            {entetes.map((h, i) => (
              <th
                key={h}
                style={{
                  textAlign: i === 0 ? "left" : "right",
                  padding: "12px 17px",
                  fontSize: 10,
                  letterSpacing: 1.7,
                  textTransform: "uppercase",
                  color: tc.texteDoux,
                  fontWeight: 700,
                  borderBottom: `1px solid ${tc.bordFort}`,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((l, i) => (
            <tr key={i}>
              {l.map((c, j) => (
                <td
                  key={j}
                  style={{
                    padding: "12px 17px",
                    fontSize: 13.5,
                    textAlign: j === 0 ? "left" : "right",
                    color: j === 0 ? tc.texte : c.startsWith("+") ? tc.achat : c.startsWith("-") || c.startsWith("−") ? tc.vente : tc.texteDoux,
                    fontWeight: j === 0 ? 700 : 600,
                    borderBottom: i < lignes.length - 1 ? `1px solid ${tc.bord}` : "none",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * La courbe, en SVG pur.
 *
 * Pas de bibliothèque de graphiques pour une polyligne : ce serait 90 ko de
 * JavaScript pour tracer trente points. Le SVG est calculé au rendu, il est
 * net sur tous les écrans et il ne coûte rien.
 *
 * La ligne du zéro est TOUJOURS tracée, même quand la courbe est entièrement
 * positive. Sans elle, une courbe qui part de +0,2 et monte à +0,4 remplit
 * toute la hauteur et ressemble à une explosion.
 */
function Courbe({ points }: { points: { cumul: number; t: string }[] }) {
  const L = 720;
  const H = 200;
  const marge = 26;

  const valeurs = points.map((p) => p.cumul);
  const max = Math.max(...valeurs, 0.5);
  const min = Math.min(...valeurs, -0.5);
  const etendue = max - min || 1;

  const x = (i: number) => marge + (i / Math.max(1, points.length - 1)) * (L - marge * 2);
  const y = (v: number) => H - marge - ((v - min) / etendue) * (H - marge * 2);

  const trace = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.cumul).toFixed(1)}`).join(" ");
  const aire = `${trace} L ${x(points.length - 1).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const positif = valeurs[valeurs.length - 1] >= 0;
  const teinte = positif ? tc.achat : tc.vente;

  return (
    <svg viewBox={`0 0 ${L} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Courbe de capital cumulée en R">
      <defs>
        <linearGradient id="tcAire" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={teinte} stopOpacity="0.28" />
          <stop offset="100%" stopColor={teinte} stopOpacity="0" />
        </linearGradient>
      </defs>

      <line x1={marge} y1={y(0)} x2={L - marge} y2={y(0)} stroke={tc.bordFort} strokeWidth="1" strokeDasharray="4 4" />
      <text x={marge} y={y(0) - 6} fill={tc.texteFaible} fontSize="10">0 R</text>

      <path d={aire} fill="url(#tcAire)" />
      <path d={trace} fill="none" stroke={teinte} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.cumul)} r="2.6" fill={tc.fond} stroke={teinte} strokeWidth="1.6" />
      ))}

      <text x={L - marge} y={16} fill={teinte} fontSize="13" fontWeight="700" textAnchor="end">
        {valeurs[valeurs.length - 1] >= 0 ? "+" : ""}
        {valeurs[valeurs.length - 1]} R
      </text>
    </svg>
  );
}
