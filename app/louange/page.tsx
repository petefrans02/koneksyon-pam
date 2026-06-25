"use client";

import { useLang } from "@/lib/LangContext";

const videos = [
  { id: "VIDEO_ID_1", title: "Les Psaumes chantés comme jamais ! (Louange, Adoration, Force)" },
  { id: "VIDEO_ID_2", title: "CHANTS DE DÉLIVRANCE AU NOM DE JÉSUS — PRIÈRES PUISSANTES" },
  { id: "VIDEO_ID_3", title: "Les Psaumes en Louange — Chants de Victoire et Promesses de Dieu" },
  { id: "VIDEO_ID_4", title: "PSAUMES EN MUSIQUE — Louange, Adoration & Méditation Biblique" },
  { id: "VIDEO_ID_5", title: "Les Psaumes en Chants — Foi, Louange & Espérance" },
  { id: "VIDEO_ID_6", title: "Psaumes en Louange & Adoration — Versets puissants pour la Paix" },
];

export default function LouangePage() {
  const { lang } = useLang();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        {lang === "fr" ? "Louange & Adoration" : lang === "ht" ? "Lwanj & Adorasyon" : "Praise & Worship"}
      </h1>
      <p className="text-stone-500 mb-8">
        {lang === "fr" ? "Écoute les Psaumes en musique — KONEKSYON PAM" : lang === "ht" ? "Koute Sòm yo nan mizik — KONEKSYON PAM" : "Listen to Psalms in music — KONEKSYON PAM"}
      </p>

      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6 mb-8 flex items-center gap-4">
        <span className="text-4xl">▶</span>
        <div>
          <p className="font-bold text-lg">
            {lang === "fr" ? "Abonne-toi à KONEKSYON PAM" : lang === "ht" ? "Abòne nan KONEKSYON PAM" : "Subscribe to KONEKSYON PAM"}
          </p>
          <p className="text-red-100 text-sm">YouTube — 30K+ {lang === "fr" ? "abonnés" : lang === "ht" ? "abòne" : "subscribers"}</p>
        </div>
        <a
          href="https://www.youtube.com/channel/UCl01tzkV_QzhPvZ-pf9Ey-g?sub_confirmation=1"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto bg-white text-red-600 px-5 py-2 rounded-full font-bold hover:bg-red-50 transition-colors"
        >
          {lang === "fr" ? "S'abonner" : lang === "ht" ? "Abòne" : "Subscribe"}
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((video, i) => (
          <a
            key={i}
            href={`https://www.youtube.com/channel/UCl01tzkV_QzhPvZ-pf9Ey-g`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all group"
          >
            <div className="h-40 bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white text-2xl ml-1">▶</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-stone-900 text-sm line-clamp-2">{video.title}</h3>
              <p className="text-xs text-stone-400 mt-1">KONEKSYON PAM</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
