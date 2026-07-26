// PayPal Webhook receiver — validates signature, processes events
// Configure in PayPal Dashboard: https://developer.paypal.com → Your App → Webhooks
//   URL: https://koneksyonpam.com/api/paypal/webhook
//   Events: PAYMENT.CAPTURE.COMPLETED · PAYMENT.CAPTURE.DENIED · CHECKOUT.ORDER.APPROVED

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paypal-server";
import { createClient } from "@supabase/supabase-js";

// PayPal retries failed webhooks — returning 200 always prevents infinite retries
const OK = () => NextResponse.json({ received: true });

export async function POST(req: NextRequest) {
  const secret    = process.env.PAYPAL_SECRET_KEY;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!secret || !webhookId) {
    console.warn("[PayPal Webhook] PAYPAL_SECRET_KEY or PAYPAL_WEBHOOK_ID not configured");
    return OK();
  }

  // Read raw body for signature verification — must read before json()
  const rawBody = await req.text();

  const headers = {
    "paypal-auth-algo":         req.headers.get("paypal-auth-algo")        ?? "",
    "paypal-cert-url":          req.headers.get("paypal-cert-url")         ?? "",
    "paypal-transmission-id":   req.headers.get("paypal-transmission-id")  ?? "",
    "paypal-transmission-sig":  req.headers.get("paypal-transmission-sig") ?? "",
    "paypal-transmission-time": req.headers.get("paypal-transmission-time")?? "",
  };

  // ── Signature verification — reject spoofed webhooks ────────────────────────
  const isValid = await verifyWebhookSignature({ webhookId, headers, rawBody });
  if (!isValid) {
    // Don't reveal why it failed to the caller
    console.error("[PayPal Webhook] Signature verification failed — possible spoofing attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: { event_type: string; id: string; resource: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error("[PayPal Webhook] Invalid JSON payload");
    return OK();
  }

  // Log event type + ID only — never log resource (may contain PII)
  console.log(`[PayPal Webhook] ${event.event_type} — ${event.id}`);

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    switch (event.event_type) {

      case "PAYMENT.CAPTURE.COMPLETED": {
        const captureId = event.resource?.id as string;
        const amount    = (event.resource?.amount as { value?: string })?.value;
        // Idempotent upsert — safe to re-process if PayPal retries
        await supabase.from("donations").upsert(
          {
            paypal_capture_id: captureId,
            status: "webhook_confirmed",
            webhook_confirmed_at: new Date().toISOString(),
          },
          { onConflict: "paypal_capture_id" }
        );
        console.log(`[PayPal Webhook] Payment confirmed — $${amount ?? "?"}`);
        break;
      }

      case "PAYMENT.CAPTURE.DENIED": {
        const captureId = event.resource?.id as string;
        await supabase.from("donations")
          .update({ status: "denied" })
          .eq("paypal_capture_id", captureId);
        console.warn(`[PayPal Webhook] Payment denied — ${captureId}`);
        break;
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        const captureId = (event.resource?.links as Array<{href:string}>)?.[0]?.href?.split("/").pop();
        if (captureId) {
          await supabase.from("donations")
            .update({ status: "refunded" })
            .eq("paypal_capture_id", captureId);
        }
        console.log(`[PayPal Webhook] Refund processed`);
        break;
      }

      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${event.event_type}`);
    }
  } catch (err) {
    console.error("[PayPal Webhook] DB error:", err instanceof Error ? err.message : "unknown");
    // Return 200 — prevents PayPal from retrying endlessly
  }

  return OK();
}
