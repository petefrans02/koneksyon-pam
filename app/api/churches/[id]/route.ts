import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: church } = await getSupabase()
    .from("churches")
    .select("*")
    .eq("id", id)
    .single();

  const { data: posts } = await getSupabase()
    .from("church_posts")
    .select("*")
    .eq("church_id", id)
    .order("created_at", { ascending: false });

  return Response.json({ church, posts: posts || [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { title, content, type } = body;

  if (!title || !content) return Response.json({ error: "Missing fields" }, { status: 400 });

  const { data, error } = await getSupabase()
    .from("church_posts")
    .insert({ church_id: id, title, content, type: type || "announcement" })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ post: data });
}
