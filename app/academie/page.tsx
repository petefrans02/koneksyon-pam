"use client";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { studies, ParcoursKey } from "@/lib/studies-data";
import { featuredPsalms } from "@/lib/psalms-data";
import { DOMAINS, coursesByDomain } from "@/lib/academy-data";
import { hasCourseContent } from "@/lib/courses";
import Icon, { IconName } from "@/app/components/Icon";
import Reveal from "@/app/components/Reveal";
import HeroBackdrop from "@/app/components/HeroBackdrop";

type Lang = "fr" | "ht" | "en" | "es";

// Nombre réel de leçons par parcours, dérivé des données (pas de chiffres inventés).
function lessonCount(key: ParcoursKey): number {
  if (key === "psaumes") return featuredPsalms.length;
  return studies.filter((s) => s.parcours === key).length;
}
function parcoursHref(key: ParcoursKey): string {
  return key === "psaumes" ? "/psaumes" : `/etude?parcours=${key}`;
}

const PARCOURS: {
  key: ParcoursKey; icon: IconName; color: string;
  title: Record<Lang, string>; desc: Record<Lang, string>; level: Record<Lang, string>;
}[] = [
  { key: "fondements", icon: "foi", color: "#22c55e",
    title: { fr: "Fondements de la Foi", ht: "Fondasyon Lafwa", en: "Foundations of Faith", es: "Fundamentos de la Fe" },
    desc:  { fr: "Les bases essentielles pour tout nouveau croyant.", ht: "Baz esansyèl pou tout nouvo kwayan.", en: "Essential foundations for every new believer.", es: "Las bases esenciales para todo nuevo creyente." },
    level: { fr: "Débutant", ht: "Debitan", en: "Beginner", es: "Principiante" } },
  { key: "nouveau-testament", icon: "croix", color: "#7c3aed",
    title: { fr: "Nouveau Testament", ht: "Nouvo Testaman", en: "New Testament", es: "Nuevo Testamento" },
    desc:  { fr: "Les évangiles, les épîtres et la révélation de Jésus-Christ.", ht: "Levanjil yo, epìt yo ak revelasyon Jezi-Kri.", en: "The Gospels, epistles and revelation of Jesus Christ.", es: "Los evangelios, las epístolas y la revelación de Jesucristo." },
    level: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" } },
  { key: "histoire-sainte", icon: "monde", color: "#d4a017",
    title: { fr: "Histoire Sainte", ht: "Istwa Sen", en: "Sacred History", es: "Historia Sagrada" },
    desc:  { fr: "Des origines à la Pentecôte : le plan de Dieu pour l'humanité.", ht: "De orijin rive Lapantekòt: plan Bondye pou limanite.", en: "From origins to Pentecost: God's plan for humanity.", es: "Desde los orígenes hasta Pentecostés: el plan de Dios para la humanidad." },
    level: { fr: "Tous niveaux", ht: "Tout nivo", en: "All levels", es: "Todos los niveles" } },
  { key: "formation-disciples", icon: "academie", color: "#00aac8",
    title: { fr: "Formation de Disciples", ht: "Fòmasyon Disip", en: "Disciple Training", es: "Formación de Discípulos" },
    desc:  { fr: "Comment faire des disciples selon le modèle de Jésus.", ht: "Kijan fè disip selon modèl Jezi.", en: "How to make disciples according to Jesus' model.", es: "Cómo hacer discípulos según el modelo de Jesús." },
    level: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" } },
  { key: "theologie", icon: "eglise", color: "#34d399",
    title: { fr: "Théologie Évangélique", ht: "Teyoloji Evanjelik", en: "Evangelical Theology", es: "Teología Evangélica" },
    desc:  { fr: "Les grandes doctrines de la foi chrétienne évangélique.", ht: "Gran doktrin lafwa kretyen evanjelik la.", en: "The great doctrines of evangelical Christian faith.", es: "Las grandes doctrinas de la fe cristiana evangélica." },
    level: { fr: "Avancé", ht: "Avanse", en: "Advanced", es: "Avanzado" } },
  { key: "enseignements", icon: "enseignement", color: "#0891b2",
    title: { fr: "Enseignements", ht: "Ansèyman", en: "Teachings", es: "Enseñanzas" },
    desc:  { fr: "Des séries d'enseignements approfondis : doctrine, foi, prière et Évangile.", ht: "Seri ansèyman apwofondi : doktrin, lafwa, lapriyè ak Levanjil.", en: "In-depth teaching series: doctrine, faith, prayer and the Gospel.", es: "Series de enseñanza profundas: doctrina, fe, oración y Evangelio." },
    level: { fr: "Intermédiaire", ht: "Entèmedyè", en: "Intermediate", es: "Intermedio" } },
];

const FEATURES: { icon: IconName; color: string; title: Record<Lang, string>; desc: Record<Lang, string> }[] = [
  { icon: "cours", color: "#00aac8", title: { fr: "Cours structurés", ht: "Kou estrikti", en: "Structured courses", es: "Cursos estructurados" }, desc: { fr: "Parcours progressifs par niveau", ht: "Parcou pwogresif pa nivo", en: "Progressive paths by level", es: "Itinerarios progresivos por nivel" } },
  { icon: "valider", color: "#ea580c", title: { fr: "Quiz & examens", ht: "Quiz & egzamen", en: "Quizzes & exams", es: "Cuestionarios y exámenes" }, desc: { fr: "Validez vos connaissances à chaque étape", ht: "Valide konesans ou nan chak etap", en: "Validate your knowledge at each step", es: "Valida tus conocimientos en cada etapa" } },
  { icon: "medaille", color: "#c8960f", title: { fr: "Certificats", ht: "Sètifika", en: "Certificates", es: "Certificados" }, desc: { fr: "Obtenez un certificat à la fin de chaque parcours", ht: "Jwenn yon sètifika nan fen chak parcou", en: "Earn a certificate at the end of each path", es: "Obtén un certificado al final de cada itinerario" } },
  { icon: "progression", color: "#16a34a", title: { fr: "Suivi de progression", ht: "Swivi pwogresyon", en: "Progress tracking", es: "Seguimiento del progreso" }, desc: { fr: "Visualisez votre avancement en temps réel", ht: "Wè avanse ou an tan reyèl", en: "Visualize your progress in real time", es: "Visualiza tu avance en tiempo real" } },
];

export default function AcademiePage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;

  const txt = {
    badge:    { fr: "ACADÉMIE BIBLIQUE", ht: "AKADEMI BIBLIK", en: "BIBLICAL ACADEMY", es: "ACADEMIA BÍBLICA" },
    title:    { fr: "Académie Biblique", ht: "Akademi Biblik", en: "Biblical Academy", es: "Academia Bíblica" },
    sub:      { fr: "Former des disciples. Équiper des croyants. Transformer des nations.", ht: "Fòme disip. Ekipe kwayan. Transfòme nasyon.", en: "Making disciples. Equipping believers. Transforming nations.", es: "Formando discípulos. Equipando creyentes. Transformando naciones." },
    stat1:    { fr: "cours disponibles", ht: "kou disponib", en: "courses available", es: "cursos disponibles" },
    stat2:    { fr: "langues", ht: "lang", en: "languages", es: "idiomas" },
    stat3:    { fr: "100% gratuit", ht: "100% gratis", en: "100% free", es: "100% gratuito" },
    featTitle:{ fr: "Ce que vous trouverez", ht: "Sa ou pral jwenn", en: "What you'll find", es: "Lo que encontrarás" },
    coursTitle:{ fr: "Nos Parcours", ht: "Parcou Nou Yo", en: "Our Learning Paths", es: "Nuestros Itinerarios" },
    coursSub: { fr: "Des parcours bibliques pour chaque niveau de foi", ht: "Parcou biblik pou chak nivo lafwa", en: "Biblical paths for every level of faith", es: "Itinerarios bíblicos para cada nivel de fe" },
    start:    { fr: "Commencer →", ht: "Kòmanse →", en: "Start →", es: "Empezar →" },
    soon:     { fr: "BIENTÔT", ht: "BYENTO", en: "SOON", es: "PRONTO" },
    lessons:  { fr: "leçons", ht: "leson", en: "lessons", es: "lecciones" },
    certTitle:{ fr: "Certificats", ht: "Sètifika", en: "Certificates", es: "Certificados" },
    certSub:  { fr: "Les certificats seront disponibles prochainement. Completez un parcours pour en obtenir un.", ht: "Sètifika yo pral disponib byento. Konplete yon parcou pou jwenn youn.", en: "Certificates will be available soon. Complete a path to earn one.", es: "Los certificados estarán disponibles pronto. Completa un itinerario para obtener uno." },
    ctaExplore:{ fr: "Explorer les cours →", ht: "Eksplore kou yo →", en: "Explore courses →", es: "Explorar cursos →" },
    ctaJoin:  { fr: "Rejoindre l'Académie →", ht: "Rantre nan Akademi →", en: "Join the Academy →", es: "Unirse a la Academia →" },
  };

  return (
    <main className="animate-page-awaken" style={{ background: "#ffffff", minHeight: "100vh", color: "#1c1c2e" }}>
      <style>{`
        @keyframes acad-aurora {
          0%,100% { opacity:.50; transform:scale(1) translateY(0); }
          50%      { opacity:.78; transform:scale(1.07) translateY(-12px); }
        }
        @keyframes acad-orb-a {
          0%,100% { transform:translate(0,0); }
          40%      { transform:translate(20px,-24px); }
          70%      { transform:translate(-14px,16px); }
        }
        @keyframes acad-orb-b {
          0%,100% { transform:translate(0,0); }
          35%      { transform:translate(-18px,20px); }
          68%      { transform:translate(14px,-12px); }
        }
        @keyframes acad-ring {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes acad-up {
          from { opacity:0; transform:translateY(22px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes acad-badge {
          from { opacity:0; transform:scale(.82) translateY(-8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes acad-shimmer {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes acad-icon-float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-9px); }
        }
        @keyframes acad-card-in {
          from { opacity:0; transform:translateY(26px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes acad-dot {
          0%,100% { box-shadow:0 0 0 0 rgba(0,210,240,0); }
          50%      { box-shadow:0 0 0 5px rgba(0,210,240,0.22); }
        }
        .acad-feat-card {
          transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .3s ease;
        }
        .acad-feat-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 12px 36px rgba(0,170,200,0.15);
          border-color: rgba(0,170,200,0.30) !important;
        }
        .acad-cours-card {
          transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .3s ease;
        }
        .acad-cours-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 32px rgba(200,150,15,0.12);
          border-top: 3px solid #c8960f !important;
        }
        .acad-card-reveal { animation: acad-card-in .65s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      {/* ══ HERO — fond navy, 70vh ══ */}
      <div style={{ background:"linear-gradient(135deg,#06122a,#0d2048)", position: "relative", overflow: "hidden", minHeight:"70vh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        {/* Photo symbolique de la page en fond */}
        <HeroBackdrop image="/hero/academie.jpg" tint="dark" />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)", width:600, height:300, background:"radial-gradient(ellipse, rgba(0,170,200,0.15) 0%, transparent 65%)", filter:"blur(44px)" }} />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-14 text-center" style={{ position:"relative", zIndex:10 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,170,200,0.12)", border:"1px solid rgba(0,210,240,0.28)", color:"#67e8f9", fontSize:10, fontWeight:900, padding:"6px 18px", borderRadius:999, marginBottom:24, letterSpacing:"0.24em", animation:"acad-badge .9s cubic-bezier(.16,1,.3,1) both" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#00d4f0", boxShadow:"0 0 8px #00d4f0", display:"inline-block", animation:"acad-dot 2s ease-in-out infinite" }} />
            <Icon name="academie" size={14} /> {txt.badge[l]}
          </div>

          <h1 style={{ fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:900, lineHeight:1.08, marginBottom:14, background:"linear-gradient(135deg,#fff 0%,#67e8f9 55%,#00aac8 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"acad-up .9s cubic-bezier(.16,1,.3,1) .2s both, acad-shimmer 7s linear infinite" }}>
            {txt.title[l]}
          </h1>

          <p style={{ color:"rgba(255,255,255,0.44)", maxWidth:520, margin:"0 auto 26px", lineHeight:1.7, fontSize:"0.95rem", animation:"acad-up .9s cubic-bezier(.16,1,.3,1) .38s both" }}>
            {txt.sub[l]}
          </p>

          <div style={{ display:"flex", justifyContent:"center", gap:24, marginBottom:32, animation:"acad-up .9s cubic-bezier(.16,1,.3,1) .5s both" }}>
            {(["bible","academie","croix","priere","monde"] as IconName[]).map((icon, i) => (
              <span key={icon} style={{ display:"inline-flex", animation:`acad-icon-float ${3.2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.18}s`, filter:"drop-shadow(0 0 9px rgba(0,210,240,0.35))" }}><Icon name={icon} size={28} color="#67e8f9" /></span>
            ))}
          </div>

          <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" as const, animation:"acad-up .9s cubic-bezier(.16,1,.3,1) .6s both" }}>
            {[
              { value: String(PARCOURS.filter((p) => lessonCount(p.key) > 0).length), label: txt.stat1[l] },
              { value: "4", label: txt.stat2[l] },
              { value: "∞", label: txt.stat3[l] },
            ].map((s, i) => (
              <div key={i} style={{ background:"rgba(0,170,200,0.10)", border:"1px solid rgba(0,210,240,0.20)", borderRadius:16, padding:"14px 24px", textAlign:"center" as const, minWidth:110 }}>
                <p style={{ fontSize:"1.6rem", fontWeight:900, color:"#67e8f9" }}>{s.value}</p>
                <p style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.35)", marginTop:3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(200,150,15,0.22),transparent)" }} />
      </div>

      {/* ══ FEATURES ══ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:900, letterSpacing:"0.22em", color:"#00aac8", marginBottom:10, textTransform:"uppercase" as const }}>
            <Icon name="etincelles" size={13} /> {txt.featTitle[l]}
          </p>
          <div style={{ width:48, height:3, background:"linear-gradient(90deg,#c8960f,#f0c840)", borderRadius:999, margin:"8px auto 0" }} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="acad-feat-card acad-card-reveal"
              style={{ animationDelay:`${i*0.08}s`, background:`#ffffff`, border:"1px solid #e8e4de", borderTop:`3px solid ${f.color}`, borderRadius:20, padding:"24px 22px", boxShadow:"0 4px 16px rgba(26,53,104,0.06)" }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`${f.color}1f`, border:`1.5px solid ${f.color}3a`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, boxShadow:`0 4px 14px ${f.color}22` }}>
                <Icon name={f.icon} size={24} color={f.color} />
              </div>
              <h3 style={{ fontWeight:800, fontSize:"0.95rem", color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:6 }}>{f.title[l]}</h3>
              <p style={{ color:"#4a6080", fontSize:"0.80rem", lineHeight:1.6 }}>{f.desc[l]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PARCOURS ══ */}
      <div style={{ background:"#ffffff", borderTop:"1px solid #e8e4de", borderBottom:"1px solid #e8e4de", padding:"60px 0" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:900, letterSpacing:"0.22em", color:"#2d6a4f", marginBottom:10, textTransform:"uppercase" as const }}>
              <Icon name="cours" size={13} /> {txt.coursTitle[l]}
            </p>
            <div style={{ width:48, height:3, background:"linear-gradient(90deg,#c8960f,#f0c840)", borderRadius:999, margin:"8px auto 14px" }} />
            <h2 style={{ fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:900, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:8 }}>{txt.coursTitle[l]}</h2>
            <p style={{ color:"#4a6080", fontSize:"0.9rem" }}>{txt.coursSub[l]}</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
            {PARCOURS.map((p, i) => {
              const count = lessonCount(p.key);
              const active = count > 0;
              const parcoursTag = l==="fr"?"PARCOURS":l==="ht"?"PARCOU":l==="es"?"ITINERARIO":"PATH";
              return (
              <Link key={p.key} href={active ? parcoursHref(p.key) : "#"}
                className="acad-cours-card acad-card-reveal"
                style={{
                  display:"block", textDecoration:"none",
                  animationDelay:`${i*0.07}s`,
                  opacity: active ? 1 : 0.6,
                  pointerEvents: active ? undefined : "none",
                  background:`#ffffff`, border:"1px solid #e8e4de", borderTop:`3px solid ${p.color}`,
                  borderRadius:16, padding:"16px", position:"relative" as const, boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                }}>
                {/* En-tête : icône + badge distinctif "PARCOURS" (vs catalogue numérique) */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${p.color}14`, border:`1px solid ${p.color}2a`, display:"flex", alignItems:"center", justifyContent:"center", color:p.color, flexShrink:0 }}>
                    <Icon name={p.icon} size={19} />
                  </div>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.08em", padding:"3px 8px", borderRadius:999, background:`${p.color}12`, color:p.color, border:`1px solid ${p.color}2a` }}>
                    <Icon name="signet" size={10} /> {parcoursTag}
                  </span>
                </div>
                <h4 style={{ fontWeight:800, fontSize:"0.9rem", color:"#1a3568", marginBottom:4, lineHeight:1.25, fontFamily:"'Playfair Display',Georgia,serif" }}>{p.title[l]}</h4>
                <p style={{ color:"#4a6080", fontSize:"0.76rem", lineHeight:1.5, marginBottom:10 }}>{p.desc[l]}</p>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.68rem", color:"#9ca3af" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Icon name="lecon" size={12} /> {active ? `${count} ${txt.lessons[l]}` : txt.soon[l]}</span>
                  <span>·</span>
                  <span>{p.level[l]}</span>
                  <span style={{ marginLeft:"auto", color:p.color, display:"inline-flex" }}><Icon name="fleche_droite" size={15} /></span>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ CATALOGUE PAR DOMAINE ══ */}
      <div style={{ background:"#ffffff", borderTop:"1px solid #e8e4de", padding:"64px 0" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div style={{ textAlign:"center", marginBottom:44 }}>
            <p style={{ fontSize:11, fontWeight:900, letterSpacing:"0.22em", color:"#00aac8", marginBottom:10, textTransform:"uppercase" as const }}>
              {l==="fr"?"Le catalogue complet":l==="ht"?"Katalòg konplè a":l==="es"?"El catálogo completo":"The full catalog"}
            </p>
            <div style={{ width:48, height:3, background:"linear-gradient(90deg,#c8960f,#f0c840)", borderRadius:999, margin:"8px auto 14px" }} />
            <h2 style={{ fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:900, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:8 }}>
              {l==="fr"?"Foi, compétences numériques & talents":l==="ht"?"Lafwa, konpetans nimerik & talan":l==="es"?"Fe, competencias digitales & talentos":"Faith, digital skills & talents"}
            </h2>
            <p style={{ color:"#4a6080", fontSize:"0.9rem", maxWidth:520, margin:"0 auto" }}>
              {l==="fr"?"Une seule académie pour grandir dans la foi, se former au numérique et développer ses dons.":l==="ht"?"Yon sèl akademi pou grandi nan lafwa, fòme nan nimerik ak devlope don ou.":l==="es"?"Una sola academia para crecer en la fe, formarse en lo digital y desarrollar tus dones.":"One academy to grow in faith, learn digital skills and develop your gifts."}
            </p>
          </div>

          {DOMAINS.map((dom) => (
            <Reveal key={dom.key} style={{ marginBottom:44 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:`${dom.color}12`, border:`1px solid ${dom.color}28`, display:"flex", alignItems:"center", justifyContent:"center", color:dom.color, flexShrink:0 }}>
                  <Icon name={dom.icon as IconName} size={22} />
                </div>
                <div>
                  <h3 style={{ fontWeight:800, fontSize:"1.05rem", color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif" }}>{dom.title[l]}</h3>
                  <p style={{ color:"#4a6080", fontSize:"0.8rem" }}>{dom.desc[l]}</p>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))", gap:14 }}>
                {coursesByDomain(dom.key).map((c) => {
                  const avail = hasCourseContent(c.slug) || c.status === "available";
                  const dest = hasCourseContent(c.slug) ? `/academie/${c.slug}` : (c.status === "available" && c.href ? c.href : `/academie/${c.slug}`);
                  return (
                  <Link key={c.slug} href={dest}
                    className="acad-cours-card"
                    style={{ display:"block", background:`#ffffff`, border:"1px solid #e8e4de", borderTop:`3px solid ${c.color}`, borderRadius:16, padding:"16px", textDecoration:"none", position:"relative" as const, boxShadow:"0 4px 16px rgba(26,53,104,0.06)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:`${c.color}12`, border:`1px solid ${c.color}26`, display:"flex", alignItems:"center", justifyContent:"center", color:c.color, flexShrink:0 }}>
                        <Icon name={c.icon as IconName} size={19} />
                      </div>
                      <span style={{
                        fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.08em", padding:"3px 8px", borderRadius:999,
                        ...(avail
                          ? { background:"rgba(22,163,74,0.10)", color:"#16a34a", border:"1px solid rgba(22,163,74,0.22)" }
                          : { background:"rgba(200,150,15,0.08)", color:"#c8960f", border:"1px solid rgba(200,150,15,0.20)" }),
                      }}>
                        {avail
                          ? (l==="fr"?"DISPONIBLE":l==="ht"?"DISPONIB":l==="es"?"DISPONIBLE":"AVAILABLE")
                          : (l==="fr"?"BIENTÔT":l==="ht"?"BYENTO":l==="es"?"PRONTO":"SOON")}
                      </span>
                    </div>
                    <h4 style={{ fontWeight:800, fontSize:"0.9rem", color:"#1a3568", marginBottom:4, lineHeight:1.25, fontFamily:"'Playfair Display',Georgia,serif" }}>{c.title[l]}</h4>
                    <p style={{ color:"#4a6080", fontSize:"0.76rem", lineHeight:1.5, marginBottom:10 }}>{c.description[l]}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.68rem", color:"#9ca3af" }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Icon name="lecon" size={12} /> {c.lessons} {l==="fr"?"leçons":l==="ht"?"leson":l==="es"?"lecciones":"lessons"}</span>
                      <span>·</span>
                      <span>{c.level[l]}</span>
                    </div>
                  </Link>
                  );
                })}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ══ QUIZ & JEUX ══ */}
      <div style={{ background:"linear-gradient(135deg,#0d2048 0%,#16307a 50%,#0d2048 100%)", padding:"70px 24px", position:"relative", overflow:"hidden" }}>
        {/* Motif de fond */}
        <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"radial-gradient(#00aac8 1px,transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none" }} />
        {/* Orbe décoratif */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:500, height:300, background:"radial-gradient(ellipse,rgba(200,150,15,0.10) 0%,transparent 65%)", filter:"blur(40px)", pointerEvents:"none" }} />

        <div style={{ maxWidth:900, margin:"0 auto", position:"relative", zIndex:1 }}>
          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(200,150,15,0.12)", border:"1px solid rgba(200,150,15,0.28)", color:"#f0c840", fontSize:10, fontWeight:900, padding:"6px 18px", borderRadius:999, marginBottom:20, letterSpacing:"0.20em" }}>
              <Icon name="quiz" size={14} /> {l === "en" ? "GAMES & QUIZZES" : l === "ht" ? "JÈ & KIZ" : l === "es" ? "JUEGOS & QUIZ" : "JEUX & QUIZ"}
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:900, color:"#fff", marginBottom:12 }}>
              {l === "en" ? "Test Your Biblical Knowledge" : l === "ht" ? "Teste Konesans Biblik Ou" : l === "es" ? "Pon a Prueba tu Conocimiento Bíblico" : "Testez Vos Connaissances Bibliques"}
            </h2>
            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.92rem", maxWidth:480, margin:"0 auto" }}>
              {l === "en" ? "Interactive quizzes to deepen your faith through play." : l === "ht" ? "Kiz entèaktif pou apwofondi lafwa ou nan jwèt." : l === "es" ? "Cuestionarios interactivos para profundizar tu fe jugando." : "Des quiz interactifs pour approfondir votre foi en jouant."}
            </p>
          </div>

          {/* Cards jeux */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:20, marginBottom:40 }}>
            {/* Quiz Biblique */}
            <Link href="/quiz" style={{ textDecoration:"none" }}>
              <div style={{
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:24, padding:"28px 24px", cursor:"pointer",
                transition:"all .3s cubic-bezier(.34,1.56,.64,1)",
                display:"block",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 48px rgba(200,150,15,0.20)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,150,15,0.55)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                }}>
                <div style={{ width:64, height:64, borderRadius:20, background:"linear-gradient(135deg,#c8960f,#f0c840)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                  <Icon name="bible" size={32} color="#0d1d3d" />
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontWeight:900, fontSize:"1.1rem", color:"#fff", margin:0 }}>
                    {l === "en" ? "Bible Quiz" : l === "ht" ? "Kiz Biblik" : l === "es" ? "Quiz Bíblico" : "Quiz Biblique"}
                  </h3>
                  <span style={{ fontSize:9, fontWeight:900, background:"rgba(0,170,200,0.15)", color:"#00aac8", border:"1px solid rgba(0,170,200,0.25)", padding:"2px 8px", borderRadius:999, letterSpacing:"0.12em" }}>
                    {l === "en" ? "LEVELS" : l === "ht" ? "NIVO" : l === "es" ? "NIVELES" : "NIVEAUX"}
                  </span>
                </div>
                <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.82rem", lineHeight:1.65, marginBottom:20 }}>
                  {l === "en" ? "Progress through levels, test your knowledge verse by verse." : l === "ht" ? "Monte nivo pa nivo, teste konesans ou vèse pa vèse." : l === "es" ? "Avanza nivel por nivel, pon a prueba tu conocimiento versículo a versículo." : "Progressez niveau par niveau, testez vos connaissances verset par verset."}
                </p>
                <div style={{ display:"flex", gap:8 }}>
                  {(["foi","cours","academie","feu"] as IconName[]).map((icon, i) => (
                    <div key={i} style={{ width:32, height:32, borderRadius:8, background:"rgba(200,150,15,0.10)", border:"1px solid rgba(200,150,15,0.20)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon name={icon} size={16} color="#f0c840" />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:20, display:"flex", alignItems:"center", gap:6, color:"#c8960f", fontWeight:800, fontSize:"0.85rem" }}>
                  {l === "en" ? "Play now" : l === "ht" ? "Jwe kounye a" : l === "es" ? "Jugar ahora" : "Jouer maintenant"} →
                </div>
              </div>
            </Link>

            {/* Championnats */}
            <Link href="/championnats" style={{ textDecoration:"none" }}>
              <div style={{
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:24, padding:"28px 24px", cursor:"pointer",
                transition:"all .3s cubic-bezier(.34,1.56,.64,1)",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 48px rgba(0,170,200,0.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,170,200,0.50)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                }}>
                <div style={{ width:64, height:64, borderRadius:20, background:"linear-gradient(135deg,#00aac8,#38bdf8)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                  <Icon name="trophee" size={32} color="#06122a" />
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontWeight:900, fontSize:"1.1rem", color:"#fff", margin:0 }}>
                    {l === "en" ? "Biblical Championships" : l === "ht" ? "Chanpyona Biblik" : l === "es" ? "Campeonatos Bíblicos" : "Championnats Bibliques"}
                  </h3>
                  <span style={{ fontSize:9, fontWeight:900, background:"rgba(82,183,136,0.15)", color:"#52b788", border:"1px solid rgba(82,183,136,0.25)", padding:"2px 8px", borderRadius:999, letterSpacing:"0.12em" }}>
                    LIVE
                  </span>
                </div>
                <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.82rem", lineHeight:1.65, marginBottom:20 }}>
                  {l === "en" ? "Compete live with believers worldwide in real-time competitions." : l === "ht" ? "Konpete an dirèk ak kwayan toupatou nan konpetisyon an tan reyèl." : l === "es" ? "Compite en vivo con creyentes de todo el mundo en competencias en tiempo real." : "Compétez en direct avec des croyants du monde entier en temps réel."}
                </p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const, marginBottom:20 }}>
                  {[l==="en"?"Solo":l==="ht"?"Sèl":"Solo", l==="en"?"Teams":l==="ht"?"Ekip":"Équipes", l==="en"?"Live":l==="ht"?"An Dirèk":"En direct"].map((tag) => (
                    <span key={tag} style={{ fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.40)", background:"rgba(255,255,255,0.06)", padding:"3px 10px", borderRadius:999 }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, color:"#00aac8", fontWeight:800, fontSize:"0.85rem" }}>
                  {l === "en" ? "View championships" : l === "ht" ? "Wè chanpyona yo" : l === "es" ? "Ver campeonatos" : "Voir les championnats"} →
                </div>
              </div>
            </Link>
          </div>

          {/* CTA centré */}
          <div style={{ textAlign:"center" }}>
            <Link href="/quiz" style={{
              display:"inline-flex", alignItems:"center", gap:10,
              padding:"14px 36px", borderRadius:999,
              background:"linear-gradient(135deg,#c8960f,#f0c840)",
              color:"#0d1d3d", fontWeight:900, fontSize:"0.92rem",
              textDecoration:"none", boxShadow:"0 6px 24px rgba(200,150,15,0.30)",
              transition:"transform .2s, box-shadow .2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(200,150,15,0.40)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "none";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(200,150,15,0.30)";
              }}>
              <Icon name="quiz" size={18} /> {l === "en" ? "Start the Quiz" : l === "ht" ? "Kòmanse Kiz la" : l === "es" ? "Iniciar el Quiz" : "Commencer le Quiz"}
            </Link>
          </div>
        </div>
      </div>

      {/* ══ CERTIFICATS ══ */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14">
        <div style={{ background:"linear-gradient(150deg,#fffdf5 0%,#fff 60%)", border:"1px solid #e8c86c", borderLeft:"4px solid #c8960f", borderRadius:24, padding:"36px 32px", textAlign:"center" as const, position:"relative" as const, boxShadow:"0 4px 16px rgba(200,150,15,0.08)" }}>
          <div style={{ marginBottom:14, display:"flex", justifyContent:"center" }}><Icon name="certificat" size={44} color="#c8960f" /></div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(200,150,15,0.10)", border:"1px solid rgba(200,150,15,0.25)", color:"#c8960f", fontSize:9, fontWeight:900, padding:"4px 12px", borderRadius:999, marginBottom:16, letterSpacing:"0.18em" }}>
            {txt.soon[l]}
          </div>
          <h2 style={{ fontSize:"1.25rem", fontWeight:900, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:10 }}>{txt.certTitle[l]}</h2>
          <p style={{ color:"#4a6080", fontSize:"0.88rem", lineHeight:1.7, maxWidth:400, margin:"0 auto" }}>{txt.certSub[l]}</p>
        </div>
      </div>

      {/* ══ CTA FINAL ══ */}
      <div style={{ background:"#1a3568", padding:"48px 20px", textAlign:"center" as const }}>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" as const }}>
          <Link href="/etude" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 30px", borderRadius:999, fontWeight:800, fontSize:"0.9rem", background:"linear-gradient(135deg,#c8960f,#f0c840)", color:"#0d1d3d", textDecoration:"none", boxShadow:"0 4px 20px rgba(200,150,15,0.30)" }}>
            {txt.ctaExplore[l]}
          </Link>
          <Link href="/auth" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 30px", borderRadius:999, fontWeight:800, fontSize:"0.9rem", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.20)", color:"#fff", textDecoration:"none" }}>
            {txt.ctaJoin[l]}
          </Link>
        </div>
      </div>
    </main>
  );
}
