import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  // 5 contact submissions per IP per 10 minutes
  if (!rateLimit(getIp(request.headers), 5, 10 * 60_000)) {
    return Response.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const name    = sanitizeText(body.name, 100);
  const email   = sanitizeEmail(body.email);
  const message = sanitizeText(body.message, 3000);

  if (!name || !email || !message) {
    return Response.json({ error: "Champs requis manquants ou invalides." }, { status: 400 });
  }
  if (message.length < 10) {
    return Response.json({ error: "Message trop court." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    message,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return Response.json({ success: true });
}
