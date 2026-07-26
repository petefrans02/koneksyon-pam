import { createClient } from "@supabase/supabase-js";
import type {
  ChampionshipPhase, ChampionshipStateRow, ChampionshipMetadata,
  ChampionshipQuestion, RoundSpec, SafeQuestion, RoundSpecBroadcast,
} from "./championship-types";
import { ROUND_SPECS, PHASE_DURATIONS, getRoundSpec } from "./championship-rounds";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface NextPhaseResult {
  phase: ChampionshipPhase;
  round_index: number;
  question_index: number;
  duration_ms: number | null;
  metadata: ChampionshipMetadata;
}

// ────────────────────────────────────────────────────────────────────────────
// PHASE TRANSITION LOGIC
// ────────────────────────────────────────────────────────────────────────────

export async function computeNextPhase(
  current: ChampionshipStateRow,
  contestId: string
): Promise<NextPhaseResult> {
  const { phase, round_index, question_index } = current;
  const spec = getRoundSpec(round_index);
  try {

  switch (phase) {
    case "LOBBY": {
      const { data: players } = await db()
        .from("contest_participants")
        .select("user_id")
        .eq("contest_id", contestId);
      return {
        phase: "COUNTDOWN",
        round_index: 0,
        question_index: 0,
        duration_ms: PHASE_DURATIONS.COUNTDOWN,
        metadata: { player_count: players?.length ?? 0 },
      };
    }

    case "COUNTDOWN":
      return {
        phase: "CHAMPIONSHIP_INTRO",
        round_index: 0,
        question_index: 0,
        duration_ms: PHASE_DURATIONS.CHAMPIONSHIP_INTRO,
        metadata: {},
      };

    case "CHAMPIONSHIP_INTRO":
      return buildRoundIntro(0);

    case "ROUND_INTRO": {
      const question = await fetchQuestion(contestId, round_index, 0);
      const timeSec = await getRoundTimeSec(contestId, round_index);
      return buildQuestionActive(round_index, 0, spec, question, timeSec);
    }

    case "QUESTION_ACTIVE": {
      const question = await fetchQuestion(contestId, round_index, question_index);
      const correctIndex = getCorrectIndex(question);
      const { data: correctAnswers } = await db()
        .from("championship_answers")
        .select("id")
        .eq("contest_id", contestId)
        .eq("round_index", round_index)
        .eq("question_index", question_index)
        .eq("is_correct", true);

      return {
        phase: "ANSWER_REVEAL",
        round_index,
        question_index,
        duration_ms: PHASE_DURATIONS.ANSWER_REVEAL,
        metadata: {
          // La question (sans la réponse) est nécessaire au client pour surligner
          // la bonne option / afficher le mot des « à compléter » au reveal.
          question: question ? stripCorrectAnswer(question) : undefined,
          correct_index: correctIndex ?? undefined,
          correct_answer:
            // Vrai / Faux : renvoyer la bonne réponse localisée (le client la traduit).
            (question?.type === "tf" && question?.is_true !== undefined)
              ? (question.is_true
                  ? { fr: "Vrai", ht: "Vre", en: "True", es: "Verdadero" }
                  : { fr: "Faux", ht: "Fo", en: "False", es: "Falso" })
            : question?.answer
            ?? (correctIndex !== null
                  ? (question?.options?.[correctIndex] ?? question?.fill_options?.[correctIndex])
                  : undefined)
            ?? question?.answer_word,
          correct_count: correctAnswers?.length ?? 0,
          explanation: question?.explanation,
          round_spec: buildRoundSpecBroadcast(spec),
        },
      };
    }

    case "ANSWER_REVEAL": {
      const nextQIdx = question_index + 1;
      const roundSpec = getRoundSpec(round_index);

      // Check both ROUND_SPECS count AND actual DB question existence
      const nextQ = nextQIdx < roundSpec.questions_count
        ? await fetchQuestion(contestId, round_index, nextQIdx)
        : null;

      if (nextQ !== null) {
        const timeSec = await getRoundTimeSec(contestId, round_index);
        return buildQuestionActive(round_index, nextQIdx, roundSpec, nextQ, timeSec);
      } else {
        const top3 = await fetchTop3(contestId);
        return {
          phase: "ROUND_RESULTS",
          round_index,
          question_index,
          duration_ms: PHASE_DURATIONS.ROUND_RESULTS,
          metadata: {
            round_name: roundSpec.name,
            round_total_points: roundSpec.total_points,
            top3,
          },
        };
      }
    }

    case "ROUND_RESULTS": {
      const nextRound = round_index + 1;
      if (nextRound >= ROUND_SPECS.length) {
        return buildPodium(contestId);
      }
      // Check if the next round actually exists in DB (contests may have fewer than 15 rounds)
      const { count: nextRoundCount } = await db()
        .from("contest_rounds")
        .select("id", { count: "exact", head: true })
        .eq("contest_id", contestId)
        .eq("round_number", nextRound + 1); // round_number is 1-based
      if ((nextRoundCount ?? 0) === 0) {
        return buildPodium(contestId);
      }
      const nextSpec = ROUND_SPECS[nextRound];
      return {
        phase: "BETWEEN_ROUNDS",
        round_index: nextRound,
        question_index: 0,
        duration_ms: PHASE_DURATIONS.BETWEEN_ROUNDS,
        metadata: {
          next_round_index: nextRound,
          next_round_spec: { name: nextSpec.name, icon: nextSpec.icon, color: nextSpec.color },
        },
      };
    }

    case "BETWEEN_ROUNDS":
      return buildRoundIntro(round_index);

    default:
      // Unknown or terminal phase — fall back to PODIUM to avoid infinite loops
      return buildPodium(contestId);
  }
  } catch (err) {
    // Safety net: any unhandled error goes to PODIUM instead of crashing
    console.error("[championship-engine] computeNextPhase error:", err, { phase, round_index, question_index });
    return buildPodium(contestId);
  }
}

function buildRoundSpecBroadcast(spec: RoundSpec): RoundSpecBroadcast {
  return {
    name: spec.name,
    description: spec.description,
    icon: spec.icon,
    color: spec.color,
    base_points: spec.base_points,
    time_per_question: spec.time_per_question,
  };
}

function buildRoundIntro(roundIdx: number): NextPhaseResult {
  const spec = getRoundSpec(roundIdx);
  return {
    phase: "ROUND_INTRO",
    round_index: roundIdx,
    question_index: 0,
    duration_ms: PHASE_DURATIONS.ROUND_INTRO,
    metadata: { round_spec: buildRoundSpecBroadcast(spec) },
  };
}

function buildQuestionActive(
  roundIdx: number, qIdx: number,
  spec: RoundSpec, question: ChampionshipQuestion | null,
  timeSec?: number | null
): NextPhaseResult {
  const safeQuestion: SafeQuestion | undefined = question
    ? stripCorrectAnswer(question)
    : undefined;
  const seconds = (typeof timeSec === "number" && timeSec > 0 ? timeSec : spec.time_per_question);
  return {
    phase: "QUESTION_ACTIVE",
    round_index: roundIdx,
    question_index: qIdx,
    duration_ms: seconds * 1000,
    metadata: {
      question: safeQuestion,
      round_spec: buildRoundSpecBroadcast(spec),
    },
  };
}

async function buildPodium(contestId: string): Promise<NextPhaseResult> {
  const { data: top10 } = await db()
    .from("championship_leaderboard")
    .select("player_name, player_avatar, total_score, current_rank")
    .eq("contest_id", contestId)
    .order("total_score", { ascending: false })
    .limit(10);

  const podium = (top10 ?? []).slice(0, 3).map((p, i) => ({
    rank: i + 1,
    player_name: p.player_name,
    player_avatar: p.player_avatar as string | null,
    total_score: p.total_score,
    badge: i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉",
  }));

  return {
    phase: "PODIUM",
    round_index: 14,
    question_index: 0,
    duration_ms: PHASE_DURATIONS.PODIUM,
    metadata: { podium },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// QUESTION FETCHING
// ────────────────────────────────────────────────────────────────────────────

// Durée par question (secondes) réglable par manche depuis le studio (fallback = spec).
async function getRoundTimeSec(contestId: string, roundIdx: number): Promise<number | null> {
  const { data } = await db()
    .from("contest_rounds")
    .select("time_limit_sec")
    .eq("contest_id", contestId)
    .eq("round_number", roundIdx + 1)
    .single();
  const t = (data as { time_limit_sec?: number | null } | null)?.time_limit_sec;
  return typeof t === "number" && t > 0 ? t : null;
}

async function fetchQuestion(
  contestId: string, roundIdx: number, qIdx: number
): Promise<ChampionshipQuestion | null> {
  const { data } = await db()
    .from("contest_rounds")
    .select("questions, round_type")
    .eq("contest_id", contestId)
    .eq("round_number", roundIdx + 1)
    .single();

  if (!data?.questions) return null;
  const questions: ChampionshipQuestion[] = Array.isArray(data.questions)
    ? (data.questions as ChampionshipQuestion[])
    : [];
  return questions[qIdx] ?? null;
}

async function fetchTop3(contestId: string) {
  const { data } = await db()
    .from("championship_leaderboard")
    .select("player_name, player_avatar, total_score")
    .eq("contest_id", contestId)
    .order("total_score", { ascending: false })
    .limit(3);

  return (data ?? []).map((p, i) => ({
    player_name: p.player_name,
    player_avatar: p.player_avatar as string | null,
    score: p.total_score,
    rank: i + 1,
  }));
}

function stripCorrectAnswer(q: ChampionshipQuestion): SafeQuestion {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correct: _c, is_true: _t, correct_order: _o, pairs: _p, ...safe } = q;
  return safe;
}

function getCorrectIndex(q: ChampionshipQuestion | null): number | null {
  if (!q) return null;
  if (q.correct !== undefined) return q.correct;
  if (q.is_true !== undefined) return q.is_true ? 0 : 1;
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// SCORE CALCULATION
// ────────────────────────────────────────────────────────────────────────────

// Barème unique : une bonne réponse = 100 points. Rien d'autre.
// Aucun bonus de vitesse, aucun bonus de série, aucune variation selon la
// manche — le score d'un joueur est exactement (bonnes réponses × 100).
export const POINTS_PER_CORRECT = 100;

export function calculateScore(params: {
  is_correct: boolean;
  base_points?: number;
  time_per_question?: number;
  time_remaining_ms?: number;
  current_streak?: number;
}): { base: number; speed_bonus: number; streak_bonus: number; total: number } {
  if (!params.is_correct) return { base: 0, speed_bonus: 0, streak_bonus: 0, total: 0 };
  return { base: POINTS_PER_CORRECT, speed_bonus: 0, streak_bonus: 0, total: POINTS_PER_CORRECT };
}

export function checkAnswer(question: ChampionshipQuestion, answerIndex: number): boolean {
  const type = question.type ?? "mcq";
  switch (type) {
    case "mcq":
    case "character":
    case "location":
    case "book":
    case "finale":
    case "fill":
      return question.correct !== undefined && answerIndex === question.correct;
    case "tf":
      // On exige un vrai choix (0 = Vrai, 1 = Faux). Sans ce garde-fou, un
      // index invalide (-1, absence de réponse) valait « Faux » et rapportait
      // des points quand la réponse attendue était « Faux ».
      if (answerIndex !== 0 && answerIndex !== 1) return false;
      return question.is_true !== undefined && (answerIndex === 0) === question.is_true;
    case "chrono":
    case "order_verse":
    case "match":
      return answerIndex === 0; // 0 = client verified correct order/pairs, 1 = wrong
    default:
      return false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// STATE ADVANCE
// ────────────────────────────────────────────────────────────────────────────

export async function advanceChampionshipState(contestId: string): Promise<{
  ok: boolean;
  advanced: boolean;
  new_phase: ChampionshipPhase;
  error?: string;
}> {
  const client = db();

  const { data: current, error: fetchErr } = await client
    .from("championship_state")
    .select("*")
    .eq("contest_id", contestId)
    .single();

  if (fetchErr || !current) {
    return { ok: false, advanced: false, new_phase: "CLOSED", error: "State not found" };
  }

  const currentPhase = current.phase as ChampionshipPhase;

  if (currentPhase === "CLOSED" || currentPhase === "CANCELLED" || currentPhase === "LOBBY") {
    return { ok: true, advanced: false, new_phase: currentPhase };
  }
  if (currentPhase === "PODIUM") {
    return { ok: true, advanced: false, new_phase: "PODIUM" };
  }

  // Pause: never advance while paused
  if ((current.metadata as Record<string, unknown>)?.is_paused) {
    return { ok: true, advanced: false, new_phase: currentPhase };
  }

  // Idempotency: only advance if phase_ends_at has passed
  if (current.phase_ends_at) {
    const endsAt = new Date(current.phase_ends_at).getTime();
    if (Date.now() < endsAt - 500) {
      return { ok: true, advanced: false, new_phase: currentPhase };
    }
  }

  let next: NextPhaseResult;
  try {
    next = await computeNextPhase(current as ChampionshipStateRow, contestId);
  } catch (e) {
    return { ok: false, advanced: false, new_phase: currentPhase, error: String(e) };
  }

  const now = new Date();
  const phase_ends_at = next.duration_ms
    ? new Date(now.getTime() + next.duration_ms).toISOString()
    : null;

  // Optimistic lock: .eq("phase", currentPhase) prevents double-advance
  const { error: updateErr } = await client
    .from("championship_state")
    .update({
      phase: next.phase,
      round_index: next.round_index,
      question_index: next.question_index,
      phase_started_at: now.toISOString(),
      phase_ends_at,
      answer_count: 0,
      metadata: next.metadata,
      updated_at: now.toISOString(),
    })
    .eq("contest_id", contestId)
    .eq("phase", currentPhase);

  if (updateErr) {
    return { ok: true, advanced: false, new_phase: currentPhase };
  }

  try {
    await client.from("championship_events").insert({
      contest_id: contestId,
      event_type: "phase_change",
      payload: { from: currentPhase, to: next.phase, round_index: next.round_index, question_index: next.question_index },
    });
  } catch { /* non-critical log */ }

  return { ok: true, advanced: true, new_phase: next.phase };
}

// ────────────────────────────────────────────────────────────────────────────
// LEADERBOARD UPDATE
// ────────────────────────────────────────────────────────────────────────────

export async function updateLeaderboard(contestId: string, roundIndex: number) {
  const client = db();

  // Per-round results (just this round)
  const { data: roundAnswers } = await client
    .from("championship_answers")
    .select("player_id, total_points, is_correct")
    .eq("contest_id", contestId)
    .eq("round_index", roundIndex);

  if (roundAnswers?.length) {
    const byPlayerRound: Record<string, { score: number; correct: number }> = {};
    for (const a of roundAnswers) {
      if (!byPlayerRound[a.player_id]) byPlayerRound[a.player_id] = { score: 0, correct: 0 };
      byPlayerRound[a.player_id].score += a.total_points ?? 0;
      if (a.is_correct) byPlayerRound[a.player_id].correct += 1;
    }
    const roundResults = Object.entries(byPlayerRound).map(([player_id, stats]) => ({
      contest_id: contestId, player_id, round_index: roundIndex,
      score: stats.score, correct: stats.correct,
      total: getRoundSpec(roundIndex).questions_count,
    }));
    try {
      await client.from("championship_round_results")
        .upsert(roundResults, { onConflict: "contest_id,player_id,round_index" });
    } catch { /* non-critical */ }
  }

  // Cumulative leaderboard — sum ALL answers across ALL rounds for accuracy
  const { data: allAnswers } = await client
    .from("championship_answers")
    .select("player_id, total_points, is_correct")
    .eq("contest_id", contestId);

  if (!allAnswers?.length) return;

  const byPlayer: Record<string, { score: number; correct: number }> = {};
  for (const a of allAnswers) {
    if (!byPlayer[a.player_id]) byPlayer[a.player_id] = { score: 0, correct: 0 };
    byPlayer[a.player_id].score += a.total_points ?? 0;
    if (a.is_correct) byPlayer[a.player_id].correct += 1;
  }

  const { data: participants } = await client
    .from("contest_participants")
    .select("user_id, user_name, user_avatar")
    .eq("contest_id", contestId);

  for (const p of participants ?? []) {
    const stats = byPlayer[p.user_id] ?? { score: 0, correct: 0 };
    try {
      await client.from("championship_leaderboard")
        .upsert({
          contest_id: contestId,
          player_id: p.user_id,
          player_name: p.user_name ?? "Joueur",
          player_avatar: p.user_avatar,
          total_score: stats.score,
          total_correct: stats.correct,
          rounds_played: roundIndex + 1,
          updated_at: new Date().toISOString(),
        }, { onConflict: "contest_id,player_id" });
    } catch { /* non-critical */ }
  }

  // Recalculate ranks
  const { data: lb } = await client
    .from("championship_leaderboard")
    .select("player_id, total_score")
    .eq("contest_id", contestId)
    .order("total_score", { ascending: false });

  for (let i = 0; i < (lb ?? []).length; i++) {
    try {
      await client.from("championship_leaderboard")
        .update({ current_rank: i + 1 })
        .eq("contest_id", contestId)
        .eq("player_id", lb![i].player_id);
    } catch { /* non-critical */ }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// BADGES
// ────────────────────────────────────────────────────────────────────────────

export async function awardBadges(contestId: string) {
  const client = db();
  const { data: lb } = await client
    .from("championship_leaderboard")
    .select("player_id, current_rank")
    .eq("contest_id", contestId)
    .order("current_rank", { ascending: true })
    .limit(25);

  const badges: Array<{
    contest_id: string; player_id: string; badge_type: string;
    badge_label_fr: string; badge_label_ht: string; badge_label_en: string; badge_icon: string;
  }> = [];

  for (const entry of lb ?? []) {
    const rank = entry.current_rank ?? 999;
    let badge_type = "faithful", fr = "Joueur Fidèle", ht = "Jwè Fidèl", en = "Faithful Player", icon = "✝️";
    if (rank === 1) { badge_type = "champion"; fr = "Champion"; ht = "Chanpyon"; en = "Champion"; icon = "🥇"; }
    else if (rank === 2) { badge_type = "runner_up"; fr = "Vice-Champion"; ht = "Vis-Chanpyon"; en = "Runner Up"; icon = "🥈"; }
    else if (rank === 3) { badge_type = "third"; fr = "3ème Place"; ht = "3yèm Plas"; en = "3rd Place"; icon = "🥉"; }
    else if (rank <= 10) { badge_type = "top10"; fr = "Top 10"; ht = "Top 10"; en = "Top 10"; icon = "⭐"; }
    else if (rank <= 25) { badge_type = "top25"; fr = "Top 25"; ht = "Top 25"; en = "Top 25"; icon = "🌟"; }
    badges.push({ contest_id: contestId, player_id: entry.player_id, badge_type, badge_label_fr: fr, badge_label_ht: ht, badge_label_en: en, badge_icon: icon });
  }

  if (badges.length > 0) {
    try {
      await client.from("championship_rewards")
        .upsert(badges, { onConflict: "contest_id,player_id,badge_type" });
    } catch { /* non-critical */ }
  }
}
