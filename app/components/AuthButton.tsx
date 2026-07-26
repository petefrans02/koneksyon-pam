"use client";

import { useState, useEffect } from "react";
import { supabase, signInWithGoogle, signOut } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/app/components/Icon";

export default function AuthButton() {
  const { lang } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={() => signInWithGoogle()}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-white/10"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {lang === "fr" ? "Connexion" : lang === "ht" ? "Konekte" : lang === "es" ? "Iniciar sesión" : "Sign in"}
      </button>
    );
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition-all"
      >
        {avatar ? (
          <Image src={avatar} alt="" width={28} height={28} className="rounded-full" unoptimized />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {name[0].toUpperCase()}
          </div>
        )}
        <span className="text-white text-xs font-medium hidden sm:block">{name.split(" ")[0]}</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

          <div className="absolute right-0 top-full mt-2 rounded-2xl py-2 w-56 z-50"
            style={{ background: "rgba(8,14,28,0.97)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)", backdropFilter: "blur(20px)" }}>

            {/* User info */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white text-sm font-bold truncate">{name}</p>
              <p className="text-white/35 text-xs truncate mt-0.5">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link href="/dashboard" onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/06 transition-colors">
                <Icon name="home" size={17} /> {lang === "fr" ? "Mon tableau de bord" : lang === "ht" ? "Tablo de bò mwen" : lang === "es" ? "Mi panel" : "My dashboard"}
              </Link>
              <Link href="/aujourd-hui" onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/06 transition-colors">
                <Icon name="etincelles" size={17} /> {lang === "fr" ? "Verset du jour" : lang === "ht" ? "Vèsè jou a" : lang === "es" ? "Versículo del día" : "Verse of the day"}
              </Link>
              <Link href="/trophees" onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/06 transition-colors">
                <Icon name="medaille" size={17} /> {lang === "fr" ? "Mes trophées" : lang === "ht" ? "Twofè mwen" : lang === "es" ? "Mis trofeos" : "My trophies"}
              </Link>
              <Link href="/profile" onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/06 transition-colors">
                <Icon name="profil" size={17} /> {lang === "fr" ? "Mon profil" : lang === "ht" ? "Pwofil mwen" : lang === "es" ? "Mi perfil" : "My profile"}
              </Link>
            </div>

            {/* Sign out */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} className="pt-1">
              <button onClick={() => { signOut(); setShowMenu(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
                style={{ color: "rgba(248,113,113,0.80)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(248,113,113,0.80)")}>
                <Icon name="deconnexion" size={17} /> {lang === "fr" ? "Déconnexion" : lang === "ht" ? "Dekonekte" : lang === "es" ? "Cerrar sesión" : "Sign out"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
