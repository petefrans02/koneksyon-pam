import type { Metadata } from "next";
import { alternates } from "@/lib/seo";

const donateActionSchema = {
  "@context": "https://schema.org",
  "@type": "DonateAction",
  "agent": { "@type": "Person", "name": "Visiteur" },
  "recipient": {
    "@type": "Organization",
    "name": "KONEKSYON PAM",
    "url": "https://koneksyonpam.com",
    "@id": "https://koneksyonpam.com/#organization",
  },
  "url": "https://koneksyonpam.com/don",
  "description": "Soutenez KONEKSYON PAM et aidez à maintenir une plateforme chrétienne 100% gratuite.",
};

export const metadata: Metadata = {
  title: "Soutenir la mission",
  description:
    "Soutenez KONEKSYON PAM et aidez à maintenir une plateforme chrétienne 100% gratuite pour des milliers de fidèles à travers le monde.",
  keywords: [
    "don chrétien", "soutenir mission chrétienne", "don KONEKSYON PAM",
    "contribuer plateforme chrétienne", "aide mission", "donation chrétienne",
  ],
  alternates: alternates("/don"),
  openGraph: {
    title: "Soutenir KONEKSYON PAM",
    description: "Votre don garde la plateforme gratuite pour des milliers de chrétiens. Chaque contribution compte.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donateActionSchema) }}
      />
      {children}
    </>
  );
}
