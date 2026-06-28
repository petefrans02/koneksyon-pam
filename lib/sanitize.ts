/** Strips HTML tags, normalises whitespace, and trims. */
export function sanitizeText(raw: unknown, maxLen = 2000): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/<[^>]*>/g, "")        // strip HTML / script tags
    .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "") // strip control chars
    .trim()
    .slice(0, maxLen);
}

/** Validates and normalises an email address. Returns null if invalid. */
export function sanitizeEmail(raw: unknown, maxLen = 254): string | null {
  const s = sanitizeText(raw, maxLen).toLowerCase();
  if (!s) return null;
  // RFC 5322 simplified — catches obvious junk
  const ok = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(s);
  return ok ? s : null;
}

/** Validates a safe URL (http/https only). Returns null if invalid. */
export function sanitizeUrl(raw: unknown): string | null {
  try {
    const u = new URL(String(raw));
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Clamps a number within [min, max] and ensures it is finite. */
export function sanitizeAmount(raw: unknown, min = 1, max = 50_000): number | null {
  const n = parseFloat(String(raw));
  if (!isFinite(n) || n < min || n > max) return null;
  return Math.round(n * 100) / 100; // 2 decimal places
}
