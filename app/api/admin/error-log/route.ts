import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await db().from("error_logs").insert({
      message: String(body.message ?? "").slice(0, 500),
      digest: String(body.digest ?? "").slice(0, 100),
      stack: String(body.stack ?? "").slice(0, 2000),
      page: String(body.page ?? "").slice(0, 200),
      ua: String(body.ua ?? "").slice(0, 200),
      severity: "error",
    });
  } catch { /* never fail the client */ }
  return Response.json({ ok: true });
}
