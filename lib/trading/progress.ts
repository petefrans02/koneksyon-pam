/**
 * ACADÉMIE TRADING — progression, maîtrise et déblocage.
 *
 * Fonctions pures, sans accès réseau ni base : elles prennent un état et
 * renvoient un état. C'est délibéré — la règle « on ne passe pas au niveau
 * suivant sans maîtriser le niveau courant » est le cœur de la promesse
 * pédagogique, donc elle doit être testable isolément et donner le même
 * résultat côté serveur et côté client.
 *
 * Choix important sur la maîtrise : on ne compte pas « les leçons vues ». On
 * mesure la réussite récente, par compétence. Un élève qui répondait juste il
 * y a un mois et se trompe aujourd'hui n'est plus à jour — sa maîtrise doit
 * redescendre. D'où la moyenne pondérée exponentielle.
 */

import { LEVELS, Level } from "./curriculum";

/** État d'une compétence pour un élève. */
export interface SkillState {
  attempts: number;
  correct: number;
  /** Réussite récente, 0 à 1, pondérée exponentiellement. */
  recent: number;
}

export interface LevelState {
  /** Slugs des leçons lues. */
  lessonsRead: string[];
  /** Meilleur score obtenu à l'examen, en %. Null = jamais passé. */
  examScore: number | null;
  /**
   * Nombre de passages de l'examen. Sert de graine : chaque nouvelle tentative
   * tire un jeu de questions différent, tout en restant reproductible.
   */
  examAttempts: number;
}

export interface Student {
  xp: number;
  skills: Record<string, SkillState>;
  levels: Record<string, LevelState>;
  /** Jours consécutifs d'activité. */
  streak: number;
  /** Dernier jour d'activité, format AAAA-MM-JJ. */
  lastActiveDay: string | null;
  /** Minutes cumulées de lecture et de pratique. */
  minutesStudy: number;
  minutesPractice: number;
  /**
   * Graine du prochain exercice d'entraînement. Persistée pour deux raisons :
   * l'élève reprend là où il s'est arrêté, et surtout le rendu serveur et le
   * rendu navigateur partent de la même valeur — un tirage aléatoire au montage
   * provoquerait un écart d'hydratation.
   */
  lastSeed: number;
}

export const EMPTY_STUDENT: Student = {
  xp: 0,
  skills: {},
  levels: {},
  streak: 0,
  lastActiveDay: null,
  minutesStudy: 0,
  minutesPractice: 0,
  lastSeed: 1000,
};

// ----------------------------------------------------------------- maîtrise ---

/** Poids de la dernière tentative dans la moyenne. Plus haut = plus réactif. */
const ALPHA = 0.25;
/** Réussite récente minimale pour parler de maîtrise. */
export const MASTERY_THRESHOLD = 0.8;
/** Nombre de tentatives en dessous duquel on ne conclut rien. */
export const MIN_ATTEMPTS = 6;

export function emptySkill(): SkillState {
  return { attempts: 0, correct: 0, recent: 0 };
}

/**
 * Enregistre une tentative sur une compétence.
 * Renvoie un nouvel état — l'entrée n'est jamais mutée.
 */
export function recordAttempt(st: SkillState | undefined, success: boolean): SkillState {
  const cur = st ?? emptySkill();
  const hit = success ? 1 : 0;
  // À la première tentative, la moyenne pondérée part de la valeur observée
  // plutôt que de 0 : sinon une première réponse juste donnerait 0,25.
  const recent = cur.attempts === 0 ? hit : cur.recent + ALPHA * (hit - cur.recent);
  return {
    attempts: cur.attempts + 1,
    correct: cur.correct + hit,
    recent,
  };
}

/** Une compétence est maîtrisée si elle est assez pratiquée ET réussie récemment. */
export function isMastered(st: SkillState | undefined): boolean {
  if (!st) return false;
  return st.attempts >= MIN_ATTEMPTS && st.recent >= MASTERY_THRESHOLD;
}

/** Maîtrise d'un niveau, de 0 à 1 : part de ses compétences maîtrisées. */
export function levelMastery(student: Student, level: Level): number {
  if (!level.skills.length) return 0;
  const done = level.skills.filter((sk) => isMastered(student.skills[sk.key])).length;
  return done / level.skills.length;
}

/** Compétences du niveau encore fragiles — ce que le tableau de bord doit montrer. */
export function weakSkills(student: Student, level: Level) {
  return level.skills
    .map((sk) => ({ skill: sk, state: student.skills[sk.key] }))
    .filter((x) => !isMastered(x.state))
    .sort((a, b) => (a.state?.recent ?? 0) - (b.state?.recent ?? 0));
}

// --------------------------------------------------------------- déblocage ---

/**
 * Un niveau est validé quand ses compétences sont maîtrisées **et** que
 * l'examen est réussi. Les deux conditions sont nécessaires : l'examen seul
 * peut se jouer à la chance, la pratique seule peut éviter les points durs.
 */
export function isLevelPassed(student: Student, level: Level): boolean {
  if (level.status !== "pret") return false;
  const exam = levelState(student, level.slug).examScore;
  if (exam === null || exam < level.passingScore) return false;
  return levelMastery(student, level) >= 1;
}

/**
 * Le premier niveau est toujours ouvert. Ensuite, chaque niveau exige que le
 * précédent soit validé. Pas de raccourci : c'est le principe.
 */
export function isLevelUnlocked(student: Student, level: Level): boolean {
  if (level.n === 1) return true;
  const previous = LEVELS.find((l) => l.n === level.n - 1);
  if (!previous) return true;
  // Un niveau dont le contenu n'est pas encore écrit ne doit pas bloquer la
  // chaîne : on le considère franchi pour le calcul de déblocage.
  if (previous.status !== "pret") return isLevelUnlocked(student, previous);
  return isLevelPassed(student, previous);
}

/**
 * Accès effectif à un niveau, verrou éventuellement contourné.
 *
 * `bypass` sert au compte administrateur (voir `access.ts`) : il doit pouvoir
 * relire n'importe quel niveau sans le valider. Le contournement est ici, à
 * l'extérieur du verrou — `isLevelUnlocked` n'est pas modifié et continue de
 * répondre la vérité sur la progression réelle de l'élève. On choisit
 * simplement de ne pas la consulter.
 *
 * Cette séparation compte : elle garantit qu'un bug d'accès admin ne peut pas
 * fausser la maîtrise, les examens ni le déblocage des autres élèves.
 */
export function isLevelAccessible(student: Student, level: Level, bypass = false): boolean {
  if (bypass) return true;
  return isLevelUnlocked(student, level);
}

/** Le niveau où l'élève doit travailler maintenant. */
export function currentLevel(student: Student): Level {
  const open = LEVELS.filter((l) => isLevelUnlocked(student, l) && l.status === "pret");
  const todo = open.find((l) => !isLevelPassed(student, l));
  return todo ?? open[open.length - 1] ?? LEVELS[0];
}

// -------------------------------------------------------------- XP & rangs ---

/**
 * Palier de rang. La courbe est volontairement lente au début (les premiers
 * rangs arrivent vite, pour l'élan) puis s'allonge — un rang doit rester un
 * accomplissement, pas une récompense de participation.
 */
export const RANKS = [
  { at: 0, label: "Observateur" },
  { at: 150, label: "Apprenti" },
  { at: 450, label: "Lecteur de bougies" },
  { at: 1000, label: "Analyste" },
  { at: 2000, label: "Technicien" },
  { at: 3500, label: "Stratège" },
  { at: 6000, label: "Trader discipliné" },
  { at: 10000, label: "Autonome" },
] as const;

export function rank(xp: number): { label: string; next: number | null; progress: number } {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].at) i = k;
  const cur = RANKS[i];
  const nxt = RANKS[i + 1] ?? null;
  const progress = nxt ? (xp - cur.at) / (nxt.at - cur.at) : 1;
  return { label: cur.label, next: nxt ? nxt.at : null, progress: Math.min(1, progress) };
}

// ------------------------------------------------------------------ séries ---

/** Différence en jours entre deux dates AAAA-MM-JJ (UTC, donc pas de dérive d'heure). */
function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ta = Date.UTC(ay, am - 1, ad);
  const tb = Date.UTC(by, bm - 1, bd);
  return Math.round((tb - ta) / 86400000);
}

/**
 * Met à jour la série quotidienne. `today` est passé en paramètre plutôt que
 * lu depuis l'horloge : la fonction reste pure et testable.
 */
export function touchStreak(student: Student, today: string): Student {
  if (student.lastActiveDay === today) return student;
  const gap = student.lastActiveDay ? dayDiff(student.lastActiveDay, today) : null;
  // Un jour d'écart prolonge la série ; davantage la casse.
  const streak = gap === 1 ? student.streak + 1 : 1;
  return { ...student, streak, lastActiveDay: today };
}

// ------------------------------------------------------------ enregistrement ---

export interface AttemptResult {
  skills: string[];
  success: boolean;
  xp: number;
}

/** Applique le résultat d'une activité : compétences, XP, série. */
export function applyResult(student: Student, res: AttemptResult, today: string): Student {
  const skills = { ...student.skills };
  for (const key of res.skills) {
    skills[key] = recordAttempt(skills[key], res.success);
  }
  const next: Student = {
    ...student,
    skills,
    // L'XP ne récompense que la réussite : sinon cliquer au hasard fait
    // progresser le rang, et le rang ne veut plus rien dire.
    xp: student.xp + (res.success ? res.xp : 0),
  };
  return touchStreak(next, today);
}

const EMPTY_LEVEL: LevelState = { lessonsRead: [], examScore: null, examAttempts: 0 };

/** État d'un niveau, complété des champs absents d'une sauvegarde ancienne. */
export function levelState(student: Student, levelSlug: string): LevelState {
  return { ...EMPTY_LEVEL, ...(student.levels[levelSlug] ?? {}) };
}

/** Enregistre un score d'examen (on ne garde que le meilleur) et compte la tentative. */
export function applyExam(student: Student, levelSlug: string, score: number): Student {
  const cur = levelState(student, levelSlug);
  const best = cur.examScore === null ? score : Math.max(cur.examScore, score);
  return {
    ...student,
    levels: {
      ...student.levels,
      [levelSlug]: { ...cur, examScore: best, examAttempts: cur.examAttempts + 1 },
    },
  };
}

/** Marque une leçon comme lue. */
export function markLessonRead(student: Student, levelSlug: string, lessonSlug: string): Student {
  const cur = levelState(student, levelSlug);
  if (cur.lessonsRead.includes(lessonSlug)) return student;
  return {
    ...student,
    levels: {
      ...student.levels,
      [levelSlug]: { ...cur, lessonsRead: [...cur.lessonsRead, lessonSlug] },
    },
  };
}

/** Vue d'ensemble pour le tableau de bord. */
export function overview(student: Student) {
  const cur = currentLevel(student);
  return {
    rank: rank(student.xp),
    currentLevel: cur,
    mastery: levelMastery(student, cur),
    weak: weakSkills(student, cur).slice(0, 4),
    unlocked: LEVELS.filter((l) => isLevelUnlocked(student, l)).length,
    passed: LEVELS.filter((l) => isLevelPassed(student, l)).length,
    skillsMastered: Object.keys(student.skills).filter((k) => isMastered(student.skills[k])).length,
  };
}
