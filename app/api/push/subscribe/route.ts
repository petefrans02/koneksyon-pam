import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// Abonnement/désabonnement d'un appareil aux notifications push.

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

async function getAuthUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

interface BrowserSub {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

// POST — enregistre l'abonnement de cet appareil.
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Non connecté" }, { status: 401 });

  const sub = (await request.json().catch(() => ({}))) as BrowserSub;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return Response.json({ error: "Abonnement invalide" }, { status: 400 });
  }

  // `endpoint` est unique : un même appareil qui se réabonne met à jour sa ligne
  // (et peut changer de propriétaire si le téléphone est partagé).
  const { error } = await getDb().from("push_subscriptions").upsert({
    user_id: user.id,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
    user_agent: request.headers.get("user-agent")?.slice(0, 255) ?? null,
  }, { onConflict: "endpoint" });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

// DELETE — supprime l'abonnement de cet appareil.
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Non connecté" }, { status: 401 });

  const { endpoint } = (await request.json().catch(() => ({}))) as { endpoint?: string };
  const db = getDb();
  const query = db.from("push_subscriptions").delete().eq("user_id", user.id);
  const { error } = endpoint ? await query.eq("endpoint", endpoint) : await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

// GET — cet utilisateur a-t-il des appareils abonnés ?
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ error: "Non connecté" }, { status: 401 });

  const { count, error } = await getDb()
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) return Response.json({ devices: 0, table_missing: true, error: error.message });
  return Response.json({ devices: count ?? 0 });
}
