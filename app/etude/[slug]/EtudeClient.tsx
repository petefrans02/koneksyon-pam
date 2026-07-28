"use client";
import { gl, gla } from "@/lib/lang-helper";

import { useLang } from "@/lib/LangContext";
import { studies, adjacentStudies, studyIcon, studyAccent } from "@/lib/studies-data";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/app/components/Icon";

const FR_TO_ES_BOOKS: Record<string, string> = {
  "Genèse": "Génesis", "Exode": "Éxodo", "Lévitique": "Levítico", "Nombres": "Números",
  "Deutéronome": "Deuteronomio", "Josué": "Josué", "Juges": "Jueces", "Ruth": "Rut",
  "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel", "1 Rois": "1 Reyes", "2 Rois": "2 Reyes",
  "1 Chroniques": "1 Crónicas", "2 Chroniques": "2 Crónicas", "Esdras": "Esdras",
  "Néhémie": "Nehemías", "Esther": "Ester", "Job": "Job", "Psaumes": "Salmos",
  "Proverbes": "Proverbios", "Ecclésiaste": "Eclesiastés", "Cantique": "Cantares",
  "Ésaïe": "Isaías", "Jérémie": "Jeremías", "Lamentations": "Lamentaciones",
  "Ézéchiel": "Ezequiel", "Daniel": "Daniel", "Osée": "Oseas", "Joël": "Joel",
  "Amos": "Amós", "Abdias": "Abdías", "Jonas": "Jonás", "Michée": "Miqueas",
  "Nahoum": "Nahúm", "Habacuc": "Habacuc", "Sophonie": "Sofonías", "Aggée": "Ageo",
  "Zacharie": "Zacarías", "Malachie": "Malaquías", "Matthieu": "Mateo", "Marc": "Marcos",
  "Luc": "Lucas", "Jean": "Juan", "Actes": "Hechos", "Romains": "Romanos",
  "1 Corinthiens": "1 Corintios", "2 Corinthiens": "2 Corintios", "Galates": "Gálatas",
  "Éphésiens": "Efesios", "Philippiens": "Filipenses", "Colossiens": "Colosenses",
  "1 Thessaloniciens": "1 Tesalonicenses", "2 Thessaloniciens": "2 Tesalonicenses",
  "1 Timothée": "1 Timoteo", "2 Timothée": "2 Timoteo", "Tite": "Tito",
  "Philémon": "Filemón", "Hébreux": "Hebreos", "Jacques": "Santiago",
  "1 Pierre": "1 Pedro", "2 Pierre": "2 Pedro", "1 Jean": "1 Juan",
  "2 Jean": "2 Juan", "3 Jean": "3 Juan", "Jude": "Judas", "Apocalypse": "Apocalipsis",
};

function translateVerseRef(ref: string, lang: string): string {
  if (lang !== "es") return ref;
  for (const [fr, es] of Object.entries(FR_TO_ES_BOOKS)) {
    if (ref.startsWith(fr)) return es + ref.slice(fr.length);
  }
  return ref;
}

function AIChat({ studyTitle, studyContent }: { studyTitle: string; studyContent: string }) {
  const { lang } = useLang();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const placeholder = lang === "fr" ? "Posez une question sur cette étude..." : lang === "ht" ? "Poze yon kesyon sou etid sa a..." : lang === "es" ? "Haz una pregunta sobre este estudio..." : "Ask a question about this study...";

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
      setMessages((m) => [...m, { role: "ai", text: lang === "fr" ? "Erreur de connexion. Réessayez." : lang === "ht" ? "Erè koneksyon. Eseye ankò." : lang === "es" ? "Error de conexión. Inténtalo de nuevo." : "Connection error. Try again." }]);
    }
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="colombe" size={24} className="text-indigo-600" />
        <h3 className="font-bold text-stone-900">
          {lang === "fr" ? "Assistant Biblique" : lang === "ht" ? "Asistan Biblik" : lang === "es" ? "Asistente Bíblico" : "Bible Assistant"}
        </h3>
      </div>
      <p className="text-sm text-stone-500 mb-4">
        {lang === "fr"
          ? "Posez n'importe quelle question sur la Bible — l'IA vous répond avec des versets"
          : lang === "ht"
          ? "Poze nenpòt kesyon sou Bib la — IA a reponn ou ak vèsè"
          : lang === "es"
          ? "Haz cualquier pregunta sobre la Biblia — la IA responde con versículos"
          : "Ask any question about the Bible — AI answers with verses"}
      </p>

      {messages.length > 0 && (
        <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "user" ? (
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-indigo-600 text-white text-sm leading-relaxed">
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-[90%] px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-stone-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon name="colombe" size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-600">
                      {lang === "fr" ? "Assistant Biblique" : lang === "ht" ? "Asistan Biblik" : lang === "es" ? "Asistente Bíblico" : "Bible Assistant"}
                    </span>
                  </div>
                  <div className="text-[14px] leading-6 text-stone-800 whitespace-pre-line">
                    {msg.text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/["«»]/g, "").replace(/\n{3,}/g, "\n\n")}
                  </div>
                </div>
              )}
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
          {lang === "fr" ? "Envoyer" : lang === "ht" ? "Voye" : lang === "es" ? "Enviar" : "Send"}
        </button>
      </form>
    </div>
  );
}

interface StudyQuizQ { question: string; options: string[]; correct: number; explanation: string; verse?: string }

function StudyQuiz({ slug, title, content, accent }: { slug: string; title: string; content: string; accent: string }) {
  const { lang } = useLang();
  const l = ["fr", "ht", "en", "es"].includes(lang) ? lang : "fr";
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<StudyQuizQ[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const T = {
    btn:     { fr: "Testez vos connaissances", ht: "Teste konesans ou", en: "Test your knowledge", es: "Pon a prueba tu saber" },
    prep:    { fr: "Préparation du quiz…", ht: "N ap prepare kiz la…", en: "Preparing the quiz…", es: "Preparando el quiz…" },
    unavail: { fr: "Quiz indisponible pour le moment. Réessaie plus tard.", ht: "Kiz pa disponib kounye a. Eseye pita.", en: "Quiz unavailable right now. Try again later.", es: "Quiz no disponible ahora. Inténtalo más tarde." },
    title:   { fr: "Test de connaissances", ht: "Tès konesans", en: "Knowledge test", es: "Test de conocimientos" },
    good:    { fr: "✓ Correct !", ht: "✓ Kòrèk !", en: "✓ Correct!", es: "✓ ¡Correcto!" },
    bad:     { fr: "✗ Pas tout à fait…", ht: "✗ Pa fin kòrèk…", en: "✗ Not quite…", es: "✗ No del todo…" },
    next:    { fr: "Suivant →", ht: "Swivan →", en: "Next →", es: "Siguiente →" },
    result:  { fr: "Voir le résultat ★", ht: "Wè rezilta ★", en: "See result ★", es: "Ver resultado ★" },
    yourScore:{ fr: "Votre score", ht: "Nòt ou", en: "Your score", es: "Tu puntuación" },
    restart: { fr: "Recommencer", ht: "Rekòmanse", en: "Restart", es: "Reiniciar" },
    close:   { fr: "Fermer", ht: "Fèmen", en: "Close", es: "Cerrar" },
    great:   { fr: "Excellent travail !", ht: "Bèl travay !", en: "Great job!", es: "¡Excelente!" },
    keep:    { fr: "Continue à étudier — tu progresses !", ht: "Kontinye etidye — w ap avanse !", en: "Keep studying — you're growing!", es: "Sigue estudiando — ¡vas creciendo!" },
  } as const;
  const tr = (o: Record<string, string>) => o[l] ?? o.fr;

  async function openQuiz() {
    setOpen(true); setCur(0); setSelected(null); setCorrect(0); setDone(false);
    if (questions) return;
    setLoading(true);
    const cacheKey = `sq-${slug}-${l}`;
    try {
      const c = sessionStorage.getItem(cacheKey);
      if (c) { setQuestions(JSON.parse(c)); setLoading(false); return; }
    } catch {}
    try {
      const res = await fetch("/api/study-quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, title, content, lang: l }) });
      const data = await res.json();
      const qs: StudyQuizQ[] = Array.isArray(data.questions) ? data.questions : [];
      setQuestions(qs);
      try { sessionStorage.setItem(cacheKey, JSON.stringify(qs)); } catch {}
    } catch { setQuestions([]); }
    setLoading(false);
  }

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (questions && i === questions[cur].correct) setCorrect((c) => c + 1);
  }
  function next() {
    if (!questions) return;
    if (cur + 1 >= questions.length) { setDone(true); return; }
    setCur((c) => c + 1); setSelected(null);
  }

  const q = questions && !done ? questions[cur] : null;
  const total = questions?.length ?? 0;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  return (
    <>
      <button onClick={openQuiz}
        className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:shadow-md transition-all text-left w-full"
        style={{ cursor: "pointer" }}>
        <Icon name="quiz" size={22} className="text-amber-600" />
        <span className="text-sm font-semibold text-stone-800">{tr(T.btn)}</span>
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,18,34,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,0.4)", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
            {/* En-tête */}
            <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, padding: "18px 22px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="quiz" size={20} />
                <div>
                  <p style={{ fontWeight: 900, fontSize: "0.95rem" }}>{tr(T.title)}</p>
                  <p style={{ fontSize: "0.72rem", opacity: 0.85 }}>{title}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontWeight: 800 }}>✕</button>
            </div>

            <div style={{ padding: "22px", overflowY: "auto" }}>
              {loading && (
                <div style={{ textAlign: "center", padding: "36px 0", color: "#4a6080" }}>
                  <div style={{ width: 34, height: 34, border: `3px solid ${accent}30`, borderTopColor: accent, borderRadius: "50%", margin: "0 auto 14px", animation: "sq-spin .8s linear infinite" }} />
                  {tr(T.prep)}
                  <style>{`@keyframes sq-spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              )}

              {!loading && questions && questions.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#4a6080" }}>{tr(T.unavail)}</div>
              )}

              {!loading && q && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: accent }}>{cur + 1}/{total}</span>
                    <div style={{ flex: 1, height: 6, background: "#f0ede8", borderRadius: 999, marginLeft: 12, overflow: "hidden" }}>
                      <div style={{ width: `${((cur + (selected !== null ? 1 : 0)) / total) * 100}%`, height: "100%", background: accent, transition: "width .3s" }} />
                    </div>
                  </div>
                  <p style={{ fontSize: "1.02rem", fontWeight: 800, color: "#1a3568", marginBottom: 16, lineHeight: 1.4 }}>{q.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {q.options.map((opt, i) => {
                      let bg = "#fff", bd = "#e8e4de", col = "#2d3748";
                      if (selected !== null) {
                        if (i === q.correct) { bg = "rgba(22,163,74,0.10)"; bd = "#16a34a"; col = "#166534"; }
                        else if (i === selected) { bg = "rgba(220,38,38,0.08)"; bd = "#dc2626"; col = "#991b1b"; }
                      }
                      return (
                        <button key={i} onClick={() => choose(i)} disabled={selected !== null}
                          style={{ textAlign: "left", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${bd}`, background: bg, color: col, fontSize: "0.88rem", fontWeight: 600, cursor: selected === null ? "pointer" : "default", transition: "all .2s" }}>
                          <span style={{ fontWeight: 800, marginRight: 8, color: accent }}>{String.fromCharCode(65 + i)}.</span>{opt}
                        </button>
                      );
                    })}
                  </div>
                  {selected !== null && (
                    <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: selected === q.correct ? "rgba(22,163,74,0.07)" : "rgba(251,191,36,0.09)", border: `1px solid ${selected === q.correct ? "rgba(22,163,74,0.2)" : "rgba(251,191,36,0.25)"}` }}>
                      <p style={{ fontWeight: 800, fontSize: "0.82rem", color: selected === q.correct ? "#16a34a" : "#c8960f", marginBottom: 4 }}>{selected === q.correct ? tr(T.good) : tr(T.bad)}</p>
                      <p style={{ fontSize: "0.82rem", color: "#4a6080", lineHeight: 1.55 }}>{q.explanation}</p>
                      {q.verse && <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 6, fontStyle: "italic", display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="verset" size={12} /> {q.verse}</p>}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                        <button onClick={next} style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "#fff", border: "none", padding: "9px 22px", borderRadius: 999, fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}>
                          {cur + 1 >= total ? tr(T.result) : tr(T.next)}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!loading && done && (
                <div style={{ textAlign: "center", padding: "18px 0" }}>
                  <div style={{ display: "inline-flex", marginBottom: 10, color: accent }}><Icon name={pct >= 60 ? "trophee" : "cible"} size={54} /></div>
                  <p style={{ fontWeight: 900, fontSize: "1.15rem", color: "#1a3568", marginBottom: 4 }}>{pct >= 60 ? tr(T.great) : tr(T.keep)}</p>
                  <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: 10 }}>{tr(T.yourScore)}</p>
                  <div style={{ fontSize: "2.4rem", fontWeight: 900, color: accent, marginBottom: 16 }}>{correct}/{total}</div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button onClick={() => { setCur(0); setSelected(null); setCorrect(0); setDone(false); }} style={{ background: "#f0ede8", color: "#1a3568", border: "none", padding: "10px 22px", borderRadius: 999, fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}>{tr(T.restart)}</button>
                    <button onClick={() => setOpen(false)} style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "#fff", border: "none", padding: "10px 22px", borderRadius: 999, fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}>{tr(T.close)}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function EtudeClient() {
  const { lang } = useLang();
  const params = useParams();
  const slug = params.slug as string;
  const study = studies.find((s) => s.slug === slug);
  const [currentSection, setCurrentSection] = useState(0);

  if (!study) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="mb-4 flex justify-center"><Icon name="etude" size={48} className="text-stone-400" /></p>
        <p className="text-stone-500">{lang === "fr" ? "Étude non trouvée" : lang === "ht" ? "Etid pa jwenn" : lang === "es" ? "Estudio no encontrado" : "Study not found"}</p>
        <Link href="/etude" className="text-amber-600 hover:underline mt-4 block">← {lang === "fr" ? "Retour" : lang === "ht" ? "Tounen" : lang === "es" ? "Volver" : "Back"}</Link>
      </div>
    );
  }

  const section = study.sections[currentSection];
  const isLastSection = currentSection === study.sections.length - 1;
  const progress = ((currentSection + 1) / study.sections.length) * 100;
  const allContent = study.sections.map((s) => gl(s.content, lang)).join("\n\n");
  const accent = studyAccent(study.color);
  const { prev: prevStudy, next: nextStudy } = adjacentStudies(study.slug);

  return (
    <main className="animate-page-awaken" style={{ background: "#ffffff", minHeight: "100vh" }}>
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href={`/etude?parcours=${study.parcours}`} className="text-sm hover:underline mb-6 inline-flex items-center gap-1" style={{ color: accent }}>
        ← {lang === "fr" ? "Toutes les leçons" : lang === "ht" ? "Tout leson yo" : lang === "es" ? "Todas las lecciones" : "All lessons"}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `${accent}14`, border: `1px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={studyIcon(study.slug)} size={28} color={accent} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a3568", fontFamily: "'Playfair Display',Georgia,serif" }}>{gl(study.title, lang)}</h1>
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
          <Icon name="verset" size={16} className="text-amber-600" />
          <span className="text-sm text-amber-800 font-medium">{translateVerseRef(section.verse, lang)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 gap-3">
        <button
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-30"
        >
          ← {lang === "fr" ? "Précédent" : lang === "ht" ? "Anvan" : lang === "es" ? "Anterior" : "Previous"}
        </button>
        {!isLastSection ? (
          <button
            onClick={() => setCurrentSection(currentSection + 1)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r ${study.color} hover:opacity-90 transition-opacity`}
          >
            {lang === "fr" ? "Suivant" : lang === "ht" ? "Swivan" : lang === "es" ? "Siguiente" : "Next"} →
          </button>
        ) : nextStudy ? (
          <Link
            href={`/etude/${nextStudy.slug}`}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${study.color} hover:opacity-90 transition-opacity inline-flex items-center gap-2 text-right`}
          >
            <span>
              <span className="block text-[10px] font-semibold opacity-80 leading-none">{lang === "fr" ? "Leçon suivante" : lang === "ht" ? "Pwochen leson" : lang === "es" ? "Siguiente lección" : "Next lesson"}</span>
              <span className="block leading-tight">{gl(nextStudy.title, lang)} →</span>
            </span>
          </Link>
        ) : (
          <Link
            href={`/etude?parcours=${study.parcours}`}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${study.color} hover:opacity-90 transition-opacity inline-flex items-center gap-2`}
          >
            <Icon name="valider" size={16} /> {lang === "fr" ? "Parcours terminé" : lang === "ht" ? "Parcou fini" : lang === "es" ? "Itinerario completado" : "Path completed"}
          </Link>
        )}
      </div>

      {study.keyVerses.length > 0 && (
        <div className="mt-8 bg-stone-50 rounded-2xl border border-stone-200 p-5">
          <h3 className="font-bold text-stone-900 mb-3">
            {lang === "fr" ? "Versets clés" : lang === "ht" ? "Vèsè kle" : lang === "es" ? "Versículos clave" : "Key verses"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {study.keyVerses.map((v, i) => (
              <span key={i} className="bg-white border border-stone-200 text-stone-600 text-sm px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                <Icon name="verset" size={14} /> {translateVerseRef(v, lang)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ══ CONNEXIONS — leçons reliées, aucune impasse ══ */}
      <div className="mt-8 rounded-2xl border p-5" style={{ borderColor: `${accent}2a`, background: `linear-gradient(135deg, ${accent}0c, #fff)` }}>
        <h3 className="font-bold mb-4" style={{ color: "#1a3568", fontFamily: "'Playfair Display',Georgia,serif" }}>
          {lang === "fr" ? "Poursuivez votre apprentissage" : lang === "ht" ? "Kontinye aprann" : lang === "es" ? "Continúa tu aprendizaje" : "Continue your learning"}
        </h3>

        {/* Leçon suivante mise en avant */}
        {nextStudy && (
          <Link href={`/etude/${nextStudy.slug}`} className="flex items-center gap-4 rounded-xl bg-white p-4 mb-3 transition-all hover:shadow-md" style={{ border: `1px solid ${accent}33` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${studyAccent(nextStudy.color)}14`, border: `1px solid ${studyAccent(nextStudy.color)}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={studyIcon(nextStudy.slug)} size={22} color={studyAccent(nextStudy.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: accent }}>{lang === "fr" ? "Leçon suivante" : lang === "ht" ? "Pwochen leson" : lang === "es" ? "Siguiente lección" : "Next lesson"}</span>
              <p className="text-sm font-bold text-stone-800 truncate">{gl(nextStudy.title, lang)}</p>
            </div>
            <Icon name="fleche_droite" size={20} color={accent} />
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {isLastSection && (
            <StudyQuiz slug={study.slug} title={gl(study.title, lang)} content={allContent} accent={accent} />
          )}
          <Link href={`/etude?parcours=${study.parcours}`} className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all">
            <Icon name="cours" size={22} className="text-blue-500" />
            <span className="text-sm font-semibold text-stone-800">
              {lang === "fr" ? "Toutes les leçons" : lang === "ht" ? "Tout leson yo" : lang === "es" ? "Todas las lecciones" : "All lessons"}
            </span>
          </Link>
          <Link href="/bible" className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-300 hover:shadow-md transition-all">
            <Icon name="bible" size={22} className="text-emerald-500" />
            <span className="text-sm font-semibold text-stone-800">
              {lang === "fr" ? "Lire dans la Bible" : lang === "ht" ? "Li nan Bib la" : lang === "es" ? "Leer en la Biblia" : "Read in the Bible"}
            </span>
          </Link>
        </div>

        {prevStudy && (
          <Link href={`/etude/${prevStudy.slug}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-700">
            ← {lang === "fr" ? "Leçon précédente" : lang === "ht" ? "Leson anvan" : lang === "es" ? "Lección anterior" : "Previous lesson"} : {gl(prevStudy.title, lang)}
          </Link>
        )}
      </div>

      <AIChat studyTitle={gl(study.title, lang)} studyContent={allContent} />
    </div>
    </main>
  );
}
