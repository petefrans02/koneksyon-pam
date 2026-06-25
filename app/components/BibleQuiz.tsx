"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import { Lang } from "@/lib/translations";

interface QuizQuestion {
  question: Partial<Record<Lang, string>>;
  options: Partial<Record<Lang, string[]>>;
  correct: number;
  verse: Partial<Record<Lang, string>>;
}

const questions: QuizQuestion[] = [
  {
    question: {
      fr: "Qui a construit l'arche ?",
      ht: "Ki moun ki te bati lach la ?",
      en: "Who built the ark?",
    },
    options: {
      fr: ["Abraham", "Moïse", "Noé", "David"],
      ht: ["Abraram", "Moyiz", "Noe", "David"],
      en: ["Abraham", "Moses", "Noah", "David"],
    },
    correct: 2,
    verse: { fr: "Genèse 6:14", ht: "Jenèz 6:14", en: "Genesis 6:14" },
  },
  {
    question: {
      fr: "Combien de jours Jésus a-t-il jeûné dans le désert ?",
      ht: "Konbyen jou Jezi te fè jèn nan dezè a ?",
      en: "How many days did Jesus fast in the desert?",
    },
    options: {
      fr: ["7 jours", "21 jours", "40 jours", "12 jours"],
      ht: ["7 jou", "21 jou", "40 jou", "12 jou"],
      en: ["7 days", "21 days", "40 days", "12 days"],
    },
    correct: 2,
    verse: { fr: "Matthieu 4:2", ht: "Matye 4:2", en: "Matthew 4:2" },
  },
  {
    question: {
      fr: "Quel Psaume dit 'L'Éternel est mon berger' ?",
      ht: "Ki Sòm ki di 'Senyè a se gadò mwen' ?",
      en: "Which Psalm says 'The Lord is my shepherd'?",
    },
    options: {
      fr: ["Psaume 1", "Psaume 23", "Psaume 91", "Psaume 150"],
      ht: ["Sòm 1", "Sòm 23", "Sòm 91", "Sòm 150"],
      en: ["Psalm 1", "Psalm 23", "Psalm 91", "Psalm 150"],
    },
    correct: 1,
    verse: { fr: "Psaume 23:1", ht: "Sòm 23:1", en: "Psalm 23:1" },
  },
  {
    question: {
      fr: "Qui a tué Goliath ?",
      ht: "Ki moun ki te touye Golyat ?",
      en: "Who killed Goliath?",
    },
    options: {
      fr: ["Saül", "Jonathan", "David", "Samson"],
      ht: ["Sol", "Jonatan", "David", "Sanson"],
      en: ["Saul", "Jonathan", "David", "Samson"],
    },
    correct: 2,
    verse: { fr: "1 Samuel 17:50", ht: "1 Samyèl 17:50", en: "1 Samuel 17:50" },
  },
  {
    question: {
      fr: "Combien d'apôtres Jésus a-t-il choisis ?",
      ht: "Konbyen apot Jezi te chwazi ?",
      en: "How many apostles did Jesus choose?",
    },
    options: {
      fr: ["7", "10", "12", "70"],
      ht: ["7", "10", "12", "70"],
      en: ["7", "10", "12", "70"],
    },
    correct: 2,
    verse: { fr: "Luc 6:13", ht: "Lik 6:13", en: "Luke 6:13" },
  },
  {
    question: {
      fr: "Quel est le premier livre de la Bible ?",
      ht: "Ki premye liv Bib la ?",
      en: "What is the first book of the Bible?",
    },
    options: {
      fr: ["Exode", "Genèse", "Matthieu", "Psaumes"],
      ht: ["Egzòd", "Jenèz", "Matye", "Sòm"],
      en: ["Exodus", "Genesis", "Matthew", "Psalms"],
    },
    correct: 1,
    verse: { fr: "Genèse 1:1", ht: "Jenèz 1:1", en: "Genesis 1:1" },
  },
  {
    question: {
      fr: "Qui a été avalé par un gros poisson ?",
      ht: "Ki moun ki te vale pa yon gwo pwason ?",
      en: "Who was swallowed by a great fish?",
    },
    options: {
      fr: ["Élie", "Jonas", "Pierre", "Paul"],
      ht: ["Eli", "Jonas", "Pyè", "Pòl"],
      en: ["Elijah", "Jonah", "Peter", "Paul"],
    },
    correct: 1,
    verse: { fr: "Jonas 1:17", ht: "Jonas 1:17", en: "Jonah 1:17" },
  },
  {
    question: {
      fr: "Quelle mer Moïse a-t-il ouverte ?",
      ht: "Ki lanmè Moyiz te ouvri ?",
      en: "Which sea did Moses part?",
    },
    options: {
      fr: ["Mer Morte", "Mer Rouge", "Mer de Galilée", "Mer Méditerranée"],
      ht: ["Lanmè Mò a", "Lanmè Wouj la", "Lanmè Galile a", "Lanmè Mediterane a"],
      en: ["Dead Sea", "Red Sea", "Sea of Galilee", "Mediterranean Sea"],
    },
    correct: 1,
    verse: { fr: "Exode 14:21", ht: "Egzòd 14:21", en: "Exodus 14:21" },
  },
  {
    question: {
      fr: "Quel est le plus grand commandement selon Jésus ?",
      ht: "Ki pi gwo kòmandman dapre Jezi ?",
      en: "What is the greatest commandment according to Jesus?",
    },
    options: {
      fr: ["Ne pas voler", "Aimer Dieu de tout son cœur", "Honorer ses parents", "Ne pas mentir"],
      ht: ["Pa vòlè", "Renmen Bondye ak tout kè ou", "Onore paran ou", "Pa bay manti"],
      en: ["Do not steal", "Love God with all your heart", "Honor your parents", "Do not lie"],
    },
    correct: 1,
    verse: { fr: "Matthieu 22:37", ht: "Matye 22:37", en: "Matthew 22:37" },
  },
  {
    question: {
      fr: "Combien de livres y a-t-il dans la Bible ?",
      ht: "Konbyen liv ki gen nan Bib la ?",
      en: "How many books are in the Bible?",
    },
    options: {
      fr: ["39", "52", "66", "73"],
      ht: ["39", "52", "66", "73"],
      en: ["39", "52", "66", "73"],
    },
    correct: 2,
    verse: { fr: "66 livres : 39 AT + 27 NT", ht: "66 liv : 39 AT + 27 NT", en: "66 books: 39 OT + 27 NT" },
  },
];

export default function BibleQuiz() {
  const { lang } = useLang();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    setCurrent(Math.floor(Math.random() * questions.length));
  }, []);

  const q = questions[current];
  const gl = (obj: Partial<Record<Lang, string>>): string => obj[lang] || obj["en"] || obj["fr"] || "";
  const gla = (obj: Partial<Record<Lang, string[]>>): string[] => obj[lang] || obj["en"] || obj["fr"] || [];

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    setTotal(total + 1);
    if (i === q.correct) setScore(score + 1);
    setShowNext(true);
  }

  function nextQuestion() {
    setSelected(null);
    setShowNext(false);
    setCurrent((current + 1) % questions.length);
  }

  const title = lang === "fr" ? "Quiz Biblique" : lang === "ht" ? "Kiz Biblik" : "Bible Quiz";

  return (
    <section className="max-w-3xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            ✓ {score}/{total}
          </div>
        </div>

        <p className="text-lg font-medium mb-5">{gl(q.question)}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {gla(q.options).map((opt, i) => {
            let style = "bg-white/10 hover:bg-white/20 border-white/20";
            if (selected !== null) {
              if (i === q.correct) style = "bg-green-500 border-green-400 shadow-lg";
              else if (i === selected) style = "bg-red-500/70 border-red-400";
              else style = "bg-white/5 border-white/10 opacity-50";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${style}`}
              >
                <span className="mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-white/80">
              {selected === q.correct
                ? (lang === "fr" ? "✓ Correct !" : lang === "ht" ? "✓ Kòrèk !" : "✓ Correct!")
                : (lang === "fr" ? "✗ La bonne réponse était : " : lang === "ht" ? "✗ Bon repons la te : " : "✗ The correct answer was: ")}
              {selected !== q.correct && <strong>{gla(q.options)[q.correct]}</strong>}
              <span className="ml-2 opacity-60">— {gl(q.verse)}</span>
            </p>
            {showNext && (
              <button
                onClick={nextQuestion}
                className="bg-white text-indigo-700 px-4 py-2 rounded-full text-sm font-bold hover:bg-indigo-50 transition-colors"
              >
                {lang === "fr" ? "Suivant →" : lang === "ht" ? "Pwochen →" : "Next →"}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
