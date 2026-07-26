/**
 * Registre du contenu des formations.
 * Chaque cours a son fichier lib/courses/<slug>.ts (default export CourseContent).
 * Un cours présent ici devient automatiquement « disponible » dans l'Académie.
 */
import { CourseContent } from "./types";

import leadership from "./leadership";
import jeunesse from "./jeunesse";
import famille from "./famille";
import musique from "./musique";
import informatique from "./informatique";
import internet from "./internet";
import word from "./word";
import excel from "./excel";
import powerpoint from "./powerpoint";
import google from "./google";
import canva from "./canva";
import chatgptIa from "./chatgpt-ia";
import creationWeb from "./creation-web";
import entrepreneuriat from "./entrepreneuriat";
import marketing from "./marketing";
import communication from "./communication";
import developpementPersonnel from "./developpement-personnel";

const ALL: CourseContent[] = [
  leadership, jeunesse, famille, musique,
  informatique, internet, word, excel, powerpoint, google, canva, chatgptIa, creationWeb,
  entrepreneuriat, marketing, communication, developpementPersonnel,
];

export const COURSE_CONTENT: Record<string, CourseContent> = Object.fromEntries(
  ALL.map((c) => [c.slug, c]),
);

export function getCourseContent(slug: string): CourseContent | undefined {
  return COURSE_CONTENT[slug];
}
export function hasCourseContent(slug: string): boolean {
  return slug in COURSE_CONTENT;
}
