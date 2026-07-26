"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { ROUND_SPECS } from "@/lib/championship-rounds";
import type { ChampionshipQuestion, LText, RoundType } from "@/lib/championship-types";
import Link from "next/link";
import Icon, { IconName } from "@/app/components/Icon";
import LiveTest from "./LiveTest";

// ─── Types ───────────────────────────────────────────────────────────────────

type DeviceMode = "desktop" | "tablet" | "phone";
type LangTab = "fr" | "ht" | "en" | "es";
type PreviewPhase = "round_intro" | "question" | "reveal" | "results";

interface DBRound {
  id: string;
  round_number: number;
  round_type: string;
  title: { fr: string; ht?: string; en?: string; es?: string };
  color_theme: string;
  icon: string;
  time_limit_sec: number;
  points_per_q: number;
  questions: ChampionshipQuestion[];
}

interface Contest {
  id: string;
  title: string;
  theme?: string;
  status: string;
}

interface QCResult {
  label: string;
  ok: boolean;
  detail?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function t(o: LText | undefined, l: LangTab): string {
  if (!o) return "";
  return (l === "ht" ? o.ht : l === "en" ? o.en : l === "es" ? o.es : undefined) || o.fr || "";
}

function emptyLText(): LText { return { fr: "", ht: "", en: "", es: "" }; }

function getQSummary(q: ChampionshipQuestion, specType: RoundType): string {
  // For finale rounds, each question has its own type — use q.type when available
  const type = (specType === "finale" && q.type ? q.type : specType) as RoundType;
  if (type === "tf") return t(q.statement, "fr") || "Vrai/Faux";
  if (type === "fill") return t(q.verse, "fr") || "Compléter le verset";
  if (type === "character" || type === "location" || type === "book") {
    return q.clues?.[0] ? t(q.clues[0], "fr") : t(q.answer, "fr") || "Indice…";
  }
  if (type === "chrono" || type === "order_verse") return t(q.q, "fr") || "Remettre en ordre…";
  if (type === "match") return t(q.q, "fr") || "Associer…";
  return t(q.q, "fr") || "Question…";
}

function getCorrectLabel(q: ChampionshipQuestion, specType: RoundType): string {
  const type = (specType === "finale" && q.type ? q.type : specType) as RoundType;
  if (type === "tf") return q.is_true ? "✅ Vrai" : "❌ Faux";
  if (type === "fill") return t(q.answer_word, "fr") || `Option ${(q.correct ?? 0) + 1}`;
  if (type === "character" || type === "location" || type === "book") return t(q.answer, "fr") || "";
  if (q.options && q.correct !== undefined) return t(q.options[q.correct], "fr");
  return "";
}

function getRoundStatus(spec: typeof ROUND_SPECS[0], dbRound?: DBRound): "ready" | "incomplete" | "empty" {
  if (!dbRound || !dbRound.questions?.length) return "empty";
  const qs = dbRound.questions;
  // Use the DB round_type when available — spec.type is a fallback for display
  const effectiveType = (dbRound.round_type || spec.type) as string;
  for (const q of qs) {
    const type = (effectiveType === "finale" && q.type ? q.type : effectiveType) as string;
    if (type === "mcq" || type === "finale") {
      if (!q.q?.fr || !q.options?.length || q.correct === undefined) return "incomplete";
    } else if (type === "tf") {
      if (!q.statement?.fr || q.is_true === undefined) return "incomplete";
    } else if (type === "fill") {
      if (!q.verse?.fr || (!q.fill_options?.length && !q.options?.length)) return "incomplete";
    } else if (type === "character" || type === "location" || type === "book") {
      if (!q.clues?.length && !q.q?.fr) return "incomplete";
    } else if (type === "chrono" || type === "order_verse") {
      if (!q.q?.fr) return "incomplete";
    } else if (type === "match") {
      // match is always considered ready if it has data
    }
  }
  return "ready";
}

const DEVICE_SCALE: Record<DeviceMode, number> = { desktop: 1, tablet: 0.65, phone: 0.45 };
const DEVICE_WIDTH: Record<DeviceMode, number> = { desktop: 375, tablet: 768, phone: 390 };

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChampionshipStudio() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Auth
  const [authed, setAuthed] = useState(false);

  // Data
  const [contest, setContest] = useState<Contest | null>(null);
  const [dbRounds, setDbRounds] = useState<DBRound[]>([]);
  const [liveTest, setLiveTest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Studio state
  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);
  const [editingQIdx, setEditingQIdx] = useState<number | null>(null);
  const [editingQ, setEditingQ] = useState<ChampionshipQuestion | null>(null);
  const [langTab, setLangTab] = useState<LangTab>("fr");
  const [device, setDevice] = useState<DeviceMode>("phone");
  const [previewPhase, setPreviewPhase] = useState<PreviewPhase>("round_intro");
  const [previewQIdx, setPreviewQIdx] = useState(0);

  // Save state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI generation
  const [generatingRound, setGeneratingRound] = useState<number | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Auto-translate
  const [translating, setTranslating] = useState(false);

  // Quality control
  const [qcResults, setQcResults] = useState<QCResult[] | null>(null);
  const [showQC, setShowQC] = useState(false);

  // Drag
  const dragIdxRef = useRef<number | null>(null);

  // Simulation mode
  const [simMode, setSimMode] = useState(false);
  const [simPaused, setSimPaused] = useState(false);
  const [simPos, setSimPos] = useState<{ roundIdx: number; qIdx: number; phase: PreviewPhase }>({ roundIdx: 0, qIdx: 0, phase: "round_intro" });

  // ── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdmin(data.user)) { router.replace("/admin"); return; }
      setAuthed(true);
    });
  }, [router]);

  // ── Load data ─────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    const [cRes, rRes] = await Promise.all([
      fetch(`/api/contests/${id}`),
      fetch(`/api/contests/${id}/rounds`),
    ]);
    const [cd, rd] = await Promise.all([cRes.json(), rRes.json()]);
    setContest(cd.contest ?? cd);
    setDbRounds(rd.rounds ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

  // ── Current round ─────────────────────────────────────────────────────────

  const currentSpec = ROUND_SPECS[selectedRoundIdx];
  const currentDbRound = dbRounds.find(r => r.round_number === selectedRoundIdx + 1);
  const currentQuestions: ChampionshipQuestion[] = currentDbRound?.questions ?? [];

  // ── Auto-save ─────────────────────────────────────────────────────────────

  async function persistQuestion(roundNum: number, qIdx: number, qData: ChampionshipQuestion) {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/admin/contests/${id}/update-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round_number: roundNum, question_index: qIdx, question_data: qData }),
      });
      const d = await res.json();
      if (d.ok) {
        setSaveStatus("saved");
        // Update local state
        setDbRounds(prev => prev.map(r =>
          r.round_number === roundNum ? { ...r, questions: d.questions } : r
        ));
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }

  async function setRoundTime(roundNum: number, sec: number) {
    const clamped = Math.max(3, Math.min(120, Math.round(sec)));
    setDbRounds(prev => prev.map(r => r.round_number === roundNum ? { ...r, time_limit_sec: clamped } : r));
    try {
      await fetch(`/api/admin/contests/${id}/update-round-time`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round_number: roundNum, time_limit_sec: clamped }),
      });
    } catch { /* optimiste */ }
  }

  function scheduleAutoSave(qData: ChampionshipQuestion) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(() => {
      if (editingQIdx !== null && currentDbRound) {
        persistQuestion(currentDbRound.round_number, editingQIdx, qData);
      }
    }, 600);
  }

  function updateEditingQ(patch: Partial<ChampionshipQuestion>) {
    setEditingQ(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      scheduleAutoSave(next);
      return next;
    });
  }

  function updateEditingQOption(i: number, lang: LangTab, val: string) {
    setEditingQ(prev => {
      if (!prev) return prev;
      const opts = [...(prev.options ?? [emptyLText(), emptyLText(), emptyLText(), emptyLText()])];
      while (opts.length < 4) opts.push(emptyLText());
      if (i === -1) {
        // Sync all options FR → HT/EN/ES (triggered by SyncBtn)
        const synced = opts.map(o => ({ fr: (o as LText).fr ?? "", ht: (o as LText).fr ?? "", en: (o as LText).fr ?? "", es: (o as LText).fr ?? "" }));
        const next = { ...prev, options: synced };
        scheduleAutoSave(next);
        return next;
      }
      const cur = opts[i] as LText;
      // When writing in FR, auto-fill HT, EN, ES if they're empty
      if (lang === "fr") {
        opts[i] = { fr: val, ht: cur.ht || val, en: cur.en || val, es: cur.es || val };
      } else {
        opts[i] = { ...cur, [lang]: val };
      }
      const next = { ...prev, options: opts };
      scheduleAutoSave(next);
      return next;
    });
  }

  // ── Auto-translate current question ───────────────────────────────────────

  async function autoTranslateQuestion() {
    if (!editingQ || translating) return;
    setTranslating(true);
    try {
      const type = currentSpec.type;
      const fields: Record<string, string> = {};

      if (type === "tf") {
        if (editingQ.statement?.fr) fields.statement = editingQ.statement.fr;
        if (editingQ.explanation?.fr) fields.explanation = editingQ.explanation.fr;
      } else if (type === "fill") {
        if (editingQ.verse?.fr) fields.verse = editingQ.verse.fr;
        (editingQ.fill_options ?? editingQ.options ?? []).forEach((o, i) => {
          if ((o as LText)?.fr) fields[`option_${i}`] = (o as LText).fr;
        });
        if (editingQ.explanation?.fr) fields.explanation = editingQ.explanation.fr;
      } else if (type === "character" || type === "location" || type === "book") {
        (editingQ.clues ?? []).forEach((c, i) => {
          if ((c as LText)?.fr) fields[`clue_${i}`] = (c as LText).fr;
        });
        if (editingQ.answer?.fr) fields.answer = editingQ.answer.fr;
        (editingQ.options ?? []).forEach((o, i) => {
          if ((o as LText)?.fr) fields[`option_${i}`] = (o as LText).fr;
        });
        if (editingQ.explanation?.fr) fields.explanation = editingQ.explanation.fr;
      } else {
        if (editingQ.q?.fr) fields.question = editingQ.q.fr;
        (editingQ.options ?? []).forEach((o, i) => {
          if ((o as LText)?.fr) fields[`option_${i}`] = (o as LText).fr;
        });
        if (editingQ.explanation?.fr) fields.explanation = editingQ.explanation.fr;
      }

      if (!Object.keys(fields).length) { setTranslating(false); return; }

      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, source_lang: "fr" }),
      });
      const d = await res.json();
      if (!d.translated) { setTranslating(false); return; }

      const tr = d.translated as Record<string, { fr: string; en: string; es: string; ht: string }>;
      const patch: Partial<ChampionshipQuestion> = {};

      if (type === "tf") {
        if (tr.statement) patch.statement = tr.statement;
        if (tr.explanation) patch.explanation = tr.explanation;
      } else if (type === "fill") {
        if (tr.verse) patch.verse = tr.verse;
        const baseOpts = [...(editingQ.fill_options ?? editingQ.options ?? [emptyLText(), emptyLText(), emptyLText(), emptyLText()])];
        baseOpts.forEach((o, i) => { if (tr[`option_${i}`]) (baseOpts[i] as LText) && (baseOpts[i] = tr[`option_${i}`]); });
        patch.fill_options = baseOpts as LText[];
        patch.options = baseOpts as LText[];
        if (tr.explanation) patch.explanation = tr.explanation;
      } else if (type === "character" || type === "location" || type === "book") {
        const baseClues = [...(editingQ.clues ?? [emptyLText(), emptyLText(), emptyLText()])];
        baseClues.forEach((c, i) => { if (tr[`clue_${i}`]) baseClues[i] = tr[`clue_${i}`]; });
        patch.clues = baseClues as LText[];
        if (tr.answer) patch.answer = tr.answer;
        const baseOpts = [...(editingQ.options ?? [emptyLText(), emptyLText(), emptyLText(), emptyLText()])];
        baseOpts.forEach((o, i) => { if (tr[`option_${i}`]) baseOpts[i] = tr[`option_${i}`]; });
        patch.options = baseOpts as LText[];
        if (tr.explanation) patch.explanation = tr.explanation;
      } else {
        if (tr.question) patch.q = tr.question;
        const baseOpts = [...(editingQ.options ?? [emptyLText(), emptyLText(), emptyLText(), emptyLText()])];
        baseOpts.forEach((o, i) => { if (tr[`option_${i}`]) baseOpts[i] = tr[`option_${i}`]; });
        patch.options = baseOpts as LText[];
        if (tr.explanation) patch.explanation = tr.explanation;
      }

      updateEditingQ(patch);
    } catch { /* silently fail */ }
    setTranslating(false);
  }

  // ── Open question editor ──────────────────────────────────────────────────

  function openEditor(qIdx: number) {
    setEditingQIdx(qIdx);
    const q = currentQuestions[qIdx];
    setEditingQ(q ? { ...q } : buildEmptyQ());
    setPreviewQIdx(qIdx);
    setPreviewPhase("question");
  }

  function closeEditor() {
    setEditingQIdx(null);
    setEditingQ(null);
    setSaveStatus("idle");
  }

  function buildEmptyQ(): ChampionshipQuestion {
    const type = currentSpec.type;
    const base: ChampionshipQuestion = { type };
    if (type === "tf") return { ...base, statement: emptyLText(), is_true: true, ref: "" };
    if (type === "fill") return { ...base, verse: emptyLText(), fill_options: [emptyLText(), emptyLText(), emptyLText(), emptyLText()], correct: 0, ref: "" };
    if (type === "character" || type === "location" || type === "book") {
      return { ...base, clues: [emptyLText(), emptyLText(), emptyLText()], options: [emptyLText(), emptyLText(), emptyLText(), emptyLText()], correct: 0, answer: emptyLText(), ref: "" };
    }
    if (type === "chrono" || type === "order_verse") return { ...base, items: [emptyLText(), emptyLText(), emptyLText()], correct_order: [0, 1, 2], ref: "" };
    if (type === "match") return { ...base, left: [emptyLText(), emptyLText(), emptyLText()], right: [emptyLText(), emptyLText(), emptyLText()], pairs: [0, 1, 2], ref: "" };
    return { ...base, q: emptyLText(), options: [emptyLText(), emptyLText(), emptyLText(), emptyLText()], correct: 0, ref: "" };
  }

  // ── Add / duplicate / delete question ────────────────────────────────────

  function addQuestion() {
    const newQ = buildEmptyQ();
    const newIdx = currentQuestions.length;
    if (currentDbRound) {
      persistQuestion(currentDbRound.round_number, newIdx, newQ);
    }
    setTimeout(() => openEditor(newIdx), 400);
  }

  function duplicateQuestion(qIdx: number) {
    const q = currentQuestions[qIdx];
    if (!q || !currentDbRound) return;
    persistQuestion(currentDbRound.round_number, currentQuestions.length, { ...q });
  }

  async function deleteQuestion(qIdx: number) {
    if (!currentDbRound) return;
    if (!confirm("Supprimer cette question ?")) return;
    const res = await fetch(`/api/admin/contests/${id}/delete-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ round_number: currentDbRound.round_number, question_index: qIdx }),
    });
    const d = await res.json();
    if (d.ok) {
      setDbRounds(prev => prev.map(r => r.round_number === currentDbRound.round_number ? { ...r, questions: d.questions } : r));
      if (editingQIdx === qIdx) closeEditor();
    }
  }

  // ── Drag to reorder ───────────────────────────────────────────────────────

  async function reorderQuestions(fromIdx: number, toIdx: number) {
    if (!currentDbRound || fromIdx === toIdx) return;
    const qs = [...currentQuestions];
    const [moved] = qs.splice(fromIdx, 1);
    qs.splice(toIdx, 0, moved);

    // Update all questions in sequence
    setDbRounds(prev => prev.map(r => r.round_number === currentDbRound.round_number ? { ...r, questions: qs } : r));

    for (let i = 0; i < qs.length; i++) {
      await fetch(`/api/admin/contests/${id}/update-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round_number: currentDbRound.round_number, question_index: i, question_data: qs[i] }),
      });
    }
  }

  // ── AI Generation ─────────────────────────────────────────────────────────

  async function generateRound(roundIdx: number) {
    const spec = ROUND_SPECS[roundIdx];
    setGeneratingRound(roundIdx);
    setGenError(null);
    try {
      const res = await fetch(`/api/admin/contests/${id}/generate-rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num_rounds: 1, round_type: spec.type, round_number: roundIdx + 1 }),
      });
      const d = await res.json();
      if (d.ok) {
        await loadData();
      } else {
        setGenError(d.error || "Erreur de génération");
      }
    } catch {
      setGenError("Erreur réseau");
    }
    setGeneratingRound(null);
  }

  // ── Quality Control ───────────────────────────────────────────────────────

  function runQC(): QCResult[] {
    const results: QCResult[] = [];
    const roundsWithQ = dbRounds.filter(r => r.questions?.length > 0);

    results.push({
      label: "Au moins 5 épreuves avec des questions",
      ok: roundsWithQ.length >= 5,
      detail: `${roundsWithQ.length} / 15 épreuves renseignées`,
    });

    let allHaveOptions = true;
    let allHaveCorrect = true;
    let allHaveRef = true;
    let allHaveFrText = true;
    let noEmpty = true;

    for (const dbR of dbRounds) {
      const spec = ROUND_SPECS[dbR.round_number - 1];
      if (!spec) continue;
      for (const q of (dbR.questions ?? [])) {
        // Use individual question type for finale rounds
        const type = (spec.type === "finale" && q.type ? q.type : spec.type) as string;
        if (type === "mcq" || type === "character" || type === "location" || type === "book") {
          if (!q.options?.length && !q.clues?.length) allHaveOptions = false;
          if (q.correct === undefined) allHaveCorrect = false;
          if (!q.q?.fr && !q.clues?.[0]?.fr) allHaveFrText = false;
        } else if (type === "tf") {
          if (q.is_true === undefined) allHaveCorrect = false;
          if (!q.statement?.fr) allHaveFrText = false;
        } else if (type === "fill") {
          if (!q.fill_options?.length && !q.options?.length) allHaveOptions = false;
          if (q.correct === undefined) allHaveCorrect = false;
          if (!q.verse?.fr) allHaveFrText = false;
        } else if (type === "chrono" || type === "order_verse") {
          if (!q.q?.fr) allHaveFrText = false;
        } else if (type === "finale") {
          if (!q.options?.length && !q.clues?.length) allHaveOptions = false;
          if (q.correct === undefined) allHaveCorrect = false;
          if (!q.q?.fr && !q.clues?.[0]?.fr && !q.statement?.fr) allHaveFrText = false;
        }
        if (!q.ref) allHaveRef = false;
        const texts = [q.q?.fr, q.statement?.fr, q.verse?.fr, q.clues?.[0]?.fr];
        if (texts.every(x => !x)) noEmpty = false;
      }
    }

    results.push({ label: "Toutes les questions ont des options de réponse", ok: allHaveOptions });
    results.push({ label: "Toutes les questions ont une bonne réponse définie", ok: allHaveCorrect });
    results.push({ label: "Toutes les questions ont une référence biblique", ok: allHaveRef });
    results.push({ label: "Les traductions FR existent pour toutes les questions", ok: allHaveFrText });
    results.push({ label: "Aucune question n'est vide", ok: noEmpty });

    return results;
  }

  // ─── Simulation mode ──────────────────────────────────────────────────────

  const simCurrentRoundQuestions = simMode
    ? (dbRounds.find(r => r.round_number === simPos.roundIdx + 1)?.questions ?? [])
    : [];
  const simCurrentQ = simMode ? (simCurrentRoundQuestions[simPos.qIdx] ?? null) : null;
  const simCurrentSpec = simMode ? ROUND_SPECS[simPos.roundIdx] : currentSpec;
  const simTotalQs = dbRounds.reduce((acc, r) => acc + (r.questions?.length ?? 0), 0);
  const simGlobalQIdx = dbRounds
    .filter(r => r.round_number <= simPos.roundIdx)
    .reduce((acc, r) => acc + (r.questions?.length ?? 0), 0) + simPos.qIdx;

  function enterSimMode() {
    setSimMode(true);
    setSimPaused(false);
    setSimPos({ roundIdx: 0, qIdx: 0, phase: "round_intro" });
    setSelectedRoundIdx(0);
    setEditingQIdx(null);
    setEditingQ(null);
  }

  function exitSimMode() {
    setSimMode(false);
    setSimPaused(false);
    setEditingQIdx(null);
    setEditingQ(null);
  }

  function simNext() {
    const { roundIdx, qIdx, phase } = simPos;
    const dbR = dbRounds.find(r => r.round_number === roundIdx + 1);
    const qs = dbR?.questions ?? [];
    if (phase === "round_intro") {
      setSimPos({ roundIdx, qIdx: 0, phase: "question" });
    } else if (phase === "question") {
      setSimPos({ roundIdx, qIdx, phase: "reveal" });
    } else if (phase === "reveal") {
      if (qIdx < qs.length - 1) {
        setSimPos({ roundIdx, qIdx: qIdx + 1, phase: "question" });
      } else if (roundIdx < 14) {
        const next = roundIdx + 1;
        setSimPos({ roundIdx: next, qIdx: 0, phase: "round_intro" });
        setSelectedRoundIdx(next);
        setEditingQIdx(null);
        setEditingQ(null);
      } else {
        exitSimMode();
      }
    }
  }

  function simPrev() {
    const { roundIdx, qIdx, phase } = simPos;
    if (phase === "reveal") {
      setSimPos({ roundIdx, qIdx, phase: "question" });
    } else if (phase === "question") {
      if (qIdx > 0) {
        setSimPos({ roundIdx, qIdx: qIdx - 1, phase: "reveal" });
      } else {
        setSimPos({ roundIdx, qIdx: 0, phase: "round_intro" });
      }
    } else if (phase === "round_intro" && roundIdx > 0) {
      const prevDbR = dbRounds.find(r => r.round_number === roundIdx);
      const prevQs = prevDbR?.questions ?? [];
      const prev = roundIdx - 1;
      setSimPos({ roundIdx: prev, qIdx: Math.max(0, prevQs.length - 1), phase: "reveal" });
      setSelectedRoundIdx(prev);
      setEditingQIdx(null);
      setEditingQ(null);
    }
  }

  function simPauseAndEdit() {
    setSimPaused(true);
    const { qIdx } = simPos;
    setEditingQIdx(qIdx);
    const q = simCurrentRoundQuestions[qIdx];
    if (q) setEditingQ({ ...q });
    setPreviewPhase("question");
    setPreviewQIdx(qIdx);
  }

  function simResume() {
    setSimPaused(false);
    setEditingQIdx(null);
    setEditingQ(null);
  }

  // ─── Preview helpers ──────────────────────────────────────────────────────

  const previewQ = currentQuestions[previewQIdx] ?? null;
  const accentColor = currentSpec?.color ?? "#6366f1";

  // ─── Loading / auth ───────────────────────────────────────────────────────

  if (!authed || loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f4f1ea" }}>
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  const qcPassed = qcResults ? qcResults.every(r => r.ok) : false;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f4f1ea", color: "#2d3748", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e8e4de" }}
        className="sticky top-0 z-50 px-6 py-3 flex items-center gap-4">
        <Link href={`/admin/concours/${id}`}
          className="text-[#4a6080] hover:text-[#1a3568] text-sm transition-colors">← Admin</Link>
        <div className="w-px h-4 bg-[#e8e4de]" />
        <span className="text-[#1a3568] text-xs font-bold inline-flex items-center gap-1.5"><Icon name="video" size={14} /> Championship Studio</span>
        <span className="text-[#9ca3af] text-xs truncate max-w-xs">{contest?.title}</span>
        <div className="ml-auto flex items-center gap-3">
          {saveStatus === "saving" && <span className="text-[#9ca3af] text-xs animate-pulse">Sauvegarde…</span>}
          {saveStatus === "saved" && <span className="text-[#16a34a] text-xs inline-flex items-center gap-1.5"><Icon name="valider" size={14} /> Sauvegardé</span>}
          {saveStatus === "error" && <span className="text-[#dc2626] text-xs inline-flex items-center gap-1.5"><Icon name="fermer" size={14} /> Erreur de sauvegarde</span>}
          <button onClick={() => { const r = runQC(); setQcResults(r); setShowQC(true); }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors inline-flex items-center gap-1.5"
            style={{ borderColor: "#e8e4de", background: "#faf8f4", color: "#4a6080" }}>
            <Icon name="recherche" size={14} /> Vérifier
          </button>
          <button onClick={() => setLiveTest(true)}
            className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.40)", color: "#16a34a" }}>
            ▶ Test en direct
          </button>
          {!simMode ? (
            <button onClick={enterSimMode}
              className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
              style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(200,150,15,0.35)", color: "#c8960f" }}>
              ▶ Aperçu
            </button>
          ) : (
            <button onClick={exitSimMode}
              className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors inline-flex items-center gap-1.5"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#dc2626" }}>
              <Icon name="fermer" size={14} /> Quitter
            </button>
          )}
          <Link href={`/admin/concours/${id}/championship-control`}
            className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors inline-flex items-center gap-1.5"
            style={{ background: "#22c55e18", border: "1px solid #16a34a40", color: "#16a34a" }}>
            <Icon name="defi" size={14} /> Contrôle
          </Link>
        </div>
      </header>

      {/* ── Main split ── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 53px)" }}>

        {/* ═══ LEFT PANEL ═══ */}
        <div className="flex flex-col overflow-hidden" style={{ width: "60%", borderRight: "1px solid #e8e4de" }}>

          {/* Timeline */}
          <div className="shrink-0 px-4 py-3" style={{ borderBottom: "1px solid #e8e4de", background: "#faf8f4" }}>
            <p className="text-[#4a6080] text-[10px] font-black uppercase tracking-wider mb-2">Timeline — 15 Épreuves</p>
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {ROUND_SPECS.map((spec, idx) => {
                const dbR = dbRounds.find(r => r.round_number === idx + 1);
                const status = getRoundStatus(spec, dbR);
                const isSelected = selectedRoundIdx === idx;
                const borderColor = isSelected
                  ? spec.color
                  : status === "ready" ? "#16a34a"
                  : status === "incomplete" ? "#d97706"
                  : "#9ca3af";
                return (
                  <button key={idx} onClick={() => { setSelectedRoundIdx(idx); setEditingQIdx(null); setPreviewPhase("round_intro"); setPreviewQIdx(0); }}
                    className="shrink-0 rounded-xl p-2.5 text-left transition-all"
                    style={{
                      width: 100,
                      background: isSelected ? spec.color + "14" : "#ffffff",
                      border: `1px solid ${isSelected ? spec.color : "#e8e4de"}`,
                      opacity: isSelected ? 1 : 0.9,
                    }}>
                    <div className="text-lg mb-1">{spec.icon}</div>
                    <p className="text-[#1a3568] text-[10px] font-black leading-tight">{spec.name.fr}</p>
                    <p className="text-[#9ca3af] text-[9px] mt-0.5">{dbR?.questions?.length ?? 0}q</p>
                    <p className="text-[9px] mt-0.5" style={{ color: borderColor }}>
                      {status === "ready" ? "✓ Prêt" : status === "incomplete" ? "⚠ Incomplet" : "○ Vide"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sim pause banner */}
          {simMode && simPaused && (
            <div className="shrink-0 px-4 py-2 flex items-center gap-2"
              style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(200,150,15,0.30)" }}>
              <span className="text-[10px] text-[#c8960f] font-black">⏸ SIMULATION EN PAUSE — Corrigez la question {simPos.qIdx + 1}, puis cliquez ▶ Reprendre</span>
            </div>
          )}

          {/* Round editor area */}
          <div className="flex-1 overflow-y-auto p-4">

            {/* Round header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: currentSpec.color + "20", border: `1px solid ${currentSpec.color}40` }}>
                {currentSpec.icon}
              </div>
              <div className="flex-1">
                <h2 className="font-black text-[#1a3568] text-base">{currentSpec.name.fr}</h2>
                <p className="text-[#4a6080] text-xs">{currentSpec.description.fr}</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "#c8960f14", border: "1px solid #c8960f33" }}>
                <Icon name="chrono" size={14} color="#c8960f" />
                <input
                  type="number" min={3} max={120}
                  value={currentDbRound?.time_limit_sec ?? currentSpec.time_per_question}
                  onChange={(e) => { if (currentDbRound) setRoundTime(currentDbRound.round_number, Number(e.target.value)); }}
                  className="w-12 text-center font-bold text-sm bg-transparent outline-none"
                  style={{ color: "#c8960f" }}
                  title="Secondes par question (appliqué au live et au test)"
                />
                <span className="text-[10px] font-bold" style={{ color: "#c8960f" }}>s / question</span>
              </div>
              <button onClick={addQuestion}
                className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                style={{ background: "#22c55e18", border: "1px solid #16a34a40", color: "#16a34a" }}>
                + Ajouter
              </button>
            </div>

            {genError && (
              <div className="mb-3 p-3 rounded-xl text-xs text-[#dc2626] flex items-center gap-1.5" style={{ background: "#ef444418", border: "1px solid #ef444440" }}>
                <Icon name="fermer" size={14} /> {genError}
              </div>
            )}

            {/* Question list */}
            {currentQuestions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#9ca3af] text-sm mb-4">Aucune question pour cette épreuve</p>
                <button onClick={addQuestion}
                  className="text-sm px-4 py-2 rounded-xl font-bold inline-flex items-center gap-1.5"
                  style={{ background: "#22c55e18", border: "1px solid #16a34a40", color: "#16a34a" }}>
                  + Ajouter une question
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {currentQuestions.map((q, qIdx) => {
                  const isEditing = editingQIdx === qIdx;
                  return (
                    <div key={qIdx}
                      draggable
                      onDragStart={() => { dragIdxRef.current = qIdx; }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => { if (dragIdxRef.current !== null && dragIdxRef.current !== qIdx) { reorderQuestions(dragIdxRef.current, qIdx); dragIdxRef.current = null; } }}
                      className="rounded-xl p-3 transition-all"
                      style={{
                        background: isEditing ? currentSpec.color + "10" : "#ffffff",
                        border: `1px solid ${isEditing ? currentSpec.color + "50" : "#e8e4de"}`,
                        cursor: "grab",
                      }}>
                      <div className="flex items-start gap-2">
                        <span className="text-[#9ca3af] text-xs mt-1 shrink-0">⠿</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2d3748] text-sm leading-snug truncate">{getQSummary(q, currentSpec.type)}</p>
                          {getCorrectLabel(q, currentSpec.type) && (
                            <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: currentSpec.color }}><Icon name="valider" size={14} /> {getCorrectLabel(q, currentSpec.type)}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEditor(qIdx)}
                            className="text-[10px] px-2 py-1 rounded-lg transition-colors"
                            style={{ background: "#f0ece5", color: "#4a6080" }}>Éditer</button>
                          <button onClick={() => duplicateQuestion(qIdx)}
                            className="text-[10px] px-2 py-1 rounded-lg transition-colors"
                            style={{ background: "#f0ece5", color: "#4a6080" }}>Dupliquer</button>
                          <button onClick={() => deleteQuestion(qIdx)}
                            className="text-[10px] px-2 py-1 rounded-lg transition-colors"
                            style={{ background: "rgba(239,68,68,0.10)", color: "#dc2626" }}>Suppr.</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Question Editor ── */}
            {editingQIdx !== null && editingQ && (
              <div className="mt-4 rounded-2xl p-4" style={{ background: "#faf8f4", border: `1px solid ${currentSpec.color}30` }}>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <h3 className="font-black text-[#1a3568] text-sm flex-1">Édition — Question {editingQIdx + 1}</h3>
                  {/* Auto-translate button */}
                  <button onClick={autoTranslateQuestion} disabled={translating}
                    className="text-[10px] px-2 py-0.5 rounded font-bold transition-colors disabled:opacity-40 inline-flex items-center gap-1"
                    style={{ background: "rgba(200,150,15,0.12)", border: "1px solid rgba(200,150,15,0.30)", color: "#c8960f" }}
                    title="Traduire automatiquement FR → EN, ES, HT">
                    {translating ? "⏳ IA…" : <><Icon name="monde" size={12} /> Traduire</>}
                  </button>
                  {/* Lang tabs */}
                  <div className="flex gap-1 text-[10px]">
                    {(["fr", "ht", "en", "es"] as LangTab[]).map(l => (
                      <button key={l} onClick={() => setLangTab(l)}
                        className="px-2 py-0.5 rounded font-bold transition-colors"
                        style={{ background: langTab === l ? currentSpec.color + "30" : "#f0ece5", color: langTab === l ? currentSpec.color : "#9ca3af" }}>
                        {l === "fr" ? "🇫🇷" : l === "ht" ? "🇭🇹" : l === "en" ? "🇺🇸" : "🇪🇸"}
                      </button>
                    ))}
                  </div>
                  <button onClick={closeEditor} className="text-[#9ca3af] hover:text-[#1a3568] text-lg">×</button>
                </div>

                <EditorFields q={editingQ} type={currentSpec.type} lang={langTab}
                  onChange={updateEditingQ} onOptionChange={updateEditingQOption} accent={currentSpec.color} />

                {/* Bible reference */}
                <div className="mt-3">
                  <label className="text-[#4a6080] text-[10px] uppercase tracking-wider">Référence biblique</label>
                  <input value={editingQ.ref ?? ""} onChange={e => updateEditingQ({ ref: e.target.value })}
                    placeholder="ex: Jean 3:16"
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-[#2d3748] outline-none"
                    style={{ background: "#ffffff", border: "1px solid #e8e4de" }} />
                </div>

                {/* Explanation */}
                <div className="mt-3">
                  <div className="flex items-center gap-1">
                    <label className="text-[#4a6080] text-[10px] uppercase tracking-wider">Explication ({langTab.toUpperCase()})</label>
                    <button type="button"
                      onClick={() => { const fr = editingQ.explanation?.fr ?? ""; updateEditingQ({ explanation: { fr, ht: fr, en: fr, es: fr } }); }}
                      title="Copier FR vers HT et EN"
                      className="ml-1 text-[9px] font-black px-1.5 py-0.5 rounded border border-[#e8e4de] text-[#9ca3af] hover:text-[#c8960f] hover:border-[#c8960f] transition-colors">
                      FR→ALL
                    </button>
                  </div>
                  <textarea value={t(editingQ.explanation, langTab)}
                    onChange={e => updateEditingQ({ explanation: { ...(editingQ.explanation ?? emptyLText()), [langTab]: e.target.value } })}
                    placeholder="Explication biblique de la réponse…"
                    rows={2}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-[#2d3748] outline-none resize-none"
                    style={{ background: "#ffffff", border: "1px solid #e8e4de" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT PANEL — Preview / Simulation ═══ */}
        <div className="flex flex-col" style={{ width: "40%", background: "#ffffff" }}>

          {liveTest ? (
            <div className="flex-1 p-3" style={{ minHeight: 0 }}>
              <LiveTest
                rounds={dbRounds}
                onClose={() => setLiveTest(false)}
                onEdit={(ri, qi) => {
                  // Corriger depuis le test → ouvre l'éditeur (qui persiste en LIVE) sur la bonne question.
                  setSelectedRoundIdx(ri);
                  const dbR = dbRounds.find((r) => r.round_number === ri + 1);
                  const qq = dbR?.questions?.[qi];
                  setEditingQIdx(qi);
                  setEditingQ(qq ? { ...qq } : buildEmptyQ());
                  setPreviewQIdx(qi);
                  setPreviewPhase("question");
                }}
              />
            </div>
          ) : simMode ? (
            <>
              {/* Simulation header */}
              <div className="shrink-0 px-4 py-3 flex flex-col gap-2"
                style={{ borderBottom: "1px solid #e8e4de", background: simPaused ? "rgba(251,191,36,0.10)" : "#faf8f4" }}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: simPaused ? "#c8960f" : "#16a34a" }}>
                    {simPaused ? "⏸ PAUSE — ÉDITION" : "▶ SIMULATION EN COURS"}
                  </span>
                  <span className="text-[#4a6080] text-[10px] ml-auto">
                    Manche {simPos.roundIdx + 1}/15 — Q{simPos.qIdx + 1}/{simCurrentRoundQuestions.length || "?"}
                  </span>
                </div>
                {/* Global progress bar */}
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "#e8e4de" }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${simTotalQs ? ((simGlobalQIdx / simTotalQs) * 100).toFixed(1) : 0}%`, background: simPaused ? "#c8960f" : "#16a34a" }} />
                </div>
                {/* Controls */}
                <div className="flex gap-2">
                  <button onClick={simPrev} disabled={simPaused}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30"
                    style={{ background: "#f0ece5", color: "#4a6080" }}>
                    ◀ Précédent
                  </button>
                  {!simPaused ? (
                    <button onClick={simPauseAndEdit}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                      style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(200,150,15,0.35)", color: "#c8960f" }}>
                      ⏸ Pause & Éditer
                    </button>
                  ) : (
                    <button onClick={simResume}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                      style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(22,163,74,0.35)", color: "#16a34a" }}>
                      ▶ Reprendre
                    </button>
                  )}
                  <button onClick={simNext} disabled={simPaused}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30"
                    style={{ background: simPaused ? "#f0ece5" : "rgba(34,197,94,0.15)", border: simPaused ? undefined : "1px solid rgba(22,163,74,0.35)", color: simPaused ? "#9ca3af" : "#16a34a" }}>
                    Suivant ▶
                  </button>
                </div>
              </div>

              {/* Simulation preview frame */}
              <div className="flex-1 flex items-center justify-center overflow-hidden p-4"
                style={{ opacity: simPaused ? 0.5 : 1, transition: "opacity 0.2s" }}>
                <div style={{
                  transform: "scale(0.45)", transformOrigin: "top center",
                  width: 390, height: 680,
                  borderRadius: 32, overflow: "hidden",
                  border: `2px solid ${simPaused ? "rgba(200,150,15,0.6)" : "#334155"}`,
                  boxShadow: `0 10px 40px rgba(26,53,104,0.18)${simPaused ? ", 0 0 0 2px rgba(200,150,15,0.3)" : ""}`,
                  flexShrink: 0,
                }}>
                  <PreviewPane
                    phase={simPos.phase}
                    spec={simCurrentSpec}
                    question={simCurrentQ}
                    questionIdx={simPos.qIdx}
                    totalQuestions={simCurrentRoundQuestions.length}
                    onNext={simNext}
                  />
                </div>
              </div>

              {/* Round progress dots */}
              <div className="shrink-0 px-4 py-2 flex gap-1 justify-center flex-wrap"
                style={{ borderTop: "1px solid #e8e4de" }}>
                {ROUND_SPECS.map((spec, i) => (
                  <div key={i} className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center"
                    title={spec.name.fr}
                    style={{
                      background: i < simPos.roundIdx ? "#22c55e30" : i === simPos.roundIdx ? spec.color : "#e8e4de",
                      border: `1px solid ${i === simPos.roundIdx ? spec.color : "transparent"}`,
                      color: i < simPos.roundIdx ? "#16a34a" : "#9ca3af",
                    }}>
                    {i < simPos.roundIdx ? <Icon name="valider" size={10} /> : ""}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Normal preview controls */}
              <div className="shrink-0 px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: "1px solid #e8e4de" }}>
                <span className="text-[#4a6080] text-[10px] font-black uppercase tracking-wider">Aperçu</span>
                <div className="flex gap-1 ml-auto">
                  {([["desktop", "💻"], ["tablet", "🖥"], ["phone", "📱"]] as [DeviceMode, string][]).map(([d, icon]) => (
                    <button key={d} onClick={() => setDevice(d)}
                      className="text-xs px-2 py-1 rounded-lg transition-colors"
                      style={{ background: device === d ? "#e8e4de" : "#faf8f4", color: device === d ? "#1a3568" : "#9ca3af" }}>
                      {icon}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {([["round_intro", "exercice"], ["question", "info"], ["reveal", "succes"], ["results", "trophee"]] as [PreviewPhase, IconName][]).map(([ph, icon]) => (
                    <button key={ph} onClick={() => setPreviewPhase(ph)}
                      className="text-[10px] px-2 py-1 rounded-lg transition-colors inline-flex items-center justify-center"
                      style={{ background: previewPhase === ph ? currentSpec.color + "20" : "#faf8f4", color: previewPhase === ph ? currentSpec.color : "#9ca3af" }}>
                      <Icon name={icon} size={14} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview frame */}
              <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
                <div style={{
                  transform: `scale(${DEVICE_SCALE[device]})`,
                  transformOrigin: "top center",
                  width: DEVICE_WIDTH[device],
                  height: 680,
                  borderRadius: device === "phone" ? 32 : device === "tablet" ? 16 : 8,
                  overflow: "hidden",
                  border: `2px solid #334155`,
                  boxShadow: "0 10px 40px rgba(26,53,104,0.18)",
                  flexShrink: 0,
                }}>
                  <PreviewPane
                    phase={previewPhase} spec={currentSpec}
                    question={previewQ}
                    questionIdx={previewQIdx}
                    totalQuestions={currentQuestions.length}
                    onNext={() => {
                      if (previewPhase === "round_intro") setPreviewPhase("question");
                      else if (previewPhase === "question") setPreviewPhase("reveal");
                      else if (previewPhase === "reveal") {
                        if (previewQIdx < currentQuestions.length - 1) { setPreviewQIdx(p => p + 1); setPreviewPhase("question"); }
                        else setPreviewPhase("results");
                      }
                    }}
                  />
                </div>
              </div>

              {/* Question navigation */}
              {currentQuestions.length > 1 && (
                <div className="shrink-0 px-4 py-2 flex gap-1 justify-center flex-wrap"
                  style={{ borderTop: "1px solid #e8e4de" }}>
                  {currentQuestions.map((_, i) => (
                    <button key={i} onClick={() => { setPreviewQIdx(i); setPreviewPhase("question"); openEditor(i); }}
                      className="w-6 h-6 rounded-full text-[10px] font-bold transition-all"
                      style={{
                        background: previewQIdx === i ? currentSpec.color : "#e8e4de",
                        color: previewQIdx === i ? "white" : "#9ca3af",
                      }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Quality Control Modal ── */}
      {showQC && qcResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.45)" }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid #e8e4de" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-[#1a3568] text-lg inline-flex items-center gap-2"><Icon name="recherche" size={20} /> Contrôle qualité</h2>
              <button onClick={() => setShowQC(false)} className="text-[#9ca3af] hover:text-[#1a3568] text-xl">×</button>
            </div>
            <div className="space-y-3 mb-6">
              {qcResults.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5">{r.ok ? <Icon name="succes" size={18} color="#16a34a" /> : <Icon name="fermer" size={18} color="#dc2626" />}</span>
                  <div>
                    <p className="text-sm" style={{ color: r.ok ? "#16a34a" : "#dc2626" }}>{r.label}</p>
                    {r.detail && <p className="text-[#4a6080] text-xs mt-0.5">{r.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowQC(false)}
                className="flex-1 py-2 rounded-xl text-sm font-bold"
                style={{ background: "#f0ece5", color: "#4a6080" }}>
                Fermer
              </button>
              {qcPassed && (
                <button
                  onClick={async () => {
                    await fetch(`/api/contests/${id}/control`, {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "publish" }),
                    });
                    setShowQC(false);
                  }}
                  className="flex-1 py-2 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5"
                  style={{ background: "#22c55e20", border: "1px solid #16a34a40", color: "#16a34a" }}>
                  <Icon name="fusee" size={16} /> Publier le championnat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Editor Fields Component ──────────────────────────────────────────────────

function SyncBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      title="Copier FR vers HT, EN et ES"
      className="ml-1 text-[9px] font-black px-1.5 py-0.5 rounded border border-[#e8e4de] text-[#9ca3af] hover:text-[#c8960f] hover:border-[#c8960f] transition-colors whitespace-nowrap">
      FR→ALL
    </button>
  );
}

function EditorFields({ q, type, lang, onChange, onOptionChange, accent }: {
  q: ChampionshipQuestion;
  type: RoundType;
  lang: LangTab;
  onChange: (patch: Partial<ChampionshipQuestion>) => void;
  onOptionChange: (i: number, lang: LangTab, val: string) => void;
  accent: string;
}) {
  function emptyLText(): LText { return { fr: "", ht: "", en: "", es: "" }; }

  // Copy the FR value of an LText field to HT, EN and ES
  function syncLText(current: LText | undefined): LText {
    const fr = current?.fr ?? "";
    return { fr, ht: fr, en: fr, es: fr };
  }

  if (type === "tf") return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-1">
          <label className="text-[#4a6080] text-[10px] uppercase tracking-wider">Affirmation ({lang.toUpperCase()})</label>
          <SyncBtn onClick={() => onChange({ statement: syncLText(q.statement as LText | undefined) })} />
        </div>
        <textarea value={(q.statement as LText | undefined)?.[lang] ?? ""}
          onChange={e => onChange({ statement: { ...(q.statement ?? emptyLText()), [lang]: e.target.value } })}
          rows={3} placeholder="Affirmation biblique…"
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-[#2d3748] outline-none resize-none"
          style={{ background: "#ffffff", border: "1px solid #e8e4de" }} />
      </div>
      <div className="flex gap-3">
        {[true, false].map(v => (
          <button key={String(v)} onClick={() => onChange({ is_true: v })}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all inline-flex items-center justify-center gap-1.5"
            style={{
              background: q.is_true === v ? (v ? "#22c55e20" : "#ef444420") : "#faf8f4",
              border: `1px solid ${q.is_true === v ? (v ? "#16a34a50" : "#dc262650") : "#e8e4de"}`,
              color: q.is_true === v ? (v ? "#16a34a" : "#dc2626") : "#4a6080",
            }}>
            {v ? <><Icon name="succes" size={16} /> Vrai</> : <><Icon name="fermer" size={16} /> Faux</>}
          </button>
        ))}
      </div>
    </div>
  );

  if (type === "fill") return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-1">
          <label className="text-[#4a6080] text-[10px] uppercase tracking-wider">Verset avec ___ ({lang.toUpperCase()})</label>
          <SyncBtn onClick={() => onChange({ verse: syncLText(q.verse as LText | undefined) })} />
        </div>
        <textarea value={(q.verse as LText | undefined)?.[lang] ?? ""}
          onChange={e => onChange({ verse: { ...(q.verse ?? emptyLText()), [lang]: e.target.value } })}
          rows={3} placeholder="Ex: Car Dieu a tant aimé le ___ qu'il a donné..."
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-[#2d3748] outline-none resize-none"
          style={{ background: "#ffffff", border: "1px solid #e8e4de" }} />
      </div>
      <div>
        <label className="text-[#4a6080] text-[10px] uppercase tracking-wider">Options de mots</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {[0, 1, 2, 3].map(i => {
            const opts = q.fill_options ?? q.options ?? [];
            return (
              <div key={i} className="flex items-center gap-2">
                <button onClick={() => onChange({ correct: i })}
                  className="w-4 h-4 rounded-full border shrink-0 transition-all"
                  style={{ background: q.correct === i ? accent : "transparent", borderColor: q.correct === i ? accent : "#cbd5e1" }} />
                <input value={(opts[i] as LText | undefined)?.[lang] ?? ""}
                  onChange={e => {
                    const newOpts = [...(q.fill_options ?? q.options ?? [emptyLText(), emptyLText(), emptyLText(), emptyLText()])];
                    while (newOpts.length < 4) newOpts.push(emptyLText());
                    newOpts[i] = { ...(newOpts[i] as LText), [lang]: e.target.value };
                    onChange({ fill_options: newOpts as LText[], options: newOpts as LText[] });
                  }}
                  onBlur={e => {
                    // Auto-sync FR value to HT/EN on blur if they're empty
                    const newOpts = [...(q.fill_options ?? q.options ?? [emptyLText(), emptyLText(), emptyLText(), emptyLText()])];
                    while (newOpts.length < 4) newOpts.push(emptyLText());
                    const cur = newOpts[i] as LText;
                    if (lang === "fr" && (!cur.ht || !cur.en)) {
                      newOpts[i] = { fr: e.target.value, ht: cur.ht || e.target.value, en: cur.en || e.target.value };
                      onChange({ fill_options: newOpts as LText[], options: newOpts as LText[] });
                    }
                  }}
                  placeholder={`Mot ${i + 1}`}
                  className="flex-1 px-2 py-1.5 rounded-lg text-xs text-[#2d3748] outline-none"
                  style={{ background: "#ffffff", border: `1px solid ${q.correct === i ? accent + "50" : "#e8e4de"}` }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (type === "character" || type === "location" || type === "book") return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-1">
          <label className="text-[#4a6080] text-[10px] uppercase tracking-wider">Indices ({lang.toUpperCase()})</label>
          <SyncBtn onClick={() => {
            const clues = (q.clues ?? [emptyLText(), emptyLText(), emptyLText()]) as LText[];
            onChange({ clues: clues.map(c => ({ fr: c.fr ?? "", ht: c.fr ?? "", en: c.fr ?? "", es: c.fr ?? "" })) });
          }} />
        </div>
        {[0, 1, 2].map(i => (
          <input key={i} value={(q.clues?.[i] as LText | undefined)?.[lang] ?? ""}
            onChange={e => {
              const clues = [...(q.clues ?? [emptyLText(), emptyLText(), emptyLText()])];
              while (clues.length < 3) clues.push(emptyLText());
              clues[i] = { ...(clues[i] as LText), [lang]: e.target.value };
              onChange({ clues: clues as LText[] });
            }}
            placeholder={`Indice ${i + 1}`}
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-[#2d3748] outline-none"
            style={{ background: "#ffffff", border: "1px solid #e8e4de" }} />
        ))}
      </div>
      <div>
        <label className="text-[#4a6080] text-[10px] uppercase tracking-wider">4 Options (sélectionner la bonne)</label>
        <div className="space-y-1.5 mt-1">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => onChange({ correct: i, answer: { ...((q.options?.[i] as LText | undefined) ?? emptyLText()) } })}
                className="w-4 h-4 rounded-full border shrink-0 transition-all"
                style={{ background: q.correct === i ? accent : "transparent", borderColor: q.correct === i ? accent : "#cbd5e1" }} />
              <input value={(q.options?.[i] as LText | undefined)?.[lang] ?? ""}
                onChange={e => onOptionChange(i, lang, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 px-2 py-1.5 rounded-lg text-xs text-[#2d3748] outline-none"
                style={{ background: "#ffffff", border: `1px solid ${q.correct === i ? accent + "50" : "#e8e4de"}` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Default: MCQ / finale
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-1">
          <label className="text-[#4a6080] text-[10px] uppercase tracking-wider">Question ({lang.toUpperCase()})</label>
          <SyncBtn onClick={() => onChange({ q: syncLText(q.q as LText | undefined) })} />
        </div>
        <textarea value={(q.q as LText | undefined)?.[lang] ?? ""}
          onChange={e => onChange({ q: { ...(q.q ?? { fr: "", ht: "", en: "" }), [lang]: e.target.value } })}
          rows={3} placeholder="Question biblique…"
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-[#2d3748] outline-none resize-none"
          style={{ background: "#ffffff", border: "1px solid #e8e4de" }} />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <label className="text-[#4a6080] text-[10px] uppercase tracking-wider">Réponses (cocher la bonne)</label>
          <SyncBtn onClick={() => {
            const opts = (q.options ?? [emptyLText(), emptyLText(), emptyLText(), emptyLText()]) as LText[];
            onOptionChange(-1, "fr", "");
            onChange({ options: opts.map(o => ({ fr: o.fr ?? "", ht: o.fr ?? "", en: o.fr ?? "", es: o.fr ?? "" })) });
          }} />
        </div>
        <div className="space-y-1.5 mt-1">
          {["A", "B", "C", "D"].map((ltr, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => onChange({ correct: i })}
                className="w-4 h-4 rounded-full border shrink-0 transition-all"
                style={{ background: q.correct === i ? accent : "transparent", borderColor: q.correct === i ? accent : "#cbd5e1" }} />
              <span className="text-[#4a6080] text-xs font-black w-4">{ltr}</span>
              <input value={(q.options?.[i] as LText | undefined)?.[lang] ?? ""}
                onChange={e => onOptionChange(i, lang, e.target.value)}
                onBlur={e => {
                  // Auto-sync FR → HT/EN on blur if empty
                  if (lang === "fr") {
                    const cur = (q.options?.[i] as LText | undefined) ?? emptyLText();
                    if (!cur.ht || !cur.en) onOptionChange(i, "fr", e.target.value);
                  }
                }}
                placeholder={`Réponse ${ltr}`}
                className="flex-1 px-2 py-1.5 rounded-lg text-xs text-[#2d3748] outline-none"
                style={{ background: "#ffffff", border: `1px solid ${q.correct === i ? accent + "50" : "#e8e4de"}` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Preview Pane Component ───────────────────────────────────────────────────

function PreviewPane({ phase, spec, question, questionIdx, totalQuestions, onNext }: {
  phase: PreviewPhase;
  spec: typeof ROUND_SPECS[0];
  question: ChampionshipQuestion | null;
  questionIdx: number;
  totalQuestions: number;
  onNext: () => void;
}) {
  const accent = spec.color;

  if (phase === "round_intro") return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: "#020717", fontFamily: "system-ui" }}>
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
        style={{ background: accent + "20", border: `2px solid ${accent}40` }}>
        {spec.icon}
      </div>
      <div className="text-center">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Épreuve {spec.index + 1}</p>
        <h2 className="text-white font-black text-xl mb-2">{spec.name.fr}</h2>
        <p className="text-white/50 text-xs">{spec.description.fr}</p>
      </div>
      <div className="flex gap-4 text-center">
        <div><p className="font-black text-lg" style={{ color: accent }}>{spec.questions_count}</p><p className="text-white/30 text-[10px]">questions</p></div>
        <div><p className="font-black text-lg" style={{ color: accent }}>{spec.time_per_question}s</p><p className="text-white/30 text-[10px]">par question</p></div>
        <div><p className="font-black text-lg" style={{ color: accent }}>{spec.base_points}</p><p className="text-white/30 text-[10px]">points</p></div>
      </div>
      <button onClick={onNext}
        className="px-6 py-2 rounded-xl text-sm font-bold"
        style={{ background: accent + "20", border: `1px solid ${accent}50`, color: accent }}>
        ▶ Aperçu de la question →
      </button>
    </div>
  );

  if (phase === "results") return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-6"
      style={{ background: "#020717" }}>
      <p className="text-4xl"><Icon name="trophee" size={40} /></p>
      <h2 className="text-white font-black text-lg">Résultats de l&apos;épreuve</h2>
      <div className="w-full space-y-2">
        {["🥇 Joueur 1", "🥈 Joueur 2", "🥉 Joueur 3"].map((name, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-sm">{name}</span>
            <span className="ml-auto font-black text-sm" style={{ color: accent }}>{(3 - i) * 450} pts</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} className="text-white/40 text-xs mt-2">Épreuve suivante →</button>
    </div>
  );

  // question or reveal
  const isReveal = phase === "reveal";
  const qText = question
    ? (spec.type === "tf" ? (question.statement?.fr ?? "?")
      : spec.type === "fill" ? (question.verse?.fr ?? "?")
      : (spec.type === "character" || spec.type === "location" || spec.type === "book") ? (question.clues?.[0]?.fr ?? "?")
      : (question.q?.fr ?? "?"))
    : "Question non disponible";

  const isFill = spec.type === "fill";
  const fillOpts: string[] = isFill
    ? ((question?.fill_options ?? question?.options ?? []) as LText[]).map(o => o?.fr ?? "")
    : [];
  const opts: string[] = isFill ? [] : (question?.options?.map((o: LText) => o.fr) ?? []);
  const correctIdx = question?.correct ?? 0;

  return (
    <div className="h-full flex flex-col" style={{ background: "#020717" }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <span className="text-base">{spec.icon}</span>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: isReveal ? "100%" : "50%", background: `linear-gradient(90deg, ${accent}, ${accent}90)` }} />
        </div>
        <span className="text-white/25 text-[10px]">{questionIdx + 1}/{totalQuestions}</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
          style={{ background: isReveal ? "rgba(255,255,255,0.05)" : accent + "20", color: isReveal ? "rgba(255,255,255,0.3)" : accent, border: `1px solid ${isReveal ? "rgba(255,255,255,0.08)" : accent + "40"}` }}>
          {isReveal ? <Icon name="valider" size={14} /> : "30"}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 gap-3 overflow-hidden">
        <div className="w-full">
          {(spec.type === "character" || spec.type === "location" || spec.type === "book") && question?.clues && question.clues.length > 1 && (
            <div className="mb-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {question.clues.slice(1).map((c: LText, ci: number) => (
                <p key={ci} className="text-white/40 text-xs">#{ci + 2} {c.fr}</p>
              ))}
            </div>
          )}
          <p className="text-white/80 text-sm font-bold text-center leading-relaxed">{qText}</p>
          {isReveal && question?.ref && (
            <p className="text-white/25 text-[10px] text-center mt-1">{question.ref}</p>
          )}
        </div>

        {/* Answer buttons */}
        {spec.type === "tf" ? (
          <div className="w-full grid grid-cols-2 gap-2">
            {[{ icon: "succes" as IconName, text: "Vrai", v: true }, { icon: "fermer" as IconName, text: "Faux", v: false }].map(({ icon, text, v }) => {
              const isCorrect = question?.is_true === v;
              return (
                <div key={String(v)} className="py-3 rounded-xl text-center text-xs font-bold"
                  style={{
                    background: isReveal && isCorrect ? "#22c55e18" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isReveal && isCorrect ? "#22c55e50" : "rgba(255,255,255,0.08)"}`,
                    color: isReveal && isCorrect ? "#22c55e" : "rgba(255,255,255,0.60)",
                  }}>
                  <span className="inline-flex items-center justify-center gap-1.5"><Icon name={icon} size={16} /> {text}</span>
                </div>
              );
            })}
          </div>
        ) : isFill && fillOpts.length > 0 ? (
          <div className="w-full flex flex-wrap gap-2 justify-center">
            {fillOpts.map((opt, i) => {
              const isCorrect = isReveal && i === correctIdx;
              return (
                <div key={i}
                  className="px-4 py-2 rounded-full text-xs font-bold border transition-all"
                  style={{
                    background: isCorrect ? "#22c55e15" : "rgba(255,255,255,0.06)",
                    borderColor: isCorrect ? "#22c55e50" : "rgba(255,255,255,0.15)",
                    color: isCorrect ? "#22c55e" : "rgba(255,255,255,0.75)",
                  }}>
                  {opt || `Mot ${i + 1}`}{isCorrect ? <Icon name="valider" size={12} style={{ display: "inline", marginLeft: 4, verticalAlign: "middle" }} /> : null}
                </div>
              );
            })}
          </div>
        ) : opts.length > 0 ? (
          <div className="w-full space-y-2">
            {opts.map((opt, i) => {
              const isCorrect = isReveal && i === correctIdx;
              return (
                <div key={i} className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold"
                  style={{
                    background: isCorrect ? "#22c55e15" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isCorrect ? "#22c55e40" : "rgba(255,255,255,0.08)"}`,
                    color: isCorrect ? "#22c55e" : "rgba(255,255,255,0.65)",
                  }}>
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span className="flex-1 truncate">{opt || `Option ${i + 1}`}</span>
                  {isCorrect && <Icon name="valider" size={14} />}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full py-4 rounded-xl text-center text-xs text-white/30"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            Options non configurées
          </div>
        )}

        {isReveal && question?.explanation?.fr && (
          <div className="w-full rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-white/40 text-[10px] italic">{question.explanation.fr}</p>
          </div>
        )}

        <button onClick={onNext}
          className="text-xs px-4 py-1.5 rounded-lg font-bold"
          style={{ background: accent + "18", border: `1px solid ${accent}40`, color: accent }}>
          {phase === "question" ? "Voir la réponse →" : "Question suivante →"}
        </button>
      </div>
    </div>
  );
}
