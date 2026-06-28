import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();
  const { data } = await db
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return Response.json({
    preferences: data ?? {
      email_contests: true,
      email_prayers: false,
      email_studies: false,
      email_announcements: true,
      email_news: true,
      push_contests: true,
      push_prayers: true,
      push_studies: true,
      push_announcements: true,
    }
  });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const allowed = [
    "email_contests", "email_prayers", "email_studies",
    "email_announcements", "email_news",
    "push_contests", "push_prayers", "push_studies", "push_announcements",
  ];
  const prefs: Record<string, boolean> = {};
  for (const key of allowed) {
    if (typeof body[key] === "boolean") prefs[key] = body[key];
  }

  const db = getDb();
  await db.from("notification_preferences").upsert({
    user_id: user.id,
    ...prefs,
    updated_at: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
