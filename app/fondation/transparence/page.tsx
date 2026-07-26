"use client";
import ComingSoon from "@/app/components/ComingSoon";

export default function TransparencePage() {
  return (
    <ComingSoon
      icon="recherche"
      feature="fondation-transparence"
      title={{ fr: "Transparence", ht: "Transparans", en: "Transparency", es: "Transparencia" }}
      subtitle={{ fr: "Notre engagement envers la transparence totale : chaque soutien, chaque projet, chaque résultat sera partagé ici.", ht: "Angajman nou anvè transparans total : chak sipò, chak pwojè, chak rezilta ap pataje isit la.", en: "Our commitment to total transparency: every act of support, every project and every result will be shared here.", es: "Nuestro compromiso con la transparencia total: cada apoyo, cada proyecto y cada resultado se compartirá aquí." }}
      links={[
        { href: "/fondation", label: { fr: "La Communauté", ht: "Kominote a", en: "The Community", es: "La Comunidad" }, primary: true },
        { href: "/impact", label: { fr: "Notre impact", ht: "Enpak nou", en: "Our impact", es: "Nuestro impacto" } },
      ]}
    />
  );
}
