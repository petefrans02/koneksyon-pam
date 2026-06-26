"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "fr" | "ht" | "en";

const verses = [
  { ref: "Jérémie 29:11", fr: "Car je connais les projets que j'ai formés sur vous — projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", ht: "Paske mwen konnen plan mwen genyen pou nou — plan pou fè nou jwenn lapè, pa dezas, pou ba nou yon avni ak espwa.", en: "For I know the plans I have for you — plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: "Ésaïe 41:10", fr: "Ne crains rien, car je suis avec toi. Ne promène pas des regards inquiets, car je suis ton Dieu.", ht: "Pa pè, paske mwen avèk ou. Pa dekouraje, paske mwen se Bondye ou.", en: "Do not fear, for I am with you. Do not be dismayed, for I am your God." },
  { ref: "Philippiens 4:13", fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me." },
  { ref: "Psaumes 23:1", fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen — mwen p ap manke anyen.", en: "The Lord is my shepherd — I lack nothing." },
  { ref: "Jean 3:16", fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ait la vie éternelle.", ht: "Paske Bondye sitèlman renmen lèzòm, li bay sèl Pitit li a pou tout moun ki kwè nan li ka gen lavi etènèl.", en: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall have eternal life." },
  { ref: "Romains 8:28", fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.", en: "In all things God works for the good of those who love him." },
  { ref: "2 Timothée 1:7", fr: "Dieu ne nous a pas donné un esprit de timidité, mais un esprit de force, d'amour et de sagesse.", ht: "Bondye pa ba nou yon lespri pè, men yon lespri fòs, renmen ak disiplin.", en: "God has not given us a spirit of fear, but of power, love and sound mind." },
];

function getDayOfYear() {
  const n = new Date();
  return Math.floor((n.getTime() - new Date(n.getFullYear(), 0, 0).getTime()) / 86400000);
}

const features = [
  { href: "/prieres",      icon: "✦", fr: "Prière",           ht: "Lapriyè",      en: "Prayer",    sub: { fr: "Mur d'intercession mondial", ht: "Mi entèsesyon mondyal", en: "Global intercession wall" } },
  { href: "/etude",        icon: "◈", fr: "Étude Biblique",   ht: "Etid Biblik",  en: "Bible Study", sub: { fr: "Plans de lecture & ressources", ht: "Plan lekti & resous", en: "Reading plans & resources" } },
  { href: "/enseignement", icon: "◉", fr: "Enseignement",     ht: "Ansèyman",     en: "Teaching",  sub: { fr: "Séries & messages de pasteurs", ht: "Seri & mesaj pastè", en: "Pastor series & messages" } },
  { href: "/jeu",          icon: "◐", fr: "Jeux Bibliques",   ht: "Jwèt Biblik",  en: "Bible Games", sub: { fr: "Versets · Vrai/Faux · Figures", ht: "Vèsè · Vre/Fo · Pèsonaj", en: "Verses · True/False · Figures" } },
  { href: "/concours",     icon: "◆", fr: "Concours",         ht: "Konkou",       en: "Contest",   sub: { fr: "Défi quotidien avec vote du public", ht: "Defi jounen ak vòt piblik", en: "Daily challenge with public vote" } },
  { href: "/eglise",       icon: "◎", fr: "Groupes d'Église", ht: "Gwoup Legliz", en: "Groups",    sub: { fr: "Communautés privées par code", ht: "Kominote prive pa kòd", en: "Private communities by code" } },
];

export default function Home() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const [visible, setVisible] = useState(false);
  const [verseIdx, setVerseIdx] = useState(getDayOfYear() % verses.length);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const verse = verses[verseIdx];

  const txt = {
    verseLabel: l === "fr" ? "Verset du jour" : l === "ht" ? "Vèsè jounen an" : "Verse of the day",
    tagline: l === "fr" ? "La Parole. La Prière. La Communauté." : l === "ht" ? "Pawòl la. Lapriyè a. Kominote a." : "The Word. The Prayer. The Community.",
    sub: l === "fr" ? "Une plateforme sérieuse pour votre vie spirituelle." : l === "ht" ? "Yon platfòm serye pou lavi espirityèl ou." : "A serious platform for your spiritual life.",
    cta1: l === "fr" ? "Commencer" : l === "ht" ? "Kòmanse" : "Get started",
    cta2: l === "fr" ? "Rejoindre un groupe" : l === "ht" ? "Rantre nan yon gwoup" : "Join a group",
    explore: l === "fr" ? "Tout explorer" : l === "ht" ? "Eksplore tout" : "Explore all",
    features: l === "fr" ? "Ce que vous trouverez ici" : l === "ht" ? "Sa ou pral jwenn isit" : "What you'll find here",
    contestTitle: l === "fr" ? "Défi Biblique Quotidien" : l === "ht" ? "Defi Biblik Chak Jou" : "Daily Biblical Challenge",
    contestSub: l === "fr" ? "Des milliers de spectateurs. Des participants qui s'affrontent. Le public vote." : l === "ht" ? "Dè milye espektatè. Patisipan k ap konpete. Piblik la vote." : "Thousands of spectators. Participants compete. The public votes.",
    contestBtn: l === "fr" ? "Participer" : l === "ht" ? "Patisipe" : "Participate",
    prayerTitle: l === "fr" ? "Personne ne prie seul ici." : l === "ht" ? "Pesonn pa priye pou kont li isit." : "No one prays alone here.",
    prayerSub: l === "fr" ? "Des frères et sœurs du monde entier déposent leurs besoins. Rejoignez le mur de prière." : l === "ht" ? "Frè ak sè nan mond antye ap depoze bezwen yo. Rantre nan mi lapriyè a." : "Brothers and sisters worldwide share their needs. Join the prayer wall.",
    prayerBtn: l === "fr" ? "Voir les prières" : l === "ht" ? "Wè lapriyè yo" : "See prayers",
    open: l === "fr" ? "Ouvrir" : l === "ht" ? "Ouvri" : "Open",
  };

  return (
    <main>

      {/* ── HERO ── */}
      <section className="relative bg-[#080c14] min-h-screen flex flex-col overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#c5a84f]/6 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/20 blur-[100px]" />
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-24 text-center">

          {/* Brand */}
          <div className="flex items-center gap-3 mb-12"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}>
            <img src="/logo-kp.png" alt="KP" className="w-10 h-10 rounded-xl opacity-90" />
            <span className="text-white/40 text-xs font-bold tracking-[0.25em] uppercase">Koneksyon Pam</span>
          </div>

          {/* Verse — hero element */}
          <div className="max-w-3xl mx-auto mb-14"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s" }}>
            <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">{txt.verseLabel}</p>
            <blockquote className="text-white/90 leading-relaxed mb-6"
              style={{ fontSize: "clamp(1.3rem, 3.5vw, 2rem)", fontStyle: "italic", fontWeight: 300 }}>
              &ldquo;{verse[l]}&rdquo;
            </blockquote>
            <p className="text-white/25 text-sm font-semibold tracking-widest uppercase">{verse.ref}</p>

            {/* Verse dots */}
            <div className="flex justify-center gap-2 mt-6">
              {verses.map((_, i) => (
                <button key={i} onClick={() => setVerseIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === verseIdx ? "bg-[#c5a84f] w-4" : "bg-white/20 hover:bg-white/40"}`} />
              ))}
            </div>
          </div>

          {/* Tagline + CTAs */}
          <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.8s" }}>
            <p className="text-white/40 text-sm mb-8 tracking-wide">{txt.tagline}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/prieres"
                className="bg-[#c5a84f] text-[#080c14] px-8 py-3.5 rounded-full text-sm font-black hover:bg-[#d4b85c] transition-colors shadow-lg shadow-[#c5a84f]/20">
                {txt.cta1}
              </Link>
              <Link href="/eglise"
                className="border border-white/10 text-white/60 px-8 py-3.5 rounded-full text-sm font-medium hover:border-white/25 hover:text-white transition-all">
                {txt.cta2}
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 1.2s" }}>
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/20" />
            <div className="w-1 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-[#0d1118] px-5 sm:px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.3em] mb-16 text-center">
            {txt.features}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {features.map((f, i) => (
              <Link key={f.href} href={f.href}
                className="group bg-[#0d1118] hover:bg-[#131926] p-8 flex flex-col gap-5 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-[#c5a84f]/0 group-hover:bg-[#c5a84f]/3 transition-colors" />
                <span className="text-[#c5a84f]/40 text-base font-black group-hover:text-[#c5a84f] transition-colors relative z-10">
                  {f.icon}
                </span>
                <div className="relative z-10">
                  <p className="text-white font-bold text-base mb-2">{f[l as keyof typeof f] as string}</p>
                  <p className="text-white/30 text-xs leading-relaxed">{(f.sub as Record<Lang, string>)[l]}</p>
                </div>
                <span className="text-white/15 text-xs font-medium group-hover:text-[#c5a84f]/60 transition-colors relative z-10 mt-auto">
                  {txt.open} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTEST ── */}
      <section className="bg-[#080c14] px-5 sm:px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-[#c5a84f]/15">
            {/* Gold glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#c5a84f]/8 blur-[60px]" />
            <div className="relative z-10 p-10 sm:p-16 text-center">
              <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                {txt.contestTitle}
              </p>
              <h2 className="text-white font-black leading-tight mb-5"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                {l === "fr" ? "Testez vos connaissances.\nLe public décide." : l === "ht" ? "Teste konesans ou.\nPiblik la deside." : "Test your knowledge.\nThe public decides."}
              </h2>
              <p className="text-white/30 text-sm leading-relaxed mb-10 max-w-md mx-auto">
                {txt.contestSub}
              </p>
              <Link href="/concours"
                className="inline-block bg-[#c5a84f] text-[#080c14] px-10 py-4 rounded-full text-sm font-black hover:bg-[#d4b85c] transition-colors shadow-xl shadow-[#c5a84f]/15">
                {txt.contestBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRAYER ── */}
      <section className="bg-[#0d1118] px-5 sm:px-8 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-[#c5a84f]/40 mx-auto mb-12" />
          <h2 className="text-white font-black leading-tight mb-5"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            {txt.prayerTitle}
          </h2>
          <p className="text-white/30 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            {txt.prayerSub}
          </p>
          <Link href="/prieres"
            className="inline-block border border-white/10 text-white/70 px-8 py-3.5 rounded-full text-sm font-medium hover:border-[#c5a84f]/40 hover:text-white transition-all">
            {txt.prayerBtn} →
          </Link>
          <div className="w-px h-16 bg-gradient-to-t from-transparent to-[#c5a84f]/20 mx-auto mt-12" />
        </div>
      </section>

    </main>
  );
}
