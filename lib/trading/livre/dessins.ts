/**
 * LES DESSINS DU LIVRE.
 *
 * Chaque bougie du livre est tracée en SVG à partir de vraies valeurs OHLC.
 * C'est le seul moyen d'être exact : un marteau doit avoir une mèche basse
 * d'au moins deux fois son corps, pas « à peu près ». Un dessin approximatif
 * enseigne une forme approximative, et l'élève cherchera ensuite sur son
 * graphique quelque chose qui n'existe pas.
 *
 * Conséquence utile : les proportions du livre sont vérifiables. On peut
 * relire les valeurs, refaire le calcul, et constater que le marteau de la
 * page 12 respecte bien la définition donnée en page 11.
 */

export interface OHLC {
  o: number;
  h: number;
  l: number;
  c: number;
  /** Étiquette sous la bougie, dans une figure à plusieurs bougies. */
  note?: string;
  /** Met la bougie en avant : c'est celle dont on parle. */
  vedette?: boolean;
  /** Force la couleur — utile pour un doji, dont le sens ne tient pas au sens. */
  ton?: string;
}

export const VERT = "#16a34a";
export const ROUGE = "#dc2626";
export const NEUTRE = "#64748b";
export const OR = "#c8960f";

const couleur = (k: OHLC): string => k.ton ?? (k.c >= k.o ? VERT : ROUGE);

interface Options {
  largeur?: number;
  hauteur?: number;
  /** Trace les repères O, H, L, C avec leurs libellés. */
  legendes?: boolean;
  /** Niveaux horizontaux à tracer : [prix, libellé, couleur]. */
  niveaux?: [number, string, string][];
  /** Marge verticale ajoutée autour de l'amplitude, en fraction. */
  air?: number;
}

/**
 * Une ou plusieurs bougies, à l'échelle.
 *
 * Toutes les bougies d'une même figure partagent la même échelle de prix :
 * sans ça, une bougie deux fois plus grande qu'une autre paraîtrait de même
 * taille, et la figure ne voudrait plus rien dire.
 */
export function dessiner(bougies: OHLC[], opts: Options = {}): string {
  const L = opts.largeur ?? Math.max(200, bougies.length * 58 + 60);
  const H = opts.hauteur ?? 240;
  const air = opts.air ?? 0.12;

  const prix = bougies.flatMap((k) => [k.h, k.l]);
  for (const n of opts.niveaux ?? []) prix.push(n[0]);
  const max = Math.max(...prix);
  const min = Math.min(...prix);
  const etendue = max - min || 1;
  const haut = max + etendue * air;
  const bas = min - etendue * air;

  // Marge basse réservée aux étiquettes, quand il y en a.
  const marge = bougies.some((k) => k.note) ? 26 : 8;
  const y = (p: number) => ((haut - p) / (haut - bas)) * (H - marge - 8) + 8;

  const pas = L / bougies.length;
  const largeurCorps = Math.min(30, pas * 0.52);

  const parties: string[] = [];

  // Les niveaux d'abord : ils passent sous les bougies.
  for (const [p, libelle, ton] of opts.niveaux ?? []) {
    const yy = y(p);
    parties.push(
      `<line x1="0" y1="${yy.toFixed(1)}" x2="${L}" y2="${yy.toFixed(1)}" stroke="${ton}" stroke-width="1.5" stroke-dasharray="5 4" opacity=".8"/>`,
      `<text x="6" y="${(yy - 5).toFixed(1)}" fill="${ton}" font-size="11" font-weight="600">${libelle}</text>`,
    );
  }

  bougies.forEach((k, i) => {
    const cx = pas * (i + 0.5);
    const ton = couleur(k);
    const hausse = k.c >= k.o;
    const corpsHaut = y(Math.max(k.o, k.c));
    const corpsBas = y(Math.min(k.o, k.c));
    // Un corps de hauteur nulle serait invisible : le doji a besoin d'un trait.
    const hauteurCorps = Math.max(1.5, corpsBas - corpsHaut);

    if (k.vedette) {
      parties.push(
        `<rect x="${(cx - pas * 0.46).toFixed(1)}" y="2" width="${(pas * 0.92).toFixed(1)}" height="${H - 4}" fill="${OR}" opacity=".09" rx="4"/>`,
      );
    }

    parties.push(
      `<line x1="${cx.toFixed(1)}" y1="${y(k.h).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${y(k.l).toFixed(1)}" stroke="${ton}" stroke-width="1.6"/>`,
      `<rect x="${(cx - largeurCorps / 2).toFixed(1)}" y="${corpsHaut.toFixed(1)}" width="${largeurCorps.toFixed(1)}" height="${hauteurCorps.toFixed(1)}" fill="${hausse ? ton : ton}" stroke="${ton}" stroke-width="1" rx="1"/>`,
    );

    if (k.note) {
      parties.push(
        `<text x="${cx.toFixed(1)}" y="${H - 8}" text-anchor="middle" fill="#64748b" font-size="11">${k.note}</text>`,
      );
    }
  });

  // Les repères OHLC : réservés à la bougie unique, sinon c'est illisible.
  if (opts.legendes && bougies.length === 1) {
    const k = bougies[0];
    const cx = pas * 0.5;
    const fleche = (p: number, texte: string, cote: "g" | "d") => {
      const yy = y(p);
      const x1 = cote === "g" ? cx - largeurCorps / 2 - 4 : cx + largeurCorps / 2 + 4;
      const x2 = cote === "g" ? 46 : L - 46;
      return `<line x1="${x1.toFixed(1)}" y1="${yy.toFixed(1)}" x2="${x2}" y2="${yy.toFixed(1)}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="${cote === "g" ? x2 - 4 : x2 + 4}" y="${(yy + 4).toFixed(1)}" text-anchor="${cote === "g" ? "end" : "start"}" fill="#475569" font-size="11.5" font-weight="600">${texte}</text>`;
    };
    parties.push(
      fleche(k.h, "Haut", "d"),
      fleche(k.l, "Bas", "d"),
      fleche(k.o, "Ouverture", "g"),
      fleche(k.c, "Clôture", "g"),
    );
  }

  return `<svg viewBox="0 0 ${L} ${H}" class="fig" role="img">${parties.join("")}</svg>`;
}

/** Un bloc figure complet : dessin, titre, légende. */
export function figure(
  titre: string,
  bougies: OHLC[],
  legende: string,
  opts: Options = {},
): string {
  return `<figure class="bloc-fig">
  ${dessiner(bougies, opts)}
  <figcaption><b>${titre}</b>${legende ? ` — ${legende}` : ""}</figcaption>
</figure>`;
}

/**
 * Une petite séquence de marché autour d'une figure.
 *
 * Sert à montrer le CONTEXTE, qui est le vrai sujet du livre : la même figure
 * dans une tendance ou dans un range ne raconte pas la même chose, et on ne
 * peut pas le montrer avec une bougie isolée.
 */
export function contexte(
  avant: OHLC[],
  figure: OHLC[],
  apres: OHLC[],
  opts: Options = {},
): string {
  const tout = [
    ...avant,
    ...figure.map((k) => ({ ...k, vedette: true })),
    ...apres,
  ];
  return dessiner(tout, { hauteur: 220, ...opts });
}

/** Génère une tendance régulière — pour poser un contexte crédible. */
export function tendance(
  n: number,
  depart: number,
  pas: number,
  amplitude: number,
  graine = 7,
): OHLC[] {
  let s = graine;
  const r = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff - 0.5) * 2;
  let p = depart;
  const out: OHLC[] = [];
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o + pas + r() * amplitude * 0.5;
    out.push({
      o,
      c,
      h: Math.max(o, c) + Math.abs(r()) * amplitude * 0.35,
      l: Math.min(o, c) - Math.abs(r()) * amplitude * 0.35,
    });
    p = c;
  }
  return out;
}
