"use client";

import { useEffect, useState } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";
import { useLang } from "@/lib/LangContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect home
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/");
    });
  }, [router]);

  const handleSignIn = () => {
    setLoading(true);
    signInWithGoogle();
  };

  const t = {
    title:    { fr: "Connexion à KONEKSYON PAM", ht: "Konekte nan KONEKSYON PAM", en: "Sign in to KONEKSYON PAM" },
    sub:      { fr: "Une plateforme chrétienne internationale — Bible, prières, concours, communauté.", ht: "Yon platfòm kretyen entènasyonal — Bib, lapriyè, konkou, kominote.", en: "An international Christian platform — Bible, prayers, contests, community." },
    btn:      { fr: loading ? "Redirection…" : "Continuer avec Google", ht: loading ? "Redireksyon…" : "Kontinye ak Google", en: loading ? "Redirecting…" : "Continue with Google" },
    oauth:    { fr: "Vous serez redirigé vers accounts.google.com pour vous authentifier en toute sécurité. KONEKSYON PAM ne collecte jamais vos identifiants Google.", ht: "Ou pral redirijé nan accounts.google.com pou otantifye an sekirite. KONEKSYON PAM pa janm kolekte enfòmasyon Google ou.", en: "You will be redirected to accounts.google.com to authenticate securely. KONEKSYON PAM never collects your Google credentials." },
    free:     { fr: "Gratuit • Sécurisé • Sans mot de passe", ht: "Gratis • An sekirite • San modpas", en: "Free • Secure • No password" },
    home:     { fr: "← Retour à l'accueil", ht: "← Tounen akèy", en: "← Back to home" },
  };

  const tx = (k: keyof typeof t) => t[k][lang] ?? t[k].fr;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#060d1e] to-[#0f2044] flex flex-col items-center justify-center px-5 py-16">
      {/* KONEKSYON PAM identity */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c5a84f] to-[#f0b429] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#c5a84f]/30">
          <span className="text-[#060d1e] font-black text-2xl">KP</span>
        </div>
        <h1 className="text-white font-black text-2xl mb-2">{tx("title")}</h1>
        <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">{tx("sub")}</p>
      </div>

      {/* Login card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">

        {/* OAuth sign-in button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-200 hover:border-blue-400 rounded-xl px-6 py-3.5 font-semibold text-stone-800 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label={lang === "fr" ? "Se connecter avec votre compte Google — redirigé vers accounts.google.com" : lang === "ht" ? "Konekte ak kont Google ou" : "Sign in with Google account — redirected to accounts.google.com"}
        >
          {!loading && (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading && (
            <div className="w-5 h-5 border-2 border-stone-300 border-t-blue-500 rounded-full animate-spin shrink-0" />
          )}
          {tx("btn")}
        </button>

        {/* Explicit OAuth security disclosure */}
        <div className="mt-5 bg-stone-50 border border-stone-100 rounded-xl p-4">
          <p className="text-xs text-stone-500 leading-relaxed text-center">
            🔒 {tx("oauth")}
          </p>
        </div>

        <p className="text-center text-xs text-stone-300 mt-4">{tx("free")}</p>
      </div>

      {/* Platform identity links */}
      <div className="mt-8 text-center space-y-3">
        <p className="text-white/20 text-xs">
          {lang === "fr" ? "En vous connectant, vous acceptez nos" : lang === "ht" ? "Lè ou konekte, ou aksepte" : "By signing in, you accept our"}{" "}
          <Link href="/contact" className="underline hover:text-white/40 transition-colors">
            {lang === "fr" ? "conditions d'utilisation" : lang === "ht" ? "kondisyon itilizasyon" : "terms of use"}
          </Link>
        </p>
        <Link href="/" className="block text-white/30 text-xs hover:text-white/60 transition-colors">
          {tx("home")}
        </Link>
      </div>
    </main>
  );
}
