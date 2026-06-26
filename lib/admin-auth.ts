import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "petefrans03@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/** Supabase client with service role — full DB access, bypasses RLS */
export function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Verify caller is an authenticated admin. Returns email or throws. */
export async function requireAdmin(req: NextRequest): Promise<string> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.email) throw new Error("NOT_AUTHENTICATED");
  if (!isAdminEmail(user.email)) throw new Error("NOT_AUTHORIZED");

  return user.email;
}

/** Server-component helper (uses next/headers cookies) */
export async function getAdminUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email)) return null;
  return user;
}
