"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";

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

const ROUND_ICONS: Record<string, string> = {
  mcq: "⚡", tf: "🔮", fill: "📝", match: "🔗",
  order_verse: "📖", chrono: "⏳", character: "👤",
  location: "🗺️", book: "📚", finale: "🏆",
};

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
    // Update title/desc if edited
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
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/admin?tab=contests" className="text-white/50 hover:text-white transition-colors text-sm">
            ← Retour
          </Link>
          <div>
            <h1 className="font-bold text-lg">Générer un championnat avec l&apos;IA</h1>
            <p className="text-white/40 text-xs">Claude crée toutes les questions automatiquement</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Thème du championnat</label>
            <input
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="ex: La vie de Moïse, Le livre de Job, Les miracles de Jésus"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-[#0f2044] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Niveau de difficulté</label>
            <div className="flex gap-3">
              {([1, 2, 3] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
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
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#0f2044] transition-colors"
              >
                <option value="fr">Français</option>
                <option value="ht">Créole Haïtien</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Nombre de manches</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={3} max={8} value={numRounds}
                  onChange={e => setNumRounds(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-black text-[#0f2044] w-8 text-center">{numRounds}</span>
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
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#0f2044] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Durée (minutes)</label>
              <input
                type="number" min={15} max={120} value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm font-bold focus:outline-none focus:border-[#0f2044] transition-colors"
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
            disabled={loading}
            className="w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #c5a84f 0%, #d4b96a 50%, #c5a84f 100%)", color: "#0f2044" }}
          >
            {loading ? "Génération en cours..." : "✨ Générer avec Claude"}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-[#0f2044] rounded-2xl p-10 text-center">
            <div className="w-12 h-12 border-4 border-[#c5a84f] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
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
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#0f2044] to-[#1d3a7a] px-6 py-5">
                <p className="text-[#c5a84f] text-xs font-bold uppercase tracking-widest mb-1">Championnat généré</p>
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

              <div className="px-6 pb-6 space-y-2">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">{result.rounds_count} manches</p>
                {result.rounds?.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-stone-100">
                    <span className="text-xl">{ROUND_ICONS[r.round_type] ?? "📋"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-stone-800">
                        Manche {i + 1} — {ROUND_TYPE_LABELS[r.round_type] ?? r.round_type}
                      </p>
                      <p className="text-xs text-stone-400">
                        {r.questions?.length ?? 0} questions · {r.time_limit_sec}s
                      </p>
                    </div>
                    <span className="text-green-500 text-sm">✓</span>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={publish}
                  disabled={publishing}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-colors"
                >
                  {publishing ? "Publication..." : "✅ Publier ce championnat"}
                </button>
                <button
                  onClick={() => { setResult(null); generate(); }}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  🔄 Regénérer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
