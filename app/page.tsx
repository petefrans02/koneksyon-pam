"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Lang = "fr" | "ht" | "en";

const verses = [
  { ref: "Jérémie 29:11", fr: "Car je connais les projets que j'ai formés sur vous — projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", ht: "Paske mwen konnen plan mwen genyen pou nou — plan pou fè nou jwenn lapè, pa dezas, pou ba nou yon avni ak espwa.", en: "For I know the plans I have for you — plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: "Philippiens 4:13", fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me." },
  { ref: "Ésaïe 41:10", fr: "Ne crains rien, car je suis avec toi. Ne promène pas des regards inquiets, car je suis ton Dieu.", ht: "Pa pè, paske mwen avèk ou. Pa dekouraje, paske mwen se Bondye ou.", en: "Do not fear, for I am with you. Do not be dismayed, for I am your God." },
  { ref: "Psaumes 23:1", fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen — mwen p ap manke anyen.", en: "The Lord is my shepherd — I lack nothing." },
  { ref: "Romains 8:28", fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.", en: "In all things God works for the good of those who love him." },
  { ref: "2 Timothée 1:7", fr: "Dieu ne nous a pas donné un esprit de timidité, mais un esprit de force, d'amour et de sagesse.", ht: "Bondye pa ba nou yon lespri pè, men yon lespri fòs, renmen ak disiplin.", en: "God has not given us a spirit of fear, but of power, love and sound mind." },
  { ref: "Jean 14:6", fr: "Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.", ht: "Mwen se chemen an, verite a, ak lavi a. Pesonn pa ka al jwenn Papa a si se pa pase nan mwen.", en: "I am the way and the truth and the life. No one comes to the Father except through me." },
];

const features = [
  { href: "/prieres",      fr: "Prière & Intercession",   ht: "Lapriyè & Entèsesyon",    en: "Prayer & Intercession",   desc: { fr: "Déposez vos requêtes. Intercédez pour d'autres.", ht: "Depoze demann ou. Entèsede pou lòt moun.", en: "Post your requests. Intercede for others." }, icon: "🙏" },
  { href: "/etude",        fr: "Étude Biblique",          ht: "Etid Biblik",              en: "Bible Study",             desc: { fr: "Plans de lecture et ressources théologiques.", ht: "Plan lekti ak resous teyolojik.", en: "Reading plans and theological resources." }, icon: "📖" },
  { href: "/enseignement", fr: "Enseignement",            ht: "Ansèyman",                 en: "Teaching",                desc: { fr: "Séries et messages de pasteurs et leaders.", ht: "Seri ak mesaj pastè ak lidè.", en: "Series and messages from pastors and leaders." }, icon: "🎓" },
  { href: "/jeu",          fr: "Jeux Bibliques",          ht: "Jwèt Biblik",              en: "Bible Games",             desc: { fr: "Trois formats de défi pour tester vos connaissances.", ht: "Twa fòma defi pou teste konesans ou.", en: "Three challenge formats to test your knowledge." }, icon: "🏛️" },
  { href: "/concours",     fr: "Concours Bibliques",      ht: "Konkou Biblik",            en: "Biblical Contests",       desc: { fr: "Compétitions en direct avec vote du public.", ht: "Konpetisyon an dirèk ak vòt piblik.", en: "Live competitions with public voting." }, icon: "🏆" },
  { href: "/eglise",       fr: "Groupes d'Église",        ht: "Gwoup Legliz",             en: "Church Groups",           desc: { fr: "Créez ou rejoignez votre communauté privée.", ht: "Kreye oswa rantre nan kominote prive ou.", en: "Create or join your private community." }, icon: "⛪" },
];

function getDayOfYear() {
  const n = new Date();
  return Math.floor((n.getTime() - new Date(n.getFullYear(), 0, 0).getTime()) / 86400000);
}

function ServicesSection({ l }: { l: Lang }) {
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(Array(features.length).fill(false));

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = refs.current.indexOf(entry.target as HTMLAnchorElement);
          if (entry.isIntersecting && idx !== -1) {
            setTimeout(() => {
              setVisible(prev => { const n = [...prev]; n[idx] = true; return n; });
            }, idx * 100);
          }
        });
      },
      { threshold: 0.15 }
    );
    refs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bg-white py-16 px-5 sm:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="border-l-4 border-[#1d4ed8] pl-5 mb-12">
          <p className="text-[#1d4ed8] text-xs font-bold uppercase tracking-[0.2em] mb-1">
            {l === "fr" ? "Nos services" : l === "ht" ? "Sèvis nou yo" : "Our services"}
          </p>
          <h2 className="text-[#0f2044] font-black text-2xl sm:text-3xl">
            {l === "fr" ? "Tout ce dont vous avez besoin pour grandir spirituellement"
           : l === "ht" ? "Tout sa ou bezwen pou grandi espirityèlman"
           : "Everything you need to grow spiritually"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Link
              key={f.href}
              href={f.href}
              ref={el => { refs.current[i] = el; }}
              style={{
                opacity: visible[i] ? 1 : 0,
                transform: visible[i] ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
              }}
              className="group border border-stone-200 rounded-lg overflow-hidden hover:border-[#1d4ed8] hover:shadow-xl transition-shadow flex flex-col"
            >
              <div className="h-1 bg-[#0f2044] group-hover:bg-[#1d4ed8] transition-colors duration-300" />
              <div className="p-6 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300 inline-block">{f.icon}</span>
                  <p className="text-[#0f2044] font-bold text-base group-hover:text-[#1d4ed8] transition-colors duration-200">
                    {f[l as keyof typeof f] as string}
                  </p>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed">{(f.desc as Record<Lang, string>)[l]}</p>
                <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[#1d4ed8] text-xs font-bold group-hover:underline">
                    {l === "fr" ? "Accéder" : l === "ht" ? "Antre" : "Open"} →
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#1d4ed8] text-xs font-bold group-hover:bg-[#1d4ed8] group-hover:text-white transition-all duration-300">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;
  const [visible, setVisible] = useState(false);
  const [vi, setVi] = useState(getDayOfYear() % verses.length);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const verse = verses[vi];

  return (
    <main>

      {/* ── HERO BANNER ── */}
      <section className="bg-[#0f2044]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* Left: headline */}
            <div className="flex-1"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(18px)", transition: "all 0.6s ease 0.1s" }}>
              <div className="inline-flex items-center gap-2 bg-[#1d4ed8]/30 border border-[#3b82f6]/30 rounded px-3 py-1.5 mb-6">
                <div className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full" />
                <span className="text-[#93c5fd] text-xs font-semibold tracking-wide uppercase">
                  {l === "fr" ? "Plateforme Biblique" : l === "ht" ? "Platfòm Biblik" : "Biblical Platform"}
                </span>
              </div>
              <h1 className="text-white font-black leading-[1.08] mb-5 uppercase"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                {l === "fr" ? "La foi chrétienne au cœur du numérique." : l === "ht" ? "Lafwa kretyen nan kè dijital la." : "Christian faith at the heart of the digital age."}
              </h1>
              <p className="text-[#93c5fd]/80 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                {l === "fr" ? "Prière, étude, enseignement, concours bibliques et groupes d'église — tout centralisé pour votre vie spirituelle."
               : l === "ht" ? "Lapriyè, etid, ansèyman, konkou biblik ak gwoup legliz — tout santralize pou lavi espirityèl ou."
               : "Prayer, study, teaching, biblical contests and church groups — all centralized for your spiritual life."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/prieres"
                  className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-7 py-3 rounded font-bold text-sm transition-colors shadow-lg">
                  {l === "fr" ? "Accéder à la plateforme" : l === "ht" ? "Antre nan platfòm nan" : "Access the platform"}
                </Link>
                <Link href="/eglise"
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-7 py-3 rounded font-semibold text-sm transition-colors">
                  {l === "fr" ? "Rejoindre un groupe" : l === "ht" ? "Rantre nan yon gwoup" : "Join a group"}
                </Link>
              </div>
            </div>

            {/* Right: Verse of the day */}
            <div className="w-full lg:w-96 shrink-0"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(18px)", transition: "all 0.6s ease 0.4s" }}>
              <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                {/* Card header */}
                <div className="bg-[#1d4ed8] px-6 py-3 flex items-center justify-between">
                  <p className="text-white text-xs font-bold uppercase tracking-widest">
                    {l === "fr" ? "Verset du jour" : l === "ht" ? "Vèsè jounen an" : "Verse of the day"}
                  </p>
                  <p className="text-white/60 text-xs font-semibold">{verse.ref}</p>
                </div>
                {/* Card body */}
                <div className="px-6 py-6">
                  <p className="text-[#0f2044] text-base leading-relaxed italic font-medium mb-5">
                    &ldquo;{verse[l]}&rdquo;
                  </p>
                  {/* Verse selector dots */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {verses.map((_, i) => (
                        <button key={i} onClick={() => setVi(i)}
                          className={`rounded-full transition-all ${i === vi ? "bg-[#1d4ed8] w-4 h-1.5" : "bg-[#bfdbfe] w-1.5 h-1.5 hover:bg-[#93c5fd]"}`} />
                      ))}
                    </div>
                    <Link href="/bible" className="text-[#1d4ed8] text-xs font-semibold hover:underline">
                      {l === "fr" ? "Lire la Bible →" : l === "ht" ? "Li Bib la →" : "Read Bible →"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Blue strip */}
      <div className="h-1.5 bg-gradient-to-r from-[#0f2044] via-[#1d4ed8] to-[#38bdf8]" />

      {/* ── NOS SERVICES ── */}
      <ServicesSection l={l} />

      {/* ── CONCOURS + PRIÈRE ── */}
      <section className="bg-[#eff6ff] py-16 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">

          {/* Contest */}
          <div className="bg-[#0f2044] rounded-lg p-8 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="bg-[#1d4ed8] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                {l === "fr" ? "En direct" : l === "ht" ? "An dirèk" : "Live"}
              </span>
              <span className="text-white/40 text-xs">{l === "fr" ? "Concours Biblique" : l === "ht" ? "Konkou Biblik" : "Biblical Contest"}</span>
            </div>
            <h3 className="text-white font-black text-xl leading-snug">
              {l === "fr" ? "Des milliers de spectateurs. Un seul vainqueur." : l === "ht" ? "Dè milye espektatè. Yon sèl venkè." : "Thousands of spectators. One winner."}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              {l === "fr" ? "Participez aux concours bibliques en direct. Le public vote pour son favori."
             : l === "ht" ? "Patisipe nan konkou biblik an dirèk. Piblik la vote pou favori li."
             : "Participate in live biblical contests. The public votes for their favorite."}
            </p>
            <Link href="/concours"
              className="self-start bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-6 py-2.5 rounded text-sm font-bold transition-colors">
              {l === "fr" ? "Voir les concours" : l === "ht" ? "Wè konkou yo" : "View contests"} →
            </Link>
          </div>

          {/* Prayer */}
          <div className="bg-white rounded-lg border border-[#bfdbfe] p-8 flex flex-col gap-5">
            <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center text-xl">🙏</div>
            <h3 className="text-[#0f2044] font-black text-xl leading-snug">
              {l === "fr" ? "Personne ne prie seul sur cette plateforme." : l === "ht" ? "Pesonn pa priye pou kont li sou platfòm sa a." : "No one prays alone on this platform."}
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              {l === "fr" ? "Des frères et sœurs du monde entier déposent leurs besoins. Rejoignez le mur de prière et intercédez."
             : l === "ht" ? "Frè ak sè nan mond antye ap depoze bezwen yo. Rantre nan mi lapriyè a epi entèsede."
             : "Brothers and sisters worldwide share their needs. Join the prayer wall and intercede."}
            </p>
            <Link href="/prieres"
              className="self-start border-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044] hover:text-white px-6 py-2.5 rounded text-sm font-bold transition-all">
              {l === "fr" ? "Voir les prières" : l === "ht" ? "Wè lapriyè yo" : "View prayers"} →
            </Link>
          </div>

        </div>
      </section>

      {/* ── FOOTER BAND ── */}
      <section className="bg-[#0f2044] py-10 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-kp.png" alt="KP" className="w-9 h-9 rounded-lg" />
            <div>
              <p className="text-white font-black text-sm">KONEKSYON PAM</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Plateforme Chrétienne</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { href: "/prieres", label: l === "fr" ? "Prière" : "Lapriyè" },
              { href: "/etude", label: l === "fr" ? "Étude" : "Etid" },
              { href: "/concours", label: l === "fr" ? "Concours" : "Konkou" },
              { href: "/eglise", label: l === "fr" ? "Groupes" : "Gwoup" },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="text-white/50 text-xs hover:text-white transition-colors font-medium">
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-white/25 text-[10px]">© {new Date().getFullYear()} Koneksyon Pam</p>
        </div>
      </section>

    </main>
  );
}
