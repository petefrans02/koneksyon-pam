"use client";
import RequireAuth from "@/app/components/RequireAuth";

import { useLang } from "@/lib/LangContext";
import { t, type Lang } from "@/lib/translations";
import { useCountry } from "@/lib/useCountry";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DEMO_PRAYERS, PRAYER_CATEGORIES, type DemoPrayer } from "@/lib/demo-data";

interface Prayer {
  id: string;
  name: string;
  text: string;
  pray_count: number;
  country: string;
  created_at: string;
  prayed: boolean;
  featured?: boolean;
}

const LIVE_STATS = [
  { flag: "🇭🇹", country: "Haïti", count: 12847 },
  { flag: "🇫🇷", country: "France", count: 8231 },
  { flag: "🇧🇷", country: "Brésil", count: 6750 },
  { flag: "🇺🇸", country: "USA", count: 9413 },
  { flag: "🇨🇩", country: "Congo", count: 5102 },
  { flag: "🇨🇦", country: "Canada", count: 4891 },
  { flag: "🇳🇬", country: "Nigeria", count: 7634 },
  { flag: "🇨🇲", country: "Cameroun", count: 3215 },
];

function timeAgo(date: string, lang: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return lang === "fr" ? "maintenant" : lang === "ht" ? "kounye a" : "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}${lang === "fr" ? "j" : lang === "ht" ? "j" : "d"}`;
}

export default function PrieresPage() {
  const { lang } = useLang();
  const userCountry = useCountry();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [realPrayers, setRealPrayers] = useState<Prayer[]>([]);
  const [globalPrayers, setGlobalPrayers] = useState<DemoPrayer[]>(DEMO_PRAYERS);
  const [demoPrayCounts, setDemoPrayCounts] = useState<Record<string, number>>(
    Object.fromEntries(DEMO_PRAYERS.map(p => [p.id, p.pray_count]))
  );
  const [demoPrayed, setDemoPrayed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);
  const [statIdx, setStatIdx] = useState(0);
  const [filter, setFilter] = useState<"all" | "featured">("all");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => setUser(data.user));
    loadPrayers();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setStatIdx((i) => (i + 1) % LIVE_STATS.length), 2500);
    return () => clearInterval(timer);
  }, []);

  async function loadPrayers() {
    try {
      const res = await fetch("/api/prayers");
      const data = await res.json();
      setRealPrayers((data.prayers || []).map((p: Prayer) => ({ ...p, prayed: false })));
    } catch {
      setRealPrayers([]);
    }
    setLoading(false);
  }

  async function handlePray(id: string, isGlobal: boolean) {
    if (isGlobal) {
      const wasPrayed = demoPrayed.has(id);
      setDemoPrayed(prev => { const s = new Set(prev); wasPrayed ? s.delete(id) : s.add(id); return s; });
      setDemoPrayCounts(prev => ({ ...prev, [id]: prev[id] + (wasPrayed ? -1 : 1) }));
      return;
    }
    setRealPrayers(realPrayers.map((p) =>
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
      setRealPrayers([{ ...data.prayer, prayed: false }, ...realPrayers]);
    }
    setName("");
    setText("");
    setShowForm(false);
  }

  const totalPrays = DEMO_PRAYERS.reduce((a, p) => a + p.pray_count, 0) + realPrayers.reduce((a, p) => a + p.pray_count, 0);
  const displayedGlobal = filter === "featured" ? globalPrayers.filter((p) => p.featured) : globalPrayers;
  const stat = LIVE_STATS[statIdx];

  return (
    <RequireAuth>
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2044] to-[#1a1040] text-white rounded-3xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]" />
        <div className="relative z-10">
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">✦ {lang === "fr" ? "Mur de prière mondial" : lang === "ht" ? "Mi lapriyè mondyal" : "Global prayer wall"}</p>
          <div className="flex items-end gap-4 mb-4">
            <div>
              <p className="text-4xl font-black text-white">{totalPrays.toLocaleString()}</p>
              <p className="text-blue-200/60 text-sm">{lang === "fr" ? "prières offertes" : lang === "ht" ? "lapriyè ofri" : "prayers offered"}</p>
            </div>
            <div className="flex-1 text-right">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                <span className="text-2xl">{stat.flag}</span>
                <div>
                  <p className="font-bold text-sm">{stat.country}</p>
                  <p className="text-xs text-blue-200/60">{stat.count.toLocaleString()} {lang === "fr" ? "prières" : lang === "ht" ? "lapriyè" : "prayers"}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {LIVE_STATS.map((s) => (
              <span key={s.country} className="text-xl" title={s.country}>{s.flag}</span>
            ))}
            <span className="text-blue-300/60 text-xs self-center">+{lang === "fr" ? "12 pays" : lang === "ht" ? "12 peyi" : "12 nations"}</span>
          </div>
        </div>
      </div>

      {/* Header + Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">🙏 {t("prayers", lang)}</h1>
          <p className="text-stone-400 text-sm mt-0.5">{lang === "fr" ? "Priez avec des croyants du monde entier" : lang === "ht" ? "Lapriyè ak frè ak sè nan mond antye" : "Pray with believers worldwide"}</p>
        </div>
        <button
          onClick={() => { if (!user) { supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/prieres` } }); return; } setShowForm(!showForm); }}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity text-sm shadow-lg shadow-blue-500/20"
        >
          + {lang === "fr" ? "Soumettre" : lang === "ht" ? "Soumèt" : "Submit"}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === "all" ? "bg-blue-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
          {lang === "fr" ? "Toutes les prières" : lang === "ht" ? "Tout lapriyè" : "All prayers"}
        </button>
        <button onClick={() => setFilter("featured")} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === "featured" ? "bg-blue-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
          ⭐ {lang === "fr" ? "Les plus priées" : lang === "ht" ? "Plis lapriyè" : "Most prayed"}
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-4">🙏 {t("submitPrayer", lang)}</h3>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("yourName", lang)} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-blue-500 focus:outline-none" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("yourPrayer", lang)} rows={4} required className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-blue-500 focus:outline-none resize-none" />
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-500 transition-colors text-sm">{t("submit", lang)}</button>
            <span className="text-sm text-stone-400">{userCountry.flag} {userCountry.name}</span>
            <button type="button" onClick={() => setShowForm(false)} className="ml-auto text-stone-400 text-sm hover:text-stone-600">✕</button>
          </div>
        </form>
      )}

      {/* My own new prayers */}
      {realPrayers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-3">{lang === "fr" ? "Nouvelles demandes" : lang === "ht" ? "Nouvo demann" : "New requests"}</h2>
          <div className="space-y-4">
            {realPrayers.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} lang={lang} userFlag={userCountry.flag} isGlobal={false} onPray={handlePray} />
            ))}
          </div>
          <hr className="my-6 border-stone-200" />
        </div>
      )}

      {/* Global (Demo) Prayers */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {displayedGlobal
            .sort((a, b) => (demoPrayCounts[b.id] ?? b.pray_count) - (demoPrayCounts[a.id] ?? a.pray_count))
            .map((prayer) => (
              <DemoPrayerCard
                key={prayer.id}
                prayer={prayer}
                lang={lang as Lang}
                userFlag={userCountry.flag}
                prayed={demoPrayed.has(prayer.id)}
                prayCount={demoPrayCounts[prayer.id] ?? prayer.pray_count}
                onPray={() => handlePray(prayer.id, true)}
              />
            ))}
        </div>
      )}
    </div>
    </RequireAuth>
  );
}

function DemoPrayerCard({ prayer, lang, userFlag, prayed, prayCount, onPray }: {
  prayer: DemoPrayer; lang: Lang; userFlag: string; prayed: boolean; prayCount: number; onPray: () => void;
}) {
  const hot = prayCount > 3000;
  const cat = PRAYER_CATEGORIES[prayer.category];
  return (
    <div className={`bg-white rounded-2xl border ${hot ? "border-orange-200" : "border-stone-200"} p-5 hover:shadow-md transition-all`}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {hot && (
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
            🔥 {lang === "fr" ? "Très prié" : lang === "ht" ? "Anpil lapriyè" : "Highly prayed"}
          </span>
        )}
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
          {cat[lang as Lang]}
        </span>
      </div>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-xl shrink-0">
          {prayer.flag}
        </div>
        <div>
          <p className="font-bold text-stone-900 text-sm">{prayer.name}</p>
          <p className="text-stone-400 text-xs">{prayer.countryName[lang as Lang]} · {timeAgo(prayer.created_at, lang)}</p>
        </div>
      </div>
      <p className="text-stone-700 leading-relaxed mb-4 text-sm italic">&ldquo;{prayer.text[lang as Lang]}&rdquo;</p>
      <div className="flex items-center justify-between">
        <button
          onClick={onPray}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
            prayed ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          🙏 {prayed ? `Amen ${userFlag}` : t("prayerButton", lang)}
        </button>
        <span className="text-sm text-stone-500">
          <strong className="text-blue-500 text-base">{prayCount.toLocaleString()}</strong>
          <span className="text-xs ml-1">{lang === "fr" ? "personnes ont prié" : lang === "ht" ? "moun priye" : "prayed"}</span>
        </span>
      </div>
    </div>
  );
}

function PrayerCard({ prayer, lang, userFlag, isGlobal, onPray }: {
  prayer: Prayer; lang: Lang; userFlag: string; isGlobal: boolean; onPray: (id: string, g: boolean) => void;
}) {
  const hot = prayer.pray_count > 3000;
  return (
    <div className={`bg-white rounded-2xl border ${hot ? "border-orange-200" : "border-stone-200"} p-5 hover:shadow-md transition-all`}>
      {hot && (
        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full mb-3">
          🔥 {lang === "fr" ? "Très prié" : lang === "ht" ? "Anpil lapriyè" : "Highly prayed"}
        </span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-xl shrink-0">
          {prayer.country}
        </div>
        <div>
          <p className="font-bold text-stone-900 text-sm">{prayer.name}</p>
          <p className="text-stone-400 text-xs">· {timeAgo(prayer.created_at, lang)}</p>
        </div>
      </div>
      <p className="text-stone-700 leading-relaxed mb-4 text-sm italic">&ldquo;{prayer.text}&rdquo;</p>
      <div className="flex items-center justify-between">
        <button
          onClick={() => onPray(prayer.id, isGlobal)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
            prayer.prayed ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          🙏 {prayer.prayed ? `Amen ${userFlag}` : t("prayerButton", lang)}
        </button>
        <span className="text-sm text-stone-500">
          <strong className="text-blue-500 text-base">{prayer.pray_count.toLocaleString()}</strong>
          <span className="text-xs ml-1">{lang === "fr" ? "personnes ont prié" : lang === "ht" ? "moun priye" : "prayed"}</span>
        </span>
      </div>
    </div>
  );
}
