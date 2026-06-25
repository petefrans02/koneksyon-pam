"use client";

import { useLang } from "@/lib/LangContext";

const verses = {
  fr: [
    "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle. — Jean 3:16",
    "L'Éternel est mon berger : je ne manquerai de rien. — Psaume 23:1",
    "Je puis tout par celui qui me fortifie. — Philippiens 4:13",
    "Ne crains point, car je suis avec toi ; ne t'effraie point, car je suis ton Dieu. — Ésaïe 41:10",
    "Demandez, et l'on vous donnera ; cherchez, et vous trouverez ; frappez, et l'on vous ouvrira. — Matthieu 7:7",
    "Le commencement de la sagesse, c'est la crainte de l'Éternel. — Proverbes 9:10",
    "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu. — Romains 8:28",
    "La prière fervente du juste a une grande efficace. — Jacques 5:16",
    "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse. — Proverbes 3:5",
    "En toute chose, par la prière et la supplication, avec des actions de grâces, faites connaître vos besoins à Dieu. — Philippiens 4:6",
  ],
  ht: [
    "« Bondye renmen lemonn tèlman li bay sèl Pitit li » — Jan 3:16",
    "« Senyè a se gadò mwen, mwen p ap janm manke anyen » — Sòm 23:1",
    "« Mwen ka fè tout bagay nan li ki ban m fòs » — Filipyen 4:13",
    "« Pa pè, paske mwen avèk ou » — Ezayi 41:10",
    "« Mande e y ap ba ou, chèche e w ap jwenn » — Matye 7:7",
    "« Kòmansman sajès, se lakrent Senyè a » — Pwovèb 9:10",
    "« Tout bagay travay ansanm pou byen moun ki renmen Bondye » — Womèn 8:28",
    "« Lapriyè moun ki dwat gen anpil pouvwa » — Jak 5:16",
  ],
  en: [
    "\"For God so loved the world that He gave His only Son\" — John 3:16",
    "\"The Lord is my shepherd, I shall not want\" — Psalm 23:1",
    "\"I can do all things through Him who strengthens me\" — Philippians 4:13",
    "\"Fear not, for I am with you\" — Isaiah 41:10",
    "\"Ask and it will be given to you, seek and you will find\" — Matthew 7:7",
    "\"The fear of the Lord is the beginning of wisdom\" — Proverbs 9:10",
    "\"All things work together for good for those who love God\" — Romans 8:28",
    "\"The prayer of a righteous person is powerful\" — James 5:16",
  ],
};

export default function ScrollingVerses() {
  const { lang } = useLang();
  const langVerses = verses[lang as keyof typeof verses] || verses.fr;
  const doubled = [...langVerses, ...langVerses];

  return (
    <div className="bg-gradient-to-r from-[#0a1628] via-[#0f2044] to-[#0a1628] py-3 overflow-hidden border-b border-blue-900/20">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((verse, i) => (
          <span key={i} className="text-cyan-400/70 text-sm mx-8 inline-block">
            ✦ {verse}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
