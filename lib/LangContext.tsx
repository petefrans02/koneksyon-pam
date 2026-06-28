"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Lang } from "./translations";
import { analytics } from "./analytics";

const VALID_LANGS: Lang[] = ["fr", "ht", "en"];

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "fr", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  const prevLang = useRef<Lang>("fr");

  // Restore persisted language on first render (client only).
  // URL ?lang=xx takes priority — enables language-aware share links.
  useEffect(() => {
    try {
      const urlLang = new URLSearchParams(window.location.search).get("lang") as Lang | null;
      if (urlLang && VALID_LANGS.includes(urlLang)) {
        setLangState(urlLang);
        prevLang.current = urlLang;
        try { localStorage.setItem("kp-lang", urlLang); } catch {}
        return;
      }
      const saved = localStorage.getItem("kp-lang") as Lang | null;
      if (saved && VALID_LANGS.includes(saved)) {
        setLangState(saved);
        prevLang.current = saved;
      }
    } catch {}
  }, []);

  function setLang(l: Lang) {
    analytics.languageChange(l, prevLang.current);
    prevLang.current = l;
    setLangState(l);
    try { localStorage.setItem("kp-lang", l); } catch {}
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
