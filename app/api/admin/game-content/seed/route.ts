import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import { quizLevels } from "@/lib/quiz-data";

// Static jeu data — mirrors app/jeu/page.tsx
const JEU_VERSES = [
  { reference: "Jean 3:16 / John 3:16", fr: { verse: "Car Dieu a tant aimé le _____ qu'il a donné son Fils unique", missingWord: "monde", hint: "La terre entière", options: ["monde", "peuple", "ciel", "royaume"] }, ht: { verse: "Paske Bondye sitèlman renmen _____ a pou li ba nou Pitit li a", missingWord: "mond lan", hint: "Tout latè a", options: ["mond lan", "pèp la", "syèl la", "wayòm nan"] }, en: { verse: "For God so loved the _____ that He gave His only Son", missingWord: "world", hint: "The entire earth", options: ["world", "people", "heaven", "kingdom"] } },
  { reference: "Psaume 23:1 / Psalm 23:1", fr: { verse: "L'Éternel est mon _____ : je ne manquerai de rien", missingWord: "berger", hint: "Celui qui garde les brebis", options: ["roi", "berger", "père", "ami"] }, ht: { verse: "Seyè a se _____ mwen; mwen p ap manke anyen", missingWord: "gadò", hint: "Moun ki pran swen mouton", options: ["wa", "gadò", "papa", "zanmi"] }, en: { verse: "The Lord is my _____; I shall not want", missingWord: "shepherd", hint: "One who cares for sheep", options: ["king", "shepherd", "father", "friend"] } },
  { reference: "Philippiens 4:13 / Phil. 4:13", fr: { verse: "Je puis tout par celui qui me _____", missingWord: "fortifie", hint: "Donner de la force", options: ["guide", "aime", "fortifie", "appelle"] }, ht: { verse: "Mwen kapab fè tout bagay nan Kris ki _____ m fòs", missingWord: "ban", hint: "Bay fòs", options: ["gide", "renmen", "ban", "rele"] }, en: { verse: "I can do all things through _____ who strengthens me", missingWord: "Him", hint: "Refers to Christ", options: ["God", "Him", "faith", "prayer"] } },
  { reference: "Ésaïe 41:10 / Isaiah 41:10", fr: { verse: "Ne crains point, car je suis avec _____", missingWord: "toi", hint: "La personne qui lit", options: ["eux", "nous", "toi", "lui"] }, ht: { verse: "Pa pè, paske mwen avèk _____", missingWord: "ou", hint: "Moun k ap li a", options: ["yo", "nou", "ou", "li"] }, en: { verse: "Fear not, for I am with _____", missingWord: "you", hint: "The person reading this", options: ["them", "us", "you", "him"] } },
  { reference: "Genèse 1:1 / Genesis 1:1", fr: { verse: "Au commencement, Dieu créa les cieux et la _____", missingWord: "terre", hint: "Notre planète", options: ["terre", "mer", "lumière", "vie"] }, ht: { verse: "Nan kòmansman, Bondye te kreye syèl la ak _____", missingWord: "tè a", hint: "Planèt nou an", options: ["tè a", "lanmè a", "limyè a", "lavi a"] }, en: { verse: "In the beginning, God created the heavens and the _____", missingWord: "earth", hint: "Our planet", options: ["earth", "sea", "light", "life"] } },
  { reference: "Matthieu 7:7 / Matthew 7:7", fr: { verse: "Demandez et l'on vous _____", missingWord: "donnera", hint: "Recevoir quelque chose", options: ["entendra", "donnera", "pardonnera", "aimera"] }, ht: { verse: "Mande epi yo pral _____ ou", missingWord: "ba", hint: "Resevwa yon bagay", options: ["tande", "ba", "padone", "renmen"] }, en: { verse: "Ask and it will be _____ to you", missingWord: "given", hint: "To receive something", options: ["heard", "given", "forgiven", "shown"] } },
  { reference: "Jacques 5:16 / James 5:16", fr: { verse: "La prière fervente du _____ a une grande efficace", missingWord: "juste", hint: "Quelqu'un de droit devant Dieu", options: ["prêtre", "juste", "saint", "pasteur"] }, ht: { verse: "Lapriyè fèvèn yon moun ki _____ gen anpil pouvwa", missingWord: "jis", hint: "Yon moun ki dwat devan Bondye", options: ["prèt", "jis", "sen", "pastè"] }, en: { verse: "The effective prayer of a _____ man accomplishes much", missingWord: "righteous", hint: "Someone upright before God", options: ["holy", "righteous", "faithful", "wise"] } },
  { reference: "Proverbes 9:10 / Proverbs 9:10", fr: { verse: "Le commencement de la sagesse, c'est la crainte de l'_____", missingWord: "Éternel", hint: "Le nom de Dieu", options: ["Éternel", "homme", "ange", "esprit"] }, ht: { verse: "Kòmansman sajès se lakrent _____", missingWord: "Seyè a", hint: "Non Bondye a", options: ["Seyè a", "lèzòm", "zanj", "lespri"] }, en: { verse: "The beginning of wisdom is the fear of the _____", missingWord: "Lord", hint: "The name of God", options: ["Lord", "man", "angel", "spirit"] } },
  { reference: "Jean 14:6 / John 14:6", fr: { verse: "Je suis le chemin, la vérité et la _____", missingWord: "vie", hint: "Le contraire de la mort", options: ["paix", "joie", "vie", "lumière"] }, ht: { verse: "Mwen se chemen an, verite a, ak _____", missingWord: "lavi a", hint: "Sa ki opoze ak lanmò", options: ["lapè", "lajwa", "lavi a", "limyè a"] }, en: { verse: "I am the way, the truth and the _____", missingWord: "life", hint: "The opposite of death", options: ["peace", "joy", "life", "light"] } },
  { reference: "Romains 6:23 / Romans 6:23", fr: { verse: "Car le salaire du péché, c'est la _____", missingWord: "mort", hint: "La fin de la vie terrestre", options: ["mort", "peine", "douleur", "honte"] }, ht: { verse: "Paske salè peche se _____", missingWord: "lanmò", hint: "Fen lavi tèrès la", options: ["lanmò", "pèn", "doulè", "wont"] }, en: { verse: "For the wages of sin is _____", missingWord: "death", hint: "The end of earthly life", options: ["death", "pain", "shame", "loss"] } },
];

const JEU_TF = [
  { answer: true, fr: { question: "Jésus a jeûné 40 jours dans le désert", explication: "Matthieu 4:2 — Jésus a jeûné quarante jours et quarante nuits" }, ht: { question: "Jezi te jene 40 jou nan dezè a", explication: "Matye 4:2 — Jezi te jene karant jou ak karant nwit" }, en: { question: "Jesus fasted for 40 days in the desert", explication: "Matthew 4:2 — Jesus fasted forty days and forty nights" } },
  { answer: true, fr: { question: "La Bible contient 66 livres", explication: "39 dans l'Ancien Testament + 27 dans le Nouveau Testament" }, ht: { question: "Bib la gen 66 liv", explication: "39 nan Ansyen Testaman + 27 nan Nouvo Testaman" }, en: { question: "The Bible contains 66 books", explication: "39 in the Old Testament + 27 in the New Testament" } },
  { answer: false, fr: { question: "David était le fils d'Abraham", explication: "David était le fils de Jessé (1 Samuel 16:1)" }, ht: { question: "David te pitit Abraham", explication: "David te pitit Izayi (1 Samyèl 16:1)" }, en: { question: "David was the son of Abraham", explication: "David was the son of Jesse (1 Samuel 16:1)" } },
  { answer: true, fr: { question: "Le premier miracle de Jésus fut de changer l'eau en vin", explication: "Noces de Cana — Jean 2:1-11" }, ht: { question: "Premye mirak Jezi a se te chanje dlo an diven", explication: "Nòs Kana — Jan 2:1-11" }, en: { question: "Jesus' first miracle was turning water into wine", explication: "Wedding at Cana — John 2:1-11" } },
  { answer: false, fr: { question: "Jonas a été avalé par une baleine", explication: "La Bible dit 'un grand poisson', pas nécessairement une baleine (Jonas 1:17)" }, ht: { question: "Jonas te vale pa yon balèn", explication: "Bib la di 'yon gwo pwason', se pa nesesèman yon balèn (Jonas 1:17)" }, en: { question: "Jonah was swallowed by a whale", explication: "The Bible says 'a great fish', not necessarily a whale (Jonah 1:17)" } },
  { answer: true, fr: { question: "Samson avait 7 tresses dans ses cheveux", explication: "Juges 16:13 mentionne les sept tresses" }, ht: { question: "Sanson te gen 7 nes nan cheve li", explication: "Jij 16:13 mansyone sèt nes yo" }, en: { question: "Samson had 7 braids in his hair", explication: "Judges 16:13 mentions the seven braids" } },
  { answer: true, fr: { question: "Pierre s'appelait Simon avant de rencontrer Jésus", explication: "Simon Bar-Jonas était son nom original (Jean 1:42)" }, ht: { question: "Pyè te rele Simon anvan li te rankontre Jezi", explication: "Simon ba Jona te non l orijinal la (Jan 1:42)" }, en: { question: "Peter was called Simon before meeting Jesus", explication: "Simon Bar-Jonah was his original name (John 1:42)" } },
  { answer: true, fr: { question: "Jean-Baptiste et Jésus étaient cousins", explication: "Élisabeth, mère de Jean, était parente de Marie (Luc 1:36)" }, ht: { question: "Jan Batis ak Jezi te kouzen", explication: "Elizabèt, manman Jan, se te yon paran Mari (Lik 1:36)" }, en: { question: "John the Baptist and Jesus were cousins", explication: "Elizabeth, John's mother, was a relative of Mary (Luke 1:36)" } },
  { answer: false, fr: { question: "Jésus a ressuscité Lazare après 2 jours", explication: "Lazare était mort depuis 4 jours (Jean 11:39)" }, ht: { question: "Jezi te resisite Laza apre 2 jou", explication: "Laza te mouri depi 4 jou (Jan 11:39)" }, en: { question: "Jesus raised Lazarus after 2 days", explication: "Lazarus had been dead for 4 days (John 11:39)" } },
  { answer: true, fr: { question: "Abraham s'appelait d'abord Abram", explication: "Dieu lui a changé le nom en Abraham (Genèse 17:5)" }, ht: { question: "Abraham te rele Abram anvan", explication: "Bondye te chanje non l an Abraham (Jenèz 17:5)" }, en: { question: "Abraham was first called Abram", explication: "God changed his name to Abraham (Genesis 17:5)" } },
];

const JEU_SPEAKERS = [
  { reference: "Jean 14:6 / John 14:6", fr: { quote: "Je suis le chemin, la vérité et la vie", speaker: "Jésus", options: ["Jésus", "Paul", "Jean", "Moïse"] }, ht: { quote: "Mwen se chemen an, verite a ak lavi a", speaker: "Jezi", options: ["Jezi", "Pòl", "Jan", "Moyiz"] }, en: { quote: "I am the way, the truth and the life", speaker: "Jesus", options: ["Jesus", "Paul", "John", "Moses"] } },
  { reference: "1 Samuel 3:10", fr: { quote: "Parle, Seigneur, car ton serviteur écoute", speaker: "Samuel", options: ["Samuel", "Élie", "David", "Ézéchiel"] }, ht: { quote: "Pale, Seyè, paske sèvitè ou ap koute", speaker: "Samyèl", options: ["Samyèl", "Eli", "David", "Ezechyèl"] }, en: { quote: "Speak, Lord, for your servant is listening", speaker: "Samuel", options: ["Samuel", "Elijah", "David", "Ezekiel"] } },
  { reference: "Ruth 1:17 / Rit 1:17", fr: { quote: "Où tu mourras, je mourrai", speaker: "Ruth", options: ["Ruth", "Marie", "Esther", "Rébecca"] }, ht: { quote: "Kote ou mouri, mwen mouri tou", speaker: "Rit", options: ["Rit", "Mari", "Estè", "Rebeka"] }, en: { quote: "Where you die, I will die", speaker: "Ruth", options: ["Ruth", "Mary", "Esther", "Rebecca"] } },
  { reference: "Job 1:21 / Jòb 1:21", fr: { quote: "Le Seigneur a donné, le Seigneur a repris. Que le nom du Seigneur soit béni !", speaker: "Job", options: ["Job", "David", "Salomon", "Abraham"] }, ht: { quote: "Se Seyè a ki te ba, se Seyè a ki pran. Se pou non Seyè a lwanje!", speaker: "Jòb", options: ["Jòb", "David", "Salomon", "Abraham"] }, en: { quote: "The Lord gave, and the Lord has taken away. Blessed be the name of the Lord!", speaker: "Job", options: ["Job", "David", "Solomon", "Abraham"] } },
  { reference: "Philippiens 1:21 / Phil. 1:21", fr: { quote: "Pour moi, vivre c'est Christ, et mourir m'est un gain", speaker: "Paul", options: ["Paul", "Pierre", "Jean", "Jacques"] }, ht: { quote: "Pou mwen, viv se Kris, e mouri se yon pwofi", speaker: "Pòl", options: ["Pòl", "Pyè", "Jan", "Jak"] }, en: { quote: "For to me, to live is Christ and to die is gain", speaker: "Paul", options: ["Paul", "Peter", "John", "James"] } },
  { reference: "Ésaïe 6:8 / Isaiah 6:8", fr: { quote: "Me voici, envoie-moi !", speaker: "Ésaïe", options: ["Ésaïe", "Moïse", "Samuel", "Jérémie"] }, ht: { quote: "Men mwen, voye m!", speaker: "Ezayi", options: ["Ezayi", "Moyiz", "Samyèl", "Jeremi"] }, en: { quote: "Here I am, send me!", speaker: "Isaiah", options: ["Isaiah", "Moses", "Samuel", "Jeremiah"] } },
  { reference: "Matthieu 27:46 / Matthew 27:46", fr: { quote: "Mon Dieu, mon Dieu, pourquoi m'as-tu abandonné ?", speaker: "Jésus", options: ["Jésus", "David", "Job", "Élie"] }, ht: { quote: "Bondye mwen, Bondye mwen, poukisa ou abandone m?", speaker: "Jezi", options: ["Jezi", "David", "Jòb", "Eli"] }, en: { quote: "My God, my God, why have you forsaken me?", speaker: "Jesus", options: ["Jesus", "David", "Job", "Elijah"] } },
  { reference: "Jean 3:30 / John 3:30", fr: { quote: "Il faut que je diminue, mais que lui grandisse", speaker: "Jean-Baptiste", options: ["Jean-Baptiste", "Paul", "André", "Philippe"] }, ht: { quote: "Li dwe grandi, men mwen dwe diminye", speaker: "Jan Batis", options: ["Jan Batis", "Pòl", "Andre", "Filip"] }, en: { quote: "He must increase, but I must decrease", speaker: "John the Baptist", options: ["John the Baptist", "Paul", "Andrew", "Philip"] } },
];

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const client = db();
  const rows: Record<string, unknown>[] = [];

  // Quiz questions
  for (const level of quizLevels) {
    level.questions.forEach((q, idx) => {
      rows.push({ section: "quiz", level_id: level.id, q_index: idx, type: "mcq", data: q, is_active: true });
    });
  }

  // Jeu verse questions
  JEU_VERSES.forEach((q, idx) => {
    rows.push({ section: "jeu", level_id: 1, q_index: idx, type: "verse", data: q, is_active: true });
  });

  // Jeu true/false
  JEU_TF.forEach((q, idx) => {
    rows.push({ section: "jeu", level_id: 2, q_index: idx, type: "tf", data: q, is_active: true });
  });

  // Jeu speakers
  JEU_SPEAKERS.forEach((q, idx) => {
    rows.push({ section: "jeu", level_id: 3, q_index: idx, type: "speaker", data: q, is_active: true });
  });

  // Clear existing and reinsert
  await client.from("game_questions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await client.from("game_questions").insert(rows);
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST106" || error.message?.includes("schema cache")) {
      return NextResponse.json({ error: "TABLE_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, seeded: rows.length });
}
