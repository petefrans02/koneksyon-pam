"use client";

import { useState } from "react";
import { analytics } from "@/lib/analytics";

interface Props {
  amount: number;
  disabled?: boolean;
}

export default function StripeDonateButton({ amount, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDonate = async () => {
    if (disabled || amount < 1) return;
    setError("");
    setLoading(true);
    analytics.donateClick(amount);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Stripe indisponible pour le moment.");
        setLoading(false);
        return;
      }

      analytics.donateStart(amount);
      window.location.href = data.url;
    } catch {
      setError("Erreur réseau. Réessayez.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleDonate}
        disabled={disabled || loading}
        style={{ background: disabled ? "#d1d5db" : "#635bff" }}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-base border-0 transition-opacity disabled:opacity-50"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span style={{ fontSize: 18 }}>💳</span>
        )}
        <span>
          {loading
            ? "Redirection…"
            : disabled
            ? "Entrez un montant"
            : `Donner $${amount.toFixed(2)} via Carte`}
        </span>
      </button>
      {error && (
        <p className="text-red-500 text-xs text-center mt-2">{error}</p>
      )}
    </div>
  );
}
