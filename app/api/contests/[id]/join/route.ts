import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();

  // Check contest exists and is upcoming
  const { data: contest } = await db
    .from("contests")
    .select("status, max_participants")
    .eq("id", id)
    .single();

  if (!contest) return Response.json({ error: "Contest not found" }, { status: 404 });
  if (contest.status !== "upcoming") return Response.json({ error: "Registration closed" }, { status: 400 });

  // Check participant count
  const { count } = await db
    .from("contest_participants")
    .select("*", { count: "exact", head: true })
    .eq("contest_id", id);

  if (count !== null && count >= (contest.max_participants || 10)) {
    return Response.json({ error: "Contest is full" }, { status: 400 });
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonyme";
  const userAvatar = user.user_metadata?.avatar_url || "";

  const { error } = await db.from("contest_participants").upsert(
    { contest_id: id, user_id: user.id, user_name: userName, user_avatar: userAvatar },
    { onConflict: "contest_id,user_id", ignoreDuplicates: true }
  );

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
