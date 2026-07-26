"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/championship-types";
import Icon from "@/app/components/Icon";

const CSS = `
@keyframes cert-rise {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cert-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes cert-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.15), inset 0 0 40px rgba(245,158,11,0.03); }
  50%       { box-shadow: 0 0 40px rgba(245,158,11,0.30), inset 0 0 60px rgba(245,158,11,0.06); }
}
@keyframes cert-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes cert-pop {
  0%   { transform: scale(0.6); opacity: 0; }
  70%  { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes cert-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

interface LeaderboardEntry { rank: number; player_name: string; total_score: number; total_correct: number; }
interface LeaderboardResponse { entries: LeaderboardEntry[]; your_rank: number | null; your_score: number; your_correct: number; }

export default function CertificatePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const certRef = useRef<HTMLDivElement>(null);

  const [lb, setLb] = useState<LeaderboardResponse | null>(null);
  const [contestTitle, setContestTitle] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const today = new Date().toLocaleDateString(l === "fr" ? "fr-FR" : l === "ht" ? "fr-HT" : l === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/engine/${id}/leaderboard`).then(r => r.json()).then(setLb).catch(() => {});
    fetch(`/api/user-stats`).then(r => r.json()).then(d => setPlayerName(d.name ?? "")).catch(() => {});

    // Get contest title
    fetch(`/api/contests/${id}`).then(r => r.json()).then(d => {
      if (d.title) setContestTitle(d.title);
    }).catch(() => {});
  }, [id]);

  const rank = lb?.your_rank;
  const score = lb?.your_score ?? 0;
  const correct = lb?.your_correct ?? 0;
  const total = 75;

  const rankLabel = rank === 1 ? (l === "fr" ? "Champion" : l === "ht" ? "Chanpyon" : l === "es" ? "Campeón" : "Champion")
    : rank === 2 ? (l === "fr" ? "Vice-Champion" : l === "ht" ? "Vis-Chanpyon" : l === "es" ? "Vice-Campeón" : "Vice-Champion")
    : rank === 3 ? (l === "fr" ? "3ème Place" : l === "ht" ? "3yèm Plas" : l === "es" ? "3er Lugar" : "3rd Place")
    : `#${rank ?? "—"}`;

  const medalIconColor = rank === 1 ? "#f59e0b" : rank === 2 ? "#9ca3af" : rank === 3 ? "#b45309" : "#c5a84f";

  async function handleShare() {
    const text = l === "fr"
      ? `🏆 Je viens de terminer le Championnat Biblique "${contestTitle}" sur KONEKSYON PAM ! Score : ${score.toLocaleString()} pts — Classement : ${rankLabel}. Rejoins-nous sur koneksyonpam.com`
      : l === "ht"
      ? `🏆 Mwen fini Chanpyona Biblik "${contestTitle}" sou KONEKSYON PAM ! Pwen : ${score.toLocaleString()} pts — Klasman : ${rankLabel}. Antre avè nou sou koneksyonpam.com`
      : l === "es"
      ? `🏆 Acabo de terminar el Campeonato Bíblico "${contestTitle}" en KONEKSYON PAM! Puntuación: ${score.toLocaleString()} pts — Posición: ${rankLabel}. Únete en koneksyonpam.com`
      : `🏆 I completed the Biblical Championship "${contestTitle}" on KONEKSYON PAM! Score: ${score.toLocaleString()} pts — Rank: ${rankLabel}. Join us at koneksyonpam.com`;

    if (navigator.share) {
      await navigator.share({ title: "KONEKSYON PAM", text }).catch(() => {});
      setShareSuccess(true);
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4" style={{ background: "#020717" }}>
      <style>{CSS}</style>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)" }} />

      <div className="relative w-full max-w-sm space-y-6">

        {/* Back */}
        <div style={{ animation: "cert-rise 0.5s ease both" }}>
          <Link href={`/championnats/${id}/podium`} className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← {l === "fr" ? "Retour au podium" : l === "ht" ? "Retounen nan podiyòm" : l === "es" ? "Volver al podio" : "Back to podium"}
          </Link>
        </div>

        {/* Certificate card */}
        <div ref={certRef} className="rounded-3xl border p-8 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(10,12,30,1) 0%, rgba(20,18,40,1) 100%)",
            borderColor: "rgba(245,158,11,0.40)",
            animation: "cert-glow 4s ease-in-out infinite, cert-rise 0.7s 0.1s ease both",
            animationFillMode: "forwards",
            opacity: 0,
          }}>

          {/* Corner ornaments */}
          {["top-3 left-3","top-3 right-3","bottom-3 left-3","bottom-3 right-3"].map((pos,i) => (
            <div key={i} className={`absolute ${pos} w-8 h-8 border-amber-400/25`}
              style={{ borderWidth: 2, borderStyle: i%2===0 ? "solid" : "solid",
                borderBottom: i<2?"none":"", borderTop: i>=2?"none":"",
                borderRight: i%2===0?"none":"", borderLeft: i%2!==0?"none":"",
                borderRadius: i===0?"6px 0 0 0":i===1?"0 6px 0 0":i===2?"0 0 0 6px":"0 0 6px 0" }} />
          ))}

          {/* Logo */}
          <div className="mb-4" style={{ animation: "cert-rise 0.6s 0.3s ease both", opacity: 0, animationFillMode: "forwards" }}>
            <p className="text-[10px] font-black tracking-[0.5em] text-amber-400/40 uppercase mb-1">KONEKSYON PAM</p>
            <div className="w-12 h-0.5 mx-auto rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.50), transparent)" }} />
          </div>

          {/* Certificate title */}
          <p className="text-white/30 text-xs uppercase tracking-[0.3em] mb-4" style={{ animation: "cert-rise 0.6s 0.35s ease both", opacity: 0, animationFillMode: "forwards" }}>
            {l === "fr" ? "Certificat de Participation" : l === "ht" ? "Sètifika Patisipasyon" : l === "es" ? "Certificado de Participación" : "Certificate of Participation"}
          </p>

          {/* Medal */}
          <div className="mb-3 flex justify-center" style={{ animation: "cert-pop 0.6s 0.4s cubic-bezier(0.34,1.56,0.64,1) both", opacity: 0, animationFillMode: "forwards" }}>
            <Icon name="medaille" size={48} color={medalIconColor} />
          </div>

          {/* Rank */}
          {rank && (
            <p className="font-black text-2xl mb-1"
              style={{ background: "linear-gradient(135deg,#f59e0b,#fcd34d,#f59e0b)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "cert-shimmer 3s linear infinite, cert-rise 0.6s 0.45s ease both", animationFillMode: "forwards", opacity: 0 }}>
              {rankLabel}
            </p>
          )}

          {/* Name */}
          <p className="text-white font-black text-xl mb-1" style={{ animation: "cert-rise 0.6s 0.5s ease both", opacity: 0, animationFillMode: "forwards" }}>
            {playerName || "—"}
          </p>

          {/* Contest */}
          <p className="text-white/40 text-xs mb-5 italic" style={{ animation: "cert-rise 0.6s 0.55s ease both", opacity: 0, animationFillMode: "forwards" }}>
            {contestTitle || (l === "fr" ? "Championnat Biblique" : l === "ht" ? "Chanpyona Biblik" : l === "es" ? "Campeonato Bíblico" : "Biblical Championship")}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mb-5" style={{ animation: "cert-rise 0.6s 0.6s ease both", opacity: 0, animationFillMode: "forwards" }}>
            <div className="rounded-xl p-3 border border-white/5" style={{ background: "rgba(245,158,11,0.06)" }}>
              <p className="text-amber-400 font-black text-xl">{score.toLocaleString()}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{l === "fr" ? "Points" : l === "es" ? "Puntos" : "Points"}</p>
            </div>
            <div className="rounded-xl p-3 border border-white/5" style={{ background: "rgba(34,197,94,0.06)" }}>
              <p className="text-green-400 font-black text-xl">{correct}/{total}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{l === "fr" ? "Correctes" : l === "es" ? "Correctas" : "Correct"}</p>
            </div>
          </div>

          {/* Date & seal */}
          <div className="border-t border-white/5 pt-4" style={{ animation: "cert-rise 0.6s 0.65s ease both", opacity: 0, animationFillMode: "forwards" }}>
            <p className="text-white/20 text-[10px]">{today}</p>
            <p className="text-amber-400/20 text-[9px] font-mono mt-1">koneksyonpam.com</p>
          </div>
        </div>

        {/* Share button */}
        <button onClick={handleShare}
          className="w-full py-4 rounded-3xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#020717", boxShadow: "0 0 25px rgba(245,158,11,0.25)", animation: "cert-rise 0.6s 0.4s ease both", opacity: 0, animationFillMode: "forwards" }}>
          {shareSuccess
            ? (l === "fr" ? "✓ Partagé !" : l === "ht" ? "✓ Pataje !" : l === "es" ? "✓ ¡Compartido!" : "✓ Shared!")
            : copied
            ? (l === "fr" ? "✓ Copié !" : l === "ht" ? "✓ Kopye !" : l === "es" ? "✓ ¡Copiado!" : "✓ Copied!")
            : <><Icon name="partage" size={15} /> {l === "fr" ? "Partager mon certificat" : l === "ht" ? "Pataje sètifika mwen" : l === "es" ? "Compartir mi certificado" : "Share my certificate"}</>}
        </button>

        {/* Nav */}
        <div className="flex gap-3" style={{ animation: "cert-rise 0.6s 0.45s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <Link href="/profile" className="flex-1 py-3 rounded-2xl border border-white/8 text-center text-sm font-bold text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
            {l === "fr" ? "Mon profil" : l === "ht" ? "Pwofil mwen" : l === "es" ? "Mi perfil" : "My profile"}
          </Link>
          <Link href="/championnats" className="flex-1 py-3 rounded-2xl border border-white/8 text-center text-sm font-bold text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
            {l === "fr" ? "Championnats" : l === "ht" ? "Chanpyona yo" : l === "es" ? "Campeonatos" : "Championships"}
          </Link>
        </div>

      </div>
    </div>
  );
}
