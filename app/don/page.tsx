"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useState, useEffect } from "react";

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
  const [selected, setSelected] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      setSuccess(true);
      const session_id = params.get("session_id");
      if (session_id) {
        fetch("/api/stripe/thank-you", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id }),
        }).catch(() => {});
      }
    }
  }, []);

  const amounts = [5, 10, 25, 50, 100, 200];

  async function handleDonate() {
    const amount = customMode ? parseFloat(customAmount) : selected;
    if (!amount || amount < 1) return;
    if (method === "stripe") {
      setLoading(amount);
      try {
        await stripeCheckout(amount);
      } catch {
        alert(lang === "fr" ? "Erreur de paiement. Vérifiez que Stripe est configuré." : "Payment error. Check Stripe config.");
      } finally {
        setLoading(null);
      }
    } else {
      window.open(`https://www.paypal.com/donate?business=${PAYPAL_BUSINESS}&amount=${amount}&currency_code=USD`, "_blank");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2044] to-[#1a1040] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-400/30">
            <span className="text-5xl">🙏</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {lang === "fr" ? "Que Dieu vous bénisse !" : lang === "ht" ? "Ke Bondye beni ou !" : "God bless you!"}
          </h1>
          <p className="text-blue-200/70 mb-2">
            {lang === "fr" ? "Votre don a bien été reçu. Merci pour votre générosité envers l'œuvre du Seigneur." : lang === "ht" ? "Don ou resevwa. Mèsi pou jenerozite ou nan travay Seyè a." : "Your donation was received. Thank you for your generosity."}
          </p>
          <p className="text-amber-400/80 text-sm italic mb-8">&ldquo;Que chacun donne comme il l&apos;a résolu en son cœur. — 2 Cor. 9:7&rdquo;</p>
          <Link href="/" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
            {lang === "fr" ? "← Retour à l'accueil" : lang === "ht" ? "← Tounen akèy" : "← Back to home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2044] to-[#1a1040]">
      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-16 pb-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest">
            ✦ {lang === "fr" ? "SOUTENEZ LA MISSION" : lang === "ht" ? "SIPÒTE MISYON AN" : "SUPPORT THE MISSION"}
          </div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 p-1.5 border border-amber-400/30 mx-auto mb-5">
            <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            {lang === "fr" ? "Votre don construit\nl'Église connectée" : lang === "ht" ? "Don ou bati legliz konekte" : "Your gift builds\nthe connected Church"}
          </h1>
          <p className="text-blue-200/60 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            {lang === "fr"
              ? "KONEKSYON PAM est gratuit pour tous. Vos dons financent l'hébergement, les outils bibliques et l'expansion mondiale."
              : lang === "ht"
              ? "KONEKSYON PAM gratis pou tout moun. Don ou yo finanse hébergement, zouti biblik ak ekspansyon mondyal."
              : "KONEKSYON PAM is free for everyone. Your donations fund hosting, biblical tools and global expansion."}
          </p>
          {/* Impact stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-2">
            {[
              { n: "24K+", l: lang === "fr" ? "membres" : "manm" },
              { n: "12+", l: lang === "fr" ? "pays" : "peyi" },
              { n: "100%", l: lang === "fr" ? "gratuit" : "gratis" },
            ].map((s) => (
              <div key={s.n} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-white">{s.n}</p>
                <p className="text-xs text-blue-300/60">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Card */}
      <div className="max-w-lg mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-5 text-center">
            <p className="text-white font-bold text-lg">
              {lang === "fr" ? "❤️ Faire un don" : lang === "ht" ? "❤️ Fè yon don" : "❤️ Make a donation"}
            </p>
          </div>

          <div className="p-8">
            {/* Method selector */}
            <div className="flex gap-2 mb-6 bg-stone-100 rounded-2xl p-1">
              <button
                onClick={() => setMethod("stripe")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${method === "stripe" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
              >
                💳 {lang === "fr" ? "Carte bancaire" : lang === "ht" ? "Kat labank" : "Bank card"}
              </button>
              <button
                onClick={() => setMethod("paypal")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${method === "paypal" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
              >
                🔵 PayPal
              </button>
            </div>

            {/* Amount selector */}
            {!customMode ? (
              <>
                <p className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-3">
                  {lang === "fr" ? "Choisissez un montant" : lang === "ht" ? "Chwazi yon montan" : "Choose an amount"}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {amounts.map((a) => (
                    <button
                      key={a}
                      onClick={() => setSelected(a)}
                      className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                        selected === a
                          ? "bg-amber-50 border-amber-400 text-amber-700 shadow-sm"
                          : "border-stone-200 text-stone-600 hover:border-amber-300 hover:bg-amber-50/50"
                      }`}
                    >
                      ${a}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setCustomMode(true); setSelected(null); }}
                  className="w-full py-2 text-sm text-stone-400 hover:text-amber-600 transition-colors underline underline-offset-2 mb-5"
                >
                  {lang === "fr" ? "Entrer un montant personnalisé" : lang === "ht" ? "Antre yon montan pèsonalize" : "Enter a custom amount"}
                </button>
              </>
            ) : (
              <div className="mb-5">
                <p className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-3">
                  {lang === "fr" ? "Montant personnalisé (USD)" : "Custom amount (USD)"}
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full border-2 border-stone-200 rounded-xl pl-8 pr-4 py-3 font-bold text-stone-800 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => { setCustomMode(false); setSelected(25); setCustomAmount(""); }}
                    className="px-4 py-3 text-stone-400 hover:text-stone-600 border-2 border-stone-200 rounded-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              disabled={loading !== null || (!selected && !parseFloat(customAmount))}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/30"
            >
              {loading !== null ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {lang === "fr" ? "Traitement..." : "Processing..."}
                </span>
              ) : (
                <>
                  {method === "stripe" ? "💳" : "🔵"}{" "}
                  {lang === "fr"
                    ? `Donner ${customMode && customAmount ? `$${customAmount}` : selected ? `$${selected}` : ""} USD`
                    : `Give ${customMode && customAmount ? `$${customAmount}` : selected ? `$${selected}` : ""} USD`}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-xs text-stone-400">🔒 SSL sécurisé</span>
              <span className="text-stone-200">·</span>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 opacity-40" />
              <span className="text-stone-200">·</span>
              <span className="text-xs text-stone-400 font-bold">PayPal</span>
            </div>
          </div>

          {/* Where it goes */}
          <div className="border-t border-stone-100 px-8 py-5 bg-stone-50">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-3 text-center">
              {lang === "fr" ? "Votre don sert à" : lang === "ht" ? "Don ou sèvi pou" : "Your donation serves"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "🖥️", t: lang === "fr" ? "Hébergement du site" : "Site hosting" },
                { icon: "📖", t: lang === "fr" ? "Contenu biblique" : "Biblical content" },
                { icon: "🤖", t: lang === "fr" ? "Outils IA bibliques" : "AI Bible tools" },
                { icon: "🌍", t: lang === "fr" ? "Expansion mondiale" : "Global expansion" },
              ].map((i) => (
                <div key={i.t} className="flex items-center gap-2 text-xs text-stone-500">
                  <span>{i.icon}</span><span>{i.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bible verse */}
        <p className="text-center text-blue-300/40 text-sm italic mt-8">
          &ldquo;Que chacun donne comme il l&apos;a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie.&rdquo;
          <span className="block text-blue-300/60 font-semibold not-italic mt-1">— 2 Corinthiens 9:7</span>
        </p>

        <div className="text-center mt-6">
          <Link href="/" className="text-blue-400/60 text-sm hover:text-blue-300 transition-colors">
            ← {lang === "fr" ? "Retour à l'accueil" : lang === "ht" ? "Tounen akèy" : "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
