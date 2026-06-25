"use client";
import { gl, gla } from "@/lib/lang-helper";

import { useLang } from "@/lib/LangContext";
import { studies } from "@/lib/studies-data";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function AIChat({ studyTitle, studyContent }: { studyTitle: string; studyContent: string }) {
  const { lang } = useLang();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const placeholder = lang === "fr" ? "Posez une question sur cette étude..." : lang === "ht" ? "Poze yon kesyon sou etid sa a..." : "Ask a question about this study...";

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const q = question.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, studyTitle, studyContent, lang }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.answer || "..." }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: lang === "fr" ? "Erreur de connexion. Réessayez." : "Connection error. Try again." }]);
    }
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🕊️</span>
        <h3 className="font-bold text-stone-900">
          {lang === "fr" ? "Assistant Biblique" : lang === "ht" ? "Asistan Biblik" : "Bible Assistant"}
        </h3>
      </div>
      <p className="text-sm text-stone-500 mb-4">
        {lang === "fr"
          ? "Posez n'importe quelle question sur la Bible — l'IA vous répond avec des versets"
          : lang === "ht"
          ? "Poze nenpòt kesyon sou Bib la — IA a reponn ou ak vèsè"
          : "Ask any question about the Bible — AI answers with verses"}
      </p>

      {messages.length > 0 && (
        <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-md"
                  : "bg-white text-stone-700 border border-stone-200 rounded-bl-md"
              }`}>
                {msg.role === "ai" && <span className="text-indigo-500 font-bold mr-1">📖</span>}
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border border-indigo-200 rounded-xl px-4 py-3 text-sm bg-white focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-colors text-sm disabled:opacity-50"
        >
          {lang === "fr" ? "Envoyer" : lang === "ht" ? "Voye" : "Send"}
        </button>
      </form>
    </div>
  );
}

export default function StudyPage() {
  const { lang } = useLang();
  const params = useParams();
  const slug = params.slug as string;
  const study = studies.find((s) => s.slug === slug);
  const [currentSection, setCurrentSection] = useState(0);

  if (!study) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">📚</p>
        <p className="text-stone-500">{lang === "fr" ? "Étude non trouvée" : "Study not found"}</p>
        <Link href="/etude" className="text-amber-600 hover:underline mt-4 block">← {lang === "fr" ? "Retour" : "Back"}</Link>
      </div>
    );
  }

  const section = study.sections[currentSection];
  const progress = ((currentSection + 1) / study.sections.length) * 100;
  const allContent = study.sections.map((s) => gl(s.content, lang)).join("\n\n");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/etude" className="text-amber-600 text-sm hover:underline mb-6 block">
        ← {lang === "fr" ? "Toutes les études" : lang === "ht" ? "Tout etid yo" : "All studies"}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${study.color} flex items-center justify-center text-3xl shrink-0`}>
          {study.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{gl(study.title, lang)}</h1>
          <p className="text-stone-500 text-sm">{gl(study.description, lang)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${study.color} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-bold text-stone-400">{currentSection + 1}/{study.sections.length}</span>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {study.sections.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrentSection(i)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              i === currentSection
                ? `bg-gradient-to-r ${study.color} text-white shadow-md`
                : i < currentSection
                ? "bg-green-100 text-green-700"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {i < currentSection ? "✓ " : ""}{gl(s.title, lang)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-stone-900 mb-6">{gl(section.title, lang)}</h2>
        <div className="text-stone-700 leading-relaxed whitespace-pre-line text-[15px]">
          {gl(section.content, lang)}
        </div>
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-amber-600">📖</span>
          <span className="text-sm text-amber-800 font-medium">{section.verse}</span>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-30"
        >
          ← {lang === "fr" ? "Précédent" : lang === "ht" ? "Anvan" : "Previous"}
        </button>
        <button
          onClick={() => setCurrentSection(Math.min(study.sections.length - 1, currentSection + 1))}
          disabled={currentSection === study.sections.length - 1}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r ${study.color} hover:opacity-90 transition-opacity disabled:opacity-30`}
        >
          {lang === "fr" ? "Suivant" : lang === "ht" ? "Swivan" : "Next"} →
        </button>
      </div>

      {study.keyVerses.length > 0 && (
        <div className="mt-8 bg-stone-50 rounded-2xl border border-stone-200 p-5">
          <h3 className="font-bold text-stone-900 mb-3">
            {lang === "fr" ? "Versets clés" : lang === "ht" ? "Vèsè kle" : "Key verses"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {study.keyVerses.map((v, i) => (
              <span key={i} className="bg-white border border-stone-200 text-stone-600 text-sm px-3 py-1.5 rounded-full">
                📖 {v}
              </span>
            ))}
          </div>
        </div>
      )}

      <AIChat studyTitle={gl(study.title, lang)} studyContent={allContent} />
    </div>
  );
}
