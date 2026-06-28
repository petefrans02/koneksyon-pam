import type { Metadata } from "next";
import { alternates, webpageSchema } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export const metadata: Metadata = {
  title: "Études bibliques gratuites",
  description:
    "Approfondissez votre foi avec les études bibliques de KONEKSYON PAM. Ressources gratuites sur la Trinité, la grâce, la prière, le Saint-Esprit et bien plus.",
  keywords: [
    "étude biblique", "études bibliques gratuites", "apprendre la Bible",
    "théologie chrétienne", "cours biblique en ligne", "formation biblique",
    "trinité", "Saint-Esprit", "grâce de Dieu", "foi chrétienne",
    "KONEKSYON PAM études", "bible study online",
  ],
  alternates: alternates("/etude"),
  openGraph: {
    title: "Études bibliques gratuites — KONEKSYON PAM",
    description: "Des études bibliques approfondies et gratuites pour tous les chrétiens. Grandissez dans la Parole.",
    type: "website",
  },
};

const schema = webpageSchema({
  name: "Études bibliques gratuites — KONEKSYON PAM",
  description: "Des études bibliques approfondies et gratuites pour tous les chrétiens.",
  url: `${BASE}/etude`,
  breadcrumb: [{ name: "Accueil", url: BASE }, { name: "Études bibliques", url: `${BASE}/etude` }],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
