import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { amount } = await request.json();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return Response.json({ error: "Stripe non configuré" }, { status: 500 });
  }

  const stripe = (await import("stripe")).default;
  const client = new stripe(stripeKey);

  const session = await client.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount * 100,
          product_data: {
            name: "Don — KONEKSYON PAM",
            description: "Soutenir la plateforme évangélique KONEKSYON PAM",
            images: ["https://koneksyonpam.com/logo-kp.png"],
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${request.headers.get("origin")}/don?success=1`,
    cancel_url: `${request.headers.get("origin")}/don`,
  });

  return Response.json({ url: session.url });
}
