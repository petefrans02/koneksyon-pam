"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import NextStep from "@/app/components/NextStep";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

const SECTIONS: { href: string; icon: IconName; color: string; fr: string; ht: string; en: string; es: string }[] = [
  { href: "/prieres",      icon: "priere",   color: "#7c3aed", fr: "Prière",       ht: "Lapriyè",  en: "Prayer",   es: "Oración"    },
  { href: "/etude",        icon: "bible",    color: "#1d4ed8", fr: "Étude",        ht: "Etid",     en: "Study",    es: "Estudio"    },
  { href: "/etude?parcours=enseignements", icon: "academie", color: "#0891b2", fr: "Enseignement", ht: "Ansèyman", en: "Teaching", es: "Enseñanza"  },
  { href: "/quiz",          icon: "batiment", color: "#ea580c", fr: "Jeux",         ht: "Jwèt",     en: "Games",    es: "Juegos"     },
  { href: "/championnats",     icon: "trophee", color: "#b45309", fr: "Championnats", ht: "Chanpyona", en: "Championships", es: "Campeonatos" },
  { href: "/communaute",       icon: "eglise",   color: "#16a34a", fr: "Groupes",      ht: "Gwoup",    en: "Groups",   es: "Grupos"     },
];

const DAILY_INSPIRATION: { icon: IconName; fr: string; ht: string; en: string; es: string }[] = [
  { icon: "soleil", fr: "Commencez chaque journée avec la Parole.", ht: "Kòmanse chak jou ak Pawòl la.", en: "Start every day with the Word.", es: "Comienza cada día con la Palabra." },
  { icon: "priere", fr: "Un instant de prière peut changer une vie.", ht: "Yon moman lapriyè ka chanje yon lavi.", en: "A moment of prayer can change a life.", es: "Un momento de oración puede cambiar una vida." },
  { icon: "bible", fr: "La Bible est la lettre d'amour de Dieu pour vous.", ht: "Labib se lèt renmen Bondye a pou ou.", en: "The Bible is God's love letter to you.", es: "La Biblia es la carta de amor de Dios para ti." },
  { icon: "croix", fr: "Chaque concours vous rapproche un peu plus de la Parole.", ht: "Chak konkou rapwoche ou plis nan Pawòl la.", en: "Every contest brings you a little closer to the Word.", es: "Cada concurso te acerca un poco más a la Palabra." },
  { icon: "monde", fr: "Vous faites partie d'une communauté mondiale de foi.", ht: "Ou fè pati yon kominote mondyal lafwa.", en: "You are part of a global community of faith.", es: "Eres parte de una comunidad mundial de fe." },
];

export default function DecouvrirPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [tab, setTab] = useState<"aujourd" | "tendances" | "nouveautes" | "communaute">("aujourd");
  const [contests, setContests] = useState<{ id: string; title: string; status: string; description: string; contest_participants: { count: number }[] }[]>([]);
  // Vrai nombre de membres (comptes réels) via l'API existante ; fallback aligné sur l'accueil.
  const [members, setMembers] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/contests").then(r => r.json()).then(d => setContests(d.contests || []));
  }, []);

  useEffect(() => {
    fetch("/api/platform-stats")
      .then(r => r.json())
      .then(d => { if (typeof d?.members === "number" && d.members > 0) setMembers(d.members); })
      .catch(() => {});
  }, []);

  // Même valeur de repli que l'accueil (page.tsx) pour éviter toute contradiction.
  const FALLBACK_MEMBERS = 500;
  const formatMembers = (n: number) =>
    (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`) + "+";

  const liveContests = contests.filter(c => c.status === "active" || c.status === "voting");
  const upcomingContests = contests.filter(c => c.status === "upcoming");
  const completedContests = contests.filter(c => c.status === "completed");

  const inspiration = DAILY_INSPIRATION[Math.floor(Date.now() / 86400000) % DAILY_INSPIRATION.length];

  const tabs: { key: typeof tab; fr: string; ht: string; en: string; es: string; icon: IconName }[] = [
    { key: "aujourd",    fr: "Aujourd'hui",  ht: "Jodi a",    en: "Today",      es: "Hoy",       icon: "etincelles" },
    { key: "tendances",  fr: "Tendances",    ht: "Tandans",   en: "Trending",   es: "Tendencias",icon: "feu" },
    { key: "nouveautes", fr: "Nouveautés",   ht: "Nouvote",   en: "New",        es: "Nuevo",     icon: "ajouter" },
    { key: "communaute", fr: "Communauté",   ht: "Kominote",  en: "Community",  es: "Comunidad", icon: "utilisateurs" },
  ];

  const txt = {
    header:           { fr: "Découvrir",                                              ht: "Dekouvri",                                              en: "Discover",                                    es: "Descubrir"                                             },
    todayTitle:       { fr: "Aujourd'hui",                                            ht: "Jodi a",                                                en: "Today",                                       es: "Hoy"                                                   },
    todayDesc:        { fr: "Verset, défi et concours du jour",                       ht: "Vèsè, defi ak konkou jou a",                            en: "Verse, challenge and contest of the day",     es: "Versículo, desafío y concurso del día"                  },
    todayBtn:         { fr: "Voir →",                                                 ht: "Wè →",                                                  en: "See →",                                       es: "Ver →"                                                 },
    prayTitle:        { fr: "Prier maintenant",                                       ht: "Priye kounye a",                                        en: "Pray now",                                    es: "Orar ahora"                                            },
    prayDesc:         { fr: "Rejoignez le mur de prière mondial",                     ht: "Rantre nan mi lapriyè mondyal la",                      en: "Join the global prayer wall",                 es: "Únete al muro de oración mundial"                      },
    prayBtn:          { fr: "Prier →",                                                ht: "Priye →",                                               en: "Pray →",                                      es: "Orar →"                                                },
    gameTitle:        { fr: "Défi rapide",                                            ht: "Defi rapid",                                            en: "Quick challenge",                             es: "Desafío rápido"                                        },
    gameDesc:         { fr: "Testez vos connaissances bibliques",                     ht: "Teste konesans biblik ou",                              en: "Test your Bible knowledge",                   es: "Pon a prueba tu conocimiento bíblico"                   },
    gameBtn:          { fr: "Jouer →",                                                ht: "Jwe →",                                                 en: "Play →",                                      es: "Jugar →"                                               },
    liveNow:          { fr: "En direct maintenant",                                   ht: "An dirèk kounye a",                                     en: "Live now",                                    es: "En vivo ahora"                                         },
    participants:     { fr: "participants",                                            ht: "patisipan",                                             en: "participants",                                es: "participantes"                                         },
    joinBtn:          { fr: "Rejoindre →",                                            ht: "Antre →",                                               en: "Join →",                                      es: "Unirse →"                                              },
    allSections:      { fr: "Toutes les sections",                                    ht: "Tout seksyon yo",                                       en: "All sections",                                es: "Todas las secciones"                                   },
    mostActive:       { fr: "Concours les plus actifs",                               ht: "Konkou ki pi aktif yo",                                 en: "Most active contests",                        es: "Concursos más activos"                                 },
    loading:          { fr: "Chargement...",                                          ht: "Ap chaje...",                                           en: "Loading...",                                  es: "Cargando..."                                           },
    live:             { fr: "En direct",                                              ht: "An dirèk",                                              en: "Live",                                        es: "En vivo"                                               },
    upcoming:         { fr: "À venir",                                                ht: "Ap vini",                                               en: "Upcoming",                                    es: "Próximo"                                               },
    voting:           { fr: "Vote ouvert",                                            ht: "Ap vote",                                               en: "Voting",                                      es: "Votación"                                              },
    ended:            { fr: "Terminé",                                                ht: "Fini",                                                  en: "Ended",                                       es: "Terminado"                                             },
    viewAll:          { fr: "Voir tous les concours →",                               ht: "Wè tout konkou yo →",                                   en: "View all contests →",                         es: "Ver todos los concursos →"                             },
    hofTitle:         { fr: "Hall of Fame",                                           ht: "Hall of Fame",                                          en: "Hall of Fame",                                es: "Hall of Fame"                                          },
    hofDesc:          { fr: "Les champions bibliques de KONEKSYON PAM",               ht: "Chanpyon biblik KONEKSYON PAM yo",                      en: "KONEKSYON PAM biblical champions",            es: "Campeones bíblicos de KONEKSYON PAM"                   },
    prayWall:         { fr: "Mur de prière",                                          ht: "Mi lapriyè",                                            en: "Prayer wall",                                 es: "Muro de oración"                                       },
    prayWallDesc:     { fr: "Des milliers de requêtes du monde entier",               ht: "Dè milye demann nan mond antye",                        en: "Thousands of requests from around the world", es: "Miles de peticiones de todo el mundo"                   },
    quickGames:       { fr: "Jeux rapides",                                           ht: "Jwèt rapid",                                            en: "Quick games",                                 es: "Juegos rápidos"                                        },
    quickGamesDesc:   { fr: "Testez vos connaissances en 2 minutes",                  ht: "Teste konesans ou an 2 minit",                          en: "Test your knowledge in 2 minutes",            es: "Pon a prueba tu conocimiento en 2 minutos"             },
    teachings:        { fr: "Enseignements",                                          ht: "Ansèyman",                                              en: "Teachings",                                   es: "Enseñanzas"                                            },
    teachingsDesc:    { fr: "Messages de pasteurs et leaders",                        ht: "Mesaj pastè ak lidè",                                   en: "Messages from pastors and leaders",           es: "Mensajes de pastores y líderes"                        },
    newContests:      { fr: "Nouveaux concours",                                      ht: "Nouvo konkou",                                          en: "New contests",                                es: "Nuevos concursos"                                      },
    registerBtn:      { fr: "S'inscrire →",                                           ht: "Enskri →",                                              en: "Register →",                                  es: "Registrarse →"                                         },
    newStudies:       { fr: "Nouvelles études",                                       ht: "Nouvo etid",                                            en: "New studies",                                 es: "Nuevos estudios"                                       },
    newStudiesDesc:   { fr: "Plans de lecture et ressources théologiques",            ht: "Plan lekti ak resous teyolojik",                        en: "Reading plans and theological resources",     es: "Planes de lectura y recursos teológicos"               },
    newTeachings:     { fr: "Nouveaux enseignements",                                 ht: "Nouvo ansèyman",                                        en: "New teachings",                               es: "Nuevas enseñanzas"                                     },
    newTeachingsDesc: { fr: "Séries et messages de pasteurs",                         ht: "Seri ak mesaj pastè",                                   en: "Series and pastor messages",                  es: "Series y mensajes de pastores"                         },
    newGroups:        { fr: "Nouveaux groupes",                                       ht: "Nouvo gwoup",                                           en: "New groups",                                  es: "Nuevos grupos"                                         },
    newGroupsDesc:    { fr: "Communautés d'église actives",                           ht: "Kominote legliz aktif",                                 en: "Active church communities",                   es: "Comunidades de iglesia activas"                        },
    newPrayers:       { fr: "Nouvelles prières",                                      ht: "Nouvo lapriyè",                                         en: "New prayers",                                 es: "Nuevas oraciones"                                      },
    newPrayersDesc:   { fr: "Demandes récentes à couvrir",                            ht: "Demann resan pou kouvri",                               en: "Recent prayer requests to cover",             es: "Peticiones de oración recientes para cubrir"           },
    globalCommunity:  { fr: "Notre communauté mondiale",                              ht: "Kominote mondyal nou an",                               en: "Our global community",                        es: "Nuestra comunidad mundial"                             },
    countries:        { fr: "Pays",                                                   ht: "Peyi",                                                  en: "Countries",                                   es: "Países"                                                },
    members:          { fr: "Membres",                                                ht: "Manm",                                                  en: "Members",                                     es: "Miembros"                                              },
    languages:        { fr: "Langues",                                                ht: "Lang",                                                  en: "Languages",                                   es: "Idiomas"                                               },
    inviteTitle:      { fr: "Inviter ma communauté",                                  ht: "Envite kominote mwen",                                  en: "Invite my community",                         es: "Invitar a mi comunidad"                                },
    inviteHeadline:   { fr: "Partagez KONEKSYON PAM avec votre église",               ht: "Pataje KONEKSYON PAM ak legliz ou",                     en: "Share KONEKSYON PAM with your church",        es: "Comparte KONEKSYON PAM con tu iglesia"                 },
    inviteDesc:       { fr: "Un ami qui découvre la Parole de Dieu grâce à vous — c'est un acte missionnaire.", ht: "Yon zanmi ki dekouvri Pawòl Bondye a gras a ou — se yon zak misyonè.", en: "A friend who discovers God's Word because of you — that's a missionary act.", es: "Un amigo que descubre la Palabra de Dios gracias a ti — eso es un acto misionero." },
    whatsappMsg:      { fr: "✝️ Découvrez KONEKSYON PAM — la communauté chrétienne mondiale !\nhttps://koneksyonpam.com", ht: "✝️ Dekouvri KONEKSYON PAM — kominote kretyen mondyal la !\nhttps://koneksyonpam.com", en: "✝️ Discover KONEKSYON PAM — the global Christian community!\nhttps://koneksyonpam.com", es: "✝️ ¡Descubre KONEKSYON PAM — la comunidad cristiana mundial!\nhttps://koneksyonpam.com" },
    myChurch:         { fr: "Mon groupe d'église",                                    ht: "Gwoup legliz mwen",                                     en: "My church group",                             es: "Mi grupo de iglesia"                                   },
    recentWinners:    { fr: "Derniers vainqueurs",                                    ht: "Dènye venkè yo",                                        en: "Recent winners",                              es: "Ganadores recientes"                                   },
  };
  const t = (k: keyof typeof txt) => txt[k][l];

  function contestStatus(status: string) {
    if (status === "active")   return t("live");
    if (status === "upcoming") return t("upcoming");
    if (status === "voting")   return t("voting");
    return t("ended");
  }

  return (
    <div className="animate-page-awaken" style={{ minHeight: "100vh", background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)", color: "#fff" }}>

      {/* Header */}
      <div style={{ background: "#04080f", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 pb-0">
          <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-[0.3em] mb-2">KONEKSYON PAM</p>
          <h1 className="text-white font-black mb-6" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            {t("header")}
          </h1>

          {/* Tabs */}
          <div className="flex gap-0.5 overflow-x-auto pb-0 -mb-px">
            {tabs.map(tb => (
              <button key={tb.key} onClick={() => setTab(tb.key)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  tab === tb.key
                    ? "border-[#c5a84f] text-[#c5a84f]"
                    : "border-transparent text-white/30 hover:text-white/60"
                }`}>
                <Icon name={tb.icon} size={15} /> {tb[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">

        {/* ── AUJOURD'HUI ── */}
        {tab === "aujourd" && (
          <div className="space-y-5">
            {/* Inspiration quote */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2044] to-[#1a3a70] p-8">
              <div className="absolute right-6 top-6 opacity-5 leading-none select-none"><Icon name="croix" size={100} /></div>
              <span className="block mb-4 text-white"><Icon name={inspiration.icon} size={38} /></span>
              <p className="text-white font-bold text-xl leading-relaxed italic max-w-xl">&ldquo;{inspiration[l]}&rdquo;</p>
            </div>

            {/* 3 daily actions */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Link href="/aujourd-hui"
                className="group flex flex-col gap-3 p-6 rounded-2xl hover:border-[#c5a84f]/50 hover:shadow-md transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(197,168,79,0.15)" }}>
                <span className="text-[#c5a84f]"><Icon name="etincelles" size={26} /></span>
                <p className="font-black text-[#0f2044]">{t("todayTitle")}</p>
                <p className="text-stone-400 text-xs">{t("todayDesc")}</p>
                <span className="text-[#c5a84f] text-xs font-bold mt-auto">{t("todayBtn")}</span>
              </Link>
              <Link href="/prieres"
                className="group flex flex-col gap-3 p-6 rounded-2xl hover:border-[#7c3aed]/50 hover:shadow-md transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(124,58,237,0.15)" }}>
                <span className="text-[#7c3aed]"><Icon name="priere" size={26} /></span>
                <p className="font-black text-[#7c3aed]">{t("prayTitle")}</p>
                <p className="text-stone-400 text-xs">{t("prayDesc")}</p>
                <span className="text-[#7c3aed] text-xs font-bold mt-auto">{t("prayBtn")}</span>
              </Link>
              <Link href="/quiz"
                className="group flex flex-col gap-3 p-6 rounded-2xl hover:border-[#ea580c]/50 hover:shadow-md transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(234,88,12,0.15)" }}>
                <span className="text-[#ea580c]"><Icon name="batiment" size={26} /></span>
                <p className="font-black text-[#ea580c]">{t("gameTitle")}</p>
                <p className="text-stone-400 text-xs">{t("gameDesc")}</p>
                <span className="text-[#ea580c] text-xs font-bold mt-auto">{t("gameBtn")}</span>
              </Link>
            </div>

            {/* Live contests */}
            {liveContests.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3"><Icon name="trophee" size={13} /> {t("liveNow")}</p>
                {liveContests.map(c => (
                  <Link key={c.id} href={`/championnats/${c.id}`}
                    className="flex items-center gap-4 rounded-2xl p-5 hover:shadow-sm transition-all group mb-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate group-hover:text-[#60a5fa] transition-colors">{c.title}</p>
                      <p className="text-stone-400 text-xs">{c.contest_participants?.[0]?.count ?? 0} {t("participants")}</p>
                    </div>
                    <span className="text-[#1d4ed8] text-xs font-black shrink-0">{t("joinBtn")}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* All sections */}
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3"><Icon name="monde" size={13} /> {t("allSections")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SECTIONS.map(s => (
                  <Link key={s.href} href={s.href}
                    className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm"
                    style={{ borderColor: `${s.color}20`, color: s.color, backgroundColor: `${s.color}06` }}>
                    <Icon name={s.icon} size={18} />
                    <span>{s[l]}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TENDANCES ── */}
        {tab === "tendances" && (
          <div className="space-y-5">
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#d4a017] mb-4"><Icon name="feu" size={13} /> {t("mostActive")}</p>
              {contests.length === 0 ? (
                <p className="text-white/30 text-sm">{t("loading")}</p>
              ) : (
                <div className="space-y-3">
                  {[...contests].slice(0, 5).map((c, i) => (
                    <Link key={c.id} href={`/championnats/${c.id}`}
                      className="flex items-center gap-4 group">
                      <span className="text-stone-200 font-black text-sm w-6 shrink-0">#{i+1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate group-hover:text-[#60a5fa] transition-colors">{c.title}</p>
                        <p className="text-stone-400 text-xs">{c.contest_participants?.[0]?.count ?? 0} participants · {contestStatus(c.status)}</p>
                      </div>
                      {c.status === "active" && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />}
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/championnats" className="inline-flex items-center gap-1 text-xs text-[#b45309] font-bold mt-4 hover:underline">
                {t("viewAll")}
              </Link>
            </div>

            {/* Popular sections */}
            <div className="grid sm:grid-cols-2 gap-3">
              {([
                { href: "/championnats/hall-of-fame", icon: "trophee", title: t("hofTitle"),    desc: t("hofDesc"),        color: "#b45309" },
                { href: "/prieres",               icon: "priere", title: t("prayWall"),    desc: t("prayWallDesc"),   color: "#7c3aed" },
                { href: "/quiz",                   icon: "batiment", title: t("quickGames"), desc: t("quickGamesDesc"), color: "#ea580c" },
                { href: "/etude?parcours=enseignements",           icon: "academie", title: t("teachings"),  desc: t("teachingsDesc"),  color: "#0891b2" },
              ] as { href: string; icon: IconName; title: string; desc: string; color: string }[]).map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-start gap-4 p-5 rounded-2xl hover:shadow-sm transition-all group" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="shrink-0 group-hover:scale-110 transition-transform" style={{ color: item.color }}><Icon name={item.icon} size={26} /></span>
                  <div>
                    <p className="font-black text-sm mb-0.5" style={{ color: item.color }}>{item.title}</p>
                    <p className="text-stone-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── NOUVEAUTÉS ── */}
        {tab === "nouveautes" && (
          <div className="space-y-5">
            {upcomingContests.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] mb-4"><Icon name="ajouter" size={13} /> {t("newContests")}</p>
                <div className="space-y-3">
                  {upcomingContests.map(c => (
                    <Link key={c.id} href={`/championnats/${c.id}`}
                      className="flex items-center gap-4 group">
                      <span className="w-2 h-2 bg-[#1d4ed8] rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate group-hover:text-[#60a5fa] transition-colors">{c.title}</p>
                        {c.description && <p className="text-stone-400 text-xs truncate">{c.description}</p>}
                      </div>
                      <span className="text-[#1d4ed8] text-[10px] font-black shrink-0">{t("registerBtn")}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* What's new on the platform */}
            <div className="grid sm:grid-cols-2 gap-3">
              {([
                { icon: "bible", title: t("newStudies"),   href: "/etude",        color: "#1d4ed8", desc: t("newStudiesDesc")   },
                { icon: "academie", title: t("newTeachings"), href: "/etude?parcours=enseignements", color: "#0891b2", desc: t("newTeachingsDesc") },
                { icon: "eglise", title: t("newGroups"),    href: "/communaute",       color: "#16a34a", desc: t("newGroupsDesc")    },
                { icon: "priere", title: t("newPrayers"),   href: "/prieres",      color: "#7c3aed", desc: t("newPrayersDesc")   },
              ] as { icon: IconName; title: string; href: string; color: string; desc: string }[]).map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-stone-100 hover:shadow-sm transition-all group">
                  <span className="shrink-0 group-hover:scale-110 transition-transform" style={{ color: item.color }}><Icon name={item.icon} size={26} /></span>
                  <div>
                    <p className="font-black text-sm mb-0.5" style={{ color: item.color }}>{item.title}</p>
                    <p className="text-stone-400 text-xs">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── COMMUNAUTÉ ── */}
        {tab === "communaute" && (
          <div className="space-y-5">

            {/* Stats */}
            <div className="bg-gradient-to-br from-[#0f2044] to-[#1e3a6e] rounded-2xl p-6">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/30 mb-5"><Icon name="utilisateurs" size={13} /> {t("globalCommunity")}</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: "12+", label: t("countries") },
                  { value: formatMembers(members ?? FALLBACK_MEMBERS), label: t("members")  },
                  { value: "4",   label: t("languages") },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-white font-black text-2xl">{s.value}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite CTA */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3"><Icon name="email" size={13} /> {t("inviteTitle")}</p>
              <p className="text-white font-bold text-base mb-2">{t("inviteHeadline")}</p>
              <p className="text-white/40 text-sm mb-5">{t("inviteDesc")}</p>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(t("whatsappMsg"))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-xs font-black">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <Link href="/communaute" className="inline-flex items-center gap-2 border border-[#16a34a]/20 text-[#16a34a] bg-[#16a34a]/5 px-5 py-2.5 rounded-full text-xs font-black hover:bg-[#16a34a]/10 transition-colors">
                  <Icon name="eglise" size={15} /> {t("myChurch")}
                </Link>
              </div>
            </div>

            {/* Past champions */}
            {completedContests.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#b45309] mb-4"><Icon name="trophee" size={13} /> {t("recentWinners")}</p>
                <div className="space-y-3">
                  {completedContests.slice(0,3).map(c => (
                    <Link key={c.id} href={`/championnats/${c.id}`} className="flex items-center gap-3 group">
                      <span className="text-[#d4a017]"><Icon name="medaille" size={20} /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-[#60a5fa] transition-colors">{c.title}</p>
                        <p className="text-xs text-stone-400">{t("ended")}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/championnats/hall-of-fame" className="inline-flex items-center gap-1 text-xs text-[#b45309] font-bold mt-4 hover:underline">
                  Hall of Fame →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <NextStep context="default" />
    </div>
  );
}
