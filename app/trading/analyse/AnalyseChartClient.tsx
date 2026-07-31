"use client";

/**
 * ANALYSER SON PROPRE GRAPHIQUE.
 *
 * Le reste de l'académie travaille sur des graphiques que nous générons — donc
 * dont nous connaissons la réponse. Ici, c'est l'inverse : l'élève apporte son
 * marché, son unité de temps, son vrai contexte. C'est le pont entre l'exercice
 * et la séance réelle.
 *
 * Deux choix qui font la différence avec un simple « uploader une image » :
 *
 * 1. **L'élève donne son avis avant de voir le verdict.** Facultatif, mais
 *    proposé par défaut. Sans ça, l'outil remplace son jugement au lieu de le
 *    former — exactement ce que l'académie refuse depuis le Niveau 1.
 *
 * 2. **L'image est réduite dans le navigateur avant l'envoi.** Une capture de
 *    plein écran pèse plusieurs mégaoctets ; 1400 px de côté suffisent
 *    largement à lire des bougies, et l'envoi passe partout.
 *
 * Le résultat n'accorde ni XP ni maîtrise : une compétence se démontre sur un
 * exercice dont le système connaît la réponse, pas sur une analyse déléguée.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { color, gradient } from "@/lib/design";

// ------------------------------------------------------------------ types ---

type Verdict = "achat" | "vente" | "attendre";
type Tendance = "haussiere" | "baissiere" | "range";

interface Figure {
  nom: string;
  ou: string;
  lecture: string;
}

interface Analyse {
  lisible: boolean;
  probleme: string | null;
  instrument?: string | null;
  unite_temps?: string | null;
  tendance: Tendance;
  verdict: Verdict;
  confiance: number;
  resume: string;
  structure: string;
  momentum: string;
  bougies: Figure[];
  support?: string | null;
  resistance?: string | null;
  zone_entree?: string | null;
  objectif?: string | null;
  invalidation: string;
  contre_argument: string;
  a_verifier: string[];
}

const VERDICTS: Record<Verdict, { label: string; ton: string; fond: string; phrase: string }> = {
  achat: {
    label: "ACHAT",
    ton: color.success,
    fond: "#eaf7ee",
    phrase: "Le graphique penche à la hausse.",
  },
  vente: {
    label: "VENTE",
    ton: color.danger,
    fond: "#fdeeee",
    phrase: "Le graphique penche à la baisse.",
  },
  attendre: {
    label: "ATTENDRE",
    ton: color.textMuted,
    fond: color.grayLight,
    phrase: "Aucun sens n'est défendable pour l'instant.",
  },
};

const TENDANCES: Record<Tendance, string> = {
  haussiere: "Tendance haussière",
  baissiere: "Tendance baissière",
  range: "Range — pas de tendance",
};

/** Côté le plus long de l'image envoyée. Au-delà, on ne gagne plus en lisibilité. */
const COTE_MAX = 1400;
const POIDS_MAX = 12 * 1024 * 1024;

// ------------------------------------------------------------- traitement ---

/**
 * Réduit l'image et la réencode en JPEG. Renvoie l'aperçu (data URL) et le
 * base64 nu attendu par l'API.
 */
async function preparer(file: File): Promise<{ apercu: string; base64: string }> {
  const bitmap = await createImageBitmap(file);
  const facteur = Math.min(1, COTE_MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * facteur);
  const h = Math.round(bitmap.height * facteur);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Ce navigateur ne peut pas préparer l'image.");
  // Fond blanc : un PNG transparent deviendrait noir en JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // 0.92 : les étiquettes de prix et le symbole restent lisibles.
  const apercu = canvas.toDataURL("image/jpeg", 0.92);
  return { apercu, base64: apercu.slice(apercu.indexOf(",") + 1) };
}

// ------------------------------------------------------------- composant ----

export default function AnalyseChartClient() {
  const [apercu, setApercu] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [avis, setAvis] = useState<Verdict | null>(null);
  const [avisIgnore, setAvisIgnore] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [survol, setSurvol] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const charger = useCallback(async (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErreur("Ce fichier n'est pas une image.");
      return;
    }
    if (file.size > POIDS_MAX) {
      setErreur("Image trop lourde. Une capture d'écran suffit — inutile d'envoyer une photo.");
      return;
    }
    setErreur(null);
    setAnalyse(null);
    setAvis(null);
    setAvisIgnore(false);
    try {
      const { apercu, base64 } = await preparer(file);
      setApercu(apercu);
      setBase64(base64);
    } catch {
      setErreur("Impossible de lire cette image. Essaie un JPG ou un PNG.");
    }
  }, []);

  // Coller une capture (Cmd/Ctrl+V) — c'est le geste naturel après un
  // screenshot de TradingView, autant le supporter.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (file) {
        e.preventDefault();
        void charger(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [charger]);

  const analyser = useCallback(async () => {
    if (!base64 || chargement) return;
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/trading/analyse-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: "image/jpeg", note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "L'analyse a échoué.");
      setAnalyse(data.analyse as Analyse);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "L'analyse a échoué.");
    } finally {
      setChargement(false);
    }
  }, [base64, chargement, note]);

  function recommencer() {
    setApercu(null);
    setBase64(null);
    setNote("");
    setAvis(null);
    setAvisIgnore(false);
    setAnalyse(null);
    setErreur(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const peutAnalyser = !!base64 && !chargement && !analyse;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 18px 70px" }}>
      {/* En-tête */}
      <Link href="/trading" style={{ color: color.textMuted, fontSize: 13, textDecoration: "none" }}>
        ← Académie Trading
      </Link>
      <h1 style={{ margin: "6px 0 0", fontSize: "clamp(23px,3.6vw,30px)", color: color.textDark, fontWeight: 800 }}>
        Analyser mon graphique
      </h1>
      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: color.textMuted, margin: "10px 0 24px", maxWidth: 660 }}>
        Envoie une capture de ton graphique en bougies. Le système lit la tendance, la
        structure, les figures et le momentum, puis conclut&nbsp;: <strong>achat, vente ou
        attendre</strong> — avec ce qui invaliderait cette lecture.
      </p>

      {/* Dépôt de l'image */}
      {!apercu ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setSurvol(true);
          }}
          onDragLeave={() => setSurvol(false)}
          onDrop={(e) => {
            e.preventDefault();
            setSurvol(false);
            void charger(e.dataTransfer.files?.[0]);
          }}
          style={{
            border: `2px dashed ${survol ? color.gold : color.borderBlue}`,
            background: survol ? color.goldPale : color.white,
            borderRadius: 14,
            padding: "48px 24px",
            textAlign: "center",
            cursor: "pointer",
            transition: "background .15s, border-color .15s",
          }}
        >
          <div style={{ fontSize: 34, lineHeight: 1 }}>📈</div>
          <div style={{ fontSize: 16.5, fontWeight: 800, color: color.textDark, marginTop: 12 }}>
            Dépose ta capture ici
          </div>
          <div style={{ fontSize: 14, color: color.textMuted, marginTop: 7, lineHeight: 1.6 }}>
            ou clique pour choisir un fichier — tu peux aussi <strong>coller</strong> une capture
            avec Cmd/Ctrl&nbsp;+&nbsp;V.
            <br />
            JPG, PNG, GIF ou WebP.
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => void charger(e.target.files?.[0])}
            style={{ display: "none" }}
          />
        </div>
      ) : (
        <div
          style={{
            border: `1px solid ${color.border}`,
            borderRadius: 14,
            overflow: "hidden",
            background: color.white,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={apercu}
            alt="Le graphique envoyé"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              padding: "11px 15px",
              borderTop: `1px solid ${color.border}`,
              background: color.bgLight,
            }}
          >
            <span style={{ fontSize: 13, color: color.textMuted }}>
              Image prête — réduite avant l&apos;envoi, et jamais conservée.
            </span>
            <button
              onClick={recommencer}
              style={{
                border: `1px solid ${color.border}`,
                background: color.white,
                borderRadius: 8,
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: 700,
                color: color.textMuted,
                cursor: "pointer",
              }}
            >
              Changer d&apos;image
            </button>
          </div>
        </div>
      )}

      {erreur && (
        <div
          style={{
            marginTop: 14,
            border: `1px solid ${color.danger}`,
            borderLeftWidth: 4,
            background: "#fdeeee",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 14.5,
            color: color.textBody,
          }}
        >
          {erreur}
        </div>
      )}

      {/* Contexte + avis de l'élève, avant le verdict */}
      {apercu && !analyse && (
        <>
          <div style={{ marginTop: 20 }}>
            <label
              htmlFor="note"
              style={{ display: "block", fontSize: 14, fontWeight: 700, color: color.textDark, marginBottom: 7 }}
            >
              Contexte <span style={{ fontWeight: 500, color: color.textFaint }}>— facultatif</span>
            </label>
            <input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={400}
              placeholder="Ex. : EURUSD en 15 minutes, je regarde depuis l'ouverture de Londres."
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: `1px solid ${color.border}`,
                fontSize: 14.5,
                color: color.textBody,
                background: color.white,
                boxSizing: "border-box",
              }}
            />
            <p style={{ fontSize: 12.5, color: color.textFaint, margin: "6px 0 0" }}>
              L&apos;analyse reste fondée sur l&apos;image. Ton contexte l&apos;informe, il ne la dicte pas.
            </p>
          </div>

          {!avis && !avisIgnore ? (
            <div
              style={{
                marginTop: 20,
                background: color.goldPale,
                border: `1px solid ${color.goldLight}`,
                borderRadius: 12,
                padding: "17px 19px",
              }}
            >
              <strong style={{ fontSize: 15.5, color: color.textDark }}>
                Ton avis d&apos;abord
              </strong>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: color.textBody, margin: "7px 0 13px" }}>
                Lis le graphique toi-même avant de voir le verdict. C&apos;est la seule façon de
                savoir si tu progresses — un outil qui répond à ta place ne t&apos;apprend rien.
              </p>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {(Object.keys(VERDICTS) as Verdict[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setAvis(v)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 9,
                      border: `1.5px solid ${VERDICTS[v].ton}`,
                      background: color.white,
                      color: VERDICTS[v].ton,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {VERDICTS[v].label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAvisIgnore(true)}
                style={{
                  marginTop: 12,
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 13,
                  color: color.textMuted,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Passer — je veux seulement l&apos;analyse
              </button>
            </div>
          ) : avis ? (
            <p style={{ marginTop: 18, fontSize: 14.5, color: color.textMuted }}>
              Ton avis&nbsp;: <strong style={{ color: VERDICTS[avis].ton }}>{VERDICTS[avis].label}</strong>{" "}
              <button
                onClick={() => setAvis(null)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 13,
                  color: color.textMuted,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                changer
              </button>
            </p>
          ) : null}

          <button
            onClick={() => void analyser()}
            disabled={!peutAnalyser}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "16px 22px",
              borderRadius: 12,
              border: "none",
              background: peutAnalyser ? gradient.gold : color.grayLight,
              color: peutAnalyser ? color.navyDeep : color.textFaint,
              fontWeight: 800,
              fontSize: 16,
              cursor: peutAnalyser ? "pointer" : "default",
            }}
          >
            {chargement ? "Lecture des bougies en cours…" : "Analyser ce graphique"}
          </button>
          {chargement && (
            <p style={{ fontSize: 13.5, color: color.textMuted, textAlign: "center", margin: "10px 0 0" }}>
              Structure, figures, momentum — compte une vingtaine de secondes.
            </p>
          )}
        </>
      )}

      {/* Résultat */}
      {analyse && (
        <div style={{ marginTop: 24 }}>
          {!analyse.lisible ? (
            <div
              style={{
                border: `1px solid ${color.warning}`,
                borderLeftWidth: 4,
                background: "#fffaf0",
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              <strong style={{ fontSize: 16.5, color: color.textDark }}>
                Ce graphique n&apos;est pas lisible
              </strong>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: color.textBody, margin: "8px 0 0" }}>
                {analyse.probleme ||
                  "Les bougies ne sont pas assez distinctes pour être analysées."}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: color.textMuted, margin: "10px 0 0" }}>
                Aucun verdict n&apos;est rendu ici — et c&apos;est volontaire. Deviner un sens sur une
                image qu&apos;on ne lit pas est exactement l&apos;erreur que le Niveau&nbsp;1 t&apos;apprend
                à ne plus commettre.
              </p>
              <button
                onClick={recommencer}
                style={{
                  marginTop: 14,
                  padding: "10px 18px",
                  borderRadius: 9,
                  border: "none",
                  background: color.navy,
                  color: color.white,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Envoyer une autre capture
              </button>
            </div>
          ) : (
            <>
              <Resultat analyse={analyse} avis={avis} />
              <button
                onClick={recommencer}
                style={{
                  marginTop: 22,
                  width: "100%",
                  padding: "14px 22px",
                  borderRadius: 11,
                  border: `1px solid ${color.border}`,
                  background: color.white,
                  color: color.textDark,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Analyser un autre graphique
              </button>
            </>
          )}
        </div>
      )}

      {/* Mention légale — même exigence que sur /trading. */}
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
        Contenu éducatif. Cette analyse est un exercice de lecture de graphique, pas un conseil
        financier ni une recommandation d&apos;investissement. Aucune décision de position ne
        devrait reposer sur elle seule&nbsp;: la responsabilité de tes trades t&apos;appartient
        entièrement.
      </p>
    </div>
  );
}

// -------------------------------------------------------------- résultat ----

function Resultat({ analyse: a, avis }: { analyse: Analyse; avis: Verdict | null }) {
  const v = VERDICTS[a.verdict];
  const accord = avis !== null ? avis === a.verdict : null;

  return (
    <>
      {/* Verdict */}
      <div
        style={{
          background: v.fond,
          border: `1px solid ${v.ton}`,
          borderRadius: 14,
          padding: "22px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              background: v.ton,
              color: color.white,
              fontWeight: 900,
              fontSize: 19,
              letterSpacing: 1,
            }}
          >
            {v.label}
          </span>
          <div style={{ flex: 1, minWidth: 190 }}>
            <div style={{ fontSize: 13, color: color.textMuted, fontWeight: 700 }}>
              Confiance {a.confiance}%
            </div>
            <div
              style={{
                height: 7,
                borderRadius: 99,
                background: "rgba(0,0,0,.09)",
                marginTop: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, a.confiance))}%`,
                  height: "100%",
                  background: v.ton,
                }}
              />
            </div>
          </div>
        </div>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: color.textBody, margin: "16px 0 0" }}>
          {a.resume}
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <Etiquette texte={TENDANCES[a.tendance]} />
          {a.instrument && <Etiquette texte={a.instrument} />}
          {a.unite_temps && <Etiquette texte={a.unite_temps} />}
        </div>

        {a.confiance < 50 && (
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: color.textMuted, margin: "14px 0 0" }}>
            Confiance basse&nbsp;: la configuration est ambiguë. Un signal faible se joue petit,
            ou ne se joue pas.
          </p>
        )}
      </div>

      {/* Comparaison avec l'avis de l'élève */}
      {accord !== null && (
        <div
          style={{
            marginTop: 12,
            border: `1px solid ${accord ? color.success : color.warning}`,
            borderLeftWidth: 4,
            background: accord ? "#eaf7ee" : "#fffaf0",
            borderRadius: 11,
            padding: "14px 18px",
          }}
        >
          <strong style={{ fontSize: 15, color: color.textDark }}>
            {accord ? "Même lecture que toi" : "Lecture différente de la tienne"}
          </strong>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: color.textBody, margin: "6px 0 0" }}>
            {accord
              ? "Tu avais dit la même chose. Vérifie quand même la partie « ce qui invaliderait » : être d'accord sur le sens ne dit rien sur l'endroit où l'on se trompe."
              : `Tu avais dit ${VERDICTS[avis!].label}, l'analyse dit ${v.label}. Ne change pas d'avis parce qu'une machine te contredit : lis la structure et le momentum ci-dessous, et vois lequel des deux raisonnements s'appuie sur ce qui est réellement à l'écran.`}
          </p>
        </div>
      )}

      {/* Lecture détaillée */}
      <Section titre="Structure" corps={a.structure} ton={color.cyan} />
      <Section titre="Momentum" corps={a.momentum} ton="#ea580c" />

      {a.bougies.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 17, color: color.textDark, margin: "0 0 9px", fontWeight: 800 }}>
            Figures repérées
          </h2>
          <div style={{ display: "grid", gap: 9 }}>
            {a.bougies.map((f, i) => (
              <div
                key={i}
                style={{
                  background: color.white,
                  border: `1px solid ${color.border}`,
                  borderLeft: `4px solid ${color.gold}`,
                  borderRadius: 10,
                  padding: "13px 16px",
                }}
              >
                <div style={{ display: "flex", gap: 9, alignItems: "baseline", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: 15, color: color.textDark }}>{f.nom}</strong>
                  <span style={{ fontSize: 13, color: color.textFaint }}>{f.ou}</span>
                </div>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: color.textBody, margin: "5px 0 0" }}>
                  {f.lecture}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Le plan */}
      {(a.support || a.resistance || a.zone_entree || a.objectif) && (
        <div style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 17, color: color.textDark, margin: "0 0 9px", fontWeight: 800 }}>
            Les niveaux qui comptent
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: 9,
            }}
          >
            {a.support && <Case titre="Support" valeur={a.support} ton={color.success} />}
            {a.resistance && <Case titre="Résistance" valeur={a.resistance} ton={color.danger} />}
            {a.zone_entree && <Case titre="Zone d'entrée" valeur={a.zone_entree} ton={color.navy} />}
            {a.objectif && <Case titre="Premier obstacle" valeur={a.objectif} ton={color.info} />}
          </div>
        </div>
      )}

      {/* Ce qui tue la thèse — la partie la plus importante */}
      <div
        style={{
          marginTop: 14,
          background: color.white,
          border: `1px solid ${color.border}`,
          borderLeft: `4px solid ${color.danger}`,
          borderRadius: 11,
          padding: "16px 19px",
        }}
      >
        <strong style={{ fontSize: 15.5, color: color.textDark }}>Ce qui invaliderait cette lecture</strong>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: color.textBody, margin: "7px 0 0" }}>
          {a.invalidation}
        </p>
      </div>

      <div
        style={{
          marginTop: 10,
          background: color.white,
          border: `1px solid ${color.border}`,
          borderLeft: `4px solid ${color.textMuted}`,
          borderRadius: 11,
          padding: "16px 19px",
        }}
      >
        <strong style={{ fontSize: 15.5, color: color.textDark }}>L&apos;argument d&apos;en face</strong>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: color.textBody, margin: "7px 0 0" }}>
          {a.contre_argument}
        </p>
      </div>

      {a.a_verifier.length > 0 && (
        <div
          style={{
            marginTop: 14,
            background: color.goldPale,
            border: `1px solid ${color.goldLight}`,
            borderRadius: 11,
            padding: "15px 19px",
          }}
        >
          <strong
            style={{ fontSize: 13, color: color.gold, textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            À vérifier toi-même avant d&apos;agir
          </strong>
          <ul style={{ margin: "9px 0 0", paddingLeft: 19 }}>
            {a.a_verifier.map((p, i) => (
              <li
                key={i}
                style={{ fontSize: 14.5, lineHeight: 1.65, color: color.textBody, marginBottom: 5 }}
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------------- sous-blocs -----

function Section({ titre, corps, ton }: { titre: string; corps: string; ton: string }) {
  return (
    <div
      style={{
        marginTop: 12,
        background: color.white,
        border: `1px solid ${color.border}`,
        borderLeft: `4px solid ${ton}`,
        borderRadius: 11,
        padding: "15px 19px",
      }}
    >
      <strong style={{ fontSize: 15.5, color: color.textDark }}>{titre}</strong>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: color.textBody, margin: "6px 0 0" }}>{corps}</p>
    </div>
  );
}

function Case({ titre, valeur, ton }: { titre: string; valeur: string; ton: string }) {
  return (
    <div
      style={{
        background: color.white,
        border: `1px solid ${color.border}`,
        borderTop: `3px solid ${ton}`,
        borderRadius: 10,
        padding: "12px 15px",
      }}
    >
      <div style={{ fontSize: 12, color: color.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {titre}
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.55, color: color.textDark, marginTop: 4, fontWeight: 600 }}>
        {valeur}
      </div>
    </div>
  );
}

function Etiquette({ texte }: { texte: string }) {
  return (
    <span
      style={{
        fontSize: 12.5,
        fontWeight: 700,
        padding: "5px 11px",
        borderRadius: 99,
        background: "rgba(255,255,255,.7)",
        border: `1px solid ${color.border}`,
        color: color.textMuted,
      }}
    >
      {texte}
    </span>
  );
}
