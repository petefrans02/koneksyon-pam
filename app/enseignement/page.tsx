"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";

type Lang = "fr" | "ht" | "en";

const series = [
  {
    tag: { fr: "Doctrine", ht: "Doktrin", en: "Doctrine" },
    fr: { title: "La nature de Dieu", desc: "Une série de 5 messages sur la trinité, la sainteté et la souveraineté de Dieu." },
    ht: { title: "Nati Bondye a", desc: "Yon seri 5 mesaj sou trinite, sentete ak souverènte Bondye." },
    en: { title: "The Nature of God", desc: "A 5-message series on the Trinity, holiness and sovereignty of God." },
    count: 5,
  },
  {
    tag: { fr: "Vie Chrétienne", ht: "Lavi Kretyen", en: "Christian Life" },
    fr: { title: "Vivre par la foi", desc: "Comment marcher par la foi dans les décisions quotidiennes et les temps d'incertitude." },
    ht: { title: "Viv pa lafwa", desc: "Kijan pou mache pa lafwa nan desizyon chak jou ak nan moman enkertitid." },
    en: { title: "Living by Faith", desc: "How to walk by faith in daily decisions and times of uncertainty." },
    count: 4,
  },
  {
    tag: { fr: "Prière", ht: "Lapriyè", en: "Prayer" },
    fr: { title: "L'école de la prière", desc: "Les fondements bibliques d'une vie de prière efficace et persévérante." },
    ht: { title: "Lekòl lapriyè a", desc: "Fondasyon biblik yon lavi lapriyè ki efikas ak pèseveran." },
    en: { title: "School of Prayer", desc: "The biblical foundations of an effective and persevering prayer life." },
    count: 6,
  },
  {
    tag: { fr: "Évangile", ht: "Levanjil", en: "Gospel" },
    fr: { title: "Le message de la croix", desc: "Pourquoi la crucifixion est le centre de toute la théologie chrétienne." },
    ht: { title: "Mesaj kwa a", desc: "Poukisa krisifiksyon an se sant tout teyoloji kretyen." },
    en: { title: "The Message of the Cross", desc: "Why the crucifixion is the center of all Christian theology." },
    count: 3,
  },
  {
    tag: { fr: "Famille", ht: "Fanmi", en: "Family" },
    fr: { title: "Construire un foyer chrétien", desc: "Principes bibliques pour le mariage, la parentalité et les relations familiales." },
    ht: { title: "Bati yon kay kretyen", desc: "Prensip biblik pou maryaj, paran ak relasyon fanmi." },
    en: { title: "Building a Christian Home", desc: "Biblical principles for marriage, parenting and family relationships." },
    count: 7,
  },
  {
    tag: { fr: "Prophétie", ht: "Pwofesi", en: "Prophecy" },
    fr: { title: "Les temps de la fin", desc: "Une étude sérieuse des textes eschatologiques sans sensationnalisme." },
    ht: { title: "Tan lafen yo", desc: "Yon etid serye tèks eschatologik san sensasyonalis." },
    en: { title: "The End Times", desc: "A serious study of eschatological texts without sensationalism." },
    count: 8,
  },
];

export default function EnseignementPage() {
  const { lang } = useLang();
  const l = (["fr", "ht", "en"].includes(lang) ? lang : "fr") as Lang;

  const txt = {
    label: l === "fr" ? "Enseignement" : l === "ht" ? "Ansèyman" : "Teaching",
    headline:
      l === "fr" ? "Des messages qui édifient."
      : l === "ht" ? "Mesaj ki bati."
      : "Messages that build up.",
    sub:
      l === "fr" ? "Séries bibliques, messages doctrinaux et enseignements pratiques pour votre croissance spirituelle."
      : l === "ht" ? "Seri biblik, mesaj doktrinal ak ansèyman pratik pou kwasans espirityèl ou."
      : "Bible series, doctrinal messages and practical teachings for your spiritual growth.",
    seriesLabel: l === "fr" ? "Séries disponibles" : l === "ht" ? "Seri disponib" : "Available Series",
    messages: l === "fr" ? "messages" : l === "ht" ? "mesaj" : "messages",
    listen: l === "fr" ? "Écouter la série" : l === "ht" ? "Koute seri a" : "Listen to series",
    groupCTA: l === "fr" ? "Vous êtes pasteur ou enseignant ?" : l === "ht" ? "Ou se pastè oswa ansegnant ?" : "Are you a pastor or teacher?",
    groupSub:
      l === "fr" ? "Créez un groupe d'église et partagez vos enseignements directement avec votre communauté."
      : l === "ht" ? "Kreye yon gwoup legliz epi pataje ansèyman ou yo dirèkteman ak kominote ou a."
      : "Create a church group and share your teachings directly with your community.",
    groupBtn: l === "fr" ? "Créer mon groupe" : l === "ht" ? "Kreye gwoup mwen" : "Create my group",
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-[#0b0f1a] px-5 sm:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.25em] mb-6">
            {txt.label}
          </p>
          <h1 className="text-white font-black text-3xl sm:text-5xl leading-tight mb-4">
            {txt.headline}
          </h1>
          <p className="text-white/40 text-base leading-relaxed max-w-xl">
            {txt.sub}
          </p>
        </div>
      </div>

      {/* Series grid */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
        <p className="text-[#0b0f1a]/40 text-[10px] font-bold uppercase tracking-[0.25em] mb-10">
          {txt.seriesLabel}
        </p>
        <div className="flex flex-col divide-y divide-stone-100">
          {series.map((s, i) => (
            <div key={i} className="py-7 flex flex-col sm:flex-row sm:items-center gap-4 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a84f] border border-[#c5a84f]/30 px-2 py-0.5 rounded">
                    {s.tag[l]}
                  </span>
                  <span className="text-stone-300 text-xs">{s.count} {txt.messages}</span>
                </div>
                <p className="text-[#0b0f1a] font-bold text-base mb-1">{s[l].title}</p>
                <p className="text-stone-400 text-sm leading-relaxed">{s[l].desc}</p>
              </div>
              <button className="shrink-0 border border-stone-200 text-stone-500 hover:border-[#0b0f1a] hover:text-[#0b0f1a] px-5 py-2.5 rounded-full text-xs font-semibold transition-all">
                {txt.listen}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA for pastors */}
      <div className="bg-[#f8f6f2] px-5 sm:px-8 py-16">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-[#0b0f1a] font-black text-lg mb-2">{txt.groupCTA}</p>
            <p className="text-stone-400 text-sm leading-relaxed">{txt.groupSub}</p>
          </div>
          <Link
            href="/eglise/creer"
            className="shrink-0 bg-[#0b0f1a] text-white px-7 py-3 rounded-full text-sm font-bold hover:bg-[#131926] transition-colors"
          >
            {txt.groupBtn}
          </Link>
        </div>
      </div>

    </div>
  );
}
