import type { Metadata } from "next";
import { alternates, webpageSchema } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export const metadata: Metadata = {
  title: "Mur de prières en ligne",
  description:
    "Partagez vos demandes de prière et intercédez pour des milliers de chrétiens. Un mur de prières communautaire gratuit, disponible 24h/24 en français, créole et anglais.",
  keywords: [
    "prière en ligne", "demande de prière", "mur de prières", "intercession",
    "prière chrétienne", "communauté de prière", "prières en direct",
    "lapriyè kreyòl", "prière haïtienne", "prayer online",
    "KONEKSYON PAM prières", "prière gratuite",
  ],
  alternates: alternates("/prieres"),
  openGraph: {
    title: "Mur de prières en ligne — KONEKSYON PAM",
    description: "Rejoignez des milliers de chrétiens en prière. Partagez, intercédez, soyez bénis.",
    type: "website",
  },
};

const schema = webpageSchema({
  name: "Mur de prières en ligne — KONEKSYON PAM",
  description: "Partagez vos demandes de prière et intercédez pour des milliers de chrétiens en ligne.",
  url: `${BASE}/prieres`,
  breadcrumb: [{ name: "Accueil", url: BASE }, { name: "Prières", url: `${BASE}/prieres` }],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
