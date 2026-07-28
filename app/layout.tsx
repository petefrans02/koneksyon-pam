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
    default: "KONEKSYON PAM ACADEMY — L'ecole chretienne en ligne",
    template: "%s | KONEKSYON PAM ACADEMY",
  },
  description:
    "A Christian online school: English, courses, Bible study and biblical championships. Teaching and educating, free, everywhere in the world.",
  keywords: [
    "KONEKSYON PAM", "Koneksyon Pam", "plateforme évangélique",
    "Bible en ligne", "concours biblique", "quiz biblique", "verset du jour",
    "prière en ligne", "louange chrétienne", "témoignages chrétiens",
    "études bibliques", "communauté chrétienne", "église en ligne",
    "Parole de Dieu", "Évangile", "Jésus-Christ", "foi chrétienne",
    "psaumes", "adoration", "chrétien", "évangélique",
    "Haïti", "francophone", "kreyòl", "French Christian",
    "christian platform", "Bible study", "worship online",
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
    locale: "en_US",
    alternateLocale: ["fr_FR", "ht_HT", "es_ES"],
    url: BASE_URL,
    siteName: "KONEKSYON PAM",
    title: "KONEKSYON PAM ACADEMY — The Christian online school",
    description:
      "A global evangelical platform: Bible, prayer, worship, biblical championships and Christian community. 60+ nations · 100% free.",
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630, alt: "KONEKSYON PAM" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KONEKSYON PAM ACADEMY — The Christian online school",
    description: "A Christian online school: English, courses, Bible study and biblical championships. Teaching and educating, free, everywhere in the world.",
    creator: "@koneksyonpam",
    images: [`${BASE_URL}/opengraph-image`],
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
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
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
        {/* Google AdSense — loaded async, does not block rendering */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans" style={{ background: "#04080f" }}>
        <Analytics />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
