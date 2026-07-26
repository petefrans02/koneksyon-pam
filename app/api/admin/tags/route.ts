import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const db = adminDb();
  const { data } = await db.from("kp_tags").select("*").order("category").order("name");
  return NextResponse.json({ tags: data ?? [] });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const body = await req.json();
  const db = adminDb();
  const { data, error } = await db.from("kp_tags").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
