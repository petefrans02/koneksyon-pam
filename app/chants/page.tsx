"use client";

import { useLang } from "@/lib/LangContext";
import { useState } from "react";
import Link from "next/link";

const chants = [
  { num: 1, title: "Bon Dieu tout puissant" },
  { num: 2, title: "Grand Dieu, nous te bénissons" },
  { num: 7, title: "O Dieu, ta fidélité" },
  { num: 10, title: "Ô jour heureux" },
  { num: 14, title: "Saint, Saint, Saint" },
  { num: 17, title: "À toi la gloire" },
  { num: 25, title: "Quel ami fidèle et tendre" },
  { num: 31, title: "Vers toi mon Dieu" },
  { num: 42, title: "Plus près de toi mon Dieu" },
  { num: 50, title: "Debout, sainte cohorte" },
  { num: 53, title: "Reste avec moi" },
  { num: 62, title: "Jésus, je t'aime" },
  { num: 70, title: "Comme un cerf altéré" },
  { num: 80, title: "Je suis à toi" },
  { num: 85, title: "En toi j'ai mis" },
  { num: 91, title: "Christ est ma vie" },
  { num: 100, title: "Ô Jésus, ta croix" },
  { num: 110, title: "Mon Dieu, plus près de toi" },
  { num: 118, title: "Toi qui disposes" },
  { num: 120, title: "Ô tête ensanglantée" },
  { num: 130, title: "Béni soit le lien" },
  { num: 134, title: "La voix du Seigneur m'appelle" },
  { num: 150, title: "Oh! que ta main paternelle" },
  { num: 162, title: "Brille dans nos cœurs" },
  { num: 170, title: "Jésus est au milieu de nous" },
  { num: 185, title: "Quand je contemple" },
  { num: 200, title: "Consacre-moi" },
  { num: 215, title: "Tel que je suis" },
  { num: 230, title: "Oui, je viens à toi" },
  { num: 250, title: "Ô Dieu de grâce" },
  { num: 280, title: "Jour de repos" },
  { num: 300, title: "La voix du Seigneur" },
  { num: 320, title: "Au sang de l'Agneau" },
  { num: 340, title: "Brillez, étoiles" },
  { num: 350, title: "Seigneur, dirige" },
  { num: 370, title: "Chantons en chœur" },
  { num: 400, title: "Seigneur, attire" },
  { num: 420, title: "Prends ma vie" },
  { num: 450, title: "Le ciel est mon héritage" },
  { num: 500, title: "En avant" },
  { num: 550, title: "Sauvé par grâce" },
  { num: 600, title: "Jésus est notre ami" },
  { num: 650, title: "Dieu tout-puissant" },
  { num: 700, title: "Alléluia, louange à Dieu" },
];

export default function ChantsPage() {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [selectedChant, setSelectedChant] = useState<{ num: number; title: string } | null>(null);
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadLyrics(chant: { num: number; title: string }) {
    if (selectedChant?.num === chant.num) { setSelectedChant(null); setLyrics(""); return; }
    setSelectedChant(chant);
    setLoading(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: `Donne-moi les paroles complètes du Chant d'Espérance numéro ${chant.num} : "${chant.title}". Écris toutes les strophes et le refrain. Ne mets pas de guillemets. Écris les paroles directement.`,
        lang: "fr",
      }),
    });
    const data = await res.json();
    setLyrics(data.answer || "Paroles non disponibles");
    setLoading(false);
  }

  const filtered = search
    ? chants.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || String(c.num).includes(search))
    : chants;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/" className="text-blue-500 text-sm hover:underline mb-6 block">← {lang === "fr" ? "Accueil" : "Home"}</Link>

      <div className="text-center mb-8">
        <img src="https://cdn-icons-png.flaticon.com/512/2936/2936690.png" alt="" className="w-14 h-14 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "Chants d'Espérance" : lang === "ht" ? "Chan Desperans" : "Songs of Hope"}
        </h1>
        <p className="text-stone-500 mt-2">
          {lang === "fr" ? "Le cantique le plus aimé de l'Église haïtienne" : "The most beloved hymnal of the Haitian Church"}
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "fr" ? "🔍 Chercher par numéro ou titre..." : "🔍 Search by number or title..."}
          className="w-full border border-blue-200 rounded-xl px-5 py-3 text-sm bg-white focus:border-blue-500 focus:outline-none shadow-sm"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((chant) => (
          <div key={chant.num}>
            <button
              onClick={() => loadLyrics(chant)}
              className={`w-full flex items-center gap-4 bg-white rounded-xl border p-4 hover:shadow-md transition-all text-left ${
                selectedChant?.num === chant.num ? "border-blue-400 shadow-md" : "border-blue-100"
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                {chant.num}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900">{chant.title}</h3>
                <p className="text-xs text-stone-400">Chant d&apos;Espérance #{chant.num}</p>
              </div>
              <span className="text-blue-500 text-sm shrink-0">
                {selectedChant?.num === chant.num ? "✕" : "📖"}
              </span>
            </button>

            {selectedChant?.num === chant.num && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-1 mb-2">
                {loading ? (
                  <div className="flex items-center gap-3 text-blue-500">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Chargement des paroles...</span>
                  </div>
                ) : (
                  <div className="text-stone-700 leading-relaxed whitespace-pre-line text-[15px]">
                    {lyrics.replace(/\*\*(.*?)\*\*/g, "$1").replace(/["«»]/g, "")}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🎵</p>
          <p className="text-stone-500">{lang === "fr" ? "Aucun chant trouvé" : "No hymn found"}</p>
        </div>
      )}
    </div>
  );
}
