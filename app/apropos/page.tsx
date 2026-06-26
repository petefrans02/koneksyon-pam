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
        <p className="text-stone-800 mt-2 font-bold text-lg">KONEKSYON PAM</p>
        <p className="text-blue-600 text-sm mt-1 font-medium">
          {lang === "fr" ? "Une Mission • Un Dieu • Une Vision" : lang === "ht" ? "Yon Misyon • Yon Bondye • Yon Vizyon" : "One Mission • One God • One Vision"}
        </p>
      </div>

      <div className="space-y-8 text-stone-700 leading-relaxed">
        <div className="bg-white rounded-2xl border border-blue-100 p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-3">
            {lang === "fr" ? "Notre Mission" : lang === "ht" ? "Misyon Nou" : "Our Mission"}
          </h2>
          <p>
            {lang === "fr"
              ? "KONEKSYON PAM est la plateforme numérique de l'Église connectée. Nous croyons que la technologie peut servir l'Évangile. Notre mission est d'offrir à chaque église, chaque pasteur et chaque croyant un espace complet pour adorer, prier, étudier la Parole de Dieu, et bâtir une communauté forte — peu importe où ils se trouvent dans le monde."
              : lang === "ht"
              ? "KONEKSYON PAM se platfòm nimerik Legliz ki konekte. Nou kwè teknoloji ka sèvi Levanjil. Misyon nou se ofri chak legliz, chak pastè ak chak kwayan yon espas konplè pou adore, priye, etidye Pawòl Bondye, epi bati yon kominote fò — kèlkeswa kote yo ye nan mond lan."
              : "KONEKSYON PAM is the digital platform for the connected Church. We believe technology can serve the Gospel. Our mission is to offer every church, every pastor and every believer a complete space to worship, pray, study God's Word, and build a strong community — no matter where they are in the world."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-3">
            {lang === "fr" ? "Nos Services" : lang === "ht" ? "Sèvis Nou" : "Our Services"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            {[
              {
                icon: "⛪",
                title: lang === "fr" ? "Espace Église" : lang === "ht" ? "Espas Legliz" : "Church Space",
                desc: lang === "fr"
                  ? "Chaque église crée son espace privé avec un code unique. Le pasteur gère les études, événements et prières de sa congrégation."
                  : lang === "ht"
                  ? "Chak legliz kreye espas prive li ak yon kòd inik. Pastè a jere etid, evènman ak lapriyè kongregasyon li."
                  : "Each church creates its private space with a unique code. The pastor manages studies, events and prayers.",
              },
              {
                icon: "📖",
                title: lang === "fr" ? "150 Psaumes" : lang === "ht" ? "150 Sòm" : "150 Psalms",
                desc: lang === "fr"
                  ? "Tous les Psaumes de la Bible en français (Louis Segond), créole haïtien et anglais."
                  : lang === "ht"
                  ? "Tout Sòm Bib la an franse, kreyòl ayisyen ak anglè."
                  : "All Psalms in French, Haitian Creole and English.",
              },
              {
                icon: "🙏",
                title: lang === "fr" ? "Prière & Témoignages" : lang === "ht" ? "Lapriyè & Temwayaj" : "Prayer & Testimonies",
                desc: lang === "fr"
                  ? "Mur de prière mondial avec drapeaux des pays. Partagez vos témoignages et encouragez-vous mutuellement."
                  : lang === "ht"
                  ? "Mi lapriyè mondyal ak drapo peyi yo. Pataje temwayaj ou yo ak ankouraje youn lòt."
                  : "Global prayer wall with country flags. Share your testimonies and encourage one another.",
              },
              {
                icon: "🕊️",
                title: lang === "fr" ? "Assistant Biblique IA" : lang === "ht" ? "Asistan Biblik IA" : "AI Bible Assistant",
                desc: lang === "fr"
                  ? "Posez n'importe quelle question sur la Bible et recevez une réponse instantanée avec des versets."
                  : lang === "ht"
                  ? "Poze nenpòt kesyon sou Bib la epi resevwa yon repons imedyat ak vèsè yo."
                  : "Ask any Bible question and get an instant answer with verses.",
              },
              {
                icon: "📚",
                title: lang === "fr" ? "Études Bibliques" : lang === "ht" ? "Etid Biblik" : "Bible Studies",
                desc: lang === "fr"
                  ? "Cours interactifs sur les sujets les plus profonds de la Bible avec un assistant IA intégré."
                  : lang === "ht"
                  ? "Kou entèraktif sou sijè ki pi fon nan Bib la ak yon asistan IA entegre."
                  : "Interactive courses on the deepest Bible topics with AI assistant.",
              },
              {
                icon: "🏆",
                title: lang === "fr" ? "Quiz Biblique" : lang === "ht" ? "Kiz Biblik" : "Bible Quiz",
                desc: lang === "fr"
                  ? "5 niveaux progressifs avec système de déverrouillage. Testez et approfondissez vos connaissances."
                  : lang === "ht"
                  ? "5 nivo pwogresif ak sistèm deblokaj. Teste ak apwofondi konesans ou."
                  : "5 progressive levels with unlock system. Test and deepen your knowledge.",
              },
              {
                icon: "🌍",
                title: lang === "fr" ? "Communauté Mondiale" : lang === "ht" ? "Kominote Mondyal" : "Global Community",
                desc: lang === "fr"
                  ? "7 groupes thématiques : Famille, Jeunesse, Évangélisation, Social, Formation, Actualités et plus."
                  : lang === "ht"
                  ? "7 gwoup tematik : Fanmi, Jenès, Evanjelizasyon, Sosyal, Fòmasyon, Aktyalite ak plis."
                  : "7 thematic groups: Family, Youth, Evangelism, Social, Training, News and more.",
              },
              {
                icon: "🎵",
                title: lang === "fr" ? "Louange & Adoration" : lang === "ht" ? "Lwanj & Adorasyon" : "Praise & Worship",
                desc: lang === "fr"
                  ? "Vidéos de louange, Psaumes en musique, et contenu d'adoration de la chaîne KONEKSYON PAM."
                  : lang === "ht"
                  ? "Videyo lwanj, Sòm nan mizik, ak kontni adorasyon chèn KONEKSYON PAM."
                  : "Praise videos, Psalms in music, and worship content.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{item.icon}</span>
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
            {lang === "fr" ? "Notre Fondateur" : lang === "ht" ? "Fondatè Nou" : "Our Founder"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
              PF
            </div>
            <div>
              <h3 className="font-bold text-stone-900">Pasteur Peterson Francis</h3>
              <p className="text-sm text-stone-500">
                {lang === "fr"
                  ? "Fondateur de KONEKSYON PAM et de la chaîne YouTube avec plus de 30,000 abonnés. Passionné par l'utilisation de la technologie au service de l'Évangile."
                  : lang === "ht"
                  ? "Fondatè KONEKSYON PAM ak chèn YouTube ak plis pase 30,000 abòne. Pasyone pou itilize teknoloji nan sèvis Levanjil."
                  : "Founder of KONEKSYON PAM and the YouTube channel with over 30,000 subscribers. Passionate about using technology to serve the Gospel."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
