"use client";

import RequireAuth from "@/app/components/RequireAuth";
import { useLang } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function EglisePage() {
  const { lang } = useLang();
  const [joinCode, setJoinCode] = useState("");
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null>(null);
  const [joinError, setJoinError] = useState("");
  const [joinPending, setJoinPending] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoinError("");
    setJoinPending(false);
    if (!user) {
      supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/eglise` } });
      return;
    }
    setJoining(true);
    const res = await fetch("/api/churches/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        join_code: joinCode.trim(),
        user_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonyme",
        user_email: user.email || "",
        user_avatar: user.user_metadata?.avatar_url || "",
      }),
    });
    const data = await res.json();
    setJoining(false);
    if (data.church_id) {
      if (data.status === "pending") {
        setJoinPending(true);
        setJoinCode("");
      } else {
        window.location.href = `/eglise/${data.church_id}`;
      }
    } else {
      setJoinError(lang === "fr" ? "⚠️ Code invalide. Vérifiez et réessayez." : lang === "ht" ? "⚠️ Kòd pa bon. Verifye epi eseye ankò." : "⚠️ Invalid code. Check and try again.");
    }
  }

  return (
    <RequireAuth>
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2044] to-[#1a1040] rounded-3xl p-8 text-center mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />
        <div className="relative z-10">
          <span className="text-5xl block mb-4">⛪</span>
          <h1 className="text-3xl font-bold text-white mb-3">
            {lang === "fr" ? "La communauté chrétienne" : lang === "ht" ? "Kominote kretyen" : "The Christian community"}
          </h1>
          <p className="text-blue-200/70 max-w-xl mx-auto text-sm leading-relaxed">
            {lang === "fr"
              ? "Créez votre espace de foi ou rejoignez votre groupe avec un code d'accès."
              : lang === "ht"
              ? "Kreye espas lafwa ou oswa rantre nan gwoup ou ak yon kòd aksè."
              : "Create your faith space or join your group with an access code."}
          </p>
        </div>
      </div>

      {/* Two actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">

        {/* Create */}
        <Link
          href="/eglise/creer"
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-blue-300/20 transition-all group"
        >
          <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">✝️</span>
          <h3 className="text-xl font-bold text-white mb-2">
            {lang === "fr" ? "Créer un groupe" : lang === "ht" ? "Kreye yon gwoup" : "Create a group"}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed">
            {lang === "fr"
              ? "Pasteur ou responsable — créez l'espace privé de votre communauté"
              : lang === "ht"
              ? "Pastè oswa responsab — kreye espas prive kominote ou a"
              : "Pastor or leader — create your community's private space"}
          </p>
          <span className="inline-block mt-4 bg-white/15 text-white/90 text-xs px-4 py-1.5 rounded-full font-medium">
            + {lang === "fr" ? "Créer mon espace" : lang === "ht" ? "Kreye espas mwen" : "Create my space"}
          </span>
        </Link>

        {/* Join */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm">
          <span className="text-4xl block mb-4">🔑</span>
          <h3 className="text-xl font-bold text-stone-900 mb-2">
            {lang === "fr" ? "Rejoindre un groupe" : lang === "ht" ? "Rantre nan yon gwoup" : "Join a group"}
          </h3>
          <p className="text-stone-500 text-sm mb-5">
            {lang === "fr"
              ? "Votre responsable vous a partagé un code d'accès"
              : lang === "ht"
              ? "Responsab ou a pataje yon kòd aksè avèk ou"
              : "Your leader shared an access code with you"}
          </p>

          {joinPending ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-2xl mb-2">⏳</p>
              <p className="font-bold text-amber-800 text-sm">
                {lang === "fr" ? "Demande envoyée !" : lang === "ht" ? "Demann voye !" : "Request sent!"}
              </p>
              <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                {lang === "fr"
                  ? "Le Pasteur doit accepter votre demande. Vous recevrez l'accès dès qu'il l'approuve."
                  : lang === "ht"
                  ? "Pastè a dwe aksepte demann ou. Ou pral jwenn aksè lè li aprouva li."
                  : "The Pastor must accept your request. You'll get access once approved."}
              </p>
              <button onClick={() => setJoinPending(false)} className="text-amber-600 text-xs underline mt-2">
                {lang === "fr" ? "Essayer un autre code" : "Try another code"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
                  placeholder="_ _ _ _ _ _"
                  maxLength={8}
                  className="flex-1 border-2 border-stone-200 rounded-xl px-4 py-3 text-base text-center font-mono font-bold uppercase tracking-[0.3em] focus:border-blue-500 focus:outline-none text-stone-900"
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
                <button
                  onClick={handleJoin}
                  disabled={joining || joinCode.length < 4}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-40 shadow-md"
                >
                  {joining ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  ) : "→"}
                </button>
              </div>
              {joinError && (
                <p className="text-red-500 text-xs font-medium mt-2">{joinError}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
        <p className="text-stone-500 text-sm">
          🔒 {lang === "fr"
            ? "Les groupes sont privés. Seules les personnes ayant le code d'accès peuvent rejoindre un groupe."
            : lang === "ht"
            ? "Gwoup yo prive. Sèlman moun ki gen kòd aksè ka rantre nan yon gwoup."
            : "Groups are private. Only people with the access code can join a group."}
        </p>
      </div>

    </div>
    </RequireAuth>
  );
}
