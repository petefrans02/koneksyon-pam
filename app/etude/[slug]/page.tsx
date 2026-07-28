import { notFound } from "next/navigation";
import { studies } from "@/lib/studies-data";
import { alternates } from "@/lib/seo";
import EtudeClient from "./EtudeClient";

// Page SERVEUR : elle vérifie que l'étude existe AVANT d'envoyer quoi que ce soit.
// Sans ça, une adresse inventée renvoyait « 200 OK » sur une page vide — Google
// appelle ça un soft 404 et cesse d'indexer le site correctement.

export function generateStaticParams() {
  return studies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = studies.find((s) => s.slug === slug);
  if (!study) return {};
  const title = typeof study.title === "string" ? study.title : (study.title?.fr ?? "Étude biblique");
  return { title, alternates: alternates(`/etude/${slug}`) };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!studies.some((s) => s.slug === slug)) notFound();
  return <EtudeClient />;
}
