import type { Metadata } from "next";
import { alternates, webpageSchema } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export const metadata: Metadata = {
  title: "Concours bibliques en ligne",
  description:
    "Participez aux concours bibliques en direct. Testez vos connaissances de la Bible, gagnez des points et rejoignez des milliers de chrétiens dans un quiz interactif.",
  keywords: [
    "concours biblique", "quiz biblique en ligne", "concours Bible", "quiz Bible",
    "jeu chrétien", "concours chrétien", "connaissances bibliques",
    "KONEKSYON PAM concours", "concours en direct", "Bible quiz",
    "chrétien haïtien concours", "concours religion",
  ],
  alternates: alternates("/concours"),
  openGraph: {
    title: "Concours bibliques en ligne — KONEKSYON PAM",
    description: "Des concours bibliques en direct pour les chrétiens du monde entier. Testez vos connaissances !",
    type: "website",
  },
};

const schema = webpageSchema({
  name: "Concours bibliques en ligne — KONEKSYON PAM",
  description: "Participez aux concours bibliques en direct et testez vos connaissances de la Bible.",
  url: `${BASE}/concours`,
  breadcrumb: [{ name: "Accueil", url: BASE }, { name: "Concours", url: `${BASE}/concours` }],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
