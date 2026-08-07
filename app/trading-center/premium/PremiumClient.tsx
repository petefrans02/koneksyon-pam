"use client";

/**
 * LA PAGE DES FORMULES.
 *
 * Le parti pris : **décrire honnêtement ce que le gratuit contient**, au lieu
 * de le présenter comme une version mutilée. La colonne gratuite liste de
 * vraies fonctionnalités, pas des croix rouges.
 *
 * La raison est commerciale autant qu'éthique. Ce produit se vend sur la
 * confiance — un système qui prétend viser 90 % de confiance et qui gonfle sa
 * page de vente se contredit lui-même dès le premier écran. Le gratuit
 * montre le sens, la confiance ET le résultat final : c'est précisément ce
 * qui permet de vérifier avant de payer, et c'est l'argument le plus fort de
 * la page.
 *
 * Aucun chiffre de rentabilité n'est promis nulle part. Les seules
 * statistiques affichées sont celles du tableau de bord, calculées sur les
 * vrais signaux.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bouton, Carte, Pastille, chiffres, tc, texteFaible, verre } from "../ui";

interface Formule {
  mois: number;
  prix: number;
  libelle: string;
}

export default function PremiumClient() {
  const [formules, setFormules] = useState<Record<string, Formule>>({});
  const [plan, setPlan] = useState("free");
  const [connecte, setConnecte] = useState(false);
  const [paiementPret, setPaiementPret] = useState(true);
  const [choix, setChoix] = useState("m3");
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    fetch("/api/trading-center/abonnement", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setFormules(j.formules ?? {});
        setPlan(j.plan ?? "free");
        setConnecte(!!j.connecte);
        if (j.paiement_configure === false) setPaiementPret(false);
      })
      .catch(() => setMessage("Chargement impossible."));
  }, []);

  async function souscrire() {
    if (!connecte) {
      setMessage("Connecte-toi d'abord — l'abonnement est lié à ton compte.");
      return;
    }
    setEnvoi(true);
    setMessage(null);
    try {
      const res = await fetch("/api/trading-center/abonnement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etape: "creer", formule: choix }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMessage(j.error ?? "Création de la commande impossible.");
        setEnvoi(false);
        return;
      }
      // Redirection vers PayPal. Le retour repasse par /trading-center, et la
      // capture est déclenchée par la page de retour.
      window.location.href = `https://www.paypal.com/checkoutnow?token=${j.orderID}`;
    } catch {
      setMessage("Le serveur est injoignable.");
      setEnvoi(false);
    }
  }

  const fond = { minHeight: "100vh", background: `radial-gradient(1100px 560px at 50% -8%,#0d1f3d 0%,${tc.fond} 62%)`, color: tc.texte };

  const cles = Object.keys(formules);

  return (
    <div style={fond}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 18px 80px" }}>
        <Link href="/trading-center" style={{ fontSize: 12.5, color: tc.texteDoux, textDecoration: "none" }}>
          ← Trading Center
        </Link>

        <header style={{ textAlign: "center", margin: "26px 0 34px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 10.5, letterSpacing: 3.2, textTransform: "uppercase", color: tc.cyanClair, fontWeight: 700 }}>
            Formules
          </p>
          <h1
            style={{
              margin: "0 0 14px",
              fontSize: "clamp(26px,5vw,42px)",
              fontWeight: 900,
              letterSpacing: -1.2,
              lineHeight: 1.1,
              background: `linear-gradient(135deg,#fff 0%,${tc.cyanClair} 52%,${tc.or} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Vérifie d&apos;abord. Paie ensuite.
          </h1>
          <p style={{ margin: "0 auto", fontSize: 15, lineHeight: 1.8, color: tc.texteDoux, maxWidth: 560 }}>
            Le plan gratuit te donne le sens de chaque signal, sa confiance et son résultat final.
            De quoi juger le système sur pièces avant d&apos;engager le moindre dollar. Le Premium
            n&apos;ajoute qu&apos;une chose, mais c&apos;est la seule qui compte pour trader :{" "}
            <strong style={{ color: tc.texte }}>recevoir les niveaux à l&apos;instant où ils sortent</strong>.
          </p>
        </header>

        {plan === "premium" && (
          <Carte fort style={{ borderColor: `${tc.or}55`, textAlign: "center", marginBottom: 26 }}>
            <Pastille couleur={tc.or}>★ TON PREMIUM EST ACTIF</Pastille>
            <p style={{ margin: "12px 0 0", fontSize: 13.5, color: tc.texteDoux }}>
              Tu reçois déjà tous les signaux en temps réel. Souscrire à nouveau prolonge ton
              abonnement à partir de sa date de fin — tu ne perds aucun jour.
            </p>
          </Carte>
        )}

        {/* ═══════════════════════════════════ les deux colonnes ═══════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 15, marginBottom: 30 }}>
          <Carte>
            <p style={{ margin: "0 0 4px", fontSize: 10.5, letterSpacing: 2.5, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
              Gratuit
            </p>
            <p style={{ ...chiffres, margin: "0 0 18px", fontSize: 34, fontWeight: 900, color: tc.texte }}>
              0 <span style={{ fontSize: 15, color: tc.texteDoux }}>$</span>
            </p>
            {[
              "Le sens de chaque signal (achat ou vente)",
              "Le score de confiance complet",
              "Le résultat final de chaque trade",
              "Les statistiques globales du système",
              "Les 5 derniers signaux",
              "Les niveaux, avec 60 minutes de retard",
            ].map((t) => (
              <Avantage key={t} texte={t} couleur={tc.texteDoux} />
            ))}
          </Carte>

          <Carte fort style={{ borderColor: `${tc.or}44`, position: "relative", overflow: "hidden" }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: -80,
                right: -60,
                width: 210,
                height: 210,
                borderRadius: "50%",
                background: `radial-gradient(circle,${tc.or}1f,transparent 70%)`,
              }}
            />
            <p style={{ margin: "0 0 4px", fontSize: 10.5, letterSpacing: 2.5, textTransform: "uppercase", color: tc.or, fontWeight: 700 }}>
              ★ Premium
            </p>
            <p style={{ ...chiffres, margin: "0 0 18px", fontSize: 34, fontWeight: 900, color: tc.or }}>
              {formules[choix]?.prix ?? "—"} <span style={{ fontSize: 15, color: tc.texteDoux }}>$ / {formules[choix]?.libelle}</span>
            </p>
            {[
              "Les signaux en temps réel, sans aucun délai",
              "Notification push, email et Telegram en secondes",
              "L'historique complet, sans limite",
              "Le journal de performance détaillé",
              "L'explication de l'analyse pour chaque signal",
              "La taille de position calculée sur ton capital",
            ].map((t) => (
              <Avantage key={t} texte={t} couleur={tc.texte} puce={tc.or} />
            ))}
          </Carte>
        </div>

        {/* ═══════════════════════════════════════════ la durée ════════ */}
        <div style={{ ...verre(true), padding: 24, marginBottom: 20 }}>
          <p style={{ margin: "0 0 14px", fontSize: 10.5, letterSpacing: 2.4, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
            Choisis ta durée
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 20 }}>
            {cles.map((cle) => {
              const f = formules[cle];
              const actif = choix === cle;
              const parMois = Math.round((f.prix / f.mois) * 10) / 10;
              return (
                <button
                  key={cle}
                  onClick={() => setChoix(cle)}
                  style={{
                    background: actif ? "rgba(240,200,64,.1)" : "rgba(255,255,255,.03)",
                    border: `1.5px solid ${actif ? tc.or : tc.bord}`,
                    borderRadius: 14,
                    padding: "15px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <p style={{ margin: "0 0 5px", fontSize: 12.5, fontWeight: 800, color: actif ? tc.or : tc.texteDoux }}>
                    {f.libelle}
                  </p>
                  <p style={{ ...chiffres, margin: 0, fontSize: 22, fontWeight: 900, color: tc.texte }}>
                    {f.prix} $
                  </p>
                  <p style={{ ...chiffres, margin: "3px 0 0", fontSize: 11, color: texteFaible }}>
                    soit {parMois} $ / mois
                  </p>
                </button>
              );
            })}
          </div>

          {!paiementPret ? (
            <div style={{ ...verre(), padding: "15px 18px", borderColor: `${tc.or}44` }}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: tc.or }}>
                Le paiement n&apos;est pas encore activé sur ce serveur (clé PayPal absente). Les
                abonnements peuvent être accordés manuellement depuis le panneau
                d&apos;administration en attendant.
              </p>
            </div>
          ) : (
            <Bouton onClick={souscrire} pleineLargeur desactive={envoi}>
              {envoi ? "Redirection vers PayPal…" : `Souscrire — ${formules[choix]?.prix ?? ""} $`}
            </Bouton>
          )}

          {message && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: tc.vente, textAlign: "center" }}>{message}</p>
          )}

          <p style={{ margin: "14px 0 0", fontSize: 11.5, lineHeight: 1.7, color: texteFaible, textAlign: "center" }}>
            Paiement unique, sans reconduction automatique. Ton accès s&apos;arrête à la date
            d&apos;échéance sans que rien ne te soit prélevé.
          </p>
        </div>

        {/* ═══════════════════════════════════ ce qu'on ne promet pas ══ */}
        <Carte style={{ borderColor: `${tc.bordFort}` }}>
          <p style={{ margin: "0 0 10px", fontSize: 10.5, letterSpacing: 2.4, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
            Ce que cet abonnement n&apos;est pas
          </p>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.85, color: tc.texteDoux }}>
            Ce n&apos;est pas une promesse de gains. Aucun taux de réussite n&apos;est garanti, et
            aucun résultat passé ne préjuge des résultats futurs. La plateforme n&apos;exécute jamais
            d&apos;ordre à ta place : elle analyse, elle note, elle prévient — tu décides. Le trading
            comporte un risque de perte en capital pouvant aller jusqu&apos;à la totalité des sommes
            engagées. N&apos;engage jamais un argent dont tu as besoin.
          </p>
        </Carte>
      </div>
    </div>
  );
}

function Avantage({ texte, couleur, puce }: { texte: string; couleur: string; puce?: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0" }}>
      <span style={{ color: puce ?? tc.cyan, fontSize: 12, lineHeight: 1.65 }}>◆</span>
      <span style={{ fontSize: 13.5, color: couleur, lineHeight: 1.65 }}>{texte}</span>
    </div>
  );
}
