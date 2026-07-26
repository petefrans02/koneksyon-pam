"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

const MESSAGES = [
  {
    fr: "Grâce à votre soutien, KONEKSYON PAM reste entièrement gratuit pour toute la communauté chrétienne mondiale.",
    ht: "Gras ak sipò ou, KONEKSYON PAM rete gratis pou tout kominote kretyen mondyal la.",
    en: "Thanks to your support, KONEKSYON PAM remains completely free for the entire global Christian community.",
    es: "Gracias a tu apoyo, KONEKSYON PAM sigue siendo completamente gratuito para toda la comunidad cristiana mundial.",
  },
  {
    fr: "Chaque don contribue à créer davantage d'études bibliques, de concours et d'outils pour fortifier la foi de milliers de personnes.",
    ht: "Chak don kontribye pou kreye plis etid biblik, konkou ak zouti pou ranfòse lafwa dè milye moun.",
    en: "Every gift helps create more Bible studies, contests and tools to strengthen the faith of thousands.",
    es: "Cada donación ayuda a crear más estudios bíblicos, concursos y herramientas para fortalecer la fe de miles.",
  },
  {
    fr: "Votre générosité nous aide à maintenir la plateforme et à développer de nouvelles ressources pour la communauté.",
    ht: "Jenerozite ou ede nou kenbe platfòm nan ak devlope nouvo resous pou kominote a.",
    en: "Your generosity helps us maintain the platform and develop new resources for the community.",
    es: "Tu generosidad nos ayuda a mantener la plataforma y desarrollar nuevos recursos para la comunidad.",
  },
];

const btn = {
  fr: "Soutenir",
  ht: "Sipòte",
  en: "Support",
  es: "Apoyar",
};

interface Props {
  variant?: "slim" | "card";
}

export default function MissionBanner({ variant = "slim" }: Props) {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
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
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1.5 flex items-center gap-1">
            <Icon name="etincelles" size={12} /> KONEKSYON PAM — {l === "fr" ? "Mission" : l === "ht" ? "Misyon" : l === "es" ? "Misión" : "Mission"}
          </p>
          <p className="text-stone-600 text-sm leading-relaxed transition-all">{msg}</p>
        </div>
        <Link href="/don"
          className="shrink-0 inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-5 py-2.5 rounded-full transition-colors shadow-sm shadow-amber-200">
          <Icon name="coeur" size={14} /> {btn[l]}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-t border-amber-100 px-5 py-3 flex items-center justify-between gap-4">
      <p className="text-stone-500 text-xs leading-relaxed flex-1 line-clamp-1">{msg}</p>
      <Link href="/don"
        className="shrink-0 inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-black text-xs border border-amber-200 hover:border-amber-300 px-4 py-1.5 rounded-full transition-all whitespace-nowrap">
        <Icon name="coeur" size={13} /> {btn[l]}
      </Link>
    </div>
  );
}
