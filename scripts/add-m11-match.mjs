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

// left[i] pairs with right[i] — game shuffles right for display
const questions = [
  {
    q: "Associez chaque alliance à son personnage.",
    left:  ["Alliance de l'arc-en-ciel","Alliance de la circoncision","Alliance du Sinaï","Nouvelle Alliance"],
    right: ["Noé","Abraham","Moïse","Jésus-Christ"],
    ref: "Genèse 9 ; Genèse 17 ; Exode 19-24 ; Luc 22:20",
  },
  {
    q: "Associez chaque personnage à son symbole.",
    left:  ["Noé","Moïse","David","Salomon"],
    right: ["Arche","Bâton","Fronde","Temple"],
    ref: "Genèse 6-9 ; Exode 4 ; 1 Samuel 17 ; 1 Rois 6",
  },
  {
    q: "Associez chaque miracle à son auteur.",
    left:  ["Ouverture de la mer Rouge","Chute des murailles de Jéricho","Multiplication des pains","Résurrection d'un mort à Sarepta"],
    right: ["Moïse","Josué","Jésus","Élie"],
    ref: "Exode 14 ; Josué 6 ; Matthieu 14 ; 1 Rois 17",
  },
  {
    q: "Associez chaque prophète à son livre.",
    left:  ["Ésaïe","Jérémie","Ézéchiel","Daniel"],
    right: ["Ésaïe","Jérémie","Ézéchiel","Daniel"],
    ref: "Livres des Prophètes",
  },
  {
    q: "Associez chaque roi à son royaume principal.",
    left:  ["Saül","David","Salomon","Roboam"],
    right: ["Premier roi d'Israël","Jérusalem","Construction du Temple","Royaume de Juda"],
    ref: "1 Samuel ; 2 Samuel ; 1 Rois ; 1 Rois 12",
  },
];

const jsonQ = questions.map(q => ({
  type: "match",
  q:     ltext(q.q),
  left:  q.left.map(ltext),
  right: q.right.map(ltext),
  // pairs[i] = index in right that matches left[i] — here always [0,1,2,3]
  pairs: [0, 1, 2, 3],
  ref:   q.ref,
}));

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n🔗 Manche 11 — Les Alliances (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 11).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 11 introuvable`); continue; }

  const existing = Array.isArray(round.questions) ? round.questions : [];
  if (existing.length >= 5) { console.log(`  ✅ ${c.title} — déjà ${existing.length} questions, ignoré`); continue; }

  const { error } = await db.from("contest_rounds").update({ questions: jsonQ }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
  else console.log(`  ✅ ${c.title} — 5 questions ajoutées`);
}
console.log("\n🎉 Terminé !");
