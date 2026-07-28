import { notFound } from "next/navigation";
import { bibleBooks } from "@/lib/bible-books";
import { alternates } from "@/lib/seo";
import ChapitreClient from "./ChapitreClient";

// Vérification côté SERVEUR : livre inconnu OU numéro de chapitre hors limites
// (ex. /bible/luc/999) renvoyaient « 200 OK » sur une page vide. C'est un vrai
// 404 désormais.
export async function generateMetadata({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book, chapter } = await params;
  const b = bibleBooks.find((x) => x.slug === book);
  if (!b) return {};
  return { title: `${b.name.fr} ${chapter}`, alternates: alternates(`/bible/${book}/${chapter}`) };
}

export default async function Page({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book, chapter } = await params;
  const b = bibleBooks.find((x) => x.slug === book);
  if (!b) notFound();
  const n = Number(chapter);
  if (!Number.isInteger(n) || n < 1 || n > b.chapters) notFound();
  return <ChapitreClient />;
}
