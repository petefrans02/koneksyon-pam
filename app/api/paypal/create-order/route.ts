import { NextRequest, NextResponse } from "next/server";
import { getPayPalToken, validateAmount } from "@/lib/paypal-server";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!process.env.PAYPAL_SECRET_KEY) {
    return NextResponse.json({ error: "Server-side not configured" }, { status: 501 });
  }

  // 20 order attempts per IP per hour
  if (!rateLimit(getIp(req.headers), 20, 60 * 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const amount = validateAmount(body.amount);

    const token = await getPayPalToken();

    const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "PayPal-Request-Id": crypto.randomUUID(), // idempotency key
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: String(amount),
          },
          description: "Don KONEKSYON PAM",
          soft_descriptor: "KONEKSYON PAM",
        }],
        application_context: {
          brand_name: "KONEKSYON PAM",
          locale: "fr-FR",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: "https://koneksyonpam.com/don/merci",
          cancel_url: "https://koneksyonpam.com/don",
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // Log error name only — no sensitive data in logs
      console.error("[PayPal create-order]", res.status, (err as { name?: string }).name);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    const order = await res.json();
    return NextResponse.json({ orderID: order.id });

  } catch (err) {
    // Log message only — no stack traces, no request body
    console.error("[PayPal create-order]", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
