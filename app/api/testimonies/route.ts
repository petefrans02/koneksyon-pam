import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET() {
  const { data, error } = await supabase
    .from("testimonies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return Response.json({ testimonies: [] });
  return Response.json({ testimonies: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, text, country } = body;

  if (!text) return Response.json({ error: "Missing text" }, { status: 400 });

  const { data, error } = await supabase
    .from("testimonies")
    .insert({ name: name || "Anonyme", text, country: country || "🌍" })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ testimony: data });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id } = body;

  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const { data: testimony } = await getSupabase().from("testimonies").select("likes").eq("id", id).single();
  const newLikes = (testimony?.likes || 0) + 1;

  await getSupabase().from("testimonies").update({ likes: newLikes }).eq("id", id);
  return Response.json({ likes: newLikes });
}
