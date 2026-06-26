import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = adminDb();

  const [users, prayers, testimonies, churches, contacts, donations] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("prayers").select("*", { count: "exact", head: true }),
    db.from("testimonies").select("*", { count: "exact", head: true }),
    db.from("churches").select("*", { count: "exact", head: true }),
    db.from("contact_messages").select("*", { count: "exact", head: true }),
    db.from("donations").select("amount").order("created_at", { ascending: false }).limit(100),
  ]);

  const totalDons = (donations.data || []).reduce(
    (sum: number, d: { amount: number }) => sum + (d.amount || 0),
    0
  );

  return NextResponse.json({
    users: users.count ?? 0,
    prayers: prayers.count ?? 0,
    testimonies: testimonies.count ?? 0,
    churches: churches.count ?? 0,
    contacts: contacts.count ?? 0,
    totalDons,
  });
}
