"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { featuredPsalms } from "@/lib/psalms-data";
import Link from "next/link";
import BibleQuiz from "./components/BibleQuiz";
import { useCountry } from "@/lib/useCountry";

function VerseOfDay() {
  const { lang } = useLang();
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const psalm = featuredPsalms[dayOfYear % featuredPsalms.length];

  return (
    <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
          {t("verseOfDay", lang)}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          {t("psalms", lang)} {psalm.number}
        </h2>
        <p className="text-amber-300 text-sm mb-6">{psalm.title[lang]}</p>
        <blockquote className="text-lg sm:text-xl leading-relaxed text-stone-200 italic max-w-2xl mx-auto mb-8">
          &ldquo;{psalm.text[lang]}&rdquo;
        </blockquote>
        <div className="flex justify-center gap-3">
          <Link
            href="/psaumes"
            className="bg-amber-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-amber-500 transition-colors"
          >
            {t("psalms", lang)} →
          </Link>
          <button className="bg-white/10 text-white px-6 py-2.5 rounded-full font-medium hover:bg-white/20 transition-colors">
            {t("share", lang)} ↗
          </button>
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  const { lang } = useLang();
  const links = [
    {
      href: "/psaumes",
      icon: "📖",
      label: t("psalms", lang),
      desc: lang === "fr" ? "150 Psaumes en 4 langues" : lang === "ht" ? "150 Sòm nan 4 lang" : lang === "es" ? "150 Salmos en 4 idiomas" : "150 Psalms in 4 languages",
      color: "from-amber-500 to-amber-600",
    },
    {
      href: "/prieres",
      icon: "🙏",
      label: t("prayers", lang),
      desc: lang === "fr" ? "Priez ensemble" : lang === "ht" ? "Priye ansanm" : lang === "es" ? "Oren juntos" : "Pray together",
      color: "from-blue-500 to-blue-600",
    },
    {
      href: "/temoignages",
      icon: "✨",
      label: t("testimonies", lang),
      desc: lang === "fr" ? "Partagez votre histoire" : lang === "ht" ? "Pataje istwa ou" : lang === "es" ? "Comparte tu historia" : "Share your story",
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <span className="text-4xl block mb-3">{link.icon}</span>
            <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-amber-600 transition-colors">
              {link.label}
            </h3>
            <p className="text-sm text-stone-500">{link.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ConnectedWorld() {
  const { lang } = useLang();
  const countries = [
    "🇺🇸", "🇭🇹", "🇫🇷", "🇨🇦", "🇧🇷", "🇬🇧", "🇩🇴", "🇨🇱",
    "🇧🇪", "🇨🇭", "🇲🇽", "🇨🇲",
  ];

  return (
    <section className="bg-stone-900 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
          🌍 {countries.length} {t("countries", lang)}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {countries.map((flag, i) => (
            <span key={i} className="text-3xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
              {flag}
            </span>
          ))}
        </div>
        <p className="text-stone-400 text-sm">
          {lang === "fr"
            ? "Des frères et sœurs du monde entier connectés en prière"
            : lang === "ht"
            ? "Frè ak sè nan mond lan konekte nan lapriyè"
            : "Brothers and sisters around the world connected in prayer"}
        </p>
      </div>
    </section>
  );
}

function RecentPrayers() {
  const { lang } = useLang();
  const prayers = [
    {
      name: "Marie L.",
      text: lang === "fr" ? "Priez pour ma famille en Haïti..." : lang === "ht" ? "Priye pou fanmi m an Ayiti..." : "Pray for my family in Haiti...",
      count: 47,
      time: "2h",
    },
    {
      name: "Jean P.",
      text: lang === "fr" ? "Mon fils est malade, priez pour sa guérison..." : lang === "ht" ? "Pitit gason m malad, priye pou l geri..." : "My son is sick, pray for his healing...",
      count: 123,
      time: "5h",
    },
    {
      name: t("anonymous", lang),
      text: lang === "fr" ? "Je cherche un emploi depuis 6 mois..." : lang === "ht" ? "M ap chèche travay depi 6 mwa..." : "I've been looking for a job for 6 months...",
      count: 89,
      time: "8h",
    },
  ];

  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-stone-900">{t("prayers", lang)}</h2>
        <Link href="/prieres" className="text-amber-600 text-sm font-medium hover:underline">
          {lang === "fr" ? "Voir tout" : lang === "ht" ? "Wè tout" : lang === "es" ? "Ver todo" : "See all"} →
        </Link>
      </div>
      <div className="space-y-3">
        {prayers.map((prayer, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-semibold text-stone-900">{prayer.name}</span>
                <span className="text-stone-400 text-xs ml-2">· {prayer.time}</span>
              </div>
            </div>
            <p className="text-stone-600 text-sm mb-3">{prayer.text}</p>
            <div className="flex items-center justify-between">
              <button className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors">
                {t("prayerButton", lang)}
              </button>
              <span className="text-xs text-stone-400">
                {prayer.count} {t("peoplePrayed", lang)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <VerseOfDay />
      <QuickLinks />
      <BibleQuiz />
      <RecentPrayers />
      <ConnectedWorld />
    </div>
  );
}
