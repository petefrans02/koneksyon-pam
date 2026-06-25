import { Lang } from "./translations";

export function gl(obj: Partial<Record<Lang, string>> | undefined, lang: Lang): string {
  if (!obj) return "";
  return obj[lang] || obj["en"] || obj["fr"] || "";
}

export function gla(obj: Partial<Record<Lang, string[]>> | undefined, lang: Lang): string[] {
  if (!obj) return [];
  return obj[lang] || obj["en"] || obj["fr"] || [];
}
