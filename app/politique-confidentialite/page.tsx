export const metadata = {
  title: "Politique de confidentialité — KONEKSYON PAM",
  description: "Politique de confidentialité et protection des données personnelles de KONEKSYON PAM.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#0f2044] px-5 py-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.25em] mb-4">Légal</p>
          <h1 className="text-white font-black text-3xl sm:text-4xl">Politique de confidentialité</h1>
          <p className="text-white/50 text-sm mt-3">Dernière mise à jour : 27 juin 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12 flex flex-col gap-8 text-[#0f2044]">

        <section>
          <h2 className="font-black text-xl mb-3">1. Qui sommes-nous ?</h2>
          <p className="text-stone-600 leading-relaxed">
            KONEKSYON PAM est une plateforme chrétienne en ligne dédiée à l&apos;édification spirituelle, aux concours bibliques, aux témoignages, aux études bibliques et à la prière. Elle est gérée par Pasteur Peterson Francis. Pour toute question : <a href="mailto:petefrans03@gmail.com" className="text-blue-600 underline">petefrans03@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">2. Quelles données collectons-nous ?</h2>
          <ul className="list-disc pl-5 text-stone-600 leading-relaxed space-y-2">
            <li><strong>Adresse e-mail</strong> — pour la création de compte et les notifications de concours.</li>
            <li><strong>Nom d&apos;affichage</strong> — choisi par l&apos;utilisateur lors de l&apos;inscription.</li>
            <li><strong>Langue préférée</strong> — pour personnaliser l&apos;affichage (fr, ht, en).</li>
            <li><strong>Participations aux concours et votes</strong> — pour calculer les classements.</li>
            <li><strong>Témoignages et demandes de prière</strong> — soumis volontairement par l&apos;utilisateur.</li>
            <li><strong>Paiements</strong> — traités par PayPal. KONEKSYON PAM ne stocke jamais les données de carte bancaire.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">3. Comment utilisons-nous vos données ?</h2>
          <ul className="list-disc pl-5 text-stone-600 leading-relaxed space-y-2">
            <li>Gestion de votre compte et accès aux fonctionnalités du site.</li>
            <li>Envoi de notifications par e-mail lors de l&apos;ouverture d&apos;un concours (avec votre consentement).</li>
            <li>Affichage des classements et résultats des concours.</li>
            <li>Publication des témoignages approuvés sur la plateforme.</li>
            <li>Nous ne vendons ni ne partageons vos données avec des tiers à des fins commerciales.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">4. Partage avec des services tiers</h2>
          <ul className="list-disc pl-5 text-stone-600 leading-relaxed space-y-2">
            <li><strong>Supabase</strong> — stockage sécurisé des données (serveurs aux États-Unis).</li>
            <li><strong>PayPal</strong> — traitement des paiements.</li>
            <li><strong>Meta (Facebook)</strong> — publication automatique de contenus publics sur les pages officielles KONEKSYON PAM.</li>
            <li><strong>YouTube (Google)</strong> — affichage des vidéos publiques de la chaîne KONEKSYON PAM.</li>
            <li><strong>Vercel</strong> — hébergement du site web.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">5. Conservation des données</h2>
          <p className="text-stone-600 leading-relaxed">
            Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte et de toutes vos données à tout moment en nous contactant par e-mail.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">6. Vos droits</h2>
          <ul className="list-disc pl-5 text-stone-600 leading-relaxed space-y-2">
            <li>Accéder à vos données personnelles.</li>
            <li>Corriger des informations inexactes.</li>
            <li>Demander la suppression de votre compte.</li>
            <li>Retirer votre consentement aux notifications e-mail.</li>
          </ul>
          <p className="text-stone-600 leading-relaxed mt-3">
            Pour exercer ces droits, contactez-nous : <a href="mailto:petefrans03@gmail.com" className="text-blue-600 underline">petefrans03@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">7. Cookies</h2>
          <p className="text-stone-600 leading-relaxed">
            KONEKSYON PAM utilise uniquement les cookies nécessaires à l&apos;authentification et à la session. Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">8. Suppression de vos données</h2>
          <p className="text-stone-600 leading-relaxed">
            Pour demander la suppression de vos données personnelles, envoyez un e-mail à <a href="mailto:petefrans03@gmail.com" className="text-blue-600 underline">petefrans03@gmail.com</a> avec l&apos;objet <strong>"Suppression de données"</strong>. Nous traiterons votre demande dans un délai de 30 jours.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">9. Contact</h2>
          <p className="text-stone-600 leading-relaxed">
            Pour toute question concernant cette politique : <a href="mailto:petefrans03@gmail.com" className="text-blue-600 underline">petefrans03@gmail.com</a>
          </p>
        </section>

        <div className="border-t border-stone-100 pt-6">
          <a href="/" className="text-sm text-stone-400 hover:text-[#0f2044] transition-colors">← Retour à l&apos;accueil</a>
        </div>
      </div>
    </div>
  );
}
