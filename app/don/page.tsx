"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { DONATION_AMOUNTS } from "@/lib/payment";
import PayPalDonateButton from "@/app/components/PayPalDonateButton";
import StripeDonateButton from "@/app/components/StripeDonateButton";

type Lang = "fr" | "ht" | "en";

const STATS = [
  { n: "24K+", fr: "membres",  ht: "manm",   en: "members"   },
  { n: "12+",  fr: "pays",     ht: "peyi",   en: "countries" },
  { n: "100%", fr: "gratuit",  ht: "gratis", en: "free"      },
];

const AMOUNTS_LABELS: Record<string, Record<Lang, string>> = {
  amt5:  { fr: "Un café",      ht: "Yon kafe",   en: "A coffee"   },
  amt10: { fr: "Un repas",     ht: "Yon repa",   en: "A meal"     },
  amt25: { fr: "Une semaine",  ht: "Yon semèn",  en: "A week"     },
  amt50: { fr: "Un mois",      ht: "Yon mwa",    en: "A month"    },
};

const IMPACT_ITEMS = [
  { icon: "🖥️", fr: "Hébergement & infrastructure", ht: "Ebergman & enfrastrikti",      en: "Hosting & infrastructure"    },
  { icon: "📖", fr: "Études bibliques nouvelles",    ht: "Nouvo etid biblik",              en: "New Bible study content"      },
  { icon: "🏆", fr: "Concours bibliques en direct",  ht: "Konkou biblik an dirèk",         en: "Live biblical contests"       },
  { icon: "🤖", fr: "Assistant IA biblique",          ht: "Asistan IA biblik",              en: "AI Bible assistant"           },
  { icon: "🙏", fr: "Mur de prière & communauté",   ht: "Mi lapriyè & kominote",          en: "Prayer wall & community"      },
  { icon: "🌍", fr: "Expansion vers de nouveaux pays", ht: "Ekspansyon nan nouvo peyi",    en: "Expansion to new countries"   },
];

const VISION_POINTS = [
  {
    icon: "🕊️",
    fr: { title: "Gratuit pour tous, toujours",
          body: "Nous croyons que les ressources bibliques doivent être accessibles à tous — sans abonnement, sans barrière, sans exception." },
    ht: { title: "Gratis pou tout moun, toujou",
          body: "Nou kwè resous biblik yo dwe aksesib pou tout moun — san abònman, san baryè, san eksepsyon." },
    en: { title: "Free for everyone, always",
          body: "We believe biblical resources should be accessible to all — no subscription, no barrier, no exception." },
  },
  {
    icon: "🌍",
    fr: { title: "Une mission mondiale",
          body: "Partir d'Haïti pour toucher le monde francophone, créolophone et anglophone. Une plateforme pour toute l'Église connectée." },
    ht: { title: "Yon misyon mondyal",
          body: "Pati Ayiti pou touche mond frankofòn, kreyolofòn ak anglofòn. Yon platfòm pou tout Legliz konekte." },
    en: { title: "A worldwide mission",
          body: "Starting from Haiti to reach the French, Creole and English-speaking world. One platform for the entire connected Church." },
  },
  {
    icon: "✝️",
    fr: { title: "Bâtir, pas commercialiser",
          body: "KONEKSYON PAM n'est pas une entreprise. C'est une mission chrétienne, financée par la communauté qu'elle sert." },
    ht: { title: "Bati, pa komèsyalize",
          body: "KONEKSYON PAM pa yon antrepriz. Se yon misyon kretyen, finansman pa kominote li sèvi a." },
    en: { title: "Build, not monetize",
          body: "KONEKSYON PAM is not a business. It is a Christian mission, funded by the community it serves." },
  },
];

export default function DonPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;
  const [selected, setSelected] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const finalAmount = customMode ? parseFloat(customAmount) : selected;
  const canDonate = !!(finalAmount && finalAmount >= 1);

  const txt = {
    tag:        { fr: "SOUTENIR LA MISSION",            ht: "SIPÒTE MISYON AN",                    en: "SUPPORT THE MISSION"                },
    title:      { fr: "Votre don construit\nl'Église connectée",  ht: "Don ou bati\nLegliz konekte",       en: "Your gift builds\nthe connected Church" },
    subtitle:   { fr: "KONEKSYON PAM est 100 % gratuit pour tous. Vos dons permettent à la plateforme d'exister et de grandir.",
                  ht: "KONEKSYON PAM se 100% gratis pou tout moun. Don ou yo pèmèt platfòm nan egziste epi grandi.",
                  en: "KONEKSYON PAM is 100% free for everyone. Your donations allow the platform to exist and grow." },
    whyTitle:   { fr: "Pourquoi votre soutien compte",  ht: "Poukisa sipò ou enpòtan",             en: "Why your support matters"           },
    impactTitle:{ fr: "Votre don finance directement",  ht: "Don ou finansman dirèkteman",          en: "Your donation directly funds"       },
    chooseAmt:  { fr: "Choisissez votre soutien",       ht: "Chwazi sipò ou",                       en: "Choose your contribution"           },
    customLbl:  { fr: "Montant libre (USD)",             ht: "Montan pèsonalize (USD)",              en: "Custom amount (USD)"                },
    customLink: { fr: "Saisir un autre montant",         ht: "Antre yon lòt montan",                 en: "Enter a different amount"           },
    secure:     { fr: "Sécurisé par PayPal · Aucune carte requise · Confidentiel",
                  ht: "An sekirite ak PayPal · Okenn kat nesesè · Konfidansyèl",
                  en: "Secured by PayPal · No card required · Confidential"                          },
    morePayments: { fr: "Carte bancaire et autres méthodes disponibles prochainement.",
                    ht: "Kat labank ak lòt metòd pral disponib byento.",
                    en: "Bank card and other payment methods coming soon."                            },
    verse:      { fr: "Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie.",
                  ht: "Chak moun ta dwe bay selon sa l rezòl nan kè l, pa ak tristès ni pa fòs; paske Bondye renmen moun ki bay ak kè kontan.",
                  en: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." },
    verseRef:   { fr: "2 Corinthiens 9:7",               ht: "2 Korentyen 9:7",                      en: "2 Corinthians 9:7"                  },
    transparency: { fr: "Transparence totale : KONEKSYON PAM restera toujours gratuit. Les dons sont volontaires et servent uniquement à soutenir cette mission.",
                    ht: "Transparans total: KONEKSYON PAM pral toujou rete gratis. Don yo volontè epi sèvi sèlman pou sipòte misyon sa a.",
                    en: "Full transparency: KONEKSYON PAM will always remain free. Donations are voluntary and serve only to support this mission." },
    back:       { fr: "← Retour à l'accueil",            ht: "← Tounen akèy",                        en: "← Back to home"                     },
  };

  const t = (k: keyof typeof txt): string => txt[k][l];

  return (
    <div className="min-h-screen bg-[#080d18]">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -20%, #c5a84f18 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-black px-4 py-2 rounded-full mb-8 tracking-[0.25em]">
            ✦ {t("tag")}
          </span>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/20 mx-auto mb-6 flex items-center justify-center">
            <Image src="/logo-kp.png" alt="KP" width={80} height={80} className="rounded-2xl object-cover" />
          </div>
          <h1 className="text-white font-black leading-[1.05] mb-5 whitespace-pre-line"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            {t("title")}
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            {t("subtitle")}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-4">
            {STATS.map((s) => (
              <div key={s.n} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
                <p className="text-2xl font-black text-white">{s.n}</p>
                <p className="text-xs text-white/30 mt-0.5">{s[l]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#c5a84f]/20 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-5 gap-12">

        {/* ── LEFT: Vision + Impact ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-12">

          {/* Why it matters */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400/70 mb-6">
              ✦ {t("whyTitle")}
            </p>
            <div className="flex flex-col gap-5">
              {VISION_POINTS.map((pt) => (
                <div key={pt.icon} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0 mt-0.5">
                    {pt.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">{pt[l].title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{pt[l].body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What it funds */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400/70 mb-6">
              📌 {t("impactTitle")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {IMPACT_ITEMS.map((item) => (
                <div key={item.en} className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <span className="text-white/60 text-sm">{item[l]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bible verse */}
          <div className="border border-amber-400/15 rounded-2xl p-6 bg-amber-400/3">
            <p className="text-amber-100/60 text-sm leading-relaxed italic">
              &ldquo;{t("verse")}&rdquo;
            </p>
            <p className="text-amber-400/60 text-xs font-bold mt-3">— {t("verseRef")}</p>
          </div>

          {/* Transparency */}
          <div className="flex gap-3">
            <span className="text-green-400 text-lg shrink-0 mt-0.5">✓</span>
            <p className="text-white/30 text-sm leading-relaxed">{t("transparency")}</p>
          </div>
        </div>

        {/* ── RIGHT: Donation Card ──────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

              {/* Card header */}
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center">
                <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                  {t("chooseAmt")}
                </p>
                <p className="text-white font-black text-3xl">
                  ${customMode && customAmount ? parseFloat(customAmount) || "—" : selected}
                  <span className="text-white/60 text-sm font-medium ml-1">USD</span>
                </p>
              </div>

              <div className="p-6">
                {/* Amount grid */}
                {!customMode ? (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {DONATION_AMOUNTS.map(({ value, icon, labelKey }) => (
                      <button
                        key={value}
                        onClick={() => setSelected(value)}
                        className={`flex flex-col items-center py-4 rounded-2xl border-2 transition-all group ${
                          selected === value
                            ? "border-amber-400 bg-amber-50 shadow-sm"
                            : "border-stone-200 hover:border-amber-300 hover:bg-amber-50/40"
                        }`}
                      >
                        <span className="text-2xl mb-1">{icon}</span>
                        <span className={`font-black text-lg ${selected === value ? "text-amber-600" : "text-stone-700"}`}>
                          ${value}
                        </span>
                        <span className={`text-[10px] mt-0.5 ${selected === value ? "text-amber-500" : "text-stone-400"}`}>
                          {AMOUNTS_LABELS[labelKey][l]}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">$</span>
                        <input
                          type="number"
                          min="1"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="0"
                          autoFocus
                          className="w-full border-2 border-amber-400 rounded-xl pl-8 pr-4 py-3 font-black text-stone-800 text-lg focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => { setCustomMode(false); setCustomAmount(""); }}
                        className="px-3 py-3 text-stone-400 hover:text-stone-600 border-2 border-stone-200 rounded-xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom amount link */}
                {!customMode && (
                  <button
                    onClick={() => { setCustomMode(true); setSelected(25); }}
                    className="w-full text-center text-xs text-stone-400 hover:text-amber-600 transition-colors mb-4 underline underline-offset-2"
                  >
                    ✨ {t("customLink")}
                  </button>
                )}

                {/* Boutons de paiement */}
                <div className="flex flex-col gap-3 mb-1">
                  <PayPalDonateButton
                    amount={canDonate ? finalAmount : 1}
                    disabled={!canDonate}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-stone-200" />
                    <span className="text-stone-400 text-xs font-medium">ou</span>
                    <div className="flex-1 h-px bg-stone-200" />
                  </div>
                  <StripeDonateButton
                    amount={canDonate ? finalAmount : 1}
                    disabled={!canDonate}
                  />
                </div>

                {/* Security badges */}
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                      <path d="M6 0L0 2.5V7c0 3.31 2.67 6.4 6 7 3.33-.6 6-3.69 6-7V2.5L6 0z" fill="#009cde"/>
                    </svg>
                    <span className="text-[#003087] font-black text-xs">Pay</span>
                    <span className="text-[#009cde] font-black text-xs">Pal</span>
                    <span className="text-stone-400 text-[10px] ml-1">· Paiement 100 % sécurisé</span>
                  </div>
                  <p className="text-center text-[9px] text-stone-300 leading-relaxed">
                    Cryptage SSL 256-bit · Protection acheteur PayPal · Aucune carte stockée chez nous
                  </p>
                </div>

                {/* Coming soon */}
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <p className="text-center text-[10px] text-stone-300">
                    {t("morePayments")}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-1.5 opacity-25">
                    <span className="text-[9px] font-bold text-stone-400 border border-stone-200 rounded px-1.5 py-0.5">VISA</span>
                    <span className="text-[9px] font-bold text-stone-400 border border-stone-200 rounded px-1.5 py-0.5">Mastercard</span>
                    <span className="text-[9px] font-bold text-stone-400 border border-stone-200 rounded px-1.5 py-0.5">Apple Pay</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="text-white/20 text-xs hover:text-white/50 transition-colors">
                {t("back")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

