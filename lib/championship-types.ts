export type Lang = "fr" | "ht" | "en" | "es";
export type LText = { fr: string; ht: string; en: string; es?: string };

export type ChampionshipPhase =
  | "LOBBY"
  | "COUNTDOWN"
  | "CHAMPIONSHIP_INTRO"
  | "ROUND_INTRO"
  | "QUESTION_ACTIVE"
  | "ANSWER_REVEAL"
  | "ROUND_RESULTS"
  | "BETWEEN_ROUNDS"
  | "PODIUM"
  | "CLOSED"
  | "CANCELLED";

export type RoundType =
  | "mcq" | "tf" | "fill" | "character" | "location"
  | "book" | "chrono" | "match" | "order_verse" | "finale";

export interface RoundSpec {
  index: number;
  type: RoundType;
  name: LText;
  description: LText;
  icon: string;
  color: string;
  questions_count: number;
  time_per_question: number;
  base_points: number;
  total_points: number;
}

export interface ChampionshipQuestion {
  id?: string;
  round_index?: number;
  question_index?: number;
  type?: RoundType;
  // MCQ / character / location / book / finale
  q?: LText;
  options?: LText[];
  correct?: number;
  // TF
  statement?: LText;
  is_true?: boolean;
  // Fill
  verse?: LText;
  answer_word?: LText;
  fill_options?: LText[];
  // Character / Location / Book
  clues?: LText[];
  answer?: LText;
  progressive_clues?: boolean;
  // Chrono / OrderVerse
  items?: LText[];
  fragments?: LText[];
  full_verse?: LText;
  correct_order?: number[];
  // Match
  left?: LText[];
  right?: LText[];
  pairs?: number[];
  // Common
  ref?: string;
  explanation?: LText;
}

export type SafeQuestion = Omit<ChampionshipQuestion, "correct" | "is_true" | "correct_order" | "pairs">;

export interface ChampionshipStateRow {
  id: string;
  contest_id: string;
  phase: ChampionshipPhase;
  round_index: number;
  question_index: number;
  phase_started_at: string;
  phase_ends_at: string | null;
  player_count: number;
  answer_count: number;
  metadata: ChampionshipMetadata;
  launched_by: string | null;
  launched_at: string | null;
  updated_at: string;
}

export interface RoundSpecBroadcast {
  name: LText;
  description: LText;
  icon: string;
  color: string;
  base_points: number;
  time_per_question: number;
}

export interface ChampionshipMetadata {
  question?: SafeQuestion;
  round_spec?: RoundSpecBroadcast;
  correct_index?: number;
  correct_answer?: LText | string;
  correct_count?: number;
  explanation?: LText;
  round_name?: LText;
  round_total_points?: number;
  top3?: Array<{ player_name: string; player_avatar: string | null; score: number; rank: number }>;
  podium?: Array<{ rank: number; player_name: string; player_avatar: string | null; total_score: number; badge: string }>;
  next_round_index?: number;
  next_round_spec?: { name: LText; icon: string; color: string };
  contest_title?: string;
  player_count?: number;
}

export interface EngineStateResponse {
  state: ChampionshipStateRow;
  your_score: number;
  your_rank: number | null;
  already_answered: boolean;
}

export interface AnswerResponse {
  ok: boolean;
  already_submitted?: boolean;
  too_late?: boolean;
  points_earned?: number;
  is_correct?: boolean;
  new_total?: number;
}

export interface TickResponse {
  ok: boolean;
  advanced: boolean;
  new_phase: ChampionshipPhase;
  error?: string;
}

export interface LeaderboardResponse {
  entries: Array<{
    rank: number;
    player_name: string;
    player_avatar: string | null;
    total_score: number;
    total_correct: number;
  }>;
  your_rank: number | null;
  your_score: number;
  your_correct: number;
  your_time_sec?: number | null;
}
