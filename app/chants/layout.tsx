import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Chants chrétiens et cantiques",
  description:
    "Découvrez des milliers de chants chrétiens, cantiques et hymnes en français, créole haïtien et anglais. Louez Dieu avec les chants de KONEKSYON PAM.",
  keywords: [
    "chants chrétiens", "cantiques chrétiens", "hymnes chrétiens",
    "chants de louange", "chants d'église", "chants haïtiens chrétiens",
    "chante kreyòl", "Christian songs", "KONEKSYON PAM chants",
    "musique chrétienne", "chants de foi",
  ],
  alternates: alternates("/chants"),
  openGraph: {
    title: "Chants chrétiens — KONEKSYON PAM",
    description: "Des milliers de chants, cantiques et hymnes pour louange Dieu en français, créole et anglais.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
