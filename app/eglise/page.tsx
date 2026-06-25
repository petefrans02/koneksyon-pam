"use client";

import { useLang } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function EglisePage() {
  const { lang } = useLang();
  const [churches, setChurches] = useState<{ id: string; name: string; pastor_name: string; description: string; join_code: string; created_at: string }[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);

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
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1.5 border border-blue-400/20">
            <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "⛪ Espace Église" : lang === "ht" ? "⛪ Espas Legliz" : "⛪ Church Space"}
        </h1>
        <p className="text-stone-500 mt-2">
          {lang === "fr" ? "Créez l'espace de votre église ou rejoignez une église existante" : lang === "ht" ? "Kreye espas legliz ou oswa rantre nan yon legliz ki egziste" : "Create your church space or join an existing church"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        <Link
          href="/eglise/creer"
          className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-blue-300/20 transition-all"
        >
          <span className="text-5xl block mb-4">⛪</span>
          <h3 className="text-xl font-bold text-white mb-2">
            {lang === "fr" ? "Créer l'espace église" : lang === "ht" ? "Kreye espas legliz" : "Create church space"}
          </h3>
          <p className="text-white/80 text-sm">
            {lang === "fr" ? "Je suis pasteur, je veux créer l'espace de mon église" : lang === "ht" ? "Mwen se pastè, mwen vle kreye espas legliz mwen" : "I'm a pastor, I want to create my church space"}
          </p>
        </Link>

        <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center">
          <span className="text-5xl block mb-4">🚪</span>
          <h3 className="text-xl font-bold text-stone-900 mb-2">
            {lang === "fr" ? "Rejoindre une église" : lang === "ht" ? "Rantre nan yon legliz" : "Join a church"}
          </h3>
          <p className="text-stone-500 text-sm mb-4">
            {lang === "fr" ? "Entrez le code de votre église" : lang === "ht" ? "Antre kòd legliz ou" : "Enter your church code"}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder={lang === "fr" ? "Code église (ex: TDG2024)" : "Church code"}
              className="flex-1 border border-stone-300 rounded-xl px-4 py-3 text-sm text-center font-mono uppercase tracking-widest focus:border-blue-500 focus:outline-none"
            />
            <button onClick={handleJoin} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-500 transition-colors text-sm">
              →
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : churches.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4">
            {lang === "fr" ? "Églises sur KONEKSYON PAM" : lang === "ht" ? "Legliz sou KONEKSYON PAM" : "Churches on KONEKSYON PAM"}
          </h2>
          <div className="space-y-3">
            {churches.map((church) => (
              <Link key={church.id} href={`/eglise/${church.id}`} className="block bg-white rounded-xl border border-blue-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {church.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">{church.name}</h3>
                    <p className="text-sm text-stone-500">{church.pastor_name} • {church.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
