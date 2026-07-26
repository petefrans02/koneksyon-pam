"use client";
import { useLang } from "@/lib/LangContext";
import { useState } from "react";
import Icon, { IconName } from "@/app/components/Icon";
import { Button } from "@/app/components/ui";

type Lang = "fr" | "ht" | "en" | "es";
type L10n = Partial<Record<Lang, string>>;

export interface ComingSoonLink {
  href: string;
  label: L10n;
  primary?: boolean;
}

export interface ComingSoonProps {
  /** Semantic icon shown at the top (Lucide via <Icon>). */
  icon?: IconName;
  /** Feature title (localized). */
  title: L10n;
  /** Short subtitle / description (localized). */
  subtitle?: L10n;
  /** Accent color (hex). Defaults to the KP gold. */
  accent?: string;
  /** Extra CTA links shown below the email form. A "Return home" link is always added. */
  links?: ComingSoonLink[];
  /** Identifier stored with the email so we know which feature the user awaits. */
  feature?: string;
  /** Hide the email capture form (rare — prefer keeping it). */
  hideEmail?: boolean;
}

function pick(map: L10n | undefined, l: Lang): string {
  if (!map) return "";
  return map[l] ?? map.fr ?? map.en ?? Object.values(map)[0] ?? "";
}

const T = {
  badge:   { fr: "EN DÉVELOPPEMENT", ht: "AP DEVLOPE", en: "IN DEVELOPMENT", es: "EN DESARROLLO" },
  soon:    { fr: "🚀 Très bientôt", ht: "🚀 Byento nèt", en: "🚀 Coming very soon", es: "🚀 Muy pronto" },
  pitch:   {
    fr: "Notre équipe travaille activement afin de vous offrir une expérience exceptionnelle. Laissez votre email pour être informé dès son lancement.",
    ht: "Ekip nou an ap travay di pou ba ou yon eksperyans eksepsyonèl. Kite imel ou pou nou avize ou depi li lanse.",
    en: "Our team is working hard to give you an exceptional experience. Leave your email to be notified the moment it launches.",
    es: "Nuestro equipo trabaja activamente para ofrecerte una experiencia excepcional. Deja tu correo para ser avisado en cuanto se lance.",
  },
  placeholder: { fr: "Votre adresse email", ht: "Adrès imel ou", en: "Your email address", es: "Tu correo electrónico" },
  notify:  { fr: "Me prévenir", ht: "Avize m", en: "Notify me", es: "Avisarme" },
  sending: { fr: "Envoi…", ht: "Voye…", en: "Sending…", es: "Enviando…" },
  thanks:  { fr: "✓ Merci ! Vous serez informé dès le lancement.", ht: "✓ Mèsi ! N ap avize ou depi li lanse.", en: "✓ Thank you! You'll be notified at launch.", es: "✓ ¡Gracias! Te avisaremos en el lanzamiento." },
  error:   { fr: "Une erreur est survenue. Réessayez.", ht: "Yon erè rive. Eseye ankò.", en: "Something went wrong. Try again.", es: "Ocurrió un error. Inténtalo de nuevo." },
  home:    { fr: "← Retour à l'accueil", ht: "← Retounen nan akèy", en: "← Back to home", es: "← Volver al inicio" },
};

export default function ComingSoon({
  icon = "fusee",
  title,
  subtitle,
  accent = "#d4a017",
  links = [],
  feature = "generic",
  hideEmail = false,
}: ComingSoonProps) {
  const { lang } = useLang();
  const l = (["fr", "ht", "en", "es"].includes(lang) ? lang : "fr") as Lang;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang: l, source: `coming-soon:${feature}` }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main
      style={{
        background: "linear-gradient(180deg,#070d1a 0%,#0a1424 45%,#070c18 100%)",
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "72px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes cs-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes cs-glow { 0%,100%{opacity:.5} 50%{opacity:.85} }
        @keyframes cs-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .cs-in { animation: cs-up .7s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      {/* Aurora backdrop */}
      <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", width: 620, height: 320, background: `radial-gradient(ellipse, ${accent}22 0%, transparent 68%)`, filter: "blur(60px)", animation: "cs-glow 7s ease-in-out infinite", pointerEvents: "none" }} />

      <div className="cs-in" style={{ position: "relative", zIndex: 1, maxWidth: 620 }}>
        <div style={{ marginBottom: 22, animation: "cs-float 3.5s ease-in-out infinite", filter: `drop-shadow(0 0 22px ${accent}66)`, display: "inline-flex" }}>
          <Icon name={icon} size={64} strokeWidth={1.5} color={accent} />
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${accent}18`, border: `1px solid ${accent}44`, color: accent, fontSize: 10, fontWeight: 900, padding: "6px 18px", borderRadius: 999, marginBottom: 22, letterSpacing: "0.24em" }}>
          {pick(T.badge, l)}
        </div>

        <h1 style={{ fontSize: "clamp(1.9rem,4.5vw,3rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>{pick(title, l)}</h1>
        <p style={{ color: accent, fontWeight: 800, fontSize: "1.05rem", marginBottom: 18 }}>{pick(T.soon, l)}</p>

        {subtitle && <p style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.98rem", lineHeight: 1.7, marginBottom: 10 }}>{pick(subtitle, l)}</p>}
        <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: 28, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>{pick(T.pitch, l)}</p>

        {!hideEmail && (
          <div style={{ marginBottom: 28 }}>
            {status === "done" ? (
              <p style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.95rem", background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 14, padding: "14px 20px", display: "inline-block" }}>{pick(T.thanks, l)}</p>
            ) : (
              <form onSubmit={subscribe} style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 460, margin: "0 auto" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={pick(T.placeholder, l)}
                  style={{ flex: "1 1 220px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "13px 18px", color: "#fff", fontSize: "0.92rem", outline: "none" }}
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{ background: `linear-gradient(135deg,${accent},#f0c840)`, color: "#04040d", fontWeight: 800, fontSize: "0.92rem", padding: "13px 26px", borderRadius: 12, border: "none", cursor: status === "sending" ? "wait" : "pointer", whiteSpace: "nowrap" }}
                >
                  {status === "sending" ? pick(T.sending, l) : pick(T.notify, l)}
                </button>
              </form>
            )}
            {status === "error" && <p style={{ color: "#f87171", fontSize: "0.82rem", marginTop: 10 }}>{pick(T.error, l)}</p>}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {links.map((lnk, i) => (
            <Button key={i} href={lnk.href} variant={lnk.primary ? "primary" : "ghost"} onDark>
              {pick(lnk.label, l)}
            </Button>
          ))}
          <Button href="/" variant="ghost" onDark>{pick(T.home, l)}</Button>
        </div>
      </div>
    </main>
  );
}
