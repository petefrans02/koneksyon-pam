import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { advanceChampionshipState, updateLeaderboard, awardBadges } from "@/lib/championship-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await advanceChampionshipState(id);

  if (result.advanced) {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: state } = await db
      .from("championship_state")
      .select("phase, round_index")
      .eq("contest_id", id)
      .single();

    if (state?.phase === "ROUND_RESULTS") {
      void updateLeaderboard(id, state.round_index);
    }
    if (state?.phase === "PODIUM") {
      void awardBadges(id);
      void (async () => {
        try { await db.from("contests").update({ status: "completed" }).eq("id", id); } catch { /* ok */ }
      })();
    }
  }

  return NextResponse.json(result);
}
