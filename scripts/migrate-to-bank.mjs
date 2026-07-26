/**
 * KONEKSYON PAM — Migration vers la Banque Officielle
 * Migre les questions de contest_rounds → kp_questions + kp_championship_questions
 */
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

// Type de manche → round_number standard
const ROUND_TYPE_TO_NUMBER = {
  mcq:       1,
  tf:        2,
  fill:      3,
  character: 4,
  location:  5,
  book:      6,
  chrono:    7,
  finale:   15,
};

async function migrateContest(contestId, contestName) {
  console.log(`\n📂 Migration : "${contestName}"`);

  // Charger les manches existantes
  const { data: rounds } = await db
    .from("contest_rounds")
    .select("round_number, round_type, questions")
    .eq("contest_id", contestId)
    .order("round_number");

  if (!rounds?.length) { console.log("  ⚠️  Aucune manche trouvée."); return; }

  // Charger les kp_championship_rounds pour ce contest
  const { data: kpRounds } = await db
    .from("kp_championship_rounds")
    .select("id, round_number, round_type")
    .eq("contest_id", contestId);

  const kpRoundMap = {};
  kpRounds?.forEach(r => { kpRoundMap[r.round_number] = r; });

  let totalInserted = 0;

  for (const round of rounds) {
    const questions = Array.isArray(round.questions) ? round.questions : [];
    if (!questions.length) continue;

    // Trouver la kp_championship_round correspondante
    const kpRound = kpRoundMap[round.round_number];
    if (!kpRound) {
      console.log(`  ⚠️  Manche ${round.round_number} non trouvée dans kp_championship_rounds`);
      continue;
    }

    console.log(`  Manche ${round.round_number} (${round.round_type}) — ${questions.length} questions`);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ltext = (v) => {
        if (!v) return { fr: "", ht: "", en: "" };
        if (typeof v === "string") return { fr: v, ht: v, en: v };
        return { fr: v.fr ?? "", ht: v.ht ?? v.fr ?? "", en: v.en ?? v.fr ?? "" };
      };

      // Construire la ligne kp_questions selon le type
      const row = {
        type:       q.type ?? round.round_type,
        difficulty: "medium",
        status:     "validated",
        reference:  q.ref ?? null,
        suggested_round: round.round_number,
      };

      if (q.type === "tf") {
        row.statement      = ltext(q.statement);
        row.is_true        = q.is_true ?? null;
      } else if (q.type === "fill") {
        row.verse          = ltext(q.verse);
        row.option_a       = ltext(q.fill_options?.[0]);
        row.option_b       = ltext(q.fill_options?.[1]);
        row.option_c       = ltext(q.fill_options?.[2]);
        row.option_d       = ltext(q.fill_options?.[3]);
        row.correct_answer = q.correct ?? null;
      } else if (q.type === "character" || q.type === "location" || q.type === "book") {
        row.clues          = (q.clues ?? []).map(ltext);
        row.option_a       = ltext(q.options?.[0]);
        row.option_b       = ltext(q.options?.[1]);
        row.option_c       = ltext(q.options?.[2]);
        row.option_d       = ltext(q.options?.[3]);
        row.correct_answer = q.correct ?? null;
      } else {
        // mcq / finale / default
        row.question       = ltext(q.q ?? q.question);
        row.option_a       = ltext(q.options?.[0]);
        row.option_b       = ltext(q.options?.[1]);
        row.option_c       = ltext(q.options?.[2]);
        row.option_d       = ltext(q.options?.[3]);
        row.correct_answer = q.correct ?? null;
      }

      // Insérer dans kp_questions
      const { data: inserted, error: qErr } = await db
        .from("kp_questions")
        .insert(row)
        .select("id")
        .single();

      if (qErr) { console.error(`    ❌ Q${i+1}:`, qErr.message); continue; }

      // Lier à la manche du championnat
      const { error: linkErr } = await db
        .from("kp_championship_questions")
        .insert({ round_id: kpRound.id, question_id: inserted.id, order_num: i, is_active: true });

      if (linkErr && !linkErr.message.includes("duplicate")) {
        console.error(`    ❌ Lien Q${i+1}:`, linkErr.message);
      } else {
        totalInserted++;
      }
    }
  }

  console.log(`  ✅ ${totalInserted} questions migrées.`);
}

// ── Main ─────────────────────────────────────────────────────────────
const { data: contests } = await db
  .from("contests")
  .select("id, title")
  .eq("is_private", false)
  .order("created_at");

console.log(`\n🏦 MIGRATION BANQUE OFFICIELLE KONEKSYON PAM`);
console.log(`${contests?.length ?? 0} championnats trouvés.\n`);

for (const c of contests ?? []) {
  await migrateContest(c.id, c.title);
}

console.log("\n🎉 Migration terminée !");
