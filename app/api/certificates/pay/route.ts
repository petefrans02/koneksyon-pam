import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// PAIEMENT DU CERTIFICAT.
//
// Le cours est gratuit ; seul le certificat officiel se paie, une fois le
// parcours terminé. On vérifie le paiement CÔTÉ SERVEUR auprès de PayPal :
// le navigateur ne peut pas se déclarer payé tout seul.

export const CERTIFICATE_PRICE = "10.00"; // dollars

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

async function currentUser(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } },
  );
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

async function paypalToken(): Promise<string | null> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET_KEY;
  if (!id || !secret) return null;
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const d = await res.json() as { access_token?: string };
  return d.access_token ?? null;
}

// POST { code, orderID } — confirme le paiement et débloque le certificat.
export async function POST(req: NextRequest) {
  const user = await currentUser(req);
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const { code, orderID } = await req.json().catch(() => ({})) as { code?: string; orderID?: string };
  if (!code || !orderID) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const client = db();
  const { data: cert } = await client
    .from("certificates").select("id, code, paid, user_id")
    .eq("code", code.toUpperCase().trim()).maybeSingle();

  if (!cert) return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
  if (cert.user_id !== user.id) return NextResponse.json({ error: "Ce certificat n'est pas le tien" }, { status: 403 });
  if (cert.paid) return NextResponse.json({ ok: true, already: true });

  // Vérification auprès de PayPal : le paiement a-t-il réellement eu lieu ?
  const token = await paypalToken();
  if (!token) return NextResponse.json({ error: "Paiement non configuré" }, { status: 503 });

  const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return NextResponse.json({ error: "Commande introuvable chez PayPal" }, { status: 400 });

  const order = await res.json() as {
    status?: string;
    purchase_units?: { amount?: { value?: string } }[];
  };

  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: `Paiement non finalisé (${order.status ?? "inconnu"})` }, { status: 400 });
  }
  // On refuse un paiement d'un montant inférieur au prix annoncé.
  const paidValue = Number(order.purchase_units?.[0]?.amount?.value ?? 0);
  if (paidValue < Number(CERTIFICATE_PRICE)) {
    return NextResponse.json({ error: "Montant insuffisant" }, { status: 400 });
  }

  const { error } = await client.from("certificates").update({ paid: true }).eq("id", cert.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// GET — le prix affiché à l'élève.
export function GET() {
  return NextResponse.json({ price: CERTIFICATE_PRICE, currency: "USD" });
}
