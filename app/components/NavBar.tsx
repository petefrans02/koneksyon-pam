"use client";

import { useLang } from "@/lib/LangContext";
import LangSwitch from "./LangSwitch";
import AuthButton from "./AuthButton";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const { lang } = useLang();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus = [
    {
      label: lang === "fr" ? "Adoration" : lang === "ht" ? "Adorasyon" : "Worship",
      items: [
        { href: "/bible", label: lang === "fr" ? "📖 La Bible complète" : lang === "ht" ? "📖 Bib la konplè" : "📖 Full Bible" },
        { href: "/louange", label: lang === "fr" ? "🎵 Louange & Musique" : lang === "ht" ? "🎵 Lwanj & Mizik" : "🎵 Praise & Music" },
        { href: "/chants", label: lang === "fr" ? "🎶 Chants d'Espérance" : lang === "ht" ? "🎶 Chan Desperans" : "🎶 Songs of Hope" },
      ],
    },
    {
      label: lang === "fr" ? "Prière" : lang === "ht" ? "Lapriyè" : "Prayer",
      items: [
        { href: "/prieres", label: lang === "fr" ? "🙏 Demandes de prière" : lang === "ht" ? "🙏 Demann lapriyè" : "🙏 Prayer requests" },
        { href: "/temoignages", label: lang === "fr" ? "✨ Témoignages" : lang === "ht" ? "✨ Temwayaj" : "✨ Testimonies" },
      ],
    },
    {
      label: lang === "fr" ? "Apprendre" : lang === "ht" ? "Aprann" : "Learn",
      items: [
        { href: "/etude", label: lang === "fr" ? "📚 Études bibliques" : lang === "ht" ? "📚 Etid biblik" : "📚 Bible studies" },
        { href: "/quiz", label: lang === "fr" ? "🏆 Quiz biblique" : lang === "ht" ? "🏆 Kiz biblik" : "🏆 Bible quiz" },
        { href: "/jeu", label: lang === "fr" ? "🎯 Devine le Verset" : lang === "ht" ? "🎯 Devine Vèsè a" : "🎯 Guess the Verse" },
      ],
    },
    {
      label: lang === "fr" ? "Communauté" : lang === "ht" ? "Kominote" : "Community",
      items: [
        { href: "/communaute", label: lang === "fr" ? "🌍 Groupes" : lang === "ht" ? "🌍 Gwoup" : "🌍 Groups" },
        { href: "/eglise", label: lang === "fr" ? "⛪ Espace Église" : lang === "ht" ? "⛪ Espas Legliz" : "⛪ Church Space" },
      ],
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-[#0a1628] via-[#0f2044] to-[#0a1628] px-4 py-3 sticky top-0 z-50 shadow-xl border-b border-blue-900/30">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setOpenMenu(null)}>
          <img src="/logo-kp.png" alt="KP" className="w-11 h-11 rounded-xl group-hover:scale-105 transition-transform" />
          <div className="hidden sm:block">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">KONEKSYON PAM</span>
            <p className="text-[10px] text-blue-400/60 -mt-0.5 tracking-widest">UNE MISSION • UN DIEU • UNE VISION</p>
          </div>
          <span className="sm:hidden text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">KP</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {menus.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
                className={`text-blue-200/70 hover:text-white hover:bg-blue-500/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${openMenu === menu.label ? "bg-blue-500/20 text-white" : ""}`}
              >
                {menu.label} ▾
              </button>
              {openMenu === menu.label && (
                <div className="absolute top-full left-0 mt-1 bg-[#0f2044] border border-blue-800/40 rounded-xl shadow-xl py-2 w-56 z-50">
                  {menu.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      className="block px-4 py-2.5 text-sm text-blue-200/80 hover:text-white hover:bg-blue-500/20 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LangSwitch />
          <AuthButton />
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex flex-wrap justify-center gap-2 mt-2 px-2">
        {menus.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
              className={`text-blue-300/60 text-xs font-medium px-2 py-1 rounded transition-colors ${openMenu === menu.label ? "text-cyan-300 bg-blue-500/20" : ""}`}
            >
              {menu.label} ▾
            </button>
            {openMenu === menu.label && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-[#0f2044] border border-blue-800/40 rounded-xl shadow-xl py-2 w-52 z-50">
                {menu.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenMenu(null)}
                    className="block px-4 py-2.5 text-sm text-blue-200/80 hover:text-white hover:bg-blue-500/20 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Click outside to close */}
      {openMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
      )}
    </nav>
  );
}
