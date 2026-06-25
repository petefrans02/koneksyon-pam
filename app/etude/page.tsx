"use client";
import { gl, gla } from "@/lib/lang-helper";

import { useLang } from "@/lib/LangContext";
import { studies } from "@/lib/studies-data";
import Link from "next/link";

export default function EtudePage() {
  const { lang } = useLang();
  const title = lang === "fr" ? "Études Bibliques" : lang === "ht" ? "Etid Biblik" : "Bible Studies";
  const subtitle = lang === "fr" ? "Approfondissez votre connaissance de la Parole de Dieu" : lang === "ht" ? "Apwofondi konesans ou nan Pawòl Bondye a" : "Deepen your knowledge of God's Word";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <span className="text-5xl block mb-3">📚</span>
        <h1 className="text-3xl font-bold text-stone-900">{title}</h1>
        <p className="text-stone-500 mt-2">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {studies.map((study) => (
          <Link
            key={study.slug}
            href={`/etude/${study.slug}`}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className={`h-2 bg-gradient-to-r ${study.color}`} />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{study.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-stone-900 group-hover:text-amber-600 transition-colors">
                    {gl(study.title, lang)}
                  </h3>
                  <p className="text-sm text-stone-500 mt-1">{gl(study.description, lang)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="bg-stone-100 text-stone-600 text-xs font-medium px-2.5 py-1 rounded-full">
                      ⏱ {study.duration}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      gl(study.difficulty, lang) === "Débutant" || gl(study.difficulty, lang) === "Debitan" || gl(study.difficulty, lang) === "Beginner"
                        ? "bg-green-100 text-green-700"
                        : gl(study.difficulty, lang) === "Intermédiaire" || gl(study.difficulty, lang) === "Entèmedyè" || gl(study.difficulty, lang) === "Intermediate"
                        ? "bg-amber-100 text-amber-700"
                        : gl(study.difficulty, lang) === "Avancé" || gl(study.difficulty, lang) === "Avanse" || gl(study.difficulty, lang) === "Advanced"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {gl(study.difficulty, lang)}
                    </span>
                    <span className="text-xs text-stone-400">
                      {study.sections.length} {lang === "fr" ? "leçons" : lang === "ht" ? "leson" : "lessons"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
