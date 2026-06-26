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
    {
      href: "/prieres",
      label: lang === "fr" ? "Prière" : lang === "ht" ? "Lapriyè" : "Prayer",
    },
    {
      href: "/etude",
      label: lang === "fr" ? "Étude" : lang === "ht" ? "Etid" : "Study",
    },
    {
      href: "/enseignement",
      label: lang === "fr" ? "Enseignement" : lang === "ht" ? "Ansèyman" : "Teaching",
    },
    {
      href: "/jeu",
      label: lang === "fr" ? "Jeux" : lang === "ht" ? "Jwèt" : "Games",
    },
    {
      href: "/concours",
      label: lang === "fr" ? "Concours" : lang === "ht" ? "Konkou" : "Contest",
    },
    {
      href: "/eglise",
      label: lang === "fr" ? "Groupes" : lang === "ht" ? "Gwoup" : "Groups",
    },
  ];

  return (
    <nav className="bg-white border-b border-stone-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <img
            src="/logo-kp.png"
            alt="KP"
            className="w-8 h-8 rounded-lg group-hover:opacity-80 transition-opacity"
          />
          <span className="hidden sm:block font-black text-[#0b0f1a] text-sm tracking-tight">
            KONEKSYON PAM
          </span>
          <span className="sm:hidden font-black text-[#0b0f1a] text-sm">KP</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {links.map((l) => {
            const active = path === l.href || path?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "text-[#0b0f1a] bg-stone-100"
                    : "text-stone-500 hover:text-[#0b0f1a] hover:bg-stone-50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <LangSwitch />
          </div>
          <AuthButton />
          {/* Hamburger */}
          <button
            className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
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
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 pb-4 pt-2 flex flex-col gap-0.5">
          {links.map((l) => {
            const active = path === l.href || path?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-[#0b0f1a] bg-stone-100"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="mt-2 pt-2 border-t border-stone-100">
            <LangSwitch />
          </div>
        </div>
      )}
    </nav>
  );
}
