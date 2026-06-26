"use client";

import { useLang } from "@/lib/LangContext";
import LangSwitch from "./LangSwitch";
import AuthButton from "./AuthButton";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Section identity — each section has a color, icon, and accent
export const SECTIONS = [
  { href: "/prieres",      icon: "🙏", color: "#7c3aed", bg: "#f5f3ff", fr: "Prière",       ht: "Lapriyè",   en: "Prayer"    },
  { href: "/etude",        icon: "📖", color: "#1d4ed8", bg: "#eff6ff", fr: "Étude",        ht: "Etid",      en: "Study"     },
  { href: "/enseignement", icon: "🎓", color: "#0891b2", bg: "#ecfeff", fr: "Enseignement", ht: "Ansèyman",  en: "Teaching"  },
  { href: "/jeu",          icon: "🏛️", color: "#ea580c", bg: "#fff7ed", fr: "Jeux",         ht: "Jwèt",      en: "Games"     },
  { href: "/concours",     icon: "🏆", color: "#b45309", bg: "#fffbeb", fr: "Concours",     ht: "Konkou",    en: "Contests"  },
  { href: "/eglise",       icon: "⛪", color: "#16a34a", bg: "#f0fdf4", fr: "Groupes",      ht: "Gwoup",     en: "Groups"    },
];

export default function NavBar() {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as "fr"|"ht"|"en";
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string | null; avatar?: string | null } | null>(null);
  const path = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.full_name || data.user.email,
          avatar: data.user.user_metadata?.avatar_url || null,
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser({ name: session.user.user_metadata?.full_name, avatar: session.user.user_metadata?.avatar_url });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const label = (s: typeof SECTIONS[0]) => s[l];

  return (
    <header className="sticky top-0 z-50 shadow-sm">

      {/* Top bar */}
      <div className="bg-[#0f2044]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-9 flex items-center justify-between">
          <p className="text-white/40 text-[10px] tracking-[0.18em] font-medium hidden sm:block uppercase">
            {l === "fr" ? "UNE MISSION · UN DIEU · UNE VISION" : l === "ht" ? "YON MISYON · YON BONDYE · YON VIZYON" : "ONE MISSION · ONE GOD · ONE VISION"}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/aujourd-hui"
              className="hidden sm:flex items-center gap-1.5 text-[#c5a84f] text-[10px] font-bold uppercase tracking-wider hover:text-[#e8c97a] transition-colors">
              ✨ {l === "fr" ? "Aujourd'hui" : l === "ht" ? "Jodi a" : "Today"}
            </Link>
            <Link href="/decouvrir"
              className="hidden sm:flex items-center gap-1.5 text-white/50 text-[10px] font-bold uppercase tracking-wider hover:text-white transition-colors">
              🔍 {l === "fr" ? "Découvrir" : l === "ht" ? "Dekouvri" : "Discover"}
            </Link>
            <div className="w-px h-4 bg-white/20 hidden sm:block" />
            {user && (
              <Link href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-white/60 text-[10px] font-bold uppercase tracking-wider hover:text-white transition-colors">
                {user.avatar
                  ? <img src={user.avatar} className="w-4 h-4 rounded-full" alt="" />
                  : <span className="w-4 h-4 rounded-full bg-[#c5a84f] flex items-center justify-center text-[8px] font-black text-[#0f2044]">{user.name?.[0] ?? "?"}</span>
                }
                Dashboard
              </Link>
            )}
            <LangSwitch />
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center gap-6">

          {/* Logo */}
          <Link href="/" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 shrink-0 group">
            <img src="/logo-kp.png" alt="KP" className="w-9 h-9 rounded-lg group-hover:opacity-85 transition-opacity" />
            <div className="hidden lg:block">
              <p className="text-[#0f2044] font-black text-sm leading-tight">KONEKSYON PAM</p>
              <p className="text-[#7c3aed] text-[8px] font-bold tracking-[0.2em] uppercase">{l === "fr" ? "Plateforme Chrétienne" : l === "ht" ? "Platfòm Kretyen" : "Christian Platform"}</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto">
            {SECTIONS.map((s) => {
              const active = path === s.href || path?.startsWith(s.href + "/");
              return (
                <Link key={s.href} href={s.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    active
                      ? "text-white"
                      : "text-[#0f2044]/60 hover:text-[#0f2044]"
                  }`}
                  style={active ? { backgroundColor: s.color } : {}}>
                  <span className="text-base leading-none">{s.icon}</span>
                  {label(s)}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button className="md:hidden ml-auto p-2 rounded-lg text-[#0f2044]/50 hover:bg-stone-50"
            onClick={() => setOpen(!open)}>
            {open
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>

        {/* Mobile menu — grid of sections */}
        {open && (
          <div className="md:hidden border-t border-stone-100 bg-white px-4 pb-5 pt-3">
            {/* Quick links */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Link href="/aujourd-hui" onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-gradient-to-b from-[#c5a84f]/10 to-[#c5a84f]/5 border border-[#c5a84f]/20 text-[#b45309] text-[10px] font-bold">
                ✨ <span>{l === "fr" ? "Aujourd'hui" : l === "ht" ? "Jodi a" : "Today"}</span>
              </Link>
              <Link href="/decouvrir" onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-[10px] font-bold">
                🔍 <span>{l === "fr" ? "Découvrir" : l === "ht" ? "Dekouvri" : "Discover"}</span>
              </Link>
              {user ? (
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-[#0f2044]/5 border border-[#0f2044]/10 text-[#0f2044] text-[10px] font-bold">
                  🏠 <span>Dashboard</span>
                </Link>
              ) : (
                <Link href="/concours" onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-[#fffbeb] border border-[#c5a84f]/20 text-[#b45309] text-[10px] font-bold">
                  🏆 <span>{l === "fr" ? "Concours" : "Konkou"}</span>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SECTIONS.map((s) => {
                const active = path === s.href || path?.startsWith(s.href + "/");
                return (
                  <Link key={s.href} href={s.href} onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{ backgroundColor: active ? s.color : s.bg, color: active ? "white" : s.color }}>
                    <span className="text-xl">{s.icon}</span>
                    <span>{label(s)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
