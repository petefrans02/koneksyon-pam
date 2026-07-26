import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "À propos de KONEKSYON PAM",
  description:
    "Découvrez la mission et la vision de KONEKSYON PAM — plateforme chrétienne internationale fondée pour connecter les croyants par la foi. Une mission, un Dieu, une vision.",
  keywords: [
    "à propos KONEKSYON PAM", "mission chrétienne", "vision chrétienne",
    "plateforme chrétienne Haïti", "connecter chrétiens", "foi KONEKSYON PAM",
    "fondateurs KONEKSYON PAM",
  ],
  alternates: alternates("/apropos"),
  openGraph: {
    title: "À propos — KONEKSYON PAM",
    description: "La mission et la vision de KONEKSYON PAM : UNE MISSION • UN DIEU • UNE VISION.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
