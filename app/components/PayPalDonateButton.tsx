"use client";

import { analytics } from "@/lib/analytics";

interface Props {
  amount: number;
  disabled?: boolean;
}

const PAYPAL_BUSINESS = "francismarketstore@gmail.com";

export default function PayPalDonateButton({ amount, disabled }: Props) {
  const handleDonate = () => {
    if (disabled || amount < 1) return;
    analytics.donateClick(amount);
    analytics.donateStart(amount);

    const params = new URLSearchParams({
      business:      PAYPAL_BUSINESS,
      amount:        amount.toFixed(2),
      currency_code: "USD",
      item_name:     "Don KONEKSYON PAM",
      no_note:       "1",
      no_shipping:   "1",
      return:        `https://koneksyonpam.com/don/merci?amount=${amount.toFixed(2)}`,
      cancel_return: "https://koneksyonpam.com/don",
    });

    window.location.href = `https://www.paypal.com/donate?${params.toString()}`;
  };

  return (
    <button
      onClick={handleDonate}
      disabled={disabled}
      style={{ background: disabled ? "#93c5fd" : "#0070ba" }}
      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-base cursor-pointer border-0"
    >
      <span style={{ fontSize: 20 }}>💳</span>
      <span>
        {disabled ? "Entrez un montant" : `Donner $${amount.toFixed(2)} via PayPal`}
      </span>
    </button>
  );
}
