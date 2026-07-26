"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Icon, { IconName } from "@/app/components/Icon";

// ── Types ─────────────────────────────────────────────────────────────
type LText = { fr: string; ht: string; en: string; es?: string };
type Tag = { id: string; name: string; color: string; category: string };
type Question = {
  id: string; type: string; difficulty: string; status: string;
  question?: LText; statement?: LText; verse?: LText; clues?: LText[];
  option_a?: LText; option_b?: LText; option_c?: LText; option_d?: LText;
  correct_answer?: number; is_true?: boolean;
  reference?: string; suggested_round?: number;
  created_at: string;
  kp_question_tags?: { tag_id: string; kp_tags: Tag }[];
};
type Contest = { id: string; title: string };

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy:   { label: "Facile",   color: "#16a34a" },
  medium: { label: "Moyen",    color: "#2563eb" },
  hard:   { label: "Difficile",color: "#ea580c" },
  expert: { label: "Expert",   color: "#dc2626" },
};
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:     { label: "Brouillon", color: "#6b7280" },
  validated: { label: "Validée",   color: "#16a34a" },
  published: { label: "Publiée",   color: "#2563eb" },
};
const TYPE_LABELS: Record<string, string> = {
  mcq: "QCM", tf: "Vrai/Faux", fill: "Compléter",
  character: "Personnage", location: "Lieu", book: "Livre",
  chrono: "Chronologie", finale: "Finale",
};
const ROUND_NAMES: Record<number, string> = {
  1:"L'Éveil", 2:"Le Témoignage", 3:"La Parole", 4:"La Galerie",
  5:"Les Terres Saintes", 6:"Les Livres", 7:"La Chronologie",
  8:"Qui suis-je ?", 9:"Les Rois", 10:"Les Miracles",
  11:"Les Prophéties", 12:"Les Défis", 13:"Les Citations",
  14:"Les Experts", 15:"La Grande Finale",
};

function getQText(q: Question): string {
  if (q.type === "tf") return q.statement?.fr ?? "";
  if (q.type === "fill") return q.verse?.fr ?? "";
  if (q.type === "character" || q.type === "location" || q.type === "book")
    return q.clues?.[0]?.fr ?? "";
  return q.question?.fr ?? "";
}
function getOptions(q: Question): string[] {
  return [q.option_a?.fr, q.option_b?.fr, q.option_c?.fr, q.option_d?.fr].filter(Boolean) as string[];
}

// ── Empty question builder ─────────────────────────────────────────────
function emptyLText(): LText { return { fr: "", ht: "", en: "", es: "" }; }
function buildEmpty(type = "mcq"): Omit<Question, "id" | "created_at"> {
  return {
    type, difficulty: "medium", status: "draft",
    question: emptyLText(), statement: emptyLText(), verse: emptyLText(), clues: [emptyLText()],
    option_a: emptyLText(), option_b: emptyLText(), option_c: emptyLText(), option_d: emptyLText(),
    correct_answer: 0, is_true: true, reference: "", suggested_round: 1,
    kp_question_tags: [],
  };
}

// ── Question Card ──────────────────────────────────────────────────────
function QuestionCard({ q, onEdit, onDelete, onDuplicate }: {
  q: Question;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const opts = getOptions(q);
  const diff = DIFFICULTY_LABELS[q.difficulty] ?? DIFFICULTY_LABELS.medium;
  const stat = STATUS_LABELS[q.status] ?? STATUS_LABELS.draft;
  const tags = q.kp_question_tags?.map(t => t.kp_tags).filter(Boolean) ?? [];

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
            {TYPE_LABELS[q.type] ?? q.type}
          </span>
          {q.suggested_round && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">
              M{q.suggested_round} — {ROUND_NAMES[q.suggested_round]}
            </span>
          )}
          <span className="text-[10px] font-bold" style={{ color: diff.color }}>{diff.label}</span>
          <span className="text-[10px] font-bold" style={{ color: stat.color }}>● {stat.label}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onDuplicate} title="Dupliquer"
            className="text-[11px] px-2 py-1 rounded border border-stone-200 text-stone-400 hover:text-blue-600 hover:border-blue-300 transition-colors">⧉</button>
          <button onClick={onEdit}
            className="text-[11px] px-2 py-1 rounded border border-stone-200 text-stone-500 hover:text-[#c5a84f] hover:border-[#c5a84f] transition-colors font-semibold">Modifier</button>
          <button onClick={onDelete}
            className="text-[11px] px-2 py-1 rounded border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-300 transition-colors"><Icon name="fermer" size={16} /></button>
        </div>
      </div>

      <p className="text-sm font-semibold text-stone-800 leading-snug mb-2">{getQText(q) || "(sans texte)"}</p>

      {opts.length > 0 && (
        <div className="grid grid-cols-2 gap-1 mb-2">
          {opts.map((opt, i) => (
            <div key={i} className={`text-[11px] px-2 py-1 rounded-lg border ${
              q.correct_answer === i
                ? "bg-green-50 border-green-300 text-green-700 font-semibold"
                : "bg-stone-50 border-stone-200 text-stone-500"
            }`}>
              <span className="font-black opacity-40 mr-1">{["A","B","C","D"][i]}</span>
              {opt}
              {q.correct_answer === i && <Icon name="valider" size={12} className="inline-block align-middle ml-0.5" />}
            </div>
          ))}
        </div>
      )}

      {q.type === "tf" && (
        <div className="flex gap-2 mb-2">
          {[{ v: true, l: "Vrai" }, { v: false, l: "Faux" }].map(({ v, l }) => (
            <span key={String(v)} className={`text-[11px] px-3 py-1 rounded-lg border font-semibold ${
              q.is_true === v ? "bg-green-50 border-green-300 text-green-700" : "bg-stone-50 border-stone-200 text-stone-400"
            }`}>{l}{q.is_true === v && <Icon name="valider" size={12} className="inline-block align-middle ml-0.5" />}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1 items-center">
        {q.reference && <span className="text-[10px] text-stone-400 italic mr-1">{q.reference}</span>}
        {tags.map(t => (
          <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: t.color + "20", color: t.color }}>{t.name}</span>
        ))}
      </div>
    </div>
  );
}

// ── Question Editor Modal ──────────────────────────────────────────────
function QuestionEditor({ question, tags, onSave, onClose }: {
  question: Partial<Question> | null;
  tags: Tag[];
  onSave: (data: Partial<Question>, tagIds: string[]) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Question>>(question ?? buildEmpty());
  const [selectedTags, setSelectedTags] = useState<string[]>(
    question?.kp_question_tags?.map(t => t.tag_id) ?? []
  );
  const [langTab, setLangTab] = useState<"fr" | "ht" | "en">("fr");

  const ltext = (v: LText | undefined) => v ?? emptyLText();
  const setLText = (field: keyof Question, val: string) => {
    setForm(p => ({ ...p, [field]: { ...ltext(p[field] as LText), [langTab]: val } }));
  };
  const syncFR = (field: keyof Question) => {
    const fr = (form[field] as LText)?.fr ?? "";
    setForm(p => ({ ...p, [field]: { fr, ht: fr, en: fr } }));
  };

  const setOpt = (opt: "option_a"|"option_b"|"option_c"|"option_d", val: string) => {
    const cur = ltext(form[opt] as LText);
    const updated = langTab === "fr" ? { fr: val, ht: cur.ht || val, en: cur.en || val } : { ...cur, [langTab]: val };
    setForm(p => ({ ...p, [opt]: updated }));
  };
  const syncAllOpts = () => {
    const opts = ["option_a","option_b","option_c","option_d"] as const;
    const updated: Partial<Question> = {};
    for (const o of opts) {
      const fr = (form[o] as LText)?.fr ?? "";
      updated[o] = { fr, ht: fr, en: fr };
    }
    setForm(p => ({ ...p, ...updated }));
  };

  const type = form.type ?? "mcq";
  const isMCQ = ["mcq","finale","character","location","book"].includes(type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 sticky top-0 bg-white z-10">
          <h2 className="font-black text-stone-800 text-lg">
            {question?.id ? "Modifier la question" : "Nouvelle question"}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-xl font-black"><Icon name="fermer" size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Type + Difficulté + Statut */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-black uppercase text-stone-400 mb-1 block">Type</label>
              <select value={type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white">
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase text-stone-400 mb-1 block">Difficulté</label>
              <select value={form.difficulty ?? "medium"} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white">
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase text-stone-400 mb-1 block">Statut</label>
              <select value={form.status ?? "draft"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white">
                <option value="draft">Brouillon</option>
                <option value="validated">✅ Validée</option>
                <option value="published">Publiée</option>
              </select>
            </div>
          </div>

          {/* Manche suggérée */}
          <div>
            <label className="text-[11px] font-black uppercase text-stone-400 mb-1 block">Manche</label>
            <select value={form.suggested_round ?? 1} onChange={e => setForm(p => ({ ...p, suggested_round: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white">
              {Object.entries(ROUND_NAMES).map(([n, name]) => (
                <option key={n} value={n}>Manche {n} — {name}</option>
              ))}
            </select>
          </div>

          {/* Lang tabs */}
          <div className="flex gap-1">
            {(["fr","ht","en"] as const).map(l => (
              <button key={l} onClick={() => setLangTab(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-colors ${langTab === l ? "bg-[#c5a84f] text-white" : "bg-stone-100 text-stone-400 hover:text-stone-600"}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Question text */}
          {type === "tf" ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-[11px] font-black uppercase text-stone-400">Affirmation ({langTab.toUpperCase()})</label>
                <button onClick={() => syncFR("statement")} className="text-[10px] px-2 py-0.5 rounded border border-stone-200 text-stone-300 hover:text-[#c5a84f] hover:border-[#c5a84f] transition-colors">FR→ALL</button>
              </div>
              <textarea value={ltext(form.statement as LText)[langTab]} onChange={e => setLText("statement", e.target.value)}
                rows={3} placeholder="Affirmation vraie ou fausse..."
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 outline-none resize-none focus:border-[#c5a84f]" />
              <div className="flex gap-3 mt-2">
                {[{ v: true, icon: "succes" as IconName, label: "Vrai" }, { v: false, icon: "fermer" as IconName, label: "Faux" }].map(({ v, icon, label }) => (
                  <button key={String(v)} onClick={() => setForm(p => ({ ...p, is_true: v }))}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${form.is_true === v ? "bg-green-50 border-green-400 text-green-700" : "bg-stone-50 border-stone-200 text-stone-400"}`}>
                    <span className="inline-flex items-center gap-1.5"><Icon name={icon} size={16} />{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : type === "fill" ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-[11px] font-black uppercase text-stone-400">Verset à compléter ({langTab.toUpperCase()})</label>
                <button onClick={() => syncFR("verse")} className="text-[10px] px-2 py-0.5 rounded border border-stone-200 text-stone-300 hover:text-[#c5a84f] hover:border-[#c5a84f] transition-colors">FR→ALL</button>
              </div>
              <textarea value={ltext(form.verse as LText)[langTab]} onChange={e => setLText("verse", e.target.value)}
                rows={2} placeholder="Verset avec ______ à la place du mot manquant"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 outline-none resize-none focus:border-[#c5a84f]" />
            </div>
          ) : (type === "character" || type === "location" || type === "book") ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-[11px] font-black uppercase text-stone-400">Indices ({langTab.toUpperCase()})</label>
              </div>
              {(form.clues ?? [emptyLText()]).map((clue, ci) => (
                <div key={ci} className="flex gap-2 mb-2">
                  <input value={(clue as LText)[langTab] ?? ""} onChange={e => {
                    const clues = [...(form.clues ?? [])];
                    clues[ci] = { ...ltext(clue as LText), [langTab]: e.target.value };
                    setForm(p => ({ ...p, clues }));
                  }} placeholder={`Indice ${ci + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 outline-none focus:border-[#c5a84f]" />
                  <button onClick={() => setForm(p => ({ ...p, clues: (p.clues ?? []).filter((_, i) => i !== ci) }))}
                    className="text-stone-300 hover:text-red-400 text-xs px-2"><Icon name="fermer" size={14} /></button>
                </div>
              ))}
              <button onClick={() => setForm(p => ({ ...p, clues: [...(p.clues ?? []), emptyLText()] }))}
                className="text-xs text-[#c5a84f] hover:underline">+ Ajouter un indice</button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-[11px] font-black uppercase text-stone-400">Question ({langTab.toUpperCase()})</label>
                <button onClick={() => syncFR("question")} className="text-[10px] px-2 py-0.5 rounded border border-stone-200 text-stone-300 hover:text-[#c5a84f] hover:border-[#c5a84f] transition-colors">FR→ALL</button>
              </div>
              <textarea value={ltext(form.question as LText)[langTab]} onChange={e => setLText("question", e.target.value)}
                rows={3} placeholder="Question biblique..."
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 outline-none resize-none focus:border-[#c5a84f]" />
            </div>
          )}

          {/* Options A/B/C/D */}
          {isMCQ && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-[11px] font-black uppercase text-stone-400">Réponses</label>
                <button onClick={syncAllOpts} className="text-[10px] px-2 py-0.5 rounded border border-stone-200 text-stone-300 hover:text-[#c5a84f] hover:border-[#c5a84f] transition-colors">FR→ALL</button>
              </div>
              {(["option_a","option_b","option_c","option_d"] as const).map((opt, i) => (
                <div key={opt} className="flex items-center gap-2 mb-2">
                  <button onClick={() => setForm(p => ({ ...p, correct_answer: i }))}
                    className="w-5 h-5 rounded-full border-2 shrink-0 transition-all"
                    style={{ background: form.correct_answer === i ? "#c5a84f" : "transparent", borderColor: form.correct_answer === i ? "#c5a84f" : "#d1d5db" }} />
                  <span className="text-xs font-black text-stone-400 w-4">{["A","B","C","D"][i]}</span>
                  <input value={ltext(form[opt] as LText)[langTab]} onChange={e => setOpt(opt, e.target.value)}
                    placeholder={`Réponse ${["A","B","C","D"][i]}`}
                    className="flex-1 px-2 py-1.5 rounded-lg border text-sm text-stone-700 outline-none focus:border-[#c5a84f]"
                    style={{ borderColor: form.correct_answer === i ? "#c5a84f80" : "#e5e7eb" }} />
                </div>
              ))}
            </div>
          )}

          {type === "fill" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-[11px] font-black uppercase text-stone-400">Options de complétion</label>
                <button onClick={syncAllOpts} className="text-[10px] px-2 py-0.5 rounded border border-stone-200 text-stone-300 hover:text-[#c5a84f] hover:border-[#c5a84f] transition-colors">FR→ALL</button>
              </div>
              {(["option_a","option_b","option_c","option_d"] as const).map((opt, i) => (
                <div key={opt} className="flex items-center gap-2 mb-2">
                  <button onClick={() => setForm(p => ({ ...p, correct_answer: i }))}
                    className="w-5 h-5 rounded-full border-2 shrink-0 transition-all"
                    style={{ background: form.correct_answer === i ? "#c5a84f" : "transparent", borderColor: form.correct_answer === i ? "#c5a84f" : "#d1d5db" }} />
                  <span className="text-xs font-black text-stone-400 w-4">{["A","B","C","D"][i]}</span>
                  <input value={ltext(form[opt] as LText)[langTab]} onChange={e => setOpt(opt, e.target.value)}
                    placeholder={`Mot ${["A","B","C","D"][i]}`}
                    className="flex-1 px-2 py-1.5 rounded-lg border text-sm text-stone-700 outline-none focus:border-[#c5a84f]"
                    style={{ borderColor: form.correct_answer === i ? "#c5a84f80" : "#e5e7eb" }} />
                </div>
              ))}
            </div>
          )}

          {/* Référence */}
          <div>
            <label className="text-[11px] font-black uppercase text-stone-400 mb-1 block">Référence biblique</label>
            <input value={form.reference ?? ""} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
              placeholder="ex: Genèse 1:1"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 outline-none focus:border-[#c5a84f]" />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-black uppercase text-stone-400 mb-2 block">Tags / Thèmes</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => {
                const sel = selectedTags.includes(tag.id);
                return (
                  <button key={tag.id} onClick={() => setSelectedTags(prev => sel ? prev.filter(t => t !== tag.id) : [...prev, tag.id])}
                    className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all"
                    style={{ background: sel ? tag.color + "20" : "#f9fafb", borderColor: sel ? tag.color : "#e5e7eb", color: sel ? tag.color : "#9ca3af" }}>
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-stone-500 border border-stone-200 hover:bg-stone-50">Annuler</button>
          <button onClick={() => onSave(form, selectedTags)}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white transition-colors"
            style={{ background: "#c5a84f" }}>
            {question?.id ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Publish Modal ──────────────────────────────────────────────────────
function PublishModal({ question, contests, onClose }: { question: Question; contests: Contest[]; onClose: () => void }) {
  const [contestId, setContestId] = useState("");
  const [roundId, setRoundId] = useState<string>("");
  const [kpRounds, setKpRounds] = useState<{ id: string; round_number: number }[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);

  async function loadRounds(cId: string) {
    const res = await fetch(`/api/admin/question-bank?contest_id=${cId}`);
    // Load kp_championship_rounds directly
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data } = await sb.from("kp_championship_rounds").select("id, round_number").eq("contest_id", cId).order("round_number");
    setKpRounds(data ?? []);
  }

  async function assign() {
    if (!roundId) return;
    setPublishing(true);
    // Assign question to round
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: existing } = await sb.from("kp_championship_questions").select("id").eq("round_id", roundId).eq("question_id", question.id).maybeSingle();
    if (!existing) {
      const { data: maxOrder } = await sb.from("kp_championship_questions").select("order_num").eq("round_id", roundId).order("order_num", { ascending: false }).limit(1).maybeSingle();
      await sb.from("kp_championship_questions").insert({ round_id: roundId, question_id: question.id, order_num: (maxOrder?.order_num ?? -1) + 1 });
    }
    setPublishing(false);
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-black text-stone-800 text-lg mb-1">Assigner à un championnat</h3>
        <p className="text-stone-400 text-sm mb-4 line-clamp-2">{getQText(question)}</p>
        {done ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-bold text-lg mb-3"><span className="inline-flex items-center gap-1.5"><Icon name="succes" size={18} />Question assignée !</span></p>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#c5a84f" }}>Fermer</button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] font-black uppercase text-stone-400 mb-1 block">Championnat</label>
                <select value={contestId} onChange={e => { setContestId(e.target.value); loadRounds(e.target.value); }}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white">
                  <option value="">— Choisir —</option>
                  {contests.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              {kpRounds.length > 0 && (
                <div>
                  <label className="text-[11px] font-black uppercase text-stone-400 mb-1 block">Manche</label>
                  <select value={roundId} onChange={e => setRoundId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white">
                    <option value="">— Choisir —</option>
                    {kpRounds.map(r => <option key={r.id} value={r.id}>Manche {r.round_number} — {ROUND_NAMES[r.round_number]}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-stone-500 border border-stone-200">Annuler</button>
              <button onClick={assign} disabled={!roundId || publishing}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40"
                style={{ background: "#c5a84f" }}>
                {publishing ? "..." : "Assigner"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function QuestionBankPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingQ, setEditingQ] = useState<Question | null | "new">(null);
  const [publishingQ, setPublishingQ] = useState<Question | null>(null);

  // Filters
  const [filterType, setFilterType] = useState("");
  const [filterDiff, setFilterDiff] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRound, setFilterRound] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/admin"); return; }
      setAuthed(true);
    });
  }, [router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType)   params.set("type", filterType);
    if (filterDiff)   params.set("difficulty", filterDiff);
    if (filterStatus) params.set("status", filterStatus);
    if (search)       params.set("search", search);
    params.set("limit", "200");

    const [qRes, tRes, cRes] = await Promise.all([
      fetch(`/api/admin/question-bank?${params}`),
      fetch("/api/admin/tags"),
      fetch("/api/contests"),
    ]);
    const [qData, tData, cData] = await Promise.all([qRes.json(), tRes.json(), cRes.json()]);

    let qs: Question[] = qData.questions ?? [];
    if (filterRound) qs = qs.filter(q => String(q.suggested_round) === filterRound);

    setQuestions(qs);
    setTotal(qData.total ?? 0);
    setTags(tData.tags ?? []);
    setContests((cData.contests ?? cData ?? []).filter((c: Contest & { is_private?: boolean }) => !c.is_private));
    setLoading(false);
  }, [filterType, filterDiff, filterStatus, filterRound, search]);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

  async function handleSave(data: Partial<Question>, tagIds: string[]) {
    const { kp_question_tags: _, ...clean } = data as Question;
    const isNew = !(editingQ as Question)?.id;
    const url  = isNew ? "/api/admin/question-bank" : `/api/admin/question-bank/${(editingQ as Question).id}`;
    const method = isNew ? "POST" : "PUT";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...clean, tags: tagIds }) });
    setEditingQ(null);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette question ?")) return;
    await fetch(`/api/admin/question-bank/${id}`, { method: "DELETE" });
    loadData();
  }

  async function handleDuplicate(q: Question) {
    const { id: _, created_at: __, kp_question_tags, ...data } = q;
    await fetch("/api/admin/question-bank", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, status: "draft", tags: kp_question_tags?.map(t => t.tag_id) ?? [] }),
    });
    loadData();
  }

  const tagsByCategory = tags.reduce<Record<string, Tag[]>>((acc, t) => {
    const cat = t.category ?? "autre";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  if (!authed) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-stone-400 text-sm">Vérification...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/admin")} className="text-stone-400 hover:text-stone-700 text-sm">← Admin</button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-stone-800"><span className="inline-flex items-center gap-1.5"><Icon name="fondation" size={22} />Banque Officielle KONEKSYON PAM</span></h1>
          <p className="text-stone-400 text-xs">{total} questions · Source unique de vérité</p>
        </div>
        <button onClick={() => setEditingQ("new")}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "#c5a84f" }}>
          + Nouvelle question
        </button>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar Filters */}
        <div className="w-56 bg-white border-r border-stone-200 overflow-y-auto p-4 shrink-0">
          <p className="text-[10px] font-black uppercase text-stone-400 mb-3">Filtres</p>

          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs text-stone-700 outline-none mb-3" />

          <div className="space-y-2 mb-4">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600 bg-white">
              <option value="">Tous les types</option>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600 bg-white">
              <option value="">Toutes difficultés</option>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
              <option value="expert">Expert</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600 bg-white">
              <option value="">Tous statuts</option>
              <option value="draft">Brouillon</option>
              <option value="validated">Validée</option>
              <option value="published">Publiée</option>
            </select>
            <select value={filterRound} onChange={e => setFilterRound(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600 bg-white">
              <option value="">Toutes manches</option>
              {Object.entries(ROUND_NAMES).map(([n, name]) => (
                <option key={n} value={n}>M{n} — {name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Tags</p>
          {Object.entries(tagsByCategory).map(([cat, catTags]) => (
            <div key={cat} className="mb-3">
              <p className="text-[9px] uppercase text-stone-300 mb-1">{cat}</p>
              <div className="flex flex-wrap gap-1">
                {catTags.map(t => (
                  <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded-full cursor-default"
                    style={{ background: t.color + "20", color: t.color }}>{t.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-20 text-stone-400">Chargement...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stone-400 mb-4">Aucune question dans la banque.</p>
              <button onClick={() => setEditingQ("new")} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "#c5a84f" }}>
                + Ajouter la première question
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {questions.map(q => (
                <QuestionCard key={q.id} q={q}
                  onEdit={() => setEditingQ(q)}
                  onDelete={() => handleDelete(q.id)}
                  onDuplicate={() => handleDuplicate(q)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {editingQ !== null && (
        <QuestionEditor
          question={editingQ === "new" ? null : editingQ}
          tags={tags}
          onSave={handleSave}
          onClose={() => setEditingQ(null)}
        />
      )}

      {/* Publish Modal */}
      {publishingQ && (
        <PublishModal question={publishingQ} contests={contests} onClose={() => { setPublishingQ(null); loadData(); }} />
      )}
    </div>
  );
}
