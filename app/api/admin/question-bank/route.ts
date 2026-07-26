import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const type         = searchParams.get("type");
  const difficulty   = searchParams.get("difficulty");
  const status       = searchParams.get("status");
  const tag          = searchParams.get("tag");
  const search       = searchParams.get("search");
  const subject      = searchParams.get("subject");
  const school_level = searchParams.get("school_level");
  const limit        = Math.min(Number(searchParams.get("limit") ?? 100), 500);
  const offset       = Number(searchParams.get("offset") ?? 0);

  const db = adminDb();
  let query = db.from("kp_questions")
    .select(`*, kp_question_tags(tag_id, kp_tags(id, name, color, category))`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type)         query = query.eq("type", type);
  if (difficulty)   query = query.eq("difficulty", difficulty);
  if (status)       query = query.eq("status", status);
  if (subject)      query = query.eq("subject", subject);
  if (school_level) query = query.eq("school_level", school_level);
  if (search)       query = query.or(`question->>fr.ilike.%${search}%,statement->>fr.ilike.%${search}%,verse->>fr.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by tag if needed
  let questions = data ?? [];
  if (tag) questions = questions.filter(q => q.kp_question_tags?.some((t: { kp_tags: { name: string } }) => t.kp_tags?.name === tag));

  return NextResponse.json({ questions, total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const body = await req.json();
  const { tags, ...questionData } = body;

  const db = adminDb();
  const { data, error } = await db.from("kp_questions").insert(questionData).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert tags
  if (tags?.length) {
    await db.from("kp_question_tags").insert(tags.map((tagId: string) => ({ question_id: data.id, tag_id: tagId })));
  }

  return NextResponse.json({ ok: true, id: data.id });
}
