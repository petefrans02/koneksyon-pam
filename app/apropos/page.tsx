"use client";

import { useLang } from "@/lib/LangContext";

export default function AProposPage() {
  const { lang } = useLang();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1 border border-blue-400/20">
            <img src="/logo-kp.png" alt="KP" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-stone-900">
          {lang === "fr" ? "À propos" : lang === "ht" ? "Konsènan" : "About"}
        </h1>
        <p className="text-stone-500 mt-2">KONEKSYON PAM — Une Mission • Un Dieu • Une Mission</p>
      </div>

      <div className="space-y-8 text-stone-700 leading-relaxed">
        <div className="bg-white rounded-2xl border border-blue-100 p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-3">
            {lang === "fr" ? "Notre Mission" : lang === "ht" ? "Misyon Nou" : "Our Mission"}
          </h2>
          <p>
            {lang === "fr"
              ? "KONEKSYON PAM est une plateforme chrétienne qui connecte les croyants du monde entier par la prière, la louange et l'étude de la Parole de Dieu. Notre mission est de rendre la Bible accessible à tous, dans leur langue, et de créer une communauté de foi active et solidaire."
              : lang === "ht"
              ? "KONEKSYON PAM se yon platfòm kretyen ki konekte kwayan nan mond antye pa lapriyè, lwanj ak etid Pawòl Bondye a. Misyon nou se rann Bib la aksesib pou tout moun, nan lang yo, epi kreye yon kominote lafwa ki aktif ak solidè."
              : "KONEKSYON PAM is a Christian platform that connects believers worldwide through prayer, praise and the study of God's Word. Our mission is to make the Bible accessible to everyone, in their language, and to create an active and supportive faith community."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-3">
            {lang === "fr" ? "Ce que nous offrons" : lang === "ht" ? "Sa nou ofri" : "What we offer"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {[
              { icon: "📖", title: lang === "fr" ? "150 Psaumes" : lang === "ht" ? "150 Sòm" : "150 Psalms", desc: lang === "fr" ? "En 3 langues avec audio" : "In 3 languages with audio" },
              { icon: "🙏", title: lang === "fr" ? "Mur de prière" : lang === "ht" ? "Mi lapriyè" : "Prayer wall", desc: lang === "fr" ? "Priez ensemble, partout" : "Pray together, everywhere" },
              { icon: "📚", title: lang === "fr" ? "Études bibliques" : lang === "ht" ? "Etid biblik" : "Bible studies", desc: lang === "fr" ? "Sujets profonds avec IA" : "Deep topics with AI" },
              { icon: "🏆", title: "Quiz", desc: lang === "fr" ? "5 niveaux, testez votre foi" : "5 levels, test your faith" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-stone-900">{item.title}</h3>
                  <p className="text-sm text-stone-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-3">
            {lang === "fr" ? "Notre fondateur" : lang === "ht" ? "Fondatè nou" : "Our founder"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
              PF
            </div>
            <div>
              <h3 className="font-bold text-stone-900">Pasteur Peterson Francis</h3>
              <p className="text-sm text-stone-500">
                {lang === "fr"
                  ? "Fondateur de KONEKSYON PAM et de la chaîne YouTube avec plus de 30,000 abonnés"
                  : lang === "ht"
                  ? "Fondatè KONEKSYON PAM ak chèn YouTube ak plis pase 30,000 abòne"
                  : "Founder of KONEKSYON PAM and the YouTube channel with over 30,000 subscribers"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
