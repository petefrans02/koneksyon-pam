"use client";

import RequireAuth from "@/app/components/RequireAuth";
import { useLang } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

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
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [titleHt, setTitleHt] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleEs, setTitleEs] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHt, setDescriptionHt] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionEs, setDescriptionEs] = useState("");
  const [theme, setTheme] = useState("");
  const [subject, setSubject] = useState<string>("bible");
  const [schoolLevel, setSchoolLevel] = useState<string>("all");
  const [scope, setScope] = useState<string>("national");
  const [scheduledStartAt, setScheduledStartAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [maxParticipants, setMaxParticipants] = useState(1000);
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [adminChecked, setAdminChecked] = useState(false);
  const [adminOk, setAdminOk] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) router.replace("/championnats");
      else setAdminOk(true);
      setAdminChecked(true);
    });
  }, [router]);

  const txt = {
    headline: l === "fr" ? "Créer un concours" : l === "ht" ? "Kreye yon konkou" : l === "es" ? "Crear un concurso" : "Create a contest",
    sub: l === "fr" ? "Configurez les questions et les paramètres. Vous contrôlerez le déroulement en direct."
       : l === "ht" ? "Konfigire kesyon yo ak paramèt yo. Ou pral kontwole deroúlman an an dirèk."
       : l === "es" ? "Configure las preguntas y los parámetros. Controlarás el flujo en vivo."
       : "Configure questions and settings. You will control the flow live.",
    titleLabel: l === "fr" ? "Titre du concours" : l === "ht" ? "Tit konkou a" : l === "es" ? "Título del concurso" : "Contest title",
    descLabel: l === "fr" ? "Description (optionnel)" : l === "ht" ? "Deskripsyon (opsyonèl)" : l === "es" ? "Descripción (opcional)" : "Description (optional)",
    maxLabel: l === "fr" ? "Nombre max de participants" : l === "ht" ? "Maks patisipan" : l === "es" ? "Máximo de participantes" : "Max participants",
    questionsLabel: l === "fr" ? "Questions" : l === "ht" ? "Kesyon" : l === "es" ? "Preguntas" : "Questions",
    questionPlaceholder: l === "fr" ? "Posez votre question ici..." : l === "ht" ? "Poze kesyon ou a isit..." : l === "es" ? "Haz tu pregunta aquí..." : "Ask your question here...",
    optionPlaceholder: (i: number) => `${l === "fr" ? "Option" : l === "ht" ? "Opsyon" : l === "es" ? "Opción" : "Option"} ${String.fromCharCode(65 + i)}`,
    correctLabel: l === "fr" ? "Réponse correcte" : l === "ht" ? "Bon repons" : l === "es" ? "Respuesta correcta" : "Correct answer",
    refLabel: l === "fr" ? "Référence biblique" : l === "ht" ? "Referans biblik" : l === "es" ? "Referencia bíblica" : "Bible reference",
    timeLabel: l === "fr" ? "Temps par question (sec)" : l === "ht" ? "Tan pou kesyon (sèk)" : l === "es" ? "Tiempo por pregunta (seg)" : "Time per question (sec)",
    addQ: l === "fr" ? "Ajouter une question" : l === "ht" ? "Ajoute yon kesyon" : l === "es" ? "Agregar pregunta" : "Add question",
    removeQ: l === "fr" ? "Supprimer" : l === "ht" ? "Efase" : l === "es" ? "Eliminar" : "Remove",
    submit: l === "fr" ? "Créer le concours" : l === "ht" ? "Kreye konkou a" : l === "es" ? "Crear concurso" : "Create contest",
    cancel: l === "fr" ? "Annuler" : l === "ht" ? "Anile" : l === "es" ? "Cancelar" : "Cancel",
  };

  function updateQuestion(i: number, field: keyof Question, val: string | number | string[]) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  }
  function updateOption(qi: number, oi: number, val: string) {
    setQuestions(qs => qs.map((q, idx) => idx === qi ? { ...q, options_fr: q.options_fr.map((o, j) => j === oi ? val : o) } : q));
  }

  async function handleSubmit() {
    setError("");
    if (!title.trim()) { setError(l === "fr" ? "Le titre est requis." : l === "ht" ? "Tit la obligatwa." : l === "es" ? "El título es obligatorio." : "Title is required."); return; }
    if (questions.some(q => !q.question_fr.trim() || q.options_fr.some(o => !o.trim()))) {
      setError(l === "fr" ? "Remplissez toutes les questions et options." : l === "ht" ? "Ranpli tout kesyon ak opsyon yo." : l === "es" ? "Complete todas las preguntas y opciones." : "Fill all questions and options.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/contests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, title_ht: titleHt || null, title_en: titleEn || null, title_es: titleEs || null,
        description, description_ht: descriptionHt || null, description_en: descriptionEn || null, description_es: descriptionEs || null,
        theme: theme || null,
        subject: subject || "bible",
        school_level: schoolLevel !== "all" ? schoolLevel : null,
        scope: scope || "national",
        scheduled_start_at: scheduledStartAt || null,
        duration_minutes: durationMinutes,
        max_participants: maxParticipants,
        questions,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.contest_id) {
      router.push(`/championnats/${data.contest_id}`);
    } else {
      setError(data.error || "Erreur");
    }
  }

  const INPUT = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    borderRadius: "12px",
  } as React.CSSProperties;

  const LABEL = "block text-xs font-bold text-white/40 uppercase tracking-wider";

  if (!adminChecked || !adminOk) return null;

  return (
    <RequireAuth>
      <div className="animate-page-awaken min-h-screen" style={{ background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)", color: "#fff" }}>
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(197,168,79,0.10) 0%, transparent 60%)" }} />

        {/* Header */}
        <div className="relative z-10 px-5 sm:px-8 py-14" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-[#d4a017] text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
              {l === "fr" ? "Nouveau concours" : l === "ht" ? "Nouvo konkou" : l === "es" ? "Nuevo concurso" : "New contest"}
            </p>
            <h1 className="text-white font-black text-3xl sm:text-4xl mb-3">{txt.headline}</h1>
            <p className="text-white/40 text-sm">{txt.sub}</p>
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-12 flex flex-col gap-10">

          {/* ── Domaine éducatif ── */}
          <section className="flex flex-col gap-5 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div>
              <p className="text-[#d4a017] text-[10px] font-bold uppercase tracking-[0.25em] mb-1">
                {l === "fr" ? "Académie" : l === "ht" ? "Akademi" : l === "es" ? "Academia" : "Academy"}
              </p>
              <h2 className="text-white font-black text-lg">
                {l === "fr" ? "Thème & niveau" : l === "ht" ? "Tèm & nivo" : l === "es" ? "Tema & nivel" : "Theme & level"}
              </h2>
            </div>
            {/* Domaine */}
            <div>
              <label className={LABEL}>{l === "fr" ? "Thème biblique" : l === "ht" ? "Tèm biblik" : l === "es" ? "Tema bíblico" : "Biblical theme"}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {([
                  { v: "bible", iconName: "bible", label: l === "fr" ? "Toute la Bible" : l === "ht" ? "Tout Bib la" : l === "es" ? "Toda la Biblia" : "Whole Bible" },
                  { v: "ancien-testament", iconName: "psaumes", label: l === "fr" ? "Ancien Testament" : l === "ht" ? "Ansyen Testaman" : l === "es" ? "Antiguo Testamento" : "Old Testament" },
                  { v: "nouveau-testament", iconName: "croix", label: l === "fr" ? "Nouveau Testament" : l === "ht" ? "Nouvo Testaman" : l === "es" ? "Nuevo Testamento" : "New Testament" },
                  { v: "vie-jesus", iconName: "etoile", label: l === "fr" ? "Vie de Jésus" : l === "ht" ? "Lavi Jezi" : l === "es" ? "Vida de Jesús" : "Life of Jesus" },
                  { v: "prophetes", iconName: "etincelles", label: l === "fr" ? "Prophètes" : l === "ht" ? "Pwofèt yo" : l === "es" ? "Profetas" : "Prophets" },
                  { v: "personnages", iconName: "utilisateurs", label: l === "fr" ? "Personnages" : l === "ht" ? "Pèsonaj yo" : l === "es" ? "Personajes" : "Characters" },
                  { v: "priere", iconName: "priere", label: l === "fr" ? "Prière & Foi" : l === "ht" ? "Lapriyè & Lafwa" : l === "es" ? "Oración & Fe" : "Prayer & Faith" },
                  { v: "sagesse", iconName: "idee", label: l === "fr" ? "Sagesse & Proverbes" : l === "ht" ? "Sajès & Pwovèb" : l === "es" ? "Sabiduría" : "Wisdom" },
                ] as { v: string; icon?: string; iconName?: IconName; label: string }[]).map(({ v, icon, iconName, label }) => (
                  <button key={v} type="button" onClick={() => setSubject(v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: subject === v ? "rgba(212,160,23,0.18)" : "rgba(255,255,255,0.05)",
                      border: subject === v ? "1px solid rgba(212,160,23,0.45)" : "1px solid rgba(255,255,255,0.10)",
                      color: subject === v ? "#d4a017" : "rgba(255,255,255,0.55)",
                    }}>
                    <span className="inline-flex items-center">{iconName ? <Icon name={iconName} size={14} /> : icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>
            {/* Niveau */}
            <div>
              <label className={LABEL}>{l === "fr" ? "Niveau" : l === "ht" ? "Nivo" : l === "es" ? "Nivel" : "Level"}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { v: "all",           label: l === "fr" ? "Tous niveaux" : l === "ht" ? "Tout nivo" : l === "es" ? "Todos" : "All levels" },
                  { v: "enfants",       label: l === "fr" ? "Enfants" : l === "ht" ? "Timoun" : l === "es" ? "Niños" : "Children" },
                  { v: "jeunes",        label: l === "fr" ? "Jeunes" : l === "ht" ? "Jèn" : l === "es" ? "Jóvenes" : "Youth" },
                  { v: "debutant",      label: l === "fr" ? "Débutant" : l === "ht" ? "Debitan" : l === "es" ? "Principiante" : "Beginner" },
                  { v: "intermediaire", label: l === "fr" ? "Intermédiaire" : l === "ht" ? "Entèmedyè" : l === "es" ? "Intermedio" : "Intermediate" },
                  { v: "avance",        label: l === "fr" ? "Avancé" : l === "ht" ? "Avanse" : l === "es" ? "Avanzado" : "Advanced" },
                ].map(({ v, label }) => (
                  <button key={v} type="button" onClick={() => setSchoolLevel(v)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: schoolLevel === v ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.05)",
                      border: schoolLevel === v ? "1px solid rgba(96,165,250,0.40)" : "1px solid rgba(255,255,255,0.10)",
                      color: schoolLevel === v ? "#60a5fa" : "rgba(255,255,255,0.55)",
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Portée */}
            <div>
              <label className={LABEL}>{l === "fr" ? "Portée du concours" : l === "ht" ? "Pòte konkou a" : l === "es" ? "Alcance del concurso" : "Contest scope"}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {([
                  { v: "class",    iconName: "groupe", label: l === "fr" ? "Mon groupe" : l === "ht" ? "Gwoup mwen" : l === "es" ? "Mi grupo" : "My group" },
                  { v: "school",   iconName: "eglise", label: l === "fr" ? "Mon église" : l === "ht" ? "Legliz mwen" : l === "es" ? "Mi iglesia" : "My church" },
                  { v: "national", iconName: "drapeau", label: l === "fr" ? "National" : l === "ht" ? "Nasyonal" : l === "es" ? "Nacional" : "National" },
                  { v: "world",    iconName: "monde", label: l === "fr" ? "Mondial" : l === "ht" ? "Mondyal" : l === "es" ? "Mundial" : "World" },
                ] as { v: string; iconName: IconName; label: string }[]).map(({ v, iconName, label }) => (
                  <button key={v} type="button" onClick={() => setScope(v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: scope === v ? "rgba(0,170,200,0.12)" : "rgba(255,255,255,0.05)",
                      border: scope === v ? "1px solid rgba(0,170,200,0.35)" : "1px solid rgba(255,255,255,0.10)",
                      color: scope === v ? "#00aac8" : "rgba(255,255,255,0.55)",
                    }}>
                    <span className="inline-flex items-center"><Icon name={iconName} size={14} /></span>{label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Basic info */}
          <section className="flex flex-col gap-5">
            {/* Title — FR (required) + HT + EN */}
            <div className="flex flex-col gap-3">
              <label className={LABEL}>{txt.titleLabel}</label>
              {[
                { flag: "🇫🇷", lang: "Français", value: title, set: setTitle, placeholder: "ex. Concours de Pentecôte 2026", required: true },
                { flag: "🇭🇹", lang: "Kreyòl", value: titleHt, set: setTitleHt, placeholder: "ex. Konkou Lapannkòt 2026", required: false },
                { flag: "🇺🇸", lang: "English", value: titleEn, set: setTitleEn, placeholder: "ex. Pentecost Contest 2026", required: false },
                { flag: "🇪🇸", lang: "Español", value: titleEs, set: setTitleEs, placeholder: "ej. Concurso de Pentecostés 2026", required: false },
              ].map(({ flag, lang: langName, value, set, placeholder, required }) => (
                <div key={langName} className="flex items-center gap-3">
                  <span className="text-lg w-7 flex-shrink-0">{flag}</span>
                  <input
                    value={value}
                    onChange={e => set(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium focus:outline-none transition-colors placeholder-white/20"
                    style={{ ...INPUT, borderColor: required && !value ? "rgba(212,160,23,0.35)" : "rgba(255,255,255,0.12)" }}
                    placeholder={placeholder}
                    required={required}
                  />
                </div>
              ))}
            </div>

            {/* Description — FR + HT + EN */}
            <div className="flex flex-col gap-3">
              <label className={LABEL}>{txt.descLabel}</label>
              {[
                { flag: "🇫🇷", lang: "Français", value: description, set: setDescription },
                { flag: "🇭🇹", lang: "Kreyòl", value: descriptionHt, set: setDescriptionHt },
                { flag: "🇺🇸", lang: "English", value: descriptionEn, set: setDescriptionEn },
                { flag: "🇪🇸", lang: "Español", value: descriptionEs, set: setDescriptionEs },
              ].map(({ flag, lang: langName, value, set }) => (
                <div key={langName} className="flex items-start gap-3">
                  <span className="text-lg w-7 flex-shrink-0 mt-2.5">{flag}</span>
                  <textarea
                    value={value}
                    onChange={e => set(e.target.value)}
                    rows={2}
                    className="flex-1 px-4 py-2.5 text-sm focus:outline-none transition-colors resize-none placeholder-white/20"
                    style={INPUT}
                  />
                </div>
              ))}
            </div>

            {/* Theme + scheduling */}
            <div className="flex flex-col gap-3">
              <label className={LABEL}>
                {l === "fr" ? "Thème du concours" : l === "ht" ? "Tèm konkou a" : l === "es" ? "Tema del concurso" : "Contest theme"}
              </label>
              <input
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder={l === "fr" ? "ex. La vie de Paul" : l === "ht" ? "ex. Lavi Pòl" : l === "es" ? "ej. La vida de Pablo" : "ex. The life of Paul"}
                className="px-4 py-2.5 text-sm font-medium focus:outline-none transition-colors placeholder-white/20"
                style={INPUT}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`${LABEL} mb-2`}>
                  {l === "fr" ? "Date et heure de début" : l === "ht" ? "Dat ak lè kòmanse" : l === "es" ? "Inicio programado" : "Scheduled start"}
                </label>
                <input
                  type="datetime-local"
                  value={scheduledStartAt}
                  onChange={e => setScheduledStartAt(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium focus:outline-none transition-colors"
                  style={INPUT}
                />
                <p className="text-[10px] text-white/25 mt-1">
                  {l === "fr" ? "Le concours démarre automatiquement." : l === "ht" ? "Konkou a kòmanse otomatikman." : l === "es" ? "El concurso comienza automáticamente." : "Contest starts automatically."}
                </p>
              </div>
              <div>
                <label className={`${LABEL} mb-2`}>
                  {l === "fr" ? "Durée (minutes)" : l === "ht" ? "Dire (minit)" : l === "es" ? "Duración (min)" : "Duration (min)"}
                </label>
                <input
                  type="number" min={10} max={120} value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-4 py-3 text-sm font-bold focus:outline-none transition-colors"
                  style={INPUT}
                />
              </div>
            </div>

            <div className="w-48">
              <label className={`${LABEL} mb-2`}>{txt.maxLabel}</label>
              <input
                type="number"
                min={2}
                max={10000}
                value={maxParticipants}
                onChange={e => setMaxParticipants(Number(e.target.value))}
                className="w-full px-4 py-3 text-sm font-bold focus:outline-none transition-colors"
                style={INPUT}
              />
            </div>
          </section>

          {/* Questions */}
          <section>
            <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">{txt.questionsLabel}</p>
            <div className="flex flex-col gap-6">
              {questions.map((q, qi) => (
                <div key={qi} className="rounded-2xl p-6 flex flex-col gap-5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[#d4a017] font-black text-sm">Q{qi + 1}</span>
                    {questions.length > 1 && (
                      <button onClick={() => setQuestions(qs => qs.filter((_, i) => i !== qi))}
                        className="text-white/25 text-xs hover:text-red-400 transition-colors font-medium">
                        {txt.removeQ}
                      </button>
                    )}
                  </div>

                  <div>
                    <label className={`${LABEL} mb-2`}>
                      {l === "fr" ? "Question" : l === "ht" ? "Kesyon" : l === "es" ? "Pregunta" : "Question"}
                    </label>
                    <textarea
                      value={q.question_fr}
                      onChange={e => updateQuestion(qi, "question_fr", e.target.value)}
                      rows={2}
                      placeholder={txt.questionPlaceholder}
                      className="w-full px-4 py-3 text-sm focus:outline-none transition-colors resize-none placeholder-white/20"
                      style={INPUT}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {q.options_fr.map((opt, oi) => (
                      <div key={oi} className="relative">
                        <input
                          value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)}
                          placeholder={txt.optionPlaceholder(oi)}
                          className="w-full px-4 py-3 text-sm pr-10 focus:outline-none transition-colors placeholder-white/20"
                          style={{
                            ...INPUT,
                            borderColor: q.correct_answer === oi ? "rgba(0,170,200,0.50)" : "rgba(255,255,255,0.12)",
                            background: q.correct_answer === oi ? "rgba(0,170,200,0.08)" : "rgba(255,255,255,0.06)",
                          }}
                        />
                        <button
                          onClick={() => updateQuestion(qi, "correct_answer", oi)}
                          title={txt.correctLabel}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-colors ${
                            q.correct_answer === oi
                              ? "border-green-500 bg-green-500"
                              : "border-white/20 hover:border-green-400"
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
                      <label className={`${LABEL} mb-2`}>{txt.refLabel}</label>
                      <input
                        value={q.reference}
                        onChange={e => updateQuestion(qi, "reference", e.target.value)}
                        placeholder="Jean 3:16"
                        className="w-full px-3 py-2 text-sm focus:outline-none transition-colors placeholder-white/20"
                        style={INPUT}
                      />
                    </div>
                    <div className="w-32">
                      <label className={`${LABEL} mb-2`}>{txt.timeLabel}</label>
                      <input
                        type="number"
                        min={10}
                        max={120}
                        value={q.time_limit}
                        onChange={e => updateQuestion(qi, "time_limit", Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm font-bold focus:outline-none transition-colors"
                        style={INPUT}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setQuestions(qs => [...qs, emptyQuestion()])}
              className="mt-4 w-full rounded-2xl py-4 text-white/30 text-sm font-medium hover:text-white/60 transition-all"
              style={{ border: "2px dashed rgba(255,255,255,0.10)" }}
            >
              + {txt.addQ}
            </button>
          </section>

          {/* Submit */}
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <div className="flex gap-3 pb-8">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-full text-sm font-medium text-white/40 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
            >
              {txt.cancel}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 rounded-full text-sm font-black transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #d4a017 0%, #f0c840 100%)", color: "#04040d", boxShadow: "0 4px 24px rgba(212,160,23,0.30)" }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black/70 rounded-full animate-spin" />
                  {l === "fr" ? "Création..." : l === "ht" ? "Kap kreye..." : l === "es" ? "Creando..." : "Creating..."}
                </span>
              ) : txt.submit}
            </button>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
