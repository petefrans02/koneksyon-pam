"use client";

"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { analytics } from "@/lib/analytics";
import Icon, { IconName } from "@/app/components/Icon";

type Lang = "fr" | "ht" | "en" | "es";

const STR = {
  badge:    { fr: "DON REÇU AVEC GRATITUDE",          ht: "DON RESEVWA AK REKONESANS",           en: "DONATION RECEIVED WITH GRATITUDE", es: "DONATIVO RECIBIDO CON GRATITUD"  },
  bless:    { fr: "Que Dieu vous bénisse !",            ht: "Ke Bondye beni ou !",                  en: "God bless you!", es: "¡Que Dios le bendiga!"                    },
  thanks:   { fr: "Merci pour votre générosité.",       ht: "Mèsi pou jenerozite ou.",              en: "Thank you for your generosity.", es: "Gracias por su generosidad."    },
  email:    { fr: "Un email de confirmation vous a été envoyé.", ht: "Yon imèl konfirmasyon te voye ba ou.", en: "A confirmation email was sent to you.", es: "Se le envió un correo de confirmación." },
  body1:    { fr: "Votre don soutient directement KONEKSYON PAM — une plateforme 100 % gratuite, bâtie pour les chrétiens du monde entier.",
               ht: "Don ou sipòte dirèkteman KONEKSYON PAM — yon platfòm 100% gratis, bati pou kretyen toupatou nan mond lan.",
               en: "Your gift directly supports KONEKSYON PAM — a 100% free platform built for Christians around the world.",
               es: "Tu donativo apoya directamente KONEKSYON PAM — una plataforma 100% gratuita construida para cristianos de todo el mundo." },
  body2:    { fr: "Chaque dollar reçu finance nos études bibliques, nos prières, nos concours et le développement continu de la plateforme — pour la gloire de Dieu.",
               ht: "Chak dola resevwa finansman etid biblik nou yo, lapriyè nou yo, konkou nou yo ak devlopman kontinyèl platfòm nan — pou glwa Bondye.",
               en: "Every dollar received funds our Bible studies, prayers, contests, and the continued development of the platform — for the glory of God.",
               es: "Cada dólar recibido financia nuestros estudios bíblicos, oraciones, concursos y el desarrollo continuo de la plataforma — para la gloria de Dios." },
  verse:    { fr: "Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie.",
               ht: "Chak moun ta dwe bay selon sa l rezòl nan kè l, pa ak tristès ni pa fòs ; paske Bondye renmen moun ki bay ak kè kontan.",
               en: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
               es: "Cada uno dé como propuso en su corazón, no de mala gana ni por obligación, porque Dios ama al dador alegre." },
  verseRef: { fr: "2 Corinthiens 9:7",                  ht: "2 Korentyen 9:7",                      en: "2 Corinthians 9:7", es: "2 Corintios 9:7"                 },
  another:  { fr: "Faire un autre don",                  ht: "Fè yon lòt don",                       en: "Make another gift", es: "Hacer otro donativo"                 },
  explore:  { fr: "Continuer à explorer",                ht: "Kontinye eksplore",                    en: "Continue exploring", es: "Seguir explorando"                },
  share:    { fr: "Partager KONEKSYON PAM",              ht: "Pataje KONEKSYON PAM",                 en: "Share KONEKSYON PAM", es: "Compartir KONEKSYON PAM"               },
  emailConfirmSent: { fr: "Email de confirmation envoyé !", ht: "Imèl konfirmasyon voye !", en: "Confirmation email sent!", es: "¡Correo de confirmación enviado!" },
  emailReceive: { fr: "Recevoir une confirmation par email", ht: "Resevwa yon konfirmasyon pa imèl", en: "Receive a confirmation by email", es: "Recibir una confirmación por correo" },
  emailSend: { fr: "Envoyer", ht: "Voye", en: "Send", es: "Enviar" },
  secureNote: { fr: "Paiement sécurisé et traité par PayPal", ht: "Peman sekirize ak tretman pa PayPal", en: "Secure payment processed by PayPal", es: "Pago seguro procesado por PayPal" },
};

const IMPACTS: { icon: IconName; fr: string; ht: string; en: string; es: string }[] = [
  { icon: "bible",      fr: "Études bibliques",      ht: "Etid biblik",      en: "Bible studies", es: "Estudios bíblicos"    },
  { icon: "trophee",    fr: "Concours bibliques",    ht: "Konkou biblik",    en: "Bible contests", es: "Concursos bíblicos"   },
  { icon: "priere",     fr: "Mur de prière",         ht: "Mi lapriyè",       en: "Prayer wall", es: "Muro de oración"      },
  { icon: "etincelles", fr: "Assistant IA",          ht: "Asistan IA",       en: "AI assistant", es: "Asistente IA"     },
  { icon: "monde",      fr: "12+ pays servis",       ht: "12+ peyi sèvi",    en: "12+ countries", es: "12+ países servidos"    },
  { icon: "idee",       fr: "Ressources gratuites",  ht: "Resous gratis",    en: "Free resources", es: "Recursos gratuitos"   },
];

export default function MerciPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as Lang;
  const [show,  setShow]  = useState(false);
  const [rings, setRings] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent,  setEmailSent]  = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const emailCalled = useRef(false);

  const t = (k: keyof typeof STR): string => STR[k][l];

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true),     100);
    const t2 = setTimeout(() => setRings(true),    400);
    const t3 = setTimeout(() => setConfetti(true), 600);

    const params = new URLSearchParams(window.location.search);
    const amt      = parseFloat(params.get("amount") ?? "0");
    const provider = params.get("provider");
    const sessionId = params.get("session_id");

    if (amt > 0) analytics.donateSuccess(amt);

    // Stripe: auto-send thank-you email via session
    if (provider === "stripe" && sessionId && !emailCalled.current) {
      emailCalled.current = true;
      fetch("/api/stripe/thank-you", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      }).then(() => setEmailSent(true)).catch(() => {});
    }

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setEmailLoading(true);
    const params = new URLSearchParams(window.location.search);
    const amt = parseFloat(params.get("amount") ?? "0");
    try {
      const res = await fetch("/api/don/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, amount: amt || 1 }),
      });
      if (res.ok) { setEmailSent(true); }
      else { setEmailError(l === "fr" ? "Erreur. Vérifiez votre email." : l === "ht" ? "Erè. Verifye imèl ou." : l === "es" ? "Error. Verifica tu correo." : "Error. Check your email."); }
    } catch { setEmailError(l === "fr" ? "Erreur réseau." : l === "ht" ? "Erè rezo." : l === "es" ? "Error de red." : "Network error."); }
    setEmailLoading(false);
  }

  const shareText = encodeURIComponent(
    l === "fr" ? "J'ai soutenu KONEKSYON PAM, une plateforme chrétienne 100% gratuite. Rejoins-nous !"
    : l === "ht" ? "Mwen sipòte KONEKSYON PAM, yon platfòm kretyen 100% gratis. Rantre avèk nou !"
    : l === "es" ? "Apoyé KONEKSYON PAM, una plataforma cristiana 100% gratuita. ¡Únete a nosotros!"
    : "I supported KONEKSYON PAM, a 100% free Christian platform. Join us!"
  );
  const shareUrl  = encodeURIComponent("https://koneksyonpam.com");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06080f] via-[#0a1628] to-[#06080f] flex flex-col items-center justify-center px-5 py-16 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #c5a84f12 0%, transparent 55%)" }} />

      {/* Floating confetti dots */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {[...Array(12)].map((_, i) => (
            <div key={i}
              className="absolute w-1.5 h-1.5 rounded-full opacity-60"
              style={{
                background: ["#f59e0b","#34d399","#60a5fa","#f472b6","#a78bfa"][i % 5],
                left: `${8 + i * 7.5}%`,
                top: "-10px",
                animation: `fall ${2 + (i % 3)}s ease-in ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fall {
          from { transform: translateY(-20px) rotate(0deg); opacity: 0.6; }
          to   { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      <div className={`relative z-10 max-w-lg w-full text-center transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Animated halo */}
        <div className="relative inline-flex items-center justify-center mb-8">
          {rings && <>
            <div className="absolute rounded-full border-2 border-amber-400/25 animate-ping"
              style={{ inset: "-6px", animationDuration: "2s" }} />
            <div className="absolute rounded-full border border-amber-400/12 animate-ping"
              style={{ inset: "-18px", animationDuration: "3s", animationDelay: "0.5s" }} />
            <div className="absolute rounded-full border border-amber-400/8 animate-ping"
              style={{ inset: "-30px", animationDuration: "4s", animationDelay: "1s" }} />
          </>}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/25 to-orange-500/15 border-2 border-amber-400/30 flex items-center justify-center">
            <Icon name="priere" size={52} color="#f0c840" />
          </div>
        </div>

        {/* Success badge */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-black px-4 py-2 rounded-full tracking-[0.2em]">
            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white"><Icon name="valider" size={10} color="#fff" /></span>
            {t("badge")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-white font-black leading-tight mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
          {t("bless")}
        </h1>
        <p className="text-amber-300 font-bold text-lg mb-2">{t("thanks")}</p>
        <p className="text-white/30 text-sm mb-8">{t("email")}</p>

        {/* Body text */}
        <div className="text-white/45 text-sm leading-relaxed space-y-3 mb-8">
          <p>{t("body1")}</p>
          <p>{t("body2")}</p>
        </div>

        {/* Impact grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-8">
          {IMPACTS.map((item) => (
            <div key={item.en}
              className="bg-white/4 border border-white/8 rounded-2xl py-4 px-2 text-center hover:bg-white/6 transition-colors">
              <span className="flex justify-center mb-1.5"><Icon name={item.icon} size={24} color="#f0c840" /></span>
              <span className="text-white/35 text-[10px] leading-tight font-medium">{item[l]}</span>
            </div>
          ))}
        </div>

        {/* Bible verse */}
        <div className="border border-amber-400/12 rounded-2xl p-5 mb-8 bg-amber-400/3 text-left">
          <div className="flex gap-3">
            <span className="text-amber-400/40 text-3xl font-serif leading-none mt-1 shrink-0">&ldquo;</span>
            <div>
              <p className="text-amber-100/45 text-sm italic leading-relaxed">{t("verse")}</p>
              <p className="text-amber-400/50 text-xs font-bold mt-2">— {t("verseRef")}</p>
            </div>
          </div>
        </div>

        {/* Email confirmation */}
        <div className="mb-6">
          {emailSent ? (
            <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl py-3 px-4">
              <Icon name="email" size={18} color="#34d399" />
              <p className="text-emerald-400 text-sm font-semibold">{t("emailConfirmSent")}</p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-white/60 text-xs text-center mb-3">
                {t("emailReceive")}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-amber-400/50"
                />
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="bg-amber-400 hover:bg-amber-500 text-black font-black text-xs px-4 rounded-xl disabled:opacity-50 transition-colors"
                >
                  {emailLoading ? "…" : t("emailSend")}
                </button>
              </div>
              {emailError && <p className="text-red-400 text-xs mt-2 text-center">{emailError}</p>}
            </form>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <Link href="/"
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity text-sm shadow-lg shadow-amber-500/20">
            {t("explore")} →
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/don"
              className="bg-white/5 text-white/60 font-semibold px-4 py-3 rounded-2xl border border-white/10 hover:bg-white/8 transition-colors text-sm inline-flex items-center justify-center gap-2">
              <Icon name="coeur" size={16} /> {t("another")}
            </Link>
            <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-green-500/10 text-green-400 font-semibold px-4 py-3 rounded-2xl border border-green-500/20 hover:bg-green-500/15 transition-colors text-sm inline-flex items-center justify-center gap-2">
              <Icon name="partage" size={16} /> {t("share")}
            </a>
          </div>
        </div>

        {/* PayPal secure note */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-white/20">
          <svg width="10" height="12" viewBox="0 0 12 14" fill="none">
            <path d="M6 0L0 2.5V7c0 3.31 2.67 6.4 6 7 3.33-.6 6-3.69 6-7V2.5L6 0z" fill="#009cde" opacity="0.6"/>
          </svg>
          <span>{t("secureNote")}</span>
        </div>
      </div>
    </div>
  );
}
