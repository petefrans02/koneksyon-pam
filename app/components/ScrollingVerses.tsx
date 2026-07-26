"use client";
import { useLang } from "@/lib/LangContext";
import Icon from "@/app/components/Icon";

const VERSES = {
  fr: [
    "📖 « Car Dieu a tant aimé le monde qu'il a donné son Fils unique » — Jean 3:16",
    "✦ « Je suis le chemin, la vérité et la vie » — Jean 14:6",
    "📖 « L'Éternel est mon berger, je ne manquerai de rien » — Psaume 23:1",
    "✦ « Je puis tout par Christ qui me fortifie » — Philippiens 4:13",
    "📖 « Cherchez premièrement le Royaume de Dieu » — Matthieu 6:33",
    "✦ « Confie-toi en l'Éternel de tout ton cœur » — Proverbes 3:5",
    "📖 « Soyez forts et courageux. Ne craignez point » — Josué 1:9",
    "✦ « Je connais les projets que j'ai formés sur vous » — Jérémie 29:11",
    "📖 « L'amour ne périt jamais » — 1 Corinthiens 13:8",
    "✦ « Venez à moi, vous tous qui êtes fatigués et chargés » — Matthieu 11:28",
  ],
  ht: [
    "📖 « Paske Bondye sitèlman renmen lèzòm, li bay sèl Pitit li a » — Jan 3:16",
    "✦ « Mwen se chemen an, verite a ak lavi a » — Jan 14:6",
    "📖 « Senyè a se bèje mwen, mwen p ap manke anyen » — Sòm 23:1",
    "✦ « Mwen ka fè tout bagay nan Kris la ki ban mwen fòs » — Filipyen 4:13",
    "📖 « Chèche Wayòm Bondye a anvan tout bagay » — Matye 6:33",
    "✦ « Mete konfyans ou nan Senyè a ak tout kè ou » — Pwovèb 3:5",
    "📖 « Soyez fò epi kouraj. Pa pè » — Jozye 1:9",
    "✦ « Mwen konnen plan mwen genyen pou ou » — Jeremi 29:11",
  ],
  en: [
    "📖 « For God so loved the world that he gave his one and only Son » — John 3:16",
    "✦ « I am the way, the truth, and the life » — John 14:6",
    "📖 « The Lord is my shepherd, I shall not want » — Psalm 23:1",
    "✦ « I can do all things through Christ who strengthens me » — Philippians 4:13",
    "📖 « Seek first the Kingdom of God and his righteousness » — Matthew 6:33",
    "✦ « Trust in the Lord with all your heart » — Proverbs 3:5",
    "📖 « Be strong and courageous. Do not be afraid » — Joshua 1:9",
    "✦ « I know the plans I have for you, declares the Lord » — Jeremiah 29:11",
    "📖 « Love never fails » — 1 Corinthians 13:8",
    "✦ « Come to me, all you who are weary and burdened » — Matthew 11:28",
  ],
  es: [
    "📖 « Porque tanto amó Dios al mundo que dio a su Hijo unigénito » — Juan 3:16",
    "✦ « Yo soy el camino, la verdad y la vida » — Juan 14:6",
    "📖 « El Señor es mi pastor, nada me faltará » — Salmo 23:1",
    "✦ « Todo lo puedo en Cristo que me fortalece » — Filipenses 4:13",
    "📖 « Buscad primeramente el Reino de Dios y su justicia » — Mateo 6:33",
    "✦ « Confía en el Señor con todo tu corazón » — Proverbios 3:5",
    "📖 « Sé fuerte y valiente. No temas » — Josué 1:9",
    "✦ « Yo sé los planes que tengo para vosotros » — Jeremías 29:11",
  ],
};

export default function ScrollingVerses() {
  const { lang } = useLang();
  const items = VERSES[lang as keyof typeof VERSES] || VERSES.fr;
  const doubled = [...items, ...items, ...items];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1002,
      height: 36, overflow: "hidden",
      background: "linear-gradient(90deg, #1a3568 0%, #0d2048 50%, #1a3568 100%)",
      borderBottom: "1px solid rgba(200,150,15,0.30)",
      display: "flex", alignItems: "center",
    }}>
      <div style={{
        display: "flex", whiteSpace: "nowrap",
        animation: "verseTicker 60s linear infinite",
        willChange: "transform",
      }}>
        {doubled.map((msg, i) => {
          const isBook = msg.startsWith("📖");
          const text = msg.replace(/^(?:📖|✦)\s*/, "");
          return (
            <span key={i} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginRight: 60,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "rgba(240,200,64,0.90)",
              letterSpacing: "0.03em",
              fontFamily: "Inter, system-ui, sans-serif",
            }}>
              <Icon name={isBook ? "bible" : "etincelles"} size={13} />
              {text}
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes verseTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
