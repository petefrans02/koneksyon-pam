import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

// Node runtime (nécessaire pour lire la photo depuis /public).
export const runtime = "nodejs";
export const alt = "KONEKSYON PAM — Transforming lives through faith";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Rubriques (ASCII → rendu de police fiable dans l'image).
const TAGS = ["Bible", "Courses", "Championships", "Humanitarian"];

export default async function OGImage() {
  // Photo de couverture (le groupe missionnaire au coucher de soleil).
  const photo = await readFile(join(process.cwd(), "public", "hero", "mission.jpg"));
  const bg = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", position: "relative" }}>
        {/* Photo de fond */}
        <img src={bg} width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
        {/* Voile sombre (dégradé gauche → droite, texte lisible à gauche) */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", background: "linear-gradient(90deg, rgba(5,11,24,0.93) 0%, rgba(5,11,24,0.72) 46%, rgba(5,11,24,0.32) 100%)" }} />
        {/* Liseré doré en bas */}
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 1200, height: 8, display: "flex", background: "linear-gradient(90deg, #b8912a, #f0b429 50%, #b8912a)" }} />

        {/* Contenu */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", width: 1200, height: 630, padding: "0 74px" }}>
          {/* Rubrique */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 26 }}>
            <div style={{ width: 44, height: 5, background: "#f0b429", marginRight: 18, display: "flex", borderRadius: 3 }} />
            <span style={{ color: "#f0b429", fontSize: 27, fontWeight: 700, letterSpacing: 5 }}>KONEKSYON PAM</span>
          </div>

          {/* Titre */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#ffffff", fontSize: 78, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2 }}>Transforming lives</span>
            <span style={{ color: "#ffffff", fontSize: 78, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2 }}>through faith.</span>
          </div>

          {/* Barre de rubriques */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 34 }}>
            {TAGS.map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 7, height: 7, borderRadius: 4, background: "#f0b429", margin: "0 18px", display: "flex" }} />}
                <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 30, fontWeight: 600 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Site */}
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 26, fontWeight: 600, marginTop: 26, display: "flex" }}>koneksyonpam.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
