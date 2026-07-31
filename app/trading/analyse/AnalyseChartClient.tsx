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
import { minutesDeUnite } from "@/lib/trading/unites";
import { ajouterTrade, saveJournal, useJournal } from "@/lib/trading/journal";

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
  binaire?: Binaire;
  niveaux_action?: NiveauAction[];
  binaire_pourquoi?: string | null;
  option_classique?: string | null;
  comptant?: string | null;
  annotations: Trace[];
}

/** Une durée d'expiration, prête à être saisie dans le champ « Time ». */
interface Duree {
  temps: string;
  secondes: number;
  bougies: number;
  /** Le niveau que le prix irait toucher d'abord — seulement sur la durée couverte. */
  niveau?: number | null;
}

/** Un plan d'attente : « si le prix touche X, alors BUY/SELL ». */
interface NiveauAction {
  prix: number;
  nom: string;
  declencheur: "rejet" | "cassure";
  sens: Verdict;
  bouton: "BUY" | "SELL";
  objectif: number | null;
  pourquoi: string;
  invalide_si: string;
  distance_pourcent: number | null;
  temps: string | null;
  bougies: number | null;
}

/** La seconde entrée, si le prix part d'abord contre la lecture. */
interface Repli {
  type: "SELL LIMIT" | "BUY LIMIT";
  prix: number;
  abandon: number | null;
}

interface Binaire {
  bouton: "BUY" | "SELL" | null;
  temps: string | null;
  secondes: number | null;
  bougies: number | null;
  minutes_par_bougie: number | null;
  source: "calcul" | "estimation" | null;
  /** Si le prix part tout de suite dans le bon sens. */
  direct: Duree | null;
  /** S'il va d'abord toucher le niveau opposé le plus proche avant de partir. */
  couvert: Duree | null;
  repli: Repli | null;
}

/** Une capture envoyée par l'élève, et sa lecture. */
interface Feuille {
  id: number;
  apercu: string;
  base64: string;
  largeur: number;
  hauteur: number;
  analyse: Analyse | null;
  erreur: string | null;
}

/** La conclusion tirée de plusieurs unités de temps. */
interface Synthese {
  sens: Verdict;
  alignement: "total" | "majoritaire" | "conflit";
  confiance: number;
  accord_pourcent: number;
  instrument: string;
  lecture: string;
  a_surveiller: string;
  binaire: Binaire | null;
  niveaux_action: NiveauAction[];
  entree: { unite_temps?: string | null } | null;
  unites: {
    unite: string;
    minutes: number;
    sens: Verdict;
    confiance: number;
    accord: boolean;
    resume: string;
  }[];
}

interface Message {
  role: "user" | "assistant";
  contenu: string;
}

/** Au-delà, l'écran devient illisible et l'analyse coûte plus qu'elle n'apporte. */
const MAX_FEUILLES = 6;

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
  const [feuilles, setFeuilles] = useState<Feuille[]>([]);
  const [note, setNote] = useState("");
  const [avis, setAvis] = useState<Verdict | null>(null);
  const [avisIgnore, setAvisIgnore] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [etape, setEtape] = useState("");
  const [synthese, setSynthese] = useState<Synthese | null>(null);
  const [traces, setTraces] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [survol, setSurvol] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const compteur = useRef(0);

  const analyse = feuilles.some((f) => f.analyse);

  const ajouter = useCallback(async (fichiers: FileList | File[] | null | undefined) => {
    const liste = Array.from(fichiers ?? []).filter((f) => f.type.startsWith("image/"));
    if (!liste.length) return;

    setErreur(null);
    setSynthese(null);
    setAvis(null);
    setAvisIgnore(false);

    for (const file of liste.slice(0, MAX_FEUILLES)) {
      if (file.size > POIDS_MAX) {
        setErreur("Une image dépasse la taille limite. Une capture d'écran suffit.");
        continue;
      }
      try {
        const p = await preparer(file);
        setFeuilles((f) =>
          f.length >= MAX_FEUILLES
            ? f
            : [
                ...f.map((x) => ({ ...x, analyse: null })),
                { id: ++compteur.current, ...p, analyse: null, erreur: null },
              ],
        );
      } catch {
        setErreur("Impossible de lire une des images. Essaie un JPG ou un PNG.");
      }
    }
  }, []);

  // Coller une capture (Cmd/Ctrl+V) — c'est le geste naturel après un
  // screenshot de TradingView ou de Pocket Option, autant le supporter.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const cible = e.target as HTMLElement | null;
      // Ne pas voler le collage d'un champ de saisie.
      if (cible && (cible.tagName === "INPUT" || cible.tagName === "TEXTAREA")) return;
      const images = Array.from(e.clipboardData?.files ?? []).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (images.length) {
        e.preventDefault();
        void ajouter(images);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [ajouter]);

  function retirer(id: number) {
    setFeuilles((f) => f.filter((x) => x.id !== id).map((x) => ({ ...x, analyse: null })));
    setSynthese(null);
  }

  /**
   * Les graphiques partent tous en même temps : c'est l'intérêt d'avoir séparé
   * l'analyse d'une capture de la synthèse. Cinq unités de temps prennent le
   * temps de la plus lente, pas la somme des cinq.
   */
  const analyser = useCallback(async () => {
    if (!feuilles.length || chargement) return;
    setChargement(true);
    setErreur(null);
    setSynthese(null);
    setEtape(
      feuilles.length > 1
        ? `Lecture des ${feuilles.length} unités de temps…`
        : "Lecture des bougies…",
    );

    const resultats = await Promise.all(
      feuilles.map(async (f) => {
        try {
          const res = await fetch("/api/trading/analyse-chart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: f.base64, mediaType: "image/jpeg", note }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "L'analyse a échoué.");
          return { ...f, analyse: data.analyse as Analyse, erreur: null };
        } catch (e) {
          return {
            ...f,
            analyse: null,
            erreur: e instanceof Error ? e.message : "L'analyse a échoué.",
          };
        }
      }),
    );

    // De la plus courte unité à la plus longue : c'est l'ordre dans lequel on
    // lit un marché, et celui dans lequel l'élève doit voir ses graphiques.
    const triees = [...resultats].sort(
      (a, b) =>
        (minutesDeUnite(a.analyse?.unite_temps) ?? 1e9) -
        (minutesDeUnite(b.analyse?.unite_temps) ?? 1e9),
    );
    setFeuilles(triees);
    setTraces(true);

    const exploitables = triees
      .map((f) => f.analyse)
      .filter((a): a is Analyse => !!a && a.lisible)
      .filter((a) => minutesDeUnite(a.unite_temps) !== null);

    if (exploitables.length >= 2) {
      setEtape("Comparaison des unités de temps…");
      try {
        const res = await fetch("/api/trading/synthese", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analyses: exploitables }),
        });
        const data = await res.json();
        if (res.ok && data.synthese) setSynthese(data.synthese as Synthese);
        else if (data?.error) setErreur(data.error);
      } catch {
        setErreur("La comparaison des unités de temps a échoué, mais chaque graphique est analysé.");
      }
    } else if (triees.length >= 2) {
      setErreur(
        "Impossible de comparer : l'unité de temps n'a pas été lue sur au moins deux graphiques. Vérifie qu'elle est visible sur les captures.",
      );
    }

    setEtape("");
    setChargement(false);
  }, [chargement, feuilles, note]);

  function recommencer() {
    setFeuilles([]);
    setNote("");
    setAvis(null);
    setAvisIgnore(false);
    setSynthese(null);
    setErreur(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const peutAnalyser = feuilles.length > 0 && !chargement && !analyse;
  const multi = feuilles.length > 1;
  // L'unité d'entrée porte l'expiration : c'est son graphique qu'on joint aux
  // questions, pas les cinq.
  const feuilleEntree =
    feuilles.find((f) => f.analyse?.unite_temps === synthese?.entree?.unite_temps) ?? feuilles[0];

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
          maxWidth: 700,
        }}
      >
        Envoie <strong>plusieurs unités de temps du même actif</strong> — M1, M5, M15, H1. Chacune
        est lue séparément, puis confrontée aux autres&nbsp;: tu obtiens la tendance qui tient sur
        toutes les échelles, avec le sens et l&apos;expiration à saisir. Une seule capture marche
        aussi, mais un M1 haussier dans une H1 baissière n&apos;est pas un achat.
      </p>

      {/* Dépôt */}
      <Depot
        feuilles={feuilles}
        survol={survol}
        setSurvol={setSurvol}
        inputRef={inputRef}
        onFichiers={ajouter}
        onRetirer={retirer}
        verrouille={chargement || analyse}
      />

      {erreur && (
        <div
          style={{
            marginTop: 14,
            border: `1px solid ${color.warning}`,
            borderLeftWidth: 4,
            background: "#fffaf0",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 14.5,
            lineHeight: 1.6,
            color: color.textBody,
          }}
        >
          {erreur}
        </div>
      )}

      {/* Contexte + avis de l'élève, avant le verdict */}
      {feuilles.length > 0 && !analyse && (
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
              placeholder="Ex. : EURUSD sur Pocket Option, j'hésite sur l'expiration."
              style={champ}
            />
            <p style={{ fontSize: 12.5, color: color.textFaint, margin: "6px 0 0" }}>
              L&apos;analyse reste fondée sur les images. Ton contexte l&apos;informe, il ne la
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
                Lis les graphiques toi-même avant de voir le verdict. Un outil qui répond à ta
                place ne t&apos;apprend rien.
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
            {chargement
              ? etape || "Analyse en cours…"
              : multi
                ? `Analyser les ${feuilles.length} unités de temps`
                : "Analyser ce graphique"}
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
              Les graphiques partent en même temps — compte une vingtaine de secondes.
            </p>
          )}
        </>
      )}

      {/* La conclusion, en tête */}
      {synthese && <PanneauSynthese synthese={synthese} avis={avis} />}

      {/* Une seule capture : pas de synthèse à faire, le verdict tient lieu de conclusion. */}
      {!synthese && analyse && feuilles[0]?.analyse?.lisible && !multi && (
        <div style={{ marginTop: 20 }}>
          <Resultat analyse={feuilles[0].analyse!} avis={avis} />
        </div>
      )}

      {/* Le détail, graphique par graphique */}
      {analyse && (
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            <h2 style={{ fontSize: 17, color: color.textDark, margin: 0, fontWeight: 800 }}>
              {multi ? "Le détail, unité par unité" : "Le graphique annoté"}
            </h2>
            <button onClick={() => setTraces((t) => !t)} style={boutonSecondaire}>
              {traces ? "Masquer les tracés" : "Afficher les tracés"}
            </button>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {feuilles.map((f) => (
              <CarteFeuille
                key={f.id}
                feuille={f}
                traces={traces}
                sensRetenu={synthese?.sens ?? null}
                compact={multi}
              />
            ))}
          </div>

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
            Recommencer avec d&apos;autres graphiques
          </button>
        </div>
      )}

      {/* L'assistant — toujours disponible, avec ou sans graphique */}
      <Assistant
        image={feuilleEntree?.base64 ?? null}
        analyse={feuilleEntree?.analyse ?? null}
        aGraphique={feuilles.length > 0}
      />

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

// ----------------------------------------------------------------- dépôt ----

/**
 * Le dépôt accepte plusieurs captures d'un coup. C'est le geste réel : on
 * bascule son graphique de M1 à M5 à M15, on prend trois captures, on les
 * dépose ensemble.
 */
function Depot({
  feuilles,
  survol,
  setSurvol,
  inputRef,
  onFichiers,
  onRetirer,
  verrouille,
}: {
  feuilles: Feuille[];
  survol: boolean;
  setSurvol: (v: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFichiers: (f: FileList | File[] | null) => void;
  onRetirer: (id: number) => void;
  verrouille: boolean;
}) {
  const plein = feuilles.length >= MAX_FEUILLES;

  return (
    <>
      {feuilles.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {feuilles.map((f, i) => (
            <div
              key={f.id}
              style={{
                position: "relative",
                border: `1px solid ${color.border}`,
                borderRadius: 10,
                overflow: "hidden",
                background: color.white,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.apercu}
                alt={`Graphique ${i + 1}`}
                style={{ display: "block", width: "100%", height: 84, objectFit: "cover" }}
              />
              <div
                style={{
                  padding: "6px 9px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: color.textMuted,
                  borderTop: `1px solid ${color.border}`,
                }}
              >
                {f.analyse?.unite_temps || `Graphique ${i + 1}`}
              </div>
              {!verrouille && (
                <button
                  onClick={() => onRetirer(f.id)}
                  aria-label="Retirer ce graphique"
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    width: 24,
                    height: 24,
                    borderRadius: 99,
                    border: "none",
                    background: "rgba(6,13,26,.72)",
                    color: color.white,
                    fontSize: 14,
                    lineHeight: 1,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!verrouille && !plein && (
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
            onFichiers(e.dataTransfer.files);
          }}
          style={{
            border: `2px dashed ${survol ? color.gold : color.borderBlue}`,
            background: survol ? color.goldPale : color.white,
            borderRadius: 14,
            padding: feuilles.length ? "24px 20px" : "48px 24px",
            textAlign: "center",
            cursor: "pointer",
            transition: "background .15s, border-color .15s",
          }}
        >
          <div style={{ fontSize: feuilles.length ? 24 : 34, lineHeight: 1 }}>📈</div>
          <div
            style={{
              fontSize: feuilles.length ? 15 : 16.5,
              fontWeight: 800,
              color: color.textDark,
              marginTop: 10,
            }}
          >
            {feuilles.length ? "Ajouter une autre unité de temps" : "Dépose tes captures ici"}
          </div>
          <div style={{ fontSize: 14, color: color.textMuted, marginTop: 7, lineHeight: 1.6 }}>
            {feuilles.length
              ? `${feuilles.length} sur ${MAX_FEUILLES} — plus tu en donnes, plus la tendance retenue est fiable.`
              : "Plusieurs à la fois, ou une par une. Clic, glisser-déposer, ou Cmd/Ctrl + V."}
            <br />
            L&apos;unité de temps est lue sur l&apos;image&nbsp;: laisse-la visible sur la capture.
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFichiers(e.target.files)}
            style={{ display: "none" }}
          />
        </div>
      )}
    </>
  );
}

// -------------------------------------------------------------- synthèse ----

const ALIGNEMENTS: Record<Synthese["alignement"], { label: string; ton: string; texte: string }> = {
  total: {
    label: "Toutes les unités d'accord",
    ton: "#16a34a",
    texte: "Le signal le plus solide qu'on puisse lire : aucune échelle ne contredit les autres.",
  },
  majoritaire: {
    label: "Majorité d'accord",
    ton: "#d97706",
    texte: "Une échelle au moins ne suit pas. Le sens tient, le timing est moins net.",
  },
  conflit: {
    label: "Unités en conflit",
    ton: color.textMuted,
    texte:
      "Les échelles se contredisent. Ce n'est pas un signal faible, c'est une absence de signal.",
  },
};

/**
 * La conclusion multi-échelles.
 *
 * Le sens, l'alignement et la confiance sont CALCULÉS par le serveur, pas
 * rédigés par le modèle — on affiche donc le pourcentage d'accord, pour que
 * l'élève voie d'où sort le chiffre au lieu de le croire.
 */
function PanneauSynthese({ synthese: s, avis }: { synthese: Synthese; avis: Verdict | null }) {
  const b = s.binaire;
  const bouton = s.sens === "achat" ? "BUY" : s.sens === "vente" ? "SELL" : null;
  const tonBouton = bouton === "BUY" ? "#26a69a" : bouton === "SELL" ? "#ef5350" : color.textMuted;
  const al = ALIGNEMENTS[s.alignement];
  const accord = avis !== null ? avis === s.sens : null;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ background: gradient.navy, borderRadius: 14, padding: "20px 22px" }}>
        <div
          style={{
            fontSize: 12,
            color: "#8fa6c4",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Conclusion sur {s.unites.length} unités de temps
          {s.instrument ? ` · ${s.instrument}` : ""}
        </div>

        <div style={{ display: "flex", alignItems: "stretch", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 150px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12.5, color: "#8fa6c4", marginBottom: 5 }}>Sens</div>
            <div
              style={{
                flex: 1,
                background: tonBouton,
                borderRadius: 9,
                display: "grid",
                placeItems: "center",
                color: color.white,
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 1.5,
                minHeight: 62,
                padding: "0 14px",
              }}
            >
              {bouton === "BUY" ? "↗ BUY" : bouton === "SELL" ? "↘ SELL" : "ATTENDRE"}
            </div>
          </div>

          {b && (
            <ChampTime
              binaire={b}
              sousTitre={s.entree?.unite_temps ? `· entrée en ${s.entree.unite_temps}` : ""}
            />
          )}
        </div>

        {/* L'alignement : la vraie information d'une lecture multi-échelles. */}
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              flexWrap: "wrap",
              marginBottom: 7,
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                padding: "4px 10px",
                borderRadius: 99,
                background: al.ton,
                color: color.white,
              }}
            >
              {al.label}
            </span>
            <span style={{ fontSize: 12.5, color: "#8fa6c4" }}>
              {s.accord_pourcent}% du poids dans le même sens · confiance {s.confiance}%
            </span>
          </div>
          <div
            style={{
              height: 7,
              borderRadius: 99,
              background: "rgba(255,255,255,.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(0, Math.min(100, s.confiance))}%`,
                height: "100%",
                background: tonBouton,
              }}
            />
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "#8fa6c4", margin: "8px 0 0" }}>
            {al.texte} Les grandes unités de temps pèsent plus lourd que les petites&nbsp;: il faut
            plus de monde pour faire bouger une H1 qu&apos;une M1.
          </p>
        </div>

        {s.lecture && (
          <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "#dbe7f7", margin: "14px 0 0" }}>
            {s.lecture}
          </p>
        )}

        {b && <CalculDurees binaire={b} />}
      </div>

      {/* Le tableau des unités : où l'accord se fait, et où il casse. */}
      <div
        style={{
          marginTop: 10,
          border: `1px solid ${color.border}`,
          borderRadius: 12,
          background: color.white,
          overflow: "hidden",
        }}
      >
        {s.unites.map((u, i) => (
          <div
            key={u.unite + i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 11,
              padding: "11px 15px",
              borderTop: i ? `1px solid ${color.border}` : "none",
              background: u.accord ? "transparent" : "#fffaf0",
            }}
          >
            <span
              style={{
                flexShrink: 0,
                minWidth: 52,
                textAlign: "center",
                fontSize: 12.5,
                fontWeight: 800,
                padding: "4px 8px",
                borderRadius: 7,
                background: color.grayLight,
                color: color.textDark,
              }}
            >
              {u.unite}
            </span>
            <span
              style={{
                flexShrink: 0,
                fontSize: 12.5,
                fontWeight: 800,
                color: SENS_TON[u.sens],
                minWidth: 62,
              }}
            >
              {VERDICTS[u.sens].label}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.5, color: color.textMuted }}>
              {u.resume}
            </span>
            <span style={{ flexShrink: 0, fontSize: 12.5, color: color.textFaint }}>
              {u.confiance}%
            </span>
          </div>
        ))}
      </div>

      {s.binaire && (
        <NoterTrade
          binaire={s.binaire}
          instrument={s.instrument || null}
          unite={s.entree?.unite_temps ?? null}
          confiance={s.confiance}
          alignement={s.alignement}
        />
      )}

      <BlocNiveaux niveaux={s.niveaux_action ?? []} />

      {s.binaire?.repli && <BlocRepli repli={s.binaire.repli} />}

      {s.a_surveiller && (
        <div style={{ marginTop: 10 }}>
          <Ligne
            titre={s.alignement === "conflit" ? "Ce qu'il faut attendre" : "Ce qui casserait ça"}
            texte={s.a_surveiller}
            ton={s.alignement === "conflit" ? color.warning : color.danger}
          />
        </div>
      )}

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
              ? "Regarde quand même le tableau : être d'accord sur le sens ne dit rien sur l'échelle qui pourrait te faire sortir."
              : "Ne change pas d'avis parce qu'une machine te contredit. Regarde quelle unité de temps tu lisais, et si c'est celle qui décide de la direction."}
          </p>
        </div>
      )}
    </div>
  );
}

const SENS_TON: Record<Verdict, string> = {
  achat: color.success,
  vente: color.danger,
  attendre: color.textMuted,
};

// ----------------------------------------------------- un graphique donné ---

/**
 * Une capture et sa lecture. En mode multi, on montre l'essentiel — le
 * graphique annoté et ses puces — parce que la conclusion est déjà en haut.
 */
function CarteFeuille({
  feuille: f,
  traces,
  sensRetenu,
  compact,
}: {
  feuille: Feuille;
  traces: boolean;
  sensRetenu: Verdict | null;
  compact: boolean;
}) {
  const a = f.analyse;

  if (f.erreur) {
    return (
      <div
        style={{
          border: `1px solid ${color.border}`,
          borderLeft: `4px solid ${color.danger}`,
          borderRadius: 12,
          padding: "14px 17px",
          background: color.white,
          fontSize: 14.5,
          color: color.textBody,
        }}
      >
        {f.erreur}
      </div>
    );
  }

  if (a && !a.lisible) {
    return (
      <div
        style={{
          border: `1px solid ${color.warning}`,
          borderLeft: `4px solid ${color.warning}`,
          borderRadius: 12,
          padding: "14px 17px",
          background: "#fffaf0",
        }}
      >
        <strong style={{ fontSize: 15, color: color.textDark }}>Graphique non lisible</strong>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: color.textBody, margin: "6px 0 0" }}>
          {a.probleme || "Les bougies ne sont pas assez distinctes pour être analysées."}
        </p>
      </div>
    );
  }

  const divergent = compact && a && sensRetenu !== null && a.verdict !== sensRetenu;

  return (
    <div
      style={{
        border: `1px solid ${divergent ? color.warning : color.border}`,
        borderRadius: 12,
        overflow: "hidden",
        background: color.white,
      }}
    >
      {a && compact && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            padding: "10px 15px",
            borderBottom: `1px solid ${color.border}`,
            background: divergent ? "#fffaf0" : color.bgLight,
          }}
        >
          <strong style={{ fontSize: 14.5, color: color.textDark }}>
            {a.unite_temps || "Unité inconnue"}
          </strong>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: SENS_TON[a.verdict] }}>
            {VERDICTS[a.verdict].label}
          </span>
          <span style={{ fontSize: 12.5, color: color.textFaint }}>{a.confiance}%</span>
          {divergent && (
            <span style={{ fontSize: 12.5, color: color.warning, fontWeight: 700 }}>
              ne suit pas la conclusion
            </span>
          )}
        </div>
      )}

      <ChartAnnote
        src={f.apercu}
        dim={{ largeur: f.largeur, hauteur: f.hauteur }}
        traces={traces && a?.lisible ? a.annotations : []}
      />

      {a?.lisible && (
        <div style={{ padding: "13px 16px" }}>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: color.textBody, margin: 0 }}>
            {a.resume}
          </p>
          {a.points.length > 0 && (
            <ul style={{ margin: "9px 0 0", paddingLeft: 19 }}>
              {a.points.map((p, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: color.textMuted,
                    marginBottom: 4,
                  }}
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
          {compact && (
            <p style={{ fontSize: 13, lineHeight: 1.55, color: color.textFaint, margin: "9px 0 0" }}>
              Invalidé si&nbsp;: {a.invalidation}
            </p>
          )}
        </div>
      )}
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
  const accord = avis !== null ? avis === a.verdict : null;

  const b = a.binaire;
  const bouton = b?.bouton ?? null;
  const tonBouton = bouton === "BUY" ? "#26a69a" : bouton === "SELL" ? "#ef5350" : color.textMuted;

  return (
    <>
      {/* LA RÉPONSE, EN PREMIER.
          Le sens et la durée sont ce que l'élève est venu chercher : ils passent
          avant le raisonnement, pas après. Le fond sombre et les couleurs des
          boutons reprennent celles de la plateforme, pour qu'il n'ait rien à
          traduire entre cet écran et le sien. */}
      <div style={{ background: gradient.navy, borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 150px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12.5, color: "#8fa6c4", marginBottom: 5 }}>Sens</div>
            <div
              style={{
                flex: 1,
                background: tonBouton,
                borderRadius: 9,
                display: "grid",
                placeItems: "center",
                color: color.white,
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 1.5,
                minHeight: 62,
                padding: "0 14px",
              }}
            >
              {bouton === "BUY" ? "↗ BUY" : bouton === "SELL" ? "↘ SELL" : "ATTENDRE"}
            </div>
          </div>

          {b && <ChampTime binaire={b} />}
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12.5, color: "#8fa6c4", fontWeight: 700 }}>
            Confiance {a.confiance}%
          </div>
          <div
            style={{
              height: 7,
              borderRadius: 99,
              background: "rgba(255,255,255,.12)",
              marginTop: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(0, Math.min(100, a.confiance))}%`,
                height: "100%",
                background: tonBouton,
              }}
            />
          </div>
        </div>

        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#dbe7f7", margin: "14px 0 0" }}>
          {a.resume}
        </p>

        {/* D'où sort la durée : l'élève doit pouvoir refaire le calcul. */}
        {b?.source === "calcul" ? (
          <CalculDurees binaire={b} />
        ) : (
          a.binaire_pourquoi && (
            <p style={{ fontSize: 13, lineHeight: 1.55, color: "#8fa6c4", margin: "8px 0 0" }}>
              {a.binaire_pourquoi}
            </p>
          )
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <PuceSombre texte={TENDANCES[a.tendance]} />
          {a.instrument && <PuceSombre texte={a.instrument} />}
          {a.unite_temps && <PuceSombre texte={a.unite_temps} />}
        </div>
      </div>

      {/* Le raisonnement, ensuite : ce qui a été lu dans les bougies. */}
      {a.points.length > 0 && (
        <ul
          style={{
            margin: "12px 0 0",
            padding: "14px 18px 14px 34px",
            background: color.white,
            border: `1px solid ${color.border}`,
            borderRadius: 12,
          }}
        >
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

      {/* Les deux lignes qui empêchent de prendre ça pour une certitude. */}
      {a.binaire && (
        <NoterTrade
          binaire={a.binaire}
          instrument={a.instrument ?? null}
          unite={a.unite_temps ?? null}
          confiance={a.confiance}
          alignement={null}
        />
      )}

      <BlocNiveaux niveaux={a.niveaux_action ?? []} />

      {a.binaire?.repli && <BlocRepli repli={a.binaire.repli} />}

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

      <AutresMarches analyse={a} />
    </>
  );
}

/**
 * Les autres façons de jouer la même lecture.
 *
 * Secondaire, donc en bas et en petit : l'élève travaille en options à durée
 * fixe, le reste est là pour le jour où il passera sur un autre instrument.
 */
function AutresMarches({ analyse: a }: { analyse: Analyse }) {
  if (!a.option_classique && !a.comptant) return null;
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
      {a.option_classique && (
        <Ligne titre="Option sur action / indice" texte={a.option_classique} ton={color.info} />
      )}
      {a.comptant && <Ligne titre="Au comptant" texte={a.comptant} ton={color.cyan} />}
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

/**
 * Le champ « Time », avec ses deux scénarios.
 *
 * La durée mise en avant est celle qui **encaisse un repli** : en binaire, seul
 * compte de quel côté du prix d'entrée on se trouve à l'échéance, et une option
 * qui expire pendant le retour du prix vers la résistance perd alors même que
 * la lecture était juste. La durée directe reste affichée en dessous, pour
 * celui qui voit le mouvement partir tout de suite et préfère ne pas payer
 * l'attente.
 */
function ChampTime({ binaire: b, sousTitre }: { binaire: Binaire; sousTitre?: string }) {
  if (!b.temps) return null;
  const deuxScenarios = !!b.couvert && !!b.direct && b.couvert.secondes !== b.direct.secondes;

  return (
    <div style={{ flex: "1 1 200px" }}>
      <div style={{ fontSize: 12.5, color: "#8fa6c4", marginBottom: 5 }}>
        Time {sousTitre}
        {b.couvert ? " · repli couvert" : ""}
      </div>
      <div
        style={{
          background: "#0b1526",
          border: "1px solid #24344f",
          borderRadius: 9,
          padding: "13px 16px",
          fontSize: 31,
          fontWeight: 800,
          color: color.white,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          letterSpacing: 1,
          textAlign: "center",
          minHeight: 62,
          boxSizing: "border-box",
        }}
      >
        {b.temps}
      </div>
      {deuxScenarios && (
        <div style={{ fontSize: 12.5, color: "#8fa6c4", marginTop: 6, lineHeight: 1.5 }}>
          Sans repli&nbsp;:{" "}
          <strong style={{ color: "#c8daf0", fontFamily: "ui-monospace, Menlo, monospace" }}>
            {b.direct!.temps}
          </strong>
        </div>
      )}
    </div>
  );
}

/**
 * D'où sortent les durées. L'élève doit pouvoir refaire le calcul de tête —
 * sinon il croit un chiffre au lieu de le comprendre.
 */
function CalculDurees({ binaire: b }: { binaire: Binaire }) {
  if (b.source !== "calcul" || !b.minutes_par_bougie) return null;
  const m = b.minutes_par_bougie;
  const unite = (n: number) => `${n} bougie${n > 1 ? "s" : ""} de ${m} minute${m > 1 ? "s" : ""}`;

  return (
    <p style={{ fontSize: 13, lineHeight: 1.6, color: "#8fa6c4", margin: "8px 0 0" }}>
      {b.couvert ? (
        <>
          Le prix peut d&apos;abord remonter tester{" "}
          {b.couvert.niveau != null ? <strong>{b.couvert.niveau}</strong> : "le niveau opposé le plus proche"}{" "}
          avant de partir. La durée retenue couvre les deux trajets — l&apos;aller jusqu&apos;à ce
          niveau puis le retour jusqu&apos;à l&apos;objectif — soit {unite(b.couvert.bougies)}.
          {b.direct && b.direct.secondes !== b.couvert.secondes && (
            <> Sans ce repli, {unite(b.direct.bougies)} suffiraient.</>
          )}{" "}
          Arrondi à la durée sélectionnable au-dessus, chrono à lancer à la clôture de la bougie en
          cours.
        </>
      ) : (
        <>
          {b.bougies ? unite(b.bougies) : "Durée"} pour atteindre l&apos;objectif, arrondi à la
          durée sélectionnable au-dessus. Chrono à lancer à la clôture de la bougie en cours.
        </>
      )}
    </p>
  );
}

/**
 * « Noter ce trade ».
 *
 * Le seul moyen de savoir si tout ce qui précède sert à quelque chose. La
 * durée, le sens, l'unité de temps et l'alignement sont déjà connus : l'élève
 * n'a rien à ressaisir, il dira juste plus tard si c'est passé. Une friction de
 * plus ici, et personne ne tient de relevé.
 */
function NoterTrade({
  binaire,
  instrument,
  unite,
  confiance,
  alignement,
}: {
  binaire: Binaire;
  instrument: string | null;
  unite: string | null;
  confiance: number;
  alignement: Synthese["alignement"] | null;
}) {
  const journal = useJournal();
  const [note, setNote] = useState(false);

  if (!binaire.bouton || !binaire.temps) return null;

  function enregistrer() {
    if (!binaire.bouton) return;
    saveJournal(
      ajouterTrade(journal, {
        instrument,
        unite,
        bouton: binaire.bouton,
        secondes: binaire.secondes,
        temps: binaire.temps,
        confiance,
        alignement,
        scenario: binaire.couvert ? "couvert" : binaire.direct ? "direct" : null,
        payout: journal.payoutDefaut,
        mise: null,
      }),
    );
    setNote(true);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        marginTop: 10,
        background: color.white,
        border: `1px solid ${color.border}`,
        borderRadius: 11,
        padding: "12px 16px",
      }}
    >
      {note ? (
        <>
          <span style={{ fontSize: 14.5, color: color.success, fontWeight: 700 }}>
            ✓ Noté dans ton relevé
          </span>
          <span style={{ fontSize: 13.5, color: color.textMuted }}>
            Reviens dire si c&apos;est passé une fois l&apos;expiration écoulée.
          </span>
        </>
      ) : (
        <>
          <button
            onClick={enregistrer}
            style={{
              border: `1.5px solid ${color.navy}`,
              background: color.white,
              color: color.navy,
              borderRadius: 9,
              padding: "9px 17px",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Noter ce trade
          </button>
          <span style={{ fontSize: 13.5, lineHeight: 1.5, color: color.textMuted, flex: 1, minWidth: 180 }}>
            Tu diras plus tard si c&apos;est passé. Au bout d&apos;une trentaine de trades, tu
            sauras quelles durées marchent chez toi.
          </span>
        </>
      )}
      <Link
        href="/trading/journal"
        style={{ fontSize: 13.5, color: color.info, fontWeight: 700, textDecoration: "none" }}
      >
        Mon relevé →
      </Link>
    </div>
  );
}

/**
 * Les niveaux d'action — le plan le plus sûr de la page.
 *
 * Entrer maintenant, c'est entrer là où le prix se trouve, sans autre raison
 * que « ça a l'air de monter ». Attendre un niveau, c'est entrer là où le
 * marché a déjà réagi, avec une raison connue d'avance et une réponse déjà
 * décidée. Le second est plus lent et beaucoup plus solide — d'où sa place en
 * tête, avant l'entrée immédiate.
 *
 * Chaque niveau porte sa propre expiration, calculée depuis lui : un ordre
 * déclenché plus haut n'a pas la même distance à parcourir qu'une entrée prise
 * ici et maintenant.
 */
function BlocNiveaux({ niveaux }: { niveaux: NiveauAction[] }) {
  if (!niveaux.length) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <h2 style={{ fontSize: 17, color: color.textDark, margin: "0 0 4px", fontWeight: 800 }}>
        Si le prix touche…
      </h2>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: color.textMuted, margin: "0 0 10px" }}>
        Le plan le plus sûr&nbsp;: tu n&apos;entres pas maintenant, tu attends que le prix vienne à
        un endroit où il a déjà réagi — et tu sais déjà quoi faire quand il y arrive.
      </p>

      <div style={{ display: "grid", gap: 9 }}>
        {niveaux.map((n, i) => {
          const achat = n.sens === "achat";
          const ton = achat ? "#26a69a" : "#ef5350";
          return (
            <div
              key={`${n.prix}-${i}`}
              style={{
                background: color.white,
                border: `1px solid ${color.border}`,
                borderLeft: `4px solid ${ton}`,
                borderRadius: 11,
                padding: "14px 17px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
              >
                <span style={{ fontSize: 13.5, color: color.textMuted }}>
                  {n.declencheur === "rejet" ? "Si le prix touche et refuse" : "Si le prix clôture au-delà de"}
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: color.textDark,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {n.prix}
                </span>
                <span style={{ fontSize: 16, color: color.textFaint }}>→</span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 900,
                    letterSpacing: 1,
                    padding: "5px 13px",
                    borderRadius: 7,
                    background: ton,
                    color: color.white,
                  }}
                >
                  {achat ? "↗ BUY" : "↘ SELL"}
                </span>
                {n.temps && (
                  <span
                    style={{
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: color.textDark,
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      background: color.grayLight,
                      padding: "4px 10px",
                      borderRadius: 7,
                    }}
                  >
                    {n.temps}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 9,
                  flexWrap: "wrap",
                  fontSize: 12.5,
                  color: color.textFaint,
                  margin: "8px 0 0",
                }}
              >
                <span>{n.nom}</span>
                {n.distance_pourcent != null && <span>· à {n.distance_pourcent}% du prix actuel</span>}
                {n.declencheur === "cassure" && <span>· clôture exigée, une mèche ne suffit pas</span>}
              </div>

              {n.pourquoi && (
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: color.textBody, margin: "7px 0 0" }}>
                  {n.pourquoi}
                </p>
              )}
              {n.invalide_si && (
                <p style={{ fontSize: 13, lineHeight: 1.55, color: color.textMuted, margin: "5px 0 0" }}>
                  Annulé si&nbsp;: {n.invalide_si}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Le plan si le prix part contre la lecture.
 *
 * Ce n'est pas une machine à rattraper les pertes — aucune position ne rattrape
 * la précédente. C'est la même lecture reprise à un MEILLEUR prix, si le marché
 * offre le repli, et seulement tant que la thèse tient. D'où les deux chiffres :
 * là où l'ordre se pose, et le prix au-delà duquel il n'y a plus rien à
 * reprendre.
 */
function BlocRepli({ repli: r }: { repli: Repli }) {
  const vente = r.type === "SELL LIMIT";
  const ton = vente ? "#ef5350" : "#26a69a";

  return (
    <div
      style={{
        marginTop: 10,
        background: color.white,
        border: `1px solid ${color.border}`,
        borderLeft: `4px solid ${ton}`,
        borderRadius: 11,
        padding: "14px 17px",
      }}
    >
      <strong
        style={{ fontSize: 13, color: ton, textTransform: "uppercase", letterSpacing: 0.4 }}
      >
        Si le prix part contre toi
      </strong>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          flexWrap: "wrap",
          margin: "8px 0 0",
        }}
      >
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 800,
            letterSpacing: 0.6,
            padding: "5px 11px",
            borderRadius: 7,
            background: ton,
            color: color.white,
          }}
        >
          {r.type}
        </span>
        <span
          style={{
            fontSize: 21,
            fontWeight: 800,
            color: color.textDark,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {r.prix}
        </span>
      </div>

      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: color.textBody, margin: "9px 0 0" }}>
        Le prix y revient&nbsp;? C&apos;est la même lecture à un meilleur prix — pas un trade de
        rattrapage.
        {r.abandon != null && (
          <>
            {" "}
            <strong>
              Au-delà de {r.abandon}, tu ne reprends rien
            </strong>{" "}
            : la thèse est morte, et un ordre placé là-bas parie sur une lecture déjà démentie.
          </>
        )}
      </p>

      <p style={{ fontSize: 13, lineHeight: 1.55, color: color.textFaint, margin: "8px 0 0" }}>
        Même mise que la première fois. Augmenter après une perte est le mécanisme qui vide le
        plus de comptes — une série de six pertes arrive même avec un bon taux de réussite.
      </p>
    </div>
  );
}

/** Instrument, unité de temps, tendance — sur le panneau sombre. */
function PuceSombre({ texte }: { texte: string }) {
  return (
    <span
      style={{
        fontSize: 12.5,
        fontWeight: 700,
        padding: "5px 11px",
        borderRadius: 99,
        background: "rgba(255,255,255,.08)",
        border: "1px solid rgba(255,255,255,.16)",
        color: "#c8daf0",
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
