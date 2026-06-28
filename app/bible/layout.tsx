import type { Metadata } from "next";
import { alternates, webpageSchema } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export const metadata: Metadata = {
  title: "Bible complète en ligne",
  description:
    "Lisez la Bible complète gratuitement en français, créole haïtien et anglais. Accès à tous les livres, chapitres et versets de l'Ancien et du Nouveau Testament.",
  keywords: [
    "Bible en ligne gratuite", "lire la Bible", "Bible français",
    "Bib kreyòl ayisyen", "Bible créole haïtien", "Bible en anglais",
    "Ancien Testament", "Nouveau Testament", "versets bibliques",
    "livres de la Bible", "lecture biblique", "Bible KONEKSYON PAM",
  ],
  alternates: alternates("/bible"),
  openGraph: {
    title: "Bible complète en ligne — KONEKSYON PAM",
    description: "La Bible entière en 3 langues : français, créole haïtien, anglais. Gratuit, pour tous.",
    type: "website",
  },
};

const schema = webpageSchema({
  name: "Bible complète en ligne — KONEKSYON PAM",
  description: "Lisez la Bible gratuitement en français, créole haïtien et anglais.",
  url: `${BASE}/bible`,
  breadcrumb: [{ name: "Accueil", url: BASE }, { name: "Bible", url: `${BASE}/bible` }],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
