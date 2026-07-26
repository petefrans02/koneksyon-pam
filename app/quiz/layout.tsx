import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Quiz biblique",
  description:
    "Testez vos connaissances de la Bible avec les quiz bibliques de KONEKSYON PAM. Des centaines de questions sur l'Ancien et le Nouveau Testament.",
  keywords: [
    "quiz biblique", "questions Bible", "test biblique", "quiz chrétien",
    "connaissances bibliques", "quiz religion", "quiz foi", "Bible quiz",
    "KONEKSYON PAM quiz", "quiz gratuit chrétien",
  ],
  alternates: alternates("/quiz"),
  openGraph: {
    title: "Quiz biblique — KONEKSYON PAM",
    description: "Des centaines de questions bibliques pour tester et approfondir vos connaissances.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
