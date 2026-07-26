// Payment abstraction layer — add providers here without touching UI

export type DonationProvider = "paypal" | "stripe" | "apple-pay" | "google-pay";

export interface DonationRequest {
  amount: number;
  currency?: string;
  provider: DonationProvider;
  returnUrl: string;
  cancelUrl: string;
  itemName?: string;
}

// ─── PayPal ───────────────────────────────────────────────────────────────────
const PAYPAL_BUSINESS = "contact@koneksyonpam.com";

export function buildPayPalUrl(req: DonationRequest): string {
  const params = new URLSearchParams({
    business: PAYPAL_BUSINESS,
    amount: String(req.amount),
    currency_code: req.currency ?? "USD",
    return: req.returnUrl,
    cancel_return: req.cancelUrl,
    item_name: req.itemName ?? "Don KONEKSYON PAM",
    no_shipping: "1",
    lc: "en_US",
  });
  return `https://www.paypal.com/donate?${params.toString()}`;
}

// ─── Future providers (ready to wire up) ─────────────────────────────────────
// export async function buildStripeUrl(req: DonationRequest): Promise<string> { ... }
// export function buildApplePayRequest(req: DonationRequest): ApplePayRequest { ... }
// export function buildGooglePayRequest(req: DonationRequest): GooglePayData { ... }

// ─── Unified entry point ──────────────────────────────────────────────────────
export function processDonation(req: DonationRequest): void {
  switch (req.provider) {
    case "paypal":
      window.location.href = buildPayPalUrl(req);
      break;
    // case "stripe": handled server-side via /api/stripe/checkout
    default:
      throw new Error(`Provider ${req.provider} not yet implemented`);
  }
}

// ─── Amount presets ───────────────────────────────────────────────────────────
export const DONATION_AMOUNTS = [
  { value: 5,   icon: "coeur",    labelKey: "amt5"  },
  { value: 10,  icon: "bible",    labelKey: "amt10" },
  { value: 25,  icon: "monde",    labelKey: "amt25" },
  { value: 50,  icon: "couronne", labelKey: "amt50" },
] as const;
