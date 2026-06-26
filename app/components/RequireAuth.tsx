"use client";

import { useState, useEffect, ReactNode } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";
import { useLang } from "@/lib/LangContext";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1.5 border border-blue-400/30">
            <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-3">
          {lang === "fr" ? "Connexion requise" : lang === "ht" ? "Koneksyon obligatwa" : "Login required"}
        </h2>
        <p className="text-stone-500 text-sm mb-6">
          {lang === "fr"
            ? "Connectez-vous pour accéder à toutes les fonctionnalités de KONEKSYON PAM"
            : lang === "ht"
            ? "Konekte pou jwenn aksè nan tout fonksyonalite KONEKSYON PAM"
            : "Sign in to access all KONEKSYON PAM features"}
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="flex items-center justify-center gap-3 mx-auto bg-white border-2 border-stone-200 rounded-xl px-8 py-3.5 font-medium text-stone-800 hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {lang === "fr" ? "Se connecter avec Google" : lang === "ht" ? "Konekte ak Google" : "Sign in with Google"}
        </button>
        <p className="text-xs text-stone-400 mt-4">
          {lang === "fr" ? "Gratuit • Sécurisé • En un clic" : lang === "ht" ? "Gratis • An sekirite • Yon klik" : "Free • Secure • One click"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
