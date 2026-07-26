// SERVER-SIDE ONLY — never import from a "use client" file
// All PayPal API calls use PAYPAL_SECRET_KEY which is never sent to the browser.

const PAYPAL_API = "https://api-m.paypal.com"; // Live endpoint

// ─── OAuth token (cached per invocation) ─────────────────────────────────────
let _tokenCache: { token: string; expiresAt: number } | null = null;

export async function getPayPalToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.token;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret   = process.env.PAYPAL_SECRET_KEY;

  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  _tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // 60s safety margin
  };
  return data.access_token;
}

// ─── Webhook signature verification ──────────────────────────────────────────
// Uses PayPal's own verify-webhook-signature endpoint — the official approach.
// https://developer.paypal.com/api/rest/webhooks/

export async function verifyWebhookSignature({
  webhookId,
  headers,
  rawBody,
}: {
  webhookId: string;
  headers: Record<string, string>;
  rawBody: string;
}): Promise<boolean> {
  try {
    const token = await getPayPalToken();

    const res = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        auth_algo:         headers["paypal-auth-algo"],
        cert_url:          headers["paypal-cert-url"],
        transmission_id:   headers["paypal-transmission-id"],
        transmission_sig:  headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id:        webhookId,
        webhook_event:     JSON.parse(rawBody),
      }),
      cache: "no-store",
    });

    if (!res.ok) return false;
    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch (err) {
    console.error("[PayPal] Webhook verification error:", err instanceof Error ? err.message : err);
    return false;
  }
}

// ─── Amount validation ────────────────────────────────────────────────────────
export const MIN_DONATION = 1;
export const MAX_DONATION = 10_000;

export function validateAmount(raw: unknown): number {
  const amount = parseFloat(String(raw));
  if (!isFinite(amount) || amount < MIN_DONATION || amount > MAX_DONATION) {
    throw new Error(`Invalid amount: must be between $${MIN_DONATION} and $${MAX_DONATION}`);
  }
  return parseFloat(amount.toFixed(2));
}
