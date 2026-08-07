/**
 * LA PORTE D'ENTRÉE.
 *
 * Tout ce qui vient de TradingView passe ici, et rien ne passe autrement.
 * Ce fichier a une seule mission : transformer une charge utile venue
 * d'Internet — donc potentiellement vide, tronquée ou forgée — en un
 * `AlerteValide` sur lequel le reste du module peut travailler les yeux
 * fermés.
 *
 * Trois principes, appris à la dure sur les webhooks :
 *
 * 1. **Comparaison du secret à temps constant.** Un `===` sur une chaîne
 *    s'arrête au premier caractère différent. La différence de durée est
 *    minuscule, mais elle est mesurable à distance et elle suffit à
 *    reconstituer un secret caractère par caractère. `timingSafeEqual` ne
 *    coûte rien et ferme la porte.
 *
 * 2. **On ne fait jamais confiance à un nombre reçu en texte.** TradingView
 *    interpole les valeurs Pine dans le message d'alerte : selon le format,
 *    un prix arrive en `2043.55` ou en `"2043.55"`, et parfois en `"2 043,55"`
 *    si la locale s'en mêle. `nombre()` traite les trois et refuse le reste.
 *
 * 3. **Un stop du mauvais côté du prix invalide l'alerte.** C'est le contrôle
 *    le plus important du fichier. Un script Pine mal recopié peut inverser
 *    stop et objectif ; le signal resterait cohérent en apparence, avec un
 *    risque/rendement magnifique, et ferait perdre l'intégralité du capital
 *    engagé. On refuse plutôt que de publier.
 */

import { timingSafeEqual } from "crypto";
import {
  AlerteTradingView,
  AlerteValide,
  Session,
  Sens,
  Tendance,
  Unite,
  UNITES,
} from "./types";

// ------------------------------------------------------------- le secret ---

/**
 * Compare le secret reçu à celui attendu, sans fuite temporelle.
 *
 * Renvoie false si le secret n'est pas configuré : un webhook ouvert à tous
 * est pire que pas de webhook du tout, puisqu'il permet à n'importe qui de
 * publier un signal signé du nom de la plateforme.
 */
export function secretValide(recu: string | undefined | null): boolean {
  const attendu = process.env.TRADINGVIEW_WEBHOOK_SECRET;
  if (!attendu || !recu) return false;

  const a = Buffer.from(recu);
  const b = Buffer.from(attendu);
  // timingSafeEqual exige des longueurs égales : on répond avant, mais la
  // longueur d'un secret n'est pas une information exploitable.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// -------------------------------------------------------- les conversions --

/** Convertit ce qui peut l'être en nombre fini, et rien d'autre. */
export function nombre(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;

  // Espaces de milliers (y compris l'insécable) et virgule décimale.
  const propre = v.replace(/[\s ]/g, "").replace(",", ".");
  if (!/^-?\d*\.?\d+$/.test(propre)) return null;

  const n = Number(propre);
  return Number.isFinite(n) ? n : null;
}

function texte(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 && t.length <= 2000 ? t : null;
}

// --------------------------------------------------------- les séances -----

/**
 * La séance en cours, d'après l'heure UTC.
 *
 * Les horaires sont ceux des places, pas ceux d'un fuseau utilisateur :
 * Tokyo 00h-09h, Londres 07h-16h, New York 12h-21h UTC. Le chevauchement
 * Londres/New York (12h-16h UTC) est traité en premier parce qu'il ne se
 * comporte comme aucune des deux : c'est le seul moment où les volumes
 * s'additionnent, et sur l'or c'est là que les mouvements aboutissent.
 *
 * Le week-end renvoie « hors-session » sans discussion. Une alerte reçue
 * samedi vient forcément d'un rejeu ou d'un test, jamais d'un marché ouvert.
 */
export function sessionDe(date: Date): Session {
  const jour = date.getUTCDay();
  if (jour === 0 || jour === 6) return "hors-session";

  const h = date.getUTCHours();

  if (h >= 12 && h < 16) return "chevauchement";
  if (h >= 7 && h < 16) return "londres";
  if (h >= 16 && h < 21) return "new-york";
  if (h >= 0 && h < 9) return "asie";
  return "hors-session";
}

function sessionDeclaree(v: unknown, secours: Session): Session {
  const t = (texte(v) ?? "").toLowerCase().replace(/[_\s]/g, "-");
  const connues: Session[] = ["asie", "londres", "new-york", "chevauchement", "hors-session"];
  // On accepte quelques alias parce que le script Pine peut être écrit en
  // anglais par un contributeur : mieux vaut les traduire que refuser.
  const alias: Record<string, Session> = {
    asia: "asie",
    tokyo: "asie",
    london: "londres",
    "new-york": "new-york",
    newyork: "new-york",
    ny: "new-york",
    overlap: "chevauchement",
    closed: "hors-session",
  };
  const s = alias[t] ?? (connues.includes(t as Session) ? (t as Session) : null);
  return s ?? secours;
}

// -------------------------------------------------------- la validation ----

export class AlerteInvalide extends Error {
  constructor(
    message: string,
    /** Le statut à écrire dans tc_alertes — sert au diagnostic a posteriori. */
    readonly statut: "rejetee_format" | "rejetee_marche" = "rejetee_format",
  ) {
    super(message);
    this.name = "AlerteInvalide";
  }
}

/**
 * Valide une alerte brute et en tire un plan de trade complet.
 *
 * `marchesActifs` est la liste des codes autorisés : une alerte pour un
 * marché éteint est refusée ici et pas plus loin, ce qui évite qu'un ancien
 * script Pine oublié sur un graphique continue de publier des signaux sur un
 * marché qu'on a volontairement retiré de l'offre.
 */
export function valider(brut: AlerteTradingView, marchesActifs: string[]): AlerteValide {
  // --- marché ---
  const marche = (texte(brut.marche) ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!marche) throw new AlerteInvalide("Champ « marche » absent.");
  if (!marchesActifs.includes(marche)) {
    throw new AlerteInvalide(`Marché « ${marche} » inconnu ou désactivé.`, "rejetee_marche");
  }

  // --- sens ---
  const sensBrut = (texte(brut.sens) ?? "").toUpperCase();
  const sens: Sens | null =
    sensBrut === "BUY" || sensBrut === "LONG" || sensBrut === "ACHAT"
      ? "BUY"
      : sensBrut === "SELL" || sensBrut === "SHORT" || sensBrut === "VENTE"
        ? "SELL"
        : null;
  if (!sens) throw new AlerteInvalide("Champ « sens » attendu : BUY ou SELL.");

  // --- prix ---
  const prix = nombre(brut.prix);
  if (prix === null || prix <= 0) throw new AlerteInvalide("Champ « prix » absent ou aberrant.");

  // --- unité d'entrée ---
  const uniteBrute = (texte(brut.unite) ?? "").toUpperCase();
  const unite = (UNITES as readonly string[]).includes(uniteBrute) ? (uniteBrute as Unite) : null;
  if (!unite) throw new AlerteInvalide(`Unité « ${uniteBrute} » inconnue.`);

  // --- plan : c'est ici que tout se joue ---
  const p = brut.plan ?? {};
  const entree = nombre(p.entree) ?? prix;
  const stop = nombre(p.stop);
  const tp1 = nombre(p.tp1);
  if (stop === null) throw new AlerteInvalide("Un signal sans stop n'est pas publiable.");
  if (tp1 === null) throw new AlerteInvalide("Un signal sans premier objectif n'est pas publiable.");

  const tp2 = nombre(p.tp2);
  const tp3 = nombre(p.tp3);

  // Le contrôle de cohérence directionnelle. À l'achat, le stop est SOUS
  // l'entrée et les objectifs sont AU-DESSUS ; à la vente, l'inverse. Une
  // inversion passerait tous les autres contrôles en affichant un
  // risque/rendement flatteur — et ferait perdre le capital entier.
  const achat = sens === "BUY";
  if (achat && stop >= entree) throw new AlerteInvalide("Achat : le stop doit être sous l'entrée.");
  if (!achat && stop <= entree) throw new AlerteInvalide("Vente : le stop doit être au-dessus de l'entrée.");
  if (achat && tp1 <= entree) throw new AlerteInvalide("Achat : TP1 doit être au-dessus de l'entrée.");
  if (!achat && tp1 >= entree) throw new AlerteInvalide("Vente : TP1 doit être sous l'entrée.");

  // Les objectifs doivent s'éloigner dans l'ordre. Un TP2 plus proche que
  // TP1 est le symptôme d'un script Pine où deux variables ont été inversées.
  const ordonne = (a: number, b: number) => (achat ? b > a : b < a);
  if (tp2 !== null && !ordonne(tp1, tp2)) throw new AlerteInvalide("TP2 n'est pas au-delà de TP1.");
  if (tp3 !== null && tp2 !== null && !ordonne(tp2, tp3)) {
    throw new AlerteInvalide("TP3 n'est pas au-delà de TP2.");
  }

  const risque = Math.abs(entree - stop);
  if (risque <= 0) throw new AlerteInvalide("Distance au stop nulle.");

  // Le risque/rendement se calcule sur TP2 quand il existe : c'est l'objectif
  // que vise réellement un trader qui sécurise une partie à TP1. Le calculer
  // sur TP3 flatterait un ratio qui n'est presque jamais atteint.
  const objectifRR = tp2 ?? tp1;
  const rr = Math.abs(objectifRR - entree) / risque;

  // --- zone d'entrée ---
  // Sans zone fournie, on en fabrique une autour de l'entrée : un quart du
  // risque de part et d'autre. Un prix unique est intenable en pratique — le
  // temps de passer l'ordre, le marché a bougé.
  const zb = nombre(p.zone_bas);
  const zh = nombre(p.zone_haut);
  const marge = risque * 0.25;
  const zone_bas = zb !== null && zh !== null ? Math.min(zb, zh) : entree - marge;
  const zone_haut = zb !== null && zh !== null ? Math.max(zb, zh) : entree + marge;

  // --- tendance ---
  const tBrut = (texte(brut.tendance) ?? "").toLowerCase();
  const tendance: Tendance =
    tBrut.startsWith("hauss") || tBrut === "bullish" || tBrut === "up"
      ? "haussiere"
      : tBrut.startsWith("baiss") || tBrut === "bearish" || tBrut === "down"
        ? "baissiere"
        : "range";

  // --- séance ---
  // L'heure du script Pine si elle est lisible, l'heure de réception sinon.
  // Un écart de quelques secondes est sans conséquence ; une alerte rejouée
  // trois heures plus tard serait en revanche datée de sa réception, ce qui
  // est le comportement voulu — on juge le marché de maintenant.
  const horodatage = brut.heure ? new Date(brut.heure) : new Date();
  const base = Number.isNaN(horodatage.getTime()) ? new Date() : horodatage;
  const session = sessionDeclaree(brut.session, sessionDe(base));

  // --- lectures par unité ---
  const unites: AlerteValide["unites"] = {};
  if (brut.unites && typeof brut.unites === "object") {
    for (const u of UNITES) {
      const l = brut.unites[u];
      if (l && typeof l === "object") unites[u] = l;
    }
  }

  // Une capture n'est acceptée que si c'est une URL https — TradingView ne
  // sert ses instantanés que là, et accepter autre chose reviendrait à
  // afficher une image choisie par l'appelant sur nos pages.
  const capture = texte(brut.capture_url);
  const capture_url = capture && /^https:\/\/[\w.-]+\//.test(capture) ? capture : null;

  return {
    marche,
    sens,
    prix,
    unite,
    session,
    tendance,
    bougie: texte(brut.bougie),
    score_tv: nombre(brut.score_tv),
    capture_url,
    note: texte(brut.note),
    unites,
    indicateurs: (brut.indicateurs ?? {}) as AlerteValide["indicateurs"],
    smc: (brut.smc ?? {}) as AlerteValide["smc"],
    niveaux: (brut.niveaux ?? {}) as AlerteValide["niveaux"],
    plan: { entree, zone_bas, zone_haut, stop, tp1, tp2, tp3 },
    rr,
    risque,
  };
}

/**
 * Lit le corps d'une requête webhook, en JSON ou en texte.
 *
 * TradingView envoie le message d'alerte tel quel, sans forcer
 * `Content-Type: application/json`. Se fier à l'en-tête ferait échouer une
 * alerte pourtant parfaitement formée — et l'échec serait silencieux côté
 * TradingView, qui n'affiche pas les réponses d'erreur.
 */
export async function lireCorps(req: Request): Promise<AlerteTradingView> {
  const brut = await req.text();
  if (!brut.trim()) throw new AlerteInvalide("Corps de requête vide.");

  try {
    const parse = JSON.parse(brut);
    if (parse && typeof parse === "object" && !Array.isArray(parse)) {
      return parse as AlerteTradingView;
    }
    throw new AlerteInvalide("Le corps JSON n'est pas un objet.");
  } catch (e) {
    if (e instanceof AlerteInvalide) throw e;
    throw new AlerteInvalide("Corps de requête illisible — JSON attendu.");
  }
}
