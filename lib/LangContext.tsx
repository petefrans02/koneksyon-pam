"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang } from "./translations";

const VALID_LANGS: Lang[] = ["fr", "ht", "en"];

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "fr", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  // Restore persisted language on first render (client only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kp-lang") as Lang | null;
      if (saved && VALID_LANGS.includes(saved)) setLangState(saved);
    } catch {}
  }, []);

  function setLang(l: Lang) {
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
