import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Psaumes de la Bible",
  description:
    "Lisez et méditez les 150 Psaumes de la Bible en français, créole haïtien et anglais. Des versets inspirants pour chaque moment de la vie.",
  keywords: [
    "psaumes", "psaumes de la Bible", "psaumes chrétiens", "psaume 23",
    "lecture des psaumes", "psaumes en français", "pawòl Bondye",
    "psaumes créole haïtien", "psalms", "KONEKSYON PAM psaumes",
    "versets psaumes", "méditation biblique",
  ],
  alternates: alternates("/psaumes"),
  openGraph: {
    title: "Psaumes de la Bible — KONEKSYON PAM",
    description: "Lisez et méditez les 150 Psaumes en français, créole haïtien et anglais.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
