"use client";

import { useLang } from "@/lib/LangContext";
import { Lang } from "@/lib/translations";
import { useState } from "react";

const langs: { code: Lang; flag: string; label: string; name: string }[] = [
  { code: "fr", flag: "🇫🇷", label: "FR", name: "Français" },
  { code: "ht", flag: "🇭🇹", label: "KR", name: "Kreyòl" },
  { code: "en", flag: "🇺🇸", label: "EN", name: "English" },
];

export default function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = langs.find(l => l.code === lang) ?? langs[0];

  function select(code: Lang) {
    setLang(code);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
        aria-label="Change language"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg className={`w-3 h-3 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 min-w-[130px] overflow-hidden">
            {langs.map(l => (
              <button
                key={l.code}
                onClick={() => select(l.code)}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold text-left transition-colors ${
                  lang === l.code
                    ? "bg-[#1d4ed8]/5 text-[#1d4ed8]"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <span className="text-sm">{l.flag}</span>
                <span>{l.name}</span>
                {lang === l.code && <span className="ml-auto text-[#1d4ed8]">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
