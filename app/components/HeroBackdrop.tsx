"use client";

/**
 * Photo symbolique en fond d'un hero. À placer comme PREMIER enfant d'un
 * conteneur `position: relative; overflow: hidden`, avec le contenu du hero
 * en `position: relative; z-index >= 1` par-dessus.
 *
 * Pour changer l'image d'une page : déposer le fichier dans /public/hero/ et
 * passer son chemin en prop `image`. Aucune autre modification requise.
 */
export default function HeroBackdrop({
  image,
  tint = "dark",
  opacity,
  position = "center",
}: {
  image: string;
  tint?: "dark" | "light";
  opacity?: number;
  position?: string;
}) {
  const overlay =
    tint === "light"
      ? "linear-gradient(135deg,rgba(250,248,244,0.62),rgba(243,240,234,0.55))"
      : "linear-gradient(135deg,rgba(6,18,42,0.58),rgba(13,32,72,0.50))";
  const imgOpacity = opacity ?? (tint === "light" ? 0.5 : 0.7);
  return (
    <>
      <img
        src={image}
        alt=""
        aria-hidden="true"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          opacity: imgOpacity,
          animation: "heroKenBurns 22s ease-in-out infinite alternate",
        }}
      />
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: overlay, pointerEvents: "none" }}
      />
    </>
  );
}
