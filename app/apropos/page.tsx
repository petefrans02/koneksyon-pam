"use client";
import HeroBackdrop from "@/app/components/HeroBackdrop";

import { useLang } from "@/lib/LangContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

export default function AProposPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;

  const [servicesVis, setServicesVis] = useState(false);
  const [valuesVis, setValuesVis]     = useState(false);
  const [founderVis, setFounderVis]   = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const valuesRef   = useRef<HTMLDivElement>(null);
  const founderRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setServicesVis(true); }, { threshold: 0.05 });
    if (servicesRef.current) obs.observe(servicesRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setValuesVis(true); }, { threshold: 0.05 });
    if (valuesRef.current) obs.observe(valuesRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setFounderVis(true); }, { threshold: 0.05 });
    if (founderRef.current) obs.observe(founderRef.current);
    return () => obs.disconnect();
  }, []);

  const mission = {
    fr: "KONEKSYON PAM est une plateforme chrétienne évangélique mondiale dédiée à Jésus-Christ. Nous organisons des championnats bibliques en temps réel, offrons des études de la Parole, des prières et de la louange dans plus de 12 pays. Notre mission : former, équiper, évangéliser et servir — unir les croyants du monde entier. La plateforme est créée et portée par la communauté chrétienne, sous la direction de Pasteur Peterson Francis.",
    ht: "KONEKSYON PAM se yon platfòm kretyen evanjelik mondyal dedye bay Jezi-Kri. Nou òganize chanpyona biblik an tan reyèl, ofri etid Pawòl la, lapriyè ak lwanj nan plis pase 12 peyi. Misyon nou : fòme, ekipe, evanjelizé ak sèvi — ini kwayan nan tout mond lan. Platfòm nan kreye ak sipòte pa kominote kretyen an, sou direksyon Pastè Peterson Francis.",
    en: "KONEKSYON PAM is a global evangelical Christian platform dedicated to Jesus Christ. We organize real-time biblical championships, offer Bible studies, prayers and worship across 12+ countries. Our mission: to form, equip, evangelize and serve — uniting believers worldwide. The platform is created and supported by the Christian community, under Pastor Peterson Francis.",
    es: "KONEKSYON PAM es una plataforma evangélica cristiana mundial dedicada a Jesucristo. Organizamos campeonatos bíblicos en tiempo real, ofrecemos estudios de la Palabra, oración y alabanza en más de 12 países. Nuestra misión: formar, equipar, evangelizar y servir — unir a los creyentes de todo el mundo. La plataforma es creada y sostenida por la comunidad cristiana, bajo el Pastor Peterson Francis.",
  };

  const SERVICES: { icon: IconName; color: string; href: string; title: Record<Lang, string>; desc: Record<Lang, string> }[] = [
    { icon:"trophee", color:"#d4a017", href:"/championnats",   title:{fr:"Championnats Bibliques", ht:"Chanpyona Biblik",  en:"Biblical Championships", es:"Campeonatos Bíblicos" }, desc:{fr:"Championnats en temps réel sur la Parole de Dieu — Bible, Psaumes, Histoire sainte, Théologie. Ouverts à tous les croyants.",ht:"Chanpyona an tan reyèl sou Pawòl Bondye a — Bib, Sòm, Istwa Sen, Teyoloji. Ouvè pou tout kwayan.",en:"Real-time championships on God's Word — Bible, Psalms, Sacred History, Theology. Open to all believers.",es:"Campeonatos en tiempo real sobre la Palabra de Dios — Biblia, Salmos, Historia Sagrada, Teología."} },
    { icon:"bible", color:"#60a5fa", href:"/bible",      title:{fr:"Bible & La Parole",     ht:"Bib & Pawòl la",    en:"Bible & The Word",     es:"Biblia & La Palabra"  }, desc:{fr:"Accès complet à la Sainte Bible, verset du jour, Psaumes et études approfondies de la Parole.",ht:"Aksè konplè nan Bib Sen an, vèsè jou a, Sòm ak etid apwofondi Pawòl la.",en:"Full access to the Holy Bible, verse of the day, Psalms and in-depth Word studies.",es:"Acceso completo a la Santa Biblia, versículo del día, Salmos y estudios profundos de la Palabra."} },
    { icon:"priere", color:"#7c3aed", href:"/prieres",    title:{fr:"Prière & Témoignages",  ht:"Lapriyè & Temwayaj",en:"Prayer & Testimonies",  es:"Oración & Testimonios"}, desc:{fr:"Partagez vos demandes de prière, vos témoignages de foi et intercédez les uns pour les autres.",ht:"Pataje demann lapriyè ou, temwayaj lafwa ou ak entèsede youn pou lòt.",en:"Share prayer requests, faith testimonies and intercede for one another.",es:"Comparte peticiones de oración, testimonios de fe e intercede los unos por los otros."} },
    { icon:"louange", color:"#ec4899", href:"/louange",    title:{fr:"Louange & Adoration",   ht:"Lwanj & Adowasyon", en:"Worship & Praise",     es:"Alabanza & Adoración" }, desc:{fr:"Chants chrétiens, adoration et communauté de louange pour glorifier Dieu ensemble.",ht:"Chan kretyen, adowasyon ak kominote lwanj pou glorifye Bondye ansanm.",en:"Christian songs, worship and praise community to glorify God together.",es:"Canciones cristianas, adoración y comunidad de alabanza para glorificar a Dios juntos."} },
    { icon:"communaute", color:"#22c55e", href:"/communaute", title:{fr:"Communauté & Église",   ht:"Kominote & Legliz", en:"Community & Church",   es:"Comunidad & Iglesia"  }, desc:{fr:"Rejoignez ou créez votre église sur KP avec publications, sous-groupes et gestion des membres.",ht:"Rantre oswa kreye legliz ou sou KP ak piblikasyon, sou-gwoup ak jesyon manm yo.",en:"Join or create your church on KP with posts, subgroups and member management.",es:"Únete o crea tu iglesia en KP con publicaciones, subgrupos y gestión de miembros."} },
    { icon:"monde", color:"#38bdf8", href:"/classement", title:{fr:"Mission Mondiale",       ht:"Misyon Mondyal",    en:"World Mission",        es:"Misión Mundial"       }, desc:{fr:"12 pays, 4 continents. KONEKSYON PAM unit la diaspora haïtienne, l'Afrique et toutes les nations autour de la Parole.",ht:"12 peyi, 4 kontinen. KONEKSYON PAM ini dyaspora ayisyen an, Afrik ak tout nasyon yo alantou Pawòl la.",en:"12 countries, 4 continents. KONEKSYON PAM unites the Haitian diaspora, Africa and all nations around the Word.",es:"12 países, 4 continentes. KONEKSYON PAM une a la diáspora haitiana, África y todas las naciones alrededor de la Palabra."} },
  ];

  const VALUES: { icon: IconName; label: Record<Lang, string>; desc: Record<Lang, string> }[] = [
    { icon:"monde", label:{fr:"Universel",    ht:"Inivèsèl",  en:"Universal",   es:"Universal"  }, desc:{fr:"Ouvert à tous les croyants, quelle que soit leur langue, nation ou culture.",ht:"Ouvè pou tout kwayan, kèlkeswa lang, nasyon oswa kilti yo.",en:"Open to all believers, regardless of their language, nation or culture.",es:"Abierto a todos los creyentes, sin importar su idioma, nación o cultura."} },
    { icon:"croix", label:{fr:"Évangélique",  ht:"Evanjelik", en:"Evangelical", es:"Evangélico" }, desc:{fr:"La Parole de Dieu et l'Évangile de Jésus-Christ sont au cœur de tout ce que nous faisons.",ht:"Pawòl Bondye ak Levanjil Jezi-Kri se nan kè tout sa nou fè.",en:"God's Word and the Gospel of Jesus Christ are at the heart of everything we do.",es:"La Palabra de Dios y el Evangelio de Jesucristo están en el corazón de todo lo que hacemos."} },
    { icon:"priere", label:{fr:"Chrétien",     ht:"Kretyen",   en:"Christian",   es:"Cristiano"  }, desc:{fr:"Créé par la communauté chrétienne, avec des valeurs d'amour, de service et d'excellence.",ht:"Kreye pa kominote kretyen an, ak valè renmen, sèvis ak ekselans.",en:"Built by the Christian community, with values of love, service and excellence.",es:"Construido por la comunidad cristiana, con valores de amor, servicio y excelencia."} },
    { icon:"cadeau", label:{fr:"Gratuit",      ht:"Gratis",    en:"Free",        es:"Gratuito"   }, desc:{fr:"Toujours gratuit pour tous les croyants, les familles et les communautés du monde entier.",ht:"Toujou gratis pou tout kwayan, fanmi ak kominote nan tout mond lan.",en:"Always free for all believers, families and communities worldwide.",es:"Siempre gratuito para todos los creyentes, familias y comunidades del mundo entero."} },
  ];

  const VALUE_COLORS = ["#c8960f", "#2563eb", "#7c3aed", "#16a34a"];

  const tagline        = { fr:"Croire. Grandir. Rayonner.", ht:"Kwè. Grandi. Klere.", en:"Believe. Grow. Shine.", es:"Creer. Crecer. Brillar." };
  const subtitle       = { fr:"La plateforme évangélique mondiale créée par la communauté chrétienne.", ht:"Platfòm evanjelik mondyal kreye pa kominote kretyen an.", en:"The global evangelical platform built by the Christian community.", es:"La plataforma evangélica mundial creada por la comunidad cristiana." };
  const sectionMission  = { fr:"Notre Mission",   ht:"Misyon Nou",    en:"Our Mission",   es:"Nuestra Misión"  };
  const sectionServices = { fr:"Ce que nous offrons", ht:"Sa nou ofri", en:"What we offer", es:"Lo que ofrecemos" };
  const sectionValues   = { fr:"Nos Valeurs",     ht:"Valè Nou",      en:"Our Values",    es:"Nuestros Valores" };
  const sectionFounder  = { fr:"Notre Fondateur", ht:"Fondatè Nou",   en:"Our Founder",   es:"Nuestro Fundador" };
  const founderDesc = {
    fr:"Pasteur Peterson Francis est le fondateur de KONEKSYON PAM et créateur de la chaîne YouTube inspirationnelle et évangélique avec plus de 30 000 abonnés. Passionné de la Parole de Dieu et de technologie, il a bâti cette plateforme pour que chaque croyant du monde puisse grandir dans la foi, adorer Dieu et partager l'Évangile.",
    ht:"Pastè Peterson Francis se fondatè KONEKSYON PAM ak kreyatè chèn YouTube enspirasyonèl ak evanjelik ak plis pase 30 000 abòne. Pasyone pou Pawòl Bondye ak teknoloji, li bati platfòm sa a pou chak kwayan nan mond lan ka grandi nan lafwa, adore Bondye ak pataje Levanjil la.",
    en:"Pastor Peterson Francis is the founder of KONEKSYON PAM and creator of the inspirational and evangelical YouTube channel with over 30,000 subscribers. Passionate about God's Word and technology, he built this platform so every believer in the world can grow in faith, worship God and share the Gospel.",
    es:"El Pastor Peterson Francis es el fundador de KONEKSYON PAM y creador del canal de YouTube inspiracional y evangélico con más de 30,000 suscriptores. Apasionado por la Palabra de Dios y la tecnología, construyó esta plataforma para que cada creyente del mundo pueda crecer en la fe, adorar a Dios y compartir el Evangelio.",
  };
  const ctaJoin  = { fr:"Rejoindre la plateforme →",    ht:"Rantre sou platfòm nan →", en:"Join the platform →",         es:"Unirse a la plataforma →"    };
  const ctaChamp = { fr:"Voir les championnats bibliques →", ht:"Wè chanpyona biblik yo →", en:"See biblical championships →", es:"Ver campeonatos bíblicos →" };

  const STATS = [
    { n:"24K+", label:{fr:"Membres",  ht:"Manm",  en:"Members",   es:"Miembros"  } },
    { n:"12+",  label:{fr:"Pays",     ht:"Peyi",  en:"Countries", es:"Países"    } },
    { n:"60+",  label:{fr:"Nations",  ht:"Nasyon",en:"Nations",   es:"Naciones"  } },
  ];

  return (
    <main className="animate-page-awaken" style={{ background:"#ffffff", minHeight:"100vh", color:"#1c1c2e" }}>
      <style>{`
        @keyframes apr-aurora {
          0%,100% { opacity:.50; transform:scale(1) translateY(0); }
          50%      { opacity:.80; transform:scale(1.07) translateY(-14px); }
        }
        @keyframes apr-orb-a {
          0%,100% { transform:translate(0,0); }
          40%      { transform:translate(22px,-26px); }
          70%      { transform:translate(-14px,18px); }
        }
        @keyframes apr-orb-b {
          0%,100% { transform:translate(0,0); }
          35%      { transform:translate(-24px,20px); }
          68%      { transform:translate(18px,-14px); }
        }
        @keyframes apr-ring {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes apr-ring2 {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes apr-up {
          from { opacity:0; transform:translateY(22px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes apr-badge {
          from { opacity:0; transform:scale(.82) translateY(-8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes apr-card-in {
          from { opacity:0; transform:translateY(28px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes apr-shimmer {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes apr-icon-float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-10px); }
        }
        @keyframes apr-stat-in {
          from { opacity:0; transform:scale(.88) translateY(14px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes apr-dot-pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(200,150,15,0); }
          50%      { box-shadow:0 0 0 6px rgba(200,150,15,0.22); }
        }
        .apr-card-reveal { animation: apr-card-in .65s cubic-bezier(.16,1,.3,1) both; }
        .apr-stat-reveal { animation: apr-stat-in  .6s  cubic-bezier(.16,1,.3,1) both; }
        .apr-service-card {
          display:flex; align-items:flex-start; gap:14px; padding:18px;
          border-radius:16px; text-decoration:none; color:inherit;
          transition: transform .38s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .3s ease;
        }
        .apr-service-card:hover {
          transform: translateY(-5px) scale(1.015);
          box-shadow: 0 12px 36px rgba(200,150,15,0.10);
          border-color: #c8960f !important;
          border-top: 3px solid #c8960f !important;
        }
        .apr-value-card {
          display:flex; align-items:flex-start; gap:14px; padding:18px;
          border-radius:16px;
          transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
        }
        .apr-value-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(200,150,15,0.08);
        }
        .apr-cta-primary {
          transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
        }
        .apr-cta-primary:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 10px 28px rgba(200,150,15,0.35); }
        .apr-cta-secondary {
          transition: transform .3s cubic-bezier(.34,1.56,.64,1), border-color .25s;
        }
        .apr-cta-secondary:hover { transform:translateY(-3px); border-color:rgba(200,150,15,0.35) !important; }
      `}</style>

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <div style={{ background:"linear-gradient(135deg,#06122a,#0d2048)", position:"relative", overflow:"hidden", minHeight:"70vh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <HeroBackdrop image="/hero/apropos.jpg" tint="dark" />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{
            position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)",
            width:600, height:300,
            background:"radial-gradient(ellipse,rgba(200,150,15,0.12) 0%,transparent 65%)",
            filter:"blur(48px)",
          }} />
        </div>

        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-16 pb-14 text-center" style={{ position:"relative", zIndex:10 }}>
          {/* Logo */}
          <div style={{
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:80, height:80, borderRadius:20, marginBottom:20,
            background:"rgba(200,150,15,0.10)", border:"1px solid rgba(200,150,15,0.28)",
            animation:"apr-badge .9s cubic-bezier(.16,1,.3,1) both",
          }}>
            <Image src="/logo-kpf.png" alt="KP" width={60} height={60} style={{ borderRadius:14, objectFit:"cover" }} />
          </div>

          {/* Badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(200,150,15,0.10)", border:"1px solid rgba(200,150,15,0.26)",
            color:"#f0c840", fontSize:10, fontWeight:900,
            padding:"6px 18px", borderRadius:999, marginBottom:22, letterSpacing:"0.22em",
            animation:"apr-badge .9s cubic-bezier(.16,1,.3,1) .15s both",
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#c8960f",
              boxShadow:"0 0 8px #c8960f", display:"inline-block",
              animation:"apr-dot-pulse 2s ease-in-out infinite" }} />
            <Icon name="etincelles" size={12} /> KONEKSYON PAM
          </div>

          {/* Titre */}
          <h1 style={{
            fontSize:"clamp(2rem,5vw,3.4rem)", fontWeight:900, lineHeight:1.08, marginBottom:14,
            background:"linear-gradient(135deg,#fff 0%,#f0c840 50%,#c8960f 100%)",
            backgroundSize:"200% auto",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            animation:"apr-up .9s cubic-bezier(.16,1,.3,1) .25s both, apr-shimmer 7s linear infinite",
          }}>
            {tagline[l]}
          </h1>

          {/* Sous-titre */}
          <p style={{
            color:"rgba(255,255,255,0.46)", maxWidth:540, margin:"0 auto 28px",
            lineHeight:1.7, fontSize:"0.97rem",
            animation:"apr-up .9s cubic-bezier(.16,1,.3,1) .42s both",
          }}>
            {subtitle[l]}
          </p>

          {/* Icônes flottantes */}
          <div style={{
            display:"flex", justifyContent:"center", gap:26, marginBottom:32,
            animation:"apr-up .9s cubic-bezier(.16,1,.3,1) .55s both",
          }}>
            {(["monde","croix","priere","trophee","bible"] as IconName[]).map((icon,i) => (
              <span key={icon} style={{
                color:"#f0c840",
                animation:`apr-icon-float ${3.2+i*0.4}s ease-in-out infinite`,
                animationDelay:`${i*0.18}s`,
                filter:"drop-shadow(0 0 9px rgba(200,150,15,0.35))",
              }}><Icon name={icon} size={24} /></span>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" as const,
            animation:"apr-up .9s cubic-bezier(.16,1,.3,1) .68s both",
          }}>
            {STATS.map((s,i) => (
              <div key={s.n} className="apr-stat-reveal" style={{
                animationDelay:`${i*0.1}s`,
                background:"rgba(200,150,15,0.07)", border:"1px solid rgba(200,150,15,0.18)",
                borderRadius:16, padding:"14px 24px", textAlign:"center", minWidth:110,
              }}>
                <p style={{ fontSize:"1.5rem", fontWeight:900, color:"#f0c840" }}>{s.n}</p>
                <p style={{ fontSize:"0.70rem", color:"rgba(255,255,255,0.32)", marginTop:3 }}>{s.label[l]}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(200,150,15,0.22),transparent)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12" style={{ display:"flex", flexDirection:"column" as const, gap:28 }}>

        {/* ══ MISSION ═════════════════════════════════════════════════════ */}
        <div style={{
          background:"#ffffff",
          border:"1px solid #e8e4de", borderLeft:"4px solid #c8960f", borderTop:"3px solid #c8960f", borderRadius:20, padding:32, position:"relative",
          boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
        }}>
          <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:900, letterSpacing:"0.22em", color:"#c8960f", marginBottom:10, textTransform:"uppercase" as const }}><Icon name="cible" size={14} /> {sectionMission[l]}</p>
          <div style={{ width:48, height:3, background:"linear-gradient(90deg,#c8960f,#f0c840)", borderRadius:999, marginBottom:16 }} />
          <h2 style={{ color:"#1a3568", fontWeight:900, fontSize:"1.2rem", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:14 }}>{tagline[l]}</h2>
          <p style={{ color:"#4a6080", lineHeight:1.75, fontSize:"0.94rem" }}>{mission[l]}</p>
        </div>

        {/* ══ SERVICES ════════════════════════════════════════════════════ */}
        <div ref={servicesRef}>
          <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:900, letterSpacing:"0.22em", color:"#00aac8", marginBottom:8, textTransform:"uppercase" as const }}>
            <Icon name="parametres" size={14} /> {sectionServices[l]}
          </p>
          <div style={{ width:48, height:3, background:"linear-gradient(90deg,#c8960f,#f0c840)", borderRadius:999, marginBottom:20 }} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
            {SERVICES.map((s,i) => (
              <Link key={s.href} href={s.href}
                className={`apr-service-card${servicesVis?" apr-card-reveal":""}`}
                style={{
                  animationDelay:`${i*0.07}s`,
                  background:`#ffffff`,
                  border:`1px solid #e8e4de`, borderTop:`3px solid ${s.color}`, borderRadius:16,
                  boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                  opacity: servicesVis ? undefined : 0,
                }}
              >
                <span style={{
                  flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center",
                  width:48, height:48, borderRadius:12,
                  background:`${s.color}1f`, border:`1.5px solid ${s.color}3a`,
                  color:s.color, boxShadow:`0 4px 14px ${s.color}22`,
                }}><Icon name={s.icon} size={26} /></span>
                <div>
                  <h3 style={{ fontWeight:900, fontSize:"0.90rem", color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:5 }}>{s.title[l]}</h3>
                  <p style={{ color:"#4a6080", fontSize:"0.76rem", lineHeight:1.65 }}>{s.desc[l]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══ VALUES ══════════════════════════════════════════════════════ */}
        <div ref={valuesRef} style={{ background:"#ffffff", borderRadius:20, padding:"28px 24px" }}>
          <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:900, letterSpacing:"0.22em", color:"#c8960f", marginBottom:8, textTransform:"uppercase" as const }}>
            <Icon name="etincelles" size={14} /> {sectionValues[l]}
          </p>
          <div style={{ width:48, height:3, background:"linear-gradient(90deg,#c8960f,#f0c840)", borderRadius:999, marginBottom:20 }} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
            {VALUES.map((v,i) => {
              const vc = VALUE_COLORS[i % VALUE_COLORS.length];
              return (
              <div key={v.label.fr}
                className={`apr-value-card${valuesVis?" apr-card-reveal":""}`}
                style={{
                  animationDelay:`${i*0.08}s`,
                  background:`#ffffff`,
                  border:"1px solid #e8e4de", borderTop:`3px solid ${vc}`, borderRadius:16,
                  boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                  opacity: valuesVis ? undefined : 0,
                }}
              >
                <span style={{
                  flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center",
                  width:48, height:48, borderRadius:12,
                  background:`${vc}1f`, border:`1.5px solid ${vc}3a`,
                  color:vc, boxShadow:`0 4px 14px ${vc}22`,
                }}><Icon name={v.icon} size={24} /></span>
                <div>
                  <h3 style={{ color:"#1a3568", fontWeight:900, fontSize:"0.88rem", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:5 }}>{v.label[l]}</h3>
                  <p style={{ color:"#4a6080", fontSize:"0.76rem", lineHeight:1.65 }}>{v.desc[l]}</p>
                </div>
              </div>
            );})}
          </div>
        </div>

        {/* ══ FONDATEUR ═══════════════════════════════════════════════════ */}
        <div ref={founderRef}
          className={founderVis ? "apr-card-reveal" : ""}
          style={{
            background:"#ffffff",
            border:"1px solid #e8e4de", borderLeft:"4px solid #00aac8", borderTop:"3px solid #00aac8", borderRadius:20, padding:32,
            boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
            position:"relative", opacity: founderVis ? undefined : 0,
          }}
        >
          <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:900, letterSpacing:"0.22em", color:"#00aac8", marginBottom:8, textTransform:"uppercase" as const }}><Icon name="utilisateur" size={14} /> {sectionFounder[l]}</p>
          <div style={{ width:48, height:3, background:"linear-gradient(90deg,#c8960f,#f0c840)", borderRadius:999, marginBottom:20 }} />
          <div style={{ display:"flex", alignItems:"flex-start", gap:18, flexWrap:"wrap" as const }}>
            <div style={{
              width:64, height:64, borderRadius:18, flexShrink:0,
              background:"linear-gradient(135deg,#1a3568,#00aac8)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:"1.1rem", fontWeight:900,
              boxShadow:"0 6px 20px rgba(26,53,104,0.25)",
            }}>PF</div>
            <div style={{ flex:1, minWidth:200 }}>
              <h3 style={{ color:"#1a3568", fontWeight:900, fontFamily:"'Playfair Display',Georgia,serif", fontSize:"1rem", marginBottom:8 }}>Pasteur Peterson Francis</h3>
              <p style={{ color:"#4a6080", fontSize:"0.86rem", lineHeight:1.72 }}>{founderDesc[l]}</p>
            </div>
          </div>
        </div>

        {/* ══ CTAs ════════════════════════════════════════════════════════ */}
        <div style={{ display:"flex", flexWrap:"wrap" as const, gap:14, paddingBottom:16 }}>
          <Link href="/auth" className="apr-cta-primary" style={{
            flex:1, minWidth:200,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"16px 24px", borderRadius:16, fontWeight:900, fontSize:"0.9rem",
            background:"linear-gradient(135deg,#1a3568,#0d2048)", color:"#fff",
            textDecoration:"none", boxShadow:"0 6px 20px rgba(26,53,104,0.25)",
          }}>
            {ctaJoin[l]}
          </Link>
          <Link href="/championnats" className="apr-cta-secondary" style={{
            flex:1, minWidth:200,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"16px 24px", borderRadius:16, fontWeight:900, fontSize:"0.9rem",
            background:"linear-gradient(135deg,#c8960f,#f0c840)", color:"#0d1d3d",
            textDecoration:"none", boxShadow:"0 4px 20px rgba(200,150,15,0.25)",
          }}>
            {ctaChamp[l]}
          </Link>
        </div>
      </div>
    </main>
  );
}
