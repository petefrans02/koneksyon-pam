"use client";

import { useLang } from "@/lib/LangContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const GROUP_TYPES = [
  {
    id: "eglise",
    icon: "⛪",
    color: "from-blue-600 to-indigo-700",
    border: "border-blue-400",
    bg: "bg-blue-50",
    fr: "Église locale",
    ht: "Legliz lokal",
    en: "Local Church",
    descFr: "Pasteur réunissant les membres de son église",
    descHt: "Pastè k ap reyini manm legliz li",
  },
  {
    id: "chorale",
    icon: "🎵",
    color: "from-pink-500 to-rose-600",
    border: "border-pink-400",
    bg: "bg-pink-50",
    fr: "Chorale / Chœur",
    ht: "Koral / Chœur",
    en: "Choir",
    descFr: "Groupe de louange, musique et adoration",
    descHt: "Gwoup lwanj, mizik ak adorasyon",
  },
  {
    id: "priere",
    icon: "🙏",
    color: "from-cyan-500 to-teal-600",
    border: "border-cyan-400",
    bg: "bg-cyan-50",
    fr: "Groupe de prière",
    ht: "Gwoup lapriyè",
    en: "Prayer group",
    descFr: "Intercession, veillées de prière et jeûne",
    descHt: "Entèsesyon, vigil lapriyè ak jèn",
  },
  {
    id: "etude",
    icon: "📖",
    color: "from-purple-500 to-violet-600",
    border: "border-purple-400",
    bg: "bg-purple-50",
    fr: "Étude biblique",
    ht: "Etid biblik",
    en: "Bible study",
    descFr: "Approfondissement de la Parole de Dieu",
    descHt: "Etid apwofondi Pawòl Bondye a",
  },
  {
    id: "jeunesse",
    icon: "🔥",
    color: "from-orange-500 to-amber-600",
    border: "border-orange-400",
    bg: "bg-orange-50",
    fr: "Jeunesse chrétienne",
    ht: "Jennès kretyen",
    en: "Christian youth",
    descFr: "Groupe pour les jeunes dans la foi",
    descHt: "Gwoup pou jèn yo nan lafwa",
  },
  {
    id: "femmes",
    icon: "👩",
    color: "from-rose-400 to-pink-600",
    border: "border-rose-400",
    bg: "bg-rose-50",
    fr: "Femmes de Dieu",
    ht: "Fanm Bondye",
    en: "Women of God",
    descFr: "Groupe de femmes chrétiennes",
    descHt: "Gwoup fanm kretyen",
  },
  {
    id: "hommes",
    icon: "👨",
    color: "from-slate-600 to-gray-700",
    border: "border-slate-400",
    bg: "bg-slate-50",
    fr: "Hommes de Dieu",
    ht: "Gason Bondye",
    en: "Men of God",
    descFr: "Groupe d'hommes chrétiens",
    descHt: "Gwoup gason kretyen",
  },
  {
    id: "mission",
    icon: "🌍",
    color: "from-green-500 to-emerald-600",
    border: "border-green-400",
    bg: "bg-green-50",
    fr: "Mission / Évangélisation",
    ht: "Misyon / Evanjelizasyon",
    en: "Mission / Evangelism",
    descFr: "Évangélisation et mission mondiale",
    descHt: "Evanjelizasyon ak misyon mondyal",
  },
  {
    id: "fraternite",
    icon: "🤝",
    color: "from-amber-500 to-yellow-600",
    border: "border-amber-400",
    bg: "bg-amber-50",
    fr: "Fraternité / Cellule",
    ht: "Fratenite / Selil",
    en: "Brotherhood / Cell",
    descFr: "Cellule de croissance ou fraternité chrétienne",
    descHt: "Selil kwasans oswa fratenite kretyen",
  },
  {
    id: "autre",
    icon: "✝️",
    color: "from-indigo-400 to-blue-500",
    border: "border-indigo-300",
    bg: "bg-indigo-50",
    fr: "Autre groupe chrétien",
    ht: "Lòt gwoup kretyen",
    en: "Other Christian group",
    descFr: "Tout autre groupe basé sur les valeurs chrétiennes",
    descHt: "Nenpòt lòt gwoup ki baze sou valè kretyen",
  },
];

export default function CreerEglisePage() {
  const { lang } = useLang();
  const [step, setStep] = useState<1 | 2>(1);
  const [groupType, setGroupType] = useState<string>("");
  const [name, setName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; join_code: string; groupType: typeof GROUP_TYPES[0] } | null>(null);
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
    if (!name.trim() || !leaderName.trim() || !groupType) return;
    setLoading(true);

    const logo_url = await uploadLogo();
    const selectedType = GROUP_TYPES.find(t => t.id === groupType)!;
    const typeLabel = lang === "ht" ? selectedType.ht : lang === "en" ? selectedType.en : selectedType.fr;
    const fullDescription = `[${selectedType.icon} ${typeLabel}]${description.trim() ? ` — ${description.trim()}` : ""}`;

    const res = await fetch("/api/churches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), pastor_name: leaderName.trim(), description: fullDescription, logo_url }),
    });
    const data = await res.json();
    if (data.church) {
      setResult({ id: data.church.id, join_code: data.church.join_code, groupType: selectedType });
    }
    setLoading(false);
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${result.groupType.color} flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg`}>
          {result.groupType.icon}
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-1">
          {lang === "fr" ? "Groupe créé !" : lang === "ht" ? "Gwoup kreye !" : "Group created!"}
        </h1>
        <p className="text-stone-400 text-sm mb-6">
          {lang === "fr" ? `Type : ${result.groupType.fr}` : lang === "ht" ? `Tip : ${result.groupType.ht}` : `Type: ${result.groupType.en}`}
        </p>
        <p className="text-stone-600 mb-5 text-sm">
          {lang === "fr" ? "Partagez ce code avec vos membres pour qu'ils rejoignent :" : lang === "ht" ? "Pataje kòd sa a ak manm ou yo pou yo ka rantre :" : "Share this code with your members to join:"}
        </p>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 mb-6 shadow-xl">
          <p className="text-blue-200/70 text-xs mb-2 uppercase tracking-widest">
            {lang === "fr" ? "Code du groupe" : lang === "ht" ? "Kòd gwoup la" : "Group code"}
          </p>
          <p className="text-4xl font-mono font-bold text-white tracking-[0.3em]">{result.join_code}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <a href={`/eglise/${result.id}`} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg">
            {lang === "fr" ? "Accéder à mon groupe →" : lang === "ht" ? "Ale nan gwoup mwen →" : "Go to my group →"}
          </a>
          <Link href="/eglise" className="bg-stone-100 text-stone-600 px-6 py-3 rounded-full font-medium hover:bg-stone-200 transition-colors">
            {lang === "fr" ? "Voir tous les groupes" : lang === "ht" ? "Wè tout gwoup yo" : "See all groups"}
          </Link>
        </div>
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

  const selectedType = GROUP_TYPES.find(t => t.id === groupType);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">{selectedType ? selectedType.icon : "🏠"}</span>
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "Créer un groupe" : lang === "ht" ? "Kreye yon gwoup" : "Create a group"}
        </h1>
        <p className="text-stone-500 mt-2 text-sm">
          {lang === "fr" ? "Réservé aux groupes fondés sur les valeurs chrétiennes" : lang === "ht" ? "Rezève pou gwoup ki baze sou valè kretyen" : "Reserved for groups founded on Christian values"}
        </p>
      </div>

      {/* Christian values notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
        <span className="text-xl shrink-0">✝️</span>
        <div>
          <p className="text-amber-800 font-bold text-sm">
            {lang === "fr" ? "Communauté chrétienne" : lang === "ht" ? "Kominote kretyen" : "Christian community"}
          </p>
          <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
            {lang === "fr"
              ? "KONEKSYON PAM est une plateforme évangélique. Tous les groupes doivent respecter les valeurs bibliques. Tout contenu contraire à la foi chrétienne sera retiré."
              : lang === "ht"
              ? "KONEKSYON PAM se yon platfòm evanjelik. Tout gwoup dwe respekte valè biblik yo. Tout kontni ki kont lafwa kretyen ap retire."
              : "KONEKSYON PAM is an evangelical platform. All groups must respect biblical values. Any content contrary to Christian faith will be removed."}
          </p>
        </div>
      </div>

      {/* Step 1 — Type selection */}
      {step === 1 && (
        <div>
          <h2 className="text-base font-bold text-stone-700 mb-4">
            {lang === "fr" ? "1. Quel type de groupe créez-vous ?" : lang === "ht" ? "1. Ki tip gwoup w ap kreye ?" : "1. What type of group are you creating?"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GROUP_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setGroupType(type.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                  groupType === type.id
                    ? `${type.border} ${type.bg} shadow-md`
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl shrink-0 shadow-sm`}>
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${groupType === type.id ? "text-stone-900" : "text-stone-700"}`}>
                    {lang === "ht" ? type.ht : lang === "en" ? type.en : type.fr}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5 leading-snug">
                    {lang === "ht" ? type.descHt : type.descFr}
                  </p>
                </div>
                {groupType === type.id && (
                  <span className="text-blue-600 shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!groupType}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {lang === "fr" ? "Continuer →" : lang === "ht" ? "Kontinye →" : "Continue →"}
          </button>
        </div>
      )}

      {/* Step 2 — Group details */}
      {step === 2 && selectedType && (
        <div>
          {/* Back + selected type badge */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep(1)} className="text-blue-500 text-sm hover:underline flex items-center gap-1">
              ← {lang === "fr" ? "Changer le type" : lang === "ht" ? "Chanje tip" : "Change type"}
            </button>
            <div className={`flex items-center gap-2 ${selectedType.bg} border ${selectedType.border} rounded-full px-3 py-1`}>
              <span>{selectedType.icon}</span>
              <span className="text-xs font-bold text-stone-700">
                {lang === "ht" ? selectedType.ht : lang === "en" ? selectedType.en : selectedType.fr}
              </span>
            </div>
          </div>

          <h2 className="text-base font-bold text-stone-700 mb-4">
            {lang === "fr" ? "2. Informations du groupe" : lang === "ht" ? "2. Enfòmasyon gwoup la" : "2. Group information"}
          </h2>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5">

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {lang === "fr" ? "Photo du groupe (optionnel)" : lang === "ht" ? "Foto gwoup la (opsyonèl)" : "Group photo (optional)"}
              </label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden shrink-0"
                >
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                    : <span className="text-3xl">📷</span>}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-blue-600 font-medium hover:underline block">
                    {logoPreview ? (lang === "fr" ? "Changer la photo" : "Change photo") : (lang === "fr" ? "Choisir une photo" : lang === "ht" ? "Chwazi yon foto" : "Choose a photo")}
                  </button>
                  <p className="text-xs text-stone-400 mt-1">JPG, PNG · max 5MB</p>
                  {logoPreview && (
                    <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(""); }} className="text-xs text-red-400 hover:underline mt-1 block">
                      {lang === "fr" ? "Supprimer" : "Remove"}
                    </button>
                  )}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Group name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {lang === "fr" ? "Nom du groupe *" : lang === "ht" ? "Non gwoup la *" : "Group name *"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={
                  selectedType.id === "eglise"
                    ? (lang === "fr" ? "ex: Tabernacle de la Grâce, Église Béthel..." : "ex: Grace Tabernacle...")
                    : selectedType.id === "chorale"
                    ? (lang === "fr" ? "ex: Chœur Céleste, Chorale Résurrection..." : "ex: Heavenly Choir...")
                    : (lang === "fr" ? "ex: Groupe Jeunesse Feu, Cellule Prière..." : "ex: Fire Youth Group...")
                }
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white"
              />
            </div>

            {/* Leader name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {selectedType.id === "eglise"
                  ? (lang === "fr" ? "Nom du Pasteur *" : lang === "ht" ? "Non Pastè a *" : "Pastor's name *")
                  : (lang === "fr" ? "Votre nom (responsable du groupe) *" : lang === "ht" ? "Non ou (responsab gwoup) *" : "Your name (group leader) *")}
              </label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                required
                placeholder={
                  selectedType.id === "eglise"
                    ? (lang === "fr" ? "ex: Pasteur Jean-Baptiste Pierre" : "ex: Pastor John Smith")
                    : (lang === "fr" ? "ex: Marie Dupont, Jean François..." : "ex: Mary Smith, John Doe...")
                }
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {lang === "fr" ? "Description (optionnel)" : lang === "ht" ? "Deskripsyon (opsyonèl)" : "Description (optional)"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={lang === "fr" ? "Décrivez votre groupe en quelques mots..." : lang === "ht" ? "Dekri gwoup ou an..." : "Describe your group..."}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:border-blue-500 focus:outline-none focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {loading || uploading
                ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{lang === "fr" ? "Création..." : "Creating..."}</span>
                : (lang === "fr" ? `Créer ${selectedType.fr}` : lang === "ht" ? `Kreye ${selectedType.ht}` : `Create ${selectedType.en}`)}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
