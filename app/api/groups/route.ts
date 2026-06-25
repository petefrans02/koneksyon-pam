import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const section = request.nextUrl.searchParams.get("section");

  let query = getSupabase().from("group_posts").select("*").order("created_at", { ascending: false });

  if (slug) query = query.eq("group_slug", slug);
  if (section) query = query.eq("section_slug", section);

  const { data } = await query.limit(30);
  return Response.json({ posts: data || [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { group_slug, section_slug, author_name, author_country, title, content } = body;

  if (!title || !content || !group_slug || !section_slug) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("group_posts")
    .insert({ group_slug, section_slug, author_name: author_name || "Anonyme", author_country: author_country || "🌍", title, content })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ post: data });
}
