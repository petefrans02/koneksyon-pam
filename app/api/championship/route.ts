import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// GET — liste des championnats (saisons).
export async function GET() {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await db.from("champ_seasons").select("*").order("created_at", { ascending: false });
  return NextResponse.json({ seasons: data ?? [] });
}
