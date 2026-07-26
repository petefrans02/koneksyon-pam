"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Icon, { IconName } from "@/app/components/Icon";

interface Toast { id: string; message: string; icon: IconName; type: "info" | "success" | "gold"; }

interface Props { contestId: string; lang: string; }

export default function ToastNotifications({ contestId, lang }: Props) {
  const l = lang === "ht" ? "ht" : lang === "en" ? "en" : lang === "es" ? "es" : "fr";
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((icon: IconName, message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-3), { id, message, icon, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    const ch = supabase.channel(`toasts-${contestId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "contest_participants", filter: `contest_id=eq.${contestId}` },
        () => {
          const msg = l === "fr" ? "Un nouveau participant vient de rejoindre !" : l === "ht" ? "Yon nouvo patisipan rantre !" : l === "es" ? "¡Un nuevo participante acaba de unirse!" : "New participant joined!";
          addToast("utilisateur", msg, "info");
        }
      )
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "contest_votes", filter: `contest_id=eq.${contestId}` },
        () => {
          const msg = l === "fr" ? "Nouveau vote enregistré !" : l === "ht" ? "Nouvo vòt anrejistre !" : l === "es" ? "¡Nuevo voto registrado!" : "New vote recorded!";
          addToast("coeur", msg, "gold");
        }
      )
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "contests", filter: `id=eq.${contestId}` },
        (payload) => {
          const s = (payload.new as { status: string }).status;
          if (s === "active") {
            const msg = l === "fr" ? "Le concours vient de commencer !" : l === "ht" ? "Konkou a kòmanse !" : l === "es" ? "¡El concurso acaba de comenzar!" : "Contest has started!";
            addToast("trophee", msg, "success");
          }
          if (s === "voting") {
            const msg = l === "fr" ? "Phase de vote ouverte — votez maintenant !" : l === "ht" ? "Faz vote a louvri — vote kounye a !" : l === "es" ? "Fase de votación abierta — ¡vota ahora!" : "Voting phase open — vote now!";
            addToast("jaime", msg, "gold");
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [contestId, l, addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold border backdrop-blur-sm
            ${t.type === "gold"
              ? "bg-[#0f2044]/90 border-[#c5a84f]/40 text-[#c5a84f]"
              : t.type === "success"
              ? "bg-green-900/80 border-green-500/40 text-green-300"
              : "bg-[#0f2044]/90 border-white/10 text-white"
            }`}
          style={{ animation: "slideLeft 0.3s ease", maxWidth: "280px" }}>
          <span className="shrink-0"><Icon name={t.icon} size={18} /></span>
          <span>{t.message}</span>
        </div>
      ))}
      <style jsx global>{`
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
