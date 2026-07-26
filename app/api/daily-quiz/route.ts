import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Quiz du Jour — questions générées par IA pour aujourd'hui (lecture publique).
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ questions: [] });

  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const db = createClient(url, key);
    const { data, error } = await db
      .from("daily_quiz")
      .select("questions")
      .eq("quiz_date", today)
      .maybeSingle();

    if (error || !data?.questions) return NextResponse.json({ questions: [] });
    return NextResponse.json({ questions: data.questions });
  } catch {
    return NextResponse.json({ questions: [] });
  }
}
