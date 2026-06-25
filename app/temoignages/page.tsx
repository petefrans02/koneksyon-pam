"use client";
import RequireAuth from "@/app/components/RequireAuth";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { useCountry } from "@/lib/useCountry";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Testimony {
  id: string;
  name: string;
  text: string;
  likes: number;
  country: string;
  created_at: string;
  liked: boolean;
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

export default function TemoignagesPage() {
  const { lang } = useLang();
  const userCountry = useCountry();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => setUser(data.user));
    loadTestimonies();
  }, []);

  async function loadTestimonies() {
    const res = await fetch("/api/testimonies");
    const data = await res.json();
    setTestimonies((data.testimonies || []).map((t: Testimony) => ({ ...t, liked: false })));
    setLoading(false);
  }

  async function handleLike(id: string) {
    setTestimonies(testimonies.map((t) =>
      t.id === id ? { ...t, likes: t.liked ? t.likes - 1 : t.likes + 1, liked: !t.liked } : t
    ));
    await fetch("/api/testimonies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch("/api/testimonies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() || t("anonymous", lang), text: text.trim(), country: userCountry.flag }),
    });
    const data = await res.json();
    if (data.testimony) {
      setTestimonies([{ ...data.testimony, liked: false }, ...testimonies]);
    }
    setName("");
    setText("");
    setShowForm(false);
  }

  return (
    <RequireAuth>
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{t("testimonies", lang)}</h1>
          <p className="text-stone-500 text-sm mt-1">
            {lang === "fr" ? "Ce que Dieu a fait dans nos vies" : lang === "ht" ? "Sa Bondye fè nan lavi nou" : "What God has done in our lives"}
          </p>
        </div>
        <button
          onClick={() => { if (!user) { supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/temoignages` } }); return; } setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-500 transition-colors text-sm"
        >
          + {t("shareTestimony", lang)}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-stone-900 mb-4">{t("shareTestimony", lang)}</h3>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("yourName", lang)} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-blue-500 focus:outline-none" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("yourTestimony", lang)} rows={5} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mb-3 text-sm bg-white focus:border-blue-500 focus:outline-none resize-none" />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-500 transition-colors text-sm">{t("submit", lang)}</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : testimonies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-stone-500">{lang === "fr" ? "Aucun témoignage pour le moment. Partagez le vôtre !" : "No testimonies yet. Share yours!"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonies.map((testimony) => (
            <div key={testimony.id} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{testimony.country}</span>
                <span className="font-semibold text-stone-900">{testimony.name}</span>
                <span className="text-stone-400 text-xs">· {timeAgo(testimony.created_at, lang)}</span>
              </div>
              <p className="text-stone-700 leading-relaxed mb-4">{testimony.text}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLike(testimony.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    testimony.liked ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {testimony.liked ? "❤️ Amen !" : "🤍 Amen"}
                </button>
                <span className="text-sm text-stone-500">
                  <strong className="text-blue-500">{testimony.likes}</strong> {t("amen", lang)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </RequireAuth>
  );
}
