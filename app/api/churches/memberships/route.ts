import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
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

// GET — get current user's membership (including dept) for a church
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ membership: null });

  const { searchParams } = new URL(request.url);
  const church_id = searchParams.get("church_id");
  if (!church_id) return Response.json({ error: "Missing church_id" }, { status: 400 });

  const db = getDb();
  const { data } = await db
    .from("church_memberships")
    .select("id, department_id")
    .eq("church_id", church_id)
    .eq("user_id", user.id)
    .single();

  return Response.json({ membership: data || null });
}

// POST — create membership (called after join approval or immediate join)
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { church_id } = await request.json();
  if (!church_id) return Response.json({ error: "Missing church_id" }, { status: 400 });

  const db = getDb();
  const { error } = await db
    .from("church_memberships")
    .upsert({ church_id, user_id: user.id }, { onConflict: "church_id,user_id", ignoreDuplicates: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

// PATCH — choose or change department
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { church_id, department_id } = await request.json();
  if (!church_id) return Response.json({ error: "Missing church_id" }, { status: 400 });

  const db = getDb();

  // Upsert membership with department
  const { error } = await db
    .from("church_memberships")
    .upsert(
      { church_id, user_id: user.id, department_id: department_id || null },
      { onConflict: "church_id,user_id", ignoreDuplicates: false }
    );

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
