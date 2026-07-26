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

export default function ProjetsPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const active  = useReveal();
  const coming  = useReveal();

  const t = {
    badge:    { fr:"NOS PROJETS", ht:"PWOJÈ NOU", en:"OUR PROJECTS", es:"NUESTROS PROYECTOS" },
    title:    { fr:"Des projets qui transforment des vies", ht:"Pwojè ki transfòme lavi", en:"Projects that transform lives", es:"Proyectos que transforman vidas" },
    sub:      { fr:"Chaque projet est réel, concret et mesurable.", ht:"Chak pwojè reyèl, konkrè ak mezurab.", en:"Every project is real, concrete and measurable.", es:"Cada proyecto es real, concreto y medible." },
    warning:  { fr:"KONEKSYON PAM lance ses premières initiatives. Aucun projet fictif n'est affiché ici. Nous bâtissons cette communauté avec transparence et intégrité.", ht:"KONEKSYON PAM ap lanse premye inisyativ li yo. Pa gen pwojè fiksyon ki montre isit la. Nou bati kominote sa a ak transparans ak entegrite.", en:"KONEKSYON PAM is launching its first initiatives. No fictitious projects are displayed here. We build this community with transparency and integrity.", es:"KONEKSYON PAM lanza sus primeras iniciativas. Ningún proyecto ficticio se muestra aquí. Construimos esta comunidad con transparencia e integridad." },
    active_t: { fr:"Projets en cours", ht:"Pwojè aktif", en:"Active projects", es:"Proyectos activos" },
    coming_t: { fr:"Projets à venir", ht:"Pwojè k ap vini", en:"Upcoming projects", es:"Próximos proyectos" },
    active_badge:  { fr:"ACTIF",          ht:"AKTIF",         en:"ACTIVE",          es:"ACTIVO"          },
    prep_badge:    { fr:"EN PRÉPARATION", ht:"AN PREPARASYON",en:"IN PREPARATION",  es:"EN PREPARACIÓN"  },
    cta_title:{ fr:"Soutenir ces initiatives", ht:"Sipòte inisyativ sa yo", en:"Support these initiatives", es:"Apoyar estas iniciativas" },
    cta_sub:  { fr:"Ton soutien fait avancer directement ces initiatives portées par la communauté.", ht:"Sipò ou a fè inisyativ kominote a pote yo avanse dirèkteman.", en:"Your support directly moves these community-led initiatives forward.", es:"Tu apoyo impulsa directamente estas iniciativas de la comunidad." },
    cta_btn:  { fr:"Soutenir la communauté", ht:"Sipòte kominote a", en:"Support the community", es:"Apoyar la comunidad" },
    impact_link: { fr:"Voir nos objectifs →", ht:"Wè objektif nou →", en:"View our goals →", es:"Ver nuestros objetivos →" },
  };

  const ACTIVE_PROJECTS: { icon: IconName; color: string; title: Record<Lang, string>; desc: Record<Lang, string> }[] = [
    { icon:"trophee", color:"#c8960f", title:{ fr:"Championnats Bibliques Internationaux", ht:"Chanpyona Biblik Entènasyonal", en:"International Biblical Championships", es:"Campeonatos Bíblicos Internacionales" }, desc:{ fr:"Championnats bibliques en temps réel, accessibles dans 12+ pays, en 4 langues. Des milliers de participants testent et approfondissent leur connaissance de la Parole de Dieu.", ht:"Chanpyona biblik an tan reyèl, aksesib nan 12+ peyi, nan 4 lang. Dè milye patisipan teste ak apwofondi konesans yo nan Pawòl Bondye a.", en:"Real-time biblical championships, accessible in 12+ countries, in 4 languages. Thousands of participants test and deepen their knowledge of God's Word.", es:"Campeonatos bíblicos en tiempo real, accesibles en más de 12 países, en 4 idiomas. Miles de participantes prueban y profundizan su conocimiento de la Palabra de Dios." } },
    { icon:"bible", color:"#1a3568", title:{ fr:"Académie Biblique en ligne", ht:"Akademi Biblik sou entènèt", en:"Online Biblical Academy", es:"Academia Bíblica en línea" }, desc:{ fr:"Parcours de formation biblique en ligne : études approfondies, séries thématiques, Psaumes, enseignements doctrinaux. Accessible gratuitement à tous les croyants.", ht:"Kous fòmasyon biblik sou entènèt : etid apwofondi, seri tematik, Sòm, ansèyman doktrinal. Gratis pou tout kwayan.", en:"Online biblical training: in-depth studies, thematic series, Psalms, doctrinal teachings. Free for all believers.", es:"Formación bíblica en línea: estudios profundos, series temáticas, Salmos, enseñanzas doctrinales. Gratuito para todos los creyentes." } },
    { icon:"monde", color:"#16a34a", title:{ fr:"Évangélisation numérique", ht:"Evanjelizasyon nimerik", en:"Digital evangelization", es:"Evangelización digital" }, desc:{ fr:"Prières, témoignages, louange, Bible et communauté en ligne. La Parole de Dieu accessible à travers le monde via internet, dans 4 langues.", ht:"Lapriyè, temwayaj, lwanj, Bib ak kominote sou entènèt. Pawòl Bondye a aksesib nan tout mond lan atravè entènèt, nan 4 lang.", en:"Prayer, testimonies, worship, Bible and online community. God's Word accessible worldwide via the internet, in 4 languages.", es:"Oración, testimonios, alabanza, Biblia y comunidad en línea. La Palabra de Dios accesible en todo el mundo a través de internet, en 4 idiomas." } },
  ];

  const COMING_PROJECTS: { icon: IconName; color: string; title: Record<Lang, string>; desc: Record<Lang, string> }[] = [
    { icon:"bible", color:"#c8960f", title:{ fr:"Distribution de Bibles en Haïti", ht:"Distribisyon Bib nan Ayiti", en:"Bible distribution in Haiti", es:"Distribución de Biblias en Haití" }, desc:{ fr:"Offrir des Bibles physiques aux familles et communautés qui n'y ont pas accès.", ht:"Bay fanmi ak kominote ki pa gen aksè Bib fizik.", en:"Providing physical Bibles to families and communities who don't have access.", es:"Proporcionar Biblias físicas a familias y comunidades que no tienen acceso." } },
    { icon:"academie", color:"#16a34a", title:{ fr:"Soutien scolaire", ht:"Sipò lekòl", en:"School support", es:"Apoyo escolar" }, desc:{ fr:"Fournitures scolaires, bourses et partenariats avec des écoles chrétiennes.", ht:"Founiti lekòl, bous etid ak patenarya ak lekòl kretyen.", en:"School supplies, scholarships and partnerships with Christian schools.", es:"Útiles escolares, becas y alianzas con escuelas cristianas." } },
    { icon:"main_coeur", color:"#be185d", title:{ fr:"Aide alimentaire", ht:"Èd alimantè", en:"Food aid", es:"Ayuda alimentaria" }, desc:{ fr:"Distribution de repas et soutien aux familles dans le besoin.", ht:"Distribisyon manje ak sipò fanmi ki nan bezwen.", en:"Meal distribution and support for families in need.", es:"Distribución de comidas y apoyo a familias necesitadas." } },
    { icon:"eglise", color:"#7c3aed", title:{ fr:"Missions terrain", ht:"Misyon tèren", en:"Field missions", es:"Misiones de campo" }, desc:{ fr:"Évangélisation, cultes et entraide au sein des communautés locales.", ht:"Evanjelizasyon, sèvis relijye ak antrèd nan kominote lokal yo.", en:"Evangelism, worship services and mutual aid within local communities.", es:"Evangelismo, cultos y ayuda mutua dentro de las comunidades locales." } },
  ];

  return (
    <main style={{ minHeight:"100vh", background:"#ffffff" }}>
      <style>{`
        @keyframes prj-aurora { 0%,100%{opacity:.48;transform:scale(1);}50%{opacity:.72;transform:scale(1.06);} }
        @keyframes prj-up     { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        @keyframes prj-badge  { from{opacity:0;transform:scale(.85);}to{opacity:1;transform:scale(1);} }
        @keyframes prj-shimmer{ 0%{background-position:200% center;}100%{background-position:-200% center;} }
        @keyframes prj-card   { from{opacity:0;transform:translateY(24px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes prj-dot    { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0);}50%{box-shadow:0 0 0 5px rgba(212,160,23,.18);} }
        .prj-active-card { transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease,border-top-color .25s; }
        .prj-active-card:hover { transform:translateY(-4px); box-shadow:0 10px 32px rgba(200,150,15,0.12); border-top:3px solid #c8960f !important; }
        .prj-coming-card { transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease; }
        .prj-coming-card:hover { transform:translateY(-4px); box-shadow:0 8px 24px rgba(0,0,0,0.07); }
      `}</style>

      {/* ══ HERO sombre ══ */}
      <div style={{ background:"linear-gradient(135deg,#06122a,#0d2048)", position:"relative", overflow:"hidden", minHeight:"70vh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <HeroBackdrop image="/hero/projets.jpg" tint="dark" />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)", width:580, height:300, background:"radial-gradient(ellipse,rgba(200,150,15,0.11) 0%,transparent 65%)", filter:"blur(48px)" }} />
        </div>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-16 pb-14 text-center" style={{ position:"relative", zIndex:10 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(212,160,23,0.10)", border:"1px solid rgba(212,160,23,0.28)", color:"#fbbf24", fontSize:10, fontWeight:900, padding:"6px 18px", borderRadius:999, marginBottom:22, letterSpacing:"0.24em", animation:"prj-badge .9s cubic-bezier(.16,1,.3,1) both" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#d4a017", boxShadow:"0 0 8px #d4a017", display:"inline-block", animation:"prj-dot 2s ease-in-out infinite" }} />
            <Icon name="monde" size={13} /> {t.badge[l]}
          </div>
          <h1 style={{ fontSize:"clamp(1.9rem,4.5vw,3rem)", fontWeight:900, lineHeight:1.1, marginBottom:14, background:"linear-gradient(135deg,#fff 0%,#fbbf24 55%,#d4a017 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"prj-up .9s cubic-bezier(.16,1,.3,1) .2s both, prj-shimmer 7s linear infinite" }}>
            {t.title[l]}
          </h1>
          <p style={{ color:"rgba(255,255,255,0.45)", maxWidth:460, margin:"0 auto", lineHeight:1.7, animation:"prj-up .9s cubic-bezier(.16,1,.3,1) .35s both" }}>{t.sub[l]}</p>
        </div>
        <div className="kpf-separator" />
      </div>

      {/* ══ CONTENU CLAIR ══ */}
      <div style={{ background:"#ffffff" }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">

          {/* Bannière transparence */}
          <div style={{ background:"#fffdf9", border:"1px solid #e8e4de", borderLeft:"4px solid #c8960f", borderRadius:16, padding:"18px 22px", marginBottom:44, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
            <p style={{ color:"#4a6080", fontSize:"0.88rem", lineHeight:1.7 }}>
              <span style={{ color:"#c8960f", fontWeight:800, display:"inline-flex", alignItems:"center", gap:6, verticalAlign:"middle" }}><Icon name="alerte" size={15} /> Transparence : </span>{t.warning[l]}
            </p>
          </div>

          {/* Projets actifs */}
          <div ref={active.ref}>
            <h2 style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(1.1rem,2.5vw,1.5rem)", fontWeight:900, color:"#1a3568", marginBottom:20 }}><Icon name="succes" size={22} color="#16a34a" /> {t.active_t[l]}</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:48 }}>
              {ACTIVE_PROJECTS.map((p, i) => (
                <div key={i} className="prj-active-card" style={{
                  background:`#ffffff`, border:`1px solid #e8e4de`,
                  borderTop:`3px solid ${p.color}`,
                  borderRadius:20, padding:"22px 24px",
                  boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                  animation: active.visible ? `prj-card .6s cubic-bezier(.16,1,.3,1) ${i*0.08}s both` : undefined,
                  opacity: active.visible ? undefined : 0,
                  position:"relative", overflow:"hidden",
                }}>
                  <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:`linear-gradient(180deg,${p.color},${p.color}60)`, borderRadius:"20px 0 0 20px" }} />
                  <div style={{ display:"flex", alignItems:"flex-start", gap:16, paddingLeft:8 }}>
                    <span style={{ flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center", width:54, height:54, borderRadius:14, background:`${p.color}1f`, border:`1.5px solid ${p.color}3a`, color:p.color, boxShadow:`0 4px 14px ${p.color}22` }}><Icon name={p.icon} size={28} /></span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
                        <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontWeight:800, color:"#1a3568", fontSize:"0.97rem" }}>{p.title[l]}</h3>
                        <span style={{ fontSize:"0.68rem", fontWeight:800, padding:"2px 10px", borderRadius:999, background:"rgba(0,170,200,0.10)", color:"#00aac8", border:"1px solid rgba(0,170,200,0.25)", letterSpacing:"0.12em" }}>{t.active_badge[l]}</span>
                      </div>
                      <p style={{ color:"#4a6080", fontSize:"0.85rem", lineHeight:1.65 }}>{p.desc[l]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projets à venir */}
          <div ref={coming.ref}>
            <h2 style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(1.1rem,2.5vw,1.5rem)", fontWeight:900, color:"#1a3568", marginBottom:20 }}><Icon name="chrono" size={22} color="#b45309" /> {t.coming_t[l]}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16, marginBottom:48 }}>
              {COMING_PROJECTS.map((p, i) => (
                <div key={i} className="prj-coming-card" style={{
                  background:`#ffffff`, border:"1px solid #e8e4de",
                  borderTop:`3px solid ${p.color}`,
                  borderRadius:20, padding:"22px 20px",
                  boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                  animation: coming.visible ? `prj-card .6s cubic-bezier(.16,1,.3,1) ${i*0.08}s both` : undefined,
                  opacity: coming.visible ? undefined : 0,
                }}>
                  <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:48, height:48, borderRadius:14, marginBottom:12, background:`${p.color}1f`, border:`1.5px solid ${p.color}3a`, color:p.color, boxShadow:`0 4px 14px ${p.color}22` }}><Icon name={p.icon} size={24} /></div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                    <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontWeight:800, color:"#1a3568", fontSize:"0.90rem" }}>{p.title[l]}</h3>
                    <span style={{ fontSize:"0.65rem", fontWeight:800, padding:"2px 9px", borderRadius:999, background:"#fffbf0", color:"#c8960f", border:"1px solid #e8c86c", letterSpacing:"0.10em" }}>{t.prep_badge[l]}</span>
                  </div>
                  <p style={{ color:"#4a6080", fontSize:"0.82rem", lineHeight:1.6 }}>{p.desc[l]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign:"center", padding:"clamp(28px,4vw,44px)", background:"#ffffff", border:"1px solid #e8e4de", borderTop:"3px solid #16a34a", borderRadius:20, boxShadow:"0 4px 16px rgba(26,53,104,0.06)" }}>
            <div style={{ width:"100%", height:3, background:"linear-gradient(90deg,transparent,#c8960f,transparent)", borderRadius:999, marginBottom:24, opacity:0.6 }} />
            <p style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(1.1rem,2.5vw,1.4rem)", fontWeight:900, color:"#1a3568", marginBottom:8 }}>{t.cta_title[l]}</p>
            <p style={{ color:"#4a6080", marginBottom:26, fontSize:"0.88rem" }}>{t.cta_sub[l]}</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center" }}>
              <Link href="/don" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:14, fontWeight:900, fontSize:"0.95rem", background:"linear-gradient(135deg,#c8960f,#f0c840)", color:"#1a1208", textDecoration:"none", boxShadow:"0 4px 20px rgba(200,150,15,0.28)" }}>{t.cta_btn[l]} <Icon name="coeur" size={17} /></Link>
              <Link href="/impact" style={{ display:"inline-flex", alignItems:"center", padding:"14px 28px", borderRadius:14, fontWeight:700, fontSize:"0.90rem", background:"#ffffff", border:"1px solid #16a34a3a", color:"#16a34a", textDecoration:"none" }}>{t.impact_link[l]}</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
