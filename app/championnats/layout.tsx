import type { Metadata } from "next";
import { alternates, webpageSchema } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export const metadata: Metadata = {
  title: "Championnats Bibliques en ligne",
  description:
    "Participez aux Championnats Bibliques en direct. Testez vos connaissances de la Bible, gagnez des points et rejoignez des milliers de chrétiens dans un quiz interactif.",
  keywords: [
    "championnat biblique", "quiz biblique en ligne", "championnat Bible", "quiz Bible",
    "jeu chrétien", "concours chrétien", "connaissances bibliques",
    "KONEKSYON PAM championnat", "concours en direct", "Bible quiz",
    "chrétien haïtien championnat", "concours religion",
  ],
  alternates: alternates("/championnats"),
  openGraph: {
    title: "Championnats Bibliques en ligne — KONEKSYON PAM",
    description: "Des Championnats Bibliques en direct pour les chrétiens du monde entier. Testez vos connaissances !",
    type: "website",
  },
};

const schema = webpageSchema({
  name: "Championnats Bibliques en ligne — KONEKSYON PAM",
  description: "Participez aux Championnats Bibliques en direct et testez vos connaissances de la Bible.",
  url: `${BASE}/championnats`,
  breadcrumb: [{ name: "Accueil", url: BASE }, { name: "Championnats", url: `${BASE}/championnats` }],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
