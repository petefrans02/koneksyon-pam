import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ championships: [] });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: championships } = await db
    .from("contests")
    .select("id, title, theme, status, invite_code, difficulty, num_rounds, created_at, contest_participants(count)")
    .eq("is_private", true)
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ championships: championships ?? [] });
}
