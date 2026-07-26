"use client";

import { useEffect, useState } from "react";
import Icon from "@/app/components/Icon";

const LABELS: Record<string, string> = {
  fr: "Chargement…",
  ht: "Ap chaje…",
  en: "Loading…",
  es: "Cargando…",
};

export default function Loading() {
  const [label, setLabel] = useState("Chargement…");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kp-lang-manual") || localStorage.getItem("kp-lang");
      if (saved && LABELS[saved]) setLabel(LABELS[saved]);
    } catch {}
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <Icon name="croix" size={18} className="text-blue-500" />
          </div>
        </div>
        <p className="text-white/40 text-sm animate-pulse">{label}</p>
      </div>
    </div>
  );
}
