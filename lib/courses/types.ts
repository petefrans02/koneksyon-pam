import { Lang } from "@/lib/translations";

/** Une leçon = un titre, un contenu texte (4 langues) et un emplacement vidéo (vide pour l'instant). */
export interface Lesson {
  slug: string;
  title: Partial<Record<Lang, string>>;
  /** ID vidéo (YouTube/etc.). Vide = emplacement réservé, affiché comme « vidéo à venir ». */
  videoId?: string;
  /** Contenu pédagogique de la leçon (paragraphes séparés par \n\n). */
  content: Partial<Record<Lang, string>>;
  /** Points clés à retenir (optionnel). */
  keyPoints?: Partial<Record<Lang, string[]>>;
  /** Exercice / application pratique (optionnel). */
  exercise?: Partial<Record<Lang, string>>;
  /** Référence de verset clé, pour les cours bibliques (optionnel). */
  verse?: string;
}

export interface Module {
  title: Partial<Record<Lang, string>>;
  lessons: Lesson[];
}

export interface CourseContent {
  /** Doit correspondre au `slug` du cours dans lib/academy-data.ts. */
  slug: string;
  /** Phrase d'introduction du cours (4 langues). */
  intro: Partial<Record<Lang, string>>;
  modules: Module[];
}

export function countLessons(c: CourseContent): number {
  return c.modules.reduce((n, m) => n + m.lessons.length, 0);
}
