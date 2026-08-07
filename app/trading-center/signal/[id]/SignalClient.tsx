"use client";

/**
 * LA PAGE D'UN SIGNAL.
 *
 * C'est l'écran où quelqu'un décide d'engager de l'argent. Tout y est
 * organisé autour d'une seule idée : **il doit pouvoir vérifier, pas croire.**
 *
 * D'où l'ordre des blocs, qui n'est pas négociable :
 *
 *   1. Le plan (entrée / stop / objectifs)  — ce qu'il faut faire
 *   2. La taille de position                — combien, sur SON capital
 *   3. Le graphique                         — voir de ses yeux
 *   4. Les critères chiffrés                — l'addition qui fait le score
 *   5. L'analyse rédigée                    — la mise en mots, en dernier
 *   6. Les échelles de temps                — le contexte complet
 *   7. Le fil de vie                        — ce qui s'est passé depuis
 *
 * L'analyse rédigée arrive APRÈS les chiffres, volontairement. C'est le bloc
 * le plus agréable à lire et le moins vérifiable ; le placer en haut ferait
 * lire le reste comme une justification décorative de quelque chose qu'on a
 * déjà accepté.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DrapeauIA,
  LIBELLE_DRAPEAU,
  Marche,
  SignalServi,
  UNITES,
} from "@/lib/trading-center/types";
import {
  Bouton,
  Carte,
  Jauge,
  LIBELLE_SESSION,
  LIBELLE_STATUT,
  Ligne,
  Pastille,
  Squelette,
  Titre,
  chiffres,
  couleurSens,
  quand,
  tc,
  texteFaible,
  verre,
} from "../../ui";

interface Evenement {
  type: string;
  prix: number | null;
  note: string | null;
  auteur: string;
  cree_le: string;
}

interface Reponse {
  plan: "free" | "premium";
  signal: SignalServi;
  marche: Marche | null;
  evenements: Evenement[];
  position: { unites: number; risque_montant: number; risque_pct: number } | null;
}

export default function SignalClient({ id }: { id: string }) {
  const [data, setData] = useState<Reponse | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/trading-center/signaux/${id}`, { cache: "no-store" })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => (ok ? setData(j) : setErreur(j.error ?? "Signal introuvable.")))
      .catch(() => setErreur("Le serveur est injoignable."));
  }, [id]);

  const fond = { minHeight: "100vh", background: `radial-gradient(1100px 560px at 50% -8%,#0d1f3d 0%,${tc.fond} 62%)`, color: tc.texte };

  if (erreur) {
    return (
      <div style={fond}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "70px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 17, color: tc.texteDoux, marginBottom: 20 }}>{erreur}</p>
          <Bouton href="/trading-center" variante="fantome">
            ← Retour au tableau de bord
          </Bouton>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={fond}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "26px 18px", display: "grid", gap: 14 }}>
          <Squelette hauteur={120} />
          <Squelette hauteur={260} />
          <Squelette hauteur={380} />
        </div>
      </div>
    );
  }

  const s = data.signal;
  const m = data.marche;
  const d = m?.decimales ?? 2;
  const couleur = couleurSens(s.sens);
  const achat = s.sens === "BUY";
  const statut = LIBELLE_STATUT[s.statut] ?? LIBELLE_STATUT.actif;
  const p = (v: number | null): string => (v === null ? "— — —" : v.toFixed(d));

  return (
    <div style={fond}>
      <style>{`@keyframes tcPulse{0%,100%{background-position:200% 0}50%{background-position:0 0}}`}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 18px 80px" }}>
        <Link href="/trading-center" style={{ fontSize: 12.5, color: tc.texteDoux, textDecoration: "none" }}>
          ← Trading Center
        </Link>

        {/* ══════════════════════════════════════════════ en-tête ══════ */}
        <header
          style={{
            ...verre(true),
            padding: 24,
            marginTop: 12,
            marginBottom: 18,
            borderLeft: `3px solid ${couleur}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -90,
              right: -60,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: `radial-gradient(circle,${couleur}22,transparent 68%)`,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 9 }}>
                <Pastille couleur={couleur}>
                  {achat ? "▲" : "▼"} {achat ? "ACHAT" : "VENTE"}
                </Pastille>
                <Pastille couleur={statut.couleur} petite>{statut.texte}</Pastille>
                <Pastille couleur={tc.cyanClair} petite>{s.unite}</Pastille>
                <Pastille couleur={tc.neutre} petite>{LIBELLE_SESSION[s.session] ?? s.session}</Pastille>
              </div>
              <h1 style={{ margin: 0, fontSize: "clamp(25px,4.6vw,38px)", fontWeight: 900, letterSpacing: -1, color: tc.texte }}>
                {m?.paire ?? s.marche}
              </h1>
              <p style={{ ...chiffres, margin: "5px 0 0", fontSize: 12.5, color: texteFaible }}>
                Signal #{s.numero} · publié le {quand(s.publie_le)}
                {s.cloture_le && ` · clôturé le ${quand(s.cloture_le)}`}
              </p>
            </div>
            <div style={{ minWidth: 168 }}>
              <Jauge valeur={s.confiance} taille="grande" />
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════ 1. le plan ═══════ */}
        {s.verrouille ? (
          <Carte fort style={{ borderColor: `${tc.or}44`, textAlign: "center", padding: 34, marginBottom: 18 }}>
            <p style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: tc.or }}>
              Les niveaux s&apos;ouvrent dans {s.deverrouille_dans} minutes
            </p>
            <p style={{ margin: "0 auto 20px", fontSize: 14, lineHeight: 1.75, color: tc.texteDoux, maxWidth: 460 }}>
              Le plan complet — zone d&apos;entrée, stop, trois objectifs et l&apos;analyse — est réservé
              au Premium pendant ce délai. Le sens et la confiance restent visibles pour que tu
              puisses vérifier la fiabilité du système avant de payer quoi que ce soit.
            </p>
            <Bouton href="/trading-center/premium">Voir les formules</Bouton>
          </Carte>
        ) : (
          <section style={{ marginBottom: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 11, marginBottom: 12 }}>
              {[
                { t: "Entrée préférentielle", v: s.entree, c: tc.texte, gros: true },
                { t: "Stop loss", v: s.stop, c: tc.vente, gros: true },
                { t: "Objectif 1", v: s.tp1, c: tc.achat, gros: true },
                { t: "Objectif 2", v: s.tp2, c: tc.achat },
                { t: "Objectif 3", v: s.tp3, c: tc.achat },
              ]
                .filter((x) => x.v !== null)
                .map((x) => (
                  <div key={x.t} style={{ ...verre(x.gros), padding: "15px 17px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 9.5, letterSpacing: 1.9, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
                      {x.t}
                    </p>
                    <p style={{ ...chiffres, margin: 0, fontSize: x.gros ? 24 : 19, fontWeight: 800, color: x.c }}>
                      {p(x.v)}
                    </p>
                  </div>
                ))}
            </div>

            <Carte>
              <Ligne cle="Zone d'entrée" valeur={`${p(s.zone_bas)} — ${p(s.zone_haut)}`} />
              <Ligne cle="Prix au moment du signal" valeur={p(s.prix_actuel)} />
              <Ligne cle="Risque / rendement" valeur={`${s.rr.toFixed(2)} : 1`} couleur={tc.or} fort />
              {s.duree_texte && <Ligne cle="Durée estimée" valeur={s.duree_texte} />}
              <Ligne cle="Tendance de fond" valeur={s.tendance} />
              {s.r_realise !== null && (
                <Ligne
                  cle="Résultat final"
                  valeur={`${s.r_realise >= 0 ? "+" : ""}${s.r_realise.toFixed(2)} R${s.pips !== null ? ` · ${s.pips} pips` : ""}`}
                  couleur={s.r_realise >= 0 ? tc.achat : tc.vente}
                  fort
                />
              )}
            </Carte>
          </section>
        )}

        {/* ═══════════════════════════════════ 2. taille de position ═══ */}
        {data.position && !s.verrouille && (
          <Carte fort style={{ marginBottom: 18, borderColor: `${tc.cyan}3a` }}>
            <Titre sur="Calculé sur ton capital et ton risque">Taille de position</Titre>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
                  Volume
                </p>
                <p style={{ ...chiffres, margin: 0, fontSize: 27, fontWeight: 800, color: tc.cyanClair }}>
                  {data.position.unites}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 10.5, color: texteFaible }}>unités de {m?.paire ?? s.marche}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
                  Perte si le stop est touché
                </p>
                <p style={{ ...chiffres, margin: 0, fontSize: 27, fontWeight: 800, color: tc.vente }}>
                  {data.position.risque_montant}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 10.5, color: texteFaible }}>
                  soit {data.position.risque_pct} % de ton capital
                </p>
              </div>
            </div>
            <p style={{ margin: "14px 0 0", fontSize: 11.5, lineHeight: 1.65, color: texteFaible }}>
              Ce volume ne vaut que si tu places réellement le stop indiqué. Sans stop, le calcul
              n&apos;a plus aucun sens et la perte n&apos;est plus bornée.{" "}
              <Link href="/trading-center/reglages" style={{ color: tc.cyan }}>
                Modifier mon capital et mon risque
              </Link>
            </p>
          </Carte>
        )}

        {/* ═══════════════════════════════════════ 3. le graphique ═════ */}
        {m && (
          <section style={{ marginBottom: 18 }}>
            <Titre sur="Le marché, en direct">Graphique</Titre>
            <Graphique symbole={m.symbole_tv} unite={s.unite} />
            <p style={{ margin: "9px 0 0", fontSize: 11, color: texteFaible, lineHeight: 1.6 }}>
              Graphique fourni par TradingView, en direct. Il montre le marché{" "}
              <strong style={{ color: tc.texteDoux }}>maintenant</strong>, pas au moment du signal —
              compare avec l&apos;heure de publication ci-dessus avant d&apos;en tirer une conclusion.
            </p>
          </section>
        )}

        {/* ═════════════════════════════════ 4. les critères chiffrés ══ */}
        <section style={{ marginBottom: 18 }}>
          <Titre sur="L'addition qui fait le score">Critères retenus</Titre>
          <Carte>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {s.raison.split(" · ").map((critere, i) => (
                <span
                  key={i}
                  style={{
                    background: "rgba(34,197,94,.09)",
                    border: `1px solid ${tc.achat}30`,
                    borderRadius: 9,
                    padding: "7px 12px",
                    fontSize: 12.2,
                    color: tc.texteDoux,
                    lineHeight: 1.4,
                  }}
                >
                  {critere}
                </span>
              ))}
            </div>
            <p style={{ margin: "14px 0 0", fontSize: 11.5, color: texteFaible, lineHeight: 1.65 }}>
              Le score de {s.confiance} % est la somme de ces critères, chacun pesé à l&apos;avance.
              Tu peux refaire l&apos;addition — c&apos;est le but.
            </p>
          </Carte>
        </section>

        {/* ══════════════════════════════════ 5. l'analyse rédigée ═════ */}
        {s.explication_ia && (
          <section style={{ marginBottom: 18 }}>
            <Titre sur="Mise en mots par l'analyste IA">Analyse</Titre>
            <Carte style={{ borderLeft: `3px solid ${tc.cyan}` }}>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.85, color: tc.texte }}>{s.explication_ia}</p>
            </Carte>
          </section>
        )}

        {/* ═══════════════════════════════════ points de vigilance ═════ */}
        {s.drapeaux_ia && s.drapeaux_ia.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <Titre sur="Signalés et jugés non rédhibitoires">Points de vigilance</Titre>
            <Carte style={{ borderColor: `${tc.vente}3a` }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(s.drapeaux_ia as DrapeauIA[]).map((f) => (
                  <Pastille key={f} couleur={tc.vente}>
                    {LIBELLE_DRAPEAU[f] ?? f}
                  </Pastille>
                ))}
              </div>
              <p style={{ margin: "13px 0 0", fontSize: 12, color: texteFaible, lineHeight: 1.65 }}>
                Le signal a été publié malgré ces points : ils ont été jugés insuffisants pour
                l&apos;invalider. Ils restent affichés parce que les cacher rendrait le score
                trompeur.
              </p>
            </Carte>
          </section>
        )}

        {/* ══════════════════════════════ 6. les échelles de temps ═════ */}
        {s.unites && Object.keys(s.unites).length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <Titre sur="Ce que dit chaque échelle">Les sept unités de temps</Titre>
            <Carte style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                  <thead>
                    <tr>
                      {["Unité", "Tendance", "RSI", "ADX", "Position / EMA"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: h === "Unité" ? "left" : "right",
                            padding: "12px 16px",
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
                    {UNITES.filter((u) => s.unites?.[u]).map((u) => {
                      const l = s.unites![u]!;
                      const aligne =
                        (l.tendance === "haussiere" && achat) || (l.tendance === "baissiere" && !achat);
                      const contre = l.tendance && l.tendance !== "range" && !aligne;
                      return (
                        <tr key={u}>
                          <td style={cellule(true)}>
                            <strong style={{ color: tc.texte }}>{u}</strong>
                          </td>
                          <td style={cellule()}>
                            <span style={{ color: contre ? tc.vente : aligne ? tc.achat : tc.neutre, fontWeight: 700 }}>
                              {l.tendance ?? "—"}
                            </span>
                          </td>
                          <td style={cellule()}>{l.rsi?.toFixed(0) ?? "—"}</td>
                          <td style={cellule()}>{l.adx?.toFixed(0) ?? "—"}</td>
                          <td style={cellule()}>{l.ema_position ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Carte>
          </section>
        )}

        {/* ══════════════════════════════════════ 7. le fil de vie ═════ */}
        {data.evenements.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <Titre sur="Ce qui s'est passé depuis">Fil de vie</Titre>
            <Carte>
              {data.evenements.map((e, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 13,
                    padding: "11px 0",
                    borderBottom: i < data.evenements.length - 1 ? `1px solid ${tc.bord}` : "none",
                  }}
                >
                  <div style={{ paddingTop: 4 }}>
                    <span
                      style={{
                        display: "block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: LIBELLE_STATUT[e.type]?.couleur ?? tc.cyan,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: tc.texte }}>
                      {LIBELLE_STATUT[e.type]?.texte ?? e.type}
                      {e.prix !== null && (
                        <span style={{ ...chiffres, fontWeight: 600, color: tc.texteDoux, marginLeft: 8 }}>
                          @ {e.prix.toFixed(d)}
                        </span>
                      )}
                    </p>
                    {e.note && <p style={{ margin: "3px 0 0", fontSize: 12, color: tc.texteDoux, lineHeight: 1.55 }}>{e.note}</p>}
                    <p style={{ ...chiffres, margin: "3px 0 0", fontSize: 10.5, color: texteFaible }}>
                      {quand(e.cree_le)} · {e.auteur}
                    </p>
                  </div>
                </div>
              ))}
            </Carte>
          </section>
        )}

        <p style={{ margin: "30px 0 0", fontSize: 11.5, lineHeight: 1.75, color: texteFaible }}>
          Ce signal est une analyse de marché, pas un conseil en investissement. Le trading comporte
          un risque de perte en capital. La plateforme n&apos;exécute aucun ordre à ta place.
        </p>
      </div>
    </div>
  );
}

function cellule(gauche = false): React.CSSProperties {
  return {
    padding: "11px 16px",
    fontSize: 13,
    textAlign: gauche ? "left" : "right",
    color: tc.texteDoux,
    borderBottom: `1px solid ${tc.bord}`,
    fontVariantNumeric: "tabular-nums",
  };
}

/**
 * Le graphique TradingView.
 *
 * Chargé par script tiers, ce qui impose la CSP assouplie sur /trading-center
 * (voir next.config.ts). Le conteneur porte une HAUTEUR FIXE dès le premier
 * rendu : sans elle, le widget arrive après le reste et pousse tout le
 * contenu vers le bas au moment précis où l'utilisateur est en train de lire
 * les niveaux — un décalage de mise en page à l'endroit le plus coûteux de la
 * page.
 */
function Graphique({ symbole, unite }: { symbole: string; unite: string }) {
  const conteneur = useRef<HTMLDivElement>(null);
  const [echec, setEchec] = useState(false);

  useEffect(() => {
    const noeud = conteneur.current;
    if (!noeud) return;

    const intervalles: Record<string, string> = {
      D: "D", "4H": "240", "1H": "60", "30M": "30", "15M": "15", "5M": "5", "1M": "1",
    };

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.onerror = () => setEchec(true);
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbole,
      interval: intervalles[unite] ?? "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "fr",
      backgroundColor: "rgba(5,10,20,1)",
      gridColor: "rgba(120,170,235,0.06)",
      hide_side_toolbar: true,
      allow_symbol_change: false,
      studies: ["STD;EMA", "STD;RSI"],
      support_host: "https://www.tradingview.com",
    });

    noeud.appendChild(script);
    return () => {
      noeud.innerHTML = "";
    };
  }, [symbole, unite]);

  if (echec) {
    return (
      <div style={{ ...verre(), padding: 30, textAlign: "center", height: 420 }}>
        <p style={{ fontSize: 13.5, color: tc.texteDoux, margin: 0 }}>
          Le graphique TradingView n&apos;a pas pu se charger. Les niveaux du signal restent
          exacts — le graphique n&apos;est qu&apos;un confort de lecture.
        </p>
      </div>
    );
  }

  return (
    <div style={{ ...verre(), padding: 6, overflow: "hidden" }}>
      <div ref={conteneur} style={{ height: 420, width: "100%" }} className="tradingview-widget-container" />
    </div>
  );
}
