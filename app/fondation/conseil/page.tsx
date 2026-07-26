"use client";
import ComingSoon from "@/app/components/ComingSoon";

export default function ConseilPage() {
  return (
    <ComingSoon
      icon="utilisateurs"
      feature="fondation-conseil"
      title={{ fr: "L'équipe", ht: "Ekip la", en: "The Team", es: "El Equipo" }}
      subtitle={{ fr: "Les personnes qui font vivre notre communauté seront présentées ici prochainement.", ht: "Moun ki fè kominote nou an vivan yo ap prezante isit la byento.", en: "The people who bring our community to life will be introduced here soon.", es: "Las personas que dan vida a nuestra comunidad se presentarán aquí pronto." }}
      links={[
        { href: "/fondation", label: { fr: "La Communauté", ht: "Kominote a", en: "The Community", es: "La Comunidad" }, primary: true },
        { href: "/fondation/gouvernance", label: { fr: "Notre organisation", ht: "Òganizasyon nou", en: "Our organization", es: "Nuestra organización" } },
      ]}
    />
  );
}
