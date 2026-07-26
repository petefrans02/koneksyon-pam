"use client";
import ComingSoon from "@/app/components/ComingSoon";

export default function RapportsPage() {
  return (
    <ComingSoon
      icon="pdf"
      feature="fondation-rapports"
      title={{ fr: "Nos rapports", ht: "Rapò nou yo", en: "Our Reports", es: "Nuestros informes" }}
      subtitle={{ fr: "Le bilan de notre communauté et nos comptes, réels et vérifiables — premier bilan prévu en 2026.", ht: "Bilan kominote nou an ak kont nou yo, reyèl ak verifiyab — premye bilan prevwa an 2026.", en: "Our community's progress and accounts, real and verifiable — first report expected in 2026.", es: "El balance de nuestra comunidad y nuestras cuentas, reales y verificables — primer balance previsto en 2026." }}
      links={[
        { href: "/fondation", label: { fr: "La Communauté", ht: "Kominote a", en: "The Community", es: "La Comunidad" }, primary: true },
        { href: "/impact", label: { fr: "Notre impact", ht: "Enpak nou", en: "Our impact", es: "Nuestro impacto" } },
      ]}
    />
  );
}
