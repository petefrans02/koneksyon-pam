import { NextRequest } from "next/server";
import { bibleBooks } from "@/lib/bible-books";

// GET ?ref=Luc 2:4-7&lang=fr — renvoie le TEXTE du verset correspondant à une
// référence. Les questions du championnat ne stockent que la référence ; c'est
// ici qu'on la transforme en verset lisible pour l'afficher à l'antenne.

const CACHE = new Map<string, { text: string; at: number }>();
const TTL_MS = 24 * 60 * 60 * 1000; // les versets ne changent pas : cache d'un jour

const SOURCES: Record<string, (id: number, ch: number) => string> = {
  fr: (id, ch) => `https://api.getbible.net/v2/ls1910/${id}/${ch}.json`,
  en: (id, ch) => `https://api.getbible.net/v2/kjv/${id}/${ch}.json`,
  es: (id, ch) => `https://api.getbible.net/v2/valera/${id}/${ch}.json`,
};

// « Luc 2:4-7 » → { bookId: 42, chapter: 2, from: 4, to: 7 }
function parseRef(ref: string, lang: string) {
  const cleaned = ref.trim().replace(/\s+/g, " ");
  const m = cleaned.match(/^(.+?)\s+(\d+)\s*[:.]\s*(\d+)(?:\s*[-–]\s*(\d+))?/);
  if (!m) return null;
  const [, rawBook, ch, v1, v2] = m;
  const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  const target = norm(rawBook);
  const book = bibleBooks.find((b) =>
    Object.values(b.name).some((n) => norm(n) === target) || norm(b.slug) === target
  ) ?? bibleBooks.find((b) =>
    Object.values(b.name).some((n) => norm(n).startsWith(target) || target.startsWith(norm(n)))
  );
  if (!book) return null;
  const from = parseInt(v1, 10);
  return { bookId: book.id, bookName: book.name[lang] ?? book.name.fr, chapter: parseInt(ch, 10), from, to: v2 ? parseInt(v2, 10) : from };
}

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref") ?? "";
  const lang = request.nextUrl.searchParams.get("lang") ?? "fr";
  if (!ref) return Response.json({ text: "", error: "ref manquante" });

  const key = `${lang}:${ref}`;
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return Response.json({ ref, text: hit.text, cached: true });

  const parsed = parseRef(ref, lang);
  // Référence non reconnue (ou créole, non couvert par la source JSON) :
  // on renvoie vide, l'affichage se rabat sur la simple référence.
  if (!parsed) return Response.json({ ref, text: "" });

  const url = (SOURCES[lang] ?? SOURCES.fr)(parsed.bookId, parsed.chapter);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return Response.json({ ref, text: "" });
    const data = await res.json() as { verses?: { verse: number; text: string }[] };
    const wanted = (data.verses ?? []).filter((v) => v.verse >= parsed.from && v.verse <= parsed.to);
    // Limité à 4 versets : au-delà, c'est illisible sur un écran de diffusion.
    const text = wanted.slice(0, 4).map((v) => v.text.trim()).join(" ");
    CACHE.set(key, { text, at: Date.now() });
    return Response.json({ ref, text });
  } catch {
    return Response.json({ ref, text: "" });
  }
}
