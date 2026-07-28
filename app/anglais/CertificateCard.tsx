"use client";

// LE CERTIFICAT — délivré une fois le parcours terminé.
//
// MODÈLE : l'apprentissage est 100 % gratuit. Seul le certificat officiel se
// paie, et seulement APRÈS avoir tout terminé. Avant paiement, l'élève voit un
// aperçu filigrané — il sait exactement ce qu'il obtiendra.
//
// Le déblocage est décidé PAR LE SERVEUR, qui interroge PayPal : le navigateur
// ne peut pas se déclarer payé.

import { useEffect, useState } from "react";

interface Cert {
  code: string; holder_name: string; program: string;
  level?: string | null; lessons_done?: number; xp?: number; issued_at: string;
  paid?: boolean;
}

export default function CertificateCard({
  program, level, lessons, xp, lang = "fr",
}: { program: string; level?: string; lessons: number; xp: number; lang?: "fr" | "ht" }) {
  const [cert, setCert] = useState<Cert | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [price, setPrice] = useState("10.00");
  const [paying, setPaying] = useState(false);

  // Prix affiche : lu cote serveur pour rester la seule source de verite.
  useEffect(() => {
    fetch("/api/certificates/pay").then((r) => r.json()).then((d) => d.price && setPrice(d.price)).catch(() => {});
  }, []);

  // Paiement : on cree la commande, PayPal encaisse, puis le SERVEUR verifie
  // aupres de PayPal avant de debloquer. Le navigateur ne decide de rien.
  async function pay() {
    if (!cert) return;
    setPaying(true); setErr("");
    try {
      const o = await fetch("/api/paypal/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price }),
      }).then((r) => r.json());
      if (!o.orderID) { setErr(o.error ?? "Paiement indisponible"); setPaying(false); return; }

      // Redirection vers PayPal, puis retour sur cette page.
      const back = `${window.location.origin}/anglais?cert=${cert.code}&order=${o.orderID}`;
      window.location.href = `https://www.paypal.com/checkoutnow?token=${o.orderID}&redirect_uri=${encodeURIComponent(back)}`;
    } catch {
      setErr("Reseau"); setPaying(false);
    }
  }

  // Retour de PayPal : on confirme cote serveur.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const code = p.get("cert"), order = p.get("order");
    if (!code || !order) return;
    fetch("/api/certificates/pay", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, orderID: order }),
    }).then((r) => r.json()).then((d) => {
      if (d.ok) setCert((c) => (c ? { ...c, paid: true } : c));
      else if (d.error) setErr(d.error);
      window.history.replaceState({}, "", window.location.pathname);
    }).catch(() => {});
  }, []);

  const t = {
    fr: { get: "Obtenir mon certificat", loading: "Génération…", need: "Connecte-toi pour recevoir ton certificat.",
          title: "Certificat de participation", awarded: "décerné à", completed: "pour avoir terminé le programme",
          lessons: "leçons", pts: "points", code: "Code de vérification", verify: "Vérifiable sur",
          print: "Imprimer / PDF", pay: "Obtenir le certificat officiel", price: "Cours gratuit. Le certificat officiel coute", paying: "Ouverture du paiement...", preview: "Apercu - non officiel", paidOk: "Certificat officiel debloque",
          legal: "Ce certificat atteste la réussite d'un cours en ligne dispensé par KONEKSYON PAM ACADEMY. Il ne constitue pas un diplôme accrédité et ne donne droit à aucun crédit académique." },
    ht: { get: "Jwenn sètifika mwen", loading: "Ap jenere…", need: "Konekte ou pou resevwa sètifika ou.",
          title: "Sètifika patisipasyon", awarded: "bay", completed: "paske li fini pwogram nan",
          lessons: "leson", pts: "pwen", code: "Kòd verifikasyon", verify: "Verifye sou",
          print: "Enprime / PDF", pay: "Jwenn sètifika ofisyèl la", price: "Kou a gratis. Sètifika ofisyèl la koute", paying: "Ap louvri peman an...", preview: "Apèsi - pa ofisyèl", paidOk: "Sètifika ofisyèl debloke",
          legal: "Sètifika sa a atèste ke moun nan fini yon kou anliy nan KONEKSYON PAM ACADEMY. Li pa yon diplòm akredite e li pa bay okenn kredi akademik." },
  }[lang];

  async function issue() {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program, level, lessons, xp }),
      });
      const d = await res.json();
      if (d.certificate) setCert(d.certificate);
      else if (res.status === 401) setErr(t.need);
      // Le serveur refuse tant que le travail n'est pas fait : on explique
      // precisement ce qui manque, plutot qu'une erreur seche.
      else if (d.error === "Parcours incomplet") setErr(`Il te reste ${d.missing} lecon(s) a terminer (${d.done}/${d.total}).`);
      else if (d.error === "Score insuffisant") setErr(`Il te faut ${d.xpRequired} points pour le certificat. Tu en as ${d.xp}. Refais les lecons ou tu as perdu des coeurs.`);
      else if (d.error === "Examen non réussi") setErr("Passe d\u2019abord l\u2019examen final pour obtenir ton certificat.");
      else setErr(d.error ?? "Erreur");
    } catch { setErr("Réseau"); }
    setBusy(false);
  }

  if (!cert) {
    return (
      <div style={{ textAlign: "center", margin: "18px 0" }}>
        <button onClick={issue} disabled={busy}
          style={{ background: "linear-gradient(135deg,#e6b83c,#a97d18)", color: "#1a1203", border: "none", borderRadius: 14, padding: "14px 28px", fontWeight: 900, fontSize: 15, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
          🎓 {busy ? t.loading : t.get}
        </button>
        {err && <p style={{ color: "#f87171", fontSize: 13, marginTop: 10 }}>{err}</p>}
      </div>
    );
  }

  return (
    <>
      {/* À l'impression, seul le certificat apparaît. */}
      <style>{`@media print { body * { visibility: hidden } .kp-cert, .kp-cert * { visibility: visible } .kp-cert { position: absolute; inset: 0; margin: 0 } }`}</style>

      <div className="kp-cert" style={{
        background: "linear-gradient(160deg,#fffdf5,#f6efdc)", color: "#2a1e02",
        border: "10px double #c8960f", borderRadius: 8,
        padding: "clamp(20px,4vw,40px)", margin: "18px 0", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Apercu : filigrane tant que le certificat officiel n'est pas obtenu. */}
        {!cert.paid && (
          <span style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(22px,5vw,44px)", fontWeight: 900, color: "rgba(169,125,24,0.16)",
            transform: "rotate(-22deg)", letterSpacing: "0.1em", pointerEvents: "none", textTransform: "uppercase",
          }}>{t.preview}</span>
        )}
        <p style={{ letterSpacing: "0.3em", fontSize: 10, fontWeight: 900, color: "#a97d18", margin: 0 }}>KONEKSYON PAM ACADEMY</p>
        <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(20px,3.6vw,30px)", fontWeight: 900, margin: "10px 0 4px" }}>
          {t.title}
        </p>
        <div style={{ width: 70, height: 2, background: "#c8960f", margin: "8px auto 16px" }} />

        <p style={{ fontSize: 12, color: "#6b5a2a", margin: 0 }}>{t.awarded}</p>
        <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "4px 0 10px" }}>
          {cert.holder_name}
        </p>
        <p style={{ fontSize: 13, color: "#6b5a2a", margin: 0 }}>{t.completed}</p>
        <p style={{ fontWeight: 900, fontSize: "clamp(15px,2.6vw,22px)", margin: "4px 0 16px" }}>
          {cert.program}{cert.level ? ` — ${cert.level}` : ""}
        </p>

        <div style={{ display: "flex", gap: 22, justifyContent: "center", fontSize: 13, color: "#6b5a2a", flexWrap: "wrap" }}>
          <span><b style={{ color: "#2a1e02" }}>{cert.lessons_done}</b> {t.lessons}</span>
          <span><b style={{ color: "#2a1e02" }}>{cert.xp}</b> {t.pts}</span>
          <span>{new Date(cert.issued_at).toLocaleDateString(lang === "ht" ? "fr-HT" : "fr-FR")}</span>
        </div>

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #dfc98a" }}>
          <p style={{ fontSize: 10, color: "#6b5a2a", margin: 0 }}>{t.code}</p>
          <p style={{ fontFamily: "monospace", fontWeight: 900, letterSpacing: "0.14em", fontSize: 15, margin: "3px 0" }}>{cert.code}</p>
          <p style={{ fontSize: 10, color: "#8a7538", margin: 0 }}>{t.verify} koneksyonpam.com/verifier/{cert.code}</p>
        </div>

        {/* Mention légale — obligatoire pour rester dans le cadre. */}
        <p style={{ marginTop: 14, fontSize: 8.5, lineHeight: 1.55, color: "#8a7538", maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
          {t.legal}
        </p>
      </div>

      {!cert.paid ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 10px" }}>
            {t.price} <b style={{ color: "#e6b83c" }}>${price}</b>
          </p>
          <button onClick={pay} disabled={paying}
            style={{ background: "linear-gradient(135deg,#e6b83c,#a97d18)", color: "#1a1203", border: "none", borderRadius: 14, padding: "14px 28px", fontWeight: 900, fontSize: 15, cursor: "pointer", opacity: paying ? 0.6 : 1 }}>
            🎓 {paying ? t.paying : t.pay}
          </button>
          {err && <p style={{ color: "#f87171", fontSize: 13, marginTop: 10 }}>{err}</p>}
        </div>
      ) : (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#4ade80", fontWeight: 800, fontSize: 13, marginBottom: 10 }}>✅ {t.paidOk}</p>
        <button onClick={() => window.print()}
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 12, padding: "11px 22px", fontWeight: 800, cursor: "pointer" }}>
          🖨️ {t.print}
        </button>
      </div>
      )}
    </>
  );
}
