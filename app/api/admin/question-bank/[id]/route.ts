import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const db = adminDb();
  const { data, error } = await db.from("kp_questions")
    .select(`*, kp_question_tags(tag_id, kp_tags(id, name, color, category))`)
    .eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ question: data });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json();
  const { tags, ...questionData } = body;

  const db = adminDb();
  const { error } = await db.from("kp_questions").update(questionData).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace tags
  if (tags !== undefined) {
    await db.from("kp_question_tags").delete().eq("question_id", id);
    if (tags.length) {
      await db.from("kp_question_tags").insert(tags.map((tagId: string) => ({ question_id: id, tag_id: tagId })));
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const db = adminDb();
  const { error } = await db.from("kp_questions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
