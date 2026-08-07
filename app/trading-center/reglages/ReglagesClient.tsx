"use client";

/**
 * LES RÉGLAGES.
 *
 * Deux champs de cet écran engagent de l'argent réel : le capital et le
 * pourcentage de risque. Tout le reste est du confort.
 *
 * ── Pourquoi le risque est plafonné à 5 % dans le curseur ─────────────────
 *
 * Le serveur accepte jusqu'à 10 %, l'interface s'arrête à 5. Ce n'est pas une
 * incohérence : le serveur borne ce qui est ACCEPTABLE, l'interface propose ce
 * qui est RAISONNABLE. À 5 % par trade, six pertes d'affilée — parfaitement
 * ordinaires — coûtent un quart du compte. Au-delà, on ne règle plus un
 * paramètre, on décide de faire sauter la banque, et ça ne se fait pas au
 * curseur.
 *
 * Le repère « perte après 5 trades perdants » est affiché en direct sous le
 * curseur. C'est la seule façon de rendre un pourcentage abstrait concret
 * avant qu'il ne le devienne sur un relevé de compte.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReglagesUtilisateur } from "@/lib/trading-center/types";
import { Bouton, Carte, Pastille, Squelette, Titre, chiffres, tc, texteFaible, verre } from "../ui";

export default function ReglagesClient() {
  const [r, setR] = useState<ReglagesUtilisateur | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [marches, setMarches] = useState<string[]>([]);
  const [etat, setEtat] = useState<"pret" | "envoi" | "ok" | "erreur">("pret");
  const [message, setMessage] = useState<string | null>(null);
  const [nonConnecte, setNonConnecte] = useState(false);

  useEffect(() => {
    fetch("/api/trading-center/reglages", { cache: "no-store" })
      .then((res) => (res.status === 401 ? (setNonConnecte(true), null) : res.json()))
      .then((j) => {
        if (!j) return;
        setR(j.reglages);
        setPlan(j.plan);
        setMarches(j.marches_disponibles ?? []);
      })
      .catch(() => setMessage("Chargement impossible."));
  }, []);

  async function enregistrer() {
    if (!r) return;
    setEtat("envoi");
    try {
      const res = await fetch("/api/trading-center/reglages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      const j = await res.json();
      if (!res.ok) {
        setEtat("erreur");
        setMessage(j.error ?? "Enregistrement refusé.");
        return;
      }
      // On réinjecte la réponse du serveur : c'est LUI qui a le dernier mot
      // sur les bornes. Garder l'état local ferait croire qu'un risque de 40 %
      // a été accepté alors qu'il a été ramené à 10.
      setR(j.reglages);
      setEtat("ok");
      setMessage(null);
      setTimeout(() => setEtat("pret"), 2200);
    } catch {
      setEtat("erreur");
      setMessage("Le serveur est injoignable.");
    }
  }

  const fond = { minHeight: "100vh", background: `radial-gradient(1100px 560px at 50% -8%,#0d1f3d 0%,${tc.fond} 62%)`, color: tc.texte };

  if (nonConnecte) {
    return (
      <div style={fond}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "70px 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Connexion nécessaire</h1>
          <p style={{ fontSize: 14.5, color: tc.texteDoux, lineHeight: 1.8, marginBottom: 22 }}>
            Tes réglages sont liés à ton compte KONEKSYON PAM.
          </p>
          <Bouton href="/trading-center" variante="fantome">
            ← Trading Center
          </Bouton>
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div style={fond}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "26px 18px", display: "grid", gap: 14 }}>
          <Squelette hauteur={90} />
          <Squelette hauteur={220} />
          <Squelette hauteur={220} />
        </div>
      </div>
    );
  }

  const maj = (champ: Partial<ReglagesUtilisateur>) => setR({ ...r, ...champ });
  const perte5 = r.capital ? Math.round(r.capital * (1 - (1 - r.risque_pct / 100) ** 5)) : null;

  return (
    <div style={fond}>
      <style>{`@keyframes tcPulse{0%,100%{background-position:200% 0}50%{background-position:0 0}}`}</style>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 18px 80px" }}>
        <Link href="/trading-center" style={{ fontSize: 12.5, color: tc.texteDoux, textDecoration: "none" }}>
          ← Trading Center
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0 24px", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(24px,4.2vw,34px)", fontWeight: 900, letterSpacing: -1 }}>
            Mes réglages
          </h1>
          <Pastille couleur={plan === "premium" ? tc.or : tc.neutre}>
            {plan === "premium" ? "★ PREMIUM" : "GRATUIT"}
          </Pastille>
        </div>

        {/* ═══════════════════════════════ gestion du risque ═══════════ */}
        <Carte fort style={{ marginBottom: 16, borderColor: `${tc.vente}30` }}>
          <Titre sur="Ce qui décide du montant que tu engages">Gestion du risque</Titre>

          <label style={etiquette}>Capital du compte</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <input
              type="number"
              min={0}
              step={50}
              value={r.capital ?? ""}
              placeholder="ex. 2000"
              onChange={(e) => maj({ capital: e.target.value === "" ? null : Number(e.target.value) })}
              style={champ}
            />
            <span style={{ fontSize: 14, color: tc.texteDoux, fontWeight: 700 }}>$</span>
          </div>

          <label style={etiquette}>Risque par trade — {r.risque_pct} %</label>
          <input
            type="range"
            min={0.25}
            max={5}
            step={0.25}
            value={r.risque_pct}
            onChange={(e) => maj({ risque_pct: Number(e.target.value) })}
            style={{ width: "100%", accentColor: tc.or, marginBottom: 8 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: texteFaible, marginBottom: 12 }}>
            <span>0,25 % — prudent</span>
            <span>5 % — agressif</span>
          </div>

          {/* Le repère qui rend le pourcentage concret. Voir l'en-tête. */}
          <div
            style={{
              ...verre(),
              padding: "13px 16px",
              background: perte5 && r.capital && perte5 > r.capital * 0.2 ? "rgba(244,63,94,.09)" : "rgba(255,255,255,.03)",
            }}
          >
            {r.capital ? (
              <>
                <p style={{ margin: "0 0 4px", fontSize: 11.5, color: tc.texteDoux }}>
                  Si tu enchaînes <strong style={{ color: tc.texte }}>5 trades perdants</strong> — ce qui
                  arrive à tout le monde :
                </p>
                <p style={{ ...chiffres, margin: 0, fontSize: 20, fontWeight: 800, color: tc.vente }}>
                  −{perte5} $
                  <span style={{ fontSize: 12.5, color: tc.texteDoux, fontWeight: 600, marginLeft: 8 }}>
                    il te resterait {r.capital - (perte5 ?? 0)} $
                  </span>
                </p>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: texteFaible }}>
                Renseigne ton capital pour voir ce que ce pourcentage représente en dollars — et pour
                que la taille de position soit calculée sur chaque signal.
              </p>
            )}
          </div>
        </Carte>

        {/* ═══════════════════════════════════════ notifications ═══════ */}
        <Carte style={{ marginBottom: 16 }}>
          <Titre sur={plan === "premium" ? "En temps réel" : "Réservé au Premium"}>Notifications</Titre>

          {plan !== "premium" && (
            <p style={{ margin: "0 0 16px", fontSize: 12.5, lineHeight: 1.7, color: tc.or }}>
              Les notifications en direct font partie du Premium. Tu peux régler tes préférences dès
              maintenant : elles s&apos;appliqueront le jour où tu souscriras.
            </p>
          )}

          {[
            { cle: "canal_app" as const, nom: "Cloche du site", desc: "Dans le centre de notifications de KONEKSYON PAM" },
            { cle: "canal_push" as const, nom: "Notification push", desc: "Sur ton téléphone, même application fermée — le canal le plus rapide" },
            { cle: "canal_email" as const, nom: "Email", desc: "Le signal complet, mis en forme, dans ta boîte" },
            { cle: "canal_telegram" as const, nom: "Telegram", desc: "Nécessite ton identifiant de discussion" },
          ].map((c) => (
            <Bascule
              key={c.cle}
              nom={c.nom}
              description={c.desc}
              actif={r[c.cle]}
              onChange={(v) => maj({ [c.cle]: v } as Partial<ReglagesUtilisateur>)}
            />
          ))}

          {r.canal_telegram && (
            <div style={{ marginTop: 12 }}>
              <label style={etiquette}>Identifiant de discussion Telegram</label>
              <input
                type="text"
                inputMode="numeric"
                value={r.telegram_chat_id ?? ""}
                placeholder="ex. 123456789"
                onChange={(e) => maj({ telegram_chat_id: e.target.value })}
                style={champ}
              />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: texteFaible, lineHeight: 1.6 }}>
                Écris <code style={{ color: tc.cyan }}>/start</code> à{" "}
                <strong style={{ color: tc.texteDoux }}>@userinfobot</strong> sur Telegram : il te
                répondra ton identifiant. Sans lui, le canal reste éteint.
              </p>
            </div>
          )}

          <div
            style={{
              marginTop: 14,
              padding: "11px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,.03)",
              border: `1px solid ${tc.bord}`,
            }}
          >
            <p style={{ margin: 0, fontSize: 11.5, color: texteFaible, lineHeight: 1.6 }}>
              <strong style={{ color: tc.texteDoux }}>SMS</strong> — pas encore disponible. Le canal
              existe dans la base mais aucun fournisseur n&apos;est branché ; l&apos;afficher comme
              activable donnerait l&apos;impression de recevoir des SMS qui ne partiraient jamais.
            </p>
          </div>
        </Carte>

        {/* ═══════════════════════════════════════════ marchés ═════════ */}
        {marches.length > 0 && (
          <Carte style={{ marginBottom: 16 }}>
            <Titre sur="Ce que tu veux suivre">Marchés</Titre>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {marches.map((code) => {
                const actif = r.marches.includes(code);
                return (
                  <button
                    key={code}
                    onClick={() =>
                      maj({ marches: actif ? r.marches.filter((m) => m !== code) : [...r.marches, code] })
                    }
                    style={{
                      background: actif ? `linear-gradient(135deg,${tc.orSombre},${tc.or})` : "rgba(255,255,255,.04)",
                      color: actif ? "#0d1d3d" : tc.texteDoux,
                      border: `1px solid ${actif ? "transparent" : tc.bord}`,
                      borderRadius: 999,
                      padding: "8px 18px",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
            {r.marches.length === 0 && (
              <p style={{ margin: "10px 0 0", fontSize: 12, color: tc.vente }}>
                Aucun marché sélectionné : tu ne recevras aucune notification.
              </p>
            )}
          </Carte>
        )}

        {/* ═══════════════════════════════════════ préférences ═════════ */}
        <Carte style={{ marginBottom: 22 }}>
          <Titre sur="Confort">Affichage</Titre>

          <label style={etiquette}>Langue</label>
          <select value={r.langue} onChange={(e) => maj({ langue: e.target.value })} style={{ ...champ, marginBottom: 16 }}>
            <option value="fr">Français</option>
            <option value="ht">Kreyòl ayisyen</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>

          <label style={etiquette}>Fuseau horaire</label>
          <select value={r.fuseau} onChange={(e) => maj({ fuseau: e.target.value })} style={champ}>
            {[
              ["America/New_York", "New York / Port-au-Prince (UTC−4)"],
              ["America/Chicago", "Chicago (UTC−5)"],
              ["America/Los_Angeles", "Los Angeles (UTC−7)"],
              ["Europe/Paris", "Paris (UTC+2)"],
              ["Europe/London", "Londres (UTC+1)"],
              ["UTC", "UTC"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Carte>

        {/* ═══════════════════════════════════════ validation ═════════ */}
        <div style={{ position: "sticky", bottom: 16 }}>
          <Bouton onClick={enregistrer} pleineLargeur desactive={etat === "envoi"}>
            {etat === "envoi" ? "Enregistrement…" : etat === "ok" ? "✓ Enregistré" : "Enregistrer mes réglages"}
          </Bouton>
        </div>

        {message && (
          <p style={{ margin: "12px 0 0", fontSize: 13, color: tc.vente, textAlign: "center" }}>{message}</p>
        )}
      </div>
    </div>
  );
}

const etiquette: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  letterSpacing: 1.9,
  textTransform: "uppercase",
  color: tc.texteDoux,
  fontWeight: 700,
  marginBottom: 7,
};

const champ: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,.05)",
  border: `1px solid ${tc.bordFort}`,
  borderRadius: 11,
  padding: "12px 15px",
  fontSize: 15,
  color: tc.texte,
  fontFamily: "inherit",
  fontVariantNumeric: "tabular-nums",
};

function Bascule({
  nom,
  description,
  actif,
  onChange,
}: {
  nom: string;
  description: string;
  actif: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!actif)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        textAlign: "left",
        background: "transparent",
        border: "none",
        borderBottom: `1px solid ${tc.bord}`,
        padding: "13px 0",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          width: 42,
          height: 24,
          borderRadius: 999,
          background: actif ? `linear-gradient(135deg,${tc.orSombre},${tc.or})` : "rgba(255,255,255,.1)",
          position: "relative",
          flexShrink: 0,
          transition: "background .25s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: actif ? 21 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .25s cubic-bezier(.34,1.56,.64,1)",
          }}
        />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: tc.texte }}>{nom}</span>
        <span style={{ display: "block", fontSize: 11.5, color: texteFaible, lineHeight: 1.5, marginTop: 2 }}>
          {description}
        </span>
      </span>
    </button>
  );
}
