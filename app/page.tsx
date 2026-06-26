"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";

const versePool = [
  { ref: "Jean 3:16",        fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.", ht: "Paske Bondye sitèlman renmen lèzòm, li bay sèl Pitit li a pou tout moun ki kwè nan li.", en: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
  { ref: "Philippiens 4:13", fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me." },
  { ref: "Ésaïe 41:10",     fr: "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu.", ht: "Pa pè, paske mwen avèk ou; pa dekouraje, paske mwen se Bondye ou.", en: "So do not fear, for I am with you; do not be dismayed, for I am your God." },
  { ref: "Jérémie 29:11",   fr: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", ht: "Paske mwen konnen plan mwen genyen pou nou, se plan pou fè nou jwenn lapè, pa dezas.", en: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you." },
  { ref: "Matthieu 11:28",  fr: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", ht: "Vini jwenn mwen, nou tout ki fatige ak ki chaje ak fado lou, m ap ban nou repo.", en: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { ref: "Psaumes 23:1",    fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen; mwen p ap manke anyen.", en: "The Lord is my shepherd, I lack nothing." },
  { ref: "Romains 8:28",    fr: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Nou konnen ke tout bagay travay ansanm pou byen moun ki renmen Bondye.", en: "And we know that in all things God works for the good of those who love him." },
  { ref: "Jean 14:6",       fr: "Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.", ht: "Mwen se chemen an, verite a, ak lavi a. Pesonn pa ka al jwenn Papa a si se pa pase nan mwen.", en: "I am the way and the truth and the life. No one comes to the Father except through me." },
  { ref: "2 Timothée 1:7",  fr: "Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse.", ht: "Paske Bondye pa ba nou yon lespri pè, men yon lespri fòs, renmen ak disiplin.", en: "For God has not given us a spirit of fear, but of power, love and sound mind." },
  { ref: "1 Pierre 5:7",    fr: "Déchargez-vous sur lui de tous vos soucis, car il prend soin de vous.", ht: "Kite tout enkyetid ou sou li, paske li pran swen ou.", en: "Cast all your anxiety on him because he cares for you." },
  { ref: "Hébreux 11:1",    fr: "Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas.", ht: "Lafwa se gen asirans pou bagay nou espere yo, se prèv bagay nou pa wè yo.", en: "Now faith is confidence in what we hope for and assurance about what we do not see." },
  { ref: "Romains 12:2",    fr: "Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence.", ht: "Pa kite monn nan chanje ou, men kite Bondye chanje fason ou panse.", en: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind." },
  { ref: "Ésaïe 40:31",    fr: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.", ht: "Men moun ki mete espwa yo nan Seyè a pran nouvo fòs. Yo pral vole tankou malfini.", en: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles." },
  { ref: "Psaumes 46:1",    fr: "Dieu est notre refuge et notre force, un secours qui ne manque jamais dans la détresse.", ht: "Bondye se pwoteksyon nou ak fòs nou; li toujou la pou ede nou lè nou nan traka.", en: "God is our refuge and strength, an ever-present help in trouble." },
];

function getDayOfYear() {
  const n = new Date();
  return Math.floor((n.getTime() - new Date(n.getFullYear(), 0, 0).getTime()) / 86400000);
}

type Lang = "fr" | "ht" | "en";

const features = [
  {
    href: "/prieres",
    icon: "✦",
    fr: { title: "Prière", desc: "Déposez vos requêtes et intercédez pour la communauté." },
    ht: { title: "Lapriyè", desc: "Depoze demann ou yo epi entèsede pou kominote a." },
    en: { title: "Prayer", desc: "Post prayer requests and intercede for the community." },
  },
  {
    href: "/etude",
    icon: "◈",
    fr: { title: "Étude Biblique", desc: "Explorez les Écritures avec des plans de lecture et des ressources." },
    ht: { title: "Etid Biblik", desc: "Eksplore Ekriti yo ak plan lekti ak resous." },
    en: { title: "Bible Study", desc: "Explore Scripture with reading plans and resources." },
  },
  {
    href: "/enseignement",
    icon: "◉",
    fr: { title: "Enseignement", desc: "Messages, séries et doctrines partagés par des pasteurs et leaders." },
    ht: { title: "Ansèyman", desc: "Mesaj, seri ak doktrin pastè ak lidè yo pataje." },
    en: { title: "Teaching", desc: "Messages, series and doctrine shared by pastors and leaders." },
  },
  {
    href: "/jeu",
    icon: "◐",
    fr: { title: "Jeux Bibliques", desc: "Trois formats de défi — versets, vrai/faux, personnages bibliques." },
    ht: { title: "Jwèt Biblik", desc: "Twa fòma defi — vèsè, vre/fo, pèsonaj biblik." },
    en: { title: "Bible Games", desc: "Three challenge formats — verses, true/false, biblical figures." },
  },
  {
    href: "/concours",
    icon: "◆",
    fr: { title: "Concours du Jour", desc: "Un défi biblique quotidien. Classements, points et récompenses." },
    ht: { title: "Konkou Jounen an", desc: "Yon defi biblik chak jou. Klasman, pwen ak rekonpans." },
    en: { title: "Daily Contest", desc: "A daily biblical challenge. Rankings, points and rewards." },
  },
  {
    href: "/eglise",
    icon: "◎",
    fr: { title: "Groupes d'Église", desc: "Créez ou rejoignez votre communauté privée avec un code." },
    ht: { title: "Gwoup Legliz", desc: "Kreye oswa rantre nan kominote prive ou a ak yon kòd." },
    en: { title: "Church Groups", desc: "Create or join your private community with a code." },
  },
];

export default function Home() {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);
  const verse = versePool[getDayOfYear() % versePool.length];
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const txt = {
    headline:
      l === "fr" ? "La Parole.\nLa Prière.\nLa Communauté."
      : l === "ht" ? "Pawòl la.\nLapriyè a.\nKominote a."
      : "The Word.\nThe Prayer.\nThe Community.",
    sub:
      l === "fr" ? "Une plateforme sérieuse pour votre vie spirituelle quotidienne."
      : l === "ht" ? "Yon platfòm serye pou lavi espirityèl chak jou ou a."
      : "A serious platform for your daily spiritual life.",
    cta1: l === "fr" ? "Commencer" : l === "ht" ? "Kòmanse" : "Get started",
    cta2: l === "fr" ? "Rejoindre un groupe" : l === "ht" ? "Rantre nan yon gwoup" : "Join a group",
    verseLabel: l === "fr" ? "Verset du jour" : l === "ht" ? "Vèsè jounen an" : "Verse of the day",
    readMore: l === "fr" ? "Lire la Bible" : l === "ht" ? "Li Bib la" : "Read the Bible",
    sectionTitle: l === "fr" ? "Ce que vous trouverez ici" : l === "ht" ? "Sa ou pral jwenn isit" : "What you'll find here",
    prayerTitle: l === "fr" ? "Le mur de prière" : l === "ht" ? "Mi lapriyè a" : "The prayer wall",
    prayerSub: l === "fr" ? "Des frères et sœurs du monde entier déposent leurs requêtes. Priez avec eux."
             : l === "ht" ? "Frè ak sè nan mond antye ap depoze demann yo. Priye avèk yo."
             : "Brothers and sisters worldwide post their requests. Pray with them.",
    prayerBtn: l === "fr" ? "Voir les demandes de prière" : l === "ht" ? "Wè demann lapriyè yo" : "View prayer requests",
    contestTitle: l === "fr" ? "Défi Biblique · Quotidien" : l === "ht" ? "Defi Biblik · Chak Jou" : "Biblical Challenge · Daily",
    contestSub: l === "fr" ? "Un nouveau défi chaque jour. Testez votre connaissance des Écritures, montez dans le classement."
              : l === "ht" ? "Yon nouvo defi chak jou. Teste konesans ou sou Ekriti yo, monte nan klasman an."
              : "A new challenge every day. Test your knowledge of Scripture, rise in the rankings.",
    contestBtn: l === "fr" ? "Participer aujourd'hui" : l === "ht" ? "Patisipe jodi a" : "Participate today",
    open: l === "fr" ? "Ouvrir" : l === "ht" ? "Ouvri" : "Open",
  };

  return (
    <main className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-[#0b0f1a] min-h-[92vh] flex items-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-16">

            {/* Left */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[#c5a84f] text-xs font-bold uppercase tracking-[0.25em] mb-8"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}
              >
                Koneksyon Pam
              </p>

              <h1
                className="text-white font-black leading-[1.05] mb-6"
                style={{
                  fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(20px)",
                  transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
                  whiteSpace: "pre-line",
                }}
              >
                {txt.headline}
              </h1>

              <p
                className="text-white/50 text-base sm:text-lg mb-10 max-w-md leading-relaxed"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.5s" }}
              >
                {txt.sub}
              </p>

              <div
                className="flex flex-wrap gap-3"
                style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.65s" }}
              >
                <Link
                  href="/prieres"
                  className="bg-[#c5a84f] text-[#0b0f1a] px-7 py-3.5 rounded-full text-sm font-black hover:bg-[#d4b85c] transition-colors"
                >
                  {txt.cta1}
                </Link>
                <Link
                  href="/eglise"
                  className="border border-white/15 text-white/70 px-7 py-3.5 rounded-full text-sm font-medium hover:border-white/30 hover:text-white transition-all"
                >
                  {txt.cta2}
                </Link>
              </div>
            </div>

            {/* Right: Verse card */}
            <div
              className="w-full lg:w-[360px] shrink-0"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(16px)",
                transition: "opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s",
              }}
            >
              <div className="bg-[#131926] border border-[#1e2740] rounded-2xl overflow-hidden">
                <div className="border-l-2 border-[#c5a84f] p-7">
                  <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
                    {txt.verseLabel}
                  </p>
                  <p className="text-[#8a9ab8] text-xs font-semibold uppercase tracking-widest mb-3">
                    {verse.ref}
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed italic">
                    &ldquo;{verse[l]}&rdquo;
                  </p>
                  <div className="mt-6 pt-5 border-t border-white/5">
                    <Link
                      href="/bible"
                      className="text-white/30 text-xs hover:text-[#c5a84f] transition-colors font-medium"
                    >
                      {txt.readMore} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#f8f6f2] py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#0b0f1a]/40 text-xs font-bold uppercase tracking-[0.25em] mb-12 text-center">
            {txt.sectionTitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group bg-white rounded-2xl p-7 border border-stone-200/60 hover:border-[#c5a84f]/40 hover:shadow-lg hover:shadow-stone-200/80 transition-all flex flex-col gap-4"
              >
                <span className="text-[#c5a84f] text-sm font-black">{f.icon}</span>
                <div>
                  <p className="text-[#0b0f1a] font-bold text-base mb-1.5">{f[l].title}</p>
                  <p className="text-stone-400 text-sm leading-relaxed">{f[l].desc}</p>
                </div>
                <span className="text-stone-300 text-sm font-medium group-hover:text-[#c5a84f] transition-colors mt-auto">
                  {txt.open} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Daily Contest Banner ── */}
      <section className="bg-[#0b0f1a] py-20 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-[#1e2740] rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="flex-1">
              <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.25em] mb-4">
                {txt.contestTitle}
              </p>
              <p className="text-white font-black text-2xl sm:text-3xl leading-tight mb-4">
                {l === "fr" ? "Testez vos connaissances." : l === "ht" ? "Teste konesans ou." : "Test your knowledge."}
              </p>
              <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                {txt.contestSub}
              </p>
            </div>
            <Link
              href="/concours"
              className="shrink-0 bg-[#c5a84f] text-[#0b0f1a] px-8 py-3.5 rounded-full text-sm font-black hover:bg-[#d4b85c] transition-colors whitespace-nowrap"
            >
              {txt.contestBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Prayer Wall ── */}
      <section className="py-20 px-5 sm:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#0b0f1a]/40 text-xs font-bold uppercase tracking-[0.25em] mb-5">
            {txt.prayerTitle}
          </p>
          <h2 className="text-[#0b0f1a] font-black text-2xl sm:text-3xl mb-4 leading-tight">
            {l === "fr" ? "Personne ne prie seul ici." : l === "ht" ? "Pesonn pa priye pou kont li isit." : "No one prays alone here."}
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
            {txt.prayerSub}
          </p>
          <Link
            href="/prieres"
            className="inline-block bg-[#0b0f1a] text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-[#131926] transition-colors"
          >
            {txt.prayerBtn}
          </Link>
        </div>
      </section>

    </main>
  );
}
