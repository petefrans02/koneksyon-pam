"use client";

import { useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";

type Lang = "fr" | "en" | "ht" | "es";

const T = {
  fr: {
    reconnecting: "Reconnexion en cours...",
    wait: "Le système se reconnecte automatiquement.",
    btn: "Reprendre maintenant",
    home: "Accueil",
    failed: "La connexion a échoué.",
    failedSub: "Veuillez retourner à l'accueil et réessayer.",
  },
  en: {
    reconnecting: "Reconnecting...",
    wait: "The system is reconnecting automatically.",
    btn: "Resume now",
    home: "Home",
    failed: "Connection failed.",
    failedSub: "Please return to the home page and try again.",
  },
  ht: {
    reconnecting: "Rekoneksyon ap fèt...",
    wait: "Sistèm nan ap rekonekte otomatikman.",
    btn: "Reprann kounye a",
    home: "Akèy",
    failed: "Koneksyon echwe.",
    failedSub: "Tanpri retounen nan paj akèy la epi eseye ankò.",
  },
  es: {
    reconnecting: "Reconectando...",
    wait: "El sistema se está reconectando automáticamente.",
    btn: "Reanudar ahora",
    home: "Inicio",
    failed: "La conexión falló.",
    failedSub: "Por favor vuelve a la página de inicio e inténtalo de nuevo.",
  },
};

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang, setLang] = useState<Lang>("fr");
  const [countdown, setCountdown] = useState(3);
  const [done, setDone] = useState(false);
  const hasRetried = useRef(false);

  // Detect language from localStorage (can't use React context in error boundaries)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kp-lang") as Lang | null;
      if (saved && ["fr", "en", "ht", "es"].includes(saved)) setLang(saved);
    } catch {}
  }, []);

  // Log silently for admin — never visible to user
  useEffect(() => {
    try {
      analytics.error(error.message, error.digest, window.location.pathname);
    } catch {}
    try {
      fetch("/api/admin/error-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          digest: error.digest,
          stack: (error.stack ?? "").slice(0, 2000),
          page: window.location.pathname,
          ua: navigator.userAgent.slice(0, 200),
          ts: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {}
  }, [error]);

  // Auto-retry once after 3 seconds
  useEffect(() => {
    if (hasRetried.current) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasRetried.current) {
            hasRetried.current = true;
            reset();
          }
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const txt = T[lang];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        {/* Spinner — never show error text to user */}
        <div className="w-12 h-12 rounded-full border-[3px] border-[#c5a84f]/30 border-t-[#c5a84f] mx-auto mb-6 animate-spin" />

        <h1 className="text-xl font-black text-stone-800 mb-2">{txt.reconnecting}</h1>
        <p className="text-stone-400 text-sm mb-6 leading-relaxed">{txt.wait}</p>
        {!done && <p className="text-stone-300 text-xs mb-6 tabular-nums">({countdown}s)</p>}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { hasRetried.current = true; reset(); }}
            className="bg-[#c5a84f] hover:bg-[#b8963e] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            {txt.btn}
          </button>
          <a
            href="/"
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            {txt.home}
          </a>
        </div>
      </div>
    </div>
  );
}
