"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { useCountry } from "@/lib/useCountry";
import { useState } from "react";

interface Prayer {
  id: number;
  name: string;
  text: string;
  count: number;
  time: string;
  country: string;
  prayed: boolean;
  prayedFlags: string[];
}

export default function PrieresPage() {
  const { lang } = useLang();
  const userCountry = useCountry();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [prayers, setPrayers] = useState<Prayer[]>([
    { id: 1, name: "Marie L.", text: "Priez pour ma famille en Haïti. Nous traversons des moments très difficiles. Que Dieu nous protège et nous guide.", count: 247, time: "2h", country: "🇭🇹", prayed: false, prayedFlags: ["🇺🇸", "🇫🇷", "🇨🇦", "🇭🇹", "🇧🇪", "🇬🇧", "🇩🇴", "🇧🇷"] },
    { id: 2, name: "Jean Pierre", text: "Mon fils est malade depuis 3 semaines. Les médecins ne trouvent pas ce qu'il a. Je vous demande de prier pour sa guérison complète au nom de Jésus.", count: 523, time: "5h", country: "🇺🇸", prayed: false, prayedFlags: ["🇭🇹", "🇺🇸", "🇫🇷", "🇨🇦", "🇨🇲", "🇩🇴", "🇧🇷", "🇬🇧", "🇧🇪", "🇨🇭"] },
    { id: 3, name: "Anonyme", text: "Je cherche un emploi depuis 6 mois. Je suis découragé mais je garde la foi. Priez pour que Dieu ouvre une porte.", count: 189, time: "8h", country: "🇨🇦", prayed: false, prayedFlags: ["🇺🇸", "🇭🇹", "🇫🇷", "🇨🇦", "🇩🇴"] },
    { id: 4, name: "Esther M.", text: "Mon mariage est en difficulté. Priez pour la restauration de notre couple et que l'amour de Dieu règne dans notre foyer.", count: 412, time: "12h", country: "🇫🇷", prayed: false, prayedFlags: ["🇫🇷", "🇭🇹", "🇺🇸", "🇨🇦", "🇧🇪", "🇨🇭", "🇬🇧"] },
    { id: 5, name: "Pastor David", text: "Notre église a besoin d'un nouveau bâtiment. Priez pour que Dieu pourvoie aux finances nécessaires pour ce projet.", count: 67, time: "1j", country: "🇩🇴", prayed: false, prayedFlags: ["🇩🇴", "🇺🇸", "🇭🇹"] },
  ]);

  function handlePray(id: number) {
    setPrayers(prayers.map((p) => {
      if (p.id !== id) return p;
      const newPrayed = !p.prayed;
      const newFlags = newPrayed
        ? [...p.prayedFlags.filter((f) => f !== userCountry.flag), userCountry.flag]
        : p.prayedFlags.filter((f) => f !== userCountry.flag);
      return { ...p, count: newPrayed ? p.count + 1 : p.count - 1, prayed: newPrayed, prayedFlags: newFlags };
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setPrayers([{
      id: Date.now(),
      name: name.trim() || t("anonymous", lang),
      text: text.trim(),
      count: 0,
      time: lang === "fr" ? "maintenant" : lang === "ht" ? "kounye a" : "now",
      country: userCountry.flag,
      prayed: false,
      prayedFlags: [],
    }, ...prayers]);
    setName("");
    setText("");
    setShowForm(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{prayers.reduce((a, p) => a + p.count, 0).toLocaleString()}</p>
          <p className="text-amber-100 text-sm">{t("peoplePrayed", lang)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{userCountry.flag} {userCountry.name}</p>
          <p className="text-amber-100 text-sm">{lang === "fr" ? "Votre position" : lang === "ht" ? "Pozisyon ou" : "Your location"}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">{t("prayers", lang)}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-amber-500 transition-colors text-sm"
        >
          + {t("submitPrayer", lang)}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-stone-900 mb-4">{t("submitPrayer", lang)}</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("yourName", lang)}
            className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-amber-500 focus:outline-none"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("yourPrayer", lang)}
            rows={4}
            className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-amber-500 focus:outline-none resize-none"
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-amber-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-amber-500 transition-colors text-sm">
              {t("submit", lang)}
            </button>
            <span className="text-sm text-stone-400">{userCountry.flag} {lang === "fr" ? "depuis" : lang === "ht" ? "depi" : "from"} {userCountry.name}</span>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {prayers.map((prayer) => (
          <div key={prayer.id} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{prayer.country}</span>
                <span className="font-semibold text-stone-900">{prayer.name}</span>
                <span className="text-stone-400 text-xs">· {prayer.time}</span>
              </div>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">{prayer.text}</p>

            {prayer.prayedFlags.length > 0 && (
              <div className="flex items-center gap-1 mb-3 flex-wrap">
                <span className="text-xs text-stone-400 mr-1">
                  {lang === "fr" ? "Prié depuis :" : lang === "ht" ? "Priye depi :" : "Prayed from:"}
                </span>
                {prayer.prayedFlags.map((flag, i) => (
                  <span key={i} className="text-sm">{flag}</span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePray(prayer.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  prayer.prayed
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-200"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                {prayer.prayed ? `✓ ${t("amen", lang)} ${userCountry.flag}` : t("prayerButton", lang)}
              </button>
              <span className="text-sm text-stone-500">
                <strong className="text-amber-600">{prayer.count}</strong> {t("peoplePrayed", lang)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
