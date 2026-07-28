import { notFound } from "next/navigation";
import { PATHS, type Path } from "@/lib/english-course";
import ExamPlayer from "./ExamPlayer";

export function generateStaticParams() {
  return PATHS.map((p) => ({ path: p.key }));
}

export const metadata = { title: "Examen final — Anglais" };

export default async function Page({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  if (!PATHS.some((p) => p.key === path)) notFound();
  return <ExamPlayer path={path as Path} />;
}
