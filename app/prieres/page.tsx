"use client";
import HeroBackdrop from "@/app/components/HeroBackdrop";
import RequireAuth from "@/app/components/RequireAuth";

import { useLang } from "@/lib/LangContext";
import { t, type Lang } from "@/lib/translations";
import { useCountry } from "@/lib/useCountry";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DEMO_PRAYERS, PRAYER_CATEGORIES, type DemoPrayer } from "@/lib/demo-data";
import Icon from "@/app/components/Icon";

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
  if (seconds < 60) return lang === "fr" ? "maintenant" : lang === "ht" ? "kounye a" : lang === "es" ? "ahora" : "now";
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
    <div style={{
      background: "linear-gradient(180deg, #ffffff 0%, #ffffff 50%, #ffffff 100%)",
      backgroundImage: "radial-gradient(circle, rgba(26,53,104,0.025) 1px, transparent 1px)",
      backgroundSize: "22px 22px",
      minHeight: "100vh", color: "#1c1c2e",
    }}>

      <style>{`
        @keyframes prayer-aurora {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes orb-float-1 {
          0%,100% { transform: translateY(0) translateX(0) scale(1); }
          40%      { transform: translateY(-22px) translateX(10px) scale(1.06); }
          70%      { transform: translateY(12px) translateX(-8px) scale(0.97); }
        }
        @keyframes orb-float-2 {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-28px) scale(1.08); }
        }
        @keyframes cross-breathe {
          0%,100% { opacity: 0.06; transform: scale(1) rotate(0deg); }
          50%      { opacity: 0.12; transform: scale(1.04) rotate(1deg); }
        }
        @keyframes ring-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes flag-cycle {
          0%   { opacity: 0; transform: translateY(6px); }
          15%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes shimmer-p {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.4); }
        }
        .prayer-card { transition: border-color 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-left 0.2s ease; }
        .prayer-card:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 28px rgba(26,53,104,0.10) !important; border-left: 3px solid #1a3568 !important; }
      `}</style>

      {/* ══ HERO SANCTUAIRE ══ */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #1a3568 0%, #0d1d3d 50%, #0a1830 100%)", color: "#fff" }}>
        <HeroBackdrop image="/hero/priere.jpg" tint="dark" />

        {/* Gold orb */}
        <div style={{ position: "absolute", top: "-5%", left: "50%", transform: "translateX(-50%)", width: 500, height: 300, borderRadius: "50%", background: "rgba(0,170,200,0.18)", filter: "blur(80px)", animation: "orb-float-1 10s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", right: "5%", width: 200, height: 200, borderRadius: "50%", background: "rgba(200,150,15,0.12)", filter: "blur(60px)", animation: "orb-float-2 8s ease-in-out infinite 1.5s", pointerEvents: "none" }} />

        {/* Croix décorative */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -54%)", pointerEvents: "none", userSelect: "none", lineHeight: 1 }}><Icon name="croix" size={320} color="rgba(255,255,255,0.04)" /></div>

        {/* Anneau rotatif */}
        <div style={{ position: "absolute", top: "42%", left: "50%", width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(0,170,200,0.12)", animation: "ring-spin 25s linear infinite", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -3, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: "#00aac8", opacity: 0.8 }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "88px 24px 72px", textAlign: "center" }}>

          {/* Badge live */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(26,53,104,0.12)", border: "1px solid rgba(0,170,200,0.30)", borderRadius: 999, padding: "6px 18px", marginBottom: 28, animation: "hero-fade-up 0.6s ease" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00aac8", display: "inline-block", animation: "pulse-dot 1.8s ease-in-out infinite" }} />
            <Icon name="priere" size={13} color="#00aac8" />
            <span style={{ fontSize: 11, color: "#00aac8", fontWeight: 800, letterSpacing: "0.20em", textTransform: "uppercase" }}>
              {lang === "fr" ? "Mur de Prière Mondial" : lang === "ht" ? "Mi Lapriyè Mondyal" : lang === "es" ? "Muro de Oración Mundial" : "Global Prayer Wall"}
            </span>
          </div>

          {/* Titre */}
          <h1 style={{
            fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 18, color: "#fff",
            fontSize: "clamp(2.4rem, 6vw, 4.8rem)",
            animation: "hero-fade-up 0.7s ease 0.1s both",
            textShadow: "0 0 80px rgba(0,170,200,0.20)",
          }}>
            {lang === "fr" ? "Intercédez pour\nle monde." : lang === "ht" ? "Entèsede pou\nmond lan." : lang === "es" ? "Intercede por\nel mundo." : "Intercede for\nthe world."}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)", maxWidth: 500, margin: "0 auto 44px", lineHeight: 1.75, animation: "hero-fade-up 0.7s ease 0.2s both" }}>
            {lang === "fr" ? "Des milliers de croyants prient en ce moment même, depuis 60+ nations." : lang === "ht" ? "Dè milye kwayan ap priye kounye a menm, soti nan 60+ nasyon." : lang === "es" ? "Miles de creyentes oran en este mismo momento, desde 60+ naciones." : "Thousands of believers are praying right now, from 60+ nations."}
          </p>

          {/* Stats cards */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 40, animation: "hero-fade-up 0.7s ease 0.3s both" }}>
            {/* Total prayers */}
            <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "20px 32px", textAlign: "center", minWidth: 160, backdropFilter: "blur(8px)" }}>
              <p style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#f0c840", lineHeight: 1 }}>{totalPrays.toLocaleString()}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.70)", marginTop: 6, fontWeight: 600 }}>{lang === "fr" ? "prières offertes" : lang === "ht" ? "lapriyè ofri" : lang === "es" ? "oraciones" : "prayers offered"}</p>
            </div>
            {/* Live country */}
            <div style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 20, padding: "20px 28px", textAlign: "center", minWidth: 130, backdropFilter: "blur(8px)" }}>
              <p style={{ fontSize: "2rem", lineHeight: 1, marginBottom: 4, transition: "all 0.5s ease" }}>{stat.flag}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.80)", fontWeight: 700 }}>{stat.country}</p>
              <p style={{ fontSize: 11, color: "#7dd3e8", fontWeight: 800 }}>{stat.count.toLocaleString()}</p>
            </div>
            {/* 60+ nations */}
            <div style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 20, padding: "20px 28px", textAlign: "center", minWidth: 130, backdropFilter: "blur(8px)" }}>
              <p style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#f0c840", lineHeight: 1 }}>60+</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.70)", marginTop: 6, fontWeight: 600 }}>{lang === "fr" ? "nations unies" : lang === "ht" ? "nasyon ini" : lang === "es" ? "naciones unidas" : "nations united"}</p>
            </div>
          </div>

          {/* CTA */}
          <div style={{ animation: "hero-fade-up 0.7s ease 0.4s both" }}>
            <button
              onClick={() => { if (!user) { supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/prieres` } }); return; } setShowForm(!showForm); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 15, padding: "16px 36px", borderRadius: 999, background: "linear-gradient(135deg, #0d1d3d 0%, #1a3568 50%, #00aac8 100%)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 6px 32px rgba(0,170,200,0.40)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px) scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 40px rgba(0,170,200,0.55)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 32px rgba(0,170,200,0.40)"; }}>
              <Icon name="priere" size={18} /> {lang === "fr" ? "Soumettre ma prière" : lang === "ht" ? "Soumèt lapriyè mwen" : lang === "es" ? "Enviar mi oración" : "Submit my prayer"}
            </button>
          </div>

          {/* Flags row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 28, animation: "hero-fade-up 0.7s ease 0.5s both" }}>
            {LIVE_STATS.map((s) => (
              <span key={s.country} style={{ fontSize: "1.4rem", opacity: 0.55, transition: "opacity 0.2s, transform 0.2s", cursor: "default" }}
                title={s.country}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "scale(1.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.55"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                {s.flag}
              </span>
            ))}
            <span style={{ color: "rgba(255,255,255,0.20)", fontSize: 12, alignSelf: "center" }}>
              +{lang === "fr" ? "52 autres" : lang === "ht" ? "52 lòt" : lang === "es" ? "52 más" : "52 more"}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "all", label: lang === "fr" ? "Toutes" : lang === "ht" ? "Tout" : lang === "es" ? "Todas" : "All" },
            { id: "featured", label: lang === "fr" ? "Les plus priées" : lang === "ht" ? "Plis lapriyè" : lang === "es" ? "Más oradas" : "Most prayed" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id as "all" | "featured")}
              className="px-5 py-2 rounded-full text-sm font-bold transition-all"
              style={filter === tab.id
                ? { display: "inline-flex", alignItems: "center", gap: 6, background: "#1a3568", color: "#fff", border: "none" }
                : { display: "inline-flex", alignItems: "center", gap: 6, background: "#ffffff", color: "#1a3568", border: "1px solid #e8e4de" }}>
              {tab.id === "featured" && <Icon name="favori" size={14} />}{tab.label}
            </button>
          ))}
        </div>

        {/* Submit Form */}
        {showForm && (
          <form onSubmit={handleSubmit}
            className="relative rounded-2xl p-6 mb-6"
            style={{ background: "#ffffff", border: "1px solid #e8e4de", borderTop: "3px solid #7c3aed", boxShadow: "0 4px 16px rgba(26,53,104,0.06)" }}>
            <div style={{ height:3, marginBottom:20, background:"linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius:999 }} />
            <h3 style={{ display:"flex", alignItems:"center", gap:8, color:"#7c3aed", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:"1rem", marginBottom:16 }}><Icon name="priere" size={17} /> {t("submitPrayer", lang)}</h3>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("yourName", lang)}
              className="w-full rounded-xl px-4 py-3 mb-3 text-sm focus:outline-none"
              style={{ background: "#ffffff", border: "1px solid #e8e4de", color: "#1c1c2e" }} />
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("yourPrayer", lang)} rows={4} required
              className="w-full rounded-xl px-4 py-3 mb-3 text-sm focus:outline-none resize-none"
              style={{ background: "#ffffff", border: "1px solid #e8e4de", color: "#1c1c2e" }} />
            <div className="flex items-center gap-3">
              <button type="submit"
                className="font-black text-sm px-6 py-2.5 rounded-full"
                style={{ background: "linear-gradient(135deg, #c8960f, #e8b84b)", color: "#0d1d3d" }}>
                {t("submit", lang)}
              </button>
              <span style={{ color: "#4a5568", fontSize: "0.84rem" }}>{userCountry.flag} {userCountry.name}</span>
              <button type="button" onClick={() => setShowForm(false)} className="ml-auto" style={{ display:"inline-flex", alignItems:"center", color:"#718096", background:"none", border:"none", cursor:"pointer" }}><Icon name="fermer" size={18} /></button>
            </div>
          </form>
        )}

        {/* My own new prayers */}
        {realPrayers.length > 0 && (
          <div className="mb-6">
            <p style={{ color:"#00aac8", fontSize:10, fontWeight:900, letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:16 }}>
              {lang === "fr" ? "Nouvelles demandes" : lang === "ht" ? "Nouvo demann" : lang === "es" ? "Nuevas peticiones" : "New requests"}
            </p>
            <div className="space-y-3">
              {realPrayers.map((prayer) => (
                <PrayerCard key={prayer.id} prayer={prayer} lang={lang} userFlag={userCountry.flag} isGlobal={false} onPray={handlePray} />
              ))}
            </div>
            <div className="my-6 h-px" style={{ background: "#e8e4de" }} />
          </div>
        )}

        {/* Global Prayers */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00aac8 transparent transparent transparent" }} />
          </div>
        ) : (
          <div className="space-y-3">
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
    <div className="prayer-card rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid #e8e4de", borderTop: "3px solid #7c3aed", boxShadow: "0 4px 16px rgba(26,53,104,0.06)" }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", boxShadow: "0 4px 14px #7c3aed22" }}>
          {prayer.flag}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p style={{ color:"#1a3568", fontWeight:700, fontSize:"0.88rem" }}>{prayer.name}</p>
            {hot && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(251,146,60,0.12)", color:"#c05621" }}>
                <Icon name="feu" size={12} /> {lang === "fr" ? "Très prié" : lang === "ht" ? "Anpil lapriyè" : lang === "es" ? "Muy orada" : "Hot"}
              </span>
            )}
            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${cat.color}18`, color: cat.color }}>
              {cat[lang as Lang]}
            </span>
          </div>
          <p style={{ color:"#4a5568", fontSize:"0.72rem", marginTop:2 }}>{prayer.countryName[lang as Lang]} · {timeAgo(prayer.created_at, lang)}</p>
        </div>
      </div>
      <p style={{ color:"#1c1c2e", lineHeight:1.7, marginBottom:16, fontSize:"0.88rem", fontStyle:"italic" }}>&ldquo;{prayer.text[lang as Lang]}&rdquo;</p>
      <div className="flex items-center justify-between">
        <button onClick={onPray}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95"
          style={prayed
            ? { background: "#7c3aed", color: "#fff", boxShadow: "0 4px 16px #7c3aed3a", border: "none" }
            : { background: "#ffffff", color: "#7c3aed", border: "1px solid #e8e4de" }}>
          <Icon name="priere" size={16} /> {prayed ? `Amen ${userFlag}` : t("prayerButton", lang)}
        </button>
        <span style={{ fontSize:"0.84rem" }}>
          <strong className="text-base font-black" style={{ color: "#1a3568" }}>{prayCount.toLocaleString()}</strong>
          <span style={{ color:"#4a5568", fontSize:"0.72rem", marginLeft:4 }}>{lang === "fr" ? "ont prié" : lang === "ht" ? "moun priye" : lang === "es" ? "oraron" : "prayed"}</span>
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
    <div className="prayer-card rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid #e8e4de", borderTop: "3px solid #7c3aed", boxShadow: "0 4px 16px rgba(26,53,104,0.06)" }}>
      {hot && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-3"
          style={{ background: "rgba(251,146,60,0.12)", color:"#c05621" }}>
          <Icon name="feu" size={12} /> {lang === "fr" ? "Très prié" : lang === "ht" ? "Anpil lapriyè" : "Highly prayed"}
        </span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", boxShadow: "0 4px 14px #7c3aed22" }}>
          {prayer.country}
        </div>
        <div>
          <p style={{ color:"#1a3568", fontWeight:700, fontSize:"0.88rem" }}>{prayer.name}</p>
          <p style={{ color:"#4a5568", fontSize:"0.72rem" }}>· {timeAgo(prayer.created_at, lang)}</p>
        </div>
      </div>
      <p style={{ color:"#1c1c2e", lineHeight:1.7, marginBottom:16, fontSize:"0.88rem", fontStyle:"italic" }}>&ldquo;{prayer.text}&rdquo;</p>
      <div className="flex items-center justify-between">
        <button onClick={() => onPray(prayer.id, isGlobal)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95"
          style={prayer.prayed
            ? { background: "#7c3aed", color: "#fff", boxShadow: "0 4px 16px #7c3aed3a", border: "none" }
            : { background: "#ffffff", color: "#7c3aed", border: "1px solid #e8e4de" }}>
          <Icon name="priere" size={16} /> {prayer.prayed ? `Amen ${userFlag}` : t("prayerButton", lang)}
        </button>
        <span style={{ fontSize:"0.84rem" }}>
          <strong className="text-base font-black" style={{ color: "#1a3568" }}>{prayer.pray_count.toLocaleString()}</strong>
          <span style={{ color:"#4a5568", fontSize:"0.72rem", marginLeft:4 }}>{lang === "fr" ? "ont prié" : lang === "ht" ? "moun priye" : lang === "es" ? "oraron" : "prayed"}</span>
        </span>
      </div>
    </div>
  );
}
