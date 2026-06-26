"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "fr" | "ht" | "en";

const MESSAGES = [
  {
    fr: "Grâce à votre soutien, KONEKSYON PAM reste entièrement gratuit pour toute la communauté chrétienne mondiale.",
    ht: "Gras ak sipò ou, KONEKSYON PAM rete gratis pou tout kominote kretyen mondyal la.",
    en: "Thanks to your support, KONEKSYON PAM remains completely free for the entire global Christian community.",
  },
  {
    fr: "Chaque don contribue à créer davantage d'études bibliques, de concours et d'outils pour fortifier la foi de milliers de personnes.",
    ht: "Chak don kontribye pou kreye plis etid biblik, konkou ak zouti pou ranfòse lafwa dè milye moun.",
    en: "Every gift helps create more Bible studies, contests and tools to strengthen the faith of thousands.",
  },
  {
    fr: "Votre générosité nous aide à maintenir la plateforme et à développer de nouvelles ressources pour la communauté.",
    ht: "Jenerozite ou ede nou kenbe platfòm nan ak devlope nouvo resous pou kominote a.",
    en: "Your generosity helps us maintain the platform and develop new resources for the community.",
  },
];

const btn = {
  fr: "Soutenir ❤️",
  ht: "Sipòte ❤️",
  en: "Support ❤️",
};

interface Props {
  variant?: "slim" | "card";
}

export default function MissionBanner({ variant = "slim" }: Props) {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % MESSAGES.length), 8000);
    return () => clearInterval(t);
  }, []);

  const msg = MESSAGES[idx][l];

  if (variant === "card") {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1.5">
            ✦ KONEKSYON PAM — {l === "fr" ? "Mission" : l === "ht" ? "Misyon" : "Mission"}
          </p>
          <p className="text-stone-600 text-sm leading-relaxed transition-all">{msg}</p>
        </div>
        <Link href="/don"
          className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-5 py-2.5 rounded-full transition-colors shadow-sm shadow-amber-200">
          {btn[l]}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-t border-amber-100 px-5 py-3 flex items-center justify-between gap-4">
      <p className="text-stone-500 text-xs leading-relaxed flex-1 line-clamp-1">{msg}</p>
      <Link href="/don"
        className="shrink-0 text-amber-600 hover:text-amber-700 font-black text-xs border border-amber-200 hover:border-amber-300 px-4 py-1.5 rounded-full transition-all whitespace-nowrap">
        {btn[l]}
      </Link>
    </div>
  );
}
