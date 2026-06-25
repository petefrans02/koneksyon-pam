import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { join_code } = body;

  if (!join_code) return Response.json({ error: "Missing code" }, { status: 400 });

  const { data: church, error } = await getSupabase()
    .from("churches")
    .select("id")
    .eq("join_code", join_code.toUpperCase())
    .single();

  if (error || !church) {
    return Response.json({ error: "Church not found" }, { status: 404 });
  }

  return Response.json({ church_id: church.id });
}
