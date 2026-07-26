import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Identifiants lus depuis .env.local — jamais ecrits en dur dans le code.
const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { transport: () => null } }
);
const ltext = fr => ({ fr, ht: fr, en: fr });

const questions = [
  { clue: "Dans quel livre trouve-t-on le récit de la création du monde ?",
    opts: ["Exode","Psaumes","Genèse","Job"], correct: 2, ref: "Genèse 1" },
  { clue: "Dans quel livre est racontée l'histoire de l'Exode du peuple d'Israël hors d'Égypte ?",
    opts: ["Lévitique","Nombres","Deutéronome","Exode"], correct: 3, ref: "Exode 12–14" },
  { clue: "Dans quel livre se trouve le célèbre chapitre sur l'amour qui commence par : « Quand je parlerais les langues des hommes et des anges… » ?",
    opts: ["Romains","Éphésiens","1 Corinthiens","Galates"], correct: 2, ref: "1 Corinthiens 13" },
  { clue: "Dans quel livre est racontée l'histoire de la reine Esther ?",
    opts: ["Ruth","Néhémie","Esdras","Esther"], correct: 3, ref: "Esther 1–10" },
  { clue: "Dans quel livre trouve-t-on la vision de la nouvelle Jérusalem descendant du ciel ?",
    opts: ["Daniel","Ézéchiel","Zacharie","Apocalypse"], correct: 3, ref: "Apocalypse 21" },
];

const jsonQ = questions.map((q, i) => ({
  type: "book",
  clues: [ltext(q.clue)],
  options: q.opts.map(ltext),
  correct: q.correct,
  ref: q.ref,
}));

// Mettre à jour contest_rounds manche 6 pour tous les championnats publics
const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n📚 Manche 6 — La Bibliothèque Sacrée (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id, questions").eq("contest_id", c.id).eq("round_number", 6).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 6 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 5) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds")
    .update({ questions: jsonQ }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 5 questions ajoutées`);
}
console.log("\n🎉 Terminé !");
