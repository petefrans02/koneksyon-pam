// Renouvelle les questions à choix multiples du concours « Le Livre de Daniel ».
//
// S'ADAPTE à la structure existante : le script lit les manches de type « mcq »,
// puis les remplit avec le nombre exact de questions qu'elles contenaient.
// Rien d'autre n'est touché, et tout est sauvegardé avant.
//
// Lancer : node scripts/replace-daniel-mcq.mjs

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const CONTEST = "8279a1f8-8492-4674-b95a-5b131267b2f4"; // Le Livre de Daniel — Foi sous Pression

const L = ([fr, ht, en, es]) => ({ fr, ht, en, es });
const q = (question, options, correct, ref) => ({
  type: "mcq", q: L(question), options: options.map(L), correct, ref: L(ref),
});

// Réserve de questions : elles seront distribuées dans l'ordre entre les manches.
const POOL = [
  q(["Dans quel royaume Daniel fut-il emmené captif ?", "Nan ki wayòm yo te mennen Danyèl kaptif ?", "To which kingdom was Daniel taken captive?", "¿A qué reino fue llevado cautivo Daniel?"],
    [["L'Égypte", "Lejip", "Egypt", "Egipto"], ["Babylone", "Babilòn", "Babylon", "Babilonia"],
     ["La Perse", "Pès", "Persia", "Persia"], ["Rome", "Wòm", "Rome", "Roma"]], 1,
    ["Daniel 1:1", "Danyèl 1:1", "Daniel 1:1", "Daniel 1:1"]),
  q(["Que Daniel a-t-il refusé de manger à la cour du roi ?", "Kisa Danyèl te refize manje nan palè wa a ?", "What did Daniel refuse to eat at the king's court?", "¿Qué se negó a comer Daniel en la corte del rey?"],
    [["Les mets du roi", "Manje wa a", "The king's food", "Los manjares del rey"],
     ["Le pain sans levain", "Pen san ledven", "Unleavened bread", "El pan sin levadura"],
     ["Les fruits du jardin", "Fwi jaden an", "The garden fruit", "Las frutas del huerto"],
     ["Le poisson", "Pwason", "Fish", "El pescado"]], 0,
    ["Daniel 1:8", "Danyèl 1:8", "Daniel 1:8", "Daniel 1:8"]),
  q(["Quels étaient les trois compagnons de Daniel ?", "Kilès ki te twa konpayon Danyèl yo ?", "Who were Daniel's three companions?", "¿Quiénes eran los tres compañeros de Daniel?"],
    [["Pierre, Jacques et Jean", "Pyè, Jak ak Jan", "Peter, James and John", "Pedro, Santiago y Juan"],
     ["Schadrac, Méschac et Abed-Nego", "Chadrak, Mechak ak Abèdnego", "Shadrach, Meshach and Abednego", "Sadrac, Mesac y Abed-nego"],
     ["Esdras, Néhémie et Josué", "Esdras, Neyemi ak Jozye", "Ezra, Nehemiah and Joshua", "Esdras, Nehemías y Josué"],
     ["Saül, David et Salomon", "Sayil, David ak Salomon", "Saul, David and Solomon", "Saúl, David y Salomón"]], 1,
    ["Daniel 1:7", "Danyèl 1:7", "Daniel 1:7", "Daniel 1:7"]),
  q(["Qu'a vu Nebucadnetsar dans son rêve, fait de plusieurs métaux ?", "Kisa Nebikadneza te wè nan rèv li, ki te fèt ak plizyè metal ?", "What did Nebuchadnezzar see in his dream, made of several metals?", "¿Qué vio Nabucodonosor en su sueño, hecho de varios metales?"],
    [["Une statue", "Yon estati", "A statue", "Una estatua"], ["Un arbre", "Yon pyebwa", "A tree", "Un árbol"],
     ["Une montagne", "Yon mòn", "A mountain", "Una montaña"], ["Un trône", "Yon twòn", "A throne", "Un trono"]], 0,
    ["Daniel 2:31", "Danyèl 2:31", "Daniel 2:31", "Daniel 2:31"]),
  q(["De quoi était faite la tête de la statue du rêve ?", "Ak kisa tèt estati nan rèv la te fèt ?", "What was the head of the dream statue made of?", "¿De qué estaba hecha la cabeza de la estatua del sueño?"],
    [["D'argent", "Ann ajan", "Of silver", "De plata"], ["De bronze", "An kwiv", "Of bronze", "De bronce"],
     ["D'or pur", "Ann lò pi", "Of pure gold", "De oro puro"], ["De fer", "An fè", "Of iron", "De hierro"]], 2,
    ["Daniel 2:32", "Danyèl 2:32", "Daniel 2:32", "Daniel 2:32"]),
  q(["Dans quoi les trois compagnons furent-ils jetés ?", "Nan kisa yo te jete twa konpayon yo ?", "Into what were the three companions thrown?", "¿A dónde fueron arrojados los tres compañeros?"],
    [["Dans la fosse aux lions", "Nan twou lyon yo", "Into the lions' den", "Al foso de los leones"],
     ["Dans la fournaise ardente", "Nan gwo dife a", "Into the fiery furnace", "Al horno de fuego"],
     ["Dans la mer", "Nan lanmè a", "Into the sea", "Al mar"], ["En prison", "Nan prizon", "Into prison", "A la cárcel"]], 1,
    ["Daniel 3:21", "Danyèl 3:21", "Daniel 3:21", "Daniel 3:21"]),
  q(["Combien d'hommes le roi a-t-il vus dans la fournaise ?", "Konbyen moun wa a te wè nan gwo dife a ?", "How many men did the king see in the furnace?", "¿Cuántos hombres vio el rey en el horno?"],
    [["Trois", "Twa", "Three", "Tres"], ["Quatre", "Kat", "Four", "Cuatro"],
     ["Cinq", "Senk", "Five", "Cinco"], ["Sept", "Sèt", "Seven", "Siete"]], 1,
    ["Daniel 3:25", "Danyèl 3:25", "Daniel 3:25", "Daniel 3:25"]),
  q(["Que devint Nebucadnetsar à cause de son orgueil ?", "Kisa ki rive Nebikadneza poutèt ògèy li ?", "What became of Nebuchadnezzar because of his pride?", "¿Qué le pasó a Nabucodonosor por su orgullo?"],
    [["Il perdit son trône pour toujours", "Li pèdi twòn li pou tout tan", "He lost his throne forever", "Perdió su trono para siempre"],
     ["Il vécut comme les bêtes des champs", "Li viv tankou bèt nan savann", "He lived like the beasts of the field", "Vivió como las bestias del campo"],
     ["Il fut exilé", "Yo egzile l", "He was exiled", "Fue exiliado"],
     ["Il devint aveugle", "Li vin avèg", "He became blind", "Quedó ciego"]], 1,
    ["Daniel 4:33", "Danyèl 4:33", "Daniel 4:33", "Daniel 4:33"]),
  q(["Quelle main a écrit sur le mur pendant le festin de Belschatsar ?", "Ki men ki te ekri sou mi an pandan fèt Bèlchaza a ?", "What wrote on the wall during Belshazzar's feast?", "¿Qué escribió en la pared durante el banquete de Belsasar?"],
    [["Une main d'homme", "Yon men moun", "A man's hand", "Una mano de hombre"],
     ["Un ange visible", "Yon zanj ki parèt", "A visible angel", "Un ángel visible"],
     ["Un prophète", "Yon pwofèt", "A prophet", "Un profeta"], ["Le roi lui-même", "Wa a li menm", "The king himself", "El rey mismo"]], 0,
    ["Daniel 5:5", "Danyèl 5:5", "Daniel 5:5", "Daniel 5:5"]),
  q(["Quels mots furent écrits sur le mur ?", "Ki mo ki te ekri sou mi an ?", "What words were written on the wall?", "¿Qué palabras se escribieron en la pared?"],
    [["Alpha et Oméga", "Alfa ak Omega", "Alpha and Omega", "Alfa y Omega"],
     ["Mené, Mené, Thekel, Upharsin", "Mene, Mene, Tekèl, Oufasin", "Mene, Mene, Tekel, Upharsin", "Mene, Mene, Tekel, Upharsin"],
     ["Saint, Saint, Saint", "Sen, Sen, Sen", "Holy, Holy, Holy", "Santo, Santo, Santo"],
     ["Paix sur la maison", "Lapè sou kay la", "Peace on the house", "Paz sobre la casa"]], 1,
    ["Daniel 5:25", "Danyèl 5:25", "Daniel 5:25", "Daniel 5:25"]),
  q(["Combien de fois par jour Daniel priait-il ?", "Konbyen fwa pa jou Danyèl te priye ?", "How many times a day did Daniel pray?", "¿Cuántas veces al día oraba Daniel?"],
    [["Une fois", "Yon fwa", "Once", "Una vez"], ["Deux fois", "De fwa", "Twice", "Dos veces"],
     ["Trois fois", "Twa fwa", "Three times", "Tres veces"], ["Sept fois", "Sèt fwa", "Seven times", "Siete veces"]], 2,
    ["Daniel 6:10", "Danyèl 6:10", "Daniel 6:10", "Daniel 6:10"]),
  q(["Vers quelle ville Daniel se tournait-il pour prier ?", "Nan direksyon ki vil Danyèl te vire pou l priye ?", "Toward which city did Daniel turn to pray?", "¿Hacia qué ciudad se volvía Daniel para orar?"],
    [["Babylone", "Babilòn", "Babylon", "Babilonia"], ["Jérusalem", "Jerizalèm", "Jerusalem", "Jerusalén"],
     ["Suse", "Souz", "Susa", "Susa"], ["Ninive", "Niniv", "Nineveh", "Nínive"]], 1,
    ["Daniel 6:10", "Danyèl 6:10", "Daniel 6:10", "Daniel 6:10"]),
  q(["Pourquoi Daniel fut-il jeté dans la fosse aux lions ?", "Poukisa yo te jete Danyèl nan twou lyon yo ?", "Why was Daniel thrown into the lions' den?", "¿Por qué fue Daniel arrojado al foso de los leones?"],
    [["Il avait volé", "Li te vòlè", "He had stolen", "Había robado"],
     ["Il continuait de prier son Dieu", "Li te kontinye priye Bondye l", "He kept praying to his God", "Siguió orando a su Dios"],
     ["Il avait insulté le roi", "Li te joure wa a", "He had insulted the king", "Había insultado al rey"],
     ["Il refusait de travailler", "Li te refize travay", "He refused to work", "Se negaba a trabajar"]], 1,
    ["Daniel 6:11-16", "Danyèl 6:11-16", "Daniel 6:11-16", "Daniel 6:11-16"]),
  q(["Qui a fermé la gueule des lions ?", "Kilès ki te fèmen bouch lyon yo ?", "Who shut the lions' mouths?", "¿Quién cerró la boca de los leones?"],
    [["Le roi", "Wa a", "The king", "El rey"], ["Un ange envoyé par Dieu", "Yon zanj Bondye voye", "An angel sent by God", "Un ángel enviado por Dios"],
     ["Les gardes", "Gad yo", "The guards", "Los guardias"], ["Daniel lui-même", "Danyèl li menm", "Daniel himself", "Daniel mismo"]], 1,
    ["Daniel 6:22", "Danyèl 6:22", "Daniel 6:22", "Daniel 6:22"]),
  q(["Quel roi signa le décret interdisant la prière ?", "Ki wa ki te siyen dekrè ki entèdi lapriyè a ?", "Which king signed the decree forbidding prayer?", "¿Qué rey firmó el decreto que prohibía orar?"],
    [["Nebucadnetsar", "Nebikadneza", "Nebuchadnezzar", "Nabucodonosor"], ["Belschatsar", "Bèlchaza", "Belshazzar", "Belsasar"],
     ["Darius", "Dariyis", "Darius", "Darío"], ["Cyrus", "Siris", "Cyrus", "Ciro"]], 2,
    ["Daniel 6:9", "Danyèl 6:9", "Daniel 6:9", "Daniel 6:9"]),
  q(["Combien de bêtes Daniel a-t-il vues sortir de la mer dans sa vision ?", "Konbyen bèt Danyèl te wè soti nan lanmè a nan vizyon l ?", "How many beasts did Daniel see rise from the sea?", "¿Cuántas bestias vio Daniel salir del mar?"],
    [["Deux", "De", "Two", "Dos"], ["Trois", "Twa", "Three", "Tres"],
     ["Quatre", "Kat", "Four", "Cuatro"], ["Sept", "Sèt", "Seven", "Siete"]], 2,
    ["Daniel 7:3", "Danyèl 7:3", "Daniel 7:3", "Daniel 7:3"]),
  q(["Quel ange explique les visions à Daniel ?", "Ki zanj ki esplike vizyon yo bay Danyèl ?", "Which angel explains the visions to Daniel?", "¿Qué ángel le explica las visiones a Daniel?"],
    [["Gabriel", "Gabriyèl", "Gabriel", "Gabriel"], ["Raphaël", "Rafayèl", "Raphael", "Rafael"],
     ["Uriel", "Ouryèl", "Uriel", "Uriel"], ["Séraphin", "Serafen", "Seraphim", "Serafín"]], 0,
    ["Daniel 8:16", "Danyèl 8:16", "Daniel 8:16", "Daniel 8:16"]),
  q(["Que faisait Daniel quand il apprit la durée de l'exil ?", "Kisa Danyèl t ap fè lè l aprann konbyen tan egzil la ap dire ?", "What was Daniel doing when he learned the length of the exile?", "¿Qué hacía Daniel cuando supo la duración del exilio?"],
    [["Il lisait les Écritures", "Li t ap li Ekriti yo", "He was reading the Scriptures", "Leía las Escrituras"],
     ["Il dormait", "Li t ap dòmi", "He was sleeping", "Dormía"],
     ["Il gouvernait", "Li t ap gouvène", "He was governing", "Gobernaba"],
     ["Il voyageait", "Li t ap vwayaje", "He was travelling", "Viajaba"]], 0,
    ["Daniel 9:2", "Danyèl 9:2", "Daniel 9:2", "Daniel 9:2"]),
  q(["Comment Daniel a-t-il accompagné sa prière pour son peuple ?", "Kijan Danyèl te akonpaye lapriyè l pou pèp li a ?", "How did Daniel accompany his prayer for his people?", "¿Cómo acompañó Daniel su oración por su pueblo?"],
    [["Par des chants", "Ak chan", "With songs", "Con cantos"], ["Par le jeûne", "Ak jèn", "With fasting", "Con ayuno"],
     ["Par des offrandes d'or", "Ak ofrann lò", "With gold offerings", "Con ofrendas de oro"],
     ["Par le silence", "Ak silans", "With silence", "Con silencio"]], 1,
    ["Daniel 9:3", "Danyèl 9:3", "Daniel 9:3", "Daniel 9:3"]),
  q(["Quelle promesse est faite à ceux qui enseignent la justice ?", "Ki pwomès yo fè moun k ap anseye jistis la ?", "What promise is made to those who teach righteousness?", "¿Qué promesa se hace a los que enseñan la justicia?"],
    [["Ils régneront sur la terre", "Y ap gouvène latè", "They will rule the earth", "Reinarán sobre la tierra"],
     ["Ils brilleront comme les étoiles", "Y ap klere tankou zetwal", "They will shine like the stars", "Brillarán como las estrellas"],
     ["Ils seront riches", "Y ap rich", "They will be rich", "Serán ricos"],
     ["Ils vivront cent ans", "Y ap viv san an", "They will live a hundred years", "Vivirán cien años"]], 1,
    ["Daniel 12:3", "Danyèl 12:3", "Daniel 12:3", "Daniel 12:3"]),
];

// Sauvegarde avant toute modification.
const { data: rounds } = await db.from("contest_rounds")
  .select("id, round_number, round_type, questions").eq("contest_id", CONTEST).order("round_number");
fs.writeFileSync(new URL("../backup-daniel-questions.json", import.meta.url), JSON.stringify(rounds, null, 2));
console.log("Sauvegarde des", (rounds ?? []).length, "manches -> backup-daniel-questions.json");

// On ne remplit QUE les manches à choix multiples, avec autant de questions
// qu'elles en avaient : la structure du concours reste identique.
let cursor = 0;
for (const r of rounds ?? []) {
  if (r.round_type !== "mcq") continue;
  const need = (r.questions ?? []).length || 4;
  // On ne remplace une manche QUE si la réserve peut la remplir ENTIÈREMENT.
  // Sinon on la laisse intacte : mieux vaut d'anciennes questions qu'une manche
  // amputée (une manche s'était retrouvée avec 1 question au lieu de 4).
  if (cursor + need > POOL.length) { console.log(`  ⏭️  manche ${r.round_number} : réserve insuffisante, laissée intacte`); continue; }
  const slice = POOL.slice(cursor, cursor + need);
  cursor += slice.length;
  const { error } = await db.from("contest_rounds").update({ questions: slice }).eq("id", r.id);
  console.log(error ? `  ❌ manche ${r.round_number} : ${error.message}`
                    : `  ✅ manche ${r.round_number} : ${need} remplacée(s) par ${slice.length}`);
}
console.log(`\n${cursor} question(s) placée(s) sur ${POOL.length} disponibles.`);
process.exit(0);
