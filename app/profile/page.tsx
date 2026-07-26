"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { supabase } from "@/lib/supabase";

const CSS = `
@keyframes prof-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes prof-pop {
  0%   { transform: scale(0.8); opacity: 0; }
  70%  { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes prof-fill {
  from { width: 0%; }
  to   { width: var(--w); }
}
@keyframes prof-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes prof-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
@keyframes badge-in {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(3deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
`;

interface Level { name: string; icon: string; min: number; }
interface Badge { icon: string; name: string; earned: boolean; }
interface Stats {
  contests: number;
  totalScore: number;
  accuracy: number;
  prayers: number;
  correctAnswers: number;
}

interface UserStatsResponse {
  xp: number;
  currentLevel: Level;
  nextLevel: Level | null;
  xpToNext: number;
  xpProgress: number;
  stats: Stats;
  badges: Badge[];
  name: string;
  avatar: string | null;
}

export default function ProfilePage() {
  const { lang } = useLang();
  const l = lang === "ht" ? "ht" : lang === "en" ? "en" : lang === "es" ? "es" : "fr";
  const router = useRouter();
  const [data, setData] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoErr, setPhotoErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setPhotoErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok || !d.url) { setPhotoErr(d.error || "Erreur"); setUploading(false); return; }
      // Enregistre la photo comme avatar du compte → elle apparaîtra dans les concours.
      await supabase.auth.updateUser({ data: { avatar_url: d.url, picture: d.url } });
      setPhoto(d.url);
    } catch { setPhotoErr("network"); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  useEffect(() => {
    fetch("/api/user-stats")
      .then(r => {
        if (r.status === 401) { router.push("/auth"); return null; }
        return r.json();
      })
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020717" }}>
        <style>{CSS}</style>
        <div className="text-white/30 text-sm" style={{ animation: "prof-pulse 1s ease-in-out infinite" }}>
          {l === "fr" ? "Chargement…" : l === "ht" ? "Chajman…" : l === "es" ? "Cargando…" : "Loading…"}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { xp, currentLevel, nextLevel, xpProgress, stats, badges, name, avatar } = data;
  const earnedBadges = badges.filter(b => b.earned);

  return (
    <div className="animate-page-awaken min-h-screen" style={{ background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)" }}>
      <style>{CSS}</style>

      {/* Gold ambient */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 30% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 70%)" }} />

      <div className="relative max-w-lg mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2" style={{ animation: "prof-rise 0.6s ease both" }}>
          <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-sm transition-colors">← {l === "fr" ? "Tableau de bord" : l === "ht" ? "Tablo" : l === "es" ? "Panel" : "Dashboard"}</Link>
        </div>

        {/* Avatar + name + level */}
        <div className="flex flex-col items-center text-center gap-3 py-6" style={{ animation: "prof-rise 0.6s 0.05s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <div className="relative">
            {(photo ?? avatar) ? (
              <img src={photo ?? avatar ?? ""} alt="" className="w-24 h-24 rounded-full object-cover border-4" style={{ borderColor: "rgba(245,158,11,0.50)", boxShadow: "0 0 30px rgba(245,158,11,0.20)" }} />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center font-black text-4xl"
                style={{ borderColor: "rgba(245,158,11,0.50)", background: "rgba(245,158,11,0.10)", color: "#f59e0b", boxShadow: "0 0 30px rgba(245,158,11,0.20)" }}>
                {(name ?? "?")[0]?.toUpperCase()}
              </div>
            )}
            {/* Bouton changer la photo */}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              title={l === "fr" ? "Changer la photo" : l === "ht" ? "Chanje foto" : l === "es" ? "Cambiar foto" : "Change photo"}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg transition-transform hover:scale-110 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "2px solid #050a12", color: "#fff" }}>
              {uploading ? "…" : "📷"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
          </div>
          {photoErr && <p className="text-red-400 text-xs">{photoErr}</p>}
          {!(photo ?? avatar) && (
            <p className="text-amber-400/80 text-xs font-bold">
              {l === "fr" ? "📸 Ajoutez une photo pour les concours" : l === "ht" ? "📸 Mete yon foto pou konkou yo" : l === "es" ? "📸 Añade una foto para los concursos" : "📸 Add a photo for contests"}
            </p>
          )}
          <div>
            <p className="text-white font-black text-xl">{name}</p>
            <p className="font-bold text-sm" style={{ color: "#f59e0b" }}>{currentLevel.icon} {currentLevel.name}</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="rounded-3xl border border-white/8 p-5" style={{ background: "rgba(255,255,255,0.03)", animation: "prof-rise 0.6s 0.1s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">{l === "fr" ? "Expérience" : "XP"}</p>
            <p className="text-amber-400 font-black text-sm">{xp.toLocaleString()} XP</p>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-none"
              style={{ width: `${xpProgress}%`, background: "linear-gradient(90deg, #f59e0b, #fcd34d)" }} />
          </div>
          {nextLevel && (
            <div className="flex justify-between mt-2 text-[11px]">
              <span className="text-white/25">{currentLevel.name}</span>
              <span className="text-amber-400/60">{nextLevel.icon} {nextLevel.name} — {data.xpToNext} XP {l === "fr" ? "restants" : l === "ht" ? "rete" : l === "es" ? "restantes" : "to go"}</span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3" style={{ animation: "prof-rise 0.6s 0.15s ease both", opacity: 0, animationFillMode: "forwards" }}>
          {[
            { val: stats.contests, label: l === "fr" ? "Championnats" : l === "ht" ? "Chanpyona" : l === "es" ? "Campeonatos" : "Championships" },
            { val: `${stats.accuracy}%`, label: l === "fr" ? "Précision" : l === "ht" ? "Presizyon" : l === "es" ? "Precisión" : "Accuracy" },
            { val: stats.correctAnswers, label: l === "fr" ? "Bonnes rép." : l === "ht" ? "Bon repons" : l === "es" ? "Correctas" : "Correct" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-white/6 p-4 text-center" style={{ background: "rgba(255,255,255,0.025)" }}>
              <p className="text-white font-black text-2xl">{s.val}</p>
              <p className="text-white/30 text-[10px] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{ animation: "prof-rise 0.6s 0.2s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <p className="text-white/25 text-xs font-black uppercase tracking-widest mb-3">
            {l === "fr" ? "Badges" : "Badges"} · {earnedBadges.length}/{badges.length}
          </p>
          <div className="grid grid-cols-4 gap-3">
            {badges.map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all"
                style={{
                  background: b.earned ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                  borderColor: b.earned ? "rgba(245,158,11,0.30)" : "rgba(255,255,255,0.05)",
                  opacity: b.earned ? 1 : 0.30,
                  animation: b.earned ? `badge-in 0.4s ${i * 0.06}s ease both` : "none",
                  animationFillMode: "forwards",
                }}>
                <span className="text-2xl">{b.icon}</span>
                <p className="text-[9px] font-bold text-center leading-tight"
                  style={{ color: b.earned ? "#fbbf24" : "rgba(255,255,255,0.25)" }}>
                  {b.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total score */}
        <div className="rounded-3xl border border-white/8 p-5 text-center" style={{ background: "rgba(255,255,255,0.025)", animation: "prof-rise 0.6s 0.25s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <p className="text-white/30 text-xs mb-1">{l === "fr" ? "Score total KONEKSYON PAM" : l === "ht" ? "Skor total KONEKSYON PAM" : l === "es" ? "Puntuación total KONEKSYON PAM" : "Total KONEKSYON PAM score"}</p>
          <p className="font-black text-4xl" style={{ background: "linear-gradient(135deg,#f59e0b,#fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundSize: "200% auto", animation: "prof-shimmer 3s linear infinite" }}>
            {stats.totalScore.toLocaleString()}
          </p>
          <p className="text-white/20 text-xs mt-1">{l === "fr" ? "points accumulés" : l === "ht" ? "pwen akimile" : l === "es" ? "puntos acumulados" : "points accumulated"}</p>
        </div>

        {/* CTA */}
        <Link href="/championnats"
          className="block w-full text-center py-4 rounded-3xl font-black text-base transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#020717", boxShadow: "0 0 25px rgba(245,158,11,0.25)", animation: "prof-rise 0.6s 0.3s ease both", opacity: 0, animationFillMode: "forwards" }}>
          {l === "fr" ? "Rejoindre un championnat →" : l === "ht" ? "Rejwenn yon chanpyona →" : l === "es" ? "Unirse a un campeonato →" : "Join a championship →"}
        </Link>

      </div>
    </div>
  );
}
