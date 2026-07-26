"use client";

import { useLang } from "@/lib/LangContext";

const CONTENT = {
  fr: {
    legal: "Légal",
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : 27 juin 2026",
    back: "← Retour à l'accueil",
    sections: [
      { h: "1. Acceptation des conditions", p: "En utilisant KONEKSYON PAM, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme." },
      { h: "2. Description du service", p: "KONEKSYON PAM est une plateforme chrétienne proposant des concours bibliques, des témoignages, des études bibliques, des demandes de prière et du contenu d'édification spirituelle. La plateforme est disponible en français, créole haïtien, anglais et espagnol." },
      { h: "3. Création de compte", bullets: ["Vous devez fournir une adresse e-mail valide pour créer un compte.", "Vous êtes responsable de la confidentialité de votre mot de passe.", "Un seul compte par personne est autorisé.", "Les comptes créés avec de fausses informations peuvent être supprimés."] },
      { h: "4. Règles de conduite", p: "En utilisant KONEKSYON PAM, vous vous engagez à :", bullets: ["Respecter les autres membres de la communauté.", "Ne soumettre que des témoignages et prières authentiques et respectueux.", "Ne pas tenter de frauder les concours bibliques.", "Ne pas publier de contenu offensant, diffamatoire ou contraire aux valeurs chrétiennes."] },
      { h: "5. Concours bibliques", bullets: ["Les concours sont ouverts à tous les membres inscrits.", "Les résultats sont définitifs une fois le concours terminé.", "Toute tentative de triche entraîne la disqualification.", "Les prix éventuels sont distribués selon les modalités annoncées par l'organisateur."] },
      { h: "6. Paiements", p: "Les transactions financières sont traitées de manière sécurisée via PayPal. KONEKSYON PAM ne stocke aucune information de paiement. Les dons et contributions sont volontaires et non remboursables sauf indication contraire." },
      { h: "7. Propriété intellectuelle", p: "Tout le contenu de KONEKSYON PAM (textes, images, vidéos, design) est la propriété de Pasteur Peterson Francis sauf indication contraire. Les versets bibliques utilisés sont dans le domaine public." },
      { h: "8. Limitation de responsabilité", p: "KONEKSYON PAM est fourni \"tel quel\". Nous ne garantissons pas une disponibilité ininterrompue du service. Nous ne sommes pas responsables des pertes liées à l'utilisation ou à l'impossibilité d'utiliser la plateforme." },
      { h: "9. Modifications", p: "Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants par e-mail." },
      { h: "10. Contact", p: "Pour toute question : contact@koneksyonpam.com" },
    ],
  },
  ht: {
    legal: "Legal",
    title: "Kondisyon itilizasyon",
    updated: "Dènye mizajou : 27 jen 2026",
    back: "← Retounen nan akèy",
    sections: [
      { h: "1. Akseptasyon kondisyon yo", p: "Lè ou itilize KONEKSYON PAM, ou aksepte kondisyon itilizasyon sa yo. Si ou pa dakò ak kondisyon sa yo, tanpri pa itilize platfòm nan." },
      { h: "2. Deskripsyon sèvis la", p: "KONEKSYON PAM se yon platfòm kretyen ki ofri konkou biblik, temwayaj, etid biblik, demann lapriyè ak kontni edifikasyon espirityèl. Platfòm nan disponib an franse, kreyòl ayisyen, angle ak panyòl." },
      { h: "3. Kreye yon kont", bullets: ["Ou dwe bay yon adrès imèl valid pou kreye yon kont.", "Ou responsab konfidansyalite modpas ou.", "Yon sèl kont pou chak moun otorize.", "Kont ki kreye ak fo enfòmasyon kapab efase."] },
      { h: "4. Règ konduit", p: "Lè ou itilize KONEKSYON PAM, ou angaje w pou :", bullets: ["Respekte lòt manm kominote a.", "Soumèt sèlman temwayaj ak lapriyè otantik ak respektab.", "Pa eseye fwode konkou biblik yo.", "Pa pibliye kontni ofansif, difamatwa oswa kontrè ak valè kretyen."] },
      { h: "5. Konkou biblik", bullets: ["Konkou yo louvri pou tout manm ki enskri.", "Rezilta yo definitif lè konkou a fini.", "Nenpòt tantativ triche ap mennen nan diskалификasyon.", "Pri yo distribye selon modalite yo anonse pa òganizatè a."] },
      { h: "6. Peman", p: "Tranzaksyon finansyè yo trete an sekirite via PayPal. KONEKSYON PAM pa stoke okenn enfòmasyon peman. Don yo volontè e pa remboursab sof si yo di otreman." },
      { h: "7. Pwopriyete entelektyèl", p: "Tout kontni KONEKSYON PAM (tèks, imaj, videyo, dizayn) se pwopriyete Pastè Peterson Francis sof si yo di otreman. Vèsè biblik yo itilize nan domèn piblik." },
      { h: "8. Limit responsabilite", p: "KONEKSYON PAM se founi \"jan li ye\". Nou pa garanti disponibilite kontinyèl sèvis la. Nou pa responsab pou pèt ki lye ak itilizasyon oswa enkapasité pou itilize platfòm nan." },
      { h: "9. Modifikasyon", p: "Nou rezève dwa pou modifye kondisyon sa yo nenpòt ki lè. Itilizatè yo ap enfòme sou chanjman enpòtan pa imèl." },
      { h: "10. Kontakt", p: "Pou nenpòt kesyon : contact@koneksyonpam.com" },
    ],
  },
  en: {
    legal: "Legal",
    title: "Terms of Use",
    updated: "Last updated: June 27, 2026",
    back: "← Back to home",
    sections: [
      { h: "1. Acceptance of Terms", p: "By using KONEKSYON PAM, you agree to these terms of use. If you do not agree, please do not use the platform." },
      { h: "2. Service Description", p: "KONEKSYON PAM is a Christian platform offering biblical contests, testimonies, Bible studies, prayer requests, and spiritual edification content. The platform is available in French, Haitian Creole, English, and Spanish." },
      { h: "3. Account Creation", bullets: ["You must provide a valid email address to create an account.", "You are responsible for the confidentiality of your password.", "Only one account per person is allowed.", "Accounts created with false information may be deleted."] },
      { h: "4. Rules of Conduct", p: "By using KONEKSYON PAM, you agree to:", bullets: ["Respect other community members.", "Submit only authentic and respectful testimonies and prayers.", "Not attempt to cheat in biblical contests.", "Not publish offensive, defamatory, or un-Christian content."] },
      { h: "5. Biblical Contests", bullets: ["Contests are open to all registered members.", "Results are final once the contest ends.", "Any cheating attempt results in disqualification.", "Prizes, if any, are distributed according to the terms announced by the organizer."] },
      { h: "6. Payments", p: "Financial transactions are securely processed via PayPal. KONEKSYON PAM does not store any payment information. Donations are voluntary and non-refundable unless otherwise stated." },
      { h: "7. Intellectual Property", p: "All KONEKSYON PAM content (texts, images, videos, design) is the property of Pastor Peterson Francis unless otherwise indicated. Bible verses used are in the public domain." },
      { h: "8. Limitation of Liability", p: "KONEKSYON PAM is provided \"as is\". We do not guarantee uninterrupted service availability. We are not responsible for losses related to the use or inability to use the platform." },
      { h: "9. Modifications", p: "We reserve the right to modify these terms at any time. Users will be notified of important changes by email." },
      { h: "10. Contact", p: "For any questions: contact@koneksyonpam.com" },
    ],
  },
  es: {
    legal: "Legal",
    title: "Condiciones de uso",
    updated: "Última actualización: 27 de junio de 2026",
    back: "← Volver al inicio",
    sections: [
      { h: "1. Aceptación de las condiciones", p: "Al usar KONEKSYON PAM, aceptas estas condiciones de uso. Si no estás de acuerdo, por favor no uses la plataforma." },
      { h: "2. Descripción del servicio", p: "KONEKSYON PAM es una plataforma cristiana que ofrece concursos bíblicos, testimonios, estudios bíblicos, peticiones de oración y contenido de edificación espiritual. La plataforma está disponible en francés, criollo haitiano, inglés y español." },
      { h: "3. Creación de cuenta", bullets: ["Debes proporcionar una dirección de correo electrónico válida para crear una cuenta.", "Eres responsable de la confidencialidad de tu contraseña.", "Se permite solo una cuenta por persona.", "Las cuentas creadas con información falsa pueden ser eliminadas."] },
      { h: "4. Normas de conducta", p: "Al usar KONEKSYON PAM, te comprometes a:", bullets: ["Respetar a los demás miembros de la comunidad.", "Enviar únicamente testimonios y oraciones auténticos y respetuosos.", "No intentar hacer trampa en los concursos bíblicos.", "No publicar contenido ofensivo, difamatorio o contrario a los valores cristianos."] },
      { h: "5. Concursos bíblicos", bullets: ["Los concursos están abiertos a todos los miembros registrados.", "Los resultados son definitivos una vez finalizado el concurso.", "Cualquier intento de trampa resulta en descalificación.", "Los premios, si los hay, se distribuyen según las condiciones anunciadas por el organizador."] },
      { h: "6. Pagos", p: "Las transacciones financieras se procesan de forma segura a través de PayPal. KONEKSYON PAM no almacena ninguna información de pago. Las donaciones son voluntarias y no reembolsables salvo indicación contraria." },
      { h: "7. Propiedad intelectual", p: "Todo el contenido de KONEKSYON PAM (textos, imágenes, videos, diseño) es propiedad del Pastor Peterson Francis salvo indicación contraria. Los versículos bíblicos utilizados son de dominio público." },
      { h: "8. Limitación de responsabilidad", p: "KONEKSYON PAM se proporciona \"tal cual\". No garantizamos la disponibilidad ininterrumpida del servicio. No somos responsables de las pérdidas relacionadas con el uso o la imposibilidad de usar la plataforma." },
      { h: "9. Modificaciones", p: "Nos reservamos el derecho de modificar estas condiciones en cualquier momento. Los usuarios serán informados de los cambios importantes por correo electrónico." },
      { h: "10. Contacto", p: "Para cualquier pregunta: contact@koneksyonpam.com" },
    ],
  },
};

type SectionItem = { h: string; p?: string; bullets?: string[] };

function renderText(text: string) {
  if (!text.includes("contact@koneksyonpam.com")) return <>{text}</>;
  const parts = text.split("contact@koneksyonpam.com");
  return <>{parts[0]}<a href="mailto:contact@koneksyonpam.com" className="text-[#60a5fa] underline">contact@koneksyonpam.com</a>{parts[1] || ""}</>;
}

export default function ConditionsUtilisationPage() {
  const { lang } = useLang();
  const l = (["fr","ht","en","es"].includes(lang) ? lang : "fr") as "fr"|"ht"|"en"|"es";
  const c = CONTENT[l];

  return (
    <div className="animate-page-awaken" style={{ minHeight: "100vh", background: "linear-gradient(180deg, #04080f 0%, #050a12 100%)", color: "#fff" }}>
      <div className="px-5 py-14" style={{ background: "linear-gradient(180deg, #06112a 0%, #04080f 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-[#d4a017] text-[10px] font-bold uppercase tracking-[0.25em] mb-4">{c.legal}</p>
          <h1 className="text-white font-black text-3xl sm:text-4xl">{c.title}</h1>
          <p className="text-white/40 text-sm mt-3">{c.updated}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12 flex flex-col gap-8">
        {c.sections.map((s: SectionItem, i: number) => (
          <section key={i}>
            <h2 className="font-black text-xl mb-3 text-white">{s.h}</h2>
            {s.p && <p className="text-white/55 leading-relaxed">{renderText(s.p)}</p>}
            {s.bullets && (
              <ul className="list-disc pl-5 text-white/55 leading-relaxed space-y-2">
                {s.bullets.map((b: string, j: number) => <li key={j}>{b}</li>)}
              </ul>
            )}
          </section>
        ))}

        <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <a href="/" className="text-sm text-white/30 hover:text-white transition-colors">{c.back}</a>
        </div>
      </div>
    </div>
  );
}
