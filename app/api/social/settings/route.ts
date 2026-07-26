import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

async function getAuthUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || !isAdmin(user)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const db = getDb();
  const { data } = await db.from("social_settings").select("*").eq("id", 1).single();
  return Response.json({
    settings: data ?? {
      facebook_enabled: false, youtube_enabled: false,
      auto_post_contests: false, auto_post_prayers: false, auto_post_testimonies: false,
    }
  });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || !isAdmin(user)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const body = await request.json();
  const allowed = ["facebook_enabled","youtube_enabled","auto_post_contests","auto_post_prayers","auto_post_testimonies"];
  const updates: Record<string, boolean | string> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (typeof body[key] === "boolean") updates[key] = body[key];
  }

  const db = getDb();
  await db.from("social_settings").upsert({ id: 1, ...updates });
  return Response.json({ ok: true });
}
