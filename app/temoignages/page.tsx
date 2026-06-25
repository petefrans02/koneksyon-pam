"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { useState } from "react";

interface Testimony {
  id: number;
  name: string;
  text: string;
  likes: number;
  time: string;
  country: string;
  liked: boolean;
}

export default function TemoignagesPage() {
  const { lang } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [testimonies, setTestimonies] = useState<Testimony[]>([
    {
      id: 1,
      name: "Roseline J.",
      text: "Après 2 ans sans travail, j'ai prié chaque jour avec cette communauté. La semaine dernière, j'ai reçu une offre d'emploi incroyable. Dieu est fidèle ! Merci à tous ceux qui ont prié pour moi. 🙏",
      likes: 342,
      time: "3j",
      country: "🇭🇹",
      liked: false,
    },
    {
      id: 2,
      name: "Marc Antoine",
      text: "Mon père était à l'hôpital dans un état critique. Les médecins avaient perdu espoir. Nous avons prié sans relâche. Aujourd'hui, il est à la maison, guéri ! Gloire à Dieu ! 🙌",
      likes: 891,
      time: "1sem",
      country: "🇺🇸",
      liked: false,
    },
    {
      id: 3,
      name: "Stéphanie P.",
      text: "Après 7 ans de mariage difficile, mon mari et moi avons trouvé la réconciliation à travers la prière. Notre foyer est restauré. Dieu fait des miracles ! ❤️",
      likes: 567,
      time: "2sem",
      country: "🇨🇦",
      liked: false,
    },
    {
      id: 4,
      name: "Pasteur Emmanuel",
      text: "Notre petite église de 20 membres est passée à 150 en un an. Tout a commencé quand nous avons commencé à prier ensemble chaque matin à 5h. La prière change tout. ⛪",
      likes: 234,
      time: "1mois",
      country: "🇫🇷",
      liked: false,
    },
  ]);

  function handleLike(id: number) {
    setTestimonies(testimonies.map((t) =>
      t.id === id ? { ...t, likes: t.liked ? t.likes - 1 : t.likes + 1, liked: !t.liked } : t
    ));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const newTestimony: Testimony = {
      id: Date.now(),
      name: name.trim() || (lang === "fr" ? "Anonyme" : lang === "ht" ? "Anonim" : "Anonymous"),
      text: text.trim(),
      likes: 0,
      time: lang === "fr" ? "maintenant" : lang === "ht" ? "kounye a" : "now",
      country: "🌍",
      liked: false,
    };
    setTestimonies([newTestimony, ...testimonies]);
    setName("");
    setText("");
    setShowForm(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{t("testimonies", lang)}</h1>
          <p className="text-stone-500 text-sm mt-1">
            {lang === "fr" ? "Ce que Dieu a fait dans nos vies" : lang === "ht" ? "Sa Bondye fè nan lavi nou" : "What God has done in our lives"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-purple-500 transition-colors text-sm"
        >
          + {t("shareTestimony", lang)}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-stone-900 mb-4">{t("shareTestimony", lang)}</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("yourName", lang)}
            className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-purple-500 focus:outline-none"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("yourTestimony", lang)}
            rows={5}
            className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-purple-500 focus:outline-none resize-none"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-purple-500 transition-colors text-sm"
          >
            {t("submit", lang)}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {testimonies.map((testimony) => (
          <div key={testimony.id} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{testimony.country}</span>
              <span className="font-semibold text-stone-900">{testimony.name}</span>
              <span className="text-stone-400 text-xs">· {testimony.time}</span>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">{testimony.text}</p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleLike(testimony.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  testimony.liked
                    ? "bg-purple-600 text-white"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                {testimony.liked ? "❤️ Amen !" : "🤍 Amen"}
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-500">
                  <strong className="text-purple-600">{testimony.likes}</strong> {t("amen", lang)}
                </span>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: t("testimonies", lang),
                        text: `${testimony.name}: "${testimony.text}"`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="text-stone-400 hover:text-purple-600 transition-colors text-sm"
                >
                  ↗
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
