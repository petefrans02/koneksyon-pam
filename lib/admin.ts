export const ADMIN_EMAIL = "petefrans03@gmail.com";

export function isAdmin(user: { email?: string | null } | null): boolean {
  return user?.email === ADMIN_EMAIL;
}
