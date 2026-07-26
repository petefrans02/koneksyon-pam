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
  { q: "Qui a construit l'arche ?",
    opts: ["Abraham","Moïse","Noé","David"], correct: 2, ref: "Genèse 6" },
  { q: "Qui a vaincu Goliath ?",
    opts: ["Saül","Jonathan","Samuel","David"], correct: 3, ref: "1 Samuel 17" },
  { q: "Dans quelle ville Jésus est-il né ?",
    opts: ["Nazareth","Jérusalem","Bethléem","Capernaüm"], correct: 2, ref: "Matthieu 2:1" },
  { q: "Combien de jours Jésus passa-t-il dans le désert ?",
    opts: ["12","30","40","50"], correct: 2, ref: "Matthieu 4:2" },
  { q: "Quel est le dernier livre de la Bible ?",
    opts: ["Jude","Hébreux","Malachie","Apocalypse"], correct: 3, ref: "Apocalypse 1:1" },
];

const jsonQ = questions.map(q => ({
  type: "mcq",
  q: ltext(q.q),
  options: q.opts.map(ltext),
  correct: q.correct,
  ref: q.ref,
}));

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n⚔️  Manche 14 — Le Jugement (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 14).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 14 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 5) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds").update({ questions: jsonQ }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 5 questions ajoutées`);
}
console.log("\n🎉 Terminé !");
