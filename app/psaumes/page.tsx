"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { useState } from "react";

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

// Generate all 150 psalms
const allPsalms = Array.from({ length: 150 }, (_, i) => i + 1);

export default function PsaumesPage() {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [verseText, setVerseText] = useState<string>("");
  const [translationName, setTranslationName] = useState<string>("");
  const [aiStudy, setAiStudy] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  async function loadPsalm(num: number) {
    if (expanded === num) {
      setExpanded(null);
      return;
    }
    setExpanded(num);
    setLoading(num);
    try {
      const res = await fetch(`/api/psalm?num=${num}&lang=${lang}`);
      const data = await res.json();
      setVerseText(data.text || "");
      setTranslationName(data.translation || "");
    } catch {
      setVerseText("");
      setTranslationName("");
    }
    setLoading(null);
  }

  const title = psalmTitles;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">{t("psalms", lang)}</h1>
      <p className="text-stone-500 mb-2">
        {lang === "fr" ? "Les 150 Psaumes de la Bible" : lang === "ht" ? "150 Sòm Bib la" : "All 150 Psalms of the Bible"}
      </p>
      <p className="text-sm text-blue-500 mb-8">
        {lang === "fr" ? "Cliquez sur un Psaume pour le lire" : lang === "ht" ? "Klike sou yon Sòm pou li l" : "Click a Psalm to read it"}
      </p>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-10">
        {allPsalms.map((num) => (
          <button
            key={num}
            onClick={() => loadPsalm(num)}
            className={`h-10 rounded-lg text-sm font-bold transition-all ${
              expanded === num
                ? "bg-blue-600 text-white shadow-lg"
                : title[num]
                ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {expanded && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-md mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              {expanded}
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-xl">
                {t("psalms", lang)} {expanded}
              </h3>
              {title[expanded] && (
                <p className="text-amber-600 text-sm">{title[expanded][lang]}</p>
              )}
            </div>
          </div>

          {loading === expanded ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : verseText ? (
            <>
              <blockquote className="text-stone-700 leading-relaxed whitespace-pre-line italic">
                {verseText}
              </blockquote>
              {translationName && (
                <p className="text-xs text-amber-600 mt-3 font-medium">📖 {translationName}</p>
              )}
            </>
          ) : (
            <p className="text-stone-400 text-center py-4">
              {lang === "fr" ? "Texte non disponible" : lang === "ht" ? "Tèks pa disponib" : "Text not available"}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={async () => {
                if (aiStudy) { setAiStudy(""); return; }
                setAiLoading(true);
                const res = await fetch("/api/ask", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    question: `Fais un résumé et une étude approfondie du Psaume ${expanded}. Explique le contexte historique, les thèmes principaux, et comment l'appliquer dans notre vie aujourd'hui.`,
                    lang,
                  }),
                });
                const data = await res.json();
                setAiStudy(data.answer || "");
                setAiLoading(false);
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {aiLoading ? "..." : aiStudy ? "✕ Fermer l'étude" : `🕊️ ${lang === "fr" ? "Étude approfondie (IA)" : lang === "ht" ? "Etid apwofondi (IA)" : "Deep study (AI)"}`}
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${t("psalms", lang)} ${expanded}`,
                    text: verseText.slice(0, 200),
                    url: window.location.href,
                  });
                }
              }}
              className="bg-stone-100 text-stone-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              ↗ {t("share", lang)}
            </button>
          </div>

          {aiLoading && (
            <div className="mt-6 flex items-center gap-3 text-blue-500">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">{lang === "fr" ? "L'IA analyse ce Psaume..." : lang === "ht" ? "IA ap analize Sòm sa a..." : "AI is analyzing this Psalm..."}</span>
            </div>
          )}

          {aiStudy && (
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🕊️</span>
                <h4 className="font-bold text-blue-800 text-sm">
                  {lang === "fr" ? "Étude approfondie — Psaume" : lang === "ht" ? "Etid pwofon — Sòm" : "Deep study — Psalm"} {expanded}
                </h4>
              </div>
              <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {aiStudy.replace(/\*\*(.*?)\*\*/g, "$1").replace(/["«»]/g, "")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
