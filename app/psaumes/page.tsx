"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

const psalmTitles: Record<number, Record<string, string>> = {
  1: { fr: "Heureux l'homme", ht: "Ala yon nonm kontan", en: "Blessed is the man" },
  2: { fr: "Pourquoi les nations s'agitent-elles ?", ht: "Poukisa nasyon yo ap fè kòlè ?", en: "Why do the nations rage?" },
  3: { fr: "Seigneur, combien sont mes adversaires", ht: "Senyè, gade kantite lènmi m yo", en: "Lord, how many are my foes" },
  4: { fr: "Répondez-moi quand je crie", ht: "Reponn mwen lè m rele", en: "Answer me when I call" },
  5: { fr: "Prête l'oreille à mes paroles", ht: "Koute pawòl mwen yo", en: "Give ear to my words" },
  6: { fr: "Ne me punis pas dans ta colère", ht: "Pa pini m nan kòlè ou", en: "Do not rebuke me in your anger" },
  7: { fr: "En toi je me réfugie", ht: "Se nan ou mwen kache", en: "In you I take refuge" },
  8: { fr: "Que ton nom est magnifique", ht: "Ala non ou bèl", en: "How majestic is your name" },
  9: { fr: "Je te louerai de tout mon cœur", ht: "M ap fè lwanj ou ak tout kè m", en: "I will praise you with all my heart" },
  10: { fr: "Pourquoi te tiens-tu éloigné ?", ht: "Poukisa ou rete lwen ?", en: "Why do you stand far off?" },
  11: { fr: "C'est en l'Éternel que je me réfugie", ht: "Se nan Senyè a mwen kache", en: "In the Lord I take refuge" },
  12: { fr: "Sauve, Éternel !", ht: "Sove, Senyè !", en: "Save, O Lord!" },
  13: { fr: "Jusques à quand, Éternel ?", ht: "Jiskilè, Senyè ?", en: "How long, O Lord?" },
  14: { fr: "L'insensé dit : Il n'y a pas de Dieu", ht: "Moun fou di : Pa gen Bondye", en: "The fool says: There is no God" },
  15: { fr: "Qui séjournera dans ta tente ?", ht: "Ki moun k ap rete nan tant ou ?", en: "Who shall dwell in your tent?" },
  16: { fr: "Garde-moi, ô Dieu", ht: "Pwoteje m, O Bondye", en: "Preserve me, O God" },
  17: { fr: "Écoute la justice, Éternel", ht: "Koute jistis, Senyè", en: "Hear a just cause, O Lord" },
  18: { fr: "Je t'aime, ô Éternel, ma force", ht: "Mwen renmen ou, O Senyè, fòs mwen", en: "I love you, O Lord, my strength" },
  19: { fr: "Les cieux racontent la gloire de Dieu", ht: "Syèl la rakonte glwa Bondye", en: "The heavens declare the glory of God" },
  20: { fr: "Que l'Éternel t'exauce au jour de la détresse", ht: "Se pou Senyè a reponn ou lè ou nan tray", en: "May the Lord answer you in the day of trouble" },
  21: { fr: "Le roi se réjouit de ta force", ht: "Wa a kontan pou fòs ou", en: "The king rejoices in your strength" },
  22: { fr: "Mon Dieu, pourquoi m'as-tu abandonné ?", ht: "Bondye mwen, poukisa ou abandone m ?", en: "My God, why have you forsaken me?" },
  23: { fr: "L'Éternel est mon berger", ht: "Senyè a se gadò mwen", en: "The Lord is my shepherd" },
  24: { fr: "La terre appartient à l'Éternel", ht: "Tè a se pou Senyè a", en: "The earth is the Lord's" },
  25: { fr: "Vers toi, Éternel, j'élève mon âme", ht: "Se nan ou, Senyè, mwen leve nanm mwen", en: "To you, O Lord, I lift up my soul" },
  27: { fr: "L'Éternel est ma lumière et mon salut", ht: "Senyè a se limyè mwen ak delivrans mwen", en: "The Lord is my light and my salvation" },
  30: { fr: "Je t'exalte, ô Éternel", ht: "M ap fè lwanj ou, O Senyè", en: "I will extol you, O Lord" },
  31: { fr: "En toi, Éternel, je me réfugie", ht: "Se nan ou, Senyè, mwen kache", en: "In you, O Lord, I take refuge" },
  32: { fr: "Heureux celui dont la transgression est pardonnée", ht: "Ala yon moun kontan, moun Bondye padonnen", en: "Blessed is the one whose transgression is forgiven" },
  34: { fr: "Je bénirai l'Éternel en tout temps", ht: "M ap beni Senyè a tout tan", en: "I will bless the Lord at all times" },
  37: { fr: "Ne t'irrite pas contre les méchants", ht: "Pa fache kont mechan yo", en: "Fret not because of evildoers" },
  40: { fr: "J'ai attendu patiemment l'Éternel", ht: "Mwen te tann Senyè a ak pasyans", en: "I waited patiently for the Lord" },
  42: { fr: "Comme une biche soupire après les eaux", ht: "Tankou yon bich ki swaf dlo", en: "As a deer pants for flowing streams" },
  46: { fr: "Dieu est notre refuge et notre force", ht: "Bondye se refij nou ak fòs nou", en: "God is our refuge and strength" },
  51: { fr: "O Dieu, aie pitié de moi", ht: "O Bondye, gen pitye pou mwen", en: "Have mercy on me, O God" },
  63: { fr: "O Dieu, tu es mon Dieu, je te cherche", ht: "O Bondye, ou se Bondye mwen, m ap chèche ou", en: "O God, you are my God; earnestly I seek you" },
  84: { fr: "Que tes demeures sont aimables", ht: "Ala kay ou yo bèl", en: "How lovely is your dwelling place" },
  90: { fr: "Seigneur, tu as été notre retraite", ht: "Senyè, ou te kote nou kache", en: "Lord, you have been our dwelling place" },
  91: { fr: "Celui qui demeure sous l'abri du Très-Haut", ht: "Moun ki rete anba pwoteksyon Bondye", en: "He who dwells in the shelter of the Most High" },
  95: { fr: "Venez, chantons à l'Éternel", ht: "Vin chante pou Senyè a", en: "Come, let us sing to the Lord" },
  100: { fr: "Poussez vers l'Éternel des cris de joie", ht: "Rele ak kè kontan pou Senyè a", en: "Make a joyful noise to the Lord" },
  103: { fr: "Mon âme, bénis l'Éternel", ht: "Nanm mwen, beni Senyè a", en: "Bless the Lord, O my soul" },
  107: { fr: "Louez l'Éternel, car il est bon", ht: "Fè lwanj Senyè a, paske li bon", en: "Give thanks to the Lord, for he is good" },
  110: { fr: "Parole de l'Éternel à mon Seigneur", ht: "Pawòl Senyè a bay Mèt mwen an", en: "The Lord says to my Lord" },
  118: { fr: "Louez l'Éternel, car il est bon", ht: "Fè lwanj Senyè a, paske li bon", en: "Give thanks to the Lord, for he is good" },
  119: { fr: "Heureux ceux dont la voie est intègre", ht: "Ala moun kontan, moun ki mache dwat", en: "Blessed are those whose way is blameless" },
  121: { fr: "Je lève mes yeux vers les montagnes", ht: "Mwen leve je m gade mòn yo", en: "I lift up my eyes to the hills" },
  122: { fr: "Allons à la maison de l'Éternel", ht: "Ann ale nan kay Senyè a", en: "Let us go to the house of the Lord" },
  125: { fr: "Ceux qui se confient en l'Éternel", ht: "Moun ki mete konfyans nan Senyè a", en: "Those who trust in the Lord" },
  127: { fr: "Si l'Éternel ne bâtit la maison", ht: "Si Senyè a pa bati kay la", en: "Unless the Lord builds the house" },
  130: { fr: "Du fond de l'abîme je t'invoque", ht: "Nan fon twou a mwen rele ou", en: "Out of the depths I cry to you" },
  133: { fr: "Qu'il est bon que des frères habitent ensemble", ht: "Ala sa bon lè frè yo rete ansanm", en: "How good it is when brothers dwell together" },
  136: { fr: "Louez l'Éternel, car sa bonté dure toujours", ht: "Fè lwanj Senyè a, paske bonte l la pou tout tan", en: "Give thanks to the Lord, for his steadfast love endures forever" },
  139: { fr: "Éternel, tu me sondes et tu me connais", ht: "Senyè, ou sonde m epi ou konnen m", en: "O Lord, you have searched me and known me" },
  143: { fr: "Éternel, écoute ma prière", ht: "Senyè, koute lapriyè mwen", en: "Hear my prayer, O Lord" },
  145: { fr: "Je t'exalterai, mon Dieu, mon Roi", ht: "M ap fè lwanj ou, Bondye mwen, Wa mwen", en: "I will extol you, my God and King" },
  146: { fr: "Mon âme, loue l'Éternel", ht: "Nanm mwen, fè lwanj Senyè a", en: "Praise the Lord, O my soul" },
  147: { fr: "Louez l'Éternel ! Car il est beau", ht: "Fè lwanj Senyè a ! Paske li bèl", en: "Praise the Lord! For it is good" },
  148: { fr: "Louez l'Éternel du haut des cieux", ht: "Fè lwanj Senyè a nan syèl la", en: "Praise the Lord from the heavens" },
  149: { fr: "Chantez à l'Éternel un cantique nouveau", ht: "Chante yon chante nèf pou Senyè a", en: "Sing to the Lord a new song" },
  150: { fr: "Louez l'Éternel !", ht: "Lwanj pou Senyè a !", en: "Praise the Lord!" },
};

const FEATURED_PSALMS = [
  { num: 23,  fr: "L'Éternel est mon berger : je ne manquerai de rien.",          ht: "Senyè a se gadò mwen — mwen p ap manke anyen.",        en: "The Lord is my shepherd — I lack nothing.",                es: "El Señor es mi pastor — nada me faltará.",           color: "#60a5fa" },
  { num: 91,  fr: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant.", ht: "Moun ki rete anba pwoteksyon Bondye ap repoze anba lonbraj li.", en: "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty.", es: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.", color: "#7c3aed" },
  { num: 46,  fr: "Dieu est notre refuge et notre force, un secours toujours présent dans la détresse.", ht: "Bondye se refij nou ak fòs nou, yon sekou ki toujou la nan tray.", en: "God is our refuge and strength, an ever-present help in trouble.", es: "Dios es nuestro refugio y fortaleza, nuestro pronto auxilio en las tribulaciones.", color: "#34d399" },
  { num: 139, fr: "Éternel, tu me sondes et tu me connais. Tu sais quand je m'assieds et quand je me lève.", ht: "Senyè, ou sonde m epi ou konnen m. Ou konnen lè m chita ak lè m leve.", en: "O Lord, you have searched me and known me. You know when I sit and when I rise.", es: "Señor, tú me has examinado y me conoces. Sabes cuándo me siento y cuándo me levanto.", color: "#f59e0b" },
  { num: 121, fr: "Je lève mes yeux vers les montagnes. D'où me viendra le secours ? Le secours me vient de l'Éternel.", ht: "Mwen leve je m gade mòn yo. Kote sekou m ap soti ? Sekou mwen soti nan Senyè a.", en: "I lift up my eyes to the hills. Where does my help come from? My help comes from the Lord.", es: "Alzaré mis ojos a los montes. ¿De dónde vendrá mi socorro? Mi socorro viene del Señor.", color: "#ec4899" },
];

const allPsalms = Array.from({ length: 150 }, (_, i) => i + 1);

export default function PsaumesPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [verseText, setVerseText] = useState<string>("");
  const [translationName, setTranslationName] = useState<string>("");
  const [aiStudy, setAiStudy] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [slideAnim, setSlideAnim] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 80); return () => clearTimeout(t); }, []);

  const goToSlide = useCallback((idx: number) => {
    setSlideAnim(false);
    setTimeout(() => { setSlideIdx(idx); setSlideAnim(true); }, 320);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      goToSlide((slideIdx + 1) % FEATURED_PSALMS.length);
    }, 5500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slideIdx, goToSlide]);

  async function loadPsalm(num: number) {
    if (expanded === num) { setExpanded(null); return; }
    setExpanded(num);
    setLoading(num);
    setAiStudy("");
    try {
      const res = await fetch(`/api/psalm?num=${num}&lang=${lang}`);
      const data = await res.json();
      setVerseText(data.text || "");
      setTranslationName(data.translation || "");
    } catch {
      setVerseText(""); setTranslationName("");
    }
    setLoading(null);
  }

  const slide = FEATURED_PSALMS[slideIdx];

  return (
    <main style={{ background: "linear-gradient(180deg, #020b18 0%, #030d1a 100%)", minHeight: "100vh", color: "#fff" }}>

      <style>{`
        @keyframes psalm-aurora {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes dove-float {
          0%,100% { transform: translateY(0) rotate(-3deg); opacity: 0.12; }
          50%      { transform: translateY(-18px) rotate(3deg); opacity: 0.20; }
        }
        @keyframes orb-sky-1 {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-20px) scale(1.07); }
        }
        @keyframes orb-sky-2 {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(-16px); }
        }
        @keyframes slide-psalm-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-psalm-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-14px); }
        }
        @keyframes hero-reveal {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer-ps {
          from { transform: translateX(-100%); }
          to   { transform: translateX(300%); }
        }
        @keyframes grid-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes expand-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ring-blue {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.4); }
        }
        .psalm-btn { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, border-color 0.2s ease; }
        .psalm-btn:hover { transform: scale(1.12) !important; }
      `}</style>

      {/* ══ HERO ══ */}
      <div style={{ position: "relative", overflow: "hidden" }}>

        {/* Aurora céleste */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #020b18 0%, #081428 35%, #040e1c 65%, #020b18 100%)", backgroundSize: "400% 400%", animation: "psalm-aurora 14s ease infinite", pointerEvents: "none" }} />

        {/* Orbes bleu ciel */}
        <div style={{ position: "absolute", top: "-8%", left: "50%", transform: "translateX(-50%)", width: 750, height: 430, borderRadius: "50%", background: "rgba(96,165,250,0.11)", filter: "blur(115px)", animation: "orb-sky-1 9s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "25%", right: "4%", width: 300, height: 300, borderRadius: "50%", background: "rgba(124,58,237,0.07)", filter: "blur(80px)", animation: "orb-sky-2 8s ease-in-out infinite 1.5s", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "6%", width: 250, height: 250, borderRadius: "50%", background: "rgba(96,165,250,0.06)", filter: "blur(70px)", animation: "orb-sky-1 12s ease-in-out infinite 3s", pointerEvents: "none" }} />

        {/* Anneaux */}
        <div style={{ position: "absolute", top: "44%", left: "50%", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(96,165,250,0.10)", animation: "ring-blue 30s linear infinite", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", opacity: 0.8 }} />
        </div>

        {/* Colombes décoratives géantes */}
        <div style={{ position: "absolute", left: "8%", top: "20%", color: "#fff", animation: "dove-float 7s ease-in-out infinite", pointerEvents: "none", userSelect: "none" }}><Icon name="colombe" size={96} /></div>
        <div style={{ position: "absolute", right: "8%", top: "35%", color: "#fff", animation: "dove-float 9s ease-in-out infinite 2s", pointerEvents: "none", userSelect: "none" }}><Icon name="colombe" size={64} /></div>

        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(96,165,250,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.025) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.60), transparent)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.28)", borderRadius: 999, padding: "6px 18px", marginBottom: 24, opacity: heroReady ? 1 : 0, transition: "opacity 0.6s ease 0.1s" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#60a5fa", display: "inline-block", animation: "pulse-dot 1.8s ease-in-out infinite" }} />
            <Icon name="colombe" size={12} color="#60a5fa" />
            <span style={{ fontSize: 11, color: "#60a5fa", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>{l === "fr" ? "Psaumes de David" : l === "ht" ? "Sòm David yo" : l === "es" ? "Salmos de David" : "Psalms of David"}</span>
          </div>

          {/* Titre */}
          <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 16, background: "linear-gradient(135deg, #fff 0%, #93c5fd 50%, #fff 100%)", backgroundSize: "300% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: `psalm-aurora 6s ease infinite, hero-reveal 0.7s ease 0.2s both` }}>
            {l === "fr" ? "150 Psaumes." : l === "ht" ? "150 Sòm." : l === "es" ? "150 Salmos." : "150 Psalms."}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(0.9rem, 1.5vw, 1rem)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.75, opacity: heroReady ? 1 : 0, transition: "opacity 0.7s ease 0.35s" }}>
            {l === "fr" ? "La prière, la louange et l'adoration à travers toute la Bible. Chaque psaume porte une parole vivante." : l === "ht" ? "Lapriyè, lwanj ak adowasyon atravè tout Bib la. Chak sòm pote yon pawòl vivan." : l === "es" ? "La oración, la alabanza y la adoración a través de toda la Biblia. Cada salmo lleva una palabra viva." : "Prayer, praise and worship through the whole Bible. Each psalm carries a living word."}
          </p>

          {/* Psalm quote carousel */}
          <div style={{
            position: "relative", overflow: "hidden",
            background: `${slide.color}08`, border: `1px solid ${slide.color}25`,
            borderRadius: 24, padding: "28px 32px", maxWidth: 640, margin: "0 auto",
            opacity: heroReady ? 1 : 0, transition: `opacity 0.8s ease 0.45s, border-color 0.5s ease, background 0.5s ease`,
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${slide.color}, transparent)`, transition: "background 0.5s ease" }} />
            <div style={{ position: "absolute", top: 0, left: "-100%", width: "50%", height: "100%", background: `linear-gradient(90deg, transparent, ${slide.color}06, transparent)`, animation: "shimmer-ps 5s ease-in-out infinite 2s", pointerEvents: "none" }} />

            <div style={{ animation: slideAnim ? "slide-psalm-in 0.35s ease" : "slide-psalm-out 0.3s ease", minHeight: 76 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${slide.color}20`, border: `1px solid ${slide.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: slide.color, flexShrink: 0 }}>{slide.num}</div>
                <span style={{ fontSize: 11, color: slide.color, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>Psaume {slide.num}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "clamp(0.9rem, 1.4vw, 1.02rem)", fontStyle: "italic", lineHeight: 1.8, textAlign: "left" }}>
                &ldquo;{slide[l]}&rdquo;
              </p>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 18, alignItems: "center" }}>
              {FEATURED_PSALMS.map((p, i) => (
                <button key={i} onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  goToSlide(i);
                }} style={{ width: i === slideIdx ? 22 : 6, height: 6, borderRadius: 999, background: i === slideIdx ? p.color : "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", transition: "all 0.35s ease", padding: 0 }} />
              ))}
              <button onClick={() => loadPsalm(slide.num)} style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: slide.color, background: "transparent", border: "none", cursor: "pointer" }}>
                {l === "fr" ? "Lire →" : l === "ht" ? "Li →" : l === "es" ? "Leer →" : "Read →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ GRID + READER ══ */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "40px 0 20px" }}>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, rgba(96,165,250,0.20), transparent)" }} />
          <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(96,165,250,0.50)", letterSpacing: "0.20em", textTransform: "uppercase" }}>
            {l === "fr" ? "Les 150 Psaumes" : l === "ht" ? "150 Sòm yo" : l === "es" ? "Los 150 Salmos" : "All 150 Psalms"}
          </p>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.20))" }} />
        </div>

        {/* Légende */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.30)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)" }}>{l === "fr" ? "Avec titre" : l === "ht" ? "Ak tit" : l === "es" ? "Con título" : "With title"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.20)" }}>{l === "fr" ? "Tous les psaumes" : l === "ht" ? "Tout sòm yo" : l === "es" ? "Todos los salmos" : "All psalms"}</span>
          </div>
        </div>

        {/* Psalm number grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))", gap: 8, animation: "grid-in 0.6s ease 0.3s both" }}>
          {allPsalms.map((num) => {
            const hasTitle = !!psalmTitles[num];
            const isActive = expanded === num;
            return (
              <button key={num} className="psalm-btn" onClick={() => loadPsalm(num)}
                style={{
                  height: 46, borderRadius: 12, fontSize: 13, fontWeight: isActive ? 900 : hasTitle ? 700 : 600,
                  background: isActive
                    ? "linear-gradient(135deg, #1d4ed8, #60a5fa)"
                    : hasTitle
                    ? "rgba(96,165,250,0.12)"
                    : "rgba(255,255,255,0.04)",
                  border: isActive
                    ? "1px solid rgba(96,165,250,0.70)"
                    : hasTitle
                    ? "1px solid rgba(96,165,250,0.22)"
                    : "1px solid rgba(255,255,255,0.07)",
                  color: isActive ? "#fff" : hasTitle ? "#93c5fd" : "rgba(255,255,255,0.35)",
                  boxShadow: isActive ? "0 4px 20px rgba(59,130,246,0.30)" : "none",
                  cursor: "pointer",
                }}>
                {num}
              </button>
            );
          })}
        </div>

        {/* Expanded psalm reader */}
        {expanded && (
          <div style={{ marginTop: 24, borderRadius: 24, overflow: "hidden", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(96,165,250,0.18)", animation: "expand-in 0.4s ease" }}>
            {/* Header */}
            <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #1d4ed8, #60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.1rem", color: "#fff", flexShrink: 0 }}>{expanded}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 800, color: "#fff", fontSize: "1.1rem", marginBottom: 4 }}>{t("psalms", lang)} {expanded}</h3>
                {psalmTitles[expanded] && (
                  <p style={{ color: "#f59e0b", fontSize: 13, fontStyle: "italic" }}>{psalmTitles[expanded][lang] ?? psalmTitles[expanded]["en"]}</p>
                )}
              </div>
              <button onClick={() => setExpanded(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.40)", cursor: "pointer", flexShrink: 0 }}><Icon name="fermer" size={16} /></button>
            </div>

            {/* Content */}
            <div style={{ padding: "24px 28px" }}>
              {loading === expanded ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid #60a5fa", borderTopColor: "transparent", animation: "grid-in 0.8s linear infinite" }} />
                  <span style={{ color: "rgba(255,255,255,0.30)", fontSize: 13 }}>{l === "fr" ? "Chargement..." : l === "ht" ? "Ap chaje..." : l === "es" ? "Cargando..." : "Loading..."}</span>
                </div>
              ) : verseText ? (
                <>
                  <blockquote style={{ color: "rgba(255,255,255,0.78)", lineHeight: 2, fontStyle: "italic", whiteSpace: "pre-line", fontSize: "0.95rem", marginBottom: 16 }}>
                    {verseText}
                  </blockquote>
                  {translationName && <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#f59e0b", opacity: 0.70 }}><Icon name="verset" size={12} /> {translationName}</p>}
                </>
              ) : (
                <p style={{ color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "24px 0", fontSize: 14 }}>
                  {l === "fr" ? "Texte non disponible" : l === "ht" ? "Tèks pa disponib" : l === "es" ? "Texto no disponible" : "Text not available"}
                </p>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
                <button onClick={async () => {
                  if (aiStudy) { setAiStudy(""); return; }
                  setAiLoading(true);
                  const res = await fetch("/api/ask", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question: `Fais un résumé et une étude approfondie du Psaume ${expanded}. Explique le contexte historique, les thèmes principaux, et comment l'appliquer dans notre vie aujourd'hui.`, lang }),
                  });
                  const data = await res.json();
                  setAiStudy(data.answer || "");
                  setAiLoading(false);
                }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: aiStudy ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #1d4ed8, #60a5fa)", color: "#fff", border: "none", cursor: "pointer" }}>
                  {aiLoading ? "..." : aiStudy ? (
                    <><Icon name="fermer" size={14} /> {l === "fr" ? "Fermer l'étude" : l === "ht" ? "Fèmen etid la" : l === "es" ? "Cerrar" : "Close"}</>
                  ) : (
                    <><Icon name="colombe" size={14} /> {l === "fr" ? "Étude IA" : l === "ht" ? "Etid IA" : l === "es" ? "Estudio IA" : "AI Study"}</>
                  )}
                </button>
                <button onClick={() => {
                  if (navigator.share) navigator.share({ title: `${t("psalms", lang)} ${expanded}`, text: verseText.slice(0, 200), url: window.location.href });
                }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", cursor: "pointer" }}>
                  <Icon name="partage" size={14} /> {t("share", lang)}
                </button>
              </div>

              {aiLoading && (
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, color: "#60a5fa" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #60a5fa", borderTopColor: "transparent" }} />
                  <span style={{ fontSize: 13 }}>{l === "fr" ? "L'IA analyse ce Psaume..." : l === "ht" ? "IA ap analize Sòm sa a..." : l === "es" ? "La IA analiza este Salmo..." : "AI is analyzing this Psalm..."}</span>
                </div>
              )}

              {aiStudy && (
                <div style={{ marginTop: 20, borderRadius: 16, padding: "20px 24px", background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.18)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Icon name="colombe" size={18} color="#93c5fd" />
                    <h4 style={{ fontWeight: 800, color: "#93c5fd", fontSize: 14 }}>{l === "fr" ? "Étude approfondie — Psaume" : l === "ht" ? "Etid pwofon — Sòm" : l === "es" ? "Estudio profundo — Salmo" : "Deep Study — Psalm"} {expanded}</h4>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.68)", lineHeight: 1.85, whiteSpace: "pre-line" }}>
                    {aiStudy.replace(/\*\*(.*?)\*\*/g, "$1").replace(/["«»]/g, "")}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
