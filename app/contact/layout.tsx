import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Nous contacter",
  description:
    "Contactez l'équipe de KONEKSYON PAM pour toute question, suggestion ou partenariat. Nous répondons rapidement par email.",
  keywords: [
    "contact KONEKSYON PAM", "email KONEKSYON PAM", "support chrétien",
    "partenariat chrétien", "contacter équipe", "contact@koneksyonpam.com",
  ],
  alternates: alternates("/contact"),
  openGraph: {
    title: "Nous contacter — KONEKSYON PAM",
    description: "Contactez l'équipe KONEKSYON PAM pour toute question ou partenariat.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
