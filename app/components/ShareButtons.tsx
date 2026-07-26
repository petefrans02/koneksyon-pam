"use client";
import { useState } from "react";
import { useLang } from "@/lib/LangContext";
import Icon from "@/app/components/Icon";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

export default function ShareButtons({ url, title, description, compact = false }: ShareButtonsProps) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);

  const shareUrl   = url   || (typeof window !== "undefined" ? window.location.href : "https://koneksyonpam.com");
  const shareTitle = title || "KONEKSYON PAM";
  const shareDesc  = description || "Plateforme évangélique mondiale — Bible, prières, concours bibliques. Rejoignez-nous!";

  const fbUrl   = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const waUrl   = `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareDesc}\n${shareUrl}`)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const label = {
    share:    { fr:"Partager",  ht:"Pataje",   en:"Share",  es:"Compartir" },
    facebook: { fr:"Facebook",  ht:"Facebook", en:"Facebook", es:"Facebook" },
    whatsapp: { fr:"WhatsApp",  ht:"WhatsApp", en:"WhatsApp", es:"WhatsApp" },
    copy:     { fr:"Copier le lien", ht:"Kopye lyen", en:"Copy link", es:"Copiar enlace" },
    copied:   { fr:"Copié !", ht:"Kopye!", en:"Copied!", es:"¡Copiado!" },
  };
  const t = (k: keyof typeof label) => label[k][lang as keyof typeof label[keyof typeof label]] ?? label[k].fr;

  if (compact) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <a href={fbUrl} target="_blank" rel="noopener noreferrer"
          title="Partager sur Facebook"
          style={{
            display:"flex", alignItems:"center", justifyContent:"center",
            width:36, height:36, borderRadius:10,
            background:"#1877F2", color:"#fff",
            textDecoration:"none", transition:"transform .2s, opacity .2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
          <FacebookIcon />
        </a>
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          title="Partager sur WhatsApp"
          style={{
            display:"flex", alignItems:"center", justifyContent:"center",
            width:36, height:36, borderRadius:10,
            background:"#25D366", color:"#fff",
            textDecoration:"none", transition:"transform .2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
          <WhatsAppIcon />
        </a>
        <button onClick={handleCopy}
          title={t("copy")}
          style={{
            display:"flex", alignItems:"center", justifyContent:"center",
            width:36, height:36, borderRadius:10,
            background: copied ? "#2d6a4f" : "#f0ede8",
            color: copied ? "#fff" : "#1a3568",
            border:"none", cursor:"pointer", transition:"all .2s",
          }}>
          {copied ? <Icon name="valider" size={16} /> : <CopyIcon />}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background:"linear-gradient(135deg,#f7f6f2,#fff)",
      border:"1px solid #e8e4de", borderRadius:20,
      padding:"24px 20px",
    }}>
      <p style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:800, color:"#00aac8", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:16 }}>
        <Icon name="etincelles" size={13} /> {t("share")}
      </p>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {/* Facebook */}
        <a href={fbUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"10px 18px", borderRadius:10,
            background:"#1877F2", color:"#fff",
            fontWeight:700, fontSize:"0.85rem",
            textDecoration:"none", transition:"transform .2s, box-shadow .2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(24,119,242,0.35)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = "none";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}>
          <FacebookIcon />
          {t("facebook")}
        </a>

        {/* WhatsApp */}
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"10px 18px", borderRadius:10,
            background:"#25D366", color:"#fff",
            fontWeight:700, fontSize:"0.85rem",
            textDecoration:"none", transition:"transform .2s, box-shadow .2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(37,211,102,0.35)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = "none";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}>
          <WhatsAppIcon />
          {t("whatsapp")}
        </a>

        {/* Copier */}
        <button onClick={handleCopy}
          style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"10px 18px", borderRadius:10,
            background: copied ? "#2d6a4f" : "#fff",
            color: copied ? "#fff" : "#1a3568",
            border:`1.5px solid ${copied ? "#2d6a4f" : "#e8e4de"}`,
            fontWeight:700, fontSize:"0.85rem",
            cursor:"pointer", transition:"all .25s",
          }}>
          {copied ? <Icon name="valider" size={16} /> : <CopyIcon />}
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  );
}
