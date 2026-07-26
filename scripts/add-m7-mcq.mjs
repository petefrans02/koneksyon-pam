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
  { q: "Quel roi de Juda fit brûler le rouleau contenant les paroles du prophète Jérémie ?",
    opts: ["Josias","Sédécias","Jojakim","Joachaz"], correct: 2, ref: "Jérémie 36:23" },
  { q: "Quel homme de Dieu tua un lion à mains nues sans posséder d'arme ?",
    opts: ["David","Benaïa","Samson","Saül"], correct: 2, ref: "Juges 14:5-6" },
  { q: "Quel prophète vit un rouleau voler dans les airs ?",
    opts: ["Ézéchiel","Jérémie","Daniel","Zacharie"], correct: 3, ref: "Zacharie 5:1-2" },
  { q: "Combien de jours les espions explorèrent-ils le pays de Canaan avant de revenir vers Moïse ?",
    opts: ["12 jours","20 jours","30 jours","40 jours"], correct: 3, ref: "Nombres 13:25" },
  { q: "Quel disciple remplaça Judas Iscariot parmi les douze apôtres ?",
    opts: ["Barnabas","Silas","Timothée","Matthias"], correct: 3, ref: "Actes 1:26" },
];

const jsonQ = questions.map(q => ({
  type: "mcq",
  q: ltext(q.q),
  options: q.opts.map(ltext),
  correct: q.correct,
  ref: q.ref,
}));

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n🔥 Manche 7 — Le Défi du Sage (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 7).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 7 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 5) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds").update({ questions: jsonQ }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 5 questions ajoutées`);
}
console.log("\n🎉 Terminé !");
