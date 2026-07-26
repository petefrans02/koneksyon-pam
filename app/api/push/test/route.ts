import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendPushToUsers } from "@/lib/push";

// POST — s'envoie une notification push de test (à soi-même uniquement).
// Sert à vérifier toute la chaîne sans déranger les autres inscrits.
export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Non connecté" }, { status: 401 });

  const result = await sendPushToUsers([user.id], {
    title: "🔔 Test KONEKSYON PAM",
    body: "Les notifications push fonctionnent sur cet appareil !",
    url: "/notifications",
    tag: "kp-test",
  });

  return Response.json(result);
}
