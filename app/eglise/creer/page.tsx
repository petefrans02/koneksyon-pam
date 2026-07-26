"use client";

import { useLang } from "@/lib/LangContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Icon, { IconName } from "@/app/components/Icon";

const GROUP_TYPES = [
  {
    id: "eglise",
    icon: "⛪",
    iconName: "eglise" as IconName,
    color: "from-blue-600 to-indigo-700",
    border: "border-blue-400",
    bg: "bg-blue-50",
    fr: "Église locale", ht: "Legliz lokal", en: "Local Church", es: "Iglesia local",
    descFr: "Pasteur réunissant les membres de son église",
    descHt: "Pastè k ap reyini manm legliz li",
    descEs: "Pastor reuniendo a los miembros de su iglesia",
  },
  {
    id: "chorale",
    icon: "🎵",
    iconName: "chants" as IconName,
    color: "from-pink-500 to-rose-600",
    border: "border-pink-400",
    bg: "bg-pink-50",
    fr: "Chorale / Chœur", ht: "Koral / Chœur", en: "Choir", es: "Coro",
    descFr: "Groupe de louange, musique et adoration",
    descHt: "Gwoup lwanj, mizik ak adorasyon",
    descEs: "Grupo de alabanza, música y adoración",
  },
  {
    id: "priere",
    icon: "🙏",
    iconName: "priere" as IconName,
    color: "from-cyan-500 to-teal-600",
    border: "border-cyan-400",
    bg: "bg-cyan-50",
    fr: "Groupe de prière", ht: "Gwoup lapriyè", en: "Prayer group", es: "Grupo de oración",
    descFr: "Intercession, veillées de prière et jeûne",
    descHt: "Entèsesyon, vigil lapriyè ak jèn",
    descEs: "Intercesión, vigilias de oración y ayuno",
  },
  {
    id: "etude",
    icon: "📖",
    iconName: "etude" as IconName,
    color: "from-purple-500 to-violet-600",
    border: "border-purple-400",
    bg: "bg-purple-50",
    fr: "Étude biblique", ht: "Etid biblik", en: "Bible study", es: "Estudio bíblico",
    descFr: "Approfondissement de la Parole de Dieu",
    descHt: "Etid apwofondi Pawòl Bondye a",
    descEs: "Profundización en la Palabra de Dios",
  },
  {
    id: "jeunesse",
    icon: "🔥",
    iconName: "feu" as IconName,
    color: "from-orange-500 to-amber-600",
    border: "border-orange-400",
    bg: "bg-orange-50",
    fr: "Jeunesse chrétienne", ht: "Jennès kretyen", en: "Christian youth", es: "Jóvenes cristianos",
    descFr: "Groupe pour les jeunes dans la foi",
    descHt: "Gwoup pou jèn yo nan lafwa",
    descEs: "Grupo para los jóvenes en la fe",
  },
  {
    id: "femmes",
    icon: "👩",
    iconName: "utilisateur" as IconName,
    color: "from-rose-400 to-pink-600",
    border: "border-rose-400",
    bg: "bg-rose-50",
    fr: "Femmes de Dieu", ht: "Fanm Bondye", en: "Women of God", es: "Mujeres de Dios",
    descFr: "Groupe de femmes chrétiennes",
    descHt: "Gwoup fanm kretyen",
    descEs: "Grupo de mujeres cristianas",
  },
  {
    id: "hommes",
    icon: "👨",
    iconName: "utilisateur" as IconName,
    color: "from-slate-600 to-gray-700",
    border: "border-slate-400",
    bg: "bg-slate-50",
    fr: "Hommes de Dieu", ht: "Gason Bondye", en: "Men of God", es: "Hombres de Dios",
    descFr: "Groupe d'hommes chrétiens",
    descHt: "Gwoup gason kretyen",
    descEs: "Grupo de hombres cristianos",
  },
  {
    id: "mission",
    icon: "🌍",
    iconName: "mission" as IconName,
    color: "from-green-500 to-emerald-600",
    border: "border-green-400",
    bg: "bg-green-50",
    fr: "Mission / Évangélisation", ht: "Misyon / Evanjelizasyon", en: "Mission / Evangelism", es: "Misión / Evangelización",
    descFr: "Évangélisation et mission mondiale",
    descHt: "Evanjelizasyon ak misyon mondyal",
    descEs: "Evangelización y misión mundial",
  },
  {
    id: "fraternite",
    icon: "🤝",
    iconName: "poignee_main" as IconName,
    color: "from-amber-500 to-yellow-600",
    border: "border-amber-400",
    bg: "bg-amber-50",
    fr: "Fraternité / Cellule", ht: "Fratenite / Selil", en: "Brotherhood / Cell", es: "Fraternidad / Célula",
    descFr: "Cellule de croissance ou fraternité chrétienne",
    descHt: "Selil kwasans oswa fratenite kretyen",
    descEs: "Célula de crecimiento o fraternidad cristiana",
  },
  {
    id: "autre",
    icon: "✝️",
    iconName: "croix" as IconName,
    color: "from-indigo-400 to-blue-500",
    border: "border-indigo-300",
    bg: "bg-indigo-50",
    fr: "Autre groupe chrétien", ht: "Lòt gwoup kretyen", en: "Other Christian group", es: "Otro grupo cristiano",
    descFr: "Tout autre groupe basé sur les valeurs chrétiennes",
    descHt: "Nenpòt lòt gwoup ki baze sou valè kretyen",
    descEs: "Cualquier otro grupo basado en los valores cristianos",
  },
];

const DEFAULT_DEPTS = ["Chorale", "Jeunesse", "Femmes", "Hommes", "Diaconie", "Évangélisation", "Comité", "Enfants"];

export default function CreerEglisePage() {
  const { lang } = useLang();
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDept, setNewDept] = useState("");

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

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !leaderName.trim() || !groupType) return;
    if (groupType === "eglise") {
      setStep(3);
    } else {
      await doCreate();
    }
  }

  function typeName(type: typeof GROUP_TYPES[0]) {
    return lang === "es" ? type.es : lang === "ht" ? type.ht : lang === "en" ? type.en : type.fr;
  }

  function typeDesc(type: typeof GROUP_TYPES[0]) {
    return lang === "es" ? type.descEs : lang === "ht" ? type.descHt : type.descFr;
  }

  async function doCreate(depts: string[] = []) {
    setLoading(true);
    const logo_url = await uploadLogo();
    const selectedType = GROUP_TYPES.find(t => t.id === groupType)!;
    const typeLabel = typeName(selectedType);
    const fullDescription = `[${selectedType.icon} ${typeLabel}]${description.trim() ? ` — ${description.trim()}` : ""}`;

    const res = await fetch("/api/churches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), pastor_name: leaderName.trim(), description: fullDescription, logo_url }),
    });
    const data = await res.json();
    if (data.church) {
      const deptIcons: Record<string, string> = {
        "Chorale": "🎵", "Jeunesse": "🔥", "Femmes": "👩", "Hommes": "👨",
        "Diaconie": "🙏", "Évangélisation": "🌍", "Comité": "💼", "Enfants": "👶",
      };
      if (depts.length > 0) {
        await Promise.all(depts.map(d =>
          fetch("/api/churches/subgroups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ church_id: data.church.id, name: d, icon: deptIcons[d] || "📋" }),
          })
        ));
      }
      setResult({ id: data.church.id, join_code: data.church.join_code, groupType: selectedType });
    }
    setLoading(false);
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (result) {
    return (
      <main className="animate-page-awaken" style={{ background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)", minHeight: "100vh", color: "#fff" }}>
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${result.groupType.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
          <Icon name={result.groupType.iconName} size={40} color="#fff" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">
          {lang === "fr" ? "Groupe créé !" : lang === "ht" ? "Gwoup kreye !" : lang === "es" ? "¡Grupo creado!" : "Group created!"}
        </h1>
        <p className="text-white/35 text-sm mb-6">
          {lang === "fr" ? `Type : ${result.groupType.fr}` : lang === "ht" ? `Tip : ${result.groupType.ht}` : lang === "es" ? `Tipo: ${result.groupType.es}` : `Type: ${result.groupType.en}`}
        </p>
        <p className="text-white/60 mb-5 text-sm">
          {lang === "fr" ? "Partagez ce code avec vos membres pour qu'ils rejoignent :" : lang === "ht" ? "Pataje kòd sa a ak manm ou yo pou yo ka rantre :" : lang === "es" ? "Comparte este código con tus miembros para que se unan:" : "Share this code with your members to join:"}
        </p>
        <div className="rounded-2xl p-8 mb-6" style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)", boxShadow: "0 8px 32px rgba(59,130,246,0.30)" }}>
          <p className="text-blue-200/70 text-xs mb-2 uppercase tracking-widest">
            {lang === "fr" ? "Code du groupe" : lang === "ht" ? "Kòd gwoup la" : lang === "es" ? "Código del grupo" : "Group code"}
          </p>
          <p className="text-4xl font-mono font-bold text-white tracking-[0.3em]">{result.join_code}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <a href={`/eglise/${result.id}`} className="text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)" }}>
            {lang === "fr" ? "Accéder à mon groupe →" : lang === "ht" ? "Ale nan gwoup mwen →" : lang === "es" ? "Ir a mi grupo →" : "Go to my group →"}
          </a>
          <Link href="/communaute" className="text-white/60 px-6 py-3 rounded-full font-medium hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
            {lang === "fr" ? "Voir tous les groupes" : lang === "ht" ? "Wè tout gwoup yo" : lang === "es" ? "Ver todos los grupos" : "See all groups"}
          </Link>
        </div>
      </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 mt-4">{lang === "fr" ? "Connexion en cours..." : lang === "ht" ? "Ap konekte..." : lang === "es" ? "Conectando..." : "Connecting..."}</p>
        </div>
      </main>
    );
  }

  const selectedType = GROUP_TYPES.find(t => t.id === groupType);

  return (
    <main className="animate-page-awaken" style={{ background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)", minHeight: "100vh", color: "#fff" }}>
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <span className="mb-3 flex justify-center">{selectedType ? <Icon name={selectedType.iconName} size={52} /> : <Icon name="groupe" size={52} />}</span>
        <h1 className="text-3xl font-bold text-white">
          {lang === "fr" ? "Créer un groupe" : lang === "ht" ? "Kreye yon gwoup" : lang === "es" ? "Crear un grupo" : "Create a group"}
        </h1>
        <p className="text-white/40 mt-2 text-sm">
          {lang === "fr" ? "Réservé aux groupes fondés sur les valeurs chrétiennes" : lang === "ht" ? "Rezève pou gwoup ki baze sou valè kretyen" : lang === "es" ? "Reservado para grupos fundados en valores cristianos" : "Reserved for groups founded on Christian values"}
        </p>
      </div>

      {/* Christian values notice */}
      <div className="rounded-2xl p-4 mb-6 flex gap-3" style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.20)" }}>
        <span className="shrink-0 flex items-center"><Icon name="croix" size={22} color="#fcd34d" /></span>
        <div>
          <p className="text-amber-300 font-bold text-sm">
            {lang === "fr" ? "Communauté chrétienne" : lang === "ht" ? "Kominote kretyen" : lang === "es" ? "Comunidad cristiana" : "Christian community"}
          </p>
          <p className="text-amber-200/60 text-xs mt-0.5 leading-relaxed">
            {lang === "fr"
              ? "KONEKSYON PAM est une plateforme évangélique. Tous les groupes doivent respecter les valeurs bibliques. Tout contenu contraire à la foi chrétienne sera retiré."
              : lang === "ht"
              ? "KONEKSYON PAM se yon platfòm evanjelik. Tout gwoup dwe respekte valè biblik yo. Tout kontni ki kont lafwa kretyen ap retire."
              : lang === "es"
              ? "KONEKSYON PAM es una plataforma evangélica. Todos los grupos deben respetar los valores bíblicos. Cualquier contenido contrario a la fe cristiana será eliminado."
              : "KONEKSYON PAM is an evangelical platform. All groups must respect biblical values. Any content contrary to Christian faith will be removed."}
          </p>
        </div>
      </div>

      {/* Step 1 — Type selection */}
      {step === 1 && (
        <div>
          <h2 className="text-base font-bold text-white/70 mb-4">
            {lang === "fr" ? "1. Quel type de groupe créez-vous ?" : lang === "ht" ? "1. Ki tip gwoup w ap kreye ?" : lang === "es" ? "1. ¿Qué tipo de grupo estás creando?" : "1. What type of group are you creating?"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GROUP_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setGroupType(type.id)}
                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                style={{
                  background: groupType === type.id ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                  border: groupType === type.id ? "1px solid rgba(96,165,250,0.40)" : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon name={type.iconName} size={26} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white">{typeName(type)}</p>
                  <p className="text-xs text-white/35 mt-0.5 leading-snug">{typeDesc(type)}</p>
                </div>
                {groupType === type.id && <span className="text-[#60a5fa] shrink-0">✓</span>}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!groupType}
            className="mt-6 w-full text-[#04040d] py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #d4a017 0%, #f0c840 100%)" }}
          >
            {lang === "fr" ? "Continuer →" : lang === "ht" ? "Kontinye →" : lang === "es" ? "Continuar →" : "Continue →"}
          </button>
        </div>
      )}

      {/* Step 2 — Group details */}
      {step === 2 && selectedType && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep(1)} className="text-[#60a5fa] text-sm hover:underline flex items-center gap-1">
              ← {lang === "fr" ? "Changer le type" : lang === "ht" ? "Chanje tip" : lang === "es" ? "Cambiar tipo" : "Change type"}
            </button>
            <div className="flex items-center gap-2 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <Icon name={selectedType.iconName} size={16} color="#fff" />
              <span className="text-xs font-bold text-white/70">{typeName(selectedType)}</span>
            </div>
          </div>

          <h2 className="text-base font-bold text-white/70 mb-4">
            {lang === "fr" ? "2. Informations du groupe" : lang === "ht" ? "2. Enfòmasyon gwoup la" : lang === "es" ? "2. Información del grupo" : "2. Group information"}
          </h2>

          <form onSubmit={handleStep2Submit} className="rounded-2xl p-8 space-y-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {lang === "fr" ? "Photo du groupe (optionnel)" : lang === "ht" ? "Foto gwoup la (opsyonèl)" : lang === "es" ? "Foto del grupo (opcional)" : "Group photo (optional)"}
              </label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0"
                  style={{ border: "2px dashed rgba(96,165,250,0.40)" }}
                >
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                    : <Icon name="image" size={30} color="rgba(255,255,255,0.5)" />}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-[#60a5fa] font-medium hover:underline block">
                    {logoPreview
                      ? (lang === "fr" ? "Changer la photo" : lang === "ht" ? "Chanje foto a" : lang === "es" ? "Cambiar foto" : "Change photo")
                      : (lang === "fr" ? "Choisir une photo" : lang === "ht" ? "Chwazi yon foto" : lang === "es" ? "Elegir foto" : "Choose a photo")}
                  </button>
                  <p className="text-xs text-white/25 mt-1">JPG, PNG · max 5MB</p>
                  {logoPreview && (
                    <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(""); }} className="text-xs text-red-400 hover:underline mt-1 block">
                      {lang === "fr" ? "Supprimer" : lang === "ht" ? "Efase" : lang === "es" ? "Eliminar" : "Remove"}
                    </button>
                  )}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Group name */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                {lang === "fr" ? "Nom du groupe *" : lang === "ht" ? "Non gwoup la *" : lang === "es" ? "Nombre del grupo *" : "Group name *"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={
                  selectedType.id === "eglise"
                    ? (lang === "fr" ? "ex: Tabernacle de la Grâce, Église Béthel..." : lang === "ht" ? "ex: Tabènak Gras la, Legliz Bètel..." : lang === "es" ? "ej: Tabernáculo de Gracia, Iglesia Betel..." : "ex: Grace Tabernacle...")
                    : selectedType.id === "chorale"
                    ? (lang === "fr" ? "ex: Chœur Céleste, Chorale Résurrection..." : lang === "ht" ? "ex: Koral Selès, Koral Rezireksyon..." : lang === "es" ? "ej: Coro Celestial, Coro Resurrección..." : "ex: Heavenly Choir...")
                    : (lang === "fr" ? "ex: Groupe Jeunesse Feu, Cellule Prière..." : lang === "ht" ? "ex: Gwoup Jenès Dife, Selil Lapriyè..." : lang === "es" ? "ej: Grupo Juventud Fuego, Célula Oración..." : "ex: Fire Youth Group...")
                }
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
              />
            </div>

            {/* Leader name */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                {selectedType.id === "eglise"
                  ? (lang === "fr" ? "Nom du Pasteur *" : lang === "ht" ? "Non Pastè a *" : lang === "es" ? "Nombre del Pastor *" : "Pastor's name *")
                  : (lang === "fr" ? "Votre nom (responsable du groupe) *" : lang === "ht" ? "Non ou (responsab gwoup) *" : lang === "es" ? "Tu nombre (líder del grupo) *" : "Your name (group leader) *")}
              </label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                required
                placeholder={
                  selectedType.id === "eglise"
                    ? (lang === "fr" ? "ex: Pasteur Jean-Baptiste Pierre" : lang === "ht" ? "ex: Pastè Jan-Batis Pyè" : lang === "es" ? "ej: Pastor Juan Bautista Pérez" : "ex: Pastor John Smith")
                    : (lang === "fr" ? "ex: Marie Dupont, Jean François..." : lang === "ht" ? "ex: Mari Dipon, Jan Franswa..." : lang === "es" ? "ej: María López, Juan González..." : "ex: Mary Smith, John Doe...")
                }
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                {lang === "fr" ? "Description (optionnel)" : lang === "ht" ? "Deskripsyon (opsyonèl)" : lang === "es" ? "Descripción (opcional)" : "Description (optional)"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={lang === "fr" ? "Décrivez votre groupe en quelques mots..." : lang === "ht" ? "Dekri gwoup ou an..." : lang === "es" ? "Describe tu grupo en pocas palabras..." : "Describe your group..."}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full text-[#04040d] py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #d4a017 0%, #f0c840 100%)" }}
            >
              {loading || uploading
                ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-[#04040d] border-t-transparent rounded-full animate-spin" />{lang === "fr" ? "Création..." : lang === "ht" ? "Kap kreye..." : lang === "es" ? "Creando..." : "Creating..."}</span>
                : groupType === "eglise"
                ? (lang === "fr" ? "Continuer → Départements" : lang === "ht" ? "Kontinye → Depatman" : lang === "es" ? "Continuar → Departamentos" : "Continue → Departments")
                : (lang === "fr" ? `Créer ${selectedType.fr}` : lang === "ht" ? `Kreye ${selectedType.ht}` : lang === "es" ? `Crear ${selectedType.es}` : `Create ${selectedType.en}`)}
            </button>
          </form>
        </div>
      )}

      {/* ── STEP 3: Departments (Église only) ── */}
      {step === 3 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep(2)} className="text-[#60a5fa] text-sm hover:underline flex items-center gap-1">
              ← {lang === "fr" ? "Retour" : lang === "ht" ? "Tounen" : lang === "es" ? "Volver" : "Back"}
            </button>
            <div className="flex items-center gap-2 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <Icon name="eglise" size={16} color="#fff" />
              <span className="text-xs font-bold text-white/70">{name}</span>
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-6 text-white" style={{ background: "rgba(29,78,216,0.25)", border: "1px solid rgba(59,130,246,0.30)" }}>
            <p className="font-black text-base mb-1 flex items-center gap-2"><Icon name="exercice" size={18} /> {lang === "fr" ? "Étape obligatoire — Pasteur" : lang === "ht" ? "Etap obligatwa — Pastè" : lang === "es" ? "Paso obligatorio — Pastor" : "Mandatory step — Pastor"}</p>
            <p className="text-blue-200/70 text-sm leading-relaxed">
              {lang === "fr"
                ? "En tant que Pasteur, vous devez lister les départements de votre église. Chaque membre qui rejoindra votre groupe devra obligatoirement choisir son département. Cela permet d'organiser votre église sur la plateforme."
                : lang === "ht"
                ? "Kòm Pastè, ou dwe liste depatman legliz ou yo. Chak manm ki pral rantre nan gwoup ou a dwe obligatoirement chwazi depatman li. Sa pèmèt ou òganize legliz ou sou platfòm nan."
                : lang === "es"
                ? "Como Pastor, debes listar los departamentos de tu iglesia. Cada miembro que se una a tu grupo deberá elegir obligatoriamente su departamento. Esto permite organizar tu iglesia en la plataforma."
                : "As a Pastor, you must list your church departments. Every member joining your group must select their department. This helps organize your church on the platform."}
            </p>
          </div>

          <h2 className="text-base font-bold text-white/70 mb-3">
            {lang === "fr" ? "3. Départements de votre église *" : lang === "ht" ? "3. Depatman legliz ou *" : lang === "es" ? "3. Departamentos de tu iglesia *" : "3. Your church departments *"}
            <span className="ml-2 text-xs font-normal text-red-400">({lang === "fr" ? "min. 2 requis" : lang === "ht" ? "min. 2 obligatwa" : lang === "es" ? "mín. 2 requeridos" : "min. 2 required"})</span>
          </h2>

          <div className="mb-4">
            <p className="text-xs text-white/35 mb-2">{lang === "fr" ? "Suggestions rapides :" : lang === "ht" ? "Ajoute rapid :" : lang === "es" ? "Agregar rápido:" : "Quick add:"}</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_DEPTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => { if (!departments.includes(d)) setDepartments(prev => [...prev, d]); }}
                  className="text-xs px-3 py-1.5 rounded-full transition-all font-medium"
                  style={{
                    background: departments.includes(d) ? "linear-gradient(135deg, #2563eb, #60a5fa)" : "rgba(255,255,255,0.05)",
                    border: departments.includes(d) ? "1px solid transparent" : "1px solid rgba(255,255,255,0.10)",
                    color: departments.includes(d) ? "#fff" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {departments.includes(d) ? "✓ " : "+ "}{d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newDept.trim() && !departments.includes(newDept.trim())) {
                    setDepartments(prev => [...prev, newDept.trim()]);
                    setNewDept("");
                  }
                }
              }}
              placeholder={lang === "fr" ? "Autre département..." : lang === "ht" ? "Lòt depatman..." : lang === "es" ? "Otro departamento..." : "Other department..."}
              className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
            />
            <button
              type="button"
              onClick={() => {
                if (newDept.trim() && !departments.includes(newDept.trim())) {
                  setDepartments(prev => [...prev, newDept.trim()]);
                  setNewDept("");
                }
              }}
              className="text-white px-4 py-3 rounded-xl font-bold"
              style={{ background: "rgba(59,130,246,0.50)", border: "1px solid rgba(96,165,250,0.30)" }}
            >
              +
            </button>
          </div>

          {departments.length > 0 && (
            <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-bold text-white/35 uppercase tracking-wide mb-3">
                {lang === "fr" ? "Départements ajoutés" : lang === "ht" ? "Depatman ajoute" : lang === "es" ? "Departamentos agregados" : "Added departments"} ({departments.length})
              </p>
              <div className="space-y-2">
                {departments.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: "rgba(59,130,246,0.10)" }}>
                    <span className="text-sm font-medium text-white/80 flex items-center gap-2"><Icon name="exercice" size={14} /> {d}</span>
                    <button
                      type="button"
                      onClick={() => setDepartments(prev => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-300 ml-3 flex items-center"
                    >
                      <Icon name="fermer" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { if (departments.length >= 2) doCreate(departments); }}
            disabled={departments.length < 2 || loading}
            className="w-full text-[#04040d] py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #d4a017 0%, #f0c840 100%)" }}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-[#04040d] border-t-transparent rounded-full animate-spin" />{lang === "fr" ? "Création en cours..." : lang === "ht" ? "Kap kreye..." : lang === "es" ? "Creando..." : "Creating..."}</span>
              : departments.length < 2
              ? (lang === "fr" ? `Ajoutez au moins 2 départements (${departments.length}/2)` : lang === "ht" ? `Ajoute omwen 2 depatman (${departments.length}/2)` : lang === "es" ? `Agrega al menos 2 departamentos (${departments.length}/2)` : `Add at least 2 departments (${departments.length}/2)`)
              : (<span className="flex items-center justify-center gap-2"><Icon name="eglise" size={20} /> {lang === "fr" ? `Créer l'église avec ${departments.length} départements` : lang === "ht" ? `Kreye legliz la ak ${departments.length} depatman` : lang === "es" ? `Crear la iglesia con ${departments.length} departamentos` : `Create church with ${departments.length} departments`}</span>)}
          </button>
        </div>
      )}
    </div>
    </main>
  );
}
