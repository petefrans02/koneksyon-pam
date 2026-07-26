"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Lang } from "./translations";
import { analytics } from "./analytics";

const VALID_LANGS: Lang[] = ["fr", "ht", "en", "es"];
const STORAGE_KEY = "kp-lang";
// Separate key: set only when the user manually picks a language via LangSwitch.
// When present, we never override with geo-detection.
const MANUAL_KEY = "kp-lang-manual";

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const prevLang = useRef<Lang>("en");

  useEffect(() => {
    try {
      // 1. URL param always wins — keeps share/deep links working (?lang=fr, en, ht, es).
      const urlLang = new URLSearchParams(window.location.search).get("lang") as Lang | null;
      if (urlLang && VALID_LANGS.includes(urlLang)) {
        apply(urlLang);
        return;
      }

      // 2. If the user has ever manually chosen a language, respect it forever.
      const manual = localStorage.getItem(MANUAL_KEY) as Lang | null;
      if (manual && VALID_LANGS.includes(manual)) {
        apply(manual);
        return;
      }

      // 3. Default: English for every new visitor (no geo/browser auto-detection).
      //    Visitors can still switch language via the selector or ?lang=.
      apply("en");
    } catch {
      apply("en");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function apply(l: Lang) {
    setLangState(l);
    prevLang.current = l;
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }

  function setLang(l: Lang) {
    // User made a conscious choice — record it so geo never overrides again.
    analytics.languageChange(l, prevLang.current);
    prevLang.current = l;
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
      localStorage.setItem(MANUAL_KEY, l); // permanent manual override
    } catch {}
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
