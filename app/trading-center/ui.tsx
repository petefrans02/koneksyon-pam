"use client";

/**
 * LE LANGAGE VISUEL DU TRADING CENTER.
 *
 * Le reste de KONEKSYON PAM est clair, chaleureux, doré sur fond crème. Le
 * Trading Center est sombre. Ce n'est pas une coquetterie : c'est la seule
 * partie de la plateforme qu'on regarde en séance, souvent tôt le matin,
 * souvent sur un téléphone à côté d'une plateforme de courtage elle-même
 * sombre. Un fond crème à 5 h du matin brûle les yeux et casse la
 * continuité avec l'outil d'à côté.
 *
 * L'or de la marque est conservé, et c'est ce qui rattache visuellement ce
 * module au reste du site. Le turquoise sert aux données neutres, le vert et
 * le rouge STRICTEMENT aux résultats — jamais à la décoration. Un vert
 * décoratif dans une interface de trading se lit comme un gain.
 *
 * ── Une règle typographique qui compte plus qu'il n'y paraît ──────────────
 *
 * Tous les prix sont en `font-variant-numeric: tabular-nums`. Sans ça, les
 * chiffres n'ont pas la même largeur, une colonne de prix tremble à chaque
 * rafraîchissement, et l'œil ne peut plus comparer deux niveaux d'un coup.
 * C'est le détail qui sépare une interface financière d'une page web.
 */

import { CSSProperties, ReactNode } from "react";

// ─────────────────────────────────────────────────────────── la palette ────

export const tc = {
  fond: "#050a14",
  fondHaut: "#070e1c",
  carte: "rgba(18,32,58,0.55)",
  carteHaute: "rgba(24,42,74,0.72)",
  bord: "rgba(120,170,235,0.14)",
  bordFort: "rgba(120,170,235,0.28)",

  or: "#f0c840",
  orSombre: "#c8960f",
  cyan: "#38bdf8",
  cyanClair: "#67e8f9",

  texte: "#f2f6fc",
  texteDoux: "#9db4d4",
  texteFaible: "#5d7f9f",

  achat: "#22c55e",
  achatSourd: "rgba(34,197,94,0.14)",
  vente: "#f43f5e",
  venteSourd: "rgba(244,63,94,0.14)",
  neutre: "#94a3b8",
} as const;

export const texteFaible = tc.texteFaible;

export const chiffres: CSSProperties = {
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum"',
};

/** Le verre : fond translucide, bordure fine, flou d'arrière-plan. */
export const verre = (fort = false): CSSProperties => ({
  background: fort ? tc.carteHaute : tc.carte,
  border: `1px solid ${fort ? tc.bordFort : tc.bord}`,
  borderRadius: 18,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
});

export const couleurSens = (sens: string): string => (sens === "BUY" ? tc.achat : tc.vente);

// ───────────────────────────────────────────────────────── composants ──────

export function Carte({
  children,
  fort,
  style,
}: {
  children: ReactNode;
  fort?: boolean;
  style?: CSSProperties;
}) {
  return <div style={{ ...verre(fort), padding: 20, ...style }}>{children}</div>;
}

export function Titre({ children, sur }: { children: ReactNode; sur?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {sur && (
        <p
          style={{
            margin: "0 0 5px",
            fontSize: 10.5,
            letterSpacing: 2.6,
            textTransform: "uppercase",
            color: tc.cyanClair,
            fontWeight: 700,
          }}
        >
          {sur}
        </p>
      )}
      <h2 style={{ margin: 0, fontSize: "clamp(19px,2.6vw,25px)", color: tc.texte, fontWeight: 800, letterSpacing: -0.4 }}>
        {children}
      </h2>
    </div>
  );
}

/** Une étiquette ronde — sens, statut, séance. */
export function Pastille({
  children,
  couleur,
  fond,
  petite,
}: {
  children: ReactNode;
  couleur: string;
  fond?: string;
  petite?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: fond ?? `${couleur}1f`,
        border: `1px solid ${couleur}44`,
        color: couleur,
        borderRadius: 999,
        padding: petite ? "3px 10px" : "5px 14px",
        fontSize: petite ? 10.5 : 12,
        fontWeight: 800,
        letterSpacing: 0.5,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/**
 * La jauge de confiance.
 *
 * Elle démarre visuellement à 50 % et non à 0 : aucun signal publié n'est en
 * dessous du seuil, donc une barre remplie à 91 % sur une échelle 0-100
 * ressemblerait à « presque plein » pour tous les signaux, et ne
 * distinguerait plus un 90 d'un 99. Sur une échelle 50-100, l'écart se voit.
 * L'échelle est indiquée, sans quoi ce serait un graphique tronqué — et un
 * graphique tronqué non signalé est un mensonge visuel.
 */
export function Jauge({ valeur, taille = "moyenne" }: { valeur: number; taille?: "petite" | "moyenne" | "grande" }) {
  const part = Math.max(0, Math.min(100, ((valeur - 50) / 50) * 100));
  const couleur = valeur >= 96 ? tc.or : valeur >= 93 ? tc.cyanClair : tc.cyan;
  const hauteur = taille === "grande" ? 9 : taille === "petite" ? 4 : 6;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
          Confiance
        </span>
        <span style={{ ...chiffres, fontSize: taille === "grande" ? 30 : 19, fontWeight: 800, color: couleur }}>
          {valeur}
          <span style={{ fontSize: taille === "grande" ? 15 : 11, opacity: 0.6 }}>%</span>
        </span>
      </div>
      <div style={{ height: hauteur, background: "rgba(255,255,255,0.07)", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${part}%`,
            background: `linear-gradient(90deg,${tc.cyan},${couleur})`,
            borderRadius: 999,
            boxShadow: `0 0 14px ${couleur}66`,
            transition: "width .7s cubic-bezier(.34,1.56,.64,1)",
          }}
        />
      </div>
      <p style={{ margin: "5px 0 0", fontSize: 9.5, color: texteFaible, letterSpacing: 0.4 }}>
        échelle 50 → 100
      </p>
    </div>
  );
}

/** Une ligne clé/valeur, alignée sur les chiffres. */
export function Ligne({
  cle,
  valeur,
  couleur,
  fort,
}: {
  cle: string;
  valeur: ReactNode;
  couleur?: string;
  fort?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 14,
        padding: "9px 0",
        borderBottom: `1px solid ${tc.bord}`,
      }}
    >
      <span style={{ fontSize: 12.5, color: tc.texteDoux, letterSpacing: 0.2 }}>{cle}</span>
      <span
        style={{
          ...chiffres,
          fontSize: fort ? 17 : 14,
          fontWeight: fort ? 800 : 600,
          color: couleur ?? tc.texte,
          textAlign: "right",
        }}
      >
        {valeur}
      </span>
    </div>
  );
}

/** Une tuile de statistique. */
export function Tuile({
  libelle,
  valeur,
  suffixe,
  couleur,
  note,
}: {
  libelle: string;
  valeur: ReactNode;
  suffixe?: string;
  couleur?: string;
  note?: string;
}) {
  return (
    <div style={{ ...verre(), padding: "15px 17px" }}>
      <p style={{ margin: "0 0 7px", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: tc.texteDoux, fontWeight: 700 }}>
        {libelle}
      </p>
      <p style={{ ...chiffres, margin: 0, fontSize: 25, fontWeight: 800, color: couleur ?? tc.texte, lineHeight: 1.1 }}>
        {valeur}
        {suffixe && <span style={{ fontSize: 13, opacity: 0.55, marginLeft: 2 }}>{suffixe}</span>}
      </p>
      {note && <p style={{ margin: "5px 0 0", fontSize: 10.5, color: texteFaible, lineHeight: 1.4 }}>{note}</p>}
    </div>
  );
}

export function Bouton({
  children,
  onClick,
  href,
  variante = "or",
  pleineLargeur,
  desactive,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variante?: "or" | "fantome" | "danger";
  pleineLargeur?: boolean;
  desactive?: boolean;
}) {
  const styles: Record<string, CSSProperties> = {
    or: {
      background: `linear-gradient(135deg,${tc.orSombre},${tc.or})`,
      color: "#0d1d3d",
      border: "none",
      boxShadow: "0 6px 22px rgba(200,150,15,.28)",
    },
    fantome: {
      background: "rgba(255,255,255,0.04)",
      color: tc.texte,
      border: `1px solid ${tc.bordFort}`,
    },
    danger: {
      background: "rgba(244,63,94,0.12)",
      color: tc.vente,
      border: `1px solid ${tc.vente}55`,
    },
  };

  const base: CSSProperties = {
    ...styles[variante],
    padding: "12px 26px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 800,
    cursor: desactive ? "not-allowed" : "pointer",
    opacity: desactive ? 0.45 : 1,
    textDecoration: "none",
    display: pleineLargeur ? "block" : "inline-block",
    width: pleineLargeur ? "100%" : undefined,
    textAlign: "center",
    transition: "transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s",
    fontFamily: "inherit",
  };

  if (href && !desactive) {
    return (
      <a href={href} style={base}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} disabled={desactive} style={base}>
      {children}
    </button>
  );
}

/**
 * L'état vide.
 *
 * Le composant le plus important de l'interface, et celui qu'on est tenté de
 * bâcler. Sur cette plateforme, l'absence de signal est le cas NORMAL — c'est
 * la promesse même du produit. Un « aucune donnée » sec ferait passer un
 * système qui fonctionne parfaitement pour un système en panne, et c'est la
 * première chose que verra un nouvel utilisateur.
 */
export function Vide({ titre, texte, icone = "◇" }: { titre: string; texte: string; icone?: string }) {
  return (
    <div style={{ ...verre(), padding: "44px 26px", textAlign: "center" }}>
      <div style={{ fontSize: 34, color: tc.cyan, opacity: 0.35, marginBottom: 12 }}>{icone}</div>
      <p style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: tc.texte }}>{titre}</p>
      <p style={{ margin: "0 auto", fontSize: 13.5, lineHeight: 1.7, color: tc.texteDoux, maxWidth: 420 }}>{texte}</p>
    </div>
  );
}

/** Le squelette de chargement — évite le saut de mise en page. */
export function Squelette({ hauteur = 90 }: { hauteur?: number }) {
  return (
    <div
      style={{
        ...verre(),
        height: hauteur,
        background: "linear-gradient(90deg,rgba(18,32,58,.4),rgba(30,52,90,.6),rgba(18,32,58,.4))",
        backgroundSize: "200% 100%",
        animation: "tcPulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export const LIBELLE_SESSION: Record<string, string> = {
  asie: "Asie",
  londres: "Londres",
  "new-york": "New York",
  chevauchement: "Londres × New York",
  "hors-session": "Hors séance",
};

export const LIBELLE_STATUT: Record<string, { texte: string; couleur: string }> = {
  actif: { texte: "En cours", couleur: tc.cyanClair },
  tp1: { texte: "TP1 atteint", couleur: tc.achat },
  tp2: { texte: "TP2 atteint", couleur: tc.achat },
  tp3: { texte: "TP3 atteint", couleur: tc.achat },
  gagne: { texte: "Gagné", couleur: tc.achat },
  perdu: { texte: "Perdu", couleur: tc.vente },
  annule: { texte: "Annulé", couleur: tc.neutre },
  expire: { texte: "Expiré", couleur: tc.neutre },
};

/** Date lisible, dans le fuseau du navigateur. */
export function quand(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** « il y a 12 min » — plus parlant qu'une heure absolue pour un signal frais. */
export function depuis(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}
