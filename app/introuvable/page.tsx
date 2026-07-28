import Link from "next/link";

// Page « introuvable » servie par le proxy avec le statut 404.
export const metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

export default function Introuvable() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24, gap: 14 }}>
      <div style={{ fontSize: 64 }}>🔎</div>
      <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: 0 }}>Page introuvable</h1>
      <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 460, lineHeight: 1.6 }}>
        Cette page n&apos;existe pas ou a été déplacée. Reprenons depuis l&apos;accueil.
      </p>
      <Link href="/" style={{ marginTop: 8, padding: "12px 28px", borderRadius: 999, background: "linear-gradient(135deg,#d4a017,#f0c840)", color: "#04040d", fontWeight: 900, textDecoration: "none" }}>
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
