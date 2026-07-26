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

// Items stored in CORRECT chronological order — game will shuffle on display
const questions = [
  {
    q: "Remettez ces événements dans l'ordre chronologique.",
    items: ["Adam et Ève sont créés", "L'arche de Noé est construite", "Le déluge commence", "La tour de Babel est construite"],
    ref: "Genèse 1–11",
  },
  {
    q: "Remettez ces événements de la vie de Moïse dans l'ordre.",
    items: ["Appel au buisson ardent", "Les dix plaies d'Égypte", "Traversée de la mer Rouge", "Réception des dix commandements"],
    ref: "Exode 3–20",
  },
  {
    q: "Remettez ces événements de la vie de David dans l'ordre.",
    items: ["David est oint par Samuel", "David combat Goliath", "David devient roi", "David apporte l'arche à Jérusalem"],
    ref: "1 Samuel 16 – 2 Samuel 6",
  },
  {
    q: "Remettez ces événements de la vie de Jésus dans l'ordre.",
    items: ["Baptême de Jésus", "Tentation dans le désert", "Choix des douze apôtres", "Multiplication des pains"],
    ref: "Matthieu 3–14",
  },
  {
    q: "Remettez ces événements de la Passion dans l'ordre.",
    items: ["Dernière Cène", "Crucifixion", "Résurrection", "Ascension"],
    ref: "Matthieu 26–28 ; Actes 1",
  },
];

const jsonQ = questions.map(q => ({
  type: "chrono",
  q: ltext(q.q),
  // correct_order: [0,1,2,3] — items stored in correct order, game shuffles them
  items: q.items.map(ltext),
  correct_order: [0, 1, 2, 3],
  ref: q.ref,
}));

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n⏳ Manche 8 — L'Ordre Éternel (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 8).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 8 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 5) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds").update({ questions: jsonQ }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 5 questions ajoutées`);
}
console.log("\n🎉 Terminé !");
