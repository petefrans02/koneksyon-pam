import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET(request: NextRequest) {
  const user_id = request.nextUrl.searchParams.get("user_id");
  if (!user_id) return Response.json({ progress: [] });

  const { data } = await getSupabase()
    .from("quiz_progress")
    .select("*")
    .eq("user_id", user_id);

  return Response.json({ progress: data || [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, level_id, score, completed } = body;

  if (!user_id || !level_id) return Response.json({ error: "Missing fields" }, { status: 400 });

  const { data: existing } = await getSupabase()
    .from("quiz_progress")
    .select("*")
    .eq("user_id", user_id)
    .eq("level_id", level_id)
    .single();

  if (existing) {
    const best = Math.max(existing.best_score || 0, score);
    await getSupabase()
      .from("quiz_progress")
      .update({ score, best_score: best, completed: completed || existing.completed, updated_at: new Date().toISOString() })
      .eq("user_id", user_id)
      .eq("level_id", level_id);
    return Response.json({ saved: true, best_score: best });
  }

  await getSupabase()
    .from("quiz_progress")
    .insert({ user_id, level_id, score, best_score: score, completed });

  return Response.json({ saved: true, best_score: score });
}
