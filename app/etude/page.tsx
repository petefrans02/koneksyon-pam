"use client";
import RequireAuth from "@/app/components/RequireAuth";
import { gl } from "@/lib/lang-helper";

import { useLang } from "@/lib/LangContext";
import { studies } from "@/lib/studies-data";
import Link from "next/link";

export default function EtudePage() {
  const { lang } = useLang();
  const title = lang === "fr" ? "Études Bibliques" : lang === "ht" ? "Etid Biblik" : "Bible Studies";
  const subtitle = lang === "fr" ? "Approfondissez votre connaissance de la Parole de Dieu" : lang === "ht" ? "Apwofondi konesans ou nan Pawòl Bondye a" : "Deepen your knowledge of God's Word";

  return (
    <RequireAuth>
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <img src="https://cdn-icons-png.flaticon.com/512/3330/3330999.png" alt="Bible" className="w-14 h-14 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-stone-900">{title}</h1>
        <p className="text-stone-500 mt-2">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {studies.map((study) => (
          <Link
            key={study.slug}
            href={`/etude/${study.slug}`}
            className="bg-white rounded-2xl border border-blue-100 overflow-hidden hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 transition-all group"
          >
            <div className={`h-1.5 bg-gradient-to-r ${study.color}`} />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <img src={study.icon} alt="" className="w-12 h-12 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-stone-900 group-hover:text-blue-600 transition-colors">
                    {gl(study.title, lang)}
                  </h3>
                  <p className="text-sm text-stone-500 mt-1">{gl(study.description, lang)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
                      {study.duration}
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
    </RequireAuth>
  );
}
