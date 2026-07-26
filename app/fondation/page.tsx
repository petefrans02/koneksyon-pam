"use client";
import HeroBackdrop from "@/app/components/HeroBackdrop";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function FondationPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const grid = useReveal();

  const t = {
    badge:   { fr:"KONEKSYON PAM FOUNDATION", ht:"KONEKSYON PAM FOUNDATION", en:"KONEKSYON PAM FOUNDATION", es:"KONEKSYON PAM FOUNDATION" },
    title:   { fr:"Le Mouvement", ht:"Mouvman an", en:"The Movement", es:"El Movimiento" },
    tagline: { fr:"Apprendre • Grandir • Jouer • Servir", ht:"Aprann • Grandi • Jwe • Sèvi", en:"Learn • Grow • Play • Serve", es:"Aprender • Crecer • Jugar • Servir" },
    sub:     { fr:"Une organisation chrétienne internationale bâtie sur la Parole de Dieu et l'amour du prochain.", ht:"Yon òganizasyon kretyen entènasyonal bati sou Pawòl Bondye a ak renmen pwochen an.", en:"An international Christian organization built on the Word of God and love for others.", es:"Una organización cristiana internacional construida sobre la Palabra de Dios y el amor al prójimo." },
    soon:    { fr:"BIENTÔT", ht:"BYENTO", en:"COMING SOON", es:"PRÓXIMAMENTE" },
    active:  { fr:"ACTIF", ht:"AKTIF", en:"ACTIVE", es:"ACTIVO" },
    prep:    { fr:"EN PRÉPARATION", ht:"AN PREPARASYON", en:"IN PREPARATION", es:"EN PREPARACIÓN" },
    legal:   { fr:"Notre communauté grandit. Ces sections s'ouvriront progressivement, avec des informations réelles uniquement.", ht:"Kominote nou an ap grandi. Seksyon sa yo pral ouvri pwogresivman, avèk enfòmasyon reyèl sèlman.", en:"Our community is growing. These sections will open progressively, with real information only.", es:"Nuestra comunidad está creciendo. Estas secciones se abrirán progresivamente, solo con información real." },
    nav_label: { fr:"Explorer →", ht:"Eksplore →", en:"Explore →", es:"Explorar →" },
  };

  const SECTIONS: { icon: IconName; href: string; label: Record<Lang, string>; status: string; color: string }[] = [
    { icon:"bible",         href:"/mission",               label:{ fr:"Notre Mission",           ht:"Misyon Nou",            en:"Our Mission",          es:"Nuestra Misión"          }, status:"active", color:"#c8960f" },
    { icon:"classement",    href:"/impact",                label:{ fr:"Impact",                  ht:"Enpak",                 en:"Impact",               es:"Impacto"                 }, status:"active", color:"#b45309" },
    { icon:"monde",         href:"/projets",               label:{ fr:"Nos Projets",             ht:"Pwojè Nou",             en:"Our Projects",         es:"Nuestros Proyectos"      }, status:"prep",   color:"#16a34a" },
    { icon:"batiment",      href:"/fondation/gouvernance", label:{ fr:"Gouvernance",             ht:"Gouvènans",             en:"Governance",           es:"Gobernanza"              }, status:"soon",   color:"#1a3568" },
    { icon:"recherche",     href:"/fondation/transparence",label:{ fr:"Transparence",            ht:"Transparans",           en:"Transparency",         es:"Transparencia"           }, status:"soon",   color:"#00aac8" },
    { icon:"pdf",           href:"/fondation/rapports",    label:{ fr:"Rapports annuels",        ht:"Rapò anyèl",            en:"Annual Reports",       es:"Informes anuales"        }, status:"soon",   color:"#00aac8" },
    { icon:"poignee_main",  href:"/fondation/partenaires", label:{ fr:"Nos partenaires",         ht:"Patnè nou",             en:"Our Partners",         es:"Nuestros Socios"         }, status:"soon",   color:"#c8960f" },
    { icon:"utilisateurs",  href:"/fondation/conseil",     label:{ fr:"Conseil d'administration",ht:"Konsèy administrasyon", en:"Board of Directors",   es:"Junta Directiva"         }, status:"soon",   color:"#1a3568" },
    { icon:"module",        href:"/fondation/documents",   label:{ fr:"Documents officiels",     ht:"Dokiman ofisyèl",       en:"Official Documents",   es:"Documentos oficiales"    }, status:"soon",   color:"#1a3568" },
  ];

  const statusLabel = (s: string) => s === "active" ? t.active[l] : s === "prep" ? t.prep[l] : t.soon[l];
  const statusTextColor  = (s: string) => s === "active" ? "#16a34a" : s === "prep" ? "#b45309" : "#8a7560";
  const statusBg         = (s: string) => s === "active" ? "rgba(22,163,74,0.10)" : s === "prep" ? "rgba(180,83,9,0.10)" : "#f5f0e8";
  const statusBorder     = (s: string) => s === "active" ? "rgba(22,163,74,0.30)" : s === "prep" ? "rgba(180,83,9,0.25)" : "#e8dcc8";

  return (
    <main style={{ minHeight:"100vh", background:"#ffffff" }}>
      <style>{`
        @keyframes fnd-aurora  { 0%,100%{opacity:.48;transform:scale(1);}50%{opacity:.72;transform:scale(1.06);} }
        @keyframes fnd-up      { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        @keyframes fnd-badge   { from{opacity:0;transform:scale(.85);}to{opacity:1;transform:scale(1);} }
        @keyframes fnd-shimmer { 0%{background-position:200% center;}100%{background-position:-200% center;} }
        @keyframes fnd-card    { from{opacity:0;transform:translateY(24px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes fnd-dot     { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0);}50%{box-shadow:0 0 0 5px rgba(212,160,23,.18);} }
        .fnd-card { transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease,border-color .3s ease; }
        .fnd-card:hover { transform:translateY(-5px); box-shadow:0 10px 34px rgba(0,0,0,0.10); }
      `}</style>

      {/* ══ HERO sombre ══ */}
      <div style={{ background:"linear-gradient(135deg,#06122a,#0d2048)", position:"relative", overflow:"hidden", minHeight:"60vh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <HeroBackdrop image="/hero/fondation.jpg" tint="dark" />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)", width:600, height:300, background:"radial-gradient(ellipse,rgba(200,150,15,0.12) 0%,transparent 65%)", filter:"blur(50px)" }} />
        </div>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-16 pb-14 text-center" style={{ position:"relative", zIndex:10 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(212,160,23,0.10)", border:"1px solid rgba(212,160,23,0.28)", color:"#fbbf24", fontSize:10, fontWeight:900, padding:"6px 18px", borderRadius:999, marginBottom:20, letterSpacing:"0.24em", animation:"fnd-badge .9s cubic-bezier(.16,1,.3,1) both" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#d4a017", boxShadow:"0 0 8px #d4a017", display:"inline-block", animation:"fnd-dot 2s ease-in-out infinite" }} />
            <Icon name="croix" size={13} /> {t.badge[l]}
          </div>
          <h1 style={{ fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1.05, marginBottom:14, background:"linear-gradient(135deg,#fff 0%,#fbbf24 55%,#d4a017 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"fnd-up .9s cubic-bezier(.16,1,.3,1) .15s both, fnd-shimmer 7s linear infinite" }}>
            {t.title[l]}
          </h1>
          <p style={{ color:"#d4a017", fontWeight:700, fontSize:"clamp(0.85rem,2vw,1rem)", letterSpacing:"0.08em", marginBottom:14, animation:"fnd-up .9s cubic-bezier(.16,1,.3,1) .28s both" }}>
            {t.tagline[l]}
          </p>
          <p style={{ color:"rgba(255,255,255,0.45)", maxWidth:520, margin:"0 auto", lineHeight:1.7, animation:"fnd-up .9s cubic-bezier(.16,1,.3,1) .38s both" }}>
            {t.sub[l]}
          </p>
        </div>
        <div className="kpf-separator" />
      </div>

      {/* ══ CONTENU CLAIR ══ */}
      <div style={{ background:"#ffffff" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14" ref={grid.ref}>

          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fffbf0", border:"1px solid #e8c86c", color:"#c8960f", fontSize:10, fontWeight:900, padding:"5px 14px", borderRadius:999, marginBottom:16, letterSpacing:"0.18em" }}>
              <Icon name="etincelles" size={12} /> {l==="fr"?"NOS SECTIONS":l==="ht"?"SEKSYON NOU":l==="es"?"NUESTRAS SECCIONES":"OUR SECTIONS"}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:18 }}>
            {SECTIONS.map((s, i) => (
              <Link key={s.href} href={s.href} style={{ textDecoration:"none" }}>
                <div className="fnd-card" style={{
                  background:`#ffffff`, border:"1px solid #e8e4de",
                  borderTop:`3px solid ${s.color}`,
                  borderRadius:20, padding:"26px 22px", height:"100%",
                  boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                  animation: grid.visible ? `fnd-card .65s cubic-bezier(.16,1,.3,1) ${i*0.06}s both` : undefined,
                  opacity: grid.visible ? undefined : 0,
                  cursor: s.status === "soon" ? "default" : "pointer",
                }}>
                  <div style={{
                    width:52, height:52, borderRadius:14, marginBottom:14,
                    display:"inline-flex", alignItems:"center", justifyContent:"center",
                    background:`${s.color}1f`, border:`1.5px solid ${s.color}3a`,
                    color:s.color, boxShadow:`0 4px 14px ${s.color}22`,
                  }}><Icon name={s.icon} size={28} /></div>
                  <h3 style={{ fontWeight:800, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"0.97rem", marginBottom:12, lineHeight:1.3 }}>{s.label[l]}</h3>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                    <span style={{
                      display:"inline-block", fontSize:"0.68rem", fontWeight:800, letterSpacing:"0.14em",
                      padding:"3px 10px", borderRadius:999,
                      color: statusTextColor(s.status),
                      background: statusBg(s.status),
                      border:`1px solid ${statusBorder(s.status)}`,
                    }}>
                      {statusLabel(s.status)}
                    </span>
                    {s.status !== "soon" && (
                      <span style={{ fontSize:"0.75rem", color:s.color, fontWeight:700 }}>{t.nav_label[l]}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Note légale */}
          <div style={{ marginTop:44, background:"#ffffff", border:"1px solid #e8e4de", borderTop:"3px solid #c8960f", borderLeft:"4px solid #c8960f", borderRadius:16, padding:"18px 22px", boxShadow:"0 4px 16px rgba(26,53,104,0.06)" }}>
            <p style={{ color:"#4a6080", fontSize:"0.88rem", lineHeight:1.7 }}>
              <span style={{ color:"#1a3568", fontWeight:800, display:"inline-flex", alignItems:"center", gap:6, verticalAlign:"middle" }}><Icon name="alerte" size={15} /> Note : </span>{t.legal[l]}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
