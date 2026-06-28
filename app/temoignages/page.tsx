"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { useCountry } from "@/lib/useCountry";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DEMO_TESTIMONIES, type DemoTestimony, type Lang } from "@/lib/demo-data";
import Link from "next/link";

interface RealTestimony {
  id: string;
  name: string;
  text: string;
  likes: number;
  country: string;
  created_at: string;
  liked: boolean;
}

const CATEGORY_FILTER_LABELS: Record<string, Record<Lang, string>> = {
  all:         { fr: "Tout voir",           ht: "Wè tout",           en: "All"           },
  restoration: { fr: "Restauration",        ht: "Restourasyon",      en: "Restoration"   },
  healing:     { fr: "Guérison",            ht: "Gerizon",           en: "Healing"       },
  conversion:  { fr: "Conversion",          ht: "Konvèsyon",         en: "Conversion"    },
  prayer:      { fr: "Réponse à la prière", ht: "Repons lapriyè",    en: "Answered"      },
  mission:     { fr: "Mission",             ht: "Misyon",            en: "Mission"       },
};

function timeAgo(date: string, lang: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return lang === "fr" ? "maintenant" : lang === "ht" ? "kounye a" : "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}${lang === "fr" ? "j" : lang === "ht" ? "j" : "d"}`;
  return `${Math.floor(days / 30)}${lang === "fr" ? "mo" : lang === "ht" ? "mwa" : "mo"}`;
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0"
      style={{ backgroundColor: color }}>
      {name[0]}
    </div>
  );
}

export default function TemoignagesPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const userCountry = useCountry();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [realTestimonies, setRealTestimonies] = useState<RealTestimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);
  const [likedDemo, setLikedDemo] = useState<Set<string>>(new Set());
  const [demoLikes, setDemoLikes] = useState<Record<string, number>>(
    Object.fromEntries(DEMO_TESTIMONIES.map(t => [t.id, t.likes]))
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => setUser(data.user));
    loadTestimonies();
  }, []);

  async function loadTestimonies() {
    try {
      const res = await fetch("/api/testimonies");
      const data = await res.json();
      setRealTestimonies((data.testimonies || []).map((t: RealTestimony) => ({ ...t, liked: false })));
    } catch { setRealTestimonies([]); }
    setLoading(false);
  }

  async function handleLike(id: string) {
    setRealTestimonies(prev => prev.map(t =>
      t.id === id ? { ...t, likes: t.liked ? t.likes - 1 : t.likes + 1, liked: !t.liked } : t
    ));
    await fetch("/api/testimonies", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  }

  function handleDemoLike(id: string) {
    const isLiked = likedDemo.has(id);
    setLikedDemo(prev => { const s = new Set(prev); isLiked ? s.delete(id) : s.add(id); return s; });
    setDemoLikes(prev => ({ ...prev, [id]: prev[id] + (isLiked ? -1 : 1) }));
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
    if (data.testimony) setRealTestimonies(prev => [{ ...data.testimony, liked: false }, ...prev]);
    setName(""); setText(""); setShowForm(false);
  }

  const totalTestimonies = DEMO_TESTIMONIES.length + realTestimonies.length;
  const totalAmens = DEMO_TESTIMONIES.reduce((a, t) => a + t.likes, 0) + realTestimonies.reduce((a, t) => a + t.likes, 0);

  const txt = {
    tag:       { fr: "TÉMOIGNAGES",                  ht: "TEMWAYAJ",                   en: "TESTIMONIES"                 },
    title:     { fr: "Ce que Dieu a fait",            ht: "Sa Bondye fè",               en: "What God has done"           },
    subtitle:  { fr: "Des vies transformées par la puissance de Dieu à travers la communauté KONEKSYON PAM.", ht: "Lavi transfòme pa pouvwa Bondye atravè kominote KONEKSYON PAM.", en: "Lives transformed by the power of God through the KONEKSYON PAM community." },
    share:     { fr: "Partager mon témoignage",       ht: "Pataje temwayaj mwen",        en: "Share my testimony"          },
    latest:    { fr: "Témoignages récents",           ht: "Temwayaj resan",              en: "Recent testimonies"          },
    featured:  { fr: "Témoignages inspirants",        ht: "Temwayaj enspiyan",           en: "Inspiring testimonies"       },
    amen:      { fr: "Amen",                          ht: "Amèn",                        en: "Amen"                        },
    amens:     { fr: "Amen reçus",                    ht: "Amèn resevwa",                en: "Amens received"              },
    nameLabel: { fr: "Votre prénom",                  ht: "Prenon ou",                   en: "Your first name"             },
    textLabel: { fr: "Votre témoignage",              ht: "Temwayaj ou",                 en: "Your testimony"              },
    submit:    { fr: "Publier mon témoignage",        ht: "Pibliye temwayaj mwen",       en: "Publish my testimony"        },
    cancel:    { fr: "Annuler",                       ht: "Anile",                       en: "Cancel"                      },
    noReal:    { fr: "Soyez le premier à partager votre témoignage !", ht: "Swa premye a pataje temwayaj ou !", en: "Be the first to share your testimony!" },
    statTests: { fr: "témoignages partagés",          ht: "temwayaj pataje",             en: "testimonies shared"          },
    statAmens: { fr: "Amen reçus",                    ht: "Amèn resevwa",                en: "Amens received"              },
    statCoun:  { fr: "pays représentés",              ht: "peyi reprezante",             en: "countries"                   },
    verse:     { fr: "Et ils l'ont vaincu par le sang de l'Agneau et par la parole de leur témoignage.", ht: "Epi yo te genyen sou li pa san Ti Mouton an ak pa pawòl temwayaj yo.", en: "They triumphed over him by the blood of the Lamb and by the word of their testimony." },
    verseRef:  { fr: "Apocalypse 12:11", ht: "Revelasyon 12:11", en: "Revelation 12:11" },
  };
  const T = (k: keyof typeof txt): string => txt[k][l];

  return (
    <div className="min-h-screen bg-[#080d18]">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -20%, #7c3aed18 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 bg-purple-400/10 border border-purple-400/20 text-purple-300 text-[10px] font-black px-4 py-2 rounded-full mb-8 tracking-[0.25em]">
            ✦ {T("tag")}
          </span>
          <h1 className="text-white font-black mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            {T("title")}
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            {T("subtitle")}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-black text-white">{totalTestimonies}</p>
              <p className="text-xs text-white/30 mt-0.5">{T("statTests")}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-black text-white">{totalAmens.toLocaleString()}</p>
              <p className="text-xs text-white/30 mt-0.5">{T("statAmens")}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-black text-white">12+</p>
              <p className="text-xs text-white/30 mt-0.5">{T("statCoun")}</p>
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={() => { if (!user) { supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/temoignages` } }); return; } setShowForm(!showForm); }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-black px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/30"
          >
            ✨ {T("share")}
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">

        {/* ── SUBMIT FORM ──────────────────────────────────────────────── */}
        {showForm && (
          <form onSubmit={handleSubmit}
            className="bg-white/5 border border-purple-400/20 rounded-3xl p-8 mb-12">
            <h3 className="text-white font-black text-lg mb-6">✍️ {T("share")}</h3>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder={T("nameLabel")}
              className="w-full bg-white/8 border border-white/15 rounded-2xl px-5 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors mb-4"
            />
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              placeholder={T("textLabel")}
              rows={6} required
              className="w-full bg-white/8 border border-white/15 rounded-2xl px-5 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors resize-none mb-4"
            />
            <div className="flex gap-3">
              <button type="submit"
                className="bg-gradient-to-r from-purple-500 to-violet-600 text-white font-black px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity">
                {T("submit")}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-white/40 px-6 py-3 rounded-full border border-white/10 hover:border-white/30 text-sm transition-colors">
                {T("cancel")}
              </button>
              <span className="ml-auto text-white/30 text-sm self-center">{userCountry.flag} {userCountry.name}</span>
            </div>
          </form>
        )}

        {/* ── REAL TESTIMONIES (from community) ─────────────────────── */}
        {!loading && realTestimonies.length > 0 && (
          <div className="mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400/70 mb-8">
              ✦ {T("latest")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {realTestimonies.map(testimony => (
                <div key={testimony.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center text-white font-black">
                      {testimony.name[0]}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{testimony.name}</p>
                      <p className="text-white/30 text-xs">{testimony.country} · {timeAgo(testimony.created_at, lang)}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-4">{testimony.text}</p>
                  <button onClick={() => handleLike(testimony.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${testimony.liked ? "bg-purple-500 text-white" : "bg-white/8 text-white/50 hover:bg-white/12"}`}>
                    {testimony.liked ? "🙏" : "🤍"} Amen · {testimony.likes}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DEMO FEATURED TESTIMONIES ─────────────────────────────── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400/70 mb-8">
            ✦ {T("featured")}
          </p>

          <div className="grid grid-cols-1 gap-6">
            {DEMO_TESTIMONIES.map(testimony => (
              <TestimonyCard
                key={testimony.id}
                testimony={testimony}
                l={l}
                liked={likedDemo.has(testimony.id)}
                likes={demoLikes[testimony.id]}
                onLike={handleDemoLike}
                amenLabel={T("amen")}
              />
            ))}
          </div>
        </div>

        {/* ── BIBLE VERSE ───────────────────────────────────────────── */}
        <div className="mt-16 border border-purple-400/15 rounded-2xl p-8 bg-purple-400/3 text-center">
          <p className="text-purple-100/50 text-base leading-relaxed italic mb-3">
            &ldquo;{T("verse")}&rdquo;
          </p>
          <p className="text-purple-400/60 text-xs font-bold">— {T("verseRef")}</p>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <div className="mt-10 text-center">
          <button
            onClick={() => { if (!user) { supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/temoignages` } }); return; } setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 bg-white text-[#080d18] font-black px-8 py-4 rounded-full hover:bg-white/90 transition-opacity text-sm">
            ✨ {T("share")}
          </button>
        </div>
      </div>
    </div>
  );
}

function TestimonyCard({ testimony, l, liked, likes, onLike, amenLabel }: {
  testimony: DemoTestimony;
  l: Lang;
  liked: boolean;
  likes: number;
  onLike: (id: string) => void;
  amenLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = testimony.text[l];
  const isLong = text.length > 280;

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all">
      {/* Category band */}
      <div className="h-1 w-full" style={{ backgroundColor: `${testimony.avatarColor}60` }} />

      <div className="p-7">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <Avatar name={testimony.name} color={testimony.avatarColor} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-white font-bold">{testimony.name}</p>
              <span className="text-white/30 text-xs">{testimony.flag}</span>
              <span className="text-white/20 text-xs">{testimony.countryName[l]}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${testimony.avatarColor}20`, color: testimony.avatarColor }}>
                {testimony.categoryIcon} {testimony.category[l]}
              </span>
              <span className="text-white/20 text-[10px]">{timeAgo(testimony.date, l)}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white/20 text-[10px] font-bold">{testimony.verse[l]}</p>
          </div>
        </div>

        {/* Text */}
        <p className="text-white/60 leading-relaxed text-sm mb-4">
          {isLong && !expanded ? `${text.slice(0, 280)}…` : text}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(!expanded)}
            className="text-purple-400 text-xs font-bold hover:text-purple-300 transition-colors mb-4">
            {expanded
              ? (l === "fr" ? "Lire moins" : l === "ht" ? "Li mwens" : "Read less")
              : (l === "fr" ? "Lire la suite" : l === "ht" ? "Li plis" : "Read more")}
          </button>
        )}

        {/* Verse quote */}
        <div className="border-l-2 pl-4 mb-5" style={{ borderColor: `${testimony.avatarColor}50` }}>
          <p className="text-white/30 text-xs italic leading-relaxed">
            &ldquo;{testimony.verseText[l]}&rdquo;
          </p>
          <p className="text-white/20 text-[10px] mt-1 font-bold">— {testimony.verse[l]}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button onClick={() => onLike(testimony.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              liked
                ? "text-white shadow-lg"
                : "bg-white/8 text-white/50 hover:bg-white/12"
            }`}
            style={liked ? { backgroundColor: testimony.avatarColor } : {}}>
            {liked ? "🙏" : "🤍"} {amenLabel} · {likes.toLocaleString()}
          </button>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
