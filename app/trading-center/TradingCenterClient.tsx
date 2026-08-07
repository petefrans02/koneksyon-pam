"use client";

/**
 * LE TABLEAU DE BORD.
 *
 * Une question, une réponse, dans cet ordre exact :
 *
 *   1. Y a-t-il un signal en ce moment ?          → la carte en haut
 *   2. Est-ce que ce système marche vraiment ?    → les statistiques
 *   3. Qu'est-ce qu'il a fait récemment ?         → l'historique
 *
 * ── Le rafraîchissement ───────────────────────────────────────────────────
 *
 * Toutes les 45 secondes, et UNIQUEMENT quand l'onglet est visible. Un
 * intervalle qui continue de tourner dans un onglet oublié pendant huit
 * heures produit 640 requêtes pour personne — et sur un plan Vercel, ce sont
 * des invocations facturées pour rien. `visibilitychange` coûte trois lignes.
 *
 * ── Ce qu'on affiche quand il n'y a rien ──────────────────────────────────
 *
 * L'absence de signal est le cas NORMAL de cette plateforme, pas une panne.
 * L'écran vide l'explique et affiche la séance en cours, pour que le silence
 * se lise comme un choix du système et non comme une défaillance.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Marche, SignalServi, Statistiques } from "@/lib/trading-center/types";
import CarteSignal from "./CarteSignal";
import {
  Bouton,
  Carte,
  LIBELLE_SESSION,
  Pastille,
  Squelette,
  Titre,
  Tuile,
  Vide,
  chiffres,
  tc,
  texteFaible,
  verre,
} from "./ui";

interface Reponse {
  plan: "free" | "premium";
  connecte: boolean;
  signaux: SignalServi[];
  stats: Statistiques;
  marches: Marche[];
  session_actuelle: string;
  config: { seuil: number; delai_gratuit_min: number; historique_gratuit: number };
}

export default function TradingCenterClient() {
  const [data, setData] = useState<Reponse | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<string | null>(null);
  const [paiement, setPaiement] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const res = await fetch("/api/trading-center/signaux", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setErreur(json.indice ? `${json.error} — ${json.indice}` : json.error ?? "Chargement impossible.");
        return;
      }
      setData(json);
      setErreur(null);
    } catch {
      setErreur("Le serveur est injoignable. Vérifie ta connexion.");
    }
  }, []);

  /**
   * Le retour de PayPal.
   *
   * PayPal renvoie ici avec `?token=<orderID>` après le paiement. La capture
   * n'est PAS automatique : sans cet appel, l'argent est autorisé mais jamais
   * encaissé, et l'utilisateur repart en pensant avoir payé alors que son
   * compte est resté gratuit. C'est le pire scénario possible du parcours.
   *
   * L'identifiant est retiré de l'URL immédiatement après : un rechargement
   * de page relancerait sinon une capture déjà faite. Elle est idempotente
   * côté PayPal, mais elle échouerait bruyamment ici pour rien.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderID = params.get("token");
    if (!orderID) return;

    fetch("/api/trading-center/abonnement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etape: "capturer", orderID }),
    })
      .then((r) => r.json())
      .then((j) => {
        setPaiement(j.ok ? `Premium activé pour ${j.mois} mois. Merci.` : (j.error ?? "Paiement non abouti."));
        if (j.ok) charger();
      })
      .catch(() => setPaiement("La confirmation du paiement a échoué. Contacte-nous avec ta référence PayPal."))
      .finally(() => {
        window.history.replaceState({}, "", "/trading-center");
      });
  }, [charger]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const demarrer = () => {
      if (timer) return;
      timer = setInterval(() => void charger(), 45_000);
    };
    const arreter = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    // Voir l'en-tête : on ne sonde jamais un onglet que personne ne regarde.
    const surVisibilite = () => {
      if (document.visibilityState === "visible") {
        void charger();
        demarrer();
      } else {
        arreter();
      }
    };

    // Le premier chargement passe par une fonction asynchrone plutôt que par
    // un appel direct : le corps d'un effet ne doit pas déclencher de rendu
    // en cascade, et c'est exactement ce que ferait un setState synchrone ici.
    void (async () => {
      await charger();
    })();

    demarrer();
    document.addEventListener("visibilitychange", surVisibilite);
    return () => {
      arreter();
      document.removeEventListener("visibilitychange", surVisibilite);
    };
  }, [charger]);

  const marcheDe = (code: string): Marche | undefined => data?.marches.find((m) => m.code === code);

  const signaux = (data?.signaux ?? []).filter((s) => !filtre || s.marche === filtre);
  const ouverts = signaux.filter((s) => ["actif", "tp1", "tp2"].includes(s.statut));
  const passes = signaux.filter((s) => !["actif", "tp1", "tp2"].includes(s.statut));
  const dernier = ouverts[0] ?? null;

  const enSeance = data?.session_actuelle !== "hors-session";

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(1200px 620px at 50% -8%,#0d1f3d 0%,${tc.fond} 62%)`, color: tc.texte }}>
      <style>{`
        @keyframes tcPulse { 0%,100%{background-position:200% 0} 50%{background-position:0 0} }
        @keyframes tcBattement { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.8)} }
      `}</style>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "26px 18px 80px" }}>
        {/* ══════════════════════════════════════════════════ en-tête ══ */}
        <header style={{ marginBottom: 26 }}>
          <Link href="/" style={{ fontSize: 12.5, color: tc.texteDoux, textDecoration: "none" }}>
            ← KONEKSYON PAM
          </Link>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginTop: 10 }}>
            <div>
              <p style={{ margin: "0 0 5px", fontSize: 10.5, letterSpacing: 3.4, textTransform: "uppercase", color: tc.cyanClair, fontWeight: 700 }}>
                Signaux haute probabilité
              </p>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(27px,5vw,44px)",
                  fontWeight: 900,
                  letterSpacing: -1.2,
                  lineHeight: 1.08,
                  background: `linear-gradient(135deg,#fff 0%,${tc.cyanClair} 52%,${tc.or} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Trading Center
              </h1>
            </div>

            <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
              {/* Le pouls de la séance : dit d'un coup d'œil si le système
                  est censé travailler en ce moment. */}
              <div style={{ ...verre(), padding: "8px 15px", display: "flex", alignItems: "center", gap: 9 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: enSeance ? tc.achat : tc.neutre,
                    animation: enSeance ? "tcBattement 2s ease-in-out infinite" : undefined,
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: enSeance ? tc.texte : tc.texteDoux }}>
                  {data ? (LIBELLE_SESSION[data.session_actuelle] ?? data.session_actuelle) : "…"}
                </span>
              </div>

              {data && (
                <Pastille couleur={data.plan === "premium" ? tc.or : tc.neutre}>
                  {data.plan === "premium" ? "★ PREMIUM" : "GRATUIT"}
                </Pastille>
              )}
            </div>
          </div>

          <p style={{ margin: "14px 0 0", fontSize: 14.5, lineHeight: 1.75, color: tc.texteDoux, maxWidth: 680 }}>
            Le marché est analysé en continu sur sept échelles de temps. Un signal n&apos;est publié que
            lorsque la confiance dépasse{" "}
            <strong style={{ color: tc.or }}>{data?.config.seuil ?? 90}&nbsp;%</strong>. Le reste du temps,
            cette page reste silencieuse — c&apos;est le fonctionnement normal, pas une panne.
          </p>
        </header>

        {/* ═══════════════════════════════════ retour de paiement ═════ */}
        {paiement && (
          <div style={{ ...verre(true), padding: "16px 19px", borderColor: `${tc.or}55`, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14, color: tc.or, fontWeight: 700 }}>{paiement}</p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════ erreur ═══ */}
        {erreur && (
          <div style={{ ...verre(), padding: "16px 19px", borderColor: `${tc.vente}55`, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13.5, color: tc.vente, fontWeight: 700 }}>{erreur}</p>
          </div>
        )}

        {/* ══════════════════════════════════════ filtre par marché ════ */}
        {data && data.marches.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <button
              onClick={() => setFiltre(null)}
              style={pilule(filtre === null)}
            >
              Tous
            </button>
            {data.marches.map((m) => (
              <button key={m.code} onClick={() => setFiltre(m.code)} style={pilule(filtre === m.code)}>
                {m.paire}
              </button>
            ))}
          </div>
        )}

        {/* ═════════════════════════════════════ le signal en cours ════ */}
        <section style={{ marginBottom: 30 }}>
          <Titre sur="En ce moment">{ouverts.length > 0 ? "Position ouverte" : "Aucune position"}</Titre>

          {!data ? (
            <Squelette hauteur={230} />
          ) : dernier ? (
            <CarteSignal
              signal={dernier}
              decimales={marcheDe(dernier.marche)?.decimales ?? 2}
              paire={marcheDe(dernier.marche)?.paire ?? dernier.marche}
            />
          ) : (
            <Vide
              icone={enSeance ? "◈" : "☾"}
              titre={enSeance ? "Le marché ne présente rien de suffisamment net" : "Marché fermé"}
              texte={
                enSeance
                  ? `Aucune configuration n'atteint ${data.config.seuil} % de confiance en ce moment. Le système préfère se taire plutôt que de te proposer un trade moyen — c'est exactement ce pour quoi il est fait.`
                  : "Les signaux reprendront à l'ouverture de Londres. Le système ne publie rien pendant la nuit asiatique ni le week-end : les mouvements y sont trop peu fiables."
              }
            />
          )}

          {ouverts.length > 1 && (
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              {ouverts.slice(1).map((s) => (
                <CarteSignal
                  key={s.id}
                  signal={s}
                  compacte
                  decimales={marcheDe(s.marche)?.decimales ?? 2}
                  paire={marcheDe(s.marche)?.paire ?? s.marche}
                />
              ))}
            </div>
          )}
        </section>

        {/* ═════════════════════════════════════════ performance ═══════ */}
        {data && (
          <section style={{ marginBottom: 30 }}>
            <Titre sur="Le relevé, sans maquillage">Performance</Titre>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(158px,1fr))", gap: 11 }}>
              <Tuile
                libelle="Taux de réussite"
                valeur={data.stats.taux_reussite ?? "—"}
                suffixe={data.stats.taux_reussite !== null ? "%" : undefined}
                couleur={data.stats.taux_reussite !== null && data.stats.taux_reussite >= 50 ? tc.achat : tc.texte}
                note={
                  data.stats.taux_reussite === null
                    ? `Il manque ${Math.max(0, 20 - data.stats.gagnes - data.stats.perdus)} trades clôturés pour qu'un taux veuille dire quelque chose.`
                    : `${data.stats.gagnes} gagnés · ${data.stats.perdus} perdus`
                }
              />
              <Tuile
                libelle="R cumulé"
                valeur={`${data.stats.r_cumule >= 0 ? "+" : ""}${data.stats.r_cumule}`}
                suffixe="R"
                couleur={data.stats.r_cumule >= 0 ? tc.achat : tc.vente}
                note="1 R = le risque d'un trade"
              />
              <Tuile
                libelle="Facteur de profit"
                valeur={data.stats.facteur_profit ?? "—"}
                couleur={data.stats.facteur_profit && data.stats.facteur_profit >= 1 ? tc.achat : tc.texte}
                note="gains ÷ pertes · sous 1, la méthode détruit du capital"
              />
              <Tuile
                libelle="Drawdown max"
                valeur={`−${data.stats.drawdown_max}`}
                suffixe="R"
                couleur={tc.vente}
                note="la pire chute depuis un sommet"
              />
              <Tuile libelle="R:R moyen" valeur={data.stats.rr_moyen ?? "—"} couleur={tc.or} />
              <Tuile
                libelle="Confiance moyenne"
                valeur={data.stats.confiance_moyenne ?? "—"}
                suffixe={data.stats.confiance_moyenne !== null ? "%" : undefined}
                couleur={tc.cyanClair}
              />
            </div>

            {data.plan === "premium" && (
              <div style={{ marginTop: 13 }}>
                <Bouton href="/trading-center/journal" variante="fantome">
                  Ouvrir le journal complet →
                </Bouton>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════ appel Premium ═══════ */}
        {data && data.plan === "free" && (
          <section style={{ marginBottom: 30 }}>
            <Carte fort style={{ padding: 26, borderColor: `${tc.or}3a` }}>
              <p style={{ margin: "0 0 5px", fontSize: 10.5, letterSpacing: 3, textTransform: "uppercase", color: tc.or, fontWeight: 700 }}>
                Passer au Premium
              </p>
              <h3 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: tc.texte, letterSpacing: -0.5 }}>
                Recevoir les signaux à l&apos;instant où ils sortent
              </h3>
              <p style={{ margin: "0 0 17px", fontSize: 14, lineHeight: 1.75, color: tc.texteDoux, maxWidth: 620 }}>
                Le plan gratuit te montre le sens, la confiance et le résultat final — de quoi vérifier
                par toi-même que le système est honnête avant de sortir un dollar. Les niveaux
                d&apos;entrée, de stop et d&apos;objectif arrivent avec{" "}
                <strong style={{ color: tc.texte }}>{data.config.delai_gratuit_min} minutes</strong> de
                retard, ce qui est trop tard pour les trader.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10, marginBottom: 20 }}>
                {[
                  "Signaux en temps réel, sans aucun délai",
                  "Notification push, email et Telegram",
                  "Historique complet, sans limite",
                  "Journal de performance détaillé",
                  "Explication de l'analyse pour chaque signal",
                  "Taille de position calculée sur ton capital",
                ].map((t) => (
                  <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{ color: tc.or, fontSize: 13, lineHeight: 1.5 }}>◆</span>
                    <span style={{ fontSize: 13.2, color: tc.texteDoux, lineHeight: 1.55 }}>{t}</span>
                  </div>
                ))}
              </div>

              <Bouton href="/trading-center/premium">Voir les formules</Bouton>
            </Carte>
          </section>
        )}

        {/* ══════════════════════════════════════════ historique ═══════ */}
        {data && passes.length > 0 && (
          <section>
            <Titre sur={`${passes.length} signaux clôturés`}>Historique</Titre>
            <div style={{ display: "grid", gap: 11 }}>
              {passes.map((s) => (
                <CarteSignal
                  key={s.id}
                  signal={s}
                  compacte
                  decimales={marcheDe(s.marche)?.decimales ?? 2}
                  paire={marcheDe(s.marche)?.paire ?? s.marche}
                />
              ))}
            </div>

            {data.plan === "free" && passes.length >= data.config.historique_gratuit && (
              <p style={{ margin: "15px 0 0", fontSize: 12.5, color: texteFaible, textAlign: "center" }}>
                Le plan gratuit affiche les {data.config.historique_gratuit} derniers signaux.
                Le Premium ouvre tout l&apos;historique.
              </p>
            )}
          </section>
        )}

        {/* ═════════════════════════════════════ mention de risque ═════ */}
        <footer style={{ marginTop: 44, paddingTop: 22, borderTop: `1px solid ${tc.bord}` }}>
          <p style={{ ...chiffres, margin: 0, fontSize: 11.5, lineHeight: 1.75, color: texteFaible, maxWidth: 760 }}>
            Les signaux publiés ici sont des analyses de marché, pas des conseils en investissement.
            Le trading comporte un risque de perte en capital pouvant aller jusqu&apos;à la totalité des
            sommes engagées. Aucun résultat passé ne préjuge des résultats futurs. La plateforme
            n&apos;exécute jamais d&apos;ordre à ta place : chaque décision reste la tienne.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            <Link href="/trading-center/reglages" style={{ fontSize: 12.5, color: tc.texteDoux, textDecoration: "none" }}>
              Mes réglages
            </Link>
            <Link href="/trading" style={{ fontSize: 12.5, color: tc.texteDoux, textDecoration: "none" }}>
              Académie Trading
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

function pilule(actif: boolean): React.CSSProperties {
  return {
    background: actif ? `linear-gradient(135deg,${tc.orSombre},${tc.or})` : "rgba(255,255,255,0.04)",
    color: actif ? "#0d1d3d" : tc.texteDoux,
    border: `1px solid ${actif ? "transparent" : tc.bord}`,
    borderRadius: 999,
    padding: "7px 17px",
    fontSize: 12.5,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
