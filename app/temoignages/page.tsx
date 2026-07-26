"use client";
import HeroBackdrop from "@/app/components/HeroBackdrop";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { useCountry } from "@/lib/useCountry";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { DEMO_TESTIMONIES, type DemoTestimony, type Lang } from "@/lib/demo-data";
import Link from "next/link";
import AdBanner from "@/app/components/AdBanner";
import Icon, { IconName } from "@/app/components/Icon";

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
  all:         { fr: "Tout voir",           ht: "Wè tout",        en: "All",         es: "Todo"         },
  restoration: { fr: "Restauration",        ht: "Restourasyon",   en: "Restoration", es: "Restauración" },
  healing:     { fr: "Guérison",            ht: "Gerizon",        en: "Healing",     es: "Sanidad"      },
  conversion:  { fr: "Conversion",          ht: "Konvèsyon",      en: "Conversion",  es: "Conversión"   },
  prayer:      { fr: "Réponse à la prière", ht: "Repons lapriyè", en: "Answered",    es: "Respondida"   },
  mission:     { fr: "Mission",             ht: "Misyon",         en: "Mission",     es: "Misión"       },
};

function timeAgo(date: string, lang: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60)  return lang==="fr"?"maintenant":lang==="ht"?"kounye a":lang==="es"?"ahora":"now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)  return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30)     return `${days}${lang==="fr"?"j":lang==="ht"?"j":"d"}`;
  return `${Math.floor(days/30)}${lang==="fr"?"mo":lang==="ht"?"mwa":lang==="es"?"mes":"mo"}`;
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div style={{
      width:46, height:46, borderRadius:"50%", background:color,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#fff", fontWeight:900, fontSize:"1.1rem", flexShrink:0,
    }}>
      {name[0]}
    </div>
  );
}

export default function TemoignagesPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const userCountry = useCountry();
  const [showForm, setShowForm]     = useState(false);
  const [name, setName]             = useState("");
  const [text, setText]             = useState("");
  const [realTestimonies, setReal]  = useState<RealTestimony[]>([]);
  const [loading, setLoading]       = useState(true);
  const [user, setUser]             = useState<unknown>(null);
  const [likedDemo, setLikedDemo]   = useState<Set<string>>(new Set());
  const [demoLikes, setDemoLikes]   = useState<Record<string,number>>(
    Object.fromEntries(DEMO_TESTIMONIES.map(td => [td.id, td.likes]))
  );
  const [activeFilter, setFilter]   = useState("all");
  const [cardsVis, setCardsVis]     = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => setUser(data.user));
    loadTestimonies();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCardsVis(true); }, { threshold: 0.05 });
    if (cardsRef.current) obs.observe(cardsRef.current);
    return () => obs.disconnect();
  }, []);

  async function loadTestimonies() {
    try {
      const res  = await fetch("/api/testimonies");
      const data = await res.json();
      setReal((data.testimonies || []).map((td: RealTestimony) => ({ ...td, liked: false })));
    } catch { setReal([]); }
    setLoading(false);
  }

  async function handleLike(id: string) {
    setReal(prev => prev.map(td =>
      td.id === id ? { ...td, likes: td.liked ? td.likes-1 : td.likes+1, liked: !td.liked } : td
    ));
    await fetch("/api/testimonies", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
  }

  function handleDemoLike(id: string) {
    const isLiked = likedDemo.has(id);
    setLikedDemo(prev => { const s=new Set(prev); isLiked?s.delete(id):s.add(id); return s; });
    setDemoLikes(prev => ({ ...prev, [id]: prev[id]+(isLiked?-1:1) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res  = await fetch("/api/testimonies", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name: name.trim() || t("anonymous", lang), text: text.trim(), country: userCountry.flag }),
    });
    const data = await res.json();
    if (data.testimony) setReal(prev => [{ ...data.testimony, liked:false }, ...prev]);
    setName(""); setText(""); setShowForm(false);
  }

  const totalTestimonies = DEMO_TESTIMONIES.length + realTestimonies.length;
  const totalAmens = DEMO_TESTIMONIES.reduce((a,td) => a+td.likes, 0) + realTestimonies.reduce((a,td) => a+td.likes, 0);

  const txt = {
    tag:       { fr:"TÉMOIGNAGES",                   ht:"TEMWAYAJ",                    en:"TESTIMONIES",                   es:"TESTIMONIOS"                 },
    title:     { fr:"Ce que Dieu a fait",             ht:"Sa Bondye fè",                en:"What God has done",             es:"Lo que Dios ha hecho"        },
    subtitle:  { fr:"Des vies transformées par la puissance de Dieu à travers la communauté KONEKSYON PAM.", ht:"Lavi transfòme pa pouvwa Bondye atravè kominote KONEKSYON PAM.", en:"Lives transformed by the power of God through the KONEKSYON PAM community.", es:"Vidas transformadas por el poder de Dios a través de la comunidad KONEKSYON PAM." },
    share:     { fr:"Partager mon témoignage",        ht:"Pataje temwayaj mwen",         en:"Share my testimony",            es:"Compartir mi testimonio"     },
    latest:    { fr:"Témoignages récents",            ht:"Temwayaj resan",               en:"Recent testimonies",            es:"Testimonios recientes"       },
    featured:  { fr:"Témoignages inspirants",         ht:"Temwayaj enspiyan",            en:"Inspiring testimonies",         es:"Testimonios inspiradores"    },
    amen:      { fr:"Amen",                           ht:"Amèn",                         en:"Amen",                          es:"Amén"                        },
    amens:     { fr:"Amen reçus",                     ht:"Amèn resevwa",                 en:"Amens received",                es:"Amenes recibidos"            },
    nameLabel: { fr:"Votre prénom",                   ht:"Prenon ou",                    en:"Your first name",               es:"Su nombre"                   },
    textLabel: { fr:"Votre témoignage",               ht:"Temwayaj ou",                  en:"Your testimony",                es:"Su testimonio"               },
    submit:    { fr:"Publier mon témoignage",         ht:"Pibliye temwayaj mwen",        en:"Publish my testimony",          es:"Publicar mi testimonio"      },
    cancel:    { fr:"Annuler",                        ht:"Anile",                        en:"Cancel",                        es:"Cancelar"                    },
    statTests: { fr:"témoignages partagés",           ht:"temwayaj pataje",              en:"testimonies shared",            es:"testimonios compartidos"     },
    statAmens: { fr:"Amen reçus",                     ht:"Amèn resevwa",                 en:"Amens received",                es:"Amenes recibidos"            },
    statCoun:  { fr:"pays représentés",               ht:"peyi reprezante",              en:"countries",                     es:"países"                      },
    verse:     { fr:"Et ils l'ont vaincu par le sang de l'Agneau et par la parole de leur témoignage.", ht:"Epi yo te genyen sou li pa san Ti Mouton an ak pa pawòl temwayaj yo.", en:"They triumphed over him by the blood of the Lamb and by the word of their testimony.", es:"Ellos le han vencido por medio de la sangre del Cordero y de la palabra del testimonio de ellos." },
    verseRef:  { fr:"Apocalypse 12:11", ht:"Revelasyon 12:11", en:"Revelation 12:11", es:"Apocalipsis 12:11" },
  };
  const T = (k: keyof typeof txt): string => txt[k][l];

  return (
    <div className="animate-page-awaken" style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#f0f5ff 0%,#ffffff 40%,#fffbf0 100%)",
      backgroundImage:"radial-gradient(circle, rgba(26,53,104,0.025) 1px, transparent 1px)",
      backgroundSize:"22px 22px",
      color:"#1c1c2e",
    }}>
      <style>{`
        @keyframes temo-up {
          from { opacity:0; transform:translateY(22px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes temo-badge {
          from { opacity:0; transform:scale(.82) translateY(-8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes temo-card-in {
          from { opacity:0; transform:translateY(30px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes temo-shimmer {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes temo-icon-float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-10px); }
        }
        @keyframes temo-stat-in {
          from { opacity:0; transform:scale(.88) translateY(14px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes temo-dot-pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(0,170,200,0); }
          50%      { box-shadow:0 0 0 6px rgba(0,170,200,0.20); }
        }
        @keyframes temo-ring {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes temo-ring2 {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(-360deg); }
        }
        .temo-card-reveal { animation: temo-card-in .65s cubic-bezier(.16,1,.3,1) both; }
        .temo-stat-reveal { animation: temo-stat-in  .6s  cubic-bezier(.16,1,.3,1) both; }
        .temo-card-hover {
          transition: transform .35s cubic-bezier(.34,1.56,.64,1),
                      box-shadow .3s ease, border-color .25s ease, border-left .2s ease;
        }
        .temo-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(26,53,104,0.12);
          border-left: 3px solid #c8960f !important;
        }
        .temo-share-btn {
          transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease;
        }
        .temo-share-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(200,150,15,0.35); }
        .temo-filter-pill {
          transition: background .2s, color .2s, transform .2s;
          cursor: pointer; border: none;
        }
        .temo-filter-pill:hover { transform:scale(1.04); }
      `}</style>

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <div style={{
        position:"relative", overflow:"hidden",
        background:"linear-gradient(135deg, #1a3568 0%, #0d1d3d 50%, #0a1830 100%)",
        color:"#fff",
      }}>
        <HeroBackdrop image="/hero/temoignages.jpg" tint="dark" />
        {/* Depth orbs */}
        <div style={{ position:"absolute", top:"10%", left:"4%", width:300, height:300, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(0,170,200,0.18) 0%,transparent 70%)",
          filter:"blur(50px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"15%", right:"5%", width:250, height:250, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(200,150,15,0.12) 0%,transparent 70%)",
          filter:"blur(40px)", pointerEvents:"none" }} />
        {/* Rings */}
        <div style={{ position:"absolute", top:"50%", left:"50%", width:520, height:520,
          border:"1px solid rgba(0,170,200,0.07)", borderRadius:"50%",
          animation:"temo-ring 45s linear infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", width:320, height:320,
          border:"1px solid rgba(200,150,15,0.06)", borderRadius:"50%",
          animation:"temo-ring2 28s linear infinite", pointerEvents:"none" }} />

        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-12 text-center" style={{ position:"relative", zIndex:10 }}>
          {/* Badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(26,53,104,0.12)", border:"1px solid rgba(0,170,200,0.28)",
            color:"#00aac8", fontSize:10, fontWeight:900,
            padding:"6px 18px", borderRadius:999, marginBottom:24, letterSpacing:"0.24em",
            animation:"temo-badge .9s cubic-bezier(.16,1,.3,1) both",
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#00aac8",
              boxShadow:"0 0 8px #00aac8", display:"inline-block",
              animation:"temo-dot-pulse 2s ease-in-out infinite" }} />
            ✦ {T("tag")}
          </div>

          {/* Titre */}
          <h1 style={{
            fontSize:"clamp(2rem,5vw,3.3rem)", fontWeight:900, lineHeight:1.08, marginBottom:14,
            background:"linear-gradient(135deg,#fff 0%,#7dd3e8 50%,#1a3568 100%)",
            backgroundSize:"200% auto",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            animation:"temo-up .9s cubic-bezier(.16,1,.3,1) .2s both, temo-shimmer 7s linear infinite",
          }}>
            {T("title")}
          </h1>

          {/* Sous-titre */}
          <p style={{
            color:"rgba(255,255,255,0.45)", maxWidth:520, margin:"0 auto 26px",
            lineHeight:1.7, fontSize:"0.95rem",
            animation:"temo-up .9s cubic-bezier(.16,1,.3,1) .38s both",
          }}>
            {T("subtitle")}
          </p>

          {/* Icônes flottantes */}
          <div style={{
            display:"flex", justifyContent:"center", gap:26, marginBottom:28,
            animation:"temo-up .9s cubic-bezier(.16,1,.3,1) .5s both",
          }}>
            {(["priere","etincelles","colombe","croix","coeur"] as IconName[]).map((icon,i) => (
              <span key={icon} style={{
                display:"inline-flex",
                animation:`temo-icon-float ${3.2+i*0.4}s ease-in-out infinite`,
                animationDelay:`${i*0.16}s`,
                filter:"drop-shadow(0 0 9px rgba(0,170,200,0.35))",
              }}><Icon name={icon} size={24} /></span>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap", marginBottom:28,
            animation:"temo-up .9s cubic-bezier(.16,1,.3,1) .62s both",
          }}>
            {[
              { val: totalTestimonies, label: T("statTests") },
              { val: totalAmens.toLocaleString(), label: T("statAmens") },
              { val: "12+", label: T("statCoun") },
            ].map((s,i) => (
              <div key={i} className="temo-stat-reveal" style={{
                animationDelay:`${i*0.1}s`,
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:16, padding:"14px 22px", textAlign:"center", minWidth:110,
                backdropFilter:"blur(8px)",
              }}>
                <p style={{ fontSize:"1.5rem", fontWeight:900, color:"#f0c840" }}>{s.val}</p>
                <p style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.70)", marginTop:3 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Share button */}
          <button
            className="temo-share-btn"
            onClick={() => {
              if (!user) {
                supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo:`${window.location.origin}/temoignages` } });
                return;
              }
              setShowForm(!showForm);
            }}
            style={{
              display:"inline-flex", alignItems:"center", gap:10,
              background:"linear-gradient(135deg,#1a3568,#0d1d3d)",
              color:"#fff", fontWeight:900, padding:"14px 32px", borderRadius:999,
              fontSize:"0.9rem", border:"none", cursor:"pointer",
              boxShadow:"0 8px 28px rgba(0,170,200,0.35)",
              animation:"temo-up .9s cubic-bezier(.16,1,.3,1) .75s both",
            }}
          >
            <Icon name="etincelles" size={18} /> {T("share")}
          </button>
        </div>

        {/* Séparateur */}
        <div style={{ height:2, background:"linear-gradient(90deg,transparent,rgba(200,150,15,0.40),transparent)" }} />
      </div>

      {/* ══ FILTERS ═════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 pb-2">
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" as const }}>
          {Object.entries(CATEGORY_FILTER_LABELS).map(([key, labels]) => (
            <button
              key={key}
              className="temo-filter-pill"
              onClick={() => setFilter(key)}
              style={{
                padding:"7px 16px", borderRadius:999, fontSize:"0.76rem", fontWeight:700,
                background: activeFilter===key ? "#1a3568" : "#ffffff",
                color: activeFilter===key ? "#fff" : "#1a3568",
                border: activeFilter===key ? "1px solid #1a3568" : "1px solid #e8e4de",
              }}
            >
              {labels[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">

        {/* ── FORM ──────────────────────────────────────────────────────── */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{
            background:"#ffffff", border:"1px solid #e8e4de",
            borderTop:"3px solid #db2777",
            borderRadius:24, padding:32, marginBottom:48,
            boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
          }}>
            <div style={{ height:3, marginBottom:24,
              background:"linear-gradient(90deg,#c8960f,#1a3568,#00aac8)", borderRadius:999 }} />
            <h3 style={{ display:"flex", alignItems:"center", gap:8, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:"1.1rem", marginBottom:20 }}><Icon name="editer" size={18} /> {T("share")}</h3>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder={T("nameLabel")}
              style={{
                width:"100%", boxSizing:"border-box" as const,
                background:"#ffffff", border:"1px solid #e8e4de",
                borderRadius:14, padding:"12px 18px", color:"#1c1c2e", fontSize:"0.88rem",
                marginBottom:12, outline:"none",
              }}
            />
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              placeholder={T("textLabel")}
              rows={6} required
              style={{
                width:"100%", boxSizing:"border-box" as const,
                background:"#ffffff", border:"1px solid #e8e4de",
                borderRadius:14, padding:"12px 18px", color:"#1c1c2e", fontSize:"0.88rem",
                resize:"none" as const, marginBottom:16, outline:"none",
              }}
            />
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <button type="submit" style={{
                background:"linear-gradient(135deg,#c8960f,#e8b84b)", color:"#0d1d3d",
                fontWeight:900, padding:"11px 24px", borderRadius:999, fontSize:"0.85rem", border:"none", cursor:"pointer",
              }}>{T("submit")}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                color:"#4a5568", padding:"11px 22px", borderRadius:999, fontSize:"0.85rem",
                background:"transparent", border:"1px solid #e8e4de", cursor:"pointer",
              }}>{T("cancel")}</button>
              <span style={{ marginLeft:"auto", color:"#9ca3af", fontSize:"0.82rem" }}>
                {userCountry.flag} {userCountry.name}
              </span>
            </div>
          </form>
        )}

        {/* ── RECENT (real) ─────────────────────────────────────────────── */}
        {!loading && realTestimonies.length > 0 && (
          <div style={{ marginBottom:56 }}>
            <p style={{ fontSize:10, fontWeight:900, letterSpacing:"0.26em", color:"#00aac8", marginBottom:28, textTransform:"uppercase" as const }}>
              ✦ {T("latest")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {realTestimonies.map(td => (
                <div key={td.id} className="temo-card-hover" style={{
                  background:"#ffffff", border:"1px solid #e8e4de",
                  borderTop:"3px solid #db2777",
                  borderRadius:20, padding:24,
                  boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <div style={{
                      width:42, height:42, borderRadius:"50%",
                      background:"linear-gradient(135deg,#1a3568,#00aac8)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:"#fff", fontWeight:900, fontSize:"1rem",
                    }}>{td.name[0]}</div>
                    <div>
                      <p style={{ color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:"0.88rem" }}>{td.name}</p>
                      <p style={{ color:"#9ca3af", fontSize:"0.72rem" }}>{td.country} · {timeAgo(td.created_at, lang)}</p>
                    </div>
                  </div>
                  <p style={{ color:"#4a6080", fontSize:"0.84rem", lineHeight:1.65, marginBottom:14,
                    display:"-webkit-box", WebkitLineClamp:4, WebkitBoxOrient:"vertical" as const, overflow:"hidden" }}>
                    {td.text}
                  </p>
                  <button onClick={() => handleLike(td.id)} style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"8px 16px", borderRadius:999, fontSize:"0.76rem", fontWeight:700, cursor:"pointer",
                    background: td.liked ? "#1a3568" : "#ffffff",
                    color: td.liked ? "#fff" : "#4a5568",
                    border: td.liked ? "none" : "1px solid #e8e4de", transition:"background .2s, color .2s",
                  }}>
                    <Icon name={td.liked ? "priere" : "coeur"} size={14} /> Amen · {td.likes}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AD SLOT ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom:48 }}>
          <AdBanner slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TEMOIGNAGES ?? "0000000003"} format="horizontal" minHeight={90} />
        </div>

        {/* ── FEATURED (demo) ───────────────────────────────────────────── */}
        <div ref={cardsRef}>
          <p style={{ fontSize:10, fontWeight:900, letterSpacing:"0.26em", color:"#00aac8", marginBottom:28, textTransform:"uppercase" as const }}>
            ✦ {T("featured")}
          </p>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:20 }}>
            {DEMO_TESTIMONIES.map((td, i) => (
              <TestimonyCard
                key={td.id}
                testimony={td}
                l={l}
                liked={likedDemo.has(td.id)}
                likes={demoLikes[td.id]}
                onLike={handleDemoLike}
                amenLabel={T("amen")}
                visible={cardsVis}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* ── VERSET ────────────────────────────────────────────────────── */}
        <div style={{
          marginTop:56, background:"linear-gradient(135deg,#1a3568,#0d1d3d)",
          borderRadius:20, padding:40, textAlign:"center", position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
            width:400, height:200, background:"radial-gradient(ellipse,rgba(200,150,15,0.15),transparent 70%)",
            filter:"blur(30px)", pointerEvents:"none" }} />
          <p style={{ color:"rgba(255,255,255,0.85)", fontSize:"1.05rem", lineHeight:1.7, fontStyle:"italic",
            fontFamily:"'Playfair Display',Georgia,serif", marginBottom:12, position:"relative" }}>
            &ldquo;{T("verse")}&rdquo;
          </p>
          <p style={{ color:"#f0c840", fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.10em", position:"relative" }}>
            — {T("verseRef")}
          </p>
        </div>

        {/* ── CTA final ─────────────────────────────────────────────────── */}
        <div style={{ marginTop:36, textAlign:"center" }}>
          <button
            className="temo-share-btn"
            onClick={() => {
              if (!user) {
                supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo:`${window.location.origin}/temoignages` } });
                return;
              }
              setShowForm(true);
              window.scrollTo({ top:0, behavior:"smooth" });
            }}
            style={{
              display:"inline-flex", alignItems:"center", gap:10,
              background:"linear-gradient(135deg,#c8960f,#e8b84b)", color:"#0d1d3d", fontWeight:900,
              padding:"14px 34px", borderRadius:999, fontSize:"0.9rem", border:"none", cursor:"pointer",
            }}
          >
            <Icon name="etincelles" size={18} /> {T("share")}
          </button>
        </div>
      </div>
    </div>
  );
}

function TestimonyCard({ testimony, l, liked, likes, onLike, amenLabel, visible, index }: {
  testimony: DemoTestimony;
  l: Lang;
  liked: boolean;
  likes: number;
  onLike: (id: string) => void;
  amenLabel: string;
  visible: boolean;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = (testimony.text as Record<string,string>)[l] ?? testimony.text.en;
  const isLong = text.length > 280;

  return (
    <div
      className={`temo-card-hover${visible?" temo-card-reveal":""}`}
      style={{
        animationDelay:`${index*0.07}s`,
        background:`#ffffff`, border:"1px solid #e8e4de",
        borderRadius:24, overflow:"hidden",
        boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
        opacity: visible ? undefined : 0,
      }}
    >
      {/* Bande couleur catégorie */}
      <div style={{ height:3, background:`${testimony.avatarColor}` }} />

      <div style={{ padding:"24px 26px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16 }}>
          <Avatar name={testimony.name} color={testimony.avatarColor} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" as const, marginBottom:5 }}>
              <p style={{ color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:800, fontSize:"0.92rem" }}>{testimony.name}</p>
              <span style={{ color:"#9ca3af", fontSize:"0.76rem" }}>{testimony.flag}</span>
              <span style={{ color:"#9ca3af", fontSize:"0.72rem" }}>{(testimony.countryName as Record<string,string>)[l] ?? testimony.countryName.en}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" as const }}>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:4,
                fontSize:"0.68rem", fontWeight:900, padding:"3px 10px", borderRadius:999,
                background:`${testimony.avatarColor}18`, color:testimony.avatarColor,
              }}>
                <Icon name={testimony.categoryIcon as IconName} size={13} /> {(testimony.category as Record<string,string>)[l] ?? testimony.category.en}
              </span>
              <span style={{ color:"#9ca3af", fontSize:"0.68rem" }}>{timeAgo(testimony.date, l)}</span>
            </div>
          </div>
          <p style={{ color:"#9ca3af", fontSize:"0.68rem", fontWeight:700, flexShrink:0 }}>
            {(testimony.verse as Record<string,string>)[l] ?? testimony.verse.en}
          </p>
        </div>

        {/* Texte */}
        <p style={{ color:"#4a6080", lineHeight:1.68, fontSize:"0.88rem", marginBottom:10 }}>
          {isLong && !expanded ? `${text.slice(0,280)}…` : text}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(!expanded)} style={{
            color:"#00aac8", fontSize:"0.76rem", fontWeight:700, background:"none", border:"none", cursor:"pointer", marginBottom:12,
          }}>
            {expanded
              ?(l==="fr"?"Lire moins":l==="ht"?"Li mwens":l==="es"?"Leer menos":"Read less")
              :(l==="fr"?"Lire la suite":l==="ht"?"Li plis":l==="es"?"Leer más":"Read more")}
          </button>
        )}

        {/* Verset citation */}
        <div style={{ borderLeft:`3px solid ${testimony.avatarColor}`, paddingLeft:14, marginBottom:18, background:`${testimony.avatarColor}08`, borderRadius:"0 8px 8px 0", padding:"10px 14px" }}>
          <p style={{ color:"#4a6080", fontSize:"0.76rem", fontStyle:"italic", lineHeight:1.6 }}>
            &ldquo;{(testimony.verseText as Record<string,string>)[l] ?? testimony.verseText.en}&rdquo;
          </p>
          <p style={{ color:"#9ca3af", fontSize:"0.68rem", marginTop:4, fontWeight:700 }}>
            — {(testimony.verse as Record<string,string>)[l] ?? testimony.verse.en}
          </p>
        </div>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => onLike(testimony.id)} style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"9px 18px", borderRadius:999, fontSize:"0.82rem", fontWeight:700, cursor:"pointer",
            background: liked ? testimony.avatarColor : "#ffffff",
            color: liked ? "#fff" : "#4a5568",
            border: liked ? "none" : "1px solid #e8e4de", transition:"background .2s, color .2s",
            boxShadow: liked ? `0 4px 16px ${testimony.avatarColor}30` : "none",
          }}>
            <Icon name={liked ? "priere" : "coeur"} size={15} /> {amenLabel} · {likes.toLocaleString()}
          </button>
          <div style={{ display:"flex", gap:2 }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ color:"#fbbf24", fontSize:"0.72rem" }}>★</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
