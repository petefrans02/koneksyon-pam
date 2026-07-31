"use client";

/**
 * ANALYSER SON PROPRE GRAPHIQUE, ET POSER SES QUESTIONS.
 *
 * Le reste de l'académie travaille sur des graphiques que nous générons — donc
 * dont nous connaissons la réponse. Ici, c'est l'inverse : l'élève apporte son
 * marché, son unité de temps, son vrai contexte. C'est le pont entre l'exercice
 * et la séance réelle.
 *
 * Quatre choix qui font la différence avec un simple « uploader une image » :
 *
 * 1. **Ce qui est dit est montré.** Chaque affirmation de l'analyse est tracée
 *    sur le graphique lui-même (`ChartAnnote`). L'élève ne cherche pas le
 *    support dont on lui parle : il le voit.
 *
 * 2. **C'est court.** Une phrase, trois puces, une invalidation. Une analyse
 *    qu'il faut lire deux fois n'est pas lue une seule.
 *
 * 3. **L'élève donne son avis avant de voir le verdict.** Facultatif, mais
 *    proposé par défaut. Sans ça, l'outil remplace son jugement au lieu de le
 *    former — exactement ce que l'académie refuse depuis le Niveau 1.
 *
 * 4. **L'image est réduite dans le navigateur avant l'envoi.** Une capture de
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
type TypeTrace = "niveau" | "zone" | "figure" | "tendance";
type RoleTrace = "haussier" | "baissier" | "neutre" | "invalidation";

interface Trace {
  type: TypeTrace;
  role: RoleTrace;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
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
  points: string[];
  invalidation: string;
  contre: string;
  binaire_duree?: string | null;
  binaire_bougies?: number | null;
  binaire_pourquoi?: string | null;
  option_classique?: string | null;
  comptant?: string | null;
  annotations: Trace[];
}

interface Message {
  role: "user" | "assistant";
  contenu: string;
}

const VERDICTS: Record<Verdict, { label: string; ton: string; fond: string }> = {
  achat: { label: "ACHAT", ton: color.success, fond: "#eaf7ee" },
  vente: { label: "VENTE", ton: color.danger, fond: "#fdeeee" },
  attendre: { label: "ATTENDRE", ton: color.textMuted, fond: color.grayLight },
};

const TENDANCES: Record<Tendance, string> = {
  haussiere: "Tendance haussière",
  baissiere: "Tendance baissière",
  range: "Range",
};

const TONS: Record<RoleTrace, string> = {
  haussier: "#16a34a",
  baissier: "#dc2626",
  neutre: "#0ea5e9",
  invalidation: "#f59e0b",
};

/** Côté le plus long de l'image envoyée. Au-delà, on ne gagne plus en lisibilité. */
const COTE_MAX = 1400;
const POIDS_MAX = 12 * 1024 * 1024;

const SUGGESTIONS_CHART = [
  "Je prends quelle expiration ?",
  "J'entre maintenant ou j'attends la clôture de la bougie ?",
  "Où est-ce que je me tromperais sur ce graphique ?",
  "Ce niveau vaut quelque chose ou je l'invente ?",
];

const SUGGESTIONS_LIBRE = [
  "Quel taux de réussite il faut pour être rentable à 80 % de payout ?",
  "La martingale, ça marche vraiment ?",
  "Une paire OTC du week-end, c'est le même marché ?",
  "Je mise combien par trade ?",
];

// ------------------------------------------------------------- traitement ---

/**
 * Réduit l'image et la réencode en JPEG. Renvoie l'aperçu (data URL), le base64
 * nu attendu par l'API, et les dimensions — nécessaires pour poser les
 * annotations à la bonne échelle.
 */
async function preparer(file: File): Promise<{
  apercu: string;
  base64: string;
  largeur: number;
  hauteur: number;
}> {
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
  return { apercu, base64: apercu.slice(apercu.indexOf(",") + 1), largeur: w, hauteur: h };
}

// ------------------------------------------------------------- composant ----

export default function AnalyseChartClient() {
  const [apercu, setApercu] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [dim, setDim] = useState<{ largeur: number; hauteur: number } | null>(null);
  const [note, setNote] = useState("");
  const [avis, setAvis] = useState<Verdict | null>(null);
  const [avisIgnore, setAvisIgnore] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [traces, setTraces] = useState(true);
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
      const p = await preparer(file);
      setApercu(p.apercu);
      setBase64(p.base64);
      setDim({ largeur: p.largeur, hauteur: p.hauteur });
    } catch {
      setErreur("Impossible de lire cette image. Essaie un JPG ou un PNG.");
    }
  }, []);

  // Coller une capture (Cmd/Ctrl+V) — c'est le geste naturel après un
  // screenshot de TradingView ou de Pocket Option, autant le supporter.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const cible = e.target as HTMLElement | null;
      // Ne pas voler le collage d'un champ de saisie.
      if (cible && (cible.tagName === "INPUT" || cible.tagName === "TEXTAREA")) return;
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
      setTraces(true);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "L'analyse a échoué.");
    } finally {
      setChargement(false);
    }
  }, [base64, chargement, note]);

  function recommencer() {
    setApercu(null);
    setBase64(null);
    setDim(null);
    setNote("");
    setAvis(null);
    setAvisIgnore(false);
    setAnalyse(null);
    setErreur(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const peutAnalyser = !!base64 && !chargement && !analyse;
  const aTraces = !!analyse?.lisible && analyse.annotations.length > 0;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 18px 70px" }}>
      {/* En-tête */}
      <Link href="/trading" style={{ color: color.textMuted, fontSize: 13, textDecoration: "none" }}>
        ← Académie Trading
      </Link>
      <h1
        style={{
          margin: "6px 0 0",
          fontSize: "clamp(23px,3.6vw,30px)",
          color: color.textDark,
          fontWeight: 800,
        }}
      >
        Analyser mon graphique
      </h1>
      <p
        style={{
          fontSize: 15.5,
          lineHeight: 1.7,
          color: color.textMuted,
          margin: "10px 0 24px",
          maxWidth: 680,
        }}
      >
        Envoie une capture de ton graphique en bougies. Le verdict tombe —{" "}
        <strong>achat, vente ou attendre</strong> — et tout ce qui est écrit est tracé
        directement sur le graphique. Ensuite, pose tes questions.
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
          <ChartAnnote
            src={apercu}
            dim={dim}
            traces={aTraces && traces ? analyse!.annotations : []}
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
              {aTraces
                ? "Tout ce qui est écrit plus bas est tracé ici."
                : "Image prête — réduite avant l'envoi, et jamais conservée."}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {aTraces && (
                <button
                  onClick={() => setTraces((t) => !t)}
                  style={boutonSecondaire}
                >
                  {traces ? "Masquer les tracés" : "Afficher les tracés"}
                </button>
              )}
              <button onClick={recommencer} style={boutonSecondaire}>
                Changer d&apos;image
              </button>
            </div>
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
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 700,
                color: color.textDark,
                marginBottom: 7,
              }}
            >
              Contexte <span style={{ fontWeight: 500, color: color.textFaint }}>— facultatif</span>
            </label>
            <input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={400}
              placeholder="Ex. : EURUSD en 1 minute sur Pocket Option, j'hésite sur l'expiration."
              style={champ}
            />
            <p style={{ fontSize: 12.5, color: color.textFaint, margin: "6px 0 0" }}>
              L&apos;analyse reste fondée sur l&apos;image. Ton contexte l&apos;informe, il ne la
              dicte pas.
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
              <strong style={{ fontSize: 15.5, color: color.textDark }}>Ton avis d&apos;abord</strong>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: color.textBody,
                  margin: "7px 0 13px",
                }}
              >
                Lis le graphique toi-même avant de voir le verdict. Un outil qui répond à ta place
                ne t&apos;apprend rien.
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
              <button onClick={() => setAvisIgnore(true)} style={lienBouton}>
                Passer — je veux seulement l&apos;analyse
              </button>
            </div>
          ) : avis ? (
            <p style={{ marginTop: 18, fontSize: 14.5, color: color.textMuted }}>
              Ton avis&nbsp;:{" "}
              <strong style={{ color: VERDICTS[avis].ton }}>{VERDICTS[avis].label}</strong>{" "}
              <button onClick={() => setAvis(null)} style={{ ...lienBouton, marginTop: 0 }}>
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
            <p
              style={{
                fontSize: 13.5,
                color: color.textMuted,
                textAlign: "center",
                margin: "10px 0 0",
              }}
            >
              Structure, figures, momentum, puis les tracés — compte une vingtaine de secondes.
            </p>
          )}
        </>
      )}

      {/* Résultat */}
      {analyse && (
        <div style={{ marginTop: 20 }}>
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
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: color.textMuted,
                  margin: "10px 0 0",
                }}
              >
                Aucun verdict n&apos;est rendu — deviner un sens sur une image qu&apos;on ne lit pas
                est exactement l&apos;erreur que le Niveau&nbsp;1 t&apos;apprend à ne plus commettre.
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
                  marginTop: 16,
                  width: "100%",
                  padding: "13px 22px",
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

      {/* L'assistant — toujours disponible, avec ou sans graphique */}
      <Assistant image={base64} analyse={analyse} aGraphique={!!apercu} />

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
        Contenu éducatif. Cette analyse et ces réponses sont des exercices de lecture de
        graphique, pas un conseil financier ni une recommandation d&apos;investissement. Les
        options à durée fixe font perdre la mise entière quand la lecture est fausse&nbsp;: aucune
        décision de position ne devrait reposer sur cette page seule, et la responsabilité de tes
        trades t&apos;appartient entièrement.
      </p>
    </div>
  );
}

// ------------------------------------------------- le graphique annoté ------

/**
 * L'image de l'élève, avec les tracés de l'analyse superposés.
 *
 * Le SVG reprend les dimensions réelles de l'image comme `viewBox` : les
 * coordonnées normalisées se convertissent alors en pixels d'image, et rien
 * n'est déformé quel que soit l'affichage. Les épaisseurs et les tailles de
 * texte sont exprimées dans cette même échelle, donc restent proportionnées.
 */
function ChartAnnote({
  src,
  dim,
  traces,
}: {
  src: string;
  dim: { largeur: number; hauteur: number } | null;
  traces: Trace[];
}) {
  const W = dim?.largeur ?? 1400;
  const H = dim?.hauteur ?? 800;
  // Calibré pour rester lisible sur un téléphone sans écraser les bougies.
  const trait = Math.max(2, W / 500);
  const police = Math.max(13, W / 62);

  return (
    <div style={{ position: "relative", lineHeight: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Le graphique envoyé" style={{ display: "block", width: "100%", height: "auto" }} />
      {traces.length > 0 && (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          aria-label="Tracés de l'analyse"
        >
          <defs>
            {(Object.keys(TONS) as RoleTrace[]).map((r) => (
              <marker
                key={r}
                id={`pointe-${r}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={TONS[r]} />
              </marker>
            ))}
          </defs>
          {traces.map((t, i) => (
            <Tracee key={i} t={t} W={W} H={H} trait={trait} police={police} />
          ))}
        </svg>
      )}
    </div>
  );
}

function Tracee({
  t,
  W,
  H,
  trait,
  police,
}: {
  t: Trace;
  W: number;
  H: number;
  trait: number;
  police: number;
}) {
  const ton = TONS[t.role] ?? TONS.neutre;
  const x1 = t.x1 * W;
  const y1 = t.y1 * H;
  const x2 = t.x2 * W;
  const y2 = t.y2 * H;

  if (t.type === "niveau") {
    return (
      <>
        <line
          x1={0}
          y1={y1}
          x2={W}
          y2={y1}
          stroke={ton}
          strokeWidth={trait}
          strokeDasharray={`${trait * 4} ${trait * 3}`}
          opacity={0.95}
        />
        <Etiquette x={trait * 4} y={y1} texte={t.label} ton={ton} police={police} ancrage="gauche" />
      </>
    );
  }

  if (t.type === "tendance") {
    return (
      <>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={ton}
          strokeWidth={trait * 1.3}
          markerEnd={`url(#pointe-${t.role})`}
          opacity={0.9}
        />
        <Etiquette
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2}
          texte={t.label}
          ton={ton}
          police={police}
          ancrage="centre"
        />
      </>
    );
  }

  // "zone" et "figure" : un rectangle. La zone est remplie, la figure ne l'est
  // pas — elle doit laisser voir les bougies qu'elle encadre.
  const gx = Math.min(x1, x2);
  const gy = Math.min(y1, y2);
  const lw = Math.max(Math.abs(x2 - x1), trait * 3);
  const lh = Math.max(Math.abs(y2 - y1), trait * 3);
  const dessus = gy > police * 2.2;

  return (
    <>
      <rect
        x={gx}
        y={gy}
        width={lw}
        height={lh}
        fill={t.type === "zone" ? ton : "none"}
        fillOpacity={t.type === "zone" ? 0.14 : 0}
        stroke={ton}
        strokeWidth={trait}
        rx={trait}
      />
      <Etiquette
        x={gx}
        y={dessus ? gy - police * 0.5 : gy + lh + police * 1.4}
        texte={t.label}
        ton={ton}
        police={police}
        ancrage="gauche"
      />
    </>
  );
}

/**
 * Une étiquette lisible sur n'importe quel fond — un graphique peut être blanc,
 * noir ou bleu nuit. La seule solution robuste est une pastille pleine.
 */
function Etiquette({
  x,
  y,
  texte,
  ton,
  police,
  ancrage,
}: {
  x: number;
  y: number;
  texte: string;
  ton: string;
  police: number;
  ancrage: "gauche" | "centre";
}) {
  // Estimation de largeur : suffisante pour une pastille, et sans mesure DOM.
  const larg = texte.length * police * 0.58 + police * 0.9;
  const haut = police * 1.6;
  const gx = ancrage === "centre" ? x - larg / 2 : x;
  const gy = y - haut / 2;

  return (
    <g>
      <rect x={gx} y={gy} width={larg} height={haut} rx={haut / 2} fill={ton} opacity={0.94} />
      <text
        x={gx + larg / 2}
        y={gy + haut / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize={police}
        fontWeight={700}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {texte}
      </text>
    </g>
  );
}

// -------------------------------------------------------------- résultat ----

function Resultat({ analyse: a, avis }: { analyse: Analyse; avis: Verdict | null }) {
  const v = VERDICTS[a.verdict];
  const accord = avis !== null ? avis === a.verdict : null;

  return (
    <>
      <div
        style={{
          background: v.fond,
          border: `1px solid ${v.ton}`,
          borderRadius: 14,
          padding: "20px 22px",
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
          <div style={{ flex: 1, minWidth: 180 }}>
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

        <p style={{ fontSize: 16, lineHeight: 1.65, color: color.textBody, margin: "15px 0 0" }}>
          {a.resume}
        </p>

        {a.points.length > 0 && (
          <ul style={{ margin: "12px 0 0", paddingLeft: 19 }}>
            {a.points.map((p, i) => (
              <li
                key={i}
                style={{ fontSize: 15, lineHeight: 1.6, color: color.textBody, marginBottom: 5 }}
              >
                {p}
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <Puce texte={TENDANCES[a.tendance]} />
          {a.instrument && <Puce texte={a.instrument} />}
          {a.unite_temps && <Puce texte={a.unite_temps} />}
        </div>
      </div>

      <Plan analyse={a} />

      {/* Les deux lignes qui empêchent de prendre ça pour une certitude. */}
      <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
        <Ligne titre="Invalidé si" texte={a.invalidation} ton={color.danger} />
        <Ligne titre="L'argument d'en face" texte={a.contre} ton={color.textMuted} />
      </div>

      {accord !== null && (
        <div
          style={{
            marginTop: 10,
            border: `1px solid ${accord ? color.success : color.warning}`,
            borderLeftWidth: 4,
            background: accord ? "#eaf7ee" : "#fffaf0",
            borderRadius: 11,
            padding: "13px 17px",
          }}
        >
          <strong style={{ fontSize: 14.5, color: color.textDark }}>
            {accord ? "Même lecture que toi" : `Tu avais dit ${VERDICTS[avis!].label}`}
          </strong>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: color.textBody, margin: "5px 0 0" }}>
            {accord
              ? "Regarde quand même « Invalidé si » : être d'accord sur le sens ne dit rien sur l'endroit où l'on se trompe."
              : "Ne change pas d'avis parce qu'une machine te contredit. Regarde les tracés sur le graphique et vois laquelle des deux lectures s'appuie sur ce qui est réellement à l'écran."}
          </p>
        </div>
      )}
    </>
  );
}

/**
 * Le plan, décliné par instrument.
 *
 * L'expiration binaire est mise en avant parce que c'est la question numéro un
 * de l'élève : sur Pocket Option, choisir 1 minute au lieu de 5 sur la même
 * lecture change complètement le résultat. On affiche donc la valeur exacte à
 * sélectionner — pas une fourchette qu'il faudrait encore interpréter.
 *
 * Et on ne promet rien : une durée cohérente avec la lecture n'est pas une
 * durée gagnante. Le mot « gain » n'apparaît nulle part ici, volontairement.
 */
function Plan({ analyse: a }: { analyse: Analyse }) {
  const rien = !a.binaire_duree && !a.option_classique && !a.comptant && !a.binaire_pourquoi;
  if (rien) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <h2 style={{ fontSize: 17, color: color.textDark, margin: "0 0 9px", fontWeight: 800 }}>
        Comment ça se joue
      </h2>

      {/* Options binaires — Pocket Option et équivalents */}
      <div
        style={{
          background: gradient.navy,
          borderRadius: 12,
          padding: "16px 19px",
          color: color.white,
        }}
      >
        <div style={{ fontSize: 12, color: "#c8daf0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Option binaire · Pocket Option
        </div>
        {a.binaire_duree ? (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 11, flexWrap: "wrap", marginTop: 7 }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: color.goldLight, lineHeight: 1.1 }}>
                {a.binaire_duree}
              </span>
              <span style={{ fontSize: 13.5, color: "#c8daf0" }}>
                expiration à sélectionner
                {typeof a.binaire_bougies === "number" && a.binaire_bougies > 0
                  ? ` — ${a.binaire_bougies} bougie${a.binaire_bougies > 1 ? "s" : ""}`
                  : ""}
              </span>
            </div>
            {a.binaire_pourquoi && (
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#dbe7f7", margin: "9px 0 0" }}>
                {a.binaire_pourquoi}
              </p>
            )}
          </>
        ) : (
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#dbe7f7", margin: "7px 0 0" }}>
            {a.binaire_pourquoi || "Aucune durée proposée sur cette configuration."}
          </p>
        )}
      </div>

      {(a.option_classique || a.comptant) && (
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {a.option_classique && (
            <Ligne titre="Option sur action / indice" texte={a.option_classique} ton={color.info} />
          )}
          {a.comptant && <Ligne titre="Au comptant" texte={a.comptant} ton={color.cyan} />}
        </div>
      )}
    </div>
  );
}

function Ligne({ titre, texte, ton }: { titre: string; texte: string; ton: string }) {
  return (
    <div
      style={{
        background: color.white,
        border: `1px solid ${color.border}`,
        borderLeft: `4px solid ${ton}`,
        borderRadius: 10,
        padding: "12px 16px",
      }}
    >
      <strong style={{ fontSize: 13, color: ton, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {titre}
      </strong>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: color.textBody, margin: "4px 0 0" }}>
        {texte}
      </p>
    </div>
  );
}

function Puce({ texte, fort }: { texte: string; fort?: boolean }) {
  return (
    <span
      style={{
        fontSize: 12.5,
        fontWeight: 700,
        padding: "5px 11px",
        borderRadius: 99,
        background: fort ? color.navy : "rgba(255,255,255,.7)",
        border: `1px solid ${fort ? color.navy : color.border}`,
        color: fort ? color.white : color.textMuted,
      }}
    >
      {texte}
    </span>
  );
}

// ------------------------------------------------------------- assistant ----

/**
 * Les questions que l'analyse ne couvre pas : « je prends quelle expiration ? »,
 * « j'entre maintenant ou j'attends la clôture ? », « l'OTC du samedi, c'est le
 * même marché ? ». Ce sont majoritairement des questions d'options binaires —
 * c'est ce que pratiquent les élèves.
 *
 * Le graphique et le verdict déjà rendu partent avec la question, pour que
 * l'assistant argumente à partir de la même lecture au lieu d'en produire une
 * seconde qui contredirait la première.
 */
function Assistant({
  image,
  analyse,
  aGraphique,
}: {
  image: string | null;
  analyse: Analyse | null;
  aGraphique: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [enCours, setEnCours] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length) finRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const envoyer = useCallback(
    async (texte: string) => {
      const q = texte.trim();
      if (!q || enCours) return;

      const historique = messages;
      setMessages([...historique, { role: "user", contenu: q }, { role: "assistant", contenu: "" }]);
      setQuestion("");
      setEnCours(true);

      const remplacerDerniere = (contenu: string) =>
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", contenu };
          return c;
        });

      try {
        const res = await fetch("/api/trading/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            image: image ?? undefined,
            mediaType: image ? "image/jpeg" : undefined,
            analyse: analyse ?? undefined,
            historique,
          }),
        });

        if (!res.ok || !res.body) {
          const d = await res.json().catch(() => null);
          throw new Error(d?.error || "L'assistant n'a pas répondu.");
        }

        const lecteur = res.body.getReader();
        const decodeur = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await lecteur.read();
          if (done) break;
          acc += decodeur.decode(value, { stream: true });
          remplacerDerniere(acc);
        }
        if (!acc.trim()) remplacerDerniere("Aucune réponse reçue. Repose ta question.");
      } catch (e) {
        remplacerDerniere(e instanceof Error ? e.message : "L'assistant n'a pas répondu.");
      } finally {
        setEnCours(false);
      }
    },
    [analyse, enCours, image, messages],
  );

  const suggestions = aGraphique ? SUGGESTIONS_CHART : SUGGESTIONS_LIBRE;

  return (
    <div
      style={{
        marginTop: 30,
        border: `1px solid ${color.border}`,
        borderRadius: 14,
        background: color.white,
        overflow: "hidden",
      }}
    >
      <div style={{ background: gradient.navy, padding: "16px 20px" }}>
        <h2 style={{ margin: 0, fontSize: 17.5, color: color.white, fontWeight: 800 }}>
          Pose ta question
        </h2>
        <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "#c8daf0", lineHeight: 1.55 }}>
          {aGraphique
            ? "Ton graphique est joint à la conversation. Expiration, moment d'entrée, niveau douteux — demande."
            : "N'importe quelle question de trading. Options binaires, expiration, payout, mise, OTC, structure."}
        </p>
      </div>

      <div style={{ padding: "16px 18px" }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => void envoyer(s)}
                disabled={enCours}
                style={{
                  padding: "8px 13px",
                  borderRadius: 99,
                  border: `1px solid ${color.borderBlue}`,
                  background: color.bgLight,
                  color: color.textMid,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: enCours ? "default" : "pointer",
                  textAlign: "left",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <div
                style={{
                  maxWidth: "85%",
                  background: color.navy,
                  color: color.white,
                  borderRadius: "12px 12px 3px 12px",
                  padding: "10px 15px",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                }}
              >
                {m.contenu}
              </div>
            </div>
          ) : (
            <div key={i} style={{ marginBottom: 16 }}>
              {m.contenu ? (
                <Reponse texte={m.contenu} />
              ) : (
                <span style={{ fontSize: 14, color: color.textFaint }}>L&apos;assistant réfléchit…</span>
              )}
            </div>
          ),
        )}
        <div ref={finRef} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void envoyer(question);
          }}
          style={{ display: "flex", gap: 9, marginTop: 4 }}
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={1200}
            placeholder={
              aGraphique ? "Ex. : je prends quelle expiration ?" : "Ex. : je mise combien par trade ?"
            }
            style={{ ...champ, flex: 1 }}
          />
          <button
            type="submit"
            disabled={enCours || !question.trim()}
            style={{
              padding: "11px 20px",
              borderRadius: 10,
              border: "none",
              background: enCours || !question.trim() ? color.grayLight : color.navy,
              color: enCours || !question.trim() ? color.textFaint : color.white,
              fontWeight: 800,
              fontSize: 14.5,
              cursor: enCours || !question.trim() ? "default" : "pointer",
              flexShrink: 0,
            }}
          >
            {enCours ? "…" : "Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Rendu léger de la réponse : paragraphes, listes à puces, `**gras**`. Le texte
 * vient du modèle et non d'une saisie utilisateur, mais on l'échappe quand même
 * avant d'injecter du HTML — la règle ne souffre pas d'exception.
 */
function Reponse({ texte }: { texte: string }) {
  const lignes = texte.split("\n").filter((l) => l.trim());
  return (
    <div>
      {lignes.map((l, i) => {
        const puce = /^\s*([-—•*]|\d+\.)\s+/.test(l);
        return (
          <p
            key={i}
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: color.textBody,
              margin: puce ? "0 0 6px" : "0 0 11px",
              paddingLeft: puce ? 16 : 0,
              textIndent: puce ? -10 : 0,
            }}
            dangerouslySetInnerHTML={{ __html: gras(l) }}
          />
        );
      })}
    </div>
  );
}

function gras(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

// ------------------------------------------------------------ styles ---------

const champ: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: `1px solid ${color.border}`,
  fontSize: 14.5,
  color: color.textBody,
  background: color.white,
  boxSizing: "border-box",
};

const boutonSecondaire: React.CSSProperties = {
  border: `1px solid ${color.border}`,
  background: color.white,
  borderRadius: 8,
  padding: "7px 14px",
  fontSize: 13,
  fontWeight: 700,
  color: color.textMuted,
  cursor: "pointer",
};

const lienBouton: React.CSSProperties = {
  marginTop: 12,
  background: "none",
  border: "none",
  padding: 0,
  fontSize: 13,
  color: color.textMuted,
  textDecoration: "underline",
  cursor: "pointer",
};
