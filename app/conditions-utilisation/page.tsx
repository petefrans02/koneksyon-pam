export const metadata = {
  title: "Conditions d'utilisation — KONEKSYON PAM",
  description: "Conditions générales d'utilisation de la plateforme KONEKSYON PAM.",
};

export default function ConditionsUtilisationPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#0f2044] px-5 py-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#c5a84f] text-[10px] font-bold uppercase tracking-[0.25em] mb-4">Légal</p>
          <h1 className="text-white font-black text-3xl sm:text-4xl">Conditions d&apos;utilisation</h1>
          <p className="text-white/50 text-sm mt-3">Dernière mise à jour : 27 juin 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12 flex flex-col gap-8 text-[#0f2044]">

        <section>
          <h2 className="font-black text-xl mb-3">1. Acceptation des conditions</h2>
          <p className="text-stone-600 leading-relaxed">
            En utilisant KONEKSYON PAM, vous acceptez les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">2. Description du service</h2>
          <p className="text-stone-600 leading-relaxed">
            KONEKSYON PAM est une plateforme chrétienne proposant des concours bibliques, des témoignages, des études bibliques, des demandes de prière et du contenu d&apos;édification spirituelle. La plateforme est disponible en français, créole haïtien et anglais.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">3. Création de compte</h2>
          <ul className="list-disc pl-5 text-stone-600 leading-relaxed space-y-2">
            <li>Vous devez fournir une adresse e-mail valide pour créer un compte.</li>
            <li>Vous êtes responsable de la confidentialité de votre mot de passe.</li>
            <li>Un seul compte par personne est autorisé.</li>
            <li>Les comptes créés avec de fausses informations peuvent être supprimés.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">4. Règles de conduite</h2>
          <p className="text-stone-600 leading-relaxed mb-3">En utilisant KONEKSYON PAM, vous vous engagez à :</p>
          <ul className="list-disc pl-5 text-stone-600 leading-relaxed space-y-2">
            <li>Respecter les autres membres de la communauté.</li>
            <li>Ne soumettre que des témoignages et prières authentiques et respectueux.</li>
            <li>Ne pas tenter de frauder les concours bibliques.</li>
            <li>Ne pas publier de contenu offensant, diffamatoire ou contraire aux valeurs chrétiennes.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">5. Concours bibliques</h2>
          <ul className="list-disc pl-5 text-stone-600 leading-relaxed space-y-2">
            <li>Les concours sont ouverts à tous les membres inscrits.</li>
            <li>Les résultats sont définitifs une fois le concours terminé.</li>
            <li>Toute tentative de triche entraîne la disqualification.</li>
            <li>Les prix éventuels sont distribués selon les modalités annoncées par l&apos;organisateur.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">6. Paiements</h2>
          <p className="text-stone-600 leading-relaxed">
            Les transactions financières sont traitées de manière sécurisée via PayPal. KONEKSYON PAM ne stocke aucune information de paiement. Les dons et contributions sont volontaires et non remboursables sauf indication contraire.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">7. Propriété intellectuelle</h2>
          <p className="text-stone-600 leading-relaxed">
            Tout le contenu de KONEKSYON PAM (textes, images, vidéos, design) est la propriété de Pasteur Peterson Francis sauf indication contraire. Les versets bibliques utilisés sont dans le domaine public.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">8. Limitation de responsabilité</h2>
          <p className="text-stone-600 leading-relaxed">
            KONEKSYON PAM est fourni &quot;tel quel&quot;. Nous ne garantissons pas une disponibilité ininterrompue du service. Nous ne sommes pas responsables des pertes liées à l&apos;utilisation ou à l&apos;impossibilité d&apos;utiliser la plateforme.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">9. Modifications</h2>
          <p className="text-stone-600 leading-relaxed">
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants par e-mail.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-3">10. Contact</h2>
          <p className="text-stone-600 leading-relaxed">
            Pour toute question : <a href="mailto:petefrans03@gmail.com" className="text-blue-600 underline">petefrans03@gmail.com</a>
          </p>
        </section>

        <div className="border-t border-stone-100 pt-6">
          <a href="/" className="text-sm text-stone-400 hover:text-[#0f2044] transition-colors">← Retour à l&apos;accueil</a>
        </div>
      </div>
    </div>
  );
}
