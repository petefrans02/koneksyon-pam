// Remplace les manches 10 à 14 du concours « La Vie de Jésus ».
// Même méthode que replace-jesus-mcq.mjs : sauvegarde d'abord, versets partout.
//
// Lancer : node scripts/replace-jesus-mcq2.mjs

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const CONTEST = "ac8f379b-0f64-4865-9284-d10c2d832e1c";

const L = ([fr, ht, en, es]) => ({ fr, ht, en, es });
const q = (question, options, correct, ref) => ({
  type: "mcq", q: L(question), options: options.map(L), correct, ref: L(ref),
});

// ── Manche 10 — Les disciples ────────────────────────────────────────────────
const R10 = [
  q(["Combien d'apôtres Jésus a-t-il choisis ?", "Konbyen apot Jezi te chwazi ?", "How many apostles did Jesus choose?", "¿Cuántos apóstoles eligió Jesús?"],
    [["Sept", "Sèt", "Seven", "Siete"], ["Dix", "Dis", "Ten", "Diez"], ["Douze", "Douz", "Twelve", "Doce"], ["Soixante-dix", "Swasanndis", "Seventy", "Setenta"]], 2,
    ["Luc 6:13", "Lik 6:13", "Luke 6:13", "Lucas 6:13"]),
  q(["Quel métier exerçaient Pierre et André ?", "Ki metye Pyè ak Andre te fè ?", "What was the trade of Peter and Andrew?", "¿Cuál era el oficio de Pedro y Andrés?"],
    [["Pêcheurs", "Pechè", "Fishermen", "Pescadores"], ["Charpentiers", "Chapant", "Carpenters", "Carpinteros"],
     ["Bergers", "Gadò mouton", "Shepherds", "Pastores"], ["Collecteurs d'impôts", "Pèseptè", "Tax collectors", "Recaudadores"]], 0,
    ["Matthieu 4:18", "Matye 4:18", "Matthew 4:18", "Mateo 4:18"]),
  q(["Quel disciple était collecteur d'impôts ?", "Ki disip ki te pèseptè ?", "Which disciple was a tax collector?", "¿Qué discípulo era recaudador de impuestos?"],
    [["Philippe", "Filip", "Philip", "Felipe"], ["Matthieu", "Matye", "Matthew", "Mateo"],
     ["Barthélemy", "Batelemi", "Bartholomew", "Bartolomé"], ["Simon le Zélote", "Simon Zelòt", "Simon the Zealot", "Simón el Zelote"]], 1,
    ["Matthieu 9:9", "Matye 9:9", "Matthew 9:9", "Mateo 9:9"]),
  q(["Quel disciple a douté de la résurrection avant de voir ?", "Ki disip ki te doute rezirèksyon an anvan l wè ?", "Which disciple doubted the resurrection before seeing?", "¿Qué discípulo dudó de la resurrección antes de ver?"],
    [["Jacques", "Jak", "James", "Santiago"], ["Jean", "Jan", "John", "Juan"],
     ["Thomas", "Toma", "Thomas", "Tomás"], ["Philippe", "Filip", "Philip", "Felipe"]], 2,
    ["Jean 20:25", "Jan 20:25", "John 20:25", "Juan 20:25"]),
];

// ── Manche 11 — Les paraboles ────────────────────────────────────────────────
const R11 = [
  q(["Dans la parabole du semeur, où la semence porte-t-elle du fruit ?", "Nan parabòl simenè a, kote semans lan bay fwi ?", "In the parable of the sower, where does the seed bear fruit?", "En la parábola del sembrador, ¿dónde da fruto la semilla?"],
    [["Sur le chemin", "Sou wout la", "On the path", "En el camino"], ["Dans les pierres", "Nan wòch yo", "Among the stones", "Entre las piedras"],
     ["Dans les épines", "Nan pikan yo", "Among the thorns", "Entre los espinos"], ["Dans la bonne terre", "Nan bon tè a", "In the good soil", "En la buena tierra"]], 3,
    ["Matthieu 13:8", "Matye 13:8", "Matthew 13:8", "Mateo 13:8"]),
  q(["Que fait le père en voyant revenir le fils prodigue ?", "Kisa papa a fè lè l wè pitit gaspiyè a tounen ?", "What does the father do on seeing the prodigal son return?", "¿Qué hace el padre al ver volver al hijo pródigo?"],
    [["Il court à sa rencontre", "Li kouri al kontre l", "He runs to meet him", "Corre a su encuentro"],
     ["Il le renvoie", "Li voye l ale", "He sends him away", "Lo despide"],
     ["Il le punit", "Li pini l", "He punishes him", "Lo castiga"],
     ["Il l'ignore", "Li pa okipe l", "He ignores him", "Lo ignora"]], 0,
    ["Luc 15:20", "Lik 15:20", "Luke 15:20", "Lucas 15:20"]),
  q(["À quoi Jésus compare-t-il le royaume des cieux dans une parabole ?", "Ak kisa Jezi konpare wayòm syèl la nan yon parabòl ?", "To what does Jesus compare the kingdom of heaven in a parable?", "¿Con qué compara Jesús el reino de los cielos en una parábola?"],
    [["À un lion", "Ak yon lyon", "To a lion", "A un león"], ["À un grain de moutarde", "Ak yon grenn moutad", "To a mustard seed", "A un grano de mostaza"],
     ["À une montagne", "Ak yon mòn", "To a mountain", "A una montaña"], ["À un fleuve", "Ak yon gwo rivyè", "To a river", "A un río"]], 1,
    ["Matthieu 13:31", "Matye 13:31", "Matthew 13:31", "Mateo 13:31"]),
  q(["Combien de brebis le berger laisse-t-il pour chercher celle qui est perdue ?", "Konbyen mouton gadò a kite pou l chèche sa ki pèdi a ?", "How many sheep does the shepherd leave to seek the lost one?", "¿Cuántas ovejas deja el pastor para buscar la perdida?"],
    [["Cinquante", "Senkant", "Fifty", "Cincuenta"], ["Soixante-dix", "Swasanndis", "Seventy", "Setenta"],
     ["Quatre-vingt-dix-neuf", "Katrevendisnèf", "Ninety-nine", "Noventa y nueve"], ["Douze", "Douz", "Twelve", "Doce"]], 2,
    ["Luc 15:4", "Lik 15:4", "Luke 15:4", "Lucas 15:4"]),
  q(["Dans la parabole des talents, que fait le serviteur infidèle ?", "Nan parabòl talan yo, kisa sèvitè enfidèl la fè ?", "In the parable of the talents, what does the unfaithful servant do?", "En la parábola de los talentos, ¿qué hace el siervo infiel?"],
    [["Il double son talent", "Li double talan l", "He doubles his talent", "Duplica su talento"],
     ["Il le donne aux pauvres", "Li bay pòv yo", "He gives it to the poor", "Lo da a los pobres"],
     ["Il l'enfouit dans la terre", "Li antere l anba tè", "He buries it in the ground", "Lo entierra"],
     ["Il le perd", "Li pèdi l", "He loses it", "Lo pierde"]], 2,
    ["Matthieu 25:18", "Matye 25:18", "Matthew 25:18", "Mateo 25:18"]),
];

// ── Manche 12 — Les rencontres ───────────────────────────────────────────────
const R12 = [
  q(["Qui est venu voir Jésus de nuit ?", "Kilès ki te vin wè Jezi lannwit ?", "Who came to see Jesus by night?", "¿Quién vino a ver a Jesús de noche?"],
    [["Nicodème", "Nikodèm", "Nicodemus", "Nicodemo"], ["Zachée", "Zache", "Zacchaeus", "Zaqueo"],
     ["Jaïrus", "Jayiris", "Jairus", "Jairo"], ["Barthélemy", "Batelemi", "Bartholomew", "Bartolomé"]], 0,
    ["Jean 3:2", "Jan 3:2", "John 3:2", "Juan 3:2"]),
  q(["Où Jésus a-t-il rencontré la femme samaritaine ?", "Kote Jezi te rankontre fanm Samariten an ?", "Where did Jesus meet the Samaritan woman?", "¿Dónde encontró Jesús a la mujer samaritana?"],
    [["Au temple", "Nan tanp lan", "At the temple", "En el templo"], ["Au puits de Jacob", "Nan pi Jakòb la", "At Jacob's well", "En el pozo de Jacob"],
     ["Sur la montagne", "Sou mòn nan", "On the mountain", "En el monte"], ["Au marché", "Nan mache a", "At the market", "En el mercado"]], 1,
    ["Jean 4:6", "Jan 4:6", "John 4:6", "Juan 4:6"]),
  q(["Qui est monté sur un sycomore pour voir Jésus ?", "Kilès ki te monte sou yon pye sikomò pou wè Jezi ?", "Who climbed a sycamore tree to see Jesus?", "¿Quién subió a un sicómoro para ver a Jesús?"],
    [["Zachée", "Zache", "Zacchaeus", "Zaqueo"], ["Matthieu", "Matye", "Matthew", "Mateo"],
     ["Simon", "Simon", "Simon", "Simón"], ["Lazare", "Laza", "Lazarus", "Lázaro"]], 0,
    ["Luc 19:4", "Lik 19:4", "Luke 19:4", "Lucas 19:4"]),
  q(["Que demande l'aveugle Bartimée à Jésus ?", "Kisa Batime avèg la mande Jezi ?", "What does blind Bartimaeus ask of Jesus?", "¿Qué le pide el ciego Bartimeo a Jesús?"],
    [["De l'argent", "Lajan", "Money", "Dinero"], ["De recouvrer la vue", "Pou l wè ankò", "To receive his sight", "Recobrar la vista"],
     ["Du pain", "Pen", "Bread", "Pan"], ["Une place au royaume", "Yon plas nan wayòm nan", "A place in the kingdom", "Un lugar en el reino"]], 1,
    ["Marc 10:51", "Mak 10:51", "Mark 10:51", "Marcos 10:51"]),
  q(["Combien de lépreux sont revenus remercier Jésus ?", "Konbyen moun ak lèp ki tounen di Jezi mèsi ?", "How many lepers returned to thank Jesus?", "¿Cuántos leprosos volvieron a dar gracias a Jesús?"],
    [["Aucun", "Okenn", "None", "Ninguno"], ["Un seul", "Yon sèl", "Only one", "Solo uno"],
     ["Cinq", "Senk", "Five", "Cinco"], ["Les dix", "Tout dis yo", "All ten", "Los diez"]], 1,
    ["Luc 17:15", "Lik 17:15", "Luke 17:15", "Lucas 17:15"]),
];

// ── Manche 13 — Les paroles de Jésus ─────────────────────────────────────────
const R13 = [
  q(["Comment Jésus se désigne-t-il face à Thomas ?", "Kijan Jezi rele tèt li devan Toma ?", "How does Jesus describe himself to Thomas?", "¿Cómo se describe Jesús ante Tomás?"],
    [["Le chemin, la vérité et la vie", "Chemen an, verite a ak lavi a", "The way, the truth and the life", "El camino, la verdad y la vida"],
     ["Le roi des rois", "Wa wa yo", "The King of kings", "El Rey de reyes"],
     ["Le rocher", "Wòch la", "The rock", "La roca"], ["Le semeur", "Simenè a", "The sower", "El sembrador"]], 0,
    ["Jean 14:6", "Jan 14:6", "John 14:6", "Juan 14:6"]),
  q(["Que dit Jésus être, en parlant du troupeau ?", "Kisa Jezi di li ye, lè l pale de twoupo a ?", "What does Jesus call himself concerning the flock?", "¿Qué dice Jesús ser respecto al rebaño?"],
    [["Le bon berger", "Bon gadò a", "The good shepherd", "El buen pastor"], ["Le portier", "Gadyen pòt la", "The gatekeeper", "El portero"],
     ["Le maître", "Mèt la", "The master", "El maestro"], ["Le juge", "Jij la", "The judge", "El juez"]], 0,
    ["Jean 10:11", "Jan 10:11", "John 10:11", "Juan 10:11"]),
  q(["Quel signe Jésus donne-t-il de l'amour entre disciples ?", "Ki siy Jezi bay pou lanmou ant disip yo ?", "What sign of love among disciples does Jesus give?", "¿Qué señal de amor entre discípulos da Jesús?"],
    [["Le jeûne", "Jèn", "Fasting", "El ayuno"], ["Les miracles", "Mirak yo", "Miracles", "Los milagros"],
     ["S'aimer les uns les autres", "Youn renmen lòt", "Loving one another", "Amarse unos a otros"], ["La prière publique", "Lapriyè an piblik", "Public prayer", "La oración pública"]], 2,
    ["Jean 13:35", "Jan 13:35", "John 13:35", "Juan 13:35"]),
  q(["Que promet Jésus à ceux qui sont fatigués et chargés ?", "Kisa Jezi pwomèt moun ki fatige e ki chaje ?", "What does Jesus promise the weary and burdened?", "¿Qué promete Jesús a los cansados y cargados?"],
    [["La richesse", "Richès", "Riches", "Riquezas"], ["Le repos", "Repo", "Rest", "Descanso"],
     ["La gloire", "Laglwa", "Glory", "Gloria"], ["Le pouvoir", "Pouvwa", "Power", "Poder"]], 1,
    ["Matthieu 11:28", "Matye 11:28", "Matthew 11:28", "Mateo 11:28"]),
  q(["Que dit Jésus du pain, en parlant de lui-même ?", "Kisa Jezi di sou pen an, lè l pale de li menm ?", "What does Jesus say about bread, speaking of himself?", "¿Qué dice Jesús sobre el pan, hablando de sí mismo?"],
    [["Je suis le pain de vie", "Mwen se pen lavi a", "I am the bread of life", "Yo soy el pan de vida"],
     ["Je suis le vin nouveau", "Mwen se diven nouvo a", "I am the new wine", "Yo soy el vino nuevo"],
     ["Je suis la moisson", "Mwen se rekòt la", "I am the harvest", "Yo soy la cosecha"],
     ["Je suis le levain", "Mwen se ledven an", "I am the leaven", "Yo soy la levadura"]], 0,
    ["Jean 6:35", "Jan 6:35", "John 6:35", "Juan 6:35"]),
];

// ── Manche 14 — Après la résurrection ────────────────────────────────────────
const R14 = [
  q(["Sur quel chemin Jésus est-il apparu à deux disciples ?", "Sou ki wout Jezi te parèt devan de disip ?", "On which road did Jesus appear to two disciples?", "¿En qué camino se apareció Jesús a dos discípulos?"],
    [["Le chemin de Damas", "Wout Damas", "The road to Damascus", "El camino de Damasco"],
     ["Le chemin d'Emmaüs", "Wout Emayis", "The road to Emmaus", "El camino de Emaús"],
     ["Le chemin de Jéricho", "Wout Jeriko", "The road to Jericho", "El camino de Jericó"],
     ["Le chemin de Gaza", "Wout Gaza", "The road to Gaza", "El camino de Gaza"]], 1,
    ["Luc 24:13", "Lik 24:13", "Luke 24:13", "Lucas 24:13"]),
  q(["Que demande Jésus trois fois à Pierre au bord du lac ?", "Kisa Jezi mande Pyè twa fwa bò lak la ?", "What does Jesus ask Peter three times by the lake?", "¿Qué pregunta Jesús tres veces a Pedro junto al lago?"],
    [["M'aimes-tu ?", "Èske ou renmen mwen ?", "Do you love me?", "¿Me amas?"],
     ["Me crains-tu ?", "Èske ou pè mwen ?", "Do you fear me?", "¿Me temes?"],
     ["Me suivras-tu ?", "Èske w ap swiv mwen ?", "Will you follow me?", "¿Me seguirás?"],
     ["Me connais-tu ?", "Èske ou konnen mwen ?", "Do you know me?", "¿Me conoces?"]], 0,
    ["Jean 21:17", "Jan 21:17", "John 21:17", "Juan 21:17"]),
  q(["Quel ordre Jésus donne-t-il avant de monter au ciel ?", "Ki lòd Jezi bay anvan l monte nan syèl la ?", "What command does Jesus give before ascending?", "¿Qué mandato da Jesús antes de ascender?"],
    [["Rester à Jérusalem pour toujours", "Rete Jerizalèm pou tout tan", "Stay in Jerusalem forever", "Quedarse en Jerusalén para siempre"],
     ["Faire de toutes les nations des disciples", "Fè tout nasyon yo tounen disip", "Make disciples of all nations", "Hacer discípulos de todas las naciones"],
     ["Construire un temple", "Bati yon tanp", "Build a temple", "Construir un templo"],
     ["Garder le silence", "Pe bouch nou", "Keep silent", "Guardar silencio"]], 1,
    ["Matthieu 28:19", "Matye 28:19", "Matthew 28:19", "Mateo 28:19"]),
  q(["D'où Jésus est-il monté au ciel ?", "Kote Jezi te monte nan syèl la ?", "From where did Jesus ascend to heaven?", "¿Desde dónde ascendió Jesús al cielo?"],
    [["Du mont des Oliviers", "Sou mòn Oliv", "From the Mount of Olives", "Desde el monte de los Olivos"],
     ["Du temple", "Nan tanp lan", "From the temple", "Desde el templo"],
     ["Du Jourdain", "Nan Jouden an", "From the Jordan", "Desde el Jordán"],
     ["De Nazareth", "Nan Nazarèt", "From Nazareth", "Desde Nazaret"]], 0,
    ["Actes 1:12", "Travay 1:12", "Acts 1:12", "Hechos 1:12"]),
  q(["Que promet Jésus d'envoyer à ses disciples ?", "Kisa Jezi pwomèt pou l voye bay disip li yo ?", "What does Jesus promise to send his disciples?", "¿Qué promete Jesús enviar a sus discípulos?"],
    [["Un ange", "Yon zanj", "An angel", "Un ángel"], ["Le Saint-Esprit", "Sentespri a", "The Holy Spirit", "El Espíritu Santo"],
     ["Un roi", "Yon wa", "A king", "Un rey"], ["Une armée", "Yon lame", "An army", "Un ejército"]], 1,
    ["Luc 24:49", "Lik 24:49", "Luke 24:49", "Lucas 24:49"]),
];

const NEW = { 10: R10, 11: R11, 12: R12, 13: R13, 14: R14 };

// Sauvegarde avant toute modification.
const { data: allRounds } = await db.from("contest_rounds")
  .select("round_number, round_type, questions").eq("contest_id", CONTEST).order("round_number");
fs.writeFileSync(new URL("../backup-jesus-questions-2.json", import.meta.url), JSON.stringify(allRounds, null, 2));
console.log("Sauvegarde des", (allRounds ?? []).length, "manches -> backup-jesus-questions-2.json");

for (const [round, questions] of Object.entries(NEW)) {
  const { data: r } = await db.from("contest_rounds")
    .select("id, questions").eq("contest_id", CONTEST).eq("round_number", Number(round)).maybeSingle();
  if (!r) { console.log(`  ⚠️  manche ${round} introuvable`); continue; }
  const before = (r.questions ?? []).length;
  const { error } = await db.from("contest_rounds").update({ questions }).eq("id", r.id);
  console.log(error ? `  ❌ manche ${round} : ${error.message}`
                    : `  ✅ manche ${round} : ${before} remplacée(s) par ${questions.length}`);
}
console.log("\nTerminé.");
process.exit(0);
