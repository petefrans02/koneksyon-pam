"use client";

/**
 * LA CARTE DE SIGNAL.
 *
 * Le composant le plus regardé de toute la plateforme, et celui où chaque
 * détail se paie en argent réel.
 *
 * ── Ce qui est mis en avant, et pourquoi ──────────────────────────────────
 *
 * Trois chiffres dominent visuellement : l'entrée, le STOP, et TP1. Le stop
 * est en rouge et à la même taille que l'entrée — jamais plus petit, jamais
 * relégué en bas. Toutes les interfaces de signaux que j'ai vues font
 * l'inverse : elles hurlent l'objectif et chuchotent le stop. C'est
 * exactement le contraire de ce qu'il faut faire, parce que le stop est le
 * seul de ces trois nombres qui protège l'utilisateur.
 *
 * ── Le verrou du plan gratuit ─────────────────────────────────────────────
 *
 * Quand les niveaux sont masqués, on affiche des tirets et un compte à
 * rebours, pas des chiffres floutés. Le flou CSS se retire en trois clics
 * dans l'inspecteur ; ici, il n'y a rien à retirer, les valeurs ne sont
 * jamais arrivées jusqu'au navigateur.
 */

import Link from "next/link";
import { SignalServi } from "@/lib/trading-center/types";
import {
  Jauge,
  LIBELLE_SESSION,
  LIBELLE_STATUT,
  Ligne,
  Pastille,
  chiffres,
  couleurSens,
  depuis,
  tc,
  texteFaible,
  verre,
} from "./ui";

export default function CarteSignal({
  signal,
  decimales,
  paire,
  compacte,
}: {
  signal: SignalServi;
  decimales: number;
  paire: string;
  compacte?: boolean;
}) {
  const couleur = couleurSens(signal.sens);
  const achat = signal.sens === "BUY";
  const statut = LIBELLE_STATUT[signal.statut] ?? LIBELLE_STATUT.actif;

  const p = (v: number | null): string => (v === null ? "— — —" : v.toFixed(decimales));

  return (
    <Link
      href={`/trading-center/signal/${signal.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          ...verre(true),
          padding: compacte ? 16 : 22,
          position: "relative",
          overflow: "hidden",
          // Le liseré latéral porte la direction : lisible d'un coup d'œil,
          // même sur une liste de vingt cartes, même en diagonale.
          borderLeft: `3px solid ${couleur}`,
        }}
      >
        {/* Halo directionnel — décoratif, très discret, jamais confondu avec un résultat. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -70,
            right: -70,
            width: 190,
            height: 190,
            borderRadius: "50%",
            background: `radial-gradient(circle,${couleur}22,transparent 68%)`,
            pointerEvents: "none",
          }}
        />

        {/* ── en-tête ── */}
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 5 }}>
              <Pastille couleur={couleur}>
                {achat ? "▲" : "▼"} {achat ? "ACHAT" : "VENTE"}
              </Pastille>
              <Pastille couleur={statut.couleur} petite>
                {statut.texte}
              </Pastille>
            </div>
            <h3 style={{ margin: 0, fontSize: compacte ? 18 : 22, fontWeight: 800, color: tc.texte, letterSpacing: -0.5 }}>
              {paire}
            </h3>
            <p style={{ ...chiffres, margin: "3px 0 0", fontSize: 11.5, color: texteFaible }}>
              #{signal.numero} · {signal.unite} · {LIBELLE_SESSION[signal.session] ?? signal.session} · {depuis(signal.publie_le)}
            </p>
          </div>

          <div style={{ minWidth: 118, flexShrink: 0 }}>
            <Jauge valeur={signal.confiance} taille={compacte ? "petite" : "moyenne"} />
          </div>
        </header>

        {/* ── le verrou, ou les niveaux ── */}
        {signal.verrouille ? (
          <div
            style={{
              background: "rgba(240,200,64,.07)",
              border: `1px dashed ${tc.or}44`,
              borderRadius: 13,
              padding: "17px 18px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 6px", fontSize: 13.5, fontWeight: 800, color: tc.or }}>
              Niveaux réservés au Premium
            </p>
            <p style={{ margin: 0, fontSize: 12.5, color: tc.texteDoux, lineHeight: 1.6 }}>
              Ils s&apos;ouvriront pour toi dans{" "}
              <strong style={{ ...chiffres, color: tc.texte }}>{signal.deverrouille_dans} min</strong>.
              <br />
              Le sens, la confiance et le résultat restent visibles — vérifie par toi-même avant de payer.
            </p>
          </div>
        ) : (
          <>
            {/* Les trois nombres qui décident. Le stop a le même poids que l'entrée. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
              {[
                { titre: "Entrée", valeur: signal.entree, couleur: tc.texte },
                { titre: "Stop", valeur: signal.stop, couleur: tc.vente },
                { titre: "TP1", valeur: signal.tp1, couleur: tc.achat },
              ].map((c) => (
                <div
                  key={c.titre}
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    border: `1px solid ${tc.bord}`,
                    borderRadius: 12,
                    padding: "11px 12px",
                  }}
                >
                  <p style={{ margin: "0 0 4px", fontSize: 9.5, letterSpacing: 1.8, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
                    {c.titre}
                  </p>
                  <p style={{ ...chiffres, margin: 0, fontSize: compacte ? 15 : 17.5, fontWeight: 800, color: c.couleur }}>
                    {p(c.valeur)}
                  </p>
                </div>
              ))}
            </div>

            {!compacte && (
              <div style={{ marginBottom: 4 }}>
                <Ligne cle="Zone d'entrée" valeur={`${p(signal.zone_bas)} — ${p(signal.zone_haut)}`} />
                {signal.tp2 !== null && <Ligne cle="Objectif 2" valeur={p(signal.tp2)} couleur={tc.achat} />}
                {signal.tp3 !== null && <Ligne cle="Objectif 3" valeur={p(signal.tp3)} couleur={tc.achat} />}
                <Ligne cle="Risque / rendement" valeur={`${signal.rr.toFixed(2)} : 1`} couleur={tc.or} />
                {signal.duree_texte && <Ligne cle="Durée estimée" valeur={signal.duree_texte} />}
              </div>
            )}
          </>
        )}

        {/* ── résultat, quand le trade est fermé ── */}
        {signal.r_realise !== null && (
          <div
            style={{
              marginTop: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 11,
              background: signal.r_realise >= 0 ? tc.achatSourd : tc.venteSourd,
              border: `1px solid ${signal.r_realise >= 0 ? tc.achat : tc.vente}33`,
            }}
          >
            <span style={{ fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
              Résultat
            </span>
            <span style={{ ...chiffres, fontSize: 17, fontWeight: 800, color: signal.r_realise >= 0 ? tc.achat : tc.vente }}>
              {signal.r_realise >= 0 ? "+" : ""}
              {signal.r_realise.toFixed(2)} R
              {signal.pips !== null && (
                <span style={{ fontSize: 11.5, opacity: 0.65, marginLeft: 7 }}>
                  {signal.pips >= 0 ? "+" : ""}
                  {signal.pips} pips
                </span>
              )}
            </span>
          </div>
        )}

        {/* ── l'analyse, coupée court : la carte n'est pas la page du signal ── */}
        {!compacte && signal.explication_ia && (
          <p
            style={{
              margin: "13px 0 0",
              fontSize: 13,
              lineHeight: 1.65,
              color: tc.texteDoux,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {signal.explication_ia}
          </p>
        )}
      </article>
    </Link>
  );
}
