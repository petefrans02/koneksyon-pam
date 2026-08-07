/**
 * TRADING CENTER — LE CONTRAT.
 *
 * Un seul fichier décrit ce que TradingView envoie, ce que la plateforme en
 * fait, et ce qu'un utilisateur reçoit. Tout le reste du module s'y réfère.
 *
 * Le choix structurant est ici : **TradingView calcule, KONEKSYON PAM
 * décide.** Aucune EMA, aucun RSI, aucune zone n'est recalculée côté site —
 * ce serait refaire, moins bien, un travail déjà fait par un moteur qui voit
 * le carnet complet. Le site reçoit un instantané chiffré, le juge, et
 * n'accepte que ce qui franchit la barre.
 *
 * Conséquence directe sur les types : `AlerteTradingView` n'est pas un objet
 * de confiance. Il vient d'Internet, il peut être vide, tronqué, ou forgé.
 * Tous ses champs sont optionnels sauf le strict minimum, et `webhook.ts` est
 * seul responsable de le transformer en `AlerteValide`, qui elle est sûre.
 */

// ============================================================== marchés ====

export type CategorieMarche = "metal" | "indice" | "crypto" | "forex" | "action";

export interface Marche {
  code: string;
  paire: string;
  nom_fr: string;
  nom_en: string;
  categorie: CategorieMarche;
  symbole_tv: string;
  decimales: number;
  pip: number;
  actif: boolean;
  ordre: number;
}

// ============================================================== temporel ===

/** Les sept échelles analysées, de la plus lente à la plus rapide. */
export const UNITES = ["D", "4H", "1H", "30M", "15M", "5M", "1M"] as const;
export type Unite = (typeof UNITES)[number];

/** Minutes par unité — sert à pondérer les échelles et à estimer les durées. */
export const MINUTES_UNITE: Record<Unite, number> = {
  D: 1440,
  "4H": 240,
  "1H": 60,
  "30M": 30,
  "15M": 15,
  "5M": 5,
  "1M": 1,
};

export type Tendance = "haussiere" | "baissiere" | "range";

/**
 * Les séances, et le chevauchement.
 *
 * Le chevauchement Londres/New York est séparé parce qu'il ne se comporte
 * pas comme les deux autres : c'est le seul moment où le volume des deux
 * places s'additionne, et sur l'or c'est là que les mouvements aboutissent.
 * Le confondre avec « londres » ferait perdre le critère le plus prédictif
 * de la journée.
 */
export type Session = "asie" | "londres" | "new-york" | "chevauchement" | "hors-session";

export type Sens = "BUY" | "SELL";

// =================================================== ce que TradingView dit =

/** Lecture d'une seule échelle, telle que le script Pine la publie. */
export interface LectureUnite {
  tendance?: Tendance;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  rsi?: number;
  adx?: number;
  macd?: number;
  macd_signal?: number;
  /** Position du prix par rapport aux EMA : "au-dessus" | "en-dessous" | "melange". */
  ema_position?: string;
}

export interface IndicateursTV {
  ema20?: number;
  ema50?: number;
  ema200?: number;
  vwap?: number;
  atr?: number;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  macd_hist?: number;
  adx?: number;
  /** Volume relatif : 1 = volume normal, 2 = double de la moyenne. */
  rvol?: number;
}

/** Concepts Smart Money, tels que détectés par le script Pine. */
export interface SmartMoneyTV {
  /** Break of Structure : direction de la cassure, ou null. */
  bos?: "haussier" | "baissier" | null;
  /** Change of Character : le premier signe d'un retournement. */
  choch?: "haussier" | "baissier" | null;
  /** Balayage de liquidité : quel côté a été purgé juste avant. */
  sweep?: "haut" | "bas" | null;
  order_block_haut?: number;
  order_block_bas?: number;
  breaker_haut?: number;
  breaker_bas?: number;
  mitigation_haut?: number;
  mitigation_bas?: number;
  fvg_haut?: number;
  fvg_bas?: number;
}

export interface NiveauxTV {
  support?: number;
  resistance?: number;
  demande_bas?: number;
  demande_haut?: number;
  offre_bas?: number;
  offre_haut?: number;
}

export interface PlanTV {
  entree?: number;
  zone_bas?: number;
  zone_haut?: number;
  stop?: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
}

/**
 * La charge utile brute du webhook. RIEN ici n'est garanti.
 *
 * Les champs sont volontairement tous optionnels : un script Pine mal
 * configuré, une alerte à l'ancien format, ou une requête forgée doivent
 * traverser le typage sans planter et se faire refuser proprement dans
 * `webhook.ts`. Un type optimiste ferait planter la route, et une route
 * webhook qui renvoie 500 fait réessayer TradingView en boucle.
 */
export interface AlerteTradingView {
  secret?: string;
  marche?: string;
  sens?: string;
  prix?: number | string;
  unite?: string;
  heure?: string;
  session?: string;
  bougie?: string;
  tendance?: string;
  score_tv?: number | string;
  capture_url?: string;
  unites?: Partial<Record<Unite, LectureUnite>>;
  indicateurs?: IndicateursTV;
  smc?: SmartMoneyTV;
  niveaux?: NiveauxTV;
  plan?: PlanTV;
  /** Champ libre du script Pine — repris tel quel dans la raison d'entrée. */
  note?: string;
}

/**
 * L'alerte après validation. À partir d'ici, tout est sûr.
 *
 * La différence avec le type précédent n'est pas cosmétique : `prix`, `stop`
 * et `tp1` sont non-optionnels et numériques, ce qui rend impossible de
 * publier un signal sans stop. Un signal sans stop n'est pas un signal
 * incomplet, c'est un piège.
 */
export interface AlerteValide {
  marche: string;
  sens: Sens;
  prix: number;
  unite: Unite;
  session: Session;
  tendance: Tendance;
  bougie: string | null;
  score_tv: number | null;
  capture_url: string | null;
  note: string | null;
  unites: Partial<Record<Unite, LectureUnite>>;
  indicateurs: IndicateursTV;
  smc: SmartMoneyTV;
  niveaux: NiveauxTV;
  plan: {
    entree: number;
    zone_bas: number;
    zone_haut: number;
    stop: number;
    tp1: number;
    tp2: number | null;
    tp3: number | null;
  };
  /** Risque/rendement calculé sur TP2 si présent, sinon TP1. */
  rr: number;
  /** Distance au stop, en unités de prix. Sert à tout le dimensionnement. */
  risque: number;
}

// ================================================== la décision du système =

/** Un critère du score, nommé et chiffré. Le score est la somme, rien d'autre. */
export interface Critere {
  libelle: string;
  points: number;
  /** true = critère favorable, false = pénalité. */
  favorable: boolean;
}

export interface Score {
  /** 0 à 100. */
  valeur: number;
  criteres: Critere[];
  /** Défauts rédhibitoires : un seul suffit à refuser, quel que soit le score. */
  disqualifiants: string[];
}

/** Ce que l'IA renvoie après examen. Volontairement pauvre en champs libres. */
export interface VerdictIA {
  /** L'IA valide-t-elle le setup ? */
  valide: boolean;
  /** Ajustement de confiance, borné à ±15 points — l'IA arbitre, elle ne décide pas. */
  ajustement: number;
  /** Les risques détectés, parmi une liste fermée. */
  drapeaux: DrapeauIA[];
  /** L'explication destinée à l'utilisateur, en français, 2 à 4 phrases. */
  explication: string;
  /** La raison du refus, si refus. */
  refus: string | null;
  /** Le modèle qui a répondu — tracé pour pouvoir comparer deux versions. */
  modele: string;
}

/**
 * Liste FERMÉE des risques que l'IA peut lever.
 *
 * Fermée volontairement : une IA à qui on laisse inventer ses propres
 * catégories produit un vocabulaire qui dérive de semaine en semaine, et
 * plus aucune statistique n'est calculable dessus. Ici on peut compter
 * combien de setups ont été refusés pour « fausse cassure » sur trois mois.
 */
export const DRAPEAUX_IA = [
  "fausse_cassure",
  "faible_probabilite",
  "liquidite_faible",
  "risque_rendement_pauvre",
  "mauvais_timing",
  "structure_contradictoire",
  "sur_extension",
  "news_imminente",
  "zone_deja_mitigee",
  "volume_insuffisant",
] as const;
export type DrapeauIA = (typeof DRAPEAUX_IA)[number];

/** Traduction lisible d'un drapeau — sert à l'affichage et à l'admin. */
export const LIBELLE_DRAPEAU: Record<DrapeauIA, string> = {
  fausse_cassure: "Fausse cassure probable",
  faible_probabilite: "Probabilité insuffisante",
  liquidite_faible: "Liquidité trop faible",
  risque_rendement_pauvre: "Risque/rendement pauvre",
  mauvais_timing: "Mauvais moment de séance",
  structure_contradictoire: "Structure contradictoire entre échelles",
  sur_extension: "Prix sur-étendu, entrée tardive",
  news_imminente: "Publication économique imminente",
  zone_deja_mitigee: "Zone déjà consommée",
  volume_insuffisant: "Volume insuffisant",
};

// ======================================================== le signal publié =

export type StatutSignal = "actif" | "tp1" | "tp2" | "tp3" | "gagne" | "perdu" | "annule" | "expire";
export type Resultat = "gagne" | "perdu" | "neutre";

export interface Signal {
  id: string;
  numero: number;
  marche: string;
  sens: Sens;
  confiance: number;

  prix_actuel: number;
  zone_bas: number;
  zone_haut: number;
  entree: number;
  stop: number;
  tp1: number;
  tp2: number | null;
  tp3: number | null;
  rr: number;

  duree_texte: string | null;
  duree_minutes: number | null;
  tendance: Tendance;
  session: Session;
  unite: Unite;

  unites: Partial<Record<Unite, LectureUnite>> | null;
  indicateurs: IndicateursTV | null;
  raison: string;
  explication_ia: string | null;
  drapeaux_ia: DrapeauIA[] | null;
  capture_url: string | null;

  statut: StatutSignal;
  resultat: Resultat | null;
  prix_sortie: number | null;
  pips: number | null;
  r_realise: number | null;
  notes_suivi: string | null;

  publie_le: string;
  cloture_le: string | null;
}

/**
 * Un signal tel qu'il est SERVI à un utilisateur donné.
 *
 * Le plan gratuit reçoit le même objet, mais avec les niveaux masqués tant
 * que le délai n'est pas écoulé. Masquer côté serveur et non côté interface
 * est la seule façon honnête de le faire : un `display:none` se contourne
 * avec la touche F12, et le premier utilisateur à s'en apercevoir aurait
 * raison de ne plus jamais payer.
 */
export interface SignalServi extends Omit<Signal, "entree" | "stop" | "tp1" | "tp2" | "tp3" | "zone_bas" | "zone_haut"> {
  entree: number | null;
  stop: number | null;
  tp1: number | null;
  tp2: number | null;
  tp3: number | null;
  zone_bas: number | null;
  zone_haut: number | null;
  /** true quand le contenu est masqué en attendant la fin du délai gratuit. */
  verrouille: boolean;
  /** Minutes restantes avant déverrouillage, si verrouillé. */
  deverrouille_dans: number | null;
}

export type StatutAlerte =
  | "publiee"
  /** Signe de vie horaire du script Pine — ni un signal, ni un rejet. */
  | "pouls"
  | "rejetee_secret"
  | "rejetee_format"
  | "rejetee_marche"
  | "rejetee_doublon"
  | "rejetee_cadence"
  | "rejetee_score"
  | "rejetee_ia"
  | "rejetee_session"
  | "erreur";

// ============================================================ abonnements ==

export type Plan = "free" | "premium";

export interface Abonnement {
  user_id: string;
  email: string | null;
  plan: Plan;
  debut: string;
  fin: string | null;
  source: string;
  reference: string | null;
}

export interface ReglagesUtilisateur {
  user_id: string;
  marches: string[];
  canal_app: boolean;
  canal_email: boolean;
  canal_push: boolean;
  canal_telegram: boolean;
  telegram_chat_id: string | null;
  canal_sms: boolean;
  telephone: string | null;
  risque_pct: number;
  capital: number | null;
  langue: string;
  fuseau: string;
  theme: string;
}

// ============================================================== journal ====

export interface Statistiques {
  total: number;
  gagnes: number;
  perdus: number;
  neutres: number;
  en_cours: number;
  /** En pourcentage, sur les seuls trades clôturés gagnants ou perdants. */
  taux_reussite: number | null;
  rr_moyen: number | null;
  /** Somme des R gagnés moins les R perdus. La seule mesure comparable d'un mois à l'autre. */
  r_cumule: number;
  facteur_profit: number | null;
  duree_moyenne_min: number | null;
  drawdown_max: number;
  plus_gros_gain: number | null;
  plus_grosse_perte: number | null;
  confiance_moyenne: number | null;
}
