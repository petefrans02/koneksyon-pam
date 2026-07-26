import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Louange et adoration",
  description:
    "Entrez dans un moment de louange et d'adoration avec KONEKSYON PAM. Musique chrétienne, chants de louange et temps de culte pour tous les croyants.",
  keywords: [
    "louange chrétienne", "adoration", "temps de louange", "culte chrétien",
    "musique de louange", "louange et adoration", "lwanj kreyòl",
    "praise and worship", "KONEKSYON PAM louange", "chants d'adoration",
    "louange haïtienne", "temps de culte",
  ],
  alternates: alternates("/louange"),
  openGraph: {
    title: "Louange et adoration — KONEKSYON PAM",
    description: "Un espace de louange et d'adoration pour tous les croyants. Musique chrétienne en 3 langues.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
