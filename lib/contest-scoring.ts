export interface AnswerRecord {
  question_index: number;
  answer_index: number;
  correct: boolean;
  time_taken_ms: number;
  points_earned: number;
}

export function calculatePoints(
  correct: boolean,
  timeTakenMs: number,
  timeLimitSec: number,
  currentStreak: number
): { total: number; speedBonus: number; streakBonus: number } {
  if (!correct) return { total: 0, speedBonus: 0, streakBonus: 0 };
  const base = 100;
  const timeFraction = Math.max(0, 1 - timeTakenMs / (timeLimitSec * 1000));
  const speedBonus = Math.round(timeFraction * 50);
  const streakBonus = Math.min(currentStreak * 10, 50);
  return { total: base + speedBonus + streakBonus, speedBonus, streakBonus };
}

export function calcFinalBonuses(
  answers: AnswerRecord[],
  totalQuestions: number
): { perfectBonus: number } {
  const allCorrect = answers.length === totalQuestions && answers.every(a => a.correct);
  return { perfectBonus: allCorrect ? 500 : 0 };
}

export function computeAccuracy(answers: AnswerRecord[]): number {
  if (!answers.length) return 0;
  return Math.round((answers.filter(a => a.correct).length / answers.length) * 100);
}
