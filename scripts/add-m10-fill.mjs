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
  { verse: "« Car là où est ton trésor, là aussi sera ton ______. »",
    opts: ["Esprit","Pensée","Cœur","Désir"], correct: 2, ref: "Matthieu 6:21" },
  { verse: "« L'Éternel est mon berger : je ne manquerai de ______. »",
    opts: ["Nourriture","Rien","Force","Paix"], correct: 1, ref: "Psaume 23:1" },
  { verse: "« Heureux ceux qui procurent la paix, car ils seront appelés fils de ______. »",
    opts: ["L'homme","La justice","Dieu","La lumière"], correct: 2, ref: "Matthieu 5:9" },
  { verse: "« Je puis tout par celui qui me ______. »",
    opts: ["Guide","Sauve","Protège","Fortifie"], correct: 3, ref: "Philippiens 4:13" },
  { verse: "« Toute Écriture est inspirée de Dieu et utile pour enseigner, pour convaincre, pour corriger, pour instruire dans la ______. »",
    opts: ["Foi","Vérité","Justice","Sagesse"], correct: 2, ref: "2 Timothée 3:16" },
];

const jsonQ = questions.map(q => ({
  type: "fill",
  verse: ltext(q.verse),
  fill_options: q.opts.map(ltext),
  correct: q.correct,
  ref: q.ref,
}));

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n💎 Manche 10 — Le Verset Précieux (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 10).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 10 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 5) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds").update({ questions: jsonQ }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 5 questions ajoutées`);
}
console.log("\n🎉 Terminé !");
