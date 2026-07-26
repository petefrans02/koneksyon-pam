import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDonationThankYou } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const { email, amount } = await req.json() as { email?: string; amount?: number };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    // Send thank-you email
    await sendDonationThankYou({ to: email, amount });

    // Record PayPal donation in Supabase (status: pending — no server-side verification available for direct PayPal URL)
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase.from("donations").insert({
        amount,
        currency: "USD",
        status: "pending",
        donor_email: email,
      });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
