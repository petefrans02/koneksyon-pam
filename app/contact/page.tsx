"use client";

import { useLang } from "@/lib/LangContext";
import { useState } from "react";

export default function ContactPage() {
  const { lang } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Erreur d'envoi");
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError(lang === "fr" ? "Erreur lors de l'envoi. Réessayez." : lang === "ht" ? "Erè. Eseye ankò." : "Error sending. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1 border border-blue-400/20">
            <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "Contactez-nous" : lang === "ht" ? "Kontakte nou" : "Contact us"}
        </h1>
        <p className="text-stone-500 mt-2">
          {lang === "fr" ? "Une question ? Une suggestion ? Écrivez-nous" : lang === "ht" ? "Yon kesyon ? Yon sijesyon ? Ekri nou" : "A question? A suggestion? Write to us"}
        </p>
      </div>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <span className="text-5xl block mb-4">✓</span>
          <h2 className="text-xl font-bold text-green-800 mb-2">
            {lang === "fr" ? "Message envoyé !" : lang === "ht" ? "Mesaj voye !" : "Message sent!"}
          </h2>
          <p className="text-green-600">
            {lang === "fr" ? "Nous vous répondrons bientôt. Que Dieu vous bénisse." : lang === "ht" ? "N ap reponn ou byento. Bondye beni ou." : "We will respond soon. God bless you."}
          </p>
          <button onClick={() => setSent(false)} className="mt-4 text-blue-500 hover:underline text-sm">
            {lang === "fr" ? "Envoyer un autre message" : lang === "ht" ? "Voye yon lòt mesaj" : "Send another message"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {lang === "fr" ? "Nom" : lang === "ht" ? "Non" : "Name"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {lang === "fr" ? "Message" : lang === "ht" ? "Mesaj" : "Message"}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white transition-colors resize-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:from-blue-400 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60"
            >
              {sending
                ? (lang === "fr" ? "Envoi..." : lang === "ht" ? "Ap voye..." : "Sending...")
                : (lang === "fr" ? "Envoyer le message" : lang === "ht" ? "Voye mesaj la" : "Send message")}
            </button>
          </div>
        </form>
      )}

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "📧", title: "Email", value: "koneksyonpam@gmail.com" },
          { icon: "📺", title: "YouTube", value: "KONEKSYON PAM", href: "https://www.youtube.com/channel/UCl01tzkV_QzhPvZ-pf9Ey-g" },
          { icon: "🌍", title: lang === "fr" ? "Communauté" : "Community", value: lang === "fr" ? "12+ pays" : "12+ countries" },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-blue-100 p-4 text-center">
            <span className="text-2xl block mb-2">{item.icon}</span>
            <h3 className="font-semibold text-stone-900 text-sm">{item.title}</h3>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">{item.value}</a>
            ) : (
              <p className="text-stone-500 text-xs">{item.value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
