import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import Analytics from "./components/Analytics";
import { organizationSchema, websiteSchema } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://koneksyonpam.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a1628",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "KONEKSYON PAM — Connectés par la foi",
    template: "%s | KONEKSYON PAM",
  },
  description:
    "Plateforme chrétienne internationale : Bible complète, prières, études bibliques, concours, communauté et groupes d'église. Gratuit, pour tous, toujours.",
  keywords: [
    "KONEKSYON PAM", "Koneksyon Pam", "plateforme chrétienne",
    "Bible en ligne", "quiz biblique", "concours biblique", "étude biblique",
    "prière en ligne", "témoignages chrétiens", "communauté chrétienne",
    "foi chrétienne", "chrétien haïtien", "église en ligne",
    "Bible gratuite", "Haïti chrétien", "louange", "psaumes",
    "Bible français", "Bib kreyòl", "Bible créole haïtien",
  ],
  authors: [{ name: "Pasteur P. Francis", url: BASE_URL }],
  creator: "KONEKSYON PAM",
  publisher: "KONEKSYON PAM",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["ht_HT", "en_US"],
    url: BASE_URL,
    siteName: "KONEKSYON PAM",
    title: "KONEKSYON PAM — Connectés par la foi",
    description:
      "Plateforme chrétienne internationale : Bible, prières, études, concours, communauté. 100% gratuit.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KONEKSYON PAM — Connectés par la foi",
    description: "Plateforme chrétienne internationale. Bible, prières, études, communauté. 100% gratuit.",
    creator: "@koneksyonpam",
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: BASE_URL,
    languages: {
      "fr"        : BASE_URL,
      "ht"        : BASE_URL,
      "en"        : BASE_URL,
      "x-default" : BASE_URL,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        {/* Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* WebSite schema with Sitelinks SearchBox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 font-sans">
        <Analytics />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
