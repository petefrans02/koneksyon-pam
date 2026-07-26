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

// POST /api/classes/join/[code] — student joins a class by code
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const auth = authClient(req);
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = adminClient();

  // Find class by code
  const { data: cls, error: clsErr } = await db
    .from("classes")
    .select("id, name, subject, teacher_id")
    .eq("join_code", code.toUpperCase().trim())
    .single();

  if (clsErr || !cls) return NextResponse.json({ error: "Code invalide" }, { status: 404 });

  // Teacher cannot join their own class as student
  if (cls.teacher_id === user.id) return NextResponse.json({ error: "Vous êtes l'enseignant de cette classe" }, { status: 400 });

  // Check already member
  const { data: existing } = await db
    .from("class_members")
    .select("id")
    .eq("class_id", cls.id)
    .eq("student_id", user.id)
    .single();

  if (existing) return NextResponse.json({ class: cls, already_member: true });

  // Get student name from metadata
  const student_name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Élève";

  const { error: insertErr } = await db.from("class_members").insert({
    class_id: cls.id,
    student_id: user.id,
    student_name,
  });

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  return NextResponse.json({ class: cls, joined: true });
}

// GET /api/classes/join/[code] — preview class info before joining
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const db = adminClient();

  const { data: cls } = await db
    .from("classes")
    .select("id, name, subject, school_level, school_name")
    .eq("join_code", code.toUpperCase().trim())
    .single();

  if (!cls) return NextResponse.json({ error: "Code invalide" }, { status: 404 });
  return NextResponse.json({ class: cls });
}
