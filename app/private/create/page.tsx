"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import Icon, { IconName } from "@/app/components/Icon";

const LABELS = {
  fr: {
    back: "← Retour",
    title: "Créer un championnat privé",
    subtitle: "Votre IA biblique génère toutes les questions automatiquement.",
    theme: "Sujet ou thème biblique",
    themePh: "Ex : La vie de David, Les miracles de Jésus, Les Actes des Apôtres…",
    themeHint: "Soyez précis — plus le sujet est précis, meilleures sont les questions.",
    contestTitle: "Titre du championnat (optionnel)",
    contestTitlePh: "Ex : Quiz Jeunesse — Actes des Apôtres",
    difficulty: "Niveau de difficulté",
    easy: "Facile",
    medium: "Intermédiaire",
    hard: "Expert",
    language: "Langue principale",
    rounds: "Nombre d'épreuves",
    generate: "Générer avec l'IA",
    generating: "Génération en cours…",
    genHint: "Claude génère vos questions (30–60s)",
    error: "Erreur",
    required: "Le sujet est requis.",
  },
  ht: {
    back: "← Retounen",
    title: "Kreye yon chanpyona prive",
    subtitle: "IA biblik ou a jenere tout kesyon yo otomatikman.",
    theme: "Sijè oswa tèm biblik",
    themePh: "Ex : Lavi David, Mirak Jezi, Travay Apòt yo…",
    themeHint: "Pi egzak sijè a, pi bon kesyon yo.",
    contestTitle: "Tit chanpyona a (opsyonèl)",
    contestTitlePh: "Ex : Kiz Jèn — Travay Apòt yo",
    difficulty: "Nivo difikilte",
    easy: "Fasil",
    medium: "Entèmedyè",
    hard: "Ekspè",
    language: "Lang prensipal",
    rounds: "Kantite epwèv",
    generate: "Jenere avèk IA",
    generating: "Jenere ap fèt…",
    genHint: "Claude ap kreye kesyon ou yo (30–60s)",
    error: "Erè",
    required: "Sijè a obligatwa.",
  },
  en: {
    back: "← Back",
    title: "Create a private championship",
    subtitle: "Your biblical AI generates all questions automatically.",
    theme: "Biblical subject or theme",
    themePh: "E.g. Life of David, Miracles of Jesus, Acts of the Apostles…",
    themeHint: "Be specific — the more focused the topic, the better the questions.",
    contestTitle: "Championship title (optional)",
    contestTitlePh: "E.g. Youth Quiz — Acts of the Apostles",
    difficulty: "Difficulty level",
    easy: "Easy",
    medium: "Intermediate",
    hard: "Expert",
    language: "Primary language",
    rounds: "Number of rounds",
    generate: "Generate with AI",
    generating: "Generating…",
    genHint: "Claude is creating your questions (30–60s)",
    error: "Error",
    required: "A subject is required.",
  },
  es: {
    back: "← Volver",
    title: "Crear un campeonato privado",
    subtitle: "Tu IA bíblica genera todas las preguntas automáticamente.",
    theme: "Tema o asunto bíblico",
    themePh: "Ej: La vida de David, Los milagros de Jesús, Los Hechos de los Apóstoles…",
    themeHint: "Sé específico — cuanto más enfocado el tema, mejores serán las preguntas.",
    contestTitle: "Título del campeonato (opcional)",
    contestTitlePh: "Ej: Quiz Jóvenes — Hechos de los Apóstoles",
    difficulty: "Nivel de dificultad",
    easy: "Fácil",
    medium: "Intermedio",
    hard: "Experto",
    language: "Idioma principal",
    rounds: "Número de rondas",
    generate: "Generar con IA",
    generating: "Generando…",
    genHint: "Claude está creando tus preguntas (30–60s)",
    error: "Error",
    required: "El tema es obligatorio.",
  },
};

const ROUND_OPTIONS = [2, 3, 5, 7, 8];

export default function CreatePrivatePage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as "fr" | "ht" | "en" | "es";
  const lb = LABELS[l];
  const router = useRouter();

  const [theme, setTheme] = useState("");
  const [contestTitle, setContestTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [numRounds, setNumRounds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false); // prevents re-submit on refresh

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!theme.trim()) { setError(lb.required); return; }
    if (submitted) return; // block re-submission even after page refresh in same session
    setError(null);
    setLoading(true);
    setSubmitted(true);

    try {
      const res = await fetch("/api/private/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: theme.trim(),
          title: contestTitle.trim() || undefined,
          difficulty,
          target_language: targetLanguage,
          num_rounds: numRounds,
        }),
      });

      let d: Record<string, unknown>;
      const text = await res.text();
      try {
        d = JSON.parse(text);
      } catch {
        // Vercel returned an HTML error page (timeout or crash)
        if (res.status === 504 || res.status === 502) {
          setError("La génération a pris trop de temps. Essayez avec moins d'épreuves (3 ou 5).");
        } else {
          setError(`Erreur serveur (${res.status}). Réessayez.`);
        }
        return;
      }

      if (d.ok) {
        router.push(`/private/${d.id}`);
      } else {
        setError((d.error as string) || "Erreur inconnue");
      }
    } catch (err) {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const DIFFICULTY_OPTS: { value: "easy" | "medium" | "hard"; label: string; icon: IconName }[] = [
    { value: "easy", label: lb.easy, icon: "foi" },
    { value: "medium", label: lb.medium, icon: "eclair" },
    { value: "hard", label: lb.hard, icon: "feu" },
  ];

  const LANG_OPTS = [
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "ht", label: "Kreyòl", flag: "🇭🇹" },
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "es", label: "Español", flag: "🇪🇸" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#030918" }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(197,168,79,0.15) 0%, transparent 65%)" }} />

        <div className="relative z-10 max-w-xl mx-auto px-5 py-12">
          <Link href="/championnats" className="inline-flex items-center gap-1 text-white/30 text-xs font-bold hover:text-white transition-colors mb-8">
            {lb.back}
          </Link>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-amber-400 text-[11px] font-black uppercase tracking-widest mb-4">
              <Icon name="cadenas" size={13} /> Championnat Privé
            </div>
            <h1 className="text-white font-black text-3xl sm:text-4xl mb-2">{lb.title}</h1>
            <p className="text-white/40 text-sm">{lb.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-white/60 text-xs font-black uppercase tracking-wider mb-2">{lb.theme}</label>
              <textarea
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder={lb.themePh}
                rows={2}
                className="w-full rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/20 px-4 py-3 text-sm resize-none focus:outline-none focus:border-amber-400/50 transition-colors"
                disabled={loading}
              />
              <p className="text-white/25 text-xs mt-1">{lb.themeHint}</p>
            </div>

            {/* Optional title */}
            <div>
              <label className="block text-white/60 text-xs font-black uppercase tracking-wider mb-2">{lb.contestTitle}</label>
              <input
                type="text"
                value={contestTitle}
                onChange={e => setContestTitle(e.target.value)}
                placeholder={lb.contestTitlePh}
                className="w-full rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                disabled={loading}
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-white/60 text-xs font-black uppercase tracking-wider mb-3">{lb.difficulty}</label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTY_OPTS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setDifficulty(opt.value)}
                    className="py-3 rounded-2xl border font-bold text-sm transition-all"
                    style={{
                      background: difficulty === opt.value ? "rgba(197,168,79,0.12)" : "rgba(255,255,255,0.04)",
                      borderColor: difficulty === opt.value ? "rgba(197,168,79,0.5)" : "rgba(255,255,255,0.08)",
                      color: difficulty === opt.value ? "#c5a84f" : "rgba(255,255,255,0.50)",
                    }}>
                    <span className="inline-flex items-center justify-center gap-1.5"><Icon name={opt.icon} size={16} /> {opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-white/60 text-xs font-black uppercase tracking-wider mb-3">{lb.language}</label>
              <div className="grid grid-cols-3 gap-2">
                {LANG_OPTS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setTargetLanguage(opt.value)}
                    className="py-3 rounded-2xl border font-bold text-sm transition-all"
                    style={{
                      background: targetLanguage === opt.value ? "rgba(197,168,79,0.12)" : "rgba(255,255,255,0.04)",
                      borderColor: targetLanguage === opt.value ? "rgba(197,168,79,0.5)" : "rgba(255,255,255,0.08)",
                      color: targetLanguage === opt.value ? "#c5a84f" : "rgba(255,255,255,0.50)",
                    }}>
                    {opt.flag} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Num rounds */}
            <div>
              <label className="block text-white/60 text-xs font-black uppercase tracking-wider mb-3">
                {lb.rounds} — <span className="text-amber-400">{numRounds}</span>
              </label>
              <div className="flex gap-2">
                {ROUND_OPTIONS.map(n => (
                  <button key={n} type="button"
                    onClick={() => setNumRounds(n)}
                    className="flex-1 py-2.5 rounded-xl border font-black text-sm transition-all"
                    style={{
                      background: numRounds === n ? "rgba(197,168,79,0.12)" : "rgba(255,255,255,0.04)",
                      borderColor: numRounds === n ? "rgba(197,168,79,0.5)" : "rgba(255,255,255,0.08)",
                      color: numRounds === n ? "#c5a84f" : "rgba(255,255,255,0.40)",
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <p className="text-red-400 text-sm">{lb.error} : {error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || submitted || !theme.trim()}
              className="w-full py-4 rounded-2xl font-black text-base transition-all disabled:opacity-50"
              style={{
                background: loading ? "rgba(197,168,79,0.2)" : "linear-gradient(135deg, #c5a84f, #d4b85c)",
                color: loading ? "rgba(255,255,255,0.5)" : "#030918",
                boxShadow: loading ? "none" : "0 4px 32px rgba(197,168,79,0.35)",
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {lb.generating}
                </span>
              ) : lb.generate}
            </button>

            {loading && (
              <p className="text-center text-white/30 text-xs">{lb.genHint}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
