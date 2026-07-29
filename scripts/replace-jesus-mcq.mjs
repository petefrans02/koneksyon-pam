// Remplace les questions à choix multiples du concours « La Vie de Jésus ».
// Les anciennes revenaient trop souvent : on les change entièrement.
//
// Lancer : node scripts/replace-jesus-mcq.mjs

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const CONTEST = "ac8f379b-0f64-4865-9284-d10c2d832e1c"; // La Vie de Jésus — Les Évangiles

// Raccourci : q(question, [options], bonneRéponse, référence)
// Chaque champ : [fr, ht, en, es]
const L = ([fr, ht, en, es]) => ({ fr, ht, en, es });
const q = (question, options, correct, ref) => ({
  type: "mcq",
  q: L(question),
  options: options.map(L),
  correct,
  ref: L(ref),
});

// ── Manche 1 — Les débuts ────────────────────────────────────────────────────
const R1 = [
  q(["Qui a baptisé Jésus dans le Jourdain ?", "Kilès ki batize Jezi nan Jouden an ?", "Who baptised Jesus in the Jordan?", "¿Quién bautizó a Jesús en el Jordán?"],
    [["Pierre", "Pyè", "Peter", "Pedro"], ["Jean-Baptiste", "Jan Batis", "John the Baptist", "Juan el Bautista"],
     ["Élie", "Eli", "Elijah", "Elías"], ["André", "Andre", "Andrew", "Andrés"]], 1,
    ["Matthieu 3:13", "Matye 3:13", "Matthew 3:13", "Mateo 3:13"]),
  q(["Combien de jours Jésus a-t-il jeûné au désert ?", "Konbyen jou Jezi te jene nan dezè a ?", "How many days did Jesus fast in the wilderness?", "¿Cuántos días ayunó Jesús en el desierto?"],
    [["Sept jours", "Sèt jou", "Seven days", "Siete días"], ["Vingt jours", "Ven jou", "Twenty days", "Veinte días"],
     ["Quarante jours", "Karant jou", "Forty days", "Cuarenta días"], ["Trois jours", "Twa jou", "Three days", "Tres días"]], 2,
    ["Matthieu 4:2", "Matye 4:2", "Matthew 4:2", "Mateo 4:2"]),
  q(["Quel était le métier de Joseph ?", "Ki metye Jozèf te genyen ?", "What was Joseph's trade?", "¿Cuál era el oficio de José?"],
    [["Pêcheur", "Pechè", "Fisherman", "Pescador"], ["Berger", "Gadò mouton", "Shepherd", "Pastor"],
     ["Charpentier", "Chapant", "Carpenter", "Carpintero"], ["Scribe", "Eskrib", "Scribe", "Escriba"]], 2,
    ["Matthieu 13:55", "Matye 13:55", "Matthew 13:55", "Mateo 13:55"]),
  q(["Où Jésus a-t-il grandi ?", "Kote Jezi te grandi ?", "Where did Jesus grow up?", "¿Dónde creció Jesús?"],
    [["À Nazareth", "Nan Nazarèt", "In Nazareth", "En Nazaret"], ["À Bethléem", "Nan Betleyèm", "In Bethlehem", "En Belén"],
     ["À Capernaüm", "Nan Kapènawòm", "In Capernaum", "En Capernaúm"], ["À Jérusalem", "Nan Jerizalèm", "In Jerusalem", "En Jerusalén"]], 0,
    ["Luc 2:39-40", "Lik 2:39-40", "Luke 2:39-40", "Lucas 2:39-40"]),
  q(["Quel âge avait Jésus au temple parmi les docteurs ?", "Ki laj Jezi te genyen nan tanp lan ak doktè yo ?", "How old was Jesus in the temple among the teachers?", "¿Qué edad tenía Jesús en el templo entre los maestros?"],
    [["Sept ans", "Sètan", "Seven", "Siete años"], ["Douze ans", "Douzan", "Twelve", "Doce años"],
     ["Quinze ans", "Kenzan", "Fifteen", "Quince años"], ["Trente ans", "Trantan", "Thirty", "Treinta años"]], 1,
    ["Luc 2:42", "Lik 2:42", "Luke 2:42", "Lucas 2:42"]),
];

// ── Manche 6 — Les miracles ──────────────────────────────────────────────────
const R6 = [
  q(["Quel fut le premier miracle de Jésus ?", "Ki premye mirak Jezi te fè ?", "What was Jesus' first miracle?", "¿Cuál fue el primer milagro de Jesús?"],
    [["Marcher sur l'eau", "Mache sou dlo", "Walking on water", "Caminar sobre el agua"],
     ["Changer l'eau en vin", "Chanje dlo an diven", "Turning water into wine", "Convertir agua en vino"],
     ["Guérir un lépreux", "Geri yon moun ak lèp", "Healing a leper", "Sanar a un leproso"],
     ["Calmer la tempête", "Kalme tanpèt la", "Calming the storm", "Calmar la tormenta"]], 1,
    ["Jean 2:1-11", "Jan 2:1-11", "John 2:1-11", "Juan 2:1-11"]),
  q(["Combien de personnes Jésus a-t-il nourries avec cinq pains ?", "Konbyen moun Jezi te bay manje ak senk pen ?", "How many did Jesus feed with five loaves?", "¿A cuántos alimentó Jesús con cinco panes?"],
    [["Mille hommes", "Mil gason", "One thousand men", "Mil hombres"], ["Trois mille hommes", "Twa mil gason", "Three thousand men", "Tres mil hombres"],
     ["Cinq mille hommes", "Senk mil gason", "Five thousand men", "Cinco mil hombres"], ["Dix mille hommes", "Dis mil gason", "Ten thousand men", "Diez mil hombres"]], 2,
    ["Matthieu 14:21", "Matye 14:21", "Matthew 14:21", "Mateo 14:21"]),
  q(["Qui Jésus a-t-il ressuscité après quatre jours au tombeau ?", "Kilès Jezi te resisite apre kat jou nan tonbo a ?", "Whom did Jesus raise after four days in the tomb?", "¿A quién resucitó Jesús tras cuatro días en la tumba?"],
    [["Lazare", "Laza", "Lazarus", "Lázaro"], ["Jaïrus", "Jayiris", "Jairus", "Jairo"],
     ["Le fils de la veuve", "Pitit vèv la", "The widow's son", "El hijo de la viuda"], ["Nicodème", "Nikodèm", "Nicodemus", "Nicodemo"]], 0,
    ["Jean 11:39-44", "Jan 11:39-44", "John 11:39-44", "Juan 11:39-44"]),
  q(["Sur quelle mer Jésus a-t-il marché ?", "Sou ki lanmè Jezi te mache ?", "On which sea did Jesus walk?", "¿Sobre qué mar caminó Jesús?"],
    [["La mer Rouge", "Lanmè Wouj", "The Red Sea", "El mar Rojo"], ["La mer Morte", "Lanmè Mouri", "The Dead Sea", "El mar Muerto"],
     ["La mer de Galilée", "Lanmè Galile", "The Sea of Galilee", "El mar de Galilea"], ["La Méditerranée", "Meditèrane", "The Mediterranean", "El Mediterráneo"]], 2,
    ["Matthieu 14:25", "Matye 14:25", "Matthew 14:25", "Mateo 14:25"]),
];

// ── Manche 7 — L'enseignement ────────────────────────────────────────────────
const R7 = [
  q(["Sur quelle montagne Jésus a-t-il prononcé les Béatitudes ?", "Sou ki mòn Jezi te bay Beyatitid yo ?", "On which mount did Jesus give the Beatitudes?", "¿En qué monte dio Jesús las Bienaventuranzas?"],
    [["Le mont Sinaï", "Mòn Sinayi", "Mount Sinai", "El monte Sinaí"], ["La montagne, en Galilée", "Mòn nan, nan Galile", "The mountain, in Galilee", "El monte, en Galilea"],
     ["Le mont Carmel", "Mòn Kamèl", "Mount Carmel", "El monte Carmelo"], ["Le mont des Oliviers", "Mòn Oliv", "The Mount of Olives", "El monte de los Olivos"]], 1,
    ["Matthieu 5:1", "Matye 5:1", "Matthew 5:1", "Mateo 5:1"]),
  q(["Que dit Jésus être le plus grand commandement ?", "Kisa Jezi di ki pi gwo kòmandman an ?", "What did Jesus call the greatest commandment?", "¿Cuál dijo Jesús que era el mayor mandamiento?"],
    [["Ne pas voler", "Pa vòlè", "Do not steal", "No robar"], ["Honorer ses parents", "Respekte paran ou", "Honour your parents", "Honrar a los padres"],
     ["Aimer Dieu de tout son cœur", "Renmen Bondye ak tout kè ou", "Love God with all your heart", "Amar a Dios con todo el corazón"],
     ["Observer le sabbat", "Respekte saba a", "Keep the Sabbath", "Guardar el sábado"]], 2,
    ["Matthieu 22:37", "Matye 22:37", "Matthew 22:37", "Mateo 22:37"]),
  q(["Dans la parabole, qui secourt l'homme blessé ?", "Nan parabòl la, kilès ki ede nonm blese a ?", "In the parable, who helps the wounded man?", "En la parábola, ¿quién ayuda al herido?"],
    [["Un prêtre", "Yon prèt", "A priest", "Un sacerdote"], ["Un lévite", "Yon levit", "A Levite", "Un levita"],
     ["Un Samaritain", "Yon Samariten", "A Samaritan", "Un samaritano"], ["Un pharisien", "Yon farizyen", "A Pharisee", "Un fariseo"]], 2,
    ["Luc 10:33", "Lik 10:33", "Luke 10:33", "Lucas 10:33"]),
  q(["Comment Jésus appelle-t-il ses disciples au sujet du monde ?", "Kijan Jezi rele disip li yo parapò ak lemonn ?", "What does Jesus call his disciples in relation to the world?", "¿Cómo llama Jesús a sus discípulos respecto al mundo?"],
    [["Le sel et la lumière", "Sèl ak limyè", "The salt and the light", "La sal y la luz"],
     ["Le pain et le vin", "Pen ak diven", "The bread and the wine", "El pan y el vino"],
     ["Les pierres vivantes", "Wòch vivan", "The living stones", "Las piedras vivas"],
     ["Les serviteurs fidèles", "Sèvitè fidèl", "The faithful servants", "Los siervos fieles"]], 0,
    ["Matthieu 5:13-14", "Matye 5:13-14", "Matthew 5:13-14", "Mateo 5:13-14"]),
  q(["Combien de fois faut-il pardonner, selon Jésus ?", "Konbyen fwa pou nou padone, dapre Jezi ?", "How many times must we forgive, according to Jesus?", "¿Cuántas veces hay que perdonar, según Jesús?"],
    [["Sept fois", "Sèt fwa", "Seven times", "Siete veces"], ["Dix fois", "Dis fwa", "Ten times", "Diez veces"],
     ["Soixante-dix fois sept fois", "Swasanndis fwa sèt fwa", "Seventy times seven", "Setenta veces siete"],
     ["Trois fois", "Twa fwa", "Three times", "Tres veces"]], 2,
    ["Matthieu 18:22", "Matye 18:22", "Matthew 18:22", "Mateo 18:22"]),
];

// ── Manche 9 — La passion et la résurrection ─────────────────────────────────
const R9 = [
  q(["Dans quel jardin Jésus a-t-il prié avant son arrestation ?", "Nan ki jaden Jezi te priye anvan yo arete l ?", "In which garden did Jesus pray before his arrest?", "¿En qué huerto oró Jesús antes de su arresto?"],
    [["Le jardin d'Éden", "Jaden Edenn", "The garden of Eden", "El huerto del Edén"],
     ["Gethsémané", "Jetsemane", "Gethsemane", "Getsemaní"],
     ["Le jardin du roi", "Jaden wa a", "The king's garden", "El huerto del rey"],
     ["Le mont Sion", "Mòn Siyon", "Mount Zion", "El monte Sion"]], 1,
    ["Matthieu 26:36", "Matye 26:36", "Matthew 26:36", "Mateo 26:36"]),
  q(["Qui a renié Jésus trois fois ?", "Kilès ki te di li pa konnen Jezi twa fwa ?", "Who denied Jesus three times?", "¿Quién negó a Jesús tres veces?"],
    [["Judas", "Jida", "Judas", "Judas"], ["Thomas", "Toma", "Thomas", "Tomás"],
     ["Pierre", "Pyè", "Peter", "Pedro"], ["Jacques", "Jak", "James", "Santiago"]], 2,
    ["Luc 22:61", "Lik 22:61", "Luke 22:61", "Lucas 22:61"]),
  q(["Quel gouverneur romain a jugé Jésus ?", "Ki gouvènè women ki te jije Jezi ?", "Which Roman governor tried Jesus?", "¿Qué gobernador romano juzgó a Jesús?"],
    [["Hérode", "Ewòd", "Herod", "Herodes"], ["Ponce Pilate", "Pons Pilat", "Pontius Pilate", "Poncio Pilato"],
     ["César", "Seza", "Caesar", "César"], ["Félix", "Feliks", "Felix", "Félix"]], 1,
    ["Jean 18:33", "Jan 18:33", "John 18:33", "Juan 18:33"]),
  q(["Qui a porté la croix de Jésus sur le chemin ?", "Kilès ki te pote kwa Jezi a sou wout la ?", "Who carried Jesus' cross along the way?", "¿Quién llevó la cruz de Jesús en el camino?"],
    [["Simon de Cyrène", "Simon moun Sirèn", "Simon of Cyrene", "Simón de Cirene"],
     ["Joseph d'Arimathée", "Jozèf moun Arimate", "Joseph of Arimathea", "José de Arimatea"],
     ["Nicodème", "Nikodèm", "Nicodemus", "Nicodemo"], ["Jean", "Jan", "John", "Juan"]], 0,
    ["Marc 15:21", "Mak 15:21", "Mark 15:21", "Marcos 15:21"]),
  q(["Qui a vu Jésus en premier après sa résurrection ?", "Kilès ki te wè Jezi an premye apre rezirèksyon l ?", "Who saw Jesus first after his resurrection?", "¿Quién vio primero a Jesús tras su resurrección?"],
    [["Pierre", "Pyè", "Peter", "Pedro"], ["Marie de Magdala", "Mari, moun Magdala", "Mary Magdalene", "María Magdalena"],
     ["Thomas", "Toma", "Thomas", "Tomás"], ["Les onze disciples", "Onz disip yo", "The eleven disciples", "Los once discípulos"]], 1,
    ["Jean 20:14-16", "Jan 20:14-16", "John 20:14-16", "Juan 20:14-16"]),
];

const NEW = { 1: R1, 6: R6, 7: R7, 9: R9 };

// SAUVEGARDE d'abord : on ne remplace jamais sans filet.
const { data: allRounds } = await db.from("contest_rounds")
  .select("round_number, round_type, questions").eq("contest_id", CONTEST).order("round_number");
const backup = new URL("../backup-jesus-questions.json", import.meta.url);
fs.writeFileSync(backup, JSON.stringify(allRounds, null, 2));
console.log("Sauvegarde des", (allRounds ?? []).length, "manches -> backup-jesus-questions.json");

for (const [round, questions] of Object.entries(NEW)) {
  const { data: r } = await db.from("contest_rounds")
    .select("id, questions").eq("contest_id", CONTEST).eq("round_number", Number(round)).maybeSingle();
  if (!r) { console.log(`  ⚠️  manche ${round} introuvable`); continue; }

  const before = (r.questions ?? []).length;
  const { error } = await db.from("contest_rounds").update({ questions }).eq("id", r.id);
  console.log(error ? `  ❌ manche ${round} : ${error.message}`
                    : `  ✅ manche ${round} : ${before} question(s) remplacée(s) par ${questions.length} nouvelle(s)`);
}
console.log("\nTerminé.");
process.exit(0);
