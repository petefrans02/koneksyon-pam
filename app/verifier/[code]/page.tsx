import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// PAGE PUBLIQUE DE VÉRIFICATION — c'est elle qui donne sa valeur au certificat.
// Un employeur ou une église saisit le code et voit immédiatement s'il est
// authentique, sans avoir à nous contacter.

export const metadata = {
  title: "Vérifier un certificat",
  robots: { index: false, follow: false },
};

async function fetchCertificate(code: string) {
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
    const { data } = await db
      .from("certificates")
      .select("code, holder_name, program, level, lessons_done, xp, issued_at")
      .eq("code", code.toUpperCase().trim())
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cert = await fetchCertificate(decodeURIComponent(code));

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        {cert ? (
          <div style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.4)", borderRadius: 20, padding: "clamp(22px,4vw,38px)", textAlign: "center" }}>
            <div style={{ fontSize: 56 }}>✅</div>
            <p style={{ fontWeight: 900, color: "#4ade80", letterSpacing: "0.14em", fontSize: 12, textTransform: "uppercase", margin: "6px 0 18px" }}>
              Certificat authentique
            </p>

            <p style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, margin: 0 }}>{cert.holder_name}</p>
            <p style={{ color: "rgba(255,255,255,0.65)", margin: "8px 0 0", fontSize: 16 }}>
              a terminé le programme <b style={{ color: "#e6b83c" }}>{cert.program}</b>
              {cert.level ? ` — niveau ${cert.level}` : ""}
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", margin: "22px 0" }}>
              <Fact label="Leçons" value={String(cert.lessons_done ?? 0)} />
              <Fact label="Points" value={String(cert.xp ?? 0)} />
              <Fact label="Délivré le" value={new Date(cert.issued_at as string).toLocaleDateString("fr-FR")} />
            </div>

            <p style={{ fontFamily: "monospace", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{cert.code}</p>

            {/* Mention légale : elle protège le site autant que l'apprenant. */}
            <p style={{ marginTop: 22, fontSize: 11, lineHeight: 1.6, color: "rgba(255,255,255,0.4)" }}>
              Ce certificat atteste la réussite d&apos;un cours en ligne dispensé par KONEKSYON PAM ACADEMY.
              Il ne constitue pas un diplôme accrédité et ne donne droit à aucun crédit académique.
            </p>
          </div>
        ) : (
          <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.4)", borderRadius: 20, padding: "clamp(22px,4vw,38px)", textAlign: "center" }}>
            <div style={{ fontSize: 56 }}>❌</div>
            <p style={{ fontWeight: 900, color: "#f87171", fontSize: 20, margin: "10px 0 6px" }}>Certificat introuvable</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
              Aucun certificat ne correspond au code <b style={{ fontFamily: "monospace" }}>{decodeURIComponent(code)}</b>.
              Vérifie la saisie — les codes commencent par <b>KPA-</b>.
            </p>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 22 }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>← Retour à l&apos;accueil</Link>
        </p>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px", minWidth: 92 }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 17, color: "#fff" }}>{value}</div>
    </div>
  );
}
