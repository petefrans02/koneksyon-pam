"use client";

import { useState } from "react";
import { analytics } from "@/lib/analytics";
import { useLang } from "@/lib/LangContext";
import Icon from "@/app/components/Icon";

interface Props {
  amount: number;
  disabled?: boolean;
}

export default function StripeDonateButton({ amount, disabled }: Props) {
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const label = {
    fr: { give: "Donner",  enter: "Entrez un montant", redirect: "Redirection…",       via: "Carte",   netErr: "Erreur réseau. Réessayez.",       stripeErr: "Stripe indisponible pour le moment." },
    ht: { give: "Bay",     enter: "Antre yon montan",  redirect: "Redireksyon…",        via: "Kat",     netErr: "Erè rezo. Eseye ankò.",            stripeErr: "Stripe pa disponib kounye a."         },
    en: { give: "Give",    enter: "Enter an amount",   redirect: "Redirecting…",        via: "Card",    netErr: "Network error. Try again.",        stripeErr: "Stripe unavailable right now."        },
    es: { give: "Donar",   enter: "Ingresa un monto",  redirect: "Redirigiendo…",       via: "Tarjeta", netErr: "Error de red. Inténtalo de nuevo.", stripeErr: "Stripe no disponible en este momento." },
  }[lang] ?? { give: "Donner", enter: "Entrez un montant", redirect: "Redirection…", via: "Carte", netErr: "Erreur réseau. Réessayez.", stripeErr: "Stripe indisponible pour le moment." };

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
        setError(data.error ?? label.stripeErr);
        setLoading(false);
        return;
      }

      analytics.donateStart(amount);
      window.location.href = data.url;
    } catch {
      setError(label.netErr);
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
          <Icon name="carte" size={18} />
        )}
        <span>
          {loading
            ? label.redirect
            : disabled
            ? label.enter
            : `${label.give} $${amount.toFixed(2)} via ${label.via}`}
        </span>
      </button>
      {error && (
        <p className="text-red-500 text-xs text-center mt-2">{error}</p>
      )}
    </div>
  );
}
