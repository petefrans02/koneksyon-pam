"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useState } from "react";

type Lang = "fr" | "ht" | "en";

interface QBlock { question: string; options: string[]; answer: number; explanation: string; }
interface DailyQ { ref: string; fr: QBlock; ht: QBlock; en: QBlock; }

const daily: DailyQ[] = [
  {
    ref: "Genèse 1",
    fr: {
      question: "Combien de jours Dieu a-t-il pris pour créer les cieux et la terre ?",
      options: ["5 jours", "6 jours", "7 jours", "40 jours"],
      answer: 1,
      explanation: "Dieu créa tout en six jours et se reposa le septième (Genèse 1-2).",
    },
    ht: {
      question: "Konbyen jou Bondye te pran pou kreye syèl la ak tè a ?",
      options: ["5 jou", "6 jou", "7 jou", "40 jou"],
      answer: 1,
      explanation: "Bondye kreye tout bagay nan sis jou epi li repoze nan setyèm jou a (Jenèz 1-2).",
    },
    en: {
      question: "How many days did God take to create the heavens and the earth?",
      options: ["5 days", "6 days", "7 days", "40 days"],
      answer: 1,
      explanation: "God created everything in six days and rested on the seventh (Genesis 1-2).",
    },
  },
  {
    ref: "Matthieu 5",
    fr: {
      question: "Selon le Sermon sur la Montagne, qui héritera la terre ?",
      options: ["Les forts", "Les riches", "Les doux", "Les sages"],
      answer: 2,
      explanation: "« Heureux les doux, car ils hériteront la terre. » — Matthieu 5:5",
    },
    ht: {
      question: "Selon Sèmon sou Mòn nan, kilès ki pral eritye tè a ?",
      options: ["Moun ki fò yo", "Moun rich yo", "Moun ki dou yo", "Moun saj yo"],
      answer: 2,
      explanation: "« Benediksyon pou moun ki dou yo, paske yo pral eritye tè a. » — Matye 5:5",
    },
    en: {
      question: "According to the Sermon on the Mount, who will inherit the earth?",
      options: ["The strong", "The rich", "The meek", "The wise"],
      answer: 2,
      explanation: "\"Blessed are the meek, for they will inherit the earth.\" — Matthew 5:5",
    },
  },
  {
    ref: "Actes 2",
    fr: {
      question: "Quel événement est décrit au chapitre 2 du livre des Actes ?",
      options: ["La naissance de Jésus", "La Pentecôte", "La résurrection", "Le baptême de Jésus"],
      answer: 1,
      explanation: "Actes 2 décrit la Pentecôte — la descente du Saint-Esprit sur les disciples.",
    },
    ht: {
      question: "Ki evènman ki dekri nan chapit 2 liv Zak yo ?",
      options: ["Nesans Jezi a", "Lapannkòt la", "Rezireksyon an", "Batèm Jezi a"],
      answer: 1,
      explanation: "Zak 2 dekri Lapannkòt la — desann Sentespri a sou disip yo.",
    },
    en: {
      question: "What event is described in chapter 2 of the book of Acts?",
      options: ["The birth of Jesus", "Pentecost", "The resurrection", "Jesus' baptism"],
      answer: 1,
      explanation: "Acts 2 describes Pentecost — the descent of the Holy Spirit on the disciples.",
    },
  },
  {
    ref: "Jean 11",
    fr: {
      question: "Quel est le verset le plus court de la Bible ?",
      options: ["Jean 1:1", "Jean 11:35", "Luc 2:1", "Actes 1:1"],
      answer: 1,
      explanation: "« Jésus pleura. » (Jean 11:35) est le verset le plus court de la Bible.",
    },
    ht: {
      question: "Ki vèsè ki pi kout nan Bib la ?",
      options: ["Jan 1:1", "Jan 11:35", "Lik 2:1", "Zak 1:1"],
      answer: 1,
      explanation: "« Jezi kriye. » (Jan 11:35) se vèsè ki pi kout nan Bib la.",
    },
    en: {
      question: "What is the shortest verse in the Bible?",
      options: ["John 1:1", "John 11:35", "Luke 2:1", "Acts 1:1"],
      answer: 1,
      explanation: "\"Jesus wept.\" (John 11:35) is the shortest verse in the Bible.",
    },
  },
  {
    ref: "Psaumes 119",
    fr: {
      question: "Quel est le chapitre le plus long de la Bible ?",
      options: ["Psaumes 23", "Psaumes 91", "Psaumes 119", "Ésaïe 40"],
      answer: 2,
      explanation: "Psaumes 119 est le chapitre le plus long de la Bible avec 176 versets.",
    },
    ht: {
      question: "Ki chapit ki pi long nan Bib la ?",
      options: ["Sòm 23", "Sòm 91", "Sòm 119", "Ezayi 40"],
      answer: 2,
      explanation: "Sòm 119 se chapit ki pi long nan Bib la ak 176 vèsè.",
    },
    en: {
      question: "What is the longest chapter in the Bible?",
      options: ["Psalm 23", "Psalm 91", "Psalm 119", "Isaiah 40"],
      answer: 2,
      explanation: "Psalm 119 is the longest chapter in the Bible with 176 verses.",
    },
  },
];

function getDayOfYear() {
  const n = new Date();
  return Math.floor((n.getTime() - new Date(n.getFullYear(), 0, 0).getTime()) / 86400000);
}

const leaderboard = [
  { name: "Marie J.", score: 2840, streak: 12 },
  { name: "Jean-Paul M.", score: 2710, streak: 9 },
  { name: "Sarah K.", score: 2590, streak: 7 },
  { name: "David L.", score: 2430, streak: 15 },
  { name: "Esther N.", score: 2200, streak: 6 },
];

export default function ConcoursPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;

  const q = daily[getDayOfYear() % daily.length];
  const qData = q[l];

  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  function choose(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
  }

  const correct = answered && selected === qData.answer;

  const txt = {
    label: l === "fr" ? "Concours du Jour" : l === "ht" ? "Konkou Jounen an" : "Daily Contest",
    headline:
      l === "fr" ? "Un défi. Chaque jour."
      : l === "ht" ? "Yon defi. Chak jou."
      : "One challenge. Every day.",
    sub:
      l === "fr" ? "Répondez à la question du jour, accumulez des points et grimpez dans le classement mondial."
      : l === "ht" ? "Repon a kesyon jounen an, akimile pwen epi monte nan klasman mondyal la."
      : "Answer today's question, accumulate points and climb the global rankings.",
    todayQ: l === "fr" ? "Question du jour" : l === "ht" ? "Kesyon jounen an" : "Today's question",
    ref: l === "fr" ? "Référence" : l === "ht" ? "Referans" : "Reference",
    correctLabel: l === "fr" ? "Bonne réponse" : l === "ht" ? "Bon repons" : "Correct",
    wrongLabel: l === "fr" ? "Mauvaise réponse" : l === "ht" ? "Move repons" : "Incorrect",
    explanation: l === "fr" ? "Explication" : l === "ht" ? "Eksplikasyon" : "Explanation",
    points: l === "fr" ? "+100 points" : l === "ht" ? "+100 pwen" : "+100 points",
    playGames: l === "fr" ? "S'entraîner avec les jeux" : l === "ht" ? "Pratike ak jwèt yo" : "Practice with games",
    leaderboard: l === "fr" ? "Classement de la semaine" : l === "ht" ? "Klasman semèn nan" : "This week's rankings",
    streak: l === "fr" ? "jours consécutifs" : l === "ht" ? "jou konsekitif" : "day streak",
    score: l === "fr" ? "pts" : l === "ht" ? "pwen" : "pts",
    howItWorks: l === "fr" ? "Comment ça marche" : l === "ht" ? "Kijan sa travay" : "How it works",
    step1: l === "fr" ? "Une question biblique chaque jour à minuit." : l === "ht" ? "Yon kesyon biblik chak jou a minwi." : "One biblical question every day at midnight.",
    step2: l === "fr" ? "Répondez en moins de 24h pour marquer des points." : l === "ht" ? "Repon nan mwens 24h pou make pwen." : "Answer within 24h to score points.",
    step3: l === "fr" ? "Les séries de bonnes réponses multiplient votre score." : l === "ht" ? "Seri bon repons yo miltipliye pwen ou." : "Answer streaks multiply your score.",
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-[#0b0f1a] px-5 sm:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.25em] mb-6">
            {txt.label}
          </p>
          <h1 className="text-white font-black text-3xl sm:text-5xl leading-tight mb-4">
            {txt.headline}
          </h1>
          <p className="text-white/40 text-base leading-relaxed max-w-xl">
            {txt.sub}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 flex flex-col lg:flex-row gap-10">

        {/* Left: Question */}
        <div className="flex-1">
          <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">
            {txt.todayQ}
          </p>

          <div className="bg-[#f8f6f2] rounded-2xl p-7 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a84f] border border-[#c5a84f]/30 px-2 py-0.5 rounded">
                {txt.ref} · {q.ref}
              </span>
            </div>
            <p className="text-[#0b0f1a] font-bold text-lg leading-snug">
              {qData.question}
            </p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {qData.options.map((opt, i) => {
              let cls = "border border-stone-200 text-stone-700 hover:border-[#0b0f1a] hover:text-[#0b0f1a]";
              if (answered) {
                if (i === qData.answer) cls = "border-2 border-green-500 bg-green-50 text-green-800 font-semibold";
                else if (i === selected && i !== qData.answer) cls = "border-2 border-red-300 bg-red-50 text-red-700";
                else cls = "border border-stone-100 text-stone-300";
              }
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={`w-full text-left px-5 py-4 rounded-xl text-sm font-medium transition-all ${cls} ${!answered ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className="text-xs font-black mr-3 opacity-50">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`rounded-xl px-6 py-5 ${correct ? "bg-green-50 border border-green-200" : "bg-stone-50 border border-stone-200"}`}>
              <p className={`text-sm font-bold mb-2 ${correct ? "text-green-700" : "text-stone-600"}`}>
                {correct ? `✓ ${txt.correctLabel} · ${txt.points}` : `— ${txt.wrongLabel}`}
              </p>
              <p className="text-xs text-stone-500 leading-relaxed">{txt.explanation} : {qData.explanation}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-stone-100">
            <Link
              href="/jeu"
              className="text-stone-400 text-sm hover:text-[#0b0f1a] transition-colors font-medium"
            >
              {txt.playGames} →
            </Link>
          </div>
        </div>

        {/* Right: Leaderboard + How it works */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-8">

          {/* Leaderboard */}
          <div>
            <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
              {txt.leaderboard}
            </p>
            <div className="flex flex-col divide-y divide-stone-100">
              {leaderboard.map((p, i) => (
                <div key={i} className="py-3.5 flex items-center gap-3">
                  <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-[#c5a84f]" : "text-stone-300"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0b0f1a] truncate">{p.name}</p>
                    <p className="text-[10px] text-stone-400">{p.streak} {txt.streak}</p>
                  </div>
                  <span className="text-xs font-bold text-stone-500">{p.score.toLocaleString()} {txt.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-[#f8f6f2] rounded-2xl p-6">
            <p className="text-[#0b0f1a] font-bold text-sm mb-5">{txt.howItWorks}</p>
            <div className="flex flex-col gap-4">
              {[txt.step1, txt.step2, txt.step3].map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[#c5a84f] font-black text-xs shrink-0 mt-0.5">{i + 1}.</span>
                  <p className="text-stone-500 text-xs leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
