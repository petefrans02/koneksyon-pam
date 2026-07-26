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

// GET /api/classes/[id] — class detail + members
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = authClient(req);
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = adminClient();

  const { data: cls, error: clsErr } = await db
    .from("classes")
    .select("*")
    .eq("id", id)
    .single();

  if (clsErr || !cls) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Allow teacher or class members to view
  const isTeacher = cls.teacher_id === user.id;
  if (!isTeacher) {
    const { data: membership } = await db
      .from("class_members")
      .select("id")
      .eq("class_id", id)
      .eq("student_id", user.id)
      .single();
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: members } = await db
    .from("class_members")
    .select("id, student_id, student_name, joined_at")
    .eq("class_id", id)
    .order("joined_at", { ascending: false });

  return NextResponse.json({ class: cls, members: members || [], is_teacher: isTeacher });
}

// DELETE /api/classes/[id] — delete class (teacher only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = authClient(req);
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = adminClient();
  const { data: cls } = await db.from("classes").select("teacher_id").eq("id", id).single();
  if (!cls || cls.teacher_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.from("classes").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
