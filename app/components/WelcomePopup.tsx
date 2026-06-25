"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import { supabase, signInWithGoogle } from "@/lib/supabase";

export default function WelcomePopup() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      if (data.user) return;
      const dismissed = localStorage.getItem("kp-welcome-dismissed");
      if (dismissed) return;
      const timer = setTimeout(() => setShow(true), 7000);
      return () => clearTimeout(timer);
    });
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem("kp-welcome-dismissed", "true");
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in">
        <button onClick={dismiss} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-xl">✕</button>

        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1.5 border border-blue-400/30">
            <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          {lang === "fr" ? "Bienvenue ! 🙏" : lang === "ht" ? "Byenveni ! 🙏" : "Welcome! 🙏"}
        </h2>

        <p className="text-stone-600 mb-6 leading-relaxed">
          {lang === "fr"
            ? "Bienvenue sur la plateforme de l'Église connectée. Créez un compte gratuitement et rejoignez cette belle famille !"
            : lang === "ht"
            ? "Byenveni sou platfòm Legliz ki konekte. Kreye yon kont gratis epi rantre nan bèl fanmi sa a !"
            : "Welcome to the connected Church platform. Create a free account and join this beautiful family!"}
        </p>

        <button
          onClick={() => { dismiss(); signInWithGoogle(); }}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {lang === "fr" ? "Créer un compte avec Google" : lang === "ht" ? "Kreye yon kont ak Google" : "Create account with Google"}
        </button>

        <button onClick={dismiss} className="text-stone-400 text-sm hover:text-stone-600 transition-colors">
          {lang === "fr" ? "Plus tard" : lang === "ht" ? "Pita" : "Later"}
        </button>
      </div>
    </div>
  );
}
