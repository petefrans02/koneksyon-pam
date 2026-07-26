"use client";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/app/components/Icon";

type Lang = "fr"|"ht"|"en"|"es";
type Cat = "all"|"participation"|"excellence"|"dedication"|"champion";

const TROPHIES = [
  { id:"first-contest",  icon:"cible", href:"/championnats",                   cta:{fr:"Rejoindre un championnat →",ht:"Rantre nan chanpyona →",en:"Join a championship →",es:"Unirse a un campeonato →"},  name:{fr:"Premier Concours",ht:"Premye Konkou",en:"First Contest",es:"Primer Concurso"}, desc:{fr:"Participer à votre premier championnat",ht:"Patisipe nan premye chanpyona ou",en:"Participate in your first championship",es:"Participar en tu primer campeonato"}, category:"participation", color:"#60a5fa", points:10 },
  { id:"first-class",    icon:"priere", href:"/communaute",                  cta:{fr:"Rejoindre la communauté →",ht:"Rantre nan kominote →",en:"Join the community →",es:"Unirse a la comunidad →"},    name:{fr:"Premier Groupe",ht:"Premye Gwoup",en:"First Group",es:"Primer Grupo"}, desc:{fr:"Rejoindre un groupe spirituel pour la première fois",ht:"Rantre nan premye gwoup espirityèl ou",en:"Join a spiritual group for the first time",es:"Unirse a un grupo espiritual por primera vez"}, category:"participation", color:"#60a5fa", points:10 },
  { id:"practice-5",    icon:"bible", href:"/championnats",                    cta:{fr:"Participer à un concours →",ht:"Patisipe nan yon konkou →",en:"Join a contest →",es:"Participar en un concurso →"},            name:{fr:"5 Concours",ht:"5 Konkou",en:"5 Contests",es:"5 Concursos"}, desc:{fr:"Participer à 5 concours bibliques",ht:"Patisipe nan 5 konkou biblik",en:"Participate in 5 biblical contests",es:"Participar en 5 concursos bíblicos"}, category:"participation", color:"#60a5fa", points:25 },
  { id:"multilang",     icon:"monde", href:"/bible",                       cta:{fr:"Explorer la Parole →",ht:"Eksplore Pawòl la →",en:"Explore the Word →",es:"Explorar la Palabra →"}, name:{fr:"Polyglotte",ht:"Poliglòt",en:"Polyglot",es:"Políglota"}, desc:{fr:"Utiliser la plateforme en 2 langues",ht:"Itilize platfòm nan 2 lang",en:"Use the platform in 2 languages",es:"Usar la plataforma en 2 idiomas"}, category:"participation", color:"#60a5fa", points:15 },
  { id:"perfect-score", icon:"succes", href:"/academie",                    cta:{fr:"Pratiquer maintenant →",ht:"Pratike kounye a →",en:"Practice now →",es:"Practicar ahora →"},                  name:{fr:"Score Parfait",ht:"Nòt Pafè",en:"Perfect Score",es:"Puntaje Perfecto"}, desc:{fr:"Obtenir 10/10 en pratique",ht:"Jwenn 10/10 nan pratik",en:"Get 10/10 in practice",es:"Obtener 10/10 en práctica"}, category:"excellence", color:"#d4a017", points:50 },
  { id:"top3",          icon:"trophee", href:"/championnats",                   cta:{fr:"Rejoindre un championnat →",ht:"Rantre nan chanpyona →",en:"Join a championship →",es:"Unirse a un campeonato →"}, name:{fr:"Podium",ht:"Podyòm",en:"Podium",es:"Podio"}, desc:{fr:"Terminer dans le top 3 d'un championnat",ht:"Fini nan top 3 yon chanpyona",en:"Finish top 3 in a championship",es:"Terminar en el top 3 de un campeonato"}, category:"excellence", color:"#d4a017", points:100 },
  { id:"champion",      icon:"couronne", href:"/championnats",                   cta:{fr:"Viser la victoire →",ht:"Vize viktwa →",en:"Aim for victory →",es:"Apuntar a la victoria →"},                name:{fr:"Champion",ht:"Chanpyon",en:"Champion",es:"Campeón"}, desc:{fr:"Remporter un championnat",ht:"Genyen yon chanpyona",en:"Win a championship",es:"Ganar un campeonato"}, category:"excellence", color:"#d4a017", points:200 },
  { id:"all-subjects",  icon:"bible", href:"/championnats",                    cta:{fr:"Explorer les concours →",ht:"Eksplore konkou yo →",en:"Explore contests →",es:"Explorar concursos →"},           name:{fr:"Encyclopédiste Biblique",ht:"Ansiklopedis Biblik",en:"Biblical Encyclopedist",es:"Enciclopedista Bíblico"}, desc:{fr:"Participer à tous les concours bibliques",ht:"Patisipe nan tout konkou biblik yo",en:"Participate in all biblical contests",es:"Participar en todos los concursos bíblicos"}, category:"excellence", color:"#d4a017", points:150 },
  { id:"7-days",        icon:"feu", href:"/aujourd-hui",                  cta:{fr:"Verset du jour →",ht:"Vèsè jou a →",en:"Verse of the day →",es:"Versículo del día →"},                                  name:{fr:"Une Semaine",ht:"Yon Semèn",en:"One Week",es:"Una Semana"}, desc:{fr:"Se connecter 7 jours de suite",ht:"Konekte 7 jou konsekitif",en:"Log in 7 days in a row",es:"Conectarse 7 días seguidos"}, category:"dedication", color:"#a78bfa", points:35 },
  { id:"30-days",       icon:"eclair", href:"/aujourd-hui",                  cta:{fr:"Rester fidèle →",ht:"Rete fidèl →",en:"Stay faithful →",es:"Permanecer fiel →"},                   name:{fr:"Un Mois",ht:"Yon Mwa",en:"One Month",es:"Un Mes"}, desc:{fr:"Se connecter 30 jours de suite",ht:"Konekte 30 jou konsekitif",en:"Log in 30 days in a row",es:"Conectarse 30 días seguidos"}, category:"dedication", color:"#a78bfa", points:120 },
  { id:"teacher",       icon:"temoignages", href:"/communaute",                  cta:{fr:"Rejoindre la communauté →",ht:"Rantre nan kominote →",en:"Join the community →",es:"Unirse a la comunidad →"},                       name:{fr:"Contributeur",ht:"Kontribitè",en:"Contributor",es:"Contribuidor"}, desc:{fr:"Partager votre premier témoignage approuvé",ht:"Pataje premye temwayaj apwouve ou",en:"Share your first approved testimony",es:"Compartir tu primer testimonio aprobado"}, category:"dedication", color:"#a78bfa", points:75 },
  { id:"school-creator",icon:"eglise", href:"/communaute",                      cta:{fr:"Rejoindre une église →",ht:"Rantre nan yon legliz →",en:"Join a church →",es:"Unirse a una iglesia →"},                     name:{fr:"Bâtisseur de Communauté",ht:"Batisman Kominote",en:"Community Builder",es:"Constructor de Comunidad"}, desc:{fr:"Créer ou rejoindre votre première église sur KP",ht:"Kreye oswa rantre nan premye legliz ou sou KP",en:"Create or join your first church on KP",es:"Crear o unirse a tu primera iglesia en KP"}, category:"dedication", color:"#a78bfa", points:50 },
  { id:"national-top",  icon:"monde", href:"/classement",                  cta:{fr:"Voir mon classement →",ht:"Wè klasman mwen →",en:"View my ranking →",es:"Ver mi ranking →"},                  name:{fr:"Top National",ht:"Top Nasyonal",en:"National Top",es:"Top Nacional"}, desc:{fr:"Être dans le top 3 de votre pays",ht:"Nan top 3 peyi ou",en:"Be in your country's top 3",es:"Estar en el top 3 de tu país"}, category:"champion", color:"#f97316", points:300 },
  { id:"world-finalist",icon:"monde", href:"/championnats",                    cta:{fr:"Voir les concours →",ht:"Wè konkou yo →",en:"View contests →",es:"Ver concursos →"},                          name:{fr:"Finaliste Mondial",ht:"Finalis Mondyal",en:"World Finalist",es:"Finalista Mundial"}, desc:{fr:"Se qualifier pour la grande finale biblique mondiale",ht:"Kalifikasyon pou gran final biblik mondyal la",en:"Qualify for the world biblical grand final",es:"Clasificar para la gran final bíblica mundial"}, category:"champion", color:"#f97316", points:500 },
  { id:"world-champion",icon:"medaille", href:"/championnats",                    cta:{fr:"Viser la victoire →",ht:"Vize viktwa →",en:"Aim for victory →",es:"Apuntar a la victoria →"},                                  name:{fr:"Champion du Monde",ht:"Chanpyon Mondyal",en:"World Champion",es:"Campeón Mundial"}, desc:{fr:"Remporter la grande finale biblique mondiale",ht:"Genyen gran final biblik mondyal la",en:"Win the world biblical grand final",es:"Ganar la gran final bíblica mundial"}, category:"champion", color:"#f97316", points:1000 },
  { id:"legend",        icon:"etoile", href:"/trophees",                    cta:{fr:"Voir tous les trophées →",ht:"Wè tout twofè →",en:"View all trophies →",es:"Ver todos los trofeos →"},         name:{fr:"Légende",ht:"Lejann",en:"Legend",es:"Leyenda"}, desc:{fr:"Atteindre 1000 points de trophées",ht:"Rive nan 1000 pwen twofè",en:"Reach 1000 trophy points",es:"Alcanzar 1000 puntos de trofeo"}, category:"champion", color:"#f97316", points:999 },
] as const;

const CAT_COLORS: Record<string,string> = { participation:"#60a5fa", excellence:"#d4a017", dedication:"#a78bfa", champion:"#f97316" };
const CAT_LABELS: Record<string, Record<string,string>> = {
  participation:{fr:"Participation",ht:"Patisipasyon",en:"Participation",es:"Participación"},
  excellence:   {fr:"Excellence",   ht:"Eksèlans",    en:"Excellence",   es:"Excelencia"},
  dedication:   {fr:"Dedication",   ht:"Dedikasyon",  en:"Dedication",   es:"Dedicación"},
  champion:     {fr:"Champion",     ht:"Chanpyon",    en:"Champion",     es:"Campeón"},
};
const LOCKED = ["world-finalist","world-champion","legend"];

export default function TropheesPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [filter, setFilter] = useState<Cat>("all");

  const visible = filter === "all" ? TROPHIES : TROPHIES.filter(t => t.category === filter);

  const tabs: { v: Cat; label: Record<Lang,string>; color?: string }[] = [
    { v:"all",           label:{fr:"Tous",ht:"Tout",en:"All",es:"Todos"} },
    { v:"participation", label:{fr:"Participation",ht:"Patisipasyon",en:"Participation",es:"Participación"}, color:"#60a5fa" },
    { v:"excellence",    label:{fr:"Excellence",ht:"Eksèlans",en:"Excellence",es:"Excelencia"}, color:"#d4a017" },
    { v:"dedication",    label:{fr:"Dedication",ht:"Dedikasyon",en:"Dedication",es:"Dedicación"}, color:"#a78bfa" },
    { v:"champion",      label:{fr:"Champion",ht:"Chanpyon",en:"Champion",es:"Campeón"}, color:"#f97316" },
  ];

  const totalPoints = TROPHIES.reduce((s,t) => s + t.points, 0);

  return (
    <div className="animate-page-awaken min-h-screen" style={{ background:"linear-gradient(180deg,#04080f 0%,#050a12 100%)", color:"#fff" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse 55% 30% at 50% 0%,rgba(212,160,23,0.10) 0%,transparent 65%)" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-12 flex flex-col gap-10">

        {/* Back */}
        <Link href="/" className="text-white/35 text-sm font-medium hover:text-white transition-colors w-fit">
          ← {l==="fr"?"Accueil":l==="ht"?"Lakay":l==="es"?"Inicio":"Home"}
        </Link>

        {/* Hero */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 w-fit text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ background:"rgba(212,160,23,0.12)", border:"1px solid rgba(212,160,23,0.25)", color:"#d4a017" }}>
            <Icon name="trophee" size={13} /> {l==="fr"?"Salle des Trophées":l==="ht"?"Sal Twofè yo":l==="es"?"Sala de Trofeos":"Trophy Room"}
          </div>
          <h1 className="font-black text-white" style={{ fontSize:"clamp(1.8rem,4vw,2.8rem)" }}>
            {l==="fr"?"Vos Trophées & Achievements":l==="ht"?"Twofè & Achiyvman ou yo":l==="es"?"Sus Trofeos & Logros":"Your Trophies & Achievements"}
          </h1>
          <p className="text-white/40 text-sm max-w-xl leading-relaxed">
            {l==="fr"?"Chaque accomplissement compte. Déverrouillez des trophées en participant, en progressant et en remportant des championnats."
            :l==="ht"?"Chak achiyvman enpòtan. Debloke twofè nan patisipasyon, pwogresyon ak viktwa chanpyona."
            :l==="es"?"Cada logro cuenta. Desbloquea trofeos participando, progresando y ganando campeonatos."
            :"Every achievement counts. Unlock trophies by participating, progressing and winning championships."}
          </p>
          <div className="flex items-center gap-2 text-xs text-white/30 font-medium">
            <Icon name="etoile" size={14} />
            <span>{l==="fr"?`1 trophée = 1 point de prestige — Total possible : ${totalPoints} pts`
              :l==="ht"?`1 twofè = 1 pwen prestij — Total posib : ${totalPoints} pwen`
              :l==="es"?`1 trofeo = 1 punto de prestigio — Total posible: ${totalPoints} pts`
              :`1 trophy = 1 prestige point — Total possible: ${totalPoints} pts`}</span>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { label:l==="fr"?"Trophées":l==="ht"?"Twofè":l==="es"?"Trofeos":"Trophies", value:"16", color:"#d4a017" },
            { label:"Participation", value:"4", color:"#60a5fa" },
            { label:"Excellence",   value:"4", color:"#d4a017" },
            { label:"Dedication",   value:"4", color:"#a78bfa" },
            { label:"Champion",     value:"4", color:"#f97316" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
              style={{ background:`${s.color}12`, border:`1px solid ${s.color}30`, color:s.color }}>
              <span className="text-white/70">{s.label}</span>
              <span>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const active = filter === tab.v;
            const col = tab.color ?? "#fff";
            return (
              <button key={tab.v} onClick={() => setFilter(tab.v)}
                className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all"
                style={{
                  background: active ? (tab.color ? `${tab.color}22` : "rgba(255,255,255,0.10)") : "rgba(255,255,255,0.05)",
                  border: active ? `1px solid ${col}50` : "1px solid rgba(255,255,255,0.08)",
                  color: active ? (tab.color ?? "#fff") : "rgba(255,255,255,0.40)",
                }}>
                {tab.label[l]}
              </button>
            );
          })}
        </div>

        {/* Trophy grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {visible.map(t => {
            const locked = LOCKED.includes(t.id);
            const catColor = CAT_COLORS[t.category] ?? "#fff";

            const cardInner = (
              <div className="relative flex flex-col gap-3 p-5 rounded-2xl h-full transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${catColor}${locked ? "18" : "28"}`,
                }}>
                <Icon name={t.icon} size={40} color={catColor} />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                    style={{ background:`${catColor}18`, color:catColor }}>
                    {CAT_LABELS[t.category]?.[l] ?? t.category}
                  </span>
                </div>
                <p className="text-white font-black text-sm leading-tight">{t.name[l]}</p>
                <p className="text-white/40 text-xs leading-relaxed flex-1">{t.desc[l]}</p>
                <div className="flex items-center gap-1 text-xs font-bold" style={{ color:"#d4a017" }}>
                  <Icon name="etoile" size={14} /> {t.points} pts
                </div>

                {/* CTA */}
                {!locked && (
                  <div className="mt-1 pt-3 flex items-center gap-1.5 text-[11px] font-black"
                    style={{ color: catColor, borderTop: `1px solid ${catColor}20` }}>
                    <span>{t.cta[l]}</span>
                  </div>
                )}

                {locked && (
                  <div style={{ position:"absolute", inset:0, borderRadius:16, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(2px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                    <Icon name="cadenas" size={24} color="rgba(255,255,255,0.5)" />
                    <span style={{ color:"rgba(255,255,255,0.5)", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                      {l==="fr"?"Saison 2027":l==="ht"?"Sezon 2027":l==="es"?"Temporada 2027":"Season 2027"}
                    </span>
                  </div>
                )}
              </div>
            );

            return locked ? (
              <div key={t.id}>{cardInner}</div>
            ) : (
              <Link key={t.id} href={t.href}
                className="block hover:-translate-y-1 transition-transform duration-200"
                style={{ textDecoration:"none" }}>
                {cardInner}
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl p-8 flex flex-col items-center gap-5 text-center"
          style={{ background:"rgba(212,160,23,0.06)", border:"1px solid rgba(212,160,23,0.15)" }}>
          <p className="text-white font-black text-xl">
            {l==="fr"?"Commencez à gagner des trophées !":l==="ht"?"Kòmanse genyen twofè !":l==="es"?"¡Empieza a ganar trofeos!":"Start earning trophies!"}
          </p>
          <p className="text-white/40 text-sm">
            {l==="fr"?"Chaque action sur la plateforme vous rapproche du prochain trophée."
            :l==="ht"?"Chak aksyon sou platfòm nan pote ou pi pre pwochen twofè a."
            :l==="es"?"Cada acción en la plataforma te acerca al próximo trofeo."
            :"Every action on the platform brings you closer to the next trophy."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/championnats"
              className="px-6 py-3 rounded-full font-black text-sm transition-all hover:-translate-y-0.5"
              style={{ background:"linear-gradient(135deg,#d4a017 0%,#f0c840 100%)", color:"#04040d", boxShadow:"0 4px 20px rgba(212,160,23,0.25)" }}>
              {l==="fr"?"Concours →":l==="ht"?"Konkou →":l==="es"?"Concursos →":"Contests →"}
            </Link>
            <Link href="/championnats"
              className="px-6 py-3 rounded-full font-black text-sm transition-all hover:-translate-y-0.5"
              style={{ background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.25)", color:"#60a5fa" }}>
              {l==="fr"?"Rejoindre un championnat":l==="ht"?"Rantre nan yon chanpyona":l==="es"?"Unirse a un campeonato":"Join a championship"}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
