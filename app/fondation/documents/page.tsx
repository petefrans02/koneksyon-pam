"use client";
import ComingSoon from "@/app/components/ComingSoon";

export default function DocumentsPage() {
  return (
    <ComingSoon
      icon="module"
      feature="fondation-documents"
      title={{ fr: "Documents officiels", ht: "Dokiman ofisyèl", en: "Official Documents", es: "Documentos oficiales" }}
      subtitle={{ fr: "Notre communauté grandit : nos documents officiels, réels et vérifiables, arriveront bientôt ici.", ht: "Kominote nou an ap grandi : dokiman ofisyèl nou yo, reyèl ak verifiyab, ap rive isit la byento.", en: "Our community is growing: our official documents, real and verifiable, will arrive here soon.", es: "Nuestra comunidad crece: nuestros documentos oficiales, reales y verificables, llegarán pronto aquí." }}
      links={[
        { href: "/fondation", label: { fr: "La Communauté", ht: "Kominote a", en: "The Community", es: "La Comunidad" }, primary: true },
        { href: "/fondation/transparence", label: { fr: "Transparence", ht: "Transparans", en: "Transparency", es: "Transparencia" } },
      ]}
    />
  );
}
