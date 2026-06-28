import type { Metadata } from "next";
import { alternates, webpageSchema } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export const metadata: Metadata = {
  title: "Groupes d'église en ligne",
  description:
    "Rejoignez ou créez un groupe d'église sur KONEKSYON PAM. Connectez-vous avec des chrétiens de votre communauté locale et du monde entier.",
  keywords: [
    "groupe d'église", "communauté chrétienne en ligne", "rejoindre une église",
    "église en ligne", "fraternité chrétienne", "groupe biblique",
    "église haïtienne", "legliz kreyòl", "Christian church group",
    "KONEKSYON PAM église", "trouver une église",
  ],
  alternates: alternates("/eglise"),
  openGraph: {
    title: "Groupes d'église en ligne — KONEKSYON PAM",
    description: "Trouvez votre communauté chrétienne. Rejoignez un groupe d'église ou créez le vôtre.",
    type: "website",
  },
};

const schema = webpageSchema({
  name: "Groupes d'église en ligne — KONEKSYON PAM",
  description: "Rejoignez ou créez un groupe d'église chrétienne sur KONEKSYON PAM.",
  url: `${BASE}/eglise`,
  breadcrumb: [{ name: "Accueil", url: BASE }, { name: "Groupes d'église", url: `${BASE}/eglise` }],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
