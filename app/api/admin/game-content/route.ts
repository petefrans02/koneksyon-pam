import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAdmin(request: NextRequest) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user || !isAdmin(user)) return null;
  return user;
}

// GET — list all questions, optionally filtered by section
export async function GET(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  let query = db().from("game_questions").select("*").order("section").order("level_id", { nullsFirst: true }).order("q_index");
  if (section) query = query.eq("section", section);

  const { data, error } = await query;
  if (error) {
    // PGRST106 = table not in schema cache; 42P01 = relation does not exist
    if (error.code === "42P01" || error.code === "PGRST106" || error.message?.includes("schema cache")) {
      return NextResponse.json({ error: "TABLE_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ questions: data ?? [] });
}

// POST — add new question
export async function POST(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.section || !body?.type || !body?.data) {
    return NextResponse.json({ error: "section, type et data requis" }, { status: 400 });
  }

  const { data, error } = await db().from("game_questions").insert({
    section: body.section,
    level_id: body.level_id ?? null,
    q_index: body.q_index ?? 0,
    type: body.type,
    data: body.data,
    is_active: body.is_active ?? true,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ question: data });
}

// PUT — update a question
export async function PUT(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.data !== undefined) updates.data = body.data;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.q_index !== undefined) updates.q_index = body.q_index;
  if (body.type !== undefined) updates.type = body.type;

  const { data, error } = await db().from("game_questions").update(updates).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ question: data });
}

// DELETE — remove a question
export async function DELETE(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const { error } = await db().from("game_questions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
