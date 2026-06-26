import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function GET() {
  const { data, error } = await getSupabase()
    .from("churches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return Response.json({ churches: [] });
  return Response.json({ churches: data });
}

export async function POST(request: NextRequest) {
  // Get the authenticated user to record ownership
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json();
  const { name, pastor_name, description, logo_url } = body;

  if (!name || !pastor_name) return Response.json({ error: "Missing fields" }, { status: 400 });

  const join_code = generateCode();

  const insertData: Record<string, string> = {
    name, pastor_name, description: description || "", join_code,
  };
  if (logo_url) insertData.logo_url = logo_url;
  if (user?.id) insertData.owner_user_id = user.id;

  const { data, error } = await getSupabase()
    .from("churches")
    .insert(insertData)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ church: data });
}
