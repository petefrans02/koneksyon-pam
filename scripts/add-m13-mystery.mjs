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

// progressive_clues: true → game will reveal clues one by one when implemented
const questions = [
  {
    type: "character",
    clues: ["Je suis né dans une étable.", "Des bergers sont venus me voir.", "Des mages m'ont apporté de l'or, de l'encens et de la myrrhe."],
    opts: ["Jean-Baptiste","Samuel","Jésus-Christ","Isaac"],
    correct: 2, ref: "Matthieu 2 ; Luc 2",
  },
  {
    type: "character",
    clues: ["J'ai été vendu par mes frères.", "Je suis devenu gouverneur d'un grand royaume.", "J'ai sauvé ma famille pendant une famine."],
    opts: ["Moïse","David","Daniel","Joseph"],
    correct: 3, ref: "Genèse 37–50",
  },
  {
    type: "character",
    clues: ["J'ai vu un buisson qui brûlait sans se consumer.", "Dieu m'a envoyé délivrer Israël.", "J'ai reçu les dix commandements."],
    opts: ["Josué","Aaron","Moïse","Élie"],
    correct: 2, ref: "Exode 3 ; Exode 20",
  },
  {
    type: "location",
    clues: ["J'étais une très grande ville.", "Mes murailles sont tombées sans être frappées par des béliers.", "Le peuple d'Israël a fait le tour de moi pendant sept jours."],
    opts: ["Jérusalem","Ninive","Bethléem","Jéricho"],
    correct: 3, ref: "Josué 6",
  },
  {
    type: "character",
    clues: ["J'ai été construit selon des dimensions données par Dieu.", "Des animaux sont entrés en moi deux par deux.", "J'ai survécu au déluge."],
    opts: ["Le Tabernacle","L'Arche de l'Alliance","L'Arche de Noé","Le Temple"],
    correct: 2, ref: "Genèse 6–8",
  },
];

const jsonQ = questions.map(q => ({
  type: q.type,
  clues: q.clues.map(ltext),
  options: q.opts.map(ltext),
  correct: q.correct,
  progressive_clues: true, // flag for future progressive reveal feature
  ref: q.ref,
}));

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n🌟 Manche 13 — Le Mystère Biblique (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 13).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 13 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 5) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds").update({ questions: jsonQ }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 5 questions ajoutées`);
}
console.log("\n🎉 Terminé !");
