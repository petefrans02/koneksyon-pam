"use client";
import RequireAuth from "@/app/components/RequireAuth";

import { useLang } from "@/lib/LangContext";
import { t, type Lang } from "@/lib/translations";
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
  featured?: boolean;
}

const GLOBAL_PRAYERS: Prayer[] = [
  { id: "g1", name: "Marie-Claire", country: "🇭🇹", text: "Seigneur, guéris ma mère qui souffre depuis des mois. Tu es le Dieu qui fait des miracles. Nous croyons en Ta puissance.", pray_count: 2847, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), prayed: false, featured: true },
  { id: "g2", name: "Pastor David", country: "🇧🇷", text: "Lord Jesus, pour your Holy Spirit on our church. We need revival! Let the fire of God fall on Brazil and all nations. Amen!", pray_count: 5312, created_at: new Date(Date.now() - 86400000 * 5).toISOString(), prayed: false, featured: true },
  { id: "g3", name: "Émilie", country: "🇫🇷", text: "Père céleste, je te demande la paix pour ma famille qui traverse une période difficile. Tu es notre refuge et notre force. Merci Seigneur.", pray_count: 1934, created_at: new Date(Date.now() - 86400000 * 1).toISOString(), prayed: false, featured: true },
  { id: "g4", name: "Josué", country: "🇨🇩", text: "Bon Dieu, protège toute la famille chrétienne en République Démocratique du Congo. Que Ta paix règne dans notre pays. Nous T'adorons.", pray_count: 3721, created_at: new Date(Date.now() - 86400000 * 3).toISOString(), prayed: false, featured: true },
  { id: "g5", name: "Grace", country: "🇳🇬", text: "Father God, I pray for divine provision for my family. You said You will supply all our needs according to Your riches in glory. I trust You Lord.", pray_count: 4156, created_at: new Date(Date.now() - 86400000 * 1).toISOString(), prayed: false, featured: true },
  { id: "g6", name: "Jean-Baptiste", country: "🇨🇦", text: "Seigneur Jésus, je Te demande de toucher le cœur de mon fils qui s'est éloigné de la foi. Ramène-le à Toi. Tu es le Bon Berger.", pray_count: 2103, created_at: new Date(Date.now() - 86400000 * 4).toISOString(), prayed: false, featured: true },
  { id: "g7", name: "Ana", country: "🇲🇽", text: "Dios mío, sana mi cuerpo y restaura mi salud. Tú eres mi médico celestial. Gracias por Tu amor y misericordia infinita. Amén.", pray_count: 1876, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), prayed: false },
  { id: "g8", name: "Claudette", country: "🇭🇹", text: "Bondye bon, ede pèp Ayiti a. Rele nan nou. Fè lapriyè nou monte devan ou. Nou bezwen ou plis pase tout bagay.", pray_count: 6234, created_at: new Date(Date.now() - 86400000 * 6).toISOString(), prayed: false, featured: true },
  { id: "g9", name: "Samuel", country: "🇰🇪", text: "Lord God, protect our missionaries in Africa. Keep them safe and let their work bear fruit for Your Kingdom. Give them strength and courage.", pray_count: 2987, created_at: new Date(Date.now() - 86400000 * 3).toISOString(), prayed: false },
  { id: "g10", name: "Isabelle", country: "🇧🇪", text: "Seigneur, guéris ceux qui souffrent de dépression et d'anxiété. Rappelle-leur que Tu es avec eux. Tu ne nous abandonnes jamais.", pray_count: 4521, created_at: new Date(Date.now() - 86400000 * 1).toISOString(), prayed: false, featured: true },
];

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
  const [globalPrayers, setGlobalPrayers] = useState<Prayer[]>(GLOBAL_PRAYERS);
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
      setGlobalPrayers(globalPrayers.map((p) =>
        p.id === id ? { ...p, pray_count: p.prayed ? p.pray_count - 1 : p.pray_count + 1, prayed: !p.prayed } : p
      ));
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

  const totalPrays = [...globalPrayers, ...realPrayers].reduce((a, p) => a + p.pray_count, 0);
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

      {/* Global Prayers */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {displayedGlobal
            .sort((a, b) => b.pray_count - a.pray_count)
            .map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} lang={lang} userFlag={userCountry.flag} isGlobal={true} onPray={handlePray} />
            ))}
        </div>
      )}
    </div>
    </RequireAuth>
  );
}

function PrayerCard({ prayer, lang, userFlag, isGlobal, onPray }: {
  prayer: Prayer; lang: Lang; userFlag: string; isGlobal: boolean; onPray: (id: string, g: boolean) => void;
}) {
  const hot = prayer.pray_count > 3000;
  return (
    <div className={`bg-white rounded-2xl border ${hot ? "border-orange-200 shadow-orange-50" : "border-stone-200"} p-5 hover:shadow-md transition-all`}>
      {hot && (
        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full mb-3">
          🔥 {lang === "fr" ? "Très prié" : lang === "ht" ? "Anpil lapriyè" : "Highly prayed"}
        </span>
      )}
      {prayer.featured && !hot && (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full mb-3">
          ⭐ {lang === "fr" ? "En vedette" : lang === "ht" ? "Prezante" : "Featured"}
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
      <p className="text-stone-700 leading-relaxed mb-4 text-sm italic">"{prayer.text}"</p>
      <div className="flex items-center justify-between">
        <button
          onClick={() => onPray(prayer.id, isGlobal)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
            prayer.prayed
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
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
