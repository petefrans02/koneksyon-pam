"use client";

import { useLang } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import Link from "next/link";

interface VerseChallenge {
  verse: string;
  reference: string;
  missingWord: string;
  hint: string;
  options: string[];
}

const challenges: VerseChallenge[] = [
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
  { verse: "En toute chose, par la prière et la _____, faites connaître vos besoins à Dieu", reference: "Philippiens 4:6", missingWord: "supplication", hint: "Une prière insistante", options: ["foi", "supplication", "louange", "grâce"] },
  { verse: "Confie-toi en l'Éternel de tout ton _____", reference: "Proverbes 3:5", missingWord: "cœur", hint: "L'organe de l'amour", options: ["esprit", "âme", "cœur", "corps"] },
  { verse: "Car le salaire du péché, c'est la _____", reference: "Romains 6:23", missingWord: "mort", hint: "La fin de la vie terrestre", options: ["mort", "peine", "douleur", "honte"] },
  { verse: "Celui qui demeure sous l'abri du _____ repose à l'ombre du Tout-Puissant", reference: "Psaume 91:1", missingWord: "Très-Haut", hint: "Le Dieu suprême", options: ["temple", "Très-Haut", "ciel", "rocher"] },
  { verse: "Je lève mes yeux vers les _____ : d'où me viendra le secours ?", reference: "Psaume 121:1", missingWord: "montagnes", hint: "De grandes élévations de terrain", options: ["cieux", "étoiles", "montagnes", "nuages"] },
];

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function JeuPage() {
  const { lang } = useLang();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [shuffled, setShuffled] = useState<VerseChallenge[]>([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setShuffled(shuffleArray(challenges));
  }, []);

  if (shuffled.length === 0) return null;

  const challenge = shuffled[currentIndex];

  function handleSelect(word: string) {
    if (selected) return;
    setSelected(word);
    setTotal(total + 1);
    if (word === challenge.missingWord) {
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }
  }

  function nextVerse() {
    if (currentIndex + 1 >= shuffled.length) {
      setGameOver(true);
      return;
    }
    setCurrentIndex(currentIndex + 1);
    setSelected(null);
  }

  function restart() {
    setShuffled(shuffleArray(challenges));
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setTotal(0);
    setStreak(0);
    setGameOver(false);
  }

  if (gameOver) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <span className="text-6xl block mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "⭐" : "💪"}</span>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          {pct >= 80 ? (lang === "fr" ? "Excellent !" : "Excellent!") : pct >= 50 ? (lang === "fr" ? "Bien joué !" : "Well done!") : (lang === "fr" ? "Continue !" : "Keep going!")}
        </h1>
        <div className="text-5xl font-black text-blue-600 my-4">{score}/{total}</div>
        <p className="text-stone-500 mb-2">{pct}% {lang === "fr" ? "de bonnes réponses" : "correct"}</p>
        <p className="text-amber-600 font-medium mb-6">🔥 {lang === "fr" ? "Meilleure série" : "Best streak"} : {bestStreak}</p>
        <div className="flex justify-center gap-3">
          <button onClick={restart} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90">
            {lang === "fr" ? "Rejouer" : "Play again"}
          </button>
          <Link href="/" className="bg-stone-100 text-stone-600 px-8 py-3 rounded-full font-medium hover:bg-stone-200">
            {lang === "fr" ? "Accueil" : "Home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <Link href="/" className="text-blue-500 text-sm hover:underline mb-6 block">← {lang === "fr" ? "Accueil" : "Home"}</Link>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">
          🎯 {lang === "fr" ? "Devine le Verset" : lang === "ht" ? "Devine Vèsè a" : "Guess the Verse"}
        </h1>
        <p className="text-stone-500 text-sm">{lang === "fr" ? "Trouvez le mot manquant !" : "Find the missing word!"}</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
            {currentIndex + 1}/{shuffled.length}
          </span>
          {streak >= 3 && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold animate-pulse">🔥 {streak}</span>}
        </div>
        <span className="text-sm font-bold text-stone-500">{score} ✓</span>
      </div>

      <div className="h-1.5 bg-stone-200 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / shuffled.length) * 100}%` }} />
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm mb-6">
        <p className="text-xl leading-relaxed text-stone-800 text-center font-medium">
          {challenge.verse.split("_____").map((part, i) => (
            <span key={i}>
              {part}
              {i < challenge.verse.split("_____").length - 1 && (
                <span className={`inline-block mx-1 px-3 py-1 rounded-lg font-bold ${
                  selected === challenge.missingWord ? "bg-green-100 text-green-700" : selected ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-600 animate-pulse"
                }`}>
                  {selected ? challenge.missingWord : "???"}
                </span>
              )}
            </span>
          ))}
        </p>
        <p className="text-center text-blue-500 text-sm mt-4 font-medium">📖 {challenge.reference}</p>
        {!selected && <p className="text-center text-stone-400 text-xs mt-2">💡 {challenge.hint}</p>}
      </div>

      {!selected ? (
        <div className="grid grid-cols-2 gap-3">
          {shuffleArray(challenge.options).map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className="bg-white border-2 border-stone-200 rounded-xl py-4 px-4 text-center font-medium text-stone-800 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className={`inline-block px-6 py-3 rounded-xl font-bold text-lg mb-4 ${
            selected === challenge.missingWord ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {selected === challenge.missingWord
              ? (lang === "fr" ? "✓ Correct !" : "✓ Correct!")
              : (lang === "fr" ? `✗ C'était : ${challenge.missingWord}` : `✗ It was: ${challenge.missingWord}`)}
          </div>
          <button onClick={nextVerse} className="block mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
            {currentIndex + 1 >= shuffled.length
              ? (lang === "fr" ? "Voir le résultat ★" : "See results ★")
              : (lang === "fr" ? "Verset suivant →" : "Next verse →")}
          </button>
        </div>
      )}
    </div>
  );
}
