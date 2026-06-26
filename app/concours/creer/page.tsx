"use client";

import RequireAuth from "@/app/components/RequireAuth";
import { useLang } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

type Lang = "fr" | "ht" | "en";

interface Question {
  question_fr: string;
  correct_answer: number;
  options_fr: string[];
  reference: string;
  time_limit: number;
}

const emptyQuestion = (): Question => ({
  question_fr: "",
  correct_answer: 0,
  options_fr: ["", "", "", ""],
  reference: "",
  time_limit: 30,
});

export default function CreerConcoursPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [adminChecked, setAdminChecked] = useState(false);
  const [adminOk, setAdminOk] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) router.replace("/concours");
      else setAdminOk(true);
      setAdminChecked(true);
    });
  }, [router]);

  const txt = {
    headline: l === "fr" ? "Créer un concours" : l === "ht" ? "Kreye yon konkou" : "Create a contest",
    sub: l === "fr" ? "Configurez les questions et les paramètres. Vous contrôlerez le déroulement en direct."
       : l === "ht" ? "Konfigire kesyon yo ak paramèt yo. Ou pral kontwole deroúlman an an dirèk."
       : "Configure questions and settings. You will control the flow live.",
    titleLabel: l === "fr" ? "Titre du concours" : l === "ht" ? "Tit konkou a" : "Contest title",
    descLabel: l === "fr" ? "Description (optionnel)" : l === "ht" ? "Deskripsyon (opsyonèl)" : "Description (optional)",
    maxLabel: l === "fr" ? "Nombre max de participants" : l === "ht" ? "Maks patisipan" : "Max participants",
    questionsLabel: l === "fr" ? "Questions" : l === "ht" ? "Kesyon" : "Questions",
    questionPlaceholder: l === "fr" ? "Posez votre question ici..." : l === "ht" ? "Poze kesyon ou a isit..." : "Ask your question here...",
    optionPlaceholder: (i: number) => `${l === "fr" ? "Option" : l === "ht" ? "Opsyon" : "Option"} ${String.fromCharCode(65 + i)}`,
    correctLabel: l === "fr" ? "Réponse correcte" : l === "ht" ? "Bon repons" : "Correct answer",
    refLabel: l === "fr" ? "Référence biblique" : l === "ht" ? "Referans biblik" : "Bible reference",
    timeLabel: l === "fr" ? "Temps par question (sec)" : l === "ht" ? "Tan pou kesyon (sèk)" : "Time per question (sec)",
    addQ: l === "fr" ? "Ajouter une question" : l === "ht" ? "Ajoute yon kesyon" : "Add question",
    removeQ: l === "fr" ? "Supprimer" : l === "ht" ? "Efase" : "Remove",
    submit: l === "fr" ? "Créer le concours" : l === "ht" ? "Kreye konkou a" : "Create contest",
    cancel: l === "fr" ? "Annuler" : l === "ht" ? "Anile" : "Cancel",
  };

  function updateQuestion(i: number, field: keyof Question, val: string | number | string[]) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  }
  function updateOption(qi: number, oi: number, val: string) {
    setQuestions(qs => qs.map((q, idx) => idx === qi ? { ...q, options_fr: q.options_fr.map((o, j) => j === oi ? val : o) } : q));
  }

  async function handleSubmit() {
    setError("");
    if (!title.trim()) { setError(l === "fr" ? "Le titre est requis." : l === "ht" ? "Tit la obligatwa." : "Title is required."); return; }
    if (questions.some(q => !q.question_fr.trim() || q.options_fr.some(o => !o.trim()))) {
      setError(l === "fr" ? "Remplissez toutes les questions et options." : l === "ht" ? "Ranpli tout kesyon ak opsyon yo." : "Fill all questions and options.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/contests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, max_participants: maxParticipants, questions }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.contest_id) {
      router.push(`/concours/${data.contest_id}`);
    } else {
      setError(data.error || "Erreur");
    }
  }

  if (!adminChecked || !adminOk) return null;

  return (
    <RequireAuth>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="bg-[#0b0f1a] px-5 sm:px-8 py-14">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
              {l === "fr" ? "Nouveau concours" : l === "ht" ? "Nouvo konkou" : "New contest"}
            </p>
            <h1 className="text-white font-black text-3xl sm:text-4xl mb-3">{txt.headline}</h1>
            <p className="text-white/40 text-sm">{txt.sub}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 flex flex-col gap-10">

          {/* Basic info */}
          <section className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-[#0b0f1a]/60 uppercase tracking-wider mb-2">{txt.titleLabel}</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[#0b0f1a] text-sm font-medium focus:outline-none focus:border-[#0b0f1a] transition-colors"
                placeholder={l === "fr" ? "ex. Concours de Pentecôte 2026" : l === "ht" ? "ex. Konkou Lapannkòt 2026" : "ex. Pentecost Contest 2026"}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0b0f1a]/60 uppercase tracking-wider mb-2">{txt.descLabel}</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[#0b0f1a] text-sm focus:outline-none focus:border-[#0b0f1a] transition-colors resize-none"
              />
            </div>
            <div className="w-48">
              <label className="block text-xs font-bold text-[#0b0f1a]/60 uppercase tracking-wider mb-2">{txt.maxLabel}</label>
              <input
                type="number"
                min={2}
                max={100}
                value={maxParticipants}
                onChange={e => setMaxParticipants(Number(e.target.value))}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[#0b0f1a] text-sm font-bold focus:outline-none focus:border-[#0b0f1a] transition-colors"
              />
            </div>
          </section>

          {/* Questions */}
          <section>
            <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">{txt.questionsLabel}</p>
            <div className="flex flex-col gap-6">
              {questions.map((q, qi) => (
                <div key={qi} className="border border-stone-200 rounded-2xl p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#c5a84f] font-black text-sm">Q{qi + 1}</span>
                    {questions.length > 1 && (
                      <button onClick={() => setQuestions(qs => qs.filter((_, i) => i !== qi))}
                        className="text-stone-300 text-xs hover:text-red-400 transition-colors font-medium">
                        {txt.removeQ}
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#0b0f1a]/50 uppercase tracking-wider mb-2">
                      {l === "fr" ? "Question" : l === "ht" ? "Kesyon" : "Question"}
                    </label>
                    <textarea
                      value={q.question_fr}
                      onChange={e => updateQuestion(qi, "question_fr", e.target.value)}
                      rows={2}
                      placeholder={txt.questionPlaceholder}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[#0b0f1a] text-sm focus:outline-none focus:border-[#0b0f1a] transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {q.options_fr.map((opt, oi) => (
                      <div key={oi} className="relative">
                        <input
                          value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)}
                          placeholder={txt.optionPlaceholder(oi)}
                          className={`w-full border rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none transition-colors ${
                            q.correct_answer === oi
                              ? "border-green-400 bg-green-50 text-green-800"
                              : "border-stone-200 text-[#0b0f1a] focus:border-[#0b0f1a]"
                          }`}
                        />
                        <button
                          onClick={() => updateQuestion(qi, "correct_answer", oi)}
                          title={txt.correctLabel}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-colors ${
                            q.correct_answer === oi
                              ? "border-green-500 bg-green-500"
                              : "border-stone-300 hover:border-green-400"
                          }`}
                        >
                          {q.correct_answer === oi && (
                            <span className="text-white text-[10px] flex items-center justify-center h-full">✓</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-[#0b0f1a]/50 uppercase tracking-wider mb-2">{txt.refLabel}</label>
                      <input
                        value={q.reference}
                        onChange={e => updateQuestion(qi, "reference", e.target.value)}
                        placeholder="Jean 3:16"
                        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[#0b0f1a] text-sm focus:outline-none focus:border-[#0b0f1a] transition-colors"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-[10px] font-bold text-[#0b0f1a]/50 uppercase tracking-wider mb-2">{txt.timeLabel}</label>
                      <input
                        type="number"
                        min={10}
                        max={120}
                        value={q.time_limit}
                        onChange={e => updateQuestion(qi, "time_limit", Number(e.target.value))}
                        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[#0b0f1a] text-sm font-bold focus:outline-none focus:border-[#0b0f1a] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setQuestions(qs => [...qs, emptyQuestion()])}
              className="mt-4 w-full border-2 border-dashed border-stone-200 rounded-2xl py-4 text-stone-400 text-sm font-medium hover:border-[#0b0f1a] hover:text-[#0b0f1a] transition-all"
            >
              + {txt.addQ}
            </button>
          </section>

          {/* Submit */}
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <div className="flex gap-3 pb-8">
            <button
              onClick={() => router.back()}
              className="border border-stone-200 text-stone-500 px-6 py-3 rounded-full text-sm font-medium hover:border-stone-400 transition-colors"
            >
              {txt.cancel}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#0b0f1a] text-white px-8 py-3 rounded-full text-sm font-black hover:bg-[#131926] transition-colors disabled:opacity-40"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {l === "fr" ? "Création..." : l === "ht" ? "Kap kreye..." : "Creating..."}
                </span>
              ) : txt.submit}
            </button>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
