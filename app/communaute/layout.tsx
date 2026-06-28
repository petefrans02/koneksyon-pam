import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Communauté chrétienne",
  description:
    "Rejoignez la communauté chrétienne de KONEKSYON PAM. Échangez, partagez et grandissez dans la foi avec des croyants du monde entier.",
  keywords: [
    "communauté chrétienne", "forum chrétien", "partage chrétien",
    "réseau social chrétien", "fraternité chrétienne", "chrétiens haïtiens",
    "kominote kretyen", "Christian community", "KONEKSYON PAM communauté",
    "discussion biblique", "chrétiens en ligne",
  ],
  alternates: alternates("/communaute"),
  openGraph: {
    title: "Communauté chrétienne — KONEKSYON PAM",
    description: "Échangez et grandissez avec des croyants du monde entier sur KONEKSYON PAM.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
