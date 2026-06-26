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

// GET — owner fetches pending requests for their group
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const church_id = searchParams.get("church_id");
  if (!church_id) return Response.json({ error: "Missing church_id" }, { status: 400 });

  const db = getDb();

  // Verify requester owns this church
  const { data: church } = await db
    .from("churches")
    .select("owner_user_id")
    .eq("id", church_id)
    .single();

  if (!church || church.owner_user_id !== user.id) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data } = await db
    .from("church_join_requests")
    .select("*")
    .eq("church_id", church_id)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return Response.json({ requests: data || [] });
}

// POST — owner approves or rejects a request
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { request_id, church_id, action } = await request.json();
  if (!request_id || !church_id || !["approved", "rejected"].includes(action)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const db = getDb();

  // Verify ownership
  const { data: church } = await db
    .from("churches")
    .select("owner_user_id")
    .eq("id", church_id)
    .single();

  if (!church || church.owner_user_id !== user.id) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: req, error } = await db
    .from("church_join_requests")
    .update({ status: action })
    .eq("id", request_id)
    .eq("church_id", church_id)
    .select("user_id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // When approved, create the membership record
  if (action === "approved" && req?.user_id) {
    await db.from("church_memberships").upsert(
      { church_id, user_id: req.user_id },
      { onConflict: "church_id,user_id", ignoreDuplicates: true }
    );
  }

  return Response.json({ ok: true, action });
}
