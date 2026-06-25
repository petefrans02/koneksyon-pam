"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useState } from "react";

const PAYPAL_BUSINESS = "koneksyonpam@gmail.com";

async function stripeCheckout(amount: number): Promise<void> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  const { url, error } = await res.json();
  if (error) throw new Error(error);
  if (url) window.location.href = url;
}

export default function DonationPage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState<number | null>(null);
  const [method, setMethod] = useState<"stripe" | "paypal">("stripe");
  const success = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("success") === "1";

  const amounts = [5, 10, 25, 50, 100, 200];

  async function handleAmount(amount: number) {
    if (method === "stripe") {
      setLoading(amount);
      try {
        await stripeCheckout(amount);
      } catch {
        alert(lang === "fr" ? "Erreur Stripe. Réessayez." : "Stripe error. Try again.");
      } finally {
        setLoading(null);
      }
    } else {
      window.open(`https://www.paypal.com/donate?business=${PAYPAL_BUSINESS}&amount=${amount}&currency_code=USD`, "_blank");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
          <span className="text-5xl block mb-3">🙏</span>
          <h2 className="text-xl font-bold text-green-800 mb-2">
            {lang === "fr" ? "Don reçu avec gratitude !" : lang === "ht" ? "Don resevwa ak rekonesans !" : "Donation received with gratitude!"}
          </h2>
          <p className="text-green-600 text-sm">{lang === "fr" ? "Que Dieu vous bénisse abondamment." : "God bless you abundantly."}</p>
        </div>
      )}

      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1.5 border border-blue-400/20">
            <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "Soutenir KONEKSYON PAM" : lang === "ht" ? "Sipòte KONEKSYON PAM" : "Support KONEKSYON PAM"}
        </h1>
        <p className="text-stone-500 mt-2">
          {lang === "fr"
            ? "Votre don permet de maintenir cette plateforme gratuite pour l'Église du monde entier"
            : lang === "ht"
            ? "Don ou pèmèt kenbe platfòm sa a gratis pou Legliz nan mond antye"
            : "Your donation helps keep this platform free for the Church worldwide"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-stone-900 mb-5 text-center">
          {lang === "fr" ? "Faire un don" : lang === "ht" ? "Fè yon don" : "Make a donation"}
        </h2>

        {/* Method Selector */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMethod("stripe")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${method === "stripe" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-stone-200 text-stone-500 hover:border-blue-300"}`}
          >
            💳 {lang === "fr" ? "Carte de crédit" : lang === "ht" ? "Kat kredi" : "Credit card"}
            <span className="block text-xs font-normal text-stone-400 mt-0.5">Visa · Mastercard · Stripe</span>
          </button>
          <button
            onClick={() => setMethod("paypal")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${method === "paypal" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-stone-200 text-stone-500 hover:border-blue-300"}`}
          >
            🅿️ PayPal
            <span className="block text-xs font-normal text-stone-400 mt-0.5">paypal.com</span>
          </button>
        </div>

        {/* Amount Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleAmount(amount)}
              disabled={loading === amount}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl py-4 text-center hover:border-blue-400 hover:shadow-lg transition-all disabled:opacity-60"
            >
              {loading === amount ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-blue-600">${amount}</p>
                  <p className="text-xs text-stone-400">USD</p>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Custom amount button */}
        {method === "paypal" ? (
          <a
            href={`https://www.paypal.com/donate?business=${PAYPAL_BUSINESS}&currency_code=USD`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold text-center hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
          >
            💝 {lang === "fr" ? "Montant personnalisé via PayPal" : lang === "ht" ? "Montan pèsonalize via PayPal" : "Custom amount via PayPal"}
          </a>
        ) : (
          <button
            onClick={async () => {
              const val = prompt(lang === "fr" ? "Entrez le montant en USD" : "Enter amount in USD");
              const n = parseFloat(val || "0");
              if (n >= 1) await handleAmount(n);
            }}
            className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold text-center hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
          >
            💝 {lang === "fr" ? "Montant personnalisé" : lang === "ht" ? "Montan pèsonalize" : "Custom amount"}
          </button>
        )}

        <div className="flex justify-center items-center gap-3 mt-4">
          <span className="text-xs text-stone-400">🔒 {lang === "fr" ? "Paiement sécurisé" : "Secure payment"}</span>
          <span className="text-stone-200">·</span>
          <span className="text-xs text-stone-400">Stripe · PayPal</span>
        </div>
      </div>

      {/* Where it goes */}
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0f2044] rounded-2xl p-8 text-center border border-blue-800/30">
        <h3 className="text-lg font-bold text-white mb-3">
          {lang === "fr" ? "Où va votre don ?" : lang === "ht" ? "Ki kote don ou ale ?" : "Where does your donation go?"}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-left">
          {[
            { icon: "🖥️", label: lang === "fr" ? "Hébergement du site" : "Website hosting" },
            { icon: "🕊️", label: lang === "fr" ? "Assistant IA biblique" : "AI Bible assistant" },
            { icon: "📖", label: lang === "fr" ? "Contenu biblique" : "Biblical content" },
            { icon: "🌍", label: lang === "fr" ? "Expansion mondiale" : "Global expansion" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span>{item.icon}</span>
              <span className="text-blue-200/70 text-sm">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-blue-300/40 text-xs mt-4">
          {lang === "fr"
            ? "\"Que chacun donne comme il l'a résolu en son cœur\" — 2 Corinthiens 9:7"
            : "\"Each one must give as he has decided in his heart\" — 2 Corinthians 9:7"}
        </p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-blue-500 text-sm hover:underline">
          ← {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
        </Link>
      </div>
    </div>
  );
}
