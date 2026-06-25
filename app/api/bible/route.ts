import { NextRequest } from "next/server";

async function fetchFrench(bookId: number, chapter: number): Promise<string> {
  const res = await fetch(`https://api.getbible.net/v2/ls1910/${bookId}/${chapter}.json`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return "";
  const data = await res.json();
  return (data.verses || []).map((v: { verse: number; text: string }) => `${v.verse}. ${v.text.trim()}`).join("\n");
}

async function fetchHaitian(bookId: number, chapter: number): Promise<string> {
  const bookMap: Record<number, string> = { 1:"GEN",2:"EXO",3:"LEV",4:"NUM",5:"DEU",6:"JOS",7:"JDG",8:"RUT",9:"1SA",10:"2SA",11:"1KI",12:"2KI",13:"1CH",14:"2CH",15:"EZR",16:"NEH",17:"EST",18:"JOB",19:"PSA",20:"PRO",21:"ECC",22:"SNG",23:"ISA",24:"JER",25:"LAM",26:"EZK",27:"DAN",28:"HOS",29:"JOL",30:"AMO",31:"OBA",32:"JON",33:"MIC",34:"NAM",35:"HAB",36:"ZEP",37:"HAG",38:"ZEC",39:"MAL",40:"MAT",41:"MRK",42:"LUK",43:"JHN",44:"ACT",45:"ROM",46:"1CO",47:"2CO",48:"GAL",49:"EPH",50:"PHP",51:"COL",52:"1TH",53:"2TH",54:"1TI",55:"2TI",56:"TIT",57:"PHM",58:"HEB",59:"JAS",60:"1PE",61:"2PE",62:"1JN",63:"2JN",64:"3JN",65:"JUD",66:"REV" };
  const code = bookMap[bookId] || "GEN";
  const pad = String(chapter).padStart(3, "0");
  const res = await fetch(`https://ebible.org/hat/${code}${pad}.htm`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return "";
  const html = await res.text();
  return html.replace(/<[^>]+>/g, "\n").split("\n").map(l => l.trim().replace(/&#160;/g, " ").replace(/&lt;/g, "").replace(/&gt;/g, "").replace(/&amp;/g, "&")).filter(l => l.length > 3 && !l.includes("Bib La") && !l.includes("Public Domain")).join("\n");
}

async function fetchEnglish(bookId: number, chapter: number): Promise<string> {
  const bookNames: Record<number, string> = { 1:"genesis",2:"exodus",3:"leviticus",4:"numbers",5:"deuteronomy",6:"joshua",7:"judges",8:"ruth",9:"1samuel",10:"2samuel",11:"1kings",12:"2kings",13:"1chronicles",14:"2chronicles",15:"ezra",16:"nehemiah",17:"esther",18:"job",19:"psalm",20:"proverbs",21:"ecclesiastes",22:"song of solomon",23:"isaiah",24:"jeremiah",25:"lamentations",26:"ezekiel",27:"daniel",28:"hosea",29:"joel",30:"amos",31:"obadiah",32:"jonah",33:"micah",34:"nahum",35:"habakkuk",36:"zephaniah",37:"haggai",38:"zechariah",39:"malachi",40:"matthew",41:"mark",42:"luke",43:"john",44:"acts",45:"romans",46:"1corinthians",47:"2corinthians",48:"galatians",49:"ephesians",50:"philippians",51:"colossians",52:"1thessalonians",53:"2thessalonians",54:"1timothy",55:"2timothy",56:"titus",57:"philemon",58:"hebrews",59:"james",60:"1peter",61:"2peter",62:"1john",63:"2john",64:"3john",65:"jude",66:"revelation" };
  const name = bookNames[bookId] || "genesis";
  const res = await fetch(`https://bible-api.com/${name}+${chapter}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return "";
  const data = await res.json();
  return data.text || "";
}

export async function GET(request: NextRequest) {
  const bookId = parseInt(request.nextUrl.searchParams.get("book") || "1");
  const chapter = parseInt(request.nextUrl.searchParams.get("chapter") || "1");
  const lang = request.nextUrl.searchParams.get("lang") || "fr";

  let text = "";
  let translation = "";

  switch (lang) {
    case "fr": text = await fetchFrench(bookId, chapter); translation = "Louis Segond 1910"; break;
    case "ht": text = await fetchHaitian(bookId, chapter); translation = "Bib La (Kreyòl Ayisyen)"; break;
    default: text = await fetchEnglish(bookId, chapter); translation = "World English Bible"; break;
  }

  return Response.json({ text, translation });
}
