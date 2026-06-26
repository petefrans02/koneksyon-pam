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

  const { participant_id } = await request.json();
  if (!participant_id) return Response.json({ error: "Missing participant_id" }, { status: 400 });

  const db = getDb();

  // Check contest is in voting phase
  const { data: contest } = await db.from("contests").select("status").eq("id", id).single();
  if (!contest || contest.status !== "voting") {
    return Response.json({ error: "Voting not open" }, { status: 400 });
  }

  // Can't vote for yourself
  const { data: selfCheck } = await db
    .from("contest_participants")
    .select("id")
    .eq("contest_id", id)
    .eq("user_id", user.id)
    .eq("id", participant_id)
    .single();
  if (selfCheck) return Response.json({ error: "Cannot vote for yourself" }, { status: 400 });

  // Record vote (upsert — change vote allowed)
  const { data: existing } = await db
    .from("contest_votes")
    .select("id, participant_id")
    .eq("contest_id", id)
    .eq("voter_id", user.id)
    .single();

  if (existing) {
    // Revoke old vote
    await db.from("contest_participants")
      .update({ votes_count: db.rpc as unknown as number })
      .eq("id", existing.participant_id);

    await db.from("contest_votes")
      .update({ participant_id })
      .eq("id", existing.id);

    // Decrement old participant
    await db.rpc("decrement_votes", { participant_id: existing.participant_id });
  } else {
    await db.from("contest_votes").insert({
      contest_id: id,
      participant_id,
      voter_id: user.id,
    });
  }

  // Increment new participant vote count
  await db.rpc("increment_votes", { participant_id });

  return Response.json({ ok: true });
}
