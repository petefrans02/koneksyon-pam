// Génère lib/valid-slugs.ts : la liste compacte des adresses valides du site.
// Lancé automatiquement avant chaque build (script "prebuild"), donc la liste
// ne peut pas se désynchroniser quand on ajoute une étude, un groupe ou un cours.
//
// Pourquoi ? Le proxy doit renvoyer un vrai 404 sur une adresse inventée, mais
// il ne peut pas importer studies-data.ts (135 Ko) : trop lourd pour du code
// qui s'exécute à chaque requête.

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const slugs = (src) => [...new Set([...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]))];

const studies = slugs(read("lib/studies-data.ts"));
const groups = slugs(read("lib/groups-data.ts"));
const courses = slugs(read("lib/academy-data.ts"));
// Lecons d'anglais : declarees par T("slug", ...) dans english-course.ts
const english = [...new Set([
  // Parcours chrétien : déclaré par T("slug", ...) dans english-course.ts
  ...[...read("lib/english-course.ts").matchAll(/T\(\s*"([^"]+)"/g)].map((m) => m[1]),
  // Parcours général : slug: "g-..." dans english-general.ts
  ...slugs(read("lib/english-general.ts")),
])];

// Pour la Bible il faut aussi le nombre de chapitres de chaque livre,
// afin de refuser /bible/luc/999.
const books = [...read("lib/bible-books.ts").matchAll(/slug:\s*"([^"]+)"[\s\S]{0,200}?chapters:\s*(\d+)/g)]
  .map((m) => [m[1], Number(m[2])]);

if (!studies.length || !groups.length || !books.length) {
  console.error("gen-valid-slugs: extraction vide — build interrompu par sécurité");
  process.exit(1);
}

const out = `// FICHIER GÉNÉRÉ — ne pas modifier à la main.
// Produit par scripts/gen-valid-slugs.mjs avant chaque build.
// Sert au proxy pour renvoyer un vrai 404 sur les adresses qui n'existent pas.

export const STUDY_SLUGS = new Set(${JSON.stringify(studies)});
export const GROUP_SLUGS = new Set(${JSON.stringify(groups)});
export const COURSE_SLUGS = new Set(${JSON.stringify(courses)});\nexport const ENGLISH_SLUGS = new Set(${JSON.stringify(english)});
export const BIBLE_CHAPTERS: Record<string, number> = ${JSON.stringify(Object.fromEntries(books))};
`;

fs.writeFileSync(path.join(root, "lib/valid-slugs.ts"), out);
console.log(
  `lib/valid-slugs.ts : ${studies.length} études, ${groups.length} groupes, ` +
  `${courses.length} cours, ${books.length} livres bibliques`
);
