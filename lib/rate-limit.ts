// Edge-compatible rate limiter using in-process Map.
// For multi-instance production (100K+ users), replace with Upstash Redis:
// https://upstash.com/docs/redis/sdks/ratelimit-ts/overview

interface Window { count: number; reset: number }
const store = new Map<string, Window>();

// Evict expired entries periodically to prevent memory leak
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((v, k) => { if (now > v.reset) store.delete(k); });
  }, 60_000);
}

/**
 * Returns true if the request is allowed; false if rate-limited.
 * @param key    Unique identifier (e.g. IP address or `ip:userId`)
 * @param limit  Max requests per window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/**
 * Extract the real client IP from request headers.
 *
 * Priority order:
 *  1. CF-Connecting-IP  — injected by Cloudflare proxy; always the true client IP
 *  2. X-Forwarded-For   — standard proxy header (leftmost = original client)
 *  3. X-Real-IP         — nginx convention
 *
 * Without CF-Connecting-IP support, every request behind Cloudflare proxy would
 * appear to come from a Cloudflare datacenter IP, making rate limiting useless.
 */
export function getIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
