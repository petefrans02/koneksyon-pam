"use client";

import { useState, useEffect } from "react";
import { supabase, signInWithGoogle, signOut } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";

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
        onClick={signInWithGoogle}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-white/10"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Connexion
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
          <img src={avatar} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {name[0].toUpperCase()}
          </div>
        )}
        <span className="text-white text-xs font-medium hidden sm:block">{name.split(" ")[0]}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-stone-200 py-2 w-52 z-50">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-semibold text-stone-900">{name}</p>
            <p className="text-xs text-stone-400 truncate">{user.email}</p>
          </div>
          <Link
            href="/mes-groupes"
            onClick={() => setShowMenu(false)}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-stone-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            ⛪ {lang === "fr" ? "Mes groupes" : lang === "ht" ? "Gwoup mwen yo" : "My groups"}
          </Link>
          <div className="border-t border-stone-100 mt-1 pt-1">
            <button
              onClick={() => { signOut(); setShowMenu(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              {lang === "fr" ? "Déconnexion" : lang === "ht" ? "Dekonekte" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
