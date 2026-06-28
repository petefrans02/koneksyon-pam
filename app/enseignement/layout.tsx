import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Enseignements chrétiens",
  description:
    "Accédez à des enseignements chrétiens complets, des sermons et des messages bibliques inspirants sur KONEKSYON PAM. Gratuit, en français, créole et anglais.",
  keywords: [
    "enseignements chrétiens", "sermons en ligne", "messages bibliques",
    "prédications chrétiennes", "sermon gratuit", "enseignement de la Bible",
    "pasteur en ligne", "enseigneman kreyòl", "Christian teaching",
    "KONEKSYON PAM enseignement", "formation chrétienne",
  ],
  alternates: alternates("/enseignement"),
  openGraph: {
    title: "Enseignements chrétiens — KONEKSYON PAM",
    description: "Des sermons et enseignements bibliques inspirants en français, créole et anglais.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
