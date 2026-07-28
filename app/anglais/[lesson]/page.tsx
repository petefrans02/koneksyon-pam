import { notFound } from "next/navigation";
import { findLesson, ALL_LESSONS } from "@/lib/english-course";
import { alternates } from "@/lib/seo";
import LessonPlayer from "./LessonPlayer";

// Page serveur : une leçon qui n'existe pas renvoie un vrai 404.
export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ lesson: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  const les = findLesson(lesson);
  if (!les) return {};
  return { title: `${les.title.fr} — Anglais Biblique`, alternates: alternates(`/anglais/${lesson}`) };
}

export default async function Page({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  const les = findLesson(lesson);
  if (!les) notFound();
  return <LessonPlayer lesson={les} />;
}
