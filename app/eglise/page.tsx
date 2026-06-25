"use client";

import RequireAuth from "@/app/components/RequireAuth";
import { useLang } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Church {
  id: string;
  name: string;
  pastor_name: string;
  description: string;
  join_code: string;
  logo_url?: string;
  created_at: string;
}

export default function EglisePage() {
  const { lang } = useLang();
  const [churches, setChurches] = useState<Church[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => setUser(data.user));
    loadChurches();
  }, []);

  async function loadChurches() {
    const res = await fetch("/api/churches");
    const data = await res.json();
    setChurches(data.churches || []);
    setLoading(false);
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoinError("");
    if (!user) {
      supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/eglise` } });
      return;
    }
    const res = await fetch("/api/churches/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ join_code: joinCode.trim() }),
    });
    const data = await res.json();
    if (data.church_id) {
      window.location.href = `/eglise/${data.church_id}`;
    } else {
      setJoinError(lang === "fr" ? "⚠️ Vérifiez le code et réessayez" : lang === "ht" ? "⚠️ Verifye kòd la epi eseye ankò" : "⚠️ Check the code and try again");
    }
  }

  return (
    <RequireAuth>
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2044] to-[#1a1040] rounded-3xl p-8 text-center mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />
        <div className="relative z-10">
          <span className="text-5xl block mb-4">⛪</span>
          <h1 className="text-3xl font-bold text-white mb-3">
            {lang === "fr" ? "La communauté chrétienne sur KONEKSYON PAM" : lang === "ht" ? "Kominote kretyen sou KONEKSYON PAM" : "The Christian community on KONEKSYON PAM"}
          </h1>
          <p className="text-blue-200/70 max-w-xl mx-auto text-sm leading-relaxed">
            {lang === "fr"
              ? "Que vous soyez pasteur, responsable de groupe ou simple croyant — créez ou rejoignez un espace de foi pour grandir ensemble."
              : lang === "ht"
              ? "Ke ou se pastè, responsab gwoup oubyen kretyen, kreye oswa rantre nan yon espas lafwa pou grandi ansanm."
              : "Whether you're a pastor, group leader or believer — create or join a faith space to grow together."}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-5 text-xs text-blue-300/60">
            {["✝️ Pasteurs", "🙏 Croyants", "👨‍👩‍👧 Familles", "📖 Groupes d'étude", "🎵 Chœurs", "🌍 Toute l'Église"].map((t) => (
              <span key={t} className="bg-white/10 rounded-full px-3 py-1">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {/* Create */}
        <Link
          href="/eglise/creer"
          className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-blue-300/20 transition-all group"
        >
          <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">🏠</span>
          <h3 className="text-xl font-bold text-white mb-2">
            {lang === "fr" ? "Créer un groupe" : lang === "ht" ? "Kreye yon gwoup" : "Create a group"}
          </h3>
          <p className="text-white/80 text-sm">
            {lang === "fr"
              ? "Pasteur, responsable ou animateur — créez l'espace de votre communauté avec photo de profil"
              : lang === "ht"
              ? "Pastè, responsab — kreye espas kominote ou ak foto pwofil"
              : "Pastor, leader or organizer — create your community space with profile photo"}
          </p>
          <span className="inline-block mt-4 bg-white/20 text-white text-xs px-3 py-1 rounded-full">+ {lang === "fr" ? "Photo de groupe incluse" : "Group photo included"}</span>
        </Link>

        {/* Join */}
        <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center shadow-sm">
          <span className="text-5xl block mb-4">🚪</span>
          <h3 className="text-xl font-bold text-stone-900 mb-2">
            {lang === "fr" ? "Rejoindre un groupe" : lang === "ht" ? "Rantre nan yon gwoup" : "Join a group"}
          </h3>
          <p className="text-stone-500 text-sm mb-4">
            {lang === "fr" ? "Entrez le code partagé par votre responsable" : lang === "ht" ? "Antre kòd responsab ou" : "Enter the code shared by your leader"}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
              placeholder={lang === "fr" ? "Code (ex: TDG2024)" : "Code"}
              className="flex-1 border border-stone-300 rounded-xl px-4 py-3 text-sm text-center font-mono uppercase tracking-widest focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <button onClick={handleJoin} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors">
              →
            </button>
          </div>
          {joinError && <p className="text-red-500 text-sm font-medium mt-2">{joinError}</p>}
        </div>
      </div>

      {/* Church List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : churches.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4">
            {lang === "fr" ? "Communautés sur KONEKSYON PAM" : lang === "ht" ? "Kominote sou KONEKSYON PAM" : "Communities on KONEKSYON PAM"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {churches.map((church) => (
              <div key={church.id} className="bg-white rounded-2xl border border-blue-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {church.logo_url ? (
                    <img src={church.logo_url} alt={church.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-blue-100" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
                      {church.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-900 truncate">{church.name}</h3>
                    <p className="text-sm text-stone-500 truncate">{church.pastor_name}</p>
                    {church.description && <p className="text-xs text-stone-400 truncate mt-0.5">{church.description}</p>}
                  </div>
                  <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full shrink-0">
                    🔒 {lang === "fr" ? "Code" : "Code"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </RequireAuth>
  );
}
