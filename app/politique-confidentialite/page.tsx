"use client";

import { useLang } from "@/lib/LangContext";

const CONTENT = {
  fr: {
    legal: "Légal",
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 27 juin 2026",
    back: "← Retour à l'accueil",
    sections: [
      { h: "1. Qui sommes-nous ?", p: "KONEKSYON PAM est une plateforme évangélique mondiale dédiée à la Parole de Dieu, aux concours bibliques, à la prière, à la louange et à l'édification des croyants. Elle est créée et gérée par la communauté chrétienne, sous la direction de Pasteur Peterson Francis. Notre mission : partager l'Évangile et bâtir des disciples en toutes nations. Pour toute question : contact@koneksyonpam.com" },
      { h: "2. Quelles données collectons-nous ?", bullets: ["Adresse e-mail — pour la création de compte et les notifications de concours.", "Nom d'affichage — choisi par l'utilisateur lors de l'inscription.", "Langue préférée — pour personnaliser l'affichage.", "Participations aux concours et votes — pour calculer les classements.", "Témoignages et demandes de prière — soumis volontairement par l'utilisateur.", "Paiements — traités par PayPal. KONEKSYON PAM ne stocke jamais les données de carte bancaire."] },
      { h: "3. Comment utilisons-nous vos données ?", bullets: ["Gestion de votre compte et accès aux fonctionnalités du site.", "Envoi de notifications par e-mail lors de l'ouverture d'un concours (avec votre consentement).", "Affichage des classements et résultats des concours.", "Publication des témoignages approuvés sur la plateforme.", "Nous ne vendons ni ne partageons vos données avec des tiers à des fins commerciales."] },
      { h: "4. Partage avec des services tiers", bullets: ["Supabase — stockage sécurisé des données (serveurs aux États-Unis).", "PayPal — traitement des paiements.", "Meta (Facebook) — publication automatique de contenus publics sur les pages officielles KONEKSYON PAM.", "YouTube (Google) — affichage des vidéos publiques de la chaîne KONEKSYON PAM.", "Vercel — hébergement du site web."] },
      { h: "5. Conservation des données", p: "Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte et de toutes vos données à tout moment en nous contactant par e-mail." },
      { h: "6. Vos droits", bullets: ["Accéder à vos données personnelles.", "Corriger des informations inexactes.", "Demander la suppression de votre compte.", "Retirer votre consentement aux notifications e-mail."], after: "Pour exercer ces droits, contactez-nous : contact@koneksyonpam.com" },
      { h: "7. Cookies", p: "KONEKSYON PAM utilise uniquement les cookies nécessaires à l'authentification et à la session. Aucun cookie publicitaire ou de suivi tiers n'est utilisé." },
      { h: "8. Suppression de vos données", p: "Pour demander la suppression de vos données personnelles, envoyez un e-mail à contact@koneksyonpam.com avec l'objet \"Suppression de données\". Nous traiterons votre demande dans un délai de 30 jours." },
      { h: "9. Contact", p: "Pour toute question concernant cette politique : contact@koneksyonpam.com" },
    ],
  },
  ht: {
    legal: "Legal",
    title: "Politik konfidansyalite",
    updated: "Dènye mizajou : 27 jen 2026",
    back: "← Retounen nan akèy",
    sections: [
      { h: "1. Ki moun nou ye ?", p: "KONEKSYON PAM se yon platfòm evanjelik mondyal ki dedye pou Pawòl Bondye a, konkou biblik, lapriyè, lwanj ak edifikasyon kwayan yo. Li kreye ak jere pa kominote kretyen an, sou direksyon Pastè Peterson Francis. Misyon nou : pataje Levanjil la ak bati disip nan tout nasyon. Pou nenpòt kesyon : contact@koneksyonpam.com" },
      { h: "2. Ki done nou kolekte ?", bullets: ["Adrès imèl — pou kreye kont ak notifikasyon konkou.", "Non afichaj — chwazi pa itilizatè a lè enskri.", "Lang prefere — pou pèsonalize afichaj la.", "Patisipasyon nan konkou ak vòt — pou kalkile klasman.", "Temwayaj ak demann lapriyè — soumèt volontèman pa itilizatè a.", "Peman — trete pa PayPal. KONEKSYON PAM pa janm stoke done kat kredi."] },
      { h: "3. Kijan nou itilize done ou yo ?", bullets: ["Jestyon kont ou ak aksè a fonksyonalite sit la.", "Voye notifikasyon pa imèl lè yon konkou louvri (avèk konsantman ou).", "Afichaj klasman ak rezilta konkou.", "Piblikasyon temwayaj ki apwouve sou platfòm nan.", "Nou pa vann ni pataje done ou yo ak tiyès pati pou rezon komèsyal."] },
      { h: "4. Pataj ak sèvis tiyès", bullets: ["Supabase — estokaj done sekirize (sèvè Etazini).", "PayPal — tretman peman.", "Meta (Facebook) — piblikasyon otomatik kontni piblik sou paj ofisyèl KONEKSYON PAM.", "YouTube (Google) — afichaj videyo piblik chanèl KONEKSYON PAM.", "Vercel — ebergman sit entènèt la."] },
      { h: "5. Konsèvasyon done yo", p: "Done ou yo konsève toutotan kont ou aktif. Ou ka mande efasman kont ou ak tout done ou yo nenpòt ki lè lè ou kontakte nou pa imèl." },
      { h: "6. Dwa ou yo", bullets: ["Jwenn aksè a done pèsonèl ou yo.", "Korije enfòmasyon enkòrèk.", "Mande efasman kont ou.", "Retire konsantman ou pou notifikasyon imèl."], after: "Pou egzèse dwa sa yo, kontakte nou : contact@koneksyonpam.com" },
      { h: "7. Koukit", p: "KONEKSYON PAM itilize sèlman koukit ki nesesè pou otantifikasyon ak sesyon. Pa gen koukit piblisite oswa suivi tiyès ki itilize." },
      { h: "8. Efasman done ou yo", p: "Pou mande efasman done pèsonèl ou yo, voye yon imèl nan contact@koneksyonpam.com ak objè \"Efasman done\". Nou ap trete demann ou nan 30 jou." },
      { h: "9. Kontakt", p: "Pou nenpòt kesyon sou politik sa a : contact@koneksyonpam.com" },
    ],
  },
  en: {
    legal: "Legal",
    title: "Privacy Policy",
    updated: "Last updated: June 27, 2026",
    back: "← Back to home",
    sections: [
      { h: "1. Who are we?", p: "KONEKSYON PAM is a global evangelical platform dedicated to God's Word, biblical contests, prayer, worship and the edification of believers. It is created and managed by the Christian community, under the leadership of Pastor Peterson Francis. Our mission: to share the Gospel and make disciples of all nations. For any questions: contact@koneksyonpam.com" },
      { h: "2. What data do we collect?", bullets: ["Email address — for account creation and contest notifications.", "Display name — chosen by the user upon registration.", "Preferred language — to personalize the display.", "Contest participations and votes — to calculate rankings.", "Testimonies and prayer requests — voluntarily submitted by the user.", "Payments — processed by PayPal. KONEKSYON PAM never stores credit card data."] },
      { h: "3. How do we use your data?", bullets: ["Account management and access to site features.", "Sending email notifications when a contest opens (with your consent).", "Displaying contest rankings and results.", "Publishing approved testimonies on the platform.", "We do not sell or share your data with third parties for commercial purposes."] },
      { h: "4. Sharing with third-party services", bullets: ["Supabase — secure data storage (US servers).", "PayPal — payment processing.", "Meta (Facebook) — automatic posting of public content on official KONEKSYON PAM pages.", "YouTube (Google) — displaying public videos from the KONEKSYON PAM channel.", "Vercel — website hosting."] },
      { h: "5. Data retention", p: "Your data is retained as long as your account is active. You may request deletion of your account and all your data at any time by contacting us by email." },
      { h: "6. Your rights", bullets: ["Access your personal data.", "Correct inaccurate information.", "Request account deletion.", "Withdraw your consent to email notifications."], after: "To exercise these rights, contact us: contact@koneksyonpam.com" },
      { h: "7. Cookies", p: "KONEKSYON PAM uses only cookies necessary for authentication and session management. No third-party advertising or tracking cookies are used." },
      { h: "8. Data deletion", p: "To request deletion of your personal data, send an email to contact@koneksyonpam.com with the subject \"Data Deletion\". We will process your request within 30 days." },
      { h: "9. Contact", p: "For any questions about this policy: contact@koneksyonpam.com" },
    ],
  },
  es: {
    legal: "Legal",
    title: "Política de privacidad",
    updated: "Última actualización: 27 de junio de 2026",
    back: "← Volver al inicio",
    sections: [
      { h: "1. ¿Quiénes somos?", p: "KONEKSYON PAM es una plataforma evangélica mundial dedicada a la Palabra de Dios, concursos bíblicos, oración, alabanza y la edificación de los creyentes. Es creada y gestionada por la comunidad cristiana, bajo la dirección del Pastor Peterson Francis. Nuestra misión: compartir el Evangelio y hacer discípulos de todas las naciones. Para cualquier pregunta: contact@koneksyonpam.com" },
      { h: "2. ¿Qué datos recopilamos?", bullets: ["Dirección de correo electrónico — para la creación de cuenta y notificaciones de concursos.", "Nombre de visualización — elegido por el usuario al registrarse.", "Idioma preferido — para personalizar la visualización.", "Participaciones en concursos y votos — para calcular clasificaciones.", "Testimonios y peticiones de oración — enviados voluntariamente por el usuario.", "Pagos — procesados por PayPal. KONEKSYON PAM nunca almacena datos de tarjeta de crédito."] },
      { h: "3. ¿Cómo usamos tus datos?", bullets: ["Gestión de tu cuenta y acceso a las funcionalidades del sitio.", "Envío de notificaciones por correo cuando se abre un concurso (con tu consentimiento).", "Visualización de clasificaciones y resultados de concursos.", "Publicación de testimonios aprobados en la plataforma.", "No vendemos ni compartimos tus datos con terceros con fines comerciales."] },
      { h: "4. Compartir con servicios de terceros", bullets: ["Supabase — almacenamiento seguro de datos (servidores en EE.UU.).", "PayPal — procesamiento de pagos.", "Meta (Facebook) — publicación automática de contenido público en las páginas oficiales de KONEKSYON PAM.", "YouTube (Google) — visualización de videos públicos del canal KONEKSYON PAM.", "Vercel — alojamiento del sitio web."] },
      { h: "5. Conservación de datos", p: "Tus datos se conservan mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta y todos tus datos en cualquier momento contactándonos por correo electrónico." },
      { h: "6. Tus derechos", bullets: ["Acceder a tus datos personales.", "Corregir información inexacta.", "Solicitar la eliminación de tu cuenta.", "Retirar tu consentimiento para las notificaciones por correo electrónico."], after: "Para ejercer estos derechos, contáctanos: contact@koneksyonpam.com" },
      { h: "7. Cookies", p: "KONEKSYON PAM utiliza únicamente las cookies necesarias para la autenticación y la sesión. No se utilizan cookies de publicidad o seguimiento de terceros." },
      { h: "8. Eliminación de tus datos", p: "Para solicitar la eliminación de tus datos personales, envía un correo a contact@koneksyonpam.com con el asunto \"Eliminación de datos\". Procesaremos tu solicitud en un plazo de 30 días." },
      { h: "9. Contacto", p: "Para cualquier pregunta sobre esta política: contact@koneksyonpam.com" },
    ],
  },
};

type SectionItem = { h: string; p?: string; bullets?: string[]; after?: string };

function renderText(text: string) {
  if (!text.includes("contact@koneksyonpam.com")) return <>{text}</>;
  const parts = text.split("contact@koneksyonpam.com");
  return <>{parts[0]}<a href="mailto:contact@koneksyonpam.com" className="text-[#60a5fa] underline">contact@koneksyonpam.com</a>{parts[1] || ""}</>;
}

export default function PolitiqueConfidentialitePage() {
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
            {s.after && <p className="text-white/55 leading-relaxed mt-3">{renderText(s.after)}</p>}
          </section>
        ))}

        <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <a href="/" className="text-sm text-white/30 hover:text-white transition-colors">{c.back}</a>
        </div>
      </div>
    </div>
  );
}
