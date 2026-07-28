import { notFound } from "next/navigation";
import { findCourse } from "@/lib/academy-data";
import { alternates } from "@/lib/seo";
import CoursClient from "./CoursClient";

// Vérification côté SERVEUR : un cours qui n'existe pas doit renvoyer un vrai 404.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = findCourse(slug);
  if (!course) return {};
  const t = (course as { title?: string | Record<string, string> }).title;
  const title = typeof t === "string" ? t : (t?.fr ?? "Formation");
  return { title, alternates: alternates(`/academie/${slug}`) };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findCourse(slug)) notFound();
  return <CoursClient />;
}
