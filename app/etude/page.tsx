"use client";
import RequireAuth from "@/app/components/RequireAuth";
import { gl } from "@/lib/lang-helper";
import { useLang } from "@/lib/LangContext";
import { studies, ParcoursKey, studyIcon, studyAccent } from "@/lib/studies-data";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MissionBanner from "@/app/components/MissionBanner";
import AdBanner from "@/app/components/AdBanner";
import { Suspense } from "react";
import Icon from "@/app/components/Icon";
import HeroBackdrop from "@/app/components/HeroBackdrop";

const PARCOURS_LABELS: Record<ParcoursKey, Partial<Record<"fr" | "ht" | "en" | "es", string>>> = {
  "fondements":          { fr: "Fondements de la Foi", ht: "Fondasyon Lafwa", en: "Foundations of Faith", es: "Fundamentos de la Fe" },
  "psaumes":             { fr: "Les Psaumes", ht: "Sòm yo", en: "The Psalms", es: "Los Salmos" },
  "nouveau-testament":   { fr: "Nouveau Testament", ht: "Nouvo Testaman", en: "New Testament", es: "Nuevo Testamento" },
  "histoire-sainte":     { fr: "Histoire Sainte", ht: "Istwa Sen", en: "Sacred History", es: "Historia Sagrada" },
  "formation-disciples": { fr: "Formation de Disciples", ht: "Fòmasyon Disip", en: "Disciple Training", es: "Formación de Discípulos" },
  "theologie":           { fr: "Théologie Évangélique", ht: "Teyoloji Evanjelik", en: "Evangelical Theology", es: "Teología Evangélica" },
  "enseignements":       { fr: "Enseignements", ht: "Ansèyman", en: "Teachings", es: "Enseñanzas" },
};

function EtudeContent() {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const parcoursParam = searchParams.get("parcours") as ParcoursKey | null;
  const isValidParcours = parcoursParam != null && parcoursParam in PARCOURS_LABELS;
  const activeParcours = isValidParcours ? (parcoursParam as ParcoursKey) : null;
  const filteredStudies = activeParcours ? studies.filter((s) => s.parcours === activeParcours) : studies;

  const difficultyStyle = (diff: string) => {
    const d = diff.toLowerCase();
    if (d.includes("débutant") || d.includes("debitan") || d.includes("beginner") || d.includes("principiante"))
      return { background: "rgba(22,163,74,0.10)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.22)" };
    if (d.includes("interm"))
      return { background: "rgba(217,119,6,0.10)", color: "#c8960f", border: "1px solid rgba(217,119,6,0.22)" };
    if (d.includes("avan") || d.includes("advanced"))
      return { background: "rgba(124,58,237,0.10)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.22)" };
    return { background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.20)" };
  };

  const baseTitle = lang==="fr"?"Études Bibliques":lang==="ht"?"Etid Biblik":lang==="es"?"Estudios Bíblicos":"Bible Studies";
  const title    = activeParcours ? gl(PARCOURS_LABELS[activeParcours], lang) : baseTitle;
  const subtitle = activeParcours
    ? (lang==="fr"?"Les leçons de ce parcours — suivez-les dans l'ordre":lang==="ht"?"Leson pou parcou sa a — swiv yo nan lòd":lang==="es"?"Las lecciones de este itinerario — síguelas en orden":"The lessons of this learning path — follow them in order")
    : (lang==="fr"?"Approfondissez votre connaissance de la Parole de Dieu":lang==="ht"?"Apwofondi konesans ou nan Pawòl Bondye a":lang==="es"?"Profundiza tu conocimiento de la Palabra de Dios":"Deepen your knowledge of God's Word");
  const allLabel = lang==="fr"?"← Tous les parcours":lang==="ht"?"← Tout parcou yo":lang==="es"?"← Todos los itinerarios":"← All learning paths";
  const lessonsWord = lang==="fr"?"leçons":lang==="ht"?"leson":lang==="es"?"lecciones":"lessons";

  return (
    <RequireAuth>
      <style>{`
        @keyframes etd-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes etd-badge { from { opacity:0; transform:scale(.85) translateY(-6px); } to { opacity:1; transform:none; } }
        @keyframes etd-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        @keyframes etd-card-in { from { opacity:0; transform:translateY(24px) scale(.98); } to { opacity:1; transform:none; } }
        @keyframes etd-dot { 0%,100%{box-shadow:0 0 0 0 rgba(0,170,200,0);}50%{box-shadow:0 0 0 5px rgba(0,170,200,.16);} }
        .etd-card {
          display:block; text-decoration:none; color:inherit; background:#fff;
          border:1px solid #e8e4de; border-radius:20px; overflow:hidden; position:relative;
          transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .3s ease;
        }
        .etd-card:hover { transform: translateY(-5px); box-shadow: 0 14px 40px rgba(26,53,104,0.12); border-color:#d8d2c8 !important; }
        .etd-card-reveal { animation: etd-card-in .6s cubic-bezier(.16,1,.3,1) both; }
        .etd-num { transition: transform .3s; }
        .etd-card:hover .etd-num { transform: translateX(4px); }
      `}</style>

      <main className="animate-page-awaken" style={{ background:"#ffffff", minHeight:"100vh", color:"#1c1c2e" }}>
        {/* ══ HERO clair ══ */}
        <div style={{ background:"linear-gradient(135deg,#fbfaf7 0%,#f3f0ea 100%)", borderBottom:"1px solid #e8e4de", position:"relative", overflow:"hidden" }}>
          <HeroBackdrop image="/hero/etude.jpg" tint="light" />
          <div style={{ position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)", width:640, height:320, background:"radial-gradient(ellipse, rgba(0,170,200,0.10) 0%, transparent 68%)", pointerEvents:"none" }} />
          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-12 text-center" style={{ position:"relative", zIndex:2 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,170,200,0.08)", border:"1px solid rgba(0,170,200,0.22)", color:"#0891b2", fontSize:10, fontWeight:900, padding:"6px 18px", borderRadius:999, marginBottom:22, letterSpacing:"0.22em", animation:"etd-badge .8s cubic-bezier(.16,1,.3,1) both" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#00aac8", display:"inline-block", animation:"etd-dot 2s ease-in-out infinite" }} />
              <Icon name="etude" size={13} /> {lang==="fr"?"ÉTUDES BIBLIQUES":lang==="ht"?"ETID BIBLIK":lang==="es"?"ESTUDIOS BÍBLICOS":"BIBLE STUDIES"}
            </div>
            <div style={{ marginBottom:14, display:"flex", justifyContent:"center", animation:"etd-float 3.5s ease-in-out infinite" }}>
              <div style={{ width:70, height:70, borderRadius:20, background:"linear-gradient(135deg,#e6f6fb,#fff)", border:"1px solid rgba(0,170,200,0.22)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(0,170,200,0.12)" }}>
                <Icon name="etude" size={34} color="#0891b2" />
              </div>
            </div>
            <h1 style={{ fontSize:"clamp(1.9rem,4.5vw,3rem)", fontWeight:900, lineHeight:1.1, marginBottom:12, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", animation:"etd-up .8s cubic-bezier(.16,1,.3,1) .15s both" }}>{title}</h1>
            <p style={{ color:"#5a6472", maxWidth:480, margin:"0 auto", lineHeight:1.7, fontSize:"0.95rem", animation:"etd-up .8s cubic-bezier(.16,1,.3,1) .3s both" }}>{subtitle}</p>
          </div>
          <div style={{ height:3, background:"linear-gradient(90deg,transparent,#c8960f,transparent)" }} />
        </div>

        {/* ══ GRILLE ÉTUDES ══ */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
          {activeParcours && (
            <div style={{ marginBottom:24 }}>
              <Link href="/academie" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:"0.82rem", fontWeight:700, color:"#0891b2", textDecoration:"none", background:"rgba(0,170,200,0.07)", border:"1px solid rgba(0,170,200,0.18)", padding:"7px 16px", borderRadius:999 }}>{allLabel}</Link>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredStudies.map((study, i) => {
              const accent = studyAccent(study.color);
              return (
              <Link
                key={study.slug}
                href={`/etude/${study.slug}`}
                className="etd-card etd-card-reveal"
                style={{ animationDelay:`${Math.min(i, 8)*0.06}s` }}
              >
                <div className={`bg-gradient-to-r ${study.color}`} style={{ height:4 }} />
                <div style={{ padding:"22px 22px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:`${accent}14`, border:`1px solid ${accent}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon name={studyIcon(study.slug)} size={26} color={accent} />
                    </div>
                    <div style={{ flex:1 }}>
                      {activeParcours && (
                        <span style={{ fontSize:"0.62rem", fontWeight:800, letterSpacing:"0.10em", color:accent, textTransform:"uppercase" as const }}>
                          {lessonsWord.slice(0,-1)} {i+1}
                        </span>
                      )}
                      <h3 style={{ fontWeight:800, fontSize:"1.02rem", color:"#1a3568", marginBottom:5, fontFamily:"'Playfair Display',Georgia,serif" }}>
                        {gl(study.title, lang)}
                      </h3>
                      <p style={{ fontSize:"0.82rem", color:"#5a6472", lineHeight:1.6, marginBottom:12 }}>
                        {gl(study.description, lang)}
                      </p>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" as const }}>
                        <span style={{ fontSize:"0.70rem", fontWeight:600, padding:"3px 10px", borderRadius:999, background:"#ffffff", color:"#7a8290", border:"1px solid #e8e4de", display:"inline-flex", alignItems:"center", gap:4 }}>
                          <Icon name="chrono" size={11} /> {study.duration}
                        </span>
                        <span style={{ fontSize:"0.70rem", fontWeight:700, padding:"3px 10px", borderRadius:999, ...difficultyStyle(gl(study.difficulty, lang)) }}>{gl(study.difficulty, lang)}</span>
                        <span style={{ fontSize:"0.70rem", color:"#9ca3af" }}>
                          {study.sections.length} {lessonsWord}
                        </span>
                        <span className="etd-num" style={{ marginLeft:"auto", color:accent, display:"inline-flex" }}><Icon name="fleche_droite" size={18} /></span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>

          <div style={{ marginTop:32 }}>
            <AdBanner slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ETUDE ?? "0000000005"} format="horizontal" minHeight={90} className="mb-6" />
            <MissionBanner variant="card" />
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}

export default function EtudePage() {
  return (
    <Suspense fallback={null}>
      <EtudeContent />
    </Suspense>
  );
}
