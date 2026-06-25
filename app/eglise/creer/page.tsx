"use client";

import { useLang } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CreerEglisePage() {
  const { lang } = useLang();
  const [name, setName] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; join_code: string } | null>(null);
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      setUser(data.user);
      if (!data.user) {
        supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/eglise/creer` } });
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !pastorName.trim()) return;
    setLoading(true);

    const res = await fetch("/api/churches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), pastor_name: pastorName.trim(), description: description.trim() }),
    });
    const data = await res.json();
    if (data.church) {
      setResult({ id: data.church.id, join_code: data.church.join_code });
    }
    setLoading(false);
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <span className="text-6xl block mb-4">⛪</span>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          {lang === "fr" ? "Église créée !" : lang === "ht" ? "Legliz kreye !" : "Church created!"}
        </h1>
        <p className="text-stone-500 mb-6">
          {lang === "fr" ? "Partagez ce code avec vos membres pour qu'ils rejoignent :" : "Share this code with your members to join:"}
        </p>
        <div className="bg-gradient-to-br from-[#0a1628] to-[#0f2044] rounded-2xl p-8 mb-6">
          <p className="text-blue-300/60 text-sm mb-2">
            {lang === "fr" ? "Code de l'église" : "Church code"}
          </p>
          <p className="text-4xl font-mono font-bold text-cyan-400 tracking-[0.3em]">{result.join_code}</p>
        </div>
        <a href={`/eglise/${result.id}`} className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
          {lang === "fr" ? "Accéder à mon église →" : "Go to my church →"}
        </a>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-stone-500 mt-4">{lang === "fr" ? "Connexion en cours..." : "Connecting..."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">⛪</span>
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "Créer l'espace église" : lang === "ht" ? "Kreye espas legliz" : "Create church space"}
        </h1>
        <p className="text-stone-500 mt-2">
          {lang === "fr" ? "Remplissez les informations de votre église" : "Fill in your church information"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {lang === "fr" ? "Nom de l'église" : lang === "ht" ? "Non legliz la" : "Church name"}
          </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder={lang === "fr" ? "ex: Tabernacle de Gloire" : "ex: Glory Tabernacle"} className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {lang === "fr" ? "Nom du pasteur" : lang === "ht" ? "Non pastè a" : "Pastor's name"}
          </label>
          <input type="text" value={pastorName} onChange={(e) => setPastorName(e.target.value)} required placeholder={lang === "fr" ? "ex: Pasteur Jean Pierre" : "ex: Pastor John"} className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {lang === "fr" ? "Description (optionnel)" : "Description (optional)"}
          </label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder={lang === "fr" ? "Décrivez votre église en quelques mots..." : "Describe your church..."} className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white resize-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? "..." : lang === "fr" ? "Créer l'église" : lang === "ht" ? "Kreye legliz la" : "Create church"}
        </button>
      </form>
    </div>
  );
}
