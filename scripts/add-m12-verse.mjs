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

// fragments stored in CORRECT order — game shuffles them for display
const questions = [
  {
    fragments: ["Au commencement","Dieu","créa","les cieux et la terre"],
    full_verse: "Au commencement, Dieu créa les cieux et la terre.",
    ref: "Genèse 1:1",
  },
  {
    fragments: ["L'Éternel","est","mon","berger"],
    full_verse: "L'Éternel est mon berger.",
    ref: "Psaume 23:1",
  },
  {
    fragments: ["Car","Dieu","a tant","aimé","le monde"],
    full_verse: "Car Dieu a tant aimé le monde…",
    ref: "Jean 3:16",
  },
  {
    fragments: ["Le","juste","vivra","par la","foi"],
    full_verse: "Le juste vivra par la foi.",
    ref: "Romains 1:17",
  },
  {
    fragments: ["Je","puis","tout","par","celui","qui me","fortifie"],
    full_verse: "Je puis tout par celui qui me fortifie.",
    ref: "Philippiens 4:13",
  },
];

const jsonQ = questions.map(q => ({
  type: "order_verse",
  q: ltext("Remettez ce verset dans le bon ordre."),
  fragments: q.fragments.map(ltext),
  correct_order: q.fragments.map((_, i) => i), // [0,1,2,...] — fragments already in order
  full_verse: ltext(q.full_verse),
  ref: q.ref,
}));

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n📜 Manche 12 — Le Verset Brisé (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 12).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 12 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 5) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds").update({ questions: jsonQ }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 5 questions ajoutées`);
}
console.log("\n🎉 Terminé !");
