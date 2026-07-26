import { createClient } from "@supabase/supabase-js";

// Public stats endpoint — uses anon key, only exposes non-sensitive counts
export const dynamic = "force-dynamic";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

export async function GET() {
  const db = getDb();

  const [membersRes, prayersRes, testimoniesRes, churchesRes, contestsRes, votesRes] =
    await Promise.allSettled([
      db.from("profiles")            .select("*", { count: "exact", head: true }),
      db.from("prayers")             .select("*", { count: "exact", head: true }),
      db.from("testimonies")         .select("*", { count: "exact", head: true }),
      db.from("churches")            .select("*", { count: "exact", head: true }),
      db.from("contests")            .select("*", { count: "exact", head: true }),
      db.from("contest_votes")       .select("*", { count: "exact", head: true }),
    ]);

  const safe = (r: PromiseSettledResult<{ count: number | null }>) =>
    r.status === "fulfilled" ? (r.value.count ?? 0) : 0;

  const members     = safe(membersRes as PromiseSettledResult<{ count: number | null }>);
  const prayers     = safe(prayersRes as PromiseSettledResult<{ count: number | null }>);
  const testimonies = safe(testimoniesRes as PromiseSettledResult<{ count: number | null }>);
  const churches    = safe(churchesRes as PromiseSettledResult<{ count: number | null }>);
  const contests    = safe(contestsRes as PromiseSettledResult<{ count: number | null }>);
  const votes       = safe(votesRes as PromiseSettledResult<{ count: number | null }>);

  const total = members + prayers + testimonies + churches + contests + votes;

  return Response.json(
    { members, prayers, testimonies, churches, contests, votes, hasRealData: total > 0 },
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
