import { NextRequest, NextResponse } from "next/server";

// Maps ISO 3166-1 alpha-2 country codes to the platform's 4 supported languages.
// Priority: language with official/majority status in the country.
const COUNTRY_LANG: Record<string, "fr" | "ht" | "en" | "es"> = {
  // ── Haiti → French (official written language) ────────────────────────────
  HT: "fr",

  // ── French-speaking countries ─────────────────────────────────────────────
  FR: "fr", BE: "fr", CH: "fr", LU: "fr", MC: "fr", AD: "fr",
  // West Africa
  SN: "fr", CI: "fr", ML: "fr", BF: "fr", GN: "fr", GW: "fr",
  BJ: "fr", NE: "fr", TG: "fr", MR: "fr",
  // Central Africa
  CM: "fr", CG: "fr", CD: "fr", GA: "fr", TD: "fr", CF: "fr",
  BI: "fr", RW: "fr",
  // Indian Ocean / Pacific
  MG: "fr", MU: "fr", KM: "fr", DJ: "fr", RE: "fr", YT: "fr",
  NC: "fr", PF: "fr", SC: "fr", VU: "fr",
  // North Africa (majority French-speaking in practice)
  MA: "fr", DZ: "fr", TN: "fr",

  // ── Spanish-speaking countries ────────────────────────────────────────────
  ES: "es",
  // Latin America
  MX: "es", CO: "es", AR: "es", PE: "es", VE: "es", CL: "es",
  EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es",
  PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  // Equatorial Guinea
  GQ: "es",
  // Puerto Rico (US territory, majority Spanish)
  PR: "es",

  // ── English-speaking countries ────────────────────────────────────────────
  US: "en", GB: "en", AU: "en", NZ: "en", IE: "en", CA: "en",
  // Caribbean
  JM: "en", TT: "en", BB: "en", BS: "en", GY: "en", BZ: "en",
  AG: "en", DM: "en", GD: "en", KN: "en", LC: "en", VC: "en",
  // Africa
  NG: "en", GH: "en", KE: "en", ZA: "en", ZW: "en", ZM: "en",
  UG: "en", TZ: "en", ET: "en", SL: "en", LR: "en", GM: "en",
  // Asia / Pacific
  PH: "en", SG: "en", IN: "en", PK: "en", MY: "en",
};

export async function GET(req: NextRequest) {
  // Vercel injects x-vercel-ip-country automatically on all deployments.
  const country =
    (req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "")
      .toUpperCase()
      .trim();

  const lang = COUNTRY_LANG[country] ?? null;

  return NextResponse.json(
    { country, lang },
    {
      headers: {
        // Cache for 24 h at the CDN edge — same user, same country
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  );
}
