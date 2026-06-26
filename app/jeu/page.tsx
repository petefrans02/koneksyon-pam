"use client";
import RequireAuth from "@/app/components/RequireAuth";
import { useLang } from "@/lib/LangContext";
import { useState } from "react";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────
interface VerseChallenge { verse: string; reference: string; missingWord: string; hint: string; options: string[]; }
const versesChallenges: VerseChallenge[] = [
  { verse: "Car Dieu a tant aimé le _____ qu'il a donné son Fils unique", reference: "Jean 3:16", missingWord: "monde", hint: "La terre entière", options: ["monde", "peuple", "ciel", "royaume"] },
  { verse: "L'Éternel est mon _____ : je ne manquerai de rien", reference: "Psaume 23:1", missingWord: "berger", hint: "Celui qui garde les brebis", options: ["roi", "berger", "père", "ami"] },
  { verse: "Je puis tout par celui qui me _____", reference: "Philippiens 4:13", missingWord: "fortifie", hint: "Donner de la force", options: ["guide", "aime", "fortifie", "appelle"] },
  { verse: "Ne crains point, car je suis avec _____", reference: "Ésaïe 41:10", missingWord: "toi", hint: "La personne qui lit", options: ["eux", "nous", "toi", "lui"] },
  { verse: "Au commencement, Dieu créa les cieux et la _____", reference: "Genèse 1:1", missingWord: "terre", hint: "Notre planète", options: ["terre", "mer", "lumière", "vie"] },
  { verse: "Demandez et l'on vous _____", reference: "Matthieu 7:7", missingWord: "donnera", hint: "Recevoir quelque chose", options: ["entendra", "donnera", "pardonnera", "aimera"] },
  { verse: "La prière fervente du _____ a une grande efficace", reference: "Jacques 5:16", missingWord: "juste", hint: "Quelqu'un de droit devant Dieu", options: ["prêtre", "juste", "saint", "pasteur"] },
  { verse: "Le commencement de la sagesse, c'est la crainte de l'_____", reference: "Proverbes 9:10", missingWord: "Éternel", hint: "Le nom de Dieu", options: ["Éternel", "homme", "ange", "esprit"] },
  { verse: "Jésus lui dit : Je suis le chemin, la vérité et la _____", reference: "Jean 14:6", missingWord: "vie", hint: "Le contraire de la mort", options: ["paix", "joie", "vie", "lumière"] },
  { verse: "Heureux les artisans de _____, car ils seront appelés fils de Dieu", reference: "Matthieu 5:9", missingWord: "paix", hint: "L'absence de conflit", options: ["paix", "justice", "joie", "amour"] },
  { verse: "Confie-toi en l'Éternel de tout ton _____", reference: "Proverbes 3:5", missingWord: "cœur", hint: "L'organe de l'amour", options: ["esprit", "âme", "cœur", "corps"] },
  { verse: "Car le salaire du péché, c'est la _____", reference: "Romains 6:23", missingWord: "mort", hint: "La fin de la vie terrestre", options: ["mort", "peine", "douleur", "honte"] },
  { verse: "Celui qui demeure sous l'abri du _____ repose à l'ombre du Tout-Puissant", reference: "Psaume 91:1", missingWord: "Très-Haut", hint: "Le Dieu suprême", options: ["temple", "Très-Haut", "ciel", "rocher"] },
  { verse: "Je lève mes yeux vers les _____ : d'où me viendra le secours ?", reference: "Psaume 121:1", missingWord: "montagnes", hint: "De grandes élévations de terrain", options: ["cieux", "étoiles", "montagnes", "nuages"] },
  { verse: "En toute chose, par la prière et la _____, faites connaître vos besoins à Dieu", reference: "Philippiens 4:6", missingWord: "supplication", hint: "Une prière insistante", options: ["foi", "supplication", "louange", "grâce"] },
  { verse: "L'amour est patient, il est _____", reference: "1 Corinthiens 13:4", missingWord: "plein de bonté", hint: "Généreux et doux", options: ["plein de bonté", "fort", "éternel", "pur"] },
  { verse: "Soyez forts et courageux ! Ne vous effrayez pas et ne vous laissez pas _____ devant eux", reference: "Deutéronome 31:6", missingWord: "abattre", hint: "Perdre courage", options: ["perdre", "abattre", "décourager", "trembler"] },
  { verse: "Car c'est par la _____ que vous êtes sauvés", reference: "Éphésiens 2:8", missingWord: "grâce", hint: "Le don gratuit de Dieu", options: ["foi", "grâce", "prière", "loi"] },
  { verse: "Cherchez premièrement le _____ de Dieu et sa justice", reference: "Matthieu 6:33", missingWord: "royaume", hint: "Le règne de Dieu", options: ["temple", "amour", "royaume", "chemin"] },
  { verse: "Dieu est notre _____ et notre force", reference: "Psaume 46:1", missingWord: "refuge", hint: "Un abri contre le danger", options: ["refuge", "berger", "juge", "père"] },
  { verse: "Tes paroles sont une _____ à mes pieds", reference: "Psaume 119:105", missingWord: "lampe", hint: "Source de lumière", options: ["lampe", "épée", "force", "joie"] },
  { verse: "Jésus-Christ est le même hier, aujourd'hui et _____", reference: "Hébreux 13:8", missingWord: "éternellement", hint: "Pour toujours", options: ["demain", "éternellement", "toujours", "jamais"] },
  { verse: "Si quelqu'un est en Christ, il est une nouvelle _____", reference: "2 Corinthiens 5:17", missingWord: "création", hint: "Quelque chose de fait à nouveau", options: ["créature", "création", "naissance", "vie"] },
  { verse: "Car là où deux ou trois sont assemblés en mon _____, je suis au milieu d'eux", reference: "Matthieu 18:20", missingWord: "nom", hint: "L'identité de Jésus", options: ["nom", "esprit", "cœur", "amour"] },
  { verse: "L'Éternel te bénisse et te _____", reference: "Nombres 6:24", missingWord: "garde", hint: "Protéger, surveiller", options: ["garde", "guide", "aime", "sauve"] },
];

interface VraiFauxQ { question: string; answer: boolean; explication: string; }
const vraiFauxQuestions: VraiFauxQ[] = [
  { question: "Jésus a jeûné 40 jours dans le désert", answer: true, explication: "Matthieu 4:2 — Jésus a jeûné quarante jours et quarante nuits" },
  { question: "La Bible contient 66 livres", answer: true, explication: "39 dans l'Ancien Testament + 27 dans le Nouveau Testament" },
  { question: "David était le fils d'Abraham", answer: false, explication: "David était le fils de Jessé (1 Samuel 16:1)" },
  { question: "Le premier miracle de Jésus fut de changer l'eau en vin", answer: true, explication: "Noces de Cana — Jean 2:1-11" },
  { question: "Jonas a été avalé par une baleine", answer: false, explication: "La Bible dit 'un grand poisson', pas nécessairement une baleine (Jonas 1:17)" },
  { question: "Samson avait 7 tresses dans ses cheveux", answer: true, explication: "Juges 16:13 mentionne les sept tresses" },
  { question: "Pierre s'appelait Simon avant de rencontrer Jésus", answer: true, explication: "Simon Bar-Jonas était son nom original (Jean 1:42)" },
  { question: "Jean-Baptiste et Jésus étaient cousins", answer: true, explication: "Élisabeth, mère de Jean, était parente de Marie (Luc 1:36)" },
  { question: "Salomon avait 700 femmes et 300 concubines", answer: true, explication: "1 Rois 11:3 le confirme clairement" },
  { question: "Jésus a ressuscité Lazare après 2 jours", answer: false, explication: "Lazare était mort depuis 4 jours (Jean 11:39)" },
  { question: "Abraham s'appelait d'abord Abram", answer: true, explication: "Dieu lui a changé le nom en Abraham (Genèse 17:5)" },
  { question: "Matthieu était un collecteur d'impôts", answer: true, explication: "Il était publicain avant de suivre Jésus (Matthieu 9:9)" },
  { question: "Les 10 commandements ont été donnés au Mont Sinaï", answer: true, explication: "Exode 20 — Dieu a donné la Loi à Moïse sur le Sinaï" },
  { question: "Saul (Paul) était de la tribu de Juda", answer: false, explication: "Paul était de la tribu de Benjamin (Philippiens 3:5)" },
  { question: "Ruth était Moabite", answer: true, explication: "Ruth était une femme de Moab (Ruth 1:4)" },
  { question: "Adam et Ève vivaient dans le jardin d'Éden", answer: true, explication: "Genèse 2:8 — Dieu planta un jardin en Éden" },
  { question: "Goliath mesurait exactement 3 mètres", answer: false, explication: "Il mesurait environ 2.9 m (6 coudées et un palme, 1 Samuel 17:4)" },
  { question: "Paul a écrit l'Épître aux Romains", answer: true, explication: "Romains 1:1 — Paul se présente comme l'auteur" },
  { question: "L'arche de Noé s'est posée sur le Mont Everest", answer: false, explication: "L'arche s'est posée sur les monts Ararat (Genèse 8:4)" },
  { question: "Élie a été emporté au ciel dans un tourbillon de feu", answer: true, explication: "2 Rois 2:11 — un char de feu et des chevaux de feu" },
];

interface SpeakerQ { quote: string; speaker: string; options: string[]; reference: string; }
const speakerQuestions: SpeakerQ[] = [
  { quote: "Je suis le chemin, la vérité et la vie", speaker: "Jésus", options: ["Jésus", "Paul", "Jean", "Moïse"], reference: "Jean 14:6" },
  { quote: "Parle, Seigneur, car ton serviteur écoute", speaker: "Samuel", options: ["Samuel", "Élie", "David", "Ézéchiel"], reference: "1 Samuel 3:10" },
  { quote: "Où tu mourras, je mourrai", speaker: "Ruth", options: ["Ruth", "Marie", "Esther", "Rébecca"], reference: "Ruth 1:17" },
  { quote: "Le Seigneur a donné, le Seigneur a repris. Que le nom du Seigneur soit béni !", speaker: "Job", options: ["Job", "David", "Salomon", "Abraham"], reference: "Job 1:21" },
  { quote: "Pour moi, vivre c'est Christ, et mourir m'est un gain", speaker: "Paul", options: ["Paul", "Pierre", "Jean", "Jacques"], reference: "Philippiens 1:21" },
  { quote: "Me voici, envoie-moi !", speaker: "Ésaïe", options: ["Ésaïe", "Moïse", "Samuel", "Jérémie"], reference: "Ésaïe 6:8" },
  { quote: "Mon Dieu, mon Dieu, pourquoi m'as-tu abandonné ?", speaker: "Jésus", options: ["Jésus", "David", "Job", "Élie"], reference: "Matthieu 27:46" },
  { quote: "Si votre Dieu ne nous délivre pas, sachez, ô roi, que nous ne servirons pas vos dieux", speaker: "Schadrach, Méschach et Abed-Nego", options: ["Schadrach, Méschach et Abed-Nego", "Daniel", "Esdras", "Néhémie"], reference: "Daniel 3:18" },
  { quote: "Voici l'agneau de Dieu, qui ôte le péché du monde", speaker: "Jean-Baptiste", options: ["Jean-Baptiste", "Jean l'apôtre", "Pierre", "André"], reference: "Jean 1:29" },
  { quote: "Seigneur, si tu veux, tu peux me rendre pur", speaker: "Un lépreux", options: ["Un lépreux", "Pierre", "Lazare", "Nicodème"], reference: "Matthieu 8:2" },
  { quote: "Il faut que je diminue, mais que lui grandisse", speaker: "Jean-Baptiste", options: ["Jean-Baptiste", "Paul", "André", "Philippe"], reference: "Jean 3:30" },
  { quote: "La faveur de l'Éternel est sur ceux qui le craignent", speaker: "David", options: ["David", "Salomon", "Asaph", "Moïse"], reference: "Psaume 103:17" },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

// ─── i18n helpers ────────────────────────────────────────────────────────────
function t(key: string, lang: string): string {
  const map: Record<string, Record<string, string>> = {
    back:        { fr: "← Jeux",            ht: "← Jwèt",           en: "← Games" },
    replay:      { fr: "Rejouer",            ht: "Rejwe",            en: "Play again" },
    correct:     { fr: "✓ Correct !",        ht: "✓ Kòrèk !",       en: "✓ Correct!" },
    wrong:       { fr: "✗ C'était :",        ht: "✗ Se te :",        en: "✗ It was:" },
    nextVerse:   { fr: "Verset suivant →",   ht: "Vèsè swivan →",   en: "Next verse →" },
    nextQ:       { fr: "Question suivante →",ht: "Kesyon swivan →",  en: "Next question →" },
    result:      { fr: "Voir le résultat ★", ht: "Wè rezilta ★",    en: "See result ★" },
    excellent:   { fr: "Excellent !",        ht: "Ekselan !",        en: "Excellent!" },
    wellDone:    { fr: "Bien joué !",        ht: "Byen jwe !",       en: "Well done!" },
    keepGoing:   { fr: "Continue !",         ht: "Kontinye !",       en: "Keep going!" },
    correct_pct: { fr: "de bonnes réponses", ht: "bon repons",       en: "correct" },
    bestStreak:  { fr: "Meilleure série :",  ht: "Miyò seri :",      en: "Best streak:" },
    hint:        { fr: "Indice :",           ht: "Konsèy :",         en: "Hint:" },
    trueBtn:     { fr: "✅ VRAI",            ht: "✅ VRE",           en: "✅ TRUE" },
    falseBtn:    { fr: "❌ FAUX",            ht: "❌ FO",            en: "❌ FALSE" },
    wrongWas:    { fr: "C'était",            ht: "Se te",            en: "It was" },
    whoSaid:     { fr: "Qui a dit ça ?",     ht: "Ki moun ki di sa ?", en: "Who said this?" },
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
      <p className="text-stone-500 mb-1">{pct}% {t("correct_pct", lang)}</p>
      {bestStreak !== undefined && <p className="text-amber-600 font-medium mb-6">🔥 {t("bestStreak", lang)} {bestStreak}</p>}
      <div className="flex justify-center gap-3 mt-6">
        <button onClick={onBack} className="bg-stone-100 text-stone-600 px-6 py-3 rounded-full font-medium hover:bg-stone-200">{t("back", lang)}</button>
        <button onClick={onReplay} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-bold hover:opacity-90">{t("replay", lang)}</button>
      </div>
    </div>
  );
}

// ─── Game 1: Devine le Verset ─────────────────────────────────────────────────
function DevineVerset({ lang, onBack }: { lang: string; onBack: () => void }) {
  const [shuffled] = useState(() => shuffle(versesChallenges));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [done, setDone] = useState(false);
  const ch = shuffled[idx];

  function pick(word: string) {
    if (selected) return;
    setSelected(word);
    if (word === ch.missingWord) {
      setScore(s => s + 1);
      const ns = streak + 1;
      setStreak(ns);
      if (ns > bestStreak) setBestStreak(ns);
    } else setStreak(0);
  }

  function next() {
    if (idx + 1 >= shuffled.length) { setDone(true); return; }
    setIdx(idx + 1); setSelected(null);
  }

  if (done) {
    const pct = Math.round((score / shuffled.length) * 100);
    return <ScoreScreen pct={pct} score={score} total={shuffled.length} bestStreak={bestStreak} lang={lang}
      onBack={onBack} onReplay={() => { setIdx(0); setSelected(null); setScore(0); setStreak(0); setBestStreak(0); setDone(false); }} />;
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
          {ch.verse.split("_____").map((part, i, arr) => (
            <span key={i}>{part}{i < arr.length - 1 && (
              <span className={`inline-block mx-1 px-3 py-1 rounded-lg font-bold ${selected === ch.missingWord ? "bg-green-100 text-green-700" : selected ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-600 animate-pulse"}`}>
                {selected ? ch.missingWord : "???"}
              </span>
            )}</span>
          ))}
        </p>
        <p className="text-center text-blue-500 text-sm mt-4 font-medium">📖 {ch.reference}</p>
        {!selected && <p className="text-center text-stone-400 text-xs mt-2">💡 {t("hint", lang)} {ch.hint}</p>}
      </div>
      {!selected ? (
        <div className="grid grid-cols-2 gap-3">
          {shuffle(ch.options).map((opt) => (
            <button key={opt} onClick={() => pick(opt)} className="bg-white border-2 border-stone-200 rounded-xl py-4 px-4 text-center font-medium text-stone-800 hover:border-blue-400 hover:bg-blue-50 transition-all">{opt}</button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className={`inline-block px-6 py-3 rounded-xl font-bold text-lg mb-4 ${selected === ch.missingWord ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {selected === ch.missingWord ? t("correct", lang) : `${t("wrong", lang)} ${ch.missingWord}`}
          </div>
          <button onClick={next} className="block mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90">
            {idx + 1 >= shuffled.length ? t("result", lang) : t("nextVerse", lang)}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Game 2: Vrai ou Faux ──────────────────────────────────────────────────────
function VraiFaux({ lang, onBack }: { lang: string; onBack: () => void }) {
  const [shuffled] = useState(() => shuffle(vraiFauxQuestions));
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = shuffled[idx];

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
        <p className="text-xl font-semibold text-stone-800 leading-relaxed">{q.question}</p>
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
              {chosen === q.answer ? t("correct", lang) : `${t("wrong", lang)} ${q.answer ? t("trueBtn", lang).replace(/[✅❌]\s*/,"") : t("falseBtn", lang).replace(/[✅❌]\s*/,"")}`}
            </p>
            <p className="text-stone-600 text-sm">📖 {q.explication}</p>
          </div>
          <button onClick={next} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90">
            {idx + 1 >= shuffled.length ? t("result", lang) : t("nextQ", lang)}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Game 3: Qui a dit ça ? ───────────────────────────────────────────────────
function QuiADit({ lang, onBack }: { lang: string; onBack: () => void }) {
  const [shuffled] = useState(() => shuffle(speakerQuestions));
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = shuffled[idx];

  function pick(opt: string) {
    if (chosen) return;
    setChosen(opt);
    if (opt === q.speaker) setScore(s => s + 1);
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
        <p className="text-xl font-semibold text-stone-800 italic leading-relaxed">&ldquo;{q.quote}&rdquo;</p>
        <p className="text-sm text-amber-600 mt-3">📖 {q.reference}</p>
      </div>
      {!chosen ? (
        <div className="grid grid-cols-2 gap-3">
          {shuffle(q.options).map((opt) => (
            <button key={opt} onClick={() => pick(opt)} className="bg-white border-2 border-stone-200 rounded-xl py-4 px-3 text-center font-medium text-stone-800 hover:border-amber-400 hover:bg-amber-50 transition-all text-sm">{opt}</button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className={`rounded-2xl p-5 mb-4 ${chosen === q.speaker ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <p className={`font-bold text-lg mb-1 ${chosen === q.speaker ? "text-green-700" : "text-red-700"}`}>
              {chosen === q.speaker ? t("correct", lang) : `${t("wrong", lang)} ${q.speaker}`}
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

  const games = [
    {
      id: "devine" as GameMode,
      icon: "🎯",
      color: "from-blue-500 to-cyan-500",
      bg: "from-blue-50 to-cyan-50",
      border: "border-blue-200",
      title: lang === "fr" ? "Devine le Verset" : lang === "ht" ? "Devine Vèsè a" : "Guess the Verse",
      desc: lang === "fr" ? "Trouvez le mot manquant dans 25 versets bibliques. Construisez votre série !"
          : lang === "ht" ? "Jwenn mo ki manke nan 25 vèsè biblik yo. Bati seri ou !"
          : "Find the missing word in 25 Bible verses. Build your streak!",
      count: `${versesChallenges.length} ${lang === "en" ? "verses" : lang === "ht" ? "vèsè" : "versets"}`,
    },
    {
      id: "vraifaux" as GameMode,
      icon: "🃏",
      color: "from-purple-500 to-pink-500",
      bg: "from-purple-50 to-pink-50",
      border: "border-purple-200",
      title: lang === "fr" ? "Vrai ou Faux ?" : lang === "ht" ? "Vre oswa Fo ?" : "True or False?",
      desc: lang === "fr" ? "20 affirmations bibliques — vrai ou faux ? Testez vos connaissances !"
          : lang === "ht" ? "20 afirmasyon biblik — vre oswa fo ? Teste konesans ou !"
          : "20 Bible statements — true or false? Test your knowledge!",
      count: `${vraiFauxQuestions.length} ${lang === "en" ? "questions" : lang === "ht" ? "kesyon" : "questions"}`,
    },
    {
      id: "speaker" as GameMode,
      icon: "👤",
      color: "from-amber-400 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      title: lang === "fr" ? "Qui a dit ça ?" : lang === "ht" ? "Ki moun ki di sa ?" : "Who said this?",
      desc: lang === "fr" ? "Identifiez l'auteur de ces paroles bibliques célèbres. Connaissez-vous la Parole ?"
          : lang === "ht" ? "Idantifye otè pawòl biblik sa yo. Èske ou konnen Pawòl la ?"
          : "Identify who said these famous biblical words. Do you know the Word?",
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
                <button
                  key={g.id}
                  onClick={() => setMode(g.id)}
                  className={`bg-gradient-to-br ${g.bg} border ${g.border} rounded-2xl p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group w-full`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${g.color} rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                      {g.icon}
                    </div>
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
        {mode === "devine"   && <DevineVerset lang={lang} onBack={() => setMode(null)} />}
        {mode === "vraifaux" && <VraiFaux     lang={lang} onBack={() => setMode(null)} />}
        {mode === "speaker"  && <QuiADit      lang={lang} onBack={() => setMode(null)} />}
      </div>
    </RequireAuth>
  );
}
