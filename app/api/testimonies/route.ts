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
    .from("testimonies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return Response.json({ testimonies: [] });
  return Response.json({ testimonies: data });
}

export async function POST(request: NextRequest) {
  // 5 testimony submissions per IP per hour
  if (!rateLimit(getIp(request.headers), 5, 60 * 60_000)) {
    return Response.json({ error: "Limite atteinte. Réessayez plus tard." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const text    = sanitizeText(body.text, 2000);
  const name    = sanitizeText(body.name, 100);
  const country = sanitizeText(body.country, 10);

  if (!text || text.length < 20) {
    return Response.json({ error: "Témoignage trop court (min. 20 caractères)" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("testimonies")
    .insert({ name: name || "Anonyme", text, country: country || "🌍" })
    .select()
    .single();

  if (error) return Response.json({ error: "Erreur serveur" }, { status: 500 });
  return Response.json({ testimony: data });
}

export async function PATCH(request: NextRequest) {
  // 60 likes per IP per hour (prevent spam-liking)
  if (!rateLimit(getIp(request.headers), 60, 60 * 60_000)) {
    return Response.json({ error: "Limite atteinte." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const id = sanitizeText(body.id, 64);
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const { data: testimony } = await getSupabase().from("testimonies").select("likes").eq("id", id).single();
  if (!testimony) return Response.json({ error: "Not found" }, { status: 404 });

  const newLikes = (testimony.likes || 0) + 1;
  await getSupabase().from("testimonies").update({ likes: newLikes }).eq("id", id);
  return Response.json({ likes: newLikes });
}
