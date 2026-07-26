export interface AnswerRecord {
  question_index: number;
  answer_index: number;
  correct: boolean;
  time_taken_ms: number;
  points_earned: number;
}

// Barème unique et transparent : une bonne réponse = 100 points, point final.
// Aucun bonus (vitesse, série, sans-faute) — deux joueurs avec le même nombre
// de bonnes réponses ont exactement le même score.
export const POINTS_PER_CORRECT = 100;

export function calculatePoints(
  correct: boolean,
  _timeTakenMs?: number,
  _timeLimitSec?: number,
  _currentStreak?: number,
): { total: number; speedBonus: number; streakBonus: number } {
  return correct
    ? { total: POINTS_PER_CORRECT, speedBonus: 0, streakBonus: 0 }
    : { total: 0, speedBonus: 0, streakBonus: 0 };
}

export function calcFinalBonuses(
  _answers: AnswerRecord[],
  _totalQuestions: number,
): { perfectBonus: number } {
  return { perfectBonus: 0 };
}

export function computeAccuracy(answers: AnswerRecord[]): number {
  if (!answers.length) return 0;
  return Math.round((answers.filter(a => a.correct).length / answers.length) * 100);
}
