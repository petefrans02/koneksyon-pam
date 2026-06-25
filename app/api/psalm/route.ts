import { NextRequest } from "next/server";

function padPsalm(num: number): string {
  return String(num).padStart(3, "0");
}

async function fetchFrench(num: number): Promise<string> {
  const res = await fetch(
    `https://api.getbible.net/v2/ls1910/19/${num}.json`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) return "";
  const data = await res.json();
  return (data.verses || [])
    .map((v: { verse: number; text: string }) => `${v.verse}. ${v.text.trim()}`)
    .join("\n");
}

async function fetchHaitian(num: number): Promise<string> {
  const res = await fetch(
    `https://ebible.org/hat/PSA${padPsalm(num)}.htm`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) return "";
  const html = await res.text();
  const lines = html
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((l) => l.trim().replace(/&#160;/g, " ").replace(/&lt;/g, "").replace(/&gt;/g, "").replace(/&amp;/g, "&"))
    .filter((l) => l.length > 3 && !l.includes("Bib La") && !l.includes("Public Domain") && !l.includes("Sòm " + num) && !/^[<>]$/.test(l));
  return lines.join("\n");
}

async function fetchSpanish(num: number): Promise<string> {
  const res = await fetch(
    `https://api.getbible.net/v2/valera/19/${num}.json`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) return "";
  const data = await res.json();
  return (data.verses || [])
    .map((v: { verse: number; text: string }) => `${v.verse}. ${v.text.trim()}`)
    .join("\n");
}

async function fetchEnglish(num: number): Promise<string> {
  const res = await fetch(
    `https://bible-api.com/psalm+${num}`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) return "";
  const data = await res.json();
  return data.text || "";
}

export async function GET(request: NextRequest) {
  const num = request.nextUrl.searchParams.get("num");
  const lang = request.nextUrl.searchParams.get("lang") || "fr";

  if (!num) {
    return Response.json({ error: "Missing psalm number" }, { status: 400 });
  }

  const psalmNum = parseInt(num);

  try {
    let text = "";
    let translation = "";

    switch (lang) {
      case "fr":
        text = await fetchFrench(psalmNum);
        translation = "Louis Segond 1910";
        break;
      case "ht":
        text = await fetchHaitian(psalmNum);
        translation = "Bib La (Kreyòl Ayisyen)";
        break;
      case "es":
        text = await fetchSpanish(psalmNum);
        translation = "Reina Valera 1909";
        break;
      case "en":
      default:
        text = await fetchEnglish(psalmNum);
        translation = "World English Bible";
        break;
    }

    return Response.json({ text, translation });
  } catch {
    return Response.json({ text: "", translation: "" });
  }
}
