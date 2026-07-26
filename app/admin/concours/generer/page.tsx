"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import Icon, { IconName } from "@/app/components/Icon";

const LOADING_MESSAGES = [
  "Analyse du thème biblique...",
  "Création des questions...",
  "Vérification des références...",
  "Construction des manches...",
  "Finalisation du championnat...",
];

const ROUND_TYPE_LABELS: Record<string, string> = {
  mcq: "Questions à choix multiples",
  tf: "Vrai ou Faux",
  fill: "Compléter le verset",
  match: "Associer les paires",
  order_verse: "Remettre le verset en ordre",
  chrono: "Ordre chronologique",
  character: "Identifier le personnage",
  location: "Identifier le lieu",
  book: "Reconnaître le livre",
  finale: "Finale — Questions expertes",
};

const ROUND_ICONS: Record<string, IconName> = {
  mcq: "eclair", tf: "etincelles", fill: "editer", match: "lien",
  order_verse: "etude", chrono: "chrono", character: "utilisateur",
  location: "localisation", book: "cours", finale: "trophee",
};

const BIBLE_THEMES: {
  category: string;
  icon: IconName;
  color: string;
  themes: { label: string; difficulty: 1 | 2 | 3 }[];
}[] = [
  {
    category: "Ancien Testament — Histoires",
    icon: "psaumes", color: "#b45309",
    themes: [
      { label: "La Création du monde (Genèse 1-2)", difficulty: 1 },
      { label: "Adam, Ève et le jardin d'Eden", difficulty: 1 },
      { label: "Noé et le déluge", difficulty: 1 },
      { label: "Abraham, père de la foi", difficulty: 2 },
      { label: "Jacob et ses 12 fils", difficulty: 2 },
      { label: "Joseph vendu par ses frères", difficulty: 2 },
      { label: "Moïse et l'Exode d'Égypte", difficulty: 2 },
      { label: "Les dix plaies d'Égypte", difficulty: 2 },
      { label: "Les dix commandements (Exode 20)", difficulty: 1 },
      { label: "Josué et la conquête de Canaan", difficulty: 2 },
      { label: "Samson et Dalila", difficulty: 2 },
      { label: "Ruth et Naomi — histoire de fidélité", difficulty: 1 },
      { label: "Samuel, le prophète enfant", difficulty: 2 },
      { label: "Saül, premier roi d'Israël", difficulty: 2 },
      { label: "David et Goliath", difficulty: 1 },
      { label: "La vie du roi David — psalmiste et guerrier", difficulty: 2 },
      { label: "Salomon et la sagesse de Dieu", difficulty: 2 },
      { label: "Élie le prophète et les faux prophètes", difficulty: 2 },
      { label: "Daniel dans la fosse aux lions", difficulty: 1 },
      { label: "Les trois hébreux dans la fournaise (Schadrach, Méshach, Abed-Négo)", difficulty: 1 },
      { label: "Jonas et la grande baleine", difficulty: 1 },
      { label: "Esther — la reine courageuse", difficulty: 2 },
      { label: "Job — l'épreuve de la foi", difficulty: 3 },
      { label: "Nehémie et la reconstruction des murs de Jérusalem", difficulty: 2 },
    ],
  },
  {
    category: "Jésus-Christ — Nouveau Testament",
    icon: "croix", color: "#1d4ed8",
    themes: [
      { label: "La naissance de Jésus — la Nativité", difficulty: 1 },
      { label: "Le baptême et la tentation de Jésus", difficulty: 2 },
      { label: "Les 12 apôtres de Jésus", difficulty: 2 },
      { label: "Le Sermon sur la montagne (Matthieu 5-7)", difficulty: 2 },
      { label: "Les miracles de Jésus", difficulty: 2 },
      { label: "Les paraboles de Jésus", difficulty: 2 },
      { label: "La parabole du fils prodigue", difficulty: 1 },
      { label: "La parabole du bon Samaritain", difficulty: 1 },
      { label: "La dernière Cène", difficulty: 2 },
      { label: "La mort et la résurrection de Jésus", difficulty: 2 },
      { label: "L'ascension de Jésus et la Pentecôte", difficulty: 2 },
      { label: "Les apparitions de Jésus après la résurrection", difficulty: 3 },
    ],
  },
  {
    category: "Livres de la Bible",
    icon: "cours", color: "#7c3aed",
    themes: [
      { label: "Le livre des Psaumes — louange et adoration", difficulty: 2 },
      { label: "Les Proverbes — sagesse pratique", difficulty: 1 },
      { label: "L'Évangile de Jean — le Logos", difficulty: 2 },
      { label: "L'Évangile de Luc — récit historique", difficulty: 2 },
      { label: "Les Actes des Apôtres — l'Église primitive", difficulty: 2 },
      { label: "L'Épître aux Romains — la doctrine du salut", difficulty: 3 },
      { label: "La 1ère Épître aux Corinthiens — l'amour et les dons", difficulty: 2 },
      { label: "L'Épître aux Galates — la liberté en Christ", difficulty: 3 },
      { label: "L'Épître aux Éphésiens — l'armure de Dieu", difficulty: 2 },
      { label: "L'Apocalypse — les visions de Jean", difficulty: 3 },
      { label: "Le livre de l'Ecclésiaste — le sens de la vie", difficulty: 2 },
      { label: "Le livre d'Ésaïe — les prophéties messianiques", difficulty: 3 },
    ],
  },
  {
    category: "Personnages Bibliques",
    icon: "utilisateur", color: "#be185d",
    themes: [
      { label: "Pierre — le rocher de l'Église", difficulty: 2 },
      { label: "Paul — l'apôtre des nations", difficulty: 2 },
      { label: "Marie, mère de Jésus", difficulty: 2 },
      { label: "Marie-Madeleine — première témoin de la résurrection", difficulty: 2 },
      { label: "Jean le Baptiste — le précurseur", difficulty: 2 },
      { label: "Judas Iscariote — la trahison", difficulty: 2 },
      { label: "Thomas — l'incrédule devenu croyant", difficulty: 2 },
      { label: "Les femmes courageuses de la Bible", difficulty: 2 },
      { label: "Les grands prophètes de l'Ancien Testament", difficulty: 3 },
      { label: "Les anges dans la Bible", difficulty: 2 },
    ],
  },
  {
    category: "Thèmes Théologiques",
    icon: "colombe", color: "#0f766e",
    themes: [
      { label: "La foi dans la Bible — définition et exemples", difficulty: 2 },
      { label: "La prière dans la Bible — comment et pourquoi", difficulty: 1 },
      { label: "Le Saint-Esprit dans la Bible", difficulty: 2 },
      { label: "Le salut et la grâce en Christ", difficulty: 2 },
      { label: "Le péché et le pardon dans la Bible", difficulty: 2 },
      { label: "Les promesses de Dieu dans la Bible", difficulty: 2 },
      { label: "La fin des temps et l'eschatologie biblique", difficulty: 3 },
      { label: "Le mariage et la famille dans la Bible", difficulty: 2 },
      { label: "Le jeûne et la dévotion dans la Bible", difficulty: 2 },
      { label: "Les noms de Dieu dans la Bible", difficulty: 3 },
    ],
  },
  {
    category: "Niveau Avancé — Expert",
    icon: "trophee", color: "#c5a84f",
    themes: [
      { label: "La géographie biblique — lieux et voyages", difficulty: 3 },
      { label: "Les fêtes juives dans l'Ancien Testament", difficulty: 3 },
      { label: "Les alliances de Dieu dans la Bible", difficulty: 3 },
      { label: "Les lois du Lévitique — signification spirituelle", difficulty: 3 },
      { label: "La tabernacle et le temple de Salomon", difficulty: 3 },
      { label: "Les prophéties de l'Ancien Testament accomplies en Jésus", difficulty: 3 },
      { label: "La chronologie biblique — de la Création à Jésus", difficulty: 3 },
    ],
  },
];

interface GeneratedRound {
  round_type: string;
  title: { fr: string; ht: string; en: string };
  questions: unknown[];
  time_limit_sec: number;
}

interface GeneratedResult {
  contest_id: string;
  rounds_count: number;
  title: { fr: string; ht: string; en: string };
  description: { fr: string; ht: string; en: string };
  rounds: GeneratedRound[];
}

export default function GenererConcours() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [lang, setLang] = useState<"fr" | "ht" | "en">("fr");
  const [numRounds, setNumRounds] = useState(5);
  const [scheduledStartAt, setScheduledStartAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(BIBLE_THEMES[0].category);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) router.replace("/admin");
      else setAuthed(true);
    });
  }, [router]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  function selectTheme(label: string, diff: 1 | 2 | 3) {
    setTheme(label);
    setDifficulty(diff);
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function generate() {
    if (!theme.trim()) { setError("Le thème est obligatoire."); return; }
    setError("");
    setResult(null);
    setLoading(true);
    setLoadingMsgIdx(0);
    try {
      const res = await fetch("/api/admin/contests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, difficulty, lang, num_rounds: numRounds, scheduled_start_at: scheduledStartAt || null, duration_minutes: durationMinutes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur lors de la génération."); return; }
      setResult(data);
      setEditTitle(data.title?.fr || "");
      setEditDesc(data.description?.fr || "");
    } catch (e) {
      setError("Erreur réseau. Réessayez.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    if (!result) return;
    setPublishing(true);
    if (editTitle !== result.title?.fr || editDesc !== result.description?.fr) {
      await fetch(`/api/contests/${result.contest_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDesc }),
      });
    }
    router.push("/admin?tab=contests");
  }

  if (!authed) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/admin?tab=contests" className="text-white/50 hover:text-white transition-colors text-sm">
            ← Retour
          </Link>
          <div>
            <h1 className="font-bold text-lg">Générer un championnat avec l&apos;IA</h1>
            <p className="text-white/40 text-xs">Claude crée toutes les questions automatiquement · {BIBLE_THEMES.reduce((s, c) => s + c.themes.length, 0)} thèmes disponibles</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8 items-start">

        {/* LEFT — Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Thème du championnat</label>
              <input
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="Sélectionne un thème à droite ou tape librement..."
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
              {theme && (
                <p className="text-xs text-blue-600 font-semibold mt-1.5"><span className="inline-flex items-center gap-1"><Icon name="valider" size={14} /> Thème sélectionné</span></p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Niveau de difficulté</label>
              <div className="flex gap-3">
                {([1, 2, 3] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      difficulty === d
                        ? d === 1 ? "bg-green-600 text-white border-green-600"
                          : d === 2 ? "bg-[#0f2044] text-white border-[#0f2044]"
                          : "bg-red-600 text-white border-red-600"
                        : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {d === 1 ? "Facile" : d === 2 ? "Moyen" : "Avancé"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Langue principale</label>
                <select
                  value={lang}
                  onChange={e => setLang(e.target.value as "fr" | "ht" | "en")}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="fr">🇫🇷 Français</option>
                  <option value="ht">🇭🇹 Créole Haïtien</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Manches : {numRounds}</label>
                <input
                  type="range" min={3} max={8} value={numRounds}
                  onChange={e => setNumRounds(Number(e.target.value))}
                  className="w-full mt-3"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>3</span><span>8</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Date et heure</label>
                <input
                  type="datetime-local"
                  value={scheduledStartAt}
                  onChange={e => setScheduledStartAt(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Durée (minutes)</label>
                <input
                  type="number" min={15} max={120} value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading || !theme.trim()}
              className="w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c5a84f 0%, #d4b96a 50%, #c5a84f 100%)", color: "#0f2044" }}
            >
              {loading ? "⏳ Génération en cours..." : <span className="inline-flex items-center gap-1.5"><Icon name="etincelles" size={16} /> Générer avec Claude IA</span>}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-[#0f2044] rounded-2xl p-8 text-center">
              <div className="w-12 h-12 border-4 border-[#c5a84f] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <p className="text-white font-bold text-lg mb-2">Claude analyse vos paramètres</p>
              <p className="text-white/60 text-sm transition-all duration-500">{LOADING_MESSAGES[loadingMsgIdx]}</p>
              <div className="flex gap-1 justify-center mt-4">
                {LOADING_MESSAGES.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === loadingMsgIdx ? "bg-[#c5a84f]" : "bg-white/20"}`} />
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#0f2044] to-[#1d3a7a] px-6 py-5">
                <p className="text-[#c5a84f] text-xs font-bold uppercase tracking-widest mb-1"><span className="inline-flex items-center gap-1.5"><Icon name="succes" size={14} /> Championnat généré</span></p>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-transparent text-white font-black text-xl focus:outline-none border-b border-white/20 pb-1"
                />
              </div>
              <div className="px-6 py-4">
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full text-sm text-stone-700 border border-stone-100 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-300 resize-none"
                />
              </div>
              <div className="px-6 pb-4 space-y-2">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{result.rounds_count} manches</p>
                {result.rounds?.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-stone-100">
                    <Icon name={ROUND_ICONS[r.round_type] ?? "exercice"} size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-stone-800">Manche {i + 1} — {ROUND_TYPE_LABELS[r.round_type] ?? r.round_type}</p>
                      <p className="text-xs text-stone-400">{r.questions?.length ?? 0} questions · {r.time_limit_sec}s</p>
                    </div>
                    <Icon name="valider" size={16} className="text-green-500" />
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={publish}
                  disabled={publishing}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-colors"
                >
                  {publishing ? "Publication..." : <span className="inline-flex items-center gap-1.5"><Icon name="succes" size={16} /> Publier ce championnat</span>}
                </button>
                <button
                  onClick={() => { setResult(null); generate(); }}
                  className="px-5 py-3 rounded-xl font-bold text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  🔄 Regénérer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Bible theme library */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="etude" size={24} />
            <div>
              <h2 className="font-black text-stone-800 text-base">Bibliothèque de thèmes Bible</h2>
              <p className="text-stone-400 text-xs">{BIBLE_THEMES.reduce((s, c) => s + c.themes.length, 0)} thèmes · Clique pour sélectionner</p>
            </div>
          </div>

          {BIBLE_THEMES.map(cat => (
            <div key={cat.category} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-stone-50 transition-colors"
              >
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-stone-800 text-sm">{cat.category}</p>
                  <p className="text-stone-400 text-xs">{cat.themes.length} thèmes</p>
                </div>
                <span className="text-stone-400 text-sm">{openCategory === cat.category ? "▲" : "▼"}</span>
              </button>

              {openCategory === cat.category && (
                <div className="px-4 pb-4 space-y-1.5 border-t border-stone-100 pt-3">
                  {cat.themes.map(t => (
                    <button
                      key={t.label}
                      onClick={() => selectTheme(t.label, t.difficulty)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center gap-3 ${
                        theme === t.label
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-100"
                      }`}
                    >
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        t.difficulty === 1 ? "bg-green-100 text-green-700" :
                        t.difficulty === 2 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {t.difficulty === 1 ? "FACILE" : t.difficulty === 2 ? "MOYEN" : "AVANCÉ"}
                      </span>
                      <span className="leading-snug">{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
