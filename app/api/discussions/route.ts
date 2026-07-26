import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function GET(req: NextRequest) {
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 15), 40);
  try {
    const supabase = db();
    const { data, error } = await supabase
      .from("community_discussions")
      .select("id, topic, category, accent, icon, messages, participants, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    const { count } = await supabase
      .from("community_discussions")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({ discussions: data ?? [], total: count ?? (data?.length ?? 0) });
  } catch {
    // Table absente / non configurée → la page retombe sur ses débats d'amorce.
    return NextResponse.json({ discussions: [], total: 0 });
  }
}
