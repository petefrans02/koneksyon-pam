import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

// Génère un lot de discussions communautaires (amorce vivante) à chaque passage du cron.
const BATCH = Number(process.env.DISCUSSIONS_BATCH || 12);
const MODEL = process.env.DISCUSSION_GEN_MODEL || "claude-haiku-4-5-20251001";
const MAX_KEEP = Number(process.env.DISCUSSIONS_MAX_KEEP || 4000);

const ACCENTS = ["#16a34a", "#7c3aed", "#c8960f", "#2563eb", "#ea580c", "#0891b2", "#db2777"];
const ICONS = ["message", "colombe", "croix", "priere", "bible", "couronne", "coeur", "monde"];
const AVATAR = ["#7c3aed", "#0891b2", "#16a34a", "#db2777", "#c8960f", "#ea580c", "#1a3568", "#2563eb"];
const FLAGS = ["🇭🇹", "🇫🇷", "🇨🇩", "🇨🇮", "🇺🇸", "🇨🇦", "🇧🇷", "🇳🇬", "🇨🇲", "🇧🇪", "🇬🇧", "🇸🇳"];

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("["); const end = raw.lastIndexOf("]");
  return JSON.parse(raw.slice(start, end + 1));
}

interface GenMsg { author: string; text: { fr: string; ht: string; en: string; es: string }; replyTo?: string }
interface GenDisc {
  topic: { fr: string; ht: string; en: string; es: string };
  category: { fr: string; ht: string; en: string; es: string };
  messages: GenMsg[];
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "no api key" }, { status: 500 });

  const supabase = db();
  const client = new Anthropic({ apiKey });

  const prompt = `Tu animes l'espace communautaire d'une plateforme chrétienne évangélique mondiale (KONEKSYON PAM).
Génère ${BATCH} NOUVELLES discussions fraternelles distinctes autour de la foi chrétienne : questions bibliques, vie de disciple, prière, théologie, encouragement, missions, famille chrétienne, doutes sincères. Ton respectueux, fraternel, édifiant — jamais de polémique haineuse.

Pour CHAQUE discussion, écris un fil de 3 à 5 messages de personnes DIFFÉRENTES qui se répondent (prénoms variés, internationaux). Les messages avancent l'échange (accord, nuance, verset à l'appui, encouragement).

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour :
[
  {
    "topic": { "fr": "...", "ht": "...", "en": "...", "es": "..." },
    "category": { "fr": "un mot ex. Prière/Doctrine/Vie chrétienne/Encouragement", "ht": "...", "en": "...", "es": "..." },
    "messages": [
      { "author": "Prénom", "text": { "fr": "...", "ht": "...", "en": "...", "es": "..." } },
      { "author": "Prénom2", "replyTo": "Prénom", "text": { "fr": "...", "ht": "...", "en": "...", "es": "..." } }
    ]
  }
]
Les 4 langues (fr, ht = créole haïtien, en, es) OBLIGATOIRES et complètes pour topic, category et chaque message. Messages courts (1-2 phrases). Fidélité biblique.`;

  let parsed: GenDisc[];
  try {
    const msg = await client.messages.create({ model: MODEL, max_tokens: 8000, messages: [{ role: "user", content: prompt }] });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    parsed = extractJson(text) as GenDisc[];
  } catch (e) {
    return NextResponse.json({ error: "generation failed", detail: String(e) }, { status: 500 });
  }
  if (!Array.isArray(parsed) || !parsed.length) {
    return NextResponse.json({ error: "invalid generation" }, { status: 500 });
  }

  // Décore chaque discussion (accent, icône, avatars, drapeaux, temps, likes) de façon déterministe/variée.
  const day = Math.floor(Date.now() / 86_400_000);
  const rows = parsed
    .filter((d) => d?.topic?.fr && Array.isArray(d.messages) && d.messages.length >= 2)
    .map((d, di) => {
      const seed = (day * 131 + di * 17) >>> 0;
      const accent = ACCENTS[seed % ACCENTS.length];
      const icon = ICONS[(seed >> 3) % ICONS.length];
      const authors = new Set<string>();
      const messages = d.messages.map((m, mi) => {
        authors.add(m.author);
        return {
          author: m.author,
          color: AVATAR[(seed + mi * 7) % AVATAR.length],
          flag: FLAGS[(seed + mi * 5) % FLAGS.length],
          time: `${1 + ((seed + mi * 13) % 22)}h`,
          likes: 4 + ((seed + mi * 29) % 40),
          ...(m.replyTo ? { replyTo: m.replyTo } : {}),
          text: m.text,
        };
      });
      return {
        topic: d.topic,
        category: d.category,
        accent,
        icon,
        messages,
        participants: authors.size,
      };
    });

  const { error } = await supabase.from("community_discussions").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Purge douce : garde les MAX_KEEP plus récentes.
  const { count } = await supabase.from("community_discussions").select("id", { count: "exact", head: true });
  if (count && count > MAX_KEEP) {
    const { data: old } = await supabase
      .from("community_discussions").select("id").order("created_at", { ascending: true }).limit(count - MAX_KEEP);
    const ids = (old ?? []).map((r) => r.id);
    if (ids.length) await supabase.from("community_discussions").delete().in("id", ids);
  }

  return NextResponse.json({ ok: true, inserted: rows.length, total: count ?? null });
}
