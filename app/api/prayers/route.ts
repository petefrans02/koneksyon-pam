import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET() {
  const { data, error } = await getSupabase()
    .from("prayers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return Response.json({ prayers: [] });
  return Response.json({ prayers: data });
}

export async function POST(request: NextRequest) {
  // 10 prayer submissions per IP per hour
  if (!rateLimit(getIp(request.headers), 10, 60 * 60_000)) {
    return Response.json({ error: "Limite atteinte. Réessayez plus tard." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const text    = sanitizeText(body.text, 2000);
  const name    = sanitizeText(body.name, 100);
  const country = sanitizeText(body.country, 10);

  if (!text || text.length < 10) {
    return Response.json({ error: "Prière trop courte (min. 10 caractères)" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("prayers")
    .insert({ name: name || "Anonyme", text, country: country || "🌍" })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ prayer: data });
}

export async function PATCH(request: NextRequest) {
  if (!rateLimit(getIp(request.headers), 120, 60 * 60_000)) {
    return Response.json({ error: "Limite atteinte." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const id = sanitizeText(body.id, 64);
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const { data: prayer } = await getSupabase().from("prayers").select("pray_count").eq("id", id).single();
  if (!prayer) return Response.json({ error: "Not found" }, { status: 404 });
  const newCount = (prayer?.pray_count || 0) + 1;

  await getSupabase().from("prayers").update({ pray_count: newCount }).eq("id", id);
  return Response.json({ count: newCount });
}
