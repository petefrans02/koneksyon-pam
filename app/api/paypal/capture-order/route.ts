import { NextRequest, NextResponse } from "next/server";
import { getPayPalToken } from "@/lib/paypal-server";
import { sendDonationThankYou } from "@/lib/emails";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  if (!process.env.PAYPAL_SECRET_KEY) {
    return NextResponse.json({ error: "Server-side not configured" }, { status: 501 });
  }

  try {
    const { orderID } = await req.json();
    if (!orderID || typeof orderID !== "string") {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    const token = await getPayPalToken();

    // Capture the payment — idempotent: same orderID always returns same result
    const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "PayPal-Request-Id": `capture-${orderID}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[PayPal capture]", res.status, (err as { name?: string }).name);
      return NextResponse.json({ error: "Capture failed" }, { status: 400 });
    }

    const capture = await res.json();

    if (capture.status !== "COMPLETED") {
      console.warn("[PayPal capture] Unexpected status:", capture.status);
      return NextResponse.json({ error: `Status: ${capture.status}` }, { status: 400 });
    }

    // Extract payment details
    const unit      = capture.purchase_units?.[0];
    const captureData = unit?.payments?.captures?.[0];
    const amount    = parseFloat(captureData?.amount?.value ?? "0");
    const captureId = captureData?.id as string;
    const donorEmail = capture.payer?.email_address as string | undefined;
    const donorName = [
      capture.payer?.name?.given_name,
      capture.payer?.name?.surname,
    ].filter(Boolean).join(" ") || undefined;

    // ── Record in Supabase ────────────────────────────────────────────────────
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase.from("donations").upsert(
        {
          paypal_order_id:  capture.id,
          paypal_capture_id: captureId,
          amount,
          currency: captureData?.amount?.currency_code ?? "USD",
          status: "completed",
          donor_email: donorEmail,
          donor_name: donorName,
          // Never log raw_response to console — store only in DB
          raw_response: capture,
        },
        { onConflict: "paypal_capture_id" }
      );
    } catch (dbErr) {
      // DB failure doesn't block the payment confirmation
      console.error("[PayPal capture] DB upsert failed:", dbErr instanceof Error ? dbErr.message : "unknown");
    }

    // ── Send thank-you email ──────────────────────────────────────────────────
    if (donorEmail) {
      sendDonationThankYou({
        to: donorEmail,
        name: donorName,
        amount,
        captureId,
      }).catch(err => {
        console.error("[PayPal capture] Email failed:", err instanceof Error ? err.message : "unknown");
      });
    }

    // Return only non-sensitive confirmation data
    return NextResponse.json({ success: true, captureId, amount });

  } catch (err) {
    console.error("[PayPal capture] Exception:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
