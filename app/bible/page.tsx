"use client";

import { useLang } from "@/lib/LangContext";
import { bibleBooks } from "@/lib/bible-books";
import Link from "next/link";
import { useState } from "react";

export default function BiblePage() {
  const { lang } = useLang();
  const [tab, setTab] = useState<"OT" | "NT">("OT");

  const filtered = bibleBooks.filter((b) => b.testament === tab);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <img src="https://cdn-icons-png.flaticon.com/512/3330/3330999.png" alt="" className="w-14 h-14 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "La Bible" : lang === "ht" ? "Bib la" : "The Bible"}
        </h1>
        <p className="text-stone-500 mt-2">
          {lang === "fr" ? "66 livres • 1,189 chapitres • 3 langues" : lang === "ht" ? "66 liv • 1,189 chapit • 3 lang" : "66 books • 1,189 chapters • 3 languages"}
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        <button onClick={() => setTab("OT")} className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${tab === "OT" ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md" : "bg-white text-stone-600 border border-stone-200"}`}>
          {lang === "fr" ? "Ancien Testament" : lang === "ht" ? "Ansyen Testaman" : "Old Testament"} (39)
        </button>
        <button onClick={() => setTab("NT")} className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${tab === "NT" ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md" : "bg-white text-stone-600 border border-stone-200"}`}>
          {lang === "fr" ? "Nouveau Testament" : lang === "ht" ? "Nouvo Testaman" : "New Testament"} (27)
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((book) => (
          <Link
            key={book.id}
            href={`/bible/${book.slug}/1`}
            className="bg-white rounded-xl border border-blue-100 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
          >
            <h3 className="font-bold text-stone-900 group-hover:text-blue-600 transition-colors text-sm">
              {book.name[lang] || book.name.fr}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              {book.chapters} {lang === "fr" ? "chapitres" : lang === "ht" ? "chapit" : "chapters"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
