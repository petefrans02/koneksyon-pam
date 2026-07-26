"use client";
import ComingSoon from "@/app/components/ComingSoon";

export default function GouvernancePage() {
  return (
    <ComingSoon
      icon="fondation"
      feature="fondation-gouvernance"
      title={{ fr: "Notre organisation", ht: "Òganizasyon nou", en: "Our organization", es: "Nuestra organización" }}
      subtitle={{ fr: "La structure et l'équipe de notre communauté seront présentées ici, en toute transparence.", ht: "Estrikti ak ekip kominote nou an ap prezante isit la, ak tout transparans.", en: "The structure and team of our community will be presented here, with full transparency.", es: "La estructura y el equipo de nuestra comunidad se presentarán aquí, con total transparencia." }}
      links={[
        { href: "/fondation", label: { fr: "La Communauté", ht: "Kominote a", en: "The Community", es: "La Comunidad" }, primary: true },
        { href: "/fondation/conseil", label: { fr: "L'équipe", ht: "Ekip la", en: "The Team", es: "El Equipo" } },
      ]}
    />
  );
}
