import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Verset du jour",
  description:
    "Le verset biblique du jour, la prière du matin et le message d'encouragement quotidien de KONEKSYON PAM. Commencez chaque journée avec la Parole de Dieu.",
  keywords: [
    "verset du jour", "verset biblique quotidien", "prière du matin",
    "message du jour", "verbe de Dieu", "vèsè jou a", "verse of the day",
    "méditation quotidienne", "KONEKSYON PAM aujourd'hui",
    "lecture biblique quotidienne", "encouragement chrétien",
  ],
  alternates: alternates("/aujourd-hui"),
  openGraph: {
    title: "Verset du jour — KONEKSYON PAM",
    description: "Le verset biblique, la prière et le message d'encouragement du jour. Chaque matin avec Dieu.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
