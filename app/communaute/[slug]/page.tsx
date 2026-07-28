import { notFound } from "next/navigation";
import { groups } from "@/lib/groups-data";
import { alternates } from "@/lib/seo";
import GroupeClient from "./GroupeClient";

// Vérification côté SERVEUR : un groupe inconnu doit renvoyer un vrai 404.
export function generateStaticParams() {
  return groups.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = groups.find((g) => g.slug === slug);
  if (!group) return {};
  const n = (group as { name?: string | Record<string, string> }).name;
  const title = typeof n === "string" ? n : (n?.fr ?? "Communauté");
  return { title, alternates: alternates(`/communaute/${slug}`) };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!groups.some((g) => g.slug === slug)) notFound();
  return <GroupeClient />;
}
