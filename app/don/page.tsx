"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { DONATION_AMOUNTS } from "@/lib/payment";
import PayPalDonateButton from "@/app/components/PayPalDonateButton";
import StripeDonateButton from "@/app/components/StripeDonateButton";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

const STATS = [
  { n: "24K+", fr: "membres",  ht: "manm",   en: "members",   es: "miembros"  },
  { n: "12+",  fr: "pays",     ht: "peyi",   en: "countries", es: "países"    },
  { n: "100%", fr: "gratuit",  ht: "gratis", en: "free",      es: "gratuito"  },
];

const AMOUNTS_LABELS: Record<string, Record<Lang, string>> = {
  amt5:  { fr: "Un café",      ht: "Yon kafe",   en: "A coffee", es: "Un café"     },
  amt10: { fr: "Un repas",     ht: "Yon repa",   en: "A meal",   es: "Una comida"  },
  amt25: { fr: "Une semaine",  ht: "Yon semèn",  en: "A week",   es: "Una semana"  },
  amt50: { fr: "Un mois",      ht: "Yon mwa",    en: "A month",  es: "Un mes"      },
};

const IMPACT_ITEMS: { icon: IconName; fr: string; ht: string; en: string; es: string }[] = [
  { icon: "wifi",    fr: "Hébergement & infrastructure",       ht: "Ebergman & enfrastrikti",          en: "Hosting & infrastructure",        es: "Alojamiento e infraestructura"    },
  { icon: "trophee", fr: "Championnats bibliques en direct",    ht: "Chanpyona biblik an dirèk",        en: "Live biblical championships",      es: "Campeonatos bíblicos en vivo"     },
  { icon: "bible",   fr: "Nouvelles études & enseignements",    ht: "Nouvo etid & ansèyman",            en: "New studies & teachings",          es: "Nuevos estudios y enseñanzas"     },
  { icon: "priere",  fr: "Prière, témoignages & communauté",   ht: "Lapriyè, temwayaj & kominote",     en: "Prayer, testimonies & community",  es: "Oración, testimonios y comunidad" },
  { icon: "psaumes", fr: "Bible, Psaumes & Louange",            ht: "Bib, Sòm & Lwanj",                en: "Bible, Psalms & Worship",          es: "Biblia, Salmos y Alabanza"        },
  { icon: "monde",   fr: "Mission & évangélisation mondiale",   ht: "Misyon & evanjelizasyon mondyal",  en: "Mission & global evangelism",      es: "Misión & evangelización mundial"  },
];

const VISION_POINTS: { icon: IconName; fr: { title: string; body: string }; ht: { title: string; body: string }; en: { title: string; body: string }; es: { title: string; body: string } }[] = [
  {
    icon: "croix",
    fr: { title: "Gratuit pour tous, toujours", body: "Nous croyons que la Parole de Dieu et l'édification spirituelle doivent être accessibles à tous — sans abonnement, sans barrière, quelle que soit ta nation." },
    ht: { title: "Gratis pou tout moun, toujou", body: "Nou kwè Pawòl Bondye ak edifikasyon espirityèl dwe aksesib pou tout moun — san abònman, san baryè, kèlkeswa nasyon ou." },
    en: { title: "Free for everyone, always", body: "We believe God's Word and spiritual edification should be accessible to all — no subscription, no barrier, regardless of your nation." },
    es: { title: "Gratis para todos, siempre", body: "Creemos que la Palabra de Dios y la edificación espiritual deben ser accesibles para todos — sin suscripción, sin barreras, sin importar tu nación." },
  },
  {
    icon: "monde",
    fr: { title: "Une mission mondiale", body: "Partir d'Haïti pour porter l'Évangile au monde entier — 12 pays déjà connectés. KONEKSYON PAM unit la diaspora haïtienne, l'Afrique et toutes les nations autour de la Parole." },
    ht: { title: "Yon misyon mondyal", body: "Pati Ayiti pou pote Levanjil nan tout mond lan — 12 peyi deja konekte. KONEKSYON PAM ini dyaspora ayisyen an, Afrik ak tout nasyon yo alantou Pawòl la." },
    en: { title: "A worldwide mission", body: "Starting from Haiti to bring the Gospel to the world — 12 countries already connected. KONEKSYON PAM unites the Haitian diaspora, Africa and all nations around the Word." },
    es: { title: "Una misión mundial", body: "Desde Haití para llevar el Evangelio al mundo — 12 países ya conectados. KONEKSYON PAM une a la diáspora haitiana, África y todas las naciones alrededor de la Palabra." },
  },
  {
    icon: "priere",
    fr: { title: "Bâtir, pas commercialiser", body: "KONEKSYON PAM n'est pas une entreprise. C'est une mission évangélique portée par la communauté chrétienne mondiale, financée par ceux qu'elle sert." },
    ht: { title: "Bati, pa komèsyalize", body: "KONEKSYON PAM pa yon antrepriz. Se yon misyon evanjelik ki pote pa kominote kretyen mondyal la, finansman pa moun li sèvi yo." },
    en: { title: "Build, not monetize", body: "KONEKSYON PAM is not a business. It is an evangelical mission led by the global Christian community, funded by those it serves." },
    es: { title: "Construir, no monetizar", body: "KONEKSYON PAM no es una empresa. Es una misión evangélica llevada por la comunidad cristiana mundial, financiada por quienes la usan." },
  },
];

const DON_PROJECTS = [
  {
    key: "nourrir",
    icon: "coeur" as IconName,
    color: "#00aac8",
    amount: 5,
    title: { fr: "Nourrir une famille", ht: "Bay yon fanmi manje", en: "Feed a family", es: "Alimentar una familia" },
    desc:  { fr: "Ton soutien de $5 permet à la communauté d'offrir un repas à une famille pendant une semaine.", ht: "Sipò $5 ou pèmèt kominote a bay yon fanmi manje pandan yon semèn.", en: "Your $5 support lets the community share a meal with a family for a week.", es: "Tu apoyo de $5 permite a la comunidad ofrecer comida a una familia durante una semana." },
    status: "soon",
  },
  {
    key: "bible",
    icon: "bible" as IconName,
    color: "#00aac8",
    amount: 10,
    title: { fr: "Offrir une Bible", ht: "Bay yon Bib", en: "Give a Bible", es: "Regalar una Biblia" },
    desc:  { fr: "Avec $10, ton soutien offre la Parole de Dieu à quelqu'un qui n'en a pas les moyens.", ht: "Ak $10, sipò ou bay yon moun Pawòl Bondye ki pa gen mwayen pou li.", en: "With $10, your support gives God's Word to someone who can't afford it.", es: "Con $10, tu apoyo lleva la Palabra de Dios a alguien que no puede tenerla." },
    status: "soon",
  },
  {
    key: "ecole",
    icon: "academie" as IconName,
    color: "#38bdf8",
    amount: 25,
    title: { fr: "Kit scolaire complet", ht: "Kit eskolè konplè", en: "Full school kit", es: "Kit escolar completo" },
    desc:  { fr: "$25 de ton soutien offrent le matériel scolaire d'un enfant pour toute une année.", ht: "$25 nan sipò ou bay materyèl eskolè yon timoun pou tout yon ane.", en: "$25 of your support provides a child's school supplies for a full year.", es: "$25 de tu apoyo ofrecen el material escolar de un niño durante todo un año." },
    status: "soon",
  },
  {
    key: "disciple",
    icon: "enseignement" as IconName,
    color: "#1a3568",
    amount: 50,
    title: { fr: "Former un disciple", ht: "Fòme yon disip", en: "Train a disciple", es: "Formar un discípulo" },
    desc:  { fr: "$50 soutiennent la formation biblique complète d'un croyant pendant 6 mois.", ht: "$50 sipòte fòmasyon biblik konplè yon kwayan pou 6 mwa.", en: "$50 supports the complete biblical training of a believer for 6 months.", es: "$50 apoyan la formación bíblica completa de un creyente durante 6 meses." },
    status: "soon",
  },
  {
    key: "mission",
    icon: "eglise" as IconName,
    color: "#d4a017",
    amount: 100,
    title: { fr: "Soutenir une mission", ht: "Sipòte yon misyon", en: "Support a mission", es: "Apoyar una misión" },
    desc:  { fr: "$100 soutiennent directement une mission évangélique locale dans un pays en développement.", ht: "$100 sipòte dirèkteman yon misyon evanjelik lokal nan yon peyi andevlopman.", en: "$100 directly supports a local evangelical mission in a developing country.", es: "$100 apoyan directamente una misión evangélica local en un país en desarrollo." },
    status: "soon",
  },
];

export default function DonPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [selected, setSelected] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [visionVis, setVisionVis] = useState(false);
  const [impactVis, setImpactVis] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectsVis, setProjectsVis] = useState(false);
  const visionRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  const finalAmount = customMode ? parseFloat(customAmount) : selected;
  const canDonate = !!(finalAmount && finalAmount >= 1);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisionVis(true); }, { threshold: 0.08 });
    if (visionRef.current) obs.observe(visionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setImpactVis(true); }, { threshold: 0.08 });
    if (impactRef.current) obs.observe(impactRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setProjectsVis(true); }, { threshold: 0.05 });
    if (projectsRef.current) obs.observe(projectsRef.current);
    return () => obs.disconnect();
  }, []);

  const txt = {
    tag:          { fr: "SOUTENIR LA COMMUNAUTÉ",           ht: "SIPÒTE KOMINOTE A",                en: "SUPPORT THE COMMUNITY",           es: "APOYA LA COMUNIDAD"              },
    title:        { fr: "Deviens membre,\nfais vivre le mouvement", ht: "Vin manm,\nfè mouvman an viv", en: "Become a member,\npower the movement", es: "Hazte miembro,\nimpulsa el movimiento" },
    subtitle:     { fr: "KONEKSYON PAM restera 100% gratuit. Ton soutien libre fait grandir la communauté, les championnats et les parcours pour tous.", ht: "KONEKSYON PAM ap rete 100% gratis. Sipò lib ou fè kominote a, chanpyona yo ak pakou yo grandi pou tout moun.", en: "KONEKSYON PAM stays 100% free. Your free support grows the community, the championships and the journeys for everyone.", es: "KONEKSYON PAM seguirá siendo 100% gratis. Tu apoyo libre hace crecer la comunidad, los campeonatos y los recorridos para todos." },
    whyTitle:     { fr: "Pourquoi ton soutien compte",      ht: "Poukisa sipò ou enpòtan",          en: "Why your support matters",        es: "Por qué tu apoyo importa"        },
    impactTitle:  { fr: "Ton soutien fait avancer",         ht: "Sipò ou fè sa avanse",             en: "Your support powers",             es: "Tu apoyo impulsa"                },
    chooseAmt:    { fr: "Choisis ton soutien",              ht: "Chwazi sipò ou",                   en: "Choose your support",             es: "Elige tu apoyo"                  },
    customLink:   { fr: "Saisir un autre montant",          ht: "Antre yon lòt montan",             en: "Enter a different amount",        es: "Ingresar otro monto"             },
    verse:        { fr: "Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie.", ht: "Chak moun ta dwe bay selon sa l rezòl nan kè l, pa ak tristès ni pa fòs; paske Bondye renmen moun ki bay ak kè kontan.", en: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.", es: "Cada uno dé como propuso en su corazón, no de mala gana ni por obligación, porque Dios ama al dador alegre." },
    verseRef:     { fr: "2 Corinthiens 9:7",                ht: "2 Korentyen 9:7",                  en: "2 Corinthians 9:7",               es: "2 Corintios 9:7"                 },
    morePayments: { fr: "Carte bancaire et autres méthodes disponibles prochainement.", ht: "Kat labank ak lòt metòd pral disponib byento.", en: "Bank card and other payment methods coming soon.", es: "Tarjeta bancaria y otros métodos de pago próximamente." },
    back:         { fr: "← Retour à l'accueil",             ht: "← Tounen akèy",                   en: "← Back to home",                 es: "← Volver al inicio"              },
  };
  const t = (k: keyof typeof txt): string => txt[k][l];

  return (
    <div className="animate-page-awaken" style={{ minHeight: "100vh", background: "linear-gradient(180deg,#030d1f 0%,#080e1c 35%,#080e1c 100%)", color: "#fff" }}>
      <style>{`
        @keyframes don-aurora {
          0%,100% { opacity:.50; transform:scale(1) translateY(0); }
          50%      { opacity:.80; transform:scale(1.07) translateY(-14px); }
        }
        @keyframes don-orb-a {
          0%,100% { transform:translate(0,0); }
          40%      { transform:translate(22px,-26px); }
          70%      { transform:translate(-16px,18px); }
        }
        @keyframes don-orb-b {
          0%,100% { transform:translate(0,0); }
          35%      { transform:translate(-24px,20px); }
          68%      { transform:translate(18px,-14px); }
        }
        @keyframes don-ring {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes don-ring2 {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes don-up {
          from { opacity:0; transform:translateY(22px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes don-badge {
          from { opacity:0; transform:scale(.82) translateY(-8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes don-card-in {
          from { opacity:0; transform:translateY(28px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes don-shimmer {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes don-icon-float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-10px); }
        }
        @keyframes don-stat-in {
          from { opacity:0; transform:scale(.88) translateY(14px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes don-heart-pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(0,170,200,0); transform:scale(1); }
          50%      { box-shadow:0 0 0 6px rgba(0,170,200,0.22); transform:scale(1.06); }
        }
        .don-card-reveal  { animation: don-card-in .65s cubic-bezier(.16,1,.3,1) both; }
        .don-stat-reveal  { animation: don-stat-in  .6s  cubic-bezier(.16,1,.3,1) both; }
        .don-vision-card {
          transition: transform .38s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .3s ease;
        }
        .don-vision-card:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 12px 36px rgba(0,170,200,0.14);
          border-color: rgba(0,170,200,0.30) !important;
        }
        .don-amount-btn {
          transition: transform .3s cubic-bezier(.34,1.56,.64,1), background .2s, border-color .2s, box-shadow .2s;
          cursor: pointer; border: none;
        }
        .don-amount-btn:hover { transform: scale(1.05); }
        .don-amount-btn.active { transform: scale(1.06); }
      `}</style>

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <div style={{ background:"linear-gradient(135deg,#06122a,#0d2048)", position: "relative", overflow: "hidden", minHeight:"70vh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)", width:600, height:300, background:"radial-gradient(ellipse,rgba(0,170,200,0.12) 0%,transparent 65%)", filter:"blur(50px)" }} />
        </div>

        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-12 text-center" style={{ position:"relative", zIndex:10 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,170,200,0.10)", border:"1px solid rgba(0,170,200,0.28)", color:"#67e8f9", fontSize:10, fontWeight:900, padding:"6px 18px", borderRadius:999, marginBottom:24, letterSpacing:"0.24em", animation:"don-badge .9s cubic-bezier(.16,1,.3,1) both" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#00aac8", boxShadow:"0 0 8px #00aac8", display:"inline-block", animation:"don-heart-pulse 2s ease-in-out infinite" }} />
            <Icon name="coeur" size={13} /> {t("tag")}
          </div>

          <div style={{ display:"flex", justifyContent:"center", marginBottom:20, animation:"don-up .9s cubic-bezier(.16,1,.3,1) .15s both" }}>
            <div style={{ width:72, height:72, borderRadius:18, background:"linear-gradient(135deg,rgba(26,53,104,0.30),rgba(0,170,200,0.15))", border:"1px solid rgba(0,170,200,0.28)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Image src="/logo-kpf.png" alt="KP" width={56} height={56} style={{ borderRadius:14, objectFit:"cover" }} />
            </div>
          </div>

          <h1 style={{ fontSize:"clamp(2rem,5vw,3.3rem)", fontWeight:900, lineHeight:1.08, marginBottom:14, whiteSpace:"pre-line", background:"linear-gradient(135deg,#fff 0%,#67e8f9 55%,#00aac8 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"don-up .9s cubic-bezier(.16,1,.3,1) .2s both, don-shimmer 7s linear infinite" }}>
            {t("title")}
          </h1>

          <p style={{ color:"rgba(255,255,255,0.46)", maxWidth:520, margin:"0 auto 26px", lineHeight:1.7, fontSize:"0.95rem", animation:"don-up .9s cubic-bezier(.16,1,.3,1) .38s both" }}>
            {t("subtitle")}
          </p>

          <div style={{ display:"flex", justifyContent:"center", gap:26, marginBottom:28, animation:"don-up .9s cubic-bezier(.16,1,.3,1) .5s both" }}>
            {(["coeur","priere","croix","monde","etincelles"] as IconName[]).map((icon,i) => (
              <span key={icon} style={{ animation:`don-icon-float ${3.2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.16}s`, filter:"drop-shadow(0 0 9px rgba(0,170,200,0.40))" }}><Icon name={icon} size={22} color="#67e8f9" /></span>
            ))}
          </div>

          <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap", animation:"don-up .9s cubic-bezier(.16,1,.3,1) .6s both" }}>
            {STATS.map((s,i) => (
              <div key={s.n} className="don-stat-reveal" style={{ animationDelay:`${i*0.1}s`, background:"rgba(0,170,200,0.08)", border:"1px solid rgba(0,170,200,0.20)", borderRadius:16, padding:"14px 22px", textAlign:"center", minWidth:100 }}>
                <p style={{ fontSize:"1.5rem", fontWeight:900, color:"#67e8f9" }}>{s.n}</p>
                <p style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.32)", marginTop:3 }}>{s[l]}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(0,170,200,0.25),transparent)" }} />
      </div>

      {/* ══ CONTENT ═════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14" style={{ display:"grid", gridTemplateColumns:"1fr", gap:48 }}>
        <div className="kpf-mission-grid" style={{ display:"grid", gridTemplateColumns:"minmax(0,3fr) minmax(0,2fr)", gap:48, alignItems:"start" }}>

          {/* ── LEFT ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:48 }}>

            {/* ══ PROJETS ══ */}
            <div ref={projectsRef}>
              <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:10, fontWeight:900, letterSpacing:"0.26em", color:"rgba(212,160,23,0.70)", marginBottom:8, textTransform:"uppercase" as const }}>
                <Icon name="monde" size={13} /> {l==="fr"?"Choisissez votre impact":l==="ht"?"Chwazi enpak ou":l==="es"?"Elige tu impacto":"Choose your impact"}
              </p>
              <p style={{ color:"rgba(255,255,255,0.30)", fontSize:"0.76rem", marginBottom:20 }}>
                {l==="fr"?"Ces projets seront lancés prochainement. Ton soutien aujourd'hui prépare leur déploiement."
                :l==="ht"?"Pwojè sa yo pral lanse byento. Sipò ou jodi a prepare deplwaman yo."
                :l==="es"?"Estos proyectos se lanzarán próximamente. Tu apoyo hoy prepara su despliegue."
                :"These projects will launch soon. Your support today prepares their deployment."}
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {DON_PROJECTS.map((proj, i) => (
                  <button
                    key={proj.key}
                    onClick={() => { setSelectedProject(proj.key === selectedProject ? null : proj.key); setSelected(proj.amount); setCustomMode(false); }}
                    className={projectsVis ? "don-card-reveal" : ""}
                    style={{
                      animationDelay: `${i * 0.08}s`,
                      opacity: projectsVis ? undefined : 0,
                      display:"flex", alignItems:"flex-start", gap:14,
                      background: selectedProject === proj.key ? `${proj.color}12` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedProject === proj.key ? proj.color + "40" : "rgba(255,255,255,0.08)"}`,
                      borderRadius:16, padding:"16px 18px", cursor:"pointer", textAlign:"left" as const,
                      transition:"all .25s ease", width:"100%",
                    }}
                  >
                    <div style={{ width:42, height:42, borderRadius:12, background:`${proj.color}18`, border:`1px solid ${proj.color}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon name={proj.icon} size={22} color={proj.color} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontWeight:800, color:"#fff", fontSize:"0.9rem" }}>{proj.title[l]}</span>
                        <span style={{ fontWeight:900, color:proj.color, fontSize:"0.85rem", marginLeft:"auto" }}>${proj.amount}</span>
                      </div>
                      <p style={{ color:"rgba(255,255,255,0.40)", fontSize:"0.76rem", lineHeight:1.5 }}>{proj.desc[l]}</p>
                    </div>
                    <div style={{ flexShrink:0, fontSize:9, fontWeight:900, color:"#d4a017", background:"rgba(212,160,23,0.12)", border:"1px solid rgba(212,160,23,0.25)", padding:"3px 8px", borderRadius:999, letterSpacing:"0.1em", alignSelf:"flex-start" as const }}>
                      {l==="fr"?"BIENTÔT":l==="ht"?"BYENTO":"SOON"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Vision points */}
            <div ref={visionRef}>
              <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:10, fontWeight:900, letterSpacing:"0.26em", color:"rgba(0,210,240,0.65)", marginBottom:24, textTransform:"uppercase" as const }}>
                <Icon name="etincelles" size={13} /> {t("whyTitle")}
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {VISION_POINTS.map((pt,i) => (
                  <div key={pt.icon} className={`don-vision-card${visionVis?" don-card-reveal":""}`}
                    style={{ animationDelay:`${i*0.1}s`, opacity:visionVis?undefined:0, display:"flex", gap:16, background:"rgba(26,53,104,0.08)", border:"1px solid rgba(26,53,104,0.20)", borderRadius:18, padding:"20px 22px", position:"relative" as const }}>
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#00aac8,transparent)", opacity:.4, borderRadius:999 }} />
                    <div style={{ width:44, height:44, borderRadius:12, background:"rgba(0,170,200,0.10)", border:"1px solid rgba(0,170,200,0.22)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon name={pt.icon} size={22} color="#00aac8" />
                    </div>
                    <div>
                      <h3 style={{ color:"#fff", fontWeight:800, fontSize:"0.95rem", marginBottom:6 }}>{pt[l].title}</h3>
                      <p style={{ color:"rgba(255,255,255,0.42)", fontSize:"0.82rem", lineHeight:1.65 }}>{pt[l].body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact items */}
            <div ref={impactRef}>
              <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:10, fontWeight:900, letterSpacing:"0.26em", color:"rgba(200,150,15,0.70)", marginBottom:24, textTransform:"uppercase" as const }}>
                <Icon name="signet" size={13} /> {t("impactTitle")}
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {IMPACT_ITEMS.map((item,i) => (
                  <div key={item.en} className={impactVis?"don-card-reveal":""} style={{ animationDelay:`${i*0.06}s`, opacity:impactVis?undefined:0, display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"12px 14px" }}>
                    <span style={{ flexShrink:0, display:"inline-flex" }}><Icon name={item.icon} size={20} color="#67e8f9" /></span>
                    <span style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.76rem", lineHeight:1.4 }}>{item[l]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verse */}
            <div style={{ border:"1px solid rgba(0,170,200,0.18)", borderRadius:20, padding:"24px 28px", background:"rgba(26,53,104,0.06)", position:"relative" as const }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#00aac8,transparent)", opacity:.5, borderRadius:999 }} />
              <p style={{ color:"rgba(0,210,240,0.70)", fontSize:"0.92rem", lineHeight:1.7, fontStyle:"italic", marginBottom:10 }}>
                &ldquo;{t("verse")}&rdquo;
              </p>
              <p style={{ color:"rgba(0,170,200,0.65)", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.10em" }}>— {t("verseRef")}</p>
            </div>

            {/* Transparence Foundation */}
            <div style={{ borderLeft:"4px solid #d4a017", background:"rgba(212,160,23,0.05)", borderRadius:"0 12px 12px 0", padding:"16px 16px 16px 20px" }}>
              <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:900, color:"#d4a017", letterSpacing:"0.15em", marginBottom:8 }}>
                <Icon name="recherche" size={14} /> {l==="fr"?"ENGAGEMENT DE TRANSPARENCE":l==="ht"?"ANGAJMAN TRANSPARARANS":l==="es"?"COMPROMISO DE TRANSPARENCIA":"TRANSPARENCY COMMITMENT"}
              </p>
              <p style={{ color:"rgba(255,255,255,0.40)", fontSize:"0.80rem", lineHeight:1.65 }}>
                {l==="fr"?"KONEKSYON PAM s'engage à n'afficher que des données réelles. Aucun soutien fictif, aucun projet inventé, aucun chiffre gonflé. Les états financiers seront publiés annuellement."
                :l==="ht"?"KONEKSYON PAM angaje l pou sèlman montre done reyèl. Pa gen okenn sipò fiktif, okenn pwojè envante, okenn chif gwosi."
                :l==="es"?"KONEKSYON PAM se compromete a mostrar únicamente datos reales. Sin apoyos ficticios, sin proyectos inventados, sin cifras infladas."
                :"KONEKSYON PAM commits to displaying only real data. No fictional support, no invented projects, no inflated figures."}
              </p>
            </div>
          </div>

          {/* ── RIGHT: Donation Card ── */}
          <div style={{ position:"sticky", top:96 }}>
            <div style={{ background:"#fff", borderRadius:28, boxShadow:"0 24px 80px rgba(0,0,0,0.5)", overflow:"hidden" }}>
              <div style={{ background:"linear-gradient(135deg,#1a3568,#00aac8)", padding:"24px 24px 20px", textAlign:"center", position:"relative" as const }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)" }} />
                <p style={{ color:"rgba(255,255,255,0.80)", fontSize:10, fontWeight:900, letterSpacing:"0.20em", marginBottom:6, textTransform:"uppercase" as const }}>
                  {t("chooseAmt")}
                </p>
                <p style={{ color:"#fff", fontWeight:900, fontSize:"2rem", lineHeight:1 }}>
                  ${customMode && customAmount ? parseFloat(customAmount) || "—" : selected}
                  <span style={{ color:"rgba(255,255,255,0.60)", fontSize:"0.85rem", fontWeight:500, marginLeft:4 }}>USD</span>
                </p>
                {selectedProject && (
                  <p style={{ color:"rgba(255,255,255,0.70)", fontSize:"0.72rem", marginTop:6 }}>
                    {DON_PROJECTS.find(p => p.key === selectedProject)?.title[l]}
                  </p>
                )}
              </div>

              <div style={{ padding:24 }}>
                {!customMode ? (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                    {DONATION_AMOUNTS.map(({ value, icon, labelKey }) => (
                      <button
                        key={value}
                        className={`don-amount-btn${selected===value?" active":""}`}
                        onClick={() => { setSelected(value); setSelectedProject(null); }}
                        style={{
                          display:"flex", flexDirection:"column", alignItems:"center",
                          padding:"14px 8px", borderRadius:16,
                          background: selected===value ? "linear-gradient(135deg,rgba(0,170,200,0.08),rgba(26,53,104,0.08))" : "#f9fafb",
                          border: `2px solid ${selected===value?"#00aac8":"#e5e7eb"}`,
                          boxShadow: selected===value ? "0 4px 16px rgba(0,170,200,0.25)" : "none",
                        }}
                      >
                        <span style={{ marginBottom:4, display:"inline-flex" }}><Icon name={icon as IconName} size={26} color={selected===value?"#00aac8":"#374151"} /></span>
                        <span style={{ fontWeight:900, fontSize:"1.1rem", color:selected===value?"#1a3568":"#374151" }}>${value}</span>
                        <span style={{ fontSize:"0.65rem", marginTop:2, color:selected===value?"#00aac8":"#9ca3af" }}>{AMOUNTS_LABELS[labelKey][l]}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", gap:8 }}>
                      <div style={{ position:"relative", flex:1 }}>
                        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontWeight:700, fontSize:"1.1rem" }}>$</span>
                        <input type="number" min="1" value={customAmount} onChange={e => setCustomAmount(e.target.value)} placeholder="0" autoFocus
                          style={{ width:"100%", border:"2px solid #ec4899", borderRadius:12, paddingLeft:32, paddingRight:14, paddingTop:12, paddingBottom:12, fontWeight:900, color:"#1f2937", fontSize:"1.1rem", outline:"none", boxSizing:"border-box" as const }} />
                      </div>
                      <button onClick={() => { setCustomMode(false); setCustomAmount(""); }} style={{ padding:"0 14px", color:"#9ca3af", border:"2px solid #e5e7eb", borderRadius:12, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center" }}><Icon name="fermer" size={16} /></button>
                    </div>
                  </div>
                )}

                {!customMode && (
                  <button onClick={() => { setCustomMode(true); setSelected(25); }} style={{ width:"100%", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:"0.75rem", color:"#9ca3af", background:"none", border:"none", cursor:"pointer", marginBottom:12, textDecoration:"underline", textUnderlineOffset:2 }}>
                    <Icon name="etincelles" size={14} /> {t("customLink")}
                  </button>
                )}

                {/* ── DONS DÉSACTIVÉS TEMPORAIREMENT ── */}
                <div style={{
                  background:"linear-gradient(135deg,rgba(26,53,104,0.06),rgba(0,170,200,0.04))",
                  border:"1px solid rgba(26,53,104,0.15)",
                  borderRadius:16, padding:"20px 18px", textAlign:"center" as const, marginBottom:8,
                }}>
                  <div style={{ marginBottom:10, display:"flex", justifyContent:"center" }}><Icon name="cadenas" size={32} color="#1a3568" /></div>
                  <p style={{ fontWeight:900, color:"#1a3568", fontSize:"0.9rem", marginBottom:6 }}>
                    {l==="fr"?"Système de soutien bientôt disponible"
                    :l==="ht"?"Sistèm sipò pral disponib byento"
                    :l==="es"?"Sistema de apoyo próximamente"
                    :"Support system coming soon"}
                  </p>
                  <p style={{ color:"#4a6080", fontSize:"0.76rem", lineHeight:1.6 }}>
                    {l==="fr"?"Nous finalisons la mise en place du système de paiement sécurisé. Reviens bientôt pour soutenir la communauté."
                    :l==="ht"?"Nou ap finalize mete sou pye sistèm peman an. Tounen byento pou sipòte kominote a."
                    :l==="es"?"Estamos finalizando la configuración del sistema de pago seguro. Vuelve pronto para apoyar la comunidad."
                    :"We are finalizing the secure payment system setup. Come back soon to support the community."}
                  </p>
                  <div style={{ marginTop:14, padding:"8px 16px", borderRadius:999, display:"inline-block",
                    background:"rgba(200,150,15,0.10)", border:"1px solid rgba(200,150,15,0.25)",
                    fontSize:11, fontWeight:800, color:"#c8960f", letterSpacing:"0.12em" }}>
                    {l==="fr"?"BIENTÔT":l==="ht"?"BYENTO":l==="es"?"PRÓXIMAMENTE":"COMING SOON"}
                  </div>
                </div>

                <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid #f3f4f6" }}>
                  <p style={{ textAlign:"center", fontSize:"0.65rem", color:"#d1d5db" }}>{t("morePayments")}</p>
                  <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:6, opacity:.25 }}>
                    {["VISA","Mastercard","Apple Pay"].map(b => (
                      <span key={b} style={{ fontSize:"0.58rem", fontWeight:700, color:"#6b7280", border:"1px solid #d1d5db", borderRadius:4, padding:"2px 6px" }}>{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign:"center", marginTop:20 }}>
              <Link href="/" style={{ color:"rgba(255,255,255,0.20)", fontSize:"0.76rem", textDecoration:"none" }}>
                {t("back")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
