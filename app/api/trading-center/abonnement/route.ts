/**
 * L'ABONNEMENT PREMIUM.
 *
 * Paiement PONCTUEL, pas prélèvement récurrent. Le choix mérite d'être
 * expliqué parce qu'il n'est pas anodin :
 *
 * Un abonnement récurrent PayPal exige de créer un « Product » puis un
 * « Plan » dans le tableau de bord PayPal, d'en récupérer les identifiants,
 * et de gérer les webhooks d'échec de prélèvement, de suspension et
 * d'annulation. Rien d'infaisable, mais rien qui puisse être écrit à la place
 * du titulaire du compte PayPal — les identifiants n'existent pas encore.
 *
 * On achète donc 1, 3 ou 12 mois d'un coup. `accorderPremium()` prolonge
 * depuis la fin en cours, si bien qu'un renouvellement anticipé n'efface
 * jamais les jours restants. Le passage au récurrent, plus tard, ne demandera
 * pas de toucher à cette logique : seule la source du paiement changera.
 *
 * ── Le contrôle qui compte ────────────────────────────────────────────────
 *
 * Le MONTANT est vérifié côté serveur contre le tarif du mois demandé. Sans
 * ce contrôle, une requête forgée demanderait douze mois en payant le tarif
 * d'un seul — et PayPal validerait, puisqu'il encaisse ce qu'on lui dit
 * d'encaisser.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPayPalToken } from "@/lib/paypal-server";
import { getIp, rateLimit } from "@/lib/rate-limit";
import { abonnementDe, accorderPremium, planDe } from "@/lib/trading-center/acces";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Les formules. Le prix par mois baisse avec la durée — c'est l'intérêt du long. */
export const FORMULES: Record<string, { mois: number; prix: number; libelle: string }> = {
  m1: { mois: 1, prix: 29, libelle: "1 mois" },
  m3: { mois: 3, prix: 75, libelle: "3 mois" },
  m12: { mois: 12, prix: 249, libelle: "12 mois" },
};

async function utilisateur(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } },
  );
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function GET(request: NextRequest) {
  const user = await utilisateur(request);
  if (!user) return NextResponse.json({ plan: "free", connecte: false, formules: FORMULES });

  return NextResponse.json({
    connecte: true,
    plan: await planDe(user.id),
    abonnement: await abonnementDe(user.id),
    formules: FORMULES,
    paiement_configure: !!process.env.PAYPAL_SECRET_KEY,
  });
}

export async function POST(request: NextRequest) {
  const user = await utilisateur(request);
  if (!user) return NextResponse.json({ error: "Connexion nécessaire." }, { status: 401 });

  if (!process.env.PAYPAL_SECRET_KEY) {
    return NextResponse.json(
      { error: "Le paiement n'est pas encore configuré sur ce serveur." },
      { status: 501 },
    );
  }

  if (!rateLimit(getIp(request.headers), 15, 60 * 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie plus tard." }, { status: 429 });
  }

  let corps: { etape?: string; formule?: string; orderID?: string };
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  // ─────────────────────────────────────────── création de la commande ──
  if (corps.etape === "creer") {
    const formule = FORMULES[String(corps.formule)];
    if (!formule) return NextResponse.json({ error: "Formule inconnue." }, { status: 400 });

    const token = await getPayPalToken();
    const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: String(formule.prix) },
            description: `Trading Center Premium — ${formule.libelle}`,
            soft_descriptor: "KP TRADING",
            // On étiquette la commande : c'est ce qui permettra, à la
            // capture, de vérifier ce qui a réellement été acheté plutôt que
            // de faire confiance à ce que le navigateur redemande.
            custom_id: `tc:${corps.formule}:${user.id}`,
          },
        ],
        application_context: {
          brand_name: "KONEKSYON PAM TRADING CENTER",
          locale: "fr-FR",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: "https://koneksyonpam.com/trading-center",
          cancel_url: "https://koneksyonpam.com/trading-center/premium",
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[trading-center/abonnement] création", res.status, (err as { name?: string }).name);
      return NextResponse.json({ error: "Création de la commande impossible." }, { status: 500 });
    }

    const commande = await res.json();
    return NextResponse.json({ orderID: commande.id });
  }

  // ───────────────────────────────────────────────── capture du paiement ──
  if (corps.etape === "capturer") {
    const orderID = String(corps.orderID ?? "");
    if (!orderID) return NextResponse.json({ error: "orderID manquant." }, { status: 400 });

    const token = await getPayPalToken();
    const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "PayPal-Request-Id": `tc-capture-${orderID}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[trading-center/abonnement] capture", res.status, (err as { name?: string }).name);
      return NextResponse.json({ error: "Paiement non abouti." }, { status: 400 });
    }

    const capture = await res.json();
    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ error: `Paiement au statut ${capture.status}.` }, { status: 400 });
    }

    const unite = capture.purchase_units?.[0];
    const custom = String(unite?.custom_id ?? "");
    const montant = parseFloat(unite?.payments?.captures?.[0]?.amount?.value ?? "0");

    // La formule vient de la COMMANDE, pas de la requête du navigateur.
    const [, cleFormule, userIdCommande] = custom.split(":");
    const formule = FORMULES[cleFormule];

    if (!formule || userIdCommande !== user.id) {
      console.error("[trading-center/abonnement] commande étrangère", custom, user.id);
      return NextResponse.json({ error: "Cette commande ne correspond pas à ton compte." }, { status: 403 });
    }

    // Le montant réellement encaissé doit couvrir le tarif. La tolérance d'un
    // centime absorbe les arrondis de conversion, rien de plus.
    if (montant + 0.01 < formule.prix) {
      console.error("[trading-center/abonnement] montant insuffisant", montant, formule.prix);
      return NextResponse.json({ error: "Montant encaissé insuffisant." }, { status: 400 });
    }

    await accorderPremium(user.id, user.email ?? null, formule.mois, "paypal", orderID);

    return NextResponse.json({
      ok: true,
      plan: "premium",
      mois: formule.mois,
      abonnement: await abonnementDe(user.id),
    });
  }

  return NextResponse.json({ error: "Étape inconnue." }, { status: 400 });
}
