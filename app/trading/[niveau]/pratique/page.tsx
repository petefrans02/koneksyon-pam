import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { LEVELS, getLevel } from "@/lib/trading/curriculum";
import { questionsForLevel } from "@/lib/trading/questions";
import QuizGate from "../QuizGate";

export function generateStaticParams() {
  return LEVELS.map((l) => ({ niveau: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ niveau: string }> }) {
  const { niveau } = await params;
  const lvl = getLevel(niveau);
  if (!lvl) return {};
  return {
    title: `Pratique — ${lvl.title.fr}`,
    description: `Exercices corrigés pour maîtriser les compétences du niveau ${lvl.n}.`,
    alternates: alternates(`/trading/${niveau}/pratique`),
  };
}

export default async function Page({ params }: { params: Promise<{ niveau: string }> }) {
  const { niveau } = await params;
  const lvl = getLevel(niveau);
  if (!lvl) notFound();
  return <QuizGate niveau={lvl} questions={questionsForLevel(niveau)} mode="pratique" />;
}
