"use client";

import { useState } from "react";
import { useLang } from "@/lib/LangContext";

type Lang = "fr" | "ht" | "en";

interface ShareButtonProps {
  title: string;         // Contest/study title
  message?: string;      // Custom share message
  url?: string;          // URL to share (defaults to current page)
  context?: "contest" | "study" | "teaching" | "default";
  variant?: "full" | "compact" | "banner";
}

export default function ShareButton({ title, message, url, context = "default", variant = "full" }: ShareButtonProps) {
  const { lang } = useLang();
  const l = (["fr","ht","en"].includes(lang) ? lang : "fr") as Lang;
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const defaultMessages: Record<string, Record<Lang, string>> = {
    contest: {
      fr: `🏆 Je viens de participer au concours biblique "${title}" sur KONEKSYON PAM — la plateforme chrétienne ! Venez nous rejoindre 👇`,
      ht: `🏆 Mwen fèk patisipe nan konkou biblik "${title}" sou KONEKSYON PAM — platfòm kretyen an ! Vin jwenn nou 👇`,
      en: `🏆 I just participated in the biblical contest "${title}" on KONEKSYON PAM — the Christian platform! Come join us 👇`,
    },
    study: {
      fr: `📖 Je viens de terminer une étude biblique sur "${title}" sur KONEKSYON PAM. Venez grandir dans la Parole ! 👇`,
      ht: `📖 Mwen fèk fini yon etid biblik sou "${title}" sou KONEKSYON PAM. Vin grandi nan Pawòl la ! 👇`,
      en: `📖 I just completed a Bible study on "${title}" on KONEKSYON PAM. Come grow in the Word! 👇`,
    },
    teaching: {
      fr: `🎓 J'ai écouté un excellent enseignement "${title}" sur KONEKSYON PAM. Je vous le recommande vivement ! 👇`,
      ht: `🎓 Mwen koute yon ekselan ansèyman "${title}" sou KONEKSYON PAM. Mwen rekòmande li anpil ! 👇`,
      en: `🎓 I just listened to an excellent teaching "${title}" on KONEKSYON PAM. I highly recommend it! 👇`,
    },
    default: {
      fr: `✝️ Découvrez KONEKSYON PAM — la communauté chrétienne francophone mondiale. Prière, étude, concours bibliques et bien plus ! 👇`,
      ht: `✝️ Dekouvri KONEKSYON PAM — kominote kretyen frankofòn mondyal la. Lapriyè, etid, konkou biblik ak anpil lòt bagay ! 👇`,
      en: `✝️ Discover KONEKSYON PAM — the global French-speaking Christian community. Prayer, study, biblical contests and more! 👇`,
    },
  };

  const shareText = message || defaultMessages[context][l];
  const fullShareText = `${shareText}\n${shareUrl}`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `KONEKSYON PAM — ${title}`, text: shareText, url: shareUrl });
        setShared(true);
      } catch {
        // User cancelled — not an error
      }
    } else {
      copyToClipboard();
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for old browsers
      const el = document.createElement("textarea");
      el.value = fullShareText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;

  const txt = {
    share: { fr: "Partager", ht: "Pataje", en: "Share" },
    invite: { fr: "Inviter un ami", ht: "Envite yon zanmi", en: "Invite a friend" },
    church: { fr: "Partager avec mon église", ht: "Pataje ak legliz mwen", en: "Share with my church" },
    copy: { fr: "Copier le lien", ht: "Kopye lyen an", en: "Copy link" },
    copied: { fr: "Lien copié !", ht: "Lyen kopye !", en: "Link copied!" },
    whatsapp: { fr: "WhatsApp", ht: "WhatsApp", en: "WhatsApp" },
    prompt: { fr: "Partagez cette expérience avec votre communauté", ht: "Pataje eksperyans sa a ak kominote ou a", en: "Share this experience with your community" },
  };
  const t = (k: keyof typeof txt) => txt[k][l];

  if (variant === "compact") {
    return (
      <button onClick={share}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-[#1d4ed8] transition-colors border border-stone-200 hover:border-[#1d4ed8]/30 px-4 py-2 rounded-full">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        {t("share")}
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-[#0f2044] to-[#1e3a6e] rounded-2xl p-6">
        <p className="text-white font-black text-base mb-1">{t("prompt")}</p>
        <p className="text-white/40 text-sm mb-5">
          {l === "fr" ? "Un ami pourrait avoir besoin de ça aujourd'hui." : l === "ht" ? "Yon zanmi ka bezwen sa a jodi a." : "A friend might need this today."}
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={share}
            className="flex items-center gap-2 bg-[#c5a84f] hover:bg-[#d4b85c] text-[#0f2044] px-5 py-2.5 rounded-full text-xs font-black transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            {t("invite")}
          </button>
          <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white px-5 py-2.5 rounded-full text-xs font-black transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          <button onClick={copyToClipboard}
            className="flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 px-5 py-2.5 rounded-full text-xs font-bold transition-colors">
            {copied ? "✓ " + t("copied") : t("copy")}
          </button>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5">
      <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">{t("prompt")}</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={share}
          className="flex items-center gap-2 bg-[#0f2044] hover:bg-[#1d4ed8] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          {t("invite")}
        </button>
        <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
        <button onClick={copyToClipboard}
          className="flex items-center gap-2 border border-stone-200 text-stone-500 hover:border-[#1d4ed8] hover:text-[#1d4ed8] px-4 py-2.5 rounded-xl text-xs font-bold transition-colors">
          {copied ? "✓ " + t("copied") : t("copy")}
        </button>
      </div>
    </div>
  );
}
