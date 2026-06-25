import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET() {
  const { data, error } = await supabase
    .from("prayers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return Response.json({ prayers: [] });
  return Response.json({ prayers: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, text, country } = body;

  if (!text) return Response.json({ error: "Missing text" }, { status: 400 });

  const { data, error } = await supabase
    .from("prayers")
    .insert({ name: name || "Anonyme", text, country: country || "🌍" })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ prayer: data });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id } = body;

  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const { data: prayer } = await supabase.from("prayers").select("pray_count").eq("id", id).single();
  const newCount = (prayer?.pray_count || 0) + 1;

  await supabase.from("prayers").update({ pray_count: newCount }).eq("id", id);
  return Response.json({ count: newCount });
}
