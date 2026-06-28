import type { Metadata } from "next";
import { alternates, webpageSchema } from "@/lib/seo";

const BASE = "https://koneksyonpam.com";

export const metadata: Metadata = {
  title: "Témoignages chrétiens inspirants",
  description:
    "Lisez et partagez des témoignages chrétiens inspirants du monde entier. Découvrez comment Dieu agit dans la vie de ses enfants. Publiez votre propre témoignage.",
  keywords: [
    "témoignages chrétiens", "témoignage de foi", "miracle de Dieu",
    "témoignages inspirants", "partager un témoignage", "Dieu agit",
    "témoignages haïtiens", "temouyaj kreyòl", "Christian testimonies",
    "vie chrétienne", "grâce de Dieu", "KONEKSYON PAM témoignages",
  ],
  alternates: alternates("/temoignages"),
  openGraph: {
    title: "Témoignages chrétiens — KONEKSYON PAM",
    description: "Des témoignages inspirants de chrétiens du monde entier. Partagez comment Dieu a agi dans votre vie.",
    type: "website",
  },
};

const schema = webpageSchema({
  name: "Témoignages chrétiens inspirants — KONEKSYON PAM",
  description: "Lisez et partagez des témoignages de foi de chrétiens du monde entier.",
  url: `${BASE}/temoignages`,
  breadcrumb: [{ name: "Accueil", url: BASE }, { name: "Témoignages", url: `${BASE}/temoignages` }],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
