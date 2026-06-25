"use client";

import { useLang } from "@/lib/LangContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function CreerEglisePage() {
  const { lang } = useLang();
  const [name, setName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; join_code: string } | null>(null);
  const [user, setUser] = useState<unknown>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      setUser(data.user);
      if (!data.user) {
        supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/eglise/creer` } });
      }
    });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function uploadLogo(): Promise<string> {
    if (!logoFile) return "";
    setUploading(true);
    const formData = new FormData();
    formData.append("file", logoFile);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url || "";
    } catch {
      return "";
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !leaderName.trim()) return;
    setLoading(true);

    const logo_url = await uploadLogo();

    const res = await fetch("/api/churches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), pastor_name: leaderName.trim(), description: description.trim(), logo_url }),
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
        <span className="text-6xl block mb-4">🎉</span>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          {lang === "fr" ? "Groupe créé !" : lang === "ht" ? "Gwoup kreye !" : "Group created!"}
        </h1>
        <p className="text-stone-500 mb-6">
          {lang === "fr" ? "Partagez ce code avec vos membres pour qu'ils rejoignent :" : lang === "ht" ? "Pataje kòd sa a ak manm ou yo pou yo ka rantre :" : "Share this code with your members to join:"}
        </p>
        <div className="bg-gradient-to-br from-[#0a1628] to-[#0f2044] rounded-2xl p-8 mb-6">
          <p className="text-blue-300/60 text-sm mb-2">
            {lang === "fr" ? "Code du groupe" : lang === "ht" ? "Kòd gwoup la" : "Group code"}
          </p>
          <p className="text-4xl font-mono font-bold text-cyan-400 tracking-[0.3em]">{result.join_code}</p>
        </div>
        <a href={`/eglise/${result.id}`} className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
          {lang === "fr" ? "Accéder à mon groupe →" : lang === "ht" ? "Ale nan gwoup mwen →" : "Go to my group →"}
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
        <span className="text-5xl block mb-3">🏠</span>
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "Créer un groupe" : lang === "ht" ? "Kreye yon gwoup" : "Create a group"}
        </h1>
        <p className="text-stone-500 mt-2 text-sm">
          {lang === "fr"
            ? "Ouvert à tous : pasteurs, responsables, animateurs de groupe"
            : lang === "ht"
            ? "Ouvè pou tout moun : pastè, responsab, animatè gwoup"
            : "Open to all: pastors, leaders, group organizers"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm space-y-5">

        {/* Photo de groupe */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            {lang === "fr" ? "Photo du groupe (optionnel)" : lang === "ht" ? "Foto gwoup la (opsyonèl)" : "Group photo (optional)"}
          </label>
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden shrink-0"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📷</span>
              )}
            </div>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm text-blue-600 font-medium hover:underline block"
              >
                {logoPreview
                  ? (lang === "fr" ? "Changer la photo" : "Change photo")
                  : (lang === "fr" ? "Choisir une photo" : lang === "ht" ? "Chwazi yon foto" : "Choose a photo")}
              </button>
              <p className="text-xs text-stone-400 mt-1">JPG, PNG, WebP · max 5MB</p>
              {logoPreview && (
                <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(""); }} className="text-xs text-red-400 hover:underline mt-1">
                  {lang === "fr" ? "Supprimer" : "Remove"}
                </button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {lang === "fr" ? "Nom du groupe / Église" : lang === "ht" ? "Non gwoup / Legliz la" : "Group / Church name"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={lang === "fr" ? "ex: Tabernacle de Gloire, Groupe Jeunesse..." : "ex: Glory Tabernacle, Youth Group..."}
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {lang === "fr" ? "Votre nom (pasteur ou responsable)" : lang === "ht" ? "Non ou (pastè oswa responsab)" : "Your name (pastor or leader)"}
          </label>
          <input
            type="text"
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            required
            placeholder={lang === "fr" ? "ex: Pasteur Jean Pierre, Marie Dupont..." : "ex: Pastor John, Maria Silva..."}
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {lang === "fr" ? "Description (optionnel)" : lang === "ht" ? "Deskripsyon (opsyonèl)" : "Description (optional)"}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={lang === "fr" ? "Décrivez votre groupe en quelques mots..." : lang === "ht" ? "Dekri gwoup ou an nan kèk mo..." : "Describe your group..."}
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading || uploading
            ? (lang === "fr" ? "Création en cours..." : "Creating...")
            : (lang === "fr" ? "Créer le groupe" : lang === "ht" ? "Kreye gwoup la" : "Create group")}
        </button>
      </form>

      {/* Info box */}
      <div className="mt-6 bg-blue-50 rounded-2xl p-5 text-sm text-blue-700">
        <p className="font-bold mb-2">ℹ️ {lang === "fr" ? "Comment ça marche ?" : "How it works?"}</p>
        <ul className="space-y-1 text-blue-600/80">
          <li>• {lang === "fr" ? "Vous recevez un code unique à partager" : "You receive a unique code to share"}</li>
          <li>• {lang === "fr" ? "Vos membres rejoignent avec ce code" : "Your members join with this code"}</li>
          <li>• {lang === "fr" ? "Publiez annonces, études, prières..." : "Post announcements, studies, prayers..."}</li>
          <li>• {lang === "fr" ? "Créez des sous-groupes (jeunesse, louange...)" : "Create sub-groups (youth, worship...)"}</li>
        </ul>
      </div>
    </div>
  );
}
