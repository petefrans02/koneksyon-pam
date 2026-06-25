"use client";

import { useLang } from "@/lib/LangContext";
import { bibleBooks } from "@/lib/bible-books";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function BibleChapterPage() {
  const { lang } = useLang();
  const params = useParams();
  const bookSlug = params.book as string;
  const chapterNum = parseInt(params.chapter as string);

  const book = bibleBooks.find((b) => b.slug === bookSlug);
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiStudy, setAiStudy] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (book) loadChapter();
  }, [book, chapterNum, lang]);

  async function loadChapter() {
    setLoading(true);
    setAiStudy("");
    const res = await fetch(`/api/bible?book=${book?.id}&chapter=${chapterNum}&lang=${lang}`);
    const data = await res.json();
    setText(data.text || "");
    setTranslation(data.translation || "");
    setLoading(false);
  }

  async function loadAiStudy() {
    if (aiStudy) { setAiStudy(""); return; }
    setAiLoading(true);
    const bookName = book?.name[lang] || book?.name.fr;
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: `Fais un résumé et une étude approfondie de ${bookName} chapitre ${chapterNum}. Explique le contexte historique, les thèmes principaux, les personnages, et comment appliquer ce passage dans notre vie aujourd'hui.`,
        lang,
      }),
    });
    const data = await res.json();
    setAiStudy(data.answer || "");
    setAiLoading(false);
  }

  if (!book) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">📖</p>
        <p className="text-stone-500">Livre non trouvé</p>
        <Link href="/bible" className="text-blue-500 hover:underline mt-4 block">← Bible</Link>
      </div>
    );
  }

  const bookName = book.name[lang] || book.name.fr;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/bible" className="text-blue-500 text-sm hover:underline mb-6 block">← {lang === "fr" ? "La Bible" : "Bible"}</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{bookName}</h1>
          <p className="text-blue-500 text-sm font-medium">{lang === "fr" ? "Chapitre" : lang === "ht" ? "Chapit" : "Chapter"} {chapterNum}</p>
        </div>
        <div className="flex gap-2">
          {chapterNum > 1 && (
            <Link href={`/bible/${bookSlug}/${chapterNum - 1}`} className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-200">← {chapterNum - 1}</Link>
          )}
          {chapterNum < book.chapters && (
            <Link href={`/bible/${bookSlug}/${chapterNum + 1}`} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">{chapterNum + 1} →</Link>
          )}
        </div>
      </div>

      {/* Chapter selector */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
          <Link
            key={ch}
            href={`/bible/${bookSlug}/${ch}`}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
              ch === chapterNum ? "bg-blue-600 text-white" : "bg-white text-stone-500 border border-stone-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {ch}
          </Link>
        ))}
      </div>

      {/* Text */}
      <div className="bg-white rounded-2xl border border-blue-100 p-6 sm:p-8 shadow-sm mb-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : text ? (
          <>
            <div className="text-stone-700 leading-relaxed whitespace-pre-line text-[15px]">{text}</div>
            {translation && <p className="text-xs text-blue-500 mt-4 font-medium">📖 {translation}</p>}
          </>
        ) : (
          <p className="text-stone-400 text-center py-8">{lang === "fr" ? "Texte non disponible" : "Text not available"}</p>
        )}
      </div>

      {/* AI Study + Share */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={loadAiStudy}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {aiLoading ? "⏳ ..." : aiStudy ? "✕ Fermer" : `🕊️ ${lang === "fr" ? "Étude approfondie (IA)" : "Deep study (AI)"}`}
        </button>
        <button
          onClick={() => navigator.share?.({ title: `${bookName} ${chapterNum}`, text: text.slice(0, 200), url: window.location.href })}
          className="bg-stone-100 text-stone-600 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-200"
        >
          ↗ {lang === "fr" ? "Partager" : "Share"}
        </button>
      </div>

      {aiLoading && (
        <div className="flex items-center gap-3 text-blue-500 mb-6">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">{lang === "fr" ? "L'IA analyse ce chapitre..." : "AI analyzing..."}</span>
        </div>
      )}

      {aiStudy && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🕊️</span>
            <h4 className="font-bold text-blue-800 text-sm">{lang === "fr" ? "Étude approfondie" : "Deep study"} — {bookName} {chapterNum}</h4>
          </div>
          <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
            {aiStudy.replace(/\*\*(.*?)\*\*/g, "$1").replace(/["«»]/g, "")}
          </div>
        </div>
      )}

      {/* Navigation bottom */}
      <div className="flex justify-between">
        {chapterNum > 1 ? (
          <Link href={`/bible/${bookSlug}/${chapterNum - 1}`} className="bg-stone-100 text-stone-600 px-5 py-2.5 rounded-xl font-medium hover:bg-stone-200">← {lang === "fr" ? "Chapitre" : "Ch."} {chapterNum - 1}</Link>
        ) : <div />}
        {chapterNum < book.chapters && (
          <Link href={`/bible/${bookSlug}/${chapterNum + 1}`} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90">{lang === "fr" ? "Chapitre" : "Ch."} {chapterNum + 1} →</Link>
        )}
      </div>
    </div>
  );
}
