import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function authClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// GET /api/classes — list teacher's classes
export async function GET(req: NextRequest) {
  const auth = authClient(req);
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = adminClient();
  const { data: classes, error } = await db
    .from("classes")
    .select("id, name, subject, school_level, school_name, join_code, description, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch member counts
  const classIds = (classes || []).map(c => c.id);
  let memberCounts: Record<string, number> = {};
  if (classIds.length > 0) {
    const { data: counts } = await db
      .from("class_members")
      .select("class_id")
      .in("class_id", classIds);
    for (const row of counts || []) {
      memberCounts[row.class_id] = (memberCounts[row.class_id] || 0) + 1;
    }
  }

  const result = (classes || []).map(c => ({ ...c, member_count: memberCounts[c.id] || 0 }));
  return NextResponse.json({ classes: result });
}

// POST /api/classes — create a class
export async function POST(req: NextRequest) {
  const auth = authClient(req);
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, subject, school_level, school_name, description } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const db = adminClient();

  // Generate unique join code
  let join_code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await db.from("classes").select("id").eq("join_code", join_code).single();
    if (!existing) break;
    join_code = generateCode();
    attempts++;
  }

  const { data, error } = await db
    .from("classes")
    .insert({
      teacher_id: user.id,
      name: name.trim(),
      subject: subject || "bible",
      school_level: school_level || null,
      school_name: school_name?.trim() || null,
      description: description?.trim() || null,
      join_code,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
