/**
 * LA STRUCTURE DU LIVRE.
 *
 * Le contenu est du HTML rédigé à la main, et les figures sont des chaînes SVG
 * produites par `dessins.ts`. Deux conséquences utiles :
 *
 * — La page est un composant serveur, sans un octet de JavaScript côté client.
 *   Les corrections d'exercices s'ouvrent avec `<details>`, que le navigateur
 *   gère nativement.
 * — Les figures sont vectorielles, donc nettes à tout zoom et à l'impression.
 *   Un livre sur les bougies dont les schémas pixellisent rate son sujet.
 *
 * Le HTML est injecté tel quel : il vient de ce dépôt, jamais d'une saisie.
 */

export type Niveau = "debutant" | "intermediaire" | "avance";

export interface Section {
  /** Titre affiché ; sert aussi d'ancre dans le sommaire. */
  titre: string;
  /** Corps en HTML — les dessins sont injectés ici. */
  html: string;
}

export interface Chapitre {
  n: number;
  titre: string;
  accroche: string;
  niveau: Niveau;
  sections: Section[];
}

// ------------------------------------------------------- blocs de contenu ---

/** Une définition mise en avant — le mot et ce qu'il veut vraiment dire. */
export const definition = (terme: string, texte: string): string =>
  `<div class="definition"><span class="terme">${terme}</span>${texte}</div>`;

/** Le piège classique. C'est souvent la partie la plus utile d'un chapitre. */
export const piege = (texte: string): string =>
  `<div class="piege"><span class="etiq">Le piège</span>${texte}</div>`;

/** Ce qu'il faut retenir, en une ou deux phrases. */
export const retenir = (texte: string): string =>
  `<div class="retenir"><span class="etiq">À retenir</span>${texte}</div>`;

/** Une remarque d'expérience, moins solennelle qu'un encadré. */
export const note = (texte: string): string => `<div class="note">${texte}</div>`;

/** Un tableau simple : en-têtes puis lignes. */
export function tableau(entetes: string[], lignes: string[][]): string {
  return `<table>
  <thead><tr>${entetes.map((e) => `<th>${e}</th>`).join("")}</tr></thead>
  <tbody>${lignes.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table>`;
}

export interface Exercice {
  n: number;
  enonce: string;
  /** Dessin ou tableau accompagnant la question. */
  support?: string;
  /** Les propositions, s'il s'agit d'un choix. */
  choix?: string[];
  correction: string;
}

/** Une série d'exercices, avec corrections dépliables. */
export function exercices(titre: string, liste: Exercice[]): string {
  return `<div class="exos">
  <h3 class="exos-titre">${titre}</h3>
  ${liste
    .map(
      (e) => `<div class="exo">
    <div class="exo-tete"><span class="exo-n">${e.n}</span><div class="exo-enonce">${e.enonce}</div></div>
    ${e.support ?? ""}
    ${e.choix ? `<ol class="choix">${e.choix.map((c) => `<li>${c}</li>`).join("")}</ol>` : ""}
    <details><summary>Voir la correction</summary><div class="correction">${e.correction}</div></details>
  </div>`,
    )
    .join("")}
</div>`;
}
