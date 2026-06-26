"use client";

import { useLang } from "@/lib/LangContext";
import LangSwitch from "./LangSwitch";
import AuthButton from "./AuthButton";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const path = usePathname();

  const links = [
    { href: "/prieres",      label: lang === "fr" ? "Prière" : lang === "ht" ? "Lapriyè" : "Prayer" },
    { href: "/etude",        label: lang === "fr" ? "Étude" : lang === "ht" ? "Etid" : "Study" },
    { href: "/enseignement", label: lang === "fr" ? "Enseignement" : lang === "ht" ? "Ansèyman" : "Teaching" },
    { href: "/jeu",          label: lang === "fr" ? "Jeux" : lang === "ht" ? "Jwèt" : "Games" },
    { href: "/concours",     label: lang === "fr" ? "Concours" : lang === "ht" ? "Konkou" : "Contest" },
    { href: "/eglise",       label: lang === "fr" ? "Groupes" : lang === "ht" ? "Gwoup" : "Groups" },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">

      {/* Top utility bar */}
      <div className="bg-[#0f2044]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-9 flex items-center justify-between">
          <p className="text-white/50 text-[11px] tracking-wide hidden sm:block">
            {lang === "fr" ? "UNE MISSION · UN DIEU · UNE VISION"
           : lang === "ht" ? "YON MISYON · YON BONDYE · YON VIZYON"
           : "ONE MISSION · ONE GOD · ONE VISION"}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <LangSwitch />
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white border-b-2 border-[#1d4ed8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center gap-8">

          {/* Logo */}
          <Link href="/" onClick={() => setOpen(false)}
            className="flex items-center gap-3 shrink-0 group">
            <img src="/logo-kp.png" alt="KP"
              className="w-10 h-10 rounded-lg group-hover:opacity-85 transition-opacity" />
            <div className="hidden sm:block">
              <p className="text-[#0f2044] font-black text-base leading-tight tracking-tight">KONEKSYON PAM</p>
              <p className="text-[#1d4ed8] text-[9px] font-semibold tracking-[0.18em] uppercase">Plateforme Chrétienne</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {links.map((l) => {
              const active = path === l.href || path?.startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href}
                  className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                    active
                      ? "text-[#1d4ed8] border-[#1d4ed8]"
                      : "text-[#0f2044]/70 border-transparent hover:text-[#1d4ed8] hover:border-[#bfdbfe]"
                  }`}>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg text-[#0f2044]/60 hover:bg-[#eff6ff] transition-colors"
            onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-[#bfdbfe] bg-white px-4 pb-4 pt-2 flex flex-col gap-0.5">
            {links.map((l) => {
              const active = path === l.href || path?.startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    active ? "bg-[#eff6ff] text-[#1d4ed8]" : "text-[#0f2044]/70 hover:bg-[#f8faff]"
                  }`}>
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </header>
  );
}
