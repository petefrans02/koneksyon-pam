"use client";
import ComingSoon from "@/app/components/ComingSoon";

export default function PartenairesPage() {
  return (
    <ComingSoon
      icon="poignee_main"
      feature="fondation-partenaires"
      title={{ fr: "Nos partenaires", ht: "Patnè nou", en: "Our Partners", es: "Nuestros Socios" }}
      subtitle={{ fr: "Les partenaires et les soutiens qui portent notre mission avec nous seront présentés ici.", ht: "Patnè ak sipò ki pote misyon nou an ansanm ak nou yo ap parèt isit la.", en: "The partners and supporters carrying our mission with us will be featured here.", es: "Los socios y apoyos que llevan nuestra misión junto a nosotros se presentarán aquí." }}
      links={[
        { href: "/fondation", label: { fr: "La Communauté", ht: "Kominote a", en: "The Community", es: "La Comunidad" }, primary: true },
        { href: "/don", label: { fr: "Devenir partenaire ❤️", ht: "Vin yon patnè ❤️", en: "Become a partner ❤️", es: "Ser socio ❤️" } },
      ]}
    />
  );
}
