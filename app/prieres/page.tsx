"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { useCountry } from "@/lib/useCountry";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Prayer {
  id: string;
  name: string;
  text: string;
  pray_count: number;
  country: string;
  created_at: string;
  prayed: boolean;
}

function timeAgo(date: string, lang: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return lang === "fr" ? "maintenant" : lang === "ht" ? "kounye a" : "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}${lang === "fr" ? "j" : "d"}`;
}

export default function PrieresPage() {
  const { lang } = useLang();
  const userCountry = useCountry();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => setUser(data.user));
    loadPrayers();
  }, []);

  async function loadPrayers() {
    const res = await fetch("/api/prayers");
    const data = await res.json();
    setPrayers((data.prayers || []).map((p: Prayer) => ({ ...p, prayed: false })));
    setLoading(false);
  }

  async function handlePray(id: string) {
    setPrayers(prayers.map((p) =>
      p.id === id ? { ...p, pray_count: p.prayed ? p.pray_count - 1 : p.pray_count + 1, prayed: !p.prayed } : p
    ));
    await fetch("/api/prayers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch("/api/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() || t("anonymous", lang), text: text.trim(), country: userCountry.flag }),
    });
    const data = await res.json();
    if (data.prayer) {
      setPrayers([{ ...data.prayer, prayed: false }, ...prayers]);
    }
    setName("");
    setText("");
    setShowForm(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-bold">{prayers.reduce((a, p) => a + p.pray_count, 0).toLocaleString()}</p>
          <p className="text-blue-100 text-sm">{t("peoplePrayed", lang)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{userCountry.flag} {userCountry.name}</p>
          <p className="text-blue-100 text-sm">{lang === "fr" ? "Votre position" : lang === "ht" ? "Pozisyon ou" : "Your location"}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">{t("prayers", lang)}</h1>
        <button
          onClick={() => { if (!user) { supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/prieres` } }); return; } setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-500 transition-colors text-sm"
        >
          + {t("submitPrayer", lang)}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-stone-900 mb-4">{t("submitPrayer", lang)}</h3>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("yourName", lang)} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-blue-500 focus:outline-none" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("yourPrayer", lang)} rows={4} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-blue-500 focus:outline-none resize-none" />
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-500 transition-colors text-sm">{t("submit", lang)}</button>
            <span className="text-sm text-stone-400">{userCountry.flag} {lang === "fr" ? "depuis" : lang === "ht" ? "depi" : "from"} {userCountry.name}</span>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : prayers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🙏</p>
          <p className="text-stone-500">{lang === "fr" ? "Aucune demande de prière pour le moment. Soyez le premier !" : "No prayer requests yet. Be the first!"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prayers.map((prayer) => (
            <div key={prayer.id} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{prayer.country}</span>
                  <span className="font-semibold text-stone-900">{prayer.name}</span>
                  <span className="text-stone-400 text-xs">· {timeAgo(prayer.created_at, lang)}</span>
                </div>
              </div>
              <p className="text-stone-700 leading-relaxed mb-4">{prayer.text}</p>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => handlePray(prayer.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    prayer.prayed ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {prayer.prayed ? `✓ ${t("amen", lang)} ${userCountry.flag}` : t("prayerButton", lang)}
                </button>
                <span className="text-sm text-stone-500">
                  <strong className="text-blue-500">{prayer.pray_count}</strong> {t("peoplePrayed", lang)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
