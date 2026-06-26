import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const allowed = ["prayers", "testimonies", "churches", "contact_messages", "profiles", "donations"];
  if (!table || !allowed.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const db = adminDb();
  const { data, error } = await db
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { table, id } = await req.json();

  const allowed = ["prayers", "testimonies", "churches", "contact_messages"];
  if (!table || !allowed.includes(table) || !id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = adminDb();
  const { error } = await db.from(table).delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
