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
  { stmt: "Adam fut créé avant Ève.", is_true: true,  ref: "Genèse 2:7, 21-22" },
  { stmt: "Noé avait trois fils.", is_true: true,  ref: "Genèse 6:10" },
  { stmt: "David était le fils aîné de Jessé.", is_true: false, ref: "1 Samuel 16:10-13" },
  { stmt: "Moïse entra dans le pays promis.", is_true: false, ref: "Deutéronome 34:4-5" },
  { stmt: "Jésus transforma l'eau en vin à Cana.", is_true: true,  ref: "Jean 2:1-11" },
  { stmt: "Paul faisait partie des douze apôtres choisis par Jésus pendant son ministère terrestre.", is_true: false, ref: "Actes 9 ; Galates 1:1" },
  { stmt: "Le premier livre de la Bible est la Genèse.", is_true: true,  ref: "Genèse 1:1" },
  { stmt: "L'apôtre Pierre a renié Jésus trois fois.", is_true: true,  ref: "Matthieu 26:69-75" },
];

const jsonQ = questions.map(q => ({
  type: "tf",
  statement: ltext(q.stmt),
  is_true: q.is_true,
  ref: q.ref,
}));

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n⚡ Manche 9 — L'Éclair (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 9).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 9 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 8) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds").update({ questions: jsonQ }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 8 questions ajoutées`);
}
console.log("\n🎉 Terminé !");
