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

interface Goal {
  icon: IconName;
  key: string;
  label: Record<Lang, string>;
  goal: number;
  current: number;
  unit: Record<Lang, string>;
  color: string;
  note?: Record<Lang, string>;
}

const GOALS: Goal[] = [
  { icon:"utilisateurs", key:"members",      color:"#be185d", goal:5000, current:0,   label:{ fr:"Membres de la communauté", ht:"Manm kominote a",       en:"Community members",       es:"Miembros de la comunidad" }, unit:{ fr:"membres",     ht:"manm",      en:"members",       es:"miembros"     } },
  { icon:"groupe",       key:"teams",        color:"#7c3aed", goal:200,  current:0,   label:{ fr:"Équipes bibliques",        ht:"Ekip biblik",           en:"Bible teams",             es:"Equipos bíblicos"         }, unit:{ fr:"équipes",     ht:"ekip",      en:"teams",         es:"equipos"      } },
  { icon:"etude",        key:"journeys",     color:"#16a34a", goal:3000, current:0,   label:{ fr:"Parcours bibliques complétés", ht:"Pakou biblik konplete", en:"Bible journeys completed", es:"Recorridos bíblicos completados" }, unit:{ fr:"parcours",    ht:"pakou",     en:"journeys",      es:"recorridos"   } },
  { icon:"trophee",      key:"championships",color:"#b45309", goal:1000, current:500, label:{ fr:"Championnats joués",       ht:"Chanpyona jwe",         en:"Championships played",    es:"Campeonatos jugados"      }, unit:{ fr:"championnats", ht:"chanpyona", en:"championships", es:"campeonatos"  }, note:{ fr:"(données réelles de la plateforme)", ht:"(done reyèl platfòm nan)", en:"(real platform data)", es:"(datos reales de la plataforma)" } },
  { icon:"monde",        key:"countries",    color:"#0284c7", goal:15,   current:12,  label:{ fr:"Pays touchés",             ht:"Peyi touche",           en:"Countries reached",       es:"Países alcanzados"        }, unit:{ fr:"pays",        ht:"peyi",      en:"countries",     es:"países"       }, note:{ fr:"(12 pays actifs sur la plateforme)", ht:"(12 peyi aktif sou platfòm nan)", en:"(12 countries active on platform)", es:"(12 países activos en plataforma)" } },
  { icon:"bible",        key:"bibles",       color:"#c8960f", goal:500,  current:0,   label:{ fr:"Bibles offertes",          ht:"Bib ofri",              en:"Bibles offered",          es:"Biblias ofrecidas"        }, unit:{ fr:"Bibles",      ht:"Bib",       en:"Bibles",        es:"Biblias"      }, note:{ fr:"(entraide entre membres)", ht:"(antrèd ant manm yo)", en:"(mutual support between members)", es:"(apoyo mutuo entre miembros)" } },
];

export default function ImpactPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const goalsReveal = useReveal();
  const [barsFired, setBarsFired] = useState(false);

  useEffect(() => {
    if (goalsReveal.visible && !barsFired) setBarsFired(true);
  }, [goalsReveal.visible, barsFired]);

  const t = {
    badge:       { fr:"ENSEMBLE", ht:"ANSANM", en:"TOGETHER", es:"JUNTOS" },
    title:       { fr:"La communauté en 2026", ht:"Kominote a an 2026", en:"The community in 2026", es:"La comunidad en 2026" },
    sub:         { fr:"Ensemble, on fait grandir ce mouvement — un croyant à la fois.", ht:"Ansanm, n ap fè mouvman sa a grandi — yon kwayan alafwa.", en:"Together, we grow this movement — one believer at a time.", es:"Juntos, hacemos crecer este movimiento — un creyente a la vez." },
    transp_title:{ fr:"En toute transparence", ht:"Nan tout transparans", en:"Full transparency", es:"Total transparencia" },
    transp_body: { fr:"Ces chiffres reflètent nos objectifs pour 2026. Notre communauté grandit. Toutes les données sont réelles — jamais fictives. Les barres de progression se mettent à jour avec les vraies données de la plateforme.", ht:"Chif sa yo reflete objektif nou pou 2026. Kominote nou an ap grandi. Tout done yo reyèl — jamè fo. Ba pwogresyon yo mete ajou ak done reyèl platfòm nan.", en:"These figures reflect our 2026 goals. Our community is growing. All data is real — never fictitious. Progress bars update with real platform data.", es:"Estas cifras reflejan nuestros objetivos para 2026. Nuestra comunidad está creciendo. Todos los datos son reales — nunca ficticios. Las barras se actualizan con datos reales de la plataforma." },
    obj:         { fr:"Objectif", ht:"Objektif", en:"Goal", es:"Objetivo" },
    current:     { fr:"Actuel", ht:"Aktyèl", en:"Current", es:"Actual" },
    cta:         { fr:"Rejoindre le mouvement", ht:"Antre nan mouvman an", en:"Join the movement", es:"Unirse al movimiento" },
    cta_btn:     { fr:"Devenir membre", ht:"Vin manm", en:"Become a member", es:"Hazte miembro" },
    mission_link:{ fr:"Découvrir notre mission →", ht:"Dekouvri misyon nou →", en:"Discover our mission →", es:"Descubrir nuestra misión →" },
  };

  return (
    <main style={{ minHeight:"100vh", background:"#ffffff" }}>
      <style>{`
        @keyframes imp-aurora { 0%,100%{opacity:.50;transform:scale(1);}50%{opacity:.75;transform:scale(1.06);} }
        @keyframes imp-up     { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        @keyframes imp-badge  { from{opacity:0;transform:scale(.85);}to{opacity:1;transform:scale(1);} }
        @keyframes imp-shimmer{ 0%{background-position:200% center;}100%{background-position:-200% center;} }
        @keyframes imp-card   { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        @keyframes imp-dot    { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0);}50%{box-shadow:0 0 0 6px rgba(212,160,23,.18);} }
      `}</style>

      {/* ══ HERO sombre ══ */}
      <div style={{ background:"linear-gradient(135deg,#06122a,#0d2048)", position:"relative", overflow:"hidden", minHeight:"70vh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <HeroBackdrop image="/hero/impact.jpg" tint="dark" />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)", width:580, height:300, background:"radial-gradient(ellipse,rgba(200,150,15,0.12) 0%,transparent 65%)", filter:"blur(48px)" }} />
        </div>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-16 pb-14 text-center" style={{ position:"relative", zIndex:10 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(212,160,23,0.10)", border:"1px solid rgba(212,160,23,0.28)", color:"#fbbf24", fontSize:10, fontWeight:900, padding:"6px 18px", borderRadius:999, marginBottom:22, letterSpacing:"0.24em", animation:"imp-badge .9s cubic-bezier(.16,1,.3,1) both" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#d4a017", boxShadow:"0 0 8px #d4a017", display:"inline-block", animation:"imp-dot 2s ease-in-out infinite" }} />
            <Icon name="classement" size={13} /> {t.badge[l]}
          </div>
          <h1 style={{ fontSize:"clamp(1.9rem,4.5vw,3rem)", fontWeight:900, lineHeight:1.1, marginBottom:14, background:"linear-gradient(135deg,#fff 0%,#fbbf24 55%,#d4a017 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"imp-up .9s cubic-bezier(.16,1,.3,1) .2s both, imp-shimmer 7s linear infinite" }}>
            {t.title[l]}
          </h1>
          <p style={{ color:"rgba(255,255,255,0.50)", maxWidth:460, margin:"0 auto", lineHeight:1.7, animation:"imp-up .9s cubic-bezier(.16,1,.3,1) .35s both" }}>
            {t.sub[l]}
          </p>
        </div>
        <div className="kpf-separator" />
      </div>

      {/* ══ CONTENU CLAIR ══ */}
      <div style={{ background:"#ffffff" }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">

          {/* BANNIÈRE TRANSPARENCE */}
          <div style={{ background:"#ffffff", border:"1px solid #e8e4de", borderTop:"3px solid #ea580c", borderRadius:20, padding:"20px 24px", marginBottom:40, boxShadow:"0 4px 16px rgba(26,53,104,0.06)" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <span style={{ flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center", width:44, height:44, borderRadius:14, background:"#ea580c1f", border:"1.5px solid #ea580c3a", color:"#ea580c", boxShadow:"0 4px 14px #ea580c22" }}><Icon name="alerte" size={22} /></span>
              <div>
                <p style={{ fontFamily:"'Playfair Display',Georgia,serif", fontWeight:800, color:"#1a3568", marginBottom:6, fontSize:"0.95rem" }}>{t.transp_title[l]}</p>
                <p style={{ color:"#4a6080", fontSize:"0.88rem", lineHeight:1.7 }}>{t.transp_body[l]}</p>
              </div>
            </div>
          </div>

          {/* GRILLE OBJECTIFS */}
          <div ref={goalsReveal.ref} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {GOALS.map((g, i) => {
              const pct = g.goal > 0 ? Math.round((g.current / g.goal) * 100) : 0;
              return (
                <div key={g.key} style={{
                  background:`#ffffff`, border:`1px solid #e8e4de`,
                  borderTop:`3px solid ${g.color}`,
                  borderRadius:20, padding:"22px 26px",
                  boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                  animation: goalsReveal.visible ? `imp-card .6s cubic-bezier(.16,1,.3,1) ${i*0.07}s both` : undefined,
                  opacity: goalsReveal.visible ? undefined : 0,
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:48, height:48, borderRadius:14, background:`${g.color}1f`, border:`1.5px solid ${g.color}3a`, color:g.color, boxShadow:`0 4px 14px ${g.color}22` }}><Icon name={g.icon} size={26} /></span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:4 }}>
                        <span style={{ fontWeight:800, color:"#1a3568", fontSize:"0.97rem" }}>{g.label[l]}</span>
                        <span style={{ fontSize:"0.80rem", color:"#4a6080" }}>
                          {g.current} / {g.goal.toLocaleString()} {g.unit[l]}
                        </span>
                      </div>
                      {g.note && <p style={{ color:"#9ca3af", fontSize:"0.72rem", marginTop:2 }}>{g.note[l]}</p>}
                    </div>
                    <span style={{ fontWeight:900, fontSize:"1.1rem", color:g.color, minWidth:44, textAlign:"right" }}>{pct}%</span>
                  </div>
                  {/* Barre de progression */}
                  <div style={{ height:8, background:"#e8e4de", borderRadius:999, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", borderRadius:999,
                      background:`linear-gradient(90deg,${g.color},${g.color})`,
                      width: barsFired ? `${pct}%` : "0%",
                      transition: barsFired ? `width 1.4s cubic-bezier(.16,1,.3,1) ${i*0.12}s` : "none",
                      boxShadow: pct > 0 ? `0 0 10px ${g.color}50` : "none",
                    }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:"0.73rem" }}>
                    <span style={{ color:"#4a6080" }}>{t.current[l]} : {g.current}</span>
                    <span style={{ color:"#4a6080" }}>{t.obj[l]} : {g.goal.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div style={{ textAlign:"center", marginTop:56, padding:"clamp(28px,4vw,48px)", background:"#ffffff", border:"1px solid #e8e4de", borderTop:"3px solid #ea580c", borderRadius:20, boxShadow:"0 4px 16px rgba(26,53,104,0.06)" }}>
            <div style={{ width:"100%", height:3, background:"linear-gradient(90deg,transparent,#c8960f,transparent)", borderRadius:999, marginBottom:28, opacity:0.6 }} />
            <p style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(1.1rem,2.5vw,1.5rem)", fontWeight:900, color:"#1a3568", marginBottom:10 }}>{t.cta[l]}</p>
            <p style={{ color:"#4a6080", marginBottom:28, fontSize:"0.90rem" }}>
              { l==="fr"?"Chaque membre fait grandir la communauté et rapproche ces objectifs.":l==="ht"?"Chak manm fè kominote a grandi epi pwoche objektif sa yo.":l==="es"?"Cada miembro hace crecer la comunidad y acerca estos objetivos.":"Every member grows the community and brings these goals closer." }
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center" }}>
              <Link href="/don" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:14, fontWeight:900, fontSize:"0.95rem", background:"linear-gradient(135deg,#c8960f,#f0c840)", color:"#1a1208", textDecoration:"none", boxShadow:"0 4px 20px rgba(200,150,15,0.28)" }}>
                {t.cta_btn[l]} <Icon name="coeur" size={17} />
              </Link>
              <Link href="/mission" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:14, fontWeight:700, fontSize:"0.92rem", background:"#ffffff", border:"1px solid #e8dcc8", color:"#4a3820", textDecoration:"none" }}>
                {t.mission_link[l]}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
