"use client";
import HeroBackdrop from "@/app/components/HeroBackdrop";

import { useLang } from "@/lib/LangContext";
import { bibleBooks } from "@/lib/bible-books";
import Link from "next/link";
import Icon from "@/app/components/Icon";
import { useState, useEffect, useRef, useCallback } from "react";

type Lang = "fr" | "ht" | "en" | "es";

const FEATURED_VERSES = [
  {
    ref:  { fr: "Jean 3:16",        ht: "Jan 3:16",         en: "John 3:16",          es: "Juan 3:16"         },
    text: { fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.", ht: "Paske Bondye sitèlman renmen lèzòm, li bay sèl Pitit li a, pou tout moun ki va mete konfyans yo nan li pa peri, men pou yo te gen lavi ki p ap janm fini.", en: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", es: "Porque tanto amó Dios al mundo, que dio a su Hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna." },
    book: "Jean / John", color: "#3b82f6",
  },
  {
    ref:  { fr: "Jérémie 29:11",    ht: "Jeremi 29:11",     en: "Jeremiah 29:11",     es: "Jeremías 29:11"    },
    text: { fr: "Car je connais les projets que j'ai formés sur vous — projets de paix et non de malheur, pour vous donner un avenir et de l'espérance.", ht: "Paske mwen konnen plan mwen genyen pou nou — plan pou fè nou jwenn lapè, pou ban nou yon avni ak espwa.", en: "For I know the plans I have for you — plans to prosper you and not to harm you, plans to give you hope and a future.", es: "Porque yo sé los planes que tengo para ustedes — planes de paz y no de mal, para darles un futuro y una esperanza." },
    book: "Jérémie / Jeremiah", color: "#34d399",
  },
  {
    ref:  { fr: "Philippiens 4:13", ht: "Filipyen 4:13",    en: "Philippians 4:13",   es: "Filipenses 4:13"   },
    text: { fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me.", es: "Todo lo puedo en Cristo que me fortalece." },
    book: "Philippiens / Philippians", color: "#c8960f",
  },
  {
    ref:  { fr: "Psaumes 23:1",     ht: "Sòm 23:1",         en: "Psalm 23:1",         es: "Salmos 23:1"       },
    text: { fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen — mwen p ap manke anyen.", en: "The Lord is my shepherd — I lack nothing.", es: "El Señor es mi pastor — nada me faltará." },
    book: "Psaumes / Psalms", color: "#1a3568",
  },
  {
    ref:  { fr: "Ésaïe 40:31",     ht: "Ezayi 40:31",      en: "Isaiah 40:31",       es: "Isaías 40:31"      },
    text: { fr: "Ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.", ht: "Moun ki espere nan Seyè a va ranplase fòs yo. Y ap leve zèl yo tankou malfini.", en: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles.", es: "Los que esperan en el Señor renovarán sus fuerzas. Se elevarán con alas como las águilas." },
    book: "Ésaïe / Isaiah", color: "#ec4899",
  },
  {
    ref:  { fr: "Matthieu 11:28",   ht: "Matye 11:28",      en: "Matthew 11:28",      es: "Mateo 11:28"       },
    text: { fr: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", ht: "Vini jwenn mwen, nou tout ki fatige ak ki chaje, m ap ba nou repo.", en: "Come to me, all you who are weary and burdened, and I will give you rest.", es: "Vengan a mí todos los que están fatigados y cargados, y yo les daré descanso." },
    book: "Matthieu / Matthew", color: "#f59e0b",
  },
  {
    ref:  { fr: "Romains 8:28",     ht: "Women 8:28",       en: "Romans 8:28",        es: "Romanos 8:28"      },
    text: { fr: "Toutes choses concourent au bien de ceux qui aiment Dieu et qui sont appelés selon son dessein.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye, moun ki rele dapre plan li.", en: "In all things God works for the good of those who love him, who have been called according to his purpose.", es: "En todas las cosas Dios obra para el bien de los que le aman, los que han sido llamados según su propósito." },
    book: "Romains / Romans", color: "#06b6d4",
  },
];

const BOOK_CATEGORIES = {
  OT: [
    { label: { fr: "Pentateuque", ht: "Pentatch", en: "Pentateuch", es: "Pentateuco" }, slugs: ["genese","exode","levitique","nombres","deuteronome"], color: "#c8960f" },
    { label: { fr: "Histoire",    ht: "Istwa",    en: "History",    es: "Historia"   }, slugs: ["josue","juges","ruth","1-samuel","2-samuel","1-rois","2-rois","1-chroniques","2-chroniques","esdras","nehemie","esther"], color: "#f59e0b" },
    { label: { fr: "Poésie",      ht: "Pwezi",    en: "Poetry",     es: "Poesía"     }, slugs: ["job","psaumes","proverbes","ecclesiaste","cantique-des-cantiques"], color: "#1a3568" },
    { label: { fr: "Prophètes",   ht: "Profèt",   en: "Prophets",   es: "Profetas"   }, slugs: ["esaie","jeremie","lamentations","ezechiel","daniel","osee","joel","amos","abdias","jonas","michee","nahum","habacuc","sophonie","aggee","zacharie","malachie"], color: "#3b82f6" },
  ],
  NT: [
    { label: { fr: "Évangiles",   ht: "Levanjil", en: "Gospels",    es: "Evangelios" }, slugs: ["matthieu","marc","luc","jean"], color: "#34d399" },
    { label: { fr: "Histoire",    ht: "Istwa",    en: "History",    es: "Historia"   }, slugs: ["actes"], color: "#f59e0b" },
    { label: { fr: "Épîtres",     ht: "Epît",     en: "Epistles",   es: "Epístolas"  }, slugs: ["romains","1-corinthiens","2-corinthiens","galates","ephesiens","philippiens","colossiens","1-thessaloniciens","2-thessaloniciens","1-timothee","2-timothee","tite","philemon","hebreux","jacques","1-pierre","2-pierre","1-jean","2-jean","3-jean","jude"], color: "#3b82f6" },
    { label: { fr: "Prophétie",   ht: "Pwofesi",  en: "Prophecy",   es: "Profecía"   }, slugs: ["apocalypse"], color: "#ec4899" },
  ],
};

export default function BiblePage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [tab, setTab] = useState<"OT" | "NT">("OT");
  const [slideIdx, setSlideIdx] = useState(0);
  const [slideAnim, setSlideAnim] = useState<"in" | "out">("in");
  const [tabVisible, setTabVisible] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTabVisible(true); }, { threshold: 0.05 });
    if (tabRef.current) obs.observe(tabRef.current);
    return () => obs.disconnect();
  }, []);

  const goToSlide = useCallback((idx: number) => {
    setSlideAnim("out");
    setTimeout(() => { setSlideIdx(idx); setSlideAnim("in"); }, 320);
  }, []);

  const nextSlide = useCallback(() => goToSlide((slideIdx + 1) % FEATURED_VERSES.length), [slideIdx, goToSlide]);
  const prevSlide = useCallback(() => goToSlide((slideIdx - 1 + FEATURED_VERSES.length) % FEATURED_VERSES.length), [slideIdx, goToSlide]);

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [nextSlide]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 5000);
  }, [nextSlide]);

  const verse = FEATURED_VERSES[slideIdx];
  const filtered = bibleBooks.filter(b => b.testament === tab);
  const categories = BOOK_CATEGORIES[tab];

  return (
    <main style={{ background: "linear-gradient(180deg, #0a1836 0%, #12275e 50%, #0a1836 100%)", minHeight: "100vh", color: "#fff" }}>

      <style>{`
        @keyframes bible-aurora {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes float-b {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-out-up {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes fade-up-b {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cross-pulse {
          0%,100% { opacity: 0.15; transform: scale(1); }
          50%      { opacity: 0.28; transform: scale(1.06); }
        }
        @keyframes shimmer-b {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes bar-in {
          from { width: 0; }
          to   { width: var(--w); }
        }
        .book-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s ease, box-shadow 0.25s ease; }
        .book-card:hover { transform: translateY(-5px) scale(1.02) !important; }
        .tab-btn { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
      `}</style>

      {/* ══════ HERO ══════ */}
      <div style={{ position: "relative", overflow: "hidden", paddingBottom: 0 }}>

        {/* Aurora bg */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #030d1a 0%, #061428 40%, #030d22 70%, #030d1a 100%)", backgroundSize: "400% 400%", animation: "bible-aurora 14s ease infinite", pointerEvents: "none" }} />
        <HeroBackdrop image="/hero/bible.jpg" tint="dark" />
        {/* Glow top */}
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 800, height: 400, borderRadius: "50%", background: "rgba(96,165,250,0.12)", filter: "blur(100px)", pointerEvents: "none", animation: "float-b 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "30%", right: "5%", width: 250, height: 250, borderRadius: "50%", background: "rgba(26,53,104,0.08)", filter: "blur(70px)", pointerEvents: "none", animation: "float-b 8s ease-in-out infinite 2s" }} />

        {/* Croix décorative géante */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#60a5fa", opacity: 0.04, pointerEvents: "none", animation: "cross-pulse 6s ease-in-out infinite", userSelect: "none", lineHeight: 1 }}><Icon name="croix" size={300} /></div>

        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(96,165,250,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.03) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.25)",
            borderRadius: 999, padding: "6px 18px", marginBottom: 28,
            opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(-16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block", animation: "cross-pulse 2s ease-in-out infinite" }} />
            <Icon name="bible" size={12} color="#60a5fa" />
            <span style={{ fontSize: 11, color: "#60a5fa", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {l === "fr" ? "La Sainte Bible" : l === "ht" ? "Bib Sen an" : l === "es" ? "La Santa Biblia" : "The Holy Bible"}
            </span>
          </div>

          {/* Titre */}
          <h1 style={{
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 16,
            background: "linear-gradient(135deg, #fff 0%, #60a5fa 50%, #fff 100%)",
            backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "bible-aurora 6s ease infinite",
            opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}>
            {l === "fr" ? "La Bible" : l === "ht" ? "Bib la" : l === "es" ? "La Biblia" : "The Bible"}
          </h1>

          {/* Stats bar */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 52,
            opacity: heroReady ? 1 : 0, transition: "opacity 0.7s ease 0.4s",
          }}>
            {[
              { val: "66",   label: { fr: "Livres", ht: "Liv", en: "Books", es: "Libros" } },
              { val: "1189", label: { fr: "Chapitres", ht: "Chapit", en: "Chapters", es: "Capítulos" } },
              { val: "4",    label: { fr: "Langues", ht: "Lang", en: "Languages", es: "Idiomas" } },
              { val: "2",    label: { fr: "Testaments", ht: "Testaman", en: "Testaments", es: "Testamentos" } },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, color: "#60a5fa", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3, fontWeight: 600, letterSpacing: "0.08em" }}>{s.label[l]}</div>
              </div>
            ))}
          </div>

          {/* ══ CAROUSEL DE VERSETS ══ */}
          <div style={{
            position: "relative", background: "linear-gradient(150deg, #2563eb1a 0%, rgba(255,255,255,0.04) 60%)", border: "1px solid rgba(255,255,255,0.10)", borderTop: "3px solid #2563eb",
            borderRadius: 20, padding: "40px 48px", maxWidth: 760, margin: "0 auto", overflow: "hidden",
            opacity: heroReady ? 1 : 0, transition: "opacity 0.8s ease 0.5s",
          }}>
            {/* Shimmer */}
            <div style={{ position: "absolute", top: 0, left: "-100%", width: "50%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.07), transparent)", animation: "shimmer-b 4s ease-in-out infinite 1s", pointerEvents: "none" }} />

            {/* Color accent strip */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${verse.color}, transparent)`, transition: "background 0.5s ease" }} />

            {/* Verse content */}
            <div style={{ animation: slideAnim === "in" ? "slide-in-up 0.35s cubic-bezier(0.16,1,0.3,1)" : "slide-out-up 0.32s ease" }}>
              <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: verse.color, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20, transition: "color 0.4s ease" }}>
                <Icon name="etincelles" size={11} color={verse.color} /> {l === "fr" ? "Verset mis en avant" : l === "ht" ? "Vèsè prensipal" : l === "es" ? "Versículo destacado" : "Featured verse"}
              </p>
              <blockquote style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)", color: "rgba(255,255,255,0.88)", lineHeight: 1.85, fontStyle: "italic", marginBottom: 20, minHeight: 80 }}>
                &ldquo;{verse.text[l]}&rdquo;
              </blockquote>
              <p style={{ color: verse.color, fontWeight: 800, fontSize: 14, transition: "color 0.4s ease" }}>— {verse.ref[l]}</p>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
              <button onClick={() => { prevSlide(); resetTimer(); }} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.20)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}><Icon name="chevron_gauche" size={18} /></button>

              {/* Dots */}
              <div style={{ display: "flex", gap: 6 }}>
                {FEATURED_VERSES.map((v, i) => (
                  <button key={i} onClick={() => { goToSlide(i); resetTimer(); }} style={{ width: i === slideIdx ? 24 : 8, height: 8, borderRadius: 999, background: i === slideIdx ? verse.color : "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)" }} />
                ))}
              </div>

              <button onClick={() => { nextSlide(); resetTimer(); }} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.20)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}><Icon name="chevron_droite" size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ GRILLE DES LIVRES ══════ */}
      <div ref={tabRef} style={{ maxWidth: 960, margin: "0 auto", padding: "16px 24px 80px" }}>

        {/* Testament tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 40, marginTop: 12 }}>
          {(["OT", "NT"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="tab-btn" style={{
              padding: "10px 28px", borderRadius: 999, fontWeight: 800, fontSize: 14, cursor: "pointer", border: "none",
              background: tab === t ? "linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)" : "rgba(255,255,255,0.06)",
              color: tab === t ? "#fff" : "rgba(255,255,255,0.50)",
              boxShadow: tab === t ? "0 4px 24px rgba(59,130,246,0.35)" : "none",
              outline: tab !== t ? "1px solid rgba(255,255,255,0.10)" : "none",
            }}>
              {t === "OT"
                ? (l === "fr" ? "Ancien Testament" : l === "ht" ? "Ansyen Testaman" : l === "es" ? "Antiguo Testamento" : "Old Testament") + " (39)"
                : (l === "fr" ? "Nouveau Testament" : l === "ht" ? "Nouvo Testaman" : l === "es" ? "Nuevo Testamento" : "New Testament") + " (27)"}
            </button>
          ))}
        </div>

        {/* Books by category */}
        {categories.map((cat, ci) => {
          const catBooks = filtered.filter(b => cat.slugs.includes(b.slug));
          if (catBooks.length === 0) return null;
          return (
            <div key={ci} style={{ marginBottom: 36 }}>
              {/* Category header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
                opacity: tabVisible ? 1 : 0, transform: tabVisible ? "translateX(0)" : "translateX(-20px)",
                transition: `opacity 0.5s ease ${ci * 0.08}s, transform 0.5s ease ${ci * 0.08}s`,
              }}>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${cat.color}40, transparent)` }} />
                <span style={{ fontSize: 11, color: cat.color, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {cat.label[l]} · {catBooks.length}
                </span>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${cat.color}40)` }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                {catBooks.map((book, bi) => (
                  <Link key={book.id} href={`/bible/${book.slug}/1`} className="book-card" style={{
                    display: "block", padding: "14px 16px", borderRadius: 16,
                    textDecoration: "none", position: "relative", overflow: "hidden",
                    background: `linear-gradient(150deg, ${cat.color}1a 0%, rgba(255,255,255,0.04) 60%)`, border: `1px solid rgba(255,255,255,0.10)`, borderTop: `3px solid ${cat.color}`,
                    opacity: tabVisible ? 1 : 0,
                    transform: tabVisible ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.45s ease ${(ci * 0.05) + bi * 0.03}s, transform 0.45s cubic-bezier(0.16,1,0.3,1) ${(ci * 0.05) + bi * 0.03}s`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `${cat.color}55`;
                    el.style.boxShadow = `0 8px 24px ${cat.color}22`;
                    el.style.background = `linear-gradient(150deg, ${cat.color}26 0%, rgba(255,255,255,0.06) 60%)`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `rgba(255,255,255,0.10)`;
                    el.style.boxShadow = "none";
                    el.style.background = `linear-gradient(150deg, ${cat.color}1a 0%, rgba(255,255,255,0.04) 60%)`;
                  }}>
                    {/* Glow corner */}
                    <div style={{ position: "absolute", top: -12, right: -12, width: 40, height: 40, borderRadius: "50%", background: cat.color, opacity: 0.07, filter: "blur(12px)", pointerEvents: "none" }} />
                    <h3 style={{ fontWeight: 700, color: "#fff", fontSize: "0.88rem", marginBottom: 4, lineHeight: 1.3 }}>
                      {book.name[l] || book.name.fr}
                    </h3>
                    <p style={{ fontSize: 11, color: cat.color, fontWeight: 600, opacity: 0.8 }}>
                      {book.chapters} {l === "fr" ? "ch." : l === "ht" ? "ch." : l === "es" ? "cap." : "ch."}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* Quick access — livres populaires */}
        <div style={{
          marginTop: 20, padding: "32px 28px", borderRadius: 20,
          background: "linear-gradient(150deg, #2563eb1a 0%, rgba(255,255,255,0.04) 60%)", border: "1px solid rgba(255,255,255,0.10)", borderTop: "3px solid #2563eb",
          opacity: tabVisible ? 1 : 0, transition: "opacity 0.6s ease 0.5s",
        }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#3b82f6", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>
            <Icon name="etoile" size={11} color="#3b82f6" /> {l === "fr" ? "Livres populaires" : l === "ht" ? "Liv ki popular" : l === "es" ? "Libros populares" : "Popular books"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { slug: "psaumes",      name: { fr: "Psaumes",     ht: "Sòm",       en: "Psalms",     es: "Salmos"     } },
              { slug: "jean",         name: { fr: "Jean",         ht: "Jan",        en: "John",       es: "Juan"       } },
              { slug: "proverbes",    name: { fr: "Proverbes",    ht: "Pwovèb",     en: "Proverbs",   es: "Proverbios" } },
              { slug: "matthieu",     name: { fr: "Matthieu",     ht: "Matye",      en: "Matthew",    es: "Mateo"      } },
              { slug: "genese",       name: { fr: "Genèse",       ht: "Jenèz",      en: "Genesis",    es: "Génesis"    } },
              { slug: "romains",      name: { fr: "Romains",      ht: "Women",      en: "Romans",     es: "Romanos"    } },
              { slug: "apocalypse",   name: { fr: "Apocalypse",   ht: "Revelasyon", en: "Revelation", es: "Apocalipsis"} },
              { slug: "esaie",        name: { fr: "Ésaïe",        ht: "Ezayi",      en: "Isaiah",     es: "Isaías"     } },
            ].map(b => (
              <Link key={b.slug} href={`/bible/${b.slug}/1`} style={{
                display: "inline-block", padding: "7px 16px", borderRadius: 999,
                background: "rgba(37,99,235,0.14)", border: "1px solid rgba(59,130,246,0.35)",
                color: "#3b82f6", fontWeight: 700, fontSize: 13, textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.28)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.14)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                {b.name[l]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
