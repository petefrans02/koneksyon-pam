"use client";

import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import LangSwitch from "./LangSwitch";
import AuthButton from "./AuthButton";
import Link from "next/link";

export default function NavBar() {
  const { lang } = useLang();
  const louange = lang === "fr" ? "Louange" : lang === "ht" ? "Lwanj" : "Praise";
  return (
    <nav className="bg-gradient-to-r from-[#0a1628] via-[#0f2044] to-[#0a1628] px-4 py-3 sticky top-0 z-50 shadow-xl border-b border-blue-900/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo-kp.png" alt="KP" className="w-11 h-11 rounded-xl group-hover:scale-105 transition-transform" />
          <div className="hidden sm:block">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">KONEKSYON PAM</span>
            <p className="text-[10px] text-blue-400/60 -mt-0.5 tracking-widest">UNE MISSION • UN DIEU</p>
          </div>
          <span className="sm:hidden text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">KP</span>
        </Link>
        <div className="hidden sm:flex items-center gap-1">
          {[
            { href: "/psaumes", label: t("psalms", lang) },
            { href: "/prieres", label: t("prayers", lang) },
            { href: "/temoignages", label: t("testimonies", lang) },
            { href: "/louange", label: louange },
            { href: "/quiz", label: "Quiz" },
            { href: "/etude", label: lang === "fr" ? "Études" : lang === "ht" ? "Etid" : "Studies" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-blue-200/70 hover:text-white hover:bg-blue-500/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LangSwitch />
          <AuthButton />
        </div>
      </div>
      <div className="sm:hidden flex justify-center gap-3 mt-2">
        {[
          { href: "/psaumes", label: t("psalms", lang) },
          { href: "/prieres", label: t("prayers", lang) },
          { href: "/temoignages", label: t("testimonies", lang) },
          { href: "/louange", label: louange },
          { href: "/quiz", label: "Quiz" },
          { href: "/etude", label: lang === "fr" ? "Études" : lang === "ht" ? "Etid" : "Studies" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-blue-300/60 hover:text-cyan-300 text-xs font-medium transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
