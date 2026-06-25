import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET(request: NextRequest) {
  const church_id = request.nextUrl.searchParams.get("church_id");
  if (!church_id) return Response.json({ subgroups: [] });

  const { data } = await getSupabase()
    .from("church_subgroups")
    .select("*")
    .eq("church_id", church_id)
    .order("created_at", { ascending: true });

  return Response.json({ subgroups: data || [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { church_id, name, description, icon } = body;

  if (!church_id || !name) return Response.json({ error: "Missing fields" }, { status: 400 });

  const { data, error } = await getSupabase()
    .from("church_subgroups")
    .insert({ church_id, name, description: description || "", icon: icon || "📋" })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ subgroup: data });
}
