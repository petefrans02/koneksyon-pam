"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SECTIONS } from "@/app/components/NavBar";

type Lang = "fr" | "ht" | "en";

const VERSES = [
  { ref: "Jérémie 29:11", fr: "Car je connais les projets que j'ai formés sur vous — projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", ht: "Paske mwen konnen plan mwen genyen pou nou — plan pou fè nou jwenn lapè, pa dezas, pou ba nou yon avni ak espwa.", en: "For I know the plans I have for you — plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: "Philippiens 4:13", fr: "Je puis tout par celui qui me fortifie.", ht: "Mwen ka fè tout bagay nan Kris la ki ban mwen fòs.", en: "I can do all things through Christ who strengthens me." },
  { ref: "Ésaïe 41:10", fr: "Ne crains rien, car je suis avec toi. Ne promène pas des regards inquiets, car je suis ton Dieu.", ht: "Pa pè, paske mwen avèk ou. Pa dekouraje, paske mwen se Bondye ou.", en: "Do not fear, for I am with you. Do not be dismayed, for I am your God." },
  { ref: "Psaumes 23:1", fr: "L'Éternel est mon berger : je ne manquerai de rien.", ht: "Seyè a se gadò mwen — mwen p ap manke anyen.", en: "The Lord is my shepherd — I lack nothing." },
  { ref: "Romains 8:28", fr: "Toutes choses concourent au bien de ceux qui aiment Dieu.", ht: "Tout bagay travay ansanm pou byen moun ki renmen Bondye.", en: "In all things God works for the good of those who love him." },
  { ref: "2 Timothée 1:7", fr: "Dieu ne nous a pas donné un esprit de timidité, mais un esprit de force, d'amour et de sagesse.", ht: "Bondye pa ba nou yon lespri pè, men yon lespri fòs, renmen ak disiplin.", en: "God has not given us a spirit of fear, but of power, love and sound mind." },
  { ref: "Jean 14:6", fr: "Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.", ht: "Mwen se chemen an, verite a, ak lavi a. Pesonn pa ka al jwenn Papa a si se pa pase nan mwen.", en: "I am the way and the truth and the life. No one comes to the Father except through me." },
];

const CHALLENGES = [
  { fr: "Quel est le premier livre de la Bible ?", ht: "Ki premye liv Labib la ?", en: "What is the first book of the Bible?", answer: { fr: "La Genèse", ht: "Jenèz", en: "Genesis" } },
  { fr: "Combien de disciples Jésus avait-il ?", ht: "Konbyen disip Jezi te genyen ?", en: "How many disciples did Jesus have?", answer: { fr: "12", ht: "12", en: "12" } },
  { fr: "Qui a construit l'arche ?", ht: "Ki moun ki te bati bato a ?", en: "Who built the ark?", answer: { fr: "Noé", ht: "Noe", en: "Noah" } },
  { fr: "Dans quelle ville Jésus est-il né ?", ht: "Nan ki vil Jezi te fèt ?", en: "In which city was Jesus born?", answer: { fr: "Bethléem", ht: "Betleyèm", en: "Bethlehem" } },
  { fr: "Combien de jours Jésus a-t-il jeûné dans le désert ?", ht: "Konbyen jou Jezi te jejinen nan dezè a ?", en: "How many days did Jesus fast in the desert?", answer: { fr: "40 jours", ht: "40 jou", en: "40 days" } },
  { fr: "Quel prophète a reçu les Dix Commandements ?", ht: "Ki pwofèt ki te resevwa Dis Kòmandman yo ?", en: "Which prophet received the Ten Commandments?", answer: { fr: "Moïse", ht: "Moyiz", en: "Moses" } },
  { fr: "Qui a écrit le livre des Psaumes en grande partie ?", ht: "Ki moun ki te ekri pifò nan liv Sòm yo ?", en: "Who wrote most of the book of Psalms?", answer: { fr: "Le roi David", ht: "Wa David", en: "King David" } },
];

function getDay() {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
}

export default function AujourduiPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;
  const [contests, setContests] = useState<{ id: string; title: string; status: string; contest_participants: { count: number }[] }[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const day = getDay();
  const verse = VERSES[day % VERSES.length];
  const challenge = CHALLENGES[day % CHALLENGES.length];

  useEffect(() => {
    fetch("/api/contests").then(r => r.json()).then(d => setContests(d.contests || []));
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString(l === "fr" ? "fr-FR" : l === "ht" ? "fr-HT" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const liveContest = contests.find(c => c.status === "active" || c.status === "voting");
  const upcomingContest = contests.find(c => c.status === "upcoming");
  const featuredContest = liveContest || upcomingContest;

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0a1628]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top center, #c5a84f18 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-12 text-center">
          <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-[0.3em] mb-3">✨ KONEKSYON PAM</p>
          <h1 className="text-white font-black mb-2" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
            {l === "fr" ? "Aujourd'hui" : l === "ht" ? "Jodi a" : "Today"}
          </h1>
          <p className="text-white/30 text-sm capitalize">{dateStr}</p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#c5a84f]/30 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Verset du jour */}
        <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2044] to-[#1a3a70] p-8">
          <div className="absolute right-6 top-6 text-[120px] opacity-5 leading-none select-none">✝</div>
          <p className="text-[#c5a84f] text-[10px] font-black uppercase tracking-[0.25em] mb-4">
            📖 {l === "fr" ? "Verset du jour" : l === "ht" ? "Vèsè jou a" : "Verse of the day"}
          </p>
          <blockquote className="text-white font-bold text-xl leading-relaxed mb-4 italic max-w-3xl">
            &ldquo;{verse[l]}&rdquo;
          </blockquote>
          <p className="text-[#c5a84f] text-sm font-bold">{verse.ref}</p>
          <div className="mt-6 flex gap-3">
            <Link href="/etude"
              className="inline-flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-4 py-2 rounded-full transition-all">
              📖 {l === "fr" ? "Approfondir l'étude" : "Etidye plis"}
            </Link>
            <Link href="/prieres"
              className="inline-flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-4 py-2 rounded-full transition-all">
              🙏 {l === "fr" ? "Prier ce verset" : "Priye vèsè sa"}
            </Link>
          </div>
        </div>

        {/* Défi biblique du jour */}
        <div className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ea580c] mb-4">
            🏛️ {l === "fr" ? "Défi biblique du jour" : l === "ht" ? "Defi biblik jou a" : "Biblical challenge"}
          </p>
          <p className="text-[#0f2044] font-bold text-base leading-snug mb-6">{challenge[l]}</p>
          {!showAnswer ? (
            <button onClick={() => setShowAnswer(true)}
              className="w-full py-3 rounded-xl bg-[#ea580c]/10 border border-[#ea580c]/20 text-[#ea580c] text-sm font-bold hover:bg-[#ea580c]/20 transition-colors">
              {l === "fr" ? "Révéler la réponse" : l === "ht" ? "Montre repons nan" : "Reveal answer"}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
              <p className="text-green-700 font-black text-lg">{challenge.answer[l]}</p>
              <p className="text-green-600 text-xs mt-1">{l === "fr" ? "Bonne réponse !" : l === "ht" ? "Bon repons !" : "Correct!"}</p>
            </div>
          )}
          <Link href="/jeu" className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-[#ea580c] mt-4 transition-colors font-semibold">
            {l === "fr" ? "Plus de défis →" : "Plis defi →"}
          </Link>
        </div>

        {/* Concours recommandé */}
        {featuredContest && (
          <div className="rounded-3xl bg-white border border-stone-100 p-6 shadow-sm flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#b45309] mb-4">
              🏆 {l === "fr" ? "Concours du moment" : l === "ht" ? "Konkou kounye a" : "Featured contest"}
            </p>
            <div className="flex items-start gap-3 flex-1">
              {featuredContest.status === "active" && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-1.5 shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-bold text-[#0f2044] text-base leading-snug">{featuredContest.title}</p>
                <p className="text-stone-400 text-xs mt-1">
                  {featuredContest.contest_participants?.[0]?.count ?? 0} {l === "fr" ? "participants" : "patisipan"}
                </p>
              </div>
            </div>
            <Link href={`/concours/${featuredContest.id}`}
              className="mt-5 block w-full text-center py-3 rounded-xl bg-[#0f2044] text-white text-sm font-black hover:bg-[#1d4ed8] transition-colors">
              {featuredContest.status === "active"
                ? (l === "fr" ? "Regarder en direct →" : "Gade an dirèk →")
                : (l === "fr" ? "S'inscrire →" : "Enskri →")}
            </Link>
          </div>
        )}

        {/* L'écosystème — all 6 sections */}
        <div className="md:col-span-2 rounded-3xl bg-white border border-stone-100 p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">
            🌐 {l === "fr" ? "Tout l'écosystème KONEKSYON PAM" : l === "ht" ? "Tout ekosistèm KONEKSYON PAM" : "The full KONEKSYON PAM ecosystem"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {SECTIONS.map(sec => (
              <Link key={sec.href} href={sec.href}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border text-center transition-all hover:shadow-sm group"
                style={{ borderColor: `${sec.color}20`, backgroundColor: `${sec.color}06` }}>
                <span className="text-2xl group-hover:scale-110 transition-transform">{sec.icon}</span>
                <span className="text-[11px] font-bold leading-tight" style={{ color: sec.color }}>{sec[l]}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Dashboard link */}
        <div className="md:col-span-2 rounded-3xl bg-gradient-to-r from-[#0f2044] to-[#1e3a6e] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-black text-lg">{l === "fr" ? "Votre tableau de bord personnel" : l === "ht" ? "Tablo bò pèsonèl ou a" : "Your personal dashboard"}</p>
            <p className="text-white/40 text-sm mt-1">{l === "fr" ? "Niveau, badges, statistiques, concours en cours." : "Nivo, baj, estatistik, konkou an kou."}</p>
          </div>
          <Link href="/dashboard"
            className="shrink-0 bg-[#c5a84f] hover:bg-[#d4b85c] text-[#0f2044] px-6 py-3 rounded-full font-black text-sm transition-colors">
            {l === "fr" ? "Mon Dashboard →" : "Dashboard mwen →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
