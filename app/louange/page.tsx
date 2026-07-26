"use client";
import HeroBackdrop from "@/app/components/HeroBackdrop";

import { useLang } from "@/lib/LangContext";
import { useEffect, useRef, useState } from "react";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

interface Video { id: string; title: string; published: string; }

const WORSHIP_QUOTES = [
  { fr: "Chantez à l'Éternel un cantique nouveau !", ht: "Chante pou Seyè a yon chant nouvo!", en: "Sing to the Lord a new song!", es: "¡Canten al Señor un cántico nuevo!", ref: "Psaumes 96:1" },
  { fr: "Que tout ce qui respire loue l'Éternel !", ht: "Ke tout sa ki gen souf lou Seyè a !", en: "Let everything that has breath praise the Lord!", es: "¡Todo lo que respira alabe al Señor!", ref: "Psaumes 150:6" },
  { fr: "Louez Dieu dans son sanctuaire.", ht: "Lwanje Bondye nan sanktiyè li a.", en: "Praise God in his sanctuary.", es: "Alaben a Dios en su santuario.", ref: "Psaumes 150:1" },
];

const WORSHIP_CATEGORIES: { icon: IconName; label: Record<Lang, string>; color: string }[] = [
  { icon: "chants", label: { fr: "Chants de louange", ht: "Chan lwanj", en: "Praise songs", es: "Cantos de alabanza" }, color: "#c8960f" },
  { icon: "priere", label: { fr: "Adoration", ht: "Adowasyon", en: "Worship", es: "Adoración" }, color: "#1a3568" },
  { icon: "psaumes", label: { fr: "Psaumes chantés", ht: "Sòm chante", en: "Sung psalms", es: "Salmos cantados" }, color: "#38bdf8" },
  { icon: "mission", label: { fr: "Mission & Évangile", ht: "Misyon & Levanjil", en: "Mission & Gospel", es: "Misión & Evangelio" }, color: "#34d399" },
];

const MUSIC_NOTES = ["♪", "♫", "♬", "♩", "♪", "♫"];

export default function LouangePage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteAnim, setQuoteAnim] = useState(true);
  const [gridVisible, setGridVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGridVisible(true); }, { threshold: 0.05 });
    if (gridRef.current) obs.observe(gridRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteAnim(false);
      setTimeout(() => { setQuoteIdx(i => (i + 1) % WORSHIP_QUOTES.length); setQuoteAnim(true); }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/youtube")
      .then(r => r.json())
      .then(({ videos }) => setVideos(videos || []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  const quote = WORSHIP_QUOTES[quoteIdx];

  return (
    <div style={{ background: "linear-gradient(180deg, #0d1436 0%, #1a1040 50%, #0d1436 100%)", minHeight: "100vh", color: "#fff" }}>

      <style>{`
        @keyframes louange-aurora {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes orb-pink-1 {
          0%,100% { transform: translateY(0) translateX(0) scale(1); }
          40%      { transform: translateY(-24px) translateX(12px) scale(1.07); }
          70%      { transform: translateY(14px) translateX(-8px) scale(0.96); }
        }
        @keyframes orb-pink-2 {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-30px) scale(1.10); }
        }
        @keyframes note-float {
          0%   { opacity: 0; transform: translateY(0) rotate(0deg) scale(0.8); }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.4; }
          100% { opacity: 0; transform: translateY(-120px) rotate(20deg) scale(1.2); }
        }
        @keyframes quote-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes quote-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-12px); }
        }
        @keyframes hero-reveal {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer-l {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes equalizer-1 { 0%,100%{height:12px} 50%{height:28px} }
        @keyframes equalizer-2 { 0%,100%{height:20px} 50%{height:8px}  }
        @keyframes equalizer-3 { 0%,100%{height:16px} 50%{height:32px} }
        @keyframes equalizer-4 { 0%,100%{height:8px}  50%{height:24px} }
        @keyframes pulse-pink {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.3); }
        }
        @keyframes ring-slow {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        .video-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.25s ease; }
        .video-card:hover { transform: translateY(-6px) scale(1.01) !important; box-shadow: 0 16px 40px rgba(236,72,153,0.22) !important; border-color: rgba(236,72,153,0.40) !important; }
        .play-btn { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .video-card:hover .play-btn { transform: scale(1.15) !important; }
        .cat-pill { transition: all 0.25s ease; }
        .cat-pill:hover { transform: translateY(-2px) scale(1.05); }
      `}</style>

      {/* ═══════════ HERO ═══════════ */}
      <div style={{ position: "relative", overflow: "hidden" }}>

        {/* Aurora rose */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #060d1a 0%, #0a1628 35%, #080e1c 65%, #060d1a 100%)", backgroundSize: "400% 400%", animation: "louange-aurora 12s ease infinite", pointerEvents: "none" }} />
        <HeroBackdrop image="/hero/louange.jpg" tint="dark" />

        {/* Orbes roses */}
        <div style={{ position: "absolute", top: "-8%", left: "50%", transform: "translateX(-50%)", width: 750, height: 420, borderRadius: "50%", background: "rgba(200,150,15,0.14)", filter: "blur(110px)", animation: "orb-pink-1 9s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "25%", right: "4%", width: 300, height: 300, borderRadius: "50%", background: "rgba(26,53,104,0.12)", filter: "blur(75px)", animation: "orb-pink-2 7s ease-in-out infinite 1s", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "6%", width: 250, height: 250, borderRadius: "50%", background: "rgba(26,53,104,0.12)", filter: "blur(65px)", animation: "orb-pink-1 11s ease-in-out infinite 3s", pointerEvents: "none" }} />

        {/* Anneau décoratif */}
        <div style={{ position: "absolute", top: "46%", left: "50%", width: 360, height: 360, borderRadius: "50%", border: "1px solid rgba(200,150,15,0.14)", animation: "ring-slow 30s linear infinite", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#c8960f", opacity: 0.7 }} />
          <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 5, height: 5, borderRadius: "50%", background: "#1a3568", opacity: 0.5 }} />
        </div>

        {/* Notes de musique flottantes */}
        {MUSIC_NOTES.map((note, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${10 + i * 14}%`,
            bottom: `${15 + (i % 3) * 12}%`,
            fontSize: `${1 + (i % 3) * 0.4}rem`,
            color: i % 2 === 0 ? "#c8960f" : "#00aac8",
            opacity: 0,
            animation: `note-float ${4 + i * 0.8}s ease-in-out infinite ${i * 0.7}s`,
            pointerEvents: "none",
            userSelect: "none",
          }}>{note}</div>
        ))}

        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(200,150,15,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,150,15,0.025) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(200,150,15,0.5), transparent)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 840, margin: "0 auto", padding: "88px 24px 72px", textAlign: "center" }}>

          {/* Equalizer animé */}
          <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "flex-end", height: 36, marginBottom: 28, opacity: heroReady ? 1 : 0, transition: "opacity 0.6s ease" }}>
            {[1,2,3,4,5,6,7].map((_, i) => (
              <div key={i} style={{ width: 4, borderRadius: 2, background: `linear-gradient(180deg, #00aac8, #1a3568)`, animation: `equalizer-${(i % 4) + 1} ${0.6 + i * 0.1}s ease-in-out infinite ${i * 0.08}s` }} />
            ))}
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(200,150,15,0.10)", border: "1px solid rgba(200,150,15,0.28)",
            borderRadius: 999, padding: "6px 18px", marginBottom: 28,
            opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(-14px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#c8960f", display: "inline-block", animation: "pulse-pink 1.8s ease-in-out infinite" }} />
            <Icon name="chants" size={13} color="#c8960f" />
            <span style={{ fontSize: 11, color: "#c8960f", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {l === "fr" ? "Louange & Adoration" : l === "ht" ? "Lwanj & Adowasyon" : l === "es" ? "Alabanza & Adoración" : "Worship & Praise"}
            </span>
          </div>

          {/* Titre */}
          <h1 style={{
            fontSize: "clamp(2.4rem, 6.5vw, 5.5rem)", fontWeight: 900, lineHeight: 1.05,
            letterSpacing: "-0.03em", marginBottom: 20,
            background: "linear-gradient(135deg, #fff 0%, #c8960f 45%, #00aac8 80%, #fff 100%)",
            backgroundSize: "300% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "louange-aurora 5s ease infinite",
            opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}>
            {l === "fr" ? "Glorifions Dieu\nEnsemble." : l === "ht" ? "Ann glorifye Bondye\nEnsanm." : l === "es" ? "Glorifiquemos a Dios\nJuntos." : "Let Us Glorify God\nTogether."}
          </h1>

          {/* Sous-titre */}
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)", maxWidth: 520, margin: "0 auto 44px", lineHeight: 1.75, opacity: heroReady ? 1 : 0, transition: "opacity 0.7s ease 0.35s" }}>
            {l === "fr" ? "Chants chrétiens, adoration et vidéos inspirationnelles — la louange qui unit les croyants du monde entier." : l === "ht" ? "Chan kretyen, adowasyon ak videyo enspirasyonèl — lwanj ki ini kwayan nan tout mond lan." : l === "es" ? "Canciones cristianas, adoración y vídeos inspiracionales — la alabanza que une a los creyentes del mundo entero." : "Christian songs, worship and inspirational videos — praise that unites believers across the world."}
          </p>

          {/* Rotating verse carousel */}
          <div style={{
            position: "relative", overflow: "hidden",
            background: "rgba(200,150,15,0.06)", border: "1px solid rgba(200,150,15,0.18)",
            borderRadius: 24, padding: "28px 36px", maxWidth: 620, margin: "0 auto 44px",
            opacity: heroReady ? 1 : 0, transition: "opacity 0.8s ease 0.45s",
          }}>
            <div style={{ position: "absolute", top: 0, left: "-100%", width: "50%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(26,53,104,0.12), transparent)", animation: "shimmer-l 4s ease-in-out infinite 2s", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #c8960f, transparent)" }} />
            <div style={{ animation: quoteAnim ? "quote-in 0.4s ease" : "quote-out 0.35s ease", minHeight: 56 }}>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)", fontStyle: "italic", lineHeight: 1.8, marginBottom: 10 }}>
                &ldquo;{quote[l]}&rdquo;
              </p>
              <p style={{ color: "#c8960f", fontWeight: 800, fontSize: 12 }}>— {quote.ref}</p>
            </div>
            {/* Dots */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16 }}>
              {WORSHIP_QUOTES.map((_, i) => (
                <div key={i} style={{ width: i === quoteIdx ? 20 : 6, height: 6, borderRadius: 999, background: i === quoteIdx ? "#c8960f" : "rgba(255,255,255,0.18)", transition: "all 0.35s ease" }} />
              ))}
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 36, opacity: heroReady ? 1 : 0, transition: "opacity 0.7s ease 0.5s" }}>
            {WORSHIP_CATEGORIES.map((cat, i) => (
              <div key={i} className="cat-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, background: `${cat.color}10`, border: `1px solid ${cat.color}28`, color: cat.color, fontWeight: 700, fontSize: 13, cursor: "default" }}>
                <Icon name={cat.icon} size={16} /> {cat.label[l]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ CONTENT ═══════════ */}
      <div ref={gridRef} style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* YouTube Subscribe Banner */}
        <div style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, #1a0a0a 0%, #2a0808 100%)",
          border: "1px solid rgba(239,68,68,0.25)", borderRadius: 24,
          padding: "28px 32px", marginBottom: 40, display: "flex", alignItems: "center", gap: 20,
          flexWrap: "wrap",
          opacity: gridVisible ? 1 : 0, transform: gridVisible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 200, height: 200, borderRadius: "50%", background: "rgba(239,68,68,0.08)", filter: "blur(50px)", pointerEvents: "none" }} />
          {/* YT icon */}
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="video" size={26} color="#fff" /></div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontWeight: 900, color: "#fff", fontSize: "1rem", marginBottom: 4 }}>
              {l === "fr" ? "Abonne-toi à KONEKSYON PAM" : l === "ht" ? "Abòne nan KONEKSYON PAM" : l === "es" ? "Suscríbete a KONEKSYON PAM" : "Subscribe to KONEKSYON PAM"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 13 }}>
              YouTube · 30K+ {l === "fr" ? "abonnés" : l === "ht" ? "abòne" : l === "es" ? "suscriptores" : "subscribers"} · {l === "fr" ? "Louange, Bible & Enseignements" : l === "ht" ? "Lwanj, Bib & Ansèyman" : l === "es" ? "Alabanza, Biblia & Enseñanzas" : "Worship, Bible & Teachings"}
            </p>
          </div>
          <a href="https://www.youtube.com/channel/UCl01tzkV_QzhPvZ-pf9Ey-g?sub_confirmation=1" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ef4444", color: "#fff", fontWeight: 900, fontSize: 14, padding: "12px 24px", borderRadius: 999, textDecoration: "none", transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 4px 20px rgba(239,68,68,0.30)", flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(239,68,68,0.45)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(239,68,68,0.30)"; }}>
            <Icon name="video" size={16} /> {l === "fr" ? "S'abonner" : l === "ht" ? "Abòne" : l === "es" ? "Suscribirse" : "Subscribe"}
          </a>
        </div>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, opacity: gridVisible ? 1 : 0, transition: "opacity 0.6s ease 0.1s" }}>
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900, color: "#fff", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", marginBottom: 4 }}>
              <Icon name="chants" size={22} /> {l === "fr" ? "Dernières vidéos" : l === "ht" ? "Dènye videyo" : l === "es" ? "Últimos vídeos" : "Latest videos"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.30)", fontSize: 13 }}>KONEKSYON PAM · YouTube</p>
          </div>
          <a href="https://www.youtube.com/channel/UCl01tzkV_QzhPvZ-pf9Ey-g" target="_blank" rel="noopener noreferrer"
            style={{ color: "#c8960f", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            {l === "fr" ? "Voir tout →" : l === "ht" ? "Wè tout →" : l === "es" ? "Ver todo →" : "See all →"}
          </a>
        </div>

        {/* Video grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 20, overflow: "hidden", background: "linear-gradient(150deg, #ec489926 0%, rgba(255,255,255,0.04) 60%)", border: "1px solid rgba(255,255,255,0.10)", borderTop: "3px solid #ec4899" }}>
                <div style={{ height: 160, background: "rgba(255,255,255,0.05)", animation: "shimmer-l 1.5s ease-in-out infinite" }} />
                <div style={{ padding: "16px" }}>
                  <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,0.07)", marginBottom: 8 }} />
                  <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.04)", width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", opacity: gridVisible ? 1 : 0, transition: "opacity 0.6s ease 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="chants" size={48} color="rgba(255,255,255,0.30)" /></div>
            <p style={{ color: "rgba(255,255,255,0.30)", marginBottom: 24, fontSize: 15 }}>
              {l === "fr" ? "Retrouvez nos vidéos directement sur YouTube" : l === "ht" ? "Jwenn videyo nou yo dirèkteman sou YouTube" : l === "es" ? "Encuentra nuestros vídeos directamente en YouTube" : "Find our videos directly on YouTube"}
            </p>
            <a href="https://www.youtube.com/channel/UCl01tzkV_QzhPvZ-pf9Ey-g" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ef4444", color: "#fff", fontWeight: 900, fontSize: 14, padding: "14px 28px", borderRadius: 999, textDecoration: "none" }}>
              <Icon name="video" size={16} /> {l === "fr" ? "Voir sur YouTube" : l === "ht" ? "Wè sou YouTube" : l === "es" ? "Ver en YouTube" : "Watch on YouTube"}
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {videos.map((video, i) => (
              <a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer"
                className="video-card"
                style={{
                  display: "block", textDecoration: "none", borderRadius: 20, overflow: "hidden",
                  background: "linear-gradient(150deg, #ec48991a 0%, rgba(255,255,255,0.04) 60%)", border: "1px solid rgba(255,255,255,0.10)", borderTop: "3px solid #ec4899",
                  opacity: gridVisible ? 1 : 0,
                  transform: gridVisible ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 0.5s ease ${i * 0.06}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`,
                }}>
                {/* Thumbnail */}
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#060d1a" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} alt={video.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                    onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"}
                    onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  {/* Overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,3,16,0.7) 0%, transparent 60%)", pointerEvents: "none" }} />
                  {/* Play button */}
                  <div className="play-btn" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.90)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.40)" }}>
                    <Icon name="video" size={22} color="#fff" />
                  </div>
                  {/* Duration badge placeholder */}
                  <div style={{ position: "absolute", bottom: 8, left: 10, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.60)", borderRadius: 6, padding: "2px 7px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "#ec4899", fontWeight: 800 }}><Icon name="chants" size={12} /> KP</span>
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: "14px 16px 16px" }}>
                  <h3 style={{ fontWeight: 700, color: "#fff", fontSize: "0.88rem", lineHeight: 1.45, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {video.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", fontWeight: 600 }}>KONEKSYON PAM</p>
                    <span style={{ fontSize: 11, color: "#ec4899", fontWeight: 700 }}>{l === "fr" ? "Regarder →" : l === "ht" ? "Gade →" : l === "es" ? "Ver →" : "Watch →"}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
