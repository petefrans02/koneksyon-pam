import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/admin/", "/api/", "/auth/", "/dashboard/", "/_next/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: ["/admin/", "/api/", "/auth/", "/dashboard/", "/_next/"],
      },
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/dashboard/",
          "/_next/",
          "/don/merci",
        ],
      },
    ],
    sitemap: "https://koneksyonpam.com/sitemap.xml",
    host: "https://koneksyonpam.com",
  };
}
