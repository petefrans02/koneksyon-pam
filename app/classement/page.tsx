"use client";

import { useLang } from "@/lib/LangContext";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AdBanner from "@/app/components/AdBanner";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

interface SchoolRank { school_name: string; country: string; class_count: number; student_count: number; subjects: string[]; }
interface SubjectRank { subject: string; question_count: number; student_count: number; }
interface CountryRank { country: string; school_count: number; student_count: number; class_count: number; }

const SUBJECT_CONFIG: Record<string, { icon: string; color: string; label: Record<string, string> }> = {
  bible:    { icon: "✝",  color: "#60a5fa", label: { fr: "Biblique",   ht: "Biblik",    en: "Biblical",   es: "Bíblico"      } },
  maths:    { icon: "∑",  color: "#a78bfa", label: { fr: "Maths",      ht: "Matematik", en: "Maths",      es: "Matemáticas"  } },
  sciences: { icon: "⚗", color: "#34d399", label: { fr: "Sciences",    ht: "Syans",     en: "Sciences",   es: "Ciencias"     } },
  histoire: { icon: "🌍", color: "#fbbf24", label: { fr: "Histoire",    ht: "Istwa",     en: "History",    es: "Historia"     } },
  langues:  { icon: "Aa", color: "#38bdf8", label: { fr: "Langues",     ht: "Lang",      en: "Languages",  es: "Idiomas"      } },
  arts:     { icon: "🎨", color: "#f472b6", label: { fr: "Arts",        ht: "Atizay",    en: "Arts",       es: "Artes"        } },
  tech:     { icon: "⌨", color: "#22d3ee", label: { fr: "Tech",        ht: "Teknoloji", en: "Tech",       es: "Tech"         } },
  sante:    { icon: "🌿", color: "#4ade80", label: { fr: "Santé",       ht: "Sante",     en: "Health",     es: "Salud"        } },
};

const COUNTRY_NAMES: Record<string, string> = {
  HT: "🇭🇹 Haïti", FR: "🇫🇷 France", CA: "🇨🇦 Canada",
  US: "🇺🇸 États-Unis", MQ: "🇲🇶 Martinique", GP: "🇬🇵 Guadeloupe",
  CM: "🇨🇲 Cameroun", SN: "🇸🇳 Sénégal", CD: "🇨🇩 RD Congo",
  BR: "🇧🇷 Brésil", MX: "🇲🇽 Mexique", DO: "🇩🇴 Rép. Dominicaine",
};

const RANK_MEDAL_COLORS = ["#d4a017", "#9ca3af", "#cd7f32"];
const FLOATING_ICONS: IconName[] = ["trophee", "monde", "croix", "etoile", "academie"];
const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e8e4de",
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(26,53,104,0.05)",
};

export default function ClassementPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;

  const [tab, setTab] = useState<"ecoles"|"matieres"|"pays">("ecoles");
  const [schools, setSchools] = useState<SchoolRank[]>([]);
  const [subjects, setSubjects] = useState<SubjectRank[]>([]);
  const [countries, setCountries] = useState<CountryRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleRows, setVisibleRows] = useState<Set<number>>(new Set());
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/classement")
      .then(r => r.json())
      .then(d => { setSchools(d.schools || []); setSubjects(d.subjects || []); setCountries(d.countries || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setVisibleRows(new Set());
    rowRefs.current = [];
  }, [tab]);

  const observeRow = useCallback((el: HTMLDivElement | null, idx: number) => {
    if (!el) return;
    rowRefs.current[idx] = el;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleRows(prev => new Set([...prev, idx]));
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
  }, []);

  const totalStudents = countries.reduce((s, c) => s + c.student_count, 0);

  const txt = {
    back:    l==="fr"?"← Accueil":l==="ht"?"← Lakay":l==="es"?"← Inicio":"← Home",
    title:   l==="fr"?"Tableau de bord mondial":l==="ht"?"Tablo mondial":l==="es"?"Tablero mundial":"World Dashboard",
    sub:     l==="fr"?"Découvrez les meilleures écoles et matières de l'Académie":l==="ht"?"Dekouvri pi bon lekòl yo ak matyè yo nan Akademi an":l==="es"?"Descubre las mejores escuelas y materias de la Academia":"Discover the top schools and subjects of the Academy",
    ecoles:  l==="fr"?"Écoles":l==="ht"?"Lekòl":l==="es"?"Escuelas":"Schools",
    matieres:l==="fr"?"Matières":l==="ht"?"Matyè":l==="es"?"Materias":"Subjects",
    pays:    l==="fr"?"Pays":l==="ht"?"Peyi":l==="es"?"Países":"Countries",
    classes: l==="fr"?"classes":l==="ht"?"klas":l==="es"?"clases":"classes",
    eleves:  l==="fr"?"élèves":l==="ht"?"elèv":l==="es"?"alumnos":"students",
    ecoles_s:l==="fr"?"écoles":l==="ht"?"lekòl":l==="es"?"escuelas":"schools",
    pays_s:  l==="fr"?"pays":l==="ht"?"peyi":l==="es"?"países":"countries",
    qDispo:  l==="fr"?"questions dispo":l==="ht"?"kesyon disponib":l==="es"?"preguntas dispon.":"questions available",
    actifs:  l==="fr"?"élèves actifs":l==="ht"?"elèv aktif":l==="es"?"alumnos activos":"active students",
    noSchool:l==="fr"?"Soyez les premiers !":l==="ht"?"Se premye yo !":l==="es"?"¡Sean los primeros!":"Be the first!",
    noSub:   l==="fr"?"Aucune école enregistrée encore. Créez une classe pour apparaître ici.":l==="ht"?"Pa gen lekòl ankò. Kreye yon klas pou parèt isit la.":l==="es"?"Aún no hay escuelas. Crea una clase para aparecer aquí.":"No schools yet. Create a class to appear here.",
    creer:   l==="fr"?"Créer une classe →":l==="ht"?"Kreye yon klas →":l==="es"?"Crear una clase →":"Create a class →",
    representes: l==="fr"?"pays représentés":l==="ht"?"peyi reprezante":l==="es"?"países representados":"countries represented",
  };

  const tabs: { key: "ecoles"|"matieres"|"pays"; label: string; icon: IconName }[] = [
    { key: "ecoles",   label: txt.ecoles,   icon: "batiment" },
    { key: "matieres", label: txt.matieres, icon: "academie" },
    { key: "pays",     label: txt.pays,     icon: "monde" },
  ];

  return (
    <div className="animate-page-awaken min-h-screen" style={{
      background: "linear-gradient(180deg, #fffbf0 0%, #ffffff 50%, #ffffff 100%)",
      backgroundImage: "radial-gradient(circle, rgba(200,150,15,0.04) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      color: "#1c1c2e",
    }}>

      <style>{`
        @keyframes cls-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes cls-ring2 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes cls-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cls-badge {
          0%,100% { box-shadow: 0 0 0 0 rgba(200,150,15,0.35); }
          50%      { box-shadow: 0 0 0 8px rgba(200,150,15,0); }
        }
        @keyframes cls-icon-float {
          0%,100% { transform: translateY(0px) rotate(0deg); opacity: 0.18; }
          50%      { transform: translateY(-18px) rotate(8deg); opacity: 0.32; }
        }
        @keyframes cls-shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
        @keyframes cls-row-in {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cls-card-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cls-stat-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cls-trophy-pulse {
          0%,100% { text-shadow: 0 0 0px #c8960f; }
          50%      { text-shadow: 0 0 18px #c8960f, 0 0 32px #f0c840; }
        }
        .cls-row-visible {
          animation: cls-row-in 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .cls-card-visible {
          animation: cls-card-in 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        .cls-row-hidden { opacity: 0; }
        .cls-subject-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .cls-subject-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(26,53,104,0.18);
          border-color: rgba(0,170,200,0.35) !important;
        }
        .cls-rank-row { transition: background 0.2s ease, border-left 0.2s ease; }
        .cls-rank-row:hover {
          background: #fffbf0 !important;
          border-left: 3px solid #c8960f !important;
        }
      `}</style>

      {/* Subtle floating icons */}
      {FLOATING_ICONS.map((icon, i) => (
        <div key={i} style={{
          position: "fixed",
          top: `${15 + i * 15}%`, left: `${5 + (i % 2) * 88}%`,
          pointerEvents: "none", zIndex: 0, userSelect: "none", opacity: 0.04,
          animation: `cls-icon-float ${5 + i * 1.2}s ease-in-out infinite`,
          animationDelay: `${i * 0.7}s`,
        }}><Icon name={icon} size={44} /></div>
      ))}

      {/* Header / Hero */}
      <div style={{
        background: "linear-gradient(135deg, #c8960f 0%, #1a3568 35%, #0d1d3d 100%)",
        color: "#fff", position: "relative", overflow: "hidden",
      }}>
        {/* Background depth */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          width:600, height:300, background:"radial-gradient(ellipse,rgba(200,150,15,0.20),transparent 70%)",
          filter:"blur(40px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", right:"-3%", top:"50%", transform:"translateY(-50%)",
          opacity:0.05, userSelect:"none", pointerEvents:"none" }}><Icon name="trophee" size={260} /></div>

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pt-10 pb-10">
          <Link href="/" style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.75rem", fontWeight:600, textDecoration:"none",
            display:"inline-block", marginBottom:24 }}>
            {txt.back}
          </Link>

          <div style={{ animation: "cls-up 0.6s cubic-bezier(0.22,1,0.36,1) both", animationDelay: "0.05s" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8, borderRadius:999,
              padding:"6px 16px", marginBottom:20, fontSize:10, fontWeight:900, letterSpacing:"0.22em",
              background: "rgba(200,150,15,0.25)", border: "1px solid rgba(200,150,15,0.50)",
              color: "#f0c840", animation: "cls-badge 2.5s ease-in-out infinite",
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#f0c840", display:"inline-block" }} />
              <Icon name="trophee" size={13} /> {l==="fr"?"Classements Mondiaux":l==="ht"?"Klasman Mondyal":l==="es"?"Rankings Mundiales":"World Rankings"}
            </div>
          </div>

          <div style={{ animation: "cls-up 0.6s cubic-bezier(0.22,1,0.36,1) both", animationDelay: "0.12s" }}>
            <h1 style={{
              fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight:900, marginBottom:8,
              fontFamily:"'Playfair Display',Georgia,serif",
              background: "linear-gradient(135deg, #fff 0%, #fde68a 60%, #f0c840 100%)",
              backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{txt.title}</h1>
            <p style={{ color:"rgba(255,255,255,0.60)", fontSize:"0.88rem", marginBottom:24 }}>{txt.sub}</p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-bold" style={{ animation: "cls-up 0.6s cubic-bezier(0.22,1,0.36,1) both", animationDelay: "0.2s" }}>
            {([
              { bg: "rgba(255,255,255,0.12)", color: "#f0c840",  icon: "batiment",    text: `${schools.length} ${txt.ecoles_s}` },
              { bg: "rgba(255,255,255,0.10)", color: "#fff",      icon: "utilisateurs",text: `${totalStudents} ${txt.eleves}` },
              { bg: "rgba(255,255,255,0.10)", color: "#7dd3e8",   icon: "monde",       text: `${countries.length} ${txt.pays_s}` },
            ] as { bg: string; color: string; icon: IconName; text: string }[]).map((p, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                style={{ background: p.bg, color: p.color, backdropFilter:"blur(4px)",
                  border:"1px solid rgba(255,255,255,0.15)",
                  animation: `cls-stat-in 0.5s ease both`, animationDelay: `${0.28 + i * 0.08}s` }}>
                <Icon name={p.icon} size={14} /> {p.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8">
        <div className="flex gap-1 mb-8" style={{ borderBottom: "2px solid #e8e4de" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-3 text-sm font-bold transition-all inline-flex items-center gap-1.5"
              style={{
                color: tab === t.key ? "#1a3568" : "#4a5568",
                borderBottom: tab === t.key ? "2px solid #1a3568" : "2px solid transparent",
                marginBottom: -2,
                background: "none",
                outline: "none",
                cursor: "pointer",
              }}>
              <Icon name={t.icon} size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="h-16 rounded-2xl animate-pulse"
                style={{ background: "#ffffff", border: "1px solid #e8e4de" }} />
            ))}
          </div>
        )}

        {/* Tab: Écoles */}
        {!loading && tab === "ecoles" && (
          schools.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center rounded-3xl"
              style={{ background: "#fffbf0", border: "1px solid rgba(200,150,15,0.20)", animation: "cls-card-in 0.5s ease both" }}>
              <Icon name="trophee" size={48} color="#c8960f" />
              <p style={{ color:"#1a3568" }} className="font-black text-lg">{txt.noSchool}</p>
              <p style={{ color:"#4a5568" }} className="text-sm max-w-xs">{txt.noSub}</p>
              <Link href="/enseignant/creer-classe"
                className="px-6 py-3 rounded-2xl font-black text-sm transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #d4a017 0%, #f0c840 100%)", color: "#04040d", boxShadow: "0 4px 20px rgba(212,160,23,0.35)" }}>
                {txt.creer}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {schools.map((s, i) => (
                <div
                  key={i}
                  ref={el => observeRow(el, i)}
                  className={`cls-rank-row flex items-center gap-4 px-5 py-4 rounded-2xl ${visibleRows.has(i) ? "cls-row-visible" : "cls-row-hidden"}`}
                  style={{ ...CARD, animationDelay: `${i * 0.06}s` }}>
                  <span className="w-8 flex items-center justify-center shrink-0"
                    style={i < 3 ? { animation: "cls-trophy-pulse 2.5s ease-in-out infinite", animationDelay: `${i * 0.3}s` } : {}}>
                    {i < 3 ? <Icon name="medaille" size={22} color={RANK_MEDAL_COLORS[i]} /> : <span style={{ color: "#d4a017", fontWeight: 900 }}>#{i+1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p style={{ color:"#1a3568" }} className="font-black text-sm truncate">{s.school_name}</p>
                    <p style={{ color:"#4a5568" }} className="text-xs">{COUNTRY_NAMES[s.country] ?? s.country}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(s.subjects || []).map(sub => {
                        const cfg = SUBJECT_CONFIG[sub];
                        return cfg ? (
                          <span key={sub} className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: cfg.color+"18", color: cfg.color }}>
                            {cfg.icon} {cfg.label[l]}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p style={{ color:"#4a5568" }} className="text-xs">{s.class_count} {txt.classes}</p>
                    <p className="font-black text-sm" style={{ color: "#c8960f" }}>{s.student_count} {txt.eleves}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Tab: Matières */}
        {!loading && tab === "matieres" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(SUBJECT_CONFIG).map(([key, cfg], i) => {
              const data = subjects.find(s => s.subject === key);
              return (
                <Link key={key} href={`/domaines/${key}`}
                  className="cls-subject-card flex flex-col gap-3 p-5 rounded-2xl"
                  style={{
                    background: "#ffffff",
                    border: `1px solid ${cfg.color}30`,
                    borderTop: `3px solid ${cfg.color}`,
                    borderRadius: 16, textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(26,53,104,0.06)",
                    animation: "cls-card-in 0.5s cubic-bezier(0.22,1,0.36,1) both",
                    animationDelay: `${i * 0.07}s`,
                  }}>
                  <span className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center font-black"
                    style={{ background: cfg.color+"18", color: cfg.color }}>
                    {cfg.icon}
                  </span>
                  <p style={{ color:"#1a3568" }} className="font-black text-sm">{cfg.label[l]}</p>
                  <div className="text-xs flex flex-col gap-0.5">
                    <span style={{ color:"#4a5568" }}>{data?.question_count ?? 0} {txt.qDispo}</span>
                    <span style={{ color: "#c8960f" }}>{data?.student_count ?? 0} {txt.actifs}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Tab: Pays */}
        {!loading && tab === "pays" && (
          <>
            <p style={{ color:"#4a5568" }} className="text-xs mb-4">{countries.length} {txt.representes}</p>
            <div className="flex flex-col gap-3">
              {countries.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center rounded-3xl"
                  style={{ background: "#fffbf0", border: "1px solid rgba(200,150,15,0.20)", animation: "cls-card-in 0.5s ease both" }}>
                  <Icon name="monde" size={40} color="#c8960f" />
                  <p style={{ color:"#4a5568" }} className="text-sm">{txt.noSub}</p>
                </div>
              ) : (
                countries.sort((a,b) => b.student_count - a.student_count).map((c, i) => (
                  <div
                    key={c.country}
                    ref={el => observeRow(el, i)}
                    className={`cls-rank-row flex items-center gap-4 px-5 py-4 rounded-2xl ${visibleRows.has(i) ? "cls-row-visible" : "cls-row-hidden"}`}
                    style={{ ...CARD, animationDelay: `${i * 0.06}s` }}>
                    <span className="w-8 flex items-center justify-center shrink-0"
                      style={i < 3 ? { animation: "cls-trophy-pulse 2.5s ease-in-out infinite", animationDelay: `${i * 0.3}s` } : {}}>
                      {i < 3 ? <Icon name="medaille" size={22} color={RANK_MEDAL_COLORS[i]} /> : <span className="text-white/30 font-black text-sm">#{i+1}</span>}
                    </span>
                    <p style={{ color:"#1a3568" }} className="flex-1 font-black text-sm">{COUNTRY_NAMES[c.country] ?? c.country}</p>
                    <div className="flex gap-4 text-xs text-right shrink-0">
                      <div><p style={{ color:"#718096" }}>{txt.ecoles_s}</p><p style={{ color:"#1a3568" }} className="font-bold">{c.school_count}</p></div>
                      <div><p style={{ color:"#718096" }}>{txt.classes}</p><p style={{ color:"#1a3568" }} className="font-bold">{c.class_count}</p></div>
                      <div><p style={{ color:"#718096" }}>{txt.eleves}</p><p className="font-black" style={{ color: "#c8960f" }}>{c.student_count}</p></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* CTA cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { icon: "enseignement", href: "/etude?parcours=enseignements", color: "#60a5fa",
              label: l==="fr"?"Enseignements":l==="ht"?"Ansèyman":l==="es"?"Enseñanzas":"Teachings",
              desc: l==="fr"?"Séries bibliques":l==="ht"?"Seri biblik":l==="es"?"Series bíblicas":"Bible series" },
            { icon: "trophee", href: "/championnats", color: "#d4a017",
              label: l==="fr"?"Championnats":l==="ht"?"Chanpyona":l==="es"?"Campeonatos":"Championships",
              desc: l==="fr"?"Participer maintenant":l==="ht"?"Patisipe kounye a":l==="es"?"Participar ahora":"Join now" },
            { icon: "classement", href: "/dashboard", color: "#a78bfa",
              label: l==="fr"?"Mon espace":l==="ht"?"Espas mwen":l==="es"?"Mi espacio":"My space",
              desc: l==="fr"?"Voir mes stats":l==="ht"?"Wè stat mwen":l==="es"?"Ver mis stats":"See my stats" },
          ] as { icon: IconName; href: string; color: string; label: string; desc: string }[]).map((card, i) => (
            <Link key={i} href={card.href}
              className="group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:-translate-y-1"
              style={{
                background: "#ffffff",
                border: `1px solid #e8e4de`,
                borderTop: `3px solid ${card.color}`,
                borderRadius: 16, textDecoration: "none",
                boxShadow: "0 2px 8px rgba(26,53,104,0.06)",
                animation: "cls-card-in 0.5s cubic-bezier(0.22,1,0.36,1) both",
                animationDelay: `${0.1 + i * 0.1}s`,
              }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${card.color}18` }}><Icon name={card.icon} size={22} color={card.color} /></span>
              <div>
                <p style={{ color:"#1a3568" }} className="font-black text-sm">{card.label}</p>
                <p className="text-xs" style={{ color: card.color }}>{card.desc}</p>
              </div>
              <span className="ml-auto text-lg" style={{ color:"#c8c8c8" }}>›</span>
            </Link>
          ))}
        </div>

        {/* Ad banner */}
        <div className="mt-8 mb-4">
          <AdBanner slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CLASSEMENT ?? "0000000004"} format="horizontal" minHeight={90} />
        </div>
        <div className="h-8" />
      </div>
    </div>
  );
}
