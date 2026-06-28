// Admin route — campaign stats
// GET /api/admin/campaigns?contest_id=xxx
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
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

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || !isAdmin(user)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const contestId = new URL(request.url).searchParams.get("contest_id");
  const db = getDb();

  if (contestId) {
    // Stats for a specific contest
    const { data: logs } = await db
      .from("notification_logs")
      .select("status, sent_at")
      .eq("contest_id", contestId);

    const { data: participants } = await db
      .from("contest_participants")
      .select("id")
      .eq("contest_id", contestId);

    const total   = (logs || []).length;
    const sent    = (logs || []).filter(l => l.status === "sent").length;
    const failed  = (logs || []).filter(l => l.status === "failed").length;

    return Response.json({
      contest_id: contestId,
      emails_total: total,
      emails_sent: sent,
      emails_failed: failed,
      registrations: (participants || []).length,
    });
  }

  // Global summary per contest
  const { data: summary } = await db
    .from("notification_logs")
    .select("contest_id, status, contests(title)")
    .order("sent_at", { ascending: false });

  const grouped: Record<string, { contest_id: string; title: string; sent: number; failed: number }> = {};
  for (const row of summary || []) {
    const cid = row.contest_id;
    if (!grouped[cid]) {
      grouped[cid] = {
        contest_id: cid,
        title: (row.contests as { title?: string } | null)?.title ?? "—",
        sent: 0,
        failed: 0,
      };
    }
    if (row.status === "sent") grouped[cid].sent++;
    else grouped[cid].failed++;
  }

  return Response.json({ campaigns: Object.values(grouped) });
}
