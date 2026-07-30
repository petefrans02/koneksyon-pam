import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { LEVELS, getLevel } from "@/lib/trading/curriculum";
import NiveauClient from "./NiveauClient";

// Les dix niveaux sont connus à la compilation : autant les prérendre.
export function generateStaticParams() {
  return LEVELS.map((l) => ({ niveau: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ niveau: string }> }) {
  const { niveau } = await params;
  const lvl = getLevel(niveau);
  if (!lvl) return {};
  return {
    title: `Niveau ${lvl.n} — ${lvl.title.fr}`,
    description: lvl.tagline.fr,
    alternates: alternates(`/trading/${niveau}`),
  };
}

export default async function Page({ params }: { params: Promise<{ niveau: string }> }) {
  const { niveau } = await params;
  // Un niveau qui n'existe pas doit renvoyer un vrai 404, pas une page vide.
  const lvl = getLevel(niveau);
  if (!lvl) notFound();
  return <NiveauClient slug={niveau} />;
}
