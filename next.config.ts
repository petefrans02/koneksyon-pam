import type { NextConfig } from "next";

// ─── Content Security Policy ─────────────────────────────────────────────────
// PayPal SDK removed → direct URL redirect only. No PayPal scripts needed.
// Stripe checkout → server-side redirect only. No Stripe.js on client.
// GA4 requires 'unsafe-inline' for the gtag initialization snippet.
const CSP = [
  "default-src 'self'",
  // GA4 needs unsafe-inline for inline gtag script; no eval needed
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Allow images from Google (user avatars), Supabase storage, CDN icons, and data URIs
  "img-src 'self' data: blob: https:",
  // Supabase REST + Realtime; GA4 reporting; GTM
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
  // No iframes needed (PayPal/Stripe are redirect-based)
  "frame-src 'none'",
  "frame-ancestors 'none'",      // clickjacking protection
  "object-src 'none'",           // no plugins
  "base-uri 'self'",
  // PayPal donate redirect target; Stripe checkout handled server-side
  "form-action 'self' https://www.paypal.com https://checkout.stripe.com",
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

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
      {
        source: "/(.*)",
        headers: [
          // ── Core security ───────────────────────────────────────────────
          { key: "Content-Security-Policy",      value: CSP },
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
