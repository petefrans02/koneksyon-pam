"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import Icon, { IconName } from "@/app/components/Icon";

// ─── Types ─────────────────────────────────────────────────────────────────

interface GQ {
  id: string;
  section: "quiz" | "jeu";
  level_id: number | null;
  q_index: number;
  type: string;
  data: Record<string, unknown>;
  is_active: boolean;
  updated_at: string;
}

// ─── Section config ─────────────────────────────────────────────────────────

const QUIZ_LEVELS: Record<number, { icon: IconName; text: string }> = {
  1: { icon: "foi",      text: "Niveau 1 — Fondements" },
  2: { icon: "etoile",   text: "Niveau 2 — Patriarches" },
  3: { icon: "etude",    text: "Niveau 3 — Psaumes & Sagesse" },
  4: { icon: "croix",    text: "Niveau 4 — Vie de Jésus" },
  5: { icon: "couronne", text: "Niveau 5 — Défi Expert" },
};

const JEU_CATS: Record<number, { icon: IconName; text: string }> = {
  1: { icon: "editer",     text: "Compléter le verset" },
  2: { icon: "etincelles", text: "Vrai ou Faux" },
  3: { icon: "micro",      text: "Qui a dit ça ?" },
};

// ─── Preview helpers ─────────────────────────────────────────────────────────

function preview(q: GQ): string {
  const d = q.data;
  if (q.type === "mcq") {
    const question = d.question as Record<string, string> | undefined;
    return question?.fr ?? "—";
  }
  if (q.type === "verse") {
    const fr = d.fr as Record<string, string> | undefined;
    return (d.reference as string) + " — " + (fr?.verse ?? "");
  }
  if (q.type === "tf") {
    const fr = d.fr as Record<string, string> | undefined;
    return fr?.question ?? "—";
  }
  if (q.type === "speaker") {
    const fr = d.fr as Record<string, string> | undefined;
    return `"${fr?.quote ?? "—"}"`;
  }
  return "—";
}

// ─── Edit forms ──────────────────────────────────────────────────────────────

function McqEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const d = data as {
    question?: Record<string, string>;
    options?: Record<string, string[]>;
    correct?: number;
    explanation?: Record<string, string>;
    verse?: string;
  };

  function setLang(field: "question" | "explanation", lang: string, val: string) {
    onChange({ ...data, [field]: { ...(d[field] ?? {}), [lang]: val } });
  }
  function setOption(lang: string, idx: number, val: string) {
    const opts = { ...(d.options ?? {}) };
    const arr = [...(opts[lang] ?? ["", "", "", ""])];
    arr[idx] = val;
    onChange({ ...data, options: { ...opts, [lang]: arr } });
  }

  const LANGS = [["fr", "🇫🇷"], ["ht", "🇭🇹"], ["en", "🇺🇸"]] as const;

  return (
    <div className="space-y-4">
      {LANGS.map(([lang, flag]) => (
        <div key={lang} className="rounded-xl border border-white/8 p-3 space-y-2">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-wider">{flag} {lang.toUpperCase()}</p>
          <input
            value={d.question?.[lang] ?? ""}
            onChange={e => setLang("question", lang, e.target.value)}
            placeholder="Question"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map(i => (
              <input key={i} value={d.options?.[lang]?.[i] ?? ""}
                onChange={e => setOption(lang, i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/80 text-sm"
              />
            ))}
          </div>
          <input
            value={d.explanation?.[lang] ?? ""}
            onChange={e => setLang("explanation", lang, e.target.value)}
            placeholder="Explication"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-sm"
          />
        </div>
      ))}

      <div className="flex items-center gap-4">
        <div>
          <label className="text-white/40 text-xs block mb-1">Bonne réponse (0-3)</label>
          <select value={d.correct ?? 0} onChange={e => onChange({ ...data, correct: +e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm">
            {[0, 1, 2, 3].map(i => <option key={i} value={i}>Option {i + 1}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-white/40 text-xs block mb-1">Référence biblique</label>
          <input value={d.verse ?? ""}
            onChange={e => onChange({ ...data, verse: e.target.value })}
            placeholder="Ex: Jean 3:16"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function VerseEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const LANGS = [["fr", "🇫🇷"], ["ht", "🇭🇹"], ["en", "🇺🇸"]] as const;

  function setField(lang: string, field: string, val: string | string[]) {
    const langData = { ...(data[lang] as Record<string, unknown> ?? {}) };
    onChange({ ...data, [lang]: { ...langData, [field]: val } });
  }
  function setOption(lang: string, idx: number, val: string) {
    const opts = [...(((data[lang] as Record<string, unknown>)?.options as string[]) ?? ["", "", "", ""])];
    opts[idx] = val;
    setField(lang, "options", opts);
  }

  return (
    <div className="space-y-4">
      <input value={(data.reference as string) ?? ""}
        onChange={e => onChange({ ...data, reference: e.target.value })}
        placeholder="Référence (Ex: Jean 3:16 / John 3:16)"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
      />
      {LANGS.map(([lang, flag]) => {
        const ld = (data[lang] as Record<string, unknown>) ?? {};
        return (
          <div key={lang} className="rounded-xl border border-white/8 p-3 space-y-2">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-wider">{flag} {lang.toUpperCase()}</p>
            <input value={(ld.verse as string) ?? ""}
              onChange={e => setField(lang, "verse", e.target.value)}
              placeholder="Verset avec _____ pour le mot manquant"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input value={(ld.missingWord as string) ?? ""}
                onChange={e => setField(lang, "missingWord", e.target.value)}
                placeholder="Mot manquant (réponse)"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-amber-300 text-sm"
              />
              <input value={(ld.hint as string) ?? ""}
                onChange={e => setField(lang, "hint", e.target.value)}
                placeholder="Indice"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map(i => (
                <input key={i} value={((ld.options as string[]) ?? [])[i] ?? ""}
                  onChange={e => setOption(lang, i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/80 text-sm"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TfEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const LANGS = [["fr", "🇫🇷"], ["ht", "🇭🇹"], ["en", "🇺🇸"]] as const;

  function setField(lang: string, field: string, val: string) {
    const ld = { ...(data[lang] as Record<string, unknown> ?? {}) };
    onChange({ ...data, [lang]: { ...ld, [field]: val } });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-white/60 text-sm font-bold">Réponse correcte :</label>
        <button onClick={() => onChange({ ...data, answer: true })}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${data.answer === true ? "bg-green-500/20 border border-green-500/50 text-green-400" : "bg-white/5 border border-white/10 text-white/40"}`}>
          <span className="inline-flex items-center gap-1.5">VRAI <Icon name="succes" size={16} /></span>
        </button>
        <button onClick={() => onChange({ ...data, answer: false })}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${data.answer === false ? "bg-red-500/20 border border-red-500/50 text-red-400" : "bg-white/5 border border-white/10 text-white/40"}`}>
          <span className="inline-flex items-center gap-1.5">FAUX <Icon name="fermer" size={16} /></span>
        </button>
      </div>
      {LANGS.map(([lang, flag]) => {
        const ld = (data[lang] as Record<string, unknown>) ?? {};
        return (
          <div key={lang} className="rounded-xl border border-white/8 p-3 space-y-2">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-wider">{flag} {lang.toUpperCase()}</p>
            <input value={(ld.question as string) ?? ""}
              onChange={e => setField(lang, "question", e.target.value)}
              placeholder="Affirmation (vrai ou faux ?)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
            <input value={(ld.explication as string) ?? ""}
              onChange={e => setField(lang, "explication", e.target.value)}
              placeholder="Explication / référence"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}

function SpeakerEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const LANGS = [["fr", "🇫🇷"], ["ht", "🇭🇹"], ["en", "🇺🇸"]] as const;

  function setField(lang: string, field: string, val: string | string[]) {
    const ld = { ...(data[lang] as Record<string, unknown> ?? {}) };
    onChange({ ...data, [lang]: { ...ld, [field]: val } });
  }
  function setOption(lang: string, idx: number, val: string) {
    const opts = [...(((data[lang] as Record<string, unknown>)?.options as string[]) ?? ["", "", "", ""])];
    opts[idx] = val;
    setField(lang, "options", opts);
  }

  return (
    <div className="space-y-4">
      <input value={(data.reference as string) ?? ""}
        onChange={e => onChange({ ...data, reference: e.target.value })}
        placeholder="Référence (Ex: Jean 14:6 / John 14:6)"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
      />
      {LANGS.map(([lang, flag]) => {
        const ld = (data[lang] as Record<string, unknown>) ?? {};
        return (
          <div key={lang} className="rounded-xl border border-white/8 p-3 space-y-2">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-wider">{flag} {lang.toUpperCase()}</p>
            <textarea value={(ld.quote as string) ?? ""}
              onChange={e => setField(lang, "quote", e.target.value)}
              placeholder="Citation"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
            <input value={(ld.speaker as string) ?? ""}
              onChange={e => setField(lang, "speaker", e.target.value)}
              placeholder="Nom du locuteur (réponse correcte)"
              className="w-full bg-white/5 border border-amber-400/20 rounded-lg px-3 py-1.5 text-amber-300 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map(i => (
                <input key={i} value={((ld.options as string[]) ?? [])[i] ?? ""}
                  onChange={e => setOption(lang, i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/80 text-sm"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Question row ─────────────────────────────────────────────────────────────

function QuestionRow({ q, onSave, onDelete }: {
  q: GQ;
  onSave: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(q.data);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(q.id, draft);
    setSaving(false);
    setOpen(false);
  }

  async function del() {
    if (!confirm("Supprimer cette question ?")) return;
    setDeleting(true);
    await onDelete(q.id);
    setDeleting(false);
  }

  return (
    <div className={`rounded-xl border transition-colors ${open ? "border-amber-400/30 bg-amber-400/5" : "border-white/8 bg-white/3 hover:border-white/15"}`}>
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <span className="text-white/25 text-xs font-mono w-6 shrink-0">#{q.q_index + 1}</span>
        <div className={`w-2 h-2 rounded-full shrink-0 ${q.is_active ? "bg-green-400" : "bg-red-400/50"}`} />
        <p className="flex-1 text-white/70 text-sm truncate">{preview(q)}</p>
        <span className="text-white/25 text-[10px] shrink-0">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="border-t border-white/8 p-4 space-y-4">
          {q.type === "mcq" && <McqEditor data={draft} onChange={setDraft} />}
          {q.type === "verse" && <VerseEditor data={draft} onChange={setDraft} />}
          {q.type === "tf" && <TfEditor data={draft} onChange={setDraft} />}
          {q.type === "speaker" && <SpeakerEditor data={draft} onChange={setDraft} />}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} disabled={saving}
              className="px-5 py-2 rounded-xl font-black text-sm transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c5a84f, #d4b85c)", color: "#030918" }}>
              {saving ? "Sauvegarde…" : <span className="inline-flex items-center gap-1.5"><Icon name="valider" size={16} />Sauvegarder</span>}
            </button>
            <button onClick={() => { setDraft(q.data); setOpen(false); }}
              className="px-4 py-2 rounded-xl font-bold text-sm text-white/40 border border-white/10 hover:border-white/20 transition-colors">
              Annuler
            </button>
            <button onClick={del} disabled={deleting}
              className="ml-auto px-4 py-2 rounded-xl font-bold text-sm text-red-400/70 border border-red-500/20 hover:border-red-500/40 transition-colors disabled:opacity-40">
              {deleting ? "…" : <span className="inline-flex items-center gap-1.5"><Icon name="supprimer" size={16} />Supprimer</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "quiz" | "jeu";

export default function GameContentPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [questions, setQuestions] = useState<GQ[]>([]);
  const [tab, setTab] = useState<Tab>("quiz");
  const [quizLevel, setQuizLevel] = useState(1);
  const [jeuCat, setJeuCat] = useState(1);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) { router.replace("/admin"); return; }
      setAuthed(true);
    });
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/game-content");
    const json = await res.json();
    if (json.error === "TABLE_NOT_FOUND") {
      setTableError(true);
    } else if (json.questions) {
      setQuestions(json.questions);
      setTableError(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  async function seed() {
    setSeeding(true);
    const res = await fetch("/api/admin/game-content/seed", { method: "POST" });
    const json = await res.json();
    if (json.ok) {
      await load();
      setSaveStatus(`${json.seeded} questions importées`);
      setTimeout(() => setSaveStatus(null), 3000);
    } else if (json.error === "TABLE_NOT_FOUND") {
      setTableError(true);
    } else {
      setSaveStatus("Erreur: " + json.error);
      setTimeout(() => setSaveStatus(null), 5000);
    }
    setSeeding(false);
  }

  async function handleSave(id: string, data: Record<string, unknown>) {
    const res = await fetch("/api/admin/game-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data }),
    });
    const json = await res.json();
    if (json.question) {
      setQuestions(qs => qs.map(q => q.id === id ? json.question : q));
      setSaveStatus("Question sauvegardée ✓");
    } else {
      setSaveStatus("Erreur: " + json.error);
    }
    setTimeout(() => setSaveStatus(null), 3000);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/game-content?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.ok) {
      setQuestions(qs => qs.filter(q => q.id !== id));
      setSaveStatus("Question supprimée");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }

  // Filtered questions for current view
  const visible = questions.filter(q => {
    if (tab === "quiz") return q.section === "quiz" && q.level_id === quizLevel;
    return q.section === "jeu" && q.level_id === jeuCat;
  });

  const activeLabel = tab === "quiz" ? QUIZ_LEVELS[quizLevel] : JEU_CATS[jeuCat];

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#030918" }}>
      <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#030918" }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/30 text-sm hover:text-white transition-colors">← Admin</Link>
            <div>
              <h1 className="text-white font-black text-2xl">Contenu des Jeux</h1>
              <p className="text-white/30 text-sm">Quiz & Jeu — éditeur de questions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus && (
              <span className="text-green-400 text-sm font-bold px-3 py-1 rounded-lg bg-green-400/10 border border-green-400/20">
                {saveStatus}
              </span>
            )}
            <button onClick={seed} disabled={seeding}
              className="px-4 py-2 rounded-xl font-bold text-sm border border-amber-400/30 text-amber-400 hover:bg-amber-400/10 transition-colors disabled:opacity-40">
              {seeding ? "Import…" : <span className="inline-flex items-center gap-1.5"><Icon name="telechargement" size={16} />Importer données</span>}
            </button>
          </div>
        </div>

        {/* Table not found — always shown when detected */}
        {tableError && (
          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/8 p-6 mb-6">
            <h2 className="text-yellow-400 font-black text-lg mb-2"><span className="inline-flex items-center gap-1.5"><Icon name="alerte" size={20} />Table non trouvée</span></h2>
            <p className="text-white/50 text-sm mb-4">
              La table <code className="text-amber-300 bg-white/5 px-1 rounded">game_questions</code> n&apos;existe pas encore dans Supabase.
            </p>
            <p className="text-white/40 text-sm mb-3">Exécutez ce SQL dans le <strong>SQL Editor</strong> de Supabase :</p>
            <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-green-300 text-xs overflow-x-auto mb-4">{`CREATE TABLE IF NOT EXISTS game_questions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  section     TEXT        NOT NULL,
  level_id    INT,
  q_index     INT         NOT NULL DEFAULT 0,
  type        TEXT        NOT NULL,
  data        JSONB       NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS game_questions_section_idx
  ON game_questions(section, level_id, q_index);

ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON game_questions
  USING (true) WITH CHECK (true);`}</pre>
            <p className="text-white/40 text-xs">Après avoir créé la table, cliquez sur <strong>"Importer données"</strong> pour charger toutes les questions existantes.</p>
          </div>
        )}

        {/* Loading */}
        {loading && !tableError && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && !tableError && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Questions Quiz", count: questions.filter(q => q.section === "quiz").length, icon: "cours" as IconName },
                { label: "Questions Jeu", count: questions.filter(q => q.section === "jeu").length, icon: "defi" as IconName },
                { label: "Total actif", count: questions.filter(q => q.is_active).length, icon: "succes" as IconName },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-white/8 bg-white/3 p-4 text-center">
                  <div className="mb-1 flex justify-center text-white/80"><Icon name={s.icon} size={28} /></div>
                  <p className="text-white font-black text-xl">{s.count}</p>
                  <p className="text-white/30 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tab selector */}
            <div className="flex gap-2 mb-5">
              {(["quiz", "jeu"] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${tab === t ? "text-amber-400 border border-amber-400/30 bg-amber-400/8" : "text-white/40 border border-white/10 hover:border-white/20"}`}>
                  <span className="inline-flex items-center gap-1.5"><Icon name={t === "quiz" ? "cours" : "defi"} size={16} />{t === "quiz" ? "Quiz" : "Jeu"}</span>
                </button>
              ))}
            </div>

            {/* Sub-selector */}
            {tab === "quiz" && (
              <div className="flex flex-wrap gap-2 mb-5">
                {Object.entries(QUIZ_LEVELS).map(([id, lvl]) => (
                  <button key={id} onClick={() => setQuizLevel(+id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${quizLevel === +id ? "bg-amber-400/15 border border-amber-400/40 text-amber-300" : "bg-white/3 border border-white/8 text-white/40 hover:border-white/20"}`}>
                    <span className="inline-flex items-center gap-1.5"><Icon name={lvl.icon} size={16} />{lvl.text}</span>
                  </button>
                ))}
              </div>
            )}

            {tab === "jeu" && (
              <div className="flex gap-2 mb-5">
                {Object.entries(JEU_CATS).map(([id, cat]) => (
                  <button key={id} onClick={() => setJeuCat(+id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${jeuCat === +id ? "bg-amber-400/15 border border-amber-400/40 text-amber-300" : "bg-white/3 border border-white/8 text-white/40 hover:border-white/20"}`}>
                    <span className="inline-flex items-center gap-1.5"><Icon name={cat.icon} size={16} />{cat.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Question count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/30 text-xs font-bold uppercase tracking-wider">
                {visible.length} question{visible.length !== 1 ? "s" : ""} — <span className="inline-flex items-center gap-1.5"><Icon name={activeLabel.icon} size={16} />{activeLabel.text}</span>
              </p>
            </div>

            {/* Questions list */}
            {visible.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
                <div className="mb-3 flex justify-center text-white/40"><Icon name="email" size={32} /></div>
                <p className="text-white/40 text-sm">Aucune question dans cette section.</p>
                <p className="text-white/25 text-xs mt-1">Cliquez sur "Importer données" pour charger les questions existantes.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visible.map(q => (
                  <QuestionRow key={q.id} q={q} onSave={handleSave} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
