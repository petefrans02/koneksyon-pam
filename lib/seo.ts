const BASE = "https://koneksyonpam.com";
export const SITE_NAME = "KONEKSYON PAM ACADEMY";

/**
 * Canonical URL + hreflang alternates for a given path.
 * Language is client-side so all 3 share the same URL — correct per Google guidelines.
 */
export function alternates(path: string) {
  const url = `${BASE}${path === "/" ? "" : path}` || BASE;
  return {
    canonical: url,
    languages: {
      "fr"        : url,
      "ht"        : url,
      "en"        : url,
      "x-default" : url,
    },
  };
}

/** WebSite schema with Sitelinks SearchBox — inject once in root layout. */
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  name: SITE_NAME,
  url: BASE,
  description:
    "Une ecole chretienne en ligne : anglais, formations, Bible, etudes bibliques et championnats. Instruire et eduquer, gratuitement, partout dans le monde.",
  inLanguage: ["fr", "ht", "en"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/** Organization schema — inject once in root layout. */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE}/#organization`,
  name: SITE_NAME,
  url: BASE,
  logo: {
    "@type": "ImageObject",
    url: `${BASE}/logo-kp.png`,
    width: 512,
    height: 512,
  },
  description:
    "Plateforme chrétienne internationale gratuite : Bible, prières, études, concours et communauté.",
  foundingDate: "2024",
  areaServed: "Worldwide",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@koneksyonpam.com",
    contactType: "customer support",
    availableLanguage: ["French", "Haitian Creole", "English"],
  },
  sameAs: [
    "https://www.facebook.com/koneksyonpam",
    "https://twitter.com/koneksyonpam",
    "https://www.instagram.com/koneksyonpam",
    "https://www.youtube.com/@koneksyonpam",
  ],
};

/** BreadcrumbList schema helper. */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** WebPage schema helper. */
export function webpageSchema(opts: {
  name: string;
  description: string;
  url: string;
  breadcrumb?: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${opts.url}/#webpage`,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { "@id": `${BASE}/#website` },
    ...(opts.breadcrumb && {
      breadcrumb: breadcrumbSchema(opts.breadcrumb),
    }),
  };
}

/** Article schema for Bible studies and testimonies. */
export function articleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    url: opts.url,
    isPartOf: { "@id": `${BASE}/#website` },
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${BASE}/logo-kp.png` },
    },
    ...(opts.datePublished && { datePublished: opts.datePublished }),
    ...(opts.dateModified && { dateModified: opts.dateModified }),
    ...(opts.image && { image: opts.image }),
    inLanguage: ["fr", "ht", "en"],
  };
}

/** Event schema for contests. */
export function eventSchema(opts: {
  name: string;
  description: string;
  url: string;
  startDate?: string;
  endDate?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: { "@type": "Organization", name: SITE_NAME, url: BASE },
    ...(opts.startDate && { startDate: opts.startDate }),
    ...(opts.endDate && { endDate: opts.endDate }),
    inLanguage: ["fr", "ht", "en"],
    isAccessibleForFree: true,
  };
}
