import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await db
    .from("error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({ logs: data ?? [] });
}

export async function DELETE(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await db.from("error_logs").delete().lt("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
  return NextResponse.json({ ok: true });
}
