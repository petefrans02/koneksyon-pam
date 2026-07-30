"use client";

/**
 * Analyseur de graphique — l'élève dépose une capture d'écran, l'IA lit les
 * bougies récentes et dit quelle décision (achat / vente / rien) elle en
 * tirerait, avec son raisonnement.
 *
 * Ce n'est volontairement pas un exercice noté : contrairement au drill de
 * bougies (réponse connue, XP en jeu), ici il n'y a pas de « bonne réponse » à
 * vérifier — juste une lecture experte à confronter à la sienne. D'où
 * l'absence de progression/XP, et la présence du même garde-fou que le reste
 * de la section.
 */

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { color, gradient } from "@/lib/design";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface Image {
  dataUrl: string;
  base64: string;
  mediaType: string;
}

export default function AnalyseurClient() {
  const [image, setImage] = useState<Image | null>(null);
  const [contexte, setContexte] = useState("");
  const [analyse, setAnalyse] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const choisirFichier = useCallback((file: File | undefined) => {
    setErreur(null);
    setAnalyse(null);
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      setErreur("Format non pris en charge. Utilise une image JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErreur("Image trop lourde. Maximum 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      setImage({ dataUrl, base64, mediaType: file.type });
    };
    reader.onerror = () => setErreur("Impossible de lire cette image.");
    reader.readAsDataURL(file);
  }, []);

  const analyser = useCallback(async () => {
    if (!image || chargement) return;
    setChargement(true);
    setErreur(null);
    setAnalyse(null);
    try {
      const res = await fetch("/api/trading/analyse-chart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          imageData: image.base64,
          mediaType: image.mediaType,
          context: contexte,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error || "L'analyse a échoué. Réessaie.");
        return;
      }
      setAnalyse(data.analyse);
    } catch {
      setErreur("Connexion impossible. Réessaie dans un instant.");
    } finally {
      setChargement(false);
    }
  }, [image, contexte, chargement]);

  const recommencer = useCallback(() => {
    setImage(null);
    setAnalyse(null);
    setErreur(null);
    setContexte("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return (
    <div style={{ background: color.bgLight, minHeight: "100vh" }}>
      <div style={{ background: gradient.navy, padding: "40px 18px 34px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Link href="/trading" style={{ color: "#c8daf0", fontSize: 13, textDecoration: "none" }}>
            ← Académie Trading
          </Link>
          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(24px,4vw,34px)",
              color: color.white,
              fontWeight: 800,
            }}
          >
            Analyseur de graphique
          </h1>
          <p style={{ color: "#c8daf0", fontSize: 15, lineHeight: 1.6, maxWidth: 620, margin: "10px 0 0" }}>
            Dépose une capture d’écran d’un graphique en bougies. L’IA lit les bougies récentes,
            explique ce qu’elles racontent, et dit quelle décision elle en tirerait.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "26px 18px 70px" }}>
        {!image ? (
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "48px 20px",
              borderRadius: 14,
              border: `2px dashed ${color.borderBlue}`,
              background: color.white,
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 32 }}>📈</span>
            <strong style={{ color: color.textDark, fontSize: 16 }}>
              Choisis une image de graphique
            </strong>
            <span style={{ color: color.textMuted, fontSize: 13 }}>
              JPG, PNG, WebP ou GIF — 5 Mo maximum
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => choisirFichier(e.target.files?.[0])}
              style={{ display: "none" }}
            />
          </label>
        ) : (
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: `1px solid ${color.border}`,
              background: color.white,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.dataUrl}
              alt="Graphique envoyé pour analyse"
              style={{ display: "block", width: "100%", maxHeight: 420, objectFit: "contain", background: color.navyDeep }}
            />
          </div>
        )}

        {image && !analyse && (
          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: color.textBody, display: "block", marginBottom: 6 }}>
                Paire et intervalle (optionnel)
              </label>
              <input
                type="text"
                value={contexte}
                onChange={(e) => setContexte(e.target.value.slice(0, 200))}
                placeholder="ex. EUR/USD, bougies 15 minutes"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: `1px solid ${color.border}`,
                  fontSize: 14.5,
                  color: color.textDark,
                  background: color.white,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={analyser} disabled={chargement} style={bouton(true, chargement)}>
                {chargement ? "Analyse en cours…" : "Analyser ce graphique"}
              </button>
              <button onClick={recommencer} disabled={chargement} style={bouton(false, chargement)}>
                Changer d’image
              </button>
            </div>
          </div>
        )}

        {erreur && (
          <p
            style={{
              marginTop: 14,
              padding: "12px 16px",
              borderRadius: 10,
              background: "#fef2f2",
              border: `1px solid ${color.danger}`,
              color: color.danger,
              fontSize: 14,
            }}
          >
            {erreur}
          </p>
        )}

        {analyse && (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                borderRadius: 14,
                border: `1px solid ${color.border}`,
                background: color.white,
                padding: "22px 24px",
              }}
            >
              <AnalyseFormatee texte={analyse} />
            </div>
            <button onClick={recommencer} style={{ ...bouton(true, false), marginTop: 14 }}>
              Analyser un autre graphique
            </button>
          </div>
        )}

        <p style={{ fontSize: 12.5, color: color.textFaint, marginTop: 26, lineHeight: 1.7 }}>
          Contenu éducatif. L’IA lit une image statique, sans données de marché en temps réel.
          Rien ici n’est un conseil financier ni une recommandation d’investissement. Le trading
          comporte un risque de perte en capital.
        </p>
      </div>
    </div>
  );
}

/** Titres en MAJUSCULES suivis de « : » (voir le prompt système) → sous-titres dorés. */
const TITRE = /^[A-ZÀÂÉÈÊÎÔÙÛÇ0-9 '’-]{3,40}\s?:/;

function AnalyseFormatee({ texte }: { texte: string }) {
  const blocs = texte.split(/\n+/).filter((l) => l.trim());
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {blocs.map((ligne, i) => {
        const estTitre = TITRE.test(ligne.trim());
        return estTitre ? (
          <strong
            key={i}
            style={{
              display: "block",
              fontSize: 12.5,
              letterSpacing: 0.4,
              color: color.gold,
              marginTop: i > 0 ? 6 : 0,
            }}
          >
            {ligne.trim()}
          </strong>
        ) : (
          <p key={i} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: color.textBody }}>
            {ligne}
          </p>
        );
      })}
    </div>
  );
}

function bouton(principal: boolean, desactive: boolean): React.CSSProperties {
  return {
    padding: "13px 22px",
    borderRadius: 11,
    fontWeight: 800,
    fontSize: 14.5,
    border: principal ? "none" : `1.5px solid ${color.border}`,
    background: principal ? (desactive ? color.grayLight : gradient.gold) : color.white,
    color: principal ? (desactive ? color.textFaint : color.navyDeep) : color.textBody,
    cursor: desactive ? "default" : "pointer",
    opacity: desactive && !principal ? 0.6 : 1,
  };
}
