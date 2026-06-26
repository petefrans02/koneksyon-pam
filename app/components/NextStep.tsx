"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";

type Lang = "fr" | "ht" | "en";

type StepContext = "contest" | "study" | "prayer" | "game" | "teaching" | "group" | "default";

interface NextStepProps {
  context?: StepContext;
  title?: string;
  exclude?: string; // href to exclude from suggestions
}

const ALL_STEPS = [
  { href: "/concours",     icon: "🏆", color: "#b45309", bg: "#fffbeb", fr: "Participer à un concours", ht: "Patisipe nan yon konkou", en: "Join a contest" },
  { href: "/etude",        icon: "📖", color: "#1d4ed8", bg: "#eff6ff", fr: "Étudier la Bible",          ht: "Etidye Bib la",          en: "Study the Bible" },
  { href: "/prieres",      icon: "🙏", color: "#7c3aed", bg: "#f5f3ff", fr: "Prier ensemble",            ht: "Priye ansanm",           en: "Pray together" },
  { href: "/jeu",          icon: "🏛️", color: "#ea580c", bg: "#fff7ed", fr: "Jouer un défi",             ht: "Jwe yon defi",           en: "Play a challenge" },
  { href: "/enseignement", icon: "🎓", color: "#0891b2", bg: "#ecfeff", fr: "Écouter un enseignement",   ht: "Koute yon ansèyman",     en: "Listen to a teaching" },
  { href: "/eglise",       icon: "⛪", color: "#16a34a", bg: "#f0fdf4", fr: "Rejoindre un groupe",       ht: "Rantre nan yon gwoup",   en: "Join a group" },
];

const CONTEXT_ORDER: Record<StepContext, string[]> = {
  contest:  ["/etude", "/prieres", "/eglise", "/jeu"],
  study:    ["/concours", "/jeu", "/enseignement", "/prieres"],
  prayer:   ["/etude", "/concours", "/eglise", "/enseignement"],
  game:     ["/concours", "/etude", "/enseignement", "/prieres"],
  teaching: ["/etude", "/concours", "/prieres", "/eglise"],
  group:    ["/concours", "/prieres", "/etude", "/enseignement"],
  default:  ["/concours", "/etude", "/prieres", "/jeu"],
};

export default function NextStep({ context = "default", title, exclude }: NextStepProps) {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;

  const order = CONTEXT_ORDER[context];
  const steps = order
    .map(href => ALL_STEPS.find(s => s.href === href))
    .filter((s): s is typeof ALL_STEPS[0] => !!s && s.href !== exclude)
    .slice(0, 4);

  const defaultTitle = l === "fr" ? "Que souhaitez-vous faire maintenant ?"
    : l === "ht" ? "Kisa ou vle fè kounye a ?"
    : "What would you like to do next?";

  return (
    <div className="border-t border-stone-100 bg-white py-10 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 text-center mb-6">
          {title || defaultTitle}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map(s => (
            <Link key={s.href} href={s.href}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ borderColor: `${s.color}20`, backgroundColor: `${s.color}05` }}>
              <span className="text-3xl group-hover:scale-110 transition-transform">{s.icon}</span>
              <p className="text-xs font-bold text-center leading-tight" style={{ color: s.color }}>{s[l]}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
