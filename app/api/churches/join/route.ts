import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { join_code, user_name, user_email, user_avatar } = body;

  if (!join_code) return Response.json({ error: "Missing code" }, { status: 400 });

  const db = getDb();

  const { data: church, error } = await db
    .from("churches")
    .select("id, owner_user_id, description")
    .eq("join_code", join_code.trim().toUpperCase())
    .single();

  if (error || !church) {
    return Response.json({ error: "Church not found" }, { status: 404 });
  }

  // Get authenticated user if available
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  // Only create a pending request for Église type groups that have a known owner
  // and when the requester is NOT the owner
  const isEglise = church.description?.includes("[⛪") || church.description?.includes("Église locale") || church.description?.includes("Legliz lokal");
  const hasOwner = !!church.owner_user_id;
  const isOwner = user && church.owner_user_id === user.id;

  if (isEglise && hasOwner && user && !isOwner) {
    // Create pending join request for Église groups
    const { error: reqError } = await db
      .from("church_join_requests")
      .upsert(
        {
          church_id: church.id,
          user_id: user.id,
          user_name: user_name || user.email?.split("@")[0] || "Anonyme",
          user_email: user_email || user.email || "",
          user_avatar: user_avatar || "",
          status: "pending",
        },
        { onConflict: "church_id,user_id", ignoreDuplicates: false }
      );

    if (reqError) return Response.json({ error: reqError.message }, { status: 500 });
    return Response.json({ church_id: church.id, status: "pending" });
  }

  // All other group types: immediate access + create membership record
  if (user) {
    await db.from("church_memberships").upsert(
      { church_id: church.id, user_id: user.id },
      { onConflict: "church_id,user_id", ignoreDuplicates: true }
    );
  }
  return Response.json({ church_id: church.id, status: "approved" });
}
