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

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Header */}
      <div className="bg-[#0a1628] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 pb-0">
          <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-[0.3em] mb-2">KONEKSYON PAM</p>
          <h1 className="text-white font-black mb-6" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            {l === "fr" ? "Découvrir" : l === "ht" ? "Dekouvri" : "Discover"}
          </h1>

          {/* Tabs */}
          <div className="flex gap-0.5 overflow-x-auto pb-0 -mb-px">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  tab === t.key
                    ? "border-[#c5a84f] text-[#c5a84f]"
                    : "border-transparent text-white/30 hover:text-white/60"
                }`}>
                {t.icon} {t[l]}
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
                <p className="font-black text-[#0f2044]">{l === "fr" ? "Aujourd'hui" : "Jodi a"}</p>
                <p className="text-stone-400 text-xs">{l === "fr" ? "Verset, défi et concours du jour" : "Vèsè, defi ak konkou jou a"}</p>
                <span className="text-[#c5a84f] text-xs font-bold mt-auto">{l === "fr" ? "Voir →" : "Wè →"}</span>
              </Link>
              <Link href="/prieres"
                className="group flex flex-col gap-3 p-6 rounded-2xl bg-white border border-[#7c3aed]/20 hover:border-[#7c3aed]/50 hover:shadow-md transition-all">
                <span className="text-2xl">🙏</span>
                <p className="font-black text-[#7c3aed]">{l === "fr" ? "Prier maintenant" : "Priye kounye a"}</p>
                <p className="text-stone-400 text-xs">{l === "fr" ? "Rejoignez le mur de prière mondial" : "Rantre nan mi lapriyè mondyal la"}</p>
                <span className="text-[#7c3aed] text-xs font-bold mt-auto">{l === "fr" ? "Prier →" : "Priye →"}</span>
              </Link>
              <Link href="/jeu"
                className="group flex flex-col gap-3 p-6 rounded-2xl bg-white border border-[#ea580c]/20 hover:border-[#ea580c]/50 hover:shadow-md transition-all">
                <span className="text-2xl">🏛️</span>
                <p className="font-black text-[#ea580c]">{l === "fr" ? "Défi rapide" : "Defi rapid"}</p>
                <p className="text-stone-400 text-xs">{l === "fr" ? "Testez vos connaissances bibliques" : "Teste konesans biblik ou"}</p>
                <span className="text-[#ea580c] text-xs font-bold mt-auto">{l === "fr" ? "Jouer →" : "Jwe →"}</span>
              </Link>
            </div>

            {/* Live contests */}
            {liveContests.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">🏆 {l === "fr" ? "En direct maintenant" : "An dirèk kounye a"}</p>
                {liveContests.map(c => (
                  <Link key={c.id} href={`/concours/${c.id}`}
                    className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-green-100 hover:border-green-300 hover:shadow-sm transition-all group mb-3">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0f2044] truncate group-hover:text-[#1d4ed8] transition-colors">{c.title}</p>
                      <p className="text-stone-400 text-xs">{c.contest_participants?.[0]?.count ?? 0} {l === "fr" ? "participants" : "patisipan"}</p>
                    </div>
                    <span className="text-[#1d4ed8] text-xs font-black shrink-0">{l === "fr" ? "Rejoindre →" : "Antre →"}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* All sections */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">🌐 {l === "fr" ? "Toutes les sections" : "Tout seksyon yo"}</p>
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
              <p className="text-[10px] font-black uppercase tracking-widest text-[#b45309] mb-4">🔥 {l === "fr" ? "Concours les plus actifs" : "Konkou ki pi aktif yo"}</p>
              {contests.length === 0 ? (
                <p className="text-stone-300 text-sm">{l === "fr" ? "Chargement..." : "Ap chaje..."}</p>
              ) : (
                <div className="space-y-3">
                  {[...contests].slice(0, 5).map((c, i) => (
                    <Link key={c.id} href={`/concours/${c.id}`}
                      className="flex items-center gap-4 group">
                      <span className="text-stone-200 font-black text-sm w-6 shrink-0">#{i+1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0f2044] text-sm truncate group-hover:text-[#1d4ed8] transition-colors">{c.title}</p>
                        <p className="text-stone-400 text-xs">{c.contest_participants?.[0]?.count ?? 0} participants · {
                          c.status === "active" ? (l === "fr" ? "En direct" : "An dirèk") :
                          c.status === "upcoming" ? (l === "fr" ? "À venir" : "Ap vini") :
                          c.status === "voting" ? (l === "fr" ? "Vote ouvert" : "Ap vote") :
                          (l === "fr" ? "Terminé" : "Fini")
                        }</p>
                      </div>
                      {c.status === "active" && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />}
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/concours" className="inline-flex items-center gap-1 text-xs text-[#b45309] font-bold mt-4 hover:underline">
                {l === "fr" ? "Voir tous les concours →" : "Wè tout konkou yo →"}
              </Link>
            </div>

            {/* Popular sections */}
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: "/concours/hall-of-fame", icon: "🏆", title: l === "fr" ? "Hall of Fame" : "Hall of Fame", desc: l === "fr" ? "Les champions bibliques de KONEKSYON PAM" : "Chanpyon biblik KONEKSYON PAM yo", color: "#b45309" },
                { href: "/prieres", icon: "🙏", title: l === "fr" ? "Mur de prière" : "Mi lapriyè", desc: l === "fr" ? "Des milliers de requêtes du monde entier" : "Dè milye demann nan mond antye", color: "#7c3aed" },
                { href: "/jeu", icon: "🏛️", title: l === "fr" ? "Jeux rapides" : "Jwèt rapid", desc: l === "fr" ? "Testez vos connaissances en 2 minutes" : "Teste konesans ou an 2 minit", color: "#ea580c" },
                { href: "/enseignement", icon: "🎓", title: l === "fr" ? "Enseignements" : "Ansèyman", desc: l === "fr" ? "Messages de pasteurs et leaders" : "Mesaj pastè ak lidè", color: "#0891b2" },
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
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] mb-4">🆕 {l === "fr" ? "Nouveaux concours" : "Nouvo konkou"}</p>
                <div className="space-y-3">
                  {upcomingContests.map(c => (
                    <Link key={c.id} href={`/concours/${c.id}`}
                      className="flex items-center gap-4 group">
                      <span className="w-2 h-2 bg-[#1d4ed8] rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0f2044] text-sm truncate group-hover:text-[#1d4ed8] transition-colors">{c.title}</p>
                        {c.description && <p className="text-stone-400 text-xs truncate">{c.description}</p>}
                      </div>
                      <span className="text-[#1d4ed8] text-[10px] font-black shrink-0">{l === "fr" ? "S'inscrire →" : "Enskri →"}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* What's new on the platform */}
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: "📖", title: l === "fr" ? "Nouvelles études" : "Nouvo etid", href: "/etude", color: "#1d4ed8", desc: l === "fr" ? "Plans de lecture et ressources théologiques" : "Plan lekti ak resous teyolojik" },
                { icon: "🎓", title: l === "fr" ? "Nouveaux enseignements" : "Nouvo ansèyman", href: "/enseignement", color: "#0891b2", desc: l === "fr" ? "Séries et messages de pasteurs" : "Seri ak mesaj pastè" },
                { icon: "⛪", title: l === "fr" ? "Nouveaux groupes" : "Nouvo gwoup", href: "/eglise", color: "#16a34a", desc: l === "fr" ? "Communautés d'église actives" : "Kominote legliz aktif" },
                { icon: "🙏", title: l === "fr" ? "Nouvelles prières" : "Nouvo lapriyè", href: "/prieres", color: "#7c3aed", desc: l === "fr" ? "Demandes récentes à couvrir" : "Demann resan pou kouvri" },
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
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">👥 {l === "fr" ? "Notre communauté mondiale" : "Kominote mondyal nou an"}</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: "12+", label: l === "fr" ? "Pays" : "Peyi" },
                  { value: "500+", label: l === "fr" ? "Membres" : "Manm" },
                  { value: "3", label: l === "fr" ? "Langues" : "Lang" },
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
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">💌 {l === "fr" ? "Inviter ma communauté" : "Envite kominote mwen"}</p>
              <p className="text-[#0f2044] font-bold text-base mb-2">
                {l === "fr" ? "Partagez KONEKSYON PAM avec votre église" : l === "ht" ? "Pataje KONEKSYON PAM ak legliz ou" : "Share KONEKSYON PAM with your church"}
              </p>
              <p className="text-stone-400 text-sm mb-5">
                {l === "fr" ? "Un ami qui découvre la Parole de Dieu grâce à vous — c'est un acte missionnaire." : "Yon zanmi ki dekouvri Pawòl Bondye a gras a ou — se yon zak misyonè."}
              </p>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(l === "fr" ? "✝️ Découvrez KONEKSYON PAM — la communauté chrétienne mondiale !\nhttps://koneksyonpam.com" : "✝️ Dekouvri KONEKSYON PAM — kominote kretyen mondyal la !\nhttps://koneksyonpam.com")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-xs font-black">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <Link href="/eglise" className="inline-flex items-center gap-2 border border-[#16a34a]/20 text-[#16a34a] bg-[#16a34a]/5 px-5 py-2.5 rounded-full text-xs font-black hover:bg-[#16a34a]/10 transition-colors">
                  ⛪ {l === "fr" ? "Mon groupe d'église" : "Gwoup legliz mwen"}
                </Link>
              </div>
            </div>

            {/* Past champions */}
            {completedContests.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b45309] mb-4">🏆 {l === "fr" ? "Derniers vainqueurs" : "Dènye venkè yo"}</p>
                <div className="space-y-3">
                  {completedContests.slice(0,3).map(c => (
                    <Link key={c.id} href={`/concours/${c.id}`} className="flex items-center gap-3 group">
                      <span className="text-xl">🥇</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0f2044] truncate group-hover:text-[#1d4ed8] transition-colors">{c.title}</p>
                        <p className="text-xs text-stone-400">{l === "fr" ? "Terminé" : "Fini"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/concours/hall-of-fame" className="inline-flex items-center gap-1 text-xs text-[#b45309] font-bold mt-4 hover:underline">
                  {l === "fr" ? "Hall of Fame →" : "Hall of Fame →"}
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
