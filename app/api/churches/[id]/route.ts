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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: church } = await getDb()
    .from("churches")
    .select("*")
    .eq("id", id)
    .single();

  const { data: posts } = await getDb()
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

  const user = await getAuthUser(request);

  const authorName = user?.user_metadata?.full_name
    || user?.email?.split("@")[0]
    || "Anonyme";
  const authorAvatar = user?.user_metadata?.avatar_url || "";
  const authorId = user?.id || null;

  const { data, error } = await getDb()
    .from("church_posts")
    .insert({
      church_id: id,
      title,
      content,
      type: type || "announcement",
      author_id: authorId,
      author_name: authorName,
      author_avatar: authorAvatar,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ post: data });
}
