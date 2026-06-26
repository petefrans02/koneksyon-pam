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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const isEglise = church.description?.includes("[⛪") || church.description?.includes("Église locale") || church.description?.includes("Legliz lokal");
  const hasOwner = !!church.owner_user_id;
  const isOwner = user && church.owner_user_id === user.id;

  if (isEglise && hasOwner && user && !isOwner) {
    // Check for an existing request — NEVER downgrade "approved" back to "pending"
    const { data: existing } = await db
      .from("church_join_requests")
      .select("status")
      .eq("church_id", church.id)
      .eq("user_id", user.id)
      .single();

    if (existing?.status === "approved") {
      // Already approved — redirect directly without touching the DB
      return Response.json({ church_id: church.id, status: "approved" });
    }

    if (existing?.status === "pending") {
      // Still waiting — just confirm it
      return Response.json({ church_id: church.id, status: "pending" });
    }

    // No request yet — create one
    const { error: reqError } = await db
      .from("church_join_requests")
      .insert({
        church_id: church.id,
        user_id: user.id,
        user_name: user_name || user.email?.split("@")[0] || "Anonyme",
        user_email: user_email || user.email || "",
        user_avatar: user_avatar || "",
        status: "pending",
      });

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
