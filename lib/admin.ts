// Admin / moderator role system
// ADMIN_EMAILS and MODERATOR_EMAILS are comma-separated lists in env vars.
// The primary admin email is also hardcoded as a failsafe.

const PRIMARY_ADMIN = "contact@koneksyonpam.com";
const SECONDARY_ADMIN = "petefrans03@gmail.com";

function parseEmails(env?: string): string[] {
  if (!env) return [];
  return env.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
}

// NEXT_PUBLIC_ADMIN_EMAILS is available on client and server.
// ADMIN_EMAILS is server-only. We merge both so client-side isAdmin() works.
const ADMIN_LIST = [
  PRIMARY_ADMIN,
  SECONDARY_ADMIN,
  ...parseEmails(process.env.ADMIN_EMAILS),
  ...parseEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

const MOD_LIST = parseEmails(process.env.MODERATOR_EMAILS);

export const ADMIN_EMAIL = PRIMARY_ADMIN; // kept for backward compatibility

export function isAdmin(user: { email?: string | null } | null): boolean {
  return ADMIN_LIST.includes((user?.email ?? "").toLowerCase());
}

export function isModerator(user: { email?: string | null } | null): boolean {
  const email = (user?.email ?? "").toLowerCase();
  return ADMIN_LIST.includes(email) || MOD_LIST.includes(email);
}

// Returns the highest role of a user
export function getRole(user: { email?: string | null } | null): "admin" | "moderator" | "user" {
  const email = (user?.email ?? "").toLowerCase();
  if (ADMIN_LIST.includes(email)) return "admin";
  if (MOD_LIST.includes(email))   return "moderator";
  return "user";
}
