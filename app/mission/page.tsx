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

export default function MissionPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;

  const missionCards = useReveal();
  const valuesReveal = useReveal();
  const callReveal   = useReveal();

  const t = {
    badge:       { fr:"NOTRE MISSION", ht:"MISYON NOU", en:"OUR MISSION", es:"NUESTRA MISIÓN" },
    hero_title:  { fr:"Une Mission. Un Dieu. Une Vision.", ht:"Yon Misyon. Yon Bondye. Yon Vizyon.", en:"One Mission. One God. One Vision.", es:"Una Misión. Un Dios. Una Visión." },
    hero_sub:    { fr:"Former des disciples. Transformer des vies. Pour la gloire de Dieu.", ht:"Fòme disip. Transfòme lavi. Pou glwa Bondye.", en:"Making disciples. Transforming lives. For the glory of God.", es:"Formando discípulos. Transformando vidas. Para la gloria de Dios." },
    why_title:   { fr:"Pourquoi KONEKSYON PAM existe", ht:"Poukisa KONEKSYON PAM egziste", en:"Why KONEKSYON PAM exists", es:"Por qué existe KONEKSYON PAM" },
    why_body:    { fr:"KONEKSYON PAM est née d'une conviction profonde : la Parole de Dieu doit atteindre chaque nation, chaque famille, chaque enfant — quelle que soit leur langue ou condition. Fondée par le Pasteur Peterson Francis, cette organisation chrétienne internationale poursuit deux grandes missions : former des disciples par la Parole, et transformer des vies par des actions humanitaires concrètes.", ht:"KONEKSYON PAM te fèt sou yon konviksyon fon : Pawòl Bondye a dwe rive nan chak nasyon, chak fanmi, chak timoun — kèlkeswa lang oswa kondisyon yo. Fondé pa Pastè Peterson Francis, òganizasyon kretyen entènasyonal sa a pousuiv de gran misyon : fòme disip pa Pawòl la, ak transfòme lavi pa aksyon imanitè konkrè.", en:"KONEKSYON PAM was born from a deep conviction: God's Word must reach every nation, every family, every child — regardless of their language or condition. Founded by Pastor Peterson Francis, this international Christian organization pursues two great missions: forming disciples through the Word, and transforming lives through concrete humanitarian action.", es:"KONEKSYON PAM nació de una profunda convicción: la Palabra de Dios debe llegar a cada nación, cada familia, cada niño, sin importar su idioma o condición. Fundada por el Pastor Peterson Francis, esta organización cristiana internacional persigue dos grandes misiones: formar discípulos a través de la Palabra, y transformar vidas mediante acciones humanitarias concretas." },
    m1_title:    { fr:"Former des Disciples", ht:"Fòme Disip", en:"Making Disciples", es:"Formar Discípulos" },
    m1_body:     { fr:"Académie Biblique, Championnats Bibliques, études approfondies, enseignements doctrinaux. Nous équipons chaque croyant pour grandir dans la Parole de Dieu et vivre sa foi au quotidien.", ht:"Akademi Biblik, Chanpyona Biblik, etid apwofondi, ansèyman doktrinal. Nou ekipe chak kwayan pou grandi nan Pawòl Bondye a ak viv lafwa li chak jou.", en:"Biblical Academy, Biblical Championships, in-depth studies, doctrinal teachings. We equip every believer to grow in God's Word and live their faith daily.", es:"Academia Bíblica, Campeonatos Bíblicos, estudios profundos, enseñanzas doctrinales. Equipamos a cada creyente para crecer en la Palabra de Dios y vivir su fe diariamente." },
    m2_title:    { fr:"Transformer des Vies", ht:"Transfòme Lavi", en:"Transforming Lives", es:"Transformar Vidas" },
    m2_body:     { fr:"Distribution de Bibles, soutien scolaire, entraide, missions chrétiennes. Une communauté qui agit concrètement, avec transparence et intégrité — uniquement des données réelles.", ht:"Distribisyon Bib, sipò lekòl, antrèd, misyon kretyen. Yon kominote k ap aji konkrètman, ak transparans ak entegrite — done reyèl sèlman.", en:"Bible distribution, school support, mutual aid, Christian missions. A community that acts concretely, with transparency and integrity — only real data.", es:"Distribución de Biblias, apoyo escolar, ayuda mutua, misiones cristianas. Una comunidad que actúa concretamente, con transparencia e integridad — solo datos reales." },
    val_title:   { fr:"Nos Valeurs", ht:"Valè Nou", en:"Our Values", es:"Nuestros Valores" },
    call_title:  { fr:"Notre Appel", ht:"Apèl Nou", en:"Our Call", es:"Nuestro Llamado" },
    call_verse:  { fr:"« Allez, faites de toutes les nations des disciples. »", ht:"« Ale, fè tout nasyon yo tounen disip mwen. »", en:"« Go and make disciples of all nations. »", es:"« Vayan y hagan discípulos de todas las naciones. »" },
    call_ref:    { fr:"Matthieu 28:19", ht:"Matye 28:19", en:"Matthew 28:19", es:"Mateo 28:19" },
    call_body:   { fr:"C'est sur cet appel que KONEKSYON PAM est bâtie. Chaque fonctionnalité, chaque projet, chaque action — tout est au service de cette grande mission.", ht:"Se sou apèl sa a ke KONEKSYON PAM bati. Chak fonksyonalite, chak pwojè, chak aksyon — tout sèvi gran misyon sa a.", en:"It is on this call that KONEKSYON PAM is built. Every feature, every project, every action — all in service of this great mission.", es:"Es sobre este llamado que KONEKSYON PAM está construida. Cada funcionalidad, cada proyecto, cada acción — todo al servicio de esta gran misión." },
    cta1:        { fr:"Rejoindre la communauté →", ht:"Antre nan kominote a →", en:"Join the community →", es:"Unirse a la comunidad →" },
    cta2:        { fr:"Soutenir la communauté", ht:"Sipòte kominote a", en:"Support the community", es:"Apoyar la comunidad" },
  };

  const VALUES: { icon: IconName; key: string; color: string; desc: Record<Lang, string> }[] = [
    { icon:"priere", key:"Foi",           color:"#c8960f", desc:{ fr:"Nous croyons que Dieu peut transformer chaque vie — sans exception.", ht:"Nou kwè Bondye ka transfòme chak lavi — san eksepsyon.", en:"We believe God can transform every life — without exception.", es:"Creemos que Dios puede transformar cada vida — sin excepción." } },
    { icon:"croix", key:"Évangile",      color:"#d97706", desc:{ fr:"Jésus-Christ est au centre de tout ce que nous faisons.", ht:"Jezi-Kri se nan kè tout sa nou fè.", en:"Jesus Christ is at the center of everything we do.", es:"Jesucristo está en el centro de todo lo que hacemos." } },
    { icon:"recherche", key:"Transparence",  color:"#1a3568", desc:{ fr:"Nous n'affichons que des données réelles. Jamais de faux chiffres.", ht:"Nou montre done reyèl sèlman. Jamè fo chif.", en:"We only display real data. Never fake numbers.", es:"Solo mostramos datos reales. Nunca cifras falsas." } },
    { icon:"poignee_main", key:"Service",       color:"#16a34a", desc:{ fr:"Servir les autres est un acte d'adoration envers Dieu.", ht:"Sèvi lòt moun se yon zak adowasyon bay Bondye.", en:"Serving others is an act of worship to God.", es:"Servir a los demás es un acto de adoración a Dios." } },
    { icon:"monde", key:"Universalité",  color:"#7c3aed", desc:{ fr:"Toutes les nations, toutes les langues, toutes les cultures.", ht:"Tout nasyon, tout lang, tout kilti.", en:"All nations, all languages, all cultures.", es:"Todas las naciones, todos los idiomas, todas las culturas." } },
    { icon:"etoile", key:"Excellence",    color:"#be185d", desc:{ fr:"Tout ce que nous faisons, nous le faisons pour la gloire de Dieu.", ht:"Tout sa nou fè, nou fè l pou glwa Bondye.", en:"Everything we do, we do for the glory of God.", es:"Todo lo que hacemos, lo hacemos para la gloria de Dios." } },
  ];

  const valKeys: Record<string,{ fr:string,ht:string,en:string,es:string }> = {
    "Foi":          { fr:"Foi", ht:"Lafwa", en:"Faith", es:"Fe" },
    "Évangile":     { fr:"Évangile", ht:"Levanjil", en:"Gospel", es:"Evangelio" },
    "Transparence": { fr:"Transparence", ht:"Transparans", en:"Transparency", es:"Transparencia" },
    "Service":      { fr:"Service", ht:"Sèvis", en:"Service", es:"Servicio" },
    "Universalité": { fr:"Universalité", ht:"Inivèsalite", en:"Universality", es:"Universalidad" },
    "Excellence":   { fr:"Excellence", ht:"Ekselans", en:"Excellence", es:"Excelencia" },
  };

  return (
    <main style={{ minHeight:"100vh", background:"#ffffff" }}>
      <style>{`
        @keyframes mis-aurora { 0%,100%{opacity:.50;transform:scale(1) translateY(0);}50%{opacity:.78;transform:scale(1.07) translateY(-12px);} }
        @keyframes mis-orb-a  { 0%,100%{transform:translate(0,0);}40%{transform:translate(20px,-22px);}70%{transform:translate(-14px,16px);} }
        @keyframes mis-orb-b  { 0%,100%{transform:translate(0,0);}35%{transform:translate(-18px,18px);}68%{transform:translate(14px,-12px);} }
        @keyframes mis-ring   { from{transform:translate(-50%,-50%) rotate(0deg);}to{transform:translate(-50%,-50%) rotate(360deg);} }
        @keyframes mis-up     { from{opacity:0;transform:translateY(22px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes mis-badge  { from{opacity:0;transform:scale(.82) translateY(-8px);}to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes mis-shimmer{ 0%{background-position:200% center;}100%{background-position:-200% center;} }
        @keyframes mis-float  { 0%,100%{transform:translateY(0);}50%{transform:translateY(-9px);} }
        @keyframes mis-card   { from{opacity:0;transform:translateY(26px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes mis-dot    { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0);}50%{box-shadow:0 0 0 6px rgba(212,160,23,.18);} }
        .mis-val-card { transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease,border-color .3s ease; }
        .mis-val-card:hover { transform:translateY(-5px); box-shadow:0 10px 34px rgba(0,0,0,0.08); border-color:#e8e4de !important; }
      `}</style>

      {/* ══ HERO sombre ══ */}
      <div style={{ background:"linear-gradient(135deg,#06122a,#0d2048)", position:"relative", overflow:"hidden", minHeight:"70vh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <HeroBackdrop image="/hero/mission.jpg" tint="dark" />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)", width:600, height:300, background:"radial-gradient(ellipse,rgba(200,150,15,0.12) 0%,transparent 65%)", filter:"blur(50px)" }} />
        </div>

        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-16 pb-14 text-center" style={{ position:"relative", zIndex:10 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(212,160,23,0.10)", border:"1px solid rgba(212,160,23,0.28)", color:"#fbbf24", fontSize:10, fontWeight:900, padding:"6px 18px", borderRadius:999, marginBottom:24, letterSpacing:"0.24em", animation:"mis-badge .9s cubic-bezier(.16,1,.3,1) both" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#d4a017", boxShadow:"0 0 8px #d4a017", display:"inline-block", animation:"mis-dot 2s ease-in-out infinite" }} />
            <Icon name="croix" size={13} /> {t.badge[l]}
          </div>
          <h1 style={{ fontSize:"clamp(1.9rem,4.5vw,3.2rem)", fontWeight:900, lineHeight:1.08, marginBottom:16, background:"linear-gradient(135deg,#fff 0%,#fbbf24 55%,#d4a017 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"mis-up .9s cubic-bezier(.16,1,.3,1) .15s both, mis-shimmer 7s linear infinite" }}>
            {t.hero_title[l]}
          </h1>
          <p style={{ color:"rgba(255,255,255,0.55)", maxWidth:500, margin:"0 auto 28px", lineHeight:1.7, fontSize:"1rem", animation:"mis-up .9s cubic-bezier(.16,1,.3,1) .3s both" }}>
            {t.hero_sub[l]}
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:24, animation:"mis-up .9s cubic-bezier(.16,1,.3,1) .45s both" }}>
            {(["croix","monde","priere","bible","coeur"] as IconName[]).map((icon, i) => (
              <span key={icon} style={{ color:"#f4c542", animation:`mis-float ${3.2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.18}s`, filter:"drop-shadow(0 0 10px rgba(212,160,23,0.40))" }}><Icon name={icon} size={26} /></span>
            ))}
          </div>
        </div>
        {/* Séparateur hero → contenu */}
        <div className="kpf-separator" />
      </div>

      {/* ══ CONTENU CLAIR ══ */}
      <div style={{ background:"#ffffff" }}>

        {/* POURQUOI */}
        <div style={{ background:"#ffffff", padding:"clamp(40px,5vw,72px) 20px" }}>
          <div className="max-w-4xl mx-auto">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fffbf0", border:"1px solid #e8c86c", color:"#c8960f", fontSize:10, fontWeight:900, padding:"5px 14px", borderRadius:999, marginBottom:24, letterSpacing:"0.18em" }}>
              <Icon name="etincelles" size={12} /> {l==="fr"?"NOTRE HISTOIRE":l==="ht"?"ISTWA NOU":l==="es"?"NUESTRA HISTORIA":"OUR STORY"}
            </div>
            <div style={{ background:"#ffffff", border:"1px solid #e8e4de", borderLeft:"4px solid #c8960f", borderTop:"3px solid #c8960f", borderRadius:20, padding:"clamp(24px,4vw,44px)", boxShadow:"0 4px 16px rgba(26,53,104,0.06)" }}>
              <h2 style={{ fontSize:"clamp(1.2rem,2.8vw,1.8rem)", fontWeight:900, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:18 }}>{t.why_title[l]}</h2>
              <p style={{ color:"#4a6080", lineHeight:1.85, fontSize:"0.97rem" }}>{t.why_body[l]}</p>
              <div style={{ marginTop:24, display:"flex", alignItems:"center", gap:12, paddingTop:20, borderTop:"1px solid #e8e4de" }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"#c8960f1f", border:"1.5px solid #c8960f3a", boxShadow:"0 4px 14px #c8960f22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#c8960f" }}><Icon name="croix" size={18} /></div>
                <div>
                  <p style={{ color:"#c8960f", fontWeight:800, fontSize:"0.92rem" }}>Pasteur Peterson Francis</p>
                  <p style={{ color:"#9ca3af", fontSize:"0.78rem" }}>{l==="fr"?"Fondateur, KONEKSYON PAM":l==="ht"?"Fondatè, KONEKSYON PAM":l==="es"?"Fundador, KONEKSYON PAM":"Founder, KONEKSYON PAM"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2 MISSIONS */}
        <div style={{ background:"#ffffff", padding:"clamp(40px,5vw,64px) 20px" }}>
          <div className="max-w-5xl mx-auto" ref={missionCards.ref}>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fffbf0", border:"1px solid #e8c86c", color:"#c8960f", fontSize:10, fontWeight:900, padding:"5px 14px", borderRadius:999, marginBottom:16, letterSpacing:"0.18em" }}>
                <Icon name="etincelles" size={12} /> {l==="fr"?"DEUX GRANDES MISSIONS":l==="ht"?"DE GRAN MISYON":l==="es"?"DOS GRANDES MISIONES":"TWO GREAT MISSIONS"}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24 }}>
              {([
                { icon:"bible" as IconName, title: t.m1_title[l], body: t.m1_body[l], color:"#c8960f", borderColor:"rgba(200,150,15,0.22)", bgColor:"rgba(200,150,15,0.04)", tagColor:"#c8960f", delay:0 },
                { icon:"coeur" as IconName, title: t.m2_title[l], body: t.m2_body[l], color:"#16a34a", borderColor:"rgba(22,163,74,0.22)", bgColor:"rgba(22,163,74,0.04)", tagColor:"#16a34a", delay:0.12 },
              ]).map((card, i) => (
                <div key={i} style={{
                  background:`#ffffff`, border:"1px solid #e8e4de",
                  borderTop:`3px solid ${card.color}`,
                  borderRadius:20, padding:"clamp(22px,4vw,36px)",
                  boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                  animation: missionCards.visible ? `mis-card .7s cubic-bezier(.16,1,.3,1) ${card.delay}s both` : undefined,
                  opacity: missionCards.visible ? undefined : 0,
                }}>
                  <h3 style={{ display:"flex", alignItems:"center", gap:10, fontSize:"1.2rem", fontWeight:900, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:14 }}><Icon name={card.icon} size={24} color={card.color} /> {card.title}</h3>
                  <p style={{ color:"#4a6080", lineHeight:1.75, fontSize:"0.92rem" }}>{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VALEURS */}
        <div style={{ background:"#ffffff", padding:"clamp(48px,6vw,80px) 20px", borderTop:"1px solid #e8e4de", borderBottom:"1px solid #e8e4de" }}>
          <div className="max-w-5xl mx-auto" ref={valuesReveal.ref}>
            <div style={{ textAlign:"center", marginBottom:48 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fffbf0", border:"1px solid #e8c86c", color:"#c8960f", fontSize:10, fontWeight:900, padding:"5px 14px", borderRadius:999, marginBottom:16, letterSpacing:"0.18em" }}>
                <Icon name="etincelles" size={12} /> {l==="fr"?"NOS VALEURS":l==="ht"?"VALÈ NOU":l==="es"?"NUESTROS VALORES":"OUR VALUES"}
              </div>
              <h2 style={{ fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:900, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:10 }}>{t.val_title[l]}</h2>
              <div style={{ width:60, height:3, background:"linear-gradient(90deg,#c8960f,#f0c840)", borderRadius:999, margin:"0 auto" }} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:18 }}>
              {VALUES.map((v, i) => (
                <div key={v.key} className="mis-val-card" style={{
                  background:`#ffffff`, border:"1px solid #e8e4de",
                  borderTop:`3px solid ${v.color}`,
                  borderRadius:16, padding:"24px 22px",
                  boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
                  animation: valuesReveal.visible ? `mis-card .65s cubic-bezier(.16,1,.3,1) ${i*0.07}s both` : undefined,
                  opacity: valuesReveal.visible ? undefined : 0,
                }}>
                  <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:52, height:52, borderRadius:14, marginBottom:12, color:v.color, background:`${v.color}1f`, border:`1.5px solid ${v.color}3a`, boxShadow:`0 4px 14px ${v.color}22` }}><Icon name={v.icon} size={28} /></div>
                  <h4 style={{ fontWeight:800, color:v.color, fontSize:"0.95rem", marginBottom:8 }}>{valKeys[v.key][l]}</h4>
                  <p style={{ color:"#4a6080", fontSize:"0.83rem", lineHeight:1.65 }}>{v.desc[l]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* APPEL */}
        <div style={{ background:"#ffffff", padding:"clamp(48px,6vw,80px) 20px" }}>
          <div className="max-w-3xl mx-auto text-center" ref={callReveal.ref}>
            <div style={{
              animation: callReveal.visible ? "mis-card .8s cubic-bezier(.16,1,.3,1) both" : undefined,
              opacity: callReveal.visible ? undefined : 0,
            }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fffbf0", border:"1px solid #e8c86c", color:"#c8960f", fontSize:10, fontWeight:900, padding:"5px 14px", borderRadius:999, marginBottom:24, letterSpacing:"0.18em" }}>
                <Icon name="etincelles" size={12} /> {l==="fr"?"NOTRE APPEL":l==="ht"?"APÈL NOU":l==="es"?"NUESTRO LLAMADO":"OUR CALL"}
              </div>
              <h2 style={{ fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:900, color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:28 }}>{t.call_title[l]}</h2>
              <blockquote style={{
                background:"#ffffff", border:"1px solid #e8e4de", borderLeft:"4px solid #c8960f", borderTop:"3px solid #c8960f",
                borderRadius:20, padding:"clamp(20px,4vw,36px)", marginBottom:24,
                boxShadow:"0 4px 16px rgba(26,53,104,0.06)",
              }}>
                <p style={{ fontSize:"clamp(1.05rem,2.5vw,1.4rem)", fontWeight:700, color:"#1a3568", fontStyle:"italic", lineHeight:1.5, marginBottom:12 }}>{t.call_verse[l]}</p>
                <cite style={{ color:"#9ca3af", fontSize:"0.85rem", fontStyle:"normal" }}>— {t.call_ref[l]}</cite>
              </blockquote>
              <p style={{ color:"#4a6080", lineHeight:1.75, marginBottom:36, fontSize:"0.97rem" }}>{t.call_body[l]}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:16, justifyContent:"center" }}>
                <Link href="/auth" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:14, fontWeight:900, fontSize:"0.95rem", background:"linear-gradient(135deg,#c8960f,#f0c840)", color:"#1a1208", textDecoration:"none", boxShadow:"0 4px 20px rgba(200,150,15,0.30)", transition:"transform .2s,box-shadow .2s" }}>
                  {t.cta1[l]}
                </Link>
                <Link href="/don" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:14, fontWeight:900, fontSize:"0.95rem", background:"#ffffff", border:"2px solid #e8dcc8", color:"#1a1208", textDecoration:"none", transition:"transform .2s,box-shadow .2s" }}>
                  {t.cta2[l]} <Icon name="coeur" size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
