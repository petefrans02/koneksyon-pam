"use client";

/**
 * MON RELEVÉ.
 *
 * L'élève arrive ici avec une impression — « les expirations longues marchent
 * mieux » — et repart avec un fait, ou avec le nombre de trades qui lui manque
 * pour en avoir un.
 *
 * Trois refus assumés dans cet écran :
 *
 * 1. **On n'affiche jamais un taux de réussite sans son seuil de rentabilité.**
 *    58 % est excellent à 92 % de payout et perdant à 80 %. Le taux seul est un
 *    chiffre qui ment par omission.
 *
 * 2. **On ne conclut pas sous vingt trades.** La barre affiche alors ce qui
 *    manque au lieu d'un verdict. C'est frustrant, et c'est le but : la
 *    frustration coûte moins cher qu'une fausse certitude.
 *
 * 3. **On ne dit pas qu'un écart existe tant qu'il tient dans la marge
 *    d'erreur.** Comparer deux durées demande que l'écart dépasse le bruit,
 *    pas qu'il soit visible à l'œil.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { color, gradient } from "@/lib/design";
import {
  Stat,
  Trade,
  comparer,
  manquants,
  noterResultat,
  saveJournal,
  seuilEquilibre,
  statGlobale,
  statsParAlignement,
  statsParDuree,
  supprimerTrade,
  useJournal,
} from "@/lib/trading/journal";

const TONS: Record<Stat["verdict"], string> = {
  "au-dessus": color.success,
  "en-dessous": color.danger,
  indecis: color.warning,
  insuffisant: color.textFaint,
};

export default function JournalClient() {
  const journal = useJournal();
  const [payout, setPayout] = useState<number | null>(null);
  const [tout, setTout] = useState(false);

  const p = payout ?? journal.payoutDefaut;
  const seuil = seuilEquilibre(p);

  const enCours = journal.trades.filter((t) => t.resultat === "en_cours");
  const parDuree = useMemo(() => statsParDuree(journal.trades, p), [journal.trades, p]);
  const parAlignement = useMemo(() => statsParAlignement(journal.trades, p), [journal.trades, p]);
  const global = useMemo(() => statGlobale(journal.trades, p), [journal.trades, p]);

  // La question de départ : les longues font-elles vraiment mieux que les courtes ?
  const court = parDuree.find((s) => s.cle === "court")!;
  const long = parDuree.find((s) => s.cle === "long")!;
  const duel = comparer(long, court);

  function noter(id: string, r: Trade["resultat"]) {
    saveJournal(noterResultat(journal, id, r));
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 18px 70px" }}>
      <Link href="/trading/analyse" style={{ color: color.textMuted, fontSize: 13, textDecoration: "none" }}>
        ← Analyser mon graphique
      </Link>
      <h1
        style={{
          margin: "6px 0 0",
          fontSize: "clamp(23px,3.6vw,30px)",
          color: color.textDark,
          fontWeight: 800,
        }}
      >
        Mon relevé
      </h1>
      <p
        style={{
          fontSize: 15.5,
          lineHeight: 1.7,
          color: color.textMuted,
          margin: "10px 0 22px",
          maxWidth: 660,
        }}
      >
        Ce que tu crois qui marche, et ce qui marche, sont deux choses
        différentes tant que tu ne comptes pas. Note le résultat de chaque trade&nbsp;: au bout
        d&apos;une trentaine, tu sauras.
      </p>

      {/* Le payout : sans lui, aucun taux ne veut dire quoi que ce soit. */}
      <div
        style={{
          background: gradient.navy,
          borderRadius: 13,
          padding: "16px 19px",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label htmlFor="payout" style={{ fontSize: 13.5, color: "#c8daf0", fontWeight: 700 }}>
            Ton payout
          </label>
          <input
            id="payout"
            type="number"
            min={1}
            max={500}
            value={p}
            onChange={(e) => setPayout(Number(e.target.value) || 1)}
            style={{
              width: 86,
              padding: "8px 11px",
              borderRadius: 8,
              border: "1px solid #24344f",
              background: "#0b1526",
              color: color.white,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          />
          <span style={{ fontSize: 13.5, color: "#c8daf0" }}>%</span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 13.5,
              color: color.goldLight,
              fontWeight: 700,
            }}
          >
            Seuil de rentabilité&nbsp;: {seuil.toFixed(1)} %
          </span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.55, color: "#8fa6c4", margin: "9px 0 0" }}>
          100 ÷ (100 + {p}) — en dessous de ce taux tu perds de l&apos;argent, même en gagnant
          plus d&apos;une fois sur deux. C&apos;est la barre que toutes les lignes ci-dessous
          doivent franchir.
        </p>
      </div>

      {/* Les trades en attente de résultat */}
      {enCours.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, color: color.textDark, margin: "0 0 9px", fontWeight: 800 }}>
            En attente de résultat ({enCours.length})
          </h2>
          <div style={{ display: "grid", gap: 8 }}>
            {enCours.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  flexWrap: "wrap",
                  background: color.white,
                  border: `1px solid ${color.border}`,
                  borderLeft: `4px solid ${t.bouton === "BUY" ? "#26a69a" : "#ef5350"}`,
                  borderRadius: 10,
                  padding: "12px 15px",
                }}
              >
                <Resume trade={t} />
                <div style={{ display: "flex", gap: 7, marginLeft: "auto" }}>
                  <button onClick={() => noter(t.id, "gagne")} style={boutonResultat(color.success)}>
                    Gagné
                  </button>
                  <button onClick={() => noter(t.id, "perdu")} style={boutonResultat(color.danger)}>
                    Perdu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {journal.trades.length === 0 ? (
        <div
          style={{
            border: `1px solid ${color.border}`,
            borderLeft: `4px solid ${color.info}`,
            borderRadius: 12,
            background: color.white,
            padding: "18px 20px",
          }}
        >
          <strong style={{ fontSize: 16, color: color.textDark }}>Aucun trade noté</strong>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: color.textBody, margin: "8px 0 0" }}>
            Analyse un graphique, puis clique sur «&nbsp;Noter ce trade&nbsp;». La durée, le sens
            et l&apos;alignement des unités de temps sont enregistrés automatiquement — tu
            n&apos;auras plus qu&apos;à dire si c&apos;est passé ou non.
          </p>
          <Link
            href="/trading/analyse"
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
            Analyser un graphique
          </Link>
        </div>
      ) : (
        <>
          {/* La réponse à la question posée */}
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, color: color.textDark, margin: "0 0 4px", fontWeight: 800 }}>
              Par durée d&apos;expiration
            </h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: color.textMuted, margin: "0 0 10px" }}>
              La barre dorée est ton seuil de rentabilité. Une ligne n&apos;est concluante que si
              son intervalle ne le chevauche pas.
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {parDuree.map((s) => (
                <LigneStat key={s.cle} stat={s} seuil={seuil} />
              ))}
            </div>

            <div
              style={{
                marginTop: 10,
                background: color.white,
                border: `1px solid ${color.border}`,
                borderLeft: `4px solid ${duel.concluant ? color.success : color.textMuted}`,
                borderRadius: 11,
                padding: "13px 17px",
              }}
            >
              <strong style={{ fontSize: 14.5, color: color.textDark }}>
                Long contre court
              </strong>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: color.textBody, margin: "5px 0 0" }}>
                {duel.ecart === null ? (
                  <>
                    Il manque des trades terminés dans l&apos;une des deux tranches pour comparer
                    quoi que ce soit.
                  </>
                ) : duel.concluant ? (
                  <>
                    Écart de <strong>{Math.abs(duel.ecart).toFixed(1)} points</strong> en faveur des{" "}
                    {duel.ecart > 0 ? "expirations longues" : "expirations courtes"}, et il dépasse
                    la marge d&apos;erreur des deux groupes. Cette fois, ce n&apos;est pas le
                    hasard.
                  </>
                ) : (
                  <>
                    Écart de {Math.abs(duel.ecart).toFixed(1)} points en faveur des{" "}
                    {duel.ecart > 0 ? "longues" : "courtes"}, mais il tient dans la marge
                    d&apos;erreur — donc il est parfaitement explicable par le hasard.
                    {manquants(long) + manquants(court) > 0 && (
                      <>
                        {" "}
                        Il faut encore {manquants(long)} trade{manquants(long) > 1 ? "s" : ""} en
                        long et {manquants(court)} en court pour trancher.
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
          </section>

          {/* Ce que vaut l'accord entre unités de temps */}
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, color: color.textDark, margin: "0 0 4px", fontWeight: 800 }}>
              Par alignement des unités de temps
            </h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: color.textMuted, margin: "0 0 10px" }}>
              Si analyser plusieurs échelles sert à quelque chose, ça se voit ici.
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {parAlignement.map((s) => (
                <LigneStat key={s.cle} stat={s} seuil={seuil} />
              ))}
            </div>
          </section>

          {/* L'ensemble */}
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, color: color.textDark, margin: "0 0 10px", fontWeight: 800 }}>
              Sur tout
            </h2>
            <LigneStat stat={global} seuil={seuil} />
          </section>

          {/* L'historique */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 9,
              }}
            >
              <h2 style={{ fontSize: 17, color: color.textDark, margin: 0, fontWeight: 800 }}>
                Historique ({journal.trades.length})
              </h2>
              {journal.trades.length > 8 && (
                <button
                  onClick={() => setTout((v) => !v)}
                  style={{
                    border: `1px solid ${color.border}`,
                    background: color.white,
                    borderRadius: 8,
                    padding: "6px 13px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: color.textMuted,
                    cursor: "pointer",
                  }}
                >
                  {tout ? "Réduire" : "Tout voir"}
                </button>
              )}
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {(tout ? journal.trades : journal.trades.slice(0, 8)).map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    flexWrap: "wrap",
                    background: color.white,
                    border: `1px solid ${color.border}`,
                    borderRadius: 9,
                    padding: "10px 14px",
                  }}
                >
                  <Resume trade={t} />
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 12.5,
                      fontWeight: 800,
                      color:
                        t.resultat === "gagne"
                          ? color.success
                          : t.resultat === "perdu"
                            ? color.danger
                            : color.textFaint,
                    }}
                  >
                    {t.resultat === "gagne" ? "Gagné" : t.resultat === "perdu" ? "Perdu" : "En cours"}
                  </span>
                  <button
                    onClick={() => saveJournal(supprimerTrade(journal, t.id))}
                    aria-label="Supprimer"
                    style={{
                      border: "none",
                      background: "none",
                      color: color.textFaint,
                      fontSize: 16,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <p
        style={{
          fontSize: 12.5,
          lineHeight: 1.65,
          color: color.textFaint,
          borderTop: `1px solid ${color.border}`,
          marginTop: 30,
          paddingTop: 16,
        }}
      >
        Ce relevé est enregistré dans ce navigateur uniquement&nbsp;: il ne suit pas ton compte
        d&apos;un appareil à l&apos;autre, et vider le stockage l&apos;efface. Contenu éducatif,
        pas un conseil financier.
      </p>
    </div>
  );
}

// ------------------------------------------------------------ sous-blocs ----

/**
 * Une ligne de statistique.
 *
 * La barre ne montre pas seulement le taux : elle montre son intervalle de
 * confiance et la position du seuil. C'est ce qui permet de voir d'un coup
 * d'œil qu'un 58 % sur douze trades ne prouve rien.
 */
function LigneStat({ stat: s, seuil }: { stat: Stat; seuil: number }) {
  const ton = TONS[s.verdict];
  const manque = manquants(s);

  return (
    <div
      style={{
        background: color.white,
        border: `1px solid ${color.border}`,
        borderLeft: `4px solid ${ton}`,
        borderRadius: 11,
        padding: "13px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 15, color: color.textDark }}>{s.label}</strong>
        <span style={{ fontSize: 13, color: color.textFaint }}>
          {s.n} trade{s.n > 1 ? "s" : ""} terminé{s.n > 1 ? "s" : ""}
          {s.n > 0 ? ` · ${s.gagnes} gagné${s.gagnes > 1 ? "s" : ""}` : ""}
        </span>
        {s.taux !== null && (
          <span style={{ marginLeft: "auto", fontSize: 19, fontWeight: 900, color: ton }}>
            {s.taux.toFixed(0)}%
          </span>
        )}
      </div>

      {s.taux !== null && s.marge !== null && (
        <>
          {/* La barre : le taux, sa marge, et le seuil en repère fixe. */}
          <div
            style={{
              position: "relative",
              height: 12,
              borderRadius: 99,
              background: color.grayLight,
              marginTop: 9,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${Math.max(0, s.taux - s.marge)}%`,
                width: `${Math.min(100, 2 * s.marge)}%`,
                top: 0,
                bottom: 0,
                background: ton,
                opacity: 0.28,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${Math.max(0, Math.min(100, s.taux))}%`,
                top: 0,
                bottom: 0,
                width: 3,
                background: ton,
                transform: "translateX(-1px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${Math.max(0, Math.min(100, seuil))}%`,
                top: -2,
                bottom: -2,
                width: 2,
                background: color.gold,
              }}
            />
          </div>
          <div style={{ fontSize: 12.5, color: color.textMuted, marginTop: 6 }}>
            Entre {Math.max(0, s.taux - s.marge).toFixed(0)}% et{" "}
            {Math.min(100, s.taux + s.marge).toFixed(0)}% · seuil {seuil.toFixed(1)}%
          </div>
        </>
      )}

      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: color.textBody, margin: "7px 0 0" }}>
        {s.verdict === "insuffisant" &&
          (s.n === 0
            ? "Aucun trade terminé dans cette catégorie."
            : `Trop peu de trades pour conclure — encore ${manque} avant de pouvoir dire quoi que ce soit.`)}
        {s.verdict === "au-dessus" && "Au-dessus du seuil, marge d'erreur comprise. C'est rentable."}
        {s.verdict === "en-dessous" &&
          "En dessous du seuil, marge d'erreur comprise. Cette catégorie te coûte de l'argent."}
        {s.verdict === "indecis" &&
          "L'intervalle chevauche le seuil : impossible de dire si c'est rentable ou non. Il faut plus de trades."}
      </p>
    </div>
  );
}

function Resume({ trade: t }: { trade: Trade }) {
  const d = new Date(t.date);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", minWidth: 0 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 0.8,
          padding: "3px 9px",
          borderRadius: 6,
          background: t.bouton === "BUY" ? "#26a69a" : "#ef5350",
          color: color.white,
        }}
      >
        {t.bouton}
      </span>
      {t.temps && (
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: color.textDark,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {t.temps}
        </span>
      )}
      <span style={{ fontSize: 12.5, color: color.textFaint }}>
        {[t.instrument, t.unite].filter(Boolean).join(" ")}
        {t.instrument || t.unite ? " · " : ""}
        {d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}{" "}
        {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}

const boutonResultat = (ton: string): React.CSSProperties => ({
  border: `1.5px solid ${ton}`,
  background: color.white,
  color: ton,
  borderRadius: 8,
  padding: "7px 15px",
  fontSize: 13.5,
  fontWeight: 800,
  cursor: "pointer",
});
