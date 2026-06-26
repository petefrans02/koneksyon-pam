"use client";
import RequireAuth from "@/app/components/RequireAuth";
import { useLang } from "@/lib/LangContext";
import { useState } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LangBlock { verse: string; missingWord: string; hint: string; options: string[]; }
interface VerseChallenge { reference: string; fr: LangBlock; ht: LangBlock; en: LangBlock; }

interface VFBlock { question: string; explication: string; }
interface VraiFauxQ { answer: boolean; fr: VFBlock; ht: VFBlock; en: VFBlock; }

interface SQBlock { quote: string; speaker: string; options: string[]; }
interface SpeakerQ { reference: string; fr: SQBlock; ht: SQBlock; en: SQBlock; }

// ─── Data: Verse Challenges ───────────────────────────────────────────────────
const versesChallenges: VerseChallenge[] = [
  {
    reference: "Jean 3:16 / John 3:16",
    fr: { verse: "Car Dieu a tant aimé le _____ qu'il a donné son Fils unique", missingWord: "monde", hint: "La terre entière", options: ["monde", "peuple", "ciel", "royaume"] },
    ht: { verse: "Paske Bondye sitèlman renmen _____ a pou li ba nou Pitit li a", missingWord: "mond lan", hint: "Tout latè a", options: ["mond lan", "pèp la", "syèl la", "wayòm nan"] },
    en: { verse: "For God so loved the _____ that He gave His only Son", missingWord: "world", hint: "The entire earth", options: ["world", "people", "heaven", "kingdom"] },
  },
  {
    reference: "Psaume 23:1 / Psalm 23:1",
    fr: { verse: "L'Éternel est mon _____ : je ne manquerai de rien", missingWord: "berger", hint: "Celui qui garde les brebis", options: ["roi", "berger", "père", "ami"] },
    ht: { verse: "Seyè a se _____ mwen; mwen p ap manke anyen", missingWord: "gadò", hint: "Moun ki pran swen mouton", options: ["wa", "gadò", "papa", "zanmi"] },
    en: { verse: "The Lord is my _____; I shall not want", missingWord: "shepherd", hint: "One who cares for sheep", options: ["king", "shepherd", "father", "friend"] },
  },
  {
    reference: "Philippiens 4:13 / Phil. 4:13",
    fr: { verse: "Je puis tout par celui qui me _____", missingWord: "fortifie", hint: "Donner de la force", options: ["guide", "aime", "fortifie", "appelle"] },
    ht: { verse: "Mwen kapab fè tout bagay nan Kris ki _____ m fòs", missingWord: "ban", hint: "Bay fòs", options: ["gide", "renmen", "ban", "rele"] },
    en: { verse: "I can do all things through _____ who strengthens me", missingWord: "Him", hint: "Refers to Christ", options: ["God", "Him", "faith", "prayer"] },
  },
  {
    reference: "Ésaïe 41:10 / Isaiah 41:10",
    fr: { verse: "Ne crains point, car je suis avec _____", missingWord: "toi", hint: "La personne qui lit", options: ["eux", "nous", "toi", "lui"] },
    ht: { verse: "Pa pè, paske mwen avèk _____", missingWord: "ou", hint: "Moun k ap li a", options: ["yo", "nou", "ou", "li"] },
    en: { verse: "Fear not, for I am with _____", missingWord: "you", hint: "The person reading this", options: ["them", "us", "you", "him"] },
  },
  {
    reference: "Genèse 1:1 / Genesis 1:1",
    fr: { verse: "Au commencement, Dieu créa les cieux et la _____", missingWord: "terre", hint: "Notre planète", options: ["terre", "mer", "lumière", "vie"] },
    ht: { verse: "Nan kòmansman, Bondye te kreye syèl la ak _____", missingWord: "tè a", hint: "Planèt nou an", options: ["tè a", "lanmè a", "limyè a", "lavi a"] },
    en: { verse: "In the beginning, God created the heavens and the _____", missingWord: "earth", hint: "Our planet", options: ["earth", "sea", "light", "life"] },
  },
  {
    reference: "Matthieu 7:7 / Matthew 7:7",
    fr: { verse: "Demandez et l'on vous _____", missingWord: "donnera", hint: "Recevoir quelque chose", options: ["entendra", "donnera", "pardonnera", "aimera"] },
    ht: { verse: "Mande epi yo pral _____ ou", missingWord: "ba", hint: "Resevwa yon bagay", options: ["tande", "ba", "padone", "renmen"] },
    en: { verse: "Ask and it will be _____ to you", missingWord: "given", hint: "To receive something", options: ["heard", "given", "forgiven", "shown"] },
  },
  {
    reference: "Jacques 5:16 / James 5:16",
    fr: { verse: "La prière fervente du _____ a une grande efficace", missingWord: "juste", hint: "Quelqu'un de droit devant Dieu", options: ["prêtre", "juste", "saint", "pasteur"] },
    ht: { verse: "Lapriyè fèvèn yon moun ki _____ gen anpil pouvwa", missingWord: "jis", hint: "Yon moun ki dwat devan Bondye", options: ["prèt", "jis", "sen", "pastè"] },
    en: { verse: "The effective prayer of a _____ man accomplishes much", missingWord: "righteous", hint: "Someone upright before God", options: ["holy", "righteous", "faithful", "wise"] },
  },
  {
    reference: "Proverbes 9:10 / Proverbs 9:10",
    fr: { verse: "Le commencement de la sagesse, c'est la crainte de l'_____", missingWord: "Éternel", hint: "Le nom de Dieu", options: ["Éternel", "homme", "ange", "esprit"] },
    ht: { verse: "Kòmansman sajès se lakrent _____", missingWord: "Seyè a", hint: "Non Bondye a", options: ["Seyè a", "lèzòm", "zanj", "lespri"] },
    en: { verse: "The beginning of wisdom is the fear of the _____", missingWord: "Lord", hint: "The name of God", options: ["Lord", "man", "angel", "spirit"] },
  },
  {
    reference: "Jean 14:6 / John 14:6",
    fr: { verse: "Je suis le chemin, la vérité et la _____", missingWord: "vie", hint: "Le contraire de la mort", options: ["paix", "joie", "vie", "lumière"] },
    ht: { verse: "Mwen se chemen an, verite a, ak _____", missingWord: "lavi a", hint: "Sa ki opoze ak lanmò", options: ["lapè", "lajwa", "lavi a", "limyè a"] },
    en: { verse: "I am the way, the truth and the _____", missingWord: "life", hint: "The opposite of death", options: ["peace", "joy", "life", "light"] },
  },
  {
    reference: "Matthieu 5:9 / Matthew 5:9",
    fr: { verse: "Heureux les artisans de _____, car ils seront appelés fils de Dieu", missingWord: "paix", hint: "L'absence de conflit", options: ["paix", "justice", "joie", "amour"] },
    ht: { verse: "Benediksyon pou moun ki travay pou _____, yo pral rele yo pitit Bondye", missingWord: "lapè", hint: "Absan konfli", options: ["lapè", "jistis", "lajwa", "lanmou"] },
    en: { verse: "Blessed are the peacemakers, for they shall be called children of _____", missingWord: "God", hint: "The Creator", options: ["God", "men", "angels", "heaven"] },
  },
  {
    reference: "Proverbes 3:5 / Proverbs 3:5",
    fr: { verse: "Confie-toi en l'Éternel de tout ton _____", missingWord: "cœur", hint: "L'organe de l'amour", options: ["esprit", "âme", "cœur", "corps"] },
    ht: { verse: "Mete tout konfyans ou nan Seyè a ak tout _____", missingWord: "kè ou", hint: "Ògan lanmou an", options: ["lespri ou", "nanm ou", "kè ou", "kò ou"] },
    en: { verse: "Trust in the Lord with all your _____", missingWord: "heart", hint: "The organ of love", options: ["mind", "soul", "heart", "strength"] },
  },
  {
    reference: "Romains 6:23 / Romans 6:23",
    fr: { verse: "Car le salaire du péché, c'est la _____", missingWord: "mort", hint: "La fin de la vie terrestre", options: ["mort", "peine", "douleur", "honte"] },
    ht: { verse: "Paske salè peche se _____", missingWord: "lanmò", hint: "Fen lavi tèrès la", options: ["lanmò", "pèn", "doulè", "wont"] },
    en: { verse: "For the wages of sin is _____", missingWord: "death", hint: "The end of earthly life", options: ["death", "pain", "shame", "loss"] },
  },
  {
    reference: "Psaume 91:1 / Psalm 91:1",
    fr: { verse: "Celui qui demeure sous l'abri du _____ repose à l'ombre du Tout-Puissant", missingWord: "Très-Haut", hint: "Le Dieu suprême", options: ["temple", "Très-Haut", "ciel", "rocher"] },
    ht: { verse: "Moun ki rete anba pwoteksyon _____ a pral repoze nan lonbraj Toupisan an", missingWord: "Bondye Trèo", hint: "Bondye sipwèm nan", options: ["tanp", "Bondye Trèo", "syèl", "wòch"] },
    en: { verse: "Whoever dwells in the shelter of the _____ will rest in the shadow of the Almighty", missingWord: "Most High", hint: "The supreme God", options: ["temple", "Most High", "heavens", "Rock"] },
  },
  {
    reference: "Psaume 121:1 / Psalm 121:1",
    fr: { verse: "Je lève mes yeux vers les _____ : d'où me viendra le secours ?", missingWord: "montagnes", hint: "De grandes élévations de terrain", options: ["cieux", "étoiles", "montagnes", "nuages"] },
    ht: { verse: "Mwen leve je m gade _____: kote sèkou m ap soti?", missingWord: "mòn yo", hint: "Gran wotè tè", options: ["syèl la", "zetwal yo", "mòn yo", "nyaj yo"] },
    en: { verse: "I lift up my eyes to the _____—where does my help come from?", missingWord: "mountains", hint: "Great elevations of land", options: ["heavens", "stars", "mountains", "clouds"] },
  },
  {
    reference: "Philippiens 4:6 / Phil. 4:6",
    fr: { verse: "En toute chose, par la prière et la _____, faites connaître vos besoins à Dieu", missingWord: "supplication", hint: "Une prière insistante", options: ["foi", "supplication", "louange", "grâce"] },
    ht: { verse: "Nan tout bagay, pa lapriyè ak _____, fè Bondye konnen sa ou bezwen", missingWord: "siplikasyon", hint: "Yon priyè ensistan", options: ["lafwa", "siplikasyon", "lwanj", "gras"] },
    en: { verse: "In everything, by prayer and _____, let your requests be made known to God", missingWord: "supplication", hint: "An insistent, earnest prayer", options: ["faith", "supplication", "praise", "grace"] },
  },
  {
    reference: "1 Corinthiens 13:4 / 1 Cor. 13:4",
    fr: { verse: "L'amour est patient, il est _____", missingWord: "plein de bonté", hint: "Généreux et doux", options: ["plein de bonté", "fort", "éternel", "pur"] },
    ht: { verse: "Renmen pran pasyans, li _____", missingWord: "jantiy", hint: "Jenerè ak dou", options: ["jantiy", "fò", "etènèl", "pè"] },
    en: { verse: "Love is patient, love is _____", missingWord: "kind", hint: "Generous and gentle", options: ["kind", "strong", "eternal", "pure"] },
  },
  {
    reference: "Deutéronome 31:6 / Deut. 31:6",
    fr: { verse: "Soyez forts et courageux ! Ne vous effrayez pas et ne vous laissez pas _____ devant eux", missingWord: "abattre", hint: "Perdre courage", options: ["perdre", "abattre", "décourager", "trembler"] },
    ht: { verse: "Fò nou fò epi kouraj! Pa pè epi pa _____", missingWord: "dekouraje", hint: "Pèdi kouraj", options: ["pèdi", "dekouraje", "bese tèt", "tranble"] },
    en: { verse: "Be strong and courageous. Do not be _____ or dismayed", missingWord: "afraid", hint: "Feeling fear", options: ["lost", "afraid", "weak", "troubled"] },
  },
  {
    reference: "Éphésiens 2:8 / Ephesians 2:8",
    fr: { verse: "Car c'est par la _____ que vous êtes sauvés", missingWord: "grâce", hint: "Le don gratuit de Dieu", options: ["foi", "grâce", "prière", "loi"] },
    ht: { verse: "Paske se pa _____ nou sove", missingWord: "gras", hint: "Kado gratis Bondye a", options: ["lafwa", "gras", "priyè", "lalwa"] },
    en: { verse: "For it is by _____ you have been saved", missingWord: "grace", hint: "God's free gift", options: ["faith", "grace", "prayer", "law"] },
  },
  {
    reference: "Matthieu 6:33 / Matthew 6:33",
    fr: { verse: "Cherchez premièrement le _____ de Dieu et sa justice", missingWord: "royaume", hint: "Le règne de Dieu", options: ["temple", "amour", "royaume", "chemin"] },
    ht: { verse: "Men chèche premyèman _____ Bondye a ak jistis li", missingWord: "wayòm", hint: "Règ Bondye a", options: ["tanp", "lanmou", "wayòm", "chemen"] },
    en: { verse: "But seek first the _____ of God and His righteousness", missingWord: "kingdom", hint: "God's reign", options: ["temple", "love", "kingdom", "path"] },
  },
  {
    reference: "Psaume 46:1 / Psalm 46:1",
    fr: { verse: "Dieu est notre _____ et notre force", missingWord: "refuge", hint: "Un abri contre le danger", options: ["refuge", "berger", "juge", "père"] },
    ht: { verse: "Bondye se _____ nou ak fòs nou", missingWord: "refij", hint: "Yon abri kont danje", options: ["refij", "gadò", "jij", "papa"] },
    en: { verse: "God is our _____ and strength", missingWord: "refuge", hint: "A shelter against danger", options: ["refuge", "shepherd", "judge", "father"] },
  },
  {
    reference: "Psaume 119:105 / Psalm 119:105",
    fr: { verse: "Tes paroles sont une _____ à mes pieds", missingWord: "lampe", hint: "Source de lumière", options: ["lampe", "épée", "force", "joie"] },
    ht: { verse: "Pawòl ou se yon _____ pou pye m", missingWord: "lantèn", hint: "Sous limyè", options: ["lantèn", "nepe", "fòs", "lajwa"] },
    en: { verse: "Your word is a _____ to my feet", missingWord: "lamp", hint: "A source of light", options: ["lamp", "sword", "strength", "joy"] },
  },
  {
    reference: "Hébreux 13:8 / Hebrews 13:8",
    fr: { verse: "Jésus-Christ est le même hier, aujourd'hui et _____", missingWord: "éternellement", hint: "Pour toujours", options: ["demain", "éternellement", "toujours", "jamais"] },
    ht: { verse: "Jezi Kris la menm yè a, jodi a ak _____", missingWord: "pou tout tan", hint: "Pou tout tan", options: ["demen", "pou tout tan", "toujou", "pa janm"] },
    en: { verse: "Jesus Christ is the same yesterday, today and _____", missingWord: "forever", hint: "For all time", options: ["tomorrow", "forever", "always", "never"] },
  },
  {
    reference: "2 Corinthiens 5:17 / 2 Cor. 5:17",
    fr: { verse: "Si quelqu'un est en Christ, il est une nouvelle _____", missingWord: "création", hint: "Quelque chose de fait à nouveau", options: ["créature", "création", "naissance", "vie"] },
    ht: { verse: "Si yon moun nan Kris, li se yon _____ nouvo", missingWord: "kreyati", hint: "Yon bagay fèt nèf", options: ["kreyati", "nesans", "lavi", "limyè"] },
    en: { verse: "If anyone is in Christ, he is a new _____", missingWord: "creation", hint: "Something made completely new", options: ["creature", "creation", "being", "person"] },
  },
  {
    reference: "Matthieu 18:20 / Matthew 18:20",
    fr: { verse: "Car là où deux ou trois sont assemblés en mon _____, je suis au milieu d'eux", missingWord: "nom", hint: "L'identité de Jésus", options: ["nom", "esprit", "cœur", "amour"] },
    ht: { verse: "Paske kote de oswa twa moun reyini nan _____ mwen, mwen la nan mitan yo", missingWord: "non", hint: "Idantite Jezi a", options: ["non", "lespri", "kè", "lanmou"] },
    en: { verse: "For where two or three gather in my _____, there am I with them", missingWord: "name", hint: "Jesus' identity", options: ["name", "spirit", "heart", "love"] },
  },
  {
    reference: "Nombres 6:24 / Numbers 6:24",
    fr: { verse: "L'Éternel te bénisse et te _____", missingWord: "garde", hint: "Protéger, surveiller", options: ["garde", "guide", "aime", "sauve"] },
    ht: { verse: "Se pou Seyè a beni ou epi _____ ou", missingWord: "pwoteje", hint: "Pwoteje, veye", options: ["pwoteje", "gide", "renmen", "sove"] },
    en: { verse: "The Lord bless you and _____ you", missingWord: "keep", hint: "To protect and watch over", options: ["keep", "guide", "love", "save"] },
  },
];

// ─── Data: True or False ──────────────────────────────────────────────────────
const vraiFauxQuestions: VraiFauxQ[] = [
  { answer: true,
    fr: { question: "Jésus a jeûné 40 jours dans le désert", explication: "Matthieu 4:2 — Jésus a jeûné quarante jours et quarante nuits" },
    ht: { question: "Jezi te jene 40 jou nan dezè a", explication: "Matye 4:2 — Jezi te jene karant jou ak karant nwit" },
    en: { question: "Jesus fasted for 40 days in the desert", explication: "Matthew 4:2 — Jesus fasted forty days and forty nights" } },
  { answer: true,
    fr: { question: "La Bible contient 66 livres", explication: "39 dans l'Ancien Testament + 27 dans le Nouveau Testament" },
    ht: { question: "Bib la gen 66 liv", explication: "39 nan Ansyen Testaman + 27 nan Nouvo Testaman" },
    en: { question: "The Bible contains 66 books", explication: "39 in the Old Testament + 27 in the New Testament" } },
  { answer: false,
    fr: { question: "David était le fils d'Abraham", explication: "David était le fils de Jessé (1 Samuel 16:1)" },
    ht: { question: "David te pitit Abraham", explication: "David te pitit Izayi (1 Samyèl 16:1)" },
    en: { question: "David was the son of Abraham", explication: "David was the son of Jesse (1 Samuel 16:1)" } },
  { answer: true,
    fr: { question: "Le premier miracle de Jésus fut de changer l'eau en vin", explication: "Noces de Cana — Jean 2:1-11" },
    ht: { question: "Premye mirak Jezi a se te chanje dlo an diven", explication: "Nòs Kana — Jan 2:1-11" },
    en: { question: "Jesus' first miracle was turning water into wine", explication: "Wedding at Cana — John 2:1-11" } },
  { answer: false,
    fr: { question: "Jonas a été avalé par une baleine", explication: "La Bible dit 'un grand poisson', pas nécessairement une baleine (Jonas 1:17)" },
    ht: { question: "Jonas te vale pa yon balèn", explication: "Bib la di 'yon gwo pwason', se pa nesesèman yon balèn (Jonas 1:17)" },
    en: { question: "Jonah was swallowed by a whale", explication: "The Bible says 'a great fish', not necessarily a whale (Jonah 1:17)" } },
  { answer: true,
    fr: { question: "Samson avait 7 tresses dans ses cheveux", explication: "Juges 16:13 mentionne les sept tresses" },
    ht: { question: "Sanson te gen 7 nes nan cheve li", explication: "Jij 16:13 mansyone sèt nes yo" },
    en: { question: "Samson had 7 braids in his hair", explication: "Judges 16:13 mentions the seven braids" } },
  { answer: true,
    fr: { question: "Pierre s'appelait Simon avant de rencontrer Jésus", explication: "Simon Bar-Jonas était son nom original (Jean 1:42)" },
    ht: { question: "Pyè te rele Simon anvan li te rankontre Jezi", explication: "Simon ba Jona te non l orijinal la (Jan 1:42)" },
    en: { question: "Peter was called Simon before meeting Jesus", explication: "Simon Bar-Jonah was his original name (John 1:42)" } },
  { answer: true,
    fr: { question: "Jean-Baptiste et Jésus étaient cousins", explication: "Élisabeth, mère de Jean, était parente de Marie (Luc 1:36)" },
    ht: { question: "Jan Batis ak Jezi te kouzen", explication: "Elizabèt, manman Jan, se te yon paran Mari (Lik 1:36)" },
    en: { question: "John the Baptist and Jesus were cousins", explication: "Elizabeth, John's mother, was a relative of Mary (Luke 1:36)" } },
  { answer: true,
    fr: { question: "Salomon avait 700 femmes et 300 concubines", explication: "1 Rois 11:3 le confirme clairement" },
    ht: { question: "Salomon te gen 700 madanm ak 300 mennaj", explication: "1 Wa 11:3 konfime sa klèman" },
    en: { question: "Solomon had 700 wives and 300 concubines", explication: "1 Kings 11:3 confirms this clearly" } },
  { answer: false,
    fr: { question: "Jésus a ressuscité Lazare après 2 jours", explication: "Lazare était mort depuis 4 jours (Jean 11:39)" },
    ht: { question: "Jezi te resisite Laza apre 2 jou", explication: "Laza te mouri depi 4 jou (Jan 11:39)" },
    en: { question: "Jesus raised Lazarus after 2 days", explication: "Lazarus had been dead for 4 days (John 11:39)" } },
  { answer: true,
    fr: { question: "Abraham s'appelait d'abord Abram", explication: "Dieu lui a changé le nom en Abraham (Genèse 17:5)" },
    ht: { question: "Abraham te rele Abram anvan", explication: "Bondye te chanje non l an Abraham (Jenèz 17:5)" },
    en: { question: "Abraham was first called Abram", explication: "God changed his name to Abraham (Genesis 17:5)" } },
  { answer: true,
    fr: { question: "Matthieu était un collecteur d'impôts", explication: "Il était publicain avant de suivre Jésus (Matthieu 9:9)" },
    ht: { question: "Matye te yon kolektè taks", explication: "Li te kolektè taks anvan li te swiv Jezi (Matye 9:9)" },
    en: { question: "Matthew was a tax collector", explication: "He was a tax collector before following Jesus (Matthew 9:9)" } },
  { answer: true,
    fr: { question: "Les 10 commandements ont été donnés au Mont Sinaï", explication: "Exode 20 — Dieu a donné la Loi à Moïse sur le Sinaï" },
    ht: { question: "Bondye te ba Moyiz 10 kòmandman yo sou mòn Sinayi", explication: "Egzòd 20 — Bondye te ba Moyiz Lalwa sou mòn Sinayi" },
    en: { question: "The 10 commandments were given at Mount Sinai", explication: "Exodus 20 — God gave the Law to Moses on Sinai" } },
  { answer: false,
    fr: { question: "Saul (Paul) était de la tribu de Juda", explication: "Paul était de la tribu de Benjamin (Philippiens 3:5)" },
    ht: { question: "Pòl te sòti nan tribi Jida", explication: "Pòl te soti nan tribi Benjamen (Filipyen 3:5)" },
    en: { question: "Saul (Paul) was from the tribe of Judah", explication: "Paul was from the tribe of Benjamin (Philippians 3:5)" } },
  { answer: true,
    fr: { question: "Ruth était Moabite", explication: "Ruth était une femme de Moab (Ruth 1:4)" },
    ht: { question: "Rit te yon fanm Moabis", explication: "Rit te yon fanm soti Moab (Rit 1:4)" },
    en: { question: "Ruth was a Moabite woman", explication: "Ruth was a woman from Moab (Ruth 1:4)" } },
  { answer: true,
    fr: { question: "Adam et Ève vivaient dans le jardin d'Éden", explication: "Genèse 2:8 — Dieu planta un jardin en Éden" },
    ht: { question: "Adan ak Èv te viv nan jaden Edenn nan", explication: "Jenèz 2:8 — Bondye te plante yon jaden nan Edenn" },
    en: { question: "Adam and Eve lived in the Garden of Eden", explication: "Genesis 2:8 — God planted a garden in Eden" } },
  { answer: false,
    fr: { question: "Goliath mesurait exactement 3 mètres", explication: "Il mesurait environ 2.9 m (6 coudées et un palme, 1 Samuel 17:4)" },
    ht: { question: "Golyat te mezire egzakteman 3 mèt", explication: "Li te mezire anviwon 2.9 m (6 koude ak yon pla men, 1 Samyèl 17:4)" },
    en: { question: "Goliath was exactly 3 meters tall", explication: "He was approximately 2.9 m (6 cubits and a span, 1 Samuel 17:4)" } },
  { answer: true,
    fr: { question: "Paul a écrit l'Épître aux Romains", explication: "Romains 1:1 — Paul se présente comme l'auteur" },
    ht: { question: "Pòl te ekri lèt bay Women yo", explication: "Women 1:1 — Pòl prezante tèt li kòm otè a" },
    en: { question: "Paul wrote the Epistle to the Romans", explication: "Romans 1:1 — Paul introduces himself as the author" } },
  { answer: false,
    fr: { question: "L'arche de Noé s'est posée sur le Mont Everest", explication: "L'arche s'est posée sur les monts Ararat (Genèse 8:4)" },
    ht: { question: "Bato Noe a te poze sou mòn Everès", explication: "Bato a te poze sou mòn Ararat yo (Jenèz 8:4)" },
    en: { question: "Noah's ark rested on Mount Everest", explication: "The ark rested on the mountains of Ararat (Genesis 8:4)" } },
  { answer: true,
    fr: { question: "Élie a été emporté au ciel dans un tourbillon de feu", explication: "2 Rois 2:11 — un char de feu et des chevaux de feu" },
    ht: { question: "Eli te pran nan syèl la nan yon toubiyon dife", explication: "2 Wa 2:11 — yon cha dife ak cheval dife" },
    en: { question: "Elijah was taken to heaven in a whirlwind of fire", explication: "2 Kings 2:11 — a chariot of fire and horses of fire" } },
];

// ─── Data: Who Said This ──────────────────────────────────────────────────────
const speakerQuestions: SpeakerQ[] = [
  { reference: "Jean 14:6 / John 14:6",
    fr: { quote: "Je suis le chemin, la vérité et la vie", speaker: "Jésus", options: ["Jésus", "Paul", "Jean", "Moïse"] },
    ht: { quote: "Mwen se chemen an, verite a ak lavi a", speaker: "Jezi", options: ["Jezi", "Pòl", "Jan", "Moyiz"] },
    en: { quote: "I am the way, the truth and the life", speaker: "Jesus", options: ["Jesus", "Paul", "John", "Moses"] } },
  { reference: "1 Samuel 3:10",
    fr: { quote: "Parle, Seigneur, car ton serviteur écoute", speaker: "Samuel", options: ["Samuel", "Élie", "David", "Ézéchiel"] },
    ht: { quote: "Pale, Seyè, paske sèvitè ou ap koute", speaker: "Samyèl", options: ["Samyèl", "Eli", "David", "Ezechyèl"] },
    en: { quote: "Speak, Lord, for your servant is listening", speaker: "Samuel", options: ["Samuel", "Elijah", "David", "Ezekiel"] } },
  { reference: "Ruth 1:17 / Rit 1:17",
    fr: { quote: "Où tu mourras, je mourrai", speaker: "Ruth", options: ["Ruth", "Marie", "Esther", "Rébecca"] },
    ht: { quote: "Kote ou mouri, mwen mouri tou", speaker: "Rit", options: ["Rit", "Mari", "Estè", "Rebeka"] },
    en: { quote: "Where you die, I will die", speaker: "Ruth", options: ["Ruth", "Mary", "Esther", "Rebecca"] } },
  { reference: "Job 1:21 / Jòb 1:21",
    fr: { quote: "Le Seigneur a donné, le Seigneur a repris. Que le nom du Seigneur soit béni !", speaker: "Job", options: ["Job", "David", "Salomon", "Abraham"] },
    ht: { quote: "Se Seyè a ki te ba, se Seyè a ki pran. Se pou non Seyè a lwanje!", speaker: "Jòb", options: ["Jòb", "David", "Salomon", "Abraham"] },
    en: { quote: "The Lord gave, and the Lord has taken away. Blessed be the name of the Lord!", speaker: "Job", options: ["Job", "David", "Solomon", "Abraham"] } },
  { reference: "Philippiens 1:21 / Phil. 1:21",
    fr: { quote: "Pour moi, vivre c'est Christ, et mourir m'est un gain", speaker: "Paul", options: ["Paul", "Pierre", "Jean", "Jacques"] },
    ht: { quote: "Pou mwen, viv se Kris, e mouri se yon pwofi", speaker: "Pòl", options: ["Pòl", "Pyè", "Jan", "Jak"] },
    en: { quote: "For to me, to live is Christ and to die is gain", speaker: "Paul", options: ["Paul", "Peter", "John", "James"] } },
  { reference: "Ésaïe 6:8 / Isaiah 6:8",
    fr: { quote: "Me voici, envoie-moi !", speaker: "Ésaïe", options: ["Ésaïe", "Moïse", "Samuel", "Jérémie"] },
    ht: { quote: "Men mwen, voye m!", speaker: "Ezayi", options: ["Ezayi", "Moyiz", "Samyèl", "Jeremi"] },
    en: { quote: "Here I am, send me!", speaker: "Isaiah", options: ["Isaiah", "Moses", "Samuel", "Jeremiah"] } },
  { reference: "Matthieu 27:46 / Matthew 27:46",
    fr: { quote: "Mon Dieu, mon Dieu, pourquoi m'as-tu abandonné ?", speaker: "Jésus", options: ["Jésus", "David", "Job", "Élie"] },
    ht: { quote: "Bondye mwen, Bondye mwen, poukisa ou abandone m?", speaker: "Jezi", options: ["Jezi", "David", "Jòb", "Eli"] },
    en: { quote: "My God, my God, why have you forsaken me?", speaker: "Jesus", options: ["Jesus", "David", "Job", "Elijah"] } },
  { reference: "Daniel 3:18 / Danyèl 3:18",
    fr: { quote: "Sachez, ô roi, que nous ne servirons pas vos dieux", speaker: "Schadrach, Méschach et Abed-Nego", options: ["Schadrach, Méschach et Abed-Nego", "Daniel", "Esdras", "Néhémie"] },
    ht: { quote: "Konnen, ò wa, nou p ap sèvi dye ou yo", speaker: "Chadrak, Mechak ak Abèdnego", options: ["Chadrak, Mechak ak Abèdnego", "Danyèl", "Esdras", "Nehemi"] },
    en: { quote: "Know, O king, that we will not serve your gods", speaker: "Shadrach, Meshach & Abednego", options: ["Shadrach, Meshach & Abednego", "Daniel", "Ezra", "Nehemiah"] } },
  { reference: "Jean 1:29 / John 1:29",
    fr: { quote: "Voici l'agneau de Dieu, qui ôte le péché du monde", speaker: "Jean-Baptiste", options: ["Jean-Baptiste", "Jean l'apôtre", "Pierre", "André"] },
    ht: { quote: "Men ti mouton Bondye a, ki wete peche mond lan", speaker: "Jan Batis", options: ["Jan Batis", "Jan apòt la", "Pyè", "Andre"] },
    en: { quote: "Behold, the Lamb of God who takes away the sin of the world", speaker: "John the Baptist", options: ["John the Baptist", "John the apostle", "Peter", "Andrew"] } },
  { reference: "Matthieu 8:2 / Matthew 8:2",
    fr: { quote: "Seigneur, si tu veux, tu peux me rendre pur", speaker: "Un lépreux", options: ["Un lépreux", "Pierre", "Lazare", "Nicodème"] },
    ht: { quote: "Seyè, si ou vle, ou kapab fè m vin pwòp", speaker: "Yon malad ladrès", options: ["Yon malad ladrès", "Pyè", "Laza", "Nikodèm"] },
    en: { quote: "Lord, if you are willing, you can make me clean", speaker: "A leper", options: ["A leper", "Peter", "Lazarus", "Nicodemus"] } },
  { reference: "Jean 3:30 / John 3:30",
    fr: { quote: "Il faut que je diminue, mais que lui grandisse", speaker: "Jean-Baptiste", options: ["Jean-Baptiste", "Paul", "André", "Philippe"] },
    ht: { quote: "Li dwe grandi, men mwen dwe diminye", speaker: "Jan Batis", options: ["Jan Batis", "Pòl", "Andre", "Filip"] },
    en: { quote: "He must increase, but I must decrease", speaker: "John the Baptist", options: ["John the Baptist", "Paul", "Andrew", "Philip"] } },
  { reference: "Psaume 103:17 / Psalm 103:17",
    fr: { quote: "La faveur de l'Éternel est sur ceux qui le craignent", speaker: "David", options: ["David", "Salomon", "Asaph", "Moïse"] },
    ht: { quote: "Favè Seyè a sou moun ki gen krentif pou li", speaker: "David", options: ["David", "Salomon", "Asaf", "Moyiz"] },
    en: { quote: "The favor of the Lord is upon those who fear Him", speaker: "David", options: ["David", "Solomon", "Asaph", "Moses"] } },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
type Lang = "fr" | "ht" | "en";

// ─── i18n UI strings ──────────────────────────────────────────────────────────
function t(key: string, lang: string): string {
  const map: Record<string, Record<string, string>> = {
    back:       { fr: "← Jeux",             ht: "← Jwèt",            en: "← Games" },
    replay:     { fr: "Rejouer",             ht: "Rejwe",             en: "Play again" },
    correct:    { fr: "✓ Correct !",         ht: "✓ Kòrèk !",        en: "✓ Correct!" },
    wrong:      { fr: "✗ C'était :",         ht: "✗ Se te :",         en: "✗ It was:" },
    nextVerse:  { fr: "Verset suivant →",    ht: "Vèsè swivan →",    en: "Next verse →" },
    nextQ:      { fr: "Question suivante →", ht: "Kesyon swivan →",   en: "Next question →" },
    result:     { fr: "Voir le résultat ★",  ht: "Wè rezilta ★",     en: "See result ★" },
    excellent:  { fr: "Excellent !",         ht: "Ekselan !",         en: "Excellent!" },
    wellDone:   { fr: "Bien joué !",         ht: "Byen jwe !",        en: "Well done!" },
    keepGoing:  { fr: "Continue !",          ht: "Kontinye !",        en: "Keep going!" },
    correctPct: { fr: "de bonnes réponses",  ht: "bon repons",        en: "correct" },
    bestStreak: { fr: "Meilleure série :",   ht: "Miyò seri :",       en: "Best streak:" },
    hint:       { fr: "Indice :",            ht: "Konsèy :",          en: "Hint:" },
    trueBtn:    { fr: "✅ VRAI",             ht: "✅ VRE",            en: "✅ TRUE" },
    falseBtn:   { fr: "❌ FAUX",             ht: "❌ FO",             en: "❌ FALSE" },
    whoSaid:    { fr: "Qui a dit ça ?",      ht: "Ki moun ki di sa ?", en: "Who said this?" },
  };
  return map[key]?.[lang] ?? map[key]?.["fr"] ?? key;
}

function ScoreScreen({ pct, score, total, bestStreak, lang, onBack, onReplay }: {
  pct: number; score: number; total: number; bestStreak?: number;
  lang: string; onBack: () => void; onReplay: () => void;
}) {
  const msg = pct >= 80 ? t("excellent", lang) : pct >= 50 ? t("wellDone", lang) : t("keepGoing", lang);
  return (
    <div className="text-center py-10">
      <span className="text-6xl block mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "⭐" : "💪"}</span>
      <h2 className="text-2xl font-bold text-stone-900 mb-2">{msg}</h2>
      <div className="text-5xl font-black text-blue-600 my-4">{score}/{total}</div>
      <p className="text-stone-500 mb-1">{pct}% {t("correctPct", lang)}</p>
      {bestStreak !== undefined && <p className="text-amber-600 font-medium mb-6">🔥 {t("bestStreak", lang)} {bestStreak}</p>}
      <div className="flex justify-center gap-3 mt-6">
        <button onClick={onBack} className="bg-stone-100 text-stone-600 px-6 py-3 rounded-full font-medium hover:bg-stone-200">{t("back", lang)}</button>
        <button onClick={onReplay} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-bold hover:opacity-90">{t("replay", lang)}</button>
      </div>
    </div>
  );
}

// ─── Game 1: Guess the Verse ───────────────────────────────────────────────────
function DevineVerset({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [shuffled] = useState(() => shuffle(versesChallenges));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [shuffledOpts, setShuffledOpts] = useState<string[]>(() => shuffle(shuffled[0][lang].options));

  const ch = shuffled[idx];
  const c = ch[lang];

  function pick(word: string) {
    if (selected) return;
    setSelected(word);
    if (word === c.missingWord) {
      setScore(s => s + 1);
      const ns = streak + 1; setStreak(ns);
      if (ns > bestStreak) setBestStreak(ns);
    } else setStreak(0);
  }

  function next() {
    const ni = idx + 1;
    if (ni >= shuffled.length) { setDone(true); return; }
    setIdx(ni); setSelected(null);
    setShuffledOpts(shuffle(shuffled[ni][lang].options));
  }

  if (done) {
    const pct = Math.round((score / shuffled.length) * 100);
    return <ScoreScreen pct={pct} score={score} total={shuffled.length} bestStreak={bestStreak} lang={lang}
      onBack={onBack} onReplay={() => { setIdx(0); setSelected(null); setScore(0); setStreak(0); setBestStreak(0); setDone(false); setShuffledOpts(shuffle(shuffled[0][lang].options)); }} />;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-blue-500 text-sm hover:underline">{t("back", lang)}</button>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{idx + 1}/{shuffled.length}</span>
        {streak >= 3 && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold animate-pulse">🔥 {streak}</span>}
        <span className="ml-auto text-sm font-bold text-stone-500">{score} ✓</span>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / shuffled.length) * 100}%` }} />
      </div>
      <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm mb-6">
        <p className="text-xl leading-relaxed text-stone-800 text-center font-medium">
          {c.verse.split("_____").map((part, i, arr) => (
            <span key={i}>{part}{i < arr.length - 1 && (
              <span className={`inline-block mx-1 px-3 py-1 rounded-lg font-bold ${selected === c.missingWord ? "bg-green-100 text-green-700" : selected ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-600 animate-pulse"}`}>
                {selected ? c.missingWord : "???"}
              </span>
            )}</span>
          ))}
        </p>
        <p className="text-center text-blue-500 text-sm mt-4 font-medium">📖 {ch.reference}</p>
        {!selected && <p className="text-center text-stone-400 text-xs mt-2">💡 {t("hint", lang)} {c.hint}</p>}
      </div>
      {!selected ? (
        <div className="grid grid-cols-2 gap-3">
          {shuffledOpts.map((opt) => (
            <button key={opt} onClick={() => pick(opt)} className="bg-white border-2 border-stone-200 rounded-xl py-4 px-4 text-center font-medium text-stone-800 hover:border-blue-400 hover:bg-blue-50 transition-all">{opt}</button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className={`inline-block px-6 py-3 rounded-xl font-bold text-lg mb-4 ${selected === c.missingWord ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {selected === c.missingWord ? t("correct", lang) : `${t("wrong", lang)} ${c.missingWord}`}
          </div>
          <button onClick={next} className="block mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90">
            {idx + 1 >= shuffled.length ? t("result", lang) : t("nextVerse", lang)}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Game 2: True or False ─────────────────────────────────────────────────────
function VraiFaux({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [shuffled] = useState(() => shuffle(vraiFauxQuestions));
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = shuffled[idx];
  const c = q[lang];

  function pick(val: boolean) {
    if (chosen !== null) return;
    setChosen(val);
    if (val === q.answer) setScore(s => s + 1);
  }

  function next() {
    if (idx + 1 >= shuffled.length) { setDone(true); return; }
    setIdx(idx + 1); setChosen(null);
  }

  if (done) {
    const pct = Math.round((score / shuffled.length) * 100);
    return <ScoreScreen pct={pct} score={score} total={shuffled.length} lang={lang}
      onBack={onBack} onReplay={() => { setIdx(0); setChosen(null); setScore(0); setDone(false); }} />;
  }

  const trueLabel = t("trueBtn", lang).replace(/[✅❌]\s*/, "");
  const falseLabel = t("falseBtn", lang).replace(/[✅❌]\s*/, "");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-blue-500 text-sm hover:underline">{t("back", lang)}</button>
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">{idx + 1}/{shuffled.length}</span>
        <span className="ml-auto text-sm font-bold text-stone-500">{score} ✓</span>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / shuffled.length) * 100}%` }} />
      </div>
      <div className="bg-white rounded-2xl border border-purple-100 p-8 shadow-sm mb-6 text-center">
        <p className="text-xl font-semibold text-stone-800 leading-relaxed">{c.question}</p>
      </div>
      {chosen === null ? (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => pick(true)} className="bg-green-500 hover:bg-green-400 text-white py-6 rounded-2xl text-2xl font-black transition-all hover:scale-105 shadow-lg shadow-green-200">{t("trueBtn", lang)}</button>
          <button onClick={() => pick(false)} className="bg-red-500 hover:bg-red-400 text-white py-6 rounded-2xl text-2xl font-black transition-all hover:scale-105 shadow-lg shadow-red-200">{t("falseBtn", lang)}</button>
        </div>
      ) : (
        <div className="text-center">
          <div className={`rounded-2xl p-5 mb-4 ${chosen === q.answer ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <p className={`font-bold text-lg mb-2 ${chosen === q.answer ? "text-green-700" : "text-red-700"}`}>
              {chosen === q.answer ? t("correct", lang) : `${t("wrong", lang)} ${q.answer ? trueLabel : falseLabel}`}
            </p>
            <p className="text-stone-600 text-sm">📖 {c.explication}</p>
          </div>
          <button onClick={next} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90">
            {idx + 1 >= shuffled.length ? t("result", lang) : t("nextQ", lang)}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Game 3: Who Said This ─────────────────────────────────────────────────────
function QuiADit({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [shuffled] = useState(() => shuffle(speakerQuestions));
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [shuffledOpts, setShuffledOpts] = useState<string[]>(() => shuffle(shuffled[0][lang].options));

  const q = shuffled[idx];
  const c = q[lang];

  function pick(opt: string) {
    if (chosen) return;
    setChosen(opt);
    if (opt === c.speaker) setScore(s => s + 1);
  }

  function next() {
    const ni = idx + 1;
    if (ni >= shuffled.length) { setDone(true); return; }
    setIdx(ni); setChosen(null);
    setShuffledOpts(shuffle(shuffled[ni][lang].options));
  }

  if (done) {
    const pct = Math.round((score / shuffled.length) * 100);
    return <ScoreScreen pct={pct} score={score} total={shuffled.length} lang={lang}
      onBack={onBack} onReplay={() => { setIdx(0); setChosen(null); setScore(0); setDone(false); setShuffledOpts(shuffle(shuffled[0][lang].options)); }} />;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-blue-500 text-sm hover:underline">{t("back", lang)}</button>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">{idx + 1}/{shuffled.length}</span>
        <span className="ml-auto text-sm font-bold text-stone-500">{score} ✓</span>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / shuffled.length) * 100}%` }} />
      </div>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-8 shadow-sm mb-6 text-center">
        <p className="text-xs text-amber-600 font-bold mb-3 uppercase tracking-widest">{t("whoSaid", lang)}</p>
        <p className="text-xl font-semibold text-stone-800 italic leading-relaxed">&ldquo;{c.quote}&rdquo;</p>
        <p className="text-sm text-amber-600 mt-3">📖 {q.reference}</p>
      </div>
      {!chosen ? (
        <div className="grid grid-cols-2 gap-3">
          {shuffledOpts.map((opt) => (
            <button key={opt} onClick={() => pick(opt)} className="bg-white border-2 border-stone-200 rounded-xl py-4 px-3 text-center font-medium text-stone-800 hover:border-amber-400 hover:bg-amber-50 transition-all text-sm">{opt}</button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className={`rounded-2xl p-5 mb-4 ${chosen === c.speaker ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <p className={`font-bold text-lg mb-1 ${chosen === c.speaker ? "text-green-700" : "text-red-700"}`}>
              {chosen === c.speaker ? t("correct", lang) : `${t("wrong", lang)} ${c.speaker}`}
            </p>
          </div>
          <button onClick={next} className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90">
            {idx + 1 >= shuffled.length ? t("result", lang) : t("nextQ", lang)}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Hub ──────────────────────────────────────────────────────────────────────
type GameMode = null | "devine" | "vraifaux" | "speaker";

export default function JeuPage() {
  const { lang } = useLang();
  const [mode, setMode] = useState<GameMode>(null);
  const safeLang = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;

  const games = [
    {
      id: "devine" as GameMode,
      icon: "🎯", color: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50", border: "border-blue-200",
      title: lang === "fr" ? "Devine le Verset" : lang === "ht" ? "Devine Vèsè a" : "Guess the Verse",
      desc: lang === "fr" ? "Trouvez le mot manquant dans 25 versets bibliques. Construisez votre série !"
          : lang === "ht" ? "Jwenn mo ki manke nan 25 vèsè biblik. Bati seri ou !"
          : "Find the missing word in 25 Bible verses. Build your streak!",
      count: `${versesChallenges.length} ${lang === "en" ? "verses" : lang === "ht" ? "vèsè" : "versets"}`,
    },
    {
      id: "vraifaux" as GameMode,
      icon: "🃏", color: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50", border: "border-purple-200",
      title: lang === "fr" ? "Vrai ou Faux ?" : lang === "ht" ? "Vre oswa Fo ?" : "True or False?",
      desc: lang === "fr" ? "20 affirmations bibliques — vrai ou faux ? Testez vos connaissances !"
          : lang === "ht" ? "20 afirmasyon biblik — vre oswa fo ? Teste konesans ou !"
          : "20 Bible statements — true or false? Test your knowledge!",
      count: `${vraiFauxQuestions.length} ${lang === "en" ? "questions" : lang === "ht" ? "kesyon" : "questions"}`,
    },
    {
      id: "speaker" as GameMode,
      icon: "👤", color: "from-amber-400 to-orange-500", bg: "from-amber-50 to-orange-50", border: "border-amber-200",
      title: lang === "fr" ? "Qui a dit ça ?" : lang === "ht" ? "Ki moun ki di sa ?" : "Who said this?",
      desc: lang === "fr" ? "Identifiez l'auteur de ces paroles bibliques célèbres."
          : lang === "ht" ? "Idantifye otè pawòl biblik sa yo."
          : "Identify who said these famous biblical words.",
      count: `${speakerQuestions.length} ${lang === "en" ? "quotes" : lang === "ht" ? "sitasyon" : "citations"}`,
    },
  ];

  return (
    <RequireAuth>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {mode === null && (
          <>
            <div className="text-center mb-8">
              <span className="text-5xl block mb-3">🎮</span>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">
                {lang === "fr" ? "Jeux Bibliques" : lang === "ht" ? "Jwèt Biblik" : "Bible Games"}
              </h1>
              <p className="text-stone-500">
                {lang === "fr" ? "Choisissez un jeu et testez votre connaissance de la Bible !"
                : lang === "ht" ? "Chwazi yon jwèt epi teste konesans ou sou Bib la !"
                : "Choose a game and test your Bible knowledge!"}
              </p>
              <Link href="/quiz" className="inline-flex items-center gap-2 mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                🏆 {lang === "fr" ? "Essayez aussi le Quiz Biblique" : lang === "ht" ? "Eseye Quiz Biblik la tou" : "Also try the Bible Quiz"} →
              </Link>
            </div>
            <div className="grid gap-4">
              {games.map((g) => (
                <button key={g.id} onClick={() => setMode(g.id)}
                  className={`bg-gradient-to-br ${g.bg} border ${g.border} rounded-2xl p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group w-full`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${g.color} rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>{g.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-stone-900">{g.title}</h3>
                        <span className="text-xs bg-white/70 text-stone-500 px-2 py-0.5 rounded-full">{g.count}</span>
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed">{g.desc}</p>
                    </div>
                    <span className="text-stone-400 text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        {mode === "devine"   && <DevineVerset lang={safeLang} onBack={() => setMode(null)} />}
        {mode === "vraifaux" && <VraiFaux     lang={safeLang} onBack={() => setMode(null)} />}
        {mode === "speaker"  && <QuiADit      lang={safeLang} onBack={() => setMode(null)} />}
      </div>
    </RequireAuth>
  );
}
