"use client";

import { useLang } from "@/lib/LangContext";
import { useEffect, useState } from "react";

interface Video { id: string; title: string; published: string; }

export default function LouangePage() {
  const { lang } = useLang();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/youtube")
      .then((r) => r.json())
      .then(({ videos }) => setVideos(videos || []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        {lang === "fr" ? "Louange & Adoration" : lang === "ht" ? "Lwanj & Adorasyon" : "Praise & Worship"}
      </h1>
      <p className="text-stone-500 mb-8">
        {lang === "fr" ? "Dernières vidéos — KONEKSYON PAM" : lang === "ht" ? "Dènye videyo — KONEKSYON PAM" : "Latest videos — KONEKSYON PAM"}
      </p>

      {/* Subscribe Banner */}
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
          className="ml-auto bg-white text-red-600 px-5 py-2 rounded-full font-bold hover:bg-red-50 transition-colors shrink-0"
        >
          {lang === "fr" ? "S'abonner" : lang === "ht" ? "Abòne" : "Subscribe"}
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-stone-100 rounded-2xl h-52 animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <a
            href="https://www.youtube.com/channel/UCl01tzkV_QzhPvZ-pf9Ey-g"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-400 transition-colors"
          >
            {lang === "fr" ? "Voir toutes les vidéos sur YouTube" : lang === "ht" ? "Gade tout videyo sou YouTube" : "Watch on YouTube"}
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-white text-xl ml-1">▶</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-stone-900 text-sm line-clamp-2">{video.title}</h3>
                <p className="text-xs text-stone-400 mt-1">KONEKSYON PAM</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
