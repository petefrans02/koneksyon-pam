"use client";
import { useEffect, useState } from "react";

interface Props { targetDate: string; lang: string; }

export default function Countdown({ targetDate, lang }: Props) {
  const l = lang === "ht" ? "ht" : lang === "en" ? "en" : "fr";
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    function update() { setDiff(Math.max(0, target - Date.now())); }
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const labels = {
    fr: ["Jours", "Heures", "Min", "Sec"],
    ht: ["Jou", "Èd tan", "Min", "Sek"],
    en: ["Days", "Hours", "Min", "Sec"],
  };

  if (diff <= 0) return null;

  const lbl = labels[l];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {[days, hours, minutes, seconds].map((v, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="bg-[#0f2044] border border-[#c5a84f]/20 rounded-xl px-3 py-2 min-w-[48px] text-center">
            <span className="text-[#c5a84f] font-black text-xl tabular-nums leading-none">{String(v).padStart(2, "0")}</span>
          </div>
          <span className="text-white/30 text-[9px] uppercase tracking-wider mt-1">{lbl[i]}</span>
        </div>
      ))}
    </div>
  );
}
