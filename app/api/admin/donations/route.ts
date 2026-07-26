import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return unauthorized();

  // Use service role to bypass RLS on donations table
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const format = req.nextUrl.searchParams.get("format");
  const limit  = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "50"), 500);

  // ── CSV export ────────────────────────────────────────────────────────────
  if (format === "csv") {
    const { data: rows } = await admin
      .from("donations")
      .select("created_at,paypal_capture_id,paypal_order_id,amount,currency,status,donor_name,donor_email,webhook_confirmed_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    const cols = ["date","id_capture","id_commande","montant","devise","statut","nom","email","confirmation_webhook"];
    const csv = [
      cols.join(";"),
      ...(rows ?? []).map((r: Record<string, unknown>) => [
        new Date(r.created_at as string).toISOString().split("T")[0],
        r.paypal_capture_id ?? "",
        r.paypal_order_id   ?? "",
        r.amount,
        r.currency,
        r.status,
        r.donor_name  ?? "",
        r.donor_email ?? "",
        r.webhook_confirmed_at ? "oui" : "non",
      ].map(String).join(";"))
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="koneksyonpam-dons-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [totalRes, todayRes, monthRes, recentRes] = await Promise.all([
    admin.from("donations").select("amount", { count: "exact" }).eq("status", "completed").or("status.eq.webhook_confirmed"),
    admin.from("donations").select("amount").gte("created_at", today).neq("status", "denied").neq("status", "refunded"),
    admin.from("donations").select("amount").gte("created_at", monthStart).neq("status", "denied").neq("status", "refunded"),
    admin.from("donations").select("id,created_at,amount,currency,status,donor_name,donor_email,paypal_capture_id,webhook_confirmed_at")
      .order("created_at", { ascending: false }).limit(limit),
  ]);

  const sum = (rows: { amount: number }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + (r.amount ?? 0), 0);

  const byStatus = (recentRes.data ?? []).reduce<Record<string, number>>((acc, r: { status: string }) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    stats: {
      totalCount:   totalRes.count ?? 0,
      totalAmount:  sum(totalRes.data as { amount: number }[] | null),
      todayAmount:  sum(todayRes.data as { amount: number }[] | null),
      monthAmount:  sum(monthRes.data as { amount: number }[] | null),
      byStatus,
    },
    transactions: recentRes.data ?? [],
  });
}
