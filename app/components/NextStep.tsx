"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

export type StepContext =
  | "contest" | "study" | "prayer" | "game" | "teaching" | "group"
  | "academy" | "bible" | "community" | "impact" | "foundation" | "worship" | "give"
  | "default";

interface NextStepProps {
  context?: StepContext;
  title?: string;
  exclude?: string; // href to exclude from suggestions
}

const ALL_STEPS: { href: string; icon: IconName; color: string; fr: string; ht: string; en: string; es: string }[] = [
  { href: "/academie",     icon: "academie",     color: "#0891b2", fr: "Explorer l'Académie",       ht: "Eksplore Akademi an",      en: "Explore the Academy",     es: "Explorar la Academia" },
  { href: "/etude",        icon: "bible",        color: "#1d4ed8", fr: "Étudier la Bible",          ht: "Etidye Bib la",            en: "Study the Bible",         es: "Estudiar la Biblia" },
  { href: "/quiz",         icon: "quiz",         color: "#c2410c", fr: "Tester mes connaissances",  ht: "Teste konesans mwen",      en: "Test my knowledge",       es: "Poner a prueba mi saber" },
  { href: "/championnats", icon: "trophee",      color: "#b45309", fr: "Rejoindre un championnat",  ht: "Rejwenn yon chanpyona",    en: "Join a championship",     es: "Unirse a un campeonato" },
  { href: "/communaute",   icon: "communaute",   color: "#16a34a", fr: "Rejoindre la communauté",   ht: "Rantre nan kominote a",    en: "Join the community",      es: "Unirse a la comunidad" },
  { href: "/prieres",      icon: "priere",       color: "#7c3aed", fr: "Prier ensemble",            ht: "Priye ansanm",             en: "Pray together",           es: "Orar juntos" },
  { href: "/impact",       icon: "impact",       color: "#0d9488", fr: "Voir notre impact",         ht: "Wè enpak nou",             en: "See our impact",          es: "Ver nuestro impacto" },
  { href: "/projets",      icon: "fondation",    color: "#a16207", fr: "Découvrir un projet",       ht: "Dekouvri yon pwojè",       en: "Discover a project",      es: "Descubrir un proyecto" },
  { href: "/don",          icon: "don",          color: "#dc2626", fr: "Soutenir la communauté",    ht: "Sipòte kominote a",        en: "Support the community",   es: "Apoyar la comunidad" },
];

const CONTEXT_ORDER: Record<StepContext, string[]> = {
  contest:    ["/etude", "/quiz", "/communaute", "/don"],
  study:      ["/quiz", "/championnats", "/academie", "/prieres"],
  prayer:     ["/etude", "/communaute", "/academie", "/don"],
  game:       ["/championnats", "/etude", "/quiz", "/prieres"],
  teaching:   ["/etude", "/quiz", "/championnats", "/communaute"],
  group:      ["/championnats", "/prieres", "/etude", "/academie"],
  academy:    ["/etude", "/quiz", "/championnats", "/academie"],
  bible:      ["/etude", "/quiz", "/academie", "/championnats"],
  community:  ["/prieres", "/championnats", "/etude", "/don"],
  impact:     ["/projets", "/don", "/communaute", "/academie"],
  foundation: ["/don", "/impact", "/projets", "/communaute"],
  worship:    ["/prieres", "/etude", "/communaute", "/academie"],
  give:       ["/impact", "/projets", "/communaute", "/academie"],
  default:    ["/academie", "/etude", "/championnats", "/communaute"],
};

export default function NextStep({ context = "default", title, exclude }: NextStepProps) {
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;

  const order = CONTEXT_ORDER[context] ?? CONTEXT_ORDER.default;
  let steps = order
    .map((href) => ALL_STEPS.find((s) => s.href === href))
    .filter((s): s is (typeof ALL_STEPS)[number] => !!s && s.href !== exclude);
  // Complète jusqu'à 4 avec d'autres destinations si le contexte en exclut.
  if (steps.length < 4) {
    for (const s of ALL_STEPS) {
      if (steps.length >= 4) break;
      if (s.href !== exclude && !steps.includes(s)) steps.push(s);
    }
  }
  steps = steps.slice(0, 4);

  const defaultTitle =
    l === "fr" ? "Que souhaitez-vous faire maintenant ?"
    : l === "ht" ? "Kisa ou vle fè kounye a ?"
    : l === "es" ? "¿Qué deseas hacer ahora?"
    : "What would you like to do next?";

  const subtitle =
    l === "fr" ? "Continuez l'aventure — il y a tant à découvrir"
    : l === "ht" ? "Kontinye avanti a — gen anpil bagay pou dekouvri"
    : l === "es" ? "Continúa la aventura — hay mucho por descubrir"
    : "Keep going — there's so much to discover";

  return (
    <div className="border-t border-slate-100 py-14 px-5 sm:px-8" style={{ background: "linear-gradient(180deg,#ffffff,#f8fafc)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="kp-ns-spark inline-flex text-amber-500 mb-3"><Icon name="etincelles" size={26} /></span>
          <h3 className="font-black text-[#1a3568] text-xl sm:text-2xl" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>{title || defaultTitle}</h3>
          <p className="text-sm text-slate-400 mt-1.5">{subtitle}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <Link key={s.href} href={s.href}
              className="kp-ns-card group flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: `${s.color}22`, backgroundColor: `${s.color}0a`, animationDelay: `${i * 0.08}s` }}>
              <Icon name={s.icon} size={32} color={s.color} className="group-hover:scale-110 transition-transform" />
              <p className="text-[13px] font-bold text-center leading-tight" style={{ color: s.color }}>{s[l]}</p>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        .kp-ns-spark { animation: kpNsSpark 2.2s ease-in-out infinite; }
        @keyframes kpNsSpark { 0%,100%{transform:scale(1) rotate(0);opacity:.9} 50%{transform:scale(1.15) rotate(8deg);opacity:1} }
        .kp-ns-card { opacity: 0; animation: kpNsIn .5s cubic-bezier(.16,1,.3,1) forwards; }
        @keyframes kpNsIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}
