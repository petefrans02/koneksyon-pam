"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";

export default function DonationPage() {
  const { lang } = useLang();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
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
        <h2 className="text-xl font-bold text-stone-900 mb-4 text-center">
          {lang === "fr" ? "Faire un don" : lang === "ht" ? "Fè yon don" : "Make a donation"}
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[5, 10, 25].map((amount) => (
            <a
              key={amount}
              href={`https://www.paypal.com/donate?business=contact@koneksyonpam.com&amount=${amount}&currency_code=USD`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl py-4 text-center hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <p className="text-2xl font-bold text-blue-600">${amount}</p>
              <p className="text-xs text-stone-400">USD</p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[50, 100, 200].map((amount) => (
            <a
              key={amount}
              href={`https://www.paypal.com/donate?business=contact@koneksyonpam.com&amount=${amount}&currency_code=USD`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl py-4 text-center hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <p className="text-2xl font-bold text-blue-600">${amount}</p>
              <p className="text-xs text-stone-400">USD</p>
            </a>
          ))}
        </div>

        <a
          href="https://www.paypal.com/donate?business=contact@koneksyonpam.com&currency_code=USD"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold text-center hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
        >
          {lang === "fr" ? "💝 Faire un don personnalisé" : lang === "ht" ? "💝 Fè yon don pèsonalize" : "💝 Make a custom donation"}
        </a>

        <p className="text-center text-xs text-stone-400 mt-4">
          {lang === "fr" ? "Paiement sécurisé via PayPal" : "Secure payment via PayPal"}
        </p>
      </div>

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
