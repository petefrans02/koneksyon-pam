import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Découvrir KONEKSYON PAM",
  description:
    "Découvrez toutes les fonctionnalités de KONEKSYON PAM : Bible, prières, concours, études, témoignages, communauté et bien plus. Une plateforme chrétienne complète.",
  keywords: [
    "KONEKSYON PAM fonctionnalités", "plateforme chrétienne complète",
    "découvrir chrétien en ligne", "application chrétienne",
    "KONEKSYON PAM guide", "présentation plateforme",
  ],
  alternates: alternates("/decouvrir"),
  openGraph: {
    title: "Découvrir KONEKSYON PAM",
    description: "Toutes les fonctionnalités de la plateforme chrétienne KONEKSYON PAM en un seul endroit.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
