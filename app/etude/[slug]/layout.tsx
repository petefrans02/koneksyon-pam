import type { Metadata } from "next";
import { studies } from "@/lib/studies-data";
import { alternates, articleSchema } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const study = studies.find((s) => s.slug === slug);
  const url   = `${BASE}/etude/${slug}`;

  if (!study) {
    return {
      title: "Étude biblique",
      description: "Étude biblique approfondie sur KONEKSYON PAM.",
      alternates: alternates(`/etude/${slug}`),
    };
  }

  const title       = study.title.fr ?? study.title.en ?? "Étude biblique";
  const description = study.description.fr ?? study.description.en ?? "Étude biblique approfondie.";

  return {
    title,
    description,
    alternates: alternates(`/etude/${slug}`),
    keywords: [title, "étude biblique", "Bible", "foi chrétienne", "KONEKSYON PAM"],
    openGraph: {
      title: `${title} — KONEKSYON PAM`,
      description,
      type: "article",
      url,
    },
  };
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study    = studies.find((s) => s.slug === slug);
  const url      = `${BASE}/etude/${slug}`;

  const title       = study?.title.fr ?? "Étude biblique";
  const description = study?.description.fr ?? "Étude biblique approfondie sur KONEKSYON PAM.";

  const schema = articleSchema({ headline: title, description, url });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
