import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KONEKSYON PAM",
    short_name: "KP",
    description:
      "Plateforme chrétienne internationale — Bible, prières, études, concours, communauté.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#060d1e",
    theme_color: "#0a1628",
    orientation: "portrait-primary",
    lang: "fr",
    dir: "ltr",
    categories: ["lifestyle", "education", "religion"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/opengraph-image",
        sizes: "1200x630",
        type: "image/png",
        // @ts-ignore — form_factor is valid in the spec but not yet in Next.js types
        form_factor: "wide",
        label: "KONEKSYON PAM — Connectés par la foi",
      },
    ],
  };
}
