"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import NextStep from "@/app/components/NextStep";

type Lang = "fr" | "ht" | "en";

const SECTIONS = [
  { href: "/prieres",      icon: "🙏", color: "#7c3aed", fr: "Prière",       ht: "Lapriyè",  en: "Prayer"   },
  { href: "/etude",        icon: "📖", color: "#1d4ed8", fr: "Étude",        ht: "Etid",     en: "Study"    },
  { href: "/enseignement", icon: "🎓", color: "#0891b2", fr: "Enseignement", ht: "Ansèyman", en: "Teaching" },
  { href: "/jeu",          icon: "🏛️", color: "#ea580c", fr: "Jeux",         ht: "Jwèt",     en: "Games"    },
  { href: "/concours",     icon: "🏆", color: "#b45309", fr: "Concours",     ht: "Konkou",   en: "Contests" },
  { href: "/eglise",       icon: "⛪", color: "#16a34a", fr: "Groupes",      ht: "Gwoup",    en: "Groups"   },
];

const DAILY_INSPIRATION = [
  { icon: "🌅", fr: "Commencez chaque journée avec la Parole.", ht: "Kòmanse chak jou ak Pawòl la.", en: "Start every day with the Word." },
  { icon: "🙏", fr: "Un instant de prière peut changer une vie.", ht: "Yon moman lapriyè ka chanje yon lavi.", en: "A moment of prayer can change a life." },
  { icon: "📖", fr: "La Bible est la lettre d'amour de Dieu pour vous.", ht: "Labib se lèt renmen Bondye a pou ou.", en: "The Bible is God's love letter to you." },
  { icon: "✝️", fr: "Chaque concours vous rapproche un peu plus de la Parole.", ht: "Chak konkou rapwoche ou plis nan Pawòl la.", en: "Every contest brings you a little closer to the Word." },
  { icon: "🌍", fr: "Vous faites partie d'une communauté mondiale de foi.", ht: "Ou fè pati yon kominote mondyal lafwa.", en: "You are part of a global community of faith." },
];

export default function DecouvrirPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;
  const [tab, setTab] = useState<"aujourd" | "tendances" | "nouveautes" | "communaute">("aujourd");
  const [contests, setContests] = useState<{ id: string; title: string; status: string; description: string; contest_participants: { count: number }[] }[]>([]);

  useEffect(() => {
    fetch("/api/contests").then(r => r.json()).then(d => setContests(d.contests || []));
  }, []);

  const liveContests = contests.filter(c => c.status === "active" || c.status === "voting");
  const upcomingContests = contests.filter(c => c.status === "upcoming");
  const completedContests = contests.filter(c => c.status === "completed");

  const inspiration = DAILY_INSPIRATION[Math.floor(Date.now() / 86400000) % DAILY_INSPIRATION.length];

  const tabs: { key: typeof tab; fr: string; ht: string; en: string; icon: string }[] = [
    { key: "aujourd",    fr: "Aujourd'hui",  ht: "Jodi a",    en: "Today",      icon: "✨" },
    { key: "tendances",  fr: "Tendances",    ht: "Tandans",   en: "Trending",   icon: "🔥" },
    { key: "nouveautes", fr: "Nouveautés",   ht: "Nouvote",   en: "New",        icon: "🆕" },
    { key: "communaute", fr: "Communauté",   ht: "Kominote",  en: "Community",  icon: "👥" },
  ];

  const txt = {
    header:           { fr: "Découvrir",                                              ht: "Dekouvri",                                              en: "Discover"                                              },
    todayTitle:       { fr: "Aujourd'hui",                                            ht: "Jodi a",                                                en: "Today"                                                 },
    todayDesc:        { fr: "Verset, défi et concours du jour",                       ht: "Vèsè, defi ak konkou jou a",                            en: "Verse, challenge and contest of the day"               },
    todayBtn:         { fr: "Voir →",                                                 ht: "Wè →",                                                  en: "See →"                                                 },
    prayTitle:        { fr: "Prier maintenant",                                       ht: "Priye kounye a",                                        en: "Pray now"                                              },
    prayDesc:         { fr: "Rejoignez le mur de prière mondial",                     ht: "Rantre nan mi lapriyè mondyal la",                      en: "Join the global prayer wall"                           },
    prayBtn:          { fr: "Prier →",                                                ht: "Priye →",                                               en: "Pray →"                                                },
    gameTitle:        { fr: "Défi rapide",                                            ht: "Defi rapid",                                            en: "Quick challenge"                                       },
    gameDesc:         { fr: "Testez vos connaissances bibliques",                     ht: "Teste konesans biblik ou",                              en: "Test your Bible knowledge"                             },
    gameBtn:          { fr: "Jouer →",                                                ht: "Jwe →",                                                 en: "Play →"                                                },
    liveNow:          { fr: "En direct maintenant",                                   ht: "An dirèk kounye a",                                     en: "Live now"                                              },
    participants:     { fr: "participants",                                            ht: "patisipan",                                             en: "participants"                                          },
    joinBtn:          { fr: "Rejoindre →",                                            ht: "Antre →",                                               en: "Join →"                                                },
    allSections:      { fr: "Toutes les sections",                                    ht: "Tout seksyon yo",                                       en: "All sections"                                          },
    mostActive:       { fr: "Concours les plus actifs",                               ht: "Konkou ki pi aktif yo",                                 en: "Most active contests"                                  },
    loading:          { fr: "Chargement...",                                          ht: "Ap chaje...",                                           en: "Loading..."                                            },
    live:             { fr: "En direct",                                              ht: "An dirèk",                                              en: "Live"                                                  },
    upcoming:         { fr: "À venir",                                                ht: "Ap vini",                                               en: "Upcoming"                                              },
    voting:           { fr: "Vote ouvert",                                            ht: "Ap vote",                                               en: "Voting"                                                },
    ended:            { fr: "Terminé",                                                ht: "Fini",                                                  en: "Ended"                                                 },
    viewAll:          { fr: "Voir tous les concours →",                               ht: "Wè tout konkou yo →",                                   en: "View all contests →"                                   },
    hofTitle:         { fr: "Hall of Fame",                                           ht: "Hall of Fame",                                          en: "Hall of Fame"                                          },
    hofDesc:          { fr: "Les champions bibliques de KONEKSYON PAM",               ht: "Chanpyon biblik KONEKSYON PAM yo",                      en: "KONEKSYON PAM biblical champions"                      },
    prayWall:         { fr: "Mur de prière",                                          ht: "Mi lapriyè",                                            en: "Prayer wall"                                           },
    prayWallDesc:     { fr: "Des milliers de requêtes du monde entier",               ht: "Dè milye demann nan mond antye",                        en: "Thousands of requests from around the world"           },
    quickGames:       { fr: "Jeux rapides",                                           ht: "Jwèt rapid",                                            en: "Quick games"                                           },
    quickGamesDesc:   { fr: "Testez vos connaissances en 2 minutes",                  ht: "Teste konesans ou an 2 minit",                          en: "Test your knowledge in 2 minutes"                      },
    teachings:        { fr: "Enseignements",                                          ht: "Ansèyman",                                              en: "Teachings"                                             },
    teachingsDesc:    { fr: "Messages de pasteurs et leaders",                        ht: "Mesaj pastè ak lidè",                                   en: "Messages from pastors and leaders"                     },
    newContests:      { fr: "Nouveaux concours",                                      ht: "Nouvo konkou",                                          en: "New contests"                                          },
    registerBtn:      { fr: "S'inscrire →",                                           ht: "Enskri →",                                              en: "Register →"                                            },
    newStudies:       { fr: "Nouvelles études",                                       ht: "Nouvo etid",                                            en: "New studies"                                           },
    newStudiesDesc:   { fr: "Plans de lecture et ressources théologiques",            ht: "Plan lekti ak resous teyolojik",                        en: "Reading plans and theological resources"               },
    newTeachings:     { fr: "Nouveaux enseignements",                                 ht: "Nouvo ansèyman",                                        en: "New teachings"                                         },
    newTeachingsDesc: { fr: "Séries et messages de pasteurs",                         ht: "Seri ak mesaj pastè",                                   en: "Series and pastor messages"                            },
    newGroups:        { fr: "Nouveaux groupes",                                       ht: "Nouvo gwoup",                                           en: "New groups"                                            },
    newGroupsDesc:    { fr: "Communautés d'église actives",                           ht: "Kominote legliz aktif",                                 en: "Active church communities"                             },
    newPrayers:       { fr: "Nouvelles prières",                                      ht: "Nouvo lapriyè",                                         en: "New prayers"                                           },
    newPrayersDesc:   { fr: "Demandes récentes à couvrir",                            ht: "Demann resan pou kouvri",                               en: "Recent prayer requests to cover"                       },
    globalCommunity:  { fr: "Notre communauté mondiale",                              ht: "Kominote mondyal nou an",                               en: "Our global community"                                  },
    countries:        { fr: "Pays",                                                   ht: "Peyi",                                                  en: "Countries"                                             },
    members:          { fr: "Membres",                                                ht: "Manm",                                                  en: "Members"                                               },
    languages:        { fr: "Langues",                                                ht: "Lang",                                                  en: "Languages"                                             },
    inviteTitle:      { fr: "Inviter ma communauté",                                  ht: "Envite kominote mwen",                                  en: "Invite my community"                                   },
    inviteHeadline:   { fr: "Partagez KONEKSYON PAM avec votre église",               ht: "Pataje KONEKSYON PAM ak legliz ou",                     en: "Share KONEKSYON PAM with your church"                  },
    inviteDesc:       { fr: "Un ami qui découvre la Parole de Dieu grâce à vous — c'est un acte missionnaire.", ht: "Yon zanmi ki dekouvri Pawòl Bondye a gras a ou — se yon zak misyonè.", en: "A friend who discovers God's Word because of you — that's a missionary act." },
    whatsappMsg:      { fr: "✝️ Découvrez KONEKSYON PAM — la communauté chrétienne mondiale !\nhttps://koneksyonpam.com", ht: "✝️ Dekouvri KONEKSYON PAM — kominote kretyen mondyal la !\nhttps://koneksyonpam.com", en: "✝️ Discover KONEKSYON PAM — the global Christian community!\nhttps://koneksyonpam.com" },
    myChurch:         { fr: "Mon groupe d'église",                                    ht: "Gwoup legliz mwen",                                     en: "My church group"                                       },
    recentWinners:    { fr: "Derniers vainqueurs",                                    ht: "Dènye venkè yo",                                        en: "Recent winners"                                        },
  };
  const t = (k: keyof typeof txt) => txt[k][l];

  function contestStatus(status: string) {
    if (status === "active")   return t("live");
    if (status === "upcoming") return t("upcoming");
    if (status === "voting")   return t("voting");
    return t("ended");
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Header */}
      <div className="bg-[#0a1628] border-b border-white/5">
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
                {tb.icon} {tb[l]}
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
              <div className="absolute right-6 top-6 text-[100px] opacity-5 leading-none select-none">✝</div>
              <span className="text-4xl block mb-4">{inspiration.icon}</span>
              <p className="text-white font-bold text-xl leading-relaxed italic max-w-xl">&ldquo;{inspiration[l]}&rdquo;</p>
            </div>

            {/* 3 daily actions */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Link href="/aujourd-hui"
                className="group flex flex-col gap-3 p-6 rounded-2xl bg-white border border-[#c5a84f]/20 hover:border-[#c5a84f]/50 hover:shadow-md transition-all">
                <span className="text-2xl">✨</span>
                <p className="font-black text-[#0f2044]">{t("todayTitle")}</p>
                <p className="text-stone-400 text-xs">{t("todayDesc")}</p>
                <span className="text-[#c5a84f] text-xs font-bold mt-auto">{t("todayBtn")}</span>
              </Link>
              <Link href="/prieres"
                className="group flex flex-col gap-3 p-6 rounded-2xl bg-white border border-[#7c3aed]/20 hover:border-[#7c3aed]/50 hover:shadow-md transition-all">
                <span className="text-2xl">🙏</span>
                <p className="font-black text-[#7c3aed]">{t("prayTitle")}</p>
                <p className="text-stone-400 text-xs">{t("prayDesc")}</p>
                <span className="text-[#7c3aed] text-xs font-bold mt-auto">{t("prayBtn")}</span>
              </Link>
              <Link href="/jeu"
                className="group flex flex-col gap-3 p-6 rounded-2xl bg-white border border-[#ea580c]/20 hover:border-[#ea580c]/50 hover:shadow-md transition-all">
                <span className="text-2xl">🏛️</span>
                <p className="font-black text-[#ea580c]">{t("gameTitle")}</p>
                <p className="text-stone-400 text-xs">{t("gameDesc")}</p>
                <span className="text-[#ea580c] text-xs font-bold mt-auto">{t("gameBtn")}</span>
              </Link>
            </div>

            {/* Live contests */}
            {liveContests.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">🏆 {t("liveNow")}</p>
                {liveContests.map(c => (
                  <Link key={c.id} href={`/concours/${c.id}`}
                    className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-green-100 hover:border-green-300 hover:shadow-sm transition-all group mb-3">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0f2044] truncate group-hover:text-[#1d4ed8] transition-colors">{c.title}</p>
                      <p className="text-stone-400 text-xs">{c.contest_participants?.[0]?.count ?? 0} {t("participants")}</p>
                    </div>
                    <span className="text-[#1d4ed8] text-xs font-black shrink-0">{t("joinBtn")}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* All sections */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">🌐 {t("allSections")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SECTIONS.map(s => (
                  <Link key={s.href} href={s.href}
                    className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm"
                    style={{ borderColor: `${s.color}20`, color: s.color, backgroundColor: `${s.color}06` }}>
                    <span className="text-lg">{s.icon}</span>
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
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#b45309] mb-4">🔥 {t("mostActive")}</p>
              {contests.length === 0 ? (
                <p className="text-stone-300 text-sm">{t("loading")}</p>
              ) : (
                <div className="space-y-3">
                  {[...contests].slice(0, 5).map((c, i) => (
                    <Link key={c.id} href={`/concours/${c.id}`}
                      className="flex items-center gap-4 group">
                      <span className="text-stone-200 font-black text-sm w-6 shrink-0">#{i+1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0f2044] text-sm truncate group-hover:text-[#1d4ed8] transition-colors">{c.title}</p>
                        <p className="text-stone-400 text-xs">{c.contest_participants?.[0]?.count ?? 0} participants · {contestStatus(c.status)}</p>
                      </div>
                      {c.status === "active" && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />}
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/concours" className="inline-flex items-center gap-1 text-xs text-[#b45309] font-bold mt-4 hover:underline">
                {t("viewAll")}
              </Link>
            </div>

            {/* Popular sections */}
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: "/concours/hall-of-fame", icon: "🏆", title: t("hofTitle"),    desc: t("hofDesc"),        color: "#b45309" },
                { href: "/prieres",               icon: "🙏", title: t("prayWall"),    desc: t("prayWallDesc"),   color: "#7c3aed" },
                { href: "/jeu",                   icon: "🏛️", title: t("quickGames"), desc: t("quickGamesDesc"), color: "#ea580c" },
                { href: "/enseignement",           icon: "🎓", title: t("teachings"),  desc: t("teachingsDesc"),  color: "#0891b2" },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all group">
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
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
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] mb-4">🆕 {t("newContests")}</p>
                <div className="space-y-3">
                  {upcomingContests.map(c => (
                    <Link key={c.id} href={`/concours/${c.id}`}
                      className="flex items-center gap-4 group">
                      <span className="w-2 h-2 bg-[#1d4ed8] rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0f2044] text-sm truncate group-hover:text-[#1d4ed8] transition-colors">{c.title}</p>
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
              {[
                { icon: "📖", title: t("newStudies"),   href: "/etude",        color: "#1d4ed8", desc: t("newStudiesDesc")   },
                { icon: "🎓", title: t("newTeachings"), href: "/enseignement", color: "#0891b2", desc: t("newTeachingsDesc") },
                { icon: "⛪", title: t("newGroups"),    href: "/eglise",       color: "#16a34a", desc: t("newGroupsDesc")    },
                { icon: "🙏", title: t("newPrayers"),   href: "/prieres",      color: "#7c3aed", desc: t("newPrayersDesc")   },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-stone-100 hover:shadow-sm transition-all group">
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
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
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">👥 {t("globalCommunity")}</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: "12+", label: t("countries") },
                  { value: "500+", label: t("members")  },
                  { value: "3",   label: t("languages") },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-white font-black text-2xl">{s.value}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite CTA */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">💌 {t("inviteTitle")}</p>
              <p className="text-[#0f2044] font-bold text-base mb-2">{t("inviteHeadline")}</p>
              <p className="text-stone-400 text-sm mb-5">{t("inviteDesc")}</p>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(t("whatsappMsg"))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-xs font-black">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <Link href="/eglise" className="inline-flex items-center gap-2 border border-[#16a34a]/20 text-[#16a34a] bg-[#16a34a]/5 px-5 py-2.5 rounded-full text-xs font-black hover:bg-[#16a34a]/10 transition-colors">
                  ⛪ {t("myChurch")}
                </Link>
              </div>
            </div>

            {/* Past champions */}
            {completedContests.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b45309] mb-4">🏆 {t("recentWinners")}</p>
                <div className="space-y-3">
                  {completedContests.slice(0,3).map(c => (
                    <Link key={c.id} href={`/concours/${c.id}`} className="flex items-center gap-3 group">
                      <span className="text-xl">🥇</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0f2044] truncate group-hover:text-[#1d4ed8] transition-colors">{c.title}</p>
                        <p className="text-xs text-stone-400">{t("ended")}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/concours/hall-of-fame" className="inline-flex items-center gap-1 text-xs text-[#b45309] font-bold mt-4 hover:underline">
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
