import type { NextConfig } from "next";

// ─── Content Security Policy ─────────────────────────────────────────────────
// PayPal SDK removed → direct URL redirect only. No PayPal scripts needed.
// Stripe checkout → server-side redirect only. No Stripe.js on client.
// GA4 requires 'unsafe-inline' for the gtag initialization snippet.
const CSP = [
  "default-src 'self'",
  // GA4 needs unsafe-inline for inline gtag script; no eval needed
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Allow images from Google (user avatars), Supabase storage, CDN icons, and data URIs
  "img-src 'self' data: blob: https:",
  // Supabase REST + Realtime; GA4 reporting; GTM
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://cloudflareinsights.com https://static.cloudflareinsights.com",
  // No iframes needed (PayPal/Stripe are redirect-based)
  "frame-src 'none'",
  "frame-ancestors 'none'",      // clickjacking protection
  "object-src 'none'",           // no plugins
  "base-uri 'self'",
  // PayPal donate redirect target; Stripe checkout handled server-side
  "form-action 'self' https://www.paypal.com https://checkout.stripe.com",
  "worker-src 'self' blob:",
].join("; ");

// ─── CSP du Trading Center ───────────────────────────────────────────────────
// Le graphique TradingView est un script tiers + une iframe. La CSP globale
// interdit les deux, et c'est très bien ainsi : la relâcher partout
// exposerait les pages de don, d'authentification et d'administration pour le
// confort d'une seule section.
//
// On la relâche donc SUR /trading-center UNIQUEMENT, et strictement de ce
// qu'exige le widget :
//   — script-src  : s3.tradingview.com (le chargeur du widget)
//   — frame-src   : www.tradingview.com + s.tradingview.com (l'iframe du graphique)
//   — connect-src : les flux de cotation du widget
//
// Deux en-têtes CSP sur une même réponse s'INTERSECTENT côté navigateur : le
// plus strict gagne, et la relâche n'aurait aucun effet. La règle globale
// exclut donc explicitement ce chemin (voir headers()), au lieu d'ajouter une
// seconde règle qui aurait paru fonctionner sans rien changer.
const CSP_TRADING = CSP
  .replace(
    "script-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' https://s3.tradingview.com https://www.tradingview.com",
  )
  .replace(
    "frame-src 'none'",
    "frame-src https://www.tradingview.com https://s.tradingview.com",
  )
  .replace(
    "connect-src 'self'",
    "connect-src 'self' https://*.tradingview.com wss://*.tradingview.com",
  );

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  async redirects() {
    return [
      { source: "/concours",         destination: "/championnats",         permanent: true },
      { source: "/concours/:path*",  destination: "/championnats/:path*",  permanent: true },
    ];
  },

  images: {
    remotePatterns: [
      // Google user avatars (OAuth)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Supabase storage (church logos, user uploads)
      { protocol: "https", hostname: "*.supabase.co" },
      // Flaticon CDN (study and section icons)
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24h CDN cache for optimised images
  },

  async headers() {
    return [
      // ── CSP : deux règles DISJOINTES ────────────────────────────────────
      // Elles ne doivent jamais se recouvrir. Deux en-têtes CSP sur une même
      // réponse s'intersectent (le plus strict gagne), si bien qu'un
      // recouvrement rendrait le graphique TradingView invisible tout en
      // donnant l'impression que la règle est en place.
      {
        source: "/trading-center/:path*",
        headers: [{ key: "Content-Security-Policy", value: CSP_TRADING }],
      },
      {
        source: "/((?!trading-center).*)",
        headers: [{ key: "Content-Security-Policy", value: CSP }],
      },

      {
        source: "/(.*)",
        headers: [
          // ── Core security ───────────────────────────────────────────────
          { key: "X-Frame-Options",              value: "DENY" },
          { key: "X-Content-Type-Options",       value: "nosniff" },
          { key: "Referrer-Policy",              value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control",       value: "on" },

          // ── Transport security (2 years, preload-ready) ─────────────────
          { key: "Strict-Transport-Security",    value: "max-age=63072000; includeSubDomains; preload" },

          // ── Permission controls ─────────────────────────────────────────
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=(self)",
              "payment=(self)",
              "usb=()",
              "bluetooth=()",
              "accelerometer=()",
              "gyroscope=()",
              "magnetometer=()",
              "interest-cohort=()",  // opt out of FLoC
            ].join(", "),
          },

          // ── Cross-origin policies ───────────────────────────────────────
          // Allow popup for Google OAuth
          { key: "Cross-Origin-Opener-Policy",  value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },

          // ── Google Discover — large image previews ──────────────────────
          { key: "X-Robots-Tag", value: "max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        ],
      },

      // ── Static asset caching (immutable JS/CSS chunks) ──────────────────
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },

      // ── Public image assets ─────────────────────────────────────────────
      {
        source: "/(.*)\\.(png|jpg|jpeg|gif|svg|ico|webp|avif)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },

      // ── API routes — no caching, no sensitive header leakage ────────────
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },

      // ── Auth callback — no indexing ─────────────────────────────────────
      {
        source: "/auth/(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
