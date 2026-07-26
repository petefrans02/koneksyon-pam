import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Leçons dynamiques (ajoutées à chaud) d'un cours — lecture publique.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ lessons: [] });

  try {
    const db = createClient(url, key);
    const { data, error } = await db
      .from("course_lessons")
      .select("id, module_title, title, content, key_points, exercise, verse, video_id, created_at")
      .eq("course_slug", slug)
      .eq("published", true)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ lessons: [] });
    return NextResponse.json({ lessons: data ?? [] });
  } catch {
    return NextResponse.json({ lessons: [] });
  }
}
