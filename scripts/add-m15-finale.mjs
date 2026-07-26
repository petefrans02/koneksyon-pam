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
  // Q1 — Le Mystère Final (character avec indices progressifs)
  {
    type: "character",
    clues: [
      "J'ai été vendu pour vingt pièces d'argent.",
      "Je suis devenu gouverneur d'Égypte.",
      "J'ai pardonné à mes frères.",
    ],
    options: ["Daniel","David","Joseph","Moïse"].map(ltext),
    correct: 2,
    progressive_clues: true,
    ref: "Genèse 37–50",
  },
  // Q2 — Le Verset Ultime (fill)
  {
    type: "fill",
    verse: ltext("« La crainte de l'Éternel est le commencement de la ______. »"),
    fill_options: ["Foi","Justice","Sagesse","Sainteté"].map(ltext),
    correct: 2,
    ref: "Proverbes 9:10",
  },
  // Q3 — L'Éclair Final (tf)
  {
    type: "tf",
    statement: ltext("L'apôtre Paul a écrit l'Évangile selon Marc."),
    is_true: false,
    ref: "Marc 1:1 ; Colossiens 4:10 ; 2 Timothée 4:11",
  },
  // Q4 — L'Ordre Final (chrono)
  {
    type: "chrono",
    q: ltext("Remettez ces événements de la Passion dans le bon ordre."),
    items: ["Dernière Cène","Crucifixion","Résurrection","Ascension"].map(ltext),
    correct_order: [0, 1, 2, 3],
    ref: "Matthieu 26–28 ; Actes 1",
  },
  // Q5 — La Question du Champion (mcq)
  {
    type: "mcq",
    q: ltext("Quel prophète déclara : « Choisissez aujourd'hui qui vous voulez servir… » ?"),
    options: ["Élie","Samuel","Josué","Ésaïe"].map(ltext),
    correct: 2,
    ref: "Josué 24:15",
  },
];

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n👑 Manche 15 — La Grande Finale (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 15).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 15 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 5) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds").update({ questions }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 5 questions ajoutées`);
}
console.log("\n🎉 Terminé ! Les 15 manches sont complètes pour tous les championnats.");
