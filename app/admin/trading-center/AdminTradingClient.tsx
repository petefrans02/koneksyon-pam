"use client";

/**
 * LE PANNEAU D'ADMINISTRATION DU TRADING CENTER.
 *
 * L'écran est organisé autour de la question qu'on se pose réellement quand
 * on l'ouvre — et ce n'est presque jamais « combien de signaux ai-je publié ».
 * C'est : **est-ce que le robinet coule ?**
 *
 * D'où le bloc de santé en tout premier, avant les statistiques. Un système
 * qui publie peu est un système qui fonctionne ; un système qui ne reçoit
 * plus rien est un système en panne. Les deux se ressemblent parfaitement
 * depuis la page publique, et se distinguent d'un coup d'œil ici.
 *
 * Le second bloc est la ventilation des rejets. C'est le tableau qui dit
 * POURQUOI il n'y a pas de signal : « 40 rejets pour doublon » et « 40 rejets
 * pour secret invalide » décrivent deux situations sans aucun rapport, et
 * seule la seconde demande d'agir dans la minute.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ConfigTC } from "@/lib/trading-center/config";
import { Sante } from "@/lib/trading-center/sante";
import { Marche, Signal, Statistiques } from "@/lib/trading-center/types";
import {
  Bouton,
  Carte,
  Pastille,
  Squelette,
  Titre,
  Tuile,
  chiffres,
  quand,
  tc,
  texteFaible,
  verre,
} from "../../trading-center/ui";

interface Alerte {
  id: string;
  recu_le: string;
  marche: string | null;
  statut: string;
  raison: string | null;
  score_brut: number | null;
  score_ia: number | null;
  ms: number | null;
}

interface Diffusion {
  id: string;
  signal_id: string;
  canal: string;
  cibles: number;
  envoyes: number;
  echecs: number;
  erreur: string | null;
  cree_le: string;
}

interface Abonne {
  user_id: string;
  email: string | null;
  plan: string;
  fin: string | null;
  source: string;
}

interface Donnees {
  sante: Sante;
  config: ConfigTC;
  marches: Marche[];
  stats: Statistiques;
  signaux: Signal[];
  alertes: Alerte[];
  rejets: Record<string, number>;
  abonnes: Abonne[];
  diffusions: Diffusion[];
  erreurs: string[];
}

const LIBELLE_REJET: Record<string, string> = {
  publiee: "Publiées",
  pouls: "Battements de cœur",
  rejetee_secret: "Secret invalide",
  rejetee_format: "Format incorrect",
  rejetee_marche: "Marché inconnu",
  rejetee_doublon: "Doublon",
  rejetee_cadence: "Quota atteint",
  rejetee_score: "Score insuffisant",
  rejetee_ia: "Refusée par l'IA",
  rejetee_session: "Hors séance",
  erreur: "Erreur technique",
};

export default function AdminTradingClient() {
  const [d, setD] = useState<Donnees | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<"flux" | "signaux" | "reglages" | "membres">("flux");

  const charger = useCallback(async () => {
    try {
      const res = await fetch("/api/trading-center/admin", { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) return setMsg(j.error ?? "Chargement impossible.");
      setD(j);
    } catch {
      setMsg("Le serveur est injoignable.");
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await charger();
    })();
  }, [charger]);

  async function agir(corps: Record<string, unknown>, succes: string) {
    setMsg(null);
    try {
      const res = await fetch("/api/trading-center/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      const j = await res.json();
      if (!res.ok) return setMsg(j.error ?? "Action refusée.");
      if (j.refuses?.length) {
        setMsg(`Appliqué, sauf : ${j.refuses.join(", ")}`);
      } else {
        setMsg(succes);
      }
      charger();
    } catch {
      setMsg("Le serveur est injoignable.");
    }
  }

  const fond = { minHeight: "100vh", background: `radial-gradient(1200px 620px at 50% -8%,#0d1f3d 0%,${tc.fond} 62%)`, color: tc.texte };

  if (!d) {
    return (
      <div style={fond}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "26px 18px", display: "grid", gap: 14 }}>
          {msg && <p style={{ color: tc.vente, fontSize: 14 }}>{msg}</p>}
          <Squelette hauteur={110} />
          <Squelette hauteur={180} />
          <Squelette hauteur={300} />
        </div>
      </div>
    );
  }

  return (
    <div style={fond}>
      <style>{`@keyframes tcPulse{0%,100%{background-position:200% 0}50%{background-position:0 0}}`}</style>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "24px 18px 80px" }}>
        <Link href="/admin" style={{ fontSize: 12.5, color: tc.texteDoux, textDecoration: "none" }}>
          ← Administration
        </Link>

        <h1 style={{ margin: "12px 0 20px", fontSize: "clamp(24px,4.2vw,34px)", fontWeight: 900, letterSpacing: -1 }}>
          Trading Center
        </h1>

        {/* ══════════════════════════════ 1. LA SANTÉ, EN PREMIER ═════ */}
        <Carte
          fort
          style={{
            marginBottom: 18,
            borderColor: d.sante.alerte ? `${tc.vente}66` : `${tc.achat}44`,
            borderLeftWidth: 3,
            borderLeftColor: d.sante.alerte ? tc.vente : tc.achat,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 13, flexWrap: "wrap" }}>
            <span style={{ fontSize: 22, lineHeight: 1.2 }}>{d.sante.alerte ? "⚠️" : "✓"}</span>
            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{ margin: "0 0 5px", fontSize: 15.5, fontWeight: 800, color: d.sante.alerte ? tc.vente : tc.achat }}>
                {d.sante.alerte ? "Le flux demande une intervention" : "Le flux est vivant"}
              </p>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: tc.texteDoux }}>{d.sante.diagnostic}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 15 }}>
            {[
              { nom: "Secret webhook", ok: d.sante.secret_configure },
              { nom: "IA", ok: d.sante.ia_configuree },
              { nom: "Email", ok: d.sante.email_configure },
              { nom: "Push", ok: d.sante.push_configure },
            ].map((c) => (
              <Pastille key={c.nom} couleur={c.ok ? tc.achat : tc.vente} petite>
                {c.ok ? "✓" : "✕"} {c.nom}
              </Pastille>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginTop: 15 }}>
            <Tuile libelle="Alertes / 24 h" valeur={d.sante.alertes_24h} />
            <Tuile libelle="Signaux / 7 j" valeur={d.sante.signaux_7j} couleur={tc.or} />
            <Tuile
              libelle="Dernière alerte"
              valeur={d.sante.heures_silence !== null ? `${d.sante.heures_silence} h` : "jamais"}
              couleur={d.sante.heures_silence !== null && d.sante.heures_silence > 24 ? tc.vente : tc.texte}
            />
          </div>
        </Carte>

        {d.erreurs.length > 0 && (
          <Carte style={{ marginBottom: 18, borderColor: `${tc.vente}55` }}>
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 800, color: tc.vente }}>
              Erreurs de lecture en base
            </p>
            {d.erreurs.map((e, i) => (
              <p key={i} style={{ margin: "3px 0", fontSize: 12, color: tc.texteDoux, fontFamily: "monospace" }}>
                {e}
              </p>
            ))}
            <p style={{ margin: "8px 0 0", fontSize: 11.5, color: texteFaible }}>
              Si les tables sont introuvables, exécute <code>supabase/trading-center.sql</code> dans
              l&apos;éditeur SQL Supabase.
            </p>
          </Carte>
        )}

        {msg && (
          <div style={{ ...verre(), padding: "13px 17px", marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 13.5, color: tc.cyanClair }}>{msg}</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════ onglets ════════ */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {(
            [
              ["flux", "Flux d'alertes"],
              ["signaux", `Signaux (${d.signaux.length})`],
              ["reglages", "Réglages"],
              ["membres", `Membres (${d.abonnes.length})`],
            ] as const
          ).map(([cle, nom]) => (
            <button key={cle} onClick={() => setOnglet(cle)} style={pilule(onglet === cle)}>
              {nom}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════ FLUX ═════════ */}
        {onglet === "flux" && (
          <>
            <section style={{ marginBottom: 24 }}>
              <Titre sur="Pourquoi il n'y a pas de signal">Ventilation des 60 dernières alertes</Titre>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
                {Object.entries(d.rejets)
                  .sort((a, b) => b[1] - a[1])
                  .map(([statut, n]) => (
                    <Tuile
                      key={statut}
                      libelle={LIBELLE_REJET[statut] ?? statut}
                      valeur={n}
                      couleur={statut === "publiee" ? tc.achat : statut.startsWith("rejetee_secret") || statut === "erreur" ? tc.vente : tc.texteDoux}
                    />
                  ))}
              </div>
              {Object.keys(d.rejets).length === 0 && (
                <p style={{ fontSize: 13.5, color: tc.texteDoux }}>Aucune alerte reçue pour l&apos;instant.</p>
              )}
            </section>

            <section style={{ marginBottom: 24 }}>
              <Titre sur="Journal brut">Alertes reçues</Titre>
              <Carte style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                    <thead>
                      <tr>
                        {["Reçue", "Marché", "Statut", "Score", "Raison", "ms"].map((h) => (
                          <th key={h} style={th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {d.alertes.map((a) => (
                        <tr key={a.id}>
                          <td style={td}>{quand(a.recu_le)}</td>
                          <td style={td}>{a.marche ?? "—"}</td>
                          <td style={td}>
                            <span style={{ color: a.statut === "publiee" ? tc.achat : a.statut === "erreur" ? tc.vente : tc.texteDoux, fontWeight: 700 }}>
                              {LIBELLE_REJET[a.statut] ?? a.statut}
                            </span>
                          </td>
                          <td style={td}>
                            {a.score_ia ?? a.score_brut ?? "—"}
                          </td>
                          <td style={{ ...td, maxWidth: 320, whiteSpace: "normal", fontSize: 11.5 }}>{a.raison ?? "—"}</td>
                          <td style={td}>{a.ms ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Carte>
            </section>

            <section>
              <Titre sur="Le garde-fou du faux « envoyé »">Diffusions</Titre>
              <Carte style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
                    <thead>
                      <tr>{["Quand", "Canal", "Cibles", "Envoyés", "Échecs", "Erreur"].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {d.diffusions.map((x) => (
                        <tr key={x.id}>
                          <td style={td}>{quand(x.cree_le)}</td>
                          <td style={td}>{x.canal}</td>
                          <td style={td}>{x.cibles}</td>
                          <td style={{ ...td, color: x.envoyes > 0 ? tc.achat : x.cibles > 0 ? tc.vente : tc.texteDoux, fontWeight: 700 }}>
                            {x.envoyes}
                          </td>
                          <td style={{ ...td, color: x.echecs > 0 ? tc.vente : tc.texteDoux }}>{x.echecs}</td>
                          <td style={{ ...td, maxWidth: 260, whiteSpace: "normal", fontSize: 11.5, color: tc.vente }}>
                            {x.erreur ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Carte>
              <p style={{ margin: "9px 0 0", fontSize: 11.5, color: texteFaible, lineHeight: 1.65 }}>
                Un <strong style={{ color: tc.vente }}>0 envoyé</strong> avec des cibles non nulles
                signifie que le canal n&apos;est pas configuré — la colonne « Erreur » dit laquelle
                des clés manque.
              </p>
            </section>
          </>
        )}

        {/* ═════════════════════════════════════════ SIGNAUX ═════════ */}
        {onglet === "signaux" && (
          <section>
            <Titre sur="Faire avancer un trade à la main">Signaux</Titre>
            <div style={{ display: "grid", gap: 11 }}>
              {d.signaux.map((s) => {
                const ouvert = ["actif", "tp1", "tp2"].includes(s.statut);
                const m = d.marches.find((x) => x.code === s.marche);
                return (
                  <Carte key={s.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
                      <div style={{ minWidth: 200 }}>
                        <div style={{ display: "flex", gap: 7, marginBottom: 6, flexWrap: "wrap" }}>
                          <Pastille couleur={s.sens === "BUY" ? tc.achat : tc.vente} petite>
                            {s.sens}
                          </Pastille>
                          <Pastille couleur={tc.or} petite>{s.confiance}%</Pastille>
                          <Pastille couleur={ouvert ? tc.cyanClair : tc.neutre} petite>{s.statut}</Pastille>
                        </div>
                        <p style={{ ...chiffres, margin: 0, fontSize: 14, fontWeight: 700 }}>
                          #{s.numero} {m?.paire ?? s.marche}
                        </p>
                        <p style={{ ...chiffres, margin: "3px 0 0", fontSize: 11.5, color: texteFaible }}>
                          E {s.entree} · SL {s.stop} · TP1 {s.tp1} · {quand(s.publie_le)}
                          {s.r_realise !== null && (
                            <strong style={{ color: s.r_realise >= 0 ? tc.achat : tc.vente, marginLeft: 8 }}>
                              {s.r_realise >= 0 ? "+" : ""}{s.r_realise} R
                            </strong>
                          )}
                        </p>
                      </div>

                      {ouvert && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {(["tp1", "tp2", "tp3", "gagne", "perdu", "annule"] as const).map((e) => (
                            <button
                              key={e}
                              onClick={() => agir({ action: "signal", id: s.id, etape: e }, `Signal #${s.numero} → ${e}`)}
                              style={{
                                ...pilule(false),
                                padding: "5px 12px",
                                fontSize: 11,
                                color: e === "perdu" ? tc.vente : e === "annule" ? tc.neutre : tc.achat,
                              }}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Carte>
                );
              })}
              {d.signaux.length === 0 && (
                <p style={{ fontSize: 13.5, color: tc.texteDoux }}>Aucun signal publié pour l&apos;instant.</p>
              )}
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════ RÉGLAGES ═════════ */}
        {onglet === "reglages" && <Reglages config={d.config} marches={d.marches} agir={agir} />}

        {/* ═════════════════════════════════════════ MEMBRES ═════════ */}
        {onglet === "membres" && (
          <section>
            <Titre sur="Accorder ou retirer un accès">Membres</Titre>
            <Carte style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
                  <thead>
                    <tr>{["Email", "Plan", "Échéance", "Source", ""].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {d.abonnes.map((a) => {
                      const actif = a.plan === "premium" && (!a.fin || new Date(a.fin) > new Date());
                      return (
                        <tr key={a.user_id}>
                          <td style={{ ...td, fontSize: 12 }}>{a.email ?? a.user_id.slice(0, 8)}</td>
                          <td style={td}>
                            <span style={{ color: actif ? tc.or : tc.texteDoux, fontWeight: 700 }}>
                              {actif ? "PREMIUM" : "gratuit"}
                            </span>
                          </td>
                          <td style={td}>{a.fin ? quand(a.fin) : "illimité"}</td>
                          <td style={{ ...td, fontSize: 11.5 }}>{a.source}</td>
                          <td style={td}>
                            <div style={{ display: "flex", gap: 5, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {[1, 3, 12].map((m) => (
                                <button
                                  key={m}
                                  onClick={() => agir({ action: "premium", user_id: a.user_id, email: a.email, mois: m }, `+${m} mois accordés.`)}
                                  style={{ ...pilule(false), padding: "4px 10px", fontSize: 11 }}
                                >
                                  +{m}m
                                </button>
                              ))}
                              {actif && (
                                <button
                                  onClick={() => agir({ action: "premium", user_id: a.user_id, retirer: true }, "Premium retiré.")}
                                  style={{ ...pilule(false), padding: "4px 10px", fontSize: 11, color: tc.vente }}
                                >
                                  retirer
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Carte>
            <p style={{ margin: "10px 0 0", fontSize: 11.5, color: texteFaible, lineHeight: 1.65 }}>
              Seuls les comptes ayant déjà une ligne d&apos;abonnement apparaissent ici. Un compte qui
              n&apos;a jamais souscrit n&apos;en a pas : il devient visible dès son premier paiement, ou
              dès qu&apos;il enregistre ses réglages.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

/** L'écran des réglages — le seuil de confiance y est le bouton le plus lourd. */
function Reglages({
  config,
  marches,
  agir,
}: {
  config: ConfigTC;
  marches: Marche[];
  agir: (corps: Record<string, unknown>, succes: string) => void;
}) {
  const [c, setC] = useState<ConfigTC>(config);

  const SESSIONS = ["asie", "londres", "new-york", "chevauchement"];

  return (
    <>
      <Carte fort style={{ marginBottom: 16, borderColor: `${tc.or}3a` }}>
        <Titre sur="Le réglage le plus lourd du système">Seuil de confiance — {c.seuil_confiance} %</Titre>
        <input
          type="range"
          min={50}
          max={100}
          value={c.seuil_confiance}
          onChange={(e) => setC({ ...c, seuil_confiance: Number(e.target.value) })}
          style={{ width: "100%", accentColor: tc.or }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: texteFaible, marginTop: 5 }}>
          <span>50 % — beaucoup de signaux, très moyens</span>
          <span>100 % — quasiment aucun</span>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 12.5, lineHeight: 1.7, color: tc.texteDoux }}>
          Baisser ce seuil augmente MÉCANIQUEMENT le nombre de signaux et baisse leur qualité
          moyenne. À 90, compte 1 à 4 signaux par semaine sur l&apos;or. En dessous de 80, la
          plateforme devient exactement le canal à spam qu&apos;elle refuse d&apos;être.
        </p>
      </Carte>

      <Carte style={{ marginBottom: 16 }}>
        <Titre sur="Filtres et cadence">Garde-fous</Titre>
        {[
          { cle: "rr_minimum" as const, nom: "Risque/rendement minimum", min: 0.5, max: 10, pas: 0.1, aide: "En dessous, le signal est refusé quel que soit son score." },
          { cle: "max_signaux_jour" as const, nom: "Signaux max par jour et par marché", min: 1, max: 50, pas: 1, aide: "Garde-fou anti-spam absolu." },
          { cle: "anti_doublon_min" as const, nom: "Délai anti-doublon (minutes)", min: 0, max: 1440, pas: 15, aide: "Un script Pine tire souvent à chaque bougie tant que la condition tient." },
          { cle: "delai_gratuit_min" as const, nom: "Retard du plan gratuit (minutes)", min: 0, max: 1440, pas: 15, aide: "0 rendrait le Premium sans objet." },
          { cle: "historique_gratuit" as const, nom: "Signaux visibles en gratuit", min: 0, max: 100, pas: 1, aide: "" },
        ].map((r) => (
          <div key={r.cle} style={{ padding: "11px 0", borderBottom: `1px solid ${tc.bord}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13.5, color: tc.texte, fontWeight: 600 }}>{r.nom}</span>
              <input
                type="number"
                min={r.min}
                max={r.max}
                step={r.pas}
                value={c[r.cle] as number}
                onChange={(e) => setC({ ...c, [r.cle]: Number(e.target.value) })}
                style={{
                  width: 96,
                  background: "rgba(255,255,255,.05)",
                  border: `1px solid ${tc.bordFort}`,
                  borderRadius: 9,
                  padding: "7px 11px",
                  fontSize: 14,
                  color: tc.texte,
                  fontFamily: "inherit",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              />
            </div>
            {r.aide && <p style={{ margin: "4px 0 0", fontSize: 11, color: texteFaible, lineHeight: 1.5 }}>{r.aide}</p>}
          </div>
        ))}
      </Carte>

      <Carte style={{ marginBottom: 16 }}>
        <Titre sur="Quand le système a le droit de publier">Séances autorisées</Titre>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SESSIONS.map((s) => {
            const actif = c.sessions_autorisees.includes(s);
            return (
              <button
                key={s}
                onClick={() =>
                  setC({
                    ...c,
                    sessions_autorisees: actif
                      ? c.sessions_autorisees.filter((x) => x !== s)
                      : [...c.sessions_autorisees, s],
                  })
                }
                style={pilule(actif)}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Carte>

      <Carte style={{ marginBottom: 16 }}>
        <Titre sur="Le second filtre">Intelligence artificielle</Titre>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "9px 0" }}>
          <span style={{ fontSize: 13.5, color: tc.texte, fontWeight: 600 }}>Filtre IA actif</span>
          <button onClick={() => setC({ ...c, ia_active: !c.ia_active })} style={pilule(c.ia_active)}>
            {c.ia_active ? "Activé" : "Désactivé"}
          </button>
        </div>
        <div style={{ padding: "9px 0" }}>
          <label style={{ display: "block", fontSize: 12.5, color: tc.texteDoux, marginBottom: 6 }}>Modèle</label>
          <select
            value={c.ia_modele}
            onChange={(e) => setC({ ...c, ia_modele: e.target.value })}
            style={{
              width: "100%",
              background: "rgba(255,255,255,.05)",
              border: `1px solid ${tc.bordFort}`,
              borderRadius: 10,
              padding: "10px 13px",
              fontSize: 14,
              color: tc.texte,
              fontFamily: "inherit",
            }}
          >
            <option value="claude-sonnet-5">Claude Sonnet 5 — équilibré (recommandé)</option>
            <option value="claude-opus-5">Claude Opus 5 — le plus fin, le plus cher</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 — rapide et économique</option>
          </select>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 11.5, color: texteFaible, lineHeight: 1.65 }}>
          Désactiver l&apos;IA ne rend pas le système plus permissif : le score déterministe reste
          seul juge, et il ne peut plus recevoir les ±15 points d&apos;arbitrage. En pratique, un peu
          moins de signaux, et aucune explication rédigée.
        </p>
      </Carte>

      <div style={{ marginBottom: 24 }}>
        <Bouton
          pleineLargeur
          onClick={() =>
            agir(
              {
                action: "config",
                valeurs: {
                  seuil_confiance: c.seuil_confiance,
                  rr_minimum: c.rr_minimum,
                  max_signaux_jour: c.max_signaux_jour,
                  anti_doublon_min: c.anti_doublon_min,
                  delai_gratuit_min: c.delai_gratuit_min,
                  historique_gratuit: c.historique_gratuit,
                  sessions_autorisees: c.sessions_autorisees,
                  ia_active: c.ia_active,
                  ia_modele: c.ia_modele,
                },
              },
              "Réglages enregistrés.",
            )
          }
        >
          Enregistrer les réglages
        </Bouton>
      </div>

      <Carte>
        <Titre sur="Un marché actif accepte les alertes">Marchés</Titre>
        <div style={{ display: "grid", gap: 8 }}>
          {marches.map((m) => (
            <div
              key={m.code}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${tc.bord}` }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: tc.texte }}>
                  {m.paire} <span style={{ fontSize: 11.5, color: texteFaible, fontWeight: 400 }}>· {m.symbole_tv}</span>
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: texteFaible }}>{m.nom_fr}</p>
              </div>
              <button
                onClick={() => agir({ action: "marche", code: m.code, actif: !m.actif }, `${m.paire} ${m.actif ? "désactivé" : "activé"}.`)}
                style={pilule(m.actif)}
              >
                {m.actif ? "Actif" : "Éteint"}
              </button>
            </div>
          ))}
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 11.5, color: texteFaible, lineHeight: 1.65 }}>
          Activer un marché ne suffit pas : il faut aussi poser le script Pine sur son graphique
          TradingView et créer l&apos;alerte correspondante. Sans cela, le marché s&apos;affichera
          sans jamais rien publier.
        </p>
      </Carte>
    </>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "11px 15px",
  fontSize: 10,
  letterSpacing: 1.6,
  textTransform: "uppercase",
  color: tc.texteDoux,
  fontWeight: 700,
  borderBottom: `1px solid ${tc.bordFort}`,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 15px",
  fontSize: 12.5,
  color: tc.texteDoux,
  borderBottom: `1px solid ${tc.bord}`,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

function pilule(actif: boolean): React.CSSProperties {
  return {
    background: actif ? `linear-gradient(135deg,${tc.orSombre},${tc.or})` : "rgba(255,255,255,0.04)",
    color: actif ? "#0d1d3d" : tc.texteDoux,
    border: `1px solid ${actif ? "transparent" : tc.bord}`,
    borderRadius: 999,
    padding: "7px 16px",
    fontSize: 12.5,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
