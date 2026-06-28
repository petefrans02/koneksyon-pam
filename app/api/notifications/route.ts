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

// GET — list user's notifications (last 50)
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();
  const { data } = await db
    .from("notifications")
    .select("id, type, title_fr, title_ht, title_en, body_fr, body_ht, body_en, link, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const unread = (data || []).filter(n => !n.read).length;
  return Response.json({ notifications: data || [], unread });
}

// PATCH — mark notifications as read
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { ids, all } = body as { ids?: string[]; all?: boolean };

  const db = getDb();

  if (all) {
    await db.from("notifications").update({ read: true }).eq("user_id", user.id);
  } else if (ids?.length) {
    await db.from("notifications").update({ read: true })
      .eq("user_id", user.id)
      .in("id", ids);
  }

  return Response.json({ ok: true });
}
