"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import LangSwitch from "./LangSwitch";
import Link from "next/link";

export default function NavBar() {
  const { lang } = useLang();
  const louange = lang === "fr" ? "Louange" : lang === "ht" ? "Lwanj" : "Praise";
  return (
    <nav className="bg-gradient-to-r from-stone-900 to-stone-800 px-4 py-3 sticky top-0 z-50 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">✝️</span>
          <span className="text-xl font-bold text-amber-500">KONEKSYON PAM</span>
        </Link>
        <div className="hidden sm:flex items-center gap-5 text-sm">
          <Link href="/psaumes" className="text-stone-300 hover:text-amber-400 transition-colors">
            {t("psalms", lang)}
          </Link>
          <Link href="/prieres" className="text-stone-300 hover:text-amber-400 transition-colors">
            {t("prayers", lang)}
          </Link>
          <Link href="/temoignages" className="text-stone-300 hover:text-amber-400 transition-colors">
            {t("testimonies", lang)}
          </Link>
          <Link href="/louange" className="text-stone-300 hover:text-amber-400 transition-colors">
            {louange}
          </Link>
          <Link href="/quiz" className="text-stone-300 hover:text-amber-400 transition-colors">
            Quiz
          </Link>
          <Link href="/etude" className="text-stone-300 hover:text-amber-400 transition-colors">
            {lang === "fr" ? "Études" : lang === "ht" ? "Etid" : "Studies"}
          </Link>
        </div>
        <LangSwitch />
      </div>
      <div className="sm:hidden flex justify-center gap-4 mt-2 text-xs">
        <Link href="/psaumes" className="text-stone-400 hover:text-amber-400">{t("psalms", lang)}</Link>
        <Link href="/prieres" className="text-stone-400 hover:text-amber-400">{t("prayers", lang)}</Link>
        <Link href="/temoignages" className="text-stone-400 hover:text-amber-400">{t("testimonies", lang)}</Link>
        <Link href="/louange" className="text-stone-400 hover:text-amber-400">{louange}</Link>
        <Link href="/quiz" className="text-stone-400 hover:text-amber-400">Quiz</Link>
        <Link href="/etude" className="text-stone-400 hover:text-amber-400">{lang === "fr" ? "Études" : lang === "ht" ? "Etid" : "Studies"}</Link>
      </div>
    </nav>
  );
}
