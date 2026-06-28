import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";
import { publishToSocial, type Platform } from "@/lib/social-post";
import { sanitizeText } from "@/lib/sanitize";

async function getAuthUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// POST — manual social media post (admin only)
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || !isAdmin(user)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const body = await request.json();
  const message  = sanitizeText(body.message, 1000);
  const link     = typeof body.link === "string" ? body.link : undefined;
  const platforms = (body.platforms as Platform[]) || [];

  if (!message) return Response.json({ error: "Message requis" }, { status: 400 });
  if (!platforms.length) return Response.json({ error: "Choisissez au moins une plateforme" }, { status: 400 });

  const results = await publishToSocial(platforms, message, link);
  return Response.json({ results });
}
