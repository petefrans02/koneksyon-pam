"use client";

import { useLang } from "@/lib/LangContext";
import { Lang } from "@/lib/translations";

const langs: { code: Lang; flag: string; label: string }[] = [
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "ht", flag: "🇭🇹", label: "KR" },
  { code: "en", flag: "🇺🇸", label: "EN" },
];

export default function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex gap-1">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            lang === l.code
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
              : "bg-white/10 text-blue-200/70 hover:bg-white/20"
          }`}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}
