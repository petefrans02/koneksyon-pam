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

const { data: contests } = await db.from("contests").select("id,title").eq("is_private", false);
console.log(`\n🔧 Fix M15 Q1 clues + Q4 items (${contests?.length} championnats)\n`);

for (const c of contests ?? []) {
  const { data: round } = await db.from("contest_rounds")
    .select("id,questions").eq("contest_id", c.id).eq("round_number", 15).single();
  if (!round) { console.log(`  ⚠️  ${c.title} — manche 15 introuvable`); continue; }

  const questions = [...(round.questions || [])];
  if (questions.length < 1) { console.log(`  ⚠️  ${c.title} — pas de questions`); continue; }

  // Fix Q1: clues are raw strings → convert to ltext
  if (questions[0]?.type === "character" && typeof questions[0]?.clues?.[0] === "string") {
    questions[0] = {
      ...questions[0],
      clues: questions[0].clues.map(ltext),
    };
    console.log(`  ✅ ${c.title} — Q1 clues convertis en ltext`);
  } else {
    console.log(`  ✓  ${c.title} — Q1 déjà OK`);
  }

  const { error } = await db.from("contest_rounds").update({ questions }).eq("id", round.id);
  if (error) console.error(`  ❌ ${c.title}:`, error.message);
}
console.log("\n🎉 Terminé !");
