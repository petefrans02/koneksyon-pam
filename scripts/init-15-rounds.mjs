/**
 * Initialise les 15 manches dans contest_rounds pour tous les championnats publics.
 * Les manches déjà existantes sont ignorées (upsert).
 * Les nouvelles manches sont créées avec un tableau de questions vide.
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

const ltext = (fr, ht, en) => ({ fr, ht, en });

const ROUND_SPECS = [
  { index: 0, type: "mcq",       icon: "📖", color: "#f59e0b", time: 15, pts: 100,
    title: ltext("L'Éveil", "Reveye a", "The Awakening"),
    instructions: ltext("5 questions à choix multiples sur les fondements bibliques", "5 kesyon sou fondasyon biblik yo", "5 multiple choice questions on biblical foundations") },
  { index: 1, type: "tf",        icon: "⚖️", color: "#3b82f6", time: 15, pts: 80,
    title: ltext("Le Témoignage", "Temwayaj la", "The Testimony"),
    instructions: ltext("6 affirmations bibliques — Vrai ou Faux ?", "6 aflèmasyon biblik — Vre oswa Fo ?", "6 biblical statements — True or False?") },
  { index: 2, type: "fill",      icon: "✍️", color: "#8b5cf6", time: 15, pts: 120,
    title: ltext("La Parole", "Pawòl la", "The Word"),
    instructions: ltext("Complétez les versets bibliques", "Konplete vèsèt biblik yo", "Complete the biblical verses") },
  { index: 3, type: "character", icon: "👤", color: "#f97316", time: 15, pts: 120,
    title: ltext("La Galerie des Prophètes", "Galeri Pwofèt yo", "The Prophets Gallery"),
    instructions: ltext("Identifiez les personnages bibliques à partir d'indices", "Idantifye pèsonaj biblik yo ak done yo", "Identify biblical characters from clues") },
  { index: 4, type: "location",  icon: "📍", color: "#10b981", time: 15, pts: 120,
    title: ltext("Les Terres Saintes", "Tè Sen yo", "The Holy Lands"),
    instructions: ltext("Identifiez les lieux bibliques", "Idantifye kote biblik yo", "Identify biblical places") },
  { index: 5, type: "book",      icon: "📚", color: "#7c3aed", time: 15, pts: 100,
    title: ltext("La Bibliothèque Sacrée", "Bibliyotèk Sakre a", "The Sacred Library"),
    instructions: ltext("Identifiez les livres de la Bible", "Idantifye liv Bib la", "Identify the books of the Bible") },
  { index: 6, type: "mcq",       icon: "🔥", color: "#6366f1", time: 15, pts: 150,
    title: ltext("Le Défi du Sage", "Defi Saj la", "The Wise Man's Challenge"),
    instructions: ltext("5 questions avancées pour les experts bibliques", "5 kesyon avanse pou ekspè biblik yo", "5 advanced questions for biblical experts") },
  { index: 7, type: "chrono",    icon: "⏳", color: "#d97706", time: 15, pts: 180,
    title: ltext("L'Ordre Éternel", "Lòd Etènèl la", "The Eternal Order"),
    instructions: ltext("Remettez les événements dans l'ordre chronologique", "Mete evènman yo nan lòd kronolojik", "Put events in chronological order") },
  { index: 8, type: "tf",        icon: "⚡", color: "#ef4444", time: 15, pts: 100,
    title: ltext("L'Éclair", "Zèklè a", "The Lightning"),
    instructions: ltext("8 affirmations ultra-rapides — 7 secondes chacune !", "8 aflèmasyon rapid — 7 segonn chak !", "8 ultra-fast statements — 7 seconds each!") },
  { index: 9, type: "fill",      icon: "💎", color: "#0ea5e9", time: 15, pts: 150,
    title: ltext("Le Verset Précieux", "Vèsèt Presye a", "The Precious Verse"),
    instructions: ltext("Complétez des versets plus difficiles", "Konplete vèsèt ki pi difisil yo", "Complete more challenging verses") },
  { index: 10, type: "mcq",      icon: "🔗", color: "#92400e", time: 15, pts: 200,
    title: ltext("Les Alliances", "Alyans yo", "The Alliances"),
    instructions: ltext("Questions sur les alliances et les pactes bibliques", "Kesyon sou alyans ak pak biblik yo", "Questions on biblical alliances and covenants") },
  { index: 11, type: "character",icon: "📜", color: "#065f46", time: 15, pts: 200,
    title: ltext("Le Verset Brisé", "Vèsèt Kraze a", "The Broken Verse"),
    instructions: ltext("Identifiez le personnage à partir de versets brisés", "Idantifye pèsonaj la nan vèsèt yo", "Identify the character from broken verses") },
  { index: 12, type: "character",icon: "🌟", color: "#1e3a8a", time: 15, pts: 200,
    title: ltext("Le Mystère Biblique", "Mistè Biblik la", "The Biblical Mystery"),
    instructions: ltext("Personnages mystères — indices progressifs", "Pèsonaj mistè — done pwogresif yo", "Mystery characters — progressive clues") },
  { index: 13, type: "mcq",      icon: "⚔️", color: "#be123c", time: 15, pts: 250,
    title: ltext("Le Jugement", "Jijman an", "The Judgment"),
    instructions: ltext("5 questions ultimes — 7 secondes pour répondre", "5 kesyon dènye — 7 segonn pou reponn", "5 ultimate questions — 7 seconds to answer") },
  { index: 14, type: "finale",   icon: "👑", color: "#b45309", time: 15, pts: 300,
    title: ltext("La Grande Finale", "Gran Final la", "The Grand Finale"),
    instructions: ltext("5 questions de légende — le titre se joue ici", "5 kesyon lejandè — tit la jwe isit la", "5 legendary questions — the title is decided here") },
];

const { data: contests } = await db
  .from("contests")
  .select("id, title")
  .eq("is_private", false)
  .order("created_at");

console.log(`\n🏆 Initialisation 15 manches — ${contests?.length ?? 0} championnats\n`);

for (const contest of contests ?? []) {
  console.log(`📂 ${contest.title}`);

  // Manches existantes
  const { data: existing } = await db
    .from("contest_rounds")
    .select("round_number")
    .eq("contest_id", contest.id);

  const existingNums = new Set((existing ?? []).map(r => r.round_number));

  let added = 0;
  for (const spec of ROUND_SPECS) {
    const roundNumber = spec.index + 1;
    if (existingNums.has(roundNumber)) continue;

    const { error } = await db.from("contest_rounds").insert({
      contest_id:     contest.id,
      round_number:   roundNumber,
      round_type:     spec.type,
      title:          spec.title,
      instructions:   spec.instructions,
      color_theme:    spec.color,
      icon:           spec.icon,
      time_limit_sec: spec.time,
      points_per_q:   spec.pts,
      questions:      [],
    });

    if (error) console.error(`  ❌ Manche ${roundNumber}: ${error.message}`);
    else added++;
  }

  console.log(`  ✅ ${added} nouvelles manches ajoutées (${existingNums.size} existantes conservées)`);
}

console.log("\n🎉 Terminé !");
