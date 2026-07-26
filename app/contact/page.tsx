"use client";

import { useLang } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import Icon, { IconName } from "@/app/components/Icon";

export default function ContactPage() {
  const { lang } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Erreur d'envoi");
      setSent(true);
      setName(""); setEmail(""); setMessage("");
    } catch {
      setError(lang === "fr" ? "Erreur lors de l'envoi. Réessayez." : lang === "ht" ? "Erè. Eseye ankò." : lang === "es" ? "Error al enviar. Inténtalo de nuevo." : "Error sending. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const INFO_CARDS: { icon: IconName; title: string; value: string; href: string | null }[] = [
    { icon: "email", title: "Email", value: "contact@koneksyonpam.com", href: "mailto:contact@koneksyonpam.com" },
    { icon: "video", title: "YouTube", value: "KONEKSYON PAM", href: "https://www.youtube.com/channel/UCl01tzkV_QzhPvZ-pf9Ey-g" },
    { icon: "monde", title: lang === "fr" ? "Communauté" : lang === "ht" ? "Kominote" : lang === "es" ? "Comunidad" : "Community", value: lang === "fr" ? "12+ pays" : lang === "ht" ? "12+ peyi" : lang === "es" ? "12+ países" : "12+ countries", href: null },
  ];

  return (
    <main
      className="animate-page-awaken"
      style={{ background: "#fff", minHeight: "100vh", color: "#1c1c2e" }}
    >
      <style>{`
        @keyframes cont-aurora {
          0%,100% { opacity:.52; transform:scale(1) translateY(0); }
          50%      { opacity:.80; transform:scale(1.07) translateY(-14px); }
        }
        @keyframes cont-orb-a {
          0%,100% { transform:translate(0,0); }
          40%      { transform:translate(22px,-26px); }
          70%      { transform:translate(-15px,18px); }
        }
        @keyframes cont-orb-b {
          0%,100% { transform:translate(0,0); }
          35%      { transform:translate(-24px,20px); }
          68%      { transform:translate(18px,-14px); }
        }
        @keyframes cont-ring {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes cont-up {
          from { opacity:0; transform:translateY(22px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes cont-badge {
          from { opacity:0; transform:scale(.82) translateY(-8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes cont-shimmer {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes cont-icon-float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-10px); }
        }
        @keyframes cont-dot-pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(0,170,200,0); }
          50%      { box-shadow:0 0 0 6px rgba(0,170,200,0.22); }
        }
        @keyframes cont-card-in {
          from { opacity:0; transform:translateY(28px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes cont-success-in {
          from { opacity:0; transform:scale(.92); }
          to   { opacity:1; transform:scale(1); }
        }
        .cont-input:focus {
          outline: none;
          border-color: rgba(0,170,200,0.55) !important;
          box-shadow: 0 0 0 3px rgba(0,170,200,0.12);
        }
        .cont-submit-btn {
          transition: transform .32s cubic-bezier(.34,1.56,.64,1), opacity .2s;
        }
        .cont-submit-btn:hover:not(:disabled) { transform: scale(1.03) translateY(-2px); }
        .cont-info-card {
          transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .3s;
        }
        .cont-info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 32px rgba(200,150,15,0.12);
          border-top: 3px solid #c8960f !important;
        }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <div style={{ background:"linear-gradient(135deg,#06122a,#0d2048)", position:"relative", overflow:"hidden", minHeight:"70vh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{
            position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)",
            width:580, height:300,
            background:"radial-gradient(ellipse,rgba(0,170,200,0.12) 0%,transparent 65%)",
            filter:"blur(46px)",
          }} />
        </div>

        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-16 pb-12 text-center" style={{ position:"relative", zIndex:10 }}>
          {/* Badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(0,170,200,0.08)", border:"1px solid rgba(0,170,200,0.25)",
            color:"#38bdf8", fontSize:10, fontWeight:900,
            padding:"6px 18px", borderRadius:999, marginBottom:22, letterSpacing:"0.24em",
            animation:"cont-badge .9s cubic-bezier(.16,1,.3,1) both",
          }}>
            <span style={{
              width:6, height:6, borderRadius:"50%", background:"#00aac8",
              boxShadow:"0 0 8px #00aac8", display:"inline-block",
              animation:"cont-dot-pulse 2s ease-in-out infinite",
            }} />
            <Icon name="email" size={13} /> KONEKSYON PAM
          </div>

          {/* Titre */}
          <h1 style={{
            fontSize:"clamp(2rem,5vw,3rem)", fontWeight:900, lineHeight:1.1, marginBottom:14,
            background:"linear-gradient(135deg,#fff 0%,#38bdf8 55%,#1a3568 100%)",
            backgroundSize:"200% auto",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            animation:"cont-up .9s cubic-bezier(.16,1,.3,1) .2s both, cont-shimmer 7s linear infinite",
          }}>
            {lang === "fr" ? "Contactez-nous" : lang === "ht" ? "Kontakte nou" : lang === "es" ? "Contáctenos" : "Contact us"}
          </h1>

          {/* Sous-titre */}
          <p style={{
            color:"rgba(255,255,255,0.45)", fontSize:"0.95rem", lineHeight:1.65, marginBottom:26,
            animation:"cont-up .9s cubic-bezier(.16,1,.3,1) .38s both",
          }}>
            {lang === "fr" ? "Une question ? Une suggestion ? Écrivez-nous — nous répondons dans les 24h." : lang === "ht" ? "Yon kesyon ? Yon sijesyon ? Ekri nou — n ap reponn nan 24h." : lang === "es" ? "¿Una pregunta? ¿Una sugerencia? Escríbanos — respondemos en 24h." : "A question? A suggestion? Write to us — we reply within 24h."}
          </p>

          {/* Icônes flottantes */}
          <div style={{
            display:"flex", justifyContent:"center", gap:26, marginBottom:8,
            animation:"cont-up .9s cubic-bezier(.16,1,.3,1) .5s both",
          }}>
            {(["email","poignee_main","priere","message","croix"] as IconName[]).map((icon,i) => (
              <span key={icon} style={{
                color:"#38bdf8",
                animation:`cont-icon-float ${3.2+i*0.4}s ease-in-out infinite`,
                animationDelay:`${i*0.16}s`,
                filter:"drop-shadow(0 0 9px rgba(0,170,200,0.32))",
              }}><Icon name={icon} size={24} /></span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-16">

        {/* ══ INFO CARDS ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {INFO_CARDS.map((card, i) => (
            <div key={card.title} className="cont-info-card cont-card-in" style={{
              animationDelay:`${i*0.1}s`,
              animation: visible ? `cont-card-in .65s cubic-bezier(.16,1,.3,1) ${i*0.1}s both` : "none",
              background:"#fff", border:"1px solid #e8e4de",
              borderRadius:18, padding:"18px 16px", textAlign:"center",
            }}>
              <span style={{ display:"inline-flex", marginBottom:8, color:"#00aac8" }}><Icon name={card.icon} size={26} /></span>
              <p style={{ color:"#1a3568", fontWeight:800, fontSize:"0.82rem", marginBottom:4 }}>{card.title}</p>
              {card.href ? (
                <a href={card.href} target="_blank" rel="noopener noreferrer"
                  style={{ color:"#00aac8", fontSize:"0.72rem", textDecoration:"none", wordBreak:"break-all" as const }}>
                  {card.value}
                </a>
              ) : (
                <p style={{ color:"#4a6080", fontSize:"0.72rem" }}>{card.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* ══ FORM / SUCCESS ══════════════════════════════════════════ */}
        {sent ? (
          <div style={{
            background:"#fffbf0", border:"1px solid #e8c86c", borderLeft:"4px solid #c8960f",
            borderRadius:24, padding:"48px 32px", textAlign:"center", position:"relative", overflow:"hidden",
            animation:"cont-success-in .6s cubic-bezier(.16,1,.3,1) both",
          }}>
            <div style={{ marginBottom:16, display:"flex", justifyContent:"center", color:"#16a34a" }}><Icon name="succes" size={52} /></div>
            <h2 style={{ color:"#1a3568", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:900, fontSize:"1.3rem", marginBottom:10 }}>
              {lang === "fr" ? "Message envoyé !" : lang === "ht" ? "Mesaj voye !" : lang === "es" ? "¡Mensaje enviado!" : "Message sent!"}
            </h2>
            <p style={{ color:"#4a6080", fontSize:"0.9rem", lineHeight:1.65, marginBottom:20 }}>
              {lang === "fr" ? "Nous vous répondrons bientôt. Que Dieu vous bénisse." : lang === "ht" ? "N ap reponn ou byento. Bondye beni ou." : lang === "es" ? "Le responderemos pronto. Que Dios le bendiga." : "We will respond soon. God bless you."}
            </p>
            <button onClick={() => setSent(false)} style={{
              color:"#c8960f", background:"rgba(200,150,15,0.08)", border:"1px solid rgba(200,150,15,0.25)",
              padding:"9px 22px", borderRadius:999, fontSize:"0.82rem", fontWeight:700, cursor:"pointer",
            }}>
              {lang === "fr" ? "Envoyer un autre message" : lang === "ht" ? "Voye yon lòt mesaj" : lang === "es" ? "Enviar otro mensaje" : "Send another message"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background:"#fff", border:"1px solid #e8e4de",
            borderRadius:24, padding:"32px 28px", position:"relative", overflow:"hidden",
            boxShadow:"0 4px 24px rgba(0,0,0,0.06)",
            animation: visible ? "cont-card-in .65s cubic-bezier(.16,1,.3,1) .25s both" : "none",
          }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#c8960f,#00aac8,#c8960f)", opacity:.6 }} />

            {/* Name */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:700, color:"#4a5568", marginBottom:6 }}>
                {lang === "fr" ? "Nom" : lang === "ht" ? "Non" : lang === "es" ? "Nombre" : "Name"}
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)} required
                className="cont-input"
                style={{
                  width:"100%", boxSizing:"border-box" as const,
                  background:"#ffffff", border:"1px solid #e8e4de",
                  borderRadius:12, padding:"12px 16px", color:"#1c1c2e", fontSize:"0.88rem",
                  transition:"border-color .2s, box-shadow .2s",
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:700, color:"#4a5568", marginBottom:6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="cont-input"
                style={{
                  width:"100%", boxSizing:"border-box" as const,
                  background:"#ffffff", border:"1px solid #e8e4de",
                  borderRadius:12, padding:"12px 16px", color:"#1c1c2e", fontSize:"0.88rem",
                  transition:"border-color .2s, box-shadow .2s",
                }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:700, color:"#4a5568", marginBottom:6 }}>
                {lang === "fr" ? "Message" : lang === "ht" ? "Mesaj" : lang === "es" ? "Mensaje" : "Message"}
              </label>
              <textarea
                value={message} onChange={e => setMessage(e.target.value)} required rows={5}
                className="cont-input"
                style={{
                  width:"100%", boxSizing:"border-box" as const,
                  background:"#ffffff", border:"1px solid #e8e4de",
                  borderRadius:12, padding:"12px 16px", color:"#1c1c2e", fontSize:"0.88rem",
                  resize:"none" as const, transition:"border-color .2s, box-shadow .2s",
                }}
              />
            </div>

            {error && (
              <p style={{ color:"#dc2626", fontSize:"0.82rem", textAlign:"center", marginBottom:14 }}>{error}</p>
            )}

            <button
              type="submit" disabled={sending}
              className="cont-submit-btn"
              style={{
                width:"100%", background:"linear-gradient(135deg,#c8960f,#e8b84b)",
                color:"#0d1d3d", fontWeight:900, padding:"14px", borderRadius:14,
                fontSize:"0.92rem", border:"none", cursor:sending?"not-allowed":"pointer",
                opacity:sending?0.65:1, boxShadow:"0 6px 24px rgba(200,150,15,0.28)",
              }}
            >
              {sending
                ? (lang === "fr" ? "Envoi en cours…" : lang === "ht" ? "Ap voye…" : lang === "es" ? "Enviando…" : "Sending…")
                : (lang === "fr" ? "Envoyer le message →" : lang === "ht" ? "Voye mesaj la →" : lang === "es" ? "Enviar mensaje →" : "Send message →")}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
